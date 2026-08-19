# Khatma & Athar (ختمة وأثر)

Athar is a community platform designed to transform Quran completions (Khatmas) into tangible social impact. It connects "Givers" (Khatma role) who offer services/gifts with "Seekers" (Seeker role) who request specific community needs.

## 🌟 Project Vision
To create a virtuous cycle of giving inspired by the Quran, where spiritual completion leads directly to community service, visualized through a dynamic, glowing "Impact Map."

## 🏗️ Project Structure
The project is split into two main components:

- **[Frontend (client)](./client)**: A modern Next.js 14 web application using Tailwind CSS 4 and clean architecture.
- **[Backend (athar-api)](./athar-api)**: A robust Laravel 11 REST API with MySQL, providing authentication, spatial data, and impact calculation logic.

## 🚀 Key Features
- **Two-Sided Marketplace**: Tailored dashboards and profiles for `khatma` (givers) and `seeker` roles.
- **Impact Lifecycle**: End-to-end coordination through integrated chat, delivery tracking, and fulfillment confirmation.
- **Rating & Impact System**: Users rate their experience (1-5 stars), which automatically calculates impact points (Rating × 2) for the provider.
- **Glow Impact Map**: Real-time visualization of community contributions with dynamic "Glow" effects based on aggregated user impact.

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ & npm
- PHP 8.2+ & Composer
- MySQL (XAMPP compatible)

### Quick Setup
1. **API**: Navigate to `/athar-api`, run `composer install`, set up `.env`, then `php artisan migrate:fresh --seed`.
2. **Client**: Navigate to `/client`, run `npm install`, set up `.env.local`, then `npm run dev`.

Detailed instructions are available in the respective sub-directory READMEs.
