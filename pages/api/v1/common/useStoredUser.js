import { useMemo, useSyncExternalStore } from "react";
import {
  subscribeStoredUser,
  getStoredUserSnapshot,
  getStoredUserServerSnapshot,
} from "./localStorage.js";

// Returns undefined while unknown (server/hydration), null if no user, or the user object.
export function useStoredUser() {
  const raw = useSyncExternalStore(
    subscribeStoredUser,
    getStoredUserSnapshot,
    getStoredUserServerSnapshot,
  );

  return useMemo(() => {
    if (!raw) return raw; // undefined or null
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [raw]);
}
