import { WeaponConfig } from '../types/weapon';

export const WEAPONS: WeaponConfig[] = [
  // 1. 打狗棍 (Dog-Beating Staff) [必備武器]
  {
    id: 'dog_stick',
    name: '打狗棍',
    description: '經典丐幫秘傳打狗棒法！側向橫掃揮擊！',
    icon: '🪵',
    damage: 25,
    category: 'melee',
    attackType: 'click',
    animPattern: 'swing',
    hitSound: 'staff',
    physicalForce: { impulse: 18, damping: 0.82, stiffness: 220 },
    particleType: 'wood',
    subtitles: ['打狗棒法專打邱邱！', '邱邱嗷嗚！痛痛痛！', '狗頭吃棍啦！', '看招三十六路打邱棒！'],
  },

  // 2. 尖叫雞 (Screaming Chicken)
  {
    id: 'chicken',
    name: '尖叫雞',
    description: '急速壓扁魔性慘叫，伴隨高頻彈跳！',
    icon: '🐔',
    damage: 15,
    category: 'special',
    attackType: 'click',
    animPattern: 'squeeze',
    hitSound: 'chicken',
    physicalForce: { impulse: 14, damping: 0.75, stiffness: 340 },
    particleType: 'feather',
    subtitles: ['邱邱被雞叫震到破防！', '狗耳朵受不了啦！', '尖叫警告：邱邱挨揍中！', '魔性穿腦打狗音！'],
  },

  // 3. 台味藍白拖 (Taiwanese Blue-White Slipper)
  {
    id: 'slipper',
    name: '台味藍白拖',
    description: '阿嬤的傳家至寶，啪啪啪超高頻急速抽打！',
    icon: '🩴',
    damage: 20,
    category: 'melee',
    attackType: 'click',
    animPattern: 'slap',
    hitSound: 'slipper',
    physicalForce: { impulse: 16, damping: 0.88, stiffness: 280 },
    particleType: 'spark',
    subtitles: ['啪！啪！啪！邱邱臉歪！', '阿嬤拖鞋專修狗狗！', '邱邱不敢汪了啦！', '打到狗臉顛倒勇！'],
  },

  // 4. 平底鍋 (Frying Pan)
  {
    id: 'frying_pan',
    name: '平底鍋',
    description: '重型金屬平底鍋橫向猛揮，金屬狂響眼冒金星！',
    icon: '🍳',
    damage: 35,
    category: 'melee',
    attackType: 'click',
    animPattern: 'swing',
    hitSound: 'pan',
    physicalForce: { impulse: 28, damping: 0.78, stiffness: 180 },
    particleType: 'spark',
    subtitles: ['鏘！狗頭金屬狂響！', '邱邱頭好暈...', '狗狗看見星星了...', '平底鍋制裁邱邱！'],
  },

  // 5. 發財黃金磚 (Golden Brick)
  {
    id: 'golden_brick',
    name: '發財黃金磚',
    description: '金磚高空直墜砸落，享受被錢砸的極致快感！',
    icon: '🪙',
    damage: 50,
    category: 'throwable',
    attackType: 'click',
    animPattern: 'fall_crush',
    hitSound: 'gold',
    physicalForce: { impulse: 32, damping: 0.7, stiffness: 260 },
    particleType: 'gold',
    subtitles: ['邱邱被錢砸扁！', '打狗爽度 +9999！', '再來一塊壓狗磚！', '狗狗財富自由失敗！'],
  },

  // 6. 脈衝雷射槍 (Laser Blaster)
  {
    id: 'laser_blaster',
    name: '脈衝雷射槍',
    description: '長按持續連射高能霓虹雷射束，穿透打擊！',
    icon: '🔫',
    damage: 12,
    category: 'ranged',
    attackType: 'hold',
    animPattern: 'beam',
    hitSound: 'laser',
    physicalForce: { impulse: 8, damping: 0.9, stiffness: 300 },
    particleType: 'electric',
    subtitles: ['嗶嗶嗶！邱邱高能挨射！', '狗毛都要被蒸發了！', '邱邱太耐打了吧！', '全彈發射打狗狗！'],
  },

  // 7. 火箭筒 (RPG Rocket Launcher)
  {
    id: 'rpg_rocket',
    name: '火箭筒',
    description: '轟天飛彈呼嘯直線射入，全螢幕烈火大爆炸！',
    icon: '🚀',
    damage: 80,
    category: 'ranged',
    attackType: 'click',
    animPattern: 'rocket_shoot',
    hitSound: 'explosion',
    physicalForce: { impulse: 45, damping: 0.65, stiffness: 150 },
    particleType: 'fire',
    subtitles: ['Boom！邱邱炸裂！', '狗狗直接起飛！', '邱邱：這太過分了汪！', '狗窩寸草不生！'],
  },

  // 8. 阿嬤臭豆腐 (Stinky Tofu)
  {
    id: 'stinky_tofu',
    name: '阿嬤臭豆腐',
    description: '手拋弧線丟擲臭豆腐，濃郁綠霧炸裂！',
    icon: '🥟',
    damage: 18,
    category: 'throwable',
    attackType: 'click',
    animPattern: 'lob_throw',
    hitSound: 'splat',
    physicalForce: { impulse: 15, damping: 0.92, stiffness: 120 },
    particleType: 'food',
    subtitles: ['邱邱被臭豆腐糊臉！', '狗鼻子崩潰了！', '辣醬加滿打邱邱！', '泡菜砸狗頭在哪裡？！'],
  },

  // 9. 雷神之鎚 (Mjolnir Thunder Hammer)
  {
    id: 'thunder_hammer',
    name: '雷神之鎚',
    description: '巨鎚擎天召喚落雷直轟頂，紫藍電光纏繞！',
    icon: '⚡',
    damage: 65,
    category: 'magic',
    attackType: 'click',
    animPattern: 'lightning_strike',
    hitSound: 'thunder',
    physicalForce: { impulse: 36, damping: 0.72, stiffness: 240 },
    particleType: 'electric',
    subtitles: ['索爾附體劈邱邱！', '狗狗電到麻木！', '神罰專打邱邱！', '狗頭轟頂雷光！'],
  },

  // 10. 鮮美大鮭魚 (Fresh Salmon)
  {
    id: 'salmon',
    name: '鮮美大鮭魚',
    description: '深海大鮭魚滑溜抽擊，魚尾連續甩臉！',
    icon: '🐟',
    damage: 22,
    category: 'melee',
    attackType: 'click',
    animPattern: 'slap',
    hitSound: 'slap',
    physicalForce: { impulse: 20, damping: 0.85, stiffness: 190 },
    particleType: 'juice',
    subtitles: ['啪！鮭魚抽狗臉！', '邱邱被滑魚甩暈！', '魚尾連環打狗！', '生魚片外送到狗頭！'],
  },

  // 11. 萬能馬桶吸盤 (Toilet Plunger)
  {
    id: 'plunger',
    name: '萬能馬桶吸盤',
    description: '強力吸住向外拉長，釋放時劇烈啵啵回彈！',
    icon: '🪠',
    damage: 26,
    category: 'special',
    attackType: 'drag',
    animPattern: 'plunger_pull',
    hitSound: 'pop',
    physicalForce: { impulse: 25, damping: 0.8, stiffness: 160 },
    particleType: 'juice',
    subtitles: ['吸住邱邱狗臉！', '啵！狗臉彈回來了！', '這吸盤專吸邱邱？！', '狗狗尊嚴通暢無比！'],
  },

  // 12. 極光冰錐 (Aurora Ice Spike)
  {
    id: 'ice_spike',
    name: '極光冰錐',
    description: '極速刺擊目標並凍結冰晶，碎成冰渣彈飛！',
    icon: '❄️',
    damage: 40,
    category: 'magic',
    attackType: 'click',
    animPattern: 'ice_pierce',
    hitSound: 'freeze',
    physicalForce: { impulse: 24, damping: 0.86, stiffness: 250 },
    particleType: 'ice',
    subtitles: ['邱邱冷到汪不出來！', '狗狗瞬間凍結！', '狗毛碎成冰渣！', '絕對零度打邱邱！'],
  },

  // 13. 狂暴榴槤槌 (Durian Mace)
  {
    id: 'durian_mace',
    name: '狂暴榴槤槌',
    description: '帶刺榴槤狼牙棒重度揮擊，果肉尖刺四濺！',
    icon: '🍈',
    damage: 48,
    category: 'melee',
    attackType: 'click',
    animPattern: 'swing',
    hitSound: 'crush',
    physicalForce: { impulse: 30, damping: 0.74, stiffness: 210 },
    particleType: 'juice',
    subtitles: ['邱邱：刺刺的汪！', '水果之王砸狗頭！', '狗狗痛並快樂著！', '榴槤忘返打邱邱！'],
  },

  // 14. RGB 機械鍵盤 (Mechanical Keyboard)
  {
    id: 'keyboard',
    name: 'RGB 機械鍵盤',
    description: '鍵盤整把猛砸而下，七彩光芒與鍵帽滿天飛！',
    icon: '⌨️',
    damage: 30,
    category: 'melee',
    attackType: 'click',
    animPattern: 'keyboard_smash',
    hitSound: 'keyboard',
    physicalForce: { impulse: 19, damping: 0.84, stiffness: 270 },
    particleType: 'spark',
    subtitles: ['鍵盤俠出擊打邱邱！', '噠噠噠敲狗頭！', '邱邱 Ctrl+Z 無效！', '連點程式開起來霸凌狗狗！'],
  },

  // 15. 粉紅貓爪肉墊 (Fluffy Cat Paw)
  {
    id: 'cat_paw',
    name: '粉紅貓爪肉墊',
    description: '粉紅肉墊巨掌軟綿綿重拍，伴隨極致 Q 彈與愛心！',
    icon: '🐾',
    damage: 28,
    category: 'special',
    attackType: 'click',
    animPattern: 'squeeze',
    hitSound: 'meow',
    physicalForce: { impulse: 22, damping: 0.76, stiffness: 140 },
    particleType: 'feather',
    subtitles: ['喵~ 肉墊拍邱邱！', '狗狗被貓掌教育！', '請繼續肉拍狗臉！', '呼嚕嚕壓制汪汪！'],
  },

  // 16. 法式長棍麵包 (Rock-Hard Baguette)
  {
    id: 'baguette',
    name: '法式長棍麵包',
    description: '硬如鋼鐵的戰術長棍橫擊，金黃麵包屑飛散！',
    icon: '🥖',
    damage: 32,
    category: 'melee',
    attackType: 'click',
    animPattern: 'swing',
    hitSound: 'staff',
    physicalForce: { impulse: 23, damping: 0.82, stiffness: 230 },
    particleType: 'food',
    subtitles: ['比打狗棍還硬！', '法式武器修理邱邱！', '狗頭吃我一麵包！', '邱邱被鑽石麵包敲醒！'],
  },

  // 17. 工業大風扇 (Industrial Fan)
  {
    id: 'fan',
    name: '工業大風扇',
    description: '按住狂吹！旋轉渦輪風道呼嘯，吹翻一切！',
    icon: '💨',
    damage: 14,
    category: 'special',
    attackType: 'hold',
    animPattern: 'tornado_wind',
    hitSound: 'wind',
    physicalForce: { impulse: 12, damping: 0.94, stiffness: 110 },
    particleType: 'dust',
    subtitles: ['風太大，邱邱狗毛亂飛！', '吹到狗臉面目全非！', '邱邱涼到破防！', '整隻狗要飛走了！'],
  },

  // 18. 爆漿珍奶砲 (Boba Tea Cannon)
  {
    id: 'boba_cannon',
    name: '爆漿珍奶砲',
    description: '槍管連發急速噴射黑糖波霸，彈丸連續打擊！',
    icon: '🧋',
    damage: 24,
    category: 'ranged',
    attackType: 'click',
    animPattern: 'boba_burst',
    hitSound: 'pop',
    physicalForce: { impulse: 17, damping: 0.85, stiffness: 260 },
    particleType: 'food',
    subtitles: ['半糖微冰糊狗臉！', '波霸連發打邱邱！', '邱邱甜到受不了！', '狗臉嚼勁十足！'],
  },

  // 19. 光速量子劍 (Lightsaber)
  {
    id: 'lightsaber',
    name: '光速量子劍',
    description: '滑動拖曳切削！耀眼霓虹刀光留下弧線軌跡！',
    icon: '⚔️',
    damage: 42,
    category: 'magic',
    attackType: 'drag',
    animPattern: 'saber_slash',
    hitSound: 'saber',
    physicalForce: { impulse: 26, damping: 0.83, stiffness: 200 },
    particleType: 'electric',
    subtitles: ['May the Force 打邱邱！', '狗狗被光劍切線！', '電光石火修狗臉！', '嗡嗡嗡邱邱破防！'],
  },

  // 20. 微型黑洞產生器 (Mini Black Hole Generator)
  {
    id: 'black_hole',
    name: '微型黑洞產生器',
    description: '在目標中心生成旋轉黑洞坍縮吸附，空間引力爆發！',
    icon: '🌀',
    damage: 90,
    category: 'magic',
    attackType: 'click',
    animPattern: 'vortex_collapse',
    hitSound: 'void',
    physicalForce: { impulse: 50, damping: 0.6, stiffness: 130 },
    particleType: 'void',
    subtitles: ['邱邱被吸進去了！', '狗狗引力太強！', '狗臉空間扭曲！', '邱邱突破視界線！'],
  },

  // 21. 狙擊槍 (Sniper Rifle)
  {
    id: 'sniper_rifle',
    name: '狙擊槍',
    description: '具備精確點擊射擊與視角縮放效果，擊中強烈震退與粉塵飛揚！',
    icon: '🎯',
    damage: 85,
    category: 'ranged',
    attackType: 'click',
    animPattern: 'sniper_shot',
    hitSound: 'sniper',
    physicalForce: { impulse: 55, damping: 0.62, stiffness: 160 }, // 強烈震退力道
    particleType: 'dust', // 粉塵飛揚粒子
    subtitles: ['一發入狗！', '精確鎖定邱邱！', '超音速破狗頭！', '一槍打到汪不出來！'],
  },
];
