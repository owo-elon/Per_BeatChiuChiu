import * as THREE from 'three';
import { AnimPattern, WeaponConfig } from '../types/weapon';
import { JigglePhysics } from '../physics/JigglePhysics';

/**
 * 3D 視覺拋射、射擊或連射的飛行動態物件
 */
export interface ActiveVisual3DProjectile {
  id: number;
  weapon: WeaponConfig;
  type: 'projectile' | 'beam' | 'slash' | 'drop' | 'vortex' | 'fan_stream';
  mesh: THREE.Object3D;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  progress: number;
  speed: number; // 飛行時間倒數 (秒)
  onHit: () => void;
}

/**
 * 20 種武器的專屬 JavaScript 3D 動畫函數庫 (WeaponAnimationEngine)
 * 針對拋射 (projectile/lob)、揮擊 (swing/slap/slash)、連射 (beam/stream/burst)
 * 提供精確計算的 3D 空間運動曲線、幾何頂點變形、旋轉矩陣，
 * 並在擊中目標瞬間與 JigglePhysics 胡克定律 (Hooke's Law: F = -k*x - c*v) 達成完全無縫物理同步！
 */
export class WeaponAnimationEngine {
  private scene: THREE.Scene;
  private jigglePhysics: JigglePhysics;
  private activeProjectiles: ActiveVisual3DProjectile[] = [];

  constructor(scene: THREE.Scene, jigglePhysics: JigglePhysics) {
    this.scene = scene;
    this.jigglePhysics = jigglePhysics;
  }

  // ==========================================
  // 1. 打狗棍：大開大闔側向破空橫掃 (Swing Animation)
  // ==========================================
  public animateDogStick(
    sprite: THREE.Sprite,
    group: THREE.Group,
    t: number,
    duration: number = 0.18
  ): boolean {
    const p = Math.min(1, t / duration);
    // 蓄力後迅猛橫掃：-60度 到 +80度
    const swingAngle = THREE.MathUtils.lerp(-1.1, 1.4, Math.sin(p * Math.PI * 0.5));
    (sprite.material as THREE.SpriteMaterial).rotation = swingAngle;
    group.position.x += Math.sin(p * Math.PI) * 0.45;
    sprite.scale.set(1.4 + Math.sin(p * Math.PI) * 0.5, 1.4, 1);
    return p >= 1;
  }

  // ==========================================
  // 2. 尖叫雞：急速受壓捏扁與彈性回彈 (Squeeze Animation)
  // ==========================================
  public animateChicken(
    sprite: THREE.Sprite,
    _group: THREE.Group,
    t: number,
    duration: number = 0.2
  ): boolean {
    const p = Math.min(1, t / duration);
    // Y軸垂直壓縮，X/Z軸被動橫向膨脹 (遵循體積守恆果凍感)
    const compression = Math.sin(p * Math.PI);
    sprite.scale.set(1.4 + compression * 0.7, 1.4 - compression * 0.6, 1);
    (sprite.material as THREE.SpriteMaterial).rotation = Math.sin(p * Math.PI * 2) * 0.25;
    return p >= 1;
  }

  // ==========================================
  // 3. 台味藍白拖：高頻反覆抽打啪啪啪 (Slap Animation)
  // ==========================================
  public animateSlipper(
    sprite: THREE.Sprite,
    _group: THREE.Group,
    t: number,
    duration: number = 0.15
  ): boolean {
    const p = Math.min(1, t / duration);
    // 高速左右抽打搖擺
    const slapRot = Math.sin(p * Math.PI * 5) * 0.7;
    (sprite.material as THREE.SpriteMaterial).rotation = slapRot;
    sprite.scale.set(1.4, 1.4 - Math.sin(p * Math.PI) * 0.35, 1);
    return p >= 1;
  }

  // ==========================================
  // 4. 平底鍋：金屬重揮與強烈弧度 (Pan Swing Animation)
  // ==========================================
  public animateFryingPan(
    sprite: THREE.Sprite,
    group: THREE.Group,
    t: number,
    duration: number = 0.19
  ): boolean {
    const p = Math.min(1, t / duration);
    const rot = THREE.MathUtils.lerp(-1.3, 1.2, p);
    (sprite.material as THREE.SpriteMaterial).rotation = rot;
    group.position.x -= Math.sin(p * Math.PI) * 0.5;
    group.position.y += Math.sin(p * Math.PI) * 0.25;
    sprite.scale.set(1.4 + Math.sin(p * Math.PI) * 0.4, 1.4 + Math.sin(p * Math.PI) * 0.4, 1);
    return p >= 1;
  }

