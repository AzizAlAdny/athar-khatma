# Khatma & Athar Frontend (ختمة وأثر)

The interactive user interface for the "Khatma & Athar" platform, built with **Next.js 14** using the **Pages Router** and **Clean Architecture**.

## 🚀 Tech Stack
- **Framework**: Next.js 14+ (Pages Router)
- **Styling**: Tailwind CSS 4 (CSS-first approach)
- **Mapping**: MapLibre GL JS
- **Charts**: Apache ECharts
- **Language**: TypeScript

## 📁 Clean Architecture Structure
- `src/pages/`: Delivery layer (Routes, SEO, and hydration).
- `src/components/`: UI layer (Reusable and feature-specific components).
- `src/hooks/`: Application layer (Shared state and business logic).
- `src/lib/`: Infrastructure layer (API clients and utility functions).

## 📁 Key Visual Features
- **Glow Impact Map**: An interactive map showing Khatmas with dynamic CSS "Glow" effects based on community impact.
- **Athar Profile**: Side drawer displaying a comprehensive achievement history for each giver.
- **RTL First**: Designed from the ground up for Arabic users with full Right-to-Left support.

## 🛠️ Local Setup
1.  **Clone/Initialize**: Ensure you are in the `athar-frontend` directory.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
4.  **Access**: Open `http://localhost:3000`.

## 🌐 Deployment
Configured for automatic deployment to **Vercel** with integrated CI/CD via GitHub Actions.
