import { COLORS } from "../constants/theme";

/**
 * 수요조사 필드 렌더러 (likert, chip, multi, textarea)
 */
export function SurveyField({ field, value, onChange }) {
  const { key, type, opts = [], placeholder } = field;

  if (type === "likert") {
    return (
      <div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", margin: "16px 0" }}>
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              onClick={() => onChange(key, v)}
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                border: `2px solid ${value === v ? COLORS.sage : "#eee"}`,
                background: value === v ? COLORS.sagePale : "#fff",
                fontSize: 18,
                fontWeight: 700,
                color: value === v ? COLORS.sageDark : COLORS.warmGray,
                cursor: "pointer",
                transition: "all .2s",
              }}
            >
              {v}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.warmGray }}>
          <span>전혀 아니다</span>
          <span>매우 그렇다</span>
        </div>
      </div>
    );
  }

  if (type === "chip") {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        {opts.map((o) => (
          <button
            key={o}
            onClick={() => onChange(key, o)}
            style={{
              padding: "10px 18px",
              borderRadius: 20,
              border: `2px solid ${value === o ? COLORS.sage : "#eee"}`,
              background: value === o ? COLORS.sagePale : "#fff",
              color: value === o ? COLORS.sageDark : COLORS.charcoal,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all .2s",
            }}
          >
            {value === o ? "✓ " : ""}{o}
          </button>
        ))}
      </div>
    );
  }

  if (type === "multi") {
    const selected = value || [];
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        {opts.map((o) => {
          const sel = selected.includes(o);
          return (
            <button
              key={o}
              onClick={() => {
                const next = sel ? selected.filter((x) => x !== o) : [...selected, o];
                onChange(key, next);
              }}
              style={{
                padding: "10px 18px",
                borderRadius: 20,
                border: `2px solid ${sel ? COLORS.sage : "#eee"}`,
                background: sel ? COLORS.sagePale : "#fff",
                color: sel ? COLORS.sageDark : COLORS.charcoal,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all .2s",
              }}
            >
              {sel ? "✓ " : ""}{o}
            </button>
          );
        })}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <textarea
        value={value || ""}
        onChange={(e) => onChange(key, e.target.value)}
        placeholder={placeholder || "편하게 작성해주세요."}
        style={{
          width: "100%",
          minHeight: 100,
          padding: 16,
          borderRadius: 12,
          border: "2px solid #eee",
          fontSize: 14,
          resize: "vertical",
          fontFamily: "inherit",
          marginTop: 12,
          outline: "none",
        }}
        onFocus={(e) => { e.target.style.borderColor = COLORS.sage; }}
        onBlur={(e) => { e.target.style.borderColor = "#eee"; }}
      />
    );
  }

  return null;
}
