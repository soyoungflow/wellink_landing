/**
 * WELLINK 32 캐릭터 시스템
 *
 * 5개 지표 (고점/저점):
 *   Burnout:  V (Vitality)   / B (Burnout)
 *   Motion:   M (Movement)   / P (Pain)
 *   Energy:   E (Energy)     / D (Down)
 *   Self:     S (Solid)      / U (Uncertain)
 *   Joy:      J (Joy)        / N (Negative)
 *
 * 코드 = 5글자 조합 → 2^5 = 32가지
 * 각 지표의 cutoff: 50점 기준 (0~100 정규화 점수)
 */

export const INDICATOR_LABELS = {
  burnout:      { high: "V", low: "B", highName: "Vitality",    lowName: "Burnout",   label: "번아웃 여부" },
  physical:     { high: "M", low: "P", highName: "Movement",    lowName: "Pain",      label: "신체/근골격 건강" },
  mental:       { high: "E", low: "D", highName: "Energy",      lowName: "Down",      label: "기분 및 활력" },
  psychological:{ high: "S", low: "U", highName: "Solid",       lowName: "Uncertain", label: "자존감/내면" },
  satisfaction: { high: "J", low: "N", highName: "Joy",         lowName: "Negative",  label: "삶의 만족도" },
};

/** 지표 순서 (코드 생성 시 이 순서대로) */
export const INDICATOR_ORDER = ["burnout", "physical", "mental", "psychological", "satisfaction"];

/** 점수 → 코드 문자 변환 (burnout은 역전: 높을수록 위험이므로 100-score로 변환) */
export function scoresToCode(scores, cutoff = 50) {
  return INDICATOR_ORDER.map((key) => {
    const ind = INDICATOR_LABELS[key];
    // burnout은 scores에서 "위험 점수"로 저장됨 (높을수록 나쁨)
    // 따라서 건강 점수 = 100 - burnout
    const healthScore = key === "burnout" ? (100 - (scores[key] ?? 0)) : (scores[key] ?? 0);
    return healthScore >= cutoff ? ind.high : ind.low;
  }).join("");
}

