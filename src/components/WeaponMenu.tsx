import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { motion } from 'motion/react';
import { useGameStore } from '../store/gameStore';
import { playEquipSound } from '../utils/audio';
import { AttackType, WeaponCategory } from '../types/weapon';

type CategoryFilter = 'all' | WeaponCategory;

const CATEGORY_TABS: { id: CategoryFilter; label: string; icon: string }[] = [
  { id: 'all', label: '全部', icon: '✨' },
  { id: 'melee', label: '近戰', icon: '🪵' },
  { id: 'throwable', label: '投擲', icon: '🥟' },
  { id: 'ranged', label: '槍械', icon: '🔫' },
  { id: 'magic', label: '魔法', icon: '⚡' },
  { id: 'special', label: '特殊', icon: '🐾' },
];

export default function WeaponMenu() {
  const { weapons, currentWeapon, equipWeapon } = useGameStore();
  const menuRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const didDragRef = useRef(false);
  const [category, setCategory] = useState<CategoryFilter>('all');

  const filteredWeapons = useMemo(() => (
    category === 'all' ? weapons : weapons.filter(weapon => weapon.category === category)
  ), [category, weapons]);

  useEffect(() => {
    const menu = menuRef.current;
    const shell = menu?.parentElement;
    if (!menu || !shell) return;

    const updateMenuHeight = () => {
      shell.style.setProperty('--menu-h', `${Math.ceil(menu.getBoundingClientRect().height)}px`);
    };

    updateMenuHeight();
    const observer = new ResizeObserver(updateMenuHeight);
    observer.observe(menu);
    window.visualViewport?.addEventListener('resize', updateMenuHeight);
    window.addEventListener('orientationchange', updateMenuHeight);

    return () => {
      observer.disconnect();
      window.visualViewport?.removeEventListener('resize', updateMenuHeight);
      window.removeEventListener('orientationchange', updateMenuHeight);
    };
  }, []);

  useEffect(() => {
    const selected = scrollContainerRef.current?.querySelector<HTMLElement>(`[data-weapon-id="${currentWeapon.id}"]`);
    selected?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [currentWeapon.id, category]);

  const handleSelect = (weaponId: string) => {
    if (didDragRef.current) return;
    if (weaponId !== currentWeapon.id) {
      equipWeapon(weaponId);
      playEquipSound();
    }
  };

  const getAttackTypeBadge = (type: AttackType) => {
    switch (type) {
      case 'click':
        return { label: '單擊', color: 'bg-amber-500/85 text-white' };
      case 'hold':
        return { label: '長按', color: 'bg-red-500/85 text-white' };
      case 'drag':
        return { label: '拖曳', color: 'bg-cyan-500/85 text-white' };
      default:
        return { label: '直接', color: 'bg-purple-500/85 text-white' };
    }
  };

  const currentBadge = getAttackTypeBadge(currentWeapon.attackType);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -260, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 260, behavior: 'smooth' });
  };

  const handleCardPointerDown = (event: PointerEvent) => {
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    didDragRef.current = false;
  };

  const handleCardPointerMove = (event: PointerEvent) => {
    const start = dragStartRef.current;
    if (!start) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) {
      didDragRef.current = true;
    }
  };

  const handleCardPointerEnd = () => {
    window.setTimeout(() => {
      didDragRef.current = false;
      dragStartRef.current = null;
    }, 0);
  };

  return (
    <nav
      ref={menuRef}
      className="relative z-40 w-full px-2 pb-[max(0.5rem,var(--safe-bottom))] pt-1 pointer-events-auto select-none sm:px-6 sm:pb-[max(1rem,var(--safe-bottom))]"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1.5 rounded-t-3xl border border-white/10 bg-black/70 p-2 shadow-2xl backdrop-blur-md sm:gap-2 sm:rounded-3xl sm:p-3">
        <div className="flex items-center justify-between gap-2">
          <motion.div
            key={currentWeapon.id}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="min-w-0 flex flex-1 items-center gap-1.5 rounded-full border border-yellow-400/40 bg-black/65 px-3 py-1.5 text-xs font-bold text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.25)] sm:gap-2 sm:px-4 sm:text-sm"
          >
            <span className="hidden text-gray-300 sm:inline">當前手持：</span>
            <span className="shrink-0 text-xl sm:text-2xl">{currentWeapon.icon}</span>
            <span className="min-w-0 truncate font-black text-white">{currentWeapon.name}</span>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black shadow sm:text-[11px] ${currentBadge.color}`}>
              {currentBadge.label}
            </span>
            <span className="hidden min-w-0 truncate text-xs text-yellow-400/90 lg:inline">
              {currentWeapon.description}
            </span>
            <span className="shrink-0 text-[10px] font-black text-orange-400 sm:text-xs">
              +{currentWeapon.damage}
            </span>
          </motion.div>
        </div>

        <div className="hide-scrollbar flex max-h-8 gap-1 overflow-x-auto touch-pan-x sm:gap-1.5">
          {CATEGORY_TABS.map(tab => {
            const isActive = category === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategory(tab.id)}
                className={`h-8 shrink-0 rounded-full border px-3 text-xs font-black transition ${
                  isActive
                    ? 'border-yellow-200 bg-yellow-300 text-black'
                    : 'border-white/10 bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative flex w-full items-center">
          <button
            onClick={scrollLeft}
            className="absolute left-2 z-50 hidden h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white shadow-lg transition-transform hover:scale-110 hover:bg-black active:scale-95 sm:flex"
            title="向左滑動"
          >
            ‹
          </button>

          <div
            ref={scrollContainerRef}
            className="hide-scrollbar flex w-full snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden scroll-smooth rounded-2xl border border-white/10 bg-black/45 p-1.5 touch-pan-x sm:gap-2.5 sm:p-2"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
            }}
          >
            {filteredWeapons.map(weapon => {
              const isSelected = currentWeapon.id === weapon.id;
              return (
                <motion.button
                  key={weapon.id}
                  data-weapon-id={weapon.id}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onPointerDown={handleCardPointerDown}
                  onPointerMove={handleCardPointerMove}
                  onPointerUp={handleCardPointerEnd}
                  onPointerCancel={handleCardPointerEnd}
                  onClick={() => handleSelect(weapon.id)}
                  className={`relative flex h-14 w-14 shrink-0 snap-center flex-col items-center justify-center rounded-2xl transition-all duration-200 sm:h-20 sm:w-20 ${
                    isSelected
                      ? 'border-2 border-white bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 shadow-[0_0_20px_rgba(250,204,21,0.9)] ring-4 ring-yellow-400/50 sm:-translate-y-1'
                      : 'border border-white/10 bg-white/10 hover:border-white/30 hover:bg-white/20'
                  }`}
                  title={`${weapon.name} - ${weapon.description}`}
                >
                  <motion.span
                    animate={isSelected ? { scale: [1, 1.14, 1], rotate: [0, -6, 6, 0] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                    className="pointer-events-none text-2xl drop-shadow-md sm:text-3xl"
                  >
                    {weapon.icon}
                  </motion.span>

                  <span className={`pointer-events-none mt-0.5 max-w-[48px] truncate text-[10px] font-black sm:max-w-[70px] sm:text-xs ${
                    isSelected ? 'text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]' : 'text-gray-200'
                  }`}>
                    {weapon.name}
                  </span>

                  {isSelected && (
                    <div className="absolute -right-1 -top-2 whitespace-nowrap rounded-full border border-white bg-red-600 px-1.5 py-0.5 text-[8px] font-black tracking-wider text-white shadow-lg sm:animate-pulse">
                      裝備中
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          <button
            onClick={scrollRight}
            className="absolute right-2 z-50 hidden h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white shadow-lg transition-transform hover:scale-110 hover:bg-black active:scale-95 sm:flex"
            title="向右滑動"
          >
            ›
          </button>
        </div>
      </div>
    </nav>
  );
}
