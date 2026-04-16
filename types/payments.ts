export type PaymentStatus = "confirmed" | "pending" | "mismatch"

export type PaymentMethod = "Thanh toán thẻ" | "Thanh toán bằng quét mã QR (chuyển khoản)"

export interface CourseInfo {
  id: number
  name: string
  price: number
  bg: string   // background color hex
  tc: string   // text color hex
  dot: string  // dot indicator color hex
}

export interface Transaction {
  id: string
  time: string           // ISO string
  course: CourseInfo
  name: string           // student name
  phone: string
  paid: number           // amount actually paid
  expected: number       // expected course fee
  method: string         // payment method label
  status: PaymentStatus
  isNew: boolean
  confirmedBy: string | null
  confirmedAt: string | null // ISO string
  transactionId: string | null
}
