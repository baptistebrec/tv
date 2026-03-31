import { useState, useEffect, useRef, useCallback } from "react";
import { MYSTERY_WORDS } from "../data/dictionary";
import "./Pyramide.css";

const TIMER_SECONDS = 30;
const WORDS_PER_ROUND = 5;

type WordState = "pending" | "correct" | "eliminated";

interface GameWord {
  text: string;
  theme: string;
  state: WordState;
}

interface TeamRound {
  score: number;
  timeUsed: number;
  words: GameWord[];
}

// players[team][0 | 1]
// Round 1: players[team][0] hints → players[team][1] guesses
// Round 2: players[team][1] hints → players[team][0] guesses
type Phase = "setup" | "ready" | "playing" | "roundover" | "results";

function pickWords(): GameWord[] {
  return [...MYSTERY_WORDS]
    .sort(() => Math.random() - 0.5)
    .slice(0, WORDS_PER_ROUND)
    .map((w) => ({ text: w.text, theme: w.theme, state: "pending" }));
}

// Play order: R1-T0, R1-T1, R2-T0, R2-T1
const PLAY_ORDER = [
  { round: 1, team: 0 },
  { round: 1, team: 1 },
  { round: 2, team: 0 },
  { round: 2, team: 1 },
];

export function Pyramide({ onBack }: { onBack: () => void }) {
  const [players, setPlayers] = useState([
    ["Joueur A", "Joueur B"],
    ["Joueur C", "Joueur D"],
  ]);

  const [phase, setPhase] = useState<Phase>("setup");
  const [turnIdx, setTurnIdx] = useState(0); // index into PLAY_ORDER
  const { round: currentRound, team: currentTeam } = PLAY_ORDER[Math.min(turnIdx, PLAY_ORDER.length - 1)];

  const [words, setWords] = useState<GameWord[]>([]);
  const [queue, setQueue] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);

  // results[team][round-1]
  const [results, setResults] = useState<(TeamRound | null)[][]>([
    [null, null],
    [null, null],
  ]);

  const timerRef = useRef<number | null>(null);
  const roundEndedRef = useRef(false);
  const timeLeftRef = useRef(TIMER_SECONDS);
  const wordsRef = useRef<GameWord[]>([]);
  const currentTeamRef = useRef(0);
  const currentRoundRef = useRef(1);
  wordsRef.current = words;
  currentTeamRef.current = currentTeam;
  currentRoundRef.current = currentRound;

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        const next = t <= 1 ? 0 : t - 1;
        timeLeftRef.current = next;
        return next;
      });
    }, 1000);
    return stopTimer;
  }, [phase, stopTimer]);

  useEffect(() => {
    if (phase === "playing" && timeLeft === 0) endRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  function startPlaying() {
    const w = pickWords();
    roundEndedRef.current = false;
    timeLeftRef.current = TIMER_SECONDS;
    wordsRef.current = w;
    setWords(w);
    setQueue(w.map((_, i) => i));
    setTimeLeft(TIMER_SECONDS);
    setPhase("playing");
  }

  function endRound(finalWords?: GameWord[]) {
    if (roundEndedRef.current) return;
    roundEndedRef.current = true;
    stopTimer();
    const w = finalWords ?? wordsRef.current;
    const score = w.filter((x) => x.state === "correct").length;
    const timeUsed = TIMER_SECONDS - timeLeftRef.current;
    const ti = currentTeamRef.current;
    const ri = currentRoundRef.current - 1;
    setResults((prev) => {
      const next = prev.map((r) => [...r]);
      next[ti][ri] = { score, timeUsed, words: w };
      return next;
    });
    setPhase("roundover");
  }

  function handleCorrect() {
    if (queue.length === 0) return;
    const idx = queue[0];
    const newWords = words.map((w, i) =>
      i === idx ? { ...w, state: "correct" as WordState } : w
    );
    const newQueue = queue.slice(1);
    wordsRef.current = newWords;
    setWords(newWords);
    setQueue(newQueue);
    if (newQueue.length === 0) endRound(newWords);
  }

  function handlePass() {
    if (queue.length <= 1) return;
    setQueue((q) => [...q.slice(1), q[0]]);
  }

  function handleForbidden() {
    if (queue.length === 0) return;
    const idx = queue[0];
    const newWords = words.map((w, i) =>
      i === idx ? { ...w, state: "eliminated" as WordState } : w
    );
    const newQueue = queue.slice(1);
    wordsRef.current = newWords;
    setWords(newWords);
    setQueue(newQueue);
    if (newQueue.length === 0) endRound(newWords);
  }

  function afterRound() {
    const nextTurnIdx = turnIdx + 1;
    if (nextTurnIdx >= PLAY_ORDER.length) {
      setPhase("results");
    } else {
      setTurnIdx(nextTurnIdx);
      setPhase("ready");
    }
  }

  // Role: who hints and who guesses this turn
  function getRoles(team: number, round: number) {
    return round === 1
      ? { hinter: players[team][0], guesser: players[team][1] }
      : { hinter: players[team][1], guesser: players[team][0] };
  }

  const { hinter, guesser } = getRoles(currentTeam, currentRound);
  const currentWord = queue.length > 0 ? words[queue[0]] : null;
  const correctCount = words.filter((w) => w.state === "correct").length;
  const eliminatedCount = words.filter((w) => w.state === "eliminated").length;
  const pendingCount = queue.length;

  // ── SETUP ──────────────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="pyr-root">
        <button className="pyr-back" onClick={onBack}>← Retour</button>
        <div className="pyr-setup">
          <div className="pyr-logo">🔺</div>
          <h1 className="pyr-title">Pyramide</h1>
          {[0, 1].map((ti) => (
            <div key={ti} className="pyr-team-inputs">
              <div className="pyr-team-label">Équipe {ti + 1}</div>
              {[0, 1].map((pi) => (
                <input
                  key={pi}
                  className="pyr-input"
                  placeholder={`Joueur ${pi + 1}`}
                  value={players[ti][pi]}
                  onChange={(e) =>
                    setPlayers((prev) => {
                      const n = prev.map((t) => [...t]);
                      n[ti][pi] = e.target.value;
                      return n;
                    })
                  }
                />
              ))}
            </div>
          ))}
          <button
            className="pyr-btn pyr-btn--primary"
            onClick={() => { setTurnIdx(0); setPhase("ready"); }}
          >
            Commencer →
          </button>
        </div>
      </div>
    );
  }

  // ── READY ──────────────────────────────────────────────────────────────────
  if (phase === "ready") {
    const prevTurns = PLAY_ORDER.slice(0, turnIdx).filter((t) => t.team === currentTeam);
    const prevScore = prevTurns.reduce(
      (sum, t) => sum + (results[t.team][t.round - 1]?.score ?? 0),
      0
    );

    return (
      <div className="pyr-root">
        <div className="pyr-setup">
          <div className="pyr-round-label">Manche {currentRound} — Équipe {currentTeam + 1}</div>
          <div className="pyr-role-card">
            <div className="pyr-role">
              <span className="pyr-role-icon">🎤</span>
              <strong>{hinter}</strong>
              <span className="pyr-role-desc">donne les indices</span>
            </div>
            <div className="pyr-role-arrow">→</div>
            <div className="pyr-role">
              <span className="pyr-role-icon">🤔</span>
              <strong>{guesser}</strong>
              <span className="pyr-role-desc">devine</span>
            </div>
          </div>
          <div className="pyr-rules-mini">
            <p>⏱ 30 secondes · 5 mots</p>
            <p>Passer repasse le mot en fin de liste</p>
            <p>Interdit élimine définitivement le mot</p>
          </div>
          {prevTurns.length > 0 && (
            <div className="pyr-prev-score">
              Score actuel : <strong>{prevScore} pt{prevScore !== 1 ? "s" : ""}</strong>
            </div>
          )}
          <button className="pyr-btn pyr-btn--primary" onClick={startPlaying}>
            C'est parti !
          </button>
        </div>
      </div>
    );
  }

  // ── PLAYING ────────────────────────────────────────────────────────────────
  if (phase === "playing") {
    return (
      <div className="pyr-root">
        <div className="pyr-game">
          <div className="pyr-header">
            <div className="pyr-players-sm">
              <span>🎤 {hinter}</span>
              <span className="pyr-arrow-sm">→</span>
              <span>🤔 {guesser}</span>
            </div>
            <span className={`pyr-timer${timeLeft <= 10 ? " pyr-timer--urgent" : ""}`}>
              {timeLeft}s
            </span>
          </div>

          {currentWord ? (
            <div className="pyr-word-card">
              <div className="pyr-word-text">{currentWord.text}</div>
            </div>
          ) : (
            <div className="pyr-word-card pyr-word-card--done">
              Tous les mots sont résolus !
            </div>
          )}

          <div className="pyr-counters">
            <span className="pyr-counter pyr-counter--correct">✓ {correctCount}</span>
            <span className="pyr-counter pyr-counter--pending">⏳ {pendingCount}</span>
            <span className="pyr-counter pyr-counter--elim">🚫 {eliminatedCount}</span>
          </div>

          <div className="pyr-actions-3">
            <button
              className="pyr-btn pyr-btn--forbidden"
              onClick={handleForbidden}
              disabled={!currentWord}
            >
              🚫 Interdit
            </button>
            <button
              className="pyr-btn pyr-btn--pass"
              onClick={handlePass}
              disabled={!currentWord || pendingCount <= 1}
            >
              ⏭ Passer
            </button>
            <button
              className="pyr-btn pyr-btn--correct"
              onClick={handleCorrect}
              disabled={!currentWord}
            >
              ✓ Trouvé !
            </button>
          </div>

          <div className="pyr-word-dots">
            {words.map((w, i) => (
              <div
                key={i}
                className={`pyr-dot pyr-dot--${queue[0] === i ? "active" : w.state}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── ROUND OVER ─────────────────────────────────────────────────────────────
  if (phase === "roundover") {
    const r = results[currentTeam][currentRound - 1]!;
    const nextTurn = PLAY_ORDER[turnIdx + 1];
    const nextLabel = nextTurn
      ? `Manche ${nextTurn.round} — Équipe ${nextTurn.team + 1} →`
      : "Voir les résultats";

    return (
      <div className="pyr-root">
        <div className="pyr-roundover">
          <div className="pyr-round-label">Manche {currentRound} — Équipe {currentTeam + 1}</div>
          <div className="pyr-score-big">
            {r.score}<span className="pyr-score-denom">/5</span>
          </div>
          <div className="pyr-word-list">
            {r.words.map((w, i) => (
              <div key={i} className={`pyr-word-row pyr-word-row--${w.state}`}>
                <span className="pyr-word-row-icon">
                  {w.state === "correct" ? "✓" : w.state === "eliminated" ? "🚫" : "—"}
                </span>
                <span>{w.text}</span>
              </div>
            ))}
          </div>
          <button className="pyr-btn pyr-btn--primary" onClick={afterRound}>
            {nextLabel}
          </button>
        </div>
      </div>
    );
  }

  // ── RESULTS ────────────────────────────────────────────────────────────────
  const totals = [0, 1].map((ti) =>
    (results[ti][0]?.score ?? 0) + (results[ti][1]?.score ?? 0)
  );
  const totalTimes = [0, 1].map((ti) =>
    (results[ti][0]?.timeUsed ?? 0) + (results[ti][1]?.timeUsed ?? 0)
  );
  const winner =
    totals[0] !== totals[1]
      ? totals[0] > totals[1] ? 0 : 1
      : totalTimes[0] !== totalTimes[1]
      ? totalTimes[0] < totalTimes[1] ? 0 : 1
      : -1;

  return (
    <div className="pyr-root">
      <div className="pyr-final">
        <h1>Résultats finaux</h1>
        <div className="pyr-final-scores">
          {[0, 1].map((ti) => (
            <div
              key={ti}
              className={`pyr-final-team${winner === ti ? " pyr-final-team--winner" : ""}`}
            >
              {winner === ti && <div className="pyr-trophy">🏆</div>}
              <div className="pyr-final-name">Équipe {ti + 1}</div>
              <div className="pyr-final-score">{totals[ti]} pts</div>
              <div className="pyr-final-time">⏱ {totalTimes[ti]}s au total</div>
              <div className="pyr-final-breakdown">
                {[0, 1].map((ri) => {
                  const { hinter: h, guesser: g } = getRoles(ti, ri + 1);
                  const r = results[ti][ri];
                  return (
                    <div key={ri} className="pyr-final-row">
                      <span className="pyr-final-round">M{ri + 1}</span>
                      <span className="pyr-final-players">{h} → {g}</span>
                      <span className="pyr-final-pts">{r?.score ?? 0}pt</span>
                      <span className="pyr-final-rowtime">{r?.timeUsed ?? 0}s</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {winner === -1 && <div className="pyr-tie">Égalité parfaite ! 🤝</div>}
        {winner !== -1 && totals[0] === totals[1] && (
          <div className="pyr-tiebreak-note">Départagés au temps !</div>
        )}
        <button className="pyr-btn pyr-btn--primary" onClick={onBack}>
          Retour au menu
        </button>
      </div>
    </div>
  );
}
