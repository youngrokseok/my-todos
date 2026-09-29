<script lang="ts">
  import { todoStore } from '../stores/todoStore.svelte'
  import ConfirmDialog from './ConfirmDialog.svelte'
  import TodoListItem from './TodoListItem.svelte'
  import PlannerCalendar from './PlannerCalendar.svelte'
  import WeekNavigation from './WeekNavigation.svelte'

  interface Props {
    onSelectList?: () => void
    onSelectDate?: () => void
    onClose?: () => void
  }

  let { onSelectList, onSelectDate, onClose }: Props = $props()

  let pendingDeleteId = $state<string | null>(null)

  const pendingDeleteList = $derived(todoStore.lists.find((list) => list.id === pendingDeleteId) ?? null)
  const dayNav = $derived(
    todoStore.days.map((day) => ({
      date: day.date,
      isToday: day.isToday,
      count: day.occurrences.filter((occurrence) => !occurrence.completed).length,
    })),
  )

  function handleSelectDate(date: string) {
    todoStore.selectDate(date)
    onSelectDate?.()
  }

  function handleSelect(id: string) {
    if (todoStore.selectedListId === id) {
      todoStore.selectWeek()
    } else {
      todoStore.selectList(id)
    }
    onSelectList?.()
  }
</script>

<div class="flex h-full flex-col">
  <header class="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-5">
    <div>
      <h1 class="text-xs font-semibold uppercase tracking-wider text-indigo-600">My Todos</h1>
      <p class="mt-1 text-sm text-slate-500">7-day planner</p>
    </div>
    {#if onClose}
      <button
        type="button"
        class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        aria-label="Close planner"
        title="Close"
        onclick={onClose}
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    {/if}
  </header>

  <div class="flex min-h-0 flex-1 flex-col overflow-y-auto p-3">
    <WeekNavigation days={dayNav} selectedDate={todoStore.selectedDate} onSelectDate={handleSelectDate} />
    <PlannerCalendar dates={dayNav.map((day) => day.date)} selectedDate={todoStore.selectedDate} onSelectDate={handleSelectDate} />

    {#if todoStore.lists.length > 0}
      <h2 class="mt-6 border-t border-slate-200 px-2 pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Categories
      </h2>
      <ul class="space-y-1">
        {#each todoStore.lists as list (list.id)}
          <TodoListItem
            {list}
            count={todoStore.countForList(list.id)}
            selected={list.id === todoStore.selectedListId}
            onSelect={() => handleSelect(list.id)}
            onRename={(name) => todoStore.renameList(list.id, name)}
            onDelete={() => {
              pendingDeleteId = list.id
            }}
            onToggleImportant={() => todoStore.toggleListImportant(list.id)}
          />
        {/each}
      </ul>
    {/if}
  </div>
</div>

<ConfirmDialog
  open={pendingDeleteList !== null}
  title="Remove category?"
  message={pendingDeleteList
    ? `“${pendingDeleteList.name}” will be removed. Its todos stay in the planner, without a category.`
    : ''}
  confirmLabel="Remove category"
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
