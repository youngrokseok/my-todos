<script lang="ts">
  import { tick } from 'svelte'
  import type { TodoList } from '../types/todo'

  interface Props {
    list: TodoList
    selected: boolean
    onSelect: () => void
    onRename: (name: string) => boolean
    onDelete: () => void
  }

  let { list, selected, onSelect, onRename, onDelete }: Props = $props()

  let isEditing = $state(false)
  let draftName = $state('')
  let inputEl = $state<HTMLInputElement | null>(null)

  async function startEditing() {
    draftName = list.name
    isEditing = true
    await tick()
    inputEl?.focus()
    inputEl?.select()
  }

  function cancelEditing() {
    isEditing = false
    draftName = list.name
  }

  function saveName() {
    if (onRename(draftName)) {
      isEditing = false
    }
  }

  function handleSubmit(event: Event) {
    event.preventDefault()
    saveName()
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      cancelEditing()
    }
  }
</script>

<li>
  {#if isEditing}
    <form class="flex items-center gap-1 p-1" onsubmit={handleSubmit}>
      <label class="sr-only" for="rename-list-{list.id}">Rename list</label>
      <input
        id="rename-list-{list.id}"
        bind:this={inputEl}
        bind:value={draftName}
        class="min-w-0 flex-1 rounded-lg border border-indigo-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
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
    <div
      class="group flex items-center gap-1 rounded-xl {selected
        ? 'bg-indigo-600 text-white'
        : 'text-slate-800 hover:bg-slate-100'}"
    >
      <button
        type="button"
        class="min-w-0 flex-1 rounded-xl px-3 py-2.5 text-left"
        onclick={onSelect}
        aria-current={selected ? 'page' : undefined}
      >
        <span class="block truncate font-medium">{list.name}</span>
        <span class="block text-xs {selected ? 'text-indigo-100' : 'text-slate-500'}">
          {list.todos.length}
          {list.todos.length === 1 ? 'todo' : 'todos'}
        </span>
      </button>
      <div class="flex shrink-0 pr-1 {selected ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'}">
        <button
          type="button"
          class="rounded-lg p-1.5 {selected
            ? 'hover:bg-indigo-500'
            : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'}"
          aria-label="Rename {list.name}"
          onclick={startEditing}
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        </button>
        <button
          type="button"
          class="rounded-lg p-1.5 {selected
            ? 'hover:bg-indigo-500'
            : 'text-slate-500 hover:bg-red-50 hover:text-red-600'}"
          aria-label="Delete {list.name}"
          onclick={onDelete}
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
          </svg>
        </button>
      </div>
    </div>
  {/if}
</li>
