import { COLORS } from "../constants/theme";

const THANKYOU_STYLES = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes scaleIn { from { opacity:0;transform:scale(0.85);} to { opacity:1;transform:scale(1);} }
`;

export default function ThankYouView({ fadeIn, transition }) {
  return (
    <div style={{
      fontFamily: "'Noto Sans KR', sans-serif", minHeight: "100vh",
      background: `linear-gradient(135deg, ${COLORS.bg}, ${COLORS.sagePale})`,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      opacity: fadeIn ? 1 : 0, transition: "opacity 0.3s",
    }}>
      <style>{THANKYOU_STYLES}</style>
      <div style={{
        background: COLORS.white, borderRadius: 28, padding: "60px 36px",
        maxWidth: 480, width: "100%", textAlign: "center",
        boxShadow: "0 24px 80px rgba(0,0,0,0.08)",
        animation: "scaleIn 0.5s ease-out",
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%", margin: "0 auto 24px",
          background: COLORS.sagePale, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 36,
        }}>🎉</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.charcoal, marginBottom: 12 }}>감사합니다!</h2>
        <p style={{ fontSize: 15, color: COLORS.warmGray, lineHeight: 1.7, marginBottom: 32 }}>
          소중한 의견이 성공적으로 제출되었습니다.<br />
          더 나은 웰니스 서비스를 만드는 데 큰 도움이 됩니다.
        </p>
        <button
          onClick={() => transition("mini")}
          style={{
            padding: "16px 40px", borderRadius: 30, border: "none",
            background: COLORS.sage, color: "#fff", fontSize: 16,
            fontWeight: 700, cursor: "pointer", marginBottom: 16,
          }}
        >
          ⚡ 60초 웰니스 진단 받기
        </button>
        <div>
          <button
            onClick={() => transition("landing")}
            style={{
              padding: "12px", border: "none", background: "transparent",
              color: COLORS.warmGray, fontSize: 14, cursor: "pointer",
            }}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
