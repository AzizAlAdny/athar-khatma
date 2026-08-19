# Khatma & Athar Frontend (ختمة وأثر)

The interactive user interface for the Athar platform, built with **Next.js 14** using the **Pages Router** and **Clean Architecture**.

## 🚀 Tech Stack
- **Framework**: Next.js 14+
- **Styling**: Tailwind CSS 4 (CSS-first approach)
- **Icons**: Lucide React
- **Mapping**: Google Maps / MapLibre GL JS (Fallback)
- **Language**: TypeScript

## 📁 Clean Architecture Structure
- `src/pages/`: Delivery layer (Routes, SEO, and hydration).
- `src/components/`: UI layer (Reusable and feature-specific components).
- `src/services/`: Infrastructure layer (Centralized API client in `api.ts`).
- `src/context/`: Application state (Authentication).

## 📁 Key UI Features
- **Role-Based Dashboards**: Specialized views for `khatma` and `seeker` roles.
- **Unified Chat System**: Real-time coordination between givers and seekers with integrated "Claim" and "Mark Delivered" actions.
- **Rating Experience**: Integrated star-rating forms for immediate feedback and impact calculation.
- **Athar Profile**: Dynamic achievement history and review display tailored to the user's community role.

## 🛠️ Local Setup
1.  **Dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Config**:
    - Copy `.env.example` to `.env.local`.
    - Set `NEXT_PUBLIC_API_BASE_URL` to your local API (usually `http://localhost:8000/api`).
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 📍 Key Pages
- `/dashboard`: Role-specific landing page.
- `/needs/browse`: Marketplace for `khatma` users to find community needs.
- `/needs/index`: Management page for `seekers` to track their requests.
- `/profile`: Achievement and impact showcase.
