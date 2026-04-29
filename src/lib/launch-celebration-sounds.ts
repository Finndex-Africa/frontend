/**
 * Procedural launch audio (Web Audio API). Runs only after a user gesture (click).
 * No external assets — avoids autoplay issues where possible.
 */

function createNoiseBuffer(
  ctx: AudioContext,
  durationSec: number,
  fadeOut = true,
): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * durationSec);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i += 1) {
    const t = fadeOut ? 1 - i / len : 1;
    data[i] = (Math.random() * 2 - 1) * t * t;
  }
  return buffer;
}

function playTone(
  ctx: AudioContext,
  start: number,
  freq: number,
  duration: number,
  gain: number,
  type: OscillatorType = "sine",
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function playPop(ctx: AudioContext, when: number, pitch = 1) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(420 * pitch, when);
  osc.frequency.exponentialRampToValueAtTime(120 * pitch, when + 0.08);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(0.22, when + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.12);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + 0.15);
}

/** Main fanfare + firework-ish pops + subtle crowd-ish noise. */
export function playLaunchCelebrationSounds() {
  if (typeof window === "undefined") return;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return;

  const ctx = new AC();
  const t0 = ctx.currentTime;

  try {
    void ctx.resume();
  } catch {
    /* ignore */
  }

  // Bright arpeggio fanfare (major-ish)
  const chord = [523.25, 659.25, 783.99, 987.77, 1046.5];
  chord.forEach((f, i) => {
    playTone(ctx, t0 + i * 0.11, f, 0.38, 0.11, "triangle");
  });

  // Sparkle high notes
  [1318.51, 1567.98, 1760].forEach((f, i) => {
    playTone(ctx, t0 + 0.55 + i * 0.07, f, 0.25, 0.06, "sine");
  });

  // Firework crackle layers
  const crackle = ctx.createBufferSource();
  crackle.buffer = createNoiseBuffer(ctx, 0.45, true);
  const crackleFilter = ctx.createBiquadFilter();
  crackleFilter.type = "bandpass";
  crackleFilter.frequency.setValueAtTime(1800, t0);
  crackleFilter.Q.setValueAtTime(0.6, t0);
  const crackleGain = ctx.createGain();
  crackleGain.gain.setValueAtTime(0.0001, t0 + 0.4);
  crackleGain.gain.exponentialRampToValueAtTime(0.12, t0 + 0.42);
  crackleGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.85);
  crackle.connect(crackleFilter);
  crackleFilter.connect(crackleGain);
  crackleGain.connect(ctx.destination);
  crackle.start(t0 + 0.4);

  // “Crowd cheer” — band-limited noise swell
  const cheer = ctx.createBufferSource();
  cheer.buffer = createNoiseBuffer(ctx, 1.2, true);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(400, t0 + 0.2);
  bp.frequency.exponentialRampToValueAtTime(2200, t0 + 0.9);
  bp.Q.setValueAtTime(1.2, t0);
  const cheerG = ctx.createGain();
  cheerG.gain.setValueAtTime(0.0001, t0 + 0.35);
  cheerG.gain.exponentialRampToValueAtTime(0.07, t0 + 0.55);
  cheerG.gain.exponentialRampToValueAtTime(0.04, t0 + 1.1);
  cheerG.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.65);
  cheer.connect(bp);
  bp.connect(cheerG);
  cheerG.connect(ctx.destination);
  cheer.start(t0 + 0.35);

  // Staggered pops (fireworks)
  const popTimes = [0.5, 0.72, 0.95, 1.2, 1.55, 1.9, 2.25, 2.6, 3.0, 3.45, 3.9, 4.35];
  popTimes.forEach((offset, i) => {
    playPop(ctx, t0 + offset, 0.85 + (i % 4) * 0.12);
  });

  window.setTimeout(() => {
    try {
      void ctx.close();
    } catch {
      /* ignore */
    }
  }, 7000);
}
