<script lang="ts">
  import { todoStore } from '../stores/todoStore.svelte'
  import type { Todo, TodoList } from '../types/todo'
  import ConfirmDialog from './ConfirmDialog.svelte'
  import TodoForm from './TodoForm.svelte'
  import TodoItem from './TodoItem.svelte'

  interface Props {
    list: TodoList
    onOpenLists?: () => void
  }

  let { list, onOpenLists }: Props = $props()

  let pendingDeleteTodo = $state<Todo | null>(null)
</script>

<section class="flex h-full min-h-0 flex-col" aria-labelledby="selected-list-name">
  <header class="flex items-center gap-3 border-b border-slate-200 px-4 py-4 md:px-8 md:py-6">
    {#if onOpenLists}
      <button
        type="button"
        class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        aria-label="Open todo lists"
        onclick={onOpenLists}
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    {/if}
    <h2 id="selected-list-name" class="truncate text-2xl font-semibold text-slate-900">
      {list.name}
    </h2>
  </header>

  <div class="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-6">
    <TodoForm onAdd={(text) => todoStore.addTodo(list.id, text) !== null} />

    {#if list.todos.length === 0}
      <div class="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
        <p class="text-base font-medium text-slate-800">No todos yet</p>
        <p class="mt-1 text-sm text-slate-500">Add your first todo to get this list started.</p>
      </div>
    {:else}
      <ul class="mt-5 space-y-2">
        {#each list.todos as todo (todo.id)}
          <TodoItem
            {todo}
            onToggle={() => todoStore.toggleTodo(list.id, todo.id)}
            onUpdate={(text) => todoStore.updateTodo(list.id, todo.id, text)}
            onDelete={() => {
              pendingDeleteTodo = todo
            }}
          />
        {/each}
      </ul>
    {/if}
  </div>
</section>

<ConfirmDialog
  open={pendingDeleteTodo !== null}
  title="Delete todo?"
  message={pendingDeleteTodo
    ? `“${pendingDeleteTodo.text}” will be removed. This cannot be undone.`
    : ''}
  confirmLabel="Delete todo"
  onCancel={() => {
    pendingDeleteTodo = null
  }}
  onConfirm={() => {
    if (pendingDeleteTodo) {
      todoStore.deleteTodo(list.id, pendingDeleteTodo.id)
      pendingDeleteTodo = null
    }
  }}
/>
