<script lang="ts">
  import { formatDueDate, formatShortWeekdayDate, formatWeekday } from '../utils/date'

  interface DayNavItem {
    date: string
    isToday: boolean
    count: number
  }

  interface Props {
    days: DayNavItem[]
    selectedDate: string
    onSelectDate: (date: string) => void
  }

  let { days, selectedDate, onSelectDate }: Props = $props()
</script>

<nav aria-label="Days">
  <ul class="space-y-1">
    {#each days as day (day.date)}
      {@const selected = day.date === selectedDate}
      <li>
        <button
          type="button"
          class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left {selected
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'text-slate-800 hover:bg-slate-100'}"
          aria-current={selected ? 'date' : undefined}
          onclick={() => onSelectDate(day.date)}
        >
          <span class="min-w-0">
            <span
              class="block text-xs font-semibold uppercase tracking-wider {selected ? 'text-indigo-100' : 'text-slate-400'}"
            >
              {day.isToday ? 'Today' : formatWeekday(day.date)}
            </span>
            <span class="block truncate font-medium">
              {day.isToday ? formatShortWeekdayDate(day.date) : formatDueDate(day.date)}
            </span>
          </span>
          {#if day.count > 0}
            <span class="shrink-0 text-sm tabular-nums {selected ? 'text-indigo-100' : 'text-slate-500'}">
              {day.count}
            </span>
          {/if}
        </button>
      </li>
    {/each}
  </ul>
</nav>
