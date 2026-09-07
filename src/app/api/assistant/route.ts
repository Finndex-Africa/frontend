import OpenAI from "openai";
import { NextRequest } from "next/server";
import { buildInstructions, localeDirective } from "@/lib/assistant/system-prompt";
import { routing } from "@/i18n/routing";

// Not `edge`: the SDK and the ~25KB knowledge base are both happier on Node,
// and this route is not latency-bound by cold start.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.OPENAI_MODEL || "gpt-5.6-terra";

/** Guard rails on what a browser is allowed to send us. */
const MAX_CHARS_PER_MESSAGE = 2000;
const MAX_TURNS = 40;

/** Per-IP sliding window. */
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

type Role = "user" | "assistant";
type ChatMessage = { role: Role; content: string };

/**
 * In-memory rate limiting. This is per server instance, so on a multi-instance
 * deploy the effective limit is RATE_LIMIT × instances. That is fine as a
 * cost-blast-radius guard; swap in Redis if you need a real global limit.
 */
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic sweep so the map cannot grow without bound.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > RATE_LIMIT;
}

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const { role, content } = value as Record<string, unknown>;
  return (
    (role === "user" || role === "assistant") &&
    typeof content === "string" &&
    content.trim().length > 0 &&
    content.length <= MAX_CHARS_PER_MESSAGE
  );
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    // Configuration problem, not a user problem — log loudly, stay vague outward.
    console.error("[assistant] OPENAI_API_KEY is not set");
    return json({ error: "unavailable" }, 503);
  }

  if (rateLimited(clientIp(req))) {
    return json({ error: "rate_limited" }, 429);
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  const { messages, locale } = (payload ?? {}) as {
    messages?: unknown;
    locale?: unknown;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: "bad_request" }, 400);
  }
  if (!messages.every(isChatMessage)) {
    return json({ error: "bad_request" }, 400);
  }

  // Keep only the tail. Old turns are the cheapest thing to drop and this caps
  // what a long session can cost.
  const history = (messages as ChatMessage[]).slice(-MAX_TURNS);
  if (history[history.length - 1].role !== "user") {
    return json({ error: "bad_request" }, 400);
  }

  const activeLocale =
    typeof locale === "string" &&
    (routing.locales as readonly string[]).includes(locale)
      ? locale
      : routing.defaultLocale;

  const client = new OpenAI();

  let stream;
  try {
    stream = await client.responses.create({
      model: MODEL,
      // `instructions` is byte-identical on every request, and it renders ahead
      // of `input`, so it forms a stable cacheable prefix. The locale directive
      // deliberately goes into `input` instead — putting it here would fork the
      // prefix per locale and halve the cache hit rate.
      instructions: buildInstructions(),
      input: [
        { role: "developer" as const, content: localeDirective(activeLocale) },
        ...history,
      ],
      max_output_tokens: 1500,
      // An FAQ lookup where the answer is already in the prompt needs little
      // deliberation; this is the latency and cost lever.
      reasoning: { effort: "low" },
      // Do not retain conversations server-side. Users paste addresses, phone
      // numbers and listing details in here, so the less that persists the better.
      store: false,
      // Steers requests toward the same cache partition.
      prompt_cache_key: "findafriq-assistant-v1",
      stream: true,
    });
  } catch (error) {
    if (error instanceof OpenAI.RateLimitError) {
      console.error("[assistant] rate limited by the OpenAI API", error);
      return json({ error: "rate_limited" }, 429);
    }
    if (error instanceof OpenAI.AuthenticationError) {
      console.error("[assistant] OPENAI_API_KEY was rejected", error);
      return json({ error: "unavailable" }, 503);
    }
    if (error instanceof OpenAI.NotFoundError) {
      // Overwhelmingly this is a bad OPENAI_MODEL. The API only accepts exact
      // model IDs, so a display name like "ChatGPT" lands here with an error
      // that gives no hint about which env var is at fault.
      console.error(
        `[assistant] model "${MODEL}" was rejected as unknown. OPENAI_MODEL must be an ` +
          `exact model ID (e.g. gpt-5.6-terra, gpt-5.6-sol, gpt-5.6-luna), not a display name.`,
        error,
      );
      return json({ error: "unavailable" }, 503);
    }
    if (
      error instanceof OpenAI.PermissionDeniedError ||
      (error instanceof OpenAI.BadRequestError &&
        /quota|billing|credit/i.test(error.message))
    ) {
      console.error(
        "[assistant] the OpenAI account is out of quota or not billable. Check " +
          "https://platform.openai.com/settings/organization/billing — the assistant is disabled until then.",
        error,
      );
      return json({ error: "unavailable" }, 503);
    }
    console.error("[assistant] request failed", error);
    return json({ error: "upstream" }, 502);
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "response.output_text.delta") {
            controller.enqueue(encoder.encode(event.delta));
          }
        }
      } catch (error) {
        // The client already has partial text; the widget shows a retry hint
        // when a stream ends early.
        console.error("[assistant] stream aborted", error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}
