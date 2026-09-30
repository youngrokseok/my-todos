<script lang="ts">
  import { tick } from 'svelte'
  import { messages } from '../i18n/locale.svelte'

  interface Props {
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    onConfirm: () => void
    onCancel: () => void
  }

  let {
    open,
    title,
    message,
    confirmLabel,
    onConfirm,
    onCancel,
  }: Props = $props()

  const copy = $derived(messages())
  const confirmText = $derived(confirmLabel ?? copy.delete)

  let confirmButton = $state<HTMLButtonElement | null>(null)

  $effect(() => {
    if (!open) {
      return
    }

    tick().then(() => confirmButton?.focus())
  })

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onCancel()
    }
  }
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <button
      type="button"
      class="absolute inset-0 bg-slate-900/40"
      aria-label={copy.dismissDialog}
      onclick={onCancel}
    ></button>
    <div
      class="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      tabindex="-1"
      onkeydown={handleKeydown}
    >
      <h2 id="confirm-title" class="text-lg font-semibold text-slate-900">
        {title}
      </h2>
      <p id="confirm-message" class="mt-2 text-sm text-slate-600">
        {message}
      </p>
      <div class="mt-5 flex justify-end gap-2">
        <button
          type="button"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onclick={onCancel}
        >
          {copy.cancel}
        </button>
        <button
          type="button"
          class="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          bind:this={confirmButton}
          onclick={onConfirm}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}
