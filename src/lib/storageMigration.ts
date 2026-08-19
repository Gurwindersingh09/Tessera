/**
 * One-time localStorage migration utility.
 * Runs on application startup to ensure existing user state, theme preferences,
 * alert histories, and case files from 'phishield-*' keys are seamlessly copied
 * over to 'tessera-*' keys without data loss.
 */
export function migrateLocalStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  const keyPairs: Array<[string, string]> = [
    ['phishield-store', 'tessera-store'],
    ['phishield-theme', 'tessera-theme'],
    ['phishield-alerts', 'tessera-alerts'],
  ];

  keyPairs.forEach(([oldKey, newKey]) => {
    try {
      const existingNew = localStorage.getItem(newKey);
      const legacyVal = localStorage.getItem(oldKey);

      if (!existingNew && legacyVal !== null) {
        localStorage.setItem(newKey, legacyVal);
      }
    } catch {
      // Ignore localStorage access restrictions
    }
  });

  // Dynamic prefix migration for any ad-hoc keys prefixed with phishield_ or phishield-
  try {
    const totalKeys = localStorage.length;
    for (let i = 0; i < totalKeys; i++) {
      const k = localStorage.key(i);
      if (!k) continue;

      if (k.startsWith('phishield_')) {
        const target = 'tessera_' + k.slice('phishield_'.length);
        if (localStorage.getItem(target) === null) {
          const val = localStorage.getItem(k);
          if (val !== null) localStorage.setItem(target, val);
        }
      } else if (k.startsWith('phishield-') && !keyPairs.some(([oldK]) => oldK === k)) {
        const target = 'tessera-' + k.slice('phishield-'.length);
        if (localStorage.getItem(target) === null) {
          const val = localStorage.getItem(k);
          if (val !== null) localStorage.setItem(target, val);
        }
      }
    }
  } catch {
    // Ignore storage iteration errors
  }
}
