import * as THREE from 'three';
import { WeaponConfig } from '../types/weapon';
import { WeaponAnimationEngine } from './WeaponAnimationEngine';
import { JigglePhysics } from '../physics/JigglePhysics';

/**
 * 在 3D 空間中渲染當前武器的模型/Sprite，並依據 20 種武器執行專屬 3D 空間動畫函數
 * 包含：拋射 (Projectile/Lob)、揮擊 (Swing/Slap/Slash)、連射 (Beam/Burst/Wind) 與後座力
 */
export class WeaponRenderer3D {
  public group: THREE.Group;
  private sprite: THREE.Sprite | null = null;
  private currentWeapon: WeaponConfig | null = null;
  private scene: THREE.Scene;
  private animationEngine: WeaponAnimationEngine;

  // 動畫計時與狀態
  private animTimer = 0;
  private isAttacking = false;
  private targetHitPos = new THREE.Vector3();
  private basePos = new THREE.Vector3();

  constructor(scene: THREE.Scene, jigglePhysics?: JigglePhysics) {
    this.scene = scene;
    this.animationEngine = new WeaponAnimationEngine(scene, jigglePhysics || new JigglePhysics());
    this.group = new THREE.Group();
    // 預設武器在近相機層
    this.group.position.set(0, 0, 3.5);
    scene.add(this.group);
  }

  /**
   * 當玩家更換武器時，即時在 3D 空間重新生成高解析度 3D Sprite / Mesh
   */
  public setWeapon(weapon: WeaponConfig) {
    this.currentWeapon = weapon;

    // 清除舊 Sprite
    if (this.sprite) {
      this.group.remove(this.sprite);
      this.sprite.geometry.dispose();
      (this.sprite.material as THREE.Material).dispose();
      this.sprite = null;
    }

    // 建立清晰的 2D Canvas 轉 3D Sprite 貼圖
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 256, 256);

      // 外發光
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 16;

      ctx.font = '160px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(weapon.icon, 128, 140);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    this.sprite = new THREE.Sprite(material);
    // 設定合適的 3D 大小
    this.sprite.scale.set(1.4, 1.4, 1);
    this.group.add(this.sprite);
  }

  /**
   * 更新滑鼠在 3D 空間的游標投影座標，使武器跟隨手持
   */
  public updateCursorPosition(worldPos: THREE.Vector3) {
    if (!this.isAttacking) {
      // 未打擊時平滑跟隨滑鼠 (擺在游標略右下方呈現手持感)
      this.group.position.lerp(new THREE.Vector3(worldPos.x + 0.35, worldPos.y - 0.35, 3.5), 0.35);
    }
  }

  /**
   * 觸發當前武器特定的 3D 空間攻擊動作
   */
  public triggerAttack(targetWorldPos: THREE.Vector3) {
    if (!this.currentWeapon || !this.sprite) return;
    this.isAttacking = true;
    this.animTimer = 0;
    this.targetHitPos.copy(targetWorldPos);
    // 記錄攻擊起點，每幀以絕對位置 (base + offset) 計算，避免 += 累積漂移
    this.basePos.copy(this.group.position);
  }

  /**
   * 每幀 3D 武器動畫迴圈
   */
  public update(delta: number) {
    // 1. 更新 3D 空間拋射物飛行運動
    this.animationEngine.update(delta);

    if (!this.sprite || !this.currentWeapon) return;

    if (this.isAttacking) {
      this.animTimer += delta;
      const t = this.animTimer;
      const pattern = this.currentWeapon.animPattern;

      this.group.position.copy(this.basePos);
      const isFinished = this.animationEngine.updateWeaponAnimation(
        pattern,
        this.sprite,
        this.group,
        t,
        this.currentWeapon.id
      );

      if (isFinished) {
        this.isAttacking = false;
        this.group.position.copy(this.basePos);
        (this.sprite.material as THREE.SpriteMaterial).rotation = 0;
        this.sprite.scale.set(1.4, 1.4, 1);
      }
    } else {
      // 待機輕微呼吸浮動
      const idleTime = performance.now() * 0.003;
      this.sprite.position.y = Math.sin(idleTime) * 0.06;
    }
  }

  public setVisible(visible: boolean) {
    this.group.visible = visible;
  }

  public dispose() {
    this.animationEngine.dispose();
    if (this.sprite) {
      this.group.remove(this.sprite);
      this.sprite.geometry.dispose();
      (this.sprite.material as THREE.Material).dispose();
    }
    this.scene.remove(this.group);
  }
}
