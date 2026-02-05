import { useState, useEffect } from "react";
import { COLORS } from "../constants/theme";

function getLevel(value) {
  if (value >= 75) return { text: "양호", emoji: "✅" };
  if (value >= 50) return { text: "보통", emoji: "⚠️" };
  return { text: "주의", emoji: "🔴" };
}

/**
 * 영역별 점수 게이지 바 (레이블 + 레벨 표시)
 */
export default function GaugeBar({ value, color, label, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  const level = getLevel(value);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.charcoal }}>{label}</span>
        <span style={{ fontSize: 13, color: COLORS.warmGray }}>
          {level.emoji} {value}점 · {level.text}
        </span>
      </div>
      <div style={{ height: 10, background: "#E8E5DE", borderRadius: 5, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            borderRadius: 5,
            transition: "width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        />
      </div>
    </div>
  );
}
