import * as THREE from 'three';
import { PhysicalForce } from '../types/weapon';

/**
 * 基於胡克定律 (Hooke's Law: F = -k*x - c*v) 與阻尼的 3D 彈簧物理引擎
 */
export class JigglePhysics {
  // 當前位移 (Position Offset)
  public positionOffset = new THREE.Vector3(0, 0, 0);
  // 當前速度 (Velocity)
  public velocity = new THREE.Vector3(0, 0, 0);

  // 當前旋轉角度 (Euler Rotation Offset)
  public rotationOffset = new THREE.Euler(0, 0, 0);
  // 角速度 (Angular Velocity)
  public angularVelocity = new THREE.Vector3(0, 0, 0);

  // 縮放果凍形變 (Scale Deformation)
  public scaleOffset = new THREE.Vector3(1, 1, 1);
  public scaleVelocity = new THREE.Vector3(0, 0, 0);

  // 當前剛度與阻尼
  private stiffness = 200;
  private damping = 0.8;
  private tmpRot = new THREE.Vector3();
  private tmpScale = new THREE.Vector3();

  /**
   * 施加衝擊力 (Impulse)
   * @param forceParam 武器物理參數
   * @param hitDirection 打擊方向向量
   */
  public applyImpulse(forceParam: PhysicalForce, hitDirection: THREE.Vector3, weaponId: string) {
    this.stiffness = forceParam.stiffness;
    this.damping = forceParam.damping;

    const force = forceParam.impulse * 0.08;

    // 根據 20 種武器的專屬打擊物理特性，注入精確的線性速度、角速度與果凍形變速度，與胡克定律完美同步
    switch (weaponId) {
      case 'dog_stick': // 1. 打狗棍：強烈側向橫掃（Z軸傾斜 + X軸偏移 + 彈簧晃動）
        this.velocity.x += (Math.random() > 0.5 ? 1 : -1) * force * 1.5;
        this.velocity.y += force * 0.4;
        this.angularVelocity.z += (Math.random() > 0.5 ? 1 : -1) * force * 0.25;
        this.scaleVelocity.set(-0.3 * force, 0.4 * force, -0.2 * force);
        break;

      case 'chicken': // 2. 尖叫雞：高頻率垂直彈跳 + 體積守恆擠壓變形
        this.velocity.y += force * 1.6;
        this.scaleVelocity.set(0.6 * force, -0.7 * force, 0.6 * force);
        this.angularVelocity.z += (Math.random() - 0.5) * force * 0.3;
        break;

      case 'slipper': // 3. 藍白拖：極高頻正向震動 + 壓扁回彈
        this.velocity.z -= force * 1.8;
        this.scaleVelocity.set(0.5 * force, 0.5 * force, -0.8 * force);
        this.angularVelocity.z += (Math.random() - 0.5) * force * 0.2;
        break;

      case 'frying_pan': // 4. 平底鍋：橫向重擊頭暈旋轉（Y軸大幅轉動 + 劇烈震盪）
        this.angularVelocity.y += (Math.random() > 0.5 ? 1 : -1) * force * 0.55;
        this.velocity.x += (Math.random() > 0.5 ? 1 : -1) * force * 1.3;
        this.scaleVelocity.set(-0.4 * force, 0.3 * force, -0.4 * force);
        break;

      case 'golden_brick': // 5. 發財黃金磚：向下垂直重壓 (Y 軸壓縮，果凍向兩側扁平散開)
        this.velocity.y -= force * 2.2;
        this.scaleVelocity.set(0.7 * force, -0.9 * force, 0.7 * force);
        break;

      case 'laser_blaster': // 6. 脈衝雷射槍：高頻微幅連續穿透後震
        this.velocity.z -= force * 1.1;
        this.angularVelocity.x += (Math.random() - 0.5) * force * 0.18;
        this.scaleVelocity.set(-0.2 * force, -0.2 * force, 0.4 * force);
        break;

      case 'rpg_rocket': // 7. 火箭筒：全軸向炸裂衝擊波 + 瞬間 3D 劇烈反彈震動
        this.velocity.z -= force * 2.6;
        this.velocity.y += force * 1.4;
        this.scaleVelocity.set(0.9 * force, 0.9 * force, 0.9 * force);
        this.angularVelocity.x += (Math.random() - 0.5) * force * 0.45;
        this.angularVelocity.y += (Math.random() - 0.5) * force * 0.45;
        break;

      case 'stinky_tofu': // 8. 阿嬤臭豆腐：拋物線重砸 + 彈跳晃蕩
        this.velocity.y -= force * 1.1;
        this.velocity.z -= force * 0.9;
        this.angularVelocity.z += (Math.random() - 0.5) * force * 0.35;
        this.scaleVelocity.set(0.4 * force, -0.5 * force, 0.4 * force);
        break;

      case 'thunder_hammer': // 9. 雷神之鎚：落雷天頂轟頂 + 垂直重壓與電光震顫
        this.velocity.y -= force * 1.9;
        this.velocity.z -= force * 1.2;
        this.angularVelocity.x += force * 0.3;
        this.scaleVelocity.set(0.6 * force, -0.7 * force, 0.6 * force);
        break;

      case 'salmon': // 10. 鮮美大鮭魚：滑溜魚尾橫甩，Z軸與X軸水流波紋旋轉
        this.velocity.x += (Math.random() > 0.5 ? 1 : -1) * force * 1.4;
        this.angularVelocity.z += (Math.random() > 0.5 ? 1 : -1) * force * 0.4;
        this.scaleVelocity.set(0.3 * force, 0.3 * force, -0.5 * force);
        break;

      case 'plunger': // 11. 萬能馬桶吸盤：向前拉長後劇烈啵啵彈回
        this.velocity.z += force * 1.6;
        this.scaleVelocity.set(-0.4 * force, -0.4 * force, 0.85 * force);
        break;

      case 'ice_pierce': // 12. 極光冰錐：極速穿刺，微幅凍結僵直再反震
        this.velocity.z -= force * 1.5;
        this.velocity.x += hitDirection.x * force * 0.8;
        this.scaleVelocity.set(-0.3 * force, 0.5 * force, -0.3 * force);
        break;

      case 'durian_mace': // 13. 狂暴榴槤槌：重型狼牙棒砸擊，劇烈側偏與鈍器形變
        this.velocity.x += (Math.random() > 0.5 ? 1 : -1) * force * 1.6;
        this.velocity.y -= force * 0.8;
        this.angularVelocity.y += (Math.random() > 0.5 ? 1 : -1) * force * 0.35;
        this.scaleVelocity.set(0.5 * force, -0.6 * force, 0.5 * force);
        break;

      case 'keyboard': // 14. RGB 機械鍵盤：直角猛砸，鍵帽飛散，俯仰角旋轉
        this.velocity.y -= force * 1.5;
        this.angularVelocity.x -= force * 0.4;
        this.scaleVelocity.set(0.4 * force, -0.6 * force, 0.4 * force);
        break;

      case 'cat_paw': // 15. 粉紅貓爪肉墊：超軟綿肉墊輕拍，極致高阻尼 Q 彈
        this.velocity.z -= force * 0.9;
        this.velocity.y += force * 0.6;
        this.scaleVelocity.set(0.7 * force, 0.7 * force, -0.4 * force);
        break;

      case 'baguette': // 16. 法式長棍麵包：槓桿橫拍，Z軸傾角旋轉
        this.velocity.x += (Math.random() > 0.5 ? 1 : -1) * force * 1.3;
        this.angularVelocity.z += (Math.random() > 0.5 ? 1 : -1) * force * 0.3;
        this.scaleVelocity.set(-0.3 * force, 0.4 * force, -0.3 * force);
        break;

      case 'fan': // 17. 工業大風扇：連續向後推擠的氣流阻力衝量
        this.velocity.z -= force * 0.7;
        this.velocity.y += force * 0.3;
        this.angularVelocity.z += (Math.random() - 0.5) * force * 0.2;
        this.scaleVelocity.set(-0.2 * force, 0.3 * force, -0.2 * force);
        break;

      case 'boba_cannon': // 18. 爆漿珍奶砲：連續波霸彈丸高頻連續敲擊
        this.velocity.z -= force * 0.9;
        this.velocity.x += (Math.random() - 0.5) * force * 0.6;
        this.scaleVelocity.set(0.3 * force, 0.3 * force, -0.4 * force);
        break;

      case 'lightsaber': // 19. 光速量子劍：光刃拖曳切削，斜向撕裂受創
        this.velocity.x += hitDirection.x * force * 1.4;
        this.velocity.y += hitDirection.y * force * 1.2;
        this.angularVelocity.z += (Math.random() > 0.5 ? 1 : -1) * force * 0.35;
        this.scaleVelocity.set(0.5 * force, -0.4 * force, 0.5 * force);
        break;

      case 'black_hole': // 20. 微型黑洞產生器：空間扭曲，向中心坍縮吸入後暴彈
        this.scaleVelocity.set(-0.85 * force, -0.85 * force, -0.85 * force);
        this.angularVelocity.y += force * 0.7;
        this.velocity.z += force * 0.5;
        break;

      case 'sniper_rifle': // 21. 狙擊槍：超音速破甲穿透，劇烈正向後震
        this.velocity.z -= force * 2.8;
        this.velocity.y += force * 0.6;
        this.angularVelocity.x -= force * 0.35;
        this.scaleVelocity.set(-0.4 * force, 0.6 * force, -0.5 * force);
        break;

      default:
        this.velocity.x += hitDirection.x * force;
        this.velocity.y += hitDirection.y * force + 0.3 * force;
        this.velocity.z -= Math.abs(force * 0.8);
        this.angularVelocity.x += (Math.random() - 0.5) * force * 0.15;
        this.angularVelocity.y += (Math.random() - 0.5) * force * 0.15;
        this.angularVelocity.z += (Math.random() - 0.5) * force * 0.15;
        this.scaleVelocity.set(0.3 * force, -0.4 * force, 0.3 * force);
        break;
    }
  }

