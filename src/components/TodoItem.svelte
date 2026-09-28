<script lang="ts">
  import { tick } from 'svelte'
  import type { Todo } from '../types/todo'

  interface Props {
    todo: Todo
    onToggle: () => void
    onUpdate: (text: string) => boolean
    onDelete: () => void
  }

  let { todo, onToggle, onUpdate, onDelete }: Props = $props()

  let isEditing = $state(false)
  let draftText = $state('')
  let inputEl = $state<HTMLInputElement | null>(null)

  async function startEditing() {
    draftText = todo.text
    isEditing = true
    await tick()
    inputEl?.focus()
    inputEl?.select()
  }

  function cancelEditing() {
    isEditing = false
    draftText = todo.text
  }

  function handleSubmit(event: Event) {
    event.preventDefault()
    if (onUpdate(draftText)) {
      isEditing = false
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      cancelEditing()
    }
  }
</script>

<li class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
  {#if isEditing}
    <form class="flex min-w-0 flex-1 items-center gap-2" onsubmit={handleSubmit}>
      <label class="sr-only" for="edit-todo-{todo.id}">Edit todo</label>
      <input
        id="edit-todo-{todo.id}"
        bind:this={inputEl}
        bind:value={draftText}
        class="min-w-0 flex-1 rounded-lg border border-indigo-300 px-2 py-1.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
        onkeydown={handleKeydown}
      />
      <button
        type="submit"
        class="rounded-lg px-2 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
      >
        Save
      </button>
      <button
        type="button"
        class="rounded-lg px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
        onclick={cancelEditing}
      >
        Cancel
      </button>
    </form>
  {:else}
    <input
      id="todo-{todo.id}"
      type="checkbox"
      class="h-4 w-4 shrink-0 accent-indigo-600"
      checked={todo.completed}
      onchange={onToggle}
    />
    <label
      for="todo-{todo.id}"
      class="min-w-0 flex-1 cursor-pointer text-sm {todo.completed
        ? 'text-slate-400 line-through opacity-80'
        : 'text-slate-800'}"
    >
      {todo.text}
    </label>
    <div class="flex shrink-0 items-center gap-1">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg p-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 md:px-2.5 md:py-1"
        aria-label="Edit {todo.text}"
        onclick={startEditing}
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
        <span class="hidden md:inline">Edit</span>
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg p-2 text-sm font-medium text-red-600 hover:bg-red-50 md:px-2.5 md:py-1"
        aria-label="Delete {todo.text}"
        onclick={onDelete}
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
        </svg>
        <span class="hidden md:inline">Delete</span>
      </button>
    </div>
  {/if}
</li>
