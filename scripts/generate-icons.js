// Generate app icons as SVG files for Capacitor
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const sizes = {
  android: [
    { name: "mipmap-mdpi", size: 48 },
    { name: "mipmap-hdpi", size: 72 },
    { name: "mipmap-xhdpi", size: 96 },
    { name: "mipmap-xxhdpi", size: 144 },
    { name: "mipmap-xxxhdpi", size: 192 },
  ],
  ios: [
    { name: "AppIcon-20x20@1x", size: 20 },
    { name: "AppIcon-20x20@2x", size: 40 },
    { name: "AppIcon-20x20@3x", size: 60 },
    { name: "AppIcon-29x29@1x", size: 29 },
    { name: "AppIcon-29x29@2x", size: 58 },
    { name: "AppIcon-29x29@3x", size: 87 },
    { name: "AppIcon-40x40@1x", size: 40 },
    { name: "AppIcon-40x40@2x", size: 80 },
    { name: "AppIcon-40x40@3x", size: 120 },
    { name: "AppIcon-60x60@2x", size: 120 },
    { name: "AppIcon-60x60@3x", size: 180 },
    { name: "AppIcon-76x76@1x", size: 76 },
    { name: "AppIcon-76x76@2x", size: 152 },
    { name: "AppIcon-83.5x83.5@2x", size: 167 },
    { name: "AppIcon-1024x1024@1x", size: 1024 },
  ],
  web: [
    { name: "icon-72x72", size: 72 },
    { name: "icon-96x96", size: 96 },
    { name: "icon-128x128", size: 128 },
    { name: "icon-144x144", size: 144 },
    { name: "icon-152x152", size: 152 },
    { name: "icon-192x192", size: 192 },
    { name: "icon-384x384", size: 384 },
    { name: "icon-512x512", size: 512 },
  ],
};

function generateSVGIcon(size) {
  const fontSize = Math.round(size * 0.22);
  const subFontSize = Math.round(size * 0.07);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

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
    <filter id="glow">
      <feGaussianBlur stdDeviation="${size * 0.03}" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#bg)"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#accent)" stroke-width="${size * 0.015}" opacity="0.3"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.7}" fill="none" stroke="url(#accent)" stroke-width="${size * 0.01}" opacity="0.15"/>
  <text x="${cx}" y="${cy + fontSize * 0.1}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="900" fill="url(#accent)" text-anchor="middle" dominant-baseline="middle" filter="url(#glow)" letter-spacing="${size * 0.01}">SQ</text>
  <text x="${cx}" y="${cy + fontSize * 0.8}" font-family="system-ui, -apple-system, sans-serif" font-size="${subFontSize}" font-weight="600" fill="#FFFFFF" text-anchor="middle" opacity="0.7" letter-spacing="${size * 0.02}">SQUAD</text>
</svg>`;
}

// Generate web icons
const webDir = join(process.cwd(), "public", "icons");
if (!existsSync(webDir)) mkdirSync(webDir, { recursive: true });

for (const icon of sizes.web) {
  writeFileSync(join(webDir, `${icon.name}.svg`), generateSVGIcon(icon.size));
}

// Generate a simple square icon for favicon
const faviconSvg = generateSVGIcon(32);
writeFileSync(join(process.cwd(), "public", "favicon.svg"), faviconSvg);

console.log("✅ Icons generated in public/icons/");
console.log("📱 Android/iOS icons will be generated during cap sync");
