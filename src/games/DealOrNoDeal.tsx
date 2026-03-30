import { useState } from "react";
import "./DealOrNoDeal.css";

const AMOUNTS = [
  0.01, 1, 5, 10, 25, 50, 75, 100, 200, 300, 400, 500, 750,
  1000, 5000, 10000, 25000, 50000, 75000, 100000,
  200000, 300000, 400000, 500000, 750000, 1000000,
];

// Cases to open per round before banker makes an offer
const ROUND_CASES = [6, 5, 4, 3, 2, 1, 1, 1, 1, 1];

function fmt(n: number): string {
  if (n < 1) return "$0.01";
  if (n >= 1_000_000) return "$1,000,000";
  if (n >= 1000) return `$${n.toLocaleString()}`;
  return `$${n}`;
}

function fmtShort(n: number): string {
  if (n < 1) return "¢1";
  if (n >= 1_000_000) return "$1M";
  if (n >= 1000) return `$${n / 1000}K`;
  return `$${n}`;
}

interface Case {
  id: number;
  amount: number;
  opened: boolean;
}

interface Props {
  onBack: () => void;
}

function initCases(): Case[] {
  const shuffled = [...AMOUNTS].sort(() => Math.random() - 0.5);
  return shuffled.map((amount, i) => ({ id: i + 1, amount, opened: false }));
}

export default function DealOrNoDeal({ onBack }: Props) {
  const [cases, setCases] = useState<Case[]>(initCases);
  const [playerCaseId, setPlayerCaseId] = useState<number | null>(null);
  const [phase, setPhase] = useState<"picking" | "opening" | "offer" | "final_swap" | "game_over">("picking");
  const [round, setRound] = useState(1);
  const [openedThisRound, setOpenedThisRound] = useState(0);
  const [bankerOffer, setBankerOffer] = useState(0);
  const [dealTaken, setDealTaken] = useState(false);
  const [finalAmount, setFinalAmount] = useState(0);
  const [endNote, setEndNote] = useState("");
  const [lastOpenedAmount, setLastOpenedAmount] = useState<number | null>(null);

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

    const newCases = cases.map((c) => (c.id === id ? { ...c, opened: true } : c));
    setCases(newCases);
    setLastOpenedAmount(c.amount);

    const remaining = newCases.filter((c) => !c.opened && c.id !== playerCaseId);

    if (remaining.length === 1) {
      setPhase("final_swap");
      return;
    }

    const newOpened = openedThisRound + 1;
    if (newOpened >= casesToOpen) {
      const remAmounts = remaining.map((c) => c.amount);
      const expected = remAmounts.reduce((a, b) => a + b, 0) / remAmounts.length;
      const pct = Math.min(0.1 + round * 0.08, 0.95);
      setBankerOffer(Math.round(expected * pct));
      setOpenedThisRound(0);
      setPhase("offer");
    } else {
      setOpenedThisRound(newOpened);
    }
  }

  function handleDeal() {
    setDealTaken(true);
    setFinalAmount(bankerOffer);
    const playerAmt = cases.find((c) => c.id === playerCaseId)!.amount;
    setEndNote(`Your case had ${fmt(playerAmt)}`);
    setPhase("game_over");
  }

  function handleNoDeal() {
    setRound((r) => r + 1);
    setOpenedThisRound(0);
    setPhase("opening");
  }

  function handleKeep() {
    const amt = cases.find((c) => c.id === playerCaseId)!.amount;
    setFinalAmount(amt);
    setEndNote("You kept your original case!");
    setPhase("game_over");
  }

  function handleSwap() {
    const other = cases.find((c) => !c.opened && c.id !== playerCaseId)!;
    setFinalAmount(other.amount);
    const playerAmt = cases.find((c) => c.id === playerCaseId)!.amount;
    setEndNote(`You swapped to case #${other.id}. Yours had ${fmt(playerAmt)}.`);
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
    setFinalAmount(0);
    setEndNote("");
    setLastOpenedAmount(null);
  }

  const lastCase = cases.find((c) => !c.opened && c.id !== playerCaseId);
  const lowAmounts = AMOUNTS.slice(0, 13);
  const highAmounts = AMOUNTS.slice(13);

  return (
    <div className="dond-root">
      <div className="dond-header">
        <button className="dond-back" onClick={onBack}>← Back</button>
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
            const gone = cases.some((c) => c.opened && c.amount === amt);
            const justOpened = lastOpenedAmount === amt;
            return (
              <div key={amt} className={`dond-amt low ${gone ? "gone" : ""} ${justOpened ? "just-opened" : ""}`}>
                {fmt(amt)}
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
                    <span className="dond-case-val">{fmtShort(c.amount)}</span>
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
            const gone = cases.some((c) => c.opened && c.amount === amt);
            const justOpened = lastOpenedAmount === amt;
            return (
              <div key={amt} className={`dond-amt high ${gone ? "gone" : ""} ${justOpened ? "just-opened" : ""}`}>
                {fmt(amt)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Banker Offer */}
      {phase === "offer" && (
        <div className="dond-overlay">
          <div className="dond-modal">
            <div className="dond-phone">📞</div>
            <p className="dond-caller">The Banker is calling…</p>
            <div className="dond-big-amt">{fmt(bankerOffer)}</div>
            <p className="dond-sublabel">THE BANKER'S OFFER</p>
            <div className="dond-actions">
              <button className="dond-btn deal" onClick={handleDeal}>DEAL!</button>
              <button className="dond-btn nodeal" onClick={handleNoDeal}>NO DEAL!</button>
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
              <button className="dond-btn deal" onClick={handleSwap}>SWAP!</button>
              <button className="dond-btn nodeal" onClick={handleKeep}>KEEP!</button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {phase === "game_over" && (
        <div className="dond-overlay">
          <div className="dond-modal">
            <h2>{dealTaken ? "Deal Taken!" : "Game Over!"}</h2>
            <div className="dond-big-amt won">{fmt(finalAmount)}</div>
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
