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
      display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(16px, 4vw, 24px)", width: "100%", maxWidth: "100%",
      opacity: fadeIn ? 1 : 0, transition: "opacity 0.3s",
    }}>
      <style>{THANKYOU_STYLES}</style>
      <div style={{
        background: COLORS.white, borderRadius: 28, padding: "clamp(40px, 8vw, 60px) clamp(24px, 4vw, 36px)",
        width: "100%", maxWidth: "min(100%, 600px)", textAlign: "center",
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
            padding: "clamp(14px, 2vw, 16px) clamp(32px, 5vw, 40px)", borderRadius: 30, border: "none",
            background: COLORS.sage, color: "#fff", fontSize: "clamp(14px, 2vw, 16px)",
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
              color: COLORS.warmGray, fontSize: "clamp(13px, 1.75vw, 14px)", cursor: "pointer",
            }}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
