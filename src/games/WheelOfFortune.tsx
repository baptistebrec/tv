import { useState, useRef, useEffect } from "react";
import "./WheelOfFortune.css";
import { MYSTERY_WORDS, PHRASES } from "../data/dictionary";

type WheelSegment = number | "BANKRUPT";

const WHEEL_NORMAL: WheelSegment[] = [
  100, 200, 300, 500, 1000, 2500, 5000, 500,
];
const WHEEL_FINAL: WheelSegment[] = [
  500,
  1000,
  2500,
  5000,
  "BANKRUPT",
  2500,
  1000,
  500,
];


const TOTAL_ROUNDS = 4;
const VOWEL_COST = 200;
const VOWELS = new Set(["A", "E", "I", "O", "U"]);
const REVEAL_INTERVAL_MS = 2000;

const SIZE = 320;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 140;
const SEG_ANGLE = 360 / WHEEL_NORMAL.length;

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

function pickPhrases() {
  const shuffled = [...PHRASES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, TOTAL_ROUNDS);
}

function pickMysteryWords() {
  const shuffled = [...MYSTERY_WORDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, TOTAL_ROUNDS);
}

// ── Mystery word reveal sub-component ────────────────────────────────────────

type RevealPhaseProps = {
  word: string;
  theme: string;
  players: string[];
  onDone: (startingPlayer: number, won: boolean) => void;
};

