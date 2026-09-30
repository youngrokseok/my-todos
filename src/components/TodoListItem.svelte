<script lang="ts">
  import { tick } from 'svelte'
  import { messages } from '../i18n/locale.svelte'
  import type { TodoList } from '../types/todo'

  interface Props {
    list: TodoList
    count: number
    selected: boolean
    onSelect: () => void
    onRename: (name: string) => boolean
    onDelete: () => void
    onToggleImportant: () => void
  }

  let { list, count, selected, onSelect, onRename, onDelete, onToggleImportant }: Props = $props()

  const copy = $derived(messages())

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

  function saveName(event: Event) {
    event.preventDefault()
    if (onRename(draftName)) isEditing = false
  }
</script>

<li>
  {#if isEditing}
    <form class="flex items-center gap-1 p-1" onsubmit={saveName}>
      <label class="sr-only" for="rename-list-{list.id}">{copy.renameCategory}</label>
      <input
        id="rename-list-{list.id}"
        bind:this={inputEl}
        bind:value={draftName}
        class="min-w-0 flex-1 rounded-lg border border-indigo-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
        onkeydown={(event) => {
          if (event.key === 'Escape') cancelEditing()
        }}
      />
      <button type="submit" class="rounded-lg px-2 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50">
        {copy.save}
      </button>
      <button type="button" class="rounded-lg px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-100" onclick={cancelEditing}>
        {copy.cancel}
      </button>
    </form>
  {:else}
    <div
      class="group flex items-center gap-1 rounded-xl {selected
        ? 'bg-slate-100 text-slate-900'
        : list.important
          ? 'border border-amber-300 bg-amber-50 text-slate-800'
          : 'text-slate-800 hover:bg-slate-100'}"
    >
      <button
        type="button"
        class="rounded-lg p-1.5 {list.important
          ? 'text-amber-500'
          : 'text-slate-400 hover:text-amber-600'}"
        aria-pressed={list.important}
        aria-label={list.important ? copy.removeImportant(list.name) : copy.markAsImportant(list.name)}
        title={list.important ? copy.important : copy.markImportant}
        onclick={onToggleImportant}
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 3.2 14.7 8.7 20.8 9.6 16.4 14 17.4 20.1 12 17.2 6.6 20.1 7.6 14 3.2 9.6 9.3 8.7 12 3.2Z"
            fill={list.important ? 'currentColor' : 'none'}
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
        </svg>
        <span class="sr-only">{copy.important}</span>
      </button>
      <button
        type="button"
        class="min-w-0 flex-1 rounded-xl px-1 py-2.5 text-left"
        onclick={onSelect}
        aria-pressed={selected}
      >
        <span class="block truncate font-medium">{list.name}</span>
        <span class="block text-xs text-slate-500">{copy.todoCount(count)}</span>
      </button>
      <div class="flex shrink-0 pr-1">
        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
          aria-label={copy.renameNamed(list.name)}
          title={copy.rename}
          onclick={startEditing}
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        </button>
        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
          aria-label={copy.removeNamed(list.name)}
          title={copy.remove}
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
