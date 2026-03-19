FROM php:8.3-fpm

# System dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    default-mysql-client \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    zip \
    exif \
    pcntl \
    bcmath \
    gd

# Install Redis extension
RUN pecl install redis \
    && docker-php-ext-enable redis

# ----------------------------
# Install Composer globally
# ----------------------------
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/union_banking

# ----------------------------
# Optional: run composer install on build (if you want)
# ----------------------------
# COPY composer.json composer.lock ./
# RUN composer install --no-dev --optimize-autoloader