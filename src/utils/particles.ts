export type ParticleType = 'slipper' | 'chicken' | 'bat' | 'egg' | 'tomato' | 'duck' | 'grenade' | 'laser_gun' | 'shotgun' | 'lightning';

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: ParticleType;
  shape: 'circle' | 'rect' | 'feather' | 'star' | 'spark';
  rotation: number;
  vRot: number;

  constructor(x: number, y: number, type: ParticleType) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.life = 1;
    this.rotation = Math.random() * Math.PI * 2;
    this.vRot = (Math.random() - 0.5) * 0.3;

    const angle = Math.random() * Math.PI * 2;

    switch (type) {
      case 'slipper': // 拖鞋：羽毛、藍色碎屑、灰塵
        this.maxLife = Math.random() * 20 + 20;
        this.size = Math.random() * 8 + 4;
        this.shape = Math.random() > 0.4 ? 'feather' : 'circle';
        this.color = Math.random() > 0.5 ? '#3b82f6' : (Math.random() > 0.5 ? '#cbd5e1' : '#f8fafc');
        const sSpeed = Math.random() * 12 + 4;
        this.vx = Math.cos(angle) * sSpeed;
        this.vy = Math.sin(angle) * sSpeed;
        break;

      case 'chicken': // 尖叫雞：黃色與紅色羽毛
        this.maxLife = Math.random() * 25 + 20;
        this.size = Math.random() * 10 + 5;
        this.shape = 'feather';
        this.color = Math.random() > 0.3 ? '#facc15' : '#ef4444';
        const cSpeed = Math.random() * 14 + 5;
        this.vx = Math.cos(angle) * cSpeed;
        this.vy = Math.sin(angle) * cSpeed;
        break;

      case 'bat': // 球棒：強力衝擊波星星
        this.maxLife = Math.random() * 18 + 15;
        this.size = Math.random() * 10 + 6;
        this.shape = 'star';
        this.color = Math.random() > 0.5 ? '#fbbf24' : '#f97316';
        const bSpeed = Math.random() * 18 + 6;
        this.vx = Math.cos(angle) * bSpeed;
        this.vy = Math.sin(angle) * bSpeed;
        break;

      case 'egg': // 臭雞蛋：黃色蛋汁 + 白色蛋殼碎片
        this.maxLife = Math.random() * 25 + 25;
        this.size = Math.random() * 9 + 4;
        this.shape = Math.random() > 0.4 ? 'circle' : 'rect';
        this.color = Math.random() > 0.4 ? '#facc15' : (Math.random() > 0.5 ? '#fef08a' : '#f1f5f9');
        const eSpeed = Math.random() * 10 + 3;
        this.vx = Math.cos(angle) * eSpeed;
        this.vy = Math.sin(angle) * eSpeed;
        break;

      case 'tomato': // 大番茄：紅色濃稠番茄汁
        this.maxLife = Math.random() * 25 + 25;
        this.size = Math.random() * 10 + 5;
        this.shape = 'circle';
        this.color = Math.random() > 0.5 ? '#ef4444' : '#b91c1c';
        const tSpeed = Math.random() * 11 + 4;
        this.vx = Math.cos(angle) * tSpeed;
        this.vy = Math.sin(angle) * tSpeed;
        break;

      case 'duck': // 尖叫鴨：黃色羽毛與水花
        this.maxLife = Math.random() * 22 + 20;
        this.size = Math.random() * 9 + 4;
        this.shape = 'feather';
        this.color = Math.random() > 0.4 ? '#38bdf8' : '#facc15';
        const dSpeed = Math.random() * 12 + 4;
        this.vx = Math.cos(angle) * dSpeed;
        this.vy = Math.sin(angle) * dSpeed;
        break;

      case 'grenade': // 手榴彈大爆炸：火焰、濃煙、碎片
        this.maxLife = Math.random() * 32 + 25;
        this.size = Math.random() * 16 + 8;
        this.shape = Math.random() > 0.5 ? 'circle' : 'star';
        this.color = Math.random() > 0.5 ? '#ea580c' : (Math.random() > 0.5 ? '#dc2626' : '#facc15');
        const grSpeed = Math.random() * 24 + 10;
        this.vx = Math.cos(angle) * grSpeed;
        this.vy = Math.sin(angle) * grSpeed;
        break;

      case 'laser_gun': // 雷射槍：亮綠/粉紅能量火花
        this.maxLife = Math.random() * 18 + 12;
        this.size = Math.random() * 10 + 4;
        this.shape = 'spark';
        this.color = Math.random() > 0.5 ? '#a855f7' : '#ec4899';
        const lgSpeed = Math.random() * 20 + 8;
        this.vx = Math.cos(angle) * lgSpeed;
        this.vy = Math.sin(angle) * lgSpeed;
        break;

      case 'shotgun': // 獵槍：火藥火花與硝煙
        this.maxLife = Math.random() * 20 + 15;
        this.size = Math.random() * 10 + 5;
        this.shape = Math.random() > 0.5 ? 'spark' : 'circle';
        this.color = Math.random() > 0.4 ? '#f59e0b' : '#ef4444';
        const sgSpeed = Math.random() * 22 + 10;
        this.vx = Math.cos(angle) * sgSpeed;
        this.vy = Math.sin(angle) * sgSpeed;
        break;

      case 'lightning': // 閃電：藍白電弧火花
      default:
        this.maxLife = Math.random() * 16 + 12;
        this.size = Math.random() * 12 + 6;
        this.shape = 'spark';
        this.color = Math.random() > 0.5 ? '#60a5fa' : '#38bdf8';
        const lSpeed = Math.random() * 24 + 10;
        this.vx = Math.cos(angle) * lSpeed;
        this.vy = Math.sin(angle) * lSpeed;
        break;
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.vRot;

    // 重力衰減
    if (this.type === 'egg' || this.type === 'tomato') {
      this.vy += 0.45;
    } else if (this.type === 'slipper' || this.type === 'chicken' || this.type === 'duck') {
      this.vy += 0.25;
      this.vx *= 0.95;
    } else if (this.type === 'laser_gun' || this.type === 'lightning') {
      this.vx *= 0.92;
      this.vy *= 0.92;
    } else {
      this.vy += 0.35;
      this.vx *= 0.94;
    }

    this.life++;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const alpha = Math.max(0, 1 - this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.shape === 'star') {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * this.size, -Math.sin(((18 + i * 72) * Math.PI) / 180) * this.size);
        ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * (this.size / 2), -Math.sin(((54 + i * 72) * Math.PI) / 180) * (this.size / 2));
      }
      ctx.closePath();
      ctx.fill();
    } else if (this.shape === 'feather') {
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 1.5, this.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === 'spark') {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-this.size, 0);
      ctx.lineTo(this.size, 0);
      ctx.moveTo(0, -this.size);
      ctx.lineTo(0, this.size);
      ctx.stroke();
    } else if (this.shape === 'rect') {
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

export class ParticleSystem {
  ctx: CanvasRenderingContext2D | null = null;
  particles: Particle[] = [];
  animationFrameId: number = 0;

  init(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d');
    this.resize(canvas);
    window.addEventListener('resize', () => this.resize(canvas));
    this.loop();
  }

  resize(canvas: HTMLCanvasElement) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  emit(x: number, y: number, type: string, count: number = 25) {
    const validTypes: ParticleType[] = ['slipper', 'chicken', 'bat', 'egg', 'tomato', 'duck', 'grenade', 'laser_gun', 'shotgun', 'lightning'];
    const pType: ParticleType = validTypes.includes(type as ParticleType) ? (type as ParticleType) : 'grenade';
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, pType));
    }
  }

  loop = () => {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      p.draw(this.ctx);
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  destroy() {
    cancelAnimationFrame(this.animationFrameId);
  }
}

export const particleSystem = new ParticleSystem();
