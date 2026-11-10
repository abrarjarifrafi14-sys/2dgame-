/**
 * Pause Modal for Godot Quest
 */

import React from 'react';
import { Play, RotateCcw, BookOpen, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenGodotGuide: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenGodotGuide,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-none">
      <div className="relative w-full max-w-md bg-[#0f172a] border border-[#38bdf8]/40 rounded-xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Badge */}
        <div className="px-3 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest mb-3">
          Game Paused
        </div>

        <h2 className="text-2xl sm:text-3xl font-mono font-black text-white tracking-wider mb-6">
          PAUSE MENU
        </h2>

        {/* Buttons Stack */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-mono font-bold tracking-wider text-sm transition cursor-pointer shadow-lg active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME (ESC)</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#1e293b] hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono font-semibold tracking-wide text-sm transition cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>RESTART LEVEL</span>
          </button>

          <button
            onClick={onOpenGodotGuide}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#161b26] hover:bg-[#1e293b] border border-[#478cbf]/60 text-cyan-300 font-mono font-semibold tracking-wide text-sm transition cursor-pointer active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-[#38bdf8]" />
            <span>GODOT গাইড ও GDScript কোড</span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#131822] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 font-mono text-xs transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span>{isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}</span>
          </button>
        </div>

        {/* Quick Controls Info */}
        <div className="mt-6 pt-5 border-t border-slate-800 w-full text-slate-400 font-mono text-xs space-y-1">
          <div className="flex justify-between">
            <span>Move:</span>
            <span className="text-cyan-300 font-bold">A / D or Arrows</span>
          </div>
          <div className="flex justify-between">
            <span>Jump / Double Jump:</span>
            <span className="text-cyan-300 font-bold">Space / K</span>
          </div>
          <div className="flex justify-between">
            <span>Attack (3-hit combo):</span>
            <span className="text-cyan-300 font-bold">J / Left Click</span>
          </div>
          <div className="flex justify-between">
            <span>Dash:</span>
            <span className="text-cyan-300 font-bold">Shift / L</span>
          </div>
        </div>
      </div>
    </div>
  );
};
