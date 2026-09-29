export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

/**
 * Recurrence is stored on a single Todo.
 * Weekend is not a separate type: Saturday + Sunday use `weekdays`.
 * Daily is its own type so we don't store all seven days.
 */
export interface TodoRecurrence {
  type: 'none' | 'daily' | 'weekdays'
  days?: Weekday[]
}

export interface Todo {
  id: string
  text: string
  /** Local calendar date (YYYY-MM-DD) when the todo starts, or when recurrence begins. */
  startDate: string
  /** Optional local time `HH:MM`. */
  startTime?: string
  /** Optional local time `HH:MM`. */
  endTime?: string
  dueDate?: string
  recurrence: TodoRecurrence
  important: boolean
  urgent: boolean
  completed: boolean
  /** Local calendar dates (YYYY-MM-DD) a recurring todo was completed. */
  completedDates: string[]
  createdAt: string
  /** Optional category. Todos can exist without one. */
  listId?: string
}

/** Optional category. Todos are not stored inside the list. */
export interface TodoList {
  id: string
  name: string
  important: boolean
}

export interface AppState {
  lists: TodoList[]
  todos: Todo[]
  /** `null` shows the full week. A list id filters the week to that category. */
  selectedListId: string | null
}

/** Fields the create/edit form can change. Completion is handled separately. */
export interface TodoInput {
  text: string
  startDate: string
  startTime?: string
  endTime?: string
  dueDate?: string
  recurrence: TodoRecurrence
  important: boolean
  urgent: boolean
  listId?: string
}

/** A calculated appearance of a persisted Todo on one calendar day. Not stored. */
export interface TodoOccurrence {
  todo: Todo
  date: string
  completed: boolean
  listName?: string
  /** Incomplete one-off todo whose start date is before this day. Shown on Today so it is not lost. */
  carriedOver?: boolean
}

export interface DaySection {
  date: string
  isToday: boolean
  occurrences: TodoOccurrence[]
}
