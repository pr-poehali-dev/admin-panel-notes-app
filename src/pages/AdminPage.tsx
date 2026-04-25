import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const users = [
  { id: 1, name: "КиберВолк", ip: "192.168.1.14", status: "active", lastSeen: "00:02:11", actions: 142, emoji: "🐺", risk: "low" },
  { id: 2, name: "НеонМастер", ip: "10.0.0.77", status: "active", lastSeen: "00:00:34", actions: 89, emoji: "🎨", risk: "low" },
  { id: 3, name: "ПиксельГёрл", ip: "172.16.5.3", status: "idle", lastSeen: "00:14:22", actions: 23, emoji: "👾", risk: "medium" },
  { id: 4, name: "БайтСмит", ip: "45.67.89.101", status: "offline", lastSeen: "01:02:55", actions: 5, emoji: "⚙️", risk: "low" },
  { id: 5, name: "ГлитчМен", ip: "203.0.113.45", status: "active", lastSeen: "00:00:08", actions: 511, emoji: "📡", risk: "high" },
];

const initialLogs = [
  { id: 1, time: "16:42:08", type: "info", msg: "Пользователь КиберВолк выполнил вход", ip: "192.168.1.14" },
  { id: 2, time: "16:42:15", type: "warn", msg: "Попытка доступа к /admin от GUEST", ip: "23.44.55.66" },
  { id: 3, time: "16:43:01", type: "info", msg: "ГлитчМен: 500 запросов за 60 секунд", ip: "203.0.113.45" },
  { id: 4, time: "16:43:22", type: "error", msg: "Ошибка аутентификации: неверный токен", ip: "88.99.11.22" },
  { id: 5, time: "16:43:45", type: "info", msg: "БД: подключение восстановлено после 2с", ip: "localhost" },
  { id: 6, time: "16:44:01", type: "warn", msg: "Rate limit достигнут: 203.0.113.45", ip: "203.0.113.45" },
  { id: 7, time: "16:44:18", type: "info", msg: "Кэш очищен успешно", ip: "localhost" },
];

const logColors: Record<string, string> = {
  info: "var(--neon-cyan)",
  warn: "var(--neon-orange)",
  error: "var(--neon-pink)",
};

const riskColors: Record<string, string> = {
  low: "var(--neon-green)",
  medium: "var(--neon-orange)",
  high: "var(--neon-pink)",
};

const statusColors: Record<string, string> = {
  active: "var(--neon-green)",
  idle: "var(--neon-orange)",
  offline: "rgba(255,255,255,0.2)",
};

