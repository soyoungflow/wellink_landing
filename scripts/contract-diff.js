/* global process */
/**
 * form_contract vs airtable_contract 비교 → contract_diff.json
 *
 * A) 폼에만 있음 (Airtable choices에 없음) - 수정/매핑 필요
 * B) Airtable에만 있음 (폼에 없음) - 정리 후보
 * C) 유사 문자열 (띄어쓰기/기호 차이) - 자동 수정 가능
 * D) 의미 충돌 위험 - 자동 매핑 금지, 수동 결정 필요
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const airtable = JSON.parse(fs.readFileSync(path.join(root, "contracts/airtable_contract.json"), "utf8"));
const form = JSON.parse(fs.readFileSync(path.join(root, "contracts/form_contract.json"), "utf8"));

function normalizeForCompare(s) {
  return String(s).replace(/\s+/g, " ").replace(/[：:]/g, ": ").trim().toLowerCase();
}

function similarity(a, b) {
  const na = normalizeForCompare(a);
  const nb = normalizeForCompare(b);
  if (na === nb) return 1;
  const sa = na.replace(/\s/g, "");
  const sb = nb.replace(/\s/g, "");
  if (sa === sb) return 0.95;
  const longer = na.length > nb.length ? na : nb;
  const shorter = na.length > nb.length ? nb : na;
  if (longer.includes(shorter) || shorter.includes(longer)) return 0.8;
  return 0;
}

/** A~F 카테고리 (요구사항 준수) */
const diff = {
  generatedAt: new Date().toISOString(),
  A_formOnlyNotInAirtable: [],      // A) 폼에만 있음
  B_airtableOnlyNotInForm: [],      // B) Airtable에만 있음
  C_typeMismatch: [],               // C) 필드 타입 불일치
  D_optionMismatch: [],             // D) 옵션 불일치
  E_autoFixable: [],                // E) 자동 수정 가능 (띄어쓰기/오타)
  F_manualOnly: [],                 // F) 자동 수정 금지 (의미 충돌)
  C_similarAutoFixable: [],         // → E에 병합
  D_semanticConflictManualRequired: [], // → F에 병합
  wcwiDiagnosis: null,
};

const LIKERT_SEMANTIC_FIELDS = ["willingness_to_use_service"];
const SEMANTIC_WARNING_FIELDS = ["willingness_to_use_service"];

function getFormValues(tableKey, fieldName) {
  const mapping = form.fieldMapping[tableKey] || {};
  const reverseMap = Object.fromEntries(Object.entries(mapping).map(([k, v]) => [v, k]));
  const formKey = reverseMap[fieldName] || fieldName;

  const rows = form.tables[tableKey] || [];
  let best = { values: [], formKey: fieldName };
  for (const row of rows) {
    const matches = (row.airtableField && (row.airtableField === fieldName || row.airtableField.split(", ").includes(fieldName))) ||
      row.formKey === formKey;
    if (matches) {
      const vals = row.values || [];
      if (vals.length > best.values.length) best = { values: vals, formKey: row.formKey };
    }
  }
  if (best.values.length > 0) return best;
  const schema = form.airtableNormalizeSchema?.[tableKey];
  const schemaVals = schema?.singleSelect?.[fieldName] || schema?.multipleSelects?.[fieldName];
  if (Array.isArray(schemaVals) && schemaVals.length > 0) {
    return { values: schemaVals, formKey: fieldName, sourcePath: "airtableNormalizeSchema" };
  }
  const synonyms = form.synonymMaps?.[fieldName];
  if (synonyms) {
    return { values: Object.keys(synonyms), formKey: fieldName, fromSynonym: true };
  }
  return best;
}

