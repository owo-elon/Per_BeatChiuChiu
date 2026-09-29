import { useRef, useCallback, useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import ThreeScene from './components/ThreeScene';
import WeaponMenu from './components/WeaponMenu';
import GameBackground from './components/GameBackground';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const {
    currentBackground,
    comboCount,
    score,
    isMuted,
    addCombo,
    resetCombo,
    addScore,
    setBackground,
    toggleMute,
  } = useGameStore();

  // Combo 超時自動中斷計時器 (3 秒沒打擊則重設 Combo 與狂暴狀態)
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 是否進入狂暴狀態 (Combo >= 20)
  const isFrenzy = comboCount >= 20;

  useEffect(() => {
    return () => {
      if (comboTimerRef.current) {
        clearTimeout(comboTimerRef.current);
      }
    };
  }, []);

  // 重設 Combo 計時器 (若 3 秒內沒有再次打擊，則中斷 Combo，退出狂暴狀態)
  const refreshComboTimer = useCallback(() => {
    if (comboTimerRef.current) {
      clearTimeout(comboTimerRef.current);
    }
    comboTimerRef.current = setTimeout(() => {
      resetCombo();
    }, 3000);
  }, [resetCombo]);

  // ThreeScene 回呼：打擊邱邱
  const handleHit = useCallback((damage: number) => {
    addCombo();
    refreshComboTimer();
    addScore(damage);
  }, [addCombo, addScore, refreshComboTimer]);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col items-center select-none touch-none">
      {/* 實體遊戲場景渲染：辦公室老闆房、霓虹街頭巷弄、陽光公園綠地 */}
      <GameBackground type={currentBackground} />

      {/* 【狂暴狀態特效】：當 comboCount >= 20 且持續點擊時啟動，邊緣紅色高頻震盪光暈 */}
      <AnimatePresence>
        {isFrenzy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.7, 0.95, 0.7],
              scale: [1, 1.012, 0.99, 1],
            }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            transition={{
              duration: 0.28,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 pointer-events-none z-30 shadow-[inset_0_0_80px_rgba(239,68,68,0.85),inset_0_0_140px_rgba(185,28,28,0.7)] border-8 border-red-600/70"
          >
            <div className="absolute top-20 left-1/2 -translate-x-1/2 px-6 py-1 bg-red-600/90 text-white font-black text-sm tracking-widest uppercase rounded-full shadow-[0_0_20px_#ef4444] animate-bounce">
              ⚡ FRENZY MODE 狂暴發洩狀態 ⚡
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 頂部狀態列 */}
      <div className="absolute top-0 w-full p-4 sm:p-6 flex justify-between items-start z-40 pointer-events-none">
        {/* 左側：爽度指數 + 音量切換按鈕 */}
        <div className="flex items-center gap-3 pointer-events-auto" onPointerDown={(e) => e.stopPropagation()}>
          <div className="bg-black/60 backdrop-blur-md text-white px-5 py-2 sm:px-6 sm:py-2.5 rounded-2xl shadow-xl border border-white/10">
            <div className="text-xs text-yellow-300/80 font-bold tracking-widest uppercase">爽度指數</div>
            <div className="text-3xl sm:text-4xl font-black text-yellow-400 drop-shadow-md">
              {score.toLocaleString()}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={toggleMute}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-xl backdrop-blur-md border transition-all cursor-pointer ${
              isMuted
                ? 'bg-red-500/80 hover:bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                : 'bg-black/60 hover:bg-black/80 text-yellow-300 border-white/15'
            }`}
            title={isMuted ? '點擊解除靜音' : '點擊開啟靜音'}
          >
            {isMuted ? '🔇' : '🔊'}
          </motion.button>
        </div>

        {/* 右側：Combo 顯示與場景選擇 */}
        <div className="flex flex-col items-end gap-2.5 pointer-events-auto" onPointerDown={(e) => e.stopPropagation()}>
          <AnimatePresence>
            {comboCount > 1 && (
              <motion.div 
                key={isFrenzy ? 'frenzy' : 'normal'}
                initial={
                  isFrenzy
                    ? { scale: 2.2, rotate: -15, opacity: 0, x: 30 }
                    : { scale: 1.4, opacity: 0, x: 20 }
                }
                animate={
                  isFrenzy
                    ? {
                        scale: [1.8, 2.1, 1.7, 1.9],
                        rotate: [-8, 8, -5, 6, 0],
                        x: [-4, 6, -3, 4, 0],
                        y: [3, -5, 2, -3, 0],
                        opacity: 1,
                      }
                    : { scale: 1, opacity: 1, x: 0 }
                }
                exit={{ scale: 0.6, opacity: 0, transition: { duration: 0.3 } }}
                transition={{
                  duration: isFrenzy ? 0.35 : 0.25,
                  repeat: isFrenzy ? Infinity : 0,
                  repeatType: 'reverse',
                }}
                className={`px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl font-black italic shadow-2xl border ${
                  isFrenzy
                    ? 'bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-yellow-200 text-2xl sm:text-3xl border-yellow-300 shadow-[0_0_25px_#ef4444]'
                    : 'bg-gradient-to-r from-red-600 to-amber-600 text-white text-xl sm:text-2xl border-yellow-300/40 shadow-lg'
                }`}
              >
                {isFrenzy ? `🔥 COMBO x${comboCount} 🔥` : `Combo x${comboCount}`}
              </motion.div>
            )}
          </AnimatePresence>

          <select 
            className="bg-black/75 text-white border border-white/20 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-bold outline-none shadow-2xl cursor-pointer hover:bg-black/90 transition-colors"
            value={currentBackground}
            onChange={(e) => setBackground(e.target.value)}
          >
            <option value="office">🏢 辦公室老闆房</option>
            <option value="street">🏙️ 霓虹街頭巷弄</option>
            <option value="park">🌳 陽光公園綠地</option>
          </select>
        </div>
      </div>

      {/* 主 3D 遊戲畫布 (包含 Three.js Jiggle 彈簧物理、GPU 3D 粒子系統、漫畫對話浮動與傷害計算) */}
      <div className="flex-1 w-full h-full relative z-20 pb-20">
        <ThreeScene onHit={handleHit} />
      </div>

      {/* 底部 20 種武器選單 */}
      <WeaponMenu />
    </div>
  );
}
