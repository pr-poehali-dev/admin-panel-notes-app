import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const YOUTUBE_URL = "https://functions.poehali.dev/590cfc0d-3ea2-497c-96a6-ad22e4d253fc";

interface Video {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  url: string;
  embedUrl: string;
}

const categories = [
  { label: "Популярные", q: "" },
  { label: "Игры", q: "gaming trending" },
  { label: "Музыка", q: "music hits 2024" },
  { label: "Технологии", q: "tech gadgets 2024" },
  { label: "Мемы", q: "funny memes compilation" },
];

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function VideoPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState<Video | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchVideos = async (q: string) => {
    setLoading(true);
    setError("");
    try {
      const params = q ? `?q=${encodeURIComponent(q)}&maxResults=12` : "?maxResults=12";
      const res = await fetch(YOUTUBE_URL + params);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVideos(data.videos || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(categories[activeCategory].q);
  }, [activeCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearch(searchInput);
    fetchVideos(searchInput);
  };

  return (
    <div className="space-y-5">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="panel rounded flex items-center gap-2 px-3 flex-1">
          <Icon name="Search" size={14} className="text-[rgba(0,255,255,0.4)] flex-shrink-0" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ПОИСК ВИДЕО НА YOUTUBE..."
            className="flex-1 bg-transparent font-mono text-xs text-[var(--neon-cyan)] placeholder-[rgba(0,255,255,0.25)] outline-none py-2.5 tracking-wider"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded font-rajdhani text-sm font-semibold tracking-wider transition-all"
          style={{ border: "1px solid var(--neon-cyan)", color: "var(--neon-cyan)", background: "rgba(0,255,255,0.08)" }}
        >
          Найти
        </button>
      </form>

      {/* Categories */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((cat, i) => (
          <button
            key={i}
            onClick={() => { setActiveCategory(i); setSearch(""); setSearchInput(""); }}
            className="font-rajdhani text-sm font-semibold px-4 py-2 rounded tracking-wider transition-all duration-150"
            style={{
              border: activeCategory === i && !search ? "1px solid var(--neon-orange)" : "1px solid rgba(255,255,255,0.1)",
              color: activeCategory === i && !search ? "var(--neon-orange)" : "rgba(255,255,255,0.35)",
              background: activeCategory === i && !search ? "rgba(255,102,0,0.08)" : "transparent",
            }}
          >
            {cat.label}
          </button>
        ))}
        {search && (
          <div className="flex items-center gap-3 ml-2">
            <span className="font-mono text-xs text-[rgba(0,255,255,0.5)]">
              Поиск: <span className="text-[var(--neon-cyan)]">«{search}»</span>
            </span>
            <button
              onClick={() => { setSearch(""); setSearchInput(""); fetchVideos(categories[activeCategory].q); }}
              className="flex items-center gap-1 font-mono text-[11px] px-3 py-1.5 rounded border border-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.4)] hover:text-white transition-all"
            >
              <Icon name="X" size={11} /> Сбросить
            </button>
          </div>
        )}
      </div>

      {/* Player */}
      {playing && (
        <div className="panel rounded-lg overflow-hidden">
          <div className="relative" style={{ paddingTop: "40%" }}>
            <iframe
              src={`${playing.embedUrl}?autoplay=1`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="px-4 py-3 flex items-center justify-between border-t border-[rgba(0,255,255,0.1)]">
            <div>
              <div className="font-rajdhani text-sm font-semibold text-white">{playing.title}</div>
              <div className="font-mono text-[10px] text-[rgba(0,255,255,0.4)] mt-0.5">{playing.channel}</div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={playing.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded font-rajdhani text-xs font-semibold tracking-wider"
                style={{ border: "1px solid rgba(255,0,0,0.4)", color: "rgb(255,80,80)", background: "rgba(255,0,0,0.08)" }}
              >
                <Icon name="ExternalLink" size={11} /> YouTube
              </a>
              <button
                onClick={() => setPlaying(null)}
                className="p-1.5 rounded border border-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.4)] hover:text-white transition-all"
              >
                <Icon name="X" size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="panel rounded-lg overflow-hidden">
              <div className="h-36 bg-[rgba(0,255,255,0.04)] animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-[rgba(0,255,255,0.06)] rounded w-3/4 animate-pulse" />
                <div className="h-2 bg-[rgba(0,255,255,0.04)] rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="panel rounded-lg p-6 text-center" style={{ borderColor: "rgba(255,0,170,0.3)" }}>
          <Icon name="AlertTriangle" size={32} className="mx-auto mb-3 text-[var(--neon-pink)]" />
          <div className="font-orbitron text-sm text-[var(--neon-pink)] mb-1">ОШИБКА ЗАГРУЗКИ</div>
          <div className="font-mono text-xs text-[rgba(255,255,255,0.4)] mb-4">{error}</div>
          <button
            onClick={() => fetchVideos(search || categories[activeCategory].q)}
            className="font-rajdhani text-sm font-semibold px-4 py-2 rounded border border-[rgba(0,255,255,0.3)] text-[var(--neon-cyan)] hover:bg-[rgba(0,255,255,0.08)] transition-all tracking-wider"
          >
            Повторить
          </button>
        </div>
      )}

      {/* Videos Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-3 gap-4">
          {videos.map((v, i) => (
            <div
              key={v.id}
              className="panel rounded-lg overflow-hidden group cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${i * 0.04}s` }}
              onClick={() => setPlaying(v)}
            >
              {/* Thumbnail */}
              <div className="relative h-36 overflow-hidden bg-[rgba(0,0,0,0.5)]">
                <img
                  src={v.thumbnail}
                  alt={v.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                <div
                  className="absolute top-2 left-2 font-mono text-[10px] px-2 py-0.5 rounded font-bold"
                  style={{ background: "rgba(255,0,0,0.75)", color: "white" }}
                >
                  ▶ YT
                </div>
                {v.viewCount > 0 && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.7)", color: "white" }}>
                    <Icon name="Eye" size={10} />
                    {formatViews(v.viewCount)}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div
                    className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-200"
                    style={{ background: "rgba(255,0,0,0.7)" }}
                  >
                    <Icon name="Play" size={18} className="text-white ml-1" />
                  </div>
                </div>
              </div>
              {/* Info */}
              <div className="p-3">
                <div className="font-rajdhani text-sm font-semibold text-white leading-tight line-clamp-2 mb-2">{v.title}</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[rgba(0,255,255,0.5)] truncate max-w-[140px]">{v.channel}</span>
                  <span className="font-mono text-[10px] text-[rgba(255,255,255,0.25)] flex-shrink-0">{v.publishedAt}</span>
                </div>
              </div>
            </div>
          ))}

          {videos.length === 0 && (
            <div className="col-span-3 panel rounded-lg p-10 text-center">
              <div className="font-orbitron text-sm text-[rgba(0,255,255,0.3)] tracking-widest">ВИДЕО НЕ НАЙДЕНЫ</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
