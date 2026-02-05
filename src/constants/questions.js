/**
 * WCWI 진단 문항 및 미니 체크 문항 정의
 */

export const WCWI_QUESTIONS = {
  mental: {
    title: "정신적 웰빙",
    icon: "🧠",
    color: "#7B9E87",
    questions: [
      { id: "m1", text: "최근 2주간 기분이 밝고 활기차다고 느꼈습니까?", scale: 5 },
      { id: "m2", text: "최근 2주간 차분하고 편안한 기분을 느꼈습니까?", scale: 5 },
      { id: "m3", text: "아침에 개운하게 일어났다고 느꼈습니까?", scale: 5 },
      { id: "m4", text: "일상이 흥미로운 것들로 가득하다고 느꼈습니까?", scale: 5 },
      { id: "m5", text: "전반적으로 활력이 넘친다고 느꼈습니까?", scale: 5 },
    ],
  },
  psychological: {
    title: "심리적 웰빙",
    icon: "💜",
    color: "#9B7EC8",
    questions: [
      { id: "p1", text: "나는 내 결정을 스스로 내리는 편이다", scale: 7 },
      { id: "p2", text: "나는 일상에서의 요구사항들을 잘 관리하고 있다", scale: 7 },
      { id: "p3", text: "나는 새로운 경험을 통해 성장하고 있다고 느낀다", scale: 7 },
      { id: "p4", text: "주변 사람들과 따뜻하고 신뢰 있는 관계를 맺고 있다", scale: 7 },
      { id: "p5", text: "내 삶에 목적과 방향이 있다고 느낀다", scale: 7 },
      { id: "p6", text: "전반적으로 나 자신에 대해 긍정적으로 느낀다", scale: 7 },
    ],
  },
  burnout: {
    title: "번아웃/피로",
    icon: "🔥",
    color: "#E8725C",
    questions: [
      { id: "b1", text: "육체적으로 지쳐있다고 느끼는 빈도는?", scale: 5, reversed: true },
      { id: "b2", text: "정서적으로 소진되었다고 느끼는 빈도는?", scale: 5, reversed: true },
      { id: "b3", text: "업무가 감당하기 어렵다고 느끼는 빈도는?", scale: 5, reversed: true },
      { id: "b4", text: "하루가 끝나면 완전히 녹초가 되는 빈도는?", scale: 5, reversed: true },
      { id: "b5", text: "일이 나를 감정적으로 힘들게 하는 빈도는?", scale: 5, reversed: true },
    ],
  },
  physical: {
    title: "신체·근골격",
    icon: "🏃",
    color: "#5BAEB7",
    questions: [
      { id: "ph1", text: "최근 12개월간 목, 어깨, 허리 등에 통증을 느꼈습니까?", type: "body" },
      { id: "ph2", text: "최근 7일 내에 신체 통증이나 불편감이 있었습니까?", type: "yesno" },
      { id: "ph3", text: "신체 증상이 일상이나 업무에 영향을 미쳤습니까?", type: "yesno" },
    ],
  },
  satisfaction: {
    title: "삶의 만족도",
    icon: "⭐",
    color: "#C4A265",
    questions: [
      { id: "s1", text: "대체로 내 삶은 내가 이상적으로 여기는 것에 가깝다", scale: 7 },
      { id: "s2", text: "내 삶의 조건은 훌륭하다", scale: 7 },
      { id: "s3", text: "나는 내 삶에 만족한다", scale: 7 },
      { id: "s4", text: "지금까지 삶에서 원하는 중요한 것들을 얻었다", scale: 7 },
      { id: "s5", text: "다시 살더라도 거의 바꾸지 않을 것이다", scale: 7 },
    ],
  },
};

export const BODY_PARTS = [
  "목", "어깨", "팔꿈치", "손목/손", "상부 등", "하부 등(허리)",
  "엉덩이/허벅지", "무릎", "발목/발",
];

export const MINI_QUESTIONS = [
  { id: "mini1", text: "최근 2주간 기분이 밝고 활기차다고 느꼈습니까?", area: "정신적 웰빙", scale: 5, color: "#7B9E87" },
  { id: "mini2", text: "내 삶에 목적과 방향이 있다고 느낀다", area: "심리적 웰빙", scale: 7, color: "#9B7EC8" },
  { id: "mini3", text: "육체적으로 지쳐있다고 느끼는 빈도는?", area: "번아웃", scale: 5, color: "#E8725C", reversed: true },
  { id: "mini4", text: "최근 7일 내에 신체 통증이나 불편감이 있었습니까?", area: "신체 건강", type: "yesno", color: "#5BAEB7" },
  { id: "mini5", text: "나는 내 삶에 만족한다", area: "삶의 만족도", scale: 7, color: "#C4A265" },
];
