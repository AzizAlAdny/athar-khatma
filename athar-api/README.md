# Khatma & Athar API (ختمة وأثر)

The backend engine for the Athar platform, built with **Laravel 12** and **PHP 8.2+**. It orchestrates the entire coordination lifecycle between Quran Khatma givers and community seekers, manages impact scoring calculations, provides spatial aggregation for interactive map visualization, and powers real-time WebRTC audio calling and chat messaging.

---

## 🚀 Tech Stack

- **Framework**: Laravel 12 (PHP 8.2+)
- **Database**: PostgreSQL (Supabase Cloud Database / `ext-pdo_pgsql`)
- **Authentication**: Laravel Sanctum (Token & Ability-based) with strict role authorization (`admin`, `khatma`, `seeker`)
- **Email & Verification**: Resend (`resend/resend-laravel`) with 6-digit OTP code verification & signed email link fallbacks
- **Real-Time Broadcasting**: Pusher PHP Server + Laravel Echo private channels (`routes/channels.php`)
- **Voice Calling**: WebRTC Signaling & Call State Management API
- **Testing**: PHPUnit 11 (99+ Feature & Unit tests with in-memory SQLite support)
- **Code Quality**: Laravel Pint

---

## 📁 Key Backend Architecture & Logic

- **Coordination Lifecycle**: Manages status state transitions for `khatma_gifts` and `seeker_needs` (`open` ➔ `in-progress` ➔ `completed` / `fulfilled`).
- **Impact Scoring**: Automated calculation of user impact points based on community ratings (`Rating × 2`).
- **Spatial Aggregation**: Grouping and caching of contributions by city and neighborhood coordinates for map visualization (`/api/map`).
- **WebRTC Voice Calling**: Secure signaling endpoints (`/api/calls/...`) supporting peer-to-peer audio calls with live status notifications.
- **Real-Time Chat & Notifications**: Live messaging between providers and seekers with unread badge counters and in-app database notifications.
- **Admin Moderation & Analytics**: Platform analytics, user management, and moderation for khatmas, needs, reviews, and voice calls.
- **Performance Optimization**: Composite database indexes for fast query execution across active needs, gifts, and chat threads.

---

## 🛠️ Local Setup

### 1. Prerequisites
- **PHP 8.2+** with extensions: `pdo_pgsql`, `pdo`, `mbstring`, `openssl`, `curl` (and `pdo_sqlite` for local tests)
- **Composer 2+**
- **Supabase Account / Project** (or local PostgreSQL instance)

### 2. Installation
```bash
# Clone repository and enter directory
cd athar-api

# Install PHP dependencies
composer install
```

### 3. Environment Configuration
```bash
# Copy sample environment configuration
cp .env.example .env

# Generate application key
php artisan key:generate
```

Configure your `.env` file with your **Supabase PostgreSQL** credentials:
```env
# Supabase PostgreSQL Configuration
DB_CONNECTION=pgsql
DB_HOST=aws-0-eu-central-1.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres.your_project_ref
DB_PASSWORD=your_supabase_database_password
DB_SSLMODE=require

# (Optional) For running fast offline test suite locally:
# DB_CONNECTION=sqlite
```
- **Email (Resend or Log)**:
  ```env
  MAIL_MAILER=resend
  RESEND_API_KEY=re_your_api_key_here
  # For local offline development without sending actual emails:
  # MAIL_MAILER=log
  ```
- **WebSockets / Pusher**:
  ```env
  BROADCAST_CONNECTION=pusher
  PUSHER_APP_ID=your_app_id
  PUSHER_APP_KEY=your_app_key
  PUSHER_APP_SECRET=your_app_secret
  PUSHER_APP_CLUSTER=mt1
  ```
- **Frontend URL & CORS**:
  ```env
  FRONTEND_URL=http://localhost:3000
  CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
  ```

### 4. Database Setup & Seeding
```bash
# Run fresh migrations and populate demo seed data
php artisan migrate:fresh --seed

# Or run incremental migrations on existing data
php artisan migrate
```

### 5. Start Development Server
```bash
php artisan serve
# Server will run on http://localhost:8000
```

---

## 👥 Default Demo & Seed Accounts

When seeded via `php artisan migrate:fresh --seed`, the database includes pre-configured demo accounts (password: `SecureDemoPassword123!` or configured via `SEED_PASSWORD` in `.env`):

| Role | Name | Email | Password | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | مدير النظام | `katmaweb@outlook.com` | `SecureAdminPassword123!` | System administrator with full access to `/admin` |
| **Khatma** | خاتمة | `khatmaweb@gmail.com` | `SecureDemoPassword123!` | Quran reader with active khatmas & completed gifts |
| **Seeker** | فهدة | `Fhdahfhdah@gmail.com` | `SecureDemoPassword123!` | Seeker with community needs across Riyadh neighborhoods |

---

## 📍 API Reference

