let sharedContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let activeOscillators: OscillatorNode[] = [];
let loopTimer: number | null = null;
/** Bumps on every stop so in-flight resume/play work is ignored. */
let playGeneration = 0;

/** Repeat chime while the new-order popup stays open. */
const CHIME_LOOP_MS = 1_000;

function getAudioContextCtor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext ||
    null
  );
}

function getOrCreateContext(): AudioContext | null {
  const AudioContextCtor = getAudioContextCtor();
  if (!AudioContextCtor) return null;

  if (!sharedContext || sharedContext.state === "closed") {
    sharedContext = new AudioContextCtor();
  }
  return sharedContext;
}

function clearLoopTimer(): void {
  if (typeof window === "undefined") return;
  if (loopTimer == null) return;
  window.clearInterval(loopTimer);
  loopTimer = null;
}

function silenceGraph(): void {
  const context = sharedContext;
  const gain = masterGain;

  if (gain && context && context.state !== "closed") {
    try {
      const now = context.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(0, now);
    } catch {
      // Context may already be closing.
    }
  }

  for (const oscillator of activeOscillators) {
    try {
      oscillator.stop();
      oscillator.disconnect();
    } catch {
      // Already stopped — ignore.
    }
  }
  activeOscillators = [];

  if (gain) {
    try {
      gain.disconnect();
    } catch {
      // Already disconnected — ignore.
    }
  }
  masterGain = null;
}

/**
 * Unlocks Web Audio after a user gesture so later poll-triggered chimes can play.
 * Call from admin shell pointer/keydown handlers.
 */
export function unlockAdminOrderAlertSound(): void {
  if (typeof window === "undefined") return;
  const context = getOrCreateContext();
  if (!context) return;
  if (context.state === "suspended") {
    void context.resume();
  }
}

/** Whether the acknowledge-loop chime is currently scheduled. */
export function isAdminOrderAlertSoundLooping(): boolean {
  return loopTimer != null;
}

/** Stops any in-flight admin order alert chime immediately (keeps context unlocked). */
export function stopAdminOrderAlertSound(): void {
  if (typeof window === "undefined") return;

  playGeneration += 1;
  clearLoopTimer();
  silenceGraph();
}

/** Closes the shared context (admin shell unmount). */
export function disposeAdminOrderAlertSound(): void {
  if (typeof window === "undefined") return;

  stopAdminOrderAlertSound();
  if (!sharedContext) return;

  const context = sharedContext;
  sharedContext = null;
  try {
    void context.close();
  } catch {
    // Already closed — ignore.
  }
}

function scheduleChimeBurst(context: AudioContext, generation: number): void {
  if (generation !== playGeneration) return;
  if (sharedContext !== context || context.state !== "running") return;

  silenceGraph();

  const master = context.createGain();
  master.connect(context.destination);
  masterGain = master;

  const now = context.currentTime;
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

  for (const [offset, frequency] of [
    [0, 880],
    [0.12, 1175],
    [0.24, 1397],
  ] as const) {
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now + offset);
    oscillator.connect(master);
    oscillator.start(now + offset);
    oscillator.stop(now + offset + 0.18);
    activeOscillators.push(oscillator);
  }
}

/**
 * Repeating attention chime until `stopAdminOrderAlertSound`
 * (acknowledge / popup close).
 */
export function playAdminOrderAlertSound(): void {
  if (typeof window === "undefined") return;

  stopAdminOrderAlertSound();

  const context = getOrCreateContext();
  if (!context) return;

  const generation = playGeneration;

  const startLoop = (): void => {
    if (generation !== playGeneration) return;
    if (context.state !== "running") return;

    scheduleChimeBurst(context, generation);
    clearLoopTimer();
    loopTimer = window.setInterval(() => {
      scheduleChimeBurst(context, generation);
    }, CHIME_LOOP_MS);
  };

  if (context.state === "running") {
    startLoop();
    return;
  }

  void context.resume().then(() => {
    if (generation !== playGeneration) return;
    if (context.state !== "running") return;
    startLoop();
  });
}
