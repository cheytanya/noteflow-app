import fs from 'fs';
import path from 'path';

// Generate a 5.0-second PCM WAV file reproducing an iPhone-style crystal chime sound sequence
const sampleRate = 44100;
const durationSec = 5.0;
const numSamples = Math.floor(sampleRate * durationSec);
const pcmBuffer = Buffer.alloc(numSamples * 2); // 16-bit mono

// iPhone Chime Note Sequence (D6, F#6, A6, D7, A6, F#6, D6)
// Frequencies in Hz: D6=1174.66, F#6=1479.98, A6=1760.00, D7=2349.32
const notes = [
  { freq: 1174.66, start: 0.0, duration: 0.4 },  // D6
  { freq: 1479.98, start: 0.25, duration: 0.4 }, // F#6
  { freq: 1760.00, start: 0.50, duration: 0.4 }, // A6
  { freq: 2349.32, start: 0.75, duration: 0.8 }, // D7 (apex note)
  { freq: 1760.00, start: 1.20, duration: 0.4 }, // A6
  { freq: 1479.98, start: 1.45, duration: 0.4 }, // F#6
  { freq: 1174.66, start: 1.70, duration: 3.2 }  // D6 (long 3s crystal decay sustain)
];

for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  let signal = 0;

  notes.forEach((note) => {
    if (t >= note.start && t < note.start + note.duration) {
      const noteT = t - note.start;

      // Exponential decay envelope matching iOS glass marimba
      const env = Math.exp(-4.5 * noteT);

      // Fundamental + glass metallic overtone (2.76x frequency ratio for marimba timbre)
      const fundamental = Math.sin(2 * Math.PI * note.freq * noteT);
      const overtone = Math.sin(2 * Math.PI * note.freq * 2.76 * noteT) * 0.25;

      signal += (fundamental + overtone) * env * 0.35;
    }
  });

  signal = Math.max(-1, Math.min(1, signal));
  const sample16 = Math.floor(signal * 32767);
  pcmBuffer.writeInt16LE(sample16, i * 2);
}

// WAV Header
function createWavHeader(dataByteLength) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataByteLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);  // PCM
  header.writeUInt16LE(1, 22);  // Mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataByteLength, 40);
  return header;
}

const header = createWavHeader(pcmBuffer.length);
const wavBuffer = Buffer.concat([header, pcmBuffer]);

const outDir = path.resolve('public/sounds');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'iphone-notification.mp3'), wavBuffer);
console.log('Successfully generated public/sounds/iphone-notification.mp3 (5.0s iPhone crystal chime)');
