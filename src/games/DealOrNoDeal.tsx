import { useState } from "react";
import "./DealOrNoDeal.css";

const AMOUNTS: { text: string; value: number }[] = [
  { text: "0,01 €", value: 0.01 },
  { text: "1 €", value: 1 },
  { text: "5 €", value: 5 },
  { text: "10 €", value: 10 },
  { text: "25 €", value: 25 },
  { text: "50 €", value: 50 },
  { text: "75 €", value: 75 },
  { text: "100 €", value: 100 },
  { text: "200 €", value: 200 },
  { text: "300 €", value: 300 },
  { text: "400 €", value: 400 },
  { text: "500 €", value: 500 },
  { text: "750 €", value: 750 },
  { text: "1 000 €", value: 1000 },
  { text: "5 000 €", value: 5000 },
  { text: "10 000 €", value: 10000 },
  { text: "25 000 €", value: 25000 },
  { text: "50 000 €", value: 50000 },
  { text: "75 000 €", value: 75000 },
  { text: "100 000 €", value: 100000 },
  { text: "200 000 €", value: 200000 },
  { text: "300 000 €", value: 300000 },
  { text: "400 000 €", value: 400000 },
  { text: "500 000 €", value: 500000 },
  { text: "750 000 €", value: 750000 },
  { text: "1 000 000 €", value: 1000000 },
];

// Cases to open per round before banker makes an offer
const ROUND_CASES = [6, 5, 4, 3, 2, 1, 1, 1, 1, 1];

function closestText(n: number): string {
  return AMOUNTS.reduce((best, amt) =>
    Math.abs(amt.value - n) < Math.abs(best.value - n) ? amt : best,
  ).text;
}

interface Case {
  id: number;
  value: number;
  text: string;
  opened: boolean;
}

interface Props {
  onBack: () => void;
}

function initCases(): Case[] {
  const shuffled = [...AMOUNTS].sort(() => Math.random() - 0.5);
  return shuffled.map(({ text, value }, i) => ({
    id: i + 1,
    value,
    text,
    opened: false,
  }));
}

