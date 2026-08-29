export const REVIEWS_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [20, 50, 100]

export const DEFAULT_POOL_REVIEW_SORT = "id_desc" as const
export const POOL_REVIEW_SORTS = [
  "id_desc",
  "id_asc",
  "created_desc",
  "created_asc",
] as const

export const REVIEW_STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "Chờ duyệt",
    className:
      "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  },
  approved: {
    label: "Đã duyệt",
    className:
      "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  },
  rejected: {
    label: "Đã từ chối",
    className: "text-muted-foreground",
  },
  failed: {
    label: "Lỗi",
    className:
      "bg-rose-500/12 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
  },
}

export const REVIEW_VERDICT_META: Record<
  string,
  { label: string; className: string }
> = {
  pass: {
    label: "Đạt",
    className:
      "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  },
  revised: {
    label: "Đã sửa",
    className:
      "bg-sky-500/12 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  },
  reject: {
    label: "Nên bỏ",
    className:
      "bg-rose-500/12 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
  },
}

// Nhãn tiếng Việt cho 10 cờ trong checklist (khớp PoolReviewChecklist ở backend).
// Cờ do AI trả: true = vấn đề CÓ trong bản gốc. `formatValid` (server set): true = tốt.
export const CHECKLIST_LABELS: Record<string, string> = {
  notSolvable: "Người học không giải được",
  insufficientContext: "Thiếu dữ kiện / phải đoán",
  multipleDefensibleAnswers: "Có nhiều đáp án hợp lý",
  answerIncorrect: "Đáp án đúng bị sai",
  explanationMismatch: "Giải thích không khớp đáp án",
  distractorExplanationMismatch: "Giải thích phương án sai bị lệch",
  translationMismatch: "Bản dịch VI↔EN lệch",
  spellingOrGrammarError: "Có lỗi chính tả / ngữ pháp",
  offTopic: "Lệch chủ đề",
  levelMismatch: "Lệch cấp độ CEFR",
  formatValid: "Bản sửa đúng schema",
}

// Cờ mà giá trị true = tốt (ngược với các cờ còn lại true = có vấn đề).
export const CHECKLIST_POSITIVE_WHEN_TRUE = new Set(["formatValid"])

export const REVIEW_SEVERITY_META: Record<
  string,
  { label: string; className: string }
> = {
  low: { label: "Thấp", className: "text-muted-foreground" },
  medium: {
    label: "Vừa",
    className:
      "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  },
  high: {
    label: "Cao",
    className:
      "bg-rose-500/12 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
  },
}

interface BadgeMeta {
  label: string
  className: string
}

function resolveMeta(map: Record<string, BadgeMeta>, key: string): BadgeMeta {
  return Object.hasOwn(map, key) ? map[key] : { label: key, className: "" }
}

export const getReviewStatusMeta = (status: string): BadgeMeta =>
  resolveMeta(REVIEW_STATUS_META, status)

export const getReviewVerdictMeta = (verdict: string): BadgeMeta =>
  resolveMeta(REVIEW_VERDICT_META, verdict)

export const getReviewSeverityMeta = (severity: string): BadgeMeta =>
  resolveMeta(REVIEW_SEVERITY_META, severity)
