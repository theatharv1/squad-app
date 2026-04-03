import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const androidRes = join(process.cwd(), "android/app/src/main/res");

// Android adaptive icon requires foreground + background layers
// We'll create XML vector drawables

const sizes = [
  { folder: "mipmap-mdpi", size: 48 },
  { folder: "mipmap-hdpi", size: 72 },
  { folder: "mipmap-xhdpi", size: 96 },
  { folder: "mipmap-xxhdpi", size: 144 },
  { folder: "mipmap-xxxhdpi", size: 192 },
];

function createLauncherIcon(size) {
  // Simple PNG-like icon using SVG (will be recognized by Android)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A0A0F"/>
      <stop offset="100%" stop-color="#1A1A2E"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF8C29"/>
      <stop offset="100%" stop-color="#FF6B00"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <text x="${size/2}" y="${size*0.55}" font-family="sans-serif" font-size="${size*0.35}" font-weight="900" fill="url(#accent)" text-anchor="middle" dominant-baseline="middle">SQ</text>
  <text x="${size/2}" y="${size*0.78}" font-family="sans-serif" font-size="${size*0.1}" font-weight="600" fill="white" text-anchor="middle" opacity="0.8">SQUAD</text>
</svg>`;
}

// Write ic_launcher_foreground as a vector drawable
const foregroundXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#FF8C29"
        android:pathData="M34,48 L34,42 Q34,36 40,36 L42,36 Q46,36 48,38 L50,40 Q52,36 56,36 L58,36 Q64,36 64,42 L64,48 Q64,54 58,58 L54,60 Q52,62 50,64 L48,62 Q46,60 44,58 L40,56 Q34,54 34,48Z"
        android:strokeWidth="0"/>
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M30,72 L30,72"
        android:strokeWidth="0"/>
</vector>`;

// Create drawable-v24 for adaptive icons
const adaptiveIconXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/colorPrimaryDark"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;

// Write SVG icons as png placeholders (Android will use adaptive icons)
for (const { folder, size } of sizes) {
  const dir = join(androidRes, folder);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  // Write SVG as a reference — actual build uses vector drawable
}

// Create the adaptive icon XML
const drawableDir = join(androidRes, "mipmap-anydpi-v26");
if (!existsSync(drawableDir)) mkdirSync(drawableDir, { recursive: true });

writeFileSync(join(drawableDir, "ic_launcher.xml"), adaptiveIconXml);
writeFileSync(join(drawableDir, "ic_launcher_round.xml"), adaptiveIconXml);

console.log("✅ Android adaptive icon XMLs generated");

// Generate splash screen drawable
const splashXml = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/colorPrimaryDark"/>
</layer-list>`;

writeFileSync(join(androidRes, "drawable", "splash.xml"), splashXml);
console.log("✅ Splash screen drawable generated");

// iOS AppIcon — create Contents.json for the asset catalog
const iosIconDir = join(process.cwd(), "ios/App/App/Assets.xcassets/AppIcon.appiconset");
if (existsSync(iosIconDir)) {
  const contentsJson = {
    images: [
      { idiom: "iphone", scale: "2x", size: "20x20" },
      { idiom: "iphone", scale: "3x", size: "20x20" },
      { idiom: "iphone", scale: "2x", size: "29x29" },
      { idiom: "iphone", scale: "3x", size: "29x29" },
      { idiom: "iphone", scale: "2x", size: "40x40" },
      { idiom: "iphone", scale: "3x", size: "40x40" },
      { idiom: "iphone", scale: "2x", size: "60x60" },
      { idiom: "iphone", scale: "3x", size: "60x60" },
      { idiom: "ipad", scale: "1x", size: "20x20" },
      { idiom: "ipad", scale: "2x", size: "20x20" },
      { idiom: "ipad", scale: "1x", size: "29x29" },
      { idiom: "ipad", scale: "2x", size: "29x29" },
      { idiom: "ipad", scale: "1x", size: "40x40" },
      { idiom: "ipad", scale: "2x", size: "40x40" },
      { idiom: "ipad", scale: "1x", size: "76x76" },
      { idiom: "ipad", scale: "2x", size: "76x76" },
      { idiom: "ipad", scale: "2x", size: "83.5x83.5" },
      { idiom: "ios-marketing", scale: "1x", size: "1024x1024" }
    ],
    info: { author: "xcode", version: 1 }
  };
  writeFileSync(join(iosIconDir, "Contents.json"), JSON.stringify(contentsJson, null, 2));
  console.log("✅ iOS AppIcon Contents.json generated");
}