function RevealPhase({ word, theme, players, onDone }: RevealPhaseProps) {
  const shuffledIndices = useRef<number[]>(
    [...Array(word.length).keys()].sort(() => Math.random() - 0.5),
  );
  const [revealedCount, setRevealedCount] = useState(0);
  const [buzzer, setBuzzer] = useState<number | null>(null); // player who buzzed
  const [input, setInput] = useState("");
  const [wrongGuessers, setWrongGuessers] = useState<Set<number>>(new Set());
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const revealedIndices = new Set(
    shuffledIndices.current.slice(0, revealedCount),
  );

  function startInterval() {
    intervalRef.current = setInterval(() => {
      setRevealedCount((r) => {
        if (r >= word.length) {
          clearInterval(intervalRef.current!);
          return r;
        }
        return r + 1;
      });
    }, REVEAL_INTERVAL_MS);
  }

  // Start interval on mount
  useEffect(() => {
    startInterval();
    return () => clearInterval(intervalRef.current!);
  }, [word]);

  function stopAndBuzz(playerIdx: number) {
    if (buzzer !== null || wrongGuessers.has(playerIdx)) return;
    clearInterval(intervalRef.current!);
    setBuzzer(playerIdx);
  }

  function confirm() {
    if (input.trim().toUpperCase() === word.toUpperCase()) {
      onDone(buzzer!, true);
    } else {
      setFeedbackMsg(`Wrong! ${players[buzzer!]} loses their chance.`);
      const newWrong = new Set(wrongGuessers);
      newWrong.add(buzzer!);
      setWrongGuessers(newWrong);
      setBuzzer(null);
      setInput("");

      // If all players are wrong, just pick player 0
      if (newWrong.size >= players.length) {
        setTimeout(() => onDone(0, false), 1200);
        return;
      }

      // Resume the interval
      startInterval();

      setTimeout(() => setFeedbackMsg(null), 1500);
    }
  }

  const displayLetters = word
    .split("")
    .map((c, i) => (revealedIndices.has(i) ? c : "_"));

  return (
    <div className="wof-reveal-root">
      <h2 className="wof-reveal-title">Who goes first?</h2>
      <p className="wof-reveal-subtitle">Guess the mystery word!</p>
      <div className="wof-theme-label">Theme: {theme}</div>

      <div className="wof-reveal-word">
        {displayLetters.map((c, i) => (
          <span key={i} className={`char ${c === "_" ? "blank" : ""}`}>
            {c === "_" ? "" : c}
          </span>
        ))}
      </div>

      {feedbackMsg && <div className="wof-reveal-feedback">{feedbackMsg}</div>}

      {buzzer !== null ? (
        <div className="wof-reveal-guess">
          <div className="wof-reveal-buzzer-label">
            {players[buzzer]}: type your answer
          </div>
          <input
            className="wof-guess-input"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirm()}
            placeholder="Type the word…"
          />
          <div className="wof-guess-actions">
            <button className="wof-guess-confirm" onClick={confirm}>
              Confirm
            </button>
            <button
              className="wof-guess-cancel"
              onClick={() => {
                setBuzzer(null);
                setInput("");
                startInterval();
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="wof-reveal-buzzers">
          {players.map((name, i) => (
            <button
              key={i}
              className="wof-buzzer-btn"
              onClick={() => stopAndBuzz(i)}
              disabled={wrongGuessers.has(i)}
            >
              {name}
              <span className="wof-buzzer-sub">Buzz!</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main game ─────────────────────────────────────────────────────────────────

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

  const [phrases] = useState(pickPhrases);
  const [mysteryWords] = useState(pickMysteryWords);
  const [round, setRound] = useState(1);
  const [revealPhase, setRevealPhase] = useState(true);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [spinning, setSpinning] = useState(false);
  const [currentValue, setCurrentValue] = useState<WheelSegment | null>(null);
  const [cagnotte, setCagnotte] = useState<number[]>(() =>
    PLAYERS.map(() => 0),
  );
  const [roundScores, setRoundScores] = useState<number[]>(() =>
    PLAYERS.map(() => 0),
  );
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [needsSpin, setNeedsSpin] = useState(true);
  const accumulated = useRef(0);
  const [rotation, setRotation] = useState(0);
  const [betweenRounds, setBetweenRounds] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isGuessing, setIsGuessing] = useState(false);
  const [guessInput, setGuessInput] = useState("");

  const isFinalRound = round === TOTAL_ROUNDS;
  const wheelValues = isFinalRound ? WHEEL_FINAL : WHEEL_NORMAL;
  const { text: phrase, theme } = phrases[round - 1];

  const words = phrase
    .split(" ")
    .map((word) => word.split("").map((c) => (guessed.has(c) ? c : "_")));

  function handleRevealDone(startingPlayer: number, won: boolean) {
    if (won) {
      setCagnotte((prev) => {
        const next = [...prev];
        next[startingPlayer] += 500;
        return next;
      });
    }
    setCurrentPlayer(startingPlayer);
    setRevealPhase(false);
  }

  function spin() {
    if (spinning || !needsSpin || betweenRounds || gameOver) return;
    setSpinning(true);
    setCurrentValue(null);

    const segIdx = Math.floor(Math.random() * wheelValues.length);
    const targetAngle = (360 - (segIdx * SEG_ANGLE + SEG_ANGLE / 2)) % 360;
    const currentMod = accumulated.current % 360;
    const extra = (targetAngle - currentMod + 360) % 360;
    const finalRotation = accumulated.current + 5 * 360 + extra;

    accumulated.current = finalRotation;
    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      const landed = wheelValues[segIdx];
      setCurrentValue(landed);

      if (landed === "BANKRUPT") {
        setCagnotte((prev) => {
          const next = [...prev];
          next[currentPlayer] = 0;
          return next;
        });
        setNeedsSpin(true);
        setCurrentPlayer((p) => (p + 1) % PLAYERS.length);
      } else {
        setNeedsSpin(false);
      }
    }, 3500);
  }

  function solveRound(winnerIdx: number, scores: number[]) {
    const newCagnotte = [...cagnotte];
    newCagnotte[winnerIdx] += scores[winnerIdx];
    setCagnotte(newCagnotte);
    if (round === TOTAL_ROUNDS) setGameOver(true);
    else setBetweenRounds(true);
  }

  function guessLetter(letter: string) {
    if (
      guessed.has(letter) ||
      spinning ||
      needsSpin ||
      currentValue === null ||
      currentValue === "BANKRUPT" ||
      betweenRounds ||
      gameOver
    )
      return;

    const newGuessed = new Set(guessed);
    newGuessed.add(letter);
    setGuessed(newGuessed);

    if (phrase.includes(letter)) {
      const count = Array.from(phrase).filter((c) => c === letter).length;
      const newRoundScores = [...roundScores];
      newRoundScores[currentPlayer] += count * (currentValue as number);
      setRoundScores(newRoundScores);

      if (phrase.split("").every((c) => c === " " || newGuessed.has(c))) {
        solveRound(currentPlayer, newRoundScores);
      } else {
        setCurrentValue(null);
        setNeedsSpin(true);
      }
    } else {
      setCurrentValue(null);
      setNeedsSpin(true);
      setCurrentPlayer((p) => (p + 1) % PLAYERS.length);
    }
  }

  function buyVowel(letter: string) {
    if (
      guessed.has(letter) ||
      spinning ||
      betweenRounds ||
      gameOver ||
      roundScores[currentPlayer] < VOWEL_COST
    )
      return;

    const newRoundScores = [...roundScores];
    newRoundScores[currentPlayer] -= VOWEL_COST;

    const newGuessed = new Set(guessed);
    newGuessed.add(letter);
    setGuessed(newGuessed);
    setCurrentValue(null);
    setNeedsSpin(true);

    if (phrase.includes(letter)) {
      setRoundScores(newRoundScores);
      if (phrase.split("").every((c) => c === " " || newGuessed.has(c))) {
        solveRound(currentPlayer, newRoundScores);
      }
    } else {
      setRoundScores(newRoundScores);
      setCurrentPlayer((p) => (p + 1) % PLAYERS.length);
    }
  }

  function guessPhrase() {
    if (guessInput.trim().toUpperCase() === phrase.trim().toUpperCase()) {
      setIsGuessing(false);
      setGuessInput("");
      solveRound(currentPlayer, roundScores);
    } else {
      setIsGuessing(false);
      setGuessInput("");
      setCurrentValue(null);
      setNeedsSpin(true);
      setCurrentPlayer((p) => (p + 1) % PLAYERS.length);
    }
  }

  function startNextRound() {
    setRound((r) => r + 1);
    setRevealPhase(true);
    setGuessed(new Set());
    setRoundScores(PLAYERS.map(() => 0));
    setCurrentValue(null);
    setNeedsSpin(true);
    setCurrentPlayer(0);
    setBetweenRounds(false);
    setRotation(0);
    accumulated.current = 0;
    setIsGuessing(false);
    setGuessInput("");
  }

  function reset() {
    setRound(1);
    setRevealPhase(true);
    setGuessed(new Set());
    setCagnotte(PLAYERS.map(() => 0));
    setRoundScores(PLAYERS.map(() => 0));
    setCurrentPlayer(0);
    setCurrentValue(null);
    setNeedsSpin(true);
    setRotation(0);
    accumulated.current = 0;
    setBetweenRounds(false);
    setGameOver(false);
    setIsGuessing(false);
    setGuessInput("");
  }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const unguessedConsonants = alphabet.filter(
    (l) => !guessed.has(l) && !VOWELS.has(l),
  );
  const unguessedVowels = alphabet.filter(
    (l) => !guessed.has(l) && VOWELS.has(l),
  );
  const canBuyVowel = roundScores[currentPlayer] >= VOWEL_COST;
  const winner = gameOver
    ? PLAYERS[cagnotte.indexOf(Math.max(...cagnotte))]
    : null;
  const segColors = wheelValues.map((v, i) =>
    v === "BANKRUPT" ? "#1e293b" : COLORS[i % COLORS.length],
  );

  // ── Reveal phase ────────────────────────────────────────────────────────────
  if (revealPhase) {
    return (
      <div className="wof-root">
        <button className="wof-back" onClick={onBack}>
          ← Back
        </button>
        <div className="wof-header">
          <h1 className="wof-title">🎡 Wheel of Fortune</h1>
          <div className={`wof-round-label ${isFinalRound ? "final" : ""}`}>
            {isFinalRound
              ? "🔥 FINAL ROUND"
              : `Round ${round} / ${TOTAL_ROUNDS}`}
          </div>
          <div className="wof-players">
            {PLAYERS.map((name, i) => (
              <div key={i} className="wof-player">
                <span className="wof-player-name">{name}</span>
                <span className="wof-player-score">${cagnotte[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <RevealPhase
          word={mysteryWords[round - 1].text}
          theme={mysteryWords[round - 1].theme}
          players={PLAYERS}
          onDone={handleRevealDone}
        />
      </div>
    );
  }

  // ── Main game ────────────────────────────────────────────────────────────────
  return (
    <div className="wof-root">
      <button className="wof-back" onClick={onBack}>
        ← Back
      </button>

      <div className="wof-header">
        <h1 className="wof-title">🎡 Wheel of Fortune</h1>
        <div className={`wof-round-label ${isFinalRound ? "final" : ""}`}>
          {isFinalRound ? "🔥 FINAL ROUND" : `Round ${round} / ${TOTAL_ROUNDS}`}
        </div>
        <div className="wof-players">
          {PLAYERS.map((name, i) => (
            <div
              key={i}
              className={`wof-player ${i === currentPlayer && !betweenRounds && !gameOver ? "active" : ""}`}
            >
              <span className="wof-player-name">{name}</span>
              <span className="wof-player-score">${cagnotte[i]}</span>
              {roundScores[i] > 0 && (
                <span className="wof-player-round-score">
                  +${roundScores[i]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="wof-phrase">
        <div className="wof-theme-label">Theme: {theme}</div>
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
            {wheelValues.map((val, i) => {
              const { x, y, rotate } = labelTransform(i);
              return (
                <g key={i}>
                  <path
                    d={segmentPath(i)}
                    fill={segColors[i]}
                    stroke="#0f172a"
                    strokeWidth={2}
                  />
                  <text
                    x={x}
                    y={y}
                    fill="#fff"
                    fontSize={val === "BANKRUPT" ? 8 : 11}
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${rotate}, ${x}, ${y})`}
                  >
                    {val === "BANKRUPT" ? "BANKRUPT" : `$${val}`}
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
            disabled={spinning || !needsSpin || betweenRounds || gameOver}
          >
            {spinning ? "Spinning…" : "SPIN"}
          </button>

          {currentValue !== null && currentValue !== "BANKRUPT" && (
            <div className="wof-prize">+${currentValue}</div>
          )}
          {currentValue === "BANKRUPT" && (
            <div className="wof-prize bankrupt">BANKRUPT!</div>
          )}

          <div className="wof-letters">
            {unguessedConsonants.map((letter) => (
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

          <div className="wof-vowels-section">
            <div className="wof-vowels-label">Buy a vowel — $200</div>
            <div className="wof-letters">
              {unguessedVowels.map((letter) => (
                <button
                  key={letter}
                  className="letter-btn vowel-btn"
                  onClick={() => buyVowel(letter)}
                  disabled={spinning || !canBuyVowel}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {isGuessing ? (
            <div className="wof-guess-form">
              <input
                className="wof-guess-input"
                autoFocus
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && guessPhrase()}
                placeholder="Type the phrase…"
              />
              <div className="wof-guess-actions">
                <button className="wof-guess-confirm" onClick={guessPhrase}>
                  Confirm
                </button>
                <button
                  className="wof-guess-cancel"
                  onClick={() => {
                    setIsGuessing(false);
                    setGuessInput("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="wof-solve-btn"
              onClick={() => setIsGuessing(true)}
              disabled={spinning || betweenRounds || gameOver}
            >
              Guess the phrase
            </button>
          )}
        </div>
      </div>

      {betweenRounds && (
        <div className="wof-modal">
          <div className="wof-modal-content">
            <div className="wof-modal-emoji">🎉</div>
            <h2>Round {round} Over!</h2>
            <div className="wof-modal-scores">
              {PLAYERS.map((name, i) => (
                <p key={i}>
                  {name}: ${cagnotte[i]}
                </p>
              ))}
            </div>
            <button className="wof-modal-btn" onClick={startNextRound}>
              {round + 1 === TOTAL_ROUNDS
                ? "🔥 Final Round!"
                : `Round ${round + 1} →`}
            </button>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="wof-modal">
          <div className="wof-modal-content">
            <div className="wof-modal-emoji">🏆</div>
            <h2>{winner} Wins!</h2>
            <div className="wof-modal-scores">
              {PLAYERS.map((name, i) => (
                <p key={i}>
                  {name}: ${cagnotte[i]}
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
