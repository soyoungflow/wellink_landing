/* global process */
/**
 * Airtable 스키마 덤프 (MCP 또는 API로 조회한 결과와 동일한 형식으로 저장)
 *
 * 환경변수만 사용 (키 하드코딩 금지):
 *   AIRTABLE_PAT 또는 AIRTABLE_API_KEY
 *   AIRTABLE_BASE_ID
 *
 * 사용법:
 *   cp .env.example .env.local && 편집 후
 *   node scripts/dump-airtable-schema.js
 *
 * 또는:
 *   AIRTABLE_PAT=pat... AIRTABLE_BASE_ID=app... node scripts/dump-airtable-schema.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// .env.local에서 환경변수 로드 (선택)
try {
  const envPath = path.join(root, ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    content.split("\n").forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) {
        const key = m[1].trim();
        let val = m[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
          val = val.slice(1, -1);
        process.env[key] = val;
      }
    });
  }
} catch {
  // optional .env.local parse/load failure
}

const PAT = process.env.AIRTABLE_PAT || process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!PAT || !BASE_ID) {
  console.error("AIRTABLE_PAT(또는 AIRTABLE_API_KEY)와 AIRTABLE_BASE_ID 환경변수가 필요합니다.");
  process.exit(1);
}

const TABLE_NAMES = {
  employee: "Employee_Wellness_Market_Survey",
  manager: "Wellness Survey Company Responses",
  mini: "mini_responses",
  wcwi: "Assessments",
};

function fieldToSpec(f) {
  const spec = {
    fieldName: f.name,
    fieldId: f.id,
    fieldType: f.type,
    required: false,
  };
  if (f.type === "formula" || f.type === "createdTime" || f.type === "autoNumber" || f.type === "aiText")
    spec.readOnly = true;
  if (f.options?.choices) spec.options = f.options.choices.map((c) => c.name);
  if (f.options?.linkedTableId) spec.linkedTableId = f.options.linkedTableId;
  return spec;
}

async function main() {
  const url = `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${PAT}` } });
  if (!res.ok) {
    console.error("Airtable API 오류:", res.status, await res.text());
    process.exit(1);
  }
  const { tables } = await res.json();

  const byName = {};
  tables.forEach((t) => (byName[t.name] = t));

  const out = {
    baseId: BASE_ID,
    baseName: "WELLINK",
    tables: {},
  };

  for (const [key, name] of Object.entries(TABLE_NAMES)) {
    const t = byName[name];
    if (!t) {
      console.warn(`테이블을 찾을 수 없음: ${name}`);
      continue;
    }
    out.tables[key] = {
      tableId: t.id,
      tableName: t.name,
      fields: t.fields.map(fieldToSpec),
    };
  }

  const outPath = path.join(root, "docs", "airtable_schema.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
  console.log("저장됨:", outPath);

  const contractOut = { baseId: BASE_ID, baseName: "WELLINK", tables: {} };
  for (const [key, tbl] of Object.entries(out.tables)) {
    const fields = (tbl.fields || []).map((f) => ({
      fieldId: f.fieldId,
      fieldName: f.fieldName,
      type: f.fieldType,
      choices: f.options || null,
      readOnly: f.readOnly || undefined,
    }));
    const byId = {};
    fields.forEach((f) => {
      if (f.fieldId) byId[f.fieldId] = f.fieldName;
    });
    contractOut.tables[key] = { ...tbl, fields, byId };
  }
  const contractPath = path.join(root, "contracts", "airtable_contract.json");
  fs.mkdirSync(path.dirname(contractPath), { recursive: true });
  fs.writeFileSync(contractPath, JSON.stringify(contractOut, null, 2), "utf8");
  console.log("저장됨:", contractPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
