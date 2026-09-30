<script lang="ts">
  import { messages } from '../i18n/locale.svelte'
  import type { TodoInput, TodoList, Weekday } from '../types/todo'
  import DateField from './DateField.svelte'
  import TimeField from './TimeField.svelte'
  import { getLocalDateString } from '../utils/date'
  import {
    WEEKDAYS,
    canSaveRecurrence,
    getWeekday,
    repeatChoiceFromRecurrence,
    sortWeekdays,
    type RepeatChoice,
  } from '../utils/recurrence'

  interface Props {
    idPrefix: string
    input: TodoInput
    lists?: TodoList[]
  }

  let { idPrefix, input = $bindable(), lists = [] }: Props = $props()

  const copy = $derived(messages())
  const repeatOptions = $derived<{ value: RepeatChoice; label: string }[]>([
    { value: 'none', label: copy.doesNotRepeat },
    { value: 'daily', label: copy.daily },
    { value: 'weekend', label: copy.weekend },
    { value: 'custom', label: copy.customDays },
  ])

  let choice = $state<RepeatChoice>(repeatChoiceFromRecurrence(input.recurrence))
  let customDays = $state<Weekday[]>(sortWeekdays(input.recurrence.days ?? []))
  let repeatOpen = $state(false)
  let repeatMenu = $state<HTMLDivElement | null>(null)

  const repeatLabel = $derived(repeatOptions.find((option) => option.value === choice)?.label ?? copy.doesNotRepeat)

  $effect(() => {
    const recurrence = input.recurrence
    choice = repeatChoiceFromRecurrence(recurrence)
    if (choice === 'custom') {
      customDays = sortWeekdays(recurrence.days ?? [])
    }
  })

  function setChoice(next: RepeatChoice) {
    choice = next
    if (next === 'none') {
      input.recurrence = { type: 'none' }
      return
    }
    if (next === 'daily') {
      input.recurrence = { type: 'daily' }
      return
    }
    if (next === 'weekend') {
      input.recurrence = { type: 'weekdays', days: ['saturday', 'sunday'] }
      return
    }

    const seed =
      input.recurrence.type === 'weekdays' && (input.recurrence.days?.length ?? 0) > 0
        ? input.recurrence.days!
        : [getWeekday(input.startDate || getLocalDateString())]
    customDays = sortWeekdays(seed)
    input.recurrence = { type: 'weekdays', days: customDays }
  }

  function toggleDay(day: Weekday) {
    const next = customDays.includes(day) ? customDays.filter((item) => item !== day) : [...customDays, day]
    customDays = sortWeekdays(next)
    input.recurrence = { type: 'weekdays', days: customDays }
  }

  const recurrenceHint = $derived(
    choice === 'daily'
      ? copy.everyDay
      : choice === 'weekend'
        ? copy.saturdayAndSunday
        : choice === 'custom' && !canSaveRecurrence(input.recurrence)
          ? copy.selectAtLeastOneDay
          : '',
  )

  const fieldClass =
    'mt-1 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
</script>

<svelte:window
  onclick={(event) => {
    if (!repeatOpen) return
    const target = event.target
    if (target instanceof Node && repeatMenu?.contains(target)) return
    repeatOpen = false
  }}
/>

<div class="mt-3 grid gap-3 sm:grid-cols-2">
  <TimeField
    id="{idPrefix}-start-time"
    label={copy.startTime}
    value={input.startTime}
    onChange={(value) => {
      input.startTime = value
    }}
  />
  <TimeField
    id="{idPrefix}-end-time"
    label={copy.endTime}
    value={input.endTime}
    onChange={(value) => {
      input.endTime = value
    }}
  />
</div>

