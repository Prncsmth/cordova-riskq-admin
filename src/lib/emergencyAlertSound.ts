// Plays the emergency alert sound for incident:new / sos:new arrivals (see
// EmergencyAlertProvider). SOS and a routine incident report intentionally
// sound different -- SOS is the one that should make someone look up from
// their desk; a routine report shouldn't carry the same weight, or every
// incident starts to feel like a life-threatening one and admins tune out
// the sound entirely.
export type EmergencyAlertKind = "sos" | "incident";

// Tries /sounds/emergency-alert-<kind>.mp3 first -- drop real files at
// those paths in /public to use them -- and falls back to a synthesized
// tone (Web Audio oscillators) since neither ships with this repo, so the
// alert still makes sound out of the box.
const SOUND_SRC: Record<EmergencyAlertKind, string> = {
  sos: "/sounds/emergency-alert-sos.m4a",
  incident: "/sounds/emergency-alert-incident.m4a",
};

const audioEls: Partial<Record<EmergencyAlertKind, HTMLAudioElement>> = {};
const audioFileMissing: Partial<Record<EmergencyAlertKind, boolean>> = {};
let audioCtx: AudioContext | null = null;

function getAudioElement(kind: EmergencyAlertKind): HTMLAudioElement {
  let el = audioEls[kind];
  if (!el) {
    el = new Audio(SOUND_SRC[kind]);
    el.preload = "auto";
    el.volume = kind === "sos" ? 0.9 : 0.6;
    el.addEventListener("error", () => {
      audioFileMissing[kind] = true;
    });
    audioEls[kind] = el;
  }
  return el;
}

function getAudioContext(): AudioContext | null {
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

function playTones(tones: number[], toneDuration: number, waveform: OscillatorType, peakGain: number) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  tones.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = waveform;
    osc.frequency.value = freq;

    const start = now + i * toneDuration;
    const end = start + toneDuration;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peakGain, start + 0.02);
    gain.gain.linearRampToValueAtTime(0, end - 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(end);
  });
}

// Six-beat alternating square-wave siren, louder and longer than the
// incident chime below -- deliberately closer to a real dispatch alert
// since SOS means someone is in immediate danger.
function playSosSiren() {
  playTones([880, 660, 880, 660, 880, 660], 0.16, "square", 0.32);
}

// Two-note ascending sine chime -- soft and short, reads as "something
// happened" rather than "emergency," for a routine incident report.
function playIncidentChime() {
  playTones([660, 880], 0.22, "sine", 0.16);
}

function playSynthesizedFallback(kind: EmergencyAlertKind) {
  if (kind === "sos") {
    playSosSiren();
  } else {
    playIncidentChime();
  }
}

export function playEmergencyAlertSound(kind: EmergencyAlertKind) {
  if (audioFileMissing[kind]) {
    playSynthesizedFallback(kind);
    return;
  }

  const el = getAudioElement(kind);
  el.currentTime = 0;
  el.play().catch(() => {
    // Covers both a load failure that hasn't fired `error` yet and the
    // browser's autoplay policy -- either way, still make some sound.
    playSynthesizedFallback(kind);
  });
}
