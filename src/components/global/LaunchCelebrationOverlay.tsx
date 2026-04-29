"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { apiClient } from "@/lib/api-client";
import { playLaunchCelebrationSounds } from "@/lib/launch-celebration-sounds";

type LaunchStatus = { clicked: 0 | 1 };

const BALLOON_COUNT = 68;
const CONFETTI_COUNT = 72;
const BURST_COUNT = 8;
const PARTICLES_PER_BURST = 34;
const STAR_COUNT = 48;

const FW_COLORS = [
  "#ffcc00",
  "#ff6b6b",
  "#4ecdc4",
  "#c084fc",
  "#ffffff",
  "#fb7185",
  "#38bdf8",
  "#fbbf24",
];

const CONFETTI_COLORS = [
  "#ffcc00",
  "#fff",
  "#ff6b6b",
  "#4ade80",
  "#60a5fa",
  "#f472b6",
  "#fbbf24",
];

const BALLOON_ICONS = ["🎈", "🎈", "🎊", "🎈", "✨", "🎈", "🎉", "🎈"];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

type BalloonSpec = {
  id: number;
  leftPct: number;
  delayMs: number;
  durationMs: number;
  sizePx: number;
  drift: number;
  rotate: number;
  icon: string;
};

type ConfettiSpec = {
  id: number;
  leftPct: number;
  delayMs: number;
  durationMs: number;
  color: string;
  width: number;
  height: number;
  drift: number;
  spin: number;
};

type FireworkParticle = {
  id: string;
  angle: number;
  dist: number;
  size: number;
  color: string;
  delayMs: number;
  durationMs: number;
};

type FireworkBurst = {
  id: number;
  leftPct: number;
  topPct: number;
  delayMs: number;
  particles: FireworkParticle[];
};

type StarSpec = { id: number; leftPct: number; topPct: number; size: number; delay: number };

function buildFireworks(reduced: boolean): FireworkBurst[] {
  if (reduced) return [];
  const bursts: FireworkBurst[] = [];
  for (let b = 0; b < BURST_COUNT; b += 1) {
    const particles: FireworkParticle[] = [];
    for (let p = 0; p < PARTICLES_PER_BURST; p += 1) {
      const angle = randomBetween(0, 360);
      particles.push({
        id: `${b}-${p}`,
        angle,
        dist: randomBetween(80, 220),
        size: randomBetween(3, 7),
        color: FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)] ?? "#fff",
        delayMs: randomBetween(0, 280),
        durationMs: randomBetween(900, 1600),
      });
    }
    bursts.push({
      id: b,
      leftPct: randomBetween(8, 92),
      topPct: randomBetween(12, 62),
      delayMs: b * 320 + randomBetween(0, 200),
      particles,
    });
  }
  return bursts;
}

function buildConfetti(reduced: boolean): ConfettiSpec[] {
  const n = reduced ? 0 : CONFETTI_COUNT;
  const out: ConfettiSpec[] = [];
  for (let i = 0; i < n; i += 1) {
    out.push({
      id: i,
      leftPct: randomBetween(-2, 102),
      delayMs: randomBetween(0, 1200),
      durationMs: randomBetween(3800, 6200),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)] ?? "#ffcc00",
      width: randomBetween(5, 10),
      height: randomBetween(8, 16),
      drift: randomBetween(-140, 140),
      spin: randomBetween(-1080, 1080),
    });
  }
  return out;
}

function buildBalloons(reduced: boolean): BalloonSpec[] {
  const n = reduced ? Math.floor(BALLOON_COUNT / 3) : BALLOON_COUNT;
  const next: BalloonSpec[] = [];
  for (let i = 0; i < n; i += 1) {
    next.push({
      id: i,
      leftPct: randomBetween(-5, 105),
      delayMs: randomBetween(0, 1100),
      durationMs: randomBetween(3200, 7000),
      sizePx: randomBetween(26, 54),
      drift: randomBetween(-48, 48),
      rotate: randomBetween(-28, 28),
      icon: BALLOON_ICONS[i % BALLOON_ICONS.length] ?? "🎈",
    });
  }
  return next;
}

