import { COLORS } from "../constants/theme";
import { GaugeBar } from "../components";

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
`;

const WCWI_ITEMS = [
  { icon: "🧠", title: "정신적 웰빙", tool: "WHO-5", desc: "기분, 활력, 수면", color: "#7B9E87" },
  { icon: "💜", title: "심리적 웰빙", tool: "Ryff PWB", desc: "자율성, 성장, 목적", color: "#9B7EC8" },
  { icon: "🔥", title: "번아웃/피로", tool: "CBI", desc: "소진, 피로, 과부하", color: "#E8725C" },
  { icon: "🏃", title: "신체 건강", tool: "NMQ", desc: "근골격계 통증", color: "#5BAEB7" },
  { icon: "⭐", title: "삶의 만족도", tool: "SWLS", desc: "전반적 삶의 질", color: "#C4A265" },
];

const WHY_ITEMS = [
  { num: "20%", title: "생산성 향상", desc: "웰빙을 전략적으로 관리하는 기업의 생산성 향상률", icon: "📈" },
  { num: "10%", title: "유지율 증가", desc: "체계적 웰니스 프로그램 도입 기업의 직원 유지율", icon: "🤝" },
  { num: "5조$", title: "글로벌 시장", desc: "2025년 기준 글로벌 웰니스 산업 규모", icon: "🌍" },
];

const ROLE_OPTIONS = [
  { key: "employee", icon: "👤", title: "재직자/직원", desc: "신체·정신 건강 현황과 웰니스 서비스에 대한 수요를 조사합니다.", tag: "3분 소요" },
  { key: "manager", icon: "🏢", title: "기업 관리자/HR", desc: "기업 웰니스 프로그램 운영 현황과 서비스 도입 의향을 파악합니다.", tag: "5분 소요" },
];

export default function LandingView({ fadeIn, transition, scrollToRole, onSelectRole, roleRef }) {
  return (
    <div style={{
      fontFamily: "'Noto Sans KR', 'Pretendard', -apple-system, sans-serif",
      background: COLORS.bg,
      minHeight: "100vh",
      opacity: fadeIn ? 1 : 0,
      transition: "opacity 0.3s ease",
    }}>
      <style>{GLOBAL_STYLES}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(247,245,240,0.92)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "14px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${COLORS.sage}, ${COLORS.sageLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: "#fff", fontWeight: 700,
          }}>W</div>
          <span style={{ fontSize: 20, fontWeight: 700, color: COLORS.charcoal, letterSpacing: -0.5 }}>WELLINK</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={scrollToRole}
            style={{
              padding: "10px 20px", borderRadius: 24,
              border: `1.5px solid ${COLORS.sage}`, background: "transparent",
              color: COLORS.sage, fontSize: 13, fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => { e.target.style.background = COLORS.sagePale; }}
            onMouseOut={(e) => { e.target.style.background = "transparent"; }}
          >
            수요조사
          </button>
          <button
            onClick={() => transition("mini")}
            style={{
              padding: "10px 24px", borderRadius: 24, border: "none",
              background: COLORS.sage, color: "#fff", fontSize: 14,
              fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseOver={(e) => { e.target.style.background = COLORS.sageDark; e.target.style.transform = "translateY(-1px)"; }}
            onMouseOut={(e) => { e.target.style.background = COLORS.sage; e.target.style.transform = "translateY(0)"; }}
          >
            60초 웰니스 체크 →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        paddingTop: 120, paddingBottom: 80, textAlign: "center",
        background: `linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.sagePale} 100%)`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 60, right: "10%",
          width: 300, height: 300, borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.sageLight}30 0%, transparent 70%)`,
          animation: "float 6s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: 40, left: "5%",
          width: 200, height: 200, borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.goldLight}40 0%, transparent 70%)`,
          animation: "float 8s ease-in-out infinite 1s",
        }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          <div style={{
            display: "inline-block", padding: "6px 18px", borderRadius: 20,
            background: `${COLORS.sage}15`, border: `1px solid ${COLORS.sage}30`,
            fontSize: 13, fontWeight: 500, color: COLORS.sage, marginBottom: 24,
            animation: "fadeUp 0.6s ease-out",
          }}>
            🌿 B2B 기업 웰니스 플랫폼
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 900, lineHeight: 1.2,
            color: COLORS.charcoal, marginBottom: 20, letterSpacing: -1.5,
            animation: "fadeUp 0.6s ease-out 0.1s both",
          }}>
            직원 건강이
            <br />
            <span style={{
              background: `linear-gradient(135deg, ${COLORS.sage}, ${COLORS.gold})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>기업 성과</span>가 되는 순간
          </h1>

          <p style={{
            fontSize: 18, lineHeight: 1.7, color: COLORS.warmGray,
            maxWidth: 560, margin: "0 auto 40px", fontWeight: 400,
            animation: "fadeUp 0.6s ease-out 0.2s both",
          }}>
            과학적 웰니스 지표 WCWI로 직원 건강을 측정하고,
            <br />맞춤형 프로그램으로 생산성을 높이세요.
          </p>

          <div style={{
            display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap",
            animation: "fadeUp 0.6s ease-out 0.3s both",
          }}>
            <button
              onClick={() => transition("mini")}
              style={{
                padding: "16px 36px", borderRadius: 30, border: "none",
                background: `linear-gradient(135deg, ${COLORS.sage}, ${COLORS.sageDark})`,
                color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
                boxShadow: `0 8px 30px ${COLORS.sage}40`,
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => { e.target.style.transform = "translateY(-3px)"; e.target.style.boxShadow = `0 12px 40px ${COLORS.sage}60`; }}
              onMouseOut={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = `0 8px 30px ${COLORS.sage}40`; }}
            >
              60초 무료 웰니스 체크 →
            </button>
            <button
              onClick={() => transition("full")}
              style={{
                padding: "16px 36px", borderRadius: 30,
                border: `2px solid ${COLORS.sage}40`,
                background: "transparent", color: COLORS.sage,
                fontSize: 16, fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => { e.target.style.background = `${COLORS.sage}10`; }}
              onMouseOut={(e) => { e.target.style.background = "transparent"; }}
            >
              전체 WCWI 진단 (24문항)
            </button>
          </div>
        </div>
      </section>

      {/* WCWI OVERVIEW */}
      <section style={{ padding: "80px 24px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: COLORS.charcoal, marginBottom: 12 }}>
          WCWI란?
        </h2>
        <p style={{ textAlign: "center", fontSize: 16, color: COLORS.warmGray, marginBottom: 48, maxWidth: 600, margin: "0 auto 48px" }}>
          WELLINK Corporate Wellness Index — 과학적으로 검증된 5개 도구를 재구성한 기업 맞춤형 웰니스 종합 지표
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 16 }}>
          {WCWI_ITEMS.map((item, i) => (
            <div
              key={i}
              style={{
                background: COLORS.white, borderRadius: 20, padding: 24,
                textAlign: "center", border: `1px solid ${item.color}20`,
                transition: "all 0.3s ease", cursor: "default",
                animation: `fadeUp 0.5s ease-out ${i * 0.1}s both`,
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 12px 30px ${item.color}20`; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.charcoal, marginBottom: 4 }}>{item.title}</div>
              <div style={{
                display: "inline-block", padding: "2px 10px", borderRadius: 10,
                background: `${item.color}15`, fontSize: 11, fontWeight: 600,
                color: item.color, marginBottom: 8,
              }}>{item.tool}</div>
              <div style={{ fontSize: 13, color: COLORS.warmGray }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY WELLINK */}
      <section style={{ padding: "60px 24px 80px", background: COLORS.white }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, color: COLORS.charcoal, marginBottom: 48 }}>
            왜 WELLINK인가?
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            {WHY_ITEMS.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: 32, borderRadius: 20,
                  background: `linear-gradient(135deg, ${COLORS.sagePale}, ${COLORS.cream})`,
                  border: `1px solid ${COLORS.sage}15`,
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                <div style={{
                  fontSize: 36, fontWeight: 900, color: COLORS.sage,
                  fontFamily: "'Playfair Display', serif", marginBottom: 8,
                }}>{item.num}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.charcoal, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 14, color: COLORS.warmGray, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR HR */}
      <section style={{ padding: "80px 24px", background: COLORS.bg }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: COLORS.charcoal, marginBottom: 16 }}>
            HR 담당자를 위한 대시보드
          </h2>
          <p style={{ fontSize: 15, color: COLORS.warmGray, marginBottom: 40, lineHeight: 1.7 }}>
            팀별 WCWI 평균, 프로그램 전후 개선율, 위험군 비율을
            <br />한눈에 파악하고 데이터 기반 의사결정을 내리세요.
          </p>
          <div style={{
            background: COLORS.white, borderRadius: 24, padding: 32,
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.06)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: COLORS.warmGray, marginBottom: 4 }}>회사 평균 WCWI</div>
                <div style={{ fontSize: 42, fontWeight: 900, color: COLORS.sage }}>72.4</div>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  { label: "참여율", value: "87%", color: COLORS.sage },
                  { label: "위험군", value: "12%", color: COLORS.coral },
                  { label: "개선율", value: "+15%", color: COLORS.gold },
                ].map((m, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: COLORS.warmGray, marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <GaugeBar value={78} color="#7B9E87" label="정신적 웰빙" delay={200} />
            <GaugeBar value={71} color="#9B7EC8" label="심리적 웰빙" delay={400} />
            <GaugeBar value={55} color="#E8725C" label="번아웃 (역산)" delay={600} />
            <GaugeBar value={62} color="#5BAEB7" label="신체 건강" delay={800} />
            <GaugeBar value={74} color="#C4A265" label="삶의 만족도" delay={1000} />
          </div>
        </div>
      </section>

      {/* ROLE SELECTION - 수요조사 */}
      <section ref={roleRef} style={{ padding: "80px 24px", maxWidth: 680, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.sage, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>SURVEY</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: COLORS.charcoal, lineHeight: 1.3, marginBottom: 12 }}>
            수요조사 참여하기
          </h2>
          <p style={{ fontSize: 15, color: COLORS.warmGray, lineHeight: 1.7 }}>
            더 나은 웰니스 서비스를 위해 소중한 의견을 들려주세요.<br />
            약 3~5분 소요되며, 응답은 익명으로 처리됩니다.
          </p>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {ROLE_OPTIONS.map((r) => (
            <button
              key={r.key}
              onClick={() => onSelectRole(r.key)}
              style={{
                flex: "1 1 280px", maxWidth: 320, padding: "32px 24px", borderRadius: 20,
                border: `2px solid ${COLORS.sagePale}`, background: COLORS.white,
                cursor: "pointer", textAlign: "left", transition: "all .3s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.sage; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(123,158,135,0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.sagePale; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>{r.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.charcoal, marginBottom: 8 }}>{r.title}</div>
              <div style={{ fontSize: 13, color: COLORS.warmGray, lineHeight: 1.6, marginBottom: 16 }}>{r.desc}</div>
              <span style={{
                display: "inline-block", padding: "4px 12px", borderRadius: 20,
                background: COLORS.sagePale, color: COLORS.sageDark, fontSize: 12, fontWeight: 600,
              }}>{r.tag}</span>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: "80px 24px", textAlign: "center",
        background: `linear-gradient(135deg, ${COLORS.charcoal}, #3A3A3A)`,
      }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: COLORS.white, marginBottom: 16 }}>
          지금 바로 시작하세요
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginBottom: 32, lineHeight: 1.7 }}>
          60초 미니 체크로 현재 상태를 확인하거나,
          <br />전체 WCWI 진단으로 깊이 있는 분석을 받아보세요.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => transition("mini")}
            style={{
              padding: "16px 40px", borderRadius: 30, border: "none",
              background: COLORS.sage, color: "#fff", fontSize: 16,
              fontWeight: 700, cursor: "pointer",
            }}
          >
            60초 미니 체크
          </button>
          <button
            onClick={() => transition("full")}
            style={{
              padding: "16px 40px", borderRadius: 30,
              border: `2px solid rgba(255,255,255,0.3)`,
              background: "transparent", color: "#fff", fontSize: 16,
              fontWeight: 600, cursor: "pointer",
            }}
          >
            전체 WCWI 진단
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "32px 24px", textAlign: "center", background: COLORS.bgDark }}>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          © 2025 WELLINK. 과학 기반 기업 웰니스 플랫폼.
        </div>
      </footer>
    </div>
  );
}
