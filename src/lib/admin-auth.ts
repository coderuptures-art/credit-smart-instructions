// Demo-only access gate. A hardcoded frontend password is NOT secure
// authentication; it is a visual gate for the prototype. Do not store the
// entered password — only a session flag that clears when the tab closes.
const KEY = "ss_admin_unlocked";

export function isUnlocked(): boolean {
  try {
    return typeof window !== "undefined" && window.sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function unlock(): void {
  try {
    window.sessionStorage.setItem(KEY, "1");
  } catch {
    // sessionStorage unavailable; gate simply re-locks on reload.
  }
}

export function lock(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export const ADMIN_PASSWORD = "ADMIN-ONLY";
