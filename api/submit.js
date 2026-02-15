/**
 * /api/submit: Airtable 제출 API 별칭
 * - POST /api/submit === POST /api/airtable
 * - dryRun: GET/POST /api/submit?dryRun=1 지원
 */
import handler from "./airtable.js";
export default handler;
