import { useState, useRef } from "react";
import "./WheelOfFortune.css";

const WHEEL_VALUES = [100, 200, 300, 500, 1000, 2500, 5000, 500];
const PHRASES = [
  // "HELLO WORLD",
  "CODING IS FUN",
  // "WHEEL OF FORTUNE",
  // "JAVASCRIPT ROCKS",
  // "SPIN THE WHEEL",
  // "LUCKY GUESS",
  // "GAME OVER",
  // "YOU WIN",
];

const SIZE = 320;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 140;
const SEG_ANGLE = 360 / WHEEL_VALUES.length;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function segmentPath(i: number): string {
  const startDeg = i * SEG_ANGLE - 90;
  const endDeg = startDeg + SEG_ANGLE;
  const x1 = CX + R * Math.cos(toRad(startDeg));
  const y1 = CY + R * Math.sin(toRad(startDeg));
  const x2 = CX + R * Math.cos(toRad(endDeg));
  const y2 = CY + R * Math.sin(toRad(endDeg));
  const largeArc = SEG_ANGLE > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

function labelTransform(i: number) {
  const midDeg = i * SEG_ANGLE - 90 + SEG_ANGLE / 2;
  const dist = R * 0.68;
  const x = CX + dist * Math.cos(toRad(midDeg));
  const y = CY + dist * Math.sin(toRad(midDeg));
  return { x, y, rotate: midDeg + 90 };
}

const COLORS = [
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#0891b2",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
];

export function WheelOfFortune({
  playerCount,
  onBack,
}: {
  playerCount: number;
  onBack: () => void;
}) {
  const PLAYERS = Array.from(
    { length: playerCount },
    (_, i) => `Player ${i + 1}`,
  );
  const [phrase] = useState(
    () => PHRASES[Math.floor(Math.random() * PHRASES.length)],
  );
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [spinning, setSpinning] = useState(false);
  const [currentValue, setCurrentValue] = useState(0);
  const [scores, setScores] = useState<number[]>(PLAYERS.map(() => 0));
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [needsSpin, setNeedsSpin] = useState(true);
  const accumulated = useRef(0);
  const [rotation, setRotation] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const words = phrase
    .split(" ")
    .map((word) => word.split("").map((c) => (guessed.has(c) ? c : "_")));

  function spin() {
    if (spinning || !needsSpin || gameWon) return;
    setSpinning(true);
    setCurrentValue(0);

    const segIdx = Math.floor(Math.random() * WHEEL_VALUES.length);
    const targetAngle = (360 - (segIdx * SEG_ANGLE + SEG_ANGLE / 2)) % 360;
    const currentMod = accumulated.current % 360;
    const extra = (targetAngle - currentMod + 360) % 360;
    const finalRotation = accumulated.current + 5 * 360 + extra;

    accumulated.current = finalRotation;
    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      setCurrentValue(WHEEL_VALUES[segIdx]);
      setNeedsSpin(false);
    }, 3500);
  }

  function guessLetter(letter: string) {
    if (guessed.has(letter) || spinning || needsSpin || gameWon) return;

    const newGuessed = new Set(guessed);
    newGuessed.add(letter);
    setGuessed(newGuessed);

    if (phrase.includes(letter)) {
      const count = Array.from(phrase).filter((c) => c === letter).length;
      const newScores = [...scores];
      newScores[currentPlayer] += count * currentValue;
      setScores(newScores);

      if (phrase.split("").every((c) => c === " " || newGuessed.has(c))) {
        setGameWon(true);
      } else {
        // correct guess → player spins again
        setCurrentValue(0);
        setNeedsSpin(true);
      }
    } else {
      // wrong guess → next player's turn
      setCurrentValue(0);
      setNeedsSpin(true);
      setCurrentPlayer((p) => (p + 1) % PLAYERS.length);
    }
  }

  function reset() {
    setGuessed(new Set());
    setScores(PLAYERS.map(() => 0));
    setCurrentPlayer(0);
    setCurrentValue(0);
    setNeedsSpin(true);
    setRotation(0);
    accumulated.current = 0;
    setGameWon(false);
  }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const unguessed = alphabet.filter((l) => !guessed.has(l));
  const winner = gameWon ? PLAYERS[currentPlayer] : null;

  return (
    <div className="wof-root">
      <button className="wof-back" onClick={onBack}>
        ← Back
      </button>

      <div className="wof-header">
        <h1 className="wof-title">🎡 Wheel of Fortune</h1>
        <div className="wof-players">
          {PLAYERS.map((name, i) => (
            <div
              key={i}
              className={`wof-player ${i === currentPlayer && !gameWon ? "active" : ""}`}
            >
              <span className="wof-player-name">{name}</span>
              <span className="wof-player-score">${scores[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="wof-phrase">
        <div className="wof-phrase-text">
          {words.flatMap((letters, wi) => [
            ...(wi > 0
              ? [<span key={`sep-${wi}`} className="word-sep" />]
              : []),
            <span key={`word-${wi}`} className="word-group">
              {letters.map((c, ci) => (
                <span key={ci} className={`char ${c === "_" ? "blank" : ""}`}>
                  {c === "_" ? "" : c}
                </span>
              ))}
            </span>,
          ])}
        </div>
      </div>

      <div className="wof-game">
        <div className="wof-wheel-wrap">
          <div className="wof-pointer" />
          <svg
            className="wof-wheel"
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {WHEEL_VALUES.map((val, i) => {
              const { x, y, rotate } = labelTransform(i);
              return (
                <g key={i}>
                  <path
                    d={segmentPath(i)}
                    fill={COLORS[i]}
                    stroke="#0f172a"
                    strokeWidth={2}
                  />
                  <text
                    x={x}
                    y={y}
                    fill="#fff"
                    fontSize={11}
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${rotate}, ${x}, ${y})`}
                  >
                    ${val}
                  </text>
                </g>
              );
            })}
            <circle
              cx={CX}
              cy={CY}
              r={18}
              fill="#0f172a"
              stroke="#64748b"
              strokeWidth={3}
            />
          </svg>
        </div>

        <div className="wof-controls">
          <div className="wof-turn-label">
            {spinning
              ? "Spinning…"
              : needsSpin
                ? `${PLAYERS[currentPlayer]}: Spin the wheel!`
                : `${PLAYERS[currentPlayer]}: Choose a letter!`}
          </div>

          <button
            className="wof-spin-btn"
            onClick={spin}
            disabled={spinning || !needsSpin || gameWon}
          >
            {spinning ? "Spinning…" : "SPIN"}
          </button>

          {currentValue > 0 && (
            <div className="wof-prize">+${currentValue}</div>
          )}

          <div className="wof-letters">
            {unguessed.map((letter) => (
              <button
                key={letter}
                className="letter-btn"
                onClick={() => guessLetter(letter)}
                disabled={spinning || needsSpin}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {gameWon && (
        <div className="wof-modal">
          <div className="wof-modal-content">
            <div className="wof-modal-emoji">🎉</div>
            <h2>{winner} Won!</h2>
            <div className="wof-modal-scores">
              {PLAYERS.map((name, i) => (
                <p key={i}>
                  {name}: ${scores[i]}
                </p>
              ))}
            </div>
            <button className="wof-modal-btn" onClick={reset}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
