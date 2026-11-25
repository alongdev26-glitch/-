// "3D board": the board tilts in perspective and the pieces stand up on it. Remembered on this device.
const KEY = 'dealcity-3d';
const subs = new Set<(on: boolean) => void>();

export function view3dOn(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setView3d(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* storage off: it still applies until the app closes */
  }
  subs.forEach((f) => f(on));
}

export function onView3dChange(f: (on: boolean) => void) {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
}
