import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { API, authHeaders, getUser, User } from "@/lib/api";

interface Post {
  id: number;
  content: string;
  image_url: string;
  likes: number;
  created_at: string;
  username: string;
  avatar_emoji: string;
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return `${Math.floor(diff / 86400)} дн назад`;
}

export default function NewsPage({ currentUser }: { currentUser: User | null }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(new Set());

  const load = async () => {
    setLoading(true);
    const res = await fetch(API.posts + "/");
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const publish = async () => {
    if (!newPost.trim() || posting) return;
    setPosting(true);
    const res = await fetch(API.posts + "/", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ content: newPost }),
    });
    if (res.ok) {
      const data = await res.json();
      setPosts((p) => [data, ...p]);
      setNewPost("");
    }
    setPosting(false);
  };

  const likePost = async (id: number) => {
    const res = await fetch(API.posts + "/like", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ post_id: id }),
    });
    if (res.ok) {
      const data = await res.json();
      setLiked((prev) => {
        const next = new Set(prev);
        if (data.liked) next.add(id); else next.delete(id);
        return next;
      });
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, likes: data.likes } : p));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Create post */}
      {currentUser && (
        <div className="panel rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded border border-[var(--neon-cyan)] flex items-center justify-center text-lg flex-shrink-0" style={{ background: "rgba(0,255,255,0.08)" }}>
              {currentUser.avatar_emoji}
            </div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Что происходит, игрок?"
                rows={3}
                className="w-full bg-transparent font-rajdhani text-sm text-white placeholder-[rgba(255,255,255,0.25)] outline-none resize-none border-b border-[rgba(0,255,255,0.1)] pb-2 mb-3"
                style={{ caretColor: "var(--neon-cyan)" }}
              />
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[rgba(0,255,255,0.3)]">{newPost.length}/1000</span>
                <button
                  onClick={publish}
                  disabled={!newPost.trim() || posting}
                  className="flex items-center gap-2 px-4 py-1.5 rounded font-rajdhani text-sm font-semibold tracking-wider transition-all"
                  style={{
                    border: "1px solid var(--neon-cyan)",
                    color: "var(--neon-cyan)",
                    background: "rgba(0,255,255,0.08)",
                    opacity: !newPost.trim() || posting ? 0.4 : 1,
                  }}
                >
                  <Icon name="Send" size={13} />
                  {posting ? "Публикую..." : "Опубликовать"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!currentUser && (
        <div className="panel rounded-lg p-4 text-center border border-[rgba(0,255,255,0.15)]">
          <span className="font-mono text-xs text-[rgba(0,255,255,0.4)]">Войдите, чтобы публиковать посты</span>
        </div>
      )}

      {/* Feed */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="panel rounded-lg p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded bg-[rgba(0,255,255,0.06)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[rgba(0,255,255,0.06)] rounded w-1/3" />
                  <div className="h-3 bg-[rgba(0,255,255,0.04)] rounded w-3/4" />
                  <div className="h-3 bg-[rgba(0,255,255,0.04)] rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="panel rounded-lg p-10 text-center">
          <Icon name="Rss" size={40} className="mx-auto mb-3 text-[rgba(0,255,255,0.2)]" />
          <div className="font-orbitron text-sm text-[rgba(0,255,255,0.3)] tracking-widest">ЛЕНТА ПУСТА</div>
          <div className="font-mono text-xs text-[rgba(0,255,255,0.2)] mt-1">Будь первым, кто опубликует пост!</div>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <div key={post.id} className="panel rounded-lg p-4 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded border border-[rgba(0,255,255,0.2)] flex items-center justify-center text-lg flex-shrink-0" style={{ background: "rgba(0,255,255,0.05)" }}>
                  {post.avatar_emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-rajdhani text-sm font-bold text-white">{post.username}</span>
                    <span className="font-mono text-[10px] text-[rgba(0,255,255,0.3)]">{timeAgo(post.created_at)}</span>
                  </div>
                  <p className="font-rajdhani text-sm text-[rgba(220,240,240,0.8)] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => currentUser && likePost(post.id)}
                      className="flex items-center gap-1.5 transition-all"
                      style={{ color: liked.has(post.id) ? "var(--neon-pink)" : "rgba(255,255,255,0.3)" }}
                    >
                      <Icon name="Heart" size={14} />
                      <span className="font-mono text-[11px]">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-[rgba(255,255,255,0.3)] hover:text-[var(--neon-cyan)] transition-colors">
                      <Icon name="MessageCircle" size={14} />
                    </button>
                    <button className="flex items-center gap-1.5 text-[rgba(255,255,255,0.3)] hover:text-[var(--neon-purple)] transition-colors">
                      <Icon name="Share2" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
