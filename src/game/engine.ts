/**
 * Core 60fps Game Engine for Godot Quest
 * Handles physics, collision, input buffering, hitstop, trauma shake, and AI
 */

import {
  GameState,
  Player,
  Platform,
  Enemy,
  Collectible,
  Projectile,
  Particle,
  DamageNumber,
  GameInputs,
  GameMetrics,
} from './types';
import { createMainLevel, LevelData } from './levels';
import { GameRenderer } from './renderer';
import { sound } from './audio';

export interface GameEngineCallbacks {
  onStateChange: (state: GameState) => void;
  onMetricsChange: (metrics: GameMetrics, playerHp: number, playerMaxHp: number, dashCooldownPct: number) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: GameRenderer;
  private callbacks: GameEngineCallbacks;

  private state: GameState = 'TITLE';
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Level & World State
  private level: LevelData;
  private player: Player;
  private platforms: Platform[] = [];
  private enemies: Enemy[] = [];
  private collectibles: Collectible[] = [];
  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private damageNumbers: DamageNumber[] = [];

  // Metrics
  private score: number = 0;
  private coresCollected: number = 0;
  private totalCores: number = 0;
  private combo: number = 0;
  private comboTimer: number = 0;
  private enemiesDefeated: number = 0;
  private timeElapsed: number = 0;

  // Camera & Juice
  private cameraX: number = 0;
  private cameraY: number = 0;
  private trauma: number = 0;
  private hitstopTimer: number = 0;

