/**
 * Ambient Audio Engine using Web Audio API
 * Generates procedural relaxing soundscapes and provides real-time frequency analysis.
 */

export interface SoundscapeTrack {
  id: string;
  title: string;
  subtitle: string;
  mood: string;
  bpm: number;
  baseFrequency: number;
  scale: number[];
  color: string;
}

export const SOUNDSCAPE_TRACKS: SoundscapeTrack[] = [
  {
    id: 'aurora-borealis',
    title: 'Aurora Borealis',
    subtitle: 'Ethereal ambient chords & celestial shimmer',
    mood: 'Cosmic & Serene',
    bpm: 54,
    baseFrequency: 110, // A2
    scale: [0, 2, 4, 7, 9, 12, 14, 16], // Pentatonic
    color: '#06b6d4',
  },
  {
    id: 'twilight-sanctuary',
    title: 'Twilight Sanctuary',
    subtitle: 'Warm lo-fi electric chords & gentle sub-bass',
    mood: 'Peaceful & Reflective',
    bpm: 60,
    baseFrequency: 130.81, // C3
    scale: [0, 3, 5, 7, 10, 12, 15], // Minor pentatonic + 9th
    color: '#8b5cf6',
  },
  {
    id: 'mountain-mist',
    title: 'Mountain Rain & Mist',
    subtitle: 'Gentle environmental rain textures & resonant bells',
    mood: 'Organic & Meditative',
    bpm: 48,
    baseFrequency: 146.83, // D3
    scale: [0, 4, 7, 11, 14, 18], // Major 7/9
    color: '#10b981',
  },
  {
    id: 'midnight-nebula',
    title: 'Midnight Nebula',
    subtitle: 'Deep spatial drone with pulsing harmonics',
    mood: 'Deep Focus & Atmospheric',
    bpm: 40,
    baseFrequency: 98, // G2
    scale: [0, 5, 7, 12, 17, 19], // Open fifths
    color: '#3b82f6',
  },
];

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isPlaying = false;
  private currentTrackIndex = 0;
  private timer: number | null = null;
  private noiseNode: AudioNode | null = null;
  private activeVoices: { osc: OscillatorNode; gain: GainNode }[] = [];

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.85;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrack(): SoundscapeTrack {
    return SOUNDSCAPE_TRACKS[this.currentTrackIndex];
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, vol));
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  public async play(trackIndex?: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (trackIndex !== undefined && trackIndex >= 0 && trackIndex < SOUNDSCAPE_TRACKS.length) {
      this.currentTrackIndex = trackIndex;
    }

    this.isPlaying = true;
    this.stopVoices();
    this.startAmbientDrones();
    this.startMelodicSequencer();
  }

  public pause() {
    this.isPlaying = false;
    this.stopVoices();
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  public toggle(trackIndex?: number): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play(trackIndex);
      return true;
    }
  }

  public nextTrack(): SoundscapeTrack {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % SOUNDSCAPE_TRACKS.length;
    if (this.isPlaying) {
      this.play();
    }
    return this.getCurrentTrack();
  }

  private stopVoices() {
    this.activeVoices.forEach(({ osc, gain }) => {
      try {
        if (this.ctx) {
          gain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.2);
          setTimeout(() => {
            try {
              osc.stop();
              osc.disconnect();
              gain.disconnect();
            } catch {
              // ignore
            }
          }, 300);
        }
      } catch {
        // ignore
      }
    });
    this.activeVoices = [];

    if (this.noiseNode) {
      try {
        this.noiseNode.disconnect();
      } catch {
        // ignore
      }
      this.noiseNode = null;
    }
  }

  private startAmbientDrones() {
    if (!this.ctx || !this.masterGain) return;
    const track = SOUNDSCAPE_TRACKS[this.currentTrackIndex];

    // Base drone
    const droneFreqs = [track.baseFrequency, track.baseFrequency * 1.5, track.baseFrequency * 2];

    droneFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450 + idx * 200, this.ctx.currentTime);

      // Gentle LFO filter sweep
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.08 + idx * 0.04, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(150, this.ctx.currentTime);
      lfo.connect(filter.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.setTargetAtTime(0.12 / (idx + 1), this.ctx.currentTime, 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      this.activeVoices.push({ osc, gain });
    });

    // Optional subtle rain/mist sound for track 3
    if (track.id === 'mountain-mist') {
      this.createPinkNoiseMist();
    }
  }

  private createPinkNoiseMist() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.035; // quiet level
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
    this.noiseNode = whiteNoise;
  }

  private startMelodicSequencer() {
    if (this.timer) {
      window.clearInterval(this.timer);
    }

    const track = SOUNDSCAPE_TRACKS[this.currentTrackIndex];
    const intervalMs = Math.round((60000 / track.bpm) * 2); // Slow, spaced intervals

    this.timer = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      // Play 1 or 2 soft notes from pentatonic scale
      const noteOffset = track.scale[Math.floor(Math.random() * track.scale.length)];
      const octave = Math.random() > 0.6 ? 2 : 1;
      const freq = track.baseFrequency * Math.pow(2, (noteOffset + octave * 12) / 12);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 3.5);

      setTimeout(() => {
        try {
          osc.disconnect();
          filter.disconnect();
          gain.disconnect();
        } catch {
          // ignore
        }
      }, 3700);

    }, intervalMs);
  }
}

export const ambientAudio = new AmbientAudioEngine();