  /**
   * 物理迴圈每幀更新計算
   */
  public update(delta: number) {
    // 固定子步進 (1/120s) 維持高剛度下的數值穩定，最多 6 步避免卡頓時螺旋發散
    let remaining = Math.min(delta, 0.05);
    let steps = 0;
    while (remaining > 1e-6 && steps < 6) {
      const dt = Math.min(remaining, 1 / 120);
      this.step(dt);
      remaining -= dt;
      steps++;
    }
  }

  private step(dt: number) {
    const sq = Math.sqrt(this.stiffness);
    const cp = this.damping * sq * 2;
    const cr = this.damping * sq * 1.8;
    const cs = this.damping * sq * 2.2;

    // 半隱式歐拉：先更新速度再更新位置 (Hooke: F = -k*x - c*v)
    this.integrate(this.positionOffset, this.velocity, this.stiffness, cp, dt);

    const r = this.rotationOffset;
    this.tmpRot.set(r.x, r.y, r.z);
    this.integrate(this.tmpRot, this.angularVelocity, this.stiffness * 0.8, cr, dt);
    this.tmpRot.clampScalar(-1.2, 1.2);
    this.rotationOffset.set(this.tmpRot.x, this.tmpRot.y, this.tmpRot.z);

    this.tmpScale.copy(this.scaleOffset).subScalar(1);
    this.integrate(this.tmpScale, this.scaleVelocity, this.stiffness * 1.2, cs, dt);
    this.tmpScale.clampScalar(-0.7, 1.2);
    this.scaleOffset.set(1 + this.tmpScale.x, 1 + this.tmpScale.y, 1 + this.tmpScale.z);

    this.positionOffset.clampScalar(-3, 3);
  }

  private integrate(x: THREE.Vector3, v: THREE.Vector3, k: number, c: number, dt: number) {
    v.x += (-k * x.x - c * v.x) * dt;
    v.y += (-k * x.y - c * v.y) * dt;
    v.z += (-k * x.z - c * v.z) * dt;
    x.addScaledVector(v, dt);
  }
}
