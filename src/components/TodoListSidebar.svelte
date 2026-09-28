<script lang="ts">
  import { tick } from 'svelte'
  import { todoStore } from '../stores/todoStore.svelte'
  import ConfirmDialog from './ConfirmDialog.svelte'
  import TodoListItem from './TodoListItem.svelte'

  interface Props {
    onSelectList?: () => void
    onClose?: () => void
  }

  let { onSelectList, onClose }: Props = $props()

  let isCreating = $state(false)
  let newListName = $state('')
  let newListInput = $state<HTMLInputElement | null>(null)
  let pendingDeleteId = $state<string | null>(null)

  const pendingDeleteList = $derived(
    todoStore.lists.find((list) => list.id === pendingDeleteId) ?? null,
  )

  async function startCreating() {
    isCreating = true
    newListName = ''
    await tick()
    newListInput?.focus()
  }

  function cancelCreating() {
    isCreating = false
    newListName = ''
  }

  function handleCreate(event: Event) {
    event.preventDefault()
    if (todoStore.createList(newListName)) {
      newListName = ''
      isCreating = false
      onSelectList?.()
    }
  }

  function handleSelect(id: string) {
    todoStore.selectList(id)
    onSelectList?.()
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      cancelCreating()
    }
  }
</script>

<div class="flex h-full flex-col">
  <header class="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-5">
    <div>
      <p class="text-xs font-semibold uppercase tracking-wider text-indigo-600">My Todos</p>
      <h1 class="mt-1 text-xl font-semibold text-slate-900">Todo Lists</h1>
    </div>
    {#if onClose}
      <button
        type="button"
        class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        aria-label="Close todo lists"
        onclick={onClose}
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    {/if}
  </header>

  <nav class="flex-1 overflow-y-auto p-3" aria-label="Todo lists">
    {#if todoStore.lists.length === 0 && !isCreating}
      <p class="px-2 py-6 text-center text-sm text-slate-500">
        No lists yet. Create one to get started.
      </p>
    {:else}
      <ul class="space-y-1">
        {#each todoStore.lists as list (list.id)}
          <TodoListItem
            {list}
            selected={list.id === todoStore.selectedListId}
            onSelect={() => handleSelect(list.id)}
            onRename={(name) => todoStore.renameList(list.id, name)}
            onDelete={() => {
              pendingDeleteId = list.id
            }}
          />
        {/each}
      </ul>
    {/if}
  </nav>

  <div class="border-t border-slate-200 p-3">
    {#if isCreating}
      <form class="space-y-2" onsubmit={handleCreate}>
        <label class="sr-only" for="new-list-name">New list name</label>
        <input
          id="new-list-name"
          bind:this={newListInput}
          bind:value={newListName}
          class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          placeholder="List name"
          onkeydown={handleKeydown}
        />
        <div class="flex gap-2">
          <button
            type="submit"
            class="flex-1 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            disabled={!newListName.trim()}
          >
            Create
          </button>
          <button
            type="button"
            class="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            onclick={cancelCreating}
          >
            Cancel
          </button>
        </div>
      </form>
    {:else}
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700"
        onclick={startCreating}
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        New List
      </button>
    {/if}
  </div>
</div>

<ConfirmDialog
  open={pendingDeleteList !== null}
  title="Delete list?"
  message={pendingDeleteList
    ? `“${pendingDeleteList.name}” and all of its todos will be removed. This cannot be undone.`
    : ''}
  confirmLabel="Delete list"
  onCancel={() => {
    pendingDeleteId = null
  }}
  onConfirm={() => {
    if (pendingDeleteId) {
      todoStore.deleteList(pendingDeleteId)
      pendingDeleteId = null
    }
  }}
/>
