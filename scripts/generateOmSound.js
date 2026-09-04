import fs from 'fs';
import path from 'path';

// Generate a 6.5-second PCM WAV file with a deep, natural 136.1Hz "Aum / Om" vocal formant chant
const sampleRate = 44100;
const durationSec = 6.5;
const numSamples = Math.floor(sampleRate * durationSec);
const pcmBuffer = Buffer.alloc(numSamples * 2); // 16-bit mono

for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;

  // Envelope: 0.8s fade-in, steady 4.5s sustain, 1.2s smooth fade-out
  let env = 1.0;
  if (t < 0.8) {
    env = Math.sin((t / 0.8) * (Math.PI / 2));
  } else if (t > 5.3) {
    env = Math.sin(((6.5 - t) / 1.2) * (Math.PI / 2));
  }

  // 136.1 Hz Om Cosmic Fundamental + 0.5Hz subtle vocal vibrato
  const vibrato = Math.sin(2 * Math.PI * 4.5 * t) * 1.5;
  const f0 = 136.1 + vibrato;

  // Formant shift: "Aaaa" (0-1.8s) -> "Oooo/Uuuu" (1.8-4.2s) -> "Mmmm" (4.2-6.5s)
  let aWeight = 0, uWeight = 0, mWeight = 0;
  if (t < 2.0) {
    aWeight = Math.sin((t / 2.0) * Math.PI);
    uWeight = 1 - aWeight;
  } else if (t < 4.5) {
    uWeight = Math.sin(((t - 2.0) / 2.5) * Math.PI);
    mWeight = 1 - uWeight;
  } else {
    mWeight = 1.0;
  }

  // Harmonics calculation for human vocal tract simulation
  const h1 = Math.sin(2 * Math.PI * f0 * t);
  const h2 = Math.sin(2 * Math.PI * f0 * 2 * t) * (0.6 * aWeight + 0.3 * uWeight);
  const h3 = Math.sin(2 * Math.PI * f0 * 3 * t) * (0.4 * aWeight + 0.1 * mWeight);
  const h4 = Math.sin(2 * Math.PI * f0 * 4 * t) * (0.2 * aWeight);
  const h5 = Math.sin(2 * Math.PI * f0 * 5 * t) * (0.1 * aWeight);

  // Deep nasal resonance for 'Mmmm'
  const nasalResonance = Math.sin(2 * Math.PI * (f0 * 0.5) * t) * 0.15 * mWeight;

  let signal = (h1 + h2 + h3 + h4 + h5 + nasalResonance) * env * 0.45;
  signal = Math.max(-1, Math.min(1, signal));

  const sample16 = Math.floor(signal * 32767);
  pcmBuffer.writeInt16LE(sample16, i * 2);
}

// WAV Header Construction
function createWavHeader(dataByteLength) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataByteLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  header.writeUInt16LE(1, 22);  // NumChannels (1 mono)
  header.writeUInt32LE(sampleRate, 24); // SampleRate
  header.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  header.writeUInt16LE(2, 32);  // BlockAlign
  header.writeUInt16LE(16, 34); // BitsPerSample
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

fs.writeFileSync(path.join(outDir, 'om-notification.mp3'), wavBuffer);
console.log('Successfully generated public/sounds/om-notification.mp3 (6.5s vocal Om chant)');