export default function DealOrNoDeal({ onBack }: Props) {
  const [cases, setCases] = useState<Case[]>(initCases);
  const [playerCaseId, setPlayerCaseId] = useState<number | null>(null);
  const [phase, setPhase] = useState<
    "picking" | "opening" | "revealing" | "offer" | "final_swap" | "game_over"
  >("picking");
  const [nextPhase, setNextPhase] = useState<"offer" | "final_swap" | null>(
    null,
  );
  const [round, setRound] = useState(1);
  const [openedThisRound, setOpenedThisRound] = useState(0);
  const [bankerOffer, setBankerOffer] = useState(0);
  const [dealTaken, setDealTaken] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [endNote, setEndNote] = useState("");
  const [lastOpenedValue, setLastOpenedValue] = useState<number | null>(null);
  const [lastOpenedText, setLastOpenedText] = useState<string | null>(null);
  const [lastOpenedId, setLastOpenedId] = useState<number | null>(null);

  const casesToOpen = ROUND_CASES[Math.min(round - 1, ROUND_CASES.length - 1)];
  const leftToOpen = casesToOpen - openedThisRound;

  function handlePickCase(id: number) {
    setPlayerCaseId(id);
    setPhase("opening");
  }

  function handleOpenCase(id: number) {
    if (phase !== "opening") return;
    const c = cases.find((c) => c.id === id);
    if (!c || c.opened || c.id === playerCaseId) return;

    const newCases = cases.map((c) =>
      c.id === id ? { ...c, opened: true } : c,
    );
    setCases(newCases);
    setLastOpenedValue(c.value);
    setLastOpenedText(c.text);
    setLastOpenedId(c.id);

    const remaining = newCases.filter(
      (c) => !c.opened && c.id !== playerCaseId,
    );

    if (remaining.length === 1) {
      setNextPhase("final_swap");
      setPhase("revealing");
      return;
    }

    const newOpened = openedThisRound + 1;
    if (newOpened >= casesToOpen) {
      const remValues = remaining.map((c) => c.value);
      const expected = remValues.reduce((a, b) => a + b, 0) / remValues.length;
      const pct = Math.min(0.1 + round * 0.08, 0.95);
      setBankerOffer(Math.round(expected * pct));
      setOpenedThisRound(0);
      setNextPhase("offer");
      setPhase("revealing");
    } else {
      setOpenedThisRound(newOpened);
    }
  }

  function handleRevealContinue() {
    setPhase(nextPhase!);
    setNextPhase(null);
  }

  function handleDeal() {
    setDealTaken(true);
    setFinalText(closestText(bankerOffer));
    const playerCase = cases.find((c) => c.id === playerCaseId)!;
    setEndNote(`Your case had: ${playerCase.text}`);
    setPhase("game_over");
  }

  function handleNoDeal() {
    setRound((r) => r + 1);
    setOpenedThisRound(0);
    setPhase("opening");
  }

  function handleKeep() {
    const playerCase = cases.find((c) => c.id === playerCaseId)!;
    setFinalText(playerCase.text);
    setEndNote("You kept your original case!");
    setPhase("game_over");
  }

  function handleSwap() {
    const other = cases.find((c) => !c.opened && c.id !== playerCaseId)!;
    const playerCase = cases.find((c) => c.id === playerCaseId)!;
    setFinalText(other.text);
    setEndNote(
      `You swapped to case #${other.id}. Yours had: ${playerCase.text}`,
    );
    setPhase("game_over");
  }

  function handleRestart() {
    setCases(initCases());
    setPlayerCaseId(null);
    setPhase("picking");
    setRound(1);
    setOpenedThisRound(0);
    setBankerOffer(0);
    setDealTaken(false);
    setFinalText("");
    setEndNote("");
    setLastOpenedValue(null);
    setLastOpenedText(null);
    setLastOpenedId(null);
    setNextPhase(null);
  }

  const lastCase = cases.find((c) => !c.opened && c.id !== playerCaseId);
  const lowAmounts = AMOUNTS.slice(0, 13);
  const highAmounts = AMOUNTS.slice(13);

  return (
    <div className="dond-root">
      <div className="dond-header">
        <button className="dond-back" onClick={onBack}>
          ← Back
        </button>
        <h1 className="dond-title">Deal or No Deal</h1>
        <div className="dond-status">
          {phase === "picking" && <span>Pick your case!</span>}
          {phase === "opening" && (
            <span>
              Round {round} — Open <strong>{leftToOpen}</strong> more
            </span>
          )}
        </div>
      </div>

      <div className="dond-layout">
        {/* Left money board */}
        <div className="dond-board">
          {lowAmounts.map((amt) => {
            const gone = cases.some((c) => c.opened && c.value === amt.value);
            const justOpened = lastOpenedValue === amt.value;
            return (
              <div
                key={amt.value}
                className={`dond-amt low ${gone ? "gone" : ""} ${justOpened ? "just-opened" : ""}`}
              >
                {amt.text}
              </div>
            );
          })}
        </div>

        {/* Center */}
        <div className="dond-center">
          {playerCaseId && (
            <div className="dond-my-case">
              <span className="dond-my-label">Your Case</span>
              <div className="dond-case selected">#{playerCaseId}</div>
            </div>
          )}

          <div className="dond-grid">
            {cases.map((c) => {
              if (c.id === playerCaseId) return null;
              const clickable =
                (phase === "picking" || phase === "opening") && !c.opened;
              return (
                <button
                  key={c.id}
                  className={`dond-case ${c.opened ? "opened" : ""} ${clickable ? "clickable" : ""}`}
                  onClick={() => {
                    if (phase === "picking") handlePickCase(c.id);
                    else handleOpenCase(c.id);
                  }}
                  disabled={!clickable}
                >
                  {c.opened ? (
                    <span
                      className={`dond-case-val ${c.value >= 100000 ? "bad" : c.value >= 10000 ? "mid" : "good"}`}
                    >
                      {c.text}
                    </span>
                  ) : (
                    <span>#{c.id}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right money board */}
        <div className="dond-board">
          {highAmounts.map((amt) => {
            const gone = cases.some((c) => c.opened && c.value === amt.value);
            const justOpened = lastOpenedValue === amt.value;
            return (
              <div
                key={amt.value}
                className={`dond-amt high ${gone ? "gone" : ""} ${justOpened ? "just-opened" : ""}`}
              >
                {amt.text}
              </div>
            );
          })}
        </div>
      </div>

      {/* Value Reveal */}
      {phase === "revealing" &&
        lastOpenedText !== null &&
        lastOpenedValue !== null && (
          <div className="dond-overlay">
            <div className="dond-modal reveal-modal">
              <p className="dond-sublabel">Case contained</p>
              <div
                className={`dond-big-amt reveal-amt ${lastOpenedValue >= 100000 ? "bad" : lastOpenedValue >= 10000 ? "mid" : "good"}`}
              >
                {lastOpenedText}
              </div>
              <button
                className="dond-btn continue"
                onClick={handleRevealContinue}
              >
                {nextPhase === "offer"
                  ? "Call the Banker →"
                  : "Final Decision →"}
              </button>
            </div>
          </div>
        )}

      {/* Banker Offer */}
      {phase === "offer" && (
        <div className="dond-overlay">
          <div className="dond-modal">
            {lastOpenedId !== null &&
              lastOpenedText !== null &&
              lastOpenedValue !== null && (
                <p className="dond-last-opened">
                  Case <strong>#{lastOpenedId}</strong> contained{" "}
                  <strong
                    className={
                      lastOpenedValue >= 100000
                        ? "bad"
                        : lastOpenedValue >= 10000
                          ? "mid"
                          : "good"
                    }
                  >
                    {lastOpenedText}
                  </strong>
                </p>
              )}
            <div className="dond-phone">📞</div>
            <p className="dond-caller">The Banker is calling…</p>
            <div className="dond-big-amt">{closestText(bankerOffer)}</div>
            <p className="dond-sublabel">THE BANKER'S OFFER</p>
            <div className="dond-actions">
              <button className="dond-btn deal" onClick={handleDeal}>
                DEAL!
              </button>
              <button className="dond-btn nodeal" onClick={handleNoDeal}>
                NO DEAL!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Swap */}
      {phase === "final_swap" && lastCase && (
        <div className="dond-overlay">
          <div className="dond-modal">
            <h2>One Last Decision</h2>
            <p>
              Swap your case <strong>#{playerCaseId}</strong> for case{" "}
              <strong>#{lastCase.id}</strong>?
            </p>
            <div className="dond-actions">
              <button className="dond-btn deal" onClick={handleSwap}>
                SWAP!
              </button>
              <button className="dond-btn nodeal" onClick={handleKeep}>
                KEEP!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {phase === "game_over" && (
        <div className="dond-overlay">
          <div className="dond-modal">
            <h2>{dealTaken ? "Deal Taken!" : "Game Over!"}</h2>
            <div className="dond-big-amt won">{finalText}</div>
            <p className="dond-sublabel">YOU WON</p>
            {endNote && <p className="dond-endnote">{endNote}</p>}
            <button className="dond-btn restart" onClick={handleRestart}>
              Play Again
            </button>
            <button className="dond-btn back" onClick={onBack}>
              Back to Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
