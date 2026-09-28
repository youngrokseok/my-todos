<script lang="ts">
  interface Props {
    onAdd: (text: string) => boolean
  }

  let { onAdd }: Props = $props()

  let text = $state('')
  let inputEl = $state<HTMLInputElement | null>(null)

  function submit() {
    if (onAdd(text)) {
      text = ''
      inputEl?.focus()
    }
  }

  function handleSubmit(event: Event) {
    event.preventDefault()
    submit()
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault()
      submit()
    }
  }
</script>

<form class="flex gap-2" onsubmit={handleSubmit}>
  <label class="sr-only" for="new-todo">Add a todo</label>
  <input
    id="new-todo"
    bind:this={inputEl}
    bind:value={text}
    class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
    placeholder="Add a todo..."
    autocomplete="off"
    onkeydown={handleKeydown}
  />
  <button
    type="submit"
    class="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300"
    disabled={!text.trim()}
  >
    Add
  </button>
</form>
