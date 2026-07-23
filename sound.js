// ===================== Sound: a tiny synthesised audio layer (no asset files) =====================
// Everything is generated live with the Web Audio API: compact UI cues plus a few restrained,
// generative background tracks. Exposed as window.Sound. Nothing plays until a user gesture
// unlocks the AudioContext (browsers require it), which app.js wires on first click.
(function () {
  let ctx = null, master = null, musicBus = null, sfxBus = null;
  let enabled = true;              // sound FX on/off (music is governed by musicOn alone)
  let musicOn = false;
  let track = 1;                   // index into TRACKS (0 = none)
  let musicTimer = null, step = 0;
  const activePads = new Set();

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.85; master.connect(ctx.destination);
      musicBus = ctx.createGain(); musicBus.gain.value = 0.22; musicBus.connect(master);
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.55; sfxBus.connect(master);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // One enveloped, optionally filtered oscillator note. Notes routed to an explicit bus (music passes
  // bus: musicBus) bypass the SFX toggle - `enabled` silences effects only, never the music.
  function tone(freq, dur, o) {
    o = o || {};
    const c = ac(); if (!c || (!enabled && !o.bus)) return;
    const osc = c.createOscillator(); osc.type = o.type || "triangle"; osc.frequency.value = freq;
    if (o.detune) osc.detune.value = o.detune;
    const g = c.createGain(); const t = c.currentTime; const vol = o.vol != null ? o.vol : 0.5;
    const attack = Math.max(0.004, Math.min(dur * 0.45, o.attack != null ? o.attack : 0.006));
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.slide), t + dur);
    if (o.filter) {
      const f = c.createBiquadFilter(); f.type = o.filter; f.frequency.value = o.freq || 1800;
      if (o.q != null) f.Q.value = o.q;
      osc.connect(f); f.connect(g);
    } else {
      osc.connect(g);
    }
    g.connect(o.bus || sfxBus);
    osc.start(t); osc.stop(t + dur + 0.03);
  }
  function noise(dur, o) {
    o = o || {};
    const c = ac(); if (!c || (!enabled && !o.bus)) return;
    const n = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, n, c.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = c.createBufferSource(); src.buffer = buf;
    const g = c.createGain(); g.gain.value = o.vol != null ? o.vol : 0.4;
    const f = c.createBiquadFilter(); f.type = o.filter || "highpass"; f.frequency.value = o.freq || 1200;
    src.connect(f); f.connect(g); g.connect(o.bus || sfxBus); src.start();
  }
  const seq = (notes, gap, fn) => notes.forEach((v, i) => setTimeout(() => fn(v, i), i * gap));

  // Named sound effects - still playful, but rounded enough not to fight the background music.
  const SFX = {
    click:     () => tone(680, 0.055, { type: "sine", vol: 0.28 }),
    blip:      () => tone(920, 0.07, { type: "triangle", vol: 0.4 }),
    pop:       () => { tone(500, 0.07, { type: "sine", vol: 0.4, slide: 900 }); },
    eliminate: () => tone(340, 0.22, { type: "triangle", vol: 0.5, slide: 90, filter: "lowpass", freq: 1200 }),
    revive:    () => tone(360, 0.2, { type: "triangle", vol: 0.45, slide: 960 }),
    reveal:    () => seq([523, 659, 784, 1047], 70, (f) => tone(f, 0.28, { type: "triangle", vol: 0.36 })),
    win:       () => seq([523, 659, 784, 1047, 1319], 72, (f) => tone(f, 0.22, { type: "triangle", vol: 0.35, filter: "lowpass", freq: 2600 })),
    lose:      () => seq([440, 370, 311, 262], 105, (f) => tone(f, 0.24, { type: "triangle", vol: 0.38, filter: "lowpass", freq: 1100 })),
    baby:      () => seq([784, 988, 1319], 80, (f) => tone(f, 0.13, { type: "triangle", vol: 0.42 })),
    slap:      () => { noise(0.11, { vol: 0.6, filter: "bandpass", freq: 1800 }); tone(200, 0.1, { type: "sine", vol: 0.35, slide: 70 }); },
    coin:      () => { tone(988, 0.08, { type: "sine", vol: 0.4 }); setTimeout(() => tone(1319, 0.18, { type: "triangle", vol: 0.34 }), 65); },
    magic:     () => { for (let i = 0; i < 7; i++) setTimeout(() => tone(560 + i * 150, 0.06, { type: "triangle", vol: 0.3 }), i * 38); },
    boom:      () => { noise(0.32, { vol: 0.55, filter: "lowpass", freq: 900 }); tone(70, 0.3, { type: "sine", vol: 0.5, slide: 40 }); },
    honk:      () => tone(180, 0.22, { type: "sawtooth", vol: 0.4 }),
    laugh:     () => seq([440, 392, 440, 392, 349], 76, (f) => tone(f, 0.11, { type: "triangle", vol: 0.32 })),
    ding:      () => { tone(1319, 0.4, { type: "triangle", vol: 0.4 }); tone(1976, 0.4, { type: "triangle", vol: 0.18 }); },
    buzzer:    () => { tone(150, 0.35, { type: "sawtooth", vol: 0.42 }); tone(158, 0.35, { type: "sawtooth", vol: 0.3 }); },
    sparkle:   () => seq([1568, 1760, 2093, 2637], 45, (f) => tone(f, 0.1, { type: "triangle", vol: 0.28 })),
    fart:      () => { tone(120, 0.28, { type: "sawtooth", vol: 0.4, slide: 70 }); noise(0.28, { vol: 0.2, filter: "lowpass", freq: 400 }); },
    tick:      () => tone(2100, 0.016, { type: "square", vol: 0.22 }),
    trash:     () => { noise(0.2, { vol: 0.42, filter: "bandpass", freq: 1000 }); tone(320, 0.14, { type: "sawtooth", vol: 0.3, slide: 90 }); setTimeout(() => { noise(0.1, { vol: 0.3, filter: "lowpass", freq: 500 }); tone(110, 0.12, { type: "square", vol: 0.35, slide: 60 }); }, 150); }
  };
  // Spinner ticks: fire the tick SFX with a gap that eases from `fromGap` to `toGap` over `durationMs`,
  // so a decelerating wheel ticks fast then slow (or pass equal gaps for a constant spin). Returns a
  // canceller. Guards against Date/perf being unavailable by using a running accumulator.
  function spinTicks(durationMs, fromGap, toGap) {
    if (!enabled) return function () {};
    fromGap = fromGap || 40; toGap = toGap || 40;
    let elapsed = 0, cancelled = false;
    const step = () => {
      if (cancelled || elapsed >= durationMs) return;
      if (SFX.tick) { try { SFX.tick(); } catch (e) { /* blocked */ } }
      const p = Math.min(1, elapsed / durationMs);
      const gap = fromGap + (toGap - fromGap) * (p * p);   // quadratic ease so it slows near the end
      elapsed += gap;
      setTimeout(step, gap);
    };
    step();
    return function () { cancelled = true; };
  }

  // ===================== Music: minimal late-night loop engine =====================
  // 16-step bars travel through a 24-bar form before repeating, with a soft drum kit, filtered bass,
  // slow chord beds and authored melodic sentences. At 84-106 BPM, a lap lasts roughly 54-69 seconds.
  // and AUTHORED melody phrases (two alternating 2-bar sentences, call-and-response) instead of a
  // wallpapered arpeggio. Melody notes are chord-degree indices (negative = octave down, +10 = up
  // an octave on degree n-10, null = rest).
  function kick(vol) {
    const c = ac(); if (!c) return;   // music-only voice (always on musicBus) - not gated by the SFX toggle
    const o = c.createOscillator(); o.type = "sine";
    const g = c.createGain(); const t = c.currentTime;
    o.frequency.setValueAtTime(115, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 0.2);
  }
  const snare = (vol) => noise(0.12, { vol, filter: "bandpass", freq: 1800, bus: musicBus });
  const hat = (vol) => noise(0.045, { vol, filter: "highpass", freq: 6200, bus: musicBus });

  // A low-passed chord breathes underneath two bars at a time. Slight detuning keeps the generated
  // oscillators from feeling like a stack of sterile beeps.
  function pad(chord, dur, vol) {
    const c = ac(); if (!c) return;
    const t = c.currentTime; const attack = Math.min(0.55, dur * 0.18); const release = Math.min(1.1, dur * 0.3);
    chord.slice(0, 3).forEach((midi, i) => {
      const osc = c.createOscillator(); osc.type = i === 1 ? "triangle" : "sine";
      osc.frequency.value = mtof(midi - 12); osc.detune.value = (i - 1) * 4;
      const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 1050; f.Q.value = 0.35;
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.055, t + attack);
      g.gain.setValueAtTime(vol || 0.055, Math.max(t + attack, t + dur - release));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const voice = { osc, gain: g };
      activePads.add(voice); osc.onended = () => activePads.delete(voice);
      osc.connect(f); f.connect(g); g.connect(musicBus); osc.start(t); osc.stop(t + dur + 0.05);
    });
  }
  function fadePads() {
    if (!ctx) { activePads.clear(); return; }
    const t = ctx.currentTime;
    activePads.forEach(({ osc, gain }) => {
      try {
        if (typeof gain.gain.cancelAndHoldAtTime === "function") gain.gain.cancelAndHoldAtTime(t);
        else { gain.gain.cancelScheduledValues(t); gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), t); }
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
        osc.stop(t + 0.1);
      } catch (e) { /* voice already ended */ }
    });
    activePads.clear();
  }

  // Shared drum patterns (16 steps): brushed, pulsed and sparse; all intentionally leave open space.
  const DRUMS = {
    brush: { k: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], s: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0.6], h: [0.5, 0, 1, 0, 0.5, 0, 1, 0, 0.5, 0, 1, 0, 0.5, 0, 1, 0.4] },
    pulse: { k: [1, 0, 0, 0, 0, 0, 0.65, 0, 0, 0, 0.8, 0, 0, 0, 0, 0], s: [0, 0, 0, 0, 0.7, 0, 0, 0, 0, 0, 0, 0, 0.7, 0, 0, 0], h: [0.45, 0, 0, 0, 0.3, 0, 0, 0, 0.45, 0, 0, 0, 0.3, 0, 0, 0] },
    sparse: { k: [1, 0, 0, 0, 0, 0, 0, 0, 0.7, 0, 0, 0, 0, 0, 0, 0], s: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], h: [0, 0, 0.6, 0, 0, 0, 0.6, 0, 0, 0, 0.6, 0, 0, 0, 0.6, 0] }
  };
  // Bass patterns (16 steps): degree index into the chord, or "5th"/null.
  const BASS = {
    lounge: [0, null, null, null, null, null, 1, null, 0, null, null, null, 2, null, null, null],
    walk: [0, null, null, 1, null, null, 2, null, 3, null, null, 2, null, null, 1, null],
    pump: [0, null, 0, null, null, null, 0, null, 0, null, 0, null, null, null, 1, null]
  };
  // The 8-chord palette takes three related routes before returning to bar one.
  const LONG_FORM = [0, 1, 2, 3, 4, 5, 6, 7, 0, 2, 1, 3, 5, 4, 6, 7, 0, 1, 2, 3, 4, 6, 5, 7];
  // Two-bar melodic sentences (32 slots); the middle section thins and shifts them for variation.
  const TRACKS = [
    { name: "🔇 None" },
    {
      name: "🎹 Lounge", bpm: 94, lead: "sine", bass: "sine", drums: DRUMS.brush, bassPat: BASS.walk,
      prog: [[57, 60, 64, 67], [55, 59, 62, 65], [53, 57, 60, 64], [55, 58, 62, 65], [57, 60, 64, 67], [52, 55, 59, 62], [53, 57, 60, 64], [55, 59, 62, 66]],
      melA: [2, null, null, 3, null, null, 2, null, 1, null, null, null, null, null, 0, null, 2, null, 3, null, 12, null, null, null, 3, null, 2, null, null, null, null, null],
      melB: [null, null, 1, null, 2, null, null, null, 3, null, 2, null, 1, null, null, null, 0, null, null, null, 1, null, 2, null, null, null, 3, null, 2, null, 1, null]
    },
    {
      name: "🛗 Elevator", bpm: 84, lead: "sine", bass: "triangle", drums: DRUMS.sparse, bassPat: BASS.lounge,
      prog: [[60, 64, 67, 71], [57, 60, 64, 69], [59, 62, 65, 69], [60, 64, 67, 72], [58, 62, 65, 69], [57, 60, 64, 69], [55, 59, 62, 67], [60, 64, 67, 71]],
      melA: [0, null, null, null, 1, null, null, null, 2, null, null, null, null, null, null, null, 3, null, null, 2, null, null, 1, null, null, null, null, null, null, null, null, null],
      melB: [null, null, 2, null, null, null, 3, null, null, null, 12, null, null, null, null, null, 2, null, 1, null, null, null, 0, null, null, null, null, null, null, null, null, null]
    },
    {
      name: "◌ After Hours", bpm: 106, lead: "triangle", leadVol: 0.14, bass: "sine", drums: DRUMS.pulse, bassPat: BASS.pump,
      prog: [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65], [57, 60, 64, 69], [50, 53, 57, 60], [55, 58, 62, 65], [52, 55, 59, 62], [55, 59, 62, 65]],
      melA: [0, null, 1, null, 2, null, 3, null, 12, null, null, null, 3, null, 2, null, 1, null, null, null, 2, null, 1, null, 0, null, null, null, null, null, -1, null],
      melB: [12, null, null, 11, null, null, 13, null, 12, null, 11, null, 10, null, null, null, 3, null, null, 2, null, null, 1, null, 2, null, null, null, null, null, null, null]
    },
    {
      name: "🌙 Night Drive", bpm: 100, lead: "triangle", bass: "sine", drums: DRUMS.pulse, bassPat: BASS.lounge,
      prog: [[45, 52, 57, 60], [48, 55, 60, 64], [43, 50, 55, 59], [45, 52, 57, 60], [41, 48, 53, 57], [48, 55, 60, 64], [43, 50, 55, 59], [45, 52, 57, 62]],
      melA: [null, null, 12, null, null, 13, null, null, 12, null, 11, null, null, null, null, null, 10, null, null, 11, null, null, 12, null, null, null, null, null, null, null, null, null],
      melB: [13, null, null, null, 12, null, null, null, 11, null, 12, null, 10, null, null, null, null, null, 1, null, 2, null, 3, null, 2, null, null, null, null, null, null, null]
    },
    {
      name: "📼 Hold Music", bpm: 96, lead: "sine", bass: "triangle", drums: DRUMS.brush, bassPat: BASS.lounge,
      prog: [[62, 66, 69, 73], [60, 64, 67, 71], [59, 62, 66, 69], [57, 61, 64, 69], [62, 66, 69, 73], [64, 67, 71, 74], [59, 62, 66, 69], [62, 66, 69, 71]],
      melA: [3, null, null, null, 2, null, 3, null, 12, null, null, null, null, null, null, null, 2, null, null, null, 1, null, 2, null, 3, null, null, null, null, null, null, null],
      melB: [null, null, 12, null, null, null, 13, null, 12, null, null, null, 3, null, null, null, 2, null, 3, null, 2, null, 1, null, 0, null, null, null, null, null, null, null]
    }
  ];
  function stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; fadePads(); } }
  function startMusic() {
    stopMusic();
    const T = TRACKS[track]; if (!T || !T.prog || !musicOn) return;
    ac();
    const sixteenth = 15000 / T.bpm;   // ms per 16th note
    step = 0;
    const degNote = (chord, d) => {
      if (d == null) return null;
      if (d < 0) return chord[0] + 12 * d;              // -1 => root an octave down
      if (d >= 10) return chord[(d - 10) % chord.length] + 12;
      return chord[d % chord.length];
    };
    musicTimer = setInterval(() => {
      if (!musicOn) { stopMusic(); return; }
      const form = T.form || LONG_FORM;
      const bar = Math.floor(step / 16) % form.length;
      const chord = T.prog[form[bar] % T.prog.length];
      const s = step % 16;
      // Pads only change every two bars, keeping the harmony present without wallpapering the room.
      if (s === 0 && bar % 2 === 0) pad(chord, sixteenth / 1000 * 32.5, T.padVol || 0.048);
      if (T.drums.k[s]) kick(0.38 * T.drums.k[s]);
      if (T.drums.s[s]) snare(0.1 * T.drums.s[s]);
      if (T.drums.h[s]) hat(0.035 * T.drums.h[s]);
      // Bass: filtered, patterned and long enough to overlap the rigid grid a little.
      const bassDeg = T.bassPat[s];
      if (bassDeg != null) tone(mtof(chord[bassDeg % chord.length] - 12), sixteenth / 1000 * 2.8, { type: T.bass, vol: 0.3, bus: musicBus, attack: 0.025, filter: "lowpass", freq: 520 });
      // Melody: the second eight-bar section drops alternating gestures and sits an octave lower on
      // selected notes; the final section returns to the recognisable phrase.
      const sentence = (Math.floor(bar / 2) % 2 === 0) ? T.melA : T.melB;
      const section = Math.floor(bar / 8);
      let mel = sentence[(bar % 2) * 16 + s];
      if (section === 1 && (s % 8) < 4) mel = null;
      else if (section === 1 && mel != null && mel >= 10) mel -= 10;
      const note = degNote(chord, mel);
      if (note != null) tone(mtof(note), sixteenth / 1000 * 2.05, { type: T.lead, vol: T.leadVol || 0.19, bus: musicBus, attack: 0.028, filter: "lowpass", freq: T.leadFilter || 2100 });
      step++;
    }, sixteenth);
  }
  // Receipt printer: stuttered dot-matrix zips (saw buzz + hiss in chunks) ending in a paper tear.
  function printerNoise(durationMs) {
    if (!enabled) return;
    ac();
    let t = 0;
    const CHUNK = 150;
    const burst = () => {
      if (!enabled) return;
      if (t >= durationMs) {
        noise(0.14, { vol: 0.35, filter: "highpass", freq: 2600 });   // rrrip - the tear-off
        return;
      }
      tone(1850 + ((t / CHUNK) % 3) * 160, 0.085, { type: "sawtooth", vol: 0.13 });
      noise(0.08, { vol: 0.2, filter: "bandpass", freq: 5200 });
      t += CHUNK;
      setTimeout(burst, CHUNK);
    };
    burst();
  }

  // Credits: a slow 16-bar reprise with muted plucks, soft pads and a brushed pulse.
  let creditsTimer = null, creditsStep = 0;
  function stopCreditsLoop() { if (creditsTimer) { clearInterval(creditsTimer); creditsTimer = null; fadePads(); } }
  function startCreditsLoop() {
    stopCreditsLoop();
    if (!musicOn) return;
    ac();
    const bpm = 86, sixteenth = 15000 / bpm;
    // C6 - A7 - Dm7 - G7, stretched through a 16-bar form before it returns.
    const PROG = [[60, 64, 67, 69], [57, 61, 64, 67], [50, 53, 57, 62], [55, 59, 62, 65]];
    const FORM = [0, 1, 2, 3, 0, 2, 1, 3, 0, 1, 2, 3, 0, 2, 3, 1];
    const PLUCK = [0, null, null, null, null, 1, null, null, 3, null, null, null, null, 12, null, null];
    const shaker = [0.35, 0, 0, 0, 0.25, 0, 0, 0, 0.35, 0, 0, 0, 0.25, 0, 0, 0];
    creditsStep = 0;
    creditsTimer = setInterval(() => {
      if (!musicOn) { stopCreditsLoop(); return; }
      const bar = Math.floor(creditsStep / 16) % FORM.length;
      const chord = PROG[FORM[bar]];
      const s = creditsStep % 16;
      if (s === 0 && bar % 2 === 0) pad(chord, sixteenth / 1000 * 32.5, 0.05);
      if (s === 0) kick(0.22);
      if (shaker[s]) hat(0.035 * shaker[s]);
      if (s === 8) noise(0.09, { vol: 0.035, filter: "bandpass", freq: 2600, bus: musicBus });
      const d = PLUCK[s];
      if (d != null) {
        const note = d >= 10 ? chord[(d - 10) % chord.length] + 12 : chord[d % chord.length];
        tone(mtof(note), sixteenth / 1000 * 2, { type: "triangle", vol: 0.18, bus: musicBus, attack: 0.035, filter: "lowpass", freq: 1800 });
      }
      if (s === 0 || s === 10) tone(mtof(chord[0] - 12), sixteenth / 1000 * 2.9, { type: "sine", vol: 0.28, bus: musicBus, attack: 0.03, filter: "lowpass", freq: 480 });
      creditsStep++;
    }, sixteenth);
  }

  // Title groove: a sparse 16-bar pulse. It establishes atmosphere without a short audible reset.
  let titleTimer = null, titleStep = 0;
  function stopTitleLoop() { if (titleTimer) { clearInterval(titleTimer); titleTimer = null; fadePads(); } }
  function startTitleLoop() {
    stopTitleLoop();
    if (!musicOn) return;
    ac();
    const bpm = 96, sixteenth = 15000 / bpm;
    const chords = [[45, 52, 57, 60], [48, 55, 60, 64], [43, 50, 55, 59], [41, 48, 53, 57]];
    const form = [0, 0, 1, 1, 2, 2, 0, 0, 3, 3, 1, 1, 2, 2, 0, 0];
    const bassPat = [0, null, null, null, null, null, 1, null, 0, null, null, null, 2, null, null, null];
    const k = [1, 0, 0, 0, 0, 0, 0.7, 0, 0, 0, 0.65, 0, 0, 0, 0, 0];
    const h = [0.35, 0, 0, 0, 0.22, 0, 0, 0, 0.35, 0, 0, 0, 0.22, 0, 0, 0];
    const sPat = [0, 0, 0, 0, 0.65, 0, 0, 0, 0, 0, 0, 0, 0.65, 0, 0, 0];
    titleStep = 0;
    titleTimer = setInterval(() => {
      if (!musicOn) { stopTitleLoop(); return; }
      const bar = Math.floor(titleStep / 16) % form.length;
      const chord = chords[form[bar]];
      const s = titleStep % 16;
      if (s === 0 && bar % 2 === 0) pad(chord, sixteenth / 1000 * 32.5, 0.045);
      if (k[s]) kick(0.32 * k[s]);
      if (sPat[s]) snare(0.075 * sPat[s]);
      if (h[s]) hat(0.03 * h[s]);
      const degree = bassPat[s];
      if (degree != null) tone(mtof(chord[degree] - 24), sixteenth / 1000 * 3, { type: "sine", vol: 0.26, bus: musicBus, attack: 0.035, filter: "lowpass", freq: 460 });
      titleStep++;
    }, sixteenth);
  }

  window.Sound = {
    resume() { ac(); },
    isEnabled: () => enabled,
    setEnabled(v) { enabled = !!v; },   // SFX only - music runs on its own toggle
    play(name) { const f = SFX[name]; if (f) { try { f(); } catch (e) { /* audio blocked */ } } },
    sfxNames: () => Object.keys(SFX),
    trackNames: () => TRACKS.map((t) => t.name),
    trackInfo: () => TRACKS.map((t, i) => ({
      name: t.name,
      bpm: t.bpm || null,
      bars: i === 0 ? 0 : (t.form || LONG_FORM).length,
      loopSeconds: i === 0 ? 0 : Math.round(((t.form || LONG_FORM).length * 4 * 60 / t.bpm) * 10) / 10,
      lead: t.lead || null
    })),
    loopInfo: () => ({ title: { bars: 16, bpm: 96, loopSeconds: 40 }, credits: { bars: 16, bpm: 86, loopSeconds: 44.7 } }),
    currentTrack: () => track,
    isMusicOn: () => musicOn && track > 0,
    setTrack(i) { track = Math.max(0, Math.min(TRACKS.length - 1, i | 0)); if (musicOn && track > 0) startMusic(); else stopMusic(); },
    setMusic(on) { musicOn = !!on; if (musicOn && track > 0) { stopTitleLoop(); startMusic(); } else { stopMusic(); if (!musicOn) { stopTitleLoop(); stopCreditsLoop(); } } },
    // The title-screen groove (bass + drums only). Suppressed while real music is playing; silent
    // entirely when the music toggle is off.
    titleLoop(on) { if (on && musicOn && !(track > 0)) startTitleLoop(); else stopTitleLoop(); },
    // Tiki lounge under the end-of-session credits (pauses any other loop).
    creditsLoop(on) { stopTitleLoop(); if (on) { stopMusic(); startCreditsLoop(); } else { stopCreditsLoop(); if (musicOn && track > 0) startMusic(); } },
    printer(durationMs) { ac(); printerNoise(durationMs || 1500); },
    spinTicks(durationMs, fromGap, toGap) { ac(); return spinTicks(durationMs, fromGap, toGap); }
  };
})();
