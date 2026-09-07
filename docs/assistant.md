# FindAfriq Assistant

A support/discovery chatbot on the public site, grounded in the "FindAfriq AI
Chatbot — Master FAQ & Knowledge Base" document (v1.0, 148 Q&As).

## Why there is no vector database

The original plan was RAG with embeddings. The decisive reason not to is
**corpus size: ~5.5K tokens.**

Retrieval exists to solve "the corpus does not fit in the context window". This
one fits roughly 180 times over. Chunking it and retrieving the top-k would add a
vector store, an embedding provider, and an index-rebuild step — and buy a new
failure mode, where a retrieval miss makes the bot answer "I don't know" about
something sitting right there in the file.

So the whole FAQ ships in `instructions`, which forms a cacheable prompt prefix.
Cached input is heavily discounted, making the entire knowledge base cheaper per
message than a retrieval round-trip would be.

This reasoning is provider-independent — it was true when this ran on Claude and
it is true on OpenAI. (A secondary argument applied only to Anthropic, which has
no first-party embeddings API. OpenAI does, so that one no longer bites; it was
never the load-bearing reason.)

**Revisit if the knowledge base grows past roughly 50–100K tokens**, or if you
start mixing in per-listing or per-user documents. At that point retrieval starts
paying for itself: add an embedding model plus a vector store and keep the chat
model for generation.

## Files

| Path | Role |
| --- | --- |
| `src/lib/assistant/knowledge-base.ts` | FAQ sections 1–24 verbatim. Source of truth at runtime — edit here, not the PDF. |
| `src/lib/assistant/system-prompt.ts` | Sections 25–34 expressed as behaviour rules. Splits the stable cacheable half from the per-request locale line. |
| `src/app/api/assistant/route.ts` | Streaming endpoint. Validation, rate limiting, error mapping. |
| `src/components/global/AssistantWidget.tsx` | Floating button + panel. Mounted in `[locale]/layout.tsx`. |
| `scripts/assistant-tokens.mjs` | `pnpm assistant:tokens` — exact prompt size and per-message cache cost. |
| `messages/{en,fr}.json` → `assistant` | Widget chrome. Validated by `pnpm check:i18n`. |

The route is `/api/assistant`, **not** `/api/chat` — that path already belongs to
Stream Chat (user-to-user messaging).

## Configuration

```bash
OPENAI_API_KEY=sk-...   # server-side only, never NEXT_PUBLIC_
OPENAI_MODEL=           # optional; defaults to gpt-5.6-terra
```

The key is read only inside the route handler, so it never reaches the browser
bundle. Without it the route returns 503 and the widget shows a localized error.

### Model choice

Defaults to `gpt-5.6-terra` — the balanced tier, and the right one for a grounded
FAQ widget where the answer is already in the prompt and the job is to find and
phrase it. `gpt-5.6-sol` is the flagship if you want stronger reasoning;
`gpt-5.6-luna` is materially cheaper for high volume.

Switching model is one env var. Run `pnpm assistant:tokens` afterwards — it makes
two identical requests and reports how much of the prompt actually came back as
`cached_tokens`, which is the only trustworthy evidence that caching is engaging.

`reasoning.effort` is set to `low`. An FAQ lookup against a prompt that already
contains the answer does not need deliberation, and effort is the main latency
and cost lever here.

`store: false` is set deliberately: conversations are not retained server-side.
Users paste addresses, phone numbers and listing details into this widget.

## Updating the knowledge base

Edit `knowledge-base.ts` directly. The PDF is the historical source, not a build
input — there is no regeneration step, and the file is deliberately plain
markdown inside a template literal so it stays reviewable in a diff.

Keep *facts for users* in `knowledge-base.ts` and *rules for the bot* in
`system-prompt.ts`. Mixing them is how a bot ends up reciting its own rulebook at
a customer.

After editing, run `pnpm assistant:tokens` — it reports the real prompt size,
how much of it caches, and the per-message cost, all of which move as the
knowledge base grows or shrinks.

## Guardrails

Encoded in the system prompt, from sections 25, 30, 31 and 32 of the source
document. The assistant will not invent listings, prices, fees, or availability;
will not guarantee a property, provider, transaction, or verification outcome;
will not ask for a password, OTP, PIN, or financial detail; and hands off to
human support for payment disputes, fraud, harassment, compromised accounts,
legal matters — or whenever it does not know.

It also has no database access, so it is told to say plainly that it cannot
search live listings rather than implying it looked and found nothing.

## Known limits

- **No live listing search.** Sections 28–29 of the source document envisage the
  bot querying the real FindAfriq database. That needs function calling plus
  backend search endpoints; today the bot narrows down requirements and hands the
  user to the relevant browse page. This is the natural next increment.
- **Rate limiting is per server instance** (in-memory, 20 requests/minute/IP).
  On a multi-instance deploy the effective limit multiplies by instance count.
  It is a cost guard, not a security control — move it to Redis if you need a
  real global limit.
- **No conversation persistence.** History lives in component state, so it
  survives client-side navigation but not a hard refresh.
- **No abuse logging.** Nothing is stored, which is good for privacy and bad for
  spotting misuse. Add logging before a wide launch if that matters.
