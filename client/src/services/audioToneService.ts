/**
 * AudioToneService
 * Web Audio API synthesizer for call feedback tones.
 * Zero external audio files required.
 */

class AudioToneService {
  private ctx: AudioContext | null = null;
  private currentOscillators: OscillatorNode[] = [];
  private intervalId: any = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public stopAllTones(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Ignored
      }
    });
    this.currentOscillators = [];
  }

  /**
   * Play standard dual-tone outgoing ringback sound (440Hz + 480Hz, 2s on / 4s off)
   */
  public playRingbackTone(): void {
    this.stopAllTones();
    const ctx = this.getContext();

    const playBurst = () => {
      if (!this.ctx) return;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = 440;
      osc2.frequency.value = 480;

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 2.0);
      osc2.stop(ctx.currentTime + 2.0);

      this.currentOscillators = [osc1, osc2];
    };

    playBurst();
    this.intervalId = setInterval(playBurst, 4000);
  }

  /**
   * Play melodic repeating ringtone for incoming calls (E5 & G5 notes)
   */
  public playIncomingRingtone(): void {
    this.stopAllTones();
    const ctx = this.getContext();

    const playRingtoneCycle = () => {
      if (!this.ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';

      // Chime sequence
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc.frequency.setValueAtTime(659.25, now + 0.4); // E5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);

      this.currentOscillators = [osc];
    };

    playRingtoneCycle();
    this.intervalId = setInterval(playRingtoneCycle, 2500);
  }

  /**
   * Short pleasant chime on connection
   */
  public playConnectedTone(): void {
    this.stopAllTones();
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.15); // E5

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  /**
   * Low drop tone on call end
   */
  public playEndTone(): void {
    this.stopAllTones();
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now); // A4
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.3); // A3

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }
}

export const audioToneService = new AudioToneService();
