import { useState } from "react";
import "./App.css";
import { FortuneWheel } from "./games/FortuneWheel";

const GAMES = [
  { id: "quiz", label: "Quiz", icon: "🧠", color: "#7c3aed" },
  { id: "word", label: "Word Scramble", icon: "🔤", color: "#0891b2" },
  { id: "memory", label: "Memory Match", icon: "🃏", color: "#b45309" },
  { id: "drawing", label: "Drawing", icon: "🎨", color: "#be185d" },
  { id: "buzzer", label: "Buzzer", icon: "🔔", color: "#15803d" },
  { id: "snake", label: "Snake", icon: "🐍", color: "#b91c1c" },
  { id: "wheel", label: "Fortune Wheel", icon: "🎡", color: "#d97706" },
];

function App() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  if (activeGame === "wheel") {
    return <FortuneWheel onBack={() => setActiveGame(null)} />;
  }

  if (activeGame) {
    const game = GAMES.find((g) => g.id === activeGame)!;
    return (
      <div className="hub-root">
        <div className="game-placeholder">
          <span className="game-placeholder-icon">{game.icon}</span>
          <h1>{game.label}</h1>
          <p>Coming soon…</p>
          <button className="back-btn" onClick={() => setActiveGame(null)}>
            ← Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hub-root">
      <header className="hub-header">
        <h1 className="hub-title">📺 TV Games</h1>
      </header>

      <main className="hub-grid">
        {GAMES.map((game) => (
          <button
            key={game.id}
            className="game-card"
            style={{ "--card-color": game.color } as React.CSSProperties}
            onClick={() => setActiveGame(game.id)}
          >
            <span className="game-card-icon">{game.icon}</span>
            <span className="game-card-label">{game.label}</span>
          </button>
        ))}
      </main>
    </div>
  );
}

export default App;
