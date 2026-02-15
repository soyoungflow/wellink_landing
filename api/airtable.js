/**
 * Vercel Serverless Function: Airtable API 프록시
 *
 * 환경변수 (Vercel 대시보드에서 설정):
 * - AIRTABLE_PAT: Airtable Personal Access Token (필수)
 * - AIRTABLE_BASE_ID: Airtable Base ID (필수)
 * - AIRTABLE_TABLE_EMPLOYEE: Employee 테이블 ID (필수)
 * - AIRTABLE_TABLE_MANAGER: Manager 테이블 ID (필수)
 * - AIRTABLE_TABLE_WCWI: WCWI 테이블 ID (필수)
 * - AIRTABLE_TABLE_MINI: Mini 결과 테이블 ID (필수)
 * - AIRTABLE_SELECT_INVALID_HANDLING: ERROR | SYNONYM_MAP | OTHER_FALLBACK (선택)
 *
 * dryRun: POST /api/airtable?dryRun=1 → Airtable에 쓰지 않고 변환/검증 결과만 반환
 */

import { getTableSchema } from "./lib/airtableSchema.js";
import {
  normalizePayloadWithSchema,
  mapFormKeysToAirtable,
  DEFAULT_SYNONYM_MAP,
  TABLE_SYNONYM_OVERRIDE,
} from "./lib/airtableNormalize.js";

const ALLOWED_TABLES = ["employee", "manager", "wcwi", "mini"];
const MAX_BODY_SIZE = 10 * 1024;

function getTableId(table) {
  const id = process.env[`AIRTABLE_TABLE_${table.toUpperCase()}`];
  if (!id) throw new Error(`환경변수 AIRTABLE_TABLE_${table.toUpperCase()}가 필요합니다.`);
  return id;
}

function validateTable(table) {
  if (!table || typeof table !== "string") {
    return { valid: false, error: "테이블 이름이 필요합니다." };
  }
  const normalizedTable = table.toLowerCase().trim();
  if (!ALLOWED_TABLES.includes(normalizedTable)) {
    return {
      valid: false,
      error: `허용되지 않은 테이블입니다. 허용된 테이블: ${ALLOWED_TABLES.join(", ")}`,
    };
  }
  return { valid: true, table: normalizedTable };
}

function validateBodySize(bodyString) {
  const size = Buffer.byteLength(bodyString, "utf8");
  if (size > MAX_BODY_SIZE) {
    return {
      valid: false,
      error: `요청 본문이 너무 큽니다. (최대 ${MAX_BODY_SIZE} bytes, 현재: ${size} bytes)`,
    };
  }
  return { valid: true };
}

