const STORAGE_PREFIX = 'svelte-todos:'

function canUseLocalStorage(): boolean {
  return typeof localStorage !== 'undefined'
}

export function loadJson<T>(key: string): T | null {
  if (!canUseLocalStorage()) {
    return null
  }

  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (!raw) {
      return null
    }

    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function saveJson<T>(key: string, value: T): void {
  if (!canUseLocalStorage()) {
    return
  }

  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  } catch {
    // Ignore quota / private-mode failures; the in-memory state still works.
  }
}
