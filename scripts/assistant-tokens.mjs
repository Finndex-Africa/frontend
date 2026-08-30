#!/usr/bin/env node
/**
 * Reports the real token cost of the assistant's cached prompt.
 *
 * OpenAI has no token-counting endpoint, so instead of estimating with a local
 * tokenizer (which drifts from the server's) this makes two minimal real
 * requests and reads `usage` off the responses. The second request also proves
 * whether prompt caching is actually engaging — `cached_tokens > 0` is the only
 * trustworthy evidence of that.
 *
 * Run: pnpm assistant:tokens
 */
import OpenAI from "openai";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MODEL = process.env.OPENAI_MODEL || "gpt-5.6-terra";

if (!process.env.OPENAI_API_KEY) {
  console.error("Set OPENAI_API_KEY first (it is read from .env by Next, but not by this script).");
  process.exit(1);
}

// Reproduce the prompt without pulling in a TypeScript build step: the
// instructions are the knowledge base plus the rules around it.
const kb = readFileSync(join(ROOT, "src/lib/assistant/knowledge-base.ts"), "utf8");
const rules = readFileSync(join(ROOT, "src/lib/assistant/system-prompt.ts"), "utf8");
const instructions = kb + rules;

// Input $/MTok and output $/MTok.
const PRICES = {
  "gpt-5.6-sol": { input: 4, output: 20 },
  "gpt-5.6-terra": { input: 1.1, output: 6 },
  "gpt-5.6-luna": { input: 0.2, output: 1.2 },
};

const client = new OpenAI();

async function probe() {
  return client.responses.create({
    model: MODEL,
    instructions,
    input: [{ role: "user", content: "Say OK." }],
    max_output_tokens: 16,
    reasoning: { effort: "low" },
    store: false,
    prompt_cache_key: "findafriq-assistant-v1",
  });
}

const first = await probe();
const second = await probe();

const inputTokens = second.usage?.input_tokens ?? 0;
const cached = second.usage?.input_tokens_details?.cached_tokens ?? 0;
const price = PRICES[MODEL];

console.log(`model:            ${MODEL}`);
console.log(`prompt:           ${first.usage?.input_tokens ?? "?"} input tokens`);
console.log(`cached on repeat: ${cached} tokens (${inputTokens ? Math.round((cached / inputTokens) * 100) : 0}% of the prompt)`);

if (cached === 0) {
  console.warn(
    "\n⚠️  Nothing cached on an identical repeat request. Either the prompt is below the\n" +
      "    provider's caching threshold, or something in `instructions` varies per call.\n" +
      "    Check that buildInstructions() is byte-identical every time.",
  );
}

if (!price) {
  console.log("\nUnknown model — add it to PRICES in this script for cost figures.");
  process.exit(0);
}

const uncachedTokens = inputTokens - cached;
// Cached input is discounted; treat the discount conservatively at 10% of rate.
const perMessage =
  (uncachedTokens / 1e6) * price.input +
  (cached / 1e6) * price.input * 0.1 +
  (300 / 1e6) * price.output; // ~300 output tokens for a typical answer

console.log(`\nper message:      ~$${perMessage.toFixed(5)} (assuming a ~300-token answer)`);
console.log(`per 1,000:        ~$${(perMessage * 1000).toFixed(2)}`);
