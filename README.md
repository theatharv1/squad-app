# SQUAD — Your City. Your People. Tonight. 🚀

A city-based social platform for pooling real-world activities — sports, travel, parties, gaming, and more. Built to fight Gen Z loneliness by making it effortless to find your squad for tonight.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql) ![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF?logo=capacitor) ![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?logo=socketdotio)

---

## 📱 Download & Install

### Android (APK)
1. Go to [**Releases**](https://github.com/theatharv1/squad-app/releases) page
2. Download `SQUAD-v1.0.0-debug.apk`
3. Transfer to your Android phone (AirDrop, email, Google Drive, USB)
4. On your phone: **Settings > Security > Install from Unknown Sources > Allow**
5. Tap the APK > Install > Open SQUAD!

### iOS (via Xcode)
1. Clone this repo on your Mac
2. Install [Xcode](https://apps.apple.com/app/xcode/id497799835) from App Store
3. Run:
   ```bash
   npm install
   npm run build
   npx cap sync ios
   npx cap open ios
   ```
4. In Xcode: Select your iPhone as the device > Click **Run**
5. The app installs directly on your phone!

### Web (PWA — Any Device)
1. Visit the deployed URL in Chrome/Safari
2. Tap **"Add to Home Screen"** when prompted
3. SQUAD appears as a native app on your home screen!

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion |
| **Backend** | Express.js + TypeScript |
| **Database** | PostgreSQL (Neon) + Drizzle ORM |
| **Auth** | JWT (access + refresh tokens) + bcrypt |
| **Realtime** | Socket.io (chat, pool updates) |
| **Mobile** | Capacitor 8 (Android + iOS native wrapper) |
| **PWA** | Service Worker + Web Manifest |
| **State** | TanStack React Query v5 |

---

## Features

### Core
- Activity Pools — Create/join pools for sports, travel, parties, gaming, etc.
- Real-time Chat — Socket.io powered messaging with typing indicators
- Profiles — Avatar, bio, city, interests, badges, stats
- Notifications — Follow alerts, pool invites, join updates
- Leaderboard — Gamified ranking by activity level
- Venue Discovery — Find nearby venues with ratings and amenities
- Reviews — Rate and review experiences

### Platform
- RBAC — User / Moderator / Admin role system
- Admin Dashboard — User management, reports queue, platform stats
- Dark/Light Mode — Smooth theme transitions
- Premium UI — Glassmorphism, gradients, stagger animations, shimmer loading
- Mobile-First — 430px optimized frame, native app via Capacitor
- Token Rotation — Auto-refresh with 15min access + 7day refresh tokens

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (or [Neon](https://neon.tech) free tier)

### 1. Clone and Install
```bash
git clone https://github.com/theatharv1/squad-app.git
cd squad-app
npm install
cd server && npm install && cd ..
```

### 2. Setup Database
Create a `.env` file in `server/`:
```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your-secret-key
```

Update the connection string in `server/db/index.ts`.

Push the schema and seed data:
```bash
cd server
npx drizzle-kit push
npx tsx db/seed.ts
```

### 3. Run Development Servers
```bash
# Terminal 1 — Backend (port 3001)
cd server && npx tsx index.ts

# Terminal 2 — Frontend (port 8080)
npx vite --port 8080 --host
```

Open **http://localhost:8080**

### Default Login
- **User:** `yathu@squad.app` / `password123`
- **Admin:** `admin@squad.app` / `password123`

---

## Building Mobile Apps

### Android APK
```bash
# Install Java 21 + Android SDK (macOS)
brew install openjdk@21
brew install --cask android-commandlinetools
sdkmanager --sdk_root="$HOME/Library/Android/sdk" "platforms;android-36" "build-tools;35.0.0" "platform-tools"

# Set environment
export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"

# Build
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug

# APK output: android/app/build/outputs/apk/debug/app-debug.apk
```

### Android App Bundle (Play Store)
```bash
cd android && ./gradlew bundleRelease
# AAB output: android/app/build/outputs/bundle/release/app-release.aab
```

### iOS
```bash
npm run build
npx cap sync ios
npx cap open ios
# Build and run from Xcode
```

---

## Deploy to Production

### Backend (Railway / Render)
1. Push `server/` to a separate repo or use monorepo deploy
2. Set environment variables:
   - `DATABASE_URL` — Neon PostgreSQL connection string
   - `JWT_SECRET` — Random secret key
   - `PORT` — 3001
3. Deploy and get your backend URL (e.g., `https://squad-api.up.railway.app`)

### Frontend (Vercel / Netlify)
1. Set build command: `npm run build`
2. Set output directory: `dist`
3. Set environment variable: `VITE_API_URL=https://your-backend-url.com`
4. Deploy!

### Mobile App (Update API URL)
1. Set `VITE_API_URL` to your production backend URL
2. Rebuild: `npm run build && npx cap sync`
3. Build APK/AAB again

---

## Project Structure

```
squad-app/
|-- src/                    # React frontend
|   |-- components/         # UI components (PoolCard, MobileFrame, BottomNav)
|   |-- contexts/           # AuthContext, ThemeContext
|   |-- hooks/              # React Query hooks (usePools, useMessages, etc.)
|   |-- lib/                # API client, socket, storage utils
|   |-- pages/              # All page components (22 pages)
|   |-- types/              # TypeScript interfaces
|   |-- constants/          # Cities, categories, API URL
|-- server/                 # Express backend
|   |-- db/                 # Drizzle schema, connection, seed
|   |-- routes/             # API routes (auth, pools, users, messages, etc.)
|   |-- middleware/          # Auth, RBAC, validation
|   |-- services/           # Socket.io service
|   |-- utils/              # JWT helpers
|-- android/                # Capacitor Android project
|-- ios/                    # Capacitor iOS project
|-- public/                 # PWA manifest, icons
|-- capacitor.config.ts     # Native app config
```

---

## Database Schema (14 Tables)

| Table | Description |
|---|---|
| `users` | Profiles with role (user/moderator/admin), city, interests |
| `pools` | Activity pools with category, time, location, capacity |
| `pool_participants` | Join table for pool members |
| `follows` | Social follow graph |
| `conversations` | Chat conversations |
| `conversation_members` | Conversation participants |
| `messages` | Chat messages |
| `notifications` | Push notification records |
| `venues` | Location/venue directory |
| `reviews` | Venue/user reviews |
| `badges` | Achievement badges |
| `reports` | Content/user reports |
| `blocked_users` | Block list |
| `refresh_tokens` | JWT refresh token store |

---

## API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login (returns tokens)
- `POST /api/auth/refresh` — Rotate tokens
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Current user
- `DELETE /api/auth/me` — Delete account

### Pools
- `GET /api/pools` — List pools (filter by city, category, date)
- `POST /api/pools` — Create pool
- `POST /api/pools/:id/join` — Join pool
- `DELETE /api/pools/:id/leave` — Leave pool

### Users
- `GET /api/users/search` — Search users
- `GET /api/users/leaderboard` — Top users
- `POST /api/users/:id/follow` — Follow user

### Messages
- `GET /api/messages/conversations` — List chats
- `POST /api/messages/conversations/:id/messages` — Send message

### Admin (requires admin role)
- `GET /api/admin/stats` — Platform statistics
- `PUT /api/admin/users/:id/role` — Change user role
- `PUT /api/admin/users/:id/ban` — Ban/unban user

---

## Contributing

1. Fork the repo
2. Create your branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

MIT License

---

**Built with love for India's Gen Z**
