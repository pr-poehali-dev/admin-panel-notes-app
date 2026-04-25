import { useState } from "react";
import Icon from "@/components/ui/icon";

const contacts = [
  { id: 1, name: "КиберВолк", role: "Разработчик", status: "online", tag: "#7734", emoji: "🐺", color: "var(--neon-cyan)" },
  { id: 2, name: "НеонМастер", role: "Дизайнер", status: "online", tag: "#2291", emoji: "🎨", color: "var(--neon-purple)" },
  { id: 3, name: "ПиксельГёрл", role: "Геймер", status: "idle", tag: "#4455", emoji: "👾", color: "var(--neon-pink)" },
  { id: 4, name: "БайтСмит", role: "DevOps", status: "offline", tag: "#9912", emoji: "⚙️", color: "var(--neon-green)" },
  { id: 5, name: "ГлитчМен", role: "Стример", status: "online", tag: "#3318", emoji: "📡", color: "var(--neon-orange)" },
  { id: 6, name: "ТёмнаяМатрица", role: "Хакер", status: "idle", tag: "#0001", emoji: "💀", color: "var(--neon-pink)" },
  { id: 7, name: "РобоСапиенс", role: "ML Engineer", status: "online", tag: "#5560", emoji: "🤖", color: "var(--neon-cyan)" },
  { id: 8, name: "КосмоДрайвер", role: "Тестировщик", status: "offline", tag: "#8847", emoji: "🚀", color: "var(--neon-purple)" },
];

const statusColors: Record<string, string> = {
  online: "var(--neon-green)",
  idle: "var(--neon-orange)",
  offline: "rgba(255,255,255,0.2)",
};

const statusLabel: Record<string, string> = {
  online: "В СЕТИ",
  idle: "НЕАКТИВЕН",
  offline: "ОФЛАЙН",
};

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(1);

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase())
  );

  const selectedContact = contacts.find((c) => c.id === selected);

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">
      {/* Left: list */}
      <div className="w-72 flex flex-col gap-3 flex-shrink-0">
        {/* Search */}
        <div className="panel rounded-lg p-3 flex items-center gap-2">
          <Icon name="Search" size={14} className="text-[rgba(0,255,255,0.4)] flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ПОИСК АГЕНТА..."
            className="flex-1 bg-transparent font-mono text-xs text-[var(--neon-cyan)] placeholder-[rgba(0,255,255,0.25)] outline-none tracking-wider"
          />
          <span className="font-mono text-[10px] text-[rgba(0,255,255,0.3)]">{filtered.length}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "ОНЛАЙН", count: contacts.filter((c) => c.status === "online").length, color: "var(--neon-green)" },
            { label: "IDLE", count: contacts.filter((c) => c.status === "idle").length, color: "var(--neon-orange)" },
            { label: "ОФЛАЙН", count: contacts.filter((c) => c.status === "offline").length, color: "rgba(255,255,255,0.3)" },
          ].map((s) => (
            <div key={s.label} className="panel rounded p-2 text-center">
              <div className="font-orbitron text-base font-bold" style={{ color: s.color }}>{s.count}</div>
              <div className="font-mono text-[9px] mt-0.5" style={{ color: s.color, opacity: 0.6 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* List */}
        <div className="panel rounded-lg overflow-y-auto flex-1">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-[rgba(0,255,255,0.06)] transition-all duration-150 text-left"
              style={{
                background: selected === c.id ? "rgba(0,255,255,0.05)" : "transparent",
                borderLeft: selected === c.id ? `2px solid ${c.color}` : "2px solid transparent",
              }}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="w-9 h-9 rounded border flex items-center justify-center text-lg"
                  style={{ borderColor: `${c.color}44`, background: `${c.color}0d` }}
                >
                  {c.emoji}
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[var(--bg-dark)]"
                  style={{ background: statusColors[c.status], boxShadow: c.status !== "offline" ? `0 0 4px ${statusColors[c.status]}` : "none" }}
                />
              </div>
              <div className="min-w-0">
                <div className="font-rajdhani text-sm font-semibold text-white truncate">{c.name}</div>
                <div className="font-mono text-[10px] text-[rgba(180,220,230,0.4)] truncate">{c.role}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: detail */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col gap-4">
          <div className="panel rounded-lg p-6 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{ background: `radial-gradient(ellipse at 30% 50%, ${selectedContact.color}, transparent 60%)` }}
            />
            <div className="relative flex items-center gap-5">
              <div
                className="w-20 h-20 rounded-lg flex items-center justify-center text-5xl border-2"
                style={{
                  borderColor: selectedContact.color,
                  background: `${selectedContact.color}15`,
                  boxShadow: `0 0 20px ${selectedContact.color}66`,
                }}
              >
                {selectedContact.emoji}
              </div>
              <div className="flex-1">
                <h2 className="font-orbitron text-xl font-bold text-white mb-1">{selectedContact.name}</h2>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-xs text-[rgba(0,255,255,0.5)]">{selectedContact.tag}</span>
                  <span
                    className="font-mono text-[10px] px-2 py-0.5 rounded"
                    style={{ color: statusColors[selectedContact.status], background: `${statusColors[selectedContact.status]}1a`, border: `1px solid ${statusColors[selectedContact.status]}44` }}
                  >
                    ● {statusLabel[selectedContact.status]}
                  </span>
                </div>
                <div className="font-rajdhani text-sm text-[rgba(180,220,230,0.6)] tracking-wider">{selectedContact.role}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Сообщения", value: "247", icon: "MessageSquare", color: "var(--neon-cyan)" },
              { label: "Общие группы", value: "5", icon: "Users", color: "var(--neon-purple)" },
              { label: "Файлов обменяно", value: "32", icon: "File", color: "var(--neon-green)" },
              { label: "Дней знакомы", value: "128", icon: "Calendar", color: "var(--neon-pink)" },
            ].map((item) => (
              <div key={item.label} className="panel rounded-lg p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15`, border: `1px solid ${item.color}44` }}>
                  <Icon name={item.icon} size={14} style={{ color: item.color }} />
                </div>
                <div>
                  <div className="font-orbitron text-lg font-bold" style={{ color: item.color }}>{item.value}</div>
                  <div className="font-rajdhani text-xs text-[rgba(180,220,230,0.5)] tracking-wider">{item.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="panel rounded-lg p-4 flex gap-3">
            {[
              { label: "Сообщение", icon: "MessageSquare", color: "var(--neon-cyan)" },
              { label: "Звонок", icon: "Phone", color: "var(--neon-green)" },
              { label: "Видео", icon: "Video", color: "var(--neon-purple)" },
              { label: "Файл", icon: "Paperclip", color: "var(--neon-orange)" },
            ].map((btn) => (
              <button
                key={btn.label}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded font-rajdhani text-sm font-semibold tracking-wider transition-all duration-200"
                style={{
                  border: `1px solid ${btn.color}44`,
                  color: btn.color,
                  background: `${btn.color}0d`,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${btn.color}1a`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = `${btn.color}0d`; }}
              >
                <Icon name={btn.icon} size={14} />
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 panel rounded-lg flex items-center justify-center">
          <div className="text-center text-[rgba(0,255,255,0.2)]">
            <Icon name="Users" size={48} className="mx-auto mb-3" />
            <div className="font-orbitron text-sm tracking-widest">ВЫБЕРИТЕ АГЕНТА</div>
          </div>
        </div>
      )}
    </div>
  );
}
