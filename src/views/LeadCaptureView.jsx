import { COLORS } from "../constants/theme";

const LEAD_STYLES = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&display=swap');
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`;

export default function LeadCaptureView({ email, setEmail, company, setCompany, role, setRole, transition }) {
  return (
    <div style={{
      fontFamily: "'Noto Sans KR', sans-serif", minHeight: "100vh",
      background: `linear-gradient(135deg, ${COLORS.bg}, ${COLORS.sagePale})`,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <style>{LEAD_STYLES}</style>
      <div style={{
        background: COLORS.white, borderRadius: 28, padding: "48px 36px",
        maxWidth: 460, width: "100%",
        boxShadow: "0 24px 80px rgba(0,0,0,0.08)",
        animation: "fadeUp 0.5s ease-out",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🏢</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.charcoal, marginBottom: 8 }}>
            기업용 무료 웰니스 감사
          </h2>
          <p style={{ fontSize: 14, color: COLORS.warmGray, lineHeight: 1.6 }}>
            귀사 직원 대상 WCWI 진단과 분석 리포트를
            <br />무료로 제공합니다.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.charcoal, marginBottom: 6, display: "block" }}>이메일 *</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="work@company.com"
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12,
                border: "2px solid #E8E5DE", fontSize: 14, outline: "none",
                transition: "border 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = COLORS.sage)}
              onBlur={(e) => (e.target.style.borderColor = "#E8E5DE")}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.charcoal, marginBottom: 6, display: "block" }}>회사명</label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="회사명을 입력하세요"
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12,
                border: "2px solid #E8E5DE", fontSize: 14, outline: "none",
                transition: "border 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = COLORS.sage)}
              onBlur={(e) => (e.target.style.borderColor = "#E8E5DE")}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.charcoal, marginBottom: 6, display: "block" }}>직책/역할</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12,
                border: "2px solid #E8E5DE", fontSize: 14, outline: "none",
                background: COLORS.white, color: role ? COLORS.charcoal : COLORS.warmGray,
              }}
            >
              <option value="">선택하세요</option>
              <option value="hr">HR 담당자</option>
              <option value="ceo">경영진/CEO</option>
              <option value="welfare">복지 담당자</option>
              <option value="employee">일반 직원</option>
              <option value="other">기타</option>
            </select>
          </div>

          <button
            onClick={() => {
              alert("감사합니다! 입력하신 정보로 곧 연락드리겠습니다. 🌿");
              transition("landing");
            }}
            style={{
              padding: "16px", borderRadius: 16, border: "none",
              background: `linear-gradient(135deg, ${COLORS.sage}, ${COLORS.sageDark})`,
              color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
              marginTop: 8, boxShadow: `0 8px 24px ${COLORS.sage}30`,
            }}
          >
            무료 감사 신청하기
          </button>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => transition("landing")}
              style={{
                padding: "12px", border: "none", background: "transparent",
                color: COLORS.warmGray, fontSize: 13, cursor: "pointer",
              }}
            >
              ← 메인으로 돌아가기
            </button>
          </div>
        </div>

        <div style={{
          marginTop: 24, padding: "16px", borderRadius: 12,
          background: COLORS.sagePale, fontSize: 12, color: COLORS.warmGray,
          lineHeight: 1.6, textAlign: "center",
        }}>
          🔒 입력하신 정보는 서비스 안내 목적으로만 사용되며,
          <br />제3자에게 제공되지 않습니다.
        </div>
      </div>
    </div>
  );
}
