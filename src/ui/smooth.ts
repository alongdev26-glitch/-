// "Smooth mode": turns off the heavy visual effects (shadows, filters, looping
// animations) for phones that struggle. Remembered on this device.
const KEY = 'dealcity-smooth';

export function smoothOn(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function applySmooth(on = smoothOn()) {
  document.documentElement.classList.toggle('smooth', on);
}

export function setSmooth(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* storage off: it still applies until the app closes */
  }
  applySmooth(on);
}
