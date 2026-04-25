import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Icon from "@/components/ui/icon";
import { getUser, getSession, logout, User, API, authHeaders } from "@/lib/api";

import AuthPage from "@/pages/AuthPage";
import ContactsPage from "@/pages/ContactsPage";
import MemesPage from "@/pages/MemesPage";
import VideoPage from "@/pages/VideoPage";
import ProfilePage from "@/pages/ProfilePage";
import NotesPage from "@/pages/NotesPage";
import SettingsPage from "@/pages/SettingsPage";
import AdminPage from "@/pages/AdminPage";
import NewsPage from "@/pages/NewsPage";
import ClansPage from "@/pages/ClansPage";
import CommunityPage from "@/pages/CommunityPage";
import MiniGamesPage from "@/pages/MiniGamesPage";

const queryClient = new QueryClient();

type Page = "news" | "profile" | "contacts" | "memes" | "video" | "clans" | "community" | "games" | "notes" | "settings" | "admin";

function getNavItems(isAdmin: boolean) {
  const items: { id: Page; label: string; icon: string; color: string }[] = [
    { id: "news", label: "Новости", icon: "Rss", color: "var(--neon-cyan)" },
    { id: "profile", label: "Профиль", icon: "User", color: "var(--neon-cyan)" },
    { id: "contacts", label: "Контакты", icon: "Users", color: "var(--neon-purple)" },
    { id: "memes", label: "Мемасики", icon: "Image", color: "var(--neon-pink)" },
    { id: "video", label: "Видеолента", icon: "Play", color: "var(--neon-orange)" },
    { id: "clans", label: "Кланы", icon: "Swords", color: "var(--neon-purple)" },
    { id: "community", label: "Сообщество", icon: "MessageSquare", color: "var(--neon-cyan)" },
    { id: "games", label: "Мини-игры", icon: "Gamepad2", color: "var(--neon-green)" },
    { id: "notes", label: "Заметки", icon: "FileText", color: "var(--neon-green)" },
    { id: "settings", label: "Настройки", icon: "Settings", color: "var(--neon-cyan)" },
  ];
  if (isAdmin) {
    items.push({ id: "admin", label: "Vizariya", icon: "Shield", color: "var(--neon-pink)" });
  }
  return items;
}

function ClockDisplay() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return <div className="font-mono text-[11px] text-[rgba(0,255,255,0.5)] tracking-widest">{time.toLocaleTimeString("ru-RU")}</div>;
}

