import { COLORS } from "../constants/theme";

const LABELS = {
  mental: "정신",
  psychological: "심리",
  burnout: "번아웃",
  physical: "신체",
  satisfaction: "만족도",
};

const CATEGORY_COLORS = {
  mental: "#7B9E87",
  psychological: "#9B7EC8",
  burnout: "#E8725C",
  physical: "#5BAEB7",
  satisfaction: "#C4A265",
};

/**
 * WCWI 5개 영역 레이더 차트
 */
export default function RadarChart({ scores, size }) {
  // 반응형 크기: 모바일 작게, 데스크탑 크게
  const responsiveSize = size || "clamp(240px, 35vw, 280px)";
  const numericSize = typeof responsiveSize === "string" ? 280 : responsiveSize;
  
  // 카테고리 순서를 명시적으로 정의 (오각형을 위해 5개 고정)
  const categoryOrder = ["mental", "psychological", "burnout", "physical", "satisfaction"];
  const categories = categoryOrder.filter(cat => scores.hasOwnProperty(cat));
  const n = categories.length;
  const center = numericSize / 2;
  const radius = numericSize / 2 - 40;

  const getPoint = (i, val) => {
    // 5개 카테고리를 오각형으로 배치: 각도 간격 72도 (360/5), 시작 각도 -90도 (위쪽부터)
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (val / 100) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <svg width="100%" height="auto" viewBox={`0 0 ${numericSize} ${numericSize}`} style={{ maxWidth: responsiveSize, maxHeight: responsiveSize }}>
      {gridLevels.map((level) => {
        const pts = categories.map((_, i) => getPoint(i, level));
        return (
          <polygon
            key={level}
            points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#E0DDD5"
            strokeWidth={level === 100 ? 1.5 : 0.5}
            opacity={0.6}
          />
        );
      })}
      {categories.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#E0DDD5" strokeWidth={0.5} />;
      })}
      <polygon
        points={categories.map((c, i) => {
          const p = getPoint(i, scores[c]);
          return `${p.x},${p.y}`;
        }).join(" ")}
        fill="rgba(123, 158, 135, 0.2)"
        stroke={COLORS.sage}
        strokeWidth={2.5}
      />
      {categories.map((c, i) => {
        const p = getPoint(i, scores[c]);
        return <circle key={c} cx={p.x} cy={p.y} r={5} fill={CATEGORY_COLORS[c]} stroke="#fff" strokeWidth={2} />;
      })}
      {categories.map((c, i) => {
        const p = getPoint(i, 115);
        return (
          <text key={c} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="600" fill={CATEGORY_COLORS[c]}>
            {LABELS[c]}
          </text>
        );
      })}
    </svg>
  );
}
