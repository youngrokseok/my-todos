<script lang="ts">
  interface Props {
    id: string
    label: string
    value?: string
    onChange: (value: string | undefined) => void
  }

  let { id, label, value, onChange }: Props = $props()

  const quarterHours = Array.from({ length: 24 * 4 }, (_, index) => {
    const hour = Math.floor(index / 4)
    const minute = (index % 4) * 15
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  })

  let open = $state(false)
  let root = $state<HTMLDivElement | null>(null)

  const options = $derived(value && !quarterHours.includes(value) ? [...quarterHours, value].sort() : quarterHours)

  function choose(next: string) {
    onChange(next || undefined)
    open = false
  }

  function toggle(event: MouseEvent) {
    event.stopPropagation()
    open = !open
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
  <label for="{id}-button" class="text-xs font-medium text-slate-600 md:hidden">{label}</label>
  <label for={id} class="hidden text-xs font-medium text-slate-600 md:inline">{label}</label>
  <div class="relative mt-1 md:hidden">
    <button
      id="{id}-button"
      type="button"
      class="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-sm hover:bg-slate-50 {value
        ? 'text-slate-900'
        : 'text-slate-400'}"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls="{id}-list"
      onclick={toggle}
    >
      <span>{value || 'None'}</span>
      <svg class="h-4 w-4 shrink-0 text-slate-500" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
        <path d="M5 8l5 5 5-5" />
      </svg>
    </button>
    {#if open}
      <ul
        id="{id}-list"
        class="mt-1 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm"
        role="listbox"
        aria-label={label}
      >
        <li>
          <button
            type="button"
            class="block w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 {!value
              ? 'bg-indigo-50 font-medium text-indigo-800'
              : 'text-slate-800'}"
            role="option"
            aria-selected={!value}
            onclick={() => choose('')}
          >
            None
          </button>
        </li>
        {#each options as option (option)}
          <li>
            <button
              type="button"
              class="block w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 {value === option
                ? 'bg-indigo-50 font-medium text-indigo-800'
                : 'text-slate-800'}"
              role="option"
              aria-selected={value === option}
              onclick={() => choose(option)}
            >
              {option}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
  <select
    {id}
    class="mt-1 hidden w-full min-w-0 appearance-none rounded-xl border border-slate-300 bg-white bg-[length:1rem_1rem] bg-[position:right_0.75rem_center] bg-no-repeat px-3 py-2 pr-10 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 md:block"
    style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%2364748b' stroke-width='1.8'%3E%3Cpath d='M5 8l5 5 5-5'/%3E%3C/svg%3E&quot;)"
    value={value ?? ''}
    onchange={(event) => onChange(event.currentTarget.value || undefined)}
  >
    <option value="">None</option>
    {#each options as option (option)}
      <option value={option}>{option}</option>
    {/each}
  </select>
</div>
