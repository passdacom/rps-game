// simple Web Audio API wrapper for sound effects
class AudioEngine {
    private ctx: AudioContext | null = null;

    private init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    private playTone(frequency: number, type: OscillatorType, duration: number = 0.1, vol: number = 0.1) {
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

        gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    public playCountdown() {
        // Beep
        this.playTone(440, 'sine', 0.1, 0.1);
    }

    public playShoot() {
        // Higher pitch beep
        this.playTone(880, 'square', 0.2, 0.15);
    }

    public playWin() {
        // Triumphant chord (arpeggio)
        this.playTone(523.25, 'triangle', 0.3, 0.15); // C5
        setTimeout(() => this.playTone(659.25, 'triangle', 0.3, 0.15), 100); // E5
        setTimeout(() => this.playTone(783.99, 'triangle', 0.5, 0.15), 200); // G5
    }

    public playLose() {
        // Dissonant descending
        this.playTone(300, 'sawtooth', 0.4, 0.15);
        setTimeout(() => this.playTone(250, 'sawtooth', 0.4, 0.15), 150);
    }

    public playDraw() {
        // Neutral blip
        this.playTone(400, 'sine', 0.2, 0.1);
        setTimeout(() => this.playTone(400, 'sine', 0.2, 0.1), 100);
    }
}

export const audio = new AudioEngine();
