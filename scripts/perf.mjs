#!/usr/bin/env node
/**
 * Local Lighthouse run against a production build.
 *
 * Why this exists: PageSpeed against a Netlify deploy preview is not a usable
 * signal. Previews ship Netlify's own widget (~1.4 MB and several hundred ms of
 * CPU) and an `x-robots-tag: noindex` header that tanks the SEO score. This
 * measures only our own code.
 *
 * Two habits this enforces, because both caused wrong conclusions before:
 *   1. Never measure `next dev`. It is unminified with HMR attached and scores
 *      ~40, which sends you chasing problems that do not exist in production.
 *   2. Never trust one run. Back-to-back runs of an identical build came out at
 *      87 and 89, so a single number cannot tell you whether a change helped.
 *
 * Usage:
 *   pnpm run perf                 # reuse existing build, 2 runs, mobile
 *   pnpm run perf -- --build      # rebuild first
 *   pnpm run perf -- --runs=3
 *   pnpm run perf -- --desktop
 *   pnpm run perf -- --url=/en/routes/properties
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const PORT = Number(opt("port", 3990));
const RUNS = Number(opt("runs", 2));
const PATHNAME = opt("url", "/en");
const DESKTOP = flag("desktop");
const ORIGIN = `http://localhost:${PORT}`;
const TARGET = `${ORIGIN}${PATHNAME}`;
const OUT_DIR = join(process.cwd(), ".perf");
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

let server = null;
const stopServer = () => {
  if (server && !server.killed) server.kill("SIGTERM");
  server = null;
};
// Kill the server on every exit path, or it survives the script and holds the port.
process.on("exit", stopServer);
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    stopServer();
    process.exit(1);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForOk(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) return true;
    } catch {
      // not up yet
    }
    await sleep(500);
  }
  return false;
}

function run(cmd, cmdArgs, opts = {}) {
  const res = spawnSync(cmd, cmdArgs, { stdio: "inherit", ...opts });
  if (res.status !== 0) {
    console.error(`\n✖ \`${cmd} ${cmdArgs.join(" ")}\` failed.`);
    process.exit(res.status ?? 1);
  }
}

// ── Backend check ───────────────────────────────────────────────────────────
// With the API down the page renders no listings, so almost no images load and
// the score comes out flatteringly wrong. Warn loudly rather than silently
// producing a meaningless number.
const apiUp = await (async () => {
  try {
    const res = await fetch(`${API_URL}/properties?limit=1`, {
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
})();

if (!apiUp) {
  console.warn(
    `\n⚠  API not reachable at ${API_URL}\n` +
      `   The page will render with no listings, so far fewer images load and\n` +
      `   the score will be misleadingly high. Start the backend first:\n` +
      `     cd ../backend && npm run start:dev\n`,
  );
}

// ── Build ───────────────────────────────────────────────────────────────────
if (flag("build") || !existsSync(join(process.cwd(), ".next", "BUILD_ID"))) {
  console.log("→ building (production)…");
  run("npx", ["next", "build"]);
} else {
  console.log("→ reusing existing .next build (pass --build to rebuild)");
}

// ── Serve ───────────────────────────────────────────────────────────────────
console.log(`→ starting production server on :${PORT}…`);
server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  stdio: "ignore",
  detached: false,
});

if (!(await waitForOk(TARGET, 60_000))) {
  console.error(`✖ server did not become ready at ${TARGET}`);
  process.exit(1);
}

// The first hit pays for on-demand image optimisation; measuring it would
// blame our code for one-off work a real visitor never sees.
console.log("→ warming (first request optimises images on demand)…");
await fetch(TARGET).catch(() => {});
await sleep(2000);

// ── Measure ─────────────────────────────────────────────────────────────────
mkdirSync(OUT_DIR, { recursive: true });
const results = [];

for (let i = 1; i <= RUNS; i += 1) {
  const jsonPath = join(OUT_DIR, `run-${i}.json`);
  console.log(`→ lighthouse run ${i}/${RUNS} (${DESKTOP ? "desktop" : "mobile"})…`);
  run("npx", [
    "lighthouse",
    TARGET,
    "--output=json",
    `--output-path=${jsonPath}`,
    ...(DESKTOP
      ? ["--form-factor=desktop", "--screenEmulation.disabled"]
      : ["--form-factor=mobile", "--screenEmulation.mobile"]),
    "--throttling-method=simulate",
    '--chrome-flags=--headless --no-sandbox',
    "--quiet",
  ]);
  results.push(JSON.parse(readFileSync(jsonPath, "utf8")));
}

// Keep the last run as a readable report.
const htmlPath = join(OUT_DIR, "report.html");
console.log("→ writing HTML report…");
run("npx", [
  "lighthouse",
  TARGET,
  "--output=html",
  `--output-path=${htmlPath}`,
  ...(DESKTOP
    ? ["--form-factor=desktop", "--screenEmulation.disabled"]
    : ["--form-factor=mobile", "--screenEmulation.mobile"]),
  "--throttling-method=simulate",
  '--chrome-flags=--headless --no-sandbox',
  "--quiet",
]);

stopServer();

// ── Report ──────────────────────────────────────────────────────────────────
const metric = (d, id) => d.audits[id]?.displayValue ?? "—";
const pad = (s, n) => String(s).padStart(n);

console.log(`\n════ ${DESKTOP ? "DESKTOP" : "MOBILE"} · ${PATHNAME} · ${RUNS} run(s) ════\n`);
const header = ["", ...results.map((_, i) => `run ${i + 1}`)];
console.log(header.map((h, i) => (i ? pad(h, 12) : h.padEnd(14))).join(""));

const scores = results.map((d) => Math.round(d.categories.performance.score * 100));
console.log(
  "Performance".padEnd(14) + scores.map((s) => pad(s, 12)).join(""),
);
for (const [id, label] of [
  ["first-contentful-paint", "FCP"],
  ["largest-contentful-paint", "LCP"],
  ["total-blocking-time", "TBT"],
  ["cumulative-layout-shift", "CLS"],
  ["speed-index", "Speed Index"],
]) {
  console.log(
    label.padEnd(14) + results.map((d) => pad(metric(d, id), 12)).join(""),
  );
}

if (scores.length > 1) {
  const spread = Math.max(...scores) - Math.min(...scores);
  console.log(
    `\nspread: ${spread} point(s) — treat anything within ~2 as noise, not a result.`,
  );
}

// ── Payload, which is far less noisy than the score ─────────────────────────
// This is the regression signal that matters: images bypassing next/image get
// served at original upload size. That was 7.93 MB on one page before the
// SafeImage CDN rewrite.
const last = results.at(-1);
const reqs = last.audits["network-requests"]?.details?.items ?? [];
const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;
const sum = (rs) => rs.reduce((t, r) => t + (r.transferSize || 0), 0);
const rawImages = reqs.filter(
  (r) => r.resourceType === "Image" && !String(r.url).includes("/_next/image"),
);

console.log(
  `\nraw (unoptimised) images : ${mb(sum(rawImages))}  ← should stay near zero`,
);
console.log(
  `optimised images         : ${mb(
    sum(reqs.filter((r) => String(r.url).includes("/_next/image"))),
  )}`,
);
console.log(`page total               : ${mb(sum(reqs))}`);

if (sum(rawImages) > 1024 * 1024) {
  console.warn(
    `\n⚠  Over 1 MB of images are bypassing next/image. Check SafeImage's\n` +
      `   optimizedSrc rewrite — an image host that is not remapped to a CDN\n` +
      `   host in next.config remotePatterns gets served at full upload size.`,
  );
}

console.log(`\nreport: ${htmlPath}`);
if (!apiUp) console.log("note:   API was down — numbers are optimistic.");

// Keep the directory tidy; the HTML report is the artefact worth keeping.
for (let i = 1; i <= RUNS; i += 1) {
  rmSync(join(OUT_DIR, `run-${i}.json`), { force: true });
}