/** 32 캐릭터 정의 */
export const CHARACTERS = {
  VMESJ: { name: "육각형 챌린저",       icon: "💎", description: "모든 지표가 완벽한 웰니스계의 신계입니다." },
  VMESN: { name: "야망 있는 워커홀릭",   icon: "🔥", description: "다 좋은데 현재에 만족하지 않는 야수입니다." },
  VMEUJ: { name: "무한 긍정 탱크",       icon: "💪", description: "자존감이 높아서 어떤 시련도 이겨냅니다." },
  VMEUN: { name: "마이웨이 효율러",     icon: "🏃‍♂️", description: "남 시선 신경 안 쓰고 갈 길 가는 실속파입니다." },
  VMDSJ: { name: "강철 멘탈 로봇",       icon: "🤖", description: "멘탈은 단단한데 삶의 재미를 찾는 중입니다." },
  VMDSN: { name: "차가운 도시의 전사",   icon: "🏙️", description: "성과 중심적이라 마음 한구석이 허전합니다." },
  VMDUJ: { name: "해맑은 근육몬",       icon: "🏋️‍♂️", description: "기분은 최고인데 몸이 좀 쑤시는 상태입니다." },
  VMDUN: { name: "파이팅 현실파",       icon: "🥊", description: '몸은 좀 피곤해도 "가보자고!"를 외칩니다.' },
  VPESJ: { name: "유연한 선비",         icon: "🧘‍♂️", description: "몸은 좀 뻣뻣해도 정신 승리 만렙 고수입니다." },
  VPESN: { name: "고민 많은 철학자",     icon: "🤔", description: "생각은 깊은데 몸 관리가 필요한 지성인입니다." },
  VPEUJ: { name: "사랑둥이 거북목",     icon: "🦒", description: "자존감은 높지만 목 각도가 위험한 상태입니다." },
  VPEUN: { name: "자유로운 영혼",       icon: "🪁", description: "얽매이는 건 싫은데 체력이 좀 부족합니다." },
  VPDSJ: { name: "유리 척추 낙천가",     icon: "🩹", description: "몸은 종합병원인데 웃음은 잃지 않습니다." },
  VPDSN: { name: "착한 번아웃 예비군",   icon: "🪫", description: "성격은 좋은데 슬슬 배터리 경고등이 뜹니다." },
  VPDUJ: { name: "자존감 높은 고목",     icon: "🌳", description: "자아는 튼튼한데 몸과 기분이 축 처졌습니다." },
  VPDUN: { name: "은둔하는 현자",       icon: "🏞️", description: "혼자만의 시간이 필요한 지친 지식인입니다." },
  BMESJ: { name: "지친 슈퍼 히어로",     icon: "🦸‍♂️", description: "능력은 최고인데 잠시 방전된 상태입니다." },
  BMESN: { name: "독기 완벽주의자",     icon: "🐍", description: "성과를 위해 자신을 갈아 넣고 있습니다." },
  BMEUJ: { name: "의지의 근육맨",       icon: "🦾", description: "몸은 튼튼한데 마음이 공허해진 상태입니다." },
  BMEUN: { name: "번아웃된 베테랑",     icon: "👨‍✈️", description: "실력은 좋은데 다 귀찮아진 고인물입니다." },
  BMDSJ: { name: "외강내유 유리 멘탈",   icon: "🪞", description: "겉은 멀쩡해 보여도 속은 타들어 가고 있습니다." },
  BMDSN: { name: "기계적인 직장인",     icon: "📠", description: "영혼 없이 출근 버튼만 누르는 상태입니다." },
  BMDUJ: { name: "해맑은 유리 몸",       icon: "🤡", description: "기분은 억지로 끌어올렸으나 몸이 안 따라줍니다." },
  BMDUN: { name: "위태로운 광대",       icon: "🎭", description: "겉으론 웃고 있지만 속은 이미 텅 비었습니다." },
  BPESJ: { name: "말랑한 거북이",       icon: "🐢", description: "성격은 참 좋은데 기력이 하나도 없습니다." },
  BPESN: { name: "방전된 브레인",       icon: "🧠", description: "머리는 돌아가는데 몸과 마음이 멈췄습니다." },
  BPEUJ: { name: "사랑이 필요한 좀비",   icon: "🧟", description: "자존감 하나로 버티고 있는 위험 상태입니다." },
  BPEUN: { name: "길 잃은 어린 양",     icon: "🐑", description: "어디로 가야 할지 모르는 지친 영혼입니다." },
  BPDSJ: { name: "긍정적 폐건전지",     icon: "🛌", description: '"다 잘될 거야"라며 누워있는 상태입니다.' },
  BPDSN: { name: "한계 도달 개미",       icon: "🐜", description: "성실함으로 버티다 임계점에 도달했습니다." },
  BPDUJ: { name: "고독한 침묵자",       icon: "😶", description: "아무와도 말하고 싶지 않은 깊은 번아웃입니다." },
  BPDUN: { name: "심폐소생술 대상자",   icon: "🚑", description: "SOS! 당장 모든 걸 멈추고 쉬어야 합니다!" },
};

/**
 * 캐릭터별 상호작용 메시지 (4~5개씩)
 * 캐릭터 클릭 시 순차적으로 보여줄 대사/팁
 */
