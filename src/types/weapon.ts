// 武器定義與 TypeScript 型別
export type AttackType = 'click' | 'hold' | 'drag';

export type WeaponCategory = 'melee' | 'throwable' | 'ranged' | 'magic' | 'special';

export type ParticleType = 
  | 'wood' 
  | 'feather' 
  | 'spark' 
  | 'juice' 
  | 'gold' 
  | 'ice' 
  | 'electric' 
  | 'fire' 
  | 'food' 
  | 'void'
  | 'dust';

// 專屬武器動畫模式分類：
// 1. swing: 3D 弧線重擊揮舞 (打狗棍、平底鍋、法式長棍、狂暴榴槤槌)
// 2. slap: 連續快速抽打拍打 (台味藍白拖、鮮美大鮭魚)
// 3. squeeze: 擠壓變形再暴彈 (尖叫雞、粉紅貓爪)
// 4. fall_crush: 高空直墜重壓 (發財黃金磚)
// 5. beam: 雷射射線光束發射 (脈衝雷射槍)
// 6. rocket_shoot: 飛彈呼嘯直線推進射擊 (火箭筒)
// 7. lob_throw: 拋物線丟擲 (阿嬤臭豆腐)
// 8. lightning_strike: 天降神雷轟擊 (雷神之鎚)
// 9. plunger_pull: 吸盤拉扯彈跳 (萬能馬桶吸盤)
// 10. ice_pierce: 冰錐急速刺擊凍結 (極光冰錐)
// 11. keyboard_smash: 鍵盤猛砸飛濺 (RGB 機械鍵盤)
// 12. tornado_wind: 渦輪狂風風道 (工業大風扇)
// 13. boba_burst: 機關連發噴射珍珠 (爆漿珍奶砲)
// 14. saber_slash: 炫彩光劍刀光切削 (光速量子劍)
// 15. vortex_collapse: 引力奇異點黑洞旋轉坍縮 (微型黑洞產生器)
// 16. sniper_shot: 狙擊鏡準心鎖定超音速穿甲狙擊彈 (重裝狙擊槍)
export type AnimPattern = 
  | 'swing'
  | 'slap'
  | 'squeeze'
  | 'fall_crush'
  | 'beam'
  | 'rocket_shoot'
  | 'lob_throw'
  | 'lightning_strike'
  | 'plunger_pull'
  | 'ice_pierce'
  | 'keyboard_smash'
  | 'tornado_wind'
  | 'boba_burst'
  | 'saber_slash'
  | 'vortex_collapse'
  | 'sniper_shot';

export interface PhysicalForce {
  impulse: number;    // 衝量大小
  damping: number;    // 阻尼係數 (衰減速度)
  stiffness: number;  // 剛度/彈性係數 (回彈頻率)
}

export interface WeaponConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  damage: number;
  category: WeaponCategory;
  attackType: AttackType;
  animPattern: AnimPattern; // 專屬品種動畫模式
  hitSound: string;
  physicalForce: PhysicalForce;
  particleType: ParticleType;
  subtitles: string[];
}
