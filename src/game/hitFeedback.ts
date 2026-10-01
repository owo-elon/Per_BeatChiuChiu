import { WeaponConfig } from '../types/weapon';

export type HitRegion = 'head' | 'body' | 'left' | 'right' | 'miss';

export interface HitFeedback {
  region: HitRegion;
  regionLabel: string;
  headline: string;
  damageText: string;
  bubbleText: string;
  bubblePrefix: string;
  color: string;
}

const REGION_LABELS: Record<HitRegion, string> = {
  head: '狗頭',
  body: '狗身',
  left: '左臉',
  right: '右臉',
  miss: '空氣',
};

const REGION_LINES: Record<HitRegion, string[]> = {
  head: ['狗頭精準制裁', '邱邱狗頭暈爛', '頭槌失敗被反打', '狗頭被敲醒'],
  body: ['狗身 Q 彈挨揍', '邱邱肚肚中招', '整隻狗被震飛', '狗身被打到波浪化'],
  left: ['左臉被修理', '邱邱左臉啪一聲', '左邊狗臉腫起來', '左臉被打到歪'],
  right: ['右臉遭制裁', '邱邱右臉啪一聲', '右邊狗臉腫起來', '右臉被打到歪'],
  miss: ['揮空啦', '邱邱偷笑閃開', '打到空氣', '邱邱差點被嚇到'],
};

const IMPACT_WORDS: Record<string, string[]> = {
  dog_stick: ['打狗棒法！', '梆！', '棍下留狗！'],
  slipper: ['啪！', '拖鞋制裁！', '阿嬤認證！'],
  frying_pan: ['鏘！', '鍋巴邱邱！', '金屬爆頭！'],
  golden_brick: ['轟！', '財富壓狗！', '金磚制裁！'],
  rpg_rocket: ['BOOM！', '邱邱升空！', '火箭打狗！'],
  thunder_hammer: ['轟隆！', '雷劈邱邱！', '天罰狗狗！'],
  salmon: ['啪滋！', '魚尾修狗！', '鮭魚甩臉！'],
  cat_paw: ['肉球啪！', '貓掌壓狗！', '粉紅制裁！'],
  sniper_rifle: ['爆頭！', '一發入狗！', '鎖定邱邱！'],
  black_hole: ['吸狗！', '邱邱坍縮！', '狗狗黑洞化！'],
};

const DOG_BULLY_LINES = [
  '邱邱：汪？怎麼又是我！',
  '邱邱狗生開始懷疑人生。',
  '這隻狗今天注定要被打到破防。',
  '邱邱被打得尾巴都想請假。',
  '狗狗尊嚴 -999，但爽度 +滿。',
  '邱邱：我只是路過的狗啊！',
  '全場目標只有一個：繼續打邱邱。',
  '邱邱被打到汪汪叫。',
];

export function getHitRegion(screenX: number, screenY: number, rect: DOMRect): HitRegion {
  if (
    screenX < rect.left ||
    screenX > rect.right ||
    screenY < rect.top ||
    screenY > rect.bottom
  ) {
    return 'miss';
  }

  const nx = (screenX - rect.left) / rect.width;
  const ny = (screenY - rect.top) / rect.height;

  if (ny < 0.43) return 'head';
  if (nx < 0.42) return 'left';
  if (nx > 0.58) return 'right';
  return 'body';
}

export function createHitFeedback(
  weapon: WeaponConfig,
  region: HitRegion,
  damage: number,
  combo: number,
  isCrit: boolean,
): HitFeedback {
  const regionLine = pick(REGION_LINES[region]);
  const impact = pick(IMPACT_WORDS[weapon.id] ?? weapon.subtitles ?? ['痛扁邱邱！']);
  const dogLine = pick(DOG_BULLY_LINES);
  const isMiss = region === 'miss';
  const comboLine = combo >= 20 ? `連打 x${combo + 1}，邱邱已經被霸凌到破防！` : dogLine;

  return {
    region,
    regionLabel: REGION_LABELS[region],
    headline: isMiss ? '邱邱閃開！' : isCrit ? `暴擊 ${impact}` : impact,
    damageText: isMiss
      ? '揮空啦！邱邱偷笑'
      : isCrit
      ? `暴擊狗狗！${REGION_LABELS[region]} +${damage}`
      : `${regionLine} +${damage}`,
    bubbleText: isMiss ? '邱邱：汪？你打到空氣了啦！' : comboLine,
    bubblePrefix: isMiss ? '🐶 邱邱嘲笑：' : isCrit ? '💥 邱邱慘叫：' : '🐶 邱邱挨打：',
    color: isMiss ? '#94a3b8' : isCrit ? '#f472b6' : combo >= 20 ? '#ef4444' : weapon.animPattern === 'beam' ? '#38bdf8' : '#fbbf24',
  };
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
