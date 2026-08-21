# Khatma & Athar Frontend (ختمة وأثر)

The interactive web application for the Athar platform, built with **Next.js 16 (Pages Router)**, **React 19**, and **Tailwind CSS 4**. It provides a role-based user experience for Quran Khatma readers (`khatma`), community seekers (`seeker`), and administrators (`admin`), complete with interactive spatial maps, real-time messaging, WebRTC voice calling, and impact tracking.

---

## 🚀 Tech Stack

- **Framework**: Next.js 16.3+ (Pages Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4 (PostCSS & CSS-first configuration)
- **Animations & Icons**: Framer Motion & Lucide React
- **Mapping & Spatial**: `@vis.gl/react-google-maps` with MapLibre GL JS fallback
- **Real-Time WebSockets**: Laravel Echo + Pusher JS
- **Audio & WebRTC**: WebRTC PeerConnection & Web Audio API synthesizer
- **Charts & Data Visualization**: Apache ECharts
- **Language**: TypeScript 5

---

## 📁 Architecture & Directory Structure

```
client/src/
├── components/
│   ├── admin/             # Admin moderation panels, KPI charts & user tables
│   ├── auth/              # Auth cards, OTP inputs, and guard wrappers
│   ├── call/              # WebRTC active call & incoming call modal dialogs
│   ├── chat/              # Chat messaging bubble, thread list & voice call button
│   ├── maps/              # Interactive ImpactMap with Google Maps & MapLibre fallback
│   └── ui/                # AppShell, Header (with live notifications), Sidebar, Hero, ReviewForm
├── constants/             # Cities, Riyadh neighborhoods & gift category metadata
├── context/
│   ├── AuthContext.tsx    # Authentication state, token lifecycle & user profile
│   └── CallContext.tsx    # Global WebRTC audio calling manager & signaling
├── pages/
│   ├── admin/             # Platform admin dashboard & management
│   ├── auth/              # Login, register, 6-digit OTP verification, password reset
│   ├── chat/              # Real-time message threads and chat room ([type]/[id])
│   ├── dashboard/         # Role-adaptive user dashboard
│   ├── khatma/            # Khatma registration wizard
│   ├── needs/             # Community needs browse marketplace & seeker request forms
│   ├── my-gifts.tsx       # Khatma reader's offered gifts management
│   ├── profile/           # User impact profile, badge achievements & review history
│   ├── index.tsx          # Landing page with interactive map and impact metrics
│   ├── _app.tsx           # Global providers, AuthContext, CallContext & Call Modals
│   └── _document.tsx      # Custom document layout with Arabic typography
└── services/
    ├── api.ts             # Centralized typed API client
    ├── audioToneService.ts# Synthesized ringback and call tones (Web Audio API)
    ├── echo.ts            # Laravel Echo Pusher WebSocket connection manager
    └── webrtcService.ts   # WebRTC peer connection & media stream handler
```

---

## ✨ Key Features

- **Adaptive Role Experience**: Custom interfaces and permissions for `khatma` (givers), `seeker` (beneficiaries), and `admin` (moderators).
- **Interactive Impact Map**: Glowing neighborhood clusters representing completed khatmas and open community needs with custom markers.
- **WebRTC Voice Calling**: Crystal-clear peer-to-peer audio calls directly within chat threads, accompanied by custom ringers and call modals.
- **Real-Time Messaging**: Instant chat coordination with optimistic UI updates, unread badges, and status progression actions.
- **Live Notifications**: Header notification bell with real-time badge count and quick access to active threads.
- **Impact Scoring & Reviews**: 5-star rating flow with automatic calculation of impact points and display on user profiles.
- **Admin Moderation Suite**: Full analytics dashboard powered by ECharts, user auditing, and moderation tools for khatmas, needs, and reviews.

---

## 🛠️ Local Setup

### 1. Prerequisites
- **Node.js**: `18.x` or `20.x+`
- **npm** or **pnpm** / **yarn**

### 2. Installation
```bash
# Enter client directory
cd client

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env.local` file by copying the example template:
```bash
cp .env.example .env.local
```

Configure your environment variables:
```env
# Backend API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# Application Metadata
NEXT_PUBLIC_APP_NAME=ختمة وأثر
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google Maps API (Optional: MapLibre is used as fallback if left empty)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Real-Time WebSockets (Pusher / Laravel Echo)
NEXT_PUBLIC_PUSHER_APP_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_APP_CLUSTER=mt1
NEXT_PUBLIC_PUSHER_SCHEME=https
```

### 4. Development Server
```bash
npm run dev
# Application will run on http://localhost:3000
```

---

## 📍 Key Pages & Routes

| Path | Description | Access |
| :--- | :--- | :--- |
| `/` | Landing page featuring interactive spatial impact map and stats | Public |
| `/auth/login` | Email & password login | Guest |
| `/auth/register` | User registration with role selection & ethical pledge | Guest |
| `/auth/verify` | 6-digit OTP code email verification | Auth |
| `/auth/forgot-password` | Password reset request | Guest |
| `/auth/reset-password` | Password reset confirmation with OTP code | Guest |
| `/dashboard` | Role-specific dashboard with metrics and shortcuts | Auth |
| `/khatma/register` | Record a Quran Khatma and choose offered gifts | `khatma`, `admin` |
| `/my-gifts` | Track and manage offered khatma gifts and delivery | `khatma`, `admin` |
| `/needs/browse` | Marketplace for Khatma users to find and claim community needs | Auth |
| `/needs/register` | Seeker form to request Quranic services & support | `seeker`, `admin` |
| `/needs/index` | Seeker request management & fulfillment confirmation | `seeker`, `admin` |
| `/chat` | Conversation inbox listing all active chat threads | Verified Auth |
| `/chat/[type]/[id]` | Live chat room with messaging, actions & voice call button | Verified Auth |
| `/profile` | User impact score, achievements, badges & community reviews | Auth |
| `/admin` | Administrative control panel with ECharts & moderation tools | `admin` |

---

## 📜 Available Scripts

- `npm run dev`: Starts the Next.js development server with Webpack.
- `npm run build`: Compiles and builds the production application bundle.
- `npm run start`: Runs the compiled Next.js production server.
- `npm run lint`: Checks for TypeScript and ESLint code quality issues.
- `npm run format`: Formats source files using Prettier.

