import { useState, useRef } from "react";
import { saveToAirtable } from "./api/airtable";
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

  // 리드 캡처
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
    if (currentView !== "landing") transition("landing");
    setTimeout(() => roleRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
  };

  const transition = (view) => {
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
      const miniFields = {};
      MINI_QUESTIONS.forEach((q) => {
        if (q.type === "yesno") {
          const v = miniAnswers[q.id];
          miniFields[q.area] = v === "no" ? 100 : 30;
          return;
        }
        const raw = miniAnswers[q.id] ?? 3;
        const scale = q.scale || 5;
        const val = q.reversed ? scale + 1 - raw : raw;
        miniFields[q.area] = Math.round(((val - 1) / (scale - 1)) * 100);
      });
      miniFields["종합점수"] = score;
      miniFields["진단유형"] = "미니체크";
      miniFields["진단일시"] = new Date().toISOString();
      saveToAirtable("wcwi", miniFields).catch(() => {});

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
          onGoLead={() => transition("lead")}
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
    const submitEmp = async () => {
      setLoading(true);
      const fields = { ...empAnswers, 이메일: empEmail, 응답일시: new Date().toISOString() };
      if (Array.isArray(fields["관심프로그램"])) fields["관심프로그램"] = fields["관심프로그램"].join(", ");
      try {
        await saveToAirtable("employee", fields);
        showToast("제출 완료! 감사합니다.", "success");
        transition("thankyou");
      } catch {
        showToast("오류가 발생했습니다. 다시 시도해주세요.", "error");
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
      />
    );
  }

  if (currentView === "manager") {
    const submitMgr = async () => {
      setLoading(true);
      const fields = { ...mgrAnswers, 이메일: mgrEmail, 응답일시: new Date().toISOString() };
      if (Array.isArray(fields["필요기능"])) fields["필요기능"] = fields["필요기능"].join(", ");
      try {
        await saveToAirtable("manager", fields);
        showToast("제출 완료! 감사합니다.", "success");
        transition("thankyou");
      } catch {
        showToast("오류가 발생했습니다. 다시 시도해주세요.", "error");
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
      />
    );
  }

  if (currentView === "thankyou") {
    return <ThankYouView fadeIn={fadeIn} transition={transition} />;
  }

  return null;
}
