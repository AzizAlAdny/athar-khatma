#!/bin/bash
# Entrypoint for the Athar Khatma API on Render.
# All configuration comes from environment variables (no .env file in the image).
set -e

echo "==> Preparing Laravel storage structure..."
mkdir -p storage/framework/cache/data \
         storage/framework/sessions \
         storage/framework/views \
         storage/logs \
         bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

echo "==> Discovering packages..."
php artisan package:discover --ansi || true

echo "==> Linking public storage..."
php artisan storage:link || true

echo "==> Caching config & routes..."
php artisan config:cache
php artisan route:cache

echo "==> Running database migrations..."
php artisan migrate --force

echo "==> Starting Apache..."
exec apache2-foreground
