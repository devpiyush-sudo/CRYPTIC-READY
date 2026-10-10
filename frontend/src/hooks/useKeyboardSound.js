// Tiny synthesized "key click" (Web Audio) - no audio files to ship or load.
let audioCtx;

function playClick() {
  try {
    audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(900 + Math.random() * 500, now);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // audio is optional - ignore failures
  }
}

function useKeyboardSound() {
  return { playRandomKeyStrokeSound: playClick };
}

export default useKeyboardSound;
