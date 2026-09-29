const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function isDateString(value: string): boolean {
  if (!DATE_RE.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

/** Local calendar date, not UTC. `2026-10-05` stays October 5 in every timezone. */
export function parseLocalDate(value: string): Date | null {
  if (!isDateString(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(value: string, days: number): string {
  const date = parseLocalDate(value)
  if (!date) return value
  date.setDate(date.getDate() + days)
  return getLocalDateString(date)
}

/** Seven consecutive local dates starting at `startDate`, which is today for the planner. */
export function getSevenDayRange(startDate: string): string[] {
  return Array.from({ length: 7 }, (_, index) => addDays(startDate, index))
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export function isTimeString(value: string): boolean {
  return TIME_RE.test(value)
}

/** Accepts `HH:MM` and browser values like `HH:MM:SS`. */
export function normalizeTime(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const match = /^(\d{2}:\d{2})/.exec(value)
  if (!match || !isTimeString(match[1])) return undefined
  return match[1]
}

export function formatDueDate(value: string): string {
  const date = parseLocalDate(value)
  if (!date) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** Compact label for the day nav, such as "Tue, 29 Sept". */
export function formatShortWeekdayDate(value: string): string {
  const date = parseLocalDate(value)
  if (!date) return value
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatLongDate(value: string): string {
  const date = parseLocalDate(value)
  if (!date) return value
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export function formatWeekday(value: string): string {
  const date = parseLocalDate(value)
  if (!date) return value
  return date.toLocaleDateString(undefined, { weekday: 'long' })
}

export type DueStatus = 'none' | 'future' | 'tomorrow' | 'today' | 'overdue'

export function getDueStatus(
  dueDate: string | undefined,
  completed: boolean,
  today: string = getLocalDateString(),
): DueStatus {
  if (!dueDate || !isDateString(dueDate) || completed) return 'none'
  if (dueDate === today) return 'today'
  if (dueDate < today) return 'overdue'
  if (dueDate === addDays(today, 1)) return 'tomorrow'
  return 'future'
}

export function isToday(dueDate: string | undefined, today: string = getLocalDateString()): boolean {
  return Boolean(dueDate) && dueDate === today
}

export function isOverdue(
  dueDate: string | undefined,
  completed: boolean,
  today: string = getLocalDateString(),
): boolean {
  return getDueStatus(dueDate, completed, today) === 'overdue'
}
