import { useState } from "react";
import Icon from "@/components/ui/icon";

const sections = [
  { id: "account", label: "Аккаунт", icon: "User" },
  { id: "interface", label: "Интерфейс", icon: "Monitor" },
  { id: "notifications", label: "Уведомления", icon: "Bell" },
  { id: "security", label: "Безопасность", icon: "Lock" },
  { id: "advanced", label: "Дополнительно", icon: "Cpu" },
];

function Toggle({ value, onChange, color = "var(--neon-cyan)" }: { value: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0"
      style={{
        background: value ? `${color}44` : "rgba(255,255,255,0.08)",
        border: `1px solid ${value ? color : "rgba(255,255,255,0.15)"}`,
        boxShadow: value ? `0 0 8px ${color}66` : "none",
      }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200"
        style={{
          background: value ? color : "rgba(255,255,255,0.3)",
          left: value ? "calc(100% - 18px)" : "1px",
          boxShadow: value ? `0 0 6px ${color}` : "none",
        }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("account");
  const [settings, setSettings] = useState({
    scanlines: true,
    neonEffects: true,
    animations: true,
    soundEffects: false,
    notifications: true,
    emailNotif: false,
    darkMode: true,
    autoSave: true,
    twoFactor: false,
    devMode: false,
    accentCyan: true,
    accentPurple: false,
    accentGreen: false,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">
      {/* Sidebar */}
      <div className="w-48 flex-shrink-0 panel rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[rgba(0,255,255,0.1)]">
          <span className="font-mono text-[10px] text-[rgba(0,255,255,0.4)] tracking-widest">НАСТРОЙКИ</span>
        </div>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className="w-full flex items-center gap-3 px-4 py-3 border-b border-[rgba(0,255,255,0.06)] text-sm font-rajdhani font-semibold tracking-wider transition-all"
            style={{
              color: activeSection === s.id ? "var(--neon-cyan)" : "rgba(180,220,230,0.45)",
              background: activeSection === s.id ? "rgba(0,255,255,0.05)" : "transparent",
              borderLeft: activeSection === s.id ? "2px solid var(--neon-cyan)" : "2px solid transparent",
            }}
          >
            <Icon name={s.icon} size={14} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 panel rounded-lg overflow-y-auto">
        {activeSection === "account" && (
          <Section title="АККАУНТ" color="var(--neon-cyan)">
            <SettingGroup title="Профиль">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-lg border-2 border-[var(--neon-cyan)] flex items-center justify-center text-3xl" style={{ background: "rgba(0,255,255,0.08)", boxShadow: "0 0 15px rgba(0,255,255,0.2)" }}>
                  🎮
                </div>
                <div>
                  <div className="font-orbitron text-sm font-bold text-white mb-1">PLAYER_01</div>
                  <div className="font-mono text-[10px] text-[rgba(0,255,255,0.4)] mb-2">player01@nexus.gg</div>
                  <button className="font-rajdhani text-xs text-[var(--neon-cyan)] border border-[rgba(0,255,255,0.3)] px-3 py-1 rounded hover:bg-[rgba(0,255,255,0.08)] transition-all tracking-wider">
                    Изменить аватар
                  </button>
                </div>
              </div>
              <SettingField label="Никнейм" value="PLAYER_01" />
              <SettingField label="Email" value="player01@nexus.gg" />
              <SettingField label="Статус" value="Профессиональный геймер" />
            </SettingGroup>
          </Section>
        )}

        {activeSection === "interface" && (
          <Section title="ИНТЕРФЕЙС" color="var(--neon-purple)">
            <SettingGroup title="Визуальные эффекты">
              <SettingRow label="Сканлайны" desc="CRT-эффект поверх интерфейса" color="var(--neon-purple)">
                <Toggle value={settings.scanlines} onChange={() => toggle("scanlines")} color="var(--neon-purple)" />
              </SettingRow>
              <SettingRow label="Неон-свечение" desc="Эффекты свечения на элементах" color="var(--neon-cyan)">
                <Toggle value={settings.neonEffects} onChange={() => toggle("neonEffects")} />
              </SettingRow>
              <SettingRow label="Анимации" desc="Переходы и анимированные элементы" color="var(--neon-green)">
                <Toggle value={settings.animations} onChange={() => toggle("animations")} color="var(--neon-green)" />
              </SettingRow>
              <SettingRow label="Звуковые эффекты" desc="UI-звуки при взаимодействии" color="var(--neon-orange)">
                <Toggle value={settings.soundEffects} onChange={() => toggle("soundEffects")} color="var(--neon-orange)" />
              </SettingRow>
            </SettingGroup>
            <SettingGroup title="Цветовая схема">
              <div className="flex gap-3">
                {[
                  { key: "accentCyan", color: "var(--neon-cyan)", label: "Cyan" },
                  { key: "accentPurple", color: "var(--neon-purple)", label: "Purple" },
                  { key: "accentGreen", color: "var(--neon-green)", label: "Green" },
                ].map((ac) => (
                  <button
                    key={ac.key}
                    onClick={() => setSettings((p) => ({ ...p, accentCyan: false, accentPurple: false, accentGreen: false, [ac.key]: true }))}
                    className="flex flex-col items-center gap-2 p-3 rounded border transition-all"
                    style={{
                      borderColor: settings[ac.key as keyof typeof settings] ? ac.color : "rgba(255,255,255,0.1)",
                      background: settings[ac.key as keyof typeof settings] ? `${ac.color}15` : "transparent",
                    }}
                  >
                    <div className="w-6 h-6 rounded-full" style={{ background: ac.color, boxShadow: `0 0 8px ${ac.color}` }} />
                    <span className="font-mono text-[10px]" style={{ color: ac.color }}>{ac.label}</span>
                  </button>
                ))}
              </div>
            </SettingGroup>
          </Section>
        )}

        {activeSection === "notifications" && (
          <Section title="УВЕДОМЛЕНИЯ" color="var(--neon-green)">
            <SettingGroup title="Каналы">
              <SettingRow label="Push-уведомления" desc="Браузерные уведомления" color="var(--neon-green)">
                <Toggle value={settings.notifications} onChange={() => toggle("notifications")} color="var(--neon-green)" />
              </SettingRow>
              <SettingRow label="Email уведомления" desc="Отправка на почту" color="var(--neon-cyan)">
                <Toggle value={settings.emailNotif} onChange={() => toggle("emailNotif")} />
              </SettingRow>
            </SettingGroup>
          </Section>
        )}

        {activeSection === "security" && (
          <Section title="БЕЗОПАСНОСТЬ" color="var(--neon-pink)">
            <SettingGroup title="Защита аккаунта">
              <SettingRow label="Двухфакторная аутентификация" desc="2FA через приложение" color="var(--neon-pink)">
                <Toggle value={settings.twoFactor} onChange={() => toggle("twoFactor")} color="var(--neon-pink)" />
              </SettingRow>
              <SettingRow label="Автосохранение сессии" desc="Помнить вход 30 дней" color="var(--neon-cyan)">
                <Toggle value={settings.autoSave} onChange={() => toggle("autoSave")} />
              </SettingRow>
            </SettingGroup>
            <SettingGroup title="Действия">
              <div className="flex gap-3">
                <button className="font-rajdhani text-sm font-semibold px-4 py-2 rounded border border-[rgba(0,255,255,0.3)] text-[var(--neon-cyan)] hover:bg-[rgba(0,255,255,0.08)] transition-all tracking-wider">
                  Сменить пароль
                </button>
                <button className="font-rajdhani text-sm font-semibold px-4 py-2 rounded border border-[rgba(255,0,0,0.3)] text-[rgba(255,80,80,0.8)] hover:bg-[rgba(255,0,0,0.08)] transition-all tracking-wider">
                  Выйти из всех сессий
                </button>
              </div>
            </SettingGroup>
          </Section>
        )}

        {activeSection === "advanced" && (
          <Section title="ДОПОЛНИТЕЛЬНО" color="var(--neon-orange)">
            <SettingGroup title="Режим разработчика">
              <SettingRow label="Dev Mode" desc="Отладочные инструменты и логи" color="var(--neon-orange)">
                <Toggle value={settings.devMode} onChange={() => toggle("devMode")} color="var(--neon-orange)" />
              </SettingRow>
            </SettingGroup>
            {settings.devMode && (
              <div className="p-4 rounded-lg border border-[rgba(255,102,0,0.3)] bg-[rgba(255,102,0,0.05)] font-mono text-xs text-[rgba(255,102,0,0.7)] space-y-1">
                <div>{">"} NEXUS v2.4.1 // Debug mode ACTIVE</div>
                <div>{">"} DB: Connected · Latency: 12ms</div>
                <div>{">"} Workers: 4 · Uptime: 99.98%</div>
                <div className="text-[var(--neon-orange)] animate-blink">{">"} _</div>
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[rgba(0,255,255,0.1)]">
        <div className="w-1 h-4 rounded" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
        <h2 className="font-orbitron text-xs font-bold tracking-widest" style={{ color }}>{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] text-[rgba(0,255,255,0.35)] tracking-widest mb-3 uppercase">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SettingRow({ label, desc, color = "var(--neon-cyan)", children }: { label: string; desc: string; color?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[rgba(0,255,255,0.06)]">
      <div>
        <div className="font-rajdhani text-sm font-semibold text-white tracking-wider">{label}</div>
        <div className="font-mono text-[10px] text-[rgba(180,220,230,0.4)] mt-0.5">{desc}</div>
      </div>
      {children}
    </div>
  );
}

function SettingField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[rgba(0,255,255,0.06)]">
      <span className="font-mono text-[11px] text-[rgba(0,255,255,0.4)] tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-rajdhani text-sm text-white">{value}</span>
        <button className="p-1 rounded border border-[rgba(0,255,255,0.15)] text-[rgba(0,255,255,0.4)] hover:text-[var(--neon-cyan)] transition-all">
          <Icon name="Edit2" size={10} />
        </button>
      </div>
    </div>
  );
}
