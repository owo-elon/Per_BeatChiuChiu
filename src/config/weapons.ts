import { WeaponConfig } from '../types/weapon';

export const WEAPONS: WeaponConfig[] = [
  // 1. 打狗棍 (Dog-Beating Staff) [必備武器]
  {
    id: 'dog_stick',
    name: '打狗棍',
    description: '經典丐幫秘傳打狗棒法！側向橫掃揮擊！',
    icon: '🪵',
    damage: 25,
    attackType: 'click',
    animPattern: 'swing',
    hitSound: 'staff',
    physicalForce: { impulse: 18, damping: 0.82, stiffness: 220 },
    particleType: 'wood',
    subtitles: ['打狗棒法！', '嗷嗚！痛痛痛！', '好棍法！', '看招三十六路棒法！'],
  },

  // 2. 尖叫雞 (Screaming Chicken)
  {
    id: 'chicken',
    name: '尖叫雞',
    description: '急速壓扁魔性慘叫，伴隨高頻彈跳！',
    icon: '🐔',
    damage: 15,
    attackType: 'click',
    animPattern: 'squeeze',
    hitSound: 'chicken',
    physicalForce: { impulse: 14, damping: 0.75, stiffness: 340 },
    particleType: 'feather',
    subtitles: ['咕──！', '別捏了！', '尖叫警告！', '魔性穿腦！'],
  },

  // 3. 台味藍白拖 (Taiwanese Blue-White Slipper)
  {
    id: 'slipper',
    name: '台味藍白拖',
    description: '阿嬤的傳家至寶，啪啪啪超高頻急速抽打！',
    icon: '🩴',
    damage: 20,
    attackType: 'click',
    animPattern: 'slap',
    hitSound: 'slipper',
    physicalForce: { impulse: 16, damping: 0.88, stiffness: 280 },
    particleType: 'spark',
    subtitles: ['啪！啪！啪！', '阿嬤的武器！', '不敢了啦！', '打斷手骨顛倒勇！'],
  },

  // 4. 平底鍋 (Frying Pan)
  {
    id: 'frying_pan',
    name: '平底鍋',
    description: '重型金屬平底鍋橫向猛揮，金屬狂響眼冒金星！',
    icon: '🍳',
    damage: 35,
    attackType: 'click',
    animPattern: 'swing',
    hitSound: 'pan',
    physicalForce: { impulse: 28, damping: 0.78, stiffness: 180 },
    particleType: 'spark',
    subtitles: ['鏘！金屬狂響！', '頭好暈...', '看見星星了...', '平底鍋神威！'],
  },

  // 5. 發財黃金磚 (Golden Brick)
  {
    id: 'golden_brick',
    name: '發財黃金磚',
    description: '金磚高空直墜砸落，享受被錢砸的極致快感！',
    icon: '🪙',
    damage: 50,
    attackType: 'click',
    animPattern: 'fall_crush',
    hitSound: 'gold',
    physicalForce: { impulse: 32, damping: 0.7, stiffness: 260 },
    particleType: 'gold',
    subtitles: ['被錢砸的感覺！', '爽度 +9999！', '再來一塊！', '財富自由啦！'],
  },

  // 6. 脈衝雷射槍 (Laser Blaster)
  {
    id: 'laser_blaster',
    name: '脈衝雷射槍',
    description: '長按持續連射高能霓虹雷射束，穿透打擊！',
    icon: '🔫',
    damage: 12,
    attackType: 'hold',
    animPattern: 'beam',
    hitSound: 'laser',
    physicalForce: { impulse: 8, damping: 0.9, stiffness: 300 },
    particleType: 'electric',
    subtitles: ['嗶嗶嗶！高能預警！', '被蒸發了！', '太硬了吧！', '全彈發射！'],
  },

  // 7. 火箭筒 (RPG Rocket Launcher)
  {
    id: 'rpg_rocket',
    name: '火箭筒',
    description: '轟天飛彈呼嘯直線射入，全螢幕烈火大爆炸！',
    icon: '🚀',
    damage: 80,
    attackType: 'click',
    animPattern: 'rocket_shoot',
    hitSound: 'explosion',
    physicalForce: { impulse: 45, damping: 0.65, stiffness: 150 },
    particleType: 'fire',
    subtitles: ['Boom！炸裂！', '直接起飛！', '太過分了！', '寸草不生！'],
  },

  // 8. 阿嬤臭豆腐 (Stinky Tofu)
  {
    id: 'stinky_tofu',
    name: '阿嬤臭豆腐',
    description: '手拋弧線丟擲臭豆腐，濃郁綠霧炸裂！',
    icon: '🧈',
    damage: 18,
    attackType: 'click',
    animPattern: 'lob_throw',
    hitSound: 'splat',
    physicalForce: { impulse: 15, damping: 0.92, stiffness: 120 },
    particleType: 'food',
    subtitles: ['好臭！好喜歡！', '這味道太頂了！', '辣醬加滿！', '泡菜在哪裡？！'],
  },

  // 9. 雷神之鎚 (Mjolnir Thunder Hammer)
  {
    id: 'thunder_hammer',
    name: '雷神之鎚',
    description: '巨鎚擎天召喚落雷直轟頂，紫藍電光纏繞！',
    icon: '⚡',
    damage: 65,
    attackType: 'click',
    animPattern: 'lightning_strike',
    hitSound: 'thunder',
    physicalForce: { impulse: 36, damping: 0.72, stiffness: 240 },
    particleType: 'electric',
    subtitles: ['索爾附體！', '電到麻木！', '神罰降臨！', '轟頂雷光！'],
  },

  // 10. 鮮美大鮭魚 (Fresh Salmon)
  {
    id: 'salmon',
    name: '鮮美大鮭魚',
    description: '深海大鮭魚滑溜抽擊，魚尾連續甩臉！',
    icon: '🐟',
    damage: 22,
    attackType: 'click',
    animPattern: 'slap',
    hitSound: 'slap',
    physicalForce: { impulse: 20, damping: 0.85, stiffness: 190 },
    particleType: 'juice',
    subtitles: ['啪！鮮味十足！', '好滑！好爽！', '魚尾抽擊！', '生魚片外送！'],
  },

  // 11. 萬能馬桶吸盤 (Toilet Plunger)
  {
    id: 'plunger',
    name: '萬能馬桶吸盤',
    description: '強力吸住向外拉長，釋放時劇烈啵啵回彈！',
    icon: '🪠',
    damage: 26,
    attackType: 'drag',
    animPattern: 'plunger_pull',
    hitSound: 'pop',
    physicalForce: { impulse: 25, damping: 0.8, stiffness: 160 },
    particleType: 'juice',
    subtitles: ['吸力超強！', '啵！鬆開了！', '這什麼吸盤？！', '通暢無比！'],
  },

  // 12. 極光冰錐 (Aurora Ice Spike)
  {
    id: 'ice_spike',
    name: '極光冰錐',
    description: '極速刺擊目標並凍結冰晶，碎成冰渣彈飛！',
    icon: '❄️',
    damage: 40,
    attackType: 'click',
    animPattern: 'ice_pierce',
    hitSound: 'freeze',
    physicalForce: { impulse: 24, damping: 0.86, stiffness: 250 },
    particleType: 'ice',
    subtitles: ['太冷了！', '瞬間凍結！', '碎成冰渣！', '絕對零度！'],
  },

  // 13. 狂暴榴槤槌 (Durian Mace)
  {
    id: 'durian_mace',
    name: '狂暴榴槤槌',
    description: '帶刺榴槤狼牙棒重度揮擊，果肉尖刺四濺！',
    icon: '🍈',
    damage: 48,
    attackType: 'click',
    animPattern: 'swing',
    hitSound: 'crush',
    physicalForce: { impulse: 30, damping: 0.74, stiffness: 210 },
    particleType: 'juice',
    subtitles: ['刺刺的！', '水果之王！', '痛並快樂著！', '榴槤忘返！'],
  },

  // 14. RGB 機械鍵盤 (Mechanical Keyboard)
  {
    id: 'keyboard',
    name: 'RGB 機械鍵盤',
    description: '鍵盤整把猛砸而下，七彩光芒與鍵帽滿天飛！',
    icon: '⌨️',
    damage: 30,
    attackType: 'click',
    animPattern: 'keyboard_smash',
    hitSound: 'keyboard',
    physicalForce: { impulse: 19, damping: 0.84, stiffness: 270 },
    particleType: 'spark',
    subtitles: ['鍵盤俠出擊！', '噠噠噠！', 'Ctrl+Z 無效！', '連點程式開起來！'],
  },

  // 15. 粉紅貓爪肉墊 (Fluffy Cat Paw)
  {
    id: 'cat_paw',
    name: '粉紅貓爪肉墊',
    description: '粉紅肉墊巨掌軟綿綿重拍，伴隨極致 Q 彈與愛心！',
    icon: '🐾',
    damage: 28,
    attackType: 'click',
    animPattern: 'squeeze',
    hitSound: 'meow',
    physicalForce: { impulse: 22, damping: 0.76, stiffness: 140 },
    particleType: 'feather',
    subtitles: ['喵~ 肉墊打擊！', '好軟好舒服！', '請繼續肉拍！', '呼嚕嚕~'],
  },

  // 16. 法式長棍麵包 (Rock-Hard Baguette)
  {
    id: 'baguette',
    name: '法式長棍麵包',
    description: '硬如鋼鐵的戰術長棍橫擊，金黃麵包屑飛散！',
    icon: '🥖',
    damage: 32,
    attackType: 'click',
    animPattern: 'swing',
    hitSound: 'staff',
    physicalForce: { impulse: 23, damping: 0.82, stiffness: 230 },
    particleType: 'food',
    subtitles: ['比棍子還硬！', '法式武器！', '吃我一麵包！', '硬度堪比鑽石！'],
  },

  // 17. 工業大風扇 (Industrial Fan)
  {
    id: 'fan',
    name: '工業大風扇',
    description: '按住狂吹！旋轉渦輪風道呼嘯，吹翻一切！',
    icon: '💨',
    damage: 14,
    attackType: 'hold',
    animPattern: 'tornado_wind',
    hitSound: 'wind',
    physicalForce: { impulse: 12, damping: 0.94, stiffness: 110 },
    particleType: 'wood',
    subtitles: ['風太大了！', '吹到面目全非！', '涼爽沉浸感！', '整個人要飛走了！'],
  },

  // 18. 爆漿珍奶砲 (Boba Tea Cannon)
  {
    id: 'boba_cannon',
    name: '爆漿珍奶砲',
    description: '槍管連發急速噴射黑糖波霸，彈丸連續打擊！',
    icon: '🧋',
    damage: 24,
    attackType: 'click',
    animPattern: 'boba_burst',
    hitSound: 'pop',
    physicalForce: { impulse: 17, damping: 0.85, stiffness: 260 },
    particleType: 'food',
    subtitles: ['半糖微冰！', '波霸連發！', '太甜了受不了！', '嚼勁十足！'],
  },

  // 19. 光速量子劍 (Lightsaber)
  {
    id: 'lightsaber',
    name: '光速量子劍',
    description: '滑動拖曳切削！耀眼霓虹刀光留下弧線軌跡！',
    icon: '⚔️',
    damage: 42,
    attackType: 'drag',
    animPattern: 'saber_slash',
    hitSound: 'saber',
    physicalForce: { impulse: 26, damping: 0.83, stiffness: 200 },
    particleType: 'electric',
    subtitles: ['May the Force!', '切開一切！', '電光石火！', '嗡嗡嗡！'],
  },

  // 20. 微型黑洞產生器 (Mini Black Hole Generator)
  {
    id: 'black_hole',
    name: '微型黑洞產生器',
    description: '在目標中心生成旋轉黑洞坍縮吸附，空間引力爆發！',
    icon: '🌀',
    damage: 90,
    attackType: 'click',
    animPattern: 'vortex_collapse',
    hitSound: 'void',
    physicalForce: { impulse: 50, damping: 0.6, stiffness: 130 },
    particleType: 'void',
    subtitles: ['被吸進去了！', '引力太強！', '空間扭曲！', '視界線已突破！'],
  },

  // 21. 狙擊槍 (Sniper Rifle)
  {
    id: 'sniper_rifle',
    name: '狙擊槍',
    description: '具備精確點擊射擊與視角縮放效果，擊中強烈震退與粉塵飛揚！',
    icon: '🔫',
    damage: 98,
    attackType: 'click',
    animPattern: 'sniper_shot',
    hitSound: 'sniper',
    physicalForce: { impulse: 55, damping: 0.62, stiffness: 160 }, // 強烈震退力道
    particleType: 'dust', // 粉塵飛揚粒子
    subtitles: ['一發入魂！', '精確鎖定！', '超音速破空！', '一槍入魂！'],
  },
];
