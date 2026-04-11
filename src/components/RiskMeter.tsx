"use client";

import { useEffect, useRef } from "react";
import type { Analysis } from "@/lib/types";

const LEVEL_COLORS: Record<Analysis["riskLevel"], string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

const LEVEL_LABELS: Record<Analysis["riskLevel"], string> = {
  low: "Low Risk",
  medium: "Medium Risk",
  high: "High Risk",
  critical: "Critical Risk",
};

interface RiskMeterProps {
  score: number;
  level: Analysis["riskLevel"];
}

export function RiskMeter({ score, level }: RiskMeterProps) {
  const arcRef = useRef<SVGPathElement>(null);
  const color = LEVEL_COLORS[level];

  // SVG arc gauge: 180° sweep from left to right
  const R = 80;
  const cx = 100;
  const cy = 100;
  const startAngle = Math.PI; // 180°
  const endAngle = 2 * Math.PI; // 360°
  const totalAngle = endAngle - startAngle;

  const toXY = (angle: number) => ({
    x: cx + R * Math.cos(angle),
    y: cy + R * Math.sin(angle),
  });

  const bgStart = toXY(startAngle);
  const bgEnd = toXY(endAngle);
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${R} ${R} 0 1 1 ${bgEnd.x} ${bgEnd.y}`;

  const fillAngle = startAngle + (score / 100) * totalAngle;
  const fillEnd = toXY(fillAngle);
  const largeArc = fillAngle - startAngle > Math.PI ? 1 : 0;
  const fillPath =
    score === 0
      ? ""
      : `M ${bgStart.x} ${bgStart.y} A ${R} ${R} 0 ${largeArc} 1 ${fillEnd.x} ${fillEnd.y}`;

  // Needle
  const needleAngle = startAngle + (score / 100) * totalAngle;
  const needleLen = 60;
  const needleX = cx + needleLen * Math.cos(needleAngle);
  const needleY = cy + needleLen * Math.sin(needleAngle);

  // Animate arc on mount
  useEffect(() => {
    const el = arcRef.current;
    if (!el || score === 0) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    el.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)";
    requestAnimationFrame(() => {
      el.style.strokeDashoffset = "0";
    });
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 200 115" className="w-64 h-auto overflow-visible">
        {/* Background arc */}
        <path
          d={bgPath}
          fill="none"
          stroke="currentColor"
          strokeWidth="14"
          strokeLinecap="round"
          className="text-foreground/10"
        />
        {/* Filled arc */}
        {score > 0 && (
          <path
            ref={arcRef}
            d={fillPath}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        )}
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transition: "all 1.2s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
        <circle cx={cx} cy={cy} r="6" fill={color} />

        {/* Score label */}
        <text
          x={cx}
          y={cy - 14}
          textAnchor="middle"
          fontSize="28"
          fontWeight="700"
          fontFamily="var(--font-mono)"
          fill={color}
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize="10"
          fill="currentColor"
          opacity="0.5"
          fontFamily="var(--font-body)"
        >
          / 100
        </text>
      </svg>

      <div
        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold"
        style={{ background: `${color}20`, color }}
      >
        <span
          className="size-2 rounded-full"
          style={{ background: color }}
        />
        {LEVEL_LABELS[level]}
      </div>
    </div>
  );
}