export const CHARACTER_INTERACTIONS = {
  VMESJ: [
    "당신은 모든 영역이 균형 잡힌 드문 유형이에요!",
    "이 상태를 유지하는 비결, 주변에도 나눠주세요 ✨",
    "정기적인 셀프 체크인으로 꾸준히 관리해보세요.",
    "다른 사람의 웰니스 멘토가 되어보는 건 어때요?",
  ],
  VMESN: [
    "능력은 최고인데... 왜 행복하지 않은 걸까요?",
    "성취와 만족은 다른 거예요. 잠시 멈춰 보세요.",
    "오늘 하루, '충분하다'고 스스로에게 말해주세요.",
    "'더 높이' 대신 '더 깊이' 살아보는 건 어때요?",
    "감사 일기 3줄, 오늘부터 시작해볼까요?",
  ],
  VMEUJ: [
    "당신의 긍정 에너지는 어디서 오는 건가요? 💪",
    "자존감이 높아서 스트레스도 잘 넘기시네요!",
    "가끔은 약한 모습을 보여줘도 괜찮아요.",
    "삶의 만족도를 높일 작은 목표를 세워볼까요?",
  ],
  VMEUN: [
    "효율적인 당신! 하지만 가끔은 비효율도 필요해요.",
    "혼자서도 잘하지만, 함께하면 더 좋을 수 있어요.",
    "나만의 페이스를 지키되, 주변도 둘러보세요.",
    "'내 방식'이 항상 정답은 아닐 수 있어요.",
  ],
  VMDSJ: [
    "강철 멘탈이시군요! 하지만 로봇은 아니잖아요.",
    "기분이 처져도 괜찮아요. 감정을 느껴보세요.",
    "좋아하던 취미, 언제 마지막으로 했나요?",
    "작은 즐거움을 찾아보세요. 맛집 탐방이라든가!",
    "에너지 충전이 필요해요. 10분 산책 어때요?",
  ],
  VMDSN: [
    "성과는 좋은데... 마음은 어때요?",
    "허전한 마음, 무시하지 말고 들여다보세요.",
    "일 말고 '나'를 위한 시간을 만들어보세요.",
    "따뜻한 대화 한 번이 성과보다 중요할 때도 있어요.",
  ],
  VMDUJ: [
    "기분은 좋은데 몸이 말을 안 듣죠? 🏋️",
    "스트레칭 5분, 오늘부터 시작해봐요!",
    "자존감 높은 당신, 몸도 사랑해주세요.",
    "올바른 자세가 기분까지 좋게 만들어요.",
    "하루 30분 걷기만으로도 달라질 수 있어요.",
  ],
  VMDUN: [
    "파이팅! 하지만 몸이 보내는 신호를 무시하면 안 돼요.",
    "지금의 열정, 체력이 뒷받침해야 오래 가요.",
    "오늘 잠은 충분히 주무셨나요?",
    "가보자고! 하기 전에 스트레칭부터 해볼까요?",
  ],
  VPESJ: [
    "정신 승리 만렙! 하지만 몸도 챙겨야죠 🧘",
    "요가나 필라테스, 한번 시작해볼까요?",
    "유연한 마음에 유연한 몸을 더해보세요.",
    "규칙적인 운동이 정신 건강에도 도움이 돼요.",
  ],
  VPESN: [
    "깊은 생각도 좋지만, 몸을 움직여보세요.",
    "고민의 답은 의외로 산책 중에 찾을 수 있어요.",
    "철학도 좋지만, 오늘은 스트레칭이 먼저!",
    "몸이 편해지면 생각도 맑아져요.",
    "가벼운 운동으로 생각의 폭을 넓혀보세요.",
  ],
  VPEUJ: [
    "거북목 주의보! 모니터 높이를 확인해보세요 🦒",
    "자존감만큼 자세도 높여볼까요?",
    "1시간마다 목 스트레칭, 알람을 설정해보세요!",
    "인체공학 키보드나 모니터 암, 고려해보세요.",
  ],
  VPEUN: [
    "자유로운 영혼이시군요! 체력만 보충하면 날 수 있어요.",
    "가벼운 조깅부터 시작해볼까요?",
    "자유를 누리려면 건강이 기본이에요.",
    "하루 10분 운동으로 자유의 시간을 늘려보세요.",
  ],
  VPDSJ: [
    "웃음이 최고의 약이지만... 진짜 약도 필요할 수 있어요!",
    "몸이 보내는 신호, 무시하지 마세요.",
    "정기 건강검진, 받으신 지 얼마나 됐나요?",
    "낙천적인 것도 좋지만, 몸 관리는 현실적으로!",
    "통증이 있다면 전문가 상담을 받아보세요.",
  ],
  VPDSN: [
    "배터리 경고등이 깜빡이고 있어요! 🪫",
    "지금 쉬지 않으면 곧 완전 방전될 수 있어요.",
    "착한 사람도 'No'라고 말할 줄 알아야 해요.",
    "오늘만큼은 자기 자신을 먼저 챙겨주세요.",
  ],
  VPDUJ: [
    "자아는 튼튼한데 몸과 기분이 따라오지 않네요.",
    "자존감을 지키면서 몸도 돌봐주세요.",
    "좋아하는 음악 들으며 가볍게 걸어볼까요?",
    "기분 전환이 필요해요. 새로운 공간에 가보세요.",
  ],
  VPDUN: [
    "지친 현자님, 혼자만의 시간도 좋지만...",
    "가끔은 사람들과 어울리는 것도 에너지가 돼요.",
    "몸과 마음, 둘 다 쉬어야 할 때예요.",
    "자연 속에서 재충전하는 시간을 가져보세요.",
    "무리하지 말고, 천천히 회복해요.",
  ],
  BMESJ: [
    "히어로도 쉬어야 해요! 잠시 망토를 내려놓으세요 🦸",
    "번아웃은 약함이 아니라 신호예요.",
    "지금 가장 필요한 건 '아무것도 안 하는 시간'이에요.",
    "충전 없이는 계속 달릴 수 없어요.",
  ],
  BMESN: [
    "자신을 갈아 넣지 마세요. 대체불가인 건 당신이에요.",
    "완벽하지 않아도 괜찮다는 걸 기억하세요.",
    "독기보다 여유가 더 좋은 성과를 만들어요.",
    "오늘 하루, 80%만 해보는 건 어때요?",
    "번아웃은 성실함의 부작용이에요. 조절이 필요해요.",
  ],
  BMEUJ: [
    "근육은 있는데 마음이 텅 빈 느낌이죠?",
    "운동도 좋지만, 마음 운동도 필요해요.",
    "친한 친구와 솔직한 대화를 나눠보세요.",
    "명상이나 호흡법으로 내면을 채워보세요.",
  ],
  BMEUN: [
    "다 귀찮은 거, 충분히 이해해요.",
    "작은 것 하나만 바꿔보는 건 어때요?",
    "번아웃에서 벗어나는 첫 걸음은 '인정'이에요.",
    "오늘 딱 한 가지만 해보세요. 그것도 충분해요.",
  ],
  BMDSJ: [
    "괜찮은 척 하지 않아도 돼요. 속마음을 꺼내보세요.",
    "겉과 속이 다르면 더 지치는 법이에요.",
    "믿을 수 있는 사람에게 솔직해져 보세요.",
    "감정을 표현하는 건 용기 있는 행동이에요.",
    "전문 상담을 받아보는 것도 좋은 방법이에요.",
  ],
  BMDSN: [
    "출근은 하지만... 살아있는 느낌인가요?",
    "영혼 없는 하루가 반복된다면, 변화가 필요해요.",
    "퇴근 후 딱 30분, 나만의 시간을 만들어보세요.",
    "작은 취미 하나가 일상을 바꿀 수 있어요.",
  ],
  BMDUJ: [
    "억지 웃음은 금방 들통나요. 진짜 감정을 느껴보세요.",
    "기분을 끌어올리느라 에너지를 너무 쓰고 있어요.",
    "몸이 힘들면 기분도 따라 내려가요.",
    "오늘은 무리하지 말고 일찍 자보세요.",
    "전문가의 도움을 받는 건 현명한 선택이에요.",
  ],
  BMDUN: [
    "겉으로 웃고 있지만, 속이 텅 빈 건 아닌가요?",
    "혼자 버티지 마세요. 도움을 요청해도 괜찮아요.",
    "지금 당장 필요한 건 진짜 휴식이에요.",
    "감정을 억누르면 결국 폭발해요. 조금씩 풀어주세요.",
  ],
  BPESJ: [
    "거북이처럼 느려도 괜찮아요. 방향만 맞으면 돼요 🐢",
    "기력이 없을 땐 무리하지 말고 천천히!",
    "영양 보충과 수면이 최우선이에요.",
    "가까운 병원에서 기본 검진을 받아보세요.",
  ],
  BPESN: [
    "머리는 돌아가는데 몸과 마음이 멈춘 상태군요.",
    "지금은 생각을 줄이고 쉬어야 할 때예요.",
    "분석보다 행동이 필요해요. 작은 것부터!",
    "충분한 수면이 최고의 해결책일 수 있어요.",
    "전문가 상담을 적극 권장드려요.",
  ],
  BPEUJ: [
    "자존감 하나로 버티고 계시군요. 대단해요!",
    "하지만 혼자 버티는 데는 한계가 있어요.",
    "주변에 도움을 요청하는 것도 강함이에요.",
    "지금 가장 시급한 건 신체 건강 관리예요.",
  ],
  BPEUN: [
    "길을 잃은 것 같은 기분, 충분히 이해해요.",
    "지금 당장 방향을 정하지 않아도 괜찮아요.",
    "먼저 몸과 마음을 쉬게 해주세요.",
    "신뢰할 수 있는 사람에게 이야기해보세요.",
    "작은 한 걸음이 큰 변화를 만들어요.",
  ],
  BPDSJ: [
    "긍정적인 건 좋지만... 지금은 쉴 때예요!",
    "'잘 될 거야'보다 '쉬어야 해'가 맞는 타이밍이에요.",
    "낙관도 좋지만, 현실적인 회복 계획이 필요해요.",
    "충분한 수면과 영양 섭취부터 시작하세요.",
  ],
  BPDSN: [
    "성실한 개미도 쉬어야 오래 가요!",
    "임계점에 도달했다면, 지금 당장 멈추세요.",
    "번아웃은 게으름이 아니에요. 치료가 필요해요.",
    "워라밸을 위한 구체적인 계획을 세워보세요.",
    "EAP(직원지원프로그램)가 있다면 활용해보세요.",
  ],
  BPDUJ: [
    "말하고 싶지 않은 마음, 존중해요.",
    "하지만 완전히 혼자가 되진 마세요.",
    "글로 감정을 적어보는 것도 도움이 돼요.",
    "전문 상담을 꼭 받아보시길 권해요.",
  ],
  BPDUN: [
    "🚑 SOS! 지금 당장 모든 것을 멈추세요.",
    "당신의 건강이 가장 중요합니다.",
    "가까운 사람이나 전문가에게 연락하세요.",
    "혼자 해결하려 하지 마세요. 도움을 받을 자격이 있어요.",
    "지금 이 순간, 깊게 숨을 3번 쉬어보세요.",
  ],
};

