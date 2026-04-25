import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { API, authHeaders, User } from "@/lib/api";

interface Clan {
  id: number;
  name: string;
  tag: string;
  description: string;
  emoji: string;
  owner: string;
  members: number;
  created_at: string;
}

const EMOJIS = ["⚔️","🛡️","🔥","💀","🐺","🦅","🐉","⚡","🌑","🎯","🏴","🧬"];

export default function ClansPage({ currentUser }: { currentUser: User | null }) {
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", tag: "", description: "", emoji: "⚔️" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selected, setSelected] = useState<Clan | null>(null);

  useEffect(() => {
    fetch(API.clans + "/").then(r => r.json()).then(d => { setClans(d.clans || []); setLoading(false); });
  }, []);

  const createClan = async () => {
    setError(""); setSuccess("");
    const res = await fetch(API.clans + "/", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setSuccess("Клан создан!");
    setCreating(false);
    setForm({ name: "", tag: "", description: "", emoji: "⚔️" });
    fetch(API.clans + "/").then(r => r.json()).then(d => setClans(d.clans || []));
  };

  const joinClan = async (id: number) => {
    const res = await fetch(API.clans + "/join", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ clan_id: id }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setSuccess("Ты вступил в клан!");
    fetch(API.clans + "/").then(r => r.json()).then(d => setClans(d.clans || []));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[var(--neon-purple)]" style={{ boxShadow: "0 0 8px var(--neon-purple)" }} />
          <h2 className="font-orbitron text-sm font-bold text-[var(--neon-purple)] tracking-widest">КЛАНЫ</h2>
          <span className="font-mono text-[11px] text-[rgba(191,95,255,0.5)]">{clans.length} активных</span>
        </div>
        {currentUser && (
          <button
            onClick={() => { setCreating(!creating); setError(""); setSuccess(""); }}
            className="flex items-center gap-2 px-4 py-2 rounded font-rajdhani text-sm font-semibold tracking-wider transition-all"
            style={{ border: "1px solid var(--neon-purple)", color: "var(--neon-purple)", background: creating ? "rgba(191,95,255,0.1)" : "rgba(191,95,255,0.05)" }}
          >
            <Icon name={creating ? "X" : "Plus"} size={14} />
            {creating ? "Отмена" : "Создать клан"}
          </button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div className="panel rounded-lg p-5 border-[var(--neon-purple)] animate-fade-in-up" style={{ borderColor: "rgba(191,95,255,0.3)" }}>
          <h3 className="font-orbitron text-xs font-bold text-[var(--neon-purple)] tracking-widest mb-4">СОЗДАНИЕ КЛАНА</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="font-mono text-[10px] text-[rgba(0,255,255,0.4)] tracking-wider mb-1 block">НАЗВАНИЕ *</label>
              <input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="Название клана" className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(191,95,255,0.2)] rounded px-3 py-2 font-rajdhani text-sm text-white outline-none focus:border-[var(--neon-purple)] transition-colors" />
            </div>
            <div>
              <label className="font-mono text-[10px] text-[rgba(0,255,255,0.4)] tracking-wider mb-1 block">ТЕГ * (до 5 символов)</label>
              <input value={form.tag} onChange={e => setForm(p=>({...p,tag:e.target.value.toUpperCase()}))} placeholder="CLAN" maxLength={5} className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(191,95,255,0.2)] rounded px-3 py-2 font-mono text-sm text-[var(--neon-purple)] outline-none focus:border-[var(--neon-purple)] transition-colors" />
            </div>
          </div>
          <div className="mb-4">
            <label className="font-mono text-[10px] text-[rgba(0,255,255,0.4)] tracking-wider mb-1 block">ОПИСАНИЕ</label>
            <input value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} placeholder="Описание клана..." className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(191,95,255,0.2)] rounded px-3 py-2 font-rajdhani text-sm text-white outline-none focus:border-[var(--neon-purple)] transition-colors" />
          </div>
          <div className="mb-4">
            <label className="font-mono text-[10px] text-[rgba(0,255,255,0.4)] tracking-wider mb-2 block">ЭМОДЗИ</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setForm(p=>({...p,emoji:e}))} className="text-2xl w-9 h-9 rounded transition-all" style={{ background: form.emoji===e ? "rgba(191,95,255,0.2)" : "rgba(0,0,0,0.3)", border: form.emoji===e ? "1px solid var(--neon-purple)" : "1px solid rgba(255,255,255,0.1)" }}>{e}</button>
              ))}
            </div>
          </div>
          {error && <p className="font-mono text-xs text-[var(--neon-pink)] mb-3">{error}</p>}
          {success && <p className="font-mono text-xs text-[var(--neon-green)] mb-3">{success}</p>}
          <button onClick={createClan} className="px-6 py-2 rounded font-orbitron text-xs font-bold tracking-widest transition-all" style={{ background: "rgba(191,95,255,0.15)", border: "1px solid var(--neon-purple)", color: "var(--neon-purple)" }}>СОЗДАТЬ</button>
        </div>
      )}

      {success && !creating && <div className="font-mono text-xs text-[var(--neon-green)] p-3 rounded border border-[rgba(0,255,136,0.2)] bg-[rgba(0,255,136,0.05)]">{success}</div>}
      {error && !creating && <div className="font-mono text-xs text-[var(--neon-pink)] p-3 rounded border border-[rgba(255,0,170,0.2)] bg-[rgba(255,0,170,0.05)]">{error}</div>}

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="panel rounded-lg h-32 animate-pulse" />)}
        </div>
      ) : clans.length === 0 ? (
        <div className="panel rounded-lg p-10 text-center">
          <div className="text-5xl mb-3">⚔️</div>
          <div className="font-orbitron text-sm text-[rgba(191,95,255,0.4)] tracking-widest">КЛАНОВ НЕТ</div>
          <div className="font-mono text-xs text-[rgba(255,255,255,0.2)] mt-1">Создай первый клан!</div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {clans.map((clan, i) => (
            <div
              key={clan.id}
              className="panel rounded-lg p-4 cursor-pointer group transition-all animate-fade-in-up"
              style={{ animationDelay: `${i*0.05}s`, borderColor: selected?.id === clan.id ? "rgba(191,95,255,0.4)" : "" }}
              onClick={() => setSelected(selected?.id === clan.id ? null : clan)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">{clan.emoji}</div>
                <div>
                  <div className="font-orbitron text-xs font-bold text-white">{clan.name}</div>
                  <div className="font-mono text-[10px] text-[var(--neon-purple)]">[{clan.tag}]</div>
                </div>
              </div>
              {clan.description && <p className="font-rajdhani text-xs text-[rgba(220,240,240,0.5)] mb-3 line-clamp-2">{clan.description}</p>}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[rgba(0,255,136,0.6)]">
                  <Icon name="Users" size={12} />
                  <span className="font-mono text-[10px]">{clan.members}</span>
                </div>
                {currentUser && (
                  <button
                    onClick={(e) => { e.stopPropagation(); joinClan(clan.id); }}
                    className="font-mono text-[10px] px-2 py-1 rounded transition-all hover:opacity-100 opacity-0 group-hover:opacity-100"
                    style={{ border: "1px solid rgba(191,95,255,0.4)", color: "var(--neon-purple)", background: "rgba(191,95,255,0.08)" }}
                  >
                    Вступить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
