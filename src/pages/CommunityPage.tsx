import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { API, authHeaders, User } from "@/lib/api";

interface Channel { id: number; name: string; description: string; emoji: string; members: number; owner: string; }
interface Chat { id: number; name: string; is_group: boolean; }
interface Message { id: number; content: string; username: string; avatar_emoji: string; created_at: string; }

const EMOJIS = ["📢","🎮","💬","🔥","🎵","📸","🤖","🌐","⚡","🎯","💡","🛠️"];

export default function CommunityPage({ currentUser }: { currentUser: User | null }) {
  const [tab, setTab] = useState<"channels" | "chats">("channels");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", emoji: "📢" });
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(API.community + "/channels").then(r => r.json()).then(d => setChannels(d.channels || []));
    fetch(API.community + "/chats").then(r => r.json()).then(d => setChats(d.chats || []));
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetch(API.community + `/messages?chat_id=${activeChat.id}`).then(r => r.json()).then(d => setMessages(d.messages || []));
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!msgInput.trim() || !activeChat) return;
    const res = await fetch(API.community + "/messages", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ chat_id: activeChat.id, content: msgInput }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages(p => [...p, data]);
      setMsgInput("");
    }
  };

  const createItem = async () => {
    setError("");
    const endpoint = tab === "channels" ? "/channels" : "/chats";
    const res = await fetch(API.community + endpoint, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setCreating(false);
    setForm({ name: "", description: "", emoji: "📢" });
    if (tab === "channels") {
      fetch(API.community + "/channels").then(r => r.json()).then(d => setChannels(d.channels || []));
    } else {
      fetch(API.community + "/chats").then(r => r.json()).then(d => setChats(d.chats || []));
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">
      {/* Left panel */}
      <div className="w-64 flex flex-col gap-3 flex-shrink-0">
        {/* Tabs */}
        <div className="panel rounded-lg p-1 flex">
          {(["channels", "chats"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setActiveChat(null); setCreating(false); }}
              className="flex-1 py-2 rounded font-rajdhani text-xs font-semibold tracking-wider transition-all"
              style={{ background: tab===t ? "rgba(0,255,255,0.08)" : "transparent", color: tab===t ? "var(--neon-cyan)" : "rgba(180,220,230,0.4)", border: tab===t ? "1px solid rgba(0,255,255,0.2)" : "1px solid transparent" }}
            >
              {t === "channels" ? "Каналы" : "Чаты"}
            </button>
          ))}
        </div>

        {/* Create button */}
        {currentUser && (
          <button onClick={() => setCreating(!creating)}
            className="flex items-center justify-center gap-2 py-2 rounded font-rajdhani text-xs font-semibold tracking-wider transition-all"
            style={{ border: "1px solid rgba(0,255,255,0.2)", color: "rgba(0,255,255,0.6)", background: creating ? "rgba(0,255,255,0.06)" : "transparent" }}
          >
            <Icon name={creating ? "X" : "Plus"} size={12} />
            {creating ? "Отмена" : tab === "channels" ? "Создать канал" : "Создать чат"}
          </button>
        )}

        {/* Create form */}
        {creating && currentUser && (
          <div className="panel rounded-lg p-3 animate-fade-in-up">
            <input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="Название..." className="w-full bg-transparent border border-[rgba(0,255,255,0.15)] rounded px-2 py-1.5 font-rajdhani text-xs text-white outline-none mb-2 focus:border-[var(--neon-cyan)]" />
            {tab === "channels" && <input value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} placeholder="Описание..." className="w-full bg-transparent border border-[rgba(0,255,255,0.15)] rounded px-2 py-1.5 font-rajdhani text-xs text-white outline-none mb-2 focus:border-[var(--neon-cyan)]" />}
            <div className="flex gap-1 flex-wrap mb-2">
              {EMOJIS.map(e => <button key={e} onClick={() => setForm(p=>({...p,emoji:e}))} className="text-lg w-7 h-7 rounded transition-all" style={{ background: form.emoji===e ? "rgba(0,255,255,0.15)" : "transparent", border: form.emoji===e ? "1px solid var(--neon-cyan)" : "1px solid transparent" }}>{e}</button>)}
            </div>
            {error && <p className="font-mono text-[10px] text-[var(--neon-pink)] mb-2">{error}</p>}
            <button onClick={createItem} className="w-full py-1.5 rounded font-mono text-[10px] tracking-widest transition-all" style={{ border: "1px solid var(--neon-cyan)", color: "var(--neon-cyan)", background: "rgba(0,255,255,0.06)" }}>СОЗДАТЬ</button>
          </div>
        )}

        {/* List */}
        <div className="panel rounded-lg overflow-y-auto flex-1">
          {tab === "channels" ? (
            channels.length === 0 ? (
              <div className="p-4 text-center font-mono text-xs text-[rgba(0,255,255,0.2)]">Нет каналов</div>
            ) : channels.map(ch => (
              <div key={ch.id} className="flex items-center gap-2 px-3 py-2.5 border-b border-[rgba(0,255,255,0.06)] cursor-pointer hover:bg-[rgba(0,255,255,0.03)] transition-all">
                <span className="text-xl">{ch.emoji}</span>
                <div className="min-w-0">
                  <div className="font-rajdhani text-xs font-semibold text-white truncate">{ch.name}</div>
                  <div className="font-mono text-[9px] text-[rgba(0,255,136,0.5)]">{ch.members} участников</div>
                </div>
              </div>
            ))
          ) : (
            chats.length === 0 ? (
              <div className="p-4 text-center font-mono text-xs text-[rgba(0,255,255,0.2)]">Нет чатов</div>
            ) : chats.map(chat => (
              <button key={chat.id} onClick={() => setActiveChat(chat)}
                className="w-full flex items-center gap-2 px-3 py-2.5 border-b border-[rgba(0,255,255,0.06)] transition-all text-left"
                style={{ background: activeChat?.id === chat.id ? "rgba(0,255,255,0.05)" : "transparent", borderLeft: activeChat?.id === chat.id ? "2px solid var(--neon-cyan)" : "2px solid transparent" }}
              >
                <div className="w-7 h-7 rounded border border-[rgba(0,255,255,0.2)] flex items-center justify-center text-sm bg-[rgba(0,255,255,0.05)]">
                  <Icon name="MessageSquare" size={12} className="text-[var(--neon-cyan)]" />
                </div>
                <div>
                  <div className="font-rajdhani text-xs font-semibold text-white">{chat.name}</div>
                  <div className="font-mono text-[9px] text-[rgba(0,255,255,0.3)]">Группа</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 panel rounded-lg flex flex-col overflow-hidden">
        {activeChat ? (
          <>
            <div className="px-4 py-3 border-b border-[rgba(0,255,255,0.1)] flex items-center gap-3">
              <Icon name="MessageSquare" size={16} className="text-[var(--neon-cyan)]" />
              <span className="font-orbitron text-xs font-bold text-[var(--neon-cyan)] tracking-widest">{activeChat.name}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8 text-[rgba(0,255,255,0.2)] font-mono text-xs">Нет сообщений. Будь первым!</div>
              )}
              {messages.map(msg => (
                <div key={msg.id} className="flex items-start gap-2 animate-fade-in-up">
                  <div className="w-7 h-7 rounded border border-[rgba(0,255,255,0.2)] flex items-center justify-center text-sm flex-shrink-0">{msg.avatar_emoji}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-rajdhani text-xs font-bold text-white">{msg.username}</span>
                      <span className="font-mono text-[9px] text-[rgba(0,255,255,0.3)]">{new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="font-rajdhani text-sm text-[rgba(220,240,240,0.8)]">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {currentUser ? (
              <div className="px-4 py-3 border-t border-[rgba(0,255,255,0.1)] flex gap-2">
                <input
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Написать сообщение..."
                  className="flex-1 bg-transparent border border-[rgba(0,255,255,0.15)] rounded px-3 py-2 font-rajdhani text-sm text-white outline-none focus:border-[var(--neon-cyan)] transition-colors"
                  style={{ caretColor: "var(--neon-cyan)" }}
                />
                <button onClick={sendMessage} className="p-2 rounded border border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[rgba(0,255,255,0.1)] transition-all">
                  <Icon name="Send" size={16} />
                </button>
              </div>
            ) : (
              <div className="px-4 py-3 border-t border-[rgba(0,255,255,0.1)] text-center font-mono text-xs text-[rgba(0,255,255,0.3)]">Войдите, чтобы писать сообщения</div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <Icon name="MessageSquare" size={48} className="mx-auto mb-3 text-[rgba(0,255,255,0.15)]" />
              <div className="font-orbitron text-sm text-[rgba(0,255,255,0.2)] tracking-widest">ВЫБЕРИТЕ ЧАТ</div>
              <div className="font-mono text-xs text-[rgba(0,255,255,0.15)] mt-1">Или создайте новый</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
