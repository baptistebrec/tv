import { useState, useRef } from "react";
import "./FortuneWheel.css";

const SEGMENTS = [
  { label: "Jackpot! 🎉", color: "#f59e0b" },
  { label: "Try Again", color: "#6366f1" },
  { label: "Double Points", color: "#10b981" },
  { label: "Bonus Round 🎯", color: "#ef4444" },
  { label: "Lose a Turn", color: "#8b5cf6" },
  { label: "Wild Card 🃏", color: "#0891b2" },
  { label: "Free Spin", color: "#f43f5e" },
  { label: "Big Prize 🏆", color: "#84cc16" },
];

const SIZE = 400;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 185;
const SEG_ANGLE = 360 / SEGMENTS.length;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

// Build an SVG arc path for segment at index i
function segmentPath(i: number): string {
  const startDeg = i * SEG_ANGLE - 90; // -90 so segment 0 starts at top
  const endDeg = startDeg + SEG_ANGLE;
  const x1 = CX + R * Math.cos(toRad(startDeg));
  const y1 = CY + R * Math.sin(toRad(startDeg));
  const x2 = CX + R * Math.cos(toRad(endDeg));
  const y2 = CY + R * Math.sin(toRad(endDeg));
  const largeArc = SEG_ANGLE > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

// Center position + text rotation for each segment label
function labelTransform(i: number) {
  const midDeg = i * SEG_ANGLE - 90 + SEG_ANGLE / 2;
  const dist = R * 0.65;
  const x = CX + dist * Math.cos(toRad(midDeg));
  const y = CY + dist * Math.sin(toRad(midDeg));
  return { x, y, rotate: midDeg + 90 };
}

export function FortuneWheel({ onBack }: { onBack: () => void }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const accumulated = useRef(0);

  function spin() {
    if (spinning) return;
    setResult(null);
    setSpinning(true);

    const winIndex = Math.floor(Math.random() * SEGMENTS.length);
    // Angle of the winning segment's center from top (clockwise)
    const targetAngle = winIndex * SEG_ANGLE + SEG_ANGLE / 2;
    // How much extra to add so we land exactly on targetAngle
    const currentMod = accumulated.current % 360;
    const extra = ((targetAngle - currentMod) + 360) % 360;
    const finalRotation = accumulated.current + 5 * 360 + extra;

    accumulated.current = finalRotation;
    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(SEGMENTS[winIndex].label);
    }, 4200);
  }

  return (
    <div className="fw-root">
      <button className="fw-back" onClick={onBack}>
        ← Back to Hub
      </button>

      <h1 className="fw-title">🎡 Fortune Wheel</h1>

      <div className="fw-wrap">
        <div className="fw-pointer" />
        <svg
          className="fw-wheel"
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {SEGMENTS.map((seg, i) => {
            const { x, y, rotate } = labelTransform(i);
            return (
              <g key={i}>
                <path
                  d={segmentPath(i)}
                  fill={seg.color}
                  stroke="#0f172a"
                  strokeWidth={2}
                />
                <text
                  x={x}
                  y={y}
                  fill="#fff"
                  fontSize={11.5}
                  fontWeight="700"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${rotate}, ${x}, ${y})`}
                >
                  {seg.label}
                </text>
              </g>
            );
          })}
          {/* Center hub */}
          <circle
            cx={CX}
            cy={CY}
            r={22}
            fill="#0f172a"
            stroke="#64748b"
            strokeWidth={3}
          />
        </svg>
      </div>

      <button className="fw-spin-btn" onClick={spin} disabled={spinning}>
        {spinning ? "Spinning…" : "SPIN"}
      </button>

      {result && (
        <div className="fw-result">
          <span>{result}</span>
        </div>
      )}
    </div>
  );
}
