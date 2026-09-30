<script lang="ts">
  import { messages } from '../i18n/locale.svelte'
  import { todoStore } from '../stores/todoStore.svelte'
  import { addDays, formatLongDate, getLocalDateString } from '../utils/date'
  import TodoForm from './TodoForm.svelte'
  import TodoItem from './TodoItem.svelte'

  interface Props {
    onOpenLists?: () => void
  }

  let { onOpenLists }: Props = $props()

  const copy = $derived(messages())
  const today = $derived(getLocalDateString())
  const selected = $derived(todoStore.days.find((day) => day.date === todoStore.selectedDate) ?? todoStore.days[0])
  const heading = $derived(selected ? formatLongDate(selected.date, copy.dateLocale) : '')
  const subtitle = $derived.by(() => {
    if (!selected) return ''
    if (selected.date === today) return copy.today
    if (selected.date === addDays(today, 1)) return copy.tomorrow
    return ''
  })
  const emptyMessage = $derived(selected?.date === today ? copy.noTodosToday : copy.noTodosDay)

  let editingId = $state<string | null>(null)
  let closeComposer = $state(0)
  let previousDate = todoStore.selectedDate

  $effect(() => {
    const date = todoStore.selectedDate
    if (date === previousDate) return
    previousDate = date
    editingId = null
    closeComposer += 1
  })

  function beginEdit(id: string) {
    editingId = id
    closeComposer += 1
  }

  function beginAdd() {
    editingId = null
  }
</script>

<section class="flex h-full min-h-0 flex-col" aria-labelledby="day-heading">
  <header class="flex items-center gap-3 border-b border-slate-200 px-4 py-4 md:px-8 md:py-6">
    {#if onOpenLists}
      <button
        type="button"
        class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        aria-label={copy.openPlanner}
        title={copy.openPlanner}
        onclick={onOpenLists}
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    {/if}
    <div class="min-w-0">
      <h2 id="day-heading" class="truncate text-2xl font-semibold text-slate-900">{heading}</h2>
      {#if subtitle}
        <p class="text-sm font-medium text-slate-500">{subtitle}</p>
      {/if}
    </div>
  </header>

  <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
    <TodoForm
      lists={todoStore.lists}
      defaultStartDate={todoStore.selectedDate}
      defaultListId={todoStore.selectedListId ?? undefined}
      closeRequest={closeComposer}
      onExpand={beginAdd}
      onAdd={(input) => todoStore.addTodo(input) !== null}
    />

    {#if todoStore.selectedList}
      <p class="mt-4 flex items-center gap-2 text-sm text-slate-500">
        <span>{todoStore.selectedList.name}</span>
        <button type="button" class="font-medium text-indigo-700 hover:underline" onclick={() => todoStore.selectWeek()}>
          {copy.showAll}
        </button>
      </p>
    {/if}

    {#if selected}
      {#if selected.occurrences.length === 0}
        <p class="mt-6 text-sm text-slate-400">{emptyMessage}</p>
      {:else}
        <ul class="mt-6 space-y-2">
          {#each selected.occurrences as occurrence (`${occurrence.todo.id}-${selected.date}`)}
            <TodoItem
              {occurrence}
              lists={todoStore.lists}
              editing={editingId === occurrence.todo.id}
              onEditStart={() => beginEdit(occurrence.todo.id)}
              onToggle={() => todoStore.toggleTodoForDate(occurrence.todo.id, selected.date)}
              onSave={(input) => todoStore.updateTodo(occurrence.todo.id, input)}
              onDelete={() => todoStore.deleteTodo(occurrence.todo.id)}
              onToggleImportant={() => todoStore.toggleTodoImportant(occurrence.todo.id)}
              onToggleUrgent={() => todoStore.toggleTodoUrgent(occurrence.todo.id)}
            />
          {/each}
        </ul>
      {/if}
    {/if}
  </div>
</section>