function generateErrorId() {
  return `err_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getNormalizeConfig(tableKey) {
  const mode = (process.env.AIRTABLE_SELECT_INVALID_HANDLING || "ERROR").toUpperCase();
  const selectInvalidHandling =
    ["ERROR", "SYNONYM_MAP", "OTHER_FALLBACK"].includes(mode) ? mode : "ERROR";
  const baseMap = selectInvalidHandling === "SYNONYM_MAP" ? DEFAULT_SYNONYM_MAP : {};
  const override = (tableKey && TABLE_SYNONYM_OVERRIDE[tableKey]) || {};
  const synonymMap = {};
  for (const [k, v] of Object.entries(baseMap)) synonymMap[k] = { ...v };
  for (const [k, v] of Object.entries(override)) synonymMap[k] = { ...(synonymMap[k] || {}), ...v };
  return {
    selectInvalidHandling,
    synonymMap,
    otherOptionNames: ["기타", "Other", "기타/Other"],
  };
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
    console.error("환경변수 누락:", { hasPAT: !!PAT, hasBASE_ID: !!BASE_ID });
    return res.status(500).json({
      error: {
        message:
          "서버 설정 오류: AIRTABLE_PAT 또는 AIRTABLE_BASE_ID가 설정되지 않았습니다. Vercel 환경변수를 확인하세요.",
      },
    });
  }

  let dryRun = req.query?.dryRun === "1" || req.query?.dryRun === "true";
  if (!dryRun && req.url) {
    try {
      const url = new URL(req.url, "http://localhost");
      dryRun = url.searchParams.get("dryRun") === "1" || url.searchParams.get("dryRun") === "true";
    } catch (_) {}
  }

  try {
    const bodyString = JSON.stringify(req.body || {});
    const bodySizeCheck = validateBodySize(bodyString);
    if (!bodySizeCheck.valid) {
      return res.status(400).json({ error: { message: bodySizeCheck.error } });
    }

    const { table, fields: rawFields, formKeys } = req.body || {};

    const tableValidation = validateTable(table);
    if (!tableValidation.valid) {
      return res.status(400).json({ error: { message: tableValidation.error } });
    }
    const normalizedTable = tableValidation.table;

    let payload = rawFields;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return res.status(400).json({
        error: { message: "fields는 객체여야 합니다." },
      });
    }
    if (formKeys === true) {
      payload = mapFormKeysToAirtable(normalizedTable, payload);
    }
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        error: { message: "fields가 비어있습니다. 최소 하나의 필드가 필요합니다." },
      });
    }

    // 스키마 조회 + 정규화
    let schema;
    try {
      schema = await getTableSchema(normalizedTable);
    } catch (e) {
      const errorId = generateErrorId();
      console.error(
        JSON.stringify({
          type: "AIRTABLE_SCHEMA_ERROR",
          errorId,
          table: normalizedTable,
          message: e.message,
        })
      );
      return res.status(500).json({
        error: { message: "스키마 조회에 실패했습니다." },
        errorId,
      });
    }

    const config = getNormalizeConfig(normalizedTable);
    const { fields, fieldsById = {}, errors: validationErrors } = normalizePayloadWithSchema(schema, payload, config);

    if (validationErrors.length > 0) {
      const errorId = generateErrorId();
      console.error(
        JSON.stringify({
          type: "AIRTABLE_VALIDATION_ERROR",
          errorId,
          table: normalizedTable,
          validationErrors,
        })
      );
      if (dryRun) {
        return res.status(200).json({
          dryRun: true,
          valid: false,
          targetTable: schema ? { table: normalizedTable, tableId: schema.tableId, tableName: schema.tableName } : { table: normalizedTable },
          fields,
          normalizedFields: fieldsById || {},
          validationErrors: validationErrors.map((e) => ({
            fieldId: e.fieldId,
            fieldName: e.fieldName,
            reason: e.reason,
            expectedType: e.expectedType,
            receivedValue: e.receivedValue,
          })),
          contractDiffSummary: null,
          autoFixApplied: undefined,
          manualFixRequired: undefined,
          errorId,
        });
      }
      return res.status(400).json({
        error: { message: "제출 실패" },
        errorId,
      });
    }

    if (Object.keys(fields).length === 0) {
      const errorId = generateErrorId();
      const payloadKeys = Object.keys(payload);
      const schemaFieldNames = schema.fields?.map((f) => f.fieldName) || [];
      console.error(
        JSON.stringify({
          type: "AIRTABLE_ZERO_FIELDS",
          errorId,
          table: normalizedTable,
          payloadKeys,
          schemaFieldNames,
          diagnosis: payloadKeys.length === 0
            ? "payload 비어있음"
            : payloadKeys.every((k) => !schemaFieldNames.includes(k))
              ? "폼 키가 Airtable 필드명과 전혀 일치하지 않음. FORM_TO_AIRTABLE_MAP 또는 fieldName 확인 필요."
              : "일부 필드만 스키마에 있으나 모두 검증 실패 또는 빈값",
        })
      );
      return res.status(400).json({
        error: { message: "유효한 필드가 없습니다. 입력값을 확인해주세요." },
        errorId,
      });
    }

    if (dryRun) {
      let diffSummary = null;
      let suggestedFixes = { autoFixable: [], manualRequired: [] };
      try {
        const { readFileSync } = await import("fs");
        const { join } = await import("path");
        const contractPath = join(process.cwd(), "contracts", "contract_diff.json");
        const diff = JSON.parse(readFileSync(contractPath, "utf8"));
        diffSummary = {
          A_formOnlyCount: diff.A_formOnlyNotInAirtable?.length ?? 0,
          B_airtableOnlyCount: diff.B_airtableOnlyNotInForm?.length ?? 0,
          C_typeMismatchCount: diff.C_typeMismatch?.length ?? 0,
          D_optionMismatchCount: diff.D_optionMismatch?.length ?? 0,
          E_autoFixableCount: (diff.E_autoFixable || diff.C_similarAutoFixable || []).length ?? 0,
          F_manualOnlyCount: (diff.F_manualOnly || diff.D_semanticConflictManualRequired || []).length ?? 0,
          wcwiDiagnosis: diff.wcwiDiagnosis || null,
        };
        const manualList = diff.F_manualOnly || diff.D_semanticConflictManualRequired || [];
        const autoList = diff.E_autoFixable || diff.C_similarAutoFixable || [];
        const tableD = manualList.filter((x) => x.table === normalizedTable);
        const tableC = autoList.filter((x) => x.table === normalizedTable);
        suggestedFixes.autoFixable = tableC;
        suggestedFixes.manualRequired = tableD;
      } catch (_) {}

      return res.status(200).json({
        dryRun: true,
        valid: true,
        targetTable: {
          table: normalizedTable,
          tableId: schema.tableId,
          tableName: schema.tableName,
        },
        fields,
        normalizedFields: fieldsById || {},
        validationErrors: [],
        contractDiffSummary: diffSummary,
        autoFixApplied: (suggestedFixes?.autoFixable || []).length
          ? suggestedFixes.autoFixable
          : undefined,
        manualFixRequired: (suggestedFixes?.manualRequired || []).length
          ? suggestedFixes.manualRequired
          : undefined,
        diffSummary,
        suggestedFixes,
      });
    }

    const tableId = getTableId(normalizedTable);
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
        error: { message: "Airtable API 오류 (응답 파싱 실패)" },
      }));
      const errorId = generateErrorId();

      console.error(
        JSON.stringify({
          type: "AIRTABLE_API_ERROR",
          errorId,
          table: normalizedTable,
          status: response.status,
          airtableError: errorData.error,
          attemptedFields: Object.keys(fields),
        })
      );

      let errorMessage = "제출 실패";
      if (response.status === 401) {
        errorMessage =
          "인증 오류: AIRTABLE_PAT가 유효하지 않습니다. Vercel 환경변수를 확인하세요.";
      } else if (response.status === 403) {
        errorMessage =
          "권한 오류: Base ID 또는 Table ID가 잘못되었거나 접근 권한이 없습니다.";
      } else if (response.status === 404) {
        errorMessage = "테이블을 찾을 수 없습니다. Table ID를 확인하세요.";
      } else if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }

      return res.status(response.status >= 500 ? 500 : response.status).json({
        error: { message: errorMessage },
        errorId,
      });
    }

    const data = await response.json();
    console.log(`Airtable 저장 성공 (${normalizedTable}):`, {
      recordId: data.records?.[0]?.id,
      fieldsCount: Object.keys(fields).length,
    });
    return res.status(200).json(data);
  } catch (error) {
    const errorId = generateErrorId();
    console.error(
      JSON.stringify({
        type: "AIRTABLE_SERVER_ERROR",
        errorId,
        message: error.message,
        stack: error.stack,
      })
    );
    return res.status(500).json({
      error: { message: "제출 실패" },
      errorId,
    });
  }
}
