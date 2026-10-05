// The player's own name on this device (asked once, changeable in Settings).
const KEY = 'bigdeal-name';

export function getName(): string {
  try {
    return localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

export function setName(name: string) {
  try {
    localStorage.setItem(KEY, name.trim().slice(0, 12));
  } catch {
    /* storage off */
  }
}
