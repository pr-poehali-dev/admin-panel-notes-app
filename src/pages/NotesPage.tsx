import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Note {
  id: number;
  title: string;
  content: string;
  tag: string;
  color: string;
  date: string;
  pinned?: boolean;
}

const initialNotes: Note[] = [
  { id: 1, title: "Идеи для проекта", content: "Сделать неоновый дашборд с геймерским интерфейсом. Добавить анимации глитча, сканлайны, эффекты свечения.", tag: "идеи", color: "var(--neon-cyan)", date: "24 апр", pinned: true },
  { id: 2, title: "TODO на неделю", content: "1. Задеплоить бэкенд\n2. Написать тесты\n3. Обновить README\n4. Код-ревью PR #42", tag: "задачи", color: "var(--neon-green)", date: "23 апр", pinned: true },
  { id: 3, title: "Читы для Cyberpunk", content: "Бессмертие: KEREZNIKOV\nДеньги: +50000\nВсе улучшения: ALLPERKS", tag: "игры", color: "var(--neon-purple)", date: "22 апр" },
  { id: 4, title: "Конфиг nginx", content: "server { listen 443; ssl_certificate /etc/ssl/cert.pem; proxy_pass http://localhost:3000; }", tag: "техника", color: "var(--neon-orange)", date: "20 апр" },
  { id: 5, title: "Пароли (ЗАШИФРОВАНО)", content: "••••••••••••••••••••••••••••••••••••••", tag: "личное", color: "var(--neon-pink)", date: "18 апр" },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selected, setSelected] = useState<Note | null>(notes[0]);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [search, setSearch] = useState("");

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter((n) => n.pinned);
  const regular = filtered.filter((n) => !n.pinned);

  const startEdit = (note: Note) => {
    setSelected(note);
    setEditContent(note.content);
    setEditing(true);
  };

  const saveEdit = () => {
    if (!selected) return;
    setNotes((prev) => prev.map((n) => n.id === selected.id ? { ...n, content: editContent } : n));
    setSelected((prev) => prev ? { ...prev, content: editContent } : null);
    setEditing(false);
  };

  const addNote = () => {
    const id = Date.now();
    const newNote: Note = { id, title: "Новая заметка", content: "Начните писать...", tag: "личное", color: "var(--neon-cyan)", date: "сейчас" };
    setNotes((prev) => [newNote, ...prev]);
    startEdit(newNote);
  };

  const deleteNote = (id: number) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selected?.id === id) setSelected(notes[0] || null);
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">
      {/* Sidebar */}
      <div className="w-64 flex flex-col gap-3 flex-shrink-0">
        {/* Search + Add */}
        <div className="flex gap-2">
          <div className="panel rounded flex items-center gap-2 px-3 flex-1 min-w-0">
            <Icon name="Search" size={12} className="text-[rgba(0,255,255,0.4)] flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="bg-transparent font-mono text-xs text-[var(--neon-cyan)] placeholder-[rgba(0,255,255,0.25)] outline-none w-full py-2"
            />
          </div>
          <button
            onClick={addNote}
            className="p-2 rounded border border-[var(--neon-green)] text-[var(--neon-green)] hover:bg-[rgba(0,255,136,0.1)] transition-all flex-shrink-0"
            title="Новая заметка"
          >
            <Icon name="Plus" size={14} />
          </button>
        </div>

        {/* Notes list */}
        <div className="panel rounded-lg overflow-y-auto flex-1">
          {pinned.length > 0 && (
            <>
              <div className="px-3 py-2 flex items-center gap-2 border-b border-[rgba(0,255,255,0.08)]">
                <Icon name="Pin" size={11} className="text-[rgba(0,255,255,0.4)]" />
                <span className="font-mono text-[10px] text-[rgba(0,255,255,0.4)] tracking-widest">ЗАКРЕПЛЁННЫЕ</span>
              </div>
              {pinned.map((note) => (
                <NoteItem key={note.id} note={note} selected={selected?.id === note.id} onClick={() => { setSelected(note); setEditing(false); }} />
              ))}
            </>
          )}
          {regular.length > 0 && (
            <>
              <div className="px-3 py-2 flex items-center gap-2 border-b border-[rgba(0,255,255,0.08)]">
                <Icon name="FileText" size={11} className="text-[rgba(0,255,255,0.4)]" />
                <span className="font-mono text-[10px] text-[rgba(0,255,255,0.4)] tracking-widest">ЗАМЕТКИ</span>
              </div>
              {regular.map((note) => (
                <NoteItem key={note.id} note={note} selected={selected?.id === note.id} onClick={() => { setSelected(note); setEditing(false); }} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 panel rounded-lg overflow-hidden flex flex-col">
        {selected ? (
          <>
            {/* Note header */}
            <div
              className="px-5 py-4 border-b border-[rgba(0,255,255,0.1)] flex items-center justify-between"
              style={{ borderLeftColor: selected.color, borderLeftWidth: 3 }}
            >
              <div>
                <h2 className="font-orbitron text-sm font-bold text-white mb-1">{selected.title}</h2>
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono text-[10px] px-2 py-0.5 rounded"
                    style={{ color: selected.color, background: `${selected.color}15`, border: `1px solid ${selected.color}33` }}
                  >
                    #{selected.tag}
                  </span>
                  <span className="font-mono text-[10px] text-[rgba(0,255,255,0.3)]">{selected.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editing ? (
                  <>
                    <button onClick={saveEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded font-rajdhani text-xs font-semibold tracking-wider text-[var(--neon-green)] border border-[rgba(0,255,136,0.3)] hover:bg-[rgba(0,255,136,0.08)] transition-all">
                      <Icon name="Check" size={12} /> Сохранить
                    </button>
                    <button onClick={() => setEditing(false)} className="p-1.5 rounded border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.3)] hover:text-white transition-all">
                      <Icon name="X" size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(selected)} className="p-1.5 rounded border border-[rgba(0,255,255,0.15)] text-[rgba(0,255,255,0.5)] hover:text-[var(--neon-cyan)] hover:border-[var(--neon-cyan)] transition-all">
                      <Icon name="Edit2" size={13} />
                    </button>
                    <button onClick={() => deleteNote(selected.id)} className="p-1.5 rounded border border-[rgba(255,0,0,0.2)] text-[rgba(255,0,0,0.4)] hover:text-[var(--destructive)] hover:border-[var(--destructive)] transition-all">
                      <Icon name="Trash2" size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-5 overflow-y-auto">
              {editing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full bg-transparent font-mono text-sm text-[rgba(180,230,230,0.8)] outline-none resize-none leading-relaxed"
                  style={{ caretColor: "var(--neon-cyan)" }}
                  autoFocus
                />
              ) : (
                <pre className="font-mono text-sm text-[rgba(180,230,230,0.7)] whitespace-pre-wrap leading-relaxed">
                  {selected.content}
                </pre>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-2 border-t border-[rgba(0,255,255,0.08)] flex items-center justify-between">
              <span className="font-mono text-[10px] text-[rgba(0,255,255,0.25)]">
                {selected.content.length} символов
              </span>
              {editing && (
                <span className="font-mono text-[10px] text-[var(--neon-green)] animate-blink">● РЕЖИМ РЕДАКТИРОВАНИЯ</span>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[rgba(0,255,255,0.2)]">
            <div className="text-center">
              <Icon name="FileText" size={48} className="mx-auto mb-3" />
              <div className="font-orbitron text-sm tracking-widest">ВЫБЕРИТЕ ЗАМЕТКУ</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NoteItem({ note, selected, onClick }: { note: Note; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-3 border-b border-[rgba(0,255,255,0.06)] transition-all duration-150"
      style={{
        background: selected ? "rgba(0,255,255,0.04)" : "transparent",
        borderLeft: selected ? `2px solid ${note.color}` : "2px solid transparent",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: note.color, boxShadow: `0 0 4px ${note.color}` }} />
        <span className="font-rajdhani text-xs font-semibold text-white truncate">{note.title}</span>
      </div>
      <p className="font-mono text-[10px] text-[rgba(180,220,230,0.35)] truncate pl-4">{note.content}</p>
    </button>
  );
}
