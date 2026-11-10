/**
 * Virtual On-Screen Touch Controls for Mobile/Tablet Play
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Zap, Sword } from 'lucide-react';
import { GameEngine } from '../game/engine';

interface TouchControlsProps {
  engineRef: React.MutableRefObject<GameEngine | null>;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ engineRef }) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };
    setIsTouchDevice(checkTouch() || window.innerWidth <= 840);

    const onResize = () => {
      setIsTouchDevice(checkTouch() || window.innerWidth <= 840);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!isTouchDevice) return null;

  const handleTouchStart = (action: 'left' | 'right' | 'up' | 'down' | 'jump' | 'attack' | 'dash') => {
    if (engineRef.current) {
      engineRef.current.setVirtualInput(action, true);
    }
  };

  const handleTouchEnd = (action: 'left' | 'right' | 'up' | 'down' | 'jump' | 'attack' | 'dash') => {
    if (engineRef.current) {
      engineRef.current.setVirtualInput(action, false);
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-6 z-20 pointer-events-none px-4 sm:px-8 flex justify-between items-end select-none">
      {/* D-Pad: Left & Right */}
      <div className="flex gap-3 pointer-events-auto">
        <button
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart('left'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('left'); }}
          onMouseDown={() => handleTouchStart('left')}
          onMouseUp={() => handleTouchEnd('left')}
          className="w-14 h-14 rounded-full bg-[#0f172a]/85 border-2 border-[#38bdf8]/50 active:bg-cyan-600/50 flex items-center justify-center text-cyan-300 shadow-lg active:scale-90 transition"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>

        <button
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart('right'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('right'); }}
          onMouseDown={() => handleTouchStart('right')}
          onMouseUp={() => handleTouchEnd('right')}
          className="w-14 h-14 rounded-full bg-[#0f172a]/85 border-2 border-[#38bdf8]/50 active:bg-cyan-600/50 flex items-center justify-center text-cyan-300 shadow-lg active:scale-90 transition"
          aria-label="Move Right"
        >
          <ArrowRight className="w-7 h-7" />
        </button>
      </div>

      {/* Action Buttons: Dash, Attack, Jump */}
      <div className="flex items-end gap-3 pointer-events-auto">
        {/* Dash */}
        <button
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart('dash'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('dash'); }}
          onMouseDown={() => handleTouchStart('dash')}
          onMouseUp={() => handleTouchEnd('dash')}
          className="w-12 h-12 rounded-full bg-[#0f172a]/85 border-2 border-amber-400/50 active:bg-amber-600/50 flex items-center justify-center text-amber-300 shadow-lg active:scale-90 transition mb-2"
          aria-label="Dash"
        >
          <Zap className="w-6 h-6" />
        </button>

        {/* Attack */}
        <button
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart('attack'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('attack'); }}
          onMouseDown={() => handleTouchStart('attack')}
          onMouseUp={() => handleTouchEnd('attack')}
          className="w-14 h-14 rounded-full bg-[#0f172a]/85 border-2 border-rose-500/60 active:bg-rose-600/50 flex items-center justify-center text-rose-400 shadow-lg active:scale-90 transition"
          aria-label="Attack"
        >
          <Sword className="w-7 h-7" />
        </button>

        {/* Jump */}
        <button
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart('jump'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('jump'); }}
          onMouseDown={() => handleTouchStart('jump')}
          onMouseUp={() => handleTouchEnd('jump')}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-500 border-2 border-white/60 active:scale-90 flex items-center justify-center text-white shadow-xl transition"
          aria-label="Jump"
        >
          <ArrowUp className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};