for (const [tableKey, table] of Object.entries(airtable.tables)) {
  if (tableKey === "wcwi" && table.note) {
    diff.wcwiDiagnosis = {
      cause: "스키마 불일치",
      detail: table.note,
      formFields: (form.tables.wcwi || []).map((r) => r.formKey),
      airtableFields: table.fields.map((f) => f.fieldName),
      recommendedAction: "wcwi(Assessments) 테이블은 WHO1_PositiveMood 등 다른 스키마. Full 진단 결과는 mini 테이블로 저장하거나, 별도 매핑 설계 필요",
    };
  }

  for (const field of table.fields || []) {
    if (!field.choices || field.choices.length === 0) continue;
    const choices = new Set(field.choices);

    const { values: formValues, formKey } = getFormValues(tableKey, field.fieldName);

    for (const fv of formValues) {
      if (choices.has(fv)) continue;
      const fvStr = String(fv).trim();
      const numericMatch = /^[1-7]$/.test(fvStr) && field.choices.some((c) => new RegExp(`^${fvStr}\\s*[:：]`).test(c) || c.startsWith(fvStr + " "));
      if (numericMatch) {
        const mapped = field.choices.find((c) => c.startsWith(fvStr + " ") || c.startsWith(fvStr + ":"));
        if (mapped) {
          diff.E_autoFixable.push({ table: tableKey, fieldName: field.fieldName, formValue: fv, airtableValue: mapped, formKey, note: "숫자→choice 자동 매핑" });
          continue;
        }
      }
      const similar = field.choices.find((c) => similarity(fv, c) >= 0.8);
      if (similar && similarity(fv, similar) >= 0.95) {
        const item = { table: tableKey, fieldName: field.fieldName, formValue: fv, airtableValue: similar, formKey };
        diff.E_autoFixable.push(item);
        diff.C_similarAutoFixable.push(item);
      } else if (SEMANTIC_WARNING_FIELDS.includes(field.fieldName) || field.semanticWarning) {
        const item = {
          table: tableKey,
          fieldName: field.fieldName,
          formValue: fv,
          airtableChoices: field.choices,
          formKey,
          reason: field.semanticWarning || "역스케일/의미 차이. 자동 매핑 금지",
        };
        diff.F_manualOnly.push(item);
        diff.D_semanticConflictManualRequired.push(item);
      } else {
        diff.A_formOnlyNotInAirtable.push({
          table: tableKey,
          fieldName: field.fieldName,
          formValue: fv,
          airtableChoices: field.choices,
          formKey,
        });
      }
    }

    for (const c of field.choices) {
      const inForm = formValues.includes(c) || Object.values(form.synonymMaps?.[field.fieldName] || {}).includes(c);
      if (!inForm) {
        diff.B_airtableOnlyNotInForm.push({
          table: tableKey,
          fieldName: field.fieldName,
          airtableValue: c,
          formKey,
        });
      }
    }
  }
}

const outPath = path.join(root, "contracts/contract_diff.json");
fs.writeFileSync(outPath, JSON.stringify(diff, null, 2), "utf8");
process.stdout.write("저장됨: " + outPath + "\n\n=== Contract Diff 요약 ===\n\n");
console.log("A) 폼에만 있고 Airtable에 없음 (수정 필요):", diff.A_formOnlyNotInAirtable.length);
diff.A_formOnlyNotInAirtable.forEach((x) => console.log("  -", x.table, x.fieldName, "|", x.formValue, "→", x.airtableChoices?.slice(0, 3).join(",")));

console.log("\nB) Airtable에만 있고 폼에 없음 (정리 후보):", diff.B_airtableOnlyNotInForm.length);

console.log("\nC) 유사 문자열 (자동 수정 가능):", diff.C_similarAutoFixable.length);
diff.C_similarAutoFixable.forEach((x) => console.log("  -", x.table, x.fieldName, "|", x.formValue, "→", x.airtableValue));

console.log("\nD) 의미 충돌 (수동 결정 필요):", diff.D_semanticConflictManualRequired.length);
diff.D_semanticConflictManualRequired.forEach((x) => console.log("  -", x.table, x.fieldName, "|", x.reason));

if (diff.wcwiDiagnosis) {
  console.log("\nWCWI 원인:", diff.wcwiDiagnosis.cause);
  console.log("  ", diff.wcwiDiagnosis.recommendedAction);
}
