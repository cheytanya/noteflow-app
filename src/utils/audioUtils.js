// Audio Player & Synthesizer System for NoteFlow Notifications

let audioCtx = null;
let currentAudioElement = null;

// Initialize & resume AudioContext on user interaction if suspended
function ensureAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Unlock audio on first user touch/click if restricted by browser autoplay policy
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    ensureAudioContext();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
}

export function playIphoneSound(volumePercent = 70) {
  try {
    const normVolume = Math.max(0, Math.min(1, volumePercent / 100));

    if (currentAudioElement) {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    }

    const audio = new Audio('/sounds/iphone-notification.mp3');
    audio.volume = normVolume;
    audio.loop = false;

    currentAudioElement = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('iPhone HTML5 Audio autoplay restricted. Falling back to Web Audio crystal chime:', err);
        synthesizeIphoneChimeWebAudio(normVolume);
      });
    }
  } catch (err) {
    console.warn('Audio play error, using iPhone Web Audio fallback:', err);
    synthesizeIphoneChimeWebAudio(volumePercent / 100);
  }
}

export function playOmChantSound(volumePercent = 70) {
  try {
    const normVolume = Math.max(0, Math.min(1, volumePercent / 100));

    if (currentAudioElement) {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    }

    const audio = new Audio('/sounds/om-notification.mp3');
    audio.volume = normVolume;
    audio.loop = false;

    currentAudioElement = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('HTML5 Audio autoplay restricted. Falling back to Web Audio chant synthesis:', err);
        synthesizeOmChantWebAudio(normVolume);
      });
    }
  } catch (err) {
    console.warn('Audio play error, using Web Audio fallback:', err);
    synthesizeOmChantWebAudio(volumePercent / 100);
  }
}

export function playDefaultChimeSound(volumePercent = 70) {
  try {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const normVolume = Math.max(0, Math.min(1, volumePercent / 100));

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.2 * normVolume, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.15);
    gain2.gain.setValueAtTime(0.25 * normVolume, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.warn('Default chime audio playback failed:', err);
  }
}

// Fallback Web Audio Synthesizer for iPhone ~5s Crystal Chime Sequence
function synthesizeIphoneChimeWebAudio(normVolume = 0.7) {
  try {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 1174.66, start: 0.0, duration: 0.4 },  // D6
      { freq: 1479.98, start: 0.25, duration: 0.4 }, // F#6
      { freq: 1760.00, start: 0.50, duration: 0.4 }, // A6
      { freq: 2349.32, start: 0.75, duration: 0.8 }, // D7
      { freq: 1760.00, start: 1.20, duration: 0.4 }, // A6
      { freq: 1479.98, start: 1.45, duration: 0.4 }, // F#6
      { freq: 1174.66, start: 1.70, duration: 3.2 }  // D6 decay
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.start);

      gain.gain.setValueAtTime(0.22 * normVolume, now + note.start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.start);
      osc.stop(now + note.start + note.duration);
    });
  } catch (e) {}
}

function synthesizeOmChantWebAudio(normVolume = 0.7) {
  try {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('Om');
      utterance.rate = 0.7;
      utterance.pitch = 0.85;
      utterance.volume = normVolume;
      window.speechSynthesis.speak(utterance);
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(136.1, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.3 * normVolume, now + 0.8);
    gain.gain.setValueAtTime(0.3 * normVolume, now + 5.0);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 6.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 6.5);
  } catch (e) {}
}

export function playNotificationSound(soundChoice = 'iphone', volumePercent = 70) {
  if (soundChoice === 'silent') return;

  if (soundChoice === 'iphone') {
    playIphoneSound(volumePercent);
  } else if (soundChoice === 'om') {
    playOmChantSound(volumePercent);
  } else if (soundChoice === 'default') {
    playDefaultChimeSound(volumePercent);
  } else {
    playIphoneSound(volumePercent);
  }
}
