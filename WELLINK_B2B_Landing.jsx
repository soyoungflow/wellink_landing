import { useState, useEffect, useRef } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell } from "recharts";

// ─── Palette ───
const C = {
  sage: "#5B8A72", sageLt: "#84B59F", sageBg: "#EFF5F1",
  teal: "#3D8B8B", coral: "#E8725A", gold: "#D4A853",
  bg: "#FAFBFC", dark: "#1A1F2E", card: "#FFFFFF",
  text: "#1E293B", med: "#475569", lt: "#94A3B8", border: "#E2E8F0",
};

// ─── Scroll fade-in hook ───
function useFadeIn() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Section({ children, className = "", dark = false, id }) {
  const [ref, vis] = useFadeIn();
  return (
    <section id={id} ref={ref} className={`${dark ? "bg-[#1A1F2E] text-white" : "bg-[#FAFBFC]"} ${className}`}
      style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(40px)", transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)" }}>
      <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28">{children}</div>
    </section>
  );
}

// ─── Radar chart with icon-only labels ───
const radarData = [
  { area: "🔥", v: 55, full: 100 }, { area: "🦴", v: 68, full: 100 },
  { area: "💜", v: 66, full: 100 }, { area: "🧡", v: 72, full: 100 }, { area: "😊", v: 64, full: 100 },
];

function WCWIRadar({ size = 280 }) {
  return (
    <ResponsiveContainer width={size} height={size}>
      <RadarChart data={radarData} cx="50%" cy="50%">
        <PolarGrid stroke="#E2E8F0" />
        <PolarAngleAxis dataKey="area" tick={{ fontSize: 18 }} />
        <Radar dataKey="v" stroke={C.sage} fill={C.sage} fillOpacity={0.25} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── Risk distribution bar ───
function RiskBar() {
  const segs = [
    { label: "우수", pct: 23.6, color: C.sage },
    { label: "양호", pct: 39.3, color: C.teal },
    { label: "주의", pct: 27.1, color: C.gold },
    { label: "고위험", pct: 10, color: C.coral },
  ];
  return (
    <div className="flex rounded-lg overflow-hidden h-10">
      {segs.map((s, i) => (
        <div key={i} style={{ width: `${s.pct}%`, background: s.color }}
          className="flex items-center justify-center text-white text-xs font-semibold">
          {s.pct > 15 && `${s.label} ${s.pct}%`}
        </div>
      ))}
    </div>
  );
}

// ─── Phone mockup frame ───
function PhoneMockup({ children, title }) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-72 overflow-hidden flex-shrink-0">
      <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b">
        <div className="w-3 h-3 rounded-full bg-gray-300" />
        <span className="text-xs text-gray-500 font-medium">{title}</span>
      </div>
      <div className="p-4 min-h-[360px]">{children}</div>
    </div>
  );
}

