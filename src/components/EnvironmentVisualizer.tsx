import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  SkipForward, 
  Maximize2, 
  Minimize2, 
  X, 
  Sparkles, 
  Sliders, 
  Radio, 
  Music2,
  Mountain,
  Compass
} from 'lucide-react';
import { ambientAudio, SOUNDSCAPE_TRACKS, SoundscapeTrack } from '../utils/ambientAudioVisuals';

interface EnvironmentVisualizerProps {
  // Can be controlled externally if requested
  isOpenExternally?: boolean;
  onCloseExternal?: () => void;
}

export const EnvironmentVisualizer: React.FC<EnvironmentVisualizerProps> = ({
  isOpenExternally = false,
  onCloseExternal,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<SoundscapeTrack>(SOUNDSCAPE_TRACKS[0]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState<boolean>(isOpenExternally);
  const [particleDensity, setParticleDensity] = useState<'calm' | 'luminous' | 'cosmic'>('luminous');
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sync external open state
  useEffect(() => {
    if (isOpenExternally) {
      setIsFullscreenOpen(true);
      if (!ambientAudio.getPlaying()) {
        ambientAudio.play();
        setIsPlaying(true);
        setCurrentTrack(ambientAudio.getCurrentTrack());
      }
    }
  }, [isOpenExternally]);

  const togglePlay = useCallback(() => {
    const nextState = ambientAudio.toggle();
    setIsPlaying(nextState);
    setCurrentTrack(ambientAudio.getCurrentTrack());
  }, []);

  const handleNextTrack = useCallback(() => {
    const next = ambientAudio.nextTrack();
    setCurrentTrack(next);
    setIsPlaying(true);
  }, []);

  const handleSelectTrack = useCallback((index: number) => {
    ambientAudio.play(index);
    setCurrentTrack(SOUNDSCAPE_TRACKS[index]);
    setIsPlaying(true);
  }, []);

  const handleToggleMute = useCallback(() => {
    if (isMuted) {
      ambientAudio.setVolume(volume);
      setIsMuted(false);
    } else {
      ambientAudio.setVolume(0);
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const handleVolumeChange = useCallback((newVol: number) => {
    setVolume(newVol);
    if (!isMuted) {
      ambientAudio.setVolume(newVol);
    }
  }, [isMuted]);

  const handleCloseFullscreen = useCallback(() => {
    setIsFullscreenOpen(false);
    onCloseExternal?.();
  }, [onCloseExternal]);

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenOpen) {
        handleCloseFullscreen();
      }
      if (e.code === 'Space' && isFullscreenOpen && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenOpen, handleCloseFullscreen, togglePlay]);

  // Canvas visual rendering loop
  useEffect(() => {
    if (!isFullscreenOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle system
    const count = particleDensity === 'calm' ? 60 : particleDensity === 'luminous' ? 120 : 200;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.8 + 0.6,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.7 - 0.2,
      alpha: Math.random() * 0.7 + 0.2,
      baseAlpha: Math.random() * 0.7 + 0.2,
      hueOffset: Math.random() * 60 - 30,
    }));

    const analyser = ambientAudio.getAnalyser();
    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : new Uint8Array(128);

    let time = 0;

    const render = () => {
      time += 0.016;

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Subtle resting animation when idle
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.sin(time * 2 + i * 0.1) * 8 + 12;
        }
      }

      // Calculate energy bands
      let bass = 0;
      for (let i = 0; i < 16; i++) bass += dataArray[i];
      bass = bass / 16 / 255;

      let mid = 0;
      for (let i = 16; i < 64; i++) mid += dataArray[i];
      mid = mid / 48 / 255;

      let treble = 0;
      for (let i = 64; i < 128; i++) treble += dataArray[i];
      treble = treble / 64 / 255;

      // Dark atmospheric gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#05070d');
      bgGrad.addColorStop(0.5, '#090e1a');
      bgGrad.addColorStop(1, '#0c1322');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 1. Aurora ribbons across upper atmosphere
      ctx.save();
      const auroraY = height * 0.35;
      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath();
        ctx.moveTo(0, auroraY);

        for (let x = 0; x <= width; x += 15) {
          const normX = x / width;
          const freqIndex = Math.floor(normX * 40) % dataArray.length;
          const freqBoost = (dataArray[freqIndex] / 255) * 60;

          const yOffset =
            Math.sin(normX * 4 + time * (0.8 + wave * 0.3) + wave) * (50 + bass * 40) +
            Math.cos(normX * 7 - time * 0.5) * 20 +
            freqBoost * (1 - wave * 0.2);

          ctx.lineTo(x, auroraY + yOffset + wave * 30);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const auroraGrad = ctx.createLinearGradient(0, 0, width, height * 0.6);
        if (currentTrack.id === 'aurora-borealis') {
          auroraGrad.addColorStop(0, `rgba(6, 182, 212, ${0.12 - wave * 0.03 + bass * 0.1})`);
          auroraGrad.addColorStop(0.5, `rgba(168, 85, 247, ${0.14 - wave * 0.03 + mid * 0.08})`);
          auroraGrad.addColorStop(1, `rgba(16, 185, 129, ${0.08 - wave * 0.02})`);
        } else if (currentTrack.id === 'twilight-sanctuary') {
          auroraGrad.addColorStop(0, `rgba(139, 92, 246, ${0.14 - wave * 0.03 + bass * 0.09})`);
          auroraGrad.addColorStop(0.5, `rgba(236, 72, 153, ${0.1 - wave * 0.02 + mid * 0.06})`);
          auroraGrad.addColorStop(1, `rgba(59, 130, 246, ${0.09 - wave * 0.02})`);
        } else if (currentTrack.id === 'mountain-mist') {
          auroraGrad.addColorStop(0, `rgba(16, 185, 129, ${0.14 - wave * 0.03 + bass * 0.1})`);
          auroraGrad.addColorStop(0.5, `rgba(45, 212, 191, ${0.1 - wave * 0.02 + mid * 0.07})`);
          auroraGrad.addColorStop(1, `rgba(14, 165, 233, ${0.08 - wave * 0.02})`);
        } else {
          auroraGrad.addColorStop(0, `rgba(59, 130, 246, ${0.15 - wave * 0.03 + bass * 0.1})`);
          auroraGrad.addColorStop(0.5, `rgba(99, 102, 241, ${0.12 - wave * 0.02 + mid * 0.08})`);
          auroraGrad.addColorStop(1, `rgba(147, 51, 234, ${0.09 - wave * 0.02})`);
        }

        ctx.fillStyle = auroraGrad;
        ctx.fill();
      }
      ctx.restore();

      // 2. Bioluminescent floating particle dust
      ctx.save();
      for (const p of particles) {
        p.y += p.vy * (1 + bass * 1.5);
        p.x += p.vx + Math.sin(time + p.y * 0.01) * 0.3;

        // Mouse proximity interaction
        const dx = p.x - cursorPos.x * width;
        const dy = p.y - cursorPos.y * height;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const force = (1 - dist / 140) * 2;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const currentAlpha = Math.min(1, p.baseAlpha + treble * 0.5);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + bass * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = currentTrack.color;
        ctx.globalAlpha = currentAlpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = currentTrack.color;
        ctx.fill();
      }
      ctx.restore();

      // 3. Horizon reflective water surface & soundwaves
      const horizonY = height * 0.68;
      ctx.save();

      // Horizon glow line
      const horizonGrad = ctx.createLinearGradient(0, horizonY, width, horizonY);
      horizonGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
      horizonGrad.addColorStop(0.5, currentTrack.color);
      horizonGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.strokeStyle = horizonGrad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();

      // Symmetrical Audio Spectrum Ribbon in the reflection
      const barCount = 64;
      const step = width / barCount;

      ctx.beginPath();
      for (let i = 0; i < barCount; i++) {
        const freqVal = (dataArray[i] / 255) * (70 + bass * 50);
        const x = i * step + step / 2;
        const yTop = horizonY - freqVal;

        if (i === 0) ctx.moveTo(x, yTop);
        else ctx.lineTo(x, yTop);
      }
      ctx.strokeStyle = currentTrack.color;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 12;
      ctx.shadowColor = currentTrack.color;
      ctx.stroke();

      // Reflection below horizon
      ctx.beginPath();
      for (let i = 0; i < barCount; i++) {
        const freqVal = (dataArray[i] / 255) * (45 + bass * 30);
        const x = i * step + step / 2;
        const yBottom = horizonY + freqVal * 0.7;

        if (i === 0) ctx.moveTo(x, yBottom);
        else ctx.lineTo(x, yBottom);
      }
      ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isFullscreenOpen, isPlaying, currentTrack, particleDensity, cursorPos]);

  // Track cursor position for interactive particle flow
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFullscreenOpen) return;
    setCursorPos({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
  };

  return (
    <>
      {/* 1. Compact Floating Dock in Bottom-Left Viewport */}
      <div 
        className="fixed bottom-6 left-6 z-40 hidden sm:flex items-center gap-3 p-2.5 rounded-2xl bg-white/90 dark:bg-[#111726]/90 backdrop-blur-xl border border-neutral-200/90 dark:border-[#1e293b] shadow-xl hover:shadow-2xl transition-all duration-300"
        aria-label="Ambient Music & Environment Visuals Player"
      >
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all duration-200 cursor-pointer shadow-md ${
            isPlaying 
              ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 ring-2 ring-blue-400/40' 
              : 'bg-neutral-800 hover:bg-neutral-900 dark:bg-slate-800 dark:hover:bg-slate-700'
          }`}
          title={isPlaying ? 'Pause ambient music' : 'Play ambient music & visuals'}
          aria-label={isPlaying ? 'Pause ambient music' : 'Play ambient music'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
        </button>

        {/* Track Title & Equalizer Bars */}
        <div className="flex flex-col pr-1 cursor-pointer" onClick={() => setIsFullscreenOpen(true)}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-900 dark:text-white leading-none">
              {currentTrack.title}
            </span>
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-blue-500 rounded-full animate-pulse h-3" />
                <span className="w-0.5 bg-cyan-400 rounded-full animate-pulse h-2" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 bg-indigo-500 rounded-full animate-pulse h-3.5" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">
            Environment Music · {isPlaying ? 'Playing' : 'Ready'}
          </span>
        </div>

        {/* Skip Track */}
        <button
          type="button"
          onClick={handleNextTrack}
          className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Next ambient soundscape"
          aria-label="Next track"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Mute/Unmute */}
        <button
          type="button"
          onClick={handleToggleMute}
          className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isMuted ? 'Unmute' : 'Mute'}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <div className="w-[1px] h-6 bg-neutral-200 dark:bg-slate-800 mx-0.5" />

        {/* Expand to Watch Fullscreen Environment Visuals */}
        <button
          type="button"
          onClick={() => setIsFullscreenOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Watch the Music in Environment Visuals (Fullscreen)"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Watch Visuals</span>
        </button>
      </div>

      {/* 2. Mobile Floating Indicator Button */}
      <button
        type="button"
        onClick={() => setIsFullscreenOpen(true)}
        className="fixed bottom-20 left-4 z-40 sm:hidden p-3 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center active:scale-95 cursor-pointer"
        aria-label="Open Music in Environment Visuals"
      >
        <Music2 className="w-5 h-5" />
      </button>

      {/* 3. Fullscreen "Watch the Music in Environment Visuals" Immersion Modal */}
      {isFullscreenOpen && (
        <div 
          className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden animate-in fade-in duration-300"
          onMouseMove={handleMouseMove}
          role="dialog"
          aria-modal="true"
          aria-label="Watch the Music in Environment Visuals Experience"
        >
          {/* Real-time Web Audio Reactive Canvas */}
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full pointer-events-none" 
          />

          {/* Top Bar Navigation & Controls */}
          <header className="relative z-10 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center backdrop-blur-md">
                <Sparkles className="w-5 h-5 text-cyan-300 animate-spin-slow" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                  Interactive Audiovisual Environment
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Watch The Music: Environment Visuals</span>
                  {isPlaying && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Reactive
                    </span>
                  )}
                </h2>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseFullscreen}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Close fullscreen visuals"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Center Stage: Atmosphere & Floating Soundwave Display */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
            <div className="max-w-xl mx-auto space-y-3 pointer-events-auto">
              <span className="text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-cyan-200">
                {currentTrack.mood}
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
                {currentTrack.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-300/90 max-w-md mx-auto leading-relaxed drop-shadow-sm">
                {currentTrack.subtitle}
              </p>
            </div>
          </div>

          {/* Bottom Dock: Track Switcher & Player Controls */}
          <footer className="relative z-10 p-4 sm:p-6 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Soundscape Track Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
              {SOUNDSCAPE_TRACKS.map((track, idx) => {
                const isActive = track.id === currentTrack.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => handleSelectTrack(idx)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer backdrop-blur-md ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400'
                        : 'bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Radio className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-200' : 'text-slate-400'}`} />
                    <span>{track.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Playback Controls & Particle Mode */}
            <div className="flex items-center gap-3">
              {/* Density toggle */}
              <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
                {(['calm', 'luminous', 'cosmic'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setParticleDensity(mode)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                      particleDensity === mode ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Main Play / Pause Button */}
              <button
                type="button"
                onClick={togglePlay}
                className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </button>

              {/* Skip Track */}
              <button
                type="button"
                onClick={handleNextTrack}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Next soundscape track"
                aria-label="Next track"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Volume Slider */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="text-slate-300 hover:text-white cursor-pointer"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 sm:w-24 accent-blue-500 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                  aria-label="Volume control"
                />
              </div>

            </div>

          </footer>
        </div>
      )}
    </>
  );
};
