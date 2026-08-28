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
export const CHECKLIST_LABELS: Record<string, string> = {
  questionTextChanged: "Đổi nội dung câu hỏi",
  answerChanged: "Đổi đáp án đúng",
  optionsChanged: "Đổi các phương án",
  explanationChanged: "Đổi phần giải thích",
  exampleChanged: "Đổi câu ví dụ",
  hasFactualError: "Có lỗi kiến thức/logic",
  hasGrammarError: "Có lỗi ngữ pháp",
  topicMismatch: "Lệch chủ đề",
  levelMismatch: "Lệch cấp độ CEFR",
  formatValid: "Bản sửa đúng schema",
}

// Cờ mà giá trị true = tốt (ngược với các cờ còn lại true = có vấn đề/thay đổi).
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
