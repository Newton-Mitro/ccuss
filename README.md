## Project Structure

Example structure:

```
project-root
│
├── docker
│ ├── nginx
│ │ └── default.conf
│ └── php
│ └── Dockerfile
│
├── docker-compose.yml
├── .env
├── storage
├── public
└── (laravel files)
```

## Start Containers

```
docker compose up -d --build
```

## Install Laravel Dependencies

```
docker compose exec app composer install
```

## Fix Storage Permission

Important for image upload.

```
docker compose exec app chown -R www-data:www-data storage bootstrap/cache
docker compose exec app chmod -R 775 storage bootstrap/cache
```

## Create Symbolic Link (IMPORTANT)

For image access via /storage/...

```
docker compose exec app php artisan storage:link
```

This creates:

public/storage -> storage/app/public

Since both folders are mounted via Docker volume, the symbolic link works normally.

## Generate Application Key

Run inside container:

```
docker compose exec app php artisan key:generate

```

## Set Mysql db password for the user

```
docker compose exec mysql mysql -u ccuss_user -p
```

## Migrate database and seed data

```
docker compose exec app php artisan migrate
docker compose exec app php artisan db:seed
```

## Access App

```
http://localhost:8000
http://localhost:5173
```

## Stop and Remove Docker Container, Image, Volumes

```
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker rmi $(docker images -aq)
docker volume rm $(docker volume ls -q)
docker network rm $(docker network ls -q)
docker system prune -a --volumes
```

## Build & Run

Run:

```
docker compose down
docker compose up -d --build
```
