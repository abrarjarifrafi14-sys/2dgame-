/**
 * Title Screen with Bespoke SVG Lockup, Atmospheric World Pan, and Single Flat Control Hint
 */

import React from 'react';
import { Play, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../game/audio';

interface TitleScreenProps {
  onStart: () => void;
  onOpenGodotGuide: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onOpenGodotGuide,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-10 pointer-events-none select-none">
      {/* Top Bar / Mute toggle */}
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0f172a]/80 border border-[#38bdf8]/30 pointer-events-auto">
          {/* Mini Godot logo badge */}
          <svg className="w-5 h-5 text-[#478cbf]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm-5 7c.83 0 1.5.67 1.5 1.5S7.83 15 7 15s-1.5-.67-1.5-1.5S6.17 12 7 12zm10 0c.83 0 1.5.67 1.5 1.5S17.83 15 17 15s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-5 6c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" />
          </svg>
          <span className="text-xs font-mono tracking-wider text-[#38bdf8] uppercase">Godot 4 Engine Spec</span>
        </div>

        <button
          onClick={onToggleMute}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0f172a]/80 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition pointer-events-auto cursor-pointer"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          <span className="text-xs font-mono">{isMuted ? 'MUTED' : 'AUDIO ON'}</span>
        </button>
      </div>

      {/* Hero Centerpiece / Bespoke Title Lockup */}
      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto text-center my-auto">
        {/* Bespoke inline SVG Title Lockup */}
        <div className="relative mb-6">
          <svg className="w-72 sm:w-96 md:w-[460px] h-auto drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]" viewBox="0 0 500 120" fill="none">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#478cbf" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
              <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {/* Hexagon icon emblem */}
            <path d="M50 20 L80 35 L80 75 L50 90 L20 75 L20 35 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="3" />
            <circle cx="50" cy="55" r="14" fill="#478cbf" />
            <circle cx="44" cy="52" r="3" fill="#ffffff" />
            <circle cx="56" cy="52" r="3" fill="#ffffff" />
            <rect x="42" y="60" width="16" height="3" rx="1.5" fill="#ffffff" />

            {/* Typography */}
            <text x="110" y="58" fontFamily="monospace" fontSize="48" fontWeight="900" fill="url(#titleGrad)" letterSpacing="2">
              GODOT QUEST
            </text>
            <text x="112" y="88" fontFamily="monospace" fontSize="16" fontWeight="700" fill="#94a3b8" letterSpacing="6">
              CYBER SENTINEL 2D
            </text>
          </svg>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 pointer-events-auto">
          <button
            onClick={() => {
              sound.playSlash(1);
              onStart();
            }}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-lg bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-mono font-bold tracking-wider text-base shadow-[0_0_25px_rgba(14,165,233,0.5)] hover:shadow-[0_0_35px_rgba(14,165,233,0.8)] active:scale-95 transition cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>START GAME (SPACE)</span>
          </button>

          <button
            onClick={onOpenGodotGuide}
            className="flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#0f172a]/90 hover:bg-[#1e293b] border border-[#478cbf]/60 hover:border-cyan-400 text-[#38bdf8] hover:text-white font-mono font-semibold tracking-wide text-sm transition cursor-pointer shadow-lg"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>কীভাবে Godot দিয়ে বানাবেন? (GUIDE)</span>
          </button>
        </div>
      </div>

      {/* Single Flat Control-Hint Line */}
      <div className="flex justify-center items-center w-full pb-2">
        <p className="text-xs sm:text-sm font-mono tracking-wider text-slate-400 bg-[#0f172a]/80 px-4 py-1.5 rounded-full border border-slate-800">
          <span className="text-cyan-300 font-bold">WASD / Arrows</span> Move ·{' '}
          <span className="text-cyan-300 font-bold">Space / K</span> Jump ·{' '}
          <span className="text-cyan-300 font-bold">J / Click</span> Attack ·{' '}
          <span className="text-cyan-300 font-bold">Shift</span> Dash ·{' '}
          <span className="text-cyan-300 font-bold">Esc</span> Pause
        </p>
      </div>
    </div>
  );
};
