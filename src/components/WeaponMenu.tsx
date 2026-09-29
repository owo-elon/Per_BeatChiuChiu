import { useRef } from 'react';
import { motion } from 'motion/react';
import { useGameStore } from '../store/gameStore';
import { playEquipSound } from '../utils/audio';
import { AttackType } from '../types/weapon';

export default function WeaponMenu() {
  const { weapons, currentWeapon, equipWeapon } = useGameStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (weaponId: string) => {
    equipWeapon(weaponId);
    playEquipSound();
  };

  const getAttackTypeBadge = (type: AttackType) => {
    switch (type) {
      case 'click':
        return { label: '單擊破壞', color: 'bg-amber-500/80 text-white' };
      case 'hold':
        return { label: '長按連射', color: 'bg-red-500/80 text-white' };
      case 'drag':
        return { label: '拖曳切削', color: 'bg-cyan-500/80 text-white' };
      default:
        return { label: '直接打擊', color: 'bg-purple-500/80 text-white' };
    }
  };

  const currentBadge = getAttackTypeBadge(currentWeapon.attackType);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="absolute bottom-2 sm:bottom-4 w-full max-w-5xl px-3 sm:px-6 flex flex-col items-center z-40 select-none pointer-events-auto"
      onPointerDown={(e) => e.stopPropagation()} // 防止點擊選單時觸發打擊
    >
      {/* 頂部手持武器狀態標籤 - 明確標示當前配備武器與特性 */}
      <motion.div 
        key={currentWeapon.id}
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-1.5 bg-black/85 backdrop-blur-md px-4 py-1.5 rounded-full border border-yellow-400/40 text-xs sm:text-sm text-yellow-300 font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
      >
        <span className="text-gray-300">當前手持：</span>
        <span className="text-xl">{currentWeapon.icon}</span>
        <span className="text-white font-black">{currentWeapon.name}</span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold shadow ${currentBadge.color}`}>
          {currentBadge.label}
        </span>
        <span className="text-yellow-400/90 text-xs hidden md:inline">
          {currentWeapon.description}
        </span>
        <span className="text-xs text-orange-400 font-black">
          [傷害 +{currentWeapon.damage}]
        </span>
      </motion.div>

      {/* 武器滑動導航區域 (左右滾動箭頭 + 可水平滑動的 20 種武器列表) */}
      <div className="relative w-full flex items-center">
        {/* 左滑動箭頭 */}
        <button
          onClick={scrollLeft}
          className="absolute -left-2 sm:-left-3 z-50 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          title="向左滑動"
        >
          ‹
        </button>

        {/* 20 種武器卡片滾動列表 */}
        <div 
          ref={scrollContainerRef}
          className="w-full bg-black/75 backdrop-blur-md p-2 rounded-2xl flex gap-2.5 overflow-x-auto overflow-y-hidden shadow-2xl border border-white/10 scroll-smooth touch-pan-x cursor-grab active:cursor-grabbing hide-scrollbar"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}
        >
          {weapons.map(w => {
            const isSelected = currentWeapon.id === w.id;
            return (
              <motion.button
                key={w.id}
                whileTap={{ scale: 0.85 }}
                onClick={() => handleSelect(w.id)}
                className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 shadow-[0_0_20px_rgba(250,204,21,0.9)] -translate-y-1 border-2 border-white ring-4 ring-yellow-400/50' 
                    : 'bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30'
                }`}
                title={`${w.name} - ${w.description}`}
              >
                {/* 圖標放大 */}
                <motion.span 
                  animate={isSelected ? { scale: [1, 1.15, 1], rotate: [0, -6, 6, 0] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                  className="text-2xl sm:text-3xl filter drop-shadow-md pointer-events-none"
                >
                  {w.icon}
                </motion.span>

                {/* 武器名稱 */}
                <span className={`text-[10px] sm:text-xs font-black truncate max-w-[56px] sm:max-w-[70px] mt-0.5 pointer-events-none ${
                  isSelected ? 'text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]' : 'text-gray-200'
                }`}>
                  {w.name}
                </span>

                {/* 裝備中角標 */}
                {isSelected && (
                  <div className="absolute -top-2 -right-1 text-[8px] font-black tracking-wider bg-red-600 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-lg border border-white animate-pulse">
                    裝備中
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* 右滑動箭頭 */}
        <button
          onClick={scrollRight}
          className="absolute -right-2 sm:-right-3 z-50 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          title="向右滑動"
        >
          ›
        </button>
      </div>
    </div>
  );
}
