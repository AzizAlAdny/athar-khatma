# Khatma & Athar API (ختمة وأثر)

The backend API for the "Khatma & Athar" platform, built with **Laravel 11**. This system manages Quran completions, community gifts/services, spatial data for the impact map, and real-time statistics.

## 🚀 Tech Stack
- **Framework**: Laravel 11 (PHP 8.2+)
- **Database**: MySQL (Compatible with XAMPP)
- **Auth**: Laravel Sanctum (Token-based)
- **Spatial**: PostGIS (for advanced geographic queries)

## 📁 Key Features
- **Two-Sided Marketplace**: Connects Khatmas (Givers) with Community needs (Seekers).
- **Glow Logic**: Dynamic calculation of impact scores to visualize community contribution on the map.
- **Real-time Stats**: Aggregated metrics for total completions and beneficiaries.

## 🛠️ Local Setup (XAMPP)
1.  **Clone/Initialize**: Ensure you are in the `athar-api` directory.
2.  **Install Dependencies**:
    ```bash
    composer install
    ```
3.  **Environment Config**:
    - Copy `.env.example` to `.env`.
    - Set `DB_CONNECTION=mysql`, `DB_DATABASE=athar_db`, and configure your XAMPP credentials.
4.  **Database Setup**:
    ```bash
    php artisan migrate:fresh --seed
    ```
5.  **Run Server**:
    ```bash
    php artisan serve
    ```

## 📍 API Endpoints
- `POST /api/register` & `POST /api/login`: Authentication.
- `GET /api/map`: Spatial data for the interactive map (includes Glow levels).
- `GET /api/stats`: Real-time impact counters.
- `POST /api/khatmas`: Register completion and select a "Gift".
- `POST /api/needs`: Post a community need.
