# 폼 제출 → Airtable 테이블/필드 맵핑 표

| 화면 / 버튼 | 테이블 | 전송 필드 (Airtable 필드명) | 비고 |
|-------------|--------|-----------------------------|------|
| **LeadCaptureView** / 무료 감사 신청하기 (진입: 미니/전체결과) | mini | created_at, source, email, answers_json | score/level 없음 |
| **LeadCaptureView** / 무료 감사 신청하기 (진입: 직원설문) | employee | Email, source, open_feedback | 리드캡처 문구만 |
| **LeadCaptureView** / 무료 감사 신청하기 (진입: 관리자설문) | manager | Email, Additional_comments | 리드캡처 문구만 |
| **EmployeeSurveyView** / 제출 | employee | company_size, job_type, work_style, physical_discomfort_level, mental_stress_level, burnout_experience, need_for_wellness_service, preferred_program_type, interest_in_short_program, payment_amount, willingness_to_use_service, company_support_expectation, open_feedback, created_time, source, Email | fieldMapping 한글→영문 |
| **ManagerSurveyView** / 제출 | manager | Company_size, Current_programs, Wellness_importance, Needed_services, Pain_points, Adoption_interest, Required_features, Cheap_price_range, Reasonable_price, Additional_comments, Email | fieldMapping 한글→영문 |
| **MiniResult** / 이 결과를 HR팀에 공유하기 | mini | score, level, answers_json, created_at | email/source/utm 선택적 |

- **wcwi**: 현재 앱에서 제출 플로우 없음 (Assessments 테이블 미사용).
