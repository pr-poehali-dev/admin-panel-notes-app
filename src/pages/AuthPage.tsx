import { useState } from "react";
import Icon from "@/components/ui/icon";
import { API, saveAuth, User } from "@/lib/api";

interface Props {
  onAuth: (user: User) => void;
}

export default function AuthPage({ onAuth }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = mode === "login" ? "/login" : "/register";
      const body =
        mode === "login"
          ? { login: form.email || form.username, password: form.password }
          : { username: form.username, email: form.email, password: form.password };
      const res = await fetch(API.auth + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      saveAuth(data.session, data.user);
      onAuth(data.user);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)] hex-bg relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, var(--neon-cyan), transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, var(--neon-purple), transparent 70%)" }} />
      </div>

      <div className="relative w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg border-2 border-[var(--neon-cyan)] mb-4 animate-pulse-neon" style={{ background: "rgba(0,255,255,0.05)" }}>
            <span className="font-orbitron text-[var(--neon-cyan)] text-xl font-black">NX</span>
          </div>
          <h1 className="font-orbitron text-2xl font-black neon-cyan tracking-widest">NEXUS</h1>
          <p className="font-mono text-[10px] text-[rgba(0,255,255,0.4)] tracking-[0.3em] mt-1">ВИЗАРИЯ // GAMING PLATFORM</p>
        </div>

        {/* Card */}
        <div className="panel rounded-lg p-6">
          {/* Tabs */}
          <div className="flex mb-6 p-1 rounded bg-[rgba(0,0,0,0.3)] border border-[rgba(0,255,255,0.1)]">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className="flex-1 py-2 rounded font-rajdhani text-sm font-semibold tracking-wider transition-all"
                style={{
                  background: mode === m ? "rgba(0,255,255,0.1)" : "transparent",
                  color: mode === m ? "var(--neon-cyan)" : "rgba(180,220,230,0.4)",
                  border: mode === m ? "1px solid rgba(0,255,255,0.3)" : "1px solid transparent",
                }}
              >
                {m === "login" ? "ВОЙТИ" : "РЕГИСТРАЦИЯ"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <Field icon="User" placeholder="НИКНЕЙМ" value={form.username} onChange={(v) => set("username", v)} />
            )}
            <Field
              icon="Mail"
              placeholder={mode === "login" ? "EMAIL ИЛИ НИКНЕЙМ" : "EMAIL"}
              value={form.email}
              onChange={(v) => set("email", v)}
              type={mode === "register" ? "email" : "text"}
            />
            <Field icon="Lock" placeholder="ПАРОЛЬ" value={form.password} onChange={(v) => set("password", v)} type="password" />

            {error && (
              <div className="flex items-center gap-2 p-3 rounded border border-[rgba(255,0,170,0.3)] bg-[rgba(255,0,170,0.05)]">
                <Icon name="AlertTriangle" size={14} className="text-[var(--neon-pink)] flex-shrink-0" />
                <span className="font-mono text-xs text-[var(--neon-pink)]">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded font-orbitron text-sm font-bold tracking-widest transition-all duration-200 mt-2"
              style={{
                background: "linear-gradient(135deg, rgba(0,255,255,0.15), rgba(191,95,255,0.15))",
                border: "1px solid var(--neon-cyan)",
                color: "var(--neon-cyan)",
                boxShadow: "0 0 20px rgba(0,255,255,0.2)",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "ЗАГРУЗКА..." : mode === "login" ? "ВОЙТИ В СИСТЕМУ" : "СОЗДАТЬ АККАУНТ"}
            </button>
          </form>
        </div>

        <p className="text-center font-mono text-[10px] text-[rgba(0,255,255,0.2)] mt-4 tracking-widest">
          VIZARIYA © 2024 // ALL SYSTEMS OPERATIONAL
        </p>
      </div>
    </div>
  );
}

function Field({ icon, placeholder, value, onChange, type = "text" }: { icon: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded border border-[rgba(0,255,255,0.15)] bg-[rgba(0,0,0,0.3)] focus-within:border-[var(--neon-cyan)] transition-colors">
      <Icon name={icon} size={14} className="text-[rgba(0,255,255,0.4)] flex-shrink-0" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent font-mono text-xs text-[var(--neon-cyan)] placeholder-[rgba(0,255,255,0.25)] outline-none tracking-wider"
        style={{ caretColor: "var(--neon-cyan)" }}
        required
      />
    </div>
  );
}
