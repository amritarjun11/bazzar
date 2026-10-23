// Web Audio API engine sound synthesizer for realistic walkaround reel inspection

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timer: number | null = null;
  private gainNode: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playEngineSound(type: 'bike' | 'bullet' | 'gadget' = 'bike') {
    try {
      this.initCtx();
      if (!this.ctx) return;
      this.stop();

      this.isPlaying = true;
      const ctx = this.ctx;

      if (type === 'bullet') {
        // Deep 350cc single cylinder 4-stroke heavy thump rhythm
        let step = 0;
        this.timer = window.setInterval(() => {
          if (!this.isPlaying) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'triangle';
          // Low heavy bass thump around 55Hz - 85Hz
          const freq = step % 4 === 0 ? 82 : (step % 2 === 0 ? 65 : 48);
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.12);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(320, ctx.currentTime);

          gain.gain.setValueAtTime(0.35, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.16);
          step++;
        }, 180);
      } else if (type === 'bike') {
        // Smooth Honda Shine 125cc idle flutter
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(42, ctx.currentTime);

        // Low pass to simulate muffler exhaust note
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(260, ctx.currentTime);

        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        this.gainNode = gain;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();

        // Slight RPM flutter simulation
        let phase = 0;
        this.timer = window.setInterval(() => {
          if (!this.isPlaying || !this.gainNode) return;
          phase += 0.2;
          const subtleFreq = 42 + Math.sin(phase) * 3;
          osc.frequency.setValueAtTime(subtleFreq, ctx.currentTime);
        }, 100);
      } else {
        // Futuristic gadget diagnostic chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch {
      // Graceful fallback if audio context blocked
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
      } catch {
        // ignore
      }
      this.gainNode = null;
    }
  }

  playChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // ignore
    }
  }

  isAudioPlaying() {
    return this.isPlaying;
  }
}

export const audioEngine = new AudioEngine();
