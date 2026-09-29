import * as THREE from 'three';
import { ParticleType } from '../types/weapon';

interface ParticleData {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  r: number;
  g: number;
  b: number;
  size: number;
  life: number;
  maxLife: number;
  gravity: number;
}

// 閃電特效實體：利用 Three.js LineSegments 實現具備隨機折線、分支與閃爍屬性的 3D 閃電鏈弧
export interface LightningEffect {
  lineSegments: THREE.LineSegments;
  geometry: THREE.BufferGeometry;
  material: THREE.LineBasicMaterial;
  life: number;
  maxLife: number;
  baseOpacity: number;
  flickerSpeed: number;
  origin: THREE.Vector3;
}

const MAX_PARTICLES = 3000;

export class ParticleManager {
  private scene: THREE.Scene;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private points: THREE.Points;
  private particles: ParticleData[] = [];

  private positions: Float32Array;
  private colors: Float32Array;

  // 3D 衝擊波圓環幾何快取
  private shockwaves: { mesh: THREE.Mesh; life: number; maxLife: number; maxScale: number }[] = [];
  // 3D 閃電鏈幾何 (使用 LineSegments 進行隨機多分支閃爍雷弧渲染)
  private lightningEffects: LightningEffect[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.positions = new Float32Array(MAX_PARTICLES * 3);
    this.colors = new Float32Array(MAX_PARTICLES * 3);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    // 使用柔和圓形貼圖
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.4, 'rgba(255,255,255,0.8)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);

    this.material = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: texture,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }

