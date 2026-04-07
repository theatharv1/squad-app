// Local preferences only — all user data now comes from the API

const STORAGE_KEYS = {
  CITY: "squad_city",
  HOME_CITY: "squad_home_city",
  TRAVELER: "squad_traveler",
  ONBOARDED: "squad_onboarded",
  SETTINGS: "squad_settings",
} as const;

export function getCity(): string {
  return localStorage.getItem(STORAGE_KEYS.CITY) || "Bhopal";
}

export function setCity(city: string) {
  localStorage.setItem(STORAGE_KEYS.CITY, city);
}

// ─── Traveler mode (visiting another city) ─────────────────────────────
// Hinge "Travel Mode" + Bumble Travel pattern: when a user is visiting a
// new city, surface a curated welcome rail and pre-pin them to that city
// so locals can spot them in the feed. Resets when they switch back home.
export function getHomeCity(): string {
  return localStorage.getItem(STORAGE_KEYS.HOME_CITY) || getCity();
}

export function setHomeCity(city: string) {
  localStorage.setItem(STORAGE_KEYS.HOME_CITY, city);
}

export function isTraveler(): boolean {
  return localStorage.getItem(STORAGE_KEYS.TRAVELER) === "true";
}

export function setTraveler(active: boolean) {
  if (active) localStorage.setItem(STORAGE_KEYS.TRAVELER, "true");
  else localStorage.removeItem(STORAGE_KEYS.TRAVELER);
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