  // ==========================================
  // 5. 發財黃金磚：高空直墜衝擊重力 (Fall Crush Animation)
  // ==========================================
  public animateGoldenBrick(
    sprite: THREE.Sprite,
    group: THREE.Group,
    t: number,
    duration: number = 0.22
  ): boolean {
    const p = Math.min(1, t / duration);
    // 拋物線重墜
    if (p < 0.7) {
      group.position.y += (1 - p / 0.7) * 0.8;
      sprite.scale.set(1.4, 1.4, 1);
    } else {
      // 著地重壓形變
      const impactP = (p - 0.7) / 0.3;
      sprite.scale.set(1.4 + (1 - impactP) * 0.6, 1.4 - (1 - impactP) * 0.5, 1);
    }
    return p >= 1;
  }

  // ==========================================
  // 6. 脈衝雷射槍：高能連射與能量槍管後座力 (Beam Stream Animation)
  // ==========================================
  public animateLaserBlaster(
    sprite: THREE.Sprite,
    group: THREE.Group,
    t: number,
    duration: number = 0.1
  ): boolean {
    const p = Math.min(1, t / duration);
    const kickback = Math.sin(p * Math.PI) * 0.35;
    group.position.z -= kickback * 0.4;
    group.position.y -= kickback * 0.15;
    sprite.scale.set(1.4 - kickback * 0.2, 1.4 + kickback * 0.3, 1);
    return p >= 1;
  }

  // ==========================================
  // 7. 火箭筒：直線火箭彈推進 3D 彈道 (Rocket Shoot Animation)
  // ==========================================
  public spawn3DRocketTrajectory(
    startWorldPos: THREE.Vector3,
    targetWorldPos: THREE.Vector3,
    onHitCallback: () => void
  ) {
    // 建立 3D 飛彈幾何體 (圓柱體火箭彈身 + 圓錐火箭彈頭)
    const rocketGroup = new THREE.Group();
    const bodyGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 16);
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.rotation.x = Math.PI / 2;
    rocketGroup.add(bodyMesh);

    const tipGeo = new THREE.ConeGeometry(0.14, 0.35, 16);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const tipMesh = new THREE.Mesh(tipGeo, tipMat);
    tipMesh.rotation.x = -Math.PI / 2;
    tipMesh.position.z = 0.45;
    rocketGroup.add(tipMesh);

    rocketGroup.position.copy(startWorldPos);
    rocketGroup.lookAt(targetWorldPos);
    this.scene.add(rocketGroup);

