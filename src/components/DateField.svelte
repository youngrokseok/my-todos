<script lang="ts">
  import { formatLongDate, getLocalDateString, parseLocalDate } from '../utils/date'

  interface Props {
    id: string
    label: string
    value: string
    clearable?: boolean
    placeholder?: string
    onChange: (value: string | undefined) => void
  }

  let { id, label, value, clearable = false, placeholder = 'Choose a date', onChange }: Props = $props()

  const weekdayHeads = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  let open = $state(false)
  let root = $state<HTMLDivElement | null>(null)
  let viewYear = $state(new Date().getFullYear())
  let viewMonth = $state(new Date().getMonth())

  const today = getLocalDateString()
  const display = $derived.by(() => {
    const date = parseLocalDate(value)
    if (!date) return ''
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  })
  const monthLabel = $derived(
    new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
  )
  const days = $derived.by(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const offset = (first.getDay() + 6) % 7
    const start = new Date(viewYear, viewMonth, 1 - offset)
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return {
        value: getLocalDateString(date),
        day: date.getDate(),
        inMonth: date.getMonth() === viewMonth,
      }
    })
  })

  function toggle(event: MouseEvent) {
    event.stopPropagation()
    if (open) {
      open = false
      return
    }
    const base = parseLocalDate(value) ?? new Date()
    viewYear = base.getFullYear()
    viewMonth = base.getMonth()
    open = true
  }

  function shiftMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1)
    viewYear = next.getFullYear()
    viewMonth = next.getMonth()
  }

  function choose(date: string) {
    onChange(date)
    open = false
  }
</script>

<svelte:window
  onclick={(event) => {
    if (!open) return
    const target = event.target
    if (target instanceof Node && root?.contains(target)) return
    open = false
  }}
  onkeydown={(event) => {
    if (open && event.key === 'Escape') open = false
  }}
/>

<div bind:this={root}>
  <label for={id} class="text-xs font-medium text-slate-600">{label}</label>
  <div class="mt-1 flex gap-2">
    <div class="min-w-0 flex-1">
      <button
        {id}
        type="button"
        class="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-sm hover:bg-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 {display
          ? 'text-slate-900'
          : 'text-slate-400'}"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="{id}-menu"
        onclick={toggle}
      >
        <span>{display || placeholder}</span>
        <svg class="h-4 w-4 shrink-0 text-slate-500" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>
      {#if open}
        <div id="{id}-menu" class="mt-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm" role="dialog" aria-label={label}>
          <div class="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              class="rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
              aria-label="Previous month"
              onclick={() => shiftMonth(-1)}
            >
              ‹
            </button>
            <p class="text-sm font-medium text-slate-800">{monthLabel}</p>
            <button
              type="button"
              class="rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
              aria-label="Next month"
              onclick={() => shiftMonth(1)}
            >
              ›
            </button>
          </div>
          <div class="grid grid-cols-7 gap-0.5 text-center text-[11px] font-medium text-slate-400">
            {#each weekdayHeads as head (head)}
              <span class="py-1">{head}</span>
            {/each}
          </div>
          <div class="grid grid-cols-7 gap-0.5">
            {#each days as day (`${viewYear}-${viewMonth}-${day.value}`)}
              <button
                type="button"
                class="rounded-lg py-1.5 text-xs {day.value === value
                  ? 'bg-indigo-600 font-medium text-white hover:bg-indigo-700'
                  : day.inMonth
                    ? 'text-slate-800 hover:bg-indigo-50'
                    : 'text-slate-300 hover:bg-slate-50'} {day.value === today && day.value !== value
                  ? 'ring-1 ring-indigo-200'
                  : ''}"
                aria-pressed={day.value === value}
                aria-label={formatLongDate(day.value)}
                onclick={() => choose(day.value)}
              >
                {day.day}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
    {#if clearable && value}
      <button
        type="button"
        class="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-white"
        onclick={() => {
          onChange(undefined)
          open = false
        }}
      >
        Clear
      </button>
    {/if}
  </div>
</div>
