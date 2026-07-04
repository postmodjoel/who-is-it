// ===================== Sound: a tiny synthesised audio layer (no asset files) =====================
// Everything is generated live with the Web Audio API - simple chiptune-ish blips for SFX plus a few
// looping generative background tracks. Exposed as window.Sound. Nothing plays until a user gesture
// unlocks the AudioContext (browsers require it), which app.js wires on first click.
(function () {
  let ctx = null, master = null, musicBus = null, sfxBus = null;
  let enabled = true;              // master on/off (SFX + music)
  let musicOn = false;
  let track = 1;                   // index into TRACKS (0 = none)
  let musicTimer = null, step = 0;

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

  // One enveloped oscillator note.
  function tone(freq, dur, o) {
    o = o || {};
    const c = ac(); if (!c || !enabled) return;
    const osc = c.createOscillator(); osc.type = o.type || "square"; osc.frequency.value = freq;
    const g = c.createGain(); const t = c.currentTime; const vol = o.vol != null ? o.vol : 0.5;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.slide), t + dur);
    osc.connect(g); g.connect(o.bus || sfxBus);
    osc.start(t); osc.stop(t + dur + 0.03);
  }
  function noise(dur, o) {
    o = o || {};
    const c = ac(); if (!c || !enabled) return;
    const n = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, n, c.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = c.createBufferSource(); src.buffer = buf;
    const g = c.createGain(); g.gain.value = o.vol != null ? o.vol : 0.4;
    const f = c.createBiquadFilter(); f.type = o.filter || "highpass"; f.frequency.value = o.freq || 1200;
    src.connect(f); f.connect(g); g.connect(o.bus || sfxBus); src.start();
  }
  const seq = (notes, gap, fn) => notes.forEach((v, i) => setTimeout(() => fn(v, i), i * gap));

  // Named sound effects - the game's palette. Kept short and bright.
  const SFX = {
    click:     () => tone(680, 0.05, { type: "square", vol: 0.3 }),
    blip:      () => tone(920, 0.07, { type: "triangle", vol: 0.4 }),
    pop:       () => { tone(500, 0.05, { type: "square", vol: 0.4, slide: 900 }); },
    eliminate: () => tone(340, 0.2, { type: "sawtooth", vol: 0.5, slide: 90 }),
    revive:    () => tone(360, 0.2, { type: "triangle", vol: 0.45, slide: 960 }),
    reveal:    () => seq([523, 659, 784, 1047], 70, (f) => tone(f, 0.28, { type: "triangle", vol: 0.36 })),
    win:       () => seq([523, 659, 784, 1047, 1319], 65, (f) => tone(f, 0.16, { type: "square", vol: 0.4 })),
    lose:      () => seq([440, 370, 311, 262], 90, (f) => tone(f, 0.18, { type: "sawtooth", vol: 0.4 })),
    baby:      () => seq([784, 988, 1319], 80, (f) => tone(f, 0.13, { type: "triangle", vol: 0.42 })),
    slap:      () => { noise(0.11, { vol: 0.6, filter: "bandpass", freq: 1800 }); tone(200, 0.09, { type: "square", vol: 0.35, slide: 70 }); },
    coin:      () => { tone(988, 0.06, { type: "square", vol: 0.4 }); setTimeout(() => tone(1319, 0.13, { type: "square", vol: 0.4 }), 55); },
    magic:     () => { for (let i = 0; i < 7; i++) setTimeout(() => tone(560 + i * 150, 0.06, { type: "triangle", vol: 0.3 }), i * 38); },
    boom:      () => { noise(0.32, { vol: 0.55, filter: "lowpass", freq: 900 }); tone(70, 0.3, { type: "sine", vol: 0.5, slide: 40 }); },
    honk:      () => tone(180, 0.22, { type: "sawtooth", vol: 0.4 }),
    laugh:     () => seq([440, 392, 440, 392, 349], 70, (f) => tone(f, 0.09, { type: "square", vol: 0.35 })),
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

  // ===================== Music: the lo-bit lounge engine =====================
  // 16-step bars over an 8-chord progression (a full lap is 8 bars, so the loop breathes), with a
  // light lo-bit drum kit (kick = sine drop, snare = bandpass hiss, hat = ticked highpass noise)
  // and AUTHORED melody phrases (two alternating 2-bar sentences, call-and-response) instead of a
  // wallpapered arpeggio. Melody notes are chord-degree indices (negative = octave down, +10 = up
  // an octave on degree n-10, null = rest).
  function kick(vol) {
    const c = ac(); if (!c || !enabled) return;
    const o = c.createOscillator(); o.type = "sine";
    const g = c.createGain(); const t = c.currentTime;
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.09);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 0.14);
  }
  const snare = (vol) => noise(0.09, { vol, filter: "bandpass", freq: 2400, bus: musicBus });
  const hat = (vol) => noise(0.03, { vol, filter: "highpass", freq: 7500, bus: musicBus });

  // Shared drum patterns (16 steps): a lounge brush kit and a lo-bit kit with more bounce.
  const DRUMS = {
    brush: { k: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], s: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0.6], h: [0.5, 0, 1, 0, 0.5, 0, 1, 0, 0.5, 0, 1, 0, 0.5, 0, 1, 0.4] },
    lobit: { k: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0], s: [0, 0, 0, 0, 1, 0, 0, 0.4, 0, 0, 0, 0, 1, 0, 0, 0], h: [1, 0, 0.5, 0, 1, 0, 0.5, 0.3, 1, 0, 0.5, 0, 1, 0, 0.5, 0.5] },
    sparse: { k: [1, 0, 0, 0, 0, 0, 0, 0, 0.7, 0, 0, 0, 0, 0, 0, 0], s: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], h: [0, 0, 0.6, 0, 0, 0, 0.6, 0, 0, 0, 0.6, 0, 0, 0, 0.6, 0] }
  };
  // Bass patterns (16 steps): degree index into the chord, or "5th"/null.
  const BASS = {
    lounge: [0, null, null, null, null, null, 1, null, 0, null, null, null, 2, null, null, null],
    walk: [0, null, null, 1, null, null, 2, null, 3, null, null, 2, null, null, 1, null],
    pump: [0, null, 0, null, null, null, 0, null, 0, null, 0, null, null, null, 1, null]
  };
  // Two-bar melodic sentences (32 slots). A plays on bars 0-1 & 4-5; B answers on 2-3 & 6-7.
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
      name: "🕹️ Arcade Lounge", bpm: 106, lead: "square", leadVol: 0.16, bass: "triangle", drums: DRUMS.lobit, bassPat: BASS.pump,
      prog: [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65], [57, 60, 64, 69], [50, 53, 57, 60], [55, 58, 62, 65], [52, 55, 59, 62], [55, 59, 62, 65]],
      melA: [0, null, 1, null, 2, null, 3, null, 12, null, null, null, 3, null, 2, null, 1, null, null, null, 2, null, 1, null, 0, null, null, null, null, null, -1, null],
      melB: [12, null, null, 11, null, null, 13, null, 12, null, 11, null, 10, null, null, null, 3, null, null, 2, null, null, 1, null, 2, null, null, null, null, null, null, null]
    },
    {
      name: "🌙 Night Drive", bpm: 100, lead: "triangle", bass: "sine", drums: DRUMS.lobit, bassPat: BASS.lounge,
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
  function stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }
  function startMusic() {
    stopMusic();
    const T = TRACKS[track]; if (!T || !T.prog || !enabled) return;
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
      if (!enabled || !musicOn) { stopMusic(); return; }
      const bar = Math.floor(step / 16) % T.prog.length;
      const chord = T.prog[bar];
      const s = step % 16;
      // Drums: light, looped, and quiet enough to sit under the table talk.
      if (T.drums.k[s]) kick(0.5 * T.drums.k[s]);
      if (T.drums.s[s]) snare(0.14 * T.drums.s[s]);
      if (T.drums.h[s]) hat(0.05 * T.drums.h[s]);
      // Bass: patterned, an octave down, slightly longer than the grid so it breathes.
      const bassDeg = T.bassPat[s];
      if (bassDeg != null) tone(mtof(chord[bassDeg % chord.length] - 12), sixteenth / 1000 * 2.4, { type: T.bass, vol: 0.42, bus: musicBus });
      // Melody: sentence A for two bars, sentence B answers for two - so the phrase only repeats
      // every 4 bars, over an 8-bar progression: the full loop is ~30-45s, not 8s.
      const sentence = (Math.floor(bar / 2) % 2 === 0) ? T.melA : T.melB;
      const mel = sentence[(bar % 2) * 16 + s];
      const note = degNote(chord, mel);
      if (note != null) tone(mtof(note), sixteenth / 1000 * 1.7, { type: T.lead, vol: T.leadVol || 0.26, bus: musicBus });
      step++;
    }, sixteenth);
  }
  // Title groove: just bass and drums - a two-bar lo-bit pocket that vamps under the menu.
  let titleTimer = null, titleStep = 0;
  function stopTitleLoop() { if (titleTimer) { clearInterval(titleTimer); titleTimer = null; } }
  function startTitleLoop() {
    stopTitleLoop();
    if (!enabled) return;
    ac();
    const bpm = 96, sixteenth = 15000 / bpm;
    const bassLine = [33, null, null, 33, null, null, 36, null, 33, null, null, 31, null, null, 28, null,
      33, null, null, 33, null, null, 36, null, 38, null, 36, null, 33, null, 31, null];
    const k = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0];
    const h = [1, 0, 0.5, 0, 1, 0, 0.5, 0, 1, 0, 0.5, 0, 1, 0, 0.5, 0.4];
    const sPat = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0];
    titleStep = 0;
    titleTimer = setInterval(() => {
      if (!enabled) { stopTitleLoop(); return; }
      const s = titleStep % 16;
      if (k[s]) kick(0.5);
      if (sPat[s]) snare(0.12);
      if (h[s]) hat(0.045 * h[s]);
      const b = bassLine[titleStep % 32];
      if (b != null) tone(mtof(b), sixteenth / 1000 * 2.2, { type: "triangle", vol: 0.44, bus: musicBus });
      titleStep++;
    }, sixteenth);
  }

  window.Sound = {
    resume() { ac(); },
    isEnabled: () => enabled,
    setEnabled(v) { enabled = !!v; if (!enabled) stopMusic(); else if (musicOn) startMusic(); },
    play(name) { const f = SFX[name]; if (f) { try { f(); } catch (e) { /* audio blocked */ } } },
    sfxNames: () => Object.keys(SFX),
    trackNames: () => TRACKS.map((t) => t.name),
    currentTrack: () => track,
    isMusicOn: () => musicOn && track > 0,
    setTrack(i) { track = Math.max(0, Math.min(TRACKS.length - 1, i | 0)); if (musicOn && track > 0) startMusic(); else stopMusic(); },
    setMusic(on) { musicOn = !!on; if (musicOn && track > 0) { stopTitleLoop(); startMusic(); } else stopMusic(); },
    // The title-screen groove (bass + drums only). Suppressed while real music is playing.
    titleLoop(on) { if (on && !(musicOn && track > 0)) startTitleLoop(); else stopTitleLoop(); },
    spinTicks(durationMs, fromGap, toGap) { ac(); return spinTicks(durationMs, fromGap, toGap); }
  };
})();