### 🔐 Authentication & Account
| Method | Endpoint | Description | Rate Limit |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/register` | Register a new user (`khatma` or `seeker`) | 5/min |
| `POST` | `/api/login` | Authenticate and obtain Sanctum token | 5/min |
| `POST` | `/api/verify-code` | Verify account using 6-digit OTP code | 5/min |
| `POST` | `/api/resend-verification-code` | Resend 6-digit email OTP verification code | 5/min |
| `POST` | `/api/forgot-password` | Request password reset code / link | 5/min |
| `POST` | `/api/reset-password` | Reset password using OTP code | 5/min |
| `POST` | `/api/logout` | Revoke current user token (Auth) | - |
| `GET` | `/api/user` | Fetch current authenticated user resource | - |
| `PUT` | `/api/user/profile` | Update profile information & pledge | - |

### 🌍 Public Discovery & Maps
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/gifts` | List all 7 standard gift categories |
| `GET` | `/api/seeker-needs` | Filter and browse open community needs |
| `GET` | `/api/seeker-needs/{id}` | Get single seeker need details |
| `GET` | `/api/khatma-gifts/{id}` | Get single khatma gift details |
| `GET` | `/api/map` | Aggregated spatial pins with neighborhood glow levels |
| `GET` | `/api/recent-gifts` | Recently delivered khatma gifts |
| `GET` | `/api/public-stats` | Aggregated counts of khatmas, gifts, and impact points |
| `GET` | `/api/users/{id}/public-profile`| Public profile with user impact score and achievements |
| `GET` | `/api/users/{id}/reviews` | User reviews and average community rating |
| `GET` | `/api/health` | Service health status check (Database & Cache) |

### 🤝 Lifecycle & Coordination (Auth Required)
| Method | Endpoint | Description | Role / Ability |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/khatmas` | Record a new Quran Khatma with gifts | `khatma`, `admin` |
| `GET` | `/api/khatmas` | List user's khatmas | Auth |
| `POST` | `/api/seeker-needs` | Post a new community need request | `seeker`, `admin` |
| `DELETE`| `/api/seeker-needs/{id}` | Delete own need request | `seeker` (owner), `admin` |
| `POST` | `/api/khatma-gifts/{id}/in-progress` | Claim / mark a gift as in-progress | Auth |
| `POST` | `/api/khatma-gifts/{id}/delivered` | Confirm delivery of a khatma gift | Auth |
| `POST` | `/api/seeker-needs/{id}/in-progress` | Claim a community need | Auth |
| `POST` | `/api/seeker-needs/{id}/fulfilled` | Mark a community need as fulfilled | Auth |
| `POST` | `/api/reviews` | Submit rating & review (calculates impact score) | Auth |

### 💬 Real-Time Chat & Notifications (Verified Auth)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/broadcasting/auth` | Sanctum channel authentication for Pusher / Echo |
| `GET` | `/api/chat/threads` | List active message threads |
| `GET` | `/api/chat/{type}/{id}/messages` | Get messages for a need or gift thread |
| `POST` | `/api/chat/{type}/{id}/messages` | Send message (dispatches `MessageSent` broadcast) |
| `GET` | `/api/notifications` | List user notifications |
| `GET` | `/api/notifications/unread-count` | Unread notifications count badge |
| `POST` | `/api/notifications/read-all` | Mark all notifications as read |
| `POST` | `/api/notifications/{id}/read` | Mark single notification as read |

### 📞 WebRTC Voice Calling (Verified Auth)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/calls/active` | Check current active call for user |
| `POST` | `/api/calls/initiate` | Initiate an audio call to thread participant |
| `POST` | `/api/calls/{id}/respond` | Accept or reject incoming call |
| `POST` | `/api/calls/{id}/signal` | Exchange WebRTC SDP offer/answer & ICE candidates |
| `POST` | `/api/calls/{id}/end` | Terminate active call |
| `GET` | `/api/calls/{id}` | Get call session status and metadata |

### 🛡️ Admin Dashboard (`role:admin`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/stats` | Comprehensive admin dashboard KPIs & analytics |
| `GET` | `/api/admin/users` | List and search all registered users |
| `POST` | `/api/admin/users` | Create user with specific role |
| `GET` | `/api/admin/khatmas` | List all platform khatmas |
| `DELETE`| `/api/admin/khatmas/{id}` | Delete khatma entry |
| `GET` | `/api/admin/needs` | List all platform seeker needs |
| `DELETE`| `/api/admin/needs/{id}` | Delete seeker need entry |
| `GET` | `/api/admin/reviews` | List all user reviews |
| `DELETE`| `/api/admin/reviews/{id}` | Delete inappropriate review |
| `GET` | `/api/admin/calls` | Audit log of all platform voice calls |

---

## 🧪 Testing & Verification

Run the comprehensive PHPUnit test suite:
```bash
php artisan test
```

Format code according to Laravel standards:
```bash
vendor/bin/pint
```

