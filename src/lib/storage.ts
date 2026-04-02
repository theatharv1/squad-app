const STORAGE_KEYS = {
  JOINED_POOLS: "squad_joined_pools",
  FOLLOWING: "squad_following",
  CITY: "squad_city",
  ONBOARDED: "squad_onboarded",
  CREATED_POOLS: "squad_created_pools",
  PROFILE: "squad_profile",
  SETTINGS: "squad_settings",
  NOTIFICATIONS_READ: "squad_notifications_read",
} as const;

export function getJoinedPools(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.JOINED_POOLS) || "[]"); } catch { return []; }
}

export function toggleJoinPool(poolId: string): boolean {
  const pools = getJoinedPools();
  const idx = pools.indexOf(poolId);
  if (idx >= 0) { pools.splice(idx, 1); } else { pools.push(poolId); }
  localStorage.setItem(STORAGE_KEYS.JOINED_POOLS, JSON.stringify(pools));
  return idx < 0;
}

export function getFollowing(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWING) || '["u1","u2","u5","u12"]'); } catch { return []; }
}

export function toggleFollow(userId: string): boolean {
  const following = getFollowing();
  const idx = following.indexOf(userId);
  if (idx >= 0) { following.splice(idx, 1); } else { following.push(userId); }
  localStorage.setItem(STORAGE_KEYS.FOLLOWING, JSON.stringify(following));
  return idx < 0;
}

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

export function getCreatedPools(): any[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.CREATED_POOLS) || "[]"); } catch { return []; }
}

export function addCreatedPool(pool: any) {
  const pools = getCreatedPools();
  pools.unshift(pool);
  localStorage.setItem(STORAGE_KEYS.CREATED_POOLS, JSON.stringify(pools));
}

export function getProfile(): Record<string, any> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE) || "{}"); } catch { return {}; }
}

export function saveProfile(data: Record<string, any>) {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data));
}

export function getSettings(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{"notifications":true,"sound":true,"darkMode":true}'); } catch { return {}; }
}

export function saveSetting(key: string, value: boolean) {
  const settings = getSettings();
  settings[key] = value;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function getReadNotifications(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_READ) || "[]"); } catch { return []; }
}

export function markNotificationRead(id: string) {
  const read = getReadNotifications();
  if (!read.includes(id)) { read.push(id); }
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_READ, JSON.stringify(read));
}

export function markAllNotificationsRead() {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_READ, JSON.stringify(
    Array.from({ length: 20 }, (_, i) => `n${i + 1}`)
  ));
}
