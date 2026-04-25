import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { API, authHeaders, User } from "@/lib/api";

type Game = "menu" | "snake" | "reaction" | "memory";

interface LeaderEntry { username: string; avatar_emoji: string; score: number; rank: number; }

export default function MiniGamesPage({ currentUser }: { currentUser: User | null }) {
  const [game, setGame] = useState<Game>("menu");
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [lbGame, setLbGame] = useState("snake");

  useEffect(() => {
    fetch(API.community + `/leaderboard?game=${lbGame}`).then(r => r.json()).then(d => setLeaderboard(d.leaderboard || []));
  }, [lbGame]);

  const saveScore = async (gameName: string, score: number) => {
    if (!currentUser) return;
    await fetch(API.community + "/score", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ game: gameName, score }),
    });
    fetch(API.community + `/leaderboard?game=${gameName}`).then(r => r.json()).then(d => setLeaderboard(d.leaderboard || []));
  };

  if (game === "snake") return <SnakeGame onBack={() => setGame("menu")} onScore={(s) => saveScore("snake", s)} currentUser={currentUser} />;
  if (game === "reaction") return <ReactionGame onBack={() => setGame("menu")} onScore={(s) => saveScore("reaction", s)} currentUser={currentUser} />;
  if (game === "memory") return <MemoryGame onBack={() => setGame("menu")} onScore={(s) => saveScore("memory", s)} currentUser={currentUser} />;

  const games = [
    { id: "snake" as Game, name: "ЗМЕЙКА", emoji: "🐍", desc: "Классика. Ешь, расти, не врезайся.", color: "var(--neon-green)", bestScore: "∞" },
    { id: "reaction" as Game, name: "РЕАКЦИЯ", emoji: "⚡", desc: "Нажми как можно быстрее!", color: "var(--neon-cyan)", bestScore: "< 100мс" },
    { id: "memory" as Game, name: "ПАМЯТЬ", emoji: "🧠", desc: "Найди все пары карточек.", color: "var(--neon-purple)", bestScore: "16/16" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {games.map((g) => (
          <div key={g.id} className="panel rounded-lg p-5 cursor-pointer group transition-all hover:scale-[1.02]"
            style={{ borderColor: "rgba(0,255,255,0.15)" }}
            onClick={() => setGame(g.id)}
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{g.emoji}</div>
            <h3 className="font-orbitron text-sm font-bold mb-1" style={{ color: g.color }}>{g.name}</h3>
            <p className="font-rajdhani text-xs text-[rgba(220,240,240,0.5)] mb-4">{g.desc}</p>
            <button className="w-full py-2 rounded font-orbitron text-xs font-bold tracking-widest transition-all"
              style={{ border: `1px solid ${g.color}66`, color: g.color, background: `${g.color}0d` }}
            >
              ИГРАТЬ
            </button>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="panel rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[var(--neon-orange)]" style={{ boxShadow: "0 0 6px var(--neon-orange)" }} />
            <h3 className="font-orbitron text-xs font-bold text-[var(--neon-orange)] tracking-widest">ТОП ИГРОКОВ</h3>
          </div>
          <div className="flex gap-2">
            {["snake","reaction","memory"].map(g => (
              <button key={g} onClick={() => setLbGame(g)}
                className="font-mono text-[10px] px-2 py-1 rounded transition-all"
                style={{ border: lbGame===g ? "1px solid var(--neon-orange)" : "1px solid rgba(255,255,255,0.1)", color: lbGame===g ? "var(--neon-orange)" : "rgba(255,255,255,0.3)", background: lbGame===g ? "rgba(255,102,0,0.08)" : "transparent" }}
              >{g}</button>
            ))}
          </div>
        </div>
        {leaderboard.length === 0 ? (
          <div className="text-center py-6 font-mono text-xs text-[rgba(255,255,255,0.2)]">Нет записей. Сыграй первым!</div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((e) => (
              <div key={e.rank} className="flex items-center gap-3 py-2 border-b border-[rgba(0,255,255,0.05)]">
                <span className="font-orbitron text-sm font-bold w-6 text-center" style={{ color: e.rank <= 3 ? ["var(--neon-orange)","rgba(200,200,200,0.8)","rgba(180,120,60,0.8)"][e.rank-1] : "rgba(255,255,255,0.3)" }}>{e.rank}</span>
                <span className="text-lg">{e.avatar_emoji}</span>
                <span className="font-rajdhani text-sm font-semibold text-white flex-1">{e.username}</span>
                <span className="font-orbitron text-sm font-bold text-[var(--neon-cyan)]">{e.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// === SNAKE GAME ===
const GRID = 20;
const CELL = 18;
type Dir = { x: number; y: number };
type Pos = { x: number; y: number };

function SnakeGame({ onBack, onScore, currentUser }: { onBack: () => void; onScore: (s: number) => void; currentUser: User | null }) {
  const [snake, setSnake] = useState<Pos[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Pos>({ x: 5, y: 5 });
  const [dir, setDir] = useState<Dir>({ x: 1, y: 0 });
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);
  const dirRef = useRef(dir);
  dirRef.current = dir;

  const randomFood = useCallback((s: Pos[]) => {
    let pos: Pos;
    do { pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }; }
    while (s.some(p => p.x === pos.x && p.y === pos.y));
    return pos;
  }, []);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSnake(prev => {
        const d = dirRef.current;
        const head = { x: (prev[0].x + d.x + GRID) % GRID, y: (prev[0].y + d.y + GRID) % GRID };
        if (prev.some(p => p.x === head.x && p.y === head.y)) {
          setRunning(false); setDead(true);
          onScore(score);
          return prev;
        }
        const ateFood = head.x === food.x && head.y === food.y;
        const newSnake = ateFood ? [head, ...prev] : [head, ...prev.slice(0, -1)];
        if (ateFood) { setFood(randomFood(newSnake)); setScore(s => s + 10); }
        return newSnake;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [running, food, score, randomFood, onScore]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } };
      if (map[e.key]) { e.preventDefault(); const d = map[e.key]; if (d.x !== -dirRef.current.x || d.y !== -dirRef.current.y) setDir(d); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const restart = () => { setSnake([{ x: 10, y: 10 }]); setFood({ x: 5, y: 5 }); setDir({ x: 1, y: 0 }); setScore(0); setDead(false); setRunning(true); };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-lg">
        <button onClick={onBack} className="flex items-center gap-2 font-mono text-xs text-[rgba(0,255,255,0.5)] hover:text-[var(--neon-cyan)] transition-colors"><Icon name="ArrowLeft" size={14} /> Назад</button>
        <div className="font-orbitron text-lg font-bold text-[var(--neon-green)]">{score}</div>
      </div>
      <div className="panel rounded-lg p-2 relative" style={{ width: GRID*CELL+16, height: GRID*CELL+16 }}>
        <div className="relative" style={{ width: GRID*CELL, height: GRID*CELL, background: "rgba(0,0,0,0.5)" }}>
          {snake.map((p, i) => (
            <div key={i} className="absolute rounded-sm transition-all" style={{ left: p.x*CELL, top: p.y*CELL, width: CELL-1, height: CELL-1, background: i===0 ? "var(--neon-green)" : `rgba(0,255,136,${0.9-i*0.03})`, boxShadow: i===0 ? "0 0 8px var(--neon-green)" : "none" }} />
          ))}
          <div className="absolute rounded-full" style={{ left: food.x*CELL+2, top: food.y*CELL+2, width: CELL-5, height: CELL-5, background: "var(--neon-pink)", boxShadow: "0 0 8px var(--neon-pink)" }} />
          {(!running || dead) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(0,0,0,0.7)]">
              {dead && <div className="font-orbitron text-lg font-bold text-[var(--neon-pink)] mb-2">GAME OVER</div>}
              {dead && <div className="font-mono text-sm text-[rgba(0,255,255,0.6)] mb-4">Счёт: {score}</div>}
              <button onClick={restart} className="px-6 py-2 rounded font-orbitron text-xs font-bold tracking-widest" style={{ border: "1px solid var(--neon-green)", color: "var(--neon-green)", background: "rgba(0,255,136,0.1)" }}>{dead ? "СНОВА" : "СТАРТ"}</button>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {([["ArrowUp","↑",{x:0,y:-1}],["ArrowDown","↓",{x:0,y:1}],["ArrowLeft","←",{x:-1,y:0}],["ArrowRight","→",{x:1,y:0}]] as [string,string,Dir][]).map(([,label,d]) => (
          <button key={label} onClick={() => { if (d.x !== -dirRef.current.x || d.y !== -dirRef.current.y) setDir(d); }} className="w-10 h-10 rounded font-mono text-sm border border-[rgba(0,255,255,0.2)] text-[rgba(0,255,255,0.6)] hover:text-[var(--neon-cyan)] hover:border-[var(--neon-cyan)] transition-all">{label}</button>
        ))}
      </div>
      {!currentUser && <p className="font-mono text-[10px] text-[rgba(255,255,255,0.3)]">Войдите, чтобы сохранять очки</p>}
    </div>
  );
}

// === REACTION GAME ===
function ReactionGame({ onBack, onScore, currentUser }: { onBack: () => void; onScore: (s: number) => void; currentUser: User | null }) {
  const [state, setState] = useState<"idle" | "waiting" | "go" | "result">("idle");
  const [reactionTime, setReactionTime] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const startRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    setState("waiting");
    const delay = 1500 + Math.random() * 3000;
    timerRef.current = setTimeout(() => { setState("go"); startRef.current = Date.now(); }, delay);
  };

  const click = () => {
    if (state === "waiting") { if (timerRef.current) clearTimeout(timerRef.current); setState("idle"); return; }
    if (state === "go") {
      const t = Date.now() - startRef.current;
      setReactionTime(t);
      setState("result");
      const pts = Math.max(0, 1000 - t);
      if (!best || t < best) { setBest(t); onScore(pts); }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <button onClick={onBack} className="self-start flex items-center gap-2 font-mono text-xs text-[rgba(0,255,255,0.5)] hover:text-[var(--neon-cyan)] transition-colors"><Icon name="ArrowLeft" size={14} /> Назад</button>
      <h2 className="font-orbitron text-xl font-bold text-[var(--neon-cyan)]">ТЕСТ РЕАКЦИИ</h2>
      {best && <div className="font-mono text-sm text-[rgba(0,255,255,0.5)]">Лучшее: <span className="text-[var(--neon-cyan)]">{best}мс</span></div>}
      <button
        onClick={state === "idle" || state === "result" ? start : click}
        className="w-64 h-64 rounded-full font-orbitron text-lg font-bold transition-all duration-150 flex flex-col items-center justify-center gap-3"
        style={{
          background: state === "go" ? "rgba(0,255,136,0.2)" : state === "waiting" ? "rgba(255,102,0,0.1)" : "rgba(0,255,255,0.05)",
          border: `3px solid ${state === "go" ? "var(--neon-green)" : state === "waiting" ? "var(--neon-orange)" : "var(--neon-cyan)"}`,
          boxShadow: state === "go" ? "0 0 40px var(--neon-green)" : state === "waiting" ? "0 0 20px var(--neon-orange)" : "0 0 20px var(--neon-cyan)",
          color: state === "go" ? "var(--neon-green)" : state === "waiting" ? "var(--neon-orange)" : "var(--neon-cyan)",
        }}
      >
        <span className="text-5xl">{state === "go" ? "⚡" : state === "waiting" ? "⏳" : "🎯"}</span>
        <span>{state === "go" ? "ЖМИ!" : state === "waiting" ? "Жди..." : state === "result" ? `${reactionTime}мс` : "СТАРТ"}</span>
        {state === "result" && <span className="font-mono text-xs opacity-60">нажми снова</span>}
      </button>
      {!currentUser && <p className="font-mono text-[10px] text-[rgba(255,255,255,0.3)]">Войдите, чтобы сохранять очки</p>}
    </div>
  );
}

// === MEMORY GAME ===
const CARDS_EMOJIS = ["🎮","🔥","⚡","💀","🐍","🤖","🌐","🎯"];

function MemoryGame({ onBack, onScore, currentUser }: { onBack: () => void; onScore: (s: number) => void; currentUser: User | null }) {
  const makeCards = () => [...CARDS_EMOJIS, ...CARDS_EMOJIS].map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false })).sort(() => Math.random()-0.5);
  const [cards, setCards] = useState(makeCards);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);

  const flip = (id: number) => {
    if (flipped.length === 2 || cards[id].flipped || cards[id].matched) return;
    const newFlipped = [...flipped, id];
    setCards(p => p.map((c, i) => i === id ? { ...c, flipped: true } : c));
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped;
      if (cards[a].emoji === cards[b].emoji) {
        setCards(p => p.map((c, i) => [a,b].includes(i) ? { ...c, matched: true } : c));
        setFlipped([]);
        const newCards = cards.map((c, i) => [a,b].includes(i) ? { ...c, matched: true } : c);
        if (newCards.every(c => c.matched)) { setDone(true); onScore(Math.max(0, 500 - moves * 20)); }
      } else {
        setTimeout(() => { setCards(p => p.map((c, i) => [a,b].includes(i) ? { ...c, flipped: false } : c)); setFlipped([]); }, 800);
      }
    }
  };

  const restart = () => { setCards(makeCards()); setFlipped([]); setMoves(0); setDone(false); };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-lg">
        <button onClick={onBack} className="flex items-center gap-2 font-mono text-xs text-[rgba(0,255,255,0.5)] hover:text-[var(--neon-cyan)] transition-colors"><Icon name="ArrowLeft" size={14} /> Назад</button>
        <div className="font-mono text-xs text-[rgba(0,255,255,0.5)]">Ходов: <span className="text-[var(--neon-cyan)] font-bold">{moves}</span></div>
      </div>
      {done && (
        <div className="panel rounded-lg p-4 text-center border-[var(--neon-green)] animate-fade-in-up" style={{ borderColor: "rgba(0,255,136,0.4)" }}>
          <div className="font-orbitron text-lg font-bold text-[var(--neon-green)] mb-2">ПОБЕДА!</div>
          <div className="font-mono text-sm text-[rgba(0,255,255,0.6)] mb-3">За {moves} ходов</div>
          <button onClick={restart} className="px-4 py-2 rounded font-orbitron text-xs font-bold tracking-widest" style={{ border: "1px solid var(--neon-green)", color: "var(--neon-green)", background: "rgba(0,255,136,0.08)" }}>СНОВА</button>
        </div>
      )}
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card, i) => (
          <button key={card.id} onClick={() => flip(i)}
            className="w-16 h-16 rounded text-3xl transition-all duration-200 flex items-center justify-center"
            style={{
              background: card.matched ? "rgba(0,255,136,0.1)" : card.flipped ? "rgba(0,255,255,0.1)" : "rgba(0,0,0,0.4)",
              border: card.matched ? "2px solid var(--neon-green)" : card.flipped ? "2px solid var(--neon-cyan)" : "2px solid rgba(255,255,255,0.1)",
              transform: card.flipped || card.matched ? "rotateY(0deg)" : "rotateY(90deg)",
            }}
          >
            {(card.flipped || card.matched) ? card.emoji : "?"}
          </button>
        ))}
      </div>
      {!currentUser && <p className="font-mono text-[10px] text-[rgba(255,255,255,0.3)]">Войдите, чтобы сохранять очки</p>}
    </div>
  );
}
