const STORAGE_KEY = "caduceus:user";

const listeners = new Set();

export function subscribeStoredUser(callback) {
  listeners.add(callback);
  window.addEventListener("storage", callback); // changes from other tabs
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

export function getStoredUserSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY); // string | null
}

export function getStoredUserServerSnapshot() {
  return undefined; // "unknown yet" on the server and during hydration
}

export function setStoredUser(user) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  listeners.forEach((l) => l()); // the "storage" event doesn't fire in the same tab
}

export function clearStoredUser() {
  window.localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((l) => l());
}
