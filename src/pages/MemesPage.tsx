import { useState } from "react";
import Icon from "@/components/ui/icon";

const memes = [
  { id: 1, title: "Когда деплой в пятницу", emoji: "💀", likes: 4201, comments: 87, tag: "devops", color: "var(--neon-pink)" },
  { id: 2, title: "Merge conflict at 3am", emoji: "😭", likes: 3108, comments: 64, tag: "code", color: "var(--neon-purple)" },
  { id: 3, title: "It works on my machine", emoji: "🤷", likes: 8920, comments: 203, tag: "classic", color: "var(--neon-cyan)" },
  { id: 4, title: "Git push --force на прод", emoji: "🔥", likes: 5544, comments: 145, tag: "yolo", color: "var(--neon-orange)" },
  { id: 5, title: "Senior vs Junior код", emoji: "👴", likes: 2891, comments: 71, tag: "code", color: "var(--neon-green)" },
  { id: 6, title: "Стендап в 9 утра", emoji: "🧟", likes: 6734, comments: 192, tag: "work", color: "var(--neon-pink)" },
  { id: 7, title: "CSS в продакшне", emoji: "🎲", likes: 3321, comments: 88, tag: "frontend", color: "var(--neon-cyan)" },
  { id: 8, title: "Stack Overflow отвалился", emoji: "💔", likes: 11204, comments: 445, tag: "crisis", color: "var(--neon-orange)" },
  { id: 9, title: "README.md обновлён", emoji: "📝", likes: 891, comments: 12, tag: "docs", color: "var(--neon-purple)" },
];

const tags = ["все", "devops", "code", "classic", "yolo", "work", "frontend", "crisis", "docs"];

const bgPatterns = [
  "linear-gradient(135deg, rgba(0,255,255,0.05), rgba(191,95,255,0.05))",
  "linear-gradient(135deg, rgba(255,0,170,0.05), rgba(0,255,136,0.05))",
  "linear-gradient(135deg, rgba(191,95,255,0.05), rgba(0,255,255,0.05))",
  "linear-gradient(135deg, rgba(255,102,0,0.05), rgba(255,0,170,0.05))",
];

export default function MemesPage() {
  const [activeTag, setActiveTag] = useState("все");
  const [liked, setLiked] = useState<Set<number>>(new Set());

  const filtered = activeTag === "все" ? memes : memes.filter((m) => m.tag === activeTag);

  const toggleLike = (id: number) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className="font-mono text-[11px] px-3 py-1.5 rounded tracking-wider transition-all duration-150"
              style={{
                border: activeTag === tag ? "1px solid var(--neon-pink)" : "1px solid rgba(255,255,255,0.1)",
                color: activeTag === tag ? "var(--neon-pink)" : "rgba(255,255,255,0.35)",
                background: activeTag === tag ? "rgba(255,0,170,0.08)" : "transparent",
                textShadow: activeTag === tag ? "0 0 6px var(--neon-pink)" : "none",
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded font-rajdhani text-sm font-semibold tracking-wider transition-all"
          style={{
            border: "1px solid var(--neon-green)",
            color: "var(--neon-green)",
            background: "rgba(0,255,136,0.08)",
          }}
        >
          <Icon name="Upload" size={14} />
          Загрузить мем
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((meme, i) => (
          <div
            key={meme.id}
            className="panel rounded-lg overflow-hidden group cursor-pointer animate-fade-in-up"
            style={{ animationDelay: `${i * 0.05}s`, background: bgPatterns[i % bgPatterns.length] }}
          >
            {/* Meme visual */}
            <div
              className="h-44 flex items-center justify-center relative border-b border-[rgba(0,255,255,0.08)]"
              style={{ background: `${meme.color}08` }}
            >
              {/* Corner decorations */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: meme.color }} />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: meme.color }} />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: meme.color }} />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: meme.color }} />

              <div className="text-7xl group-hover:scale-110 transition-transform duration-300">{meme.emoji}</div>

              {/* Scan effect on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(transparent 40%, ${meme.color}15 50%, transparent 60%)`,
                }}
              />
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="font-rajdhani text-sm font-semibold text-white mb-2 leading-tight">{meme.title}</div>
              <div className="flex items-center gap-1 mb-3">
                <span
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                  style={{ color: meme.color, background: `${meme.color}15`, border: `1px solid ${meme.color}33` }}
                >
                  #{meme.tag}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleLike(meme.id)}
                  className="flex items-center gap-1.5 transition-all duration-150"
                  style={{ color: liked.has(meme.id) ? "var(--neon-pink)" : "rgba(255,255,255,0.3)" }}
                >
                  <Icon name="Heart" size={14} />
                  <span className="font-mono text-[11px]">
                    {liked.has(meme.id) ? meme.likes + 1 : meme.likes}
                  </span>
                </button>
                <button className="flex items-center gap-1.5 text-[rgba(255,255,255,0.3)] hover:text-[var(--neon-cyan)] transition-colors">
                  <Icon name="MessageCircle" size={14} />
                  <span className="font-mono text-[11px]">{meme.comments}</span>
                </button>
                <button className="flex items-center gap-1.5 text-[rgba(255,255,255,0.3)] hover:text-[var(--neon-purple)] transition-colors">
                  <Icon name="Share2" size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
