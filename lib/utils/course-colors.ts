import type { CourseInfo } from "@/types/payments"

/**
 * 8 visually distinct color triplets for course pills/badges.
 * Each has: bg (light background), tc (text color), dot (indicator dot).
 */
const PALETTE: { bg: string; tc: string; dot: string }[] = [
  { bg: "#EFF6FF", tc: "#1e40af", dot: "#3b82f6" }, // blue
  { bg: "#E1F5EE", tc: "#085041", dot: "#1D9E75" }, // green
  { bg: "#FEF3E2", tc: "#7A4100", dot: "#D97706" }, // amber
  { bg: "#F5F3FF", tc: "#4c1d95", dot: "#7c3aed" }, // purple
  { bg: "#FFF0F0", tc: "#7F1D1D", dot: "#DC2626" }, // red
  { bg: "#ECFDF5", tc: "#065f46", dot: "#10b981" }, // emerald
  { bg: "#FFF7ED", tc: "#9a3412", dot: "#f97316" }, // orange
  { bg: "#F0F9FF", tc: "#0c4a6e", dot: "#0ea5e9" }, // sky
]

/** Fallback gray for courses that don't match any program */
export const FALLBACK_COURSE_COLOR = { bg: "#F3F4F6", tc: "#4b5563", dot: "#9ca3af" }

/**
 * Get a deterministic color set for a course by index.
 */
export function getCourseColor(index: number) {
  return PALETTE[index % PALETTE.length]
}

/**
 * Build a CourseInfo from a program DB row + index for color assignment.
 */
export function buildCourseInfo(
  program: { id: number; program_name: string | null; program_price: number | null },
  index: number,
): CourseInfo {
  const colors = getCourseColor(index)
  return {
    id: program.id,
    name: program.program_name || `Khoá #${program.id}`,
    price: program.program_price || 0,
    ...colors,
  }
}
