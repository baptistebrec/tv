import { useState, useRef, useEffect } from "react";
import "./Roulette.css";

interface RouletteProps {
  onBack: () => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30,
  8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];
const RED_NUMBERS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const SECTOR_COUNT = 37;
const SECTOR_DEG = 360 / SECTOR_COUNT;
const CHIP_VALUES = [1, 5, 10, 25, 50, 100, 500];
const CX = 150, CY = 150, OUTER_R = 140, INNER_R = 58;

const TABLE_ROWS = [
  Array.from({ length: 12 }, (_, i) => 3 + i * 3),
  Array.from({ length: 12 }, (_, i) => 2 + i * 3),
  Array.from({ length: 12 }, (_, i) => 1 + i * 3),
];
const EVEN_BETS = [
  { k: "low",   l: "1-18",   c: "" },
  { k: "even",  l: "Pair",   c: "" },
  { k: "red",   l: "Rouge",  c: "red" },
  { k: "black", l: "Noir",   c: "black" },
  { k: "odd",   l: "Impair", c: "" },
  { k: "high",  l: "19-36",  c: "" },
];

const PLAYER_COLORS = [
  "#ef4444", // P1  red
  "#3b82f6", // P2  blue
  "#22c55e", // P3  green
  "#f59e0b", // P4  amber
  "#a855f7", // P5  purple
  "#ec4899", // P6  pink
  "#06b6d4", // P7  cyan
  "#f97316", // P8  orange
  "#84cc16", // P9  lime
  "#e2e8f0", // P10 white
];

// ── Types ────────────────────────────────────────────────────────────────────

type NumColor = "red" | "black" | "green";
// playerBets[playerIdx][betKey] = amount
type AllBets = Record<number, Record<string, number>>;
type RoundResult = { idx: number; net: number; won: number; totalBet: number };

// ── Pure helpers ─────────────────────────────────────────────────────────────

