<script lang="ts">
  import DayView from './components/DayView.svelte'
  import TodoListSidebar from './components/TodoListSidebar.svelte'
  import { messages } from './i18n/locale.svelte'

  const copy = $derived(messages())

  let sidebarOpen = $state(false)

  function closeSidebar() {
    sidebarOpen = false
  }

  function openSidebar() {
    sidebarOpen = true
  }
</script>

<div class="flex h-dvh overflow-hidden bg-slate-100 text-slate-900">
  <aside
    class="fixed inset-0 z-40 w-full shrink-0 border-r border-slate-200 bg-white transition-transform duration-200 md:static md:inset-auto md:w-80 md:translate-x-0 {sidebarOpen
      ? 'translate-x-0'
      : '-translate-x-full'}"
    aria-label={copy.planner}
  >
    <TodoListSidebar onSelectList={closeSidebar} onSelectDate={closeSidebar} onClose={closeSidebar} />
  </aside>

  <main class="min-w-0 flex-1 bg-white">
    <DayView onOpenLists={openSidebar} />
  </main>
</div>
