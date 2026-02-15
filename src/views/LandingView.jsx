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
  { icon: "🧠", title: "정신적 웰빙", tool: "WHO-5", desc: "기분, 활력, 수면의 질",  color: "#7B9E87" },
  { icon: "💜", title: "심리적 웰빙", tool: "Ryff PWB", desc: "자율성, 성장, 관계, 목적",  color: "#9B7EC8" },
  { icon: "🔥", title: "번아웃/피로", tool: "CBI", desc: "피로, 소진, 업무 과부하", color: "#E8725C" },
  { icon: "🏃", title: "신체·근골격", tool: "NMQ", desc: "근골격계 통증", color: "#5BAEB7" },
  { icon: "⭐", title: "삶의 만족도", tool: "SWLS", desc: "전반적 삶의 질과 만족감", color: "#C4A265" },
];

const ROI_ITEMS = [
  { num: "$2.71", sub: "투자 대비 수익", desc: "웰니스 프로그램에 1달러 투자 시 생산성 향상으로 돌아오는 금액", source: "Harvard Business Review", icon: "💰" },
  { num: "25%", sub: "결근률 감소", desc: "체계적 웰니스 프로그램을 운영하는 기업의 결근률 감소 수치", source: "CDC 연구", icon: "📊" },
  { num: "20%", sub: "생산성 향상", desc: "직원 웰빙을 전략적으로 관리하는 기업의 전체 생산성 향상률", source: "Global Wellness Institute", icon: "📈" },
  { num: "33%", sub: "이직률 감소", desc: "높은 웰빙 수준을 가진 기업이 경험하는 자발적 이직률 감소", source: "25M+ 근로자 글로벌 데이터", icon: "🤝" },
];

const FAQ_CONCERN_ITEMS = [
  { q: "개인정보 유출이 걱정됩니다.", a: "WELLINK은 개인식별 정보를 최소한으로 수집하며, 기업에는 익명화된 팀 단위 통계만 제공합니다. 민감 정보(인종, 종교, 의료기록 등)는 절대 수집하지 않습니다." },
  { q: "기존 복지 프로그램과 중복되지 않나요?", a: "WELLINK은 기존 프로그램을 '대체'하지 않고 '연결'합니다. 데이터로 어떤 프로그램이 필요한지 파악하고, 최적의 솔루션을 추천해 드립니다." },
  { q: "도입 효과를 어떻게 증명하나요?", a: "프로그램 전후 WCWI 점수 비교, 영역별 개선율, 위험군 변화 추이를 대시보드로 실시간 확인할 수 있습니다. 경영진에게 보고할 수 있는 리포트도 자동 생성됩니다." },
];

const STEP_ITEMS = [
  { step: "01", title: "측정하기", desc: "WCWI 설문으로 직원들의 현재 웰니스 상태를 5개 영역에서 정밀 측정합니다.", icon: "📋", time: "5분" },
  { step: "02", title: "분석하기", desc: "AI 기반 분석으로 위험군을 선별하고 팀별 취약 영역을 대시보드에서 확인합니다.", icon: "🔍", time: "실시간" },
  { step: "03", title: "개선하기", desc: "데이터에 기반한 맞춤 웰니스 프로그램을 제공,추천 받고 전후 변화를 추적합니다.", icon: "🎯", time: "지속적" },
];

const VALUE_ITEMS = [
  { num: "01", title: "보이지 않던 문제를 숫자로 봅니다", desc: "번아웃 위험군 12%, 근골격계 통증 호소율 43% — 막연한 짐작이 아닌 정확한 데이터로 현황을 파악합니다.", color: COLORS.sage },
  { num: "02", title: "맞춤 프로그램으로 실질적 개선을", desc: "WCWI 결과에 따라 필라테스, 명상, 스트레칭 등 개인별·팀별 최적화된 웰니스 콘텐츠를 추천,제공합니다.", color: "#9B7EC8" },
  { num: "03", title: "경영진에게 ROI를 증명합니다", desc: "프로그램 전후 점수 비교, 위험군 변화 추이 리포트를 자동 생성해 웰니스 투자의 효과를 입증합니다.", color: COLORS.gold },
  { num: "04", title: "법적 의무를 스마트하게 충족합니다", desc: "산업안전보건법 상 근로자 정신건강 관리 의무를 데이터 기반으로 이행하고 기록으로 남깁니다.", color: "#5BAEB7" },
  { num: "05", title: "직원 만족도와 유지율이 올라갑니다", desc: "87%의 근로자가 건강·웰니스와 같은 복지혜택을 기준으로 직장을 선택합니다. 웰니스 투자는 인재 유치의 핵심입니다.", color: COLORS.coral },
];

