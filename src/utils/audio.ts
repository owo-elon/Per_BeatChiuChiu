import { useGameStore } from '../store/gameStore';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  const isMuted = useGameStore.getState().isMuted;
  if (isMuted) return null;

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * 根據武器音效標籤播放專屬打擊音效 (合成器即時生成，不依賴外部檔案)
 */
export const playHitSound = (soundTag: string) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const master = ctx.createGain();
    osc.detune.setValueAtTime((Math.random() * 2 - 1) * 70, t);
    master.gain.setValueAtTime(0.9 + Math.random() * 0.18, t);
    osc.connect(gain);
    gain.connect(master);
    master.connect(ctx.destination);

    switch (soundTag) {
      case 'staff': // 打狗棍、長棍麵包：木棍沉悶敲擊
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.14);
        gain.gain.setValueAtTime(1.8, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
        osc.start(t);
        osc.stop(t + 0.14);
        break;

      case 'chicken': // 尖叫雞：高頻魔性慘叫
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, t);
        osc.frequency.linearRampToValueAtTime(750, t + 0.1);
        osc.frequency.linearRampToValueAtTime(160, t + 0.38);
        gain.gain.setValueAtTime(1.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.38);
        osc.start(t);
        osc.stop(t + 0.38);
        break;

      case 'slipper': // 藍白拖：啪啪啪清脆抽打
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.1);
        gain.gain.setValueAtTime(2.0, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case 'pan': // 平底鍋：金屬重擊鏘！
        osc.type = 'sine';
        osc.frequency.setValueAtTime(820, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.45);
        gain.gain.setValueAtTime(2.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);
        osc.start(t);
        osc.stop(t + 0.45);
        break;

      case 'gold': // 金磚：金幣清脆叮噹響
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(2400, t + 0.08);
        gain.gain.setValueAtTime(1.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        osc.start(t);
        osc.stop(t + 0.25);
        break;

      case 'laser': // 脈衝雷射：PewPew 高頻穿透
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1600, t);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);
        gain.gain.setValueAtTime(1.0, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.start(t);
        osc.stop(t + 0.12);
        break;

      case 'explosion': // 火箭筒：轟天大爆炸
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(20, t + 0.7);
        gain.gain.setValueAtTime(3.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.7);
        osc.start(t);
        osc.stop(t + 0.7);
        break;

      case 'thunder': // 雷神之鎚：落雷轟頂震撼破空聲
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.55);
        gain.gain.setValueAtTime(3.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.55);
        osc.start(t);
        osc.stop(t + 0.55);
        break;

      case 'sniper': // 重裝狙擊槍：極震撼超音速破空破甲槍聲
        osc.type = 'square';
        osc.frequency.setValueAtTime(1400, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);
        gain.gain.setValueAtTime(3.8, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
        osc.start(t);
        osc.stop(t + 0.35);
        break;

      case 'freeze': // 冰錐：清脆碎裂凍結
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1100, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.18);
        gain.gain.setValueAtTime(1.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
        osc.start(t);
        osc.stop(t + 0.18);
        break;

      case 'pop': // 吸盤、珍奶砲：啵啵吸氣釋放
        osc.type = 'sine';
        osc.frequency.setValueAtTime(550, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.12);
        gain.gain.setValueAtTime(1.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.start(t);
        osc.stop(t + 0.12);
        break;

      case 'meow': // 貓爪肉墊：超軟萌重拍
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, t);
        osc.frequency.exponentialRampToValueAtTime(680, t + 0.15);
        gain.gain.setValueAtTime(1.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;

      case 'saber': // 光速量子劍：高頻電漿蜂鳴
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.linearRampToValueAtTime(880, t + 0.12);
        gain.gain.setValueAtTime(1.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;

      case 'void': // 黑洞：低頻引力坍縮震波
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.exponentialRampToValueAtTime(280, t + 0.3);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.6);
        gain.gain.setValueAtTime(3.0, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
        osc.start(t);
        osc.stop(t + 0.6);
        break;

      case 'wind': // 大風扇：風聲呼嘯
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.linearRampToValueAtTime(260, t + 0.2);
        gain.gain.setValueAtTime(1.0, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;

      case 'keyboard': // 機械鍵盤：青軸噠噠噠
        osc.type = 'square';
        osc.frequency.setValueAtTime(900, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.06);
        gain.gain.setValueAtTime(1.6, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
        osc.start(t);
        osc.stop(t + 0.06);
        break;

      default:
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(350, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);
        gain.gain.setValueAtTime(1.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
    }
  } catch (err) {
    console.error('Hit sound error:', err);
  }
};

export const playEquipSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(950, t + 0.09);
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  } catch (err) {
    console.error('Equip sound error:', err);
  }
};
