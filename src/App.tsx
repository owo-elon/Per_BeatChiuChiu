import { useRef, useCallback, useEffect, useState, useLayoutEffect } from 'react';
import { useGameStore } from './store/gameStore';
import ThreeScene from './components/ThreeScene';
import WeaponMenu from './components/WeaponMenu';
import GameBackground from './components/GameBackground';
import { motion, AnimatePresence } from 'motion/react';

const BACKGROUND_OPTIONS = [
  { id: 'office', icon: '🏢', label: '辦公室' },
  { id: 'street', icon: '🏙️', label: '街頭' },
  { id: 'park', icon: '🌳', label: '公園' },
];

export default function App() {
  const {
    currentBackground,
    comboCount,
    maxCombo,
    totalHits,
    chiuchiuStress,
    knockdownCount,
    achievements,
    achievementToast,
    score,
    isMuted,
    registerHit,
    resetCombo,
    clearAchievementToast,
    setBackground,
    toggleMute,
  } = useGameStore();

  const shellRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLElement>(null);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSceneMenuOpen, setIsSceneMenuOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const isFrenzy = comboCount >= 20;
  const currentBackgroundOption = BACKGROUND_OPTIONS.find(option => option.id === currentBackground) ?? BACKGROUND_OPTIONS[0];

  useLayoutEffect(() => {
    const shell = shellRef.current;
    const hud = hudRef.current;
    if (!shell || !hud) return;

    const updateHudHeight = () => {
      shell.style.setProperty('--hud-h', `${Math.ceil(hud.getBoundingClientRect().height)}px`);
    };

    updateHudHeight();
    const observer = new ResizeObserver(updateHudHeight);
    observer.observe(hud);
    window.visualViewport?.addEventListener('resize', updateHudHeight);
    window.addEventListener('orientationchange', updateHudHeight);

    return () => {
      observer.disconnect();
      window.visualViewport?.removeEventListener('resize', updateHudHeight);
      window.removeEventListener('orientationchange', updateHudHeight);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (comboTimerRef.current) {
        clearTimeout(comboTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!achievementToast) return;
    const timer = setTimeout(clearAchievementToast, 2600);
    return () => clearTimeout(timer);
  }, [achievementToast, clearAchievementToast]);

  const refreshComboTimer = useCallback(() => {
    if (comboTimerRef.current) {
      clearTimeout(comboTimerRef.current);
    }
    comboTimerRef.current = setTimeout(() => {
      resetCombo();
    }, 3000);
  }, [resetCombo]);

  const handleHit = useCallback((damage: number) => {
    registerHit(damage);
    refreshComboTimer();
  }, [registerHit, refreshComboTimer]);

  const handleBackgroundChange = (backgroundId: string) => {
    setBackground(backgroundId);
    setIsSceneMenuOpen(false);
  };

  return (
    <div
      ref={shellRef}
      className="app-shell relative grid grid-rows-[auto_minmax(0,1fr)_auto] select-none text-white"
      onContextMenu={(e) => e.preventDefault()}
    >
      <GameBackground type={currentBackground} />

      <AnimatePresence>
        {isFrenzy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.55, 0.82, 0.55],
              scale: [1, 1.006, 0.997, 1],
            }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 pointer-events-none z-30 shadow-[inset_0_0_60px_rgba(239,68,68,0.72),inset_0_0_110px_rgba(185,28,28,0.55)] border-4 sm:border-8 border-red-600/60 motion-reduce:hidden"
          />
        )}
      </AnimatePresence>

      <header
        ref={hudRef}
        className="relative z-40 w-full min-w-0 px-2 pb-1 pt-2 pointer-events-auto sm:px-6 sm:pb-3 sm:pt-4"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="mx-auto max-w-7xl rounded-2xl border border-white/10 bg-black/55 px-2.5 py-2 shadow-2xl backdrop-blur-md sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="min-w-0 shrink-0">
              <h1 className="text-lg font-black tracking-widest text-yellow-300 drop-shadow-[0_2px_0_#000] sm:text-4xl">
                打邱邱
              </h1>
              <div className="hidden text-[11px] font-black tracking-[0.25em] text-red-200 sm:block">
                痛扁狗狗邱邱・打到汪汪叫
              </div>
            </div>

            <div className="min-w-0 flex-1 text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-yellow-300/80 sm:text-xs">
                打邱邱爽度
              </div>
              <div className="truncate font-mono text-xl font-black tabular-nums text-yellow-400 drop-shadow-md sm:text-4xl">
                {score.toLocaleString()}
              </div>
            </div>

            <div className="relative flex shrink-0 items-center gap-1.5 sm:gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsStatsOpen(prev => !prev)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-black/60 text-xl shadow-xl transition hover:bg-black/80 sm:hidden"
                title="查看戰績"
              >
                📊
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleMute}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-xl shadow-xl backdrop-blur-md transition-all sm:h-14 sm:w-14 sm:text-2xl ${
                  isMuted
                    ? 'border-red-400 bg-red-500/80 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:bg-red-500'
                    : 'border-white/15 bg-black/60 text-yellow-300 hover:bg-black/80'
                }`}
                title={isMuted ? '點擊解除靜音' : '點擊開啟靜音'}
              >
                {isMuted ? '🔇' : '🔊'}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSceneMenuOpen(prev => !prev)}
                className="flex h-11 min-w-11 items-center justify-center gap-1 rounded-2xl border border-white/15 bg-black/60 px-3 text-xl font-black shadow-xl backdrop-blur-md transition hover:bg-black/80 sm:h-14 sm:px-4"
                title="切換場景"
                aria-expanded={isSceneMenuOpen}
              >
                <span>{currentBackgroundOption.icon}</span>
                <span className="hidden text-xs text-white/80 sm:inline">{currentBackgroundOption.label}</span>
              </motion.button>

              <AnimatePresence>
                {isSceneMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    className="absolute right-0 top-[calc(100%+8px)] z-50 w-44 rounded-2xl border border-white/15 bg-black/90 p-2 shadow-2xl backdrop-blur-md"
                  >
                    {BACKGROUND_OPTIONS.map(option => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleBackgroundChange(option.id)}
                        className={`flex h-11 w-full items-center gap-2 rounded-xl px-3 text-sm font-black transition ${
                          option.id === currentBackground
                            ? 'bg-yellow-300 text-black'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="text-xl">{option.icon}</span>
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:mt-3">
            <span className="text-[11px] font-black tracking-wider text-red-100 sm:text-xs">邱邱挨打值</span>
            <div className="h-2.5 overflow-hidden rounded-full border border-white/10 bg-white/10 sm:h-3">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-red-500 to-fuchsia-500"
                animate={{ width: `${chiuchiuStress}%` }}
                transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              />
            </div>
            <span className="font-mono text-[11px] font-black tabular-nums text-red-100 sm:text-xs">
              {Math.round(chiuchiuStress)}%
            </span>
          </div>

          <div className="mt-1 hidden items-center justify-between gap-2 text-[11px] font-bold text-white/70 sm:flex">
            <span>已打邱邱 {totalHits.toLocaleString()} 下</span>
            <span>最高 {maxCombo} COMBO</span>
            <span>破防 {knockdownCount} 次</span>
            <span>成就 {achievements.length}/5</span>
          </div>

          <AnimatePresence>
            {isStatsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 overflow-hidden sm:hidden"
              >
                <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-white/10 p-2 text-[11px] font-bold text-white/80">
                  <span>已打 {totalHits.toLocaleString()} 下</span>
                  <span>最高 {maxCombo} COMBO</span>
                  <span>破防 {knockdownCount} 次</span>
                  <span>成就 {achievements.length}/5</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="relative z-20 min-h-0 min-w-0 overflow-hidden">
        <AnimatePresence>
          {comboCount > 1 && (
            <motion.div
              key={isFrenzy ? 'frenzy' : 'normal'}
              initial={{ scale: 0.85, opacity: 0, y: -10 }}
              animate={
                isFrenzy
                  ? {
                      scale: [1, 1.18, 1.08, 1.2],
                      rotate: [-4, 4, -2, 3, 0],
                      opacity: 1,
                      y: [0, -2, 1, 0],
                    }
                  : { scale: 1, opacity: 1, y: 0 }
              }
              exit={{ scale: 0.7, opacity: 0, y: -8, transition: { duration: 0.25 } }}
              transition={{
                duration: isFrenzy ? 0.38 : 0.22,
                repeat: isFrenzy ? Infinity : 0,
                repeatType: 'reverse',
              }}
              className={`pointer-events-none absolute left-1/2 top-2 z-50 max-w-[90vw] -translate-x-1/2 truncate rounded-xl border px-4 py-1.5 text-center font-black italic shadow-2xl motion-reduce:animate-none sm:top-4 sm:px-5 sm:py-2 ${
                isFrenzy
                  ? 'border-yellow-300 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-xl text-yellow-200 shadow-[0_0_25px_#ef4444] sm:text-3xl'
                  : 'border-yellow-300/40 bg-gradient-to-r from-red-600 to-amber-600 text-lg text-white shadow-lg sm:text-2xl'
              }`}
            >
              {isFrenzy ? `🔥 COMBO x${comboCount} 🔥` : `Combo x${comboCount}`}
            </motion.div>
          )}
        </AnimatePresence>

        <ThreeScene onHit={handleHit} />
      </main>

      <AnimatePresence>
        {achievementToast && (
          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            className="pointer-events-none absolute left-1/2 z-50 max-w-[92vw] -translate-x-1/2 break-words rounded-2xl border-4 border-black bg-yellow-300 px-4 py-2.5 text-center text-sm font-black text-black shadow-[0_8px_0_rgba(0,0,0,0.9)] sm:text-base"
            style={{ top: 'calc(var(--safe-top) + var(--hud-h) + 8px)' }}
          >
            {achievementToast}
          </motion.div>
        )}
      </AnimatePresence>

      <WeaponMenu />
    </div>
  );
}