function buildStars(reduced: boolean): StarSpec[] {
  const n = reduced ? 8 : STAR_COUNT;
  const out: StarSpec[] = [];
  for (let i = 0; i < n; i += 1) {
    out.push({
      id: i,
      leftPct: randomBetween(0, 100),
      topPct: randomBetween(0, 100),
      size: randomBetween(1, 3),
      delay: randomBetween(0, 4000),
    });
  }
  return out;
}

export default function LaunchCelebrationOverlay() {
  const reducedMotion = usePrefersReducedMotion();
  const [loading, setLoading] = useState(true);
  const [showGate, setShowGate] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [balloons, setBalloons] = useState<BalloonSpec[]>([]);
  const [confetti, setConfetti] = useState<ConfettiSpec[]>([]);
  const [bursts, setBursts] = useState<FireworkBurst[]>([]);
  const [stars] = useState(() => buildStars(false));
  const [exiting, setExiting] = useState(false);

  const animMs = reducedMotion ? 2200 : 7200;

  useEffect(() => {
    if (!loading && showGate) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [loading, showGate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get<LaunchStatus>("/launch-celebration");
        if (cancelled) return;
        const clicked = res.data?.clicked ?? 1;
        setShowGate(clicked === 0);
      } catch {
        if (!cancelled) setShowGate(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLaunch = useCallback(async () => {
    if (celebrating) return;
    setCelebrating(true);
    setBalloons(buildBalloons(reducedMotion));
    setConfetti(buildConfetti(reducedMotion));
    setBursts(buildFireworks(reducedMotion));

    if (!reducedMotion) {
      try {
        playLaunchCelebrationSounds();
      } catch {
        /* ignore audio failures */
      }
    }

    window.setTimeout(() => {
      setExiting(true);
    }, animMs - 900);
    window.setTimeout(async () => {
      try {
        await apiClient.post<LaunchStatus>("/launch-celebration/complete", {});
      } catch {
        /* still dismiss UI */
      }
      setShowGate(false);
    }, animMs);
  }, [celebrating, reducedMotion, animMs]);

  const starLayer = useMemo(
    () =>
      (reducedMotion ? stars.slice(0, 8) : stars).map((s) => (
        <span
          key={s.id}
          className="launch-star pointer-events-none absolute rounded-full bg-white"
          style={{
            left: `${s.leftPct}%`,
            top: `${s.topPct}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}ms`,
          }}
          aria-hidden
        />
      )),
    [stars, reducedMotion],
  );

  const balloonLayer = useMemo(
    () =>
      balloons.map((b) => (
        <span
          key={b.id}
          className="launch-balloon pointer-events-none absolute bottom-0 select-none"
          style={{
            left: `${b.leftPct}%`,
            fontSize: `${b.sizePx}px`,
            animationDelay: `${b.delayMs}ms`,
            animationDuration: `${b.durationMs}ms`,
            ...({
              "--drift": `${b.drift}px`,
              "--rot": `${b.rotate}deg`,
            } as CSSProperties),
          }}
          aria-hidden
        >
          {b.icon}
        </span>
      )),
    [balloons],
  );

  const confettiLayer = useMemo(
    () =>
      confetti.map((c) => (
        <span
          key={c.id}
          className="launch-confetti pointer-events-none absolute top-0 block rounded-[1px]"
          style={{
            left: `${c.leftPct}%`,
            width: c.width,
            height: c.height,
            backgroundColor: c.color,
            animationDelay: `${c.delayMs}ms`,
            animationDuration: `${c.durationMs}ms`,
            ...({
              "--drift": `${c.drift}px`,
              "--spin": `${c.spin}deg`,
            } as CSSProperties),
          }}
          aria-hidden
        />
      )),
    [confetti],
  );

  const fireworkLayer = useMemo(
    () =>
      bursts.map((burst) => (
        <div
          key={burst.id}
          className="pointer-events-none absolute"
          style={{
            left: `${burst.leftPct}%`,
            top: `${burst.topPct}%`,
            width: 0,
            height: 0,
          }}
          aria-hidden
        >
          {burst.particles.map((p) => (
            <span
              key={p.id}
              className="launch-firework-dot absolute block rounded-full"
              style={{
                width: p.size,
                height: p.size,
                marginLeft: -p.size / 2,
                marginTop: -p.size / 2,
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                animationDelay: `${burst.delayMs + p.delayMs}ms`,
                animationDuration: `${p.durationMs}ms`,
                ...({
                  "--fw-angle": `${p.angle}deg`,
                  "--fw-dist": `${p.dist}px`,
                } as CSSProperties),
              }}
            />
          ))}
        </div>
      )),
    [bursts],
  );

  if (loading || !showGate) return null;

  return (
    <div
      className={`fixed inset-0 z-[10050] flex flex-col items-center justify-center px-4 transition-opacity duration-[900ms] ease-out ${exiting ? "opacity-0" : "opacity-100"
        }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="launch-celebration-title"
    >
      {/* Deep space gradient + vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,#4c1d95_0%,#1e1b4b_35%,#0f0a24_70%,#020008_100%)]" aria-hidden />
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 25%, rgba(255,204,0,0.22) 0%, transparent 42%), radial-gradient(circle at 85% 20%, rgba(59,130,246,0.35) 0%, transparent 38%), radial-gradient(circle at 50% 100%, rgba(0,0,255,0.45) 0%, transparent 55%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.65) 100%)",
        }}
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
        {starLayer}
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">{celebrating ? fireworkLayer : null}</div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">{celebrating ? confettiLayer : null}</div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">{celebrating ? balloonLayer : null}</div>

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-[34rem] px-2 sm:px-0">
        <div className="launch-glass-card rounded-[2rem] border border-white/20 bg-white/[0.07] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-12">
          <div className="mb-4 flex justify-center gap-2 text-2xl sm:text-3xl" aria-hidden>
            <span className="launch-float-icon inline-block">🏠</span>
            <span
              className="launch-float-icon inline-block"
              style={{ animationDelay: "150ms" }}
            >
              🌍
            </span>
            <span
              className="launch-float-icon inline-block"
              style={{ animationDelay: "300ms" }}
            >
              ✨
            </span>
          </div>

          <p className="mb-2 text-center text-xs font-semibold tracking-[0.28em] text-amber-200/90 uppercase sm:text-sm">
            FindAfriq · Launch day
          </p>
          <h1
            id="launch-celebration-title"
            className="font-heading mb-3 text-center text-4xl leading-[1.08] text-white text-balance drop-shadow-[0_4px_24px_rgba(0,0,0,0.4)] sm:text-5xl md:text-[3.25rem]"
          >
            {celebrating ? (
              <span className="launch-cheers-text inline-block">Cheers we&apos;re live! 🥂</span>
            ) : (
              <>The moment is here</>
            )}
          </h1>
          {!celebrating ? (
            <p className="mb-10 text-center text-base leading-relaxed text-white/80 text-pretty sm:text-lg">
            </p>
          ) : (
            <p className="mb-8 text-center text-lg font-medium text-amber-100/95 sm:text-xl">
              🎉 Thank you for being part of this 🎉
            </p>
          )}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleLaunch}
              disabled={celebrating}
              className="launch-cta-btn group relative inline-flex min-h-[4.75rem] min-w-[min(100%,19rem)] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-[#ffe566] via-[#ffcc00] to-[#e6a800] px-10 py-5 text-lg font-bold tracking-wide text-[#0c0c2e] shadow-[0_14px_50px_rgba(0,0,0,0.45),inset_0_2px_0_rgba(255,255,255,0.55)] transition-transform duration-200 enabled:hover:scale-[1.04] enabled:active:scale-[0.97] disabled:cursor-default disabled:opacity-95 sm:min-w-[22rem] sm:text-2xl"
            >
              <span
                className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"
                aria-hidden
              />
              <span className="relative z-10 flex items-center gap-3">
                {celebrating ? (
                  <>
                    <span className="text-3xl sm:text-4xl" aria-hidden>
                      🎆
                    </span>
                    <span className="font-heading">Celebrating…</span>
                    <span className="text-3xl sm:text-4xl" aria-hidden>
                      🎈
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl sm:text-3xl" aria-hidden>
                      🎆
                    </span>
                    Launch Now
                    <span className="text-2xl transition-transform duration-300 group-hover:-translate-y-1 sm:text-3xl" aria-hidden>
                      🎈
                    </span>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
