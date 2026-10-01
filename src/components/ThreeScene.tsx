import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { JigglePhysics } from '../physics/JigglePhysics';
import { ParticleManager } from '../physics/ParticleManager';
import { TargetComponent } from '../three/TargetComponent';
import { WeaponRenderer3D } from '../three/WeaponRenderer3D';
import TargetCharacter from './TargetCharacter';
import { playHitSound } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { AnimPattern } from '../types/weapon';
import { createHitFeedback, getHitRegion, HitRegion } from '../game/hitFeedback';

interface FloatingDamage {
  id: number;
  screenX: number;
  screenY: number;
  text: string;
  color: string;
}

interface ComicBubble {
  id: number;
  screenX: number;
  screenY: number;
  text: string;
}

interface ImpactBurst {
  id: number;
  screenX: number;
  screenY: number;
  text: string;
  color: string;
}

// 拋物線丟擲物 (阿嬤臭豆腐)
interface LobProjectile {
  id: number;
  icon: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

// 直線推進射擊物 (火箭筒火箭彈、珍奶砲珍珠)
interface RocketBullet {
  id: number;
  icon: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  speed: number;
}

// 光束射擊軌跡 (脈衝雷射槍)
interface LaserBeam {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

// 高空墜落物 (發財黃金磚)
interface FallingBrick {
  id: number;
  targetX: number;
  targetY: number;
}

// 閃電天罰特效 (雷神之鎚)
interface LightningStrikeVisual {
  id: number;
  targetX: number;
  targetY: number;
}

// 狙擊穿甲彈射擊特效 (重裝狙擊槍)
interface SniperBulletVisual {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

interface ThreeSceneProps {
  onHit: (weaponDamage: number) => void;
}

export default function ThreeScene({ onHit }: ThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentWeapon, comboCount, chiuchiuStress, knockdownCount } = useGameStore();

  const [floatingDamages, setFloatingDamages] = useState<FloatingDamage[]>([]);
  const [comicBubbles, setComicBubbles] = useState<ComicBubble[]>([]);
  const [impactBursts, setImpactBursts] = useState<ImpactBurst[]>([]);

  // 實體打擊目標角色 (TargetCharacter) 動態受創與台詞狀態
  const [targetHitTrigger, setTargetHitTrigger] = useState(0);
  const [targetSubtitle, setTargetSubtitle] = useState<string | null>(null);
  const [lastHitRegion, setLastHitRegion] = useState<HitRegion>('body');
  const [splatEffects, setSplatEffects] = useState<{ id: number; icon: string; x: number; y: number }[]>([]);

  // 專屬武器飛行物與軌跡動畫狀態
  const [lobProjectiles, setLobProjectiles] = useState<LobProjectile[]>([]);
  const [rocketBullets, setRocketBullets] = useState<RocketBullet[]>([]);
  const [laserBeams, setLaserBeams] = useState<LaserBeam[]>([]);
  const [fallingBricks, setFallingBricks] = useState<FallingBrick[]>([]);
  const [lightningStrikes, setLightningStrikes] = useState<LightningStrikeVisual[]>([]);
  const [sniperBullets, setSniperBullets] = useState<SniperBulletVisual[]>([]);
  const [blackHoleActive, setBlackHoleActive] = useState<{ id: number; x: number; y: number } | null>(null);

  // 滑鼠 / 觸控即時手持游標位置
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100, visible: false });
  // 專屬武器敲擊動畫觸發次數
  const [swingTrigger, setSwingTrigger] = useState(0);

  // Three.js 核心物件與 3D 組件引用
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const targetComponentRef = useRef<TargetComponent | null>(null);
  const weaponRenderer3DRef = useRef<WeaponRenderer3D | null>(null);
  const particleManagerRef = useRef<ParticleManager | null>(null);
  const jigglePhysicsRef = useRef<JigglePhysics>(new JigglePhysics());

  // 狙擊槍視角縮放效果 (Sniper Zoom In/Out)
  const targetZoomRef = useRef(1.0);
  const currentZoomRef = useRef(1.0);
  // 滑鼠懸停於目標上方時的狙擊手瞄準鏡微幅縮放標誌 (Hover Scope Zoom)
  const isHoveringTargetRef = useRef(false);

  // 打擊回饋：震動 (trauma)、hit-stop 與角色物理容器
  const traumaRef = useRef(0);
  const hitStopRef = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const targetPhysRef = useRef<HTMLDivElement>(null);
  const triggerAttackRef = useRef<(x: number, y: number) => void>(() => {});
  const lastDragHitRef = useRef({ t: 0, x: 0, y: 0 });

