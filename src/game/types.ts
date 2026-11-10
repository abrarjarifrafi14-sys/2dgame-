/**
 * Game Types & Interfaces for Godot Quest
 */

export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlayerStats {
  maxHp: number;
  hp: number;
  speed: number;
  jumpForce: number;
  dashForce: number;
  dashCooldown: number;
  attackPower: number;
}

export interface Player extends Rect {
  vx: number;
  vy: number;
  facing: 1 | -1;
  isGrounded: boolean;
  canDoubleJump: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  isDashing: boolean;
  dashTimer: number;
  dashCooldownTimer: number;
  isAttacking: boolean;
  attackTimer: number;
  comboCount: number;
  invulnerableTimer: number;
  squashX: number;
  squashY: number;
  wallSliding: boolean;
  wallDir: 1 | -1;
  trail: Array<{ x: number; y: number; alpha: number; facing: 1 | -1 }>;
}

export type EnemyType = 'slime' | 'drone' | 'turret' | 'boss';

export interface Enemy extends Rect {
  id: string;
  type: EnemyType;
  hp: number;
  maxHp: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  patrolMinX: number;
  patrolMaxX: number;
  state: 'patrol' | 'windup' | 'attack' | 'stun';
  stateTimer: number;
  telegraphTimer: number;
  attackCooldown: number;
  hitFlashTimer: number;
  isDead: boolean;
  bossPhase?: number;
}

export interface Projectile extends Rect {
  id: string;
  vx: number;
  vy: number;
  damage: number;
  fromPlayer: boolean;
  color: string;
  life: number;
}

export interface Platform extends Rect {
  type: 'solid' | 'one-way' | 'hazard' | 'spring' | 'moving';
  color?: string;
  vx?: number;
  minX?: number;
  maxX?: number;
}

export interface Collectible extends Rect {
  id: string;
  type: 'core' | 'health' | 'upgrade';
  value: number;
  collected: boolean;
  bobOffset: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
  shape?: 'square' | 'circle' | 'spark' | 'ring';
}

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  life: number;
}

export interface GameInputs {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  jumpJustPressed: boolean;
  attack: boolean;
  attackJustPressed: boolean;
  dash: boolean;
  dashJustPressed: boolean;
  pauseJustPressed: boolean;
}

export interface GameMetrics {
  score: number;
  coresCollected: number;
  totalCores: number;
  combo: number;
  comboTimer: number;
  enemiesDefeated: number;
  timeElapsed: number;
}