const RECOMMEND_ITEMS = [
  { icon: "🏢", title: "HR 담당자", desc: "직원 웰니스 현황을 데이터로 파악하고 복지 예산을 효율적으로 집행하고 싶은 분" },
  { icon: "👔", title: "경영진/CEO", desc: "생산성 향상과 이직률 감소를 위해 과학적 웰니스 전략을 도입하고 싶은 분" },
  { icon: "🏥", title: "산업보건 담당", desc: "산안법 정신건강 관리 의무를 체계적으로 이행하고 기록으로 관리하고 싶은 분" },
  { icon: "👤", title: "직장인 개인", desc: "자신의 번아웃 수준, 신체 건강, 삶의 만족도를 객관적으로 확인하고 싶은 분" },
];

const FAQ_ITEMS = [
  { q: "WCWI는 의료적 진단인가요?", a: "아닙니다. WCWI는 비의료적 웰니스 자가 평가 도구입니다. 의학적 진단이나 치료를 대체하지 않으며, 건강 상태에 대한 참고 지표로만 활용됩니다. 심각한 증상이 있으시면 반드시 전문 의료기관을 방문해 주세요." },
  { q: "설문 결과는 누구에게 공개되나요?", a: "개인 결과는 본인에게만 제공됩니다. 기업 대시보드에는 팀 단위 익명 통계만 표시되며, 개인을 특정할 수 있는 정보는 제공하지 않습니다." },
  { q: "어떤 규모의 기업이 사용할 수 있나요?", a: "직원 10명 이하의 소규모 팀부터 200명 이상의 기업까지 모두 적합합니다." },
  { q: "도입 비용은 어느 정도인가요?", a: "기업 규모와 계약 조건에 따라 달라지며, 인당 합리적인 구독 모델로 운영됩니다. 무료 파일럿 프로그램도 제공하고 있으니 부담 없이 문의해 주세요." },
  { q: "기존 EAP나 복지 프로그램과 병행 가능한가요?", a: "물론입니다. WELLINK은 기존 프로그램을 보완하는 데이터 레이어 역할을 합니다. 어떤 영역에서 개선이 필요한지 파악하여 기존 복지 프로그램의 효과를 극대화합니다." },
];

