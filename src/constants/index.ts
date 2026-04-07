export const CITIES = ["Bhopal", "Indore", "Pune", "Bangalore", "Jaipur", "Mumbai", "Delhi", "Hyderabad", "Surat", "Nagpur"];

export const CATEGORIES = [
  { id: "football", label: "Football", icon: "football" },
  { id: "badminton", label: "Badminton", icon: "racket" },
  { id: "cricket", label: "Cricket", icon: "cricket" },
  { id: "basketball", label: "Basketball", icon: "basketball" },
  { id: "tennis", label: "Tennis", icon: "tennis" },
  { id: "travel", label: "Travel", icon: "compass" },
  { id: "party", label: "Party", icon: "music" },
  { id: "running", label: "Running", icon: "run" },
  { id: "cycling", label: "Cycling", icon: "bike" },
  { id: "hiking", label: "Hiking", icon: "mountain" },
  { id: "gaming", label: "Gaming", icon: "gamepad" },
];

// In native app (Capacitor), there's no Vite proxy — use full backend URL
// For dev: empty string (Vite proxy handles /api)
// For production native: set VITE_API_URL to your deployed backend
const isNative = typeof (window as any)?.Capacitor !== "undefined";
export const API_URL = import.meta.env.VITE_API_URL || (isNative ? "https://server-lilac-nu.vercel.app" : "");