  // 拖曳狀態 (Drag) 與 連續按住 (Hold)
  const isMouseDownRef = useRef(false);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);

  // 當 currentWeapon 改變時，動態同步切換 3D 空間中的武器模型與重設縮放
  useEffect(() => {
    if (weaponRenderer3DRef.current && currentWeapon) {
      weaponRenderer3DRef.current.setWeapon(currentWeapon);
    }
    // 切換武器時重設狙擊鏡縮放
    if (currentWeapon.animPattern !== 'sniper_shot') {
      targetZoomRef.current = 1.0;
      isHoveringTargetRef.current = false;
    }
  }, [currentWeapon]);

  // 實際結算打擊效果（物理衝擊、3D 粒子、受擊紅光閃爍、台詞與浮字）
  const executeHitImpact = useCallback((screenX: number, screenY: number, customDamage?: number) => {
    if (!cameraRef.current || !particleManagerRef.current) return;

    const camera = cameraRef.current;
    const jiggle = jigglePhysicsRef.current;
    const particleManager = particleManagerRef.current;
    const targetComp = targetComponentRef.current;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((screenX - rect.left) / rect.width) * 2 - 1;
    const y = -((screenY - rect.top) / rect.height) * 2 + 1;

    // 3D 空間擊中點 (置於邱邱身前 z = 0.5)
    const hitPoint = new THREE.Vector3(x * 2.8, y * 2.2 + 0.1, 0.5);
    const hitDir = new THREE.Vector3(x, y, -1).normalize();
    const region = getHitRegion(screenX, screenY, rect);
    setLastHitRegion(region);

    // 1. TargetComponent 與 TargetCharacter 受創反應與果凍物理衝擊
    jiggle.applyImpulse(currentWeapon.physicalForce, hitDir, currentWeapon.id);
    if (targetComp) {
      targetComp.onHit();
    }
    setTargetHitTrigger(prev => prev + 1);

    // 投擲或潑灑類武器在身上留下污漬
    if (['stinky_tofu', 'boba_cannon'].includes(currentWeapon.id)) {
      const splatId = Date.now() + Math.random();
      const splatIcon = currentWeapon.id === 'stinky_tofu' ? '🥟' : '🧋';
      setSplatEffects(prev => [...prev.slice(-4), {
        id: splatId,
        icon: splatIcon,
        x: (Math.random() - 0.5) * 80,
        y: (Math.random() - 0.5) * 80,
      }]);
      setTimeout(() => {
        setSplatEffects(prev => prev.filter(s => s.id !== splatId));
      }, 2500);
    }

    // 2. 3D 武器模型打擊動畫
    if (weaponRenderer3DRef.current) {
      weaponRenderer3DRef.current.triggerAttack(hitPoint);
    }

    // 3. 3D 粒子爆發
    particleManager.emit(hitPoint, currentWeapon.particleType, currentWeapon.id === 'rpg_rocket' ? 80 : 40);

    // 若為雷神之鎚 (thunder_hammer)，在擊中點於 3D 空間觸發向四周擴散的隨機多分支閃電鏈弧 (LightningEffect)
    if (currentWeapon.id === 'thunder_hammer' || currentWeapon.animPattern === 'lightning_strike') {
      particleManager.triggerLightningEffect(hitPoint, 12);
    }

    // 4. 專屬音效
    playHitSound(currentWeapon.hitSound);

    // 5. 傷害浮字
    const baseDamage = customDamage || currentWeapon.damage;
    const regionMultiplier = region === 'head' ? 1.25 : region === 'left' || region === 'right' ? 1.12 : 1;
    const critChance = Math.min(0.65, 0.1 + comboCount * 0.005 + (region === 'head' ? 0.15 : 0));
    const isCrit = Math.random() < critChance;
    const damageVal = Math.round(baseDamage * regionMultiplier * (0.85 + Math.random() * 0.3) * (isCrit ? 2 : 1));
    const feedback = createHitFeedback(currentWeapon, region, damageVal, comboCount, isCrit);

    // 打擊回饋：hit-stop 與畫面震動，依傷害分級
    const tier = baseDamage >= 60 ? 2 : baseDamage >= 30 ? 1 : 0;
    const trauma = [0.18, 0.4, 0.75][tier] + (isCrit ? 0.2 : 0);
    traumaRef.current = Math.min(1, traumaRef.current + trauma);
    hitStopRef.current = Math.max(hitStopRef.current, [0.03, 0.06, 0.1][tier] + (isCrit ? 0.03 : 0));
    if (typeof navigator !== 'undefined' && navigator.vibrate && currentWeapon.attackType === 'click') {
      navigator.vibrate([12, 25, 40][tier]);
    }

    const damageId = Date.now() + Math.random();
    const newDamage: FloatingDamage = {
      id: damageId,
      screenX: screenX + (Math.random() - 0.5) * 40,
      screenY: screenY - 30,
      text: feedback.damageText,
      color: feedback.color,
    };
    setFloatingDamages(prev => [...prev.slice(-8), newDamage]);
    setTimeout(() => {
      setFloatingDamages(prev => prev.filter(d => d.id !== damageId));
    }, 900);

    const burstId = Date.now() + Math.random();
    setImpactBursts(prev => [...prev.slice(-4), {
      id: burstId,
      screenX,
      screenY,
      text: feedback.headline,
      color: feedback.color,
    }]);
    setTimeout(() => {
      setImpactBursts(prev => prev.filter(b => b.id !== burstId));
    }, 520);

    // 6. 隨機彈出專屬漫畫風台詞 (Subtitle)
    if (currentWeapon.subtitles && currentWeapon.subtitles.length > 0) {
      const bubbleId = Date.now() + Math.random();
      const randomText = currentWeapon.subtitles[Math.floor(Math.random() * currentWeapon.subtitles.length)];
      const subtitle = `${feedback.bubblePrefix}${randomText}`;
      setTargetSubtitle(subtitle);
      const newBubble: ComicBubble = {
        id: bubbleId,
        screenX: screenX,
        screenY: screenY - 90,
        text: feedback.bubbleText,
      };
      setComicBubbles(prev => [...prev.slice(-2), newBubble]);
      setTimeout(() => {
        setComicBubbles(prev => prev.filter(b => b.id !== bubbleId));
        setTargetSubtitle(null);
      }, 1200);
    }

    onHit(damageVal);
  }, [currentWeapon, comboCount, onHit]);

  // 根據武器品種 (animPattern) 執行專屬打擊動畫與射擊/拋擲流程
  const triggerWeaponAttack = useCallback((clientX: number, clientY: number) => {
    setSwingTrigger(prev => prev + 1);
    const pattern: AnimPattern = currentWeapon.animPattern;

    // 計算以螢幕中央 (midX) 為準：若準心在中間偏左，從右側發射/拋出；若在偏右，從左側發射/拋出
    const midX = window.innerWidth / 2;
    const isTargetOnLeft = clientX < midX;

    // 1. 拋物線丟擲類 (lob_throw: 阿嬤臭豆腐)
    if (pattern === 'lob_throw') {
      const projId = Date.now() + Math.random();
      // 準心在中間左邊 -> 武器從右邊丟出；準心在中間右邊 -> 武器從左邊丟出
      const startX = isTargetOnLeft 
        ? window.innerWidth * 0.88 + (Math.random() - 0.5) * 40
        : window.innerWidth * 0.12 + (Math.random() - 0.5) * 40;
      const startY = window.innerHeight * 0.88;
      const newLob: LobProjectile = {
        id: projId,
        icon: currentWeapon.icon,
        startX,
        startY,
        targetX: clientX,
        targetY: clientY,
      };
      setLobProjectiles(prev => [...prev, newLob]);

      setTimeout(() => {
        executeHitImpact(clientX, clientY);
        setLobProjectiles(prev => prev.filter(p => p.id !== projId));
      }, 360);
      return;
    }

    // 2. 直線推進射擊類 (rocket_shoot: 火箭筒, boba_burst: 爆漿珍奶砲)
    if (pattern === 'rocket_shoot' || pattern === 'boba_burst') {
      const bulletId = Date.now() + Math.random();
      // 準心在中間左邊 -> 武器從右邊發射；準心在中間右邊 -> 武器從左邊發射
      const startX = isTargetOnLeft ? window.innerWidth * 0.92 : window.innerWidth * 0.08;
      const startY = window.innerHeight * 0.82;
      const newBullet: RocketBullet = {
        id: bulletId,
        icon: pattern === 'rocket_shoot' ? '🚀' : '🧋',
        startX,
        startY,
        targetX: clientX,
        targetY: clientY,
        speed: pattern === 'rocket_shoot' ? 260 : 180,
      };
      setRocketBullets(prev => [...prev, newBullet]);

      setTimeout(() => {
        executeHitImpact(clientX, clientY);
        setRocketBullets(prev => prev.filter(b => b.id !== bulletId));
      }, newBullet.speed);
      return;
    }

    // 3. 雷射光束類 (beam: 脈衝雷射槍)
    if (pattern === 'beam') {
      const beamId = Date.now() + Math.random();
      // 準心在中間左邊 -> 雷射從右下角發射；反之從左下角發射
      const startX = isTargetOnLeft ? window.innerWidth * 0.9 : window.innerWidth * 0.1;
      const startY = window.innerHeight * 0.82;
      const newBeam: LaserBeam = {
        id: beamId,
        startX,
        startY,
        targetX: clientX,
        targetY: clientY,
      };
      setLaserBeams(prev => [...prev, newBeam]);
      executeHitImpact(clientX, clientY);

      setTimeout(() => {
        setLaserBeams(prev => prev.filter(b => b.id !== beamId));
      }, 120);
      return;
    }

    // 4. 高空直墜重壓 (fall_crush: 發財黃金磚)
    if (pattern === 'fall_crush') {
      const brickId = Date.now() + Math.random();
      const newBrick: FallingBrick = {
        id: brickId,
        targetX: clientX,
        targetY: clientY,
      };
      setFallingBricks(prev => [...prev, newBrick]);

      setTimeout(() => {
        executeHitImpact(clientX, clientY);
        setFallingBricks(prev => prev.filter(b => b.id !== brickId));
      }, 280);
      return;
    }

    // 5. 黑洞坍縮 (vortex_collapse: 微型黑洞產生器)
    if (pattern === 'vortex_collapse') {
      const holeId = Date.now();
      setBlackHoleActive({ id: holeId, x: clientX, y: clientY });
      executeHitImpact(clientX, clientY);

      setTimeout(() => {
        setBlackHoleActive(null);
      }, 650);
      return;
    }

    // 6. 天降狂雷神罰 (lightning_strike: 雷神之鎚)
    if (pattern === 'lightning_strike') {
      const strikeId = Date.now() + Math.random();
      setLightningStrikes(prev => [...prev, { id: strikeId, targetX: clientX, targetY: clientY }]);
      executeHitImpact(clientX, clientY);

      setTimeout(() => {
        setLightningStrikes(prev => prev.filter(s => s.id !== strikeId));
      }, 350);
      return;
    }

    // 7. 狙擊槍 (sniper_shot: 狙擊鏡視角急速放大縮放與超音速穿甲彈)
    if (pattern === 'sniper_shot') {
      const sniperId = Date.now() + Math.random();
      const startX = isTargetOnLeft ? window.innerWidth * 0.95 : window.innerWidth * 0.05;
      const startY = window.innerHeight * 0.85;
      setSniperBullets(prev => [...prev, {
        id: sniperId,
        startX,
        startY,
        targetX: clientX,
        targetY: clientY,
      }]);

      // 視角瞬間急速拉近放大 (Zoom In)
      targetZoomRef.current = 1.35;
      setTimeout(() => {
        // 隨後回彈復原：若仍懸停在目標上則回彈至懸停倍率 1.16，否則回彈至 1.0
        targetZoomRef.current = isHoveringTargetRef.current ? 1.16 : 1.0;
      }, 150);

      executeHitImpact(clientX, clientY);

      setTimeout(() => {
        setSniperBullets(prev => prev.filter(b => b.id !== sniperId));
      }, 160);
      return;
    }

    // 8. 其他近戰揮擊、抽打、擠壓、鍵盤砸、風扇吹、光劍切削
    executeHitImpact(clientX, clientY);
  }, [currentWeapon, executeHitImpact]);

  triggerAttackRef.current = triggerWeaponAttack;

  // 初始化 Three.js 場景、Target 組件與 3D 武器渲染器
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. 光源配置
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(0, 5, 8);
    scene.add(dirLight);

    // 5. 3D 粒子管理器
    const particleManager = new ParticleManager(scene);
    particleManagerRef.current = particleManager;

    // 6. 動態 TargetComponent (邱邱本體)
    const targetComp = new TargetComponent(scene, jigglePhysicsRef.current);
    targetComponentRef.current = targetComp;

    // 7. 3D 武器渲染器 (WeaponRenderer3D - 內建 WeaponAnimationEngine 與 JigglePhysics 同步)
    const weaponRenderer = new WeaponRenderer3D(scene, jigglePhysicsRef.current);
    weaponRenderer.setWeapon(currentWeapon);
    weaponRenderer3DRef.current = weaponRenderer;

    // 8. 動畫主迴圈
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (now: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const realDelta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Hit-stop：命中瞬間凍結物理與武器動畫，之後釋放
      let delta = realDelta;
      if (hitStopRef.current > 0) {
        hitStopRef.current -= realDelta;
        delta = realDelta * 0.05;
      }

      // 畫面震動 (shake = trauma^2)
      if (traumaRef.current > 0 && rootRef.current) {
        const s = traumaRef.current * traumaRef.current;
        const sx = (Math.random() * 2 - 1) * 14 * s;
        const sy = (Math.random() * 2 - 1) * 14 * s;
        const sr = (Math.random() * 2 - 1) * 1.5 * s;
        rootRef.current.style.transform = `translate(${sx}px, ${sy}px) rotate(${sr}deg)`;
        traumaRef.current = Math.max(0, traumaRef.current - realDelta * 1.8);
        if (traumaRef.current === 0) rootRef.current.style.transform = '';
      }

      // 更新彈簧物理，並將結果套用到畫面上的邱邱
      const jp = jigglePhysicsRef.current;
      jp.update(delta);
      if (targetPhysRef.current) {
        const sx = Math.max(0.3, jp.scaleOffset.x);
        const sy = Math.max(0.3, jp.scaleOffset.y);
        targetPhysRef.current.style.transform =
          `translate(${jp.positionOffset.x * 60}px, ${-jp.positionOffset.y * 60}px) ` +
          `rotate(${-jp.rotationOffset.z}rad) scale(${sx}, ${sy})`;
      }

      // 更新 TargetComponent
      targetComp.update(delta);

      // 更新 3D 武器模型動畫
      weaponRenderer.update(delta);

      // 更新 3D 粒子系統
      particleManager.update(delta);

      // 狙擊槍視角縮放平滑插值 (Camera Zoom Smooth Lerp)
      currentZoomRef.current = THREE.MathUtils.lerp(currentZoomRef.current, targetZoomRef.current, 0.25);
      if (Math.abs(camera.zoom - currentZoomRef.current) > 0.001) {
        camera.zoom = currentZoomRef.current;
        camera.updateProjectionMatrix();
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      targetComp.dispose();
      weaponRenderer.dispose();
      particleManager.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 更新游標在 3D 空間的投影，使 3D 空間中的武器跟隨手持游標
  const updateCursorWorldPos = (clientX: number, clientY: number) => {
    if (!cameraRef.current || !weaponRenderer3DRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    // 換算 3D 世界座標 (z = 3.5 處)
    const vector = new THREE.Vector3(x, y, 0.5);
    vector.unproject(cameraRef.current);
    const dir = vector.sub(cameraRef.current.position).normalize();
    const distance = (3.5 - cameraRef.current.position.z) / dir.z;
    const pos = cameraRef.current.position.clone().add(dir.multiplyScalar(distance));

    weaponRenderer3DRef.current.updateCursorPosition(pos);
  };

  // 滑鼠 / 觸控事件處理：涵蓋 'click', 'hold', 'drag' 三種打擊方式
  const handlePointerDown = (e: React.PointerEvent) => {
    isMouseDownRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    setCursorPos({ x: e.clientX, y: e.clientY, visible: true });
    updateCursorWorldPos(e.clientX, e.clientY);

    triggerWeaponAttack(e.clientX, e.clientY);

    // 若為 'hold'（按住連射型，如脈衝雷射槍、工業大風扇），啟動高頻連發定時器
    if (currentWeapon.attackType === 'hold') {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = setInterval(() => {
        if (isMouseDownRef.current && lastMousePosRef.current) {
          triggerAttackRef.current(lastMousePosRef.current.x, lastMousePosRef.current.y);
        }
      }, 95);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    setCursorPos({ x: e.clientX, y: e.clientY, visible: true });
    updateCursorWorldPos(e.clientX, e.clientY);

    // 若為狙擊槍，滑鼠懸停於目標中心範圍時微幅拉近縮放 (Hover Scope Zoom In 1.15)
    if (currentWeapon.animPattern === 'sniper_shot') {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight * 0.48;
      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      // 當游標靠近邱邱本體 (半徑 220px 內)
      if (dist < 220) {
        isHoveringTargetRef.current = true;
        // 如果當前沒有正在進行開火的強力震爆縮放，微幅放大至 1.16
        if (targetZoomRef.current < 1.2) {
          targetZoomRef.current = 1.16;
        }
      } else {
        isHoveringTargetRef.current = false;
        if (targetZoomRef.current < 1.2) {
          targetZoomRef.current = 1.0;
        }
      }
    }

    // 若為 'drag'（拖曳切削型，如光速量子劍、萬能馬桶吸盤），滑動時持續打擊
    if (isMouseDownRef.current && currentWeapon.attackType === 'drag') {
      // 節流：至少間隔 70ms 且移動 24px 才算一次打擊，避免亂滑刷分
      const last = lastDragHitRef.current;
      const now = performance.now();
      if (now - last.t >= 70 && Math.hypot(e.clientX - last.x, e.clientY - last.y) >= 24) {
        lastDragHitRef.current = { t: now, x: e.clientX, y: e.clientY };
        triggerAttackRef.current(e.clientX, e.clientY);
      }
    }
  };

  const handlePointerUp = () => {
    isMouseDownRef.current = false;
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  const handlePointerLeave = () => {
    handlePointerUp();
    setCursorPos(prev => ({ ...prev, visible: false }));
    if (currentWeapon.animPattern === 'sniper_shot') {
      isHoveringTargetRef.current = false;
      targetZoomRef.current = 1.0;
    }
  };

  // 針對 20 種武器提供極致流暢的 DOM 游標打擊特效動畫
  const getHandAnimationVariants = (pattern: AnimPattern) => {
    switch (pattern) {
      case 'swing': // 3D 大弧線橫掃揮擊 (打狗棍、平底鍋、榴槤槌、法式長棍)
        return {
          rotate: [0, -65, 80, 0],
          scale: [1, 1.45, 0.9, 1],
          x: [0, -15, 25, 0],
        };

      case 'slap': // 啪啪啪急速抽打 (藍白拖、鮭魚甩打)
        return {
          rotate: [0, -35, 45, -25, 30, 0],
          scale: [1, 1.25, 0.85, 1.15, 1],
        };

      case 'squeeze': // 捏扁再暴彈 (尖叫雞、粉紅貓爪)
        return {
          scaleX: [1, 0.55, 1.6, 0.9, 1],
          scaleY: [1, 1.5, 0.6, 1.1, 1],
        };

      case 'fall_crush': // 金磚從高空向下重壓
        return {
          y: [-120, 20, 0],
          scale: [1.3, 0.8, 1],
          rotate: [0, -10, 0],
        };

      case 'lightning_strike': // 雷神之鎚擎天召喚落雷
        return {
          y: [-30, 10, 0],
          rotate: [-20, 35, 0],
          scale: [1.3, 1.5, 1],
        };

      case 'plunger_pull': // 吸盤吸附拉長回彈
        return {
          scaleY: [1, 1.8, 0.7, 1.2, 1],
          scaleX: [1, 0.7, 1.3, 0.9, 1],
        };

      case 'ice_pierce': // 冰錐急速刺擊
        return {
          x: [0, 45, 0],
          y: [0, -35, 0],
          scale: [1, 1.4, 1],
        };

      case 'keyboard_smash': // 鍵盤整把直接砸下
        return {
          rotate: [-30, 45, -15, 0],
          y: [-25, 30, 0],
          scale: [1, 1.3, 1],
        };

      case 'tornado_wind': // 工業大風扇渦輪狂轉
        return {
          rotate: [0, 360, 720],
          scale: [1, 1.25, 0.95, 1],
        };

      case 'beam': // 脈衝雷射槍高頻連射後震
        return {
          y: [0, 6, -3, 0],
          x: [0, -4, 2, 0],
          scale: [1, 1.15, 0.95, 1],
        };

      case 'rocket_shoot': // 火箭筒發射大衝量後座力
        return {
          rotate: [-10, -25, 5, 0],
          x: [0, -35, 10, 0],
          y: [0, 15, -5, 0],
          scale: [1, 1.35, 0.95, 1],
        };

      case 'lob_throw': // 阿嬤臭豆腐向前拋物甩出
        return {
          rotate: [-35, 45, 0],
          y: [15, -40, 0],
          scale: [1, 1.25, 1],
        };

      case 'boba_burst': // 爆漿珍奶砲連發突進
        return {
          rotate: [-5, 10, -5, 0],
          x: [0, 15, -10, 0],
          scale: [1, 1.2, 0.9, 1],
        };

      case 'vortex_collapse': // 微型黑洞引力扭曲
        return {
          rotate: [0, 180, 360, 540],
          scale: [1, 1.5, 0.3, 1],
        };

      case 'saber_slash': // 光速量子劍炫彩切削
        return {
          rotate: [-45, 75, -20, 0],
          x: [-30, 40, 0],
          y: [-20, 20, 0],
          scale: [1, 1.35, 1],
        };

      case 'sniper_shot': // 重裝狙擊槍極致後座力
        return {
          rotate: [-15, -45, 10, 0],
          x: [0, -25, 5, 0],
          y: [0, 20, -5, 0],
          scale: [1, 1.4, 0.95, 1],
        };

      default:
        return {
          rotate: [0, -45, 45, 0],
          scale: [1, 1.3, 1],
        };
    }
  };

  return (
    <div 
      ref={rootRef}
      className="relative w-full h-full cursor-crosshair overflow-hidden select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {/* 核心實體打擊人物 (邱邱) - 保證在畫面正中央完美顯示，配合果凍擠壓與受創動畫 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 pb-16 sm:pb-24">
        <div ref={targetPhysRef} style={{ willChange: 'transform' }}>
          <TargetCharacter
            hitTrigger={targetHitTrigger}
            subtitle={targetSubtitle}
            splatEffects={splatEffects}
            isHeavyHit={currentWeapon.damage >= 30 || currentWeapon.id === 'rpg_rocket' || currentWeapon.id === 'thunder_hammer'}
            hitRegion={lastHitRegion}
            stress={chiuchiuStress}
            knockdownCount={knockdownCount}
          />
        </div>
      </div>

      {/* Three.js Canvas 掛載容器 (內含 3D 粒子爆破、雷神閃電、光劍揮砍與 3D 武器渲染) */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-20 pointer-events-none" />

      {/* 1. 拋物線丟擲物 (阿嬤臭豆腐) */}
      {lobProjectiles.map(p => (
        <motion.div
          key={p.id}
          initial={{
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            scale: 0.6,
            rotate: 0,
          }}
          animate={{
            left: [`${p.startX}px`, `${(p.startX + p.targetX) / 2}px`, `${p.targetX}px`],
            top: [`${p.startY}px`, `${Math.min(p.targetY - 120, window.innerHeight * 0.25)}px`, `${p.targetY}px`],
            scale: [0.6, 1.6, 1.2],
            rotate: 720,
          }}
          transition={{ duration: 0.36, ease: 'easeOut' }}
          className="fixed pointer-events-none z-40 text-5xl sm:text-6xl drop-shadow-2xl -translate-x-1/2 -translate-y-1/2"
        >
          {p.icon}
        </motion.div>
      ))}

      {/* 2. 直線推進射擊物 (火箭筒火箭彈、珍奶砲珍珠) */}
      {rocketBullets.map(b => {
        // 根據起點與終點動態計算飛行仰角與飛彈朝向
        const angleDeg = Math.atan2(b.targetY - b.startY, b.targetX - b.startX) * (180 / Math.PI);
        const isFromRight = b.startX > b.targetX;

        return (
          <motion.div
            key={b.id}
            initial={{
              left: `${b.startX}px`,
              top: `${b.startY}px`,
              scale: 0.8,
              rotate: angleDeg,
            }}
            animate={{
              left: `${b.targetX}px`,
              top: `${b.targetY}px`,
              scale: 1.4,
              rotate: angleDeg,
            }}
            transition={{ duration: b.speed / 1000, ease: 'linear' }}
            className="fixed pointer-events-none z-40 text-5xl sm:text-6xl drop-shadow-2xl -translate-x-1/2 -translate-y-1/2"
          >
            {b.icon}
            {/* 根據飛行方向在尾部動態產生噴射火焰 */}
            <div 
              className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-orange-500 blur-[2px] animate-ping ${
                isFromRight ? '-right-3' : '-left-3'
              }`} 
            />
          </motion.div>
        );
      })}

      {/* 3. 脈衝雷射光束 (脈衝雷射槍 SVG 雷射光軌) */}
      {laserBeams.map(beam => (
        <svg key={beam.id} className="absolute inset-0 w-full h-full pointer-events-none z-40">
          <line
            x1={beam.startX}
            y1={beam.startY}
            x2={beam.targetX}
            y2={beam.targetY}
            stroke="rgba(56,189,248,0.5)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <line
            x1={beam.startX}
            y1={beam.startY}
            x2={beam.targetX}
            y2={beam.targetY}
            stroke="#00ffff"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <line
            x1={beam.startX}
            y1={beam.startY}
            x2={beam.targetX}
            y2={beam.targetY}
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      ))}

      {/* 4. 高空直墜重壓 (發財黃金磚) */}
      {fallingBricks.map(brick => (
        <motion.div
          key={brick.id}
          initial={{
            left: `${brick.targetX}px`,
            top: `-80px`,
            scale: 1.8,
            rotate: -15,
          }}
          animate={{
            top: `${brick.targetY}px`,
            scale: [1.8, 1.1],
            rotate: 0,
          }}
          transition={{ duration: 0.28, ease: 'easeIn' }}
          className="fixed pointer-events-none z-40 text-6xl sm:text-7xl drop-shadow-2xl -translate-x-1/2 -translate-y-1/2"
        >
          🪙
        </motion.div>
      ))}

      {/* 5. 微型黑洞引力奇異點 (微型黑洞產生器) */}
      {blackHoleActive && (
        <motion.div
          key={blackHoleActive.id}
          initial={{ scale: 0.2, rotate: 0, opacity: 0 }}
          animate={{
            scale: [0.2, 1.8, 1.5, 0],
            rotate: 1080,
            opacity: [0, 1, 0.9, 0],
          }}
          transition={{ duration: 0.65, ease: 'easeInOut' }}
          className="fixed pointer-events-none z-40 w-32 h-32 rounded-full border-4 border-purple-500 shadow-[0_0_50px_#9333ea,inset_0_0_30px_#a855f7] flex items-center justify-center bg-black/90 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${blackHoleActive.x}px`,
            top: `${blackHoleActive.y}px`,
          }}
        >
          <div className="text-4xl animate-spin">🌀</div>
        </motion.div>
      )}

      {/* 6. 天降神雷轟頂全螢幕電弧閃光 (雷神之鎚) */}
      {lightningStrikes.map(ls => (
        <div key={ls.id} className="absolute inset-0 pointer-events-none z-40">
          {/* 天空紫藍強光暴閃 */}
          <div className="absolute inset-0 bg-blue-500/20 animate-pulse pointer-events-none" />
          {/* 落雷垂直主雷柱與枝枒 SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <polyline
              points={`
                ${ls.targetX + (Math.random() - 0.5) * 60},0
                ${ls.targetX - 25},${ls.targetY * 0.25}
                ${ls.targetX + 35},${ls.targetY * 0.5}
                ${ls.targetX - 15},${ls.targetY * 0.75}
                ${ls.targetX},${ls.targetY}
              `}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_15px_#3b82f6]"
            />
            <polyline
              points={`
                ${ls.targetX + (Math.random() - 0.5) * 60},0
                ${ls.targetX - 25},${ls.targetY * 0.25}
                ${ls.targetX + 35},${ls.targetY * 0.5}
                ${ls.targetX - 15},${ls.targetY * 0.75}
                ${ls.targetX},${ls.targetY}
              `}
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* 擊中點落雷電球 */}
          <div 
            className="fixed pointer-events-none z-40 w-24 h-24 rounded-full bg-cyan-300 blur-md opacity-80 animate-ping -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${ls.targetX}px`, top: `${ls.targetY}px` }}
          />
        </div>
      ))}

      {/* 7. 狙擊槍專屬戰術瞄準鏡視覺化 Overlay (Scope View, 畫面中央十字準心 crosshair, 周圍瞄準鏡暗角與同心測距刻度) */}
      {currentWeapon.animPattern === 'sniper_shot' && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden select-none">
          {/* 狙擊鏡周圍暗角遮罩 (Vignette Sniper Lens) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(0,0,0,0.55)_70%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

          {/* 畫面正中央的戰術十字準心 (Center Crosshair) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
            {/* 中央精密準心圓環 */}
            <div className="w-20 h-20 rounded-full border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border border-red-400/80 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              </div>
            </div>

            {/* 十字線：上、下、左、右貫穿延伸線 */}
            <div className="absolute w-[240px] h-[1.5px] bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />
            <div className="absolute h-[240px] w-[1.5px] bg-gradient-to-b from-transparent via-red-500/70 to-transparent" />

            {/* 密位測距刻度 (Mil-Dots) */}
            <div className="absolute left-[30px] w-1 h-1 bg-red-400 rounded-full" />
            <div className="absolute left-[60px] w-1 h-1 bg-red-400 rounded-full" />
            <div className="absolute right-[30px] w-1 h-1 bg-red-400 rounded-full" />
            <div className="absolute right-[60px] w-1 h-1 bg-red-400 rounded-full" />
            <div className="absolute top-[30px] w-1 h-1 bg-red-400 rounded-full" />
            <div className="absolute top-[60px] w-1 h-1 bg-red-400 rounded-full" />
            <div className="absolute bottom-[30px] w-1 h-1 bg-red-400 rounded-full" />
            <div className="absolute bottom-[60px] w-1 h-1 bg-red-400 rounded-full" />

            {/* 戰術抬頭顯示 (HUD) */}
            <div className="absolute top-[-90px] text-xs font-mono font-bold tracking-widest text-red-500/90 bg-black/40 px-2.5 py-0.5 rounded border border-red-500/30">
              SNIPER SCOPE 4X
            </div>
            <div className="absolute bottom-[-90px] text-[11px] font-mono text-red-400/90 tracking-widest">
              RANGE: 150M • CAL: 7.62mm
            </div>
          </div>

          {/* 跟隨滑鼠的即時紅外線雷射瞄準光束與鎖定目標光標 */}
          {cursorPos.visible && (
            <>
              {/* 槍口至游標的直線瞄準紅外線 */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {(() => {
                  const midX = window.innerWidth / 2;
                  const isTargetOnLeft = cursorPos.x < midX;
                  const gunStartX = isTargetOnLeft ? window.innerWidth * 0.92 : window.innerWidth * 0.08;
                  const gunStartY = window.innerHeight * 0.88;
                  return (
                    <>
                      <line
                        x1={gunStartX}
                        y1={gunStartY}
                        x2={cursorPos.x}
                        y2={cursorPos.y}
                        stroke="rgba(239, 68, 68, 0.35)"
                        strokeWidth="3"
                      />
                      <line
                        x1={gunStartX}
                        y1={gunStartY}
                        x2={cursorPos.x}
                        y2={cursorPos.y}
                        stroke="#ff2222"
                        strokeWidth="1.5"
                        strokeDasharray="6,4"
                      />
                    </>
                  );
                })()}
              </svg>

              {/* 滑鼠游標位置的動態鎖定標記 */}
              <div
                className="fixed pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px`, width: '48px', height: '48px' }}
              >
                <div className="w-8 h-8 rounded-full border border-red-500/80 animate-ping opacity-60" />
                <div className="absolute w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ff0000]" />
              </div>
            </>
          )}
        </div>
      )}

      {/* 8. 狙擊槍擊發時的超音速破空彈道、破甲閃光與衝擊波 */}
      {sniperBullets.map(sb => (
        <div key={sb.id} className="absolute inset-0 pointer-events-none z-40">
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* 超音速破甲彈道白熱核心 */}
            <line
              x1={sb.startX}
              y1={sb.startY}
              x2={sb.targetX}
              y2={sb.targetY}
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinecap="round"
              className="drop-shadow-[0_0_16px_#ff4444]"
            />
            {/* 破空音爆外圈火線 */}
            <line
              x1={sb.startX}
              y1={sb.startY}
              x2={sb.targetX}
              y2={sb.targetY}
              stroke="#ef4444"
              strokeWidth="9"
              strokeLinecap="round"
              opacity="0.75"
            />
          </svg>
          {/* 狙擊命中點的劇烈破空破甲衝擊環與粉塵核心 */}
          <div
            className="fixed pointer-events-none z-40 w-24 h-24 rounded-full border-4 border-white bg-red-500/40 shadow-[0_0_35px_#ff0000] animate-ping -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${sb.targetX}px`, top: `${sb.targetY}px` }}
          />
        </div>
      ))}

      {/* 9. 手持游標武器實體動畫 (確保打狗棍、拖鞋、尖叫雞、平底鍋等武器皆有最華麗的打擊呈現) */}
      {cursorPos.visible && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
          style={
            currentWeapon.animPattern === 'sniper_shot'
              ? {
                  // 狙擊槍架設於下緣發射端，槍口朝向游標準心
                  left: `${cursorPos.x < window.innerWidth / 2 ? window.innerWidth * 0.88 : window.innerWidth * 0.12}px`,
                  top: `${window.innerHeight * 0.86}px`,
                }
              : {
                  left: `${cursorPos.x}px`,
                  top: `${cursorPos.y}px`,
                }
          }
        >
          <motion.div
            key={swingTrigger}
            animate={
              swingTrigger > 0
                ? getHandAnimationVariants(currentWeapon.animPattern)
                : currentWeapon.animPattern === 'sniper_shot'
                ? {
                    rotate: cursorPos.x < window.innerWidth / 2 ? -15 : 15,
                    scale: 1.25,
                  }
                : { rotate: -15, scale: 1 }
            }
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="relative flex items-center justify-center filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)] text-5xl sm:text-6xl"
          >
            {currentWeapon.icon}
            {swingTrigger > 0 && (
              <div className="absolute inset-0 rounded-full border-4 border-yellow-300 opacity-75 animate-ping" />
            )}
          </motion.div>
        </div>
      )}

      {/* 漫畫風對話框 (Comic Subtitle Overlay) */}
      <AnimatePresence>
        {comicBubbles.map(bubble => (
          <motion.div
            key={bubble.id}
            initial={{ opacity: 0, y: 15, scale: 0.6 }}
            animate={{ opacity: 1, y: -20, scale: 1.15 }}
            exit={{ opacity: 0, scale: 0.8, y: -45 }}
            transition={{ type: 'spring', stiffness: 450, damping: 22 }}
            className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 bg-white text-black font-black px-4 py-2 sm:px-6 sm:py-2.5 rounded-2xl border-4 border-black shadow-[0_8px_0_rgba(0,0,0,1)] text-base sm:text-xl whitespace-nowrap"
            style={{
              left: `${bubble.screenX}px`,
              top: `${bubble.screenY}px`,
            }}
          >
            {/* 漫畫對話小尾巴尖角 */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-t-[14px] border-t-black border-r-[10px] border-r-transparent" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-t-[11px] border-t-white border-r-[8px] border-r-transparent" />
            {bubble.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 衝擊漫畫字與放射線：每次命中都強調「打邱邱」的痛快感 */}
      <AnimatePresence>
        {impactBursts.map(burst => (
          <motion.div
            key={burst.id}
            initial={{ opacity: 0, scale: 0.35, rotate: -10 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.35, 1.4, 1.2, 1.8], rotate: [-10, 6, -3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.52, ease: 'easeOut' }}
            className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 font-black text-3xl sm:text-5xl italic px-4 py-1 rounded-2xl border-4 border-black bg-white shadow-[0_8px_0_rgba(0,0,0,0.9)]"
            style={{
              left: `${burst.screenX}px`,
              top: `${burst.screenY}px`,
              color: burst.color,
              textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
            }}
          >
            <div className="absolute inset-[-26px] -z-10 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.95)_0%,rgba(250,204,21,0.7)_35%,transparent_70%)] animate-ping" />
            {burst.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 傷害與爽度浮動數字 (Floating Damage Text) */}
      <AnimatePresence>
        {floatingDamages.map(damage => (
          <motion.div
            key={damage.id}
            initial={{ opacity: 1, y: 0, scale: 0.7 }}
            animate={{ opacity: 0, y: -90, scale: 1.4 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 font-black text-2xl sm:text-3xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)]"
            style={{
              left: `${damage.screenX}px`,
              top: `${damage.screenY}px`,
              color: damage.color,
              textShadow: '0 2px 4px #000',
            }}
          >
            {damage.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
