// A small original melody generated with the Web Audio API.
// Used when there is no song.mp3 next to the page.

const N = {
  F2: 87.31, G2: 98, A2: 110, C3: 130.81,
  F3: 174.61, G3: 196, A3: 220, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5,
};

const MELODY = [
  ['E5', 1], ['G5', 1], ['A5', 1], ['G5', 1],
  ['E5', 1], ['D5', 1], ['C5', 2],
  ['D5', 1], ['E5', 1], ['G5', 1], ['E5', 1],
  ['D5', 1], ['C5', 1], ['D5', 2],
  ['E5', 1], ['G5', 1], ['A5', 1], ['C6', 1],
  ['A5', 1], ['G5', 1], ['E5', 2],
  ['D5', 1], ['E5', 1], ['D5', 1], ['C5', 1],
  ['C5', 4],
];

// One chord per bar: [bass, arpeggio notes]
const CHORDS = [
  ['C3', ['C4', 'E4', 'G4']],
  ['A2', ['A3', 'C4', 'E4']],
  ['F2', ['F3', 'A3', 'C4']],
  ['G2', ['G3', 'B3', 'D4']],
  ['C3', ['C4', 'E4', 'G4']],
  ['A2', ['A3', 'C4', 'E4']],
  ['G2', ['G3', 'B3', 'D4']],
  ['C3', ['C4', 'E4', 'G4']],
];

const BPM = 84;
const SPB = 60 / BPM;
const LOOP_BEATS = 32;
const ARP_PATTERN = [0, 1, 2, 1, 0, 1, 2, 1];

const EVENTS = (() => {
  const ev = [];
  let beat = 0;
  MELODY.forEach(([n, d]) => {
    ev.push({ beat, f: N[n], d, type: 'triangle', vol: 0.15 });
    beat += d;
  });
  CHORDS.forEach(([bass, arp], bar) => {
    ev.push({ beat: bar * 4, f: N[bass], d: 4, type: 'sine', vol: 0.2 });
    ARP_PATTERN.forEach((p, i) => {
      ev.push({ beat: bar * 4 + i * 0.5, f: N[arp[p]], d: 0.5, type: 'sine', vol: 0.055 });
    });
  });
  ev.sort((a, b) => a.beat - b.beat);
  return ev;
})();

export function createSynth() {
  let ctx = null;
  let master = null;
  let analyser = null;
  let data = null;
  let timer = null;
  let idx = 0;
  let loopStart = 0;
  let volume = 0.8;

  function tone(f, t, dur, type, vol) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function tick() {
    while (loopStart + EVENTS[idx].beat * SPB < ctx.currentTime + 0.3) {
      const e = EVENTS[idx];
      tone(e.f, loopStart + e.beat * SPB, e.d * SPB + 0.3, e.type, e.vol);
      idx += 1;
      if (idx >= EVENTS.length) {
        idx = 0;
        loopStart += LOOP_BEATS * SPB;
      }
    }
  }

  function init() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) throw new Error('Web Audio is not supported');
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55 * volume;
    analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.78;
    data = new Uint8Array(analyser.frequencyBinCount);

    const delay = ctx.createDelay();
    delay.delayTime.value = 0.3;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    const wet = ctx.createGain();
    wet.gain.value = 0.3;

    master.connect(analyser);
    master.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(analyser);
    analyser.connect(ctx.destination);

    loopStart = ctx.currentTime + 0.1;
    idx = 0;
    timer = setInterval(tick, 100);
  }

  return {
    play() {
      if (!ctx) init();
      else ctx.resume();
    },
    pause() {
      if (ctx) ctx.suspend();
    },
    setVolume(v) {
      volume = v;
      if (master) master.gain.value = 0.55 * v;
    },
    getLevels(out) {
      if (!analyser) return false;
      analyser.getByteFrequencyData(data);
      for (let i = 0; i < out.length; i += 1) {
        const j = Math.min(data.length - 1, Math.floor((i / out.length) * data.length * 0.85));
        out[i] = data[j] / 255;
      }
      return true;
    },
    destroy() {
      clearInterval(timer);
      if (ctx) ctx.close();
      ctx = null;
    },
  };
}
