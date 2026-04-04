import { useState, useEffect, useRef, useCallback } from "react";
import { MYSTERY_WORDS } from "../data/dictionary";
import "./Pyramide.css";

const TIMER_SECONDS = 30;
const WORDS_PER_ROUND = 5;
const FINALE_TIMER_SECONDS = 90;
const TEAM_COLORS = ["#3b82f6", "#f97316"] as const; // blue, orange

type WordState = "pending" | "correct" | "eliminated" | "failed";

interface GameWord {
  text: string;
  theme: string;
  state: WordState;
  scoredByTeam?: number; // R3 only: which team got the point
}

interface TeamRound {
  score: number;
  timeUsed: number;
  words: GameWord[];
}

// Round 3: verbal auction resolved by host, then input here
type R3SubPhase = "bidding" | "guessing" | "word_result";

interface R3State {
  words: GameWord[];
  wordIdx: number;
  wordInitiator: number; // team that opens bidding for current word
  subPhase: R3SubPhase;
  guessingTeam: number;
  hintsLeft: number;
  scores: [number, number];
  lastWordCorrect: boolean | null;
}

// Round 4: same as round 3 but with swapped roles (player[1] hints, player[0] guesses)
type R4SubPhase = "bidding" | "guessing" | "word_result";

interface R4State {
  words: GameWord[];
  wordIdx: number;
  wordInitiator: number; // team that opens bidding for current word
  subPhase: R4SubPhase;
  guessingTeam: number;
  hintsLeft: number;
  scores: [number, number];
  lastWordCorrect: boolean | null;
}

// ── Finale ───────────────────────────────────────────────────────────────────

const FINALE_LEVELS = [
  { level: 1, prize: 100, wordCount: 9 },
  { level: 2, prize: 200, wordCount: 8 },
  { level: 3, prize: 500, wordCount: 7 },
  { level: 4, prize: 1000, wordCount: 6 },
  { level: 5, prize: 2000, wordCount: 5 },
] as const;

const FINALE_HINTS_PER_WORD = 3;
const FINALE_WORDS_NEEDED = 5;
const FINALE_SAFETY_LEVEL = 2;

type FinaleWordStatus = "pending" | "correct" | "eliminated";

interface FinaleWord {
  text: string;
  theme: string;
  status: FinaleWordStatus;
}

interface FinaleState {
  winnerTeam: number;
  level: number;
  words: FinaleWord[];
  currentWordIdx: number;
  foundCount: number;
  hintsLeft: number;
  safetyNetAmount: number;
  wonAmount: number;
  endReason: "stopped" | "failed" | "grand_win" | null;
}

type Phase =
  | "setup"
  | "ready"
  | "playing"
  | "roundover"
  | "round3_ready"
  | "round3"
  | "round4_ready"
  | "round4"
  | "results"
  | "finale_intro"
  | "finale_playing"
  | "finale_level_success"
  | "finale_end";

function pickWords(): GameWord[] {
  return [...MYSTERY_WORDS]
    .sort(() => Math.random() - 0.5)
    .slice(0, WORDS_PER_ROUND)
    .map((w) => ({
      text: w.text,
      theme: w.theme,
      state: "pending" as WordState,
    }));
}

// Play order for rounds 1 & 2: R1-T0, R1-T1, R2-T0, R2-T1
const PLAY_ORDER = [
  { round: 1, team: 0 },
  { round: 1, team: 1 },
  { round: 2, team: 0 },
  { round: 2, team: 1 },
];

function BiddingView({
  wordText,
  wordIdx,
  wordInitiator,
  players,
  scoreDots,
  onConfirm,
}: {
  wordText: string;
  wordIdx: number;
  wordInitiator: number;
  players: string[][];
  scoreDots: React.ReactNode;
  onConfirm: (team: number, hints: number) => void;
}) {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedHints, setSelectedHints] = useState<number | null>(null);

  return (
    <div className="pyr-root">
      <div className="pyr-game">
        <div className="pyr-round-label">Manche 3 — Mot {wordIdx + 1}/5</div>
        <div className="pyr-r3-turn">
          Équipe {wordInitiator + 1} ouvre les enchères
        </div>
        <div className="pyr-word-card">
          <div className="pyr-word-text">{wordText}</div>
        </div>

        <div className="pyr-bid-section-label">Quelle équipe joue ?</div>
        <div className="pyr-bid-team-btns">
          {[0, 1].map((ti) => (
            <button
              key={ti}
              className={`pyr-bid-team-btn${selectedTeam === ti ? " pyr-bid-team-btn--selected" : ""}`}
              style={{
                borderColor: selectedTeam === ti ? TEAM_COLORS[ti] : undefined,
              }}
              onClick={() => setSelectedTeam(ti)}
            >
              <span
                className="pyr-bid-team-name"
                style={{ color: TEAM_COLORS[ti] }}
              >
                Équipe {ti + 1}
              </span>
              <span className="pyr-bid-team-players">
                {players[ti][0]} → {players[ti][1]}
              </span>
            </button>
          ))}
        </div>

        <div className="pyr-bid-section-label">Nombre d'indices ?</div>
        <div className="pyr-bid-buttons">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={`pyr-bid-btn${selectedHints === n ? " pyr-bid-btn--selected" : ""}`}
              onClick={() => setSelectedHints(n)}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          className="pyr-btn pyr-btn--primary"
          disabled={selectedTeam === null || selectedHints === null}
          onClick={() => onConfirm(selectedTeam!, selectedHints!)}
        >
          C'est parti !
        </button>

        {scoreDots}
      </div>
    </div>
  );
}

