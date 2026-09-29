import { getLocalDateString, isDateString, normalizeTime } from '../utils/date'
import { sanitizeRecurrence } from '../utils/recurrence'
import type { AppState, Todo, TodoList } from '../types/todo'

function localDateFromInstant(value: string): string | null {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return getLocalDateString(date)
}

export function normalizeTodo(value: unknown, listId?: string): Todo | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  if (typeof raw.id !== 'string' || raw.id.length === 0 || typeof raw.text !== 'string') return null

  const completedDates = Array.isArray(raw.completedDates)
    ? [...new Set(raw.completedDates.filter((date): date is string => typeof date === 'string' && isDateString(date)))].sort()
    : []

  const dueDate = typeof raw.dueDate === 'string' && isDateString(raw.dueDate) ? raw.dueDate : undefined
  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString()
  const explicitListId = typeof raw.listId === 'string' && raw.listId.length > 0 ? raw.listId : undefined
  const startDate =
    typeof raw.startDate === 'string' && isDateString(raw.startDate)
      ? raw.startDate
      : (dueDate ?? localDateFromInstant(createdAt) ?? getLocalDateString())

  return {
    id: raw.id,
    text: raw.text,
    startDate,
    startTime: normalizeTime(typeof raw.startTime === 'string' ? raw.startTime : undefined),
    endTime: normalizeTime(typeof raw.endTime === 'string' ? raw.endTime : undefined),
    completed: raw.completed === true,
    createdAt,
    important: raw.important === true,
    urgent: raw.urgent === true,
    dueDate,
    recurrence: sanitizeRecurrence(raw.recurrence),
    completedDates,
    listId: explicitListId ?? listId,
  }
}

export function normalizeTodoList(value: unknown): TodoList | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  if (typeof raw.id !== 'string' || raw.id.length === 0 || typeof raw.name !== 'string') return null

  return {
    id: raw.id,
    name: raw.name,
    important: raw.important === true,
  }
}

function todosFromList(value: unknown, listId: string): Todo[] {
  if (!value || typeof value !== 'object') return []
  const raw = value as Record<string, unknown>
  if (!Array.isArray(raw.todos)) return []
  return raw.todos.map((todo) => normalizeTodo(todo, listId)).filter((todo): todo is Todo => todo !== null)
}

export function normalizeState(value: unknown): AppState {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const listValues = Array.isArray(raw.lists) ? raw.lists : []
  const lists = listValues.map(normalizeTodoList).filter((list): list is TodoList => list !== null)
  const listIds = new Set(lists.map((list) => list.id))

  let todos: Todo[]
  let keepSelection = false

  if (Array.isArray(raw.todos)) {
    keepSelection = true
    todos = raw.todos.map((todo) => normalizeTodo(todo)).filter((todo): todo is Todo => todo !== null)
  } else {
    todos = listValues.flatMap((list) => {
      if (!list || typeof list !== 'object') return []
      const id = (list as Record<string, unknown>).id
      if (typeof id !== 'string' || !listIds.has(id)) return []
      return todosFromList(list, id)
    })
  }

  todos = todos.map((todo) => ({
    ...todo,
    listId: todo.listId && listIds.has(todo.listId) ? todo.listId : undefined,
  }))

  const selectedListId =
    keepSelection && typeof raw.selectedListId === 'string' && listIds.has(raw.selectedListId)
      ? raw.selectedListId
      : null

  return { lists, todos, selectedListId }
}
