import { loadJson, saveJson } from '../services/storage'
import { de } from './de'
import { en } from './en'
import type { Locale, Messages } from './types'

const dictionaries: Record<Locale, Messages> = { en, de }

function storedLocale(): Locale {
  const value = loadJson<unknown>('locale')
  return value === 'de' || value === 'en' ? value : 'en'
}

export const i18n = $state({ locale: storedLocale() })

export function messages(): Messages {
  return dictionaries[i18n.locale]
}

export function setLocale(next: Locale) {
  i18n.locale = next
  saveJson('locale', next)
  applyDocument(dictionaries[next])
}

function applyDocument(copy: Messages) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = copy.locale
  document.title = copy.appName
}

applyDocument(dictionaries[i18n.locale])
