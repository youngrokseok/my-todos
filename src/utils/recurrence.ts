import { en } from '../i18n/en'
import type { Messages } from '../i18n/types'
import { formatDueDate, getLocalDateString, getDueStatus, isDateString, normalizeTime, parseLocalDate } from './date'
import type { Todo, TodoInput, TodoRecurrence, Weekday } from '../types/todo'

export const WEEKDAYS: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const WEEKDAY_FROM_INDEX: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

export type RepeatChoice = 'none' | 'daily' | 'weekend' | 'custom'

export function isWeekday(value: string): value is Weekday {
  return WEEKDAYS.includes(value as Weekday)
}

export function getWeekday(value: string): Weekday {
  const date = parseLocalDate(value) ?? new Date()
  return WEEKDAY_FROM_INDEX[date.getDay()]
}

export function sortWeekdays(days: Weekday[]): Weekday[] {
  const unique = new Set(days)
  return WEEKDAYS.filter((day) => unique.has(day))
}

export function isWeekend(days: Weekday[]): boolean {
  return days.length === 2 && days.includes('saturday') && days.includes('sunday')
}

export function emptyRecurrence(): TodoRecurrence {
  return { type: 'none' }
}

export function emptyTodoInput(startDate: string = getLocalDateString(), listId?: string): TodoInput {
  return {
    text: '',
    startDate,
    important: false,
    urgent: false,
    recurrence: emptyRecurrence(),
    listId,
  }
}

export function todoToInput(todo: Todo): TodoInput {
  return {
    text: todo.text,
    startDate: todo.startDate,
    startTime: todo.startTime,
    endTime: todo.endTime,
    important: todo.important,
    urgent: todo.urgent,
    dueDate: todo.dueDate,
    listId: todo.listId,
    recurrence:
      todo.recurrence.type === 'weekdays'
        ? { type: 'weekdays', days: sortWeekdays(todo.recurrence.days ?? []) }
        : { type: todo.recurrence.type },
  }
}

export function sanitizeRecurrence(value: unknown): TodoRecurrence {
  if (!value || typeof value !== 'object') return emptyRecurrence()
  const raw = value as { type?: unknown; days?: unknown }
  if (raw.type === 'daily') return { type: 'daily' }
  if (raw.type === 'weekdays' && Array.isArray(raw.days)) {
    const days = sortWeekdays(raw.days.filter((day): day is Weekday => typeof day === 'string' && isWeekday(day)))
    if (days.length === 0) return emptyRecurrence()
    if (days.length === WEEKDAYS.length) return { type: 'daily' }
    return { type: 'weekdays', days }
  }
  return emptyRecurrence()
}

export function isRecurring(todo: Pick<Todo, 'recurrence'>): boolean {
  return todo.recurrence.type !== 'none'
}

/**
 * True when this persisted todo should appear on `date`.
 * Recurrence never starts before `startDate`.
 * An unfinished one-off with a later due date stays on each day through that date.
 */
export function isTodoScheduledForDate(
  todo: Pick<Todo, 'startDate' | 'recurrence'> & Partial<Pick<Todo, 'dueDate' | 'completed'>>,
  date: string,
): boolean {
  if (!isDateString(date) || !isDateString(todo.startDate) || date < todo.startDate) return false
  if (todo.recurrence.type === 'none') {
    const due = todo.dueDate && isDateString(todo.dueDate) && todo.dueDate > todo.startDate ? todo.dueDate : undefined
    if (due && !todo.completed) return date <= due
    return date === todo.startDate
  }
  if (todo.recurrence.type === 'daily') return true
  if (todo.recurrence.type === 'weekdays') {
    return (todo.recurrence.days ?? []).includes(getWeekday(date))
  }
  return false
}

export function isTodoCompletedForDate(todo: Pick<Todo, 'completed' | 'recurrence' | 'completedDates'>, date: string): boolean {
  if (!isRecurring(todo)) return todo.completed
  return (todo.completedDates ?? []).includes(date)
}

export function toggleTodoCompletionForDate(todo: Todo, date: string): void {
  if (!isDateString(date)) return
  if (!isRecurring(todo)) {
    todo.completed = !todo.completed
    return
  }

  const dates = new Set(todo.completedDates ?? [])
  if (dates.has(date)) dates.delete(date)
  else dates.add(date)
  todo.completedDates = [...dates].sort()
}

export function repeatChoiceFromRecurrence(recurrence: TodoRecurrence): RepeatChoice {
  if (recurrence.type === 'daily') return 'daily'
  if (recurrence.type === 'none') return 'none'
  if (isWeekend(recurrence.days ?? [])) return 'weekend'
  return 'custom'
}

export function canSaveRecurrence(recurrence: TodoRecurrence): boolean {
  if (recurrence.type === 'weekdays') return (recurrence.days?.length ?? 0) > 0
  return true
}

export function formatRecurrence(recurrence: TodoRecurrence, copy: Messages = en): string | null {
  if (recurrence.type === 'none') return null
  if (recurrence.type === 'daily') return copy.daily
  const days = sortWeekdays(recurrence.days ?? [])
  if (days.length === 0) return null
  if (isWeekend(days)) return copy.weekend
  if (days.length === 1) return copy.weekly
  return days.map((day) => copy.weekdayShort[day]).join(' · ')
}

export function dueLabel(
  dueDate: string | undefined,
  completed: boolean,
  referenceDate: string = getLocalDateString(),
  copy: Messages = en,
): string | null {
  if (!dueDate) return null
  const formatted = formatDueDate(dueDate, copy.dateLocale)
  const status = getDueStatus(dueDate, completed, referenceDate)
  if (status === 'today') return copy.dueToday
  if (status === 'overdue') return copy.overdueOn(formatted)
  if (status === 'tomorrow') return copy.dueTomorrow
  return copy.dueOn(formatted)
}

export function readSchedule(input: Pick<TodoInput, 'startDate' | 'startTime' | 'endTime' | 'dueDate' | 'listId' | 'recurrence'>): {
  startDate: string
  startTime?: string
  endTime?: string
  dueDate?: string
  listId?: string
  recurrence: TodoRecurrence
} | null {
  if (!isDateString(input.startDate)) return null
  return {
    startDate: input.startDate,
    startTime: normalizeTime(input.startTime),
    endTime: normalizeTime(input.endTime),
    dueDate: input.dueDate && isDateString(input.dueDate) ? input.dueDate : undefined,
    listId: input.listId,
    recurrence: sanitizeRecurrence(input.recurrence),
  }
}
