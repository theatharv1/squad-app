export const CITIES = ["Bhopal", "Indore", "Pune", "Bangalore", "Jaipur", "Mumbai", "Delhi", "Hyderabad", "Surat", "Nagpur"];

export const CATEGORIES = [
  { id: "football", label: "Football", emoji: "⚽" },
  { id: "badminton", label: "Badminton", emoji: "🏸" },
  { id: "cricket", label: "Cricket", emoji: "🏏" },
  { id: "basketball", label: "Basketball", emoji: "🏀" },
  { id: "tennis", label: "Tennis", emoji: "🎾" },
  { id: "travel", label: "Travel", emoji: "🗺" },
  { id: "party", label: "Party", emoji: "🎉" },
  { id: "running", label: "Running", emoji: "🏃" },
  { id: "cycling", label: "Cycling", emoji: "🚴" },
  { id: "hiking", label: "Hiking", emoji: "⛰" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
];

// In native app (Capacitor), there's no Vite proxy — use full backend URL
// For dev: empty string (Vite proxy handles /api)
// For production native: set VITE_API_URL to your deployed backend
const isNative = typeof (window as any)?.Capacitor !== "undefined";
export const API_URL = import.meta.env.VITE_API_URL || (isNative ? "https://your-backend.railway.app" : "");
