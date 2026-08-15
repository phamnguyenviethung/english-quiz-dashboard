/**
 * Bucket đã chuẩn hoá để render. Pool trả `engLevel` + `quizType`, reading trả
 * `cefrLevel` — hai page tự map về đây nên component danh sách không cần biết
 * mình đang hiển thị loại nội dung nào.
 */
export interface RefillBucketView {
  bucketKey: string
  topicId: number | null
  topicName: string | null
  level: string
  currentCount: number
  plannedCount: number
  /** Chiều phụ chỉ pool mới có (loại quiz). Reading để trống. */
  variantLabel?: string
}

export interface RefillBucketSummaryView {
  matchedBuckets: number
  plannedBuckets: number
  maxPerBucket: number
}

export interface RefillSummaryData {
  selectedBuckets: number
  plannedItems: number
  modelCount: number
  isModelPoolWideOpen: boolean
}

/** Nhãn theo loại nội dung — bơm vào để component dùng chung không hardcode "câu". */
export interface RefillCopy {
  /** Đơn vị đếm trong câu: "câu" | "bài". */
  unit: string
  /** Nhãn ô số liệu lớn ở rail tóm tắt. */
  plannedStatLabel: string
  confirmTitle: string
  /** Nhãn dùng cho cả nút chạy lẫn nút xác nhận trong dialog. */
  confirmAction: string
  /** Mô tả tập model khi admin không tick model nào. */
  wideOpenModelLabel: string
  /** Số item vượt ngưỡng này thì bật cảnh báo chi phí. */
  costWarningThreshold: number
}
