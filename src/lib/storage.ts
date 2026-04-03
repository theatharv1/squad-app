// Local preferences only — all user data now comes from the API

const STORAGE_KEYS = {
  CITY: "squad_city",
  ONBOARDED: "squad_onboarded",
  SETTINGS: "squad_settings",
} as const;

export function getCity(): string {
  return localStorage.getItem(STORAGE_KEYS.CITY) || "Bhopal";
}

export function setCity(city: string) {
  localStorage.setItem(STORAGE_KEYS.CITY, city);
}

export function isOnboarded(): boolean {
  return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === "true";
}

export function setOnboarded() {
  localStorage.setItem(STORAGE_KEYS.ONBOARDED, "true");
}

export function getSettings(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{"notifications":true,"sound":true,"darkMode":true}'); } catch { return { notifications: true, sound: true, darkMode: true }; }
}

export function saveSetting(key: string, value: boolean) {
  const settings = getSettings();
  settings[key] = value;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}
