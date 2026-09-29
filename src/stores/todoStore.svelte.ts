import { normalizeState } from '../services/normalize'
import { loadJson, saveJson } from '../services/storage'
import type { AppState, DaySection, Todo, TodoInput, TodoList, TodoRecurrence } from '../types/todo'
import { getLocalDateString, getSevenDayRange, isDateString } from '../utils/date'
import { getTodoOccurrencesForDate } from '../utils/occurrences'
import { isRecurring, readSchedule, toggleTodoCompletionForDate } from '../utils/recurrence'

const STATE_KEY = 'app-state'

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeText(text: string): string | null {
  const value = text.trim()
  return value.length > 0 ? value : null
}

function createTodoStore() {
  const initial = normalizeState(loadJson<unknown>(STATE_KEY))
  let lists = $state<TodoList[]>(initial.lists)
  let todos = $state<Todo[]>(initial.todos)
  let selectedListId = $state<string | null>(initial.selectedListId)
  /** Session-only. A reload always starts on today. */
  let pickedDate = $state(getLocalDateString())

  const selectedList = $derived(lists.find((list) => list.id === selectedListId) ?? null)

  const selectedDate = $derived.by(() => {
    const today = getLocalDateString()
    return getSevenDayRange(today).includes(pickedDate) ? pickedDate : today
  })

  const visibleTodos = $derived(selectedListId ? todos.filter((todo) => todo.listId === selectedListId) : todos)

  const days = $derived.by((): DaySection[] => {
    const today = getLocalDateString()
    const names = new Map(lists.map((list) => [list.id, list.name]))
    return getSevenDayRange(today).map((date) => ({
      date,
      isToday: date === today,
      occurrences: getTodoOccurrencesForDate(visibleTodos, date, names, today),
    }))
  })

  function countForList(listId: string): number {
    return todos.filter((todo) => todo.listId === listId).length
  }

  function persist() {
    saveJson<AppState>(STATE_KEY, { lists, todos, selectedListId })
  }

  function findList(listId: string): TodoList | undefined {
    return lists.find((list) => list.id === listId)
  }

  function findTodo(todoId: string): Todo | undefined {
    return todos.find((todo) => todo.id === todoId)
  }

  function renameList(id: string, name: string): boolean {
    const normalized = normalizeText(name)
    const list = findList(id)
    if (!normalized || !list) return false
    list.name = normalized
    persist()
    return true
  }

  function deleteList(id: string): void {
    const index = lists.findIndex((list) => list.id === id)
    if (index === -1) return
    lists.splice(index, 1)
    for (const todo of todos) {
      if (todo.listId === id) todo.listId = undefined
    }
    if (selectedListId === id) selectedListId = null
    persist()
  }

  function selectList(id: string): void {
    if (!findList(id)) return
    selectedListId = id
    persist()
  }

  function selectWeek(): void {
    selectedListId = null
    persist()
  }

  function selectDate(date: string): void {
    if (!isDateString(date)) return
    const today = getLocalDateString()
    pickedDate = getSevenDayRange(today).includes(date) ? date : today
  }

  function toggleListImportant(id: string): void {
    const list = findList(id)
    if (!list) return
    list.important = !list.important
    persist()
  }

  function addTodo(input: TodoInput): string | null {
    const text = normalizeText(input.text)
    const schedule = readSchedule(input)
    if (!text || !schedule) return null
    if (schedule.listId && !findList(schedule.listId)) schedule.listId = undefined

    const todo: Todo = {
      id: createId(),
      text,
      startDate: schedule.startDate,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      dueDate: schedule.dueDate,
      recurrence: schedule.recurrence,
      important: input.important,
      urgent: input.urgent,
      completed: false,
      completedDates: [],
      createdAt: new Date().toISOString(),
      listId: schedule.listId,
    }
    todos.push(todo)
    persist()
    return todo.id
  }

  function updateTodo(todoId: string, input: TodoInput): boolean {
    const text = normalizeText(input.text)
    const schedule = readSchedule(input)
    const todo = findTodo(todoId)
    if (!text || !schedule || !todo) return false
    if (schedule.listId && !findList(schedule.listId)) schedule.listId = undefined

    applyRecurrenceTransition(todo, schedule.recurrence)
    todo.text = text
    todo.startDate = schedule.startDate
    todo.startTime = schedule.startTime
    todo.endTime = schedule.endTime
    todo.dueDate = schedule.dueDate
    todo.recurrence = schedule.recurrence
    todo.important = input.important
    todo.urgent = input.urgent
    todo.listId = schedule.listId
    persist()
    return true
  }

  function applyRecurrenceTransition(todo: Todo, nextRecurrence: TodoRecurrence): void {
    const wasRecurring = isRecurring(todo)
    const willRecur = nextRecurrence.type !== 'none'
    const today = getLocalDateString()

    if (!wasRecurring && willRecur && todo.completed) {
      const dates = new Set(todo.completedDates)
      dates.add(today)
      todo.completedDates = [...dates].sort()
      todo.completed = false
    }

    if (wasRecurring && !willRecur) {
      todo.completed = todo.completedDates.includes(today)
    }
  }

  function toggleTodoForDate(todoId: string, date: string): void {
    const todo = findTodo(todoId)
    if (!todo || !isDateString(date)) return
    toggleTodoCompletionForDate(todo, date)
    persist()
  }

  function toggleTodoImportant(todoId: string): void {
    const todo = findTodo(todoId)
    if (!todo) return
    todo.important = !todo.important
    persist()
  }

  function toggleTodoUrgent(todoId: string): void {
    const todo = findTodo(todoId)
    if (!todo) return
    todo.urgent = !todo.urgent
    persist()
  }

  function deleteTodo(todoId: string): void {
    const index = todos.findIndex((todo) => todo.id === todoId)
    if (index === -1) return
    todos.splice(index, 1)
    persist()
  }

  persist()

  return {
    get lists() {
      return lists
    },
    get todos() {
      return todos
    },
    get selectedListId() {
      return selectedListId
    },
    get selectedList() {
      return selectedList
    },
    get selectedDate() {
      return selectedDate
    },
    get days() {
      return days
    },
    countForList,
    renameList,
    deleteList,
    selectList,
    selectWeek,
    selectDate,
    toggleListImportant,
    addTodo,
    updateTodo,
    toggleTodoForDate,
    toggleTodoImportant,
    toggleTodoUrgent,
    deleteTodo,
  }
}

export const todoStore = createTodoStore()
