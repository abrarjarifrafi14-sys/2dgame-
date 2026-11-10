/**
 * Isolated Game Canvas Container
 * Mounts canvas and instantiates GameEngine once. React state changes do NOT re-render the canvas loop.
 */

import React, { useEffect, useRef, memo } from 'react';
import { GameEngine, GameEngineCallbacks } from '../game/engine';

interface GameCanvasProps {
  onEngineInit: (engine: GameEngine) => void;
  callbacks: GameEngineCallbacks;
}

export const GameCanvas = memo<GameCanvasProps>(({ onEngineInit, callbacks }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const callbacksRef = useRef<GameEngineCallbacks>(callbacks);

  // Keep latest callbacks in ref without triggering re-initialization
  callbacksRef.current = callbacks;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Instantiate engine with proxy callbacks
    const engine = new GameEngine(canvas, {
      onStateChange: (state) => callbacksRef.current.onStateChange(state),
      onMetricsChange: (metrics, hp, maxHp, dashPct) =>
        callbacksRef.current.onMetricsChange(metrics, hp, maxHp, dashPct),
    });

    engineRef.current = engine;
    onEngineInit(engine);

    // Handle window resize
    const handleResize = () => {
      if (!canvas || !engineRef.current) return;
      engineRef.current.resize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, []); // Run only once on mount

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block bg-[#0a0e17] cursor-crosshair"
    />
  );
});

GameCanvas.displayName = 'GameCanvas';
