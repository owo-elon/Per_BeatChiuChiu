import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import headImgUrl from '../assets/head.png';
import bodyImgUrl from '../assets/dog_body.png';

interface TargetCharacterProps {
  hitTrigger: number;
  subtitle: string | null;
  splatEffects: { id: number; icon: string; x: number; y: number }[];
  isHeavyHit: boolean; // 是否遭受手榴彈或閃電等重擊
}

const TargetCharacter = forwardRef<HTMLDivElement, TargetCharacterProps>(({
  hitTrigger,
  subtitle,
  splatEffects,
  isHeavyHit,
}, ref) => {
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
                  // 一般打擊：原本的彈性縮放與抖動
                  scale: [1, 0.82, 1.18, 0.94, 1.05, 1],
                  rotate: [0, -12, 14, -8, 6, 0],
                  x: [0, -10, 12, -8, 4, 0],
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
          {/* 重擊時頭部眼冒金星與漩渦眼效果 */}
          {isHeavyHit && (
            <div className="absolute inset-0 flex items-center justify-center text-4xl animate-spin pointer-events-none">
              💫
            </div>
          )}
        </div>

        {/* 狗身體 */}
        <div className="relative z-0">
          <img 
            src={bodyImgUrl}
            alt="邱邱身體"
            className="w-56 h-64 sm:w-64 sm:h-76 object-contain drop-shadow-2xl pointer-events-none"
          />
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
