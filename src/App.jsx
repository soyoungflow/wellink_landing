import { useState, useRef } from "react";
import { saveToAirtable } from "./api/airtable";
import { normalizePayload, validatePayload } from "./api/airtableNormalize";
import { WCWI_QUESTIONS, MINI_QUESTIONS } from "./constants/questions";
import { calculateMiniScore, calculateFullScores } from "./utils/scoreUtils";
import {
  LandingView,
  MiniResult,
  MiniQuestions,
  FullResult,
  FullQuestions,
  LeadCaptureView,
  EmployeeSurveyView,
  ManagerSurveyView,
  ThankYouView,
} from "./views";

export default function WellinkMVP() {
  const [currentView, setCurrentView] = useState("landing");
  const [fadeIn, setFadeIn] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const roleRef = useRef(null);

  // 미니 체크
  const [miniAnswers, setMiniAnswers] = useState({});
  const [miniStep, setMiniStep] = useState(0);

  // 전체 WCWI
  const [fullAnswers, setFullAnswers] = useState({});
  const [fullSection, setFullSection] = useState(0);
  const [fullStep, setFullStep] = useState(0);
  const [bodyParts, setBodyParts] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // 리드 캡처 (진입 경로: mini | full | employee | manager)
  const [leadCaptureSource, setLeadCaptureSource] = useState("mini");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  // 재직자 수요조사
  const [empAnswers, setEmpAnswers] = useState({});
  const [empPage, setEmpPage] = useState(0);
  const [empEmail, setEmpEmail] = useState("");
  const [empConsent, setEmpConsent] = useState(false);

  // 관리자 수요조사
  const [mgrAnswers, setMgrAnswers] = useState({});
  const [mgrPage, setMgrPage] = useState(0);
  const [mgrEmail, setMgrEmail] = useState("");
  const [mgrConsent, setMgrConsent] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const scrollToRole = () => {
    if (currentView !== "landing") {
      transition("landing");
      setTimeout(() => roleRef.current?.scrollIntoView({ behavior: "smooth" }), 400);
    } else {
      setTimeout(() => roleRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    }
  };

  const transition = (view, options) => {
    if (view === "lead" && options?.leadCaptureSource) {
      setLeadCaptureSource(options.leadCaptureSource);
    }
    setFadeIn(false);
    setTimeout(() => {
      setCurrentView(view);
      setFadeIn(true);
      window.scrollTo(0, 0);
    }, 300);
  };

  const onSelectRole = (key) => {
    if (key === "employee") {
      setEmpAnswers({});
      setEmpPage(0);
      setEmpEmail("");
      setEmpConsent(false);
    } else {
      setMgrAnswers({});
      setMgrPage(0);
      setMgrEmail("");
      setMgrConsent(false);
    }
    transition(key);
  };

  const sectionKeys = Object.keys(WCWI_QUESTIONS);
  const currentSection = WCWI_QUESTIONS[sectionKeys[fullSection]];
  const currentQ = currentSection ? currentSection.questions[fullStep] : null;
  const totalQuestions = Object.values(WCWI_QUESTIONS).reduce((a, s) => a + s.questions.length, 0);
  const answeredCount = Object.keys(fullAnswers).length;

  // ---------- 뷰 라우팅 ----------

  if (currentView === "landing") {
    return (
      <LandingView
        fadeIn={fadeIn}
        transition={transition}
        scrollToRole={scrollToRole}
        onSelectRole={onSelectRole}
        roleRef={roleRef}
      />
    );
  }

  if (currentView === "mini") {
    if (miniStep >= MINI_QUESTIONS.length) {
      const score = calculateMiniScore(miniAnswers);
      return (
        <MiniResult
          score={score}
          miniAnswers={miniAnswers}
          transition={transition}
          onGoFull={() => {
            setMiniStep(0);
            setMiniAnswers({});
            transition("full");
          }}
          onGoLead={() => transition("lead", { leadCaptureSource: "mini" })}
          onGoSurvey={() => {
            setMiniStep(0);
            setMiniAnswers({});
            scrollToRole();
          }}
          onGoHome={() => {
            setMiniStep(0);
            setMiniAnswers({});
            transition("landing");
          }}
        />
      );
    }
    return (
      <MiniQuestions
        miniStep={miniStep}
        miniAnswers={miniAnswers}
        setMiniAnswers={setMiniAnswers}
        setMiniStep={setMiniStep}
        transition={transition}
      />
    );
  }

  if (currentView === "full") {
    if (showResults) {
      const scores = calculateFullScores(fullAnswers, bodyParts);
      return (
        <FullResult
          scores={scores}
          transition={transition}
          onGoHome={() => {
            setShowResults(false);
            setFullAnswers({});
            setFullSection(0);
            setFullStep(0);
            setBodyParts([]);
            transition("landing");
          }}
        />
      );
    }
    return (
      <FullQuestions
        sectionKeys={sectionKeys}
        fullSection={fullSection}
        fullStep={fullStep}
        fullAnswers={fullAnswers}
        bodyParts={bodyParts}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        currentSection={currentSection}
        currentQ={currentQ}
        setFullAnswers={setFullAnswers}
        setFullStep={setFullStep}
        setFullSection={setFullSection}
        setBodyParts={setBodyParts}
        setShowResults={setShowResults}
        transition={transition}
      />
    );
  }

  if (currentView === "lead") {
    return (
      <LeadCaptureView
        leadCaptureSource={leadCaptureSource}
        email={email}
        setEmail={setEmail}
        company={company}
        setCompany={setCompany}
        role={role}
        setRole={setRole}
        transition={transition}
      />
    );
  }

  if (currentView === "employee") {
    // Airtable Single select 옵션 문자열
    const LIKERT_5 = {
      1: "1 (전혀 아니다)",
      2: "2 (아니다)",
      3: "3 (보통이다)",
      4: "4 (그렇다)",
      5: "5 (매우 그렇다)",
    };
    /** willingness_to_use_service: Airtable choices와 동일 (역스케일 1=매우있다 ~ 5=전혀없다) */
    const LIKERT_5_WILLINGNESS = {
      1: "1 (매우있다)",
      2: "2 (있다)",
      3: "3 (보통이다)",
      4: "4 (별로없다)",
      5: "5 (전혀없다)",
    };
    const LIKERT_KEYS = [
      "신체불편",
      "정신스트레스",
      "번아웃경험",
      "참여의향",
      "유료지불의향",
      "기업투자필요",
    ];
    const submitEmp = async () => {
      setLoading(true);
      const fieldMapping = {
        "회사규모": "company_size",
        "직종": "job_type",
        "업무스타일": "work_style",
        "신체불편": "physical_discomfort_level",
        "정신스트레스": "mental_stress_level",
        "번아웃경험": "burnout_experience",
        "참여의향": "need_for_wellness_service",
        "관심프로그램": "preferred_program_type",
        "유료지불의향": "interest_in_short_program",
        "월지불금액": "payment_amount",
        "서비스사용의향": "willingness_to_use_service",
        "기업투자필요": "company_support_expectation",
        "기대우려": "open_feedback",
      };
      const mappedFields = {};
      Object.keys(empAnswers).forEach((key) => {
        const airtableKey = fieldMapping[key];
        if (airtableKey) {
          let value = empAnswers[key];
          if (key === "관심프로그램" && Array.isArray(value)) {
            value = value;
          } else if (key === "서비스사용의향" && typeof value === "number" && LIKERT_5_WILLINGNESS[value]) {
            value = LIKERT_5_WILLINGNESS[value];
          } else if (LIKERT_KEYS.includes(key) && typeof value === "number" && LIKERT_5[value]) {
            value = LIKERT_5[value];
          }
          mappedFields[airtableKey] = value;
        }
      });
      mappedFields["created_time"] = new Date().toISOString();
      mappedFields["source"] = "기타";
      if (empEmail) {
        mappedFields["Email"] = empEmail;
      }
      try {
        const normalized = normalizePayload("employee", mappedFields);
        const validation = validatePayload("employee", normalized);
        if (!validation.valid) {
          const msg = "제출 데이터 검증에 실패했습니다. 다시 시도해주세요.";
          showToast(msg, "error");
          console.error("[Airtable 검증 실패] employee", validation.errors);
          setLoading(false);
          return;
        }
        await saveToAirtable("employee", normalized);
        showToast("제출 완료! 감사합니다.", "success");
        transition("thankyou");
      } catch (err) {
        const msg = err?.message || "오류가 발생했습니다. 다시 시도해주세요.";
        showToast(msg, "error");
        console.error("[Airtable 제출 오류] employee", err);
      } finally {
        setLoading(false);
      }
    };
    return (
      <EmployeeSurveyView
        empPage={empPage}
        setEmpPage={setEmpPage}
        empAnswers={empAnswers}
        setEmpAnswers={setEmpAnswers}
        empEmail={empEmail}
        setEmpEmail={setEmpEmail}
        empConsent={empConsent}
        setEmpConsent={setEmpConsent}
        fadeIn={fadeIn}
        toast={toast}
        loading={loading}
        transition={transition}
        onSubmit={submitEmp}
        onGoLeadCapture={() => transition("lead", { leadCaptureSource: "employee" })}
      />
    );
  }

  if (currentView === "manager") {
    // Airtable Company_size 옵션: 10-50명, 50-200명 (물결 아님)
    const companySizeToAirtable = (v) => {
      if (v === "10~50명") return "10-50명";
      if (v === "50~200명") return "50-200명";
      return v;
    };
    const submitMgr = async () => {
      setLoading(true);
      const fieldMapping = {
        "기업인원": "Company_size",
        "현재프로그램": "Current_programs",
        "건강중요도": "Wellness_importance",
        "필요서비스": "Needed_services",
        "애로사항": "Pain_points",
        "디지털웰니스관심": "Adoption_interest",
        "필요기능": "Required_features",
        "저렴의심가격": "Cheap_price_range",
        "합리적가격": "Reasonable_price",
        "추가의견": "Additional_comments",
      };
      const mappedFields = {};
      Object.keys(mgrAnswers).forEach((key) => {
        const airtableKey = fieldMapping[key];
        if (airtableKey) {
          let value = mgrAnswers[key];
          if (key === "필요기능" && Array.isArray(value)) {
            value = value;
          } else if (key === "기업인원" && typeof value === "string") {
            value = companySizeToAirtable(value);
          }
          mappedFields[airtableKey] = value;
        }
      });
      if (mgrEmail) {
        mappedFields["Email"] = mgrEmail;
      }
      try {
        const normalized = normalizePayload("manager", mappedFields);
        const validation = validatePayload("manager", normalized);
        if (!validation.valid) {
          const msg = "제출 데이터 검증에 실패했습니다. 다시 시도해주세요.";
          showToast(msg, "error");
          console.error("[Airtable 검증 실패] manager", validation.errors);
          setLoading(false);
          return;
        }
        await saveToAirtable("manager", normalized);
        showToast("제출 완료! 감사합니다.", "success");
        transition("thankyou");
      } catch (err) {
        const msg = err?.message || "오류가 발생했습니다. 다시 시도해주세요.";
        showToast(msg, "error");
        console.error("[Airtable 제출 오류] manager", err);
      } finally {
        setLoading(false);
      }
    };
    return (
      <ManagerSurveyView
        mgrPage={mgrPage}
        setMgrPage={setMgrPage}
        mgrAnswers={mgrAnswers}
        setMgrAnswers={setMgrAnswers}
        mgrEmail={mgrEmail}
        setMgrEmail={setMgrEmail}
        mgrConsent={mgrConsent}
        setMgrConsent={setMgrConsent}
        fadeIn={fadeIn}
        toast={toast}
        loading={loading}
        transition={transition}
        onSubmit={submitMgr}
        onGoLeadCapture={() => transition("lead", { leadCaptureSource: "manager" })}
      />
    );
  }

  if (currentView === "thankyou") {
    return <ThankYouView fadeIn={fadeIn} transition={transition} />;
  }

  return null;
}
