export class AudioSystem {
    constructor() {
        this.audioCtx = null;
        this.masterGain = null;
        this.cleanNode = null;
        this.humNode = null;
        this.isInit = false;
    }

    init() {
        if (this.isInit) return;
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = 0.25;
        this.masterGain.connect(this.audioCtx.destination);

        // Noise Buffer for cleaning sound
        const b = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate * 2, this.audioCtx.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

        this.cleanNode = { src: this.audioCtx.createBufferSource(), gain: this.audioCtx.createGain(), filter: this.audioCtx.createBiquadFilter() };
        this.cleanNode.src.buffer = b;
        this.cleanNode.src.loop = true;
        this.cleanNode.filter.frequency.value = 800;
        this.cleanNode.gain.gain.value = 0;
        this.cleanNode.src.connect(this.cleanNode.filter);
        this.cleanNode.filter.connect(this.cleanNode.gain);
        this.cleanNode.gain.connect(this.masterGain);
        this.cleanNode.src.start();

        // Hum Oscillator
        this.humNode = { osc: this.audioCtx.createOscillator(), gain: this.audioCtx.createGain() };
        this.humNode.osc.type = 'sawtooth';
        this.humNode.osc.frequency.value = 60;
        this.humNode.gain.gain.value = 0;
        this.humNode.osc.connect(this.humNode.gain);
        this.humNode.gain.connect(this.masterGain);
        this.humNode.osc.start();

        this.isInit = true;
    }

    resume() {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    setSound(active, intensity, cleanedPercentage, combo) {
        if (!this.cleanNode) return;
        const t = this.audioCtx.currentTime;
        if (active) {
            const pitch = 1000 + (cleanedPercentage * 60) + (combo * 500);
            this.cleanNode.gain.gain.setTargetAtTime(0.8, t, 0.1);
            this.cleanNode.filter.frequency.setTargetAtTime(pitch, t, 0.1);
            this.humNode.gain.gain.setTargetAtTime(0.2, t, 0.1);
            this.humNode.osc.frequency.setTargetAtTime(60 + (intensity * 50), t, 0.1);
        } else {
            this.cleanNode.gain.gain.setTargetAtTime(0, t, 0.1);
            this.humNode.gain.gain.setTargetAtTime(0, t, 0.1);
        }
    }

    sfx(type) {
        if (!this.audioCtx) return;
        const t = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        osc.connect(g); g.connect(this.masterGain);

        if (type === 'nova') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(50, t); osc.frequency.exponentialRampToValueAtTime(1000, t + 0.5);
            g.gain.setValueAtTime(1, t); g.gain.exponentialRampToValueAtTime(0.01, t + 1.0);
            osc.start(t); osc.stop(t + 1.0);
        } else if (type === 'coin') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(1200, t); osc.frequency.exponentialRampToValueAtTime(3000, t + 0.1);
            g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            osc.start(t); osc.stop(t + 0.3);
        } else if (type === 'drone') {
            osc.type = 'square'; osc.frequency.setValueAtTime(800, t);
            g.gain.setValueAtTime(0.05, t); g.gain.linearRampToValueAtTime(0, t + 0.1);
            osc.start(t); osc.stop(t + 0.1);
        } else if (type === 'win') {
            [523, 659, 784, 1046].forEach((f, i) => {
                const o = this.audioCtx.createOscillator(); const gl = this.audioCtx.createGain();
                o.connect(gl); gl.connect(this.masterGain); o.type = 'triangle'; o.frequency.value = f;
                gl.gain.setValueAtTime(0.1, t + i * 0.1); gl.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
                o.start(t + i * 0.1); o.stop(t + 1.5);
            });
        } else if (type === 'glitch') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, t);
            osc.frequency.linearRampToValueAtTime(50, t + 0.2);
            g.gain.setValueAtTime(0.5, t);
            g.gain.linearRampToValueAtTime(0, t + 0.2);
            osc.start(t); osc.stop(t + 0.2);
        }
    }
}
