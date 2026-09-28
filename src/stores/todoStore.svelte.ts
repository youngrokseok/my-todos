import { loadJson, saveJson } from '../services/storage'
import type { AppState, Todo, TodoList } from '../types/todo'

const STATE_KEY = 'app-state'

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalize(text: string): string | null {
  const value = text.trim()
  return value.length > 0 ? value : null
}

function isTodo(value: unknown): value is Todo {
  if (!value || typeof value !== 'object') {
    return false
  }

  const todo = value as Todo
  return (
    typeof todo.id === 'string' &&
    typeof todo.text === 'string' &&
    typeof todo.completed === 'boolean' &&
    typeof todo.createdAt === 'string'
  )
}

function isTodoList(value: unknown): value is TodoList {
  if (!value || typeof value !== 'object') {
    return false
  }

  const list = value as TodoList
  return (
    typeof list.id === 'string' &&
    typeof list.name === 'string' &&
    Array.isArray(list.todos) &&
    list.todos.every(isTodo)
  )
}

function loadInitialState(): AppState {
  const saved = loadJson<AppState>(STATE_KEY)
  const lists = saved?.lists?.filter(isTodoList) ?? []
  const selectedListId =
    saved?.selectedListId && lists.some((list) => list.id === saved.selectedListId)
      ? saved.selectedListId
      : (lists[0]?.id ?? null)

  return { lists, selectedListId }
}

function createTodoStore() {
  const initial = loadInitialState()
  let lists = $state<TodoList[]>(initial.lists)
  let selectedListId = $state<string | null>(initial.selectedListId)

  const selectedList = $derived(
    lists.find((list) => list.id === selectedListId) ?? null,
  )

  function persist() {
    saveJson<AppState>(STATE_KEY, {
      lists,
      selectedListId,
    })
  }

  function findList(listId: string): TodoList | undefined {
    return lists.find((list) => list.id === listId)
  }

  function createList(name: string): string | null {
    const normalized = normalize(name)
    if (!normalized) {
      return null
    }

    const list: TodoList = {
      id: createId(),
      name: normalized,
      todos: [],
    }

    lists.push(list)
    selectedListId = list.id
    persist()
    return list.id
  }

  function renameList(id: string, name: string): boolean {
    const normalized = normalize(name)
    if (!normalized) {
      return false
    }

    const list = findList(id)
    if (!list) {
      return false
    }

    list.name = normalized
    persist()
    return true
  }

  function deleteList(id: string): void {
    const index = lists.findIndex((list) => list.id === id)
    if (index === -1) {
      return
    }

    lists.splice(index, 1)

    if (selectedListId === id) {
      selectedListId = lists[0]?.id ?? null
    }

    persist()
  }

  function selectList(id: string): void {
    if (!findList(id)) {
      return
    }

    selectedListId = id
    persist()
  }

  function addTodo(listId: string, text: string): string | null {
    const normalized = normalize(text)
    if (!normalized) {
      return null
    }

    const list = findList(listId)
    if (!list) {
      return null
    }

    const todo: Todo = {
      id: createId(),
      text: normalized,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    list.todos.push(todo)
    persist()
    return todo.id
  }

  function updateTodo(listId: string, todoId: string, text: string): boolean {
    const normalized = normalize(text)
    if (!normalized) {
      return false
    }

    const todo = findList(listId)?.todos.find((item) => item.id === todoId)
    if (!todo) {
      return false
    }

    todo.text = normalized
    persist()
    return true
  }

  function toggleTodo(listId: string, todoId: string): void {
    const todo = findList(listId)?.todos.find((item) => item.id === todoId)
    if (!todo) {
      return
    }

    todo.completed = !todo.completed
    persist()
  }

  function deleteTodo(listId: string, todoId: string): void {
    const list = findList(listId)
    if (!list) {
      return
    }

    const index = list.todos.findIndex((todo) => todo.id === todoId)
    if (index === -1) {
      return
    }

    list.todos.splice(index, 1)
    persist()
  }

  return {
    get lists() {
      return lists
    },
    get selectedListId() {
      return selectedListId
    },
    get selectedList() {
      return selectedList
    },
    createList,
    renameList,
    deleteList,
    selectList,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
  }
}

export const todoStore = createTodoStore()
