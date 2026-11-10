/**
 * Level Layout & Entity Spawns for Godot Quest
 */

import { Platform, Enemy, Collectible } from './types';

export interface LevelData {
  width: number;
  height: number;
  spawnPoint: { x: number; y: number };
  platforms: Platform[];
  enemies: Enemy[];
  collectibles: Collectible[];
}

export function createMainLevel(): LevelData {
  const platforms: Platform[] = [
    // Ground foundation
    { x: 0, y: 700, w: 900, h: 200, type: 'solid', color: '#1f293d' },
    { x: 950, y: 700, w: 800, h: 200, type: 'solid', color: '#1f293d' },
    { x: 1800, y: 700, w: 800, h: 200, type: 'solid', color: '#1f293d' },
    // Boss arena floor
    { x: 2650, y: 700, w: 1200, h: 200, type: 'solid', color: '#1a2233' },

    // Left wall & ceiling boundary
    { x: -50, y: 0, w: 50, h: 900, type: 'solid' },
    { x: 3850, y: 0, w: 50, h: 900, type: 'solid' },
    { x: 0, y: -50, w: 3900, h: 50, type: 'solid' },

    // Pit hazards (spikes between islands)
    { x: 900, y: 780, w: 50, h: 40, type: 'hazard', color: '#ef4444' },
    { x: 1750, y: 780, w: 50, h: 40, type: 'hazard', color: '#ef4444' },
    { x: 2600, y: 780, w: 50, h: 40, type: 'hazard', color: '#ef4444' },

    // Area 1: Tutorial & First jumps
    { x: 220, y: 580, w: 160, h: 24, type: 'solid', color: '#2d3a4f' },
    { x: 440, y: 480, w: 180, h: 24, type: 'solid', color: '#2d3a4f' },
    { x: 260, y: 360, w: 140, h: 24, type: 'one-way', color: '#3b82f6' },
    { x: 680, y: 560, w: 160, h: 24, type: 'solid', color: '#2d3a4f' },

    // Spring pad in Area 1
    { x: 600, y: 680, w: 44, h: 20, type: 'spring', color: '#10b981' },

    // Area 2: Wall jump & Vertical shaft
    { x: 1040, y: 550, w: 180, h: 24, type: 'solid', color: '#2d3a4f' },
    { x: 1280, y: 450, w: 40, h: 240, type: 'solid', color: '#1e293b' }, // Wall to slide/jump
    { x: 1400, y: 350, w: 40, h: 240, type: 'solid', color: '#1e293b' }, // Wall to slide/jump
    { x: 1300, y: 240, w: 160, h: 24, type: 'one-way', color: '#3b82f6' },
    { x: 1520, y: 520, w: 200, h: 24, type: 'solid', color: '#2d3a4f' },

    // Moving platform over gap
    { x: 1730, y: 420, w: 120, h: 20, type: 'moving', minX: 1700, maxX: 1860, vx: 50, color: '#06b6d4' },

    // Area 3: Cyber fortress
    { x: 1920, y: 580, w: 160, h: 24, type: 'solid', color: '#2d3a4f' },
    { x: 2140, y: 480, w: 180, h: 24, type: 'solid', color: '#2d3a4f' },
    { x: 2380, y: 380, w: 180, h: 24, type: 'solid', color: '#2d3a4f' },
    { x: 2050, y: 300, w: 150, h: 24, type: 'one-way', color: '#3b82f6' },
    { x: 2280, y: 220, w: 160, h: 24, type: 'one-way', color: '#3b82f6' },
    { x: 2500, y: 560, w: 140, h: 24, type: 'solid', color: '#2d3a4f' },

    // Spring pad to Boss gate
    { x: 2550, y: 680, w: 44, h: 20, type: 'spring', color: '#10b981' },

    // Area 4: Boss Arena platforms
    { x: 2800, y: 540, w: 160, h: 24, type: 'one-way', color: '#478cbf' },
    { x: 3100, y: 420, w: 200, h: 24, type: 'one-way', color: '#478cbf' },
    { x: 3450, y: 540, w: 160, h: 24, type: 'one-way', color: '#478cbf' },
    { x: 3130, y: 260, w: 140, h: 20, type: 'one-way', color: '#38bdf8' },
  ];

  const enemies: Enemy[] = [
    // Area 1: Patrol Slimes
    {
      id: 'slime-1',
      type: 'slime',
      x: 350,
      y: 656,
      w: 40,
      h: 44,
      hp: 30,
      maxHp: 30,
      vx: 60,
      vy: 0,
      facing: 1,
      patrolMinX: 200,
      patrolMaxX: 520,
      state: 'patrol',
      stateTimer: 0,
      telegraphTimer: 0,
      attackCooldown: 2,
      hitFlashTimer: 0,
      isDead: false,
    },
    {
      id: 'drone-1',
      type: 'drone',
      x: 720,
      y: 440,
      w: 36,
      h: 36,
      hp: 25,
      maxHp: 25,
      vx: 50,
      vy: 0,
      facing: -1,
      patrolMinX: 680,
      patrolMaxX: 840,
      state: 'patrol',
      stateTimer: 0,
      telegraphTimer: 0,
      attackCooldown: 1.5,
      hitFlashTimer: 0,
      isDead: false,
    },
    // Area 2: Turret and Patrol
    {
      id: 'turret-1',
      type: 'turret',
      x: 1100,
      y: 506,
      w: 42,
      h: 44,
      hp: 40,
      maxHp: 40,
      vx: 0,
      vy: 0,
      facing: -1,
      patrolMinX: 1100,
      patrolMaxX: 1100,
      state: 'patrol',
      stateTimer: 0,
      telegraphTimer: 0,
      attackCooldown: 2.2,
      hitFlashTimer: 0,
      isDead: false,
    },
    {
      id: 'drone-2',
      type: 'drone',
      x: 1350,
      y: 160,
      w: 36,
      h: 36,
      hp: 30,
      maxHp: 30,
      vx: 70,
      vy: 0,
      facing: 1,
      patrolMinX: 1250,
      patrolMaxX: 1500,
      state: 'patrol',
      stateTimer: 0,
      telegraphTimer: 0,
      attackCooldown: 1.8,
      hitFlashTimer: 0,
      isDead: false,
    },
    // Area 3: Guards
    {
      id: 'slime-2',
      type: 'slime',
      x: 2000,
      y: 656,
      w: 40,
      h: 44,
      hp: 45,
      maxHp: 45,
      vx: 80,
      vy: 0,
      facing: 1,
      patrolMinX: 1850,
      patrolMaxX: 2450,
      state: 'patrol',
      stateTimer: 0,
      telegraphTimer: 0,
      attackCooldown: 2,
      hitFlashTimer: 0,
      isDead: false,
    },
    {
      id: 'turret-2',
      type: 'turret',
      x: 2420,
      y: 336,
      w: 42,
      h: 44,
      hp: 50,
      maxHp: 50,
      vx: 0,
      vy: 0,
      facing: -1,
      patrolMinX: 2420,
      patrolMaxX: 2420,
      state: 'patrol',
      stateTimer: 0,
      telegraphTimer: 0,
      attackCooldown: 2.0,
      hitFlashTimer: 0,
      isDead: false,
    },
    // Boss: The Corrupted Godot Core (Sentinel Engine)
    {
      id: 'boss-1',
      type: 'boss',
      x: 3200,
      y: 580,
      w: 88,
      h: 120,
      hp: 350,
      maxHp: 350,
      vx: 60,
      vy: 0,
      facing: -1,
      patrolMinX: 2750,
      patrolMaxX: 3650,
      state: 'patrol',
      stateTimer: 0,
      telegraphTimer: 0,
      attackCooldown: 2.5,
      hitFlashTimer: 0,
      isDead: false,
      bossPhase: 1,
    },
  ];

  const collectibles: Collectible[] = [
    // Godot Blue Cores (Nodes)
    { id: 'c1', type: 'core', x: 260, y: 530, w: 22, h: 22, value: 100, collected: false, bobOffset: 0 },
    { id: 'c2', type: 'core', x: 480, y: 430, w: 22, h: 22, value: 100, collected: false, bobOffset: 0.5 },
    { id: 'c3', type: 'core', x: 300, y: 310, w: 22, h: 22, value: 100, collected: false, bobOffset: 1.0 },
    { id: 'c4', type: 'health', x: 740, y: 510, w: 24, h: 24, value: 30, collected: false, bobOffset: 1.5 },

    { id: 'c5', type: 'core', x: 1100, y: 400, w: 22, h: 22, value: 100, collected: false, bobOffset: 2.0 },
    { id: 'c6', type: 'core', x: 1350, y: 190, w: 22, h: 22, value: 150, collected: false, bobOffset: 2.5 },
    { id: 'c7', type: 'core', x: 1600, y: 470, w: 22, h: 22, value: 100, collected: false, bobOffset: 3.0 },

    { id: 'c8', type: 'health', x: 2080, y: 250, w: 24, h: 24, value: 35, collected: false, bobOffset: 3.5 },
    { id: 'c9', type: 'core', x: 2320, y: 170, w: 22, h: 22, value: 200, collected: false, bobOffset: 4.0 },
    { id: 'c10', type: 'core', x: 2200, y: 430, w: 22, h: 22, value: 100, collected: false, bobOffset: 4.5 },

    // Boss Arena bonus cores
    { id: 'c11', type: 'core', x: 2850, y: 490, w: 22, h: 22, value: 150, collected: false, bobOffset: 5.0 },
    { id: 'c12', type: 'core', x: 3180, y: 210, w: 22, h: 22, value: 250, collected: false, bobOffset: 5.5 },
    { id: 'c13', type: 'core', x: 3500, y: 490, w: 22, h: 22, value: 150, collected: false, bobOffset: 6.0 },
  ];

  return {
    width: 3850,
    height: 900,
    spawnPoint: { x: 80, y: 640 },
    platforms,
    enemies,
    collectibles,
  };
}
