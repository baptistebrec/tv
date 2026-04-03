import { useState } from "react";
import {
  FAMILLE_EN_OR_QUESTIONS,
  type FamilleEnOrQuestion,
} from "../data/familleEnOr";
import "./FamilleEnOr.css";

const TOTAL_ROUNDS = 4;
const TEAM_COLORS = ["#3b82f6", "#f97316"] as const;
const TEAM_LABELS = ["Équipe 1", "Équipe 2"] as const;

interface Props {
  onBack: () => void;
}

function TeamPanel({
  team,
  score,
  points,
  multiplier,
  awarded,
  onAward,
}: {
  team: 0 | 1;
  score: number;
  points: number;
  multiplier: number;
  awarded: boolean;
  onAward: () => void;
}) {
  return (
    <aside
      className="feo-team-panel"
      style={{ "--team-color": TEAM_COLORS[team] } as React.CSSProperties}
    >
      <span className="feo-team-label">{TEAM_LABELS[team]}</span>
      <span className="feo-team-pts">{score}</span>
      {!awarded && (
        <button
          className="feo-award-btn"
          onClick={onAward}
          disabled={points === 0}
        >
          +{points * multiplier}
        </button>
      )}
    </aside>
  );
}

export function FamilleEnOr({ onBack }: Props) {
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [awarded, setAwarded] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const question: FamilleEnOrQuestion = FAMILLE_EN_OR_QUESTIONS[questionIdx];
  const total = FAMILLE_EN_OR_QUESTIONS.length;
  const isLastRound = round === TOTAL_ROUNDS;
  const multiplier = isLastRound ? 3 : 1;

  const revealedPoints = [...revealed].reduce(
    (sum, i) => sum + question.answers[i].points,
    0
  );

  function goTo(idx: number) {
    setQuestionIdx(((idx % total) + total) % total);
    setRevealed(new Set());
    setAwarded(false);
  }

  function toggleAnswer(i: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function revealAll() {
    setRevealed(new Set(question.answers.map((_, i) => i)));
  }

  function hideAll() {
    setRevealed(new Set());
  }

  function awardTo(team: 0 | 1) {
    const pts = revealedPoints * multiplier;
    setScores((prev) => {
      const next: [number, number] = [...prev] as [number, number];
      next[team] += pts;
      return next;
    });
    setAwarded(true);
    if (round === TOTAL_ROUNDS) setGameOver(true);
  }

  function nextRound() {
    setRound((r) => r + 1);
    goTo((questionIdx + 1) % total);
  }

  function resetGame() {
    setRound(1);
    setScores([0, 0]);
    setQuestionIdx(0);
    setRevealed(new Set());
    setAwarded(false);
    setGameOver(false);
  }

  if (gameOver) {
    const winner =
      scores[0] > scores[1] ? 0 : scores[1] > scores[0] ? 1 : null;
    return (
      <div className="feo-root feo-root--gameover">
        <div className="feo-gameover-box">
          <h1 className="feo-gameover-title">Partie terminée !</h1>
          <div className="feo-gameover-scores">
            {([0, 1] as const).map((t) => (
              <div
                key={t}
                className={`feo-gameover-team ${winner === t ? "feo-gameover-team--winner" : ""}`}
                style={{ "--team-color": TEAM_COLORS[t] } as React.CSSProperties}
              >
                <span className="feo-gameover-team-label">{TEAM_LABELS[t]}</span>
                <span className="feo-gameover-team-score">{scores[t]} pts</span>
                {winner === t && <span className="feo-gameover-crown">👑</span>}
              </div>
            ))}
          </div>
          {winner === null && <p className="feo-gameover-tie">Égalité !</p>}
          <div className="feo-gameover-actions">
            <button className="feo-action-btn" onClick={resetGame}>
              Nouvelle partie
            </button>
            <button className="feo-action-btn feo-action-btn--secondary" onClick={onBack}>
              ← Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feo-root">
      <TeamPanel
        team={0}
        score={scores[0]}
        points={revealedPoints}
        multiplier={multiplier}
        awarded={awarded}
        onAward={() => awardTo(0)}
      />

      <main className="feo-main">
        <div className="feo-topbar">
          <button className="feo-back" onClick={onBack}>
            ← Hub
          </button>
          <div className="feo-round-badge">
            Manche {round}/{TOTAL_ROUNDS}
            {isLastRound && <span className="feo-double-badge">×3</span>}
          </div>
          <div className="feo-nav">
            <button
              className="feo-nav-btn"
              onClick={() => goTo(questionIdx - 1)}
              disabled={awarded}
            >
              ‹
            </button>
            <button
              className="feo-nav-btn"
              onClick={() => goTo(Math.floor(Math.random() * total))}
              disabled={awarded}
              title="Question aléatoire"
            >
              ↺
            </button>
            <button
              className="feo-nav-btn"
              onClick={() => goTo(questionIdx + 1)}
              disabled={awarded}
            >
              ›
            </button>
          </div>
        </div>

        <div className="feo-question-box">
          <p className="feo-question">{question.question}</p>
          {revealedPoints > 0 && !awarded && (
            <p className="feo-points-preview">
              {revealedPoints} pt{revealedPoints > 1 ? "s" : ""} sélectionnés
              {isLastRound && ` → ${revealedPoints * 3} pts (×3)`}
            </p>
          )}
        </div>

        <div className="feo-answers">
          {question.answers.map((answer, i) => {
            const isRevealed = revealed.has(i);
            return (
              <button
                key={i}
                className={`feo-answer-row ${isRevealed ? "feo-answer-row--revealed" : ""}`}
                onClick={() => toggleAnswer(i)}
              >
                <span className="feo-answer-rank">{i + 1}</span>
                <span className="feo-answer-text">
                  {isRevealed ? answer.text : ""}
                </span>
                <span className="feo-answer-points">
                  {isRevealed ? answer.points : ""}
                </span>
              </button>
            );
          })}
        </div>

        <div className="feo-actions">
          {!awarded ? (
            <>
              <button className="feo-action-btn" onClick={revealAll}>
                Tout révéler
              </button>
              <button
                className="feo-action-btn feo-action-btn--secondary"
                onClick={hideAll}
              >
                Tout cacher
              </button>
            </>
          ) : (
            !isLastRound && (
              <button className="feo-action-btn" onClick={nextRound}>
                Manche suivante →
              </button>
            )
          )}
        </div>
      </main>

      <TeamPanel
        team={1}
        score={scores[1]}
        points={revealedPoints}
        multiplier={multiplier}
        awarded={awarded}
        onAward={() => awardTo(1)}
      />
    </div>
  );
}