  /**
   * 根據武器粒子種類在 3D 空間爆發粒子
   */
  public emit(pos: THREE.Vector3, type: ParticleType, count: number = 40) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= MAX_PARTICLES) break;

      // 向全 3D 空間球狀炸開，並且帶有往 +Z 軸噴向螢幕前鏡頭的衝力
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      let speed = Math.random() * 3.5 + 1.2;

      let vx = Math.sin(phi) * Math.cos(theta) * speed;
      let vy = Math.sin(phi) * Math.sin(theta) * speed + 1.0;
      let vz = Math.cos(phi) * speed + 1.5; // 朝玩家螢幕方向衝出

      let r = 1, g = 1, b = 1;
      let gravity = 4.5;
      let maxLife = 0.5 + Math.random() * 0.4;
      let size = 0.15;

      switch (type) {
        case 'wood': // 打狗棍木屑
          r = 0.7 + Math.random() * 0.2;
          g = 0.45 + Math.random() * 0.15;
          b = 0.15;
          gravity = 6.0;
          break;

        case 'feather': // 尖叫雞 / 貓爪羽毛
          if (Math.random() > 0.4) {
            r = 1.0; g = 0.85; b = 0.1; // 亮黃羽毛
          } else {
            r = 1.0; g = 0.4; b = 0.7; // 粉紅肉墊
          }
          gravity = 1.2; // 飄落
          vx *= 0.6;
          vy *= 0.6;
          maxLife = 0.9;
          break;

        case 'spark': // 金屬平底鍋、拖鞋、鍵盤火花
          r = 1.0;
          g = 0.6 + Math.random() * 0.4;
          b = 0.1;
          speed *= 1.4;
          maxLife = 0.35;
          gravity = 3.0;
          break;

        case 'gold': // 發財黃金磚金幣
          r = 1.0;
          g = 0.84;
          b = 0.0;
          vy += 2.5; // 噴發較高
          gravity = 7.0;
          maxLife = 0.8;
          break;

        case 'ice': // 極光冰錐
          r = 0.4 + Math.random() * 0.3;
          g = 0.9 + Math.random() * 0.1;
          b = 1.0;
          gravity = 5.0;
          break;

        case 'electric': // 閃電、雷射
          r = 0.3 + Math.random() * 0.3;
          g = 0.7 + Math.random() * 0.3;
          b = 1.0;
          gravity = 0; // 電火花漂浮
          maxLife = 0.3;
          break;

        case 'fire': // 火箭筒濃煙烈焰
          r = 1.0;
          g = 0.2 + Math.random() * 0.5;
          b = 0.05;
          speed *= 2.2;
          maxLife = 0.7;
          gravity = -0.5; // 熱氣流上升
          break;

        case 'juice': // 鮭魚水滴、榴槤果汁、吸盤
          r = 0.9;
          g = 0.3 + Math.random() * 0.4;
          b = 0.1;
          gravity = 6.5;
          break;

        case 'food': // 臭豆腐、麵包屑、珍珠
          r = 0.4 + Math.random() * 0.4;
          g = 0.7 + Math.random() * 0.2;
          b = 0.2;
          gravity = 5.5;
          break;

        case 'void': // 黑洞空間扭曲
          r = 0.6 + Math.random() * 0.3;
          g = 0.1;
          b = 0.9 + Math.random() * 0.1;
          // 黑洞粒子向中心拉扯
          vx = -vx * 0.5;
          vy = -vy * 0.5;
          vz = -vz * 0.5;
          gravity = 0;
          maxLife = 0.6;
          break;

        case 'dust': // 狙擊槍擊中爆破粉塵飛揚
          r = 0.78 + Math.random() * 0.15;
          g = 0.74 + Math.random() * 0.15;
          b = 0.68 + Math.random() * 0.15;
          speed *= 2.4;
          size *= 1.8;
          maxLife = 0.85;
          gravity = 1.2; // 煙塵微緩慢墜落飄散
          break;
      }

      this.particles.push({
        x: pos.x + (Math.random() - 0.5) * 0.2,
        y: pos.y + (Math.random() - 0.5) * 0.2,
        z: pos.z + (Math.random() - 0.5) * 0.2,
        vx,
        vy,
        vz,
        r,
        g,
        b,
        size,
        life: 0,
        maxLife,
        gravity,
      });
    }

    // 額外生成 3D 衝擊波圓環 (RingGeometry)
    this.createShockwave(pos, type);

    // 若是雷神之鎚或電系，觸發 3D 空間向四周擴散的隨機多分支閃電鏈弧 (LightningEffect)
    if (type === 'electric') {
      this.triggerLightningEffect(pos, 10);
    }
  }

  // 3D 衝擊波圓環
  private createShockwave(pos: THREE.Vector3, type: ParticleType) {
    const ringGeo = new THREE.RingGeometry(0.1, 0.2, 32);
    let color = 0xffffff;
    if (type === 'fire') color = 0xff4500;
    if (type === 'electric') color = 0x00ffff;
    if (type === 'gold') color = 0xffd700;
    if (type === 'void') color = 0x9400d3;

    const ringMat = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const mesh = new THREE.Mesh(ringGeo, ringMat);
    mesh.position.copy(pos);
    mesh.rotation.x = Math.PI * 0.2; // 略微傾斜面向相機
    this.scene.add(mesh);

    this.shockwaves.push({
      mesh,
      life: 0,
      maxLife: 0.35,
      maxScale: type === 'fire' || type === 'void' ? 8 : 4.5,
    });
  }

  /**
   * 觸發 3D 空間中的閃電效果 (LightningEffect)
   * 利用 Three.js LineSegments 產生具備隨機折線、分支與閃爍屬性的閃電鏈弧，
   * 在雷神之鎚擊中時於 3D 空間中觸發，實現從擊中點向四周擴散的閃電視覺效果。
   *
   * @param center 擊中點 3D 座標
   * @param branchCount 閃電主分支數量
   */
  public triggerLightningEffect(center: THREE.Vector3, branchCount: number = 8) {
    const linePositions: number[] = [];

    // 從擊中點 (center) 向四周各個立體方向擴散放射
    for (let b = 0; b < branchCount; b++) {
      // 隨機立體方向角
      const theta = (b / branchCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const phi = (Math.random() - 0.5) * Math.PI * 0.75;
      const length = 1.8 + Math.random() * 2.2;

      // 終點座標向四周發散
      const targetDir = new THREE.Vector3(
        Math.cos(theta) * Math.cos(phi),
        Math.sin(phi) + 0.2, // 略微往上方炸開
        Math.sin(theta) * Math.cos(phi) * 0.6
      ).normalize();

      const endPoint = center.clone().add(targetDir.multiplyScalar(length));

      // 產生主雷弧折線
      const steps = 7 + Math.floor(Math.random() * 5);
      let curr = center.clone();

      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        // 內插基準點
        const basePoint = new THREE.Vector3().lerpVectors(center, endPoint, t);
        // 加入鋸齒隨機性偏移
        const jitterAmount = Math.sin(t * Math.PI) * 0.45;
        const next = new THREE.Vector3(
          basePoint.x + (Math.random() - 0.5) * jitterAmount,
          basePoint.y + (Math.random() - 0.5) * jitterAmount,
          basePoint.z + (Math.random() - 0.5) * jitterAmount * 0.6
        );

        // 線段頂點對 (A -> B)
        linePositions.push(curr.x, curr.y, curr.z);
        linePositions.push(next.x, next.y, next.z);

        // 偶爾分岔出次級細小電弧 (Forking Sub-branch)
        if (s > 2 && Math.random() > 0.55) {
          const subDir = targetDir.clone().applyAxisAngle(
            new THREE.Vector3(0, 0, 1),
            (Math.random() - 0.5) * 1.5
          );
          const subEnd = curr.clone().add(subDir.multiplyScalar(0.6 + Math.random() * 0.7));
          linePositions.push(curr.x, curr.y, curr.z);
          linePositions.push(subEnd.x, subEnd.y, subEnd.z);
        }

        curr = next;
      }
    }

    // 建立 LineSegments 幾何與材質
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

    // 電光藍白或極光紫材質
    const isPurple = Math.random() > 0.6;
    const color = isPurple ? new THREE.Color(0xa78bfa) : new THREE.Color(0x67e8f9);

    const material = new THREE.LineBasicMaterial({
      color,
      linewidth: 3,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const lineSegments = new THREE.LineSegments(geometry, material);
    this.scene.add(lineSegments);

    const effect: LightningEffect = {
      lineSegments,
      geometry,
      material,
      life: 0,
      maxLife: 0.38 + Math.random() * 0.12,
      baseOpacity: 1.0,
      flickerSpeed: 35 + Math.random() * 20, // 隨機高頻閃爍速度
      origin: center.clone(),
    };

    this.lightningEffects.push(effect);
  }

  /**
   * 物理迴圈每幀更新粒子
   */
  public update(delta: number) {
    const dt = Math.min(delta, 0.05);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      // 重力加速度
      p.vy -= p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;

      // 阻力
      p.vx *= 0.97;
      p.vz *= 0.97;
    }

    // 更新點雲 Buffer
    const count = this.particles.length;
    for (let i = 0; i < count; i++) {
      const p = this.particles[i];
      const i3 = i * 3;
      this.positions[i3] = p.x;
      this.positions[i3 + 1] = p.y;
      this.positions[i3 + 2] = p.z;

      const progress = p.life / p.maxLife;
      const alpha = Math.max(0, 1 - progress);
      this.colors[i3] = p.r * alpha;
      this.colors[i3 + 1] = p.g * alpha;
      this.colors[i3 + 2] = p.b * alpha;
    }

    // 清除未使用點
    for (let i = count; i < MAX_PARTICLES; i++) {
      const i3 = i * 3;
      this.positions[i3] = 0;
      this.positions[i3 + 1] = -9999;
      this.positions[i3 + 2] = 0;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;

    // 更新 3D 衝擊波圓環
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life += dt;
      const progress = sw.life / sw.maxLife;
      if (progress >= 1) {
        this.scene.remove(sw.mesh);
        sw.mesh.geometry.dispose();
        (sw.mesh.material as THREE.Material).dispose();
        this.shockwaves.splice(i, 1);
      } else {
        const s = 1 + progress * sw.maxScale;
        sw.mesh.scale.set(s, s, s);
        (sw.mesh.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - progress);
      }
    }

    // 更新 3D 閃電鏈弧特效 (LineSegments LightningEffect)
    for (let i = this.lightningEffects.length - 1; i >= 0; i--) {
      const effect = this.lightningEffects[i];
      effect.life += dt;

      if (effect.life >= effect.maxLife) {
        this.scene.remove(effect.lineSegments);
        effect.geometry.dispose();
        effect.material.dispose();
        this.lightningEffects.splice(i, 1);
      } else {
        const progress = effect.life / effect.maxLife;
        // 高頻隨機閃爍係數 (Random Flickering Intensity)
        const flicker = (Math.sin(effect.life * effect.flickerSpeed) * 0.5 + 0.5) * (0.6 + Math.random() * 0.4);
        const fade = 1 - progress;
        effect.material.opacity = Math.max(0, fade * flicker);

        // 隨機微小抖動模擬電離空氣擾動
        if (Math.random() > 0.6) {
          const jitterScale = 1 + (Math.random() - 0.5) * 0.05;
          effect.lineSegments.scale.set(jitterScale, jitterScale, jitterScale);
        }
      }
    }
  }

  public dispose() {
    this.scene.remove(this.points);
    this.geometry.dispose();
    this.material.dispose();

    // 清理所有閃電效果
    for (const effect of this.lightningEffects) {
      this.scene.remove(effect.lineSegments);
      effect.geometry.dispose();
      effect.material.dispose();
    }
    this.lightningEffects = [];
  }
}
