// Plays the emergency alert sound for incident:new / sos:new arrivals (see
// EmergencyAlertProvider). Tries /sounds/emergency-alert.mp3 first -- drop a
// real file at that path in /public to use it -- and falls back to a
// synthesized siren tone (Web Audio oscillators) since no such asset ships
// with this repo, so the alert still makes sound out of the box.
const SOUND_SRC = "/sounds/emergency-alert.mp3";

let audioEl: HTMLAudioElement | null = null;
let audioFileMissing = false;
let audioCtx: AudioContext | null = null;

function getAudioElement(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio(SOUND_SRC);
    audioEl.preload = "auto";
    audioEl.volume = 0.85;
    audioEl.addEventListener("error", () => {
      audioFileMissing = true;
    });
  }
  return audioEl;
}

function getAudioContext(): AudioContext | null {
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

// Four-beat alternating tone, closer to a dispatch alert than a single
// beep -- loud/short enough to notice without being a genuine siren.
function playSynthesizedSiren() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const tones = [880, 660, 880, 660];
  const toneDuration = 0.18;

  tones.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;

    const start = now + i * toneDuration;
    const end = start + toneDuration;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
    gain.gain.linearRampToValueAtTime(0, end - 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(end);
  });
}

export function playEmergencyAlertSound() {
  if (audioFileMissing) {
    playSynthesizedSiren();
    return;
  }

  const el = getAudioElement();
  el.currentTime = 0;
  el.play().catch(() => {
    // Covers both a load failure that hasn't fired `error` yet and the
    // browser's autoplay policy -- either way, still make some sound.
    playSynthesizedSiren();
  });
}