  // Input State
  private inputs: GameInputs = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    jumpJustPressed: false,
    attack: false,
    attackJustPressed: false,
    dash: false,
    dashJustPressed: false,
    pauseJustPressed: false,
  };

  // Live tweakable Godot physics parameters (can be adjusted live in Godot Workshop!)
  public config = {
    gravity: 1350,
    playerSpeed: 300,
    jumpForce: 560,
    doubleJumpForce: 500,
    dashForce: 680,
    friction: 1600,
    accel: 1800,
  };

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundBlur: () => void;

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
    this.callbacks = callbacks;
    this.renderer = new GameRenderer(ctx, canvas.width, canvas.height);

    // Initialize level data
    this.level = createMainLevel();
    this.player = this.createDefaultPlayer(this.level.spawnPoint.x, this.level.spawnPoint.y);
    this.resetLevel();

    // Event listeners
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundBlur = this.handleBlur.bind(this);

    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('blur', this.boundBlur);

    this.startLoop();
  }

  public destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    window.removeEventListener('blur', this.boundBlur);
    sound.stopBgm();
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.renderer.resize(width, height);
  }

  public setState(newState: GameState) {
    this.state = newState;
    this.callbacks.onStateChange(newState);

    if (newState === 'PLAYING') {
      sound.startBgm();
    } else if (newState === 'TITLE' || newState === 'PAUSED') {
      sound.stopBgm();
    }
  }

  public getState(): GameState {
    return this.state;
  }

  public startNewGame() {
    this.resetLevel();
    this.setState('PLAYING');
  }

  public restartGame() {
    this.resetLevel();
    this.setState('PLAYING');
  }

  public togglePause() {
    if (this.state === 'PLAYING') {
      this.setState('PAUSED');
    } else if (this.state === 'PAUSED') {
      this.setState('PLAYING');
    }
  }

  // Mobile / Touch controls injection
  public setVirtualInput(action: 'left' | 'right' | 'up' | 'down' | 'jump' | 'attack' | 'dash', isDown: boolean) {
    if (action === 'jump') {
      if (isDown && !this.inputs.jump) {
        this.inputs.jumpJustPressed = true;
      }
      this.inputs.jump = isDown;
    } else if (action === 'attack') {
      if (isDown && !this.inputs.attack) {
        this.inputs.attackJustPressed = true;
      }
      this.inputs.attack = isDown;
    } else if (action === 'dash') {
      if (isDown && !this.inputs.dash) {
        this.inputs.dashJustPressed = true;
      }
      this.inputs.dash = isDown;
    } else {
      this.inputs[action] = isDown;
    }
  }

  private createDefaultPlayer(x: number, y: number): Player {
    return {
      x,
      y,
      w: 30,
      h: 46,
      vx: 0,
      vy: 0,
      facing: 1,
      isGrounded: false,
      canDoubleJump: true,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      isDashing: false,
      dashTimer: 0,
      dashCooldownTimer: 0,
      isAttacking: false,
      attackTimer: 0,
      comboCount: 1,
      invulnerableTimer: 0,
      squashX: 1,
      squashY: 1,
      wallSliding: false,
      wallDir: 1,
      trail: [],
    };
  }

  private resetLevel() {
    this.level = createMainLevel();
    this.platforms = [...this.level.platforms];
    this.enemies = this.level.enemies.map((e) => ({ ...e }));
    this.collectibles = this.level.collectibles.map((c) => ({ ...c }));
    this.projectiles = [];
    this.particles = [];
    this.damageNumbers = [];

    this.player = this.createDefaultPlayer(this.level.spawnPoint.x, this.level.spawnPoint.y);
    this.score = 0;
    this.coresCollected = 0;
    this.totalCores = this.collectibles.filter((c) => c.type === 'core').length;
    this.combo = 0;
    this.comboTimer = 0;
    this.enemiesDefeated = 0;
    this.timeElapsed = 0;
    this.trauma = 0;
    this.hitstopTimer = 0;

    this.cameraX = this.player.x - this.canvas.width / 2;
    this.cameraY = this.player.y - this.canvas.height / 2;
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }

    if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.inputs.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') this.inputs.right = true;
    if (e.code === 'KeyW' || e.code === 'ArrowUp') this.inputs.up = true;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') this.inputs.down = true;

    if (e.code === 'Space' || e.code === 'KeyK') {
      if (!this.inputs.jump) this.inputs.jumpJustPressed = true;
      this.inputs.jump = true;
    }

    if (e.code === 'KeyJ' || e.code === 'KeyX' || e.code === 'KeyE') {
      if (!this.inputs.attack) this.inputs.attackJustPressed = true;
      this.inputs.attack = true;
    }

    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyL' || e.code === 'KeyC') {
      if (!this.inputs.dash) this.inputs.dashJustPressed = true;
      this.inputs.dash = true;
    }

    if (e.code === 'Escape' || e.code === 'KeyP') {
      this.togglePause();
    }

    if (this.state === 'TITLE' && (e.code === 'Enter' || e.code === 'Space')) {
      this.startNewGame();
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.inputs.left = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') this.inputs.right = false;
    if (e.code === 'KeyW' || e.code === 'ArrowUp') this.inputs.up = false;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') this.inputs.down = false;
    if (e.code === 'Space' || e.code === 'KeyK') this.inputs.jump = false;
    if (e.code === 'KeyJ' || e.code === 'KeyX' || e.code === 'KeyE') this.inputs.attack = false;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyL' || e.code === 'KeyC') this.inputs.dash = false;
  }

  private handleBlur() {
    // Clear all held inputs on blur to prevent phantom stuck keys
    this.inputs = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      jumpJustPressed: false,
      attack: false,
      attackJustPressed: false,
      dash: false,
      dashJustPressed: false,
      pauseJustPressed: false,
    };
  }

  public addTrauma(amount: number) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  private addHitstop(durationSec: number) {
    this.hitstopTimer = durationSec;
  }

  private spawnDamageNumber(x: number, y: number, text: string, color: string = '#f59e0b') {
    this.damageNumbers.push({
      id: Math.random().toString(),
      x: x + (Math.random() * 20 - 10),
      y: y - 10,
      text,
      color,
      alpha: 1.0,
      vy: -70,
      life: 0.65,
    });
  }

  private spawnParticles(x: number, y: number, count: number, color: string, shape: Particle['shape'] = 'square', speedMult: number = 1) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 120 + 30) * speedMult;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color,
        alpha: 1.0,
        maxLife: Math.random() * 0.35 + 0.15,
        life: Math.random() * 0.35 + 0.15,
        shape,
      });
    }
  }

  private startLoop() {
    const loop = (timestamp: number) => {
      if (!this.lastTime) this.lastTime = timestamp;
      const rawDt = (timestamp - this.lastTime) / 1000;
      this.lastTime = timestamp;

      // Delta clamping to guarantee stable 60fps simulation under frame drops
      const dt = Math.min(rawDt, 0.05);

      if (this.state === 'PLAYING') {
        this.update(dt);
      } else if (this.state === 'TITLE') {
        this.updateTitleWorld(dt);
      }

      this.render(timestamp / 1000);

      // Reset edge-triggered inputs for next frame
      this.inputs.jumpJustPressed = false;
      this.inputs.attackJustPressed = false;
      this.inputs.dashJustPressed = false;

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  private updateTitleWorld(dt: number) {
    // Atmospheric slow pan on Title Screen centerpiece
    this.timeElapsed += dt;
    this.cameraX = 1400 + Math.sin(this.timeElapsed * 0.4) * 200;
    this.cameraY = 400 + Math.cos(this.timeElapsed * 0.3) * 50;

    // Keep particles and subtle animation alive
    this.updateParticles(dt);
  }

  private update(dt: number) {
    this.timeElapsed += dt;

    // Hitstop freeze (satisfying simulation punch on impacts)
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    // Decay trauma for camera shake
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 2.0);
    }

    // Combo timer
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
      }
    }

    // Update moving platforms
    for (const p of this.platforms) {
      if (p.type === 'moving' && p.vx && p.minX !== undefined && p.maxX !== undefined) {
        p.x += p.vx * dt;
        if (p.x <= p.minX || p.x >= p.maxX) {
          p.vx = -p.vx;
        }
      }
    }

    // Update player
    this.updatePlayer(dt);

    // Update enemies
    this.updateEnemies(dt);

    // Update projectiles
    this.updateProjectiles(dt);

    // Update collectibles
    this.updateCollectibles();

    // Update particles & damage text
    this.updateParticles(dt);
    this.updateDamageNumbers(dt);

    // Update camera (smooth lerp tracking)
    const targetCamX = this.player.x - this.canvas.width / 2;
    const targetCamY = this.player.y - this.canvas.height / 2;
    this.cameraX += (targetCamX - this.cameraX) * 0.1;
    this.cameraY += (targetCamY - this.cameraY) * 0.1;

    // Clamp camera within world bounds
    this.cameraX = Math.max(0, Math.min(this.level.width - this.canvas.width, this.cameraX));
    this.cameraY = Math.max(0, Math.min(this.level.height - this.canvas.height, this.cameraY));

    // Periodic metrics broadcast to HUD UI (without re-rendering loop)
    const dashPct = Math.max(0, this.player.dashCooldownTimer / 0.6);
    this.callbacks.onMetricsChange(
      {
        score: this.score,
        coresCollected: this.coresCollected,
        totalCores: this.totalCores,
        combo: this.combo,
        comboTimer: this.comboTimer,
        enemiesDefeated: this.enemiesDefeated,
        timeElapsed: this.timeElapsed,
      },
      100, // Player HP is handled with invulnerability
      100,
      dashPct
    );
  }

  private updatePlayer(dt: number) {
    const p = this.player;

    // Invulnerability timer
    if (p.invulnerableTimer > 0) {
      p.invulnerableTimer -= dt;
    }

    // Dash cooldown
    if (p.dashCooldownTimer > 0) {
      p.dashCooldownTimer -= dt;
    }

    // Dash duration
    if (p.isDashing) {
      p.dashTimer -= dt;
      // Add ghost trail
      p.trail.push({ x: p.x, y: p.y, alpha: 0.8, facing: p.facing });
      if (p.dashTimer <= 0) {
        p.isDashing = false;
        p.vx = p.facing * this.config.playerSpeed * 0.5;
      }
    }

    // Fade dash trail
    for (let i = p.trail.length - 1; i >= 0; i--) {
      p.trail[i].alpha -= dt * 4;
      if (p.trail[i].alpha <= 0) {
        p.trail.splice(i, 1);
      }
    }

    // Attack timer & combo
    if (p.isAttacking) {
      p.attackTimer -= dt;
      if (p.attackTimer <= 0) {
        p.isAttacking = false;
      }
    }

    // Coyote time & Jump buffer timers
    if (p.isGrounded) {
      p.coyoteTimer = 0.12;
      p.canDoubleJump = true;
    } else {
      p.coyoteTimer -= dt;
    }

    if (this.inputs.jumpJustPressed) {
      p.jumpBufferTimer = 0.12;
    } else if (p.jumpBufferTimer > 0) {
      p.jumpBufferTimer -= dt;
    }

    // Dash trigger
    if (this.inputs.dashJustPressed && p.dashCooldownTimer <= 0 && !p.isDashing) {
      p.isDashing = true;
      p.dashTimer = 0.16;
      p.dashCooldownTimer = 0.6;
      p.vx = p.facing * this.config.dashForce;
      p.vy = 0;
      sound.playDash();
      this.spawnParticles(p.x + p.w / 2, p.y + p.h / 2, 10, '#38bdf8', 'spark');
    }

    // Attack trigger
    if (this.inputs.attackJustPressed && !p.isAttacking && !p.isDashing) {
      p.isAttacking = true;
      p.attackTimer = 0.22;
      p.comboCount = p.comboCount === 1 ? 2 : p.comboCount === 2 ? 3 : 1;
      sound.playSlash(p.comboCount);
      this.checkPlayerAttackHit();
    }

    // Horizontal movement (only when not dashing)
    if (!p.isDashing) {
      let moveDir = 0;
      if (this.inputs.left) moveDir -= 1;
      if (this.inputs.right) moveDir += 1;

      if (moveDir !== 0) {
        p.facing = moveDir as 1 | -1;
        p.vx = moveDir * this.config.playerSpeed;
      } else {
        // Apply friction
        if (p.vx > 0) {
          p.vx = Math.max(0, p.vx - this.config.friction * dt);
        } else if (p.vx < 0) {
          p.vx = Math.min(0, p.vx + this.config.friction * dt);
        }
      }
    }

    // Jump execution (Coyote Time + Input Buffer)
    if (p.jumpBufferTimer > 0) {
      if (p.coyoteTimer > 0) {
        // Ground Jump
        p.vy = -this.config.jumpForce;
        p.isGrounded = false;
        p.coyoteTimer = 0;
        p.jumpBufferTimer = 0;
        p.squashX = 0.75;
        p.squashY = 1.25;
        sound.playJump();
        this.spawnParticles(p.x + p.w / 2, p.y + p.h, 6, '#38bdf8', 'square');
      } else if (p.wallSliding) {
        // Wall Jump! Launches away from wall
        p.vy = -this.config.jumpForce * 0.9;
        p.vx = -p.wallDir * this.config.playerSpeed * 1.2;
        p.facing = -p.wallDir as 1 | -1;
        p.jumpBufferTimer = 0;
        sound.playJump();
        this.spawnParticles(p.x + (p.wallDir === 1 ? p.w : 0), p.y + p.h / 2, 8, '#94a3b8', 'spark');
      } else if (p.canDoubleJump) {
        // Double Jump
        p.vy = -this.config.doubleJumpForce;
        p.canDoubleJump = false;
        p.jumpBufferTimer = 0;
        p.squashX = 0.75;
        p.squashY = 1.25;
        sound.playDoubleJump();
        this.spawnParticles(p.x + p.w / 2, p.y + p.h, 12, '#38bdf8', 'ring');
      }
    }

    // Variable jump height: cut jump short if button released early
    if (!this.inputs.jump && p.vy < -150) {
      p.vy *= 0.85;
    }

    // Apply gravity (only when not dashing)
    if (!p.isDashing) {
      if (p.wallSliding && p.vy > 0) {
        // Gentle wall sliding fall speed
        p.vy = Math.min(p.vy + this.config.gravity * 0.3 * dt, 120);
      } else {
        p.vy += this.config.gravity * dt;
      }
    }

    // Squash & stretch recovery toward 1.0
    p.squashX += (1 - p.squashX) * dt * 10;
    p.squashY += (1 - p.squashY) * dt * 10;

    // Physics Movement & Collision Resolution (Separated X and Y)
    this.resolvePlayerMovement(dt);

    // Fall out of bounds check
    if (p.y > this.level.height + 100) {
      this.handlePlayerDeath();
    }
  }

  private resolvePlayerMovement(dt: number) {
    const p = this.player;

    // 1. Move X
    p.x += p.vx * dt;
    let touchingWall = false;
    let wallSide: 1 | -1 = 1;

    for (const plat of this.platforms) {
      if (plat.type === 'hazard') continue;
      if (plat.type === 'one-way') continue; // One-way platforms don't block X

      if (this.checkAABB(p, plat)) {
        if (p.vx > 0) {
          p.x = plat.x - p.w;
          touchingWall = true;
          wallSide = 1;
        } else if (p.vx < 0) {
          p.x = plat.x + plat.w;
          touchingWall = true;
          wallSide = -1;
        }
        p.vx = 0;
      }
    }

    // Wall slide check
    p.wallSliding = touchingWall && !p.isGrounded && p.vy > 0;
    p.wallDir = wallSide;

    // 2. Move Y
    const wasGrounded = p.isGrounded;
    p.isGrounded = false;
    p.y += p.vy * dt;

    for (const plat of this.platforms) {
      if (plat.type === 'hazard') {
        if (this.checkAABB(p, plat)) {
          this.handlePlayerDamage(30);
        }
        continue;
      }

      if (plat.type === 'spring') {
        if (this.checkAABB(p, plat) && p.vy > 0 && p.y + p.h - p.vy * dt <= plat.y + 12) {
          p.y = plat.y - p.h;
          p.vy = -this.config.jumpForce * 1.5;
          sound.playSpring();
          p.squashX = 0.6;
          p.squashY = 1.4;
          this.spawnParticles(p.x + p.w / 2, plat.y, 16, '#10b981', 'ring');
          return;
        }
      }

      if (plat.type === 'one-way') {
        // Can only land on top of one-way platforms from above
        const prevBottom = p.y + p.h - p.vy * dt;
        if (this.checkAABB(p, plat) && p.vy > 0 && prevBottom <= plat.y + 10) {
          p.y = plat.y - p.h;
          p.vy = 0;
          p.isGrounded = true;
        }
        continue;
      }

      if (this.checkAABB(p, plat)) {
        if (p.vy > 0) {
          // Landed on platform
          p.y = plat.y - p.h;
          p.vy = 0;
          p.isGrounded = true;

          // Landing squash & sound
          if (!wasGrounded) {
            p.squashX = 1.35;
            p.squashY = 0.65;
            sound.playLand();
            this.spawnParticles(p.x + p.w / 2, p.y + p.h, 6, '#478cbf', 'square');
          }
        } else if (p.vy < 0) {
          // Head bump
          p.y = plat.y + plat.h;
          p.vy = 0;
        }
      }
    }
  }

  private checkPlayerAttackHit() {
    const p = this.player;
    const hitBox = {
      x: p.facing === 1 ? p.x + p.w : p.x - 48,
      y: p.y - 4,
      w: 48,
      h: p.h + 8,
    };

    let hitAny = false;

    for (const e of this.enemies) {
      if (e.isDead) continue;

      if (this.checkAABB(hitBox, e)) {
        hitAny = true;
        const isCrit = p.comboCount === 3;
        const baseDmg = isCrit ? 40 : 25;
        e.hp -= baseDmg;
        e.hitFlashTimer = 0.14;

        // Knockback
        e.vx = p.facing * (isCrit ? 220 : 120);

        // Sound & Juice
        sound.playHit();
        this.addHitstop(isCrit ? 0.07 : 0.04);
        this.addTrauma(isCrit ? 0.45 : 0.25);

        // Damage Number
        this.spawnDamageNumber(
          e.x + e.w / 2,
          e.y,
          isCrit ? `CRIT! ${baseDmg}` : `${baseDmg}`,
          isCrit ? '#f59e0b' : '#38bdf8'
        );

        // Particles
        this.spawnParticles(e.x + e.w / 2, e.y + e.h / 2, isCrit ? 16 : 8, '#38bdf8', 'spark', 1.4);

        // Combo increment
        this.combo++;
        this.comboTimer = 2.0;
        this.score += baseDmg * this.combo;

        // Enemy death check
        if (e.hp <= 0) {
          this.handleEnemyDeath(e);
        }
      }
    }

    if (hitAny) {
      sound.playHit();
    }
  }

  private handleEnemyDeath(e: Enemy) {
    e.isDead = true;
    this.enemiesDefeated++;
    this.score += e.type === 'boss' ? 2500 : 300;
    this.addTrauma(e.type === 'boss' ? 0.8 : 0.4);
    this.addHitstop(e.type === 'boss' ? 0.12 : 0.06);
    sound.playEnemyDeath();

    this.spawnParticles(e.x + e.w / 2, e.y + e.h / 2, e.type === 'boss' ? 40 : 20, '#ef4444', 'ring', 2.0);

    // If boss defeated -> Victory!
    if (e.type === 'boss') {
      setTimeout(() => {
        this.setState('VICTORY');
      }, 1200);
    }
  }

  private handlePlayerDamage(amount: number) {
    const p = this.player;
    if (p.invulnerableTimer > 0 || p.isDashing) return;

    p.invulnerableTimer = 1.0;
    this.addTrauma(0.5);
    this.addHitstop(0.06);
    sound.playHit();
    this.spawnParticles(p.x + p.w / 2, p.y + p.h / 2, 12, '#ef4444', 'spark');

    // Knockback
    p.vy = -280;
    p.vx = -p.facing * 200;

    // Reset combo
    this.combo = 0;
  }

  private handlePlayerDeath() {
    this.setState('GAME_OVER');
  }

  private updateEnemies(dt: number) {
    const p = this.player;

    for (const e of this.enemies) {
      if (e.isDead) continue;

      if (e.hitFlashTimer > 0) {
        e.hitFlashTimer -= dt;
      }

      const distToPlayer = Math.hypot(p.x - e.x, p.y - e.y);

      // Boss Logic
      if (e.type === 'boss') {
        this.updateBoss(e, dt, distToPlayer);
        continue;
      }

      // Patrol Slime Logic
      if (e.type === 'slime') {
        e.x += e.vx * dt;
        if (e.x <= e.patrolMinX) {
          e.x = e.patrolMinX;
          e.vx = Math.abs(e.vx);
          e.facing = 1;
        } else if (e.x >= e.patrolMaxX) {
          e.x = e.patrolMaxX;
          e.vx = -Math.abs(e.vx);
          e.facing = -1;
        }

        // Contact damage with player
        if (this.checkAABB(p, e)) {
          this.handlePlayerDamage(15);
        }
      }

      // Drone Logic (Hover & Swoop)
      else if (e.type === 'drone') {
        e.facing = p.x > e.x ? 1 : -1;
        e.stateTimer += dt;

        if (e.state === 'patrol') {
          e.x += e.vx * dt;
          if (e.x <= e.patrolMinX || e.x >= e.patrolMaxX) {
            e.vx = -e.vx;
          }

          if (distToPlayer < 350 && e.stateTimer > e.attackCooldown) {
            e.state = 'windup';
            e.stateTimer = 0;
            e.telegraphTimer = 0.8;
            sound.playBossTelegraph();
          }
        } else if (e.state === 'windup') {
          e.telegraphTimer -= dt;
          if (e.telegraphTimer <= 0) {
            e.state = 'attack';
            e.stateTimer = 0;
            // Fire plasma projectile at player
            const angle = Math.atan2(p.y - e.y, p.x - e.x);
            this.projectiles.push({
              id: Math.random().toString(),
              x: e.x + e.w / 2,
              y: e.y + e.h / 2,
              w: 12,
              h: 12,
              vx: Math.cos(angle) * 260,
              vy: Math.sin(angle) * 260,
              damage: 20,
              fromPlayer: false,
              color: '#8b5cf6',
              life: 4,
            });
          }
        } else if (e.state === 'attack') {
          if (e.stateTimer > 0.5) {
            e.state = 'patrol';
            e.stateTimer = 0;
          }
        }

        if (this.checkAABB(p, e)) {
          this.handlePlayerDamage(15);
        }
      }

      // Turret Logic (Aim & Shoot)
      else if (e.type === 'turret') {
        e.facing = p.x > e.x ? 1 : -1;
        e.stateTimer += dt;

        if (e.state === 'patrol') {
          if (distToPlayer < 450 && e.stateTimer > e.attackCooldown) {
            e.state = 'windup';
            e.stateTimer = 0;
            e.telegraphTimer = 0.7;
            sound.playBossTelegraph();
          }
        } else if (e.state === 'windup') {
          e.telegraphTimer -= dt;
          if (e.telegraphTimer <= 0) {
            e.state = 'attack';
            e.stateTimer = 0;
            // Fire laser projectile
            this.projectiles.push({
              id: Math.random().toString(),
              x: e.x + (e.facing === 1 ? e.w : -12),
              y: e.y + 14,
              w: 14,
              h: 8,
              vx: e.facing * 360,
              vy: 0,
              damage: 25,
              fromPlayer: false,
              color: '#ef4444',
              life: 3.5,
            });
            this.spawnParticles(e.x + (e.facing === 1 ? e.w : 0), e.y + 14, 8, '#ef4444', 'spark');
          }
        } else if (e.state === 'attack') {
          if (e.stateTimer > 0.4) {
            e.state = 'patrol';
            e.stateTimer = 0;
          }
        }

        if (this.checkAABB(p, e)) {
          this.handlePlayerDamage(20);
        }
      }
    }
  }

  private updateBoss(boss: Enemy, dt: number, distToPlayer: number) {
    const p = this.player;
    boss.facing = p.x > boss.x ? 1 : -1;
    boss.stateTimer += dt;

    // Check boss phase transition
    if (boss.hp < boss.maxHp * 0.5 && boss.bossPhase === 1) {
      boss.bossPhase = 2;
      this.addTrauma(0.6);
      this.spawnParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, 30, '#ef4444', 'ring', 2.0);
      sound.playBossTelegraph();
    }

    if (boss.state === 'patrol') {
      boss.x += boss.vx * dt;
      if (boss.x <= boss.patrolMinX || boss.x >= boss.patrolMaxX) {
        boss.vx = -boss.vx;
      }

      const cooldown = boss.bossPhase === 2 ? 1.4 : 2.2;
      if (boss.stateTimer > cooldown && distToPlayer < 700) {
        boss.state = 'windup';
        boss.stateTimer = 0;
        boss.telegraphTimer = boss.bossPhase === 2 ? 0.6 : 0.9;
        sound.playBossTelegraph();
      }
    } else if (boss.state === 'windup') {
      boss.telegraphTimer -= dt;
      if (boss.telegraphTimer <= 0) {
        boss.state = 'attack';
        boss.stateTimer = 0;

        // Boss Stomp & Shockwaves left and right
        this.addTrauma(0.5);
        sound.playHit();

        // Shockwave Left
        this.projectiles.push({
          id: Math.random().toString(),
          x: boss.x - 10,
          y: boss.y + boss.h - 18,
          w: 24,
          h: 24,
          vx: -240,
          vy: 0,
          damage: 25,
          fromPlayer: false,
          color: boss.bossPhase === 2 ? '#ef4444' : '#38bdf8',
          life: 3.0,
        });

        // Shockwave Right
        this.projectiles.push({
          id: Math.random().toString(),
          x: boss.x + boss.w + 10,
          y: boss.y + boss.h - 18,
          w: 24,
          h: 24,
          vx: 240,
          vy: 0,
          damage: 25,
          fromPlayer: false,
          color: boss.bossPhase === 2 ? '#ef4444' : '#38bdf8',
          life: 3.0,
        });

        // In Phase 2: also shoot 3-spread plasma orbs
        if (boss.bossPhase === 2) {
          [-0.3, 0, 0.3].forEach((spread) => {
            const angle = Math.atan2(p.y - boss.y, p.x - boss.x) + spread;
            this.projectiles.push({
              id: Math.random().toString(),
              x: boss.x + boss.w / 2,
              y: boss.y + 30,
              w: 16,
              h: 16,
              vx: Math.cos(angle) * 280,
              vy: Math.sin(angle) * 280,
              damage: 20,
              fromPlayer: false,
              color: '#f59e0b',
              life: 3.5,
            });
          });
        }
      }
    } else if (boss.state === 'attack') {
      if (boss.stateTimer > 0.6) {
        boss.state = 'patrol';
        boss.stateTimer = 0;
      }
    }

    if (this.checkAABB(p, boss)) {
      this.handlePlayerDamage(25);
    }
  }

  private updateProjectiles(dt: number) {
    const p = this.player;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.life -= dt;

      // Check collision with player
      if (!proj.fromPlayer && this.checkAABB(proj, p)) {
        this.handlePlayerDamage(proj.damage);
        this.spawnParticles(proj.x, proj.y, 8, proj.color, 'spark');
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check collision with solid platforms
      let hitSolid = false;
      for (const plat of this.platforms) {
        if (plat.type === 'solid' && this.checkAABB(proj, plat)) {
          hitSolid = true;
          break;
        }
      }

      if (hitSolid || proj.life <= 0) {
        this.spawnParticles(proj.x, proj.y, 6, proj.color, 'spark');
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateCollectibles() {
    const p = this.player;

    for (const c of this.collectibles) {
      if (c.collected) continue;

      if (this.checkAABB(p, c)) {
        c.collected = true;

        if (c.type === 'core') {
          this.coresCollected++;
          this.score += c.value;
          sound.playCoin();
          this.spawnDamageNumber(c.x, c.y, `+${c.value}`, '#38bdf8');
          this.spawnParticles(c.x + c.w / 2, c.y + c.h / 2, 12, '#38bdf8', 'ring');
        } else if (c.type === 'health') {
          sound.playHeal();
          this.spawnDamageNumber(c.x, c.y, 'REPAIR +30', '#22c55e');
          this.spawnParticles(c.x + c.w / 2, c.y + c.h / 2, 16, '#22c55e', 'ring');
        }
      }
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const part = this.particles[i];
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      part.life -= dt;
      part.alpha = Math.max(0, part.life / part.maxLife);

      if (part.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateDamageNumbers(dt: number) {
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const d = this.damageNumbers[i];
      d.y += d.vy * dt;
      d.life -= dt;
      d.alpha = Math.max(0, d.life / 0.65);

      if (d.life <= 0) {
        this.damageNumbers.splice(i, 1);
      }
    }
  }

  private render(time: number) {
    // Trauma screen shake calculation
    const maxShake = 18;
    const shakePower = this.trauma * this.trauma;
    const shakeX = (Math.random() * 2 - 1) * maxShake * shakePower;
    const shakeY = (Math.random() * 2 - 1) * maxShake * shakePower;

    this.renderer.render(
      this.cameraX,
      this.cameraY,
      this.player,
      this.platforms,
      this.enemies,
      this.collectibles,
      this.projectiles,
      this.particles,
      this.damageNumbers,
      time,
      shakeX,
      shakeY
    );
  }

  private checkAABB(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): boolean {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
}