export default function AdminPage() {
  const [logs, setLogs] = useState(initialLogs);
  const [activeTab, setActiveTab] = useState<"users" | "logs" | "stats">("stats");
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setTicker((p) => p + 1);
      const types = ["info", "warn", "error"] as const;
      const msgs = [
        "Новый запрос обработан",
        "Синхронизация данных завершена",
        "Heartbeat: все сервисы работают",
        "Кэш обновлён",
      ];
      const newLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString("ru-RU"),
        type: types[Math.floor(Math.random() * types.length)],
        msg: msgs[Math.floor(Math.random() * msgs.length)],
        ip: "localhost",
      };
      setLogs((p) => [newLog, ...p.slice(0, 19)]);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const stats = [
    { label: "Активных пользователей", value: users.filter((u) => u.status === "active").length, color: "var(--neon-green)", icon: "Users" },
    { label: "Запросов/мин", value: 847 + ticker, color: "var(--neon-cyan)", icon: "Activity" },
    { label: "Ошибок сегодня", value: 12, color: "var(--neon-pink)", icon: "AlertTriangle" },
    { label: "Uptime", value: "99.98%", color: "var(--neon-purple)", icon: "Server" },
  ];

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="panel rounded-lg p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${s.color}15`, border: `1px solid ${s.color}44` }}
            >
              <Icon name={s.icon} size={18} style={{ color: s.color }} />
            </div>
            <div>
              <div className="font-orbitron text-xl font-bold" style={{ color: s.color, textShadow: `0 0 8px ${s.color}` }}>
                {s.value}
              </div>
              <div className="font-mono text-[10px] text-[rgba(180,220,230,0.4)] tracking-wider mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 panel rounded-lg p-1 w-fit">
        {(["stats", "users", "logs"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded font-rajdhani text-sm font-semibold tracking-wider transition-all"
            style={{
              background: activeTab === tab ? "rgba(0,255,255,0.08)" : "transparent",
              color: activeTab === tab ? "var(--neon-cyan)" : "rgba(180,220,230,0.45)",
              border: activeTab === tab ? "1px solid rgba(0,255,255,0.2)" : "1px solid transparent",
            }}
          >
            {{ stats: "Статистика", users: "Пользователи", logs: "Логи системы" }[tab]}
          </button>
        ))}
      </div>

      {/* Stats tab */}
      {activeTab === "stats" && (
        <div className="grid grid-cols-2 gap-4">
          {/* Chart placeholder */}
          <div className="panel rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-[var(--neon-cyan)]" style={{ boxShadow: "0 0 6px var(--neon-cyan)" }} />
              <span className="font-orbitron text-xs font-bold text-[var(--neon-cyan)] tracking-widest">АКТИВНОСТЬ (24ч)</span>
            </div>
            <div className="flex items-end gap-1 h-32">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 88, 72, 65, 78, 92, 85, 70, 60, 75, 88, 95, 82, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t transition-all duration-300"
                  style={{
                    height: `${h}%`,
                    background: `linear-gradient(to top, var(--neon-cyan), var(--neon-purple))`,
                    opacity: i === 23 ? 1 : 0.5 + (i / 23) * 0.3,
                    boxShadow: i === 23 ? "0 0 8px var(--neon-cyan)" : "none",
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="font-mono text-[9px] text-[rgba(0,255,255,0.3)]">00:00</span>
              <span className="font-mono text-[9px] text-[rgba(0,255,255,0.3)]">12:00</span>
              <span className="font-mono text-[9px] text-[rgba(0,255,255,0.3)]">сейчас</span>
            </div>
          </div>

          {/* Error distribution */}
          <div className="panel rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-[var(--neon-pink)]" style={{ boxShadow: "0 0 6px var(--neon-pink)" }} />
              <span className="font-orbitron text-xs font-bold text-[var(--neon-pink)] tracking-widest">СТАТУС СИСТЕМЫ</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "API Gateway", status: "OK", uptime: "100%", color: "var(--neon-green)" },
                { label: "Database", status: "OK", uptime: "99.9%", color: "var(--neon-green)" },
                { label: "Cache (Redis)", status: "OK", uptime: "100%", color: "var(--neon-green)" },
                { label: "File Storage", status: "SLOW", uptime: "98.2%", color: "var(--neon-orange)" },
                { label: "Auth Service", status: "OK", uptime: "99.99%", color: "var(--neon-green)" },
              ].map((srv) => (
                <div key={srv.label} className="flex items-center justify-between py-1.5 border-b border-[rgba(0,255,255,0.06)]">
                  <span className="font-mono text-xs text-[rgba(180,220,230,0.6)]">{srv.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-[rgba(0,255,255,0.4)]">{srv.uptime}</span>
                    <span
                      className="font-mono text-[10px] px-2 py-0.5 rounded"
                      style={{ color: srv.color, background: `${srv.color}15`, border: `1px solid ${srv.color}33` }}
                    >
                      {srv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users tab */}
      {activeTab === "users" && (
        <div className="panel rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(0,255,255,0.1)]">
                {["Пользователь", "IP-адрес", "Статус", "Активность", "Запросы", "Риск", "Действия"].map((col) => (
                  <th key={col} className="px-4 py-3 text-left font-mono text-[10px] text-[rgba(0,255,255,0.4)] tracking-widest font-normal">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr
                  key={user.id}
                  className="border-b border-[rgba(0,255,255,0.05)] transition-all"
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,255,255,0.03)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{user.emoji}</span>
                      <span className="font-rajdhani text-sm font-semibold text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[rgba(0,255,255,0.5)]">{user.ip}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColors[user.status] }} />
                      <span className="font-mono text-[11px]" style={{ color: statusColors[user.status] }}>
                        {user.status === "active" ? "ОНЛАЙН" : user.status === "idle" ? "IDLE" : "ОФЛАЙН"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[rgba(180,220,230,0.4)]">{user.lastSeen} назад</td>
                  <td className="px-4 py-3 font-orbitron text-sm" style={{ color: user.actions > 200 ? "var(--neon-orange)" : "var(--neon-cyan)" }}>
                    {user.actions}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-mono text-[10px] px-2 py-0.5 rounded"
                      style={{ color: riskColors[user.risk], background: `${riskColors[user.risk]}15`, border: `1px solid ${riskColors[user.risk]}33` }}
                    >
                      {user.risk.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1 rounded border border-[rgba(0,255,255,0.15)] text-[rgba(0,255,255,0.4)] hover:text-[var(--neon-cyan)] transition-all">
                        <Icon name="Eye" size={12} />
                      </button>
                      <button className="p-1 rounded border border-[rgba(255,0,0,0.15)] text-[rgba(255,80,80,0.4)] hover:text-red-400 transition-all">
                        <Icon name="Ban" size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Logs tab */}
      {activeTab === "logs" && (
        <div className="panel rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,255,255,0.1)]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse" />
              <span className="font-mono text-[11px] text-[var(--neon-green)] tracking-wider">LIVE FEED</span>
            </div>
            <span className="font-mono text-[10px] text-[rgba(0,255,255,0.3)]">{logs.length} записей</span>
          </div>
          <div className="overflow-y-auto max-h-96">
            {logs.map((log, i) => (
              <div
                key={log.id}
                className="flex items-start gap-3 px-4 py-2.5 border-b border-[rgba(0,255,255,0.04)] font-mono text-xs"
                style={{ opacity: i === 0 ? 1 : 1 - i * 0.04, animationDelay: `${i * 0.02}s` }}
              >
                <span className="text-[rgba(0,255,255,0.3)] flex-shrink-0">{log.time}</span>
                <span
                  className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-widest"
                  style={{ color: logColors[log.type], background: `${logColors[log.type]}15`, border: `1px solid ${logColors[log.type]}33` }}
                >
                  {log.type}
                </span>
                <span className="text-[rgba(180,220,230,0.6)] flex-1">{log.msg}</span>
                <span className="text-[rgba(0,255,255,0.25)] flex-shrink-0">{log.ip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
