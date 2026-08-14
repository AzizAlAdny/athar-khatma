# Athar Khatma API — Laravel 12 on Apache (for Render Docker runtime)
FROM php:8.3-apache

# System deps + PHP extensions (PostgreSQL driver required for Supabase)
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq-dev \
        unzip \
        git \
    && docker-php-ext-install pdo_pgsql pgsql bcmath opcache \
    && rm -rf /var/lib/apt/lists/*

# Apache: enable rewrite (Laravel public/.htaccess) + headers, point docroot at /public
RUN a2enmod rewrite headers
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
        /etc/apache2/sites-available/000-default.conf \
        /etc/apache2/apache2.conf \
    && sed -ri -e 's!AllowOverride None!AllowOverride All!g' /etc/apache2/apache2.conf

# Composer binary
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install dependencies first (cached as long as composer.json/lock don't change)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-progress --optimize-autoloader --no-scripts

# Application code (see .dockerignore for what is excluded)
COPY . .

# Entrypoint: storage dirs, package:discover, storage:link, config/route cache, migrate, then Apache
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh \
    && mkdir -p storage/framework/cache/data storage/framework/sessions \
        storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
