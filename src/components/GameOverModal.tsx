/**
 * Game Over Modal for Godot Quest
 */

import React from 'react';
import { RotateCcw, Home, BookOpen, AlertTriangle } from 'lucide-react';
import { GameMetrics } from '../game/types';

interface GameOverModalProps {
  metrics: GameMetrics;
  onRestart: () => void;
  onReturnTitle: () => void;
  onOpenGodotGuide: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  metrics,
  onRestart,
  onReturnTitle,
  onOpenGodotGuide,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-none select-none">
      <div className="relative w-full max-w-md bg-[#0f172a] border border-rose-500/40 rounded-xl p-6 sm:p-8 shadow-[0_0_50px_rgba(244,63,94,0.3)] flex flex-col items-center text-center">
        {/* Warning Badge */}
        <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-600 flex items-center justify-center mb-4 text-rose-500 shadow-lg">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-mono font-black text-rose-500 tracking-wider mb-2">
          SYSTEM CRASH
        </h2>
        <p className="text-xs font-mono text-slate-400 mb-6">
          Knight Unit Desynchronized. Node Core memory lost.
        </p>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6 p-4 rounded-lg bg-[#161b26] border border-slate-800 font-mono text-left">
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Final Score</div>
            <div className="text-lg font-bold text-white tabular-nums">{metrics.score.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Nodes Collected</div>
            <div className="text-lg font-bold text-cyan-400 tabular-nums">
              {metrics.coresCollected} / {metrics.totalCores}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Enemies Defeated</div>
            <div className="text-lg font-bold text-amber-400 tabular-nums">{metrics.enemiesDefeated}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Max Combo</div>
            <div className="text-lg font-bold text-emerald-400 tabular-nums">{metrics.combo}x</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-mono font-bold tracking-wider text-sm transition cursor-pointer shadow-lg active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESPAWN &amp; RETRY</span>
          </button>

          <button
            onClick={onOpenGodotGuide}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#161b26] hover:bg-[#1e293b] border border-[#478cbf]/60 text-cyan-300 font-mono font-semibold text-xs transition cursor-pointer active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-[#38bdf8]" />
            <span>Godot গাইড ও কোড দেখুন</span>
          </button>

          <button
            onClick={onReturnTitle}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#131822] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-mono text-xs transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>TITLE SCREEN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
