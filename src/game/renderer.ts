/**
 * Canvas 2D High-Performance Renderer for Godot Quest
 * Clean cyber-pixel aesthetic with Godot blue accents, squash & stretch, and VFX
 */

import { Player, Enemy, Platform, Collectible, Projectile, Particle, DamageNumber } from './types';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public render(
    cameraX: number,
    cameraY: number,
    player: Player,
    platforms: Platform[],
    enemies: Enemy[],
    collectibles: Collectible[],
    projectiles: Projectile[],
    particles: Particle[],
    damageNumbers: DamageNumber[],
    time: number,
    shakeX: number = 0,
    shakeY: number = 0
  ) {
    const ctx = this.ctx;

    // Clear viewport
    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    // Camera offset + screen shake
    ctx.translate(-cameraX + shakeX, -cameraY + shakeY);

    // 1. Draw Parallax Background
    this.drawBackground(cameraX, cameraY, time);

    // 2. Draw Platforms & Level Elements
    this.drawPlatforms(platforms, time);

    // 3. Draw Collectibles
    this.drawCollectibles(collectibles, time);

    // 4. Draw Enemies & Boss
    this.drawEnemies(enemies, time);

    // 5. Draw Projectiles
    this.drawProjectiles(projectiles);

    // 6. Draw Player & Afterimages
    this.drawPlayer(player, time);

    // 7. Draw Particles
    this.drawParticles(particles);

    // 8. Draw Damage Numbers
    this.drawDamageNumbers(damageNumbers);

    ctx.restore();
  }

  private drawBackground(cameraX: number, cameraY: number, time: number) {
    const ctx = this.ctx;
    const startX = cameraX - 200;
    const endX = cameraX + this.width + 200;
    const startY = cameraY - 100;
    const endY = cameraY + this.height + 100;

    // Deep space gradient
    const bgGrad = ctx.createLinearGradient(cameraX, startY, cameraX, endY);
    bgGrad.addColorStop(0, '#0d1117');
    bgGrad.addColorStop(0.5, '#161b26');
    bgGrad.addColorStop(1, '#1f2638');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(startX, startY, endX - startX, endY - startY);

    // Parallax grid lines
    ctx.strokeStyle = 'rgba(71, 140, 191, 0.08)';
    ctx.lineWidth = 1;
    const gridSize = 80;
    const offsetX = (cameraX * 0.3) % gridSize;
    const offsetY = (cameraY * 0.3) % gridSize;

    ctx.beginPath();
    for (let x = startX - offsetX; x < endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY - offsetY; y < endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();

    // Floating Godot Node connection diagrams in background (subtle world building)
    const nodeCount = 12;
    for (let i = 0; i < nodeCount; i++) {
      const nx = ((i * 340 + 100) - cameraX * 0.2 + 4000) % 3600;
      const ny = 200 + Math.sin(time * 0.5 + i) * 60 + (i % 3) * 120;

      ctx.fillStyle = 'rgba(71, 140, 191, 0.12)';
      ctx.beginPath();
      ctx.arc(nx, ny, 16, 0, Math.PI * 2);
      ctx.fill();

      // Connector line to neighbor
      ctx.strokeStyle = 'rgba(71, 140, 191, 0.06)';
      ctx.beginPath();
      ctx.moveTo(nx, ny);
      ctx.lineTo(nx + 180, ny + 30);
      ctx.stroke();

      // Inner node dot
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.arc(nx, ny, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawPlatforms(platforms: Platform[], time: number) {
    const ctx = this.ctx;

    for (const p of platforms) {
      if (p.type === 'hazard') {
        // Red spike hazard
        ctx.fillStyle = '#ef4444';
        const spikeW = 12;
        const count = Math.floor(p.w / spikeW);
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
          const sx = p.x + i * spikeW;
          ctx.moveTo(sx, p.y + p.h);
          ctx.lineTo(sx + spikeW / 2, p.y);
          ctx.lineTo(sx + spikeW, p.y + p.h);
        }
        ctx.closePath();
        ctx.fill();

        // Pulsing hazard glow
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        continue;
      }

      if (p.type === 'spring') {
        // High-tech jump pad
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(p.x, p.y + 10, p.w, p.h - 10);

        // Spring top plate
        const springGlow = Math.sin(time * 6) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(16, 185, 129, ${springGlow})`;
        ctx.fillRect(p.x + 4, p.y + 4, p.w - 8, 8);

        // Arrow indicator
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x + p.w / 2 - 6, p.y + 10);
        ctx.lineTo(p.x + p.w / 2, p.y + 2);
        ctx.lineTo(p.x + p.w / 2 + 6, p.y + 10);
        ctx.stroke();
        continue;
      }

      // Solid / one-way / moving platform
      ctx.fillStyle = p.color || '#1e293b';
      ctx.fillRect(p.x, p.y, p.w, p.h);

      // Top edge highlight (cyan neon line)
      ctx.fillStyle = p.type === 'one-way' ? '#38bdf8' : '#478cbf';
      ctx.fillRect(p.x, p.y, p.w, 4);

      // Tech beveled accents for large blocks
      if (p.w > 60 && p.h > 40) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x + 4, p.y + 8, p.w - 8, p.h - 12);

        // Minor grid pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        for (let gx = p.x + 20; gx < p.x + p.w - 20; gx += 40) {
          ctx.fillRect(gx, p.y + 12, 12, p.h - 24);
        }
      }
    }
  }

  private drawCollectibles(collectibles: Collectible[], time: number) {
    const ctx = this.ctx;

    for (const c of collectibles) {
      if (c.collected) continue;

      const bobY = c.y + Math.sin(time * 3 + c.bobOffset) * 6;

      if (c.type === 'core') {
        // Godot Blue Core badge
        ctx.save();
        ctx.translate(c.x + c.w / 2, bobY + c.h / 2);

        // Ambient glow
        const glowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
        glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
        glowGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();

        // Diamond node
        ctx.rotate(time * 1.5 + c.bobOffset);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-8, -8, 16, 16);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, -4, 8, 8);

        ctx.restore();
      } else if (c.type === 'health') {
        // Nanite Health Cross
        ctx.save();
        ctx.translate(c.x + c.w / 2, bobY + c.h / 2);

        // Pulsing green glow
        const glow = Math.sin(time * 5) * 0.2 + 0.4;
        ctx.fillStyle = `rgba(34, 197, 94, ${glow})`;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();

        // Medical Cross
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(-10, -4, 20, 8);
        ctx.fillRect(-4, -10, 8, 20);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-6, -2, 12, 4);
        ctx.fillRect(-2, -6, 4, 12);

        ctx.restore();
      }
    }
  }

  private drawEnemies(enemies: Enemy[], time: number) {
    const ctx = this.ctx;

    for (const e of enemies) {
      if (e.isDead) continue;

      ctx.save();

      // Hit flash
      const isFlashing = e.hitFlashTimer > 0;

      // Telegraph warning lines/effects
      if (e.state === 'windup') {
        const warnAlpha = Math.sin(time * 25) * 0.3 + 0.5;
        ctx.strokeStyle = `rgba(239, 68, 68, ${warnAlpha})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);

        if (e.type === 'turret') {
          // Laser sight
          ctx.beginPath();
          ctx.moveTo(e.x + e.w / 2, e.y + e.h / 2);
          ctx.lineTo(e.x + (e.facing === 1 ? 400 : -400), e.y + e.h / 2);
          ctx.stroke();
        } else if (e.type === 'drone') {
          // Circle threat
          ctx.beginPath();
          ctx.arc(e.x + e.w / 2, e.y + e.h / 2, 50, 0, Math.PI * 2);
          ctx.stroke();
        } else if (e.type === 'boss') {
          // Giant boss charge circle & beam line
          ctx.beginPath();
          ctx.arc(e.x + e.w / 2, e.y + e.h / 2, 90, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = `rgba(239, 68, 68, ${warnAlpha * 0.3})`;
          ctx.beginPath();
          ctx.arc(e.x + e.w / 2, e.y + e.h / 2, 90, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.setLineDash([]);
      }

      if (e.type === 'slime') {
        // Cyber Slime
        const squish = Math.sin(time * 8) * 4;
        const curW = e.w + squish;
        const curH = e.h - squish;
        const drawX = e.x - squish / 2;
        const drawY = e.y + squish;

        ctx.fillStyle = isFlashing ? '#ffffff' : '#f43f5e';
        ctx.beginPath();
        ctx.roundRect(drawX, drawY, curW, curH, [18, 18, 4, 4]);
        ctx.fill();

        // Eye tracking
        const eyeX = drawX + curW / 2 + e.facing * 6;
        const eyeY = drawY + 14;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(eyeX + e.facing * 2, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'drone') {
        // Hovering Drone
        const hoverY = e.y + Math.sin(time * 6) * 4;
        ctx.fillStyle = isFlashing ? '#ffffff' : '#8b5cf6';
        ctx.beginPath();
        ctx.roundRect(e.x, hoverY, e.w, e.h, 8);
        ctx.fill();

        // Rotor blades
        const rotorAngle = time * 20;
        ctx.strokeStyle = '#c4b5fd';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(e.x - 4, hoverY - 2);
        ctx.lineTo(e.x + e.w + 4, hoverY - 2);
        ctx.stroke();

        // Thruster glow
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(e.x + e.w / 2 - 4, hoverY + e.h, 8, 4 + Math.sin(rotorAngle) * 2);

        // Cyclops sensor
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(e.x + e.w / 2 + e.facing * 4, hoverY + e.h / 2, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'turret') {
        // Fixed Turret
        ctx.fillStyle = isFlashing ? '#ffffff' : '#475569';
        // Base
        ctx.beginPath();
        ctx.moveTo(e.x, e.y + e.h);
        ctx.lineTo(e.x + 8, e.y + 12);
        ctx.lineTo(e.x + e.w - 8, e.y + 12);
        ctx.lineTo(e.x + e.w, e.y + e.h);
        ctx.closePath();
        ctx.fill();

        // Swivel Head
        ctx.fillStyle = isFlashing ? '#ffffff' : '#334155';
        ctx.beginPath();
        ctx.arc(e.x + e.w / 2, e.y + 16, 14, 0, Math.PI * 2);
        ctx.fill();

        // Barrel
        ctx.fillStyle = '#0ea5e9';
        const barrelX = e.facing === 1 ? e.x + e.w / 2 : e.x + e.w / 2 - 16;
        ctx.fillRect(barrelX, e.y + 12, 16, 8);
      } else if (e.type === 'boss') {
        // Boss: The Corrupted Godot Sentinel Core
        const bossY = e.y + Math.sin(time * 3) * 6;
        const centerX = e.x + e.w / 2;
        const centerY = bossY + e.h / 2;

        // Rotating energy shield rings
        ctx.strokeStyle = isFlashing ? '#ffffff' : (e.bossPhase === 2 ? '#ef4444' : '#38bdf8');
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 56, 24, time * 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 56, 24, -time * 2, 0, Math.PI * 2);
        ctx.stroke();

        // Boss Armor Body (Heavy Godot Robot Core shape)
        ctx.fillStyle = isFlashing ? '#ffffff' : '#1e293b';
        ctx.beginPath();
        ctx.roundRect(e.x, bossY, e.w, e.h, 16);
        ctx.fill();

        // Accent plates
        ctx.fillStyle = e.bossPhase === 2 ? '#dc2626' : '#478cbf';
        ctx.fillRect(e.x + 10, bossY + 12, e.w - 20, 10);
        ctx.fillRect(e.x + 14, bossY + 28, e.w - 28, e.h - 40);

        // Horns / Antennae
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(e.x + 12, bossY - 14, 8, 16);
        ctx.fillRect(e.x + e.w - 20, bossY - 14, 8, 16);

        // Core Reactor Eyes
        const eyeColor = e.bossPhase === 2 ? '#f87171' : '#38bdf8';
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(centerX - 18, centerY - 10, 8, 0, Math.PI * 2);
        ctx.arc(centerX + 18, centerY - 10, 8, 0, Math.PI * 2);
        ctx.fill();

        // Mouth / vent grill
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(centerX - 16, centerY + 18, 32, 10);
        ctx.fillStyle = eyeColor;
        for (let vx = centerX - 12; vx <= centerX + 12; vx += 6) {
          ctx.fillRect(vx, centerY + 20, 2, 6);
        }

        // Boss Health Bar above head
        const barW = 120;
        const barH = 8;
        const barX = centerX - barW / 2;
        const barY = bossY - 30;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);

        const hpPercent = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = e.bossPhase === 2 ? '#ef4444' : '#f59e0b';
        ctx.fillRect(barX, barY, barW * hpPercent, barH);

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`SENTINEL CORE: ${Math.round(e.hp)}/${e.maxHp}`, centerX, barY - 6);
      }

      // Small standard health bar for normal enemies
      if (e.type !== 'boss' && e.hp < e.maxHp) {
        const hpPct = Math.max(0, e.hp / e.maxHp);
        const barW = e.w;
        const barY = e.y - 8;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(e.x, barY, barW, 4);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(e.x, barY, barW * hpPct, 4);
      }

      ctx.restore();
    }
  }

  private drawProjectiles(projectiles: Projectile[]) {
    const ctx = this.ctx;

    for (const p of projectiles) {
      ctx.save();
      ctx.fillStyle = p.color;

      // Glowing orb
      ctx.beginPath();
      ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w / 2, 0, Math.PI * 2);
      ctx.fill();

      // Outer glow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  private drawPlayer(player: Player, time: number) {
    const ctx = this.ctx;

    // 1. Draw dash afterimages
    for (const ghost of player.trail) {
      ctx.save();
      ctx.globalAlpha = ghost.alpha * 0.4;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(ghost.x, ghost.y, player.w, player.h);
      ctx.restore();
    }

    // 2. Invulnerability flicker
    if (player.invulnerableTimer > 0 && Math.floor(time * 30) % 2 === 0) {
      return;
    }

    ctx.save();

    // Squash and stretch transform
    const centerX = player.x + player.w / 2;
    const bottomY = player.y + player.h;

    ctx.translate(centerX, bottomY);
    ctx.scale(player.squashX, player.squashY);
    ctx.translate(-player.w / 2, -player.h);

    // Thruster flame if moving or jumping
    if (!player.isGrounded || Math.abs(player.vx) > 20) {
      const flameH = 6 + Math.sin(time * 30) * 4;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(6, player.h);
      ctx.lineTo(player.w - 6, player.h);
      ctx.lineTo(player.w / 2, player.h + flameH);
      ctx.closePath();
      ctx.fill();
    }

    // Main Godot Cyber Knight Body
    // Armored legs
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(4, player.h - 12, 10, 12);
    ctx.fillRect(player.w - 14, player.h - 12, 10, 12);

    // Torso (Cyber Godot Blue Suit)
    ctx.fillStyle = '#478cbf';
    ctx.beginPath();
    ctx.roundRect(2, 12, player.w - 4, player.h - 22, 6);
    ctx.fill();

    // Chest Core (Node emblem)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(player.w / 2, 22, 4, 0, Math.PI * 2);
    ctx.fill();

    // Helmet
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(0, 0, player.w, 16, 6);
    ctx.fill();

    // Glowing Visor
    ctx.fillStyle = player.isDashing ? '#f59e0b' : '#38bdf8';
    const visorX = player.facing === 1 ? 12 : 2;
    ctx.fillRect(visorX, 5, player.w - 14, 5);

    // Flowing Cyber Scarf / Cape
    const scarfOffset = Math.sin(time * 12) * 4;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(player.facing === 1 ? 4 : player.w - 4, 14);
    ctx.lineTo(player.facing === 1 ? -12 - Math.abs(player.vx) * 0.05 : player.w + 12 + Math.abs(player.vx) * 0.05, 18 + scarfOffset);
    ctx.lineTo(player.facing === 1 ? -6 : player.w + 6, 24);
    ctx.closePath();
    ctx.fill();

    // Sword & Slash Arc
    if (player.isAttacking) {
      ctx.save();
      const slashProgress = 1 - (player.attackTimer / 0.22);
      const slashAngle = (player.facing === 1 ? -0.8 : 0.8) + (player.facing === 1 ? 2.2 : -2.2) * slashProgress;

      // Glowing energy sword blade
      ctx.strokeStyle = player.comboCount === 3 ? '#f59e0b' : '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      const bladeStartX = player.facing === 1 ? player.w - 4 : 4;
      const bladeEndX = bladeStartX + Math.cos(slashAngle) * 36 * player.facing;
      const bladeEndY = 16 + Math.sin(slashAngle) * 36;
      ctx.moveTo(bladeStartX, 16);
      ctx.lineTo(bladeEndX, bladeEndY);
      ctx.stroke();

      // Swooshing Arc Slash VFX
      ctx.strokeStyle = player.comboCount === 3 ? 'rgba(245, 158, 11, 0.8)' : 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      const arcCenter = bladeStartX;
      const startArc = player.facing === 1 ? -Math.PI * 0.4 : Math.PI * 0.6;
      const endArc = player.facing === 1 ? Math.PI * 0.3 : Math.PI * 1.3;
      ctx.arc(arcCenter, 16, 40, startArc, endArc, player.facing === -1);
      ctx.stroke();

      ctx.restore();
    } else {
      // Sheathed sword on back
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(player.facing === 1 ? 4 : player.w - 4, 8);
      ctx.lineTo(player.facing === 1 ? -6 : player.w + 6, 26);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawParticles(particles: Particle[]) {
    const ctx = this.ctx;

    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - p.life / p.maxLife + 0.3), 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.shape === 'spark') {
        ctx.fillRect(p.x - p.size, p.y - 1, p.size * 2, 2);
        ctx.fillRect(p.x - 1, p.y - p.size, 2, p.size * 2);
      } else {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }

      ctx.restore();
    }
  }

  private drawDamageNumbers(damageNumbers: DamageNumber[]) {
    const ctx = this.ctx;

    ctx.save();
    ctx.font = 'bold 16px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    for (const d of damageNumbers) {
      ctx.globalAlpha = d.alpha;
      ctx.fillStyle = d.color;
      // Outline for crisp readability
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(d.text, d.x, d.y);
      ctx.fillText(d.text, d.x, d.y);
    }

    ctx.restore();
  }
}