    this.activeProjectiles.push({
      id: Date.now() + Math.random(),
      weapon: {} as WeaponConfig,
      type: 'projectile',
      mesh: rocketGroup,
      startPos: startWorldPos.clone(),
      targetPos: targetWorldPos.clone(),
      progress: 0,
      speed: 0.24, // 0.24 秒直線衝刺命中
      onHit: onHitCallback,
    });
  }

  // ==========================================
  // 8. 阿嬤臭豆腐：3D 拋物線重力弧線丟擲 (Lob Throw Animation)
  // ==========================================
  public spawn3DLobTrajectory(
    startWorldPos: THREE.Vector3,
    targetWorldPos: THREE.Vector3,
    onHitCallback: () => void
  ) {
    // 建立 3D 金黃方塊臭豆腐
    const tofuGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
    const tofuMat = new THREE.MeshBasicMaterial({ color: 0xeab308 });
    const tofuMesh = new THREE.Mesh(tofuGeo, tofuMat);
    tofuMesh.position.copy(startWorldPos);
    this.scene.add(tofuMesh);

    this.activeProjectiles.push({
      id: Date.now() + Math.random(),
      weapon: {} as WeaponConfig,
      type: 'projectile',
      mesh: tofuMesh,
      startPos: startWorldPos.clone(),
      targetPos: targetWorldPos.clone(),
      progress: 0,
      speed: 0.34, // 拋物線飛行時間
      onHit: onHitCallback,
    });
  }

  // ==========================================
  // 9. 雷神之鎚：天頂引雷蓄勢重擊 (Thunder Hammer Animation)
  // ==========================================
  public animateThunderHammer(
    sprite: THREE.Sprite,
    group: THREE.Group,
    t: number,
    duration: number = 0.22
  ): boolean {
    const p = Math.min(1, t / duration);
    if (p < 0.4) {
      // 擎天蓄雷
      group.position.y += (p / 0.4) * 0.6;
      (sprite.material as THREE.SpriteMaterial).rotation = -0.5 * (p / 0.4);
    } else {
      // 迅雷猛砸
      const slamP = (p - 0.4) / 0.6;
      group.position.y -= slamP * 0.7;
      (sprite.material as THREE.SpriteMaterial).rotation = THREE.MathUtils.lerp(-0.5, 0.8, slamP);
    }
    return p >= 1;
  }

  // ==========================================
  // 10. 鮮美大鮭魚：魚身水流波浪甩動抽打 (Salmon Slap Animation)
  // ==========================================
  public animateSalmon(
    sprite: THREE.Sprite,
    _group: THREE.Group,
    t: number,
    duration: number = 0.16
  ): boolean {
    const p = Math.min(1, t / duration);
    const wave = Math.sin(p * Math.PI * 4);
    (sprite.material as THREE.SpriteMaterial).rotation = wave * 0.8;
    sprite.scale.set(1.4 + wave * 0.3, 1.4 - Math.abs(wave) * 0.3, 1);
    return p >= 1;
  }

  // ==========================================
  // 11. 萬能馬桶吸盤：向前拉伸與強力啵啵回彈 (Plunger Pull Animation)
  // ==========================================
  public animatePlunger(
    sprite: THREE.Sprite,
    _group: THREE.Group,
    t: number,
    duration: number = 0.22
  ): boolean {
    const p = Math.min(1, t / duration);
    if (p < 0.6) {
      // 吸附拉扯向外延伸
      const pull = p / 0.6;
      sprite.scale.set(1.4 - pull * 0.4, 1.4 + pull * 0.9, 1);
    } else {
      // 啵一聲回彈
      const popP = (p - 0.6) / 0.4;
      sprite.scale.set(1.4 + (1 - popP) * 0.5, 1.4 - (1 - popP) * 0.4, 1);
    }
    return p >= 1;
  }

  // ==========================================
  // 12. 極光冰錐：極速直線突刺與穿刺凍結 (Ice Pierce Animation)
  // ==========================================
  public animateIceSpike(
    sprite: THREE.Sprite,
    group: THREE.Group,
    t: number,
    duration: number = 0.15
  ): boolean {
    const p = Math.min(1, t / duration);
    const thrust = Math.sin(p * Math.PI);
    group.position.z -= thrust * 0.8;
    group.position.x += thrust * 0.3;
    sprite.scale.set(1.4 - thrust * 0.2, 1.4 + thrust * 0.5, 1);
    return p >= 1;
  }

  // ==========================================
  // 13. 狂暴榴槤槌：重型狼牙重度砸擊 (Durian Mace Animation)
  // ==========================================
  public animateDurianMace(
    sprite: THREE.Sprite,
    group: THREE.Group,
    t: number,
    duration: number = 0.2
  ): boolean {
    const p = Math.min(1, t / duration);
    const slam = THREE.MathUtils.lerp(-1.0, 1.3, Math.sin(p * Math.PI * 0.5));
    (sprite.material as THREE.SpriteMaterial).rotation = slam;
    group.position.y += Math.sin(p * Math.PI) * 0.4;
    return p >= 1;
  }

  // ==========================================
  // 14. RGB 機械鍵盤：整把猛砸旋轉 (Keyboard Smash Animation)
  // ==========================================
  public animateKeyboard(
    sprite: THREE.Sprite,
    group: THREE.Group,
    t: number,
    duration: number = 0.18
  ): boolean {
    const p = Math.min(1, t / duration);
    (sprite.material as THREE.SpriteMaterial).rotation = THREE.MathUtils.lerp(-0.7, 0.9, p);
    group.position.y -= Math.sin(p * Math.PI) * 0.45;
    sprite.scale.set(1.4 + Math.sin(p * Math.PI) * 0.4, 1.4, 1);
    return p >= 1;
  }

  // ==========================================
  // 15. 粉紅貓爪肉墊：超 Q 彈軟萌輕拍 (Cat Paw Squeeze Animation)
  // ==========================================
  public animateCatPaw(
    sprite: THREE.Sprite,
    _group: THREE.Group,
    t: number,
    duration: number = 0.18
  ): boolean {
    const p = Math.min(1, t / duration);
    const bounce = Math.sin(p * Math.PI);
    sprite.scale.set(1.4 + bounce * 0.6, 1.4 + bounce * 0.6, 1);
    (sprite.material as THREE.SpriteMaterial).rotation = Math.sin(p * Math.PI * 3) * 0.2;
    return p >= 1;
  }

  // ==========================================
  // 16. 法式長棍麵包：鋼鐵般堅硬橫揮 (Baguette Swing Animation)
  // ==========================================
  public animateBaguette(
    sprite: THREE.Sprite,
    _group: THREE.Group,
    t: number,
    duration: number = 0.17
  ): boolean {
    const p = Math.min(1, t / duration);
    (sprite.material as THREE.SpriteMaterial).rotation = THREE.MathUtils.lerp(-0.9, 1.1, p);
    sprite.scale.set(1.4, 1.4 + Math.sin(p * Math.PI) * 0.4, 1);
    return p >= 1;
  }

  // ==========================================
  // 17. 工業大風扇：高速渦輪旋轉狂風氣流 (Fan Tornado Stream Animation)
  // ==========================================
  public animateFan(
    sprite: THREE.Sprite,
    _group: THREE.Group,
    t: number,
    duration: number = 0.1
  ): boolean {
    const p = Math.min(1, t / duration);
    // 高速順時針旋轉渦輪
    (sprite.material as THREE.SpriteMaterial).rotation += Math.PI * 2 * 0.4;
    sprite.scale.set(1.4 + Math.sin(p * Math.PI) * 0.2, 1.4 + Math.sin(p * Math.PI) * 0.2, 1);
    return p >= 1;
  }

  // ==========================================
  // 18. 爆漿珍奶砲：3D 波霸黑糖珍珠連射彈道 (Boba Burst Trajectory)
  // ==========================================
  public spawn3DBobaTrajectory(
    startWorldPos: THREE.Vector3,
    targetWorldPos: THREE.Vector3,
    onHitCallback: () => void
  ) {
    // 建立 3D 光滑黑色珍珠球體
    const bobaGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const bobaMat = new THREE.MeshBasicMaterial({ color: 0x1f1917 });
    const bobaMesh = new THREE.Mesh(bobaGeo, bobaMat);
    bobaMesh.position.copy(startWorldPos);
    this.scene.add(bobaMesh);

    this.activeProjectiles.push({
      id: Date.now() + Math.random(),
      weapon: {} as WeaponConfig,
      type: 'projectile',
      mesh: bobaMesh,
      startPos: startWorldPos.clone(),
      targetPos: targetWorldPos.clone(),
      progress: 0,
      speed: 0.16, // 連發超高速打擊
      onHit: onHitCallback,
    });
  }

  // ==========================================
  // 19. 光速量子劍：3D 霓虹刀光切削軌跡 (Saber Slash Animation)
  // ==========================================
  public animateLightsaber(
    sprite: THREE.Sprite,
    group: THREE.Group,
    t: number,
    duration: number = 0.16
  ): boolean {
    const p = Math.min(1, t / duration);
    (sprite.material as THREE.SpriteMaterial).rotation = THREE.MathUtils.lerp(-1.4, 1.5, p);
    group.position.x += Math.sin(p * Math.PI) * 0.6;
    sprite.scale.set(1.4 + Math.sin(p * Math.PI) * 0.7, 1.4, 1);
    return p >= 1;
  }

  // ==========================================
  // 20. 微型黑洞產生器：空間扭曲坍縮引力 (Black Hole Vortex Collapse)
  // ==========================================
  public animateBlackHole(
    sprite: THREE.Sprite,
    _group: THREE.Group,
    t: number,
    duration: number = 0.35
  ): boolean {
    const p = Math.min(1, t / duration);
    // 高速引力自轉與空間向內吸入
    (sprite.material as THREE.SpriteMaterial).rotation += 0.45;
    if (p < 0.7) {
      const s = 1.4 + (p / 0.7) * 0.8;
      sprite.scale.set(s, s, 1);
    } else {
      // 驟然坍縮奇異點
      const collapse = (p - 0.7) / 0.3;
      const s = 2.2 * (1 - collapse);
      sprite.scale.set(s, s, 1);
    }
    return p >= 1;
  }

  // ==========================================
  // 21. 狙擊槍：極致後座力震退與超音速破空 (Sniper Shot Animation)
  // ==========================================
  public animateSniper(
    sprite: THREE.Sprite,
    group: THREE.Group,
    t: number,
    duration: number = 0.24
  ): boolean {
    const p = Math.min(1, t / duration);
    // 劇烈槍口上揚與槍身後座力
    const recoil = Math.sin(p * Math.PI);
    group.position.x -= recoil * 0.65;
    group.position.y -= recoil * 0.35;
    (sprite.material as THREE.SpriteMaterial).rotation = -recoil * 0.45;
    sprite.scale.set(1.4 + recoil * 0.3, 1.4 + recoil * 0.3, 1);
    return p >= 1;
  }

  // ==========================================
  // 核心統一調度函數：根據 20 種武器的 animPattern 執行對應動畫
  // ==========================================
  public updateWeaponAnimation(
    pattern: AnimPattern,
    sprite: THREE.Sprite,
    group: THREE.Group,
    t: number
  ): boolean {
    switch (pattern) {
      case 'swing':
        return this.animateDogStick(sprite, group, t);
      case 'slap':
        return this.animateSlipper(sprite, group, t);
      case 'squeeze':
        return this.animateChicken(sprite, group, t);
      case 'fall_crush':
        return this.animateGoldenBrick(sprite, group, t);
      case 'beam':
        return this.animateLaserBlaster(sprite, group, t);
      case 'lightning_strike':
        return this.animateThunderHammer(sprite, group, t);
      case 'plunger_pull':
        return this.animatePlunger(sprite, group, t);
      case 'ice_pierce':
        return this.animateIceSpike(sprite, group, t);
      case 'keyboard_smash':
        return this.animateKeyboard(sprite, group, t);
      case 'tornado_wind':
        return this.animateFan(sprite, group, t);
      case 'saber_slash':
        return this.animateLightsaber(sprite, group, t);
      case 'vortex_collapse':
        return this.animateBlackHole(sprite, group, t);
      case 'sniper_shot':
        return this.animateSniper(sprite, group, t);
      default:
        return this.animateDogStick(sprite, group, t);
    }
  }

  // ==========================================
  // 每幀更新 3D 空間中的拋射物與連射路徑，並在命中時觸發胡克定律
  // ==========================================
  public update(delta: number) {
    for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
      const proj = this.activeProjectiles[i];
      proj.progress += delta / proj.speed;

      if (proj.progress >= 1) {
        // 到達擊中點
        proj.onHit();
        this.scene.remove(proj.mesh);
        if (proj.mesh instanceof THREE.Mesh) {
          proj.mesh.geometry.dispose();
          if (Array.isArray(proj.mesh.material)) {
            proj.mesh.material.forEach(m => m.dispose());
          } else {
            proj.mesh.material.dispose();
          }
        }
        this.activeProjectiles.splice(i, 1);
      } else {
        const p = proj.progress;
        // 線性前進
        const curr = new THREE.Vector3().lerpVectors(proj.startPos, proj.targetPos, p);

        // 若為拋物線，增加 Y 軸高度拋射重力弧度
        if (proj.mesh instanceof THREE.Mesh && proj.mesh.geometry instanceof THREE.BoxGeometry) {
          const arcHeight = Math.sin(p * Math.PI) * 2.2;
          curr.y += arcHeight;
          proj.mesh.rotation.x += delta * 12;
          proj.mesh.rotation.y += delta * 10;
        }

        proj.mesh.position.copy(curr);
      }
    }
  }

  public dispose() {
    for (const proj of this.activeProjectiles) {
      this.scene.remove(proj.mesh);
    }
    this.activeProjectiles = [];
  }
}
