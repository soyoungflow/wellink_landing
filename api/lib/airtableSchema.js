/* global process */
/**
 * Airtable Metadata API로 Base 스키마 수집
 * - 10분 메모리 캐시 (매 요청마다 호출 방지)
 *
 * 환경변수: AIRTABLE_PAT, AIRTABLE_BASE_ID
 * 테이블 ID: AIRTABLE_TABLE_EMPLOYEE, AIRTABLE_TABLE_MANAGER, AIRTABLE_TABLE_WCWI, AIRTABLE_TABLE_MINI
 */

const CACHE_TTL_MS = 10 * 60 * 1000; // 10분

/** @type { Map<string, { schema: object, expiresAt: number }> } */
const cache = new Map();

/**
 * 테이블 키 → env 테이블 ID
 */
const TABLE_ENV_KEYS = ["employee", "manager", "wcwi", "mini"];

/**
 * Metadata API로 Base 전체 스키마 조회
 * @param {string} baseId
 * @param {string} pat
 * @returns {Promise<{ tables: Array<{ id: string, name: string, fields: Array<object> }> }>}
 */
async function fetchBaseSchema(baseId, pat) {
  const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${pat}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Metadata API 실패: ${res.status}`);
  }
  return res.json();
}

/**
 * Airtable 필드 스펙 → 정규화된 필드 스키마
 * @param {object} f - Airtable field
 */
function fieldToSpec(f) {
  const spec = {
    fieldName: f.name,
    fieldId: f.id,
    fieldType: f.type,
    readOnly: ["formula", "createdTime", "autoNumber", "aiText"].includes(f.type),
  };
  if (f.options?.choices) {
    spec.choices = f.options.choices.map((c) => c.name);
  }
  if (f.options?.linkedTableId) {
    spec.linkedTableId = f.options.linkedTableId;
  }
  return spec;
}

/**
 * 특정 테이블의 스키마 조회 (캐시 사용)
 * @param {string} tableKey - 'employee' | 'manager' | 'wcwi' | 'mini'
 * @returns {Promise<object>}
 */
export async function getTableSchema(tableKey) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const pat = process.env.AIRTABLE_PAT;

  if (!baseId || !pat) {
    throw new Error("AIRTABLE_BASE_ID, AIRTABLE_PAT 환경변수가 필요합니다.");
  }

  const cacheKey = `${baseId}:${tableKey}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.schema;
  }

  const tableId = process.env[`AIRTABLE_TABLE_${tableKey.toUpperCase()}`];
  if (!tableId) {
    throw new Error(`환경변수 AIRTABLE_TABLE_${tableKey.toUpperCase()}가 필요합니다.`);
  }

  const { tables } = await fetchBaseSchema(baseId, pat);
  const table = tables.find((t) => t.id === tableId);
  if (!table) {
    throw new Error(`테이블 ID ${tableId}를 Base에서 찾을 수 없습니다.`);
  }

  const fields = table.fields.map(fieldToSpec);
  const byName = Object.fromEntries(fields.map((f) => [f.fieldName, f]));
  const byId = Object.fromEntries(fields.map((f) => [f.fieldId, f]));

  const schema = {
    tableId,
    tableName: table.name,
    fields,
    byName,
    byId,
  };

  cache.set(cacheKey, { schema, expiresAt: Date.now() + CACHE_TTL_MS });
  return schema;
}

/**
 * 캐시 무효화 (테스트/디버깅용)
 */
export function clearSchemaCache() {
  cache.clear();
}
