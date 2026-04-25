import { useState } from "react";
import Icon from "@/components/ui/icon";

const videos = [
  { id: 1, title: "CYBERPUNK 2077 - Полное прохождение #1", channel: "NeoGamer_RU", views: "1.2M", duration: "3:42:18", platform: "yt", emoji: "🎮", color: "var(--neon-cyan)", hot: true },
  { id: 2, title: "Новый чит-код обнаружен | Speedrun WR", channel: "SpeedDemon", views: "892K", duration: "24:05", platform: "yt", emoji: "⚡", color: "var(--neon-green)", hot: true },
  { id: 3, title: "Топ 10 нереальных фрагов этой недели", channel: "FragHighlights", views: "445K", duration: "12:30", platform: "tt", emoji: "🔥", color: "var(--neon-pink)", hot: false },
  { id: 4, title: "ИИ играет в Doom — результаты шокируют", channel: "TechVerse", views: "2.1M", duration: "18:44", platform: "yt", emoji: "🤖", color: "var(--neon-purple)", hot: true },
  { id: 5, title: "Живой стрим — открываем кейсы 24 часа", channel: "CaseKingdom", views: "320K", duration: "Live", platform: "tt", emoji: "📦", color: "var(--neon-orange)", hot: false },
  { id: 6, title: "Секреты GTA 6 которые никто не заметил", channel: "LorehunterX", views: "5.8M", duration: "31:12", platform: "yt", emoji: "🕵️", color: "var(--neon-cyan)", hot: true },
];

const categories = ["Все", "YouTube", "TikTok", "Горящие", "Сохранённые"];

export default function VideoPage() {
  const [activeCategory, setActiveCategory] = useState("Все");
  const [playing, setPlaying] = useState<number | null>(null);

  const filtered = videos.filter((v) => {
    if (activeCategory === "YouTube") return v.platform === "yt";
    if (activeCategory === "TikTok") return v.platform === "tt";
    if (activeCategory === "Горящие") return v.hot;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Categories */}
      <div className="flex items-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="font-rajdhani text-sm font-semibold px-4 py-2 rounded tracking-wider transition-all duration-150"
            style={{
              border: activeCategory === cat ? "1px solid var(--neon-orange)" : "1px solid rgba(255,255,255,0.1)",
              color: activeCategory === cat ? "var(--neon-orange)" : "rgba(255,255,255,0.35)",
              background: activeCategory === cat ? "rgba(255,102,0,0.08)" : "transparent",
            }}
          >
            {cat}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button className="p-2 rounded border border-[rgba(0,255,255,0.15)] text-[rgba(0,255,255,0.5)] hover:text-[var(--neon-cyan)] hover:border-[var(--neon-cyan)] transition-all">
            <Icon name="Search" size={14} />
          </button>
          <button className="p-2 rounded border border-[rgba(0,255,255,0.15)] text-[rgba(0,255,255,0.5)] hover:text-[var(--neon-cyan)] hover:border-[var(--neon-cyan)] transition-all">
            <Icon name="SlidersHorizontal" size={14} />
          </button>
        </div>
      </div>

      {/* Featured */}
      {playing !== null ? (
        <div className="panel rounded-lg overflow-hidden">
          <div
            className="h-64 flex items-center justify-center relative"
            style={{ background: `linear-gradient(135deg, ${videos.find(v=>v.id===playing)?.color}20, rgba(0,0,0,0.8))` }}
          >
            <div className="text-center">
              <div className="text-6xl mb-3">{videos.find((v) => v.id === playing)?.emoji}</div>
              <div className="font-orbitron text-sm font-bold text-white mb-2">{videos.find((v) => v.id === playing)?.title}</div>
              <div className="font-mono text-xs text-[rgba(0,255,255,0.5)]">EMBED PLAYER // Подключите реальный URL</div>
            </div>
            <button
              onClick={() => setPlaying(null)}
              className="absolute top-3 right-3 p-1.5 rounded border border-[rgba(255,255,255,0.2)] text-[rgba(255,255,255,0.5)] hover:text-white transition-all"
            >
              <Icon name="X" size={14} />
            </button>
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[rgba(0,255,255,0.1)]">
              <div className="h-full w-1/3 bg-[var(--neon-orange)]" style={{ boxShadow: "0 0 6px var(--neon-orange)" }} />
            </div>
          </div>
        </div>
      ) : null}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((v, i) => (
          <div
            key={v.id}
            className="panel rounded-lg overflow-hidden group cursor-pointer animate-fade-in-up"
            style={{ animationDelay: `${i * 0.06}s` }}
            onClick={() => setPlaying(v.id)}
          >
            {/* Thumbnail */}
            <div
              className="h-36 flex items-center justify-center relative border-b border-[rgba(0,255,255,0.08)]"
              style={{ background: `linear-gradient(135deg, ${v.color}10, rgba(0,0,0,0.6))` }}
            >
              <div className="text-5xl group-hover:scale-110 transition-transform duration-300">{v.emoji}</div>

              {/* Platform badge */}
              <div
                className="absolute top-2 left-2 font-mono text-[10px] px-2 py-0.5 rounded tracking-widest font-bold"
                style={{
                  background: v.platform === "yt" ? "rgba(255,0,0,0.7)" : "rgba(0,0,0,0.7)",
                  color: "white",
                  border: v.platform === "yt" ? "1px solid rgba(255,0,0,0.5)" : "1px solid rgba(255,255,255,0.2)",
                }}
              >
                {v.platform === "yt" ? "▶ YT" : "♪ TT"}
              </div>

              {/* Duration */}
              <div
                className="absolute bottom-2 right-2 font-mono text-[10px] px-2 py-0.5 rounded"
                style={{
                  background: "rgba(0,0,0,0.7)",
                  color: v.duration === "Live" ? "var(--neon-pink)" : "white",
                  border: v.duration === "Live" ? "1px solid var(--neon-pink)" : "none",
                }}
              >
                {v.duration === "Live" ? "● LIVE" : v.duration}
              </div>

              {/* Hot badge */}
              {v.hot && (
                <div
                  className="absolute top-2 right-2 font-mono text-[10px] px-2 py-0.5 rounded"
                  style={{ background: "rgba(255,102,0,0.3)", color: "var(--neon-orange)", border: "1px solid rgba(255,102,0,0.4)" }}
                >
                  🔥 ХИТ
                </div>
              )}

              {/* Play overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <div
                  className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 duration-200"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  <Icon name="Play" size={16} className="text-white ml-0.5" />
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="p-3">
              <div className="font-rajdhani text-sm font-semibold text-white mb-1 leading-tight line-clamp-2">{v.title}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-[10px] text-[rgba(0,255,255,0.5)]">{v.channel}</span>
                <div className="flex items-center gap-1 text-[rgba(255,255,255,0.3)]">
                  <Icon name="Eye" size={11} />
                  <span className="font-mono text-[10px]">{v.views}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