// ─── Dashboard mockup ───
function DashboardMockup() {
  const barData = [
    { name: "영역A", score: 55, color: C.gold },
    { name: "영역B", score: 68, color: C.sage },
    { name: "영역C", score: 66, color: C.teal },
    { name: "영역D", score: 72, color: C.sage },
    { name: "영역E", score: 64, color: C.sageLt },
  ];
  return (
    <div className="bg-[#1A1F2E] rounded-2xl p-6 shadow-2xl border border-gray-700 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#5B8A72] flex items-center justify-center text-white text-sm font-bold">W</div>
        <span className="text-white font-semibold">WELLINK Dashboard</span>
        <span className="ml-auto text-xs text-gray-500">HR 관리자 전용</span>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "WCWI 종합", value: "62.5", color: C.sage },
          { label: "참여율", value: "87%", color: C.teal },
          { label: "고위험 비율", value: "10%", color: C.coral },
          { label: "참여 직원", value: "140명", color: C.sageLt },
        ].map((m, i) => (
          <div key={i} className="bg-[#232B3E] rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">{m.label}</div>
            <div className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#232B3E] rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-3">영역별 점수</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#232B3E] rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-3">위험등급 분포</div>
          <RiskBar />
          <div className="mt-4 space-y-2">
            {[
              { dept: "개발팀", score: 58.3, risk: "주의" },
              { dept: "마케팅", score: 71.2, risk: "양호" },
              { dept: "영업팀", score: 64.8, risk: "양호" },
            ].map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{d.dept}</span>
                <span className="text-white font-medium">{d.score}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${d.risk === "주의" ? "bg-yellow-900/30 text-yellow-400" : "bg-teal-900/30 text-teal-400"}`}>{d.risk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 bg-[#5B8A72]/10 rounded-xl p-4 border border-[#5B8A72]/20">
        <div className="text-sm text-[#84B59F] font-semibold mb-1">📊 WELLINK 추천</div>
        <div className="text-xs text-gray-400">이 조직의 데이터 분석 결과, 에너지 관리와 신체 회복 영역에 우선 개입이 필요합니다. 맞춤형 프로그램을 확인하세요.</div>
      </div>
    </div>
  );
}

// ─── Main Landing Page ───
export default function WELLINKLanding() {
  const [activeStep, setActiveStep] = useState(0);
  const [hoveredProgram, setHoveredProgram] = useState(null);

  return (
    <div className="bg-[#FAFBFC]" style={{ fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif" }}>

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#5B8A72] flex items-center justify-center text-white font-bold text-sm">W</div>
            <span className="font-bold text-lg text-[#1E293B]">WELLINK</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <a href="#problem" className="hover:text-[#5B8A72] transition">왜 필요한가</a>
            <a href="#solution" className="hover:text-[#5B8A72] transition">서비스</a>
            <a href="#flow" className="hover:text-[#5B8A72] transition">사용 흐름</a>
            <a href="#programs" className="hover:text-[#5B8A72] transition">프로그램</a>
          </div>
          <button className="bg-[#5B8A72] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#4A7A62] transition shadow-lg shadow-[#5B8A72]/20">
            무료 파일럿 신청
          </button>
        </div>
      </nav>

      {/* ═══ 1. HERO ═══ */}
      <section className="relative overflow-hidden bg-[#1A1F2E] pt-32 pb-24">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#5B8A72] rounded-full opacity-[0.06] blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#3D8B8B] rounded-full opacity-[0.06] blur-3xl" />
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-[#5B8A72]/10 text-[#84B59F] text-xs font-semibold mb-6 border border-[#5B8A72]/20">
              데이터 기반 기업 웰니스
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
              측정하지 않으면<br />
              <span className="text-[#84B59F]">관리할 수 없습니다</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              WELLINK의 독자적 웰니스 진단으로 조직의 건강 상태를 데이터로 파악하고,<br className="hidden lg:block" />
              어떤 복지 프로그램이 필요한지 정확히 알려드립니다.
            </p>
            <div className="flex gap-4">
              <button className="bg-[#5B8A72] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#4A7A62] transition shadow-xl shadow-[#5B8A72]/30">
                무료 파일럿 신청
              </button>
              <a href="#flow" className="border border-gray-600 text-gray-300 px-8 py-4 rounded-2xl font-semibold text-lg hover:border-gray-400 transition flex items-center gap-2">
                서비스 둘러보기 ↓
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-8 bg-[#5B8A72]/5 rounded-3xl blur-xl" />
              <div className="relative bg-[#232B3E] rounded-2xl p-8 border border-gray-700/50">
                <div className="text-xs text-gray-500 mb-1">WCWI 종합 점수</div>
                <div className="text-5xl font-extrabold text-[#5B8A72] mb-1">62.5</div>
                <div className="text-xs text-gray-500 mb-4">/ 100점 · 양호</div>
                <WCWIRadar size={240} />
                <div className="text-center text-xs text-gray-600 mt-2">다차원 웰니스 진단 결과</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 2. PROBLEM ═══ */}
      <Section id="problem">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E293B] mb-4">직원 웰니스를 방치하면</h2>
          <p className="text-gray-500 text-lg">조직 전반에 걸쳐 동시에 무너집니다</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { stat: "2.6배", title: "이직 가능성 증가", desc: "회복 없는 업무 → 만성 피로 → 병가 63% 증가 → 핵심 인력 이탈", src: "Gallup, 2024", color: C.coral },
            { stat: "35%", title: "생산성 손실", desc: "만성 통증 → 집중력 저하 → 출근하지만 일 못하는 상태 확산", src: "WHO, 2023", color: C.gold },
            { stat: "86%", title: "우울 위험 감지율", desc: "감정 에너지 저하 → 동기 상실 → 팀 전체 사기 저하", src: "WHO 가이드라인", color: C.teal },
            { stat: "76%", title: "혁신 제안 감소", desc: "심리적 안전감 부족 → 의견 회피 → 소극적 문화 고착", src: "Google", color: C.sage },
            { stat: "3배", title: "이직 탐색 확률", desc: "삶의 불만족 → 경력직부터 이탈 → 재채용 비용 연봉의 50~200%", src: "SHRM, 2024", color: C.coral },
            { stat: "1:4", title: "웰니스 투자 수익비", desc: "웰니스에 1원 투자 시 의료비·이직비용에서 4원을 절감", src: "Deloitte", color: C.sage },
          ].map((r, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl font-extrabold mb-2" style={{ color: r.color }}>{r.stat}</div>
              <div className="font-bold text-[#1E293B] mb-2">{r.title}</div>
              <div className="text-sm text-gray-500 mb-3 leading-relaxed">{r.desc}</div>
              <div className="text-xs text-gray-400">— {r.src}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ 3. SOLUTION ═══ */}
      <Section id="solution" dark>
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">WELLINK이 <span className="text-[#84B59F]">해결합니다</span></h2>
          <p className="text-gray-400 text-lg">과학적으로 검증된 독자적 다차원 웰니스 진단 체계</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-[#2A1515]/50 rounded-2xl p-8 border border-red-900/20">
            <h3 className="text-[#E8725A] font-bold text-xl mb-6">지표 없이 복지 운영</h3>
            {["\"힘들어 보여서\" 프로그램 도입", "효과 있었는지 알 수 없음", "ROI 설명 불가 → 예산 삭감 위험", "매년 비슷한 프로그램 반복", "경영진에게 '체감'만 전달"].map((t, i) => (
              <div key={i} className="flex gap-3 mb-3 text-gray-400">
                <span className="text-red-400">✗</span><span>{t}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#5B8A72]/5 rounded-2xl p-8 border border-[#5B8A72]/20">
            <h3 className="text-[#84B59F] font-bold text-xl mb-6">WELLINK 데이터 기반 의사결정</h3>
            {["다차원 데이터로 '어디가 약한지' 정확히 파악", "취약 영역에 맞는 프로그램 선택 근거 확보", "전후 점수 비교로 효과를 숫자로 증명", "위험군 조기 발견 → 이직 예방 선제 대응", "경영진에게 데이터 기반 ROI 리포트 제출"].map((t, i) => (
              <div key={i} className="flex gap-3 mb-3 text-gray-200">
                <span className="text-[#84B59F]">✓</span><span>{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          {[
            { icon: "⏱", label: "5분이면 충분합니다", sub: "비의료적 자가 평가" },
            { icon: "📊", label: "데이터로 진단합니다", sub: "다차원 과학적 측정" },
            { icon: "🎯", label: "맞춤형으로 처방합니다", sub: "진단 결과 기반 프로그램 추천" },
          ].map((f, i) => (
            <div key={i} className="bg-[#232B3E] rounded-2xl p-6 border border-gray-700/50">
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="text-white font-bold mb-1">{f.label}</div>
              <div className="text-gray-500 text-sm">{f.sub}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ 4. MVP FLOW ═══ */}
      <Section id="flow">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E293B] mb-4">직원은 이렇게 사용합니다</h2>
          <p className="text-gray-500 text-lg">간편한 4단계로 나의 웰니스 상태를 확인하세요</p>
        </div>
        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-12">
          {["로그인", "초대코드", "웰니스 테스트", "개인 리포트"].map((s, i) => (
            <button key={i} onClick={() => setActiveStep(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${activeStep === i ? "bg-[#5B8A72] text-white shadow-lg" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {`0${i + 1}. ${s}`}
            </button>
          ))}
        </div>
        {/* Phone mockups */}
        <div className="flex justify-center">
          {activeStep === 0 && (
            <PhoneMockup title="wellink.co.kr">
              <div className="text-center pt-8">
                <div className="w-16 h-16 rounded-2xl bg-[#5B8A72] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">W</div>
                <h3 className="font-bold text-lg text-gray-800 mb-1">WELLINK</h3>
                <p className="text-gray-400 text-sm mb-8">3초 만에 시작하세요</p>
                <button className="w-full bg-[#FEE500] text-[#3C1E1E] py-3 rounded-xl font-semibold text-sm mb-3 flex items-center justify-center gap-2">
                  💬 카카오로 시작하기
                </button>
                <button className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                  🔍 Google로 시작하기
                </button>
              </div>
            </PhoneMockup>
          )}
          {activeStep === 1 && (
            <PhoneMockup title="초대코드 입력">
              <div className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-[#5B8A72]/10 flex items-center justify-center text-[#5B8A72] text-xl mb-4">🏢</div>
                <h3 className="font-bold text-gray-800 mb-2">초대코드를 입력해주세요</h3>
                <p className="text-gray-400 text-sm mb-6">회사에서 받은 코드를 입력하면<br/>팀에 자동으로 연결됩니다</p>
                <div className="flex gap-2 mb-4">
                  {["W","E","L","L","2","6"].map((c, i) => (
                    <div key={i} className="w-10 h-12 rounded-lg bg-gray-50 border-2 border-[#5B8A72] flex items-center justify-center text-lg font-bold text-[#5B8A72]">{c}</div>
                  ))}
                </div>
                <button className="w-full bg-[#5B8A72] text-white py-3 rounded-xl font-semibold text-sm">확인</button>
                <p className="text-center text-xs text-gray-400 mt-4">코드가 없으신가요? HR 담당자에게 문의해주세요</p>
              </div>
            </PhoneMockup>
          )}
          {activeStep === 2 && (
            <PhoneMockup title="웰니스 테스트">
              <div className="pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-gray-400">12 / 24</span>
                  <span className="text-xs text-[#5B8A72] font-semibold">50%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full mb-6">
                  <div className="h-2 bg-[#5B8A72] rounded-full" style={{ width: "50%" }} />
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-4 min-h-[60px] flex items-center">
                  <p className="text-gray-800 text-sm font-medium" style={{ filter: "blur(4px)", userSelect: "none" }}>
                    최근 2주간 일상에서 흥미나 즐거움을 느꼈습니다
                  </p>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} className={`w-full py-3 rounded-xl text-sm font-medium border transition ${n === 4 ? "bg-[#5B8A72] text-white border-[#5B8A72]" : "bg-white text-gray-600 border-gray-200 hover:border-[#5B8A72]"}`}>
                      {["전혀 아니다", "거의 아니다", "보통이다", "대체로 그렇다", "매우 그렇다"][n - 1]}
                    </button>
                  ))}
                </div>
              </div>
            </PhoneMockup>
          )}
          {activeStep === 3 && (
            <PhoneMockup title="나의 웰니스 리포트">
              <div className="pt-2">
                <div className="text-center mb-3">
                  <div className="text-xs text-gray-400">WCWI 종합 점수</div>
                  <div className="text-4xl font-extrabold text-[#5B8A72]">68.2</div>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#3D8B8B]/10 text-[#3D8B8B] text-xs font-semibold mt-1">양호</span>
                </div>
                <div className="flex justify-center mb-3">
                  <WCWIRadar size={180} />
                </div>
                <div className="bg-[#FEF3C7] rounded-xl p-3 mb-3">
                  <div className="text-xs font-semibold text-[#D4A853] mb-1">⚠ 주의 영역 발견</div>
                  <div className="text-xs text-gray-600">일부 영역에서 관리가 필요합니다. WELLINK의 맞춤 프로그램을 확인해보세요.</div>
                </div>
                <button className="w-full bg-[#5B8A72] text-white py-2.5 rounded-xl text-sm font-semibold">추천 프로그램 보기 →</button>
              </div>
            </PhoneMockup>
          )}
        </div>
      </Section>

      {/* ═══ 5. ADMIN DASHBOARD ═══ */}
      <Section id="dashboard" dark>
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">HR 관리자에게는 <span className="text-[#84B59F]">이런 화면을</span></h2>
          <p className="text-gray-400 text-lg">조직의 웰니스 상태를 한눈에. 어떤 프로그램이 필요한지 데이터가 알려줍니다.</p>
        </div>
        <DashboardMockup />
        <div className="mt-8 flex justify-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-2">🔒 개인정보 미노출 — 집계 데이터만 제공</span>
          <span className="flex items-center gap-2">📥 PDF/CSV 리포트 다운로드</span>
        </div>
      </Section>

      {/* ═══ 6. PROGRAMS ═══ */}
      <Section id="programs">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E293B] mb-4">WELLINK 솔루션 프로그램</h2>
          <p className="text-gray-500 text-lg">데이터가 가리키는 곳에, 정확한 프로그램을 배치합니다</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: "🔥", name: "번아웃 리셋", desc: "호흡 · 명상 · 이완", dur: "4~8주", color: C.coral },
            { icon: "🦴", name: "오피스 바디케어", desc: "필라테스 · 스트레칭", dur: "4~12주", color: C.gold },
            { icon: "💜", name: "감정 에너지 충전", desc: "마인드풀니스 · 감정 인식", dur: "4~8주", color: C.teal },
            { icon: "🧡", name: "마인드 그로스", desc: "자기자비 · 강점 발견", dur: "4~8주", color: "#F97316" },
            { icon: "💎", name: "심층 웰니스 코칭", desc: "1:1 / 그룹 심화 세션", dur: "8~12주", color: C.sage },
            { icon: "🏢", name: "조직 문화 컨설팅", desc: "심리적 안전감 · 복지 재설계", dur: "4~8주", color: C.sageLt },
          ].map((p, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredProgram(i)} onMouseLeave={() => setHoveredProgram(null)}>
              <div className="text-3xl mb-3">{p.icon}</div>
              <h3 className="font-bold text-[#1E293B] text-lg mb-1">{p.name}</h3>
              <p className="text-gray-500 text-sm mb-3">{p.desc}</p>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${p.color}15`, color: p.color }}>{p.dur}</span>
              {hoveredProgram === i && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                  진단 결과에 따라 맞춤 설계됩니다
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <div className="inline-block bg-[#EFF5F1] rounded-2xl px-8 py-4">
            <p className="text-[#5B8A72] font-semibold text-sm">
              어떤 프로그램이 필요한지는 WELLINK의 데이터가 알려드립니다.<br />
              <span className="text-gray-500 font-normal">모든 프로그램은 WCWI 사전 측정 → 실행 → 사후 재측정의 데이터 기반 사이클로 운영됩니다.</span>
            </p>
          </div>
        </div>
      </Section>

      {/* ═══ 7. ROI ═══ */}
      <Section dark>
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">숫자로 <span className="text-[#84B59F]">증명합니다</span></h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { stat: "1:4", label: "투자 수익 비율", src: "Deloitte", color: C.sage },
            { stat: "20%", label: "생산성 향상", src: "GWI, 2025", color: C.teal },
            { stat: "25%", label: "결근율 감소", src: "WHO", color: C.gold },
            { stat: "10%", label: "직원 유지율↑", src: "GWI, 2025", color: C.sageLt },
          ].map((r, i) => (
            <div key={i} className="bg-[#232B3E] rounded-2xl p-8 text-center border border-gray-700/30 hover:border-[#5B8A72]/30 transition">
              <div className="text-4xl font-extrabold mb-2" style={{ color: r.color }}>{r.stat}</div>
              <div className="text-white font-semibold mb-1">{r.label}</div>
              <div className="text-gray-500 text-xs">{r.src}</div>
            </div>
          ))}
        </div>
        <div className="mt-10 bg-[#232B3E] rounded-2xl p-6 text-center border border-gray-700/30">
          <div className="text-gray-400 text-sm mb-2">실제 140명 측정 결과</div>
          <div className="flex justify-center gap-8 flex-wrap">
            <div><span className="text-2xl font-bold text-[#5B8A72]">62.5</span><span className="text-gray-500 text-sm ml-1">종합 점수</span></div>
            <div><span className="text-2xl font-bold text-[#D4A853]">10%</span><span className="text-gray-500 text-sm ml-1">고위험군</span></div>
            <div><span className="text-2xl font-bold text-[#3D8B8B]">87%</span><span className="text-gray-500 text-sm ml-1">참여율</span></div>
          </div>
        </div>
      </Section>

      {/* ═══ 8. PROCESS ═══ */}
      <Section id="process">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E293B] mb-4">도입은 이렇게 간단합니다</h2>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {[
            { n: "01", title: "사전 미팅", dur: "1~2일", desc: "HR 담당자와 조직 현황 파악", color: C.sage },
            { n: "02", title: "웰니스 측정", dur: "1주", desc: "전 직원 온라인 설문 · 5분", color: C.teal },
            { n: "03", title: "분석 리포트", dur: "3일", desc: "다차원 분석 + 프로그램 추천", color: C.gold },
            { n: "04", title: "웰니스 강의", dur: "1~2회", desc: "데이터 기반 전문가 강의", color: C.sage },
            { n: "05", title: "맞춤 프로그램", dur: "4~12주", desc: "데이터 기반 솔루션 실행", color: C.teal },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 text-center hover:shadow-md transition">
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold" style={{ background: `${s.color}15`, color: s.color }}>
                {s.n}
              </div>
              <h4 className="font-bold text-[#1E293B] mb-1">{s.title}</h4>
              <div className="text-xs text-gray-400 mb-2">{s.dur}</div>
              <div className="text-sm text-gray-500">{s.desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 bg-[#EFF5F1] rounded-2xl p-6 text-center">
          <p className="text-[#5B8A72] font-semibold">사후 재측정 + ROI 리포트</p>
          <p className="text-gray-500 text-sm mt-1">프로그램 종료 후 재측정 → Before/After 비교 → 경영진 보고용 ROI 리포트 제공</p>
        </div>
      </Section>

      {/* ═══ 9. TRUST ═══ */}
      <Section dark>
        <div className="grid lg:grid-cols-4 gap-6">
          {[
            { icon: "🔬", title: "과학적 검증", desc: "국제적으로 검증된 측정 도구를 통합한 독자적 진단 체계" },
            { icon: "📊", title: "실증 데이터", desc: "140명 실측 데이터 기반으로 설계된 분석 로직" },
            { icon: "🧘", title: "전문가 직접 진행", desc: "웰니스 전문가(필라테스/요가 4년+)가 직접 강의·코칭" },
            { icon: "🔒", title: "개인정보 보호", desc: "비의료적 자가평가 · 개인정보 미수집 · 암호화 저장" },
          ].map((t, i) => (
            <div key={i} className="bg-[#232B3E] rounded-2xl p-6 border border-gray-700/30 text-center">
              <div className="text-3xl mb-3">{t.icon}</div>
              <h4 className="text-white font-bold mb-2">{t.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ 10. CTA ═══ */}
      <section className="bg-[#5B8A72] py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">직원 건강은 감으로 관리할 수 없습니다</h2>
          <p className="text-white/70 text-lg mb-10">데이터로 시작하세요.</p>
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-extrabold text-[#1E293B] mb-2">무료 파일럿 프로그램</h3>
            <p className="text-gray-500 mb-6">팀 1개(10~30명) · 2주 웰니스 측정 + 분석 리포트 + 전문가 강의 1회 무료</p>
            <div className="grid md:grid-cols-3 gap-3 mb-4">
              <input placeholder="회사명" className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#5B8A72]" />
              <input placeholder="담당자명" className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#5B8A72]" />
              <input placeholder="이메일" className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#5B8A72]" />
            </div>
            <button className="w-full bg-[#5B8A72] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#4A7A62] transition shadow-lg">
              무료 파일럿 신청하기
            </button>
          </div>
          <p className="text-white/50 text-sm mt-6">contact@wellink.co.kr · wellink.co.kr</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1A1F2E] py-8 text-center text-gray-600 text-sm">
        © 2026 WELLINK — 데이터 기반 기업 웰니스의 새로운 표준
      </footer>
    </div>
  );
}
