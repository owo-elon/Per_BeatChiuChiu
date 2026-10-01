import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WeaponConfig } from '../types/weapon';
import { WEAPONS } from '../config/weapons';

interface GameState {
  currentWeapon: WeaponConfig;
  weapons: WeaponConfig[];
  currentBackground: string;
  comboCount: number;
  maxCombo: number;
  totalHits: number;
  chiuchiuStress: number;
  knockdownCount: number;
  achievements: string[];
  achievementToast: string | null;
  score: number;
  isMuted: boolean;
  
  equipWeapon: (weaponId: string) => void;
  setBackground: (bg: string) => void;
  registerHit: (points: number) => void;
  addCombo: () => void;
  resetCombo: () => void;
  addScore: (points: number) => void;
  clearAchievementToast: () => void;
  toggleMute: () => void;
}

const ACHIEVEMENTS = [
  { id: 'first-hit', title: '開扁邱邱', description: '第一次讓邱邱汪汪叫' },
  { id: 'fifty-hits', title: '狗頭按摩師', description: '累積痛扁邱邱 50 下' },
  { id: 'combo-20', title: '霸凌連段入門', description: '達成 20 COMBO' },
  { id: 'first-knockdown', title: '邱邱破防', description: '第一次把邱邱打到破防' },
  { id: 'score-10000', title: '邱邱天敵', description: '爽度累積突破 10,000' },
] as const;

type PersistedGameState = {
  score: number;
  maxCombo: number;
  totalHits: number;
  chiuchiuStress: number;
  knockdownCount: number;
  achievements: string[];
  isMuted: boolean;
  currentBackground: string;
  weaponId: string;
};

export const useGameStore = create<GameState>()(
  persist<GameState, [], [], PersistedGameState>(
    (set) => ({
      currentWeapon: WEAPONS[0], // 預設武器：打狗棍
      weapons: WEAPONS,
      currentBackground: 'office',
      comboCount: 0,
      maxCombo: 0,
      totalHits: 0,
      chiuchiuStress: 0,
      knockdownCount: 0,
      achievements: [],
      achievementToast: null,
      score: 0,
      isMuted: false,

      equipWeapon: (weaponId) =>
        set((state) => {
          const weapon = state.weapons.find(w => w.id === weaponId);
          return weapon ? { currentWeapon: weapon } : state;
        }),

      setBackground: (bg) => set({ currentBackground: bg }),
      registerHit: (points) => set((state) => {
        const comboCount = state.comboCount + 1;
        const score = state.score + points;
        const totalHits = state.totalHits + 1;
        const stressGain = Math.max(4, Math.round(points * 0.35));
        const rawStress = state.chiuchiuStress + stressGain;
        const knockdowns = Math.floor(rawStress / 100);
        const knockdownCount = state.knockdownCount + knockdowns;
        const unlocked = new Set(state.achievements);
        const newlyUnlocked: string[] = [];

        for (const achievement of ACHIEVEMENTS) {
          const shouldUnlock =
            (achievement.id === 'first-hit' && totalHits >= 1) ||
            (achievement.id === 'fifty-hits' && totalHits >= 50) ||
            (achievement.id === 'combo-20' && comboCount >= 20) ||
            (achievement.id === 'first-knockdown' && knockdownCount >= 1) ||
            (achievement.id === 'score-10000' && score >= 10000);

          if (shouldUnlock && !unlocked.has(achievement.id)) {
            unlocked.add(achievement.id);
            newlyUnlocked.push(`🏆 ${achievement.title}：${achievement.description}`);
          }
        }

        return {
          comboCount,
          maxCombo: Math.max(state.maxCombo, comboCount),
          score,
          totalHits,
          chiuchiuStress: rawStress % 100,
          knockdownCount,
          achievements: Array.from(unlocked),
          achievementToast: newlyUnlocked.at(-1) ?? state.achievementToast,
        };
      }),
      addCombo: () => set((state) => {
        const comboCount = state.comboCount + 1;
        return { comboCount, maxCombo: Math.max(state.maxCombo, comboCount) };
      }),
      resetCombo: () => set({ comboCount: 0 }),
      addScore: (points) => set((state) => ({ score: state.score + points })),
      clearAchievementToast: () => set({ achievementToast: null }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    }),
    {
      name: 'beat-chiuchiu-save',
      // 只存玩家進度與設定；武器以 id 還原
      partialize: (s) => ({
        score: s.score,
        maxCombo: s.maxCombo,
        totalHits: s.totalHits,
        chiuchiuStress: s.chiuchiuStress,
        knockdownCount: s.knockdownCount,
        achievements: s.achievements,
        isMuted: s.isMuted,
        currentBackground: s.currentBackground,
        weaponId: s.currentWeapon.id,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PersistedGameState>;
        return {
          ...current,
          score: p.score ?? current.score,
          maxCombo: p.maxCombo ?? current.maxCombo,
          totalHits: p.totalHits ?? current.totalHits,
          chiuchiuStress: p.chiuchiuStress ?? current.chiuchiuStress,
          knockdownCount: p.knockdownCount ?? current.knockdownCount,
          achievements: p.achievements ?? current.achievements,
          isMuted: p.isMuted ?? current.isMuted,
          currentBackground: p.currentBackground ?? current.currentBackground,
          currentWeapon: current.weapons.find(w => w.id === p.weaponId) ?? current.currentWeapon,
        };
      },
    }
  )
);
