import * as THREE from 'three';
import { JigglePhysics } from '../physics/JigglePhysics';
import headImgUrl from '../assets/head.png';
import bodyImgUrl from '../assets/dog_body.png';

/**
 * 載入貼圖並支援自動回退，確保 WebGL 下 100% 能即時可見且已編譯至 Vite Bundle
 */
function loadCompiledTexture(
  assetUrl: string,
  fallbackColor: string,
  onLoaded: (tex: THREE.Texture) => void
) {
  const loader = new THREE.TextureLoader();
  loader.load(
    assetUrl,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      onLoaded(texture);
    },
    undefined,
    () => {
      // 備援 Canvas
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = fallbackColor;
        ctx.beginPath();
        ctx.arc(128, 128, 120, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
      }
      const fallbackTex = new THREE.CanvasTexture(canvas);
      fallbackTex.needsUpdate = true;
      onLoaded(fallbackTex);
    }
  );
}

/**
 * 3D 目標組件 (被打的人物：邱邱頭部 + 狗身體)
 * 負責渲染目標角色、受擊變形 (Jiggle 彈簧物理)、受創紅光與地面動態陰影
 */
export class TargetComponent {
  public group: THREE.Group;
  public headMesh: THREE.Mesh;
  public bodyMesh: THREE.Mesh;
  private shadowMesh: THREE.Mesh;
  private jigglePhysics: JigglePhysics;

  // 受擊紅光與受創特效
  private hitFlashTimer = 0;
  private headMaterial: THREE.MeshBasicMaterial;
  private bodyMaterial: THREE.MeshBasicMaterial;
  private defaultHeadColor = new THREE.Color(1, 1, 1);
  private hurtHeadColor = new THREE.Color(1.8, 0.45, 0.45);

  constructor(scene: THREE.Scene, jigglePhysics: JigglePhysics) {
    this.jigglePhysics = jigglePhysics;
    this.group = new THREE.Group();
    this.group.position.set(0, 0, 0);
    this.group.visible = false; // 由 React DOM TargetCharacter 進行高保真動畫渲染
    scene.add(this.group);

    // 1. 地面立體柔和陰影
    const shadowGeo = new THREE.PlaneGeometry(3.6, 1.2);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 64;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 32, 5, 64, 32, 60);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
      grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 64);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.position.set(0, -2.55, -0.1);
    scene.add(this.shadowMesh);

    // 2. 狗身體 Plane (寬 3.4, 高 4.4, 置於中間偏下)
    const bodyGeo = new THREE.PlaneGeometry(3.4, 4.4);
    this.bodyMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.bodyMesh = new THREE.Mesh(bodyGeo, this.bodyMaterial);
    this.bodyMesh.position.set(0, -0.55, 0);
    this.group.add(this.bodyMesh);

    // 載入高解析度狗身體貼圖（已編譯進 Vite Bundle）
    loadCompiledTexture(bodyImgUrl, '#d97706', (texture) => {
      this.bodyMaterial.map = texture;
      this.bodyMaterial.needsUpdate = true;
    });

    // 3. 邱邱頭部 Plane (寬 2.8, 高 2.8, 置於身軀上方)
    const headGeo = new THREE.PlaneGeometry(2.8, 2.8);
    this.headMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.headMesh = new THREE.Mesh(headGeo, this.headMaterial);
    this.headMesh.position.set(0, 0.95, 0.12);
    this.group.add(this.headMesh);

    // 載入高解析度自定義頭像貼圖（已編譯進 Vite Bundle）
    loadCompiledTexture(headImgUrl, '#fde047', (texture) => {
      this.headMaterial.map = texture;
      this.headMaterial.needsUpdate = true;
    });
  }

  /**
   * 遭受武器打擊時呼叫：觸發紅光受創、眼睛特效與物理形變
   */
  public onHit() {
    this.hitFlashTimer = 0.18; // 閃爍紅光
  }

  /**
   * 動畫迴圈每幀更新
   */
  public update(delta: number) {
    // 同步胡克定律物理彈簧：位移、旋轉、果凍彈性拉伸
    this.group.position.set(
      this.jigglePhysics.positionOffset.x,
      this.jigglePhysics.positionOffset.y,
      this.jigglePhysics.positionOffset.z
    );
    this.group.rotation.set(
      this.jigglePhysics.rotationOffset.x,
      this.jigglePhysics.rotationOffset.y,
      this.jigglePhysics.rotationOffset.z
    );
    this.group.scale.set(
      Math.max(0.3, this.jigglePhysics.scaleOffset.x),
      Math.max(0.3, this.jigglePhysics.scaleOffset.y),
      Math.max(0.3, this.jigglePhysics.scaleOffset.z)
    );

    // 地面陰影隨身軀果凍形變同步連動
    const currentScaleX = Math.max(0.3, this.jigglePhysics.scaleOffset.x);
    this.shadowMesh.scale.set(currentScaleX * 1.05, 1, 1);
    this.shadowMesh.position.x = this.jigglePhysics.positionOffset.x * 0.45;

    // 受創紅光計時器漸變衰減
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= delta;
      this.headMaterial.color.copy(this.hurtHeadColor);
      this.bodyMaterial.color.setRGB(1.5, 0.6, 0.6);
    } else {
      this.headMaterial.color.copy(this.defaultHeadColor);
      this.bodyMaterial.color.copy(this.defaultHeadColor);
    }
  }

  public dispose() {
    this.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    this.shadowMesh.geometry.dispose();
    (this.shadowMesh.material as THREE.Material).dispose();
  }
}
