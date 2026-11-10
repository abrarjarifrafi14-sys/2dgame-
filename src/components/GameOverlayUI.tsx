/**
 * Low-Occlusion World-Matched HUD Overlay (>= 85% Unobstructed playfield)
 * Pure pointer-events-none container with perimeter status clusters and tabular-nums
 */

import React from 'react';
import { GameMetrics } from '../game/types';
import { Pause, Volume2, VolumeX, Sparkles, BookOpen } from 'lucide-react';

interface GameOverlayUIProps {
  metrics: GameMetrics;
  dashPct: number;
  onPause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenGodotGuide: () => void;
}

export const GameOverlayUI: React.FC<GameOverlayUIProps> = ({
  metrics,
  dashPct,
  onPause,
  isMuted,
  onToggleMute,
  onOpenGodotGuide,
}) => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none p-4 sm:p-6 flex flex-col justify-between select-none">
      {/* Top Perimeter Cluster */}
      <div className="flex justify-between items-start w-full">
        {/* Top-Left: Player Stats & Dash Cooldown */}
        <div className="flex flex-col gap-2">
          {/* Status Capsule */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#0f172a]/85 border border-[#38bdf8]/30 shadow-lg">
            {/* Player Class Icon */}
            <div className="w-8 h-8 rounded bg-[#1e293b] flex items-center justify-center border border-[#38bdf8]/50">
              <svg className="w-5 h-5 text-[#38bdf8]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm-5 7c.83 0 1.5.67 1.5 1.5S7.83 15 7 15s-1.5-.67-1.5-1.5S6.17 12 7 12zm10 0c.83 0 1.5.67 1.5 1.5S17.83 15 17 15s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-5 6c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" />
              </svg>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Godot Knight</span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold tabular-nums">
                  SCORE: {metrics.score.toLocaleString()}
                </span>
              </div>

              {/* Dash Energy Gauge */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-mono text-slate-400 uppercase">DASH</span>
                <div className="w-24 h-2 bg-[#1e293b] rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-sky-300 transition-all duration-75"
                    style={{ width: `${Math.round((1 - dashPct) * 100)}%` }}
                  />
                </div>
                {dashPct <= 0 && <span className="text-[9px] font-mono text-cyan-300 font-bold">READY</span>}
              </div>
            </div>
          </div>

          {/* Active Combo Multiplier Badge */}
          {metrics.combo > 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#f59e0b]/90 border border-amber-300 shadow-md text-[#0f172a] font-mono font-black text-xs w-max animate-bounce">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="tabular-nums">{metrics.combo}x COMBO!</span>
            </div>
          )}
        </div>

        {/* Top-Right: Collectible Cores & Boss Tracker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#0f172a]/85 border border-[#38bdf8]/30 shadow-lg">
            {/* Godot Core Diamond Icon */}
            <div className="w-5 h-5 bg-[#0284c7] rotate-45 flex items-center justify-center border border-cyan-300 shadow-[0_0_8px_rgba(56,189,248,0.6)]">
              <div className="w-2 h-2 bg-white -rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">Nodes Collected</span>
              <span className="text-sm font-mono font-bold text-cyan-300 tabular-nums">
                {metrics.coresCollected} / {metrics.totalCores}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Perimeter Cluster */}
      <div className="flex justify-between items-end w-full">
        {/* Bottom-Left: Godot GDScript Guide Quick Access */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onOpenGodotGuide}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0f172a]/90 hover:bg-[#1e293b] border border-[#478cbf] text-cyan-300 hover:text-white text-xs font-mono font-semibold transition cursor-pointer shadow-lg active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-[#38bdf8]" />
            <span>Godot গাইড ও কোড (GDScript)</span>
          </button>
        </div>

        {/* Bottom-Right: Audio Mute & Pause */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-lg bg-[#0f172a]/90 hover:bg-[#1e293b] border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 transition cursor-pointer shadow-lg active:scale-95"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onPause}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0f172a]/90 hover:bg-[#1e293b] border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white text-xs font-mono font-semibold transition cursor-pointer shadow-lg active:scale-95"
          >
            <Pause className="w-4 h-4 text-cyan-400" />
            <span>PAUSE (ESC)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