/**
 * 캐릭터 위험 등급 (코드의 저점 개수 기반)
 */
export const RISK_TIERS = {
  EXCELLENT: { min: 0, max: 0, label: "최상", color: "#4CAF50", bgColor: "#E8F5E9" },
  GOOD:      { min: 1, max: 1, label: "양호", color: "#7B9E87", bgColor: "#E8F0EB" },
  WATCH:     { min: 2, max: 2, label: "주의", color: "#FF9800", bgColor: "#FFF3E0" },
  CAUTION:   { min: 3, max: 3, label: "경고", color: "#FF5722", bgColor: "#FBE9E7" },
  DANGER:    { min: 4, max: 5, label: "위험", color: "#D32F2F", bgColor: "#FFEBEE" },
};

/** 코드에서 저점 개수 계산 */
export function countLowIndicators(code) {
  const lows = new Set(INDICATOR_ORDER.map((k) => INDICATOR_LABELS[k].low));
  return code.split("").filter((c) => lows.has(c)).length;
}

/** 저점 개수 → 위험 등급 */
export function getRiskTier(code) {
  const lowCount = countLowIndicators(code);
  for (const [key, tier] of Object.entries(RISK_TIERS)) {
    if (lowCount >= tier.min && lowCount <= tier.max) return { key, ...tier };
  }
  return { key: "DANGER", ...RISK_TIERS.DANGER };
}

/** 점수 → 캐릭터 객체 반환 */
export function getCharacter(scores, cutoff = 50) {
  const code = scoresToCode(scores, cutoff);
  const char = CHARACTERS[code];
  const tier = getRiskTier(code);
  if (!char) return null;
  return { code, ...char, tier };
}
