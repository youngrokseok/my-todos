import { en } from '../i18n/en'
import type { Messages } from '../i18n/types'
import type { Todo, TodoOccurrence } from '../types/todo'
import { formatDueDate } from './date'
import { formatRecurrence, isTodoCompletedForDate, isTodoScheduledForDate } from './recurrence'

function compareOccurrences(a: TodoOccurrence, b: TodoOccurrence): number {
  const aTime = a.todo.startTime
  const bTime = b.todo.startTime
  if (aTime && bTime && aTime !== bTime) return aTime < bTime ? -1 : 1
  if (aTime && !bTime) return -1
  if (!aTime && bTime) return 1
  if (a.todo.createdAt !== b.todo.createdAt) return a.todo.createdAt < b.todo.createdAt ? -1 : 1
  return a.todo.id < b.todo.id ? -1 : 1
}

function toOccurrence(
  todo: Todo,
  date: string,
  listNames: ReadonlyMap<string, string>,
  carriedOver = false,
): TodoOccurrence {
  return {
    todo,
    date,
    completed: isTodoCompletedForDate(todo, date),
    listName: todo.listId ? listNames.get(todo.listId) : undefined,
    carriedOver,
  }
}

/**
 * Visual occurrences for one calendar day.
 * Today also includes incomplete one-off todos that started earlier, so they stay visible.
 */
export function getTodoOccurrencesForDate(
  todos: readonly Todo[],
  date: string,
  listNames: ReadonlyMap<string, string> = new Map(),
  today?: string,
): TodoOccurrence[] {
  const occurrences: TodoOccurrence[] = []
  const seen = new Set<string>()

  for (const todo of todos) {
    if (!isTodoScheduledForDate(todo, date)) continue
    occurrences.push(toOccurrence(todo, date, listNames))
    seen.add(todo.id)
  }

  if (today && date === today) {
    for (const todo of todos) {
      if (seen.has(todo.id)) continue
      if (todo.recurrence.type !== 'none' || todo.completed || todo.startDate >= today) continue
      occurrences.push(toOccurrence(todo, date, listNames, true))
    }
  }

  occurrences.sort(compareOccurrences)
  return occurrences
}

export function occurrenceMeta(occurrence: TodoOccurrence, copy: Messages = en): string | null {
  const parts: string[] = []
  if (occurrence.listName) parts.push(occurrence.listName)
  const { startTime, endTime } = occurrence.todo
  if (startTime && endTime) parts.push(`${startTime}–${endTime}`)
  else if (startTime) parts.push(startTime)
  else if (endTime) parts.push(copy.endsAt(endTime))
  const recurrence = formatRecurrence(occurrence.todo.recurrence, copy)
  if (recurrence) parts.push(recurrence)
  if (occurrence.carriedOver && !occurrence.todo.dueDate) {
    parts.push(copy.startedOn(formatDueDate(occurrence.todo.startDate, copy.dateLocale)))
  }
  return parts.length > 0 ? parts.join(' · ') : null
}
