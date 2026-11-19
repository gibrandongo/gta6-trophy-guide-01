// Progress store: earned trophy ids kept in localStorage, with export and import.
export const STORE_KEY = 'leonida-platinum-atlas-v1';
export const SEED_IDS = [2, 3, 4, 5, 8, 15, 19, 21, 35, 42, 44, 53, 55];

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

export function exportEarned(earned) {
  const payload = { app: 'Leonida Platinum Atlas', game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b), exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImport(text, validIds) {
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(list)) throw new Error('No earned list found in that file.');
  const valid = new Set(validIds);
  return new Set(list.filter((n) => Number.isInteger(n) && valid.has(n)));
}