function Dashboard({ currentUser, onLogout }: { currentUser: User; onLogout: () => void }) {
  const [activePage, setActivePage] = useState<Page>("news");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isAdmin = currentUser.role === "admin";
  const navItems = getNavItems(isAdmin);
  const activeNav = navItems.find((n) => n.id === activePage);

  const renderPage = () => {
    switch (activePage) {
      case "news": return <NewsPage currentUser={currentUser} />;
      case "profile": return <ProfilePage />;
      case "contacts": return <ContactsPage />;
      case "memes": return <MemesPage />;
      case "video": return <VideoPage />;
      case "clans": return <ClansPage currentUser={currentUser} />;
      case "community": return <CommunityPage currentUser={currentUser} />;
      case "games": return <MiniGamesPage currentUser={currentUser} />;
      case "notes": return <NotesPage />;
      case "settings": return <SettingsPage />;
      case "admin": return isAdmin ? <AdminPage /> : <div className="text-center py-20 font-orbitron text-[var(--neon-pink)]">ДОСТУП ЗАПРЕЩЁН</div>;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-[var(--bg-dark)] overflow-hidden hex-bg">
      {/* Sidebar */}
      <aside className={`flex flex-col transition-all duration-300 ${sidebarOpen ? "w-56" : "w-16"} bg-[var(--bg-panel)] border-r border-[rgba(0,255,255,0.15)] relative z-10 flex-shrink-0`} style={{ boxShadow: "4px 0 20px rgba(0,255,255,0.05)" }}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[rgba(0,255,255,0.12)]">
          <div className="w-8 h-8 rounded border border-[var(--neon-cyan)] flex items-center justify-center animate-pulse-neon flex-shrink-0" style={{ background: "rgba(0,255,255,0.05)" }}>
            <span className="font-orbitron text-[var(--neon-cyan)] text-xs font-bold">NX</span>
          </div>
          {sidebarOpen && (
            <div className="animate-fade-in-up">
              <div className="font-orbitron text-[var(--neon-cyan)] text-sm font-bold leading-none tracking-widest">NEXUS</div>
              <div className="font-mono text-[9px] text-[rgba(0,255,255,0.4)] tracking-[0.15em] mt-0.5">v2.4.1 ONLINE</div>
            </div>
          )}
        </div>
        {sidebarOpen && (
          <div className="px-4 py-2 border-b border-[rgba(0,255,255,0.08)]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse" />
              <span className="font-mono text-[10px] text-[var(--neon-green)] tracking-wider">СИСТЕМА АКТИВНА</span>
            </div>
          </div>
        )}
        <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-rajdhani font-semibold tracking-wider transition-all duration-200 ${activePage === item.id ? "active" : ""}`}
              style={{
                background: activePage === item.id ? "rgba(0,255,255,0.06)" : "transparent",
                color: activePage === item.id ? item.color : "rgba(180,220,230,0.45)",
                textShadow: activePage === item.id ? `0 0 8px ${item.color}` : "none",
              }}
              onMouseEnter={(e) => { if (activePage !== item.id) { (e.currentTarget as HTMLElement).style.color = item.color; (e.currentTarget as HTMLElement).style.background = "rgba(0,255,255,0.03)"; } }}
              onMouseLeave={(e) => { if (activePage !== item.id) { (e.currentTarget as HTMLElement).style.color = "rgba(180,220,230,0.45)"; (e.currentTarget as HTMLElement).style.background = "transparent"; } }}
            >
              <Icon name={item.icon} size={16} className="flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="m-3 p-2 rounded border border-[rgba(0,255,255,0.15)] text-[rgba(0,255,255,0.4)] hover:text-[var(--neon-cyan)] hover:border-[var(--neon-cyan)] transition-all duration-200 flex items-center justify-center">
          <Icon name={sidebarOpen ? "ChevronLeft" : "ChevronRight"} size={14} />
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-3 border-b border-[rgba(0,255,255,0.12)] bg-[var(--bg-panel)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-px h-4 bg-[var(--neon-cyan)] opacity-60" />
            <h1 className="font-orbitron text-sm font-bold tracking-widest" style={{ color: activeNav?.color, textShadow: `0 0 10px ${activeNav?.color}` }}>
              {activeNav?.label.toUpperCase()}
            </h1>
            <div className="w-px h-4 bg-[var(--neon-cyan)] opacity-60" />
          </div>
          <div className="flex items-center gap-4">
            <ClockDisplay />
            <button className="relative p-1.5 rounded border border-[rgba(0,255,255,0.15)] text-[rgba(0,255,255,0.6)] hover:text-[var(--neon-cyan)] hover:border-[var(--neon-cyan)] transition-all">
              <Icon name="Bell" size={14} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--neon-pink)]" style={{ boxShadow: "0 0 6px var(--neon-pink)" }} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded border-2 border-[var(--neon-cyan)] flex items-center justify-center text-sm" style={{ background: "rgba(0,255,255,0.1)", boxShadow: "0 0 8px var(--neon-cyan)" }}>
                {currentUser.avatar_emoji}
              </div>
              <span className="font-rajdhani text-xs text-[rgba(0,255,255,0.7)] tracking-wider font-semibold">{currentUser.username.toUpperCase()}</span>
            </div>
            <button onClick={onLogout} className="p-1.5 rounded border border-[rgba(255,80,80,0.2)] text-[rgba(255,80,80,0.4)] hover:text-red-400 hover:border-red-400 transition-all" title="Выйти">
              <Icon name="LogOut" size={13} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div key={activePage} className="animate-fade-in-up h-full">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(getUser());

  useEffect(() => {
    const session = getSession();
    if (session && !currentUser) {
      fetch(API.auth + "/me", { headers: authHeaders() })
        .then(r => r.json())
        .then(d => { if (d.user) setCurrentUser(d.user); else logout(); })
        .catch(() => logout());
    }
  }, []);

  const handleLogout = () => { logout(); setCurrentUser(null); };

  if (!currentUser) return <AuthPage onAuth={setCurrentUser} />;
  return <Dashboard currentUser={currentUser} onLogout={handleLogout} />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
