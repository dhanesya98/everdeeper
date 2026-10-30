/**
 * EVER DEEPER II: Audio Synthesizer Engine (Web Audio API)
 * Procedural SFX & Ambient Dark Fantasy Soundtrack
 */

window.GameAudio = (function() {
  let ctx = null;
  let isMuted = false;
  let masterGain = null;
  let sfxGain = null;
  let musicGain = null;
  let ambientOsc1 = null;
  let ambientOsc2 = null;
  let ambientLfo = null;
  let isAmbientPlaying = false;
  let battleTimer = null;
  let inBattle = false;

  function init() {
    if (ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    ctx = new AudioContext();

    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;

    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.7;
    sfxGain.connect(masterGain);

    musicGain = ctx.createGain();
    musicGain.gain.value = 0.35;
    musicGain.connect(masterGain);

    masterGain.connect(ctx.destination);
  }

  function resume() {
    if (!ctx) init();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  function setMuted(muted) {
    isMuted = muted;
    if (masterGain && ctx) {
      masterGain.gain.setValueAtTime(isMuted ? 0 : 0.5, ctx.currentTime);
    }
  }

  // --- PROCEDURAL SFX GENERATORS ---

  // Footstep on dungeon stone
  function playFootstep() {
    if (isMuted || !ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    const baseFreq = 70 + Math.random() * 25;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Sword slash / Blade swing
  function playSlash() {
    if (isMuted || !ctx) return;
    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.08);
    filter.Q.value = 2.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain);

    noise.start(now);
  }

  // Heavy Impact / Crushing Blow
  function playHeavyImpact() {
    if (isMuted || !ctx) return;
    const now = ctx.currentTime;
    
    // Sub bass drop
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

    oscGain.gain.setValueAtTime(0.6, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(oscGain);
    oscGain.connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.36);

    // Punchy noise crunch
    playSlash();
  }

  // STANCE BREAK (Iconic heavy shattering sound!)
  function playStanceBreak() {
    if (isMuted || !ctx) return;
    const now = ctx.currentTime;

    // Resonant glass/armor crack
    [520, 780, 1040, 1400].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.02);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.4);

      gain.gain.setValueAtTime(0.3, now + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(sfxGain);
      osc.start(now + idx * 0.02);
      osc.stop(now + 0.45);
    });

    // Deep boom
    playHeavyImpact();
  }

  // Shield Parry / Block clang
  function playShieldBlock() {
    if (isMuted || !ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Fireball cast & explosion
  function playFireball() {
    if (isMuted || !ctx) return;
    const now = ctx.currentTime;
    
    // Whoosh
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.linearRampToValueAtTime(900, now + 0.15);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain);
    noise.start(now);
  }

  // Magic Cast / Sun Beam
  function playMagicBeam() {
    if (isMuted || !ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  // Potion Drink / Heal Chime
  function playHeal() {
    if (isMuted || !ctx) return;
    const now = ctx.currentTime;
    const notes = [392.00, 493.88, 587.33, 783.99]; // G, B, D, G
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(sfxGain);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.45);
    });
  }

  // Chest Open / Item Picked
  function playChestOpen() {
    if (isMuted || !ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A, C#, E, A
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.2, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(sfxGain);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.35);
    });
  }

  // Monster Hurt / Death
  function playMonsterHurt() {
    if (isMuted || !ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Destructible Pot / Urn Break Sound
  function playPotBreak() {
    if (isMuted || !ctx) return;
    const now = ctx.currentTime;

    // Ceramic shatter noise
    const bufferSize = ctx.sampleRate * 0.18;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.Q.value = 3.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain);
    noise.start(now);

    // Resonant ring
    const osc = ctx.createOscillator();
    const oGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);
    oGain.gain.setValueAtTime(0.2, now);
    oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(oGain);
    oGain.connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Staircase Descent Rumbling
  function playStairDescend() {
    if (isMuted || !ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.8);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.82);
  }

  // Level-Up Boon Selection Chime (Angelic / Radiant)
  function playBoonSelect() {
    if (isMuted || !ctx) return;
    const now = ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.25, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.6);

      osc.connect(gain);
      gain.connect(sfxGain);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.65);
    });
  }

  // Shimmering Loot Beam Chime
  function playLootBeam() {
    if (isMuted || !ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 0.2);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  // --- AMBIENT SOUNDTRACK & BATTLE BEATS ---

  function startAmbientDrone() {
    if (!ctx || isAmbientPlaying) return;
    isAmbientPlaying = true;
    const now = ctx.currentTime;

    // Deep sub drone (C2 = 65.4 Hz & G1 = 49 Hz)
    ambientOsc1 = ctx.createOscillator();
    ambientOsc1.type = 'sine';
    ambientOsc1.frequency.setValueAtTime(65.4, now);

    ambientOsc2 = ctx.createOscillator();
    ambientOsc2.type = 'triangle';
    ambientOsc2.frequency.setValueAtTime(49.0, now);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, now);

    // LFO for slow breathing drone
    ambientLfo = ctx.createOscillator();
    ambientLfo.frequency.setValueAtTime(0.12, now); // 8 second cycle
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(40, now);
    ambientLfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);

    ambientOsc1.connect(filter);
    ambientOsc2.connect(filter);
    filter.connect(gain);
    gain.connect(musicGain);

    ambientOsc1.start(now);
    ambientOsc2.start(now);
    ambientLfo.start(now);
  }

  // Battle rhythm generator (procedural dark bass pulse)
  function startBattleMusic() {
    inBattle = true;
    if (battleTimer) clearInterval(battleTimer);

    let step = 0;
    const bassline = [45, 45, 52, 45, 48, 45, 40, 43]; // Deep menacing pulse

    battleTimer = setInterval(() => {
      if (isMuted || !ctx || !inBattle) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      const freq = bassline[step % bassline.length];
      osc.type = (step % 4 === 0) ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime((step % 2 === 0) ? 220 : 130, now);

      gain.gain.setValueAtTime((step % 4 === 0) ? 0.28 : 0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(musicGain);

      osc.start(now);
      osc.stop(now + 0.23);

      step++;
    }, 240); // ~125 BPM pulsing tempo
  }

  function stopBattleMusic() {
    inBattle = false;
    if (battleTimer) {
      clearInterval(battleTimer);
      battleTimer = null;
    }
  }

  return {
    init,
    resume,
    setMuted,
    isMuted: () => isMuted,
    playFootstep,
    playSlash,
    playHeavyImpact,
    playStanceBreak,
    playShieldBlock,
    playFireball,
    playMagicBeam,
    playHeal,
    playChestOpen,
    playMonsterHurt,
    playPotBreak,
    playStairDescend,
    playBoonSelect,
    playLootBeam,
    startAmbientDrone,
    startBattleMusic,
    stopBattleMusic
  };
})();
