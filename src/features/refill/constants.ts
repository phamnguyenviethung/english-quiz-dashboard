/** Bộ lọc để trống nghĩa là không lọc chiều đó, nên hint này lặp ở mọi khối filter. */
export const BUCKET_FILTER_ALL_HINT = "Bỏ trống = tất cả"

/** Preview chạy lại mỗi lần đổi filter — debounce để không bắn request theo từng click. */
export const BUCKET_PREVIEW_DEBOUNCE_MS = 350

/** Bucket không gắn topic là bucket riêng ở API, không phải "tất cả". */
export const NO_TOPIC_LABEL = "Không có chủ đề"

/** Vùng chạm tối thiểu 44px theo Apple HIG, áp cho mọi dòng tick được. */
export const TOUCH_ROW = "min-h-11"

/** Toggle phải đủ lớn để chạm trên điện thoại, desktop thì về cỡ thường. */
export const TOUCH_TOGGLE = "min-h-11 lg:min-h-9"
