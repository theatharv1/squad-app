import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Capacitor native bridge
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Keyboard } from "@capacitor/keyboard";
import { SplashScreen } from "@capacitor/splash-screen";

async function initNative() {
  if (Capacitor.isNativePlatform()) {
    // Dark status bar for our dark theme
    try {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: "#0A0A0F" });
    } catch {}

    // Keyboard settings
    try {
      await Keyboard.setAccessoryBarVisible({ isVisible: true });
      await Keyboard.setScroll({ isDisabled: false });
    } catch {}

    // Hide splash after app renders
    try {
      await SplashScreen.hide({ fadeOutDuration: 500 });
    } catch {}

    console.log("🚀 Running as native app on", Capacitor.getPlatform());
  } else {
    console.log("🌐 Running as web app");
  }
}

createRoot(document.getElementById("root")!).render(<App />);
initNative();
