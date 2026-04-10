import { useState } from "react";
import { COLORS } from "../constants/theme";
import { GaugeBar } from "../components";

const TEAL = "#3D8B8B";

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  .landing-hero-grid { display: grid; gap: clamp(32px, 5vw, 48px); align-items: center; text-align: center; }
  @media (min-width: 960px) {
    .landing-hero-grid { grid-template-columns: 1fr 1fr; text-align: left; }
    .landing-hero-actions { justify-content: flex-start; }
  }
`;

/** 업계 벤치마크 + 파일럿 실측을 한 섹션에서 제시 (중복 지표 통합) */
const WHY_WELLINK_STATS = [
  {
    icon: "💰",
    num: "$2.71",
    sub: "투자 대비 수익",
    desc: "웰니스에 1달러 투자 시 생산성 향상 등으로 돌아온다고 보고된 금액(연구·산업 보고).",
    source: "Harvard Business Review",
  },
  {
    icon: "⚖️",
    num: "1:4",
    sub: "투자 대비 절감",
    desc: "웰니스에 1원 투자 시 의료비·이직 비용 등에서 절감되는 비율로 추정된 사례.",
    source: "Deloitte",
  },
  {
    icon: "📊",
    num: "25%",
    sub: "결근률 감소",
    desc: "체계적 웰니스 프로그램을 운영한 기업에서 관찰되는 결근 개선 폭(연구·기관마다 범위 상이).",
    source: "CDC · WHO 등",
  },
  {
    icon: "📈",
    num: "20%",
    sub: "생산성 향상",
    desc: "직원 웰빙을 전략적으로 관리하는 기업의 생산성 향상으로 집계된 수치.",
    source: "Global Wellness Institute, 2025",
  },
  {
    icon: "🤝",
    num: "33%",
    sub: "이직률 감소",
    desc: "높은 웰빙 수준을 가진 기업에서 자발적 이직이 줄었다고 보고된 비율.",
    source: "25M+ 근로자 글로벌 데이터",
  },
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

/** B2B 랜딩 참고: 문제 인식 */
const PROBLEM_ITEMS = [
  { stat: "2.6배", title: "이직 가능성 증가", desc: "회복 없는 업무 → 만성 피로 → 병가 63% 증가 → 핵심 인력 이탈", src: "Gallup, 2024", color: COLORS.coral },
  { stat: "35%", title: "생산성 손실", desc: "만성 통증 → 집중력 저하 → 출근하지만 일 못하는 상태 확산", src: "WHO, 2023", color: COLORS.gold },
  { stat: "86%", title: "우울 위험 감지율", desc: "감정 에너지 저하 → 동기 상실 → 팀 전체 사기 저하", src: "WHO 가이드라인", color: TEAL },
  { stat: "76%", title: "혁신 제안 감소", desc: "심리적 안전감 부족 → 의견 회피 → 소극적 문화 고착", src: "Google", color: COLORS.sage },
  { stat: "3배", title: "이직 탐색 확률", desc: "삶의 불만족 → 경력직부터 이탈 → 재채용 비용 연봉의 50~200%", src: "SHRM, 2024", color: COLORS.coral },
  { stat: "1:4", title: "웰니스 투자 수익비", desc: "웰니스에 1원 투자 시 의료비·이직비용에서 4원을 절감", src: "Deloitte", color: COLORS.sage },
];

const SOLUTION_BAD = [
  "\"힘들어 보여서\" 프로그램 도입",
  "효과 있었는지 알 수 없음",
  "ROI 설명 불가 → 예산 삭감 위험",
  "매년 비슷한 프로그램 반복",
  "경영진에게 '체감'만 전달",
];

const SOLUTION_GOOD = [
  "다차원 데이터로 '어디가 약한지' 정확히 파악",
  "취약 영역에 맞는 프로그램 선택 근거 확보",
  "전후 점수 비교로 효과를 숫자로 증명",
  "위험군 조기 발견 → 이직 예방 선제 대응",
  "경영진에게 데이터 기반 ROI 리포트 제출",
];

const SOLUTION_PILLARS = [
  { icon: "⏱", label: "5분이면 충분합니다", sub: "비의료적 자가 평가" },
  { icon: "📊", label: "데이터로 진단합니다", sub: "다차원 과학적 측정" },
  { icon: "🎯", label: "맞춤형으로 처방합니다", sub: "진단 결과 기반 프로그램 추천" },
];

const RISK_SEGMENTS = [
  { label: "우수", pct: 23.6, color: COLORS.sage },
  { label: "양호", pct: 39.3, color: TEAL },
  { label: "주의", pct: 27.1, color: COLORS.gold },
  { label: "고위험", pct: 10, color: COLORS.coral },
];

const DASH_DEPTS = [
  { dept: "개발팀", score: "58.3", risk: "주의" },
  { dept: "마케팅", score: "71.2", risk: "양호" },
  { dept: "영업팀", score: "64.8", risk: "양호" },
];

const PROGRAM_ITEMS = [
  { name: "번아웃 리셋", desc: "호흡 · 명상 · 이완", dur: "4~8주", color: COLORS.coral },
  { name: "오피스 바디케어", desc: "필라테스 · 스트레칭", dur: "4~12주", color: COLORS.gold },
  { name: "감정 에너지 충전", desc: "마인드풀니스 · 감정 인식", dur: "4~8주", color: TEAL },
  { name: "마인드 그로스", desc: "자기자비 · 강점 발견", dur: "4~8주", color: "#F97316" },
  { icon: "💎", name: "심층 웰니스 코칭", desc: "1:1 / 그룹 심화 세션", dur: "8~12주", color: COLORS.sage },
  { icon: "🏢", name: "조직 문화 컨설팅", desc: "심리적 안전감 · 복지 재설계", dur: "4~8주", color: COLORS.sageLight },
];

const ADOPTION_STEPS = [
  { n: "01", title: "사전 미팅", dur: "1~2일", desc: "HR 담당자와 조직 현황 파악", color: COLORS.sage },
  { n: "02", title: "웰니스 측정", dur: "1주", desc: "전 직원 온라인 설문 · 5분", color: TEAL },
  { n: "03", title: "분석 리포트", dur: "3일", desc: "다차원 분석 + 프로그램 추천", color: COLORS.gold },
  { n: "04", title: "웰니스 강의", dur: "1~2회", desc: "데이터 기반 전문가 강의", color: COLORS.sage },
  { n: "05", title: "맞춤 프로그램", dur: "4~12주", desc: "데이터 기반 솔루션 실행", color: TEAL },
];

const TRUST_ITEMS = [
  { icon: "🔬", title: "과학적 검증", desc: "국제적으로 검증된 측정 도구를 통합한 독자적 진단 체계" },
  { icon: "📊", title: "실증 데이터", desc: "140명 실측 데이터 기반으로 설계된 분석 로직" },
  { icon: "🧘", title: "전문가 직접 진행", desc: "웰니스 전문가(필라테스 4년+)가 직접 강의·코칭" },
  { icon: "🔒", title: "개인정보 보호", desc: "비의료적 자가평가 · 개인정보 미수집 · 암호화 저장" },
];

const navLinkStyle = {
  fontSize: "clamp(12px, 1.5vw, 13px)",
  color: COLORS.warmGray,
  textDecoration: "none",
  fontWeight: 500,
  cursor: "pointer",
};

function EmployeeFlowSection() {
  const [activeStep, setActiveStep] = useState(0);
  const labels = ["로그인", "초대코드", "웰니스 테스트", "개인 리포트"];
  const phoneFrame = {
    background: COLORS.white,
    borderRadius: 24,
    boxShadow: "0 24px 60px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.06)",
    width: "100%",
    maxWidth: 288,
    overflow: "hidden",
    flexShrink: 0,
  };

  return (
    <section id="flow" style={{ padding: "clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px)", background: COLORS.white, width: "100%", maxWidth: "100%" }}>
      <div style={{ width: "100%", maxWidth: "min(100%, 1000px)", margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 800, color: COLORS.charcoal, marginBottom: 12 }}>
          직원은 이렇게 사용합니다
        </h2>
        <p style={{ fontSize: "clamp(14px, 1.875vw, 15px)", color: COLORS.warmGray, marginBottom: 40, lineHeight: 1.7 }}>
          간편한 4단계로 나의 웰니스 상태를 확인하세요
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 40 }}>
          {labels.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setActiveStep(i)}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: "none",
                fontSize: "clamp(12px, 1.5vw, 13px)",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                background: activeStep === i ? COLORS.sage : COLORS.bg,
                color: activeStep === i ? "#fff" : COLORS.warmGray,
                boxShadow: activeStep === i ? `0 4px 14px ${COLORS.sage}40` : "none",
              }}
            >
              {`0${i + 1}. ${s}`}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={phoneFrame}>
            <div style={{ background: COLORS.cream, padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#D0CDC5" }} />
              <span style={{ fontSize: 12, color: COLORS.warmGray, fontWeight: 600 }}>
                {activeStep === 0 ? "wellink.co.kr" : activeStep === 1 ? "초대코드 입력" : activeStep === 2 ? "웰니스 테스트" : "나의 웰니스 리포트"}
              </span>
            </div>
            <div style={{ padding: 16, minHeight: 360 }}>
              {activeStep === 0 && (
                <div style={{ textAlign: "center", paddingTop: 24 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 16, margin: "0 auto 16px",
                    background: `linear-gradient(135deg, ${COLORS.sage}, ${COLORS.sageDark})`,
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 24,
                  }}>W</div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: COLORS.charcoal, marginBottom: 4 }}>WELLINK</div>
                  <p style={{ fontSize: 12, color: COLORS.warmGray, marginBottom: 28 }}>3초 만에 시작하세요</p>
                  <div style={{
                    width: "100%", padding: "12px", borderRadius: 12, background: "#FEE500", color: "#3C1E1E",
                    fontWeight: 600, fontSize: 13, marginBottom: 10,
                  }}>💬 카카오로 시작하기</div>
                  <div style={{
                    width: "100%", padding: "12px", borderRadius: 12, border: "1px solid #E8E5DE", background: COLORS.white,
                    color: COLORS.charcoal, fontWeight: 600, fontSize: 13,
                  }}>🔍 Google로 시작하기</div>
                </div>
              )}
              {activeStep === 1 && (
                <div style={{ paddingTop: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, background: `${COLORS.sage}18`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12,
                  }}>🏢</div>
                  <div style={{ fontWeight: 700, color: COLORS.charcoal, marginBottom: 8 }}>초대코드를 입력해주세요</div>
                  <p style={{ fontSize: 12, color: COLORS.warmGray, marginBottom: 20, lineHeight: 1.5 }}>
                    회사에서 받은 코드를 입력하면<br />팀에 자동으로 연결됩니다
                  </p>
                  <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                    {"WELL26".split("").map((c, i) => (
                      <div key={i} style={{
                        width: 36, height: 44, borderRadius: 8, border: `2px solid ${COLORS.sage}`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: COLORS.sage, background: COLORS.bg, fontSize: 15,
                      }}>{c}</div>
                    ))}
                  </div>
                  <div style={{
                    width: "100%", padding: "12px", borderRadius: 12, background: COLORS.sage, color: "#fff",
                    fontWeight: 600, fontSize: 13, textAlign: "center",
                  }}>확인</div>
                  <p style={{ textAlign: "center", fontSize: 11, color: COLORS.warmGray, marginTop: 16 }}>코드가 없으신가요? HR 담당자에게 문의해주세요</p>
                </div>
              )}
              {activeStep === 2 && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 11, color: COLORS.warmGray }}>
                    <span>12 / 24</span>
                    <span style={{ color: COLORS.sage, fontWeight: 700 }}>50%</span>
                  </div>
                  <div style={{ height: 6, background: "#E8E5DE", borderRadius: 3, marginBottom: 20 }}>
                    <div style={{ width: "50%", height: "100%", background: COLORS.sage, borderRadius: 3 }} />
                  </div>
                  <div style={{
                    background: COLORS.bg, borderRadius: 12, padding: 14, marginBottom: 12, minHeight: 52,
                    fontSize: 13, color: COLORS.charcoal, fontWeight: 500, filter: "blur(4px)", userSelect: "none",
                  }}>
                    최근 2주간 일상에서 흥미나 즐거움을 느꼈습니다
                  </div>
                  {["전혀 아니다", "거의 아니다", "보통이다", "대체로 그렇다", "매우 그렇다"].map((t, n) => (
                    <div
                      key={t}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: 12, fontSize: 12, fontWeight: 500, marginBottom: 8,
                        border: `1px solid ${n === 3 ? COLORS.sage : "#E8E5DE"}`,
                        background: n === 3 ? COLORS.sage : COLORS.white,
                        color: n === 3 ? "#fff" : COLORS.charcoal,
                        textAlign: "center",
                      }}
                    >{t}</div>
                  ))}
                </div>
              )}
              {activeStep === 3 && (
                <div>
                  <div style={{ textAlign: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: COLORS.warmGray }}>WCWI 종합 점수</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.sage }}>68.2</div>
                    <span style={{
                      display: "inline-block", marginTop: 4, padding: "4px 12px", borderRadius: 999,
                      background: `${TEAL}18`, color: TEAL, fontSize: 11, fontWeight: 700,
                    }}>양호</span>
                  </div>
                  <div style={{
                    height: 120, borderRadius: 12, background: COLORS.bg,
                    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
                    fontSize: 12, color: COLORS.warmGray, fontWeight: 500,
                  }}>
                    다차원 웰니스 진단 요약
                  </div>
                  <div style={{ background: "#FEF3C7", borderRadius: 12, padding: 12, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.gold, marginBottom: 4 }}>⚠ 주의 영역 발견</div>
                    <div style={{ fontSize: 11, color: COLORS.warmGray, lineHeight: 1.5 }}>
                      일부 영역에서 관리가 필요합니다. WELLINK의 맞춤 프로그램을 확인해보세요.
                    </div>
                  </div>
                  <div style={{
                    width: "100%", padding: "10px", borderRadius: 12, background: COLORS.sage, color: "#fff",
                    fontWeight: 600, fontSize: 12, textAlign: "center",
                  }}>추천 프로그램 보기 →</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

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
      <style>{`
        .landing-nav-links { display: none; align-items: center; gap: clamp(16px, 2.5vw, 28px); }
        @media (min-width: 900px) { .landing-nav-links { display: flex; } }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(247,245,240,0.92)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "clamp(12px, 2vw, 14px) clamp(16px, 4vw, 32px)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        width: "100%", maxWidth: "100%", flexWrap: "wrap", gap: 8,
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
        <div className="landing-nav-links">
          <a href="#problem" style={navLinkStyle}>왜 필요한가</a>
          <a href="#solution" style={navLinkStyle}>서비스</a>
          <a href="#flow" style={navLinkStyle}>사용 흐름</a>
          <a href="#programs" style={navLinkStyle}>프로그램</a>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            onClick={scrollToRole}
            style={{
              padding: "clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 16px)", borderRadius: 24,
              border: `1.5px solid ${COLORS.sage}`, background: "transparent",
              color: COLORS.sage, fontSize: "clamp(11px, 1.4vw, 13px)", fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => { e.target.style.background = COLORS.sagePale; }}
            onMouseOut={(e) => { e.target.style.background = "transparent"; }}
          >
            수요조사
          </button>
          <button
            type="button"
            onClick={() => transition("lead", { leadCaptureSource: "manager" })}
            style={{
              padding: "clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 16px)", borderRadius: 24, border: "none",
              background: COLORS.sageDark, color: "#fff", fontSize: "clamp(11px, 1.4vw, 13px)",
              fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseOver={(e) => { e.target.style.opacity = "0.92"; }}
            onMouseOut={(e) => { e.target.style.opacity = "1"; }}
          >
            무료 파일럿 신청
          </button>
          <button
            onClick={() => transition("mini")}
            style={{
              padding: "clamp(8px, 1.5vw, 10px) clamp(14px, 2.5vw, 20px)", borderRadius: 24, border: "none",
              background: COLORS.sage, color: "#fff", fontSize: "clamp(12px, 1.5vw, 14px)",
              fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseOver={(e) => { e.target.style.background = COLORS.sageDark; }}
            onMouseOut={(e) => { e.target.style.background = COLORS.sage; }}
          >
            60초 체크 →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        paddingTop: "clamp(80px, 12vw, 120px)", paddingBottom: "clamp(40px, 8vw, 80px)",
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

        <div
          className="landing-hero-grid"
          style={{
            position: "relative", zIndex: 2, width: "100%", maxWidth: "min(100%, 1100px)", margin: "0 auto",
            padding: "clamp(16px, 4vw, 24px)",
          }}
        >
          <div>
            <div style={{
              display: "inline-block", padding: "6px 18px", borderRadius: 20,
              background: `${COLORS.sage}15`, border: `1px solid ${COLORS.sage}30`,
              fontSize: 13, fontWeight: 600, color: COLORS.sage, marginBottom: 24,
              animation: "fadeUp 0.6s ease-out",
            }}>
              데이터 기반 기업 웰니스
            </div>

            <h1 style={{
              fontSize: "clamp(32px, 5.5vw, 52px)", fontWeight: 900, lineHeight: 1.15,
              color: COLORS.charcoal, marginBottom: 20, letterSpacing: -1.2,
              animation: "fadeUp 0.6s ease-out 0.1s both",
            }}>
              측정하지 않으면
              <br />
              <span style={{
                background: `linear-gradient(135deg, ${COLORS.sage}, ${COLORS.sageLight})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>관리할 수 없습니다</span>
            </h1>

            <p style={{
              fontSize: "clamp(15px, 1.9vw, 17px)", lineHeight: 1.75, color: COLORS.warmGray,
              maxWidth: 520, margin: "0 0 28px", fontWeight: 400,
              animation: "fadeUp 0.6s ease-out 0.2s both",
            }}>
              WELLINK의 독자적 웰니스 진단으로 조직의 건강 상태를 데이터로 파악하고,
              어떤 복지 프로그램이 필요한지 정확히 알려드립니다.
            </p>

            <div className="landing-hero-actions" style={{
              display: "flex", gap: 12, flexWrap: "wrap",
              animation: "fadeUp 0.6s ease-out 0.3s both",
              justifyContent: "center",
            }}>
              <button
                type="button"
                onClick={() => transition("lead", { leadCaptureSource: "manager" })}
                style={{
                  padding: "clamp(14px, 2vw, 16px) clamp(24px, 4vw, 32px)", borderRadius: 30, border: "none",
                  background: `linear-gradient(135deg, ${COLORS.sage}, ${COLORS.sageDark})`,
                  color: "#fff", fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 700, cursor: "pointer",
                  boxShadow: `0 8px 30px ${COLORS.sage}40`,
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => { e.target.style.transform = "translateY(-2px)"; }}
                onMouseOut={(e) => { e.target.style.transform = "translateY(0)"; }}
              >
                무료 파일럿 신청
              </button>
              <button
                onClick={() => transition("mini")}
                style={{
                  padding: "clamp(14px, 2vw, 16px) clamp(20px, 3.5vw, 28px)", borderRadius: 30, border: "none",
                  background: COLORS.white, color: COLORS.sage,
                  fontSize: "clamp(13px, 1.85vw, 15px)", fontWeight: 700, cursor: "pointer",
                  borderWidth: 2, borderStyle: "solid", borderColor: `${COLORS.sage}50`,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                }}
              >
                60초 무료 웰니스 체크 →
              </button>
              <a
                href="#flow"
                style={{
                  padding: "clamp(14px, 2vw, 16px) clamp(20px, 3.5vw, 28px)", borderRadius: 30,
                  border: `2px solid ${COLORS.warmGray}35`,
                  background: "transparent", color: COLORS.charcoal,
                  fontSize: "clamp(13px, 1.85vw, 15px)", fontWeight: 600,
                  textDecoration: "none", display: "inline-flex", alignItems: "center",
                }}
              >
                서비스 둘러보기 ↓
              </a>
              <button
                onClick={() => transition("full")}
                style={{
                  padding: "clamp(12px, 1.75vw, 14px) clamp(18px, 3vw, 24px)", borderRadius: 30,
                  border: "none", background: "transparent", color: COLORS.warmGray,
                  fontSize: "clamp(12px, 1.65vw, 14px)", fontWeight: 600, cursor: "pointer", textDecoration: "underline",
                }}
              >
                전체 WCWI 진단
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <div style={{
              background: COLORS.white, borderRadius: 24, padding: "clamp(24px, 4vw, 32px)",
              border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
              maxWidth: 340, width: "100%", textAlign: "center",
            }}>
              <div style={{ fontSize: 12, color: COLORS.warmGray, marginBottom: 4 }}>WCWI 종합 점수</div>
              <div style={{ fontSize: "clamp(40px, 8vw, 52px)", fontWeight: 900, color: COLORS.sage, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>62.5</div>
              <div style={{ fontSize: 12, color: COLORS.warmGray, marginBottom: 16 }}>/ 100점 · 양호</div>
              <div style={{
                height: 160, borderRadius: 16, background: COLORS.sagePale,
                display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
                fontSize: 13, color: COLORS.sageDark, fontWeight: 500, lineHeight: 1.5,
              }}>
                영역별 점수가 한눈에 보이는<br />진단 결과 화면
              </div>
              <div style={{ fontSize: 11, color: COLORS.warmGray, marginTop: 12 }}>다차원 웰니스 진단 결과</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM (B2B) */}
      <section id="problem" style={{ padding: "clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px)", background: COLORS.bg, width: "100%", maxWidth: "100%" }}>
        <div style={{ width: "100%", maxWidth: "min(100%, 1100px)", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, color: COLORS.charcoal, marginBottom: 12 }}>
            직원 웰니스를 방치하면
          </h2>
          <p style={{ textAlign: "center", fontSize: "clamp(15px, 2vw, 17px)", color: COLORS.warmGray, marginBottom: 40 }}>
            조직 전반에 걸쳐 동시에 무너집니다
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
            gap: 16,
          }}>
            {PROBLEM_ITEMS.map((r, i) => (
              <div
                key={i}
                style={{
                  background: COLORS.white, borderRadius: 20, padding: "clamp(20px, 3vw, 24px)",
                  border: "1px solid rgba(0,0,0,0.06)", transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: "clamp(26px, 4vw, 32px)", fontWeight: 900, color: r.color, marginBottom: 8 }}>{r.stat}</div>
                <div style={{ fontWeight: 700, color: COLORS.charcoal, marginBottom: 8, fontSize: "clamp(14px, 1.9vw, 16px)" }}>{r.title}</div>
                <div style={{ fontSize: "clamp(12px, 1.6vw, 13px)", color: COLORS.warmGray, lineHeight: 1.65, marginBottom: 10 }}>{r.desc}</div>
                <div style={{ fontSize: 11, color: COLORS.warmGray, opacity: 0.85 }}>— {r.src}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION — Before/After (B2B) */}
      <section id="solution" style={{
        padding: "clamp(48px, 8vw, 88px) clamp(16px, 4vw, 24px)",
        background: "linear-gradient(135deg, #2C3E2C, #1a261a)",
        width: "100%", maxWidth: "100%",
      }}>
        <div style={{ width: "100%", maxWidth: "min(100%, 1100px)", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, color: "#fff", marginBottom: 12 }}>
            WELLINK이 <span style={{ color: COLORS.sageLight }}>해결합니다</span>
          </h2>
          <p style={{ textAlign: "center", fontSize: "clamp(15px, 2vw, 17px)", color: "rgba(255,255,255,0.65)", marginBottom: 40 }}>
            과학적으로 검증된 독자적 다차원 웰니스 진단 체계
          </p>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 20, marginBottom: 36,
          }}>
            <div style={{
              background: "rgba(90,40,40,0.25)", borderRadius: 20, padding: "clamp(22px, 4vw, 28px)",
              border: "1px solid rgba(232,114,92,0.25)",
            }}>
              <h3 style={{ color: COLORS.coralLight, fontWeight: 700, fontSize: "clamp(16px, 2.2vw, 18px)", marginBottom: 18 }}>지표 없이 복지 운영</h3>
              {SOLUTION_BAD.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: "clamp(13px, 1.75vw, 14px)", color: "rgba(255,255,255,0.7)" }}>
                  <span style={{ color: COLORS.coral, flexShrink: 0 }}>✗</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
            <div style={{
              background: "rgba(123,158,135,0.12)", borderRadius: 20, padding: "clamp(22px, 4vw, 28px)",
              border: `1px solid ${COLORS.sage}40`,
            }}>
              <h3 style={{ color: COLORS.sageLight, fontWeight: 700, fontSize: "clamp(16px, 2.2vw, 18px)", marginBottom: 18 }}>WELLINK 데이터 기반 의사결정</h3>
              {SOLUTION_GOOD.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: "clamp(13px, 1.75vw, 14px)", color: "rgba(255,255,255,0.88)" }}>
                  <span style={{ color: COLORS.sageLight, flexShrink: 0 }}>✓</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 16, textAlign: "center",
          }}>
            {SOLUTION_PILLARS.map((f, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(0,0,0,0.2)", borderRadius: 20, padding: "clamp(20px, 3vw, 24px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ color: "#fff", fontWeight: 700, marginBottom: 6, fontSize: "clamp(14px, 1.9vw, 15px)" }}>{f.label}</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 1.5 }}>{f.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WCWI OVERVIEW */}
      <section style={{ padding: "clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px)", width: "100%", maxWidth: "100%", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, color: COLORS.charcoal, marginBottom: 12 }}>
          WCWI란?
        </h2>
        <p style={{ textAlign: "center", fontSize: "clamp(14px, 2vw, 16px)", color: COLORS.warmGray, marginBottom: 24, width: "100%", maxWidth: "min(100%, 800px)", margin: "0 auto 24px", lineHeight: 1.75 }}>
          WELLINK Corporate Wellness Index — 기업 웰니스의 새로운 기준이 될 과학 기반 종합 지표
        </p>
        <p style={{
          textAlign: "center", fontSize: "clamp(14px, 1.8vw, 16px)", color: COLORS.warmGray,
          lineHeight: 1.8, width: "100%", maxWidth: "min(100%, 720px)", margin: "0 auto",
        }}>
          저희 WELLINK가 개발한 WCWI v1.0 (Beta)는 국제적으로 검증된 측정 원리를 바탕으로,
          한국 직장인의 업무 환경에 맞게 설계·재구성한 웰니스 측정 지표입니다.
          다차원 데이터로 조직과 개인의 상태를 파악하고, 맞춤 개입의 근거로 활용할 수 있습니다.
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

      <EmployeeFlowSection />

      {/* 왜 WELLINK인가? — 업계 근거 + 파일럿 실측 통합 */}
      <section id="why-wellink" style={{ padding: "clamp(40px, 8vw, 72px) clamp(16px, 4vw, 24px)", background: COLORS.white, width: "100%", maxWidth: "100%" }}>
        <div style={{ width: "100%", maxWidth: "min(100%, 1200px)", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, color: COLORS.charcoal, marginBottom: 12 }}>
            왜 WELLINK인가?
          </h2>
          <p style={{
            textAlign: "center", fontSize: "clamp(14px, 1.9vw, 16px)", color: COLORS.warmGray,
            marginBottom: 40, lineHeight: 1.65, maxWidth: 560, marginLeft: "auto", marginRight: "auto",
          }}>
            글로벌 연구·산업 보고에서 제시된 웰니스 효과를 한눈에 모았고,
            아래는 WELLINK 파일럿에서 나온 실제 측정 요약입니다.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "clamp(14px, 2.5vw, 20px)", width: "100%" }}>
            {WHY_WELLINK_STATS.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "clamp(22px, 3.5vw, 28px)", borderRadius: 20,
                  background: `linear-gradient(135deg, ${COLORS.sagePale}, ${COLORS.cream})`,
                  border: `1px solid ${COLORS.sage}18`, width: "100%",
                }}
              >
                <div style={{ fontSize: "clamp(20px, 3vw, 26px)", marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontSize: "clamp(26px, 4.5vw, 34px)", fontWeight: 900, color: COLORS.sage, fontFamily: "'Playfair Display', serif", marginBottom: 6 }}>{item.num}</div>
                <div style={{ fontSize: "clamp(14px, 1.9vw, 15px)", fontWeight: 700, color: COLORS.charcoal, marginBottom: 8 }}>{item.sub}</div>
                <div style={{ fontSize: "clamp(12px, 1.65vw, 13px)", color: COLORS.warmGray, lineHeight: 1.6, marginBottom: 8 }}>{item.desc}</div>
                <div style={{ fontSize: "clamp(11px, 1.45vw, 12px)", color: COLORS.sageDark, fontStyle: "italic" }}>{item.source}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 32,
            background: COLORS.sagePale,
            borderRadius: 20,
            padding: "clamp(22px, 4vw, 28px)",
            textAlign: "center",
            border: `1px solid ${COLORS.sage}25`,
          }}>
            <div style={{ color: COLORS.sageDark, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>WELLINK 파일럿 · 실제 140명 측정 결과</div>
            <div style={{ display: "flex", justifyContent: "center", gap: "clamp(24px, 6vw, 48px)", flexWrap: "wrap" }}>
              <div><span style={{ fontSize: "clamp(24px, 5vw, 30px)", fontWeight: 800, color: COLORS.sage }}>62.5</span><span style={{ color: COLORS.warmGray, fontSize: 13, marginLeft: 8 }}>종합 점수</span></div>
              <div><span style={{ fontSize: "clamp(24px, 5vw, 30px)", fontWeight: 800, color: COLORS.gold }}>10%</span><span style={{ color: COLORS.warmGray, fontSize: 13, marginLeft: 8 }}>고위험군</span></div>
              <div><span style={{ fontSize: "clamp(24px, 5vw, 30px)", fontWeight: 800, color: TEAL }}>87%</span><span style={{ color: COLORS.warmGray, fontSize: 13, marginLeft: 8 }}>참여율</span></div>
            </div>
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

      {/* 도입 프로세스 (B2B) */}
      <section id="process" style={{ padding: "clamp(40px, 8vw, 72px) clamp(16px, 4vw, 24px)", background: COLORS.bg, width: "100%", maxWidth: "100%" }}>
        <div style={{ width: "100%", maxWidth: "min(100%, 1100px)", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, color: COLORS.charcoal, marginBottom: 36 }}>
            도입은 이렇게 간단합니다
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 160px), 1fr))",
            gap: 12,
          }}>
            {ADOPTION_STEPS.map((s, i) => (
              <div
                key={i}
                style={{
                  background: COLORS.white, borderRadius: 18, padding: "clamp(16px, 2.5vw, 20px)",
                  border: "1px solid rgba(0,0,0,0.06)", textAlign: "center",
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", margin: "0 auto 10px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 13, background: `${s.color}18`, color: s.color,
                }}>{s.n}</div>
                <div style={{ fontWeight: 700, color: COLORS.charcoal, fontSize: 14, marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 11, color: COLORS.warmGray, marginBottom: 8 }}>{s.dur}</div>
                <div style={{ fontSize: 12, color: COLORS.warmGray, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 28,
            background: COLORS.sagePale,
            borderRadius: 20,
            padding: "clamp(18px, 3vw, 24px)",
            textAlign: "center",
          }}>
            <p style={{ color: COLORS.sageDark, fontWeight: 700, fontSize: "clamp(14px, 1.9vw, 15px)" }}>사후 재측정 + ROI 리포트</p>
            <p style={{ color: COLORS.warmGray, fontSize: 13, marginTop: 8, lineHeight: 1.65 }}>
              프로그램 종료 후 재측정 → Before/After 비교 → 경영진 보고용 ROI 리포트 제공
            </p>
          </div>
        </div>
      </section>

      {/* Trust (B2B) */}
      <section style={{
        padding: "clamp(40px, 8vw, 72px) clamp(16px, 4vw, 24px)",
        background: "linear-gradient(135deg, #2C3E2C, #1a261a)",
        width: "100%", maxWidth: "100%",
      }}>
        <div style={{
          width: "100%", maxWidth: "min(100%, 1100px)", margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 16,
        }}>
          {TRUST_ITEMS.map((t, i) => (
            <div
              key={i}
              style={{
                background: "rgba(0,0,0,0.22)", borderRadius: 20, padding: "clamp(20px, 3vw, 24px)",
                border: "1px solid rgba(255,255,255,0.08)", textAlign: "center",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
              <h4 style={{ color: "#fff", fontWeight: 700, marginBottom: 8, fontSize: 15 }}>{t.title}</h4>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 1.65 }}>{t.desc}</p>
            </div>
          ))}
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

      {/* FOR HR — B2B 대시보드 요약 */}
      <section id="dashboard" style={{ padding: "clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px)", background: COLORS.bg, width: "100%", maxWidth: "100%" }}>
        <div style={{ width: "100%", maxWidth: "min(100%, 1200px)", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 800, color: COLORS.charcoal, marginBottom: 16 }}>
            HR 관리자에게는 <span style={{ color: COLORS.sage }}>이런 화면을</span>
          </h2>
          <p style={{ fontSize: "clamp(14px, 1.875vw, 15px)", color: COLORS.warmGray, marginBottom: 40, lineHeight: 1.7 }}>
            조직의 웰니스 상태를 한눈에. 어떤 프로그램이 필요한지 데이터가 알려줍니다.
          </p>
          <div style={{
            background: COLORS.white, borderRadius: 24, padding: "clamp(24px, 4vw, 32px)",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.06)", width: "100%", textAlign: "left",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: COLORS.sage,
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16,
              }}>W</div>
              <span style={{ fontWeight: 700, color: COLORS.charcoal }}>WELLINK Dashboard</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: COLORS.warmGray }}>HR 관리자 전용</span>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 120px), 1fr))",
              gap: 12,
              marginBottom: 24,
            }}>
              {[
                { label: "WCWI 종합", value: "62.5", color: COLORS.sage },
                { label: "참여율", value: "87%", color: TEAL },
                { label: "고위험 비율", value: "10%", color: COLORS.coral },
                { label: "참여 직원", value: "140명", color: COLORS.sageLight },
              ].map((m, i) => (
                <div key={i} style={{ background: COLORS.bg, borderRadius: 14, padding: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: COLORS.warmGray, marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: "clamp(20px, 3.5vw, 26px)", fontWeight: 800, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16, marginBottom: 20,
            }}>
              <div>
                <div style={{ fontSize: 12, color: COLORS.warmGray, marginBottom: 10 }}>영역별 점수</div>
                <GaugeBar value={78} color="#7B9E87" label="정신적 웰빙" delay={200} />
                <GaugeBar value={71} color="#9B7EC8" label="심리적 웰빙" delay={400} />
                <GaugeBar value={55} color="#E8725C" label="번아웃 (역산)" delay={600} />
                <GaugeBar value={62} color="#5BAEB7" label="신체 건강" delay={800} />
                <GaugeBar value={74} color="#C4A265" label="삶의 만족도" delay={1000} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: COLORS.warmGray, marginBottom: 10 }}>위험등급 분포</div>
                <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", height: 40, marginBottom: 16 }}>
                  {RISK_SEGMENTS.map((s, j) => (
                    <div
                      key={j}
                      style={{
                        width: `${s.pct}%`,
                        background: s.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {s.pct > 14 ? `${s.label} ${s.pct}%` : ""}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {DASH_DEPTS.map((d, k) => (
                    <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: COLORS.warmGray }}>{d.dept}</span>
                      <span style={{ fontWeight: 700, color: COLORS.charcoal }}>{d.score}</span>
                      <span style={{
                        fontSize: 11,
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontWeight: 600,
                        background: d.risk === "주의" ? "rgba(196,162,101,0.2)" : `${TEAL}22`,
                        color: d.risk === "주의" ? COLORS.gold : TEAL,
                      }}>{d.risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{
              marginTop: 8,
              background: `${COLORS.sage}12`,
              borderRadius: 16,
              padding: 16,
              border: `1px solid ${COLORS.sage}25`,
            }}>
              <div style={{ fontSize: 13, color: COLORS.sageDark, fontWeight: 700, marginBottom: 6 }}>📊 WELLINK 추천</div>
              <div style={{ fontSize: 12, color: COLORS.warmGray, lineHeight: 1.6 }}>
                이 조직의 데이터 분석 결과, 에너지 관리와 신체 회복 영역에 우선 개입이 필요합니다. 맞춤형 프로그램을 확인하세요.
              </div>
            </div>
          </div>
          <div style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "center",
            gap: 20,
            flexWrap: "wrap",
            fontSize: 12,
            color: COLORS.warmGray,
          }}>
            <span>🔒 개인정보 미노출 — 집계 데이터만 제공</span>
            <span>📥 PDF/CSV 리포트 다운로드</span>
          </div>
        </div>
      </section>

      {/* PROGRAMS (B2B) */}
      <section id="programs" style={{ padding: "clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px)", background: COLORS.white, width: "100%", maxWidth: "100%" }}>
        <div style={{ width: "100%", maxWidth: "min(100%, 1100px)", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, color: COLORS.charcoal, marginBottom: 12 }}>
            WELLINK 솔루션 프로그램
          </h2>
          <p style={{ textAlign: "center", fontSize: "clamp(14px, 2vw, 16px)", color: COLORS.warmGray, marginBottom: 40 }}>
            데이터가 가리키는 곳에, 정확한 프로그램을 배치합니다
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
            gap: 16,
          }}>
            {PROGRAM_ITEMS.map((p, i) => (
              <div
                key={i}
                style={{
                  background: COLORS.bg, borderRadius: 20, padding: "clamp(20px, 3vw, 24px)",
                  border: "1px solid rgba(0,0,0,0.06)", transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {p.icon ? <div style={{ fontSize: 28, marginBottom: 10 }}>{p.icon}</div> : null}
                <div style={{ fontWeight: 700, color: COLORS.charcoal, fontSize: "clamp(15px, 2vw, 17px)", marginBottom: 6 }}>{p.name}</div>
                <p style={{ fontSize: 13, color: COLORS.warmGray, marginBottom: 10, lineHeight: 1.55 }}>{p.desc}</p>
                <span style={{
                  display: "inline-block", padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                  background: `${p.color}18`, color: p.color,
                }}>{p.dur}</span>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: 11, color: COLORS.warmGray }}>
                  진단 결과에 따라 맞춤 설계됩니다
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <div style={{
              display: "inline-block", background: COLORS.sagePale, borderRadius: 20, padding: "clamp(16px, 3vw, 22px) clamp(20px, 4vw, 32px)",
              maxWidth: 720,
            }}>
              <p style={{ color: COLORS.sageDark, fontWeight: 600, fontSize: "clamp(13px, 1.75vw, 14px)", lineHeight: 1.65 }}>
                어떤 프로그램이 필요한지는 WELLINK의 데이터가 알려드립니다.
                <br />
                <span style={{ color: COLORS.warmGray, fontWeight: 400 }}>
                  모든 프로그램은 WCWI 사전 측정 → 실행 → 사후 재측정의 데이터 기반 사이클로 운영됩니다.
                </span>
              </p>
            </div>
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
        background: `linear-gradient(135deg, ${COLORS.sageDark}, ${COLORS.sage})`,
        width: "100%", maxWidth: "100%",
      }}>
        <h2 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, color: COLORS.white, marginBottom: 12, lineHeight: 1.35 }}>
          직원 건강은 감으로 관리할 수 없습니다
        </h2>
        <p style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "rgba(255,255,255,0.75)", marginBottom: 28, lineHeight: 1.7 }}>
          데이터로 시작하세요.
        </p>
        <div style={{
          background: COLORS.white, borderRadius: 24, padding: "clamp(22px, 4vw, 32px)",
          maxWidth: 560, margin: "0 auto 24px", boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        }}>
          <h3 style={{ fontSize: "clamp(17px, 2.5vw, 20px)", fontWeight: 800, color: COLORS.charcoal, marginBottom: 8 }}>
            무료 파일럿 프로그램
          </h3>
          <p style={{ fontSize: 13, color: COLORS.warmGray, marginBottom: 20, lineHeight: 1.6 }}>
            팀 1개(10~30명) · 2주 웰니스 측정 + 분석 리포트 + 전문가 강의 1회 무료
          </p>
          <button
            type="button"
            onClick={() => transition("lead", { leadCaptureSource: "manager" })}
            style={{
              width: "100%", padding: "16px", borderRadius: 16, border: "none",
              background: `linear-gradient(135deg, ${COLORS.sage}, ${COLORS.sageDark})`,
              color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
            }}
          >
            무료 파일럿 신청하기
          </button>
        </div>
        <p style={{ fontSize: "clamp(13px, 1.75vw, 14px)", color: "rgba(255,255,255,0.65)", marginBottom: 20 }}>
          60초 미니 체크로 현재 상태를 확인하거나, 전체 WCWI 진단으로 깊이 있는 분석을 받아보세요.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => transition("mini")}
            style={{
              padding: "clamp(12px, 2vw, 14px) clamp(24px, 4vw, 32px)", borderRadius: 30, border: "none",
              background: COLORS.white, color: COLORS.sageDark, fontSize: "clamp(13px, 1.85vw, 15px)",
              fontWeight: 700, cursor: "pointer",
            }}
          >
            60초 미니 웰니스 체크
          </button>
          <button
            onClick={() => transition("full")}
            style={{
              padding: "clamp(12px, 2vw, 14px) clamp(24px, 4vw, 32px)", borderRadius: 30,
              border: "2px solid rgba(255,255,255,0.5)",
              background: "transparent", color: "#fff", fontSize: "clamp(13px, 1.85vw, 15px)",
              fontWeight: 600, cursor: "pointer",
            }}
          >
            전체 WCWI 진단
          </button>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 24 }}>
          contact@wellink.co.kr · wellink.co.kr
        </p>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "clamp(24px, 4vw, 32px) clamp(16px, 4vw, 24px)", textAlign: "center", background: COLORS.bgDark, width: "100%", maxWidth: "100%" }}>
        <div style={{ fontSize: "clamp(12px, 1.5vw, 13px)", color: "rgba(255,255,255,0.45)", marginBottom: 8, lineHeight: 1.6 }}>
          © 2026 WELLINK — 데이터 기반 기업 웰니스의 새로운 표준
          <br />
          <span style={{ color: "rgba(255,255,255,0.35)" }}>WELLINK Corp. All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
}
