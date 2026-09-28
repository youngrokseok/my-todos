<script lang="ts">
  import TodoListSidebar from './components/TodoListSidebar.svelte'
  import TodoListView from './components/TodoListView.svelte'
  import { todoStore } from './stores/todoStore.svelte'

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
    class="fixed inset-0 z-40 w-full shrink-0 border-r border-slate-200 bg-white transition-transform duration-200 md:static md:inset-auto md:w-96 md:translate-x-0 {sidebarOpen
      ? 'translate-x-0'
      : '-translate-x-full'}"
    aria-label="Todo lists sidebar"
  >
    <TodoListSidebar onSelectList={closeSidebar} onClose={closeSidebar} />
  </aside>

  <main class="min-w-0 flex-1 bg-white">
    {#if todoStore.selectedList}
      <TodoListView list={todoStore.selectedList} onOpenLists={openSidebar} />
    {:else}
      <div class="flex h-full flex-col items-center justify-center px-6 text-center">
        <button
          type="button"
          class="mb-6 rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Open todo lists"
          onclick={openSidebar}
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 class="text-2xl font-semibold text-slate-900">Create your first list</h2>
        <p class="mt-2 max-w-sm text-sm text-slate-500">
          Todo lists keep related tasks together. Add a list such as Personal or Work, then start adding todos.
        </p>
        <button
          type="button"
          class="mt-6 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 md:hidden"
          onclick={openSidebar}
        >
          New List
        </button>
      </div>
    {/if}
  </main>
</div>