const ROLE_OPTIONS = [
  { key: "employee", icon: "👤", title: "재직자/직원", desc: "신체·정신 건강 현황과 웰니스 서비스에 대한 수요를 조사합니다.", tag: "3분 소요" },
  { key: "manager", icon: "🏢", title: "기업 관리자/HR", desc: "기업 웰니스 프로그램 운영 현황과 서비스 도입 의향을 파악합니다.", tag: "3분 소요" },
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
        borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "clamp(12px, 2vw, 14px) clamp(16px, 4vw, 32px)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        width: "100%", maxWidth: "100%",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: "clamp(28px, 4.5vw, 36px)", height: "clamp(28px, 4.5vw, 36px)", borderRadius: 10,
            background: `linear-gradient(135deg, ${COLORS.sage}, ${COLORS.sageLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "clamp(14px, 2.25vw, 18px)", color: "#fff", fontWeight: 700,
          }}>W</div>
          <span style={{ fontSize: "clamp(16px, 2.5vw, 20px)", fontWeight: 700, color: COLORS.charcoal, letterSpacing: -0.5 }}>WELLINK</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={scrollToRole}
            style={{
              padding: "clamp(8px, 1.5vw, 10px) clamp(16px, 2.5vw, 20px)", borderRadius: 24,
              border: `1.5px solid ${COLORS.sage}`, background: "transparent",
              color: COLORS.sage, fontSize: "clamp(12px, 1.5vw, 13px)", fontWeight: 600, cursor: "pointer",
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
              padding: "clamp(8px, 1.5vw, 10px) clamp(20px, 3vw, 24px)", borderRadius: 24, border: "none",
              background: COLORS.sage, color: "#fff", fontSize: "clamp(13px, 1.75vw, 14px)",
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
        paddingTop: "clamp(80px, 12vw, 120px)", paddingBottom: "clamp(40px, 8vw, 80px)", textAlign: "center",
        background: `linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.sagePale} 100%)`,
        position: "relative", overflow: "hidden", width: "100%", maxWidth: "100%",
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

        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "min(100%, 1200px)", margin: "0 auto", padding: "clamp(16px, 4vw, 24px)" }}>
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
            fontSize: "clamp(16px, 2vw, 18px)", lineHeight: 1.7, color: COLORS.warmGray,
            width: "100%", maxWidth: "min(100%, 700px)", margin: "0 auto 40px", fontWeight: 400,
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
                padding: "clamp(14px, 2vw, 16px) clamp(28px, 4.5vw, 36px)", borderRadius: 30, border: "none",
                background: `linear-gradient(135deg, ${COLORS.sage}, ${COLORS.sageDark})`,
                color: "#fff", fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 700, cursor: "pointer",
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
                padding: "clamp(14px, 2vw, 16px) clamp(28px, 4.5vw, 36px)", borderRadius: 30,
                border: `2px solid ${COLORS.sage}40`,
                background: "transparent", color: COLORS.sage,
                fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => { e.target.style.background = `${COLORS.sage}10`; }}
              onMouseOut={(e) => { e.target.style.background = "transparent"; }}
            >
              전체 WCWI 진단
            </button>
          </div>
        </div>
      </section>

      {/* WCWI OVERVIEW */}
      <section style={{ padding: "clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px)", width: "100%", maxWidth: "100%", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, color: COLORS.charcoal, marginBottom: 12 }}>
          WCWI란?
        </h2>
        <p style={{ textAlign: "center", fontSize: "clamp(14px, 2vw, 16px)", color: COLORS.warmGray, marginBottom: 48, width: "100%", maxWidth: "min(100%, 800px)", margin: "0 auto 48px" }}>
          WELLINK Corporate Wellness Index — 기업 웰니스의 새로운 기준이 될 과학 기반 종합 지표
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))", gap: "clamp(12px, 2vw, 16px)", width: "100%" }}>
          {WCWI_ITEMS.map((item, i) => (
            <div
              key={i}
              style={{
                background: COLORS.white, borderRadius: 20, padding: "clamp(16px, 3vw, 24px)",
                textAlign: "center", border: `1px solid ${item.color}20`,
                transition: "all 0.3s ease", cursor: "default",
                animation: `fadeUp 0.5s ease-out ${i * 0.1}s both`, width: "100%",
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 12px 30px ${item.color}20`; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: "clamp(28px, 4.5vw, 36px)", marginBottom: 12 }}>{item.icon}</div>
              <div style={{ fontSize: "clamp(14px, 1.875vw, 15px)", fontWeight: 700, color: COLORS.charcoal, marginBottom: 4 }}>{item.title}</div>
              <div style={{
                display: "inline-block", padding: "2px clamp(8px, 1.25vw, 10px)", borderRadius: 10,
                background: `${item.color}15`, fontSize: "clamp(10px, 1.375vw, 11px)", fontWeight: 600,
                color: item.color, marginBottom: 8,
              }}>{item.tool}</div>
              <div style={{ fontSize: "clamp(12px, 1.625vw, 13px)", color: COLORS.warmGray }}>{item.desc}</div>
              {item.detail && (
                <div style={{ fontSize: "clamp(11px, 1.375vw, 12px)", color: COLORS.warmGray, marginTop: 8, fontStyle: "italic" }}>{item.detail}</div>
              )}
            </div>
          ))}
        </div>
        <p style={{
          textAlign: "center", fontSize: "clamp(14px, 1.8vw, 16px)", color: COLORS.warmGray,
          marginTop: 32, lineHeight: 1.7, width: "100%", maxWidth: "min(100%, 700px)", margin: "32px auto 0",
          fontStyle: "italic",
        }}>
          저희 WELLINK가 개발한 WCWI v1.0 (Beta)는
          <br />
          WHO-5, Ryff PWB, CBI, NMQ, SWLS 등 국제 검증 도구를 한국 직장인들의 업무환경에 맞게, 재구성한 웰니스 측정 지표입니다.
        </p>
      </section>


      {/* 3단계 프로세스 */}
      <section style={{ padding: "clamp(40px, 8vw, 60px) clamp(16px, 4vw, 24px)", background: COLORS.white, width: "100%", maxWidth: "100%" }}>
        <div style={{ width: "100%", maxWidth: "min(100%, 1000px)", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 800, color: COLORS.charcoal, marginBottom: 12 }}>
            측정 · 분석 · 개선, 3단계로 완성하는 웰니스
          </h2>
          <p style={{ fontSize: "clamp(14px, 1.875vw, 15px)", color: COLORS.warmGray, marginBottom: 40, lineHeight: 1.7 }}>
            WCWI 데이터를 기반으로 한 과학적 웰니스 관리 사이클
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 24 }}>
            {STEP_ITEMS.map((item, i) => (
              <div key={i} style={{ background: COLORS.bg, borderRadius: 20, padding: "clamp(24px, 4vw, 32px)", border: `1px solid ${COLORS.sage}20`, textAlign: "center" }}>
                <div style={{ fontSize: "clamp(28px, 4.5vw, 36px)", marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontSize: "clamp(12px, 1.5vw, 13px)", fontWeight: 700, color: COLORS.sage, marginBottom: 8 }}>STEP {item.step}</div>
                <div style={{ fontSize: "clamp(16px, 2.25vw, 18px)", fontWeight: 700, color: COLORS.charcoal, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: "clamp(13px, 1.75vw, 14px)", color: COLORS.warmGray, lineHeight: 1.6, marginBottom: 12 }}>{item.desc}</div>
                <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, background: COLORS.sagePale, color: COLORS.sageDark, fontSize: 12, fontWeight: 600 }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY WELLINK - ROI */}
      <section style={{ padding: "clamp(40px, 8vw, 60px) clamp(16px, 4vw, 24px) clamp(60px, 10vw, 80px)", background: COLORS.white, width: "100%", maxWidth: "100%" }}>
        <div style={{ width: "100%", maxWidth: "min(100%, 1400px)", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 800, color: COLORS.charcoal, marginBottom: 48 }}>
            왜 WELLINK인가?
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: "clamp(16px, 3vw, 24px)", width: "100%" }}>
            {ROI_ITEMS.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "clamp(24px, 4vw, 32px)", borderRadius: 20,
                  background: `linear-gradient(135deg, ${COLORS.sagePale}, ${COLORS.cream})`,
                  border: `1px solid ${COLORS.sage}15`, width: "100%",
                }}
              >
                <div style={{ fontSize: "clamp(22px, 3.5vw, 28px)", marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontSize: "clamp(28px, 4.5vw, 36px)", fontWeight: 900, color: COLORS.sage, fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>{item.num}</div>
                <div style={{ fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 700, color: COLORS.charcoal, marginBottom: 8 }}>{item.sub}</div>
                <div style={{ fontSize: "clamp(13px, 1.75vw, 14px)", color: COLORS.warmGray, lineHeight: 1.6, marginBottom: 8 }}>{item.desc}</div>
                <div style={{ fontSize: "clamp(11px, 1.5vw, 12px)", color: COLORS.sageDark, fontStyle: "italic" }}>{item.source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 비전 - 다크 */}
      <section style={{ padding: "clamp(48px, 8vw, 72px) clamp(16px, 4vw, 24px)", background: "linear-gradient(135deg, #2C3E2C, #1a261a)", width: "100%", maxWidth: "100%", textAlign: "center" }}>
        <div style={{ width: "100%", maxWidth: "min(100%, 720px)", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 800, color: "#fff", marginBottom: 20, lineHeight: 1.4 }}>
            직원 한 명 한 명의 웰니스가 쌓여
            <br />
            <span style={{ color: COLORS.sageLight }}>기업의 지속 가능한 성과</span>가 됩니다
          </h2>
          <p style={{ fontSize: "clamp(14px, 1.875vw, 16px)", color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
            WELLINK는 데이터로 웰니스 현황을 가시화하고, 맞춤 프로그램으로 개선해
            <br />조직 전체의 생산성과 유지율을 높이는 B2B 웰니스 플랫폼입니다.
          </p>
        </div>
      </section>

      {/* 구체적 가치 5가지 */}
      <section style={{ padding: "clamp(40px, 8vw, 60px) clamp(16px, 4vw, 24px)", background: COLORS.bg, width: "100%", maxWidth: "100%" }}>
        <div style={{ width: "100%", maxWidth: "min(100%, 900px)", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 800, color: COLORS.charcoal, marginBottom: 40 }}>
            WELLINK가 드리는 가치
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {VALUE_ITEMS.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 20, padding: "clamp(20px, 3vw, 28px)",
                  background: COLORS.white, borderRadius: 16, borderLeft: `4px solid ${item.color}`,
                  border: `1px solid ${item.color}25`, boxSizing: "border-box",
                }}
              >
                <div style={{ fontSize: "clamp(14px, 2vw, 15px)", fontWeight: 800, color: item.color, flexShrink: 0 }}>{item.num}</div>
                <div>
                  <div style={{ fontSize: "clamp(15px, 2vw, 17px)", fontWeight: 700, color: COLORS.charcoal, marginBottom: 8 }}>{item.title}</div>
                  <div style={{ fontSize: "clamp(13px, 1.75vw, 14px)", color: COLORS.warmGray, lineHeight: 1.7 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

            {/* FAQ - 혹시 이런 걱정이 있으신가요? */}
            <section style={{ padding: "clamp(40px, 8vw, 60px) clamp(16px, 4vw, 24px)", background: COLORS.cream, width: "100%", maxWidth: "100%" }}>
        <div style={{ width: "100%", maxWidth: "min(100%, 800px)", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 800, color: COLORS.charcoal, marginBottom: 32 }}>
            혹시 이런 걱정이 있으신가요?
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {FAQ_CONCERN_ITEMS.map((item, i) => (
              <div key={i} style={{ background: COLORS.white, borderRadius: 16, padding: "20px 24px", border: "1px solid rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: "clamp(14px, 1.875vw, 15px)", fontWeight: 700, color: COLORS.charcoal, marginBottom: 8 }}>{item.q}</div>
                <div style={{ fontSize: "clamp(13px, 1.75vw, 14px)", color: COLORS.warmGray, lineHeight: 1.7 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 추천 대상 */}
      <section style={{ padding: "clamp(40px, 8vw, 60px) clamp(16px, 4vw, 24px)", background: COLORS.white, width: "100%", maxWidth: "100%" }}>
        <div style={{ width: "100%", maxWidth: "min(100%, 1000px)", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 800, color: COLORS.charcoal, marginBottom: 12 }}>
            이런 분들께 추천합니다
          </h2>
          <p style={{ fontSize: "clamp(14px, 1.875vw, 15px)", color: COLORS.warmGray, marginBottom: 40, lineHeight: 1.7 }}>
            기업·공공기관·개인 모두 WELLINK로 웰니스 현황을 파악하고 개선할 수 있습니다.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 20 }}>
            {RECOMMEND_ITEMS.map((item, i) => (
              <div key={i} style={{ background: COLORS.bg, borderRadius: 20, padding: "clamp(20px, 3vw, 28px)", border: "1px solid rgba(0,0,0,0.06)", textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontSize: "clamp(14px, 1.875vw, 16px)", fontWeight: 700, color: COLORS.charcoal, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: "clamp(12px, 1.625vw, 13px)", color: COLORS.warmGray, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR HR */}
      <section style={{ padding: "clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px)", background: COLORS.bg, width: "100%", maxWidth: "100%" }}>
        <div style={{ width: "100%", maxWidth: "min(100%, 1200px)", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 800, color: COLORS.charcoal, marginBottom: 16 }}>
            HR 담당자를 위한 대시보드
          </h2>
          <p style={{ fontSize: "clamp(14px, 1.875vw, 15px)", color: COLORS.warmGray, marginBottom: 40, lineHeight: 1.7 }}>
            팀별 WCWI 평균, 프로그램 전후 개선율, 위험군 비율을
            <br />한눈에 파악하고 데이터 기반 의사결정을 내리세요.
          </p>
          <div style={{
            background: COLORS.white, borderRadius: 24, padding: "clamp(24px, 4vw, 32px)",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.06)", width: "100%",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: "clamp(12px, 1.625vw, 13px)", color: COLORS.warmGray, marginBottom: 4 }}>회사 평균 WCWI</div>
                <div style={{ fontSize: "clamp(32px, 5.25vw, 42px)", fontWeight: 900, color: COLORS.sage }}>72.4</div>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  { label: "참여율", value: "87%", color: COLORS.sage },
                  { label: "위험군", value: "12%", color: COLORS.coral },
                  { label: "개선율", value: "+15%", color: COLORS.gold },
                ].map((m, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "clamp(10px, 1.375vw, 11px)", color: COLORS.warmGray, marginBottom: 2 }}>{m.label}</div>
                      <div style={{ fontSize: "clamp(16px, 2.5vw, 20px)", fontWeight: 800, color: m.color }}>{m.value}</div>
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
      <section ref={roleRef} style={{ padding: "clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px)", width: "100%", maxWidth: "min(100%, 1000px)", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: "clamp(12px, 1.625vw, 13px)", fontWeight: 600, color: COLORS.sage, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>SURVEY</div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, color: COLORS.charcoal, lineHeight: 1.3, marginBottom: 12 }}>
            수요조사 참여하기
          </h2>
          <p style={{ fontSize: "clamp(14px, 1.875vw, 15px)", color: COLORS.warmGray, lineHeight: 1.7 }}>
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
                flex: "1 1 min(100%, 320px)", width: "100%", maxWidth: "100%", padding: "clamp(24px, 4vw, 32px) clamp(16px, 3vw, 24px)", borderRadius: 20,
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
                background: COLORS.sagePale, color: COLORS.sageDark, fontSize: "clamp(11px, 1.5vw, 12px)", fontWeight: 600,
              }}>{r.tag}</span>
            </button>
          ))}
        </div>
        <p style={{
          textAlign: "center", fontSize: "clamp(14px, 1.8vw, 16px)", color: COLORS.warmGray,
          marginTop: 32, lineHeight: 1.7, width: "100%", maxWidth: "min(100%, 700px)", margin: "32px auto 0",
          fontStyle: "italic",
        }}>
          당신의 응답이 한국 기업 웰니스 연구의 기초 데이터가 되고, 더 정교한 측정 도구로 발전시켜,
          <br />
          기업들의 웰니스 데이터 표준을 만들어 갑니다.
        </p>
      </section>

      {/* 자주 묻는 질문 */}
      <section style={{ padding: "clamp(40px, 8vw, 60px) clamp(16px, 4vw, 24px)", background: COLORS.cream, width: "100%", maxWidth: "100%" }}>
        <div style={{ width: "100%", maxWidth: "min(100%, 800px)", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 800, color: COLORS.charcoal, marginBottom: 32 }}>
            자주 묻는 질문
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} style={{ background: COLORS.white, borderRadius: 16, padding: "20px 24px", border: "1px solid rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: "clamp(14px, 1.875vw, 15px)", fontWeight: 700, color: COLORS.charcoal, marginBottom: 8 }}>{item.q}</div>
                <div style={{ fontSize: "clamp(13px, 1.75vw, 14px)", color: COLORS.warmGray, lineHeight: 1.7 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 안내사항 (Disclaimer) */}
      <section style={{ padding: "clamp(24px, 4vw, 32px) clamp(16px, 4vw, 24px)", background: COLORS.white, width: "100%", maxWidth: "100%", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ width: "100%", maxWidth: "min(100%, 800px)", margin: "0 auto" }}>
          <p style={{ fontSize: "clamp(12px, 1.5vw, 13px)", color: COLORS.warmGray, lineHeight: 1.7, textAlign: "center" }}>
            <br />
            WELLINK Corporate Wellness Index (WCWI)는 WELLINK의 지적재산이며 저작권법 및 관련 법률에 의해 보호됩니다. 
            <br />무단 복제, 배포, 수정 또는 상업적 이용을 금지합니다.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: "clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px)", textAlign: "center",
        background: `linear-gradient(135deg, ${COLORS.charcoal}, #3A3A3A)`,
        width: "100%", maxWidth: "100%",
      }}>
        <h2 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, color: COLORS.white, marginBottom: 16 }}>
          지금 바로 시작하세요
        </h2>
        <p style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "rgba(255,255,255,0.6)", marginBottom: 32, lineHeight: 1.7 }}>
          60초 미니 체크로 현재 상태를 확인하거나,
          <br />전체 WCWI 진단으로 깊이 있는 분석을 받아보세요.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => transition("mini")}
            style={{
              padding: "clamp(14px, 2vw, 16px) clamp(32px, 5vw, 40px)", borderRadius: 30, border: "none",
              background: COLORS.sage, color: "#fff", fontSize: "clamp(14px, 2vw, 16px)",
              fontWeight: 700, cursor: "pointer",
            }}
          >
            60초 미니 웰니스 체크
          </button>
          <button
            onClick={() => transition("full")}
            style={{
              padding: "clamp(14px, 2vw, 16px) clamp(32px, 5vw, 40px)", borderRadius: 30,
              border: `2px solid rgba(255,255,255,0.3)`,
              background: "transparent", color: "#fff", fontSize: "clamp(14px, 2vw, 16px)",
              fontWeight: 600, cursor: "pointer",
            }}
          >
            전체 WCWI 진단
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "clamp(24px, 4vw, 32px) clamp(16px, 4vw, 24px)", textAlign: "center", background: COLORS.bgDark, width: "100%", maxWidth: "100%" }}>
        <div style={{ fontSize: "clamp(12px, 1.5vw, 13px)", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
          © 2026 WELLINK Corp. All Rights Reserved. <br />

        </div>
      </footer>
    </div>
  );
}
