import { create } from 'zustand';
import { WeaponConfig } from '../types/weapon';
import { WEAPONS } from '../config/weapons';

interface GameState {
  currentWeapon: WeaponConfig;
  weapons: WeaponConfig[];
  currentBackground: string;
  comboCount: number;
  score: number;
  isMuted: boolean;
  
  equipWeapon: (weaponId: string) => void;
  setBackground: (bg: string) => void;
  addCombo: () => void;
  resetCombo: () => void;
  addScore: (points: number) => void;
  toggleMute: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentWeapon: WEAPONS[0], // 預設武器：打狗棍
  weapons: WEAPONS,
  currentBackground: 'office',
  comboCount: 0,
  score: 0,
  isMuted: false,

  equipWeapon: (weaponId) => 
    set((state) => {
      const weapon = state.weapons.find(w => w.id === weaponId);
      return weapon ? { currentWeapon: weapon } : state;
    }),
    
  setBackground: (bg) => set({ currentBackground: bg }),
  addCombo: () => set((state) => ({ comboCount: state.comboCount + 1 })),
  resetCombo: () => set({ comboCount: 0 }),
  addScore: (points) => set((state) => ({ score: state.score + points })),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
}));
