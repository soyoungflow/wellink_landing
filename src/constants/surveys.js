/**
 * 수요조사 (재직자/관리자) 페이지 및 문항 정의
 * opts 값은 Airtable MCP 스키마(Employee_Wellness_Market_Survey / Wellness Survey Company Responses)와 동일하게 유지.
 */
export const EMP_PAGES = [
  {
    title: "기본 정보",
    icon: "📋",
    fields: [
      { key: "회사규모", q: "회사 규모", type: "chip", opts: ["10명 미만", "10~49명", "50~200명", "200명 이상"] },
      { key: "직종", q: "직종", type: "chip", opts: ["사무직", "연구/개발", "영업/마케팅", "생산/현장직", "기타"] },
      { key: "업무스타일", q: "업무 스타일", type: "chip", opts: ["전일 출근", "재택근무", "혼합형(출근+재택)"] },
    ],
  },
  {
    title: "웰니스 문제 인식",
    icon: "🩺",
    fields: [
      { key: "신체불편", q: "업무로 인해 신체적 불편함을 느낀다.", type: "likert" },
      { key: "정신스트레스", q: "정신적 스트레스를 자주 느낀다.", type: "likert" },
      { key: "번아웃경험", q: "최근 6개월 내 번아웃을 경험했다.", type: "likert" },
    ],
  },
  {
    title: "서비스 필요성 및 선호",
    icon: "💡",
    fields: [
      { key: "참여의향", q: "웰니스 프로그램 참여 의향이 있다.", type: "likert" },
      { key: "관심프로그램", q: "관심 있는 프로그램 (복수 선택)", type: "multi", opts: ["근골격계 스트레칭", "명상/호흡", "번아웃 관리", "수면/회복", "감정 관리", "기타"] },
      { key: "유료지불의향", q: "유료 시 비용 지불 의향", type: "likert" },
      { key: "월지불금액", q: "월 지불 가능 금액", type: "chip", opts: ["10,000원 미만", "10,000~30,000원", "30,000~50,000원", "50,000원 이상", "가격에 따라 결정할 의향이 있습니다"] },
    ],
  },
  {
    title: "기업 관점 수용성",
    icon: "🏢",
    fields: [
      { key: "서비스사용의향", q: "회사에서 디지털 웰니스 서비스를 제공하면 사용하겠다.", type: "likert" },
      { key: "기업투자필요", q: "회사가 직원 웰니스에 비용을 투자해야 한다.", type: "likert" },
      { key: "기대우려", q: "기대하는 점이나 우려되는 점 (선택)", type: "textarea" },
    ],
  },
];

export const MGR_PAGES = [
  {
    title: "기업 현황",
    icon: "🏢",
    fields: [
      { key: "기업인원", q: "현재 기업 인원", type: "chip", opts: ["10명 이하", "10-50명", "50-200명", "200명 이상"] },
      { key: "현재프로그램", q: "현재 운영 중인 직원 웰빙 프로그램", type: "textarea", placeholder: "예: 사내 요가, EAP 상담 등 / 없으면 '없음'" },
    ],
  },
  {
    title: "웰니스 인식 및 수요",
    icon: "📊",
    fields: [
      { key: "건강중요도", q: "직원 건강이 기업 성과에 중요하다고 생각한다.", type: "likert" },
      { key: "필요서비스", q: "성과 향상과 복지를 위해 가장 필요한 서비스", type: "textarea" },
      { key: "애로사항", q: "직원 복지 서비스 개선의 애로 사항", type: "textarea", placeholder: "예산 부족, 운영 인력 부족 등" },
    ],
  },
  {
    title: "서비스 도입 의향",
    icon: "💡",
    fields: [
      { key: "디지털웰니스관심", q: "디지털 기반 웰니스 서비스에 관심이 있나요?", type: "chip", opts: ["있음", "없음"] },
      { key: "필요기능", q: "필요한 기능 (복수 선택)", type: "multi", opts: ["정신건강 콘텐츠", "요가, 필라테스 등 운동 콘텐츠", "번아웃 평가 및 리포트", "데이터 분석 및 대시보드", "기타"] },
      { key: "저렴의심가격", q: "전문성이 의심될 정도로 저렴한 비용은?", type: "chip", opts: ["인당 5천원 ~1만원", "인당 1~2만원", "인당 2~3만원"] },
      { key: "합리적가격", q: "가장 합리적인 비용은?", type: "textarea", placeholder: "인당/월, 연 구독, 계약건당 등 자유롭게" },
    ],
  },
  {
    title: "추가 의견",
    icon: "💬",
    fields: [
      { key: "추가의견", q: "추가 바라는 점이나 우려사항", type: "textarea", placeholder: "선택사항입니다." },
    ],
  },
];