export function Pyramide({ onBack }: { onBack: () => void }) {
  const [players, setPlayers] = useState([
    ["Joueur A", "Joueur B"],
    ["Joueur C", "Joueur D"],
  ]);

  const [phase, setPhase] = useState<Phase>("setup");
  const [turnIdx, setTurnIdx] = useState(0);
  const { round: currentRound, team: currentTeam } =
    PLAY_ORDER[Math.min(turnIdx, PLAY_ORDER.length - 1)];

  const [words, setWords] = useState<GameWord[]>([]);
  const [queue, setQueue] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);

  const [results, setResults] = useState<(TeamRound | null)[][]>([
    [null, null],
    [null, null],
  ]);

  const [r3, setR3] = useState<R3State | null>(null);
  const [r4, setR4] = useState<R4State | null>(null);
  const [finaleState, setFinaleState] = useState<FinaleState | null>(null);

  const [finaleTimeLeft, setFinaleTimeLeft] = useState(FINALE_TIMER_SECONDS);

  const timerRef = useRef<number | null>(null);
  const finaleTimerRef = useRef<number | null>(null);
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

  const stopFinaleTimer = useCallback(() => {
    if (finaleTimerRef.current) {
      clearInterval(finaleTimerRef.current);
      finaleTimerRef.current = null;
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

  useEffect(() => {
    if (phase !== "finale_playing") return;
    setFinaleTimeLeft(FINALE_TIMER_SECONDS);
    finaleTimerRef.current = window.setInterval(() => {
      setFinaleTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return stopFinaleTimer;
  }, [phase, stopFinaleTimer]);

  useEffect(() => {
    if (phase !== "finale_playing" || finaleTimeLeft > 0) return;
    stopFinaleTimer();
    setFinaleState((prev) =>
      prev
        ? { ...prev, wonAmount: prev.safetyNetAmount, endReason: "failed" }
        : prev,
    );
    setPhase("finale_end");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finaleTimeLeft]);

  // ── Rounds 1 & 2 logic ────────────────────────────────────────────────────

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
      i === idx ? { ...w, state: "correct" as WordState } : w,
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
      i === idx ? { ...w, state: "eliminated" as WordState } : w,
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
      setPhase("round3_ready");
    } else {
      setTurnIdx(nextTurnIdx);
      setPhase("ready");
    }
  }

  // ── Round 3 logic ──────────────────────────────────────────────────────────

  function getR3StartTeam(res: (TeamRound | null)[][]): number {
    const s0 = (res[0][0]?.score ?? 0) + (res[0][1]?.score ?? 0);
    const s1 = (res[1][0]?.score ?? 0) + (res[1][1]?.score ?? 0);
    if (s0 !== s1) return s0 > s1 ? 0 : 1;
    const t0 = (res[0][0]?.timeUsed ?? 0) + (res[0][1]?.timeUsed ?? 0);
    const t1 = (res[1][0]?.timeUsed ?? 0) + (res[1][1]?.timeUsed ?? 0);
    if (t0 !== t1) return t0 < t1 ? 0 : 1;
    return 0;
  }

  function initRound3(res: (TeamRound | null)[][]) {
    const startTeam = getR3StartTeam(res);
    setR3({
      words: pickWords(),
      wordIdx: 0,
      wordInitiator: startTeam,
      subPhase: "bidding",
      guessingTeam: startTeam,
      hintsLeft: 0,
      scores: [0, 0],
      lastWordCorrect: null,
    });
    setPhase("round3");
  }

  function r3Confirm(team: number, hints: number) {
    if (!r3) return;
    setR3({
      ...r3,
      guessingTeam: team,
      hintsLeft: hints,
      subPhase: "guessing",
    });
  }

  function r3HintGiven() {
    if (!r3 || r3.hintsLeft <= 0) return;
    setR3({ ...r3, hintsLeft: r3.hintsLeft - 1 });
  }

  function r3WordResult(correct: boolean) {
    if (!r3) return;
    const pointTeam = correct ? r3.guessingTeam : 1 - r3.guessingTeam;
    const newScores: [number, number] = [...r3.scores] as [number, number];
    newScores[pointTeam]++;
    const newWords = r3.words.map((w, i) =>
      i === r3.wordIdx
        ? {
            ...w,
            state: (correct ? "correct" : "failed") as WordState,
            scoredByTeam: pointTeam,
          }
        : w,
    );
    setR3({
      ...r3,
      words: newWords,
      scores: newScores,
      lastWordCorrect: correct,
      subPhase: "word_result",
    });
  }

  function r3NextWord() {
    if (!r3) return;
    const nextIdx = r3.wordIdx + 1;
    if (nextIdx >= WORDS_PER_ROUND) {
      setPhase("round4_ready");
      return;
    }
    const nextInit = 1 - r3.wordInitiator;
    setR3({
      ...r3,
      wordIdx: nextIdx,
      wordInitiator: nextInit,
      subPhase: "bidding",
      guessingTeam: nextInit,
      hintsLeft: 0,
      lastWordCorrect: null,
    });
  }

  // ── Round 4 logic ──────────────────────────────────────────────────────────────

  function initRound4() {
    if (!r3) return;
    const startTeam = 1 - r3.wordInitiator; // Opposite of the team that started R3
    setR4({
      words: pickWords(),
      wordIdx: 0,
      wordInitiator: startTeam,
      subPhase: "bidding",
      guessingTeam: startTeam,
      hintsLeft: 0,
      scores: [0, 0],
      lastWordCorrect: null,
    });
    setPhase("round4");
  }

  function r4Confirm(team: number, hints: number) {
    if (!r4) return;
    setR4({
      ...r4,
      guessingTeam: team,
      hintsLeft: hints,
      subPhase: "guessing",
    });
  }

  function r4HintGiven() {
    if (!r4 || r4.hintsLeft <= 0) return;
    setR4({ ...r4, hintsLeft: r4.hintsLeft - 1 });
  }

  function r4WordResult(correct: boolean) {
    if (!r4) return;
    const pointTeam = correct ? r4.guessingTeam : 1 - r4.guessingTeam;
    const newScores: [number, number] = [...r4.scores] as [number, number];
    newScores[pointTeam]++;
    const newWords = r4.words.map((w, i) =>
      i === r4.wordIdx
        ? {
            ...w,
            state: (correct ? "correct" : "failed") as WordState,
            scoredByTeam: pointTeam,
          }
        : w,
    );
    setR4({
      ...r4,
      words: newWords,
      scores: newScores,
      lastWordCorrect: correct,
      subPhase: "word_result",
    });
  }

  function r4NextWord() {
    if (!r4) return;
    const nextIdx = r4.wordIdx + 1;
    if (nextIdx >= WORDS_PER_ROUND) {
      setPhase("results");
      return;
    }
    const nextInit = 1 - r4.wordInitiator;
    setR4({
      ...r4,
      wordIdx: nextIdx,
      wordInitiator: nextInit,
      subPhase: "bidding",
      guessingTeam: nextInit,
      hintsLeft: 0,
      lastWordCorrect: null,
    });
  }

  // ── Finale logic ──────────────────────────────────────────────────────────

  function pickFinaleWords(n: number): FinaleWord[] {
    return [...MYSTERY_WORDS]
      .sort(() => Math.random() - 0.5)
      .slice(0, n)
      .map((w) => ({
        text: w.text,
        theme: w.theme,
        status: "pending" as FinaleWordStatus,
      }));
  }

  function startFinale(winnerTeam: number) {
    const cfg = FINALE_LEVELS[0];
    setFinaleState({
      winnerTeam,
      level: 1,
      words: pickFinaleWords(cfg.wordCount),
      currentWordIdx: 0,
      foundCount: 0,
      hintsLeft: FINALE_HINTS_PER_WORD,
      safetyNetAmount: 0,
      wonAmount: cfg.prize,
      endReason: null,
    });
    setPhase("finale_intro");
  }

  function finaleHintGiven() {
    if (!finaleState || finaleState.hintsLeft <= 0) return;
    setFinaleState({ ...finaleState, hintsLeft: finaleState.hintsLeft - 1 });
  }

  function finaleWordResolved(correct: boolean) {
    if (!finaleState) return;
    const newWords = finaleState.words.map((w, i) =>
      i === finaleState.currentWordIdx
        ? {
            ...w,
            status: (correct ? "correct" : "eliminated") as FinaleWordStatus,
          }
        : w,
    );
    const newFoundCount = correct
      ? finaleState.foundCount + 1
      : finaleState.foundCount;
    const remainingPending = newWords.filter(
      (w) => w.status === "pending",
    ).length;

    if (newFoundCount >= FINALE_WORDS_NEEDED) {
      stopFinaleTimer();
      const newSafetyNet =
        finaleState.level === FINALE_SAFETY_LEVEL
          ? FINALE_LEVELS[FINALE_SAFETY_LEVEL - 1].prize
          : finaleState.safetyNetAmount;
      setFinaleState({
        ...finaleState,
        words: newWords,
        foundCount: newFoundCount,
        safetyNetAmount: newSafetyNet,
      });
      setPhase("finale_level_success");
      return;
    }

    if (newFoundCount + remainingPending < FINALE_WORDS_NEEDED) {
      stopFinaleTimer();
      setFinaleState({
        ...finaleState,
        words: newWords,
        foundCount: newFoundCount,
        wonAmount: finaleState.safetyNetAmount,
        endReason: "failed",
      });
      setPhase("finale_end");
      return;
    }

    const nextIdx = newWords.findIndex(
      (w, i) => i > finaleState.currentWordIdx && w.status === "pending",
    );
    setFinaleState({
      ...finaleState,
      words: newWords,
      foundCount: newFoundCount,
      currentWordIdx: nextIdx >= 0 ? nextIdx : finaleState.currentWordIdx + 1,
      hintsLeft: FINALE_HINTS_PER_WORD,
    });
  }

  function finaleStop() {
    if (!finaleState) return;
    const isGrandWin = finaleState.level === 5;
    setFinaleState({
      ...finaleState,
      endReason: isGrandWin ? "grand_win" : "stopped",
    });
    setPhase("finale_end");
  }

  function finaleContinue() {
    if (!finaleState) return;
    const nextLevel = finaleState.level + 1;
    const cfg = FINALE_LEVELS.find((l) => l.level === nextLevel)!;
    setFinaleState({
      ...finaleState,
      level: nextLevel,
      words: pickFinaleWords(cfg.wordCount),
      currentWordIdx: 0,
      foundCount: 0,
      hintsLeft: FINALE_HINTS_PER_WORD,
      wonAmount: cfg.prize,
      endReason: null,
    });
    setPhase("finale_playing");
  }

  // Round 1: player[0] hints, player[1] guesses
  // Round 2: player[1] hints, player[0] guesses
  // Round 3: player[0] hints, player[1] guesses (same as R1)
  // Round 4: player[1] hints, player[0] guesses (same as R2)
  function getRoles(team: number, round: number) {
    return round === 2 || round === 4
      ? { hinter: players[team][1], guesser: players[team][0] }
      : { hinter: players[team][0], guesser: players[team][1] };
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
        <button className="pyr-back" onClick={onBack}>
          ← Retour
        </button>
        <div className="pyr-setup">
          <div className="pyr-logo">🔺</div>
          <h1 className="pyr-title">Pyramide</h1>
          {[0, 1].map((ti) => (
            <div
              key={ti}
              className="pyr-team-inputs"
              style={{ borderColor: TEAM_COLORS[ti] }}
            >
              <div
                className="pyr-team-label"
                style={{ color: TEAM_COLORS[ti] }}
              >
                Équipe {ti + 1}
              </div>
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
            onClick={() => {
              setTurnIdx(0);
              setPhase("ready");
            }}
          >
            Commencer →
          </button>
        </div>
      </div>
    );
  }

  // ── READY ──────────────────────────────────────────────────────────────────
  if (phase === "ready") {
    const prevTurns = PLAY_ORDER.slice(0, turnIdx).filter(
      (t) => t.team === currentTeam,
    );
    const prevScore = prevTurns.reduce(
      (sum, t) => sum + (results[t.team][t.round - 1]?.score ?? 0),
      0,
    );

    return (
      <div className="pyr-root">
        <div className="pyr-setup">
          <div
            className="pyr-round-label"
            style={{ color: TEAM_COLORS[currentTeam] }}
          >
            Manche {currentRound} — Équipe {currentTeam + 1}
          </div>
          <div
            className="pyr-role-card"
            style={{ borderColor: TEAM_COLORS[currentTeam] }}
          >
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
              Score actuel :{" "}
              <strong>
                {prevScore} pt{prevScore !== 1 ? "s" : ""}
              </strong>
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
            <span
              className={`pyr-timer${timeLeft <= 10 ? " pyr-timer--urgent" : ""}`}
            >
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
            <span className="pyr-counter pyr-counter--correct">
              ✓ {correctCount}
            </span>
            <span className="pyr-counter pyr-counter--pending">
              ⏳ {pendingCount}
            </span>
            <span className="pyr-counter pyr-counter--elim">
              🚫 {eliminatedCount}
            </span>
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
      : "Manche 3 →";

    return (
      <div className="pyr-root">
        <div className="pyr-roundover">
          <div
            className="pyr-round-label"
            style={{ color: TEAM_COLORS[currentTeam] }}
          >
            Manche {currentRound} — Équipe {currentTeam + 1}
          </div>
          <div className="pyr-score-big">
            {r.score}
            <span className="pyr-score-denom">/5</span>
          </div>
          <div className="pyr-word-list">
            {r.words.map((w, i) => (
              <div key={i} className={`pyr-word-row pyr-word-row--${w.state}`}>
                <span className="pyr-word-row-icon">
                  {w.state === "correct"
                    ? "✓"
                    : w.state === "eliminated"
                      ? "🚫"
                      : "—"}
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

  // ── ROUND 3 READY ──────────────────────────────────────────────────────────
  if (phase === "round3_ready") {
    const startTeam = getR3StartTeam(results);
    const scores12 = [0, 1].map(
      (ti) => (results[ti][0]?.score ?? 0) + (results[ti][1]?.score ?? 0),
    );
    const times12 = [0, 1].map(
      (ti) => (results[ti][0]?.timeUsed ?? 0) + (results[ti][1]?.timeUsed ?? 0),
    );
    const tied = scores12[0] === scores12[1];
    const startReason = tied
      ? times12[0] === times12[1]
        ? "Équipe 1 commence (égalité parfaite)"
        : `Commence car moins de temps utilisé (${times12[startTeam]}s)`
      : `Commence car meilleur score`;

    return (
      <div className="pyr-root">
        <div className="pyr-setup">
          <div className="pyr-round-label">Manche 3 — Enchères</div>
          <div className="pyr-scores-recap">
            {[0, 1].map((ti) => (
              <div
                key={ti}
                className={`pyr-recap-team${ti === startTeam ? " pyr-recap-team--start" : ""}`}
                style={{ borderColor: TEAM_COLORS[ti] }}
              >
                <div
                  className="pyr-recap-name"
                  style={{ color: TEAM_COLORS[ti] }}
                >
                  Équipe {ti + 1}
                </div>
                <div className="pyr-recap-score">{scores12[ti]} pts</div>
                <div className="pyr-recap-time">⏱ {times12[ti]}s</div>
              </div>
            ))}
          </div>
          <div className="pyr-start-badge">
            Équipe {startTeam + 1} ouvre les enchères
            <div className="pyr-start-reason">{startReason}</div>
          </div>
          <div className="pyr-role-card">
            {[0, 1].map((ti) => (
              <div key={ti} className="pyr-role">
                <span className="pyr-role-icon">🎤</span>
                <strong>{players[ti][0]}</strong>
                <span className="pyr-role-desc">enchérit · indice</span>
                <span className="pyr-role-icon" style={{ marginTop: "0.5rem" }}>
                  🤔
                </span>
                <strong>{players[ti][1]}</strong>
                <span className="pyr-role-desc">devine</span>
              </div>
            ))}
          </div>
          <div className="pyr-rules-mini">
            <p>Le mot est révélé aux deux hinteurs</p>
            <p>L'équipe qui ouvre annonce N indices</p>
            <p>L'autre peut descendre ou laisser jouer</p>
            <p>L'équipe qui a le dernier mot doit deviner</p>
          </div>
          <button
            className="pyr-btn pyr-btn--primary"
            onClick={() => initRound3(results)}
          >
            C'est parti !
          </button>
        </div>
      </div>
    );
  }

  // ── ROUND 3 ────────────────────────────────────────────────────────────────
  if (phase === "round3" && r3) {
    const w3 = r3.words[r3.wordIdx];

    // Score dots for progress
    const scoreDots = (
      <div className="pyr-r3-scoreboard">
        <span className="pyr-r3-team" style={{ color: TEAM_COLORS[0] }}>
          Éq.1 <strong>{r3.scores[0]}</strong>
        </span>
        <div className="pyr-word-dots">
          {r3.words.map((w, i) => {
            const isActive = i === r3.wordIdx && r3.subPhase !== "word_result";
            const dotColor = isActive
              ? "#ffd700"
              : w.scoredByTeam !== undefined
                ? TEAM_COLORS[w.scoredByTeam]
                : undefined;
            return (
              <div
                key={i}
                className={`pyr-dot pyr-dot--${isActive ? "active" : w.state}`}
                style={
                  dotColor
                    ? { background: dotColor, borderColor: dotColor }
                    : undefined
                }
              />
            );
          })}
        </div>
        <span className="pyr-r3-team" style={{ color: TEAM_COLORS[1] }}>
          <strong>{r3.scores[1]}</strong> Éq.2
        </span>
      </div>
    );

    // ── bidding: pick team + number of hints ───────────────────────────────
    if (r3.subPhase === "bidding") {
      return (
        <BiddingView
          wordText={w3.text}
          wordIdx={r3.wordIdx}
          wordInitiator={r3.wordInitiator}
          players={players}
          scoreDots={scoreDots}
          onConfirm={r3Confirm}
        />
      );
    }

    // ── guessing ────────────────────────────────────────────────────────────
    if (r3.subPhase === "guessing") {
      const gHinter = players[r3.guessingTeam][0];
      const gGuesser = players[r3.guessingTeam][1];
      return (
        <div className="pyr-root">
          <div className="pyr-game">
            <div className="pyr-round-label">
              Manche 3 — Mot {r3.wordIdx + 1}/5
            </div>
            <div className="pyr-word-card">
              <div className="pyr-word-text">{w3.text}</div>
            </div>
            <div
              className="pyr-role-card"
              style={{
                width: "100%",
                borderColor: TEAM_COLORS[r3.guessingTeam],
              }}
            >
              <div className="pyr-role">
                <span className="pyr-role-icon">🎤</span>
                <strong style={{ color: TEAM_COLORS[r3.guessingTeam] }}>
                  {gHinter}
                </strong>
                <span className="pyr-role-desc">
                  Éq.{r3.guessingTeam + 1} — donne les indices
                </span>
              </div>
              <div className="pyr-role-arrow">→</div>
              <div className="pyr-role">
                <span className="pyr-role-icon">🤔</span>
                <strong>{gGuesser}</strong>
                <span className="pyr-role-desc">devine</span>
              </div>
            </div>
            <div
              className={`pyr-hints-left${r3.hintsLeft === 0 ? " pyr-hints-left--zero" : ""}`}
            >
              {r3.hintsLeft} indice{r3.hintsLeft !== 1 ? "s" : ""} restant
              {r3.hintsLeft !== 1 ? "s" : ""}
            </div>
            <div className="pyr-actions-3">
              <button
                className="pyr-btn pyr-btn--pass"
                onClick={r3HintGiven}
                disabled={r3.hintsLeft === 0}
              >
                Indice donné
              </button>
              <button
                className="pyr-btn pyr-btn--correct"
                onClick={() => r3WordResult(true)}
              >
                ✓ Trouvé !
              </button>
              <button
                className="pyr-btn pyr-btn--forbidden"
                onClick={() => r3WordResult(false)}
              >
                ✗ Raté
              </button>
            </div>
            {scoreDots}
          </div>
        </div>
      );
    }

    // ── word result ─────────────────────────────────────────────────────────
    if (r3.subPhase === "word_result") {
      const isLast = r3.wordIdx >= WORDS_PER_ROUND - 1;
      return (
        <div className="pyr-root">
          <div className="pyr-roundover">
            <div className="pyr-round-label">
              Manche 3 — Mot {r3.wordIdx + 1}/5
            </div>
            <div
              className={`pyr-r3-result${r3.lastWordCorrect ? " pyr-r3-result--correct" : " pyr-r3-result--failed"}`}
            >
              {r3.lastWordCorrect ? "✓ Trouvé !" : "✗ Pas trouvé"}
            </div>
            <div className="pyr-word-card" style={{ opacity: 0.7 }}>
              <div className="pyr-word-text">{w3.text}</div>
            </div>
            <div className="pyr-r3-scoreboard pyr-r3-scoreboard--big">
              <span
                className="pyr-r3-team-big"
                style={{ color: TEAM_COLORS[0] }}
              >
                Éq.1
                <br />
                <strong>{r3.scores[0]}</strong>
              </span>
              <span className="pyr-r3-sep">—</span>
              <span
                className="pyr-r3-team-big"
                style={{ color: TEAM_COLORS[1] }}
              >
                Éq.2
                <br />
                <strong>{r3.scores[1]}</strong>
              </span>
            </div>
            <button className="pyr-btn pyr-btn--primary" onClick={r3NextWord}>
              {isLast ? "Résultats finaux" : `Mot ${r3.wordIdx + 2} →`}
            </button>
          </div>
        </div>
      );
    }
  }

  // ── ROUND 4 READY ──────────────────────────────────────────────────────────
  if (phase === "round4_ready") {
    const r3Scores = r3?.scores ?? [0, 0];
    const startTeam = r3 ? 1 - r3.wordInitiator : 0; // Opposite of the team that started R3
    const scores123 = [0, 1].map(
      (ti) =>
        (results[ti][0]?.score ?? 0) +
        (results[ti][1]?.score ?? 0) +
        r3Scores[ti],
    );
    const times12 = [0, 1].map(
      (ti) => (results[ti][0]?.timeUsed ?? 0) + (results[ti][1]?.timeUsed ?? 0),
    );
    const startReason = `N'a pas ouvert la manche 3`;

    return (
      <div className="pyr-root">
        <div className="pyr-setup">
          <div className="pyr-round-label">
            Manche 4 — Enchères (rôles inversés)
          </div>
          <div className="pyr-scores-recap">
            {[0, 1].map((ti) => (
              <div
                key={ti}
                className={`pyr-recap-team${ti === startTeam ? " pyr-recap-team--start" : ""}`}
                style={{ borderColor: TEAM_COLORS[ti] }}
              >
                <div
                  className="pyr-recap-name"
                  style={{ color: TEAM_COLORS[ti] }}
                >
                  Équipe {ti + 1}
                </div>
                <div className="pyr-recap-score">{scores123[ti]} pts</div>
                <div className="pyr-recap-time">⏱ {times12[ti]}s</div>
              </div>
            ))}
          </div>
          <div className="pyr-start-badge">
            Équipe {startTeam + 1} ouvre les enchères
            <div className="pyr-start-reason">{startReason}</div>
          </div>
          <div className="pyr-role-card">
            {[0, 1].map((ti) => (
              <div key={ti} className="pyr-role">
                <span className="pyr-role-icon">🎤</span>
                <strong>{players[ti][1]}</strong>
                <span className="pyr-role-desc">enchérit · indice</span>
                <span className="pyr-role-icon" style={{ marginTop: "0.5rem" }}>
                  🤔
                </span>
                <strong>{players[ti][0]}</strong>
                <span className="pyr-role-desc">devine</span>
              </div>
            ))}
          </div>
          <div className="pyr-rules-mini">
            <p>Le mot est révélé aux deux hinteurs</p>
            <p>L'équipe qui ouvre annonce N indices</p>
            <p>L'autre peut descendre ou laisser jouer</p>
            <p>L'équipe qui a le dernier mot doit deviner</p>
          </div>
          <button
            className="pyr-btn pyr-btn--primary"
            onClick={() => initRound4()}
          >
            C'est parti !
          </button>
        </div>
      </div>
    );
  }

  // ── ROUND 4 ────────────────────────────────────────────────────────────────
  if (phase === "round4" && r4) {
    const w4 = r4.words[r4.wordIdx];

    // Score dots for progress
    const r3Scores = r3?.scores ?? [0, 0];
    const scoreDots = (
      <div className="pyr-r3-scoreboard">
        <span className="pyr-r3-team" style={{ color: TEAM_COLORS[0] }}>
          Éq.1 <strong>{r4.scores[0]}</strong>
        </span>
        <div className="pyr-word-dots">
          {r4.words.map((w, i) => {
            const isActive = i === r4.wordIdx && r4.subPhase !== "word_result";
            const dotColor = isActive
              ? "#ffd700"
              : w.scoredByTeam !== undefined
                ? TEAM_COLORS[w.scoredByTeam]
                : undefined;
            return (
              <div
                key={i}
                className={`pyr-dot pyr-dot--${isActive ? "active" : w.state}`}
                style={
                  dotColor
                    ? { background: dotColor, borderColor: dotColor }
                    : undefined
                }
              />
            );
          })}
        </div>
        <span className="pyr-r3-team" style={{ color: TEAM_COLORS[1] }}>
          <strong>{r4.scores[1]}</strong> Éq.2
        </span>
      </div>
    );

    // ── bidding: pick team + number of hints ───────────────────────────────
    if (r4.subPhase === "bidding") {
      return (
        <BiddingView
          wordText={w4.text}
          wordIdx={r4.wordIdx}
          wordInitiator={r4.wordInitiator}
          players={players}
          scoreDots={scoreDots}
          onConfirm={r4Confirm}
        />
      );
    }

    // ── guessing ────────────────────────────────────────────────────────────
    if (r4.subPhase === "guessing") {
      const gHinter = players[r4.guessingTeam][1]; // Round 4 has swapped roles
      const gGuesser = players[r4.guessingTeam][0];
      return (
        <div className="pyr-root">
          <div className="pyr-game">
            <div className="pyr-round-label">
              Manche 4 — Mot {r4.wordIdx + 1}/5
            </div>
            <div className="pyr-word-card">
              <div className="pyr-word-text">{w4.text}</div>
            </div>
            <div
              className="pyr-role-card"
              style={{
                width: "100%",
                borderColor: TEAM_COLORS[r4.guessingTeam],
              }}
            >
              <div className="pyr-role">
                <span className="pyr-role-icon">🎤</span>
                <strong style={{ color: TEAM_COLORS[r4.guessingTeam] }}>
                  {gHinter}
                </strong>
                <span className="pyr-role-desc">
                  Éq.{r4.guessingTeam + 1} — donne les indices
                </span>
              </div>
              <div className="pyr-role-arrow">→</div>
              <div className="pyr-role">
                <span className="pyr-role-icon">🤔</span>
                <strong>{gGuesser}</strong>
                <span className="pyr-role-desc">devine</span>
              </div>
            </div>
            <div
              className={`pyr-hints-left${r4.hintsLeft === 0 ? " pyr-hints-left--zero" : ""}`}
            >
              {r4.hintsLeft} indice{r4.hintsLeft !== 1 ? "s" : ""} restant
              {r4.hintsLeft !== 1 ? "s" : ""}
            </div>
            <div className="pyr-actions-3">
              <button
                className="pyr-btn pyr-btn--pass"
                onClick={r4HintGiven}
                disabled={r4.hintsLeft === 0}
              >
                Indice donné
              </button>
              <button
                className="pyr-btn pyr-btn--correct"
                onClick={() => r4WordResult(true)}
              >
                ✓ Trouvé !
              </button>
              <button
                className="pyr-btn pyr-btn--forbidden"
                onClick={() => r4WordResult(false)}
              >
                ✗ Raté
              </button>
            </div>
            {scoreDots}
          </div>
        </div>
      );
    }

    // ── word result ─────────────────────────────────────────────────────────
    if (r4.subPhase === "word_result") {
      const isLast = r4.wordIdx >= WORDS_PER_ROUND - 1;
      return (
        <div className="pyr-root">
          <div className="pyr-roundover">
            <div className="pyr-round-label">
              Manche 4 — Mot {r4.wordIdx + 1}/5
            </div>
            <div
              className={`pyr-r3-result${r4.lastWordCorrect ? " pyr-r3-result--correct" : " pyr-r3-result--failed"}`}
            >
              {r4.lastWordCorrect ? "✓ Trouvé !" : "✗ Pas trouvé"}
            </div>
            <div className="pyr-word-card" style={{ opacity: 0.7 }}>
              <div className="pyr-word-text">{w4.text}</div>
            </div>
            <div className="pyr-r3-scoreboard pyr-r3-scoreboard--big">
              <span
                className="pyr-r3-team-big"
                style={{ color: TEAM_COLORS[0] }}
              >
                Éq.1
                <br />
                <strong>{r4.scores[0]}</strong>
              </span>
              <span className="pyr-r3-sep">—</span>
              <span
                className="pyr-r3-team-big"
                style={{ color: TEAM_COLORS[1] }}
              >
                Éq.2
                <br />
                <strong>{r4.scores[1]}</strong>
              </span>
            </div>
            <button className="pyr-btn pyr-btn--primary" onClick={r4NextWord}>
              {isLast ? "Résultats finaux" : `Mot ${r4.wordIdx + 2} →`}
            </button>
          </div>
        </div>
      );
    }
  }

  // ── FINALE HELPERS ─────────────────────────────────────────────────────────
  const renderFinaleLadder = (currentLevel: number) => (
    <div className="pyr-finale-ladder">
      <div className="pyr-finale-ladder-title">Paliers</div>
      {[...FINALE_LEVELS].reverse().map((l) => {
        const isActive = l.level === currentLevel;
        const isDone = l.level < currentLevel;
        const isSafety = l.level === FINALE_SAFETY_LEVEL;
        return (
          <div
            key={l.level}
            className={[
              "pyr-finale-ladder-row",
              isActive ? "pyr-finale-ladder-row--active" : "",
              isDone ? "pyr-finale-ladder-row--done" : "",
              isSafety ? "pyr-finale-ladder-row--safety" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="pyr-finale-ladder-level">
              Niv.{l.level}
              {isSafety ? " 🛡" : ""}
            </span>
            <span className="pyr-finale-ladder-prize">
              {l.prize.toLocaleString("fr-FR")} €
            </span>
          </div>
        );
      })}
    </div>
  );

  // ── FINALE INTRO ───────────────────────────────────────────────────────────
  if (phase === "finale_intro" && finaleState) {
    const { winnerTeam } = finaleState;
    const finaleHinter = players[winnerTeam][0];
    const finaleGuesser = players[winnerTeam][1];
    return (
      <div className="pyr-root">
        <div className="pyr-setup">
          <div
            className="pyr-round-label"
            style={{ color: TEAM_COLORS[winnerTeam] }}
          >
            La Finale — Équipe {winnerTeam + 1}
          </div>
          <div
            className="pyr-role-card"
            style={{ borderColor: TEAM_COLORS[winnerTeam] }}
          >
            <div className="pyr-role">
              <span className="pyr-role-icon">🎤</span>
              <strong>{finaleHinter}</strong>
              <span className="pyr-role-desc">donne les indices</span>
            </div>
            <div className="pyr-role-arrow">→</div>
            <div className="pyr-role">
              <span className="pyr-role-icon">🤔</span>
              <strong>{finaleGuesser}</strong>
              <span className="pyr-role-desc">devine</span>
            </div>
          </div>
          <table className="pyr-finale-table">
            <thead>
              <tr>
                <th>Niveau</th>
                <th>Somme en jeu</th>
                <th>Mots dispo.</th>
              </tr>
            </thead>
            <tbody>
              {[...FINALE_LEVELS].reverse().map((l) => (
                <tr
                  key={l.level}
                  className={
                    l.level === FINALE_SAFETY_LEVEL
                      ? "pyr-finale-table-safety"
                      : ""
                  }
                >
                  <td>
                    {l.level}
                    {l.level === FINALE_SAFETY_LEVEL ? " 🛡" : ""}
                  </td>
                  <td>{l.prize.toLocaleString("fr-FR")} €</td>
                  <td>{l.wordCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pyr-rules-mini">
            <p>Trouver 5 mots pour passer au niveau suivant</p>
            <p>
              Max {FINALE_HINTS_PER_WORD} indices par mot · Passer élimine le
              mot
            </p>
            <p>Niveau 2 🛡 est votre filet de sécurité</p>
          </div>
          <button
            className="pyr-btn pyr-btn--primary"
            onClick={() => setPhase("finale_playing")}
          >
            C'est parti !
          </button>
        </div>
      </div>
    );
  }

  // ── FINALE PLAYING ─────────────────────────────────────────────────────────
  if (phase === "finale_playing" && finaleState) {
    const { winnerTeam, level, words, currentWordIdx, foundCount, hintsLeft } =
      finaleState;
    const currentWord = words[currentWordIdx];
    const levelCfg = FINALE_LEVELS.find((l) => l.level === level)!;
    const eliminated = words.filter((w) => w.status === "eliminated").length;
    const finaleHinter = players[winnerTeam][0];
    const finaleGuesser = players[winnerTeam][1];
    return (
      <div className="pyr-root">
        <div className="pyr-finale-layout">
          {renderFinaleLadder(level)}
          <div className="pyr-game">
            <div className="pyr-header">
              <div
                className="pyr-round-label"
                style={{ color: TEAM_COLORS[winnerTeam], margin: 0 }}
              >
                Finale · Niv.{level} — {levelCfg.prize.toLocaleString("fr-FR")}{" "}
                €
              </div>
              <span
                className={`pyr-timer${finaleTimeLeft <= 20 ? " pyr-timer--urgent" : ""}`}
              >
                {finaleTimeLeft}s
              </span>
            </div>
            <div className="pyr-players-sm">
              <span>🎤 {finaleHinter}</span>
              <span className="pyr-arrow-sm">→</span>
              <span>🤔 {finaleGuesser}</span>
            </div>
            <div className="pyr-word-card">
              <div className="pyr-word-text">{currentWord.text}</div>
            </div>
            <div className="pyr-finale-hints">
              {Array.from({ length: FINALE_HINTS_PER_WORD }).map((_, i) => (
                <div
                  key={i}
                  className={`pyr-finale-hint-dot${i < FINALE_HINTS_PER_WORD - hintsLeft ? " pyr-finale-hint-dot--used" : ""}`}
                />
              ))}
            </div>
            <div className="pyr-counters">
              <span className="pyr-counter pyr-counter--correct">
                ✓ {foundCount}/{FINALE_WORDS_NEEDED}
              </span>
              <span className="pyr-counter pyr-counter--pending">
                ⏳ {words.filter((w) => w.status === "pending").length}
              </span>
              <span className="pyr-counter pyr-counter--elim">
                🚫 {eliminated}
              </span>
            </div>
            <div className="pyr-word-dots">
              {words.map((w, i) => (
                <div
                  key={i}
                  className={`pyr-dot pyr-dot--${i === currentWordIdx ? "active" : w.status}`}
                />
              ))}
            </div>
            <div className="pyr-actions-3">
              <button
                className="pyr-btn pyr-btn--pass"
                onClick={() => finaleWordResolved(false)}
              >
                🚫 Passer
              </button>
              <button
                className="pyr-btn pyr-btn--pass"
                onClick={finaleHintGiven}
                disabled={hintsLeft === 0}
              >
                Indice donné ({hintsLeft})
              </button>
              <button
                className="pyr-btn pyr-btn--correct"
                onClick={() => finaleWordResolved(true)}
              >
                ✓ Trouvé !
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── FINALE LEVEL SUCCESS ───────────────────────────────────────────────────
  if (phase === "finale_level_success" && finaleState) {
    const { level, wonAmount, safetyNetAmount, words } = finaleState;
    const isTop = level === FINALE_LEVELS.length;
    return (
      <div className="pyr-root">
        <div className="pyr-finale-layout">
          {renderFinaleLadder(level)}
          <div className="pyr-roundover">
            <div className="pyr-round-label">Niveau {level} réussi !</div>
            <div className="pyr-finale-prize-display">
              {wonAmount.toLocaleString("fr-FR")} €
            </div>
            <div className="pyr-word-list">
              {words.map((w, i) => (
                <div
                  key={i}
                  className={`pyr-word-row pyr-word-row--${w.status === "correct" ? "correct" : w.status === "eliminated" ? "eliminated" : "pending"}`}
                >
                  <span className="pyr-word-row-icon">
                    {w.status === "correct"
                      ? "✓"
                      : w.status === "eliminated"
                        ? "🚫"
                        : "—"}
                  </span>
                  <span>{w.text}</span>
                </div>
              ))}
            </div>
            {safetyNetAmount > 0 && (
              <div className="pyr-finale-safety-active">
                🛡 Filet de sécurité : {safetyNetAmount.toLocaleString("fr-FR")}{" "}
                €
              </div>
            )}
            {isTop ? (
              <button className="pyr-btn pyr-btn--correct" onClick={finaleStop}>
                Terminer — {wonAmount.toLocaleString("fr-FR")} € !
              </button>
            ) : (
              <div className="pyr-finale-decision">
                <button
                  className="pyr-btn pyr-btn--forbidden"
                  onClick={finaleStop}
                >
                  Arrêter — garder {wonAmount.toLocaleString("fr-FR")} €
                </button>
                <button
                  className="pyr-btn pyr-btn--correct"
                  onClick={finaleContinue}
                >
                  Continuer → Niveau {level + 1}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── FINALE END ─────────────────────────────────────────────────────────────
  if (phase === "finale_end" && finaleState) {
    const { level, endReason, wonAmount, words } = finaleState;
    const isWin = endReason !== "failed";
    return (
      <div className="pyr-root">
        <div className="pyr-finale-layout">
          {renderFinaleLadder(level)}
          <div className="pyr-final">
            {endReason === "grand_win" && <div className="pyr-trophy">🏆</div>}
            <h1>
              {endReason === "grand_win"
                ? "Bravo !"
                : isWin
                  ? "Félicitations !"
                  : "Dommage !"}
            </h1>
            <div
              className="pyr-finale-prize-display"
              style={{ color: isWin ? "#22c55e" : "#ef4444" }}
            >
              {wonAmount.toLocaleString("fr-FR")} €
            </div>
            {endReason === "failed" && wonAmount === 0 && (
              <div
                className="pyr-finale-safety-active"
                style={{ color: "#ef4444" }}
              >
                Vous repartez sans filet.
              </div>
            )}
            <div className="pyr-word-list">
              {words.map((w, i) => (
                <div
                  key={i}
                  className={`pyr-word-row pyr-word-row--${w.status === "correct" ? "correct" : w.status === "eliminated" ? "eliminated" : "pending"}`}
                >
                  <span className="pyr-word-row-icon">
                    {w.status === "correct"
                      ? "✓"
                      : w.status === "eliminated"
                        ? "🚫"
                        : "—"}
                  </span>
                  <span>{w.text}</span>
                </div>
              ))}
            </div>
            <button className="pyr-btn pyr-btn--primary" onClick={onBack}>
              Retour au menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const r3Scores = r3?.scores ?? [0, 0];
  const r4Scores = r4?.scores ?? [0, 0];
  const totals = [0, 1].map(
    (ti) =>
      (results[ti][0]?.score ?? 0) +
      (results[ti][1]?.score ?? 0) +
      r3Scores[ti] +
      r4Scores[ti],
  );
  const totalTimes = [0, 1].map(
    (ti) => (results[ti][0]?.timeUsed ?? 0) + (results[ti][1]?.timeUsed ?? 0),
  );
  const winner =
    totals[0] !== totals[1]
      ? totals[0] > totals[1]
        ? 0
        : 1
      : totalTimes[0] !== totalTimes[1]
        ? totalTimes[0] < totalTimes[1]
          ? 0
          : 1
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
              style={{ borderColor: TEAM_COLORS[ti] }}
            >
              {winner === ti && <div className="pyr-trophy">🏆</div>}
              <div
                className="pyr-final-name"
                style={{ color: TEAM_COLORS[ti] }}
              >
                Équipe {ti + 1}
              </div>
              <div className="pyr-final-score">{totals[ti]} pts</div>
              <div className="pyr-final-time">⏱ {totalTimes[ti]}s</div>
              <div className="pyr-final-breakdown">
                {[0, 1, 2, 3].map((ri) => {
                  if (ri < 2) {
                    const { hinter: h, guesser: g } = getRoles(ti, ri + 1);
                    const r = results[ti][ri];
                    return (
                      <div key={ri} className="pyr-final-row">
                        <span className="pyr-final-round">M{ri + 1}</span>
                        <span className="pyr-final-players">
                          {h} → {g}
                        </span>
                        <span className="pyr-final-pts">{r?.score ?? 0}pt</span>
                        <span className="pyr-final-rowtime">
                          {r?.timeUsed ?? 0}s
                        </span>
                      </div>
                    );
                  } else if (ri === 2) {
                    return (
                      <div key={ri} className="pyr-final-row">
                        <span className="pyr-final-round">M3</span>
                        <span className="pyr-final-players">Enchères</span>
                        <span className="pyr-final-pts">{r3Scores[ti]}pt</span>
                      </div>
                    );
                  } else {
                    return (
                      <div key={ri} className="pyr-final-row">
                        <span className="pyr-final-round">M4</span>
                        <span className="pyr-final-players">
                          Enchères (inv.)
                        </span>
                        <span className="pyr-final-pts">{r4Scores[ti]}pt</span>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          ))}
        </div>
        {winner === -1 && <div className="pyr-tie">Égalité parfaite ! 🤝</div>}
        {winner !== -1 && totals[0] === totals[1] && (
          <div className="pyr-tiebreak-note">Départagés au temps !</div>
        )}
        {winner !== -1 && (
          <button
            className="pyr-btn pyr-btn--correct"
            style={{ marginTop: "0.5rem" }}
            onClick={() => startFinale(winner)}
          >
            🏆 Jouer la Finale — Équipe {winner + 1}
          </button>
        )}
        <button className="pyr-btn pyr-btn--primary" onClick={onBack}>
          Retour au menu
        </button>
      </div>
    </div>
  );
}
