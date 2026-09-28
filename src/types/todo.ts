/**
 * A single todo item.
 * Array order on the parent list is the display order, so drag-and-drop
 * reordering can be added later without changing the data shape.
 * Optional fields (important, urgent, dueDate, tags, color) can be added
 * to this interface without a rewrite.
 */
export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

/**
 * A named collection of todos.
 * Array order of `lists` in AppState is the display order.
 * Optional fields (important, color, category) can be added later.
 */
export interface TodoList {
  id: string
  name: string
  todos: Todo[]
}

export interface AppState {
  lists: TodoList[]
  selectedListId: string | null
}
