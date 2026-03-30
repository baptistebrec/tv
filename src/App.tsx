import { useState } from "react";
import "./App.css";
import { WheelOfFortune } from "./games/WheelOfFortune";
import DealOrNoDeal from "./games/DealOrNoDeal";

const GAMES = [
  { id: "quiz", label: "Quiz", icon: "🧠", color: "#7c3aed" },
  { id: "memory", label: "Memory Match", icon: "🃏", color: "#b45309" },
  { id: "drawing", label: "Drawing", icon: "🎨", color: "#be185d" },
  { id: "snake", label: "Snake", icon: "🐍", color: "#b91c1c" },
  { id: "wheel", label: "La Roue de la Fortune", icon: "🎡", color: "#0891b2" },
  { id: "dond", label: "À prendre ou à laisser", icon: "💼", color: "#15803d" },
];

function App() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [wheelPlayers, setWheelPlayers] = useState<number | null>(null);

  if (activeGame === "dond") {
    return <DealOrNoDeal onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === "wheel" && wheelPlayers) {
    return (
      <WheelOfFortune
        playerCount={wheelPlayers}
        onBack={() => {
          setActiveGame(null);
          setWheelPlayers(null);
        }}
      />
    );
  }

  if (activeGame === "wheel") {
    return (
      <div className="hub-root">
        <div className="game-placeholder">
          <span className="game-placeholder-icon">🎡</span>
          <h1>La Roue de la Fortune</h1>
          <p>Combien de joueurs ?</p>
          <div className="player-count-picker">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                className="player-count-btn"
                onClick={() => setWheelPlayers(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <button className="back-btn" onClick={() => setActiveGame(null)}>
            ← Back to Hub
          </button>
        </div>
      </div>
    );
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
