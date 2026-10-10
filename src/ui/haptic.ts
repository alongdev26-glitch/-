/** Short vibrations on phones that support it (Android); iPhone and desktop ignore them. */
const KEY = 'dealcity-vibrate';

export function vibrateOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== '0';
  } catch {
    return true;
  }
}

export function setVibrate(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* private mode */
  }
  if (on) buzz(30);
}

export function buzz(pattern: number | number[]) {
  if (!vibrateOn()) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* not allowed here (e.g. inside an embedded page) */
  }
}