function numColor(n: number): NumColor {
  if (n === 0) return "green";
  return RED_NUMBERS.has(n) ? "red" : "black";
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arc(cx: number, cy: number, ro: number, ri: number, a1: number, a2: number) {
  const s = polar(cx, cy, ro, a1), e = polar(cx, cy, ro, a2);
  const si = polar(cx, cy, ri, a2), ei = polar(cx, cy, ri, a1);
  const lg = a2 - a1 > 180 ? 1 : 0;
  return `M${s.x} ${s.y}A${ro} ${ro} 0 ${lg} 1 ${e.x} ${e.y}L${si.x} ${si.y}A${ri} ${ri} 0 ${lg} 0 ${ei.x} ${ei.y}Z`;
}

function calcWinnings(bets: Record<string, number>, r: number): number {
  const c = numColor(r);
  return Object.entries(bets).reduce((total, [key, amt]) => {
    let m = 0;
    if (key.startsWith("num_") && +key.slice(4) === r) m = 36;
    else if (key === "red"    && c === "red")               m = 2;
    else if (key === "black"  && c === "black")             m = 2;
    else if (key === "odd"    && r && r % 2 === 1)          m = 2;
    else if (key === "even"   && r && r % 2 === 0)          m = 2;
    else if (key === "low"    && r >= 1  && r <= 18)        m = 2;
    else if (key === "high"   && r >= 19 && r <= 36)        m = 2;
    else if (key === "dozen1" && r >= 1  && r <= 12)        m = 3;
    else if (key === "dozen2" && r >= 13 && r <= 24)        m = 3;
    else if (key === "dozen3" && r >= 25 && r <= 36)        m = 3;
    else if (key === "col1"   && r && r % 3 === 1)          m = 3;
    else if (key === "col2"   && r && r % 3 === 2)          m = 3;
    else if (key === "col3"   && r && r % 3 === 0)          m = 3;
    return total + amt * m;
  }, 0);
}

// ── Component ────────────────────────────────────────────────────────────────

export function Roulette({ onBack }: RouletteProps) {
  const [playerBets, setPlayerBets] = useState<AllBets>({});
  const [activePlayer, setActivePlayer] = useState<number | null>(null);
  const [chip, setChip] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [roundResults, setRoundResults] = useState<RoundResult[] | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const anyBet = Object.values(playerBets).some(b => Object.keys(b).length > 0);
  const activeBets = activePlayer !== null ? (playerBets[activePlayer] ?? {}) : {};

  function togglePlayer(idx: number) {
    setActivePlayer(p => p === idx ? null : idx);
  }

  function addBet(key: string) {
    if (activePlayer === null || spinning) return;
    setPlayerBets(prev => ({
      ...prev,
      [activePlayer]: { ...(prev[activePlayer] ?? {}), [key]: ((prev[activePlayer] ?? {})[key] ?? 0) + chip },
    }));
  }

  function removeBet(key: string) {
    if (activePlayer === null || spinning) return;
    setPlayerBets(prev => {
      const pb = { ...(prev[activePlayer] ?? {}) };
      if ((pb[key] ?? 0) <= chip) delete pb[key]; else pb[key] -= chip;
      return { ...prev, [activePlayer]: pb };
    });
  }

  function spin() {
    if (!anyBet || spinning) return;
    const r = Math.floor(Math.random() * SECTOR_COUNT);
    const idx = WHEEL_ORDER.indexOf(r);
    const targetMod = ((-((idx + 0.5) * SECTOR_DEG)) % 360 + 360) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    let delta = targetMod - currentMod;
    if (delta <= 0) delta += 360;

    setSpinning(true);
    setRoundResults(null);
    setRotation(rotation + 5 * 360 + delta);

    timer.current = setTimeout(() => {
      setLastResult(r);
      setHistory(h => [r, ...h.slice(0, 19)]);
      const res: RoundResult[] = Object.entries(playerBets).map(([pidx, bets]) => {
        const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);
        const won = calcWinnings(bets, r);
        return { idx: +pidx, net: won - totalBet, won, totalBet };
      });
      setRoundResults(res.sort((a, b) => b.net - a.net));
      setPlayerBets({});
      setSpinning(false);
    }, 5300);
  }

  // SVG wheel
  const sectors = WHEEL_ORDER.map((n, i) => {
    const a1 = i * SECTOR_DEG - 90, a2 = (i + 1) * SECTOR_DEG - 90;
    const mid = a1 + SECTOR_DEG / 2;
    const fill = n === 0 ? "#047857" : RED_NUMBERS.has(n) ? "#991b1b" : "#1c1917";
    const { x: tx, y: ty } = polar(CX, CY, (OUTER_R + INNER_R) / 2, mid);
    return (
      <g key={n}>
        <path d={arc(CX, CY, OUTER_R, INNER_R, a1, a2)} fill={fill} stroke="#292524" strokeWidth={0.8} />
        <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
          fontSize={8} fill="white" fontWeight="bold"
          transform={`rotate(${mid + 90},${tx},${ty})`}
        >{n}</text>
      </g>
    );
  });

  const activeColor = activePlayer !== null ? PLAYER_COLORS[activePlayer] : undefined;

  return (
    <div className="rl-root">
      <button className="back-btn" onClick={onBack}>← Retour</button>

      <div className="rl-layout">

        {/* ── LEFT: wheel ── */}
        <div className="rl-wheel-side">
          <h1 className="rl-title">🎰 Roulette</h1>
          <div className="rl-wheel-wrap">
            <svg width={300} height={300} viewBox="0 0 300 300">
              <circle cx={CX} cy={CY} r={OUTER_R + 7} fill="#78350f" stroke="#451a03" strokeWidth={3} />
              <g
                className={spinning ? "rl-spinning" : ""}
                style={{ transform: `rotate(${rotation}deg)`, transformOrigin: `${CX}px ${CY}px` }}
              >
                {sectors}
              </g>
              <circle cx={CX} cy={CY} r={INNER_R - 2} fill="#1c0a00" stroke="#78350f" strokeWidth={2} />
              <circle cx={CX} cy={CY} r={18} fill="#78350f" />
              <circle cx={CX} cy={CY} r={8}  fill="#fbbf24" />
              <polygon
                points={`${CX - 9},${CY - OUTER_R - 3} ${CX + 9},${CY - OUTER_R - 3} ${CX},${CY - OUTER_R + 14}`}
                fill="#fbbf24" stroke="#92400e" strokeWidth={1}
              />
            </svg>
          </div>

          {lastResult !== null && (
            <div className={`rl-result-ball rl-${numColor(lastResult)}`}>{lastResult}</div>
          )}

          {history.length > 0 && (
            <div className="rl-history">
              {history.map((n, i) => (
                <span key={i} className={`rl-hist rl-${numColor(n)}`}>{n}</span>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: players + table ── */}
        <div className="rl-table-side">

          {/* Player buttons */}
          <div className="rl-players">
            {PLAYER_COLORS.map((color, i) => (
              <button
                key={i}
                className={`rl-player-btn ${activePlayer === i ? "active" : ""}`}
                style={{ "--pcolor": color } as React.CSSProperties}
                onClick={() => togglePlayer(i)}
                disabled={spinning}
              >
                P{i + 1}
              </button>
            ))}
          </div>

          {/* Active player indicator + chip selector */}
          {activePlayer !== null && (
            <div className="rl-active-bar" style={{ borderColor: activeColor, color: activeColor }}>
              <span className="rl-active-label">P{activePlayer + 1}</span>
              <div className="rl-chips">
                {CHIP_VALUES.map(v => (
                  <button
                    key={v}
                    className={`rl-chip ${chip === v ? "sel" : ""}`}
                    style={{ "--pcolor": activeColor } as React.CSSProperties}
                    onClick={() => setChip(v)}
                  >{v}</button>
                ))}
              </div>
              <button
                className="rl-clear-player"
                style={{ "--pcolor": activeColor } as React.CSSProperties}
                onClick={() => setPlayerBets(prev => { const n = { ...prev }; delete n[activePlayer]; return n; })}
                disabled={spinning || !Object.keys(activeBets).length}
              >✕ Effacer P{activePlayer + 1}</button>
            </div>
          )}

          {/* Round results */}
          {roundResults && lastResult !== null && (
            <div className="rl-round-results">
              <span className={`rl-rr-num rl-${numColor(lastResult)}`}>{lastResult}</span>
              {roundResults.map(({ idx, net, won, totalBet }) => (
                <div key={idx} className={`rl-rr-row ${net > 0 ? "win" : net < 0 ? "lose" : "push"}`}
                  style={{ "--pcolor": PLAYER_COLORS[idx] } as React.CSSProperties}
                >
                  <span className="rl-rr-dot" />
                  <span className="rl-rr-name">P{idx + 1}</span>
                  <span className="rl-rr-detail">
                    {net > 0
                      ? `🎉 +${net} (gagné ${won} / misé ${totalBet})`
                      : `😞 −${totalBet}`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Betting table */}
          <div
            className="rl-table"
            style={activeColor ? { "--active-color": activeColor } as React.CSSProperties : undefined}
          >
            <div className="rl-zero-row">
              <BetCell bkey="num_0" col="green" allBets={playerBets} activeBets={activeBets} activePlayer={activePlayer} onAdd={addBet} onRemove={removeBet}>0</BetCell>
            </div>
            <div className="rl-nums">
              {TABLE_ROWS.map((row, ri) => (
                <div key={ri} className="rl-num-row">
                  {row.map(n => (
                    <BetCell key={n} bkey={`num_${n}`} col={numColor(n)} allBets={playerBets} activeBets={activeBets} activePlayer={activePlayer} onAdd={addBet} onRemove={removeBet}>
                      {n}
                    </BetCell>
                  ))}
                  <BetCell bkey={`col${3 - ri}`} col="outside" allBets={playerBets} activeBets={activeBets} activePlayer={activePlayer} onAdd={addBet} onRemove={removeBet}>2:1</BetCell>
                </div>
              ))}
            </div>
            <div className="rl-outside rl-dozens">
              {(["dozen1","dozen2","dozen3"] as const).map((k, i) => (
                <BetCell key={k} bkey={k} col="outside" allBets={playerBets} activeBets={activeBets} activePlayer={activePlayer} onAdd={addBet} onRemove={removeBet}>
                  {["1-12","13-24","25-36"][i]}
                </BetCell>
              ))}
            </div>
            <div className="rl-outside rl-evens">
              {EVEN_BETS.map(({ k, l, c }) => (
                <BetCell key={k} bkey={k} col={(c || "outside") as NumColor | "outside"} allBets={playerBets} activeBets={activeBets} activePlayer={activePlayer} onAdd={addBet} onRemove={removeBet}>
                  {l}
                </BetCell>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="rl-actions">
            <button className="rl-clear" onClick={() => setPlayerBets({})} disabled={spinning || !anyBet}>
              Tout effacer
            </button>
            <button className="rl-spin" onClick={spin} disabled={spinning || !anyBet}>
              {spinning ? "⏳ En jeu…" : "🎲 Lancer !"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── BetCell ──────────────────────────────────────────────────────────────────

function BetCell({
  bkey, col, allBets, activeBets, activePlayer, onAdd, onRemove, children,
}: {
  bkey: string;
  col: NumColor | "outside";
  allBets: AllBets;
  activeBets: Record<string, number>;
  activePlayer: number | null;
  onAdd: (k: string) => void;
  onRemove: (k: string) => void;
  children: React.ReactNode;
}) {
  // Collect chips from all players on this cell
  const chips = Object.entries(allBets)
    .map(([pidx, bets]) => ({ idx: +pidx, amount: bets[bkey] }))
    .filter(c => c.amount > 0);

  const activeAmt = activeBets[bkey];

  return (
    <div
      className={`rl-cell rl-${col} ${chips.length > 0 ? "rl-betted" : ""}`}
      style={activeAmt
        ? { boxShadow: `0 0 0 2px ${PLAYER_COLORS[activePlayer!]}` }
        : undefined}
      onClick={() => onAdd(bkey)}
      onContextMenu={e => { e.preventDefault(); onRemove(bkey); }}
    >
      {children}
      {chips.length > 0 && (
        <div className="rl-chips-cluster">
          {chips.map(({ idx, amount }) => (
            <span
              key={idx}
              className="rl-pchip"
              style={{ background: PLAYER_COLORS[idx], color: idx === 9 ? "#111" : "#fff" }}
            >
              {amount}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