<div class="mt-3 grid gap-3 sm:grid-cols-2">
  <DateField
    id="{idPrefix}-due"
    label={copy.due}
    value={input.dueDate ?? ''}
    clearable
    placeholder={copy.noDueDate}
    onChange={(value) => {
      input.dueDate = value
    }}
  />

  <div class="min-w-0">
    <label for="{idPrefix}-repeat-button" class="text-xs font-medium text-slate-600 md:hidden">{copy.repeat}</label>
    <label for="{idPrefix}-repeat" class="hidden text-xs font-medium text-slate-600 md:inline">{copy.repeat}</label>
    <div class="relative mt-1 md:hidden" bind:this={repeatMenu}>
      <button
        id="{idPrefix}-repeat-button"
        type="button"
        class="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-50"
        aria-haspopup="listbox"
        aria-expanded={repeatOpen}
        aria-controls="{idPrefix}-repeat-list"
        onclick={(event) => {
          event.stopPropagation()
          repeatOpen = !repeatOpen
        }}
      >
        <span>{repeatLabel}</span>
        <svg class="h-4 w-4 shrink-0 text-slate-500" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>
      {#if repeatOpen}
        <ul
          id="{idPrefix}-repeat-list"
          class="mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          role="listbox"
          aria-label={copy.repeat}
        >
          {#each repeatOptions as option (option.value)}
            <li>
              <button
                type="button"
                class="block w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 {choice === option.value
                  ? 'bg-indigo-50 font-medium text-indigo-800'
                  : 'text-slate-800'}"
                role="option"
                aria-selected={choice === option.value}
                onclick={() => {
                  setChoice(option.value)
                  repeatOpen = false
                }}
              >
                {option.label}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <select
      id="{idPrefix}-repeat"
      class="{fieldClass} hidden appearance-none bg-[length:1rem_1rem] bg-[position:right_0.75rem_center] bg-no-repeat pr-10 md:block"
      style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%2364748b' stroke-width='1.8'%3E%3Cpath d='M5 8l5 5 5-5'/%3E%3C/svg%3E&quot;)"
      value={choice}
      onchange={(event) => setChoice(event.currentTarget.value as RepeatChoice)}
    >
      {#each repeatOptions as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
    {#if choice === 'custom'}
      <div class="mt-2 flex flex-wrap gap-1" role="group" aria-label={copy.repeatDays}>
        {#each WEEKDAYS as day (day)}
          <button
            type="button"
            class="rounded-lg border px-2.5 py-1.5 text-xs font-medium {customDays.includes(day)
              ? 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}"
            aria-pressed={customDays.includes(day)}
            aria-label={copy.weekdayLong[day]}
            onclick={() => toggleDay(day)}
          >
            {copy.weekdayShort[day]}
          </button>
        {/each}
      </div>
    {/if}
    {#if recurrenceHint}
      <p class="mt-1 text-xs text-slate-500">{recurrenceHint}</p>
    {/if}
  </div>
</div>

{#if lists.length > 0}
  <div class="mt-3">
    <label for="{idPrefix}-category" class="text-xs font-medium text-slate-600">{copy.category}</label>
    <select
      id="{idPrefix}-category"
      class={fieldClass}
      value={input.listId ?? ''}
      onchange={(event) => {
        const value = event.currentTarget.value
        input.listId = value || undefined
      }}
    >
      <option value="">{copy.none}</option>
      {#each lists as list (list.id)}
        <option value={list.id}>{list.name}</option>
      {/each}
    </select>
  </div>
{/if}

<div class="mt-3 flex flex-wrap gap-2">
  <button
    type="button"
    class="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium {input.important
      ? 'border-amber-300 bg-amber-50 text-amber-500'
      : 'border-slate-300 bg-white text-slate-400 hover:bg-slate-100 hover:text-amber-500'}"
    aria-pressed={input.important}
    onclick={() => {
      input.important = !input.important
    }}
  >
    <svg class="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.2 14.7 8.7 20.8 9.6 16.4 14 17.4 20.1 12 17.2 6.6 20.1 7.6 14 3.2 9.6 9.3 8.7 12 3.2Z"
        fill={input.important ? 'currentColor' : 'none'}
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
      />
    </svg>
    {copy.important}
  </button>
  <button
    type="button"
    class="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium {input.urgent
      ? 'border-red-300 bg-red-50 text-red-600'
      : 'border-slate-300 bg-white text-slate-400 hover:bg-slate-100 hover:text-red-600'}"
    aria-pressed={input.urgent}
    onclick={() => {
      input.urgent = !input.urgent
    }}
  >
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5" />
      <path d="M12 16.5h.01" />
    </svg>
    {copy.urgent}
  </button>
</div>
