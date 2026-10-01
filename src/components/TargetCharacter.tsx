import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import headImgUrl from '../assets/head.png';
import bodyImgUrl from '../assets/dog_body.png';
import { HitRegion } from '../game/hitFeedback';

interface TargetCharacterProps {
  hitTrigger: number;
  subtitle: string | null;
  splatEffects: { id: number; icon: string; x: number; y: number }[];
  isHeavyHit: boolean; // 是否遭受手榴彈或閃電等重擊
  hitRegion: HitRegion;
  stress: number;
  knockdownCount: number;
}

const TargetCharacter = forwardRef<HTMLDivElement, TargetCharacterProps>(({
  hitTrigger,
  subtitle,
  splatEffects,
  isHeavyHit,
  hitRegion,
  stress,
  knockdownCount,
}, ref) => {
  const stressStage = stress >= 75 ? 3 : stress >= 45 ? 2 : stress >= 18 ? 1 : 0;
  const isHeadHit = hitRegion === 'head';
  const isLeftHit = hitRegion === 'left';
  const isRightHit = hitRegion === 'right';

  return (
    <div ref={ref} className="relative flex flex-col items-center justify-center pointer-events-auto select-none">
      {/* 隨機冒出的對話氣泡 */}
      <AnimatePresence>
        {subtitle && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.6 }}
            animate={{ opacity: 1, y: -45, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className={`absolute -top-28 sm:-top-32 font-black px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl border-4 border-black z-30 shadow-2xl whitespace-nowrap text-lg sm:text-xl drop-shadow-lg ${
              isHeavyHit ? 'bg-red-500 text-white border-yellow-300' : 'bg-white text-black'
            }`}
          >
            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-t-[14px] border-r-[10px] border-r-transparent ${
              isHeavyHit ? 'border-t-yellow-300' : 'border-t-black'
            }`}></div>
            {isHeavyHit ? `💥 啊啊啊！${subtitle}` : subtitle}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute -bottom-8 z-30 px-3 py-1 rounded-full bg-black/75 border border-red-300/40 text-[11px] sm:text-xs font-black text-red-100 shadow-xl">
        🐶 邱邱挨打值 {Math.round(stress)}% ・ 破防 {knockdownCount} 次
      </div>

      {/* 狗頭與身體容器 (遭受一般打擊或重擊時劇烈的崩潰、變形與半透明閃爍動畫) */}
      <motion.div
        key={hitTrigger}
        animate={
          hitTrigger > 0
            ? isHeavyHit
              ? {
                  // 【遭受重擊】：劇烈崩潰、壓扁拉長極度變形、劇烈震盪與半透明閃爍
                  scaleX: [1, 1.45, 0.6, 1.25, 0.85, 1.1, 1],
                  scaleY: [1, 0.45, 1.5, 0.75, 1.2, 0.95, 1],
                  rotate: [0, -28, 30, -22, 18, -10, 0],
                  x: [0, -25, 28, -20, 16, -8, 0],
                  y: [0, 20, -18, 15, -10, 4, 0],
                  // 短時間內半透明狂閃 (閃爍受傷無敵狀態)
                  opacity: [1, 0.3, 0.9, 0.25, 0.85, 0.35, 1],
                  filter: [
                    'brightness(1) contrast(1)',
                    'brightness(2.2) contrast(1.8) drop-shadow(0 0 30px #ef4444)',
                    'brightness(0.6) contrast(1.5)',
                    'brightness(1.8) contrast(1.3) drop-shadow(0 0 20px #f59e0b)',
                    'brightness(1) contrast(1)',
                  ],
                }
              : {
                  // 一般打擊：位移/旋轉/形變由 JigglePhysics 驅動，這裡只做受創閃爍
                  opacity: [1, 0.85, 1],
                }
            : {}
        }
        transition={{ duration: isHeavyHit ? 0.65 : 0.32, ease: 'easeOut' }}
        className="relative flex flex-col items-center justify-center cursor-pointer active:scale-95"
      >
        {/* 自定義頭部 - 與身體緊密接合 */}
        <div className="relative z-10 -mb-14 sm:-mb-20">
          <img 
            src={headImgUrl} 
            alt="邱邱頭部" 
            className="w-36 h-36 sm:w-44 sm:h-44 object-cover rounded-full border-4 border-black bg-white shadow-2xl pointer-events-none drop-shadow-xl"
          />

          {(isHeavyHit || stressStage >= 2 || isHeadHit) && (
            <div className="absolute inset-0 flex items-center justify-center text-4xl animate-spin pointer-events-none">
              💫
            </div>
          )}
          {stressStage >= 1 && (
            <div className="absolute left-2 top-7 text-3xl sm:text-4xl rotate-[-14deg] pointer-events-none drop-shadow-lg">
              🩹
            </div>
          )}
          {stressStage >= 2 && (
            <div className="absolute right-1 top-12 text-3xl sm:text-4xl rotate-12 pointer-events-none drop-shadow-lg">
              😵
            </div>
          )}
          {stressStage >= 3 && (
            <div className="absolute inset-x-0 bottom-2 flex justify-center gap-10 text-3xl pointer-events-none">
              <span>💧</span>
              <span>💧</span>
            </div>
          )}
          {(isLeftHit || isRightHit) && (
            <motion.div
              key={`${hitTrigger}-${hitRegion}`}
              initial={{ scale: 0, opacity: 0.95 }}
              animate={{ scale: [0, 1.4, 1.05], opacity: [0.95, 0.8, 0.55] }}
              transition={{ duration: 0.42, ease: 'easeOut' }}
              className={`absolute top-16 w-14 h-10 rounded-full bg-red-500/55 blur-[1px] border-2 border-red-700/40 pointer-events-none ${
                isLeftHit ? 'left-0' : 'right-0'
              }`}
            />
          )}
        </div>

        {/* 狗身體 */}
        <div className="relative z-0">
          <img 
            src={bodyImgUrl}
            alt="邱邱身體"
            className="w-56 h-64 sm:w-64 sm:h-76 object-contain drop-shadow-2xl pointer-events-none"
          />
          {hitRegion === 'body' && (
            <motion.div
              key={`body-${hitTrigger}`}
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: [0, 1.25, 1], opacity: [0.9, 0.65, 0.25] }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute left-1/2 top-1/2 w-20 h-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/45 border-4 border-red-500/40 blur-[0.5px] pointer-events-none"
            />
          )}
        </div>

        {/* 投擲物擊中殘留在身上的污漬/番茄/雞蛋液 */}
        {splatEffects.map(splat => (
          <motion.div
            key={splat.id}
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: [0, 1.4, 1], opacity: [0.9, 0.8, 0] }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute pointer-events-none text-4xl sm:text-5xl z-20"
            style={{
              left: `calc(50% + ${splat.x}px)`,
              top: `calc(50% + ${splat.y}px)`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {splat.icon}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
});

TargetCharacter.displayName = 'TargetCharacter';

export default TargetCharacter;
