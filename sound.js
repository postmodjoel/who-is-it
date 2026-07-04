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

  // Background tracks: a bassline + arpeggio over a looping chord progression. `prog` is a list of
  // chords (arrays of MIDI notes); the scheduler walks 8th-notes across them.
  const TRACKS = [
    { name: "🔇 None" },
    { name: "🫧 Bubblegum", bpm: 116, prog: [[57, 60, 64], [62, 65, 69], [64, 67, 71], [60, 64, 67]], lead: "triangle", bass: "square" },
    { name: "🎹 Lounge",    bpm: 92,  prog: [[57, 60, 64, 67], [55, 59, 62, 65], [53, 57, 60, 64], [55, 58, 62, 65]], lead: "sine", bass: "sine" },
    { name: "🕹️ 8-bit Quest", bpm: 132, prog: [[45, 52, 57], [48, 55, 60], [50, 57, 62], [43, 50, 55]], lead: "square", bass: "square" },
    { name: "🛗 Elevator",  bpm: 84,  prog: [[60, 64, 67, 71], [57, 60, 64, 69], [59, 62, 65, 69], [60, 64, 67, 72]], lead: "sine", bass: "triangle" }
  ];
  function stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }
  function startMusic() {
    stopMusic();
    const T = TRACKS[track]; if (!T || !T.prog || !enabled) return;
    ac();
    const eighth = 30000 / T.bpm;      // ms per 8th note
    step = 0;
    musicTimer = setInterval(() => {
      if (!enabled || !musicOn) { stopMusic(); return; }
      const bar = Math.floor(step / 8) % T.prog.length;
      const chord = T.prog[bar];
      const s = step % 8;
      // Bass on beats 1 and 5; a gentle arpeggio climbing the chord on the off-beats.
      if (s === 0 || s === 4) tone(mtof(chord[0] - 12), eighth / 1000 * 1.6, { type: T.bass, vol: 0.5, bus: musicBus });
      const note = chord[s % chord.length] + (s >= 4 ? 12 : 0);
      tone(mtof(note), eighth / 1000 * 0.9, { type: T.lead, vol: 0.32, bus: musicBus });
      if (s === 6) tone(mtof(chord[(s + 1) % chord.length] + 12), eighth / 1000 * 0.7, { type: T.lead, vol: 0.2, bus: musicBus });
      step++;
    }, eighth);
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
    setMusic(on) { musicOn = !!on; if (musicOn && track > 0) startMusic(); else stopMusic(); },
    spinTicks(durationMs, fromGap, toGap) { ac(); return spinTicks(durationMs, fromGap, toGap); }
  };
})();
