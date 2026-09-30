<script lang="ts">
  import { messages } from '../i18n/locale.svelte'
  import { WEEKDAYS } from '../utils/recurrence'
  import { formatLongDate, formatMonth, getLocalDateString, parseLocalDate } from '../utils/date'

  interface Props {
    dates: string[]
    selectedDate: string
    onSelectDate: (date: string) => void
  }

  let { dates, selectedDate, onSelectDate }: Props = $props()

  const copy = $derived(messages())
  const weekdayHeads = $derived(WEEKDAYS.map((day) => copy.weekdayShort[day]))
  const today = getLocalDateString()

  let viewYear = $state(new Date().getFullYear())
  let viewMonth = $state(new Date().getMonth())

  const plannerDays = $derived(new Set(dates))
  const monthLabel = $derived(formatMonth(viewYear, viewMonth, copy.dateLocale))
  const cells = $derived.by(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const offset = (first.getDay() + 6) % 7
    const start = new Date(viewYear, viewMonth, 1 - offset)
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      const value = getLocalDateString(date)
      return {
        value,
        day: date.getDate(),
        inMonth: date.getMonth() === viewMonth,
        inPlanner: plannerDays.has(value),
      }
    })
  })

  $effect(() => {
    const date = parseLocalDate(selectedDate)
    if (!date) return
    viewYear = date.getFullYear()
    viewMonth = date.getMonth()
  })

  function shiftMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1)
    viewYear = next.getFullYear()
    viewMonth = next.getMonth()
  }
</script>

<nav class="mt-4 border-t border-slate-200 px-1 pt-4" aria-label={copy.calendar}>
  <div class="mb-2 flex items-center justify-between gap-2">
    <button
      type="button"
      class="rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
      aria-label={copy.previousMonth}
      onclick={() => shiftMonth(-1)}
    >
      ‹
    </button>
    <p class="text-sm font-medium text-slate-800">{monthLabel}</p>
    <button
      type="button"
      class="rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
      aria-label={copy.nextMonth}
      onclick={() => shiftMonth(1)}
    >
      ›
    </button>
  </div>
  <div class="grid grid-cols-7 gap-1">
    {#each weekdayHeads as head (head)}
      <div class="flex h-7 items-center justify-center text-[11px] font-semibold text-slate-400">{head}</div>
    {/each}
    {#each cells as cell (cell.value)}
      <div class="min-w-0">
        {#if cell.inPlanner}
          {@const selected = cell.value === selectedDate}
          <button
            type="button"
            class="flex h-8 w-full min-w-0 items-center justify-center rounded-lg px-0 text-xs {selected
              ? 'bg-indigo-600 font-medium text-white hover:bg-indigo-700'
              : cell.inMonth
                ? 'bg-indigo-100 font-medium text-indigo-800 hover:bg-indigo-200'
                : 'bg-indigo-50 font-medium text-indigo-700 hover:bg-indigo-100'} {cell.value === today && !selected
              ? 'ring-1 ring-inset ring-indigo-400'
              : ''}"
            aria-current={selected ? 'date' : undefined}
            aria-label={formatLongDate(cell.value, copy.dateLocale)}
            onclick={() => onSelectDate(cell.value)}
          >
            {cell.day}
          </button>
        {:else}
          <span class="flex h-8 w-full items-center justify-center text-xs {cell.inMonth ? 'text-slate-300' : 'text-slate-200'}">
            {cell.day}
          </span>
        {/if}
      </div>
    {/each}
  </div>
</nav>
