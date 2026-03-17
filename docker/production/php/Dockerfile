# -------------------------------
# Build Stage
# -------------------------------
FROM php:8.3-fpm-alpine AS builder

WORKDIR /var/www/ccuss

# Install system/build dependencies for PHP extensions + Node
RUN apk add --no-cache \
    bash \
    git \
    unzip \
    curl \
    libzip-dev \
    oniguruma-dev \
    autoconf \
    gcc \
    g++ \
    make \
    nodejs npm \
    && docker-php-ext-install pdo pdo_mysql mbstring zip bcmath pcntl

# Copy only composer files first for caching
COPY composer.json composer.lock ./

# Install Composer
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer

# Install PHP dependencies without running post-autoload scripts
RUN composer install --no-dev --optimize-autoloader --no-scripts --ignore-platform-req=ext-sodium

# Copy full application source
COPY . .

# Run post-autoload scripts now that artisan exists
RUN composer dump-autoload --optimize
RUN php artisan package:discover --ansi

# Build frontend assets (Vite/webpack)
RUN npm install && npm run build

# -------------------------------
# Production Stage
# -------------------------------
FROM php:8.3-fpm-alpine

WORKDIR /var/www/ccuss

# Install runtime dependencies and PHP extensions
RUN apk add --no-cache \
    bash \
    libzip-dev \
    oniguruma-dev \
    autoconf \
    gcc \
    g++ \
    make \
    && docker-php-ext-install pdo pdo_mysql mbstring zip bcmath pcntl \
    && pecl install redis \
    && docker-php-ext-enable redis opcache

# Copy app from builder
COPY --from=builder /var/www/ccuss /var/www/ccuss

# Set proper permissions
RUN chown -R www-data:www-data /var/www/ccuss/storage /var/www/ccuss/bootstrap/cache \
    && chmod -R 775 /var/www/ccuss/storage /var/www/ccuss/bootstrap/cache

# Enable Opcache
RUN docker-php-ext-enable opcache