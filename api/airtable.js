/**
 * Vercel Serverless Function: Airtable API 프록시
 *
 * 환경변수 (Vercel 대시보드에서 설정):
 * - AIRTABLE_PAT: Airtable Personal Access Token (필수)
 * - AIRTABLE_BASE_ID: Airtable Base ID (필수)
 * - AIRTABLE_TABLE_EMPLOYEE: Employee 테이블 ID (필수)
 * - AIRTABLE_TABLE_MANAGER: Manager 테이블 ID (필수)
 * - AIRTABLE_TABLE_WCWI: WCWI 테이블 ID (필수)
 */

function getTableId(table) {
  const id = process.env[`AIRTABLE_TABLE_${table.toUpperCase()}`];
  if (!id) throw new Error(`환경변수 AIRTABLE_TABLE_${table.toUpperCase()}가 필요합니다.`);
  return id;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  const PAT = process.env.AIRTABLE_PAT;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (!PAT || !BASE_ID) {
    console.error("AIRTABLE_PAT 또는 AIRTABLE_BASE_ID 환경변수가 설정되지 않았습니다.");
    return res.status(500).json({ error: { message: "서버 설정 오류" } });
  }

  try {
    const { table, fields } = req.body;

    if (!table || !fields || typeof fields !== "object") {
      return res.status(400).json({ error: { message: "table과 fields가 필요합니다." } });
    }

    const allowedTables = ["employee", "manager", "wcwi"];
    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: { message: `유효하지 않은 테이블: ${table}` } });
    }
    let tableId;
    try {
      tableId = getTableId(table);
    } catch (e) {
      return res.status(500).json({ error: { message: e.message } });
    }

    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records: [{ fields }] }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: "Airtable API 오류" } }));
      console.error("Airtable API 오류:", error);
      return res.status(response.status).json({
        error: error.error || { message: "Airtable 저장 실패" },
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("서버 오류:", error);
    return res.status(500).json({ error: { message: "서버 오류가 발생했습니다." } });
  }
}
