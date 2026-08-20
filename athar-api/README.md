# Khatma & Athar API (ختمة وأثر)

The backend engine for the Athar platform, built with **Laravel 11**. It manages the coordination lifecycle between givers and seekers, handles impact calculations, and provides spatial data for visualization.

## 🚀 Tech Stack
- **Framework**: Laravel 11 (PHP 8.2+)
- **Database**: MySQL (Compatible with XAMPP)
- **Auth**: Laravel Sanctum (Token-based)
- **Communication**: Integrated Notification & Mail system

## 📁 Key Backend Logic
- **Lifecycle Management**: Tracking the status of `khatma_gifts` and `seeker_needs` from Pending to Delivered/Fulfilled.
- **Impact Scoring**: Automated calculation of impact points based on community ratings (Rating × 2).
- **Spatial Aggregation**: Grouping contributions by city and neighborhood for the interactive map.
- **Role Enforcement**: Middleware and controller logic ensuring strict visibility rules for `khatma`, `seeker`, and `admin` roles.

## 🛠️ Local Setup (XAMPP)
1.  **Dependencies**:
    ```bash
    composer install
    ```
2.  **Environment Config**:
    - Copy `.env.example` to `.env`.
    - Set `DB_DATABASE=athar_db` and configure your credentials.
3.  **Database Setup**:
    ```bash
    php artisan migrate:fresh --seed
    if have aleardy data and need migrate last edit 
    php artisan migrate

    ```
4.  **Run Server**:
    ```bash
    php artisan serve
    ```

## 📍 Updated API Endpoints
- `GET /api/khatma-gifts`: Fetch available gifts.
- `GET /api/seeker-needs`: Fetch browsable community needs.
- `POST /api/reviews`: Submit a rating (1-5 stars) and update impact points.
- `POST /api/seeker-needs/{id}/in-progress`: Claim a need as a provider.
- `POST /api/khatma-gifts/{id}/delivered`: Mark a gift as delivered.
- `GET /api/map`: Unified spatial data for impact visualization.

## 🧪 Verification
Run the test suite to ensure naming consistency and lifecycle logic:
```bash
php artisan test
```
