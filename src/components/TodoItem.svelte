<script lang="ts">
  import { tick } from 'svelte'
  import { messages } from '../i18n/locale.svelte'
  import type { TodoInput, TodoList, TodoOccurrence } from '../types/todo'
  import { formatLongDate, getDueStatus, isDateString } from '../utils/date'
  import { occurrenceMeta } from '../utils/occurrences'
  import { canSaveRecurrence, dueLabel, emptyTodoInput, isRecurring, todoToInput } from '../utils/recurrence'
  import ConfirmDialog from './ConfirmDialog.svelte'
  import TodoOptions from './TodoOptions.svelte'

  interface Props {
    occurrence: TodoOccurrence
    lists?: TodoList[]
    editing?: boolean
    onEditStart?: () => void
    onToggle: () => void
    onSave: (input: TodoInput) => boolean
    onDelete: () => void
    onToggleImportant: () => void
    onToggleUrgent: () => void
  }

  let {
    occurrence,
    lists = [],
    editing = false,
    onEditStart,
    onToggle,
    onSave,
    onDelete,
    onToggleImportant,
    onToggleUrgent,
  }: Props = $props()

  let isEditing = $state(false)
  let confirmOpen = $state(false)
  let draft = $state<TodoInput>(emptyTodoInput())
  let inputEl = $state<HTMLInputElement | null>(null)

  const copy = $derived(messages())
  const todo = $derived(occurrence.todo)
  const completedNow = $derived(occurrence.completed)
  const dueStatus = $derived(getDueStatus(todo.dueDate, completedNow, occurrence.date))
  const dueText = $derived(dueLabel(todo.dueDate, completedNow, occurrence.date, copy))
  const meta = $derived(occurrenceMeta(occurrence, copy))
  const canSave = $derived(draft.text.trim().length > 0 && isDateString(draft.startDate) && canSaveRecurrence(draft.recurrence))
  const fieldId = $derived(`todo-${todo.id}-${occurrence.date}`)

  async function startEditing() {
    if (completedNow) return
    onEditStart?.()
    draft = todoToInput(todo)
    isEditing = true
    await tick()
    inputEl?.focus()
    inputEl?.select()
  }

  $effect(() => {
    if (!editing && isEditing) {
      isEditing = false
      draft = todoToInput(todo)
    }
  })

  function cancelEditing() {
    isEditing = false
    draft = todoToInput(todo)
  }

  function save(event: Event) {
    event.preventDefault()
    if (!canSave) return
    if (onSave(draft)) isEditing = false
  }
</script>

<li
  class="rounded-xl border px-3 py-2 {completedNow
    ? 'border-slate-200 bg-white'
    : todo.urgent || dueStatus === 'overdue'
      ? 'border-red-200 bg-red-50'
      : todo.important
        ? 'border-amber-200 bg-amber-50'
        : 'border-slate-200 bg-white'}"
>
  {#if isEditing}
    <form onsubmit={save}>
      <label class="sr-only" for="edit-{fieldId}">{copy.editTodo}</label>
      <input
        id="edit-{fieldId}"
        bind:this={inputEl}
        bind:value={draft.text}
        class="w-full rounded-xl border border-indigo-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
        onkeydown={(event) => {
          if (event.key === 'Escape') cancelEditing()
        }}
      />
      <TodoOptions idPrefix="edit-{fieldId}" {lists} bind:input={draft} />
      <div class="mt-3 flex justify-end gap-2">
        <button
          type="button"
          class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-200"
          onclick={cancelEditing}
        >
          {copy.cancel}
        </button>
        <button
          type="submit"
          class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-300"
          disabled={!canSave}
        >
          {copy.save}
        </button>
      </div>
    </form>
  {:else}
    <div class="flex items-center gap-2">
      <label class="flex min-w-0 flex-1 cursor-pointer items-center gap-2 {completedNow ? 'opacity-70' : ''}">
        <input
          id={fieldId}
          type="checkbox"
          class="h-4 w-4 shrink-0 accent-indigo-600"
          checked={completedNow}
          aria-label={isRecurring(todo)
            ? copy.markCompleteOn(todo.text, formatLongDate(occurrence.date, copy.dateLocale))
            : copy.markComplete(todo.text)}
          onchange={onToggle}
        />
        <span class="min-w-0">
          <span class="block text-sm {completedNow ? 'text-slate-400 line-through' : 'text-slate-800'}">
            {todo.text}
          </span>
          {#if meta}
            <span class="mt-0.5 block text-xs font-normal text-slate-500">{meta}</span>
          {/if}
          {#if dueText}
            <span
              class="mt-0.5 block text-xs font-medium {dueStatus === 'overdue' || dueStatus === 'today' || dueStatus === 'tomorrow'
                ? 'text-red-700'
                : 'text-slate-500'}"
            >
              {dueText}
            </span>
          {/if}
        </span>
      </label>
      <div class="flex shrink-0 items-center">
        <div class="flex items-center {completedNow ? 'opacity-70' : ''}">
        <button
          type="button"
          class="rounded-lg p-2 hover:bg-white/80 disabled:opacity-40 {todo.important ? 'text-amber-500' : 'text-slate-400 hover:text-amber-600'}"
          disabled={completedNow}
          aria-pressed={todo.important}
          aria-label={todo.important ? copy.removeImportant(todo.text) : copy.markAsImportant(todo.text)}
          title={todo.important ? copy.important : copy.markImportant}
          onclick={onToggleImportant}
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 3.2 14.7 8.7 20.8 9.6 16.4 14 17.4 20.1 12 17.2 6.6 20.1 7.6 14 3.2 9.6 9.3 8.7 12 3.2Z"
              fill={todo.important ? 'currentColor' : 'none'}
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
          </svg>
          <span class="sr-only">{copy.important}</span>
        </button>
        <button
          type="button"
          class="inline-flex items-center rounded-lg p-2 hover:bg-white/80 disabled:opacity-40 {todo.urgent ? 'text-red-600' : 'text-slate-400 hover:text-red-600'}"
          disabled={completedNow}
          aria-pressed={todo.urgent}
          aria-label={todo.urgent ? copy.removeUrgent(todo.text) : copy.markAsUrgent(todo.text)}
          title={todo.urgent ? copy.urgent : copy.markUrgent}
          onclick={onToggleUrgent}
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v5" />
            <path d="M12 16.5h.01" />
          </svg>
          <span class="sr-only">{copy.urgent}</span>
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg p-2 text-sm font-medium text-slate-700 hover:bg-indigo-100 hover:text-indigo-800 disabled:opacity-40 lg:px-2.5 lg:py-1"
          disabled={completedNow}
          aria-label={copy.editNamed(todo.text)}
          title={copy.edit}
          onclick={startEditing}
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
          <span class="hidden lg:inline">{copy.edit}</span>
        </button>
        </div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg p-2 text-sm font-medium text-red-600 hover:bg-red-100/70 lg:px-2.5 lg:py-1"
        aria-label={copy.deleteNamed(todo.text)}
        title={copy.delete}
        onclick={() => {
          confirmOpen = true
        }}
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
        </svg>
        <span class="hidden lg:inline">{copy.delete}</span>
      </button>
      </div>
    </div>
  {/if}
</li>

<ConfirmDialog
  open={confirmOpen}
  title={copy.deleteTodoTitle}
  message={isRecurring(todo) ? copy.deleteRecurringMessage(todo.text) : copy.deleteTodoMessage(todo.text)}
  confirmLabel={copy.deleteTodo}
  onCancel={() => {
    confirmOpen = false
  }}
  onConfirm={() => {
    confirmOpen = false
    onDelete()
  }}
/>
