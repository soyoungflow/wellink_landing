/**
 * Airtable 저장 API 호출 (프론트엔드)
 *
 * 보안: PAT, Base ID, 테이블 ID는 포함하지 않습니다.
 * 모든 요청은 동일 오리진의 /api/airtable (Vercel Serverless Function)으로만 전송됩니다.
 */

/**
 * 서버 API를 통해 Airtable에 레코드 저장
 * @param {string} table - 테이블 이름 ('employee' | 'manager' | 'wcwi' | 'mini')
 * @param {object} fields - 저장할 필드 객체
 */
export async function saveToAirtable(table, fields) {
  console.log("FETCH /api/airtable");
  const r = await fetch("/api/airtable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table, fields }),
  });

  if (!r.ok) {
    const e = await r.json().catch(() => ({ error: { message: "서버 오류가 발생했습니다." } }));
    throw new Error(e.error?.message || "Save failed");
  }

  return r.json();
}
