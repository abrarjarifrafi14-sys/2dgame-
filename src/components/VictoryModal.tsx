/**
 * Victory Modal for Godot Quest
 */

import React from 'react';
import { Trophy, RotateCcw, Home, BookOpen, Star, Sparkles } from 'lucide-react';
import { GameMetrics } from '../game/types';

interface VictoryModalProps {
  metrics: GameMetrics;
  onRestart: () => void;
  onReturnTitle: () => void;
  onOpenGodotGuide: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  metrics,
  onRestart,
  onReturnTitle,
  onOpenGodotGuide,
}) => {
  const isPerfect = metrics.coresCollected === metrics.totalCores;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-none select-none">
      <div className="relative w-full max-w-md bg-[#0f172a] border border-cyan-400/50 rounded-xl p-6 sm:p-8 shadow-[0_0_60px_rgba(56,189,248,0.4)] flex flex-col items-center text-center">
        {/* Trophy Icon */}
        <div className="w-14 h-14 rounded-full bg-cyan-950/90 border border-cyan-400 flex items-center justify-center mb-4 text-cyan-300 shadow-[0_0_25px_rgba(56,189,248,0.6)]">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 tracking-wider mb-1">
          VICTORY ACHIEVED!
        </h2>
        <p className="text-xs font-mono text-cyan-400/90 mb-4">
          Sentinel Defeated · Godot Engine Core Restored
        </p>

        {/* Star Rating */}
        <div className="flex gap-2 mb-5">
          <Star className="w-6 h-6 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          <Star className="w-6 h-6 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          <Star
            className={`w-6 h-6 ${
              isPerfect
                ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                : 'text-slate-600'
            }`}
          />
        </div>

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
            <div className="text-[10px] text-slate-500 uppercase">Clear Time</div>
            <div className="text-lg font-bold text-emerald-400 tabular-nums">
              {Math.floor(metrics.timeElapsed)}s
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-mono font-bold tracking-wider text-sm transition cursor-pointer shadow-lg active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={onOpenGodotGuide}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#161b26] hover:bg-[#1e293b] border border-[#478cbf]/60 text-cyan-300 font-mono font-semibold text-xs transition cursor-pointer active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-[#38bdf8]" />
            <span>Godot সোর্স কোড ডাউনলোড করুন</span>
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
