<script lang="ts">
  import { de } from '../i18n/de'
  import { en } from '../i18n/en'
  import { i18n, messages, setLocale } from '../i18n/locale.svelte'
  import type { Locale } from '../i18n/types'

  const copy = $derived(messages())
  const options: { locale: Locale; label: string; name: string }[] = [
    { locale: 'en', label: 'EN', name: en.languageName },
    { locale: 'de', label: 'DE', name: de.languageName },
  ]
</script>

<div class="mt-3 inline-flex rounded-lg bg-slate-100 p-0.5" role="group" aria-label={copy.language}>
  {#each options as option (option.locale)}
    <button
      type="button"
      class="rounded-md px-2 py-0.5 text-xs font-medium {i18n.locale === option.locale
        ? 'bg-white text-indigo-700'
        : 'text-slate-500 hover:text-slate-800'}"
      aria-pressed={i18n.locale === option.locale}
      aria-label={option.name}
      onclick={() => setLocale(option.locale)}
    >
      {option.label}
    </button>
  {/each}
</div>
