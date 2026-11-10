/**
 * Godot Quest: Cyber Sentinel 2D
 * Full-Viewport Game Shell following core game craft guidelines
 */

import React, { useState, useRef, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { TitleScreen } from './components/TitleScreen';
import { GameOverlayUI } from './components/GameOverlayUI';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { GodotTutorialModal } from './components/GodotTutorialModal';
import { TouchControls } from './components/TouchControls';
import { GameEngine } from './game/engine';
import { GameState, GameMetrics } from './game/types';
import { sound } from './game/audio';

export default function App() {
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isGodotGuideOpen, setIsGodotGuideOpen] = useState<boolean>(false);
  const [dashPct, setDashPct] = useState<number>(0);

  const [metrics, setMetrics] = useState<GameMetrics>({
    score: 0,
    coresCollected: 0,
    totalCores: 10,
    combo: 0,
    comboTimer: 0,
    enemiesDefeated: 0,
    timeElapsed: 0,
  });

  const handleEngineInit = useCallback((engine: GameEngine) => {
    engineRef.current = engine;
  }, []);

  const handleStateChange = useCallback((newState: GameState) => {
    setGameState(newState);
  }, []);

  const handleMetricsChange = useCallback(
    (newMetrics: GameMetrics, _hp: number, _maxHp: number, newDashPct: number) => {
      setMetrics(newMetrics);
      setDashPct(newDashPct);
    },
    []
  );

  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  }, [isMuted]);

  const handleStartGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.startNewGame();
    }
  }, []);

  const handleResume = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.togglePause();
    }
  }, []);

  const handleRestart = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.restartGame();
    }
  }, []);

  const handleReturnTitle = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.setState('TITLE');
    }
  }, []);

  const handleOpenGodotGuide = useCallback(() => {
    setIsGodotGuideOpen(true);
  }, []);

  const handleCloseGodotGuide = useCallback(() => {
    setIsGodotGuideOpen(false);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#070a12] select-none font-sans">
      {/* 1. Isolated 60fps Game Canvas */}
      <GameCanvas
        onEngineInit={handleEngineInit}
        callbacks={{
          onStateChange: handleStateChange,
          onMetricsChange: handleMetricsChange,
        }}
      />

      {/* 2. Title Screen (Atmospheric world pan centerpiece & SVG lockup) */}
      {gameState === 'TITLE' && (
        <TitleScreen
          onStart={handleStartGame}
          onOpenGodotGuide={handleOpenGodotGuide}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* 3. Playing HUD Overlay (>= 85% Unobstructed playfield) */}
      {gameState === 'PLAYING' && (
        <>
          <GameOverlayUI
            metrics={metrics}
            dashPct={dashPct}
            onPause={handleResume}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onOpenGodotGuide={handleOpenGodotGuide}
          />
          <TouchControls engineRef={engineRef} />
        </>
      )}

      {/* 4. Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onOpenGodotGuide={handleOpenGodotGuide}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* 5. Game Over Modal */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          metrics={metrics}
          onRestart={handleRestart}
          onReturnTitle={handleReturnTitle}
          onOpenGodotGuide={handleOpenGodotGuide}
        />
      )}

      {/* 6. Victory Modal */}
      {gameState === 'VICTORY' && (
        <VictoryModal
          metrics={metrics}
          onRestart={handleRestart}
          onReturnTitle={handleReturnTitle}
          onOpenGodotGuide={handleOpenGodotGuide}
        />
      )}

      {/* 7. Comprehensive Godot Dev Workshop & Bengali Guide Modal */}
      <GodotTutorialModal
        isOpen={isGodotGuideOpen}
        onClose={handleCloseGodotGuide}
        engineRef={engineRef}
      />
    </div>
  );
}
