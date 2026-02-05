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

// 허용된 테이블 화이트리스트
const ALLOWED_TABLES = ["employee", "manager", "wcwi"];

// 최대 요청 본문 크기 (10KB)
const MAX_BODY_SIZE = 10 * 1024;

function getTableId(table) {
  const id = process.env[`AIRTABLE_TABLE_${table.toUpperCase()}`];
  if (!id) throw new Error(`환경변수 AIRTABLE_TABLE_${table.toUpperCase()}가 필요합니다.`);
  return id;
}

/**
 * 테이블 이름 검증
 */
function validateTable(table) {
  if (!table || typeof table !== "string") {
    return { valid: false, error: "테이블 이름이 필요합니다." };
  }
  
  const normalizedTable = table.toLowerCase().trim();
  if (!ALLOWED_TABLES.includes(normalizedTable)) {
    return { 
      valid: false, 
      error: `허용되지 않은 테이블입니다. 허용된 테이블: ${ALLOWED_TABLES.join(", ")}` 
    };
  }
  
  return { valid: true, table: normalizedTable };
}

/**
 * fields 객체 검증
 */
function validateFields(fields) {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    return { valid: false, error: "fields는 객체여야 합니다." };
  }
  
  if (Object.keys(fields).length === 0) {
    return { valid: false, error: "fields가 비어있습니다. 최소 하나의 필드가 필요합니다." };
  }
  
  // 필드 값 검증 (null, undefined, 함수는 허용하지 않음)
  for (const [key, value] of Object.entries(fields)) {
    if (typeof key !== "string" || key.trim().length === 0) {
      return { valid: false, error: "필드 이름은 비어있을 수 없습니다." };
    }
    
    if (value === null || value === undefined) {
      return { valid: false, error: `필드 "${key}"의 값이 null 또는 undefined입니다.` };
    }
    
    if (typeof value === "function") {
      return { valid: false, error: `필드 "${key}"의 값으로 함수는 허용되지 않습니다.` };
    }
    
    // 문자열 길이 제한 (Airtable 필드 제한 고려)
    if (typeof value === "string" && value.length > 100000) {
      return { valid: false, error: `필드 "${key}"의 값이 너무 깁니다. (최대 100,000자)` };
    }
  }
  
  return { valid: true };
}

/**
 * 요청 본문 크기 검증
 */
function validateBodySize(bodyString) {
  const size = Buffer.byteLength(bodyString, "utf8");
  if (size > MAX_BODY_SIZE) {
    return { 
      valid: false, 
      error: `요청 본문이 너무 큽니다. (최대 ${MAX_BODY_SIZE} bytes, 현재: ${size} bytes)` 
    };
  }
  return { valid: true };
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
    // 요청 본문 검증
    const bodyString = JSON.stringify(req.body);
    const bodySizeCheck = validateBodySize(bodyString);
    if (!bodySizeCheck.valid) {
      return res.status(400).json({ error: { message: bodySizeCheck.error } });
    }

    const { table, fields } = req.body;

    // 테이블 이름 검증
    const tableValidation = validateTable(table);
    if (!tableValidation.valid) {
      return res.status(400).json({ error: { message: tableValidation.error } });
    }
    const normalizedTable = tableValidation.table;

    // fields 검증
    const fieldsValidation = validateFields(fields);
    if (!fieldsValidation.valid) {
      return res.status(400).json({ error: { message: fieldsValidation.error } });
    }

    // 테이블 ID 가져오기
    let tableId;
    try {
      tableId = getTableId(normalizedTable);
    } catch (e) {
      console.error(`테이블 ID 조회 실패 (${normalizedTable}):`, e.message);
      return res.status(500).json({ error: { message: e.message } });
    }

    // Airtable API 호출
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records: [{ fields }] }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: { message: "Airtable API 오류 (응답 파싱 실패)" } 
      }));
      console.error(`Airtable API 오류 (${normalizedTable}):`, {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return res.status(response.status).json({
        error: errorData.error || { message: "Airtable 저장 실패" },
      });
    }

    const data = await response.json();
    console.log(`Airtable 저장 성공 (${normalizedTable}):`, {
      recordId: data.records?.[0]?.id,
      fieldsCount: Object.keys(fields).length,
    });
    return res.status(200).json(data);
  } catch (error) {
    console.error("서버 오류:", error);
    return res.status(500).json({ error: { message: "서버 오류가 발생했습니다." } });
  }
}
