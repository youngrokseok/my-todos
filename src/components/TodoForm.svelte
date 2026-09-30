<script lang="ts">
  import { tick } from 'svelte'
  import { messages } from '../i18n/locale.svelte'
  import type { TodoInput, TodoList } from '../types/todo'
  import { canSaveRecurrence, emptyTodoInput } from '../utils/recurrence'
  import { isDateString } from '../utils/date'
  import TodoOptions from './TodoOptions.svelte'

  interface Props {
    lists?: TodoList[]
    defaultStartDate: string
    defaultListId?: string
    openRequest?: number
    closeRequest?: number
    onExpand?: () => void
    onAdd: (input: TodoInput) => boolean
    onReset?: () => void
  }

  let { lists = [], defaultStartDate, defaultListId, openRequest = 0, closeRequest = 0, onExpand, onAdd, onReset }: Props = $props()

  const copy = $derived(messages())

  let input = $state<TodoInput>(emptyTodoInput())
  let expanded = $state(false)
  let inputEl = $state<HTMLInputElement | null>(null)
  let seenRequest = 0
  let seenClose = 0
  let lastDefaultStart = ''

  const canSubmit = $derived(
    input.text.trim().length > 0 && isDateString(input.startDate) && canSaveRecurrence(input.recurrence),
  )

  function applyDefaults() {
    input.startDate = defaultStartDate
    input.listId = defaultListId
  }

  function expand() {
    if (expanded) return
    onExpand?.()
    applyDefaults()
    expanded = true
  }

  function reset() {
    input = emptyTodoInput(defaultStartDate, defaultListId)
    expanded = false
    onReset?.()
  }

  function submit() {
    if (!canSubmit) return
    const payload: TodoInput = {
      text: input.text,
      startDate: input.startDate,
      startTime: input.startTime,
      endTime: input.endTime,
      important: input.important,
      urgent: input.urgent,
      dueDate: input.dueDate,
      listId: input.listId,
      recurrence:
        input.recurrence.type === 'weekdays'
          ? { type: 'weekdays', days: [...(input.recurrence.days ?? [])] }
          : { type: input.recurrence.type },
    }
    if (!onAdd(payload)) return
    reset()
    inputEl?.blur()
  }

  function handleSubmit(event: Event) {
    event.preventDefault()
    if (!expanded) {
      expand()
      return
    }
    submit()
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    if (!expanded) {
      expand()
      return
    }
    submit()
  }

  $effect(() => {
    const request = openRequest
    const startDate = defaultStartDate
    const listId = defaultListId
    if (request === 0 || request === seenRequest) return
    seenRequest = request
    input.startDate = startDate
    input.listId = listId
    lastDefaultStart = startDate
    expanded = true
    void tick().then(() => inputEl?.focus())
  })

  $effect(() => {
    const close = closeRequest
    const startDate = defaultStartDate
    const listId = defaultListId
    if (close === seenClose) return
    seenClose = close
    input = emptyTodoInput(startDate, listId)
    lastDefaultStart = startDate
    expanded = false
  })

  $effect(() => {
    const next = defaultStartDate
    if (expanded && input.startDate === lastDefaultStart && input.startDate !== next) {
      input.startDate = next
    }
    lastDefaultStart = next
  })
</script>

<form class="rounded-2xl border border-slate-200 bg-slate-50 p-3" onsubmit={handleSubmit}>
  <label class="sr-only" for="new-todo">{copy.addTodo}</label>
  <input
    id="new-todo"
    bind:this={inputEl}
    bind:value={input.text}
    class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
    placeholder={copy.whatNeedsToBeDone}
    autocomplete="off"
    onfocus={expand}
    onclick={expand}
    onkeydown={handleKeydown}
  />

  {#if expanded}
    <TodoOptions idPrefix="new-todo" {lists} bind:input />
    <div class="mt-3 flex justify-end gap-2">
      <button
        type="button"
        class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-200"
        onclick={reset}
      >
        {copy.cancel}
      </button>
      <button
        type="submit"
        class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300"
        disabled={!canSubmit}
      >
        {copy.addTodo}
      </button>
    </div>
  {/if}
</form>
