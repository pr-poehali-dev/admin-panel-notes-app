import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { API } from "@/lib/api";

interface Meme { id: string; title: string; image: string; ups: number; comments: number; author: string; subreddit: string; permalink: string; }

const subs = [
  { key: "memes", label: "Мемы" },
  { key: "dankmemes", label: "Dank" },
  { key: "ProgrammerHumor", label: "IT" },
  { key: "gaming", label: "Гейминг" },
  { key: "funny", label: "Смешное" },
  { key: "me_irl", label: "Жизнь" },
];

function formatNum(n: number) {
  if (n >= 1000) return `${(n/1000).toFixed(1)}k`;
  return String(n);
}

export default function MemesPage() {
  const [activeSub, setActiveSub] = useState("memes");
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true); setError("");
    fetch(API.posts + `/memes?sub=${activeSub}&limit=24`)
      .then(r => r.json())
      .then(d => { setMemes(d.memes || []); setLoading(false); })
      .catch(() => { setError("Ошибка загрузки мемов"); setLoading(false); });
  }, [activeSub]);

  return (
    <div className="space-y-5">
      {/* Subreddit tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {subs.map(s => (
          <button key={s.key} onClick={() => setActiveSub(s.key)}
            className="font-rajdhani text-sm font-semibold px-4 py-2 rounded tracking-wider transition-all"
            style={{
              border: activeSub===s.key ? "1px solid var(--neon-pink)" : "1px solid rgba(255,255,255,0.1)",
              color: activeSub===s.key ? "var(--neon-pink)" : "rgba(255,255,255,0.35)",
              background: activeSub===s.key ? "rgba(255,0,170,0.08)" : "transparent",
            }}
          >
            r/{s.key} <span className="opacity-50 text-xs ml-1">{s.label}</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 font-mono text-[10px] text-[rgba(255,120,120,0.5)]">
          <Icon name="ExternalLink" size={10} />
          <span>Reddit</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="panel rounded-lg p-6 text-center">
          <Icon name="AlertTriangle" size={32} className="mx-auto mb-2 text-[var(--neon-pink)]" />
          <p className="font-mono text-xs text-[var(--neon-pink)]">{error}</p>
          <button onClick={() => setActiveSub(activeSub)} className="mt-3 px-4 py-2 rounded font-rajdhani text-sm border border-[rgba(0,255,255,0.3)] text-[var(--neon-cyan)] hover:bg-[rgba(0,255,255,0.08)] transition-all">Повторить</button>
        </div>
      )}

      {/* Loading */}
      {loading && !error && (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({length:6}).map((_,i) => (
            <div key={i} className="panel rounded-lg overflow-hidden animate-pulse">
              <div className="h-48 bg-[rgba(0,255,255,0.04)]" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-[rgba(0,255,255,0.06)] rounded w-3/4" />
                <div className="h-2 bg-[rgba(0,255,255,0.04)] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-3 gap-4">
          {memes.map((m, i) => (
            <div key={m.id} className="panel rounded-lg overflow-hidden group cursor-pointer animate-fade-in-up" style={{ animationDelay: `${i*0.04}s` }}>
              <div className="relative h-48 overflow-hidden bg-[rgba(0,0,0,0.5)]">
                <img src={m.image} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40" />
                <div className="absolute top-2 left-2 font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,69,0,0.6)", color: "white" }}>r/{m.subreddit}</div>
              </div>
              <div className="p-3">
                <p className="font-rajdhani text-sm font-semibold text-white line-clamp-2 mb-2 leading-tight">{m.title}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[rgba(255,100,100,0.7)]">
                      <Icon name="ArrowUp" size={12} />
                      <span className="font-mono text-[11px]">{formatNum(m.ups)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[rgba(0,255,255,0.5)]">
                      <Icon name="MessageCircle" size={12} />
                      <span className="font-mono text-[11px]">{formatNum(m.comments)}</span>
                    </div>
                  </div>
                  <a href={m.permalink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-[rgba(255,255,255,0.2)] hover:text-[var(--neon-cyan)] transition-colors">
                    <Icon name="ExternalLink" size={12} />
                  </a>
                </div>
              </div>
            </div>
          ))}
          {!loading && memes.length === 0 && (
            <div className="col-span-3 panel rounded-lg p-10 text-center font-orbitron text-sm text-[rgba(0,255,255,0.3)]">МЕМЫ НЕ НАЙДЕНЫ</div>
          )}
        </div>
      )}
    </div>
  );
}
