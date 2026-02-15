/* global process */
/**
 * 로컬 개발용 서버 예시 (Express.js)
 *
 * Vercel 배포 시에는 사용하지 않습니다. /api/airtable.js (Serverless Function)를 사용합니다.
 *
 * 설치: npm install express cors dotenv
 *
 * 환경변수 (.env):
 *   AIRTABLE_PAT=your_personal_access_token
 *   AIRTABLE_BASE_ID=your_base_id
 *   AIRTABLE_TABLE_EMPLOYEE=your_employee_table_id
 *   AIRTABLE_TABLE_MANAGER=your_manager_table_id
 *   AIRTABLE_TABLE_WCWI=your_wcwi_table_id
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

function getTableId(table) {
  const id = process.env[`AIRTABLE_TABLE_${table.toUpperCase()}`];
  if (!id) throw new Error(`환경변수 AIRTABLE_TABLE_${table.toUpperCase()}가 필요합니다.`);
  return id;
}

app.post("/api/airtable", async (req, res) => {
  try {
    const PAT = process.env.AIRTABLE_PAT;
    const BASE_ID = process.env.AIRTABLE_BASE_ID;

    if (!PAT || !BASE_ID) {
      return res.status(500).json({ error: { message: "AIRTABLE_PAT, AIRTABLE_BASE_ID 환경변수를 설정하세요." } });
    }

    const { table, fields } = req.body;

    if (!table || !fields) {
      return res.status(400).json({ error: { message: "table과 fields가 필요합니다." } });
    }

    const allowed = ["employee", "manager", "wcwi"];
    if (!allowed.includes(table)) {
      return res.status(400).json({ error: { message: `유효하지 않은 테이블: ${table}` } });
    }

    const tableId = getTableId(table);

    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records: [{ fields }] }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: error.error || { message: "Airtable 저장 실패" } });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Airtable API 오류:", error);
    res.status(500).json({ error: { message: "서버 오류가 발생했습니다." } });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
