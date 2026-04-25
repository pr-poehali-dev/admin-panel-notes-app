import Icon from "@/components/ui/icon";

const stats = [
  { label: "Уровень", value: "47", color: "var(--neon-cyan)", icon: "Zap" },
  { label: "Очки", value: "18,420", color: "var(--neon-green)", icon: "Star" },
  { label: "Достижения", value: "83", color: "var(--neon-purple)", icon: "Trophy" },
  { label: "Дней онлайн", value: "312", color: "var(--neon-pink)", icon: "Flame" },
];

const achievements = [
  { title: "Первый шаг", desc: "Зарегистрирован аккаунт", done: true, icon: "✦" },
  { title: "Социальный", desc: "Добавлено 10 контактов", done: true, icon: "✦" },
  { title: "Создатель", desc: "Написано 50 заметок", done: true, icon: "✦" },
  { title: "Легенда", desc: "Набрать 50,000 очков", done: false, icon: "◇" },
  { title: "Мем-лорд", desc: "Опубликовать 100 мемов", done: false, icon: "◇" },
  { title: "Стример", desc: "Просмотреть 1000 видео", done: false, icon: "◇" },
];

const skills = [
  { name: "Коммуникация", val: 78, color: "var(--neon-cyan)" },
  { name: "Аналитика", val: 92, color: "var(--neon-purple)" },
  { name: "Креатив", val: 65, color: "var(--neon-pink)" },
  { name: "Техника", val: 88, color: "var(--neon-green)" },
];

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="panel rounded-lg p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: "radial-gradient(ellipse at 30% 50%, var(--neon-cyan) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, var(--neon-purple) 0%, transparent 60%)",
          }}
        />
        <div className="relative flex items-center gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-24 h-24 rounded-lg border-2 border-[var(--neon-cyan)] flex items-center justify-center text-4xl"
              style={{
                background: "linear-gradient(135deg, rgba(0,255,255,0.1), rgba(191,95,255,0.1))",
                boxShadow: "0 0 20px var(--neon-cyan), 0 0 40px rgba(0,255,255,0.2)",
              }}
            >
              🎮
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[var(--bg-dark)] bg-[var(--neon-green)]"
              style={{ boxShadow: "0 0 8px var(--neon-green)" }}
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-orbitron text-2xl font-bold text-white">PLAYER_01</h2>
              <span
                className="font-mono text-[10px] px-2 py-0.5 rounded border border-[var(--neon-cyan)] text-[var(--neon-cyan)]"
                style={{ background: "rgba(0,255,255,0.1)" }}
              >
                ADMIN
              </span>
            </div>
            <div className="font-mono text-xs text-[rgba(0,255,255,0.5)] mb-3 tracking-wider">
              ID: 0x4A2F9B1C · Москва, RU
            </div>
            <div className="progress-neon w-64">
              <div className="progress-neon-fill" style={{ width: "72%" }} />
            </div>
            <div className="flex items-center justify-between w-64 mt-1">
              <span className="font-mono text-[10px] text-[rgba(0,255,255,0.4)]">LVL 47</span>
              <span className="font-mono text-[10px] text-[rgba(0,255,255,0.4)]">72% → LVL 48</span>
            </div>
          </div>

          {/* XP badge */}
          <div
            className="text-center p-4 rounded-lg border border-[var(--neon-purple)]"
            style={{ background: "rgba(191,95,255,0.08)", boxShadow: "0 0 15px rgba(191,95,255,0.2)" }}
          >
            <div className="font-orbitron text-3xl font-bold neon-purple">47</div>
            <div className="font-mono text-[10px] text-[rgba(191,95,255,0.6)] tracking-widest mt-1">УРОВЕНЬ</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="panel rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2 opacity-60">
              <Icon name={s.icon} size={16} style={{ color: s.color }} />
            </div>
            <div className="font-orbitron text-xl font-bold" style={{ color: s.color, textShadow: `0 0 8px ${s.color}` }}>
              {s.value}
            </div>
            <div className="font-rajdhani text-xs text-[rgba(180,220,230,0.5)] mt-1 tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Skills */}
        <div className="panel rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[var(--neon-cyan)]" style={{ boxShadow: "0 0 6px var(--neon-cyan)" }} />
            <h3 className="font-orbitron text-xs font-bold text-[var(--neon-cyan)] tracking-widest">НАВЫКИ</h3>
          </div>
          <div className="space-y-4">
            {skills.map((sk) => (
              <div key={sk.name}>
                <div className="flex justify-between mb-1.5">
                  <span className="font-rajdhani text-sm text-[rgba(180,220,230,0.7)] tracking-wider">{sk.name}</span>
                  <span className="font-mono text-xs" style={{ color: sk.color }}>{sk.val}%</span>
                </div>
                <div className="progress-neon">
                  <div
                    className="progress-neon-fill"
                    style={{
                      width: `${sk.val}%`,
                      background: `linear-gradient(90deg, ${sk.color}, ${sk.color}88)`,
                      boxShadow: `0 0 8px ${sk.color}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="panel rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[var(--neon-green)]" style={{ boxShadow: "0 0 6px var(--neon-green)" }} />
            <h3 className="font-orbitron text-xs font-bold text-[var(--neon-green)] tracking-widest">ДОСТИЖЕНИЯ</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {achievements.map((a) => (
              <div
                key={a.title}
                className="flex items-center gap-2 p-2.5 rounded border"
                style={{
                  borderColor: a.done ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.06)",
                  background: a.done ? "rgba(0,255,136,0.04)" : "transparent",
                  opacity: a.done ? 1 : 0.4,
                }}
              >
                <span className="text-sm" style={{ color: a.done ? "var(--neon-green)" : "rgba(255,255,255,0.3)" }}>
                  {a.icon}
                </span>
                <div>
                  <div className="font-rajdhani text-xs font-semibold text-white leading-none">{a.title}</div>
                  <div className="font-mono text-[9px] text-[rgba(180,220,230,0.4)] mt-0.5 leading-none">{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
