export default function GameBackground({ type }: { type: string }) {
  if (type === 'office') {
    // 🏢 辦公室場景：辦公桌、電腦螢幕、壁畫、百葉窗與日光燈
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
        {/* 牆面與天花板日光燈 */}
        <div className="absolute inset-0 bg-[#e2e8f0]">
          {/* 天花板裝飾線 */}
          <div className="absolute top-0 w-full h-10 bg-[#cbd5e1] border-b-2 border-[#94a3b8]" />
          {/* 日光燈管 */}
          <div className="absolute top-2 left-1/4 w-48 h-3 bg-white rounded-full shadow-[0_0_15px_#fff]" />
          <div className="absolute top-2 right-1/4 w-48 h-3 bg-white rounded-full shadow-[0_0_15px_#fff]" />
        </div>

        {/* 窗戶與高樓風景 */}
        <div className="absolute top-16 left-8 sm:left-16 w-36 sm:w-56 h-48 sm:h-64 bg-sky-200 border-4 border-slate-700 rounded-lg overflow-hidden shadow-lg">
          {/* 遠處大樓剪影 */}
          <div className="absolute bottom-0 left-2 w-8 h-28 bg-slate-400" />
          <div className="absolute bottom-0 left-12 w-12 h-36 bg-slate-500" />
          <div className="absolute bottom-0 left-26 w-10 h-24 bg-slate-400" />
          <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-amber-200/60" />
          {/* 百葉窗條紋 */}
          <div className="absolute inset-0 flex flex-col justify-between opacity-30">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-full h-1 bg-slate-600" />
            ))}
          </div>
        </div>

        {/* 牆壁上的趣味業績看板 */}
        <div className="absolute top-16 right-8 sm:right-20 w-36 sm:w-48 h-32 sm:h-40 bg-amber-50 border-4 border-amber-900 rounded p-2 shadow-md rotate-1">
          <div className="text-[10px] sm:text-xs font-black text-red-600 border-b border-red-300 pb-1">
            本月業績目標：-999%
          </div>
          {/* 折線圖示意 */}
          <svg className="w-full h-16 sm:h-20 mt-1" viewBox="0 0 100 50">
            <polyline
              points="0,10 25,20 50,15 75,45 100,48"
              fill="none"
              stroke="#ef4444"
              strokeWidth="3"
            />
          </svg>
          <div className="text-[9px] font-bold text-slate-500 text-center">『打倒老闆！』</div>
        </div>

        {/* 辦公桌盆栽 */}
        <div className="absolute bottom-44 sm:bottom-48 left-1/6 w-12 h-16 sm:w-16 sm:h-20 text-3xl sm:text-4xl">
          🪴
        </div>

        {/* 辦公地板與木質紋路 */}
        <div className="absolute bottom-0 w-full h-44 sm:h-52 bg-[#94a3b8] border-t-8 border-[#64748b]">
          {/* 踢腳板 */}
          <div className="w-full h-4 bg-[#475569]" />
          {/* 地磚格線 */}
          <div className="w-full h-full opacity-20 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        {/* 邱邱身後的辦公椅與辦公電腦桌 */}
        <div className="absolute bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-12 bg-amber-800 rounded-t-xl border-t-4 border-amber-700 shadow-2xl flex justify-around px-8 items-end">
          {/* 咖啡杯 */}
          <div className="text-xl -translate-y-2">☕</div>
          {/* 文件堆 */}
          <div className="w-10 h-6 bg-white border border-slate-300 rounded-sm -translate-y-2 shadow" />
          {/* 筆電 */}
          <div className="w-16 h-10 bg-slate-700 rounded-t-md -translate-y-2 border border-slate-600 flex items-center justify-center">
            <div className="w-12 h-6 bg-cyan-400 rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'street') {
    // 🏙️ 街頭巷弄場景：磚牆、塗鴉、路燈、霓虹招牌、馬路與斑馬線
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
        {/* 夜空 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#1e293b]">
          {/* 星星 */}
          <div className="absolute top-8 left-1/5 w-1 h-1 bg-white rounded-full animate-ping" />
          <div className="absolute top-16 right-1/4 w-1.5 h-1.5 bg-yellow-100 rounded-full" />
          <div className="absolute top-10 right-12 w-1 h-1 bg-white rounded-full" />
          {/* 月亮 */}
          <div className="absolute top-8 right-8 sm:right-16 w-14 sm:w-18 h-14 sm:h-18 rounded-full bg-amber-100 shadow-[0_0_30px_#fde047]" />
        </div>

        {/* 遠處城市剪影 */}
        <div className="absolute bottom-40 w-full flex items-end justify-between opacity-50 px-4">
          <div className="w-20 h-48 bg-slate-800 border-t border-cyan-400" />
          <div className="w-16 h-64 bg-slate-900" />
          <div className="w-28 h-52 bg-slate-800" />
          <div className="w-24 h-72 bg-slate-900 border-t border-pink-500" />
          <div className="w-16 h-40 bg-slate-800" />
        </div>

        {/* 霓虹燈招牌 */}
        <div className="absolute top-24 left-6 sm:left-12 px-4 py-2 rounded-lg border-2 border-pink-500 shadow-[0_0_20px_#ec4899] bg-black/60 rotate-[-6deg]">
          <span className="text-pink-400 font-black text-sm sm:text-base tracking-widest animate-pulse">
            BAR 邱邱俱樂部 🍻
          </span>
        </div>

        {/* 街頭塗鴉牆 */}
        <div className="absolute bottom-36 sm:bottom-44 w-full h-36 bg-[#334155] border-t-4 border-[#475569] flex items-center justify-between px-10">
          <span className="text-3xl sm:text-5xl font-black text-yellow-400/40 select-none -rotate-3">
            BEAT BOSS!
          </span>
          <span className="text-2xl sm:text-4xl font-black text-red-500/40 select-none rotate-6">
            爽度破表 ★★★
          </span>
        </div>

        {/* 街燈 */}
        <div className="absolute top-24 right-10 sm:right-28 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-yellow-200 shadow-[0_0_40px_#fef08a]" />
          <div className="w-2.5 h-64 bg-slate-700" />
        </div>

        {/* 柏油馬路地面與斑馬線 */}
        <div className="absolute bottom-0 w-full h-36 sm:h-44 bg-[#1e293b] border-t-8 border-slate-600">
          {/* 人行道道緣石 */}
          <div className="w-full h-4 bg-slate-500 border-b border-slate-700" />
          {/* 斑馬線 */}
          <div className="w-full flex justify-around mt-6 opacity-60">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-10 sm:w-16 h-8 bg-white rotate-[-12deg]" />
            ))}
          </div>
          {/* 消防栓與垃圾桶 */}
          <div className="absolute bottom-28 left-8 sm:left-24 text-3xl">🚒</div>
          <div className="absolute bottom-28 right-8 sm:right-24 text-3xl">🗑️</div>
        </div>
      </div>
    );
  }

  // 🌳 公園綠地場景：藍天白雲、遠山、大樹、草坪花朵與木質長椅
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* 晴朗天空 */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-100">
        {/* 太陽 */}
        <div className="absolute top-8 left-10 sm:left-20 w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-amber-400 shadow-[0_0_50px_#f59e0b] animate-pulse" />
        {/* 白雲 */}
        <div className="absolute top-12 left-1/3 text-4xl sm:text-6xl opacity-90">☁️</div>
        <div className="absolute top-20 right-1/4 text-5xl sm:text-7xl opacity-80">☁️</div>
        <div className="absolute top-6 right-16 text-3xl opacity-70">🕊️</div>
      </div>

      {/* 遠處青山疊嶂 */}
      <div className="absolute bottom-40 w-full flex items-end justify-center">
        <div className="w-[60vw] h-48 bg-emerald-600 rounded-t-full opacity-60 -translate-x-20" />
        <div className="w-[70vw] h-56 bg-emerald-700 rounded-t-full opacity-80 translate-x-12" />
        <div className="w-[50vw] h-40 bg-teal-800 rounded-t-full opacity-90 -translate-x-10" />
      </div>

      {/* 大樹裝飾 */}
      <div className="absolute bottom-36 left-4 sm:left-12 text-6xl sm:text-8xl filter drop-shadow-md">
        🌳
      </div>
      <div className="absolute bottom-36 right-4 sm:right-16 text-6xl sm:text-8xl filter drop-shadow-md">
        🌲
      </div>

      {/* 公園綠油油草坪 */}
      <div className="absolute bottom-0 w-full h-40 sm:h-48 bg-gradient-to-t from-emerald-700 to-emerald-500 border-t-8 border-emerald-400">
        {/* 碎石小徑 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-full bg-amber-200/50 clip-path-polygon" />

        {/* 草地花朵裝飾 */}
        <div className="w-full h-full flex justify-around items-center px-8 text-2xl sm:text-3xl opacity-90">
          <span>🌸</span>
          <span>🍄</span>
          <span>🌻</span>
          <span>🌼</span>
          <span>🌷</span>
          <span>🦋</span>
        </div>

        {/* 公園長椅 (邱邱身後) */}
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 w-64 sm:w-80 h-10 bg-amber-900 rounded-md border-b-4 border-amber-950 shadow-xl flex justify-between px-6">
          <div className="w-2.5 h-10 bg-slate-800" />
          <div className="w-2.5 h-10 bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
