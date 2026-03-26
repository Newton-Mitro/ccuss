## Project Structure

Example structure:

```
my-app/
├─ docker/
│  ├─ php/
│  │  └─ Dockerfile
│  ├─ node/
│  │  └─ Dockerfile
│  └─ nginx/
│     └─ default.conf
├─ docker-compose.yml
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ .env
├─ app/
└─ ...
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

```
docker compose down
docker compose up -d --build
docker compose -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
docker exec -it union_banking_app sh
docker compose exec union_banking_app php artisan key:generate
docker exec -it union_banking_app php artisan migrate:fresh
docker exec -it union_banking_app php artisan db:seed
docker exec -it union_banking_app php artisan storage:link
docker compose exec union_banking_mysql mysql -u union_banking_user -p
docker exec -it union_banking_app php artisan optimize:clear
docker exec -it union_banking_app composer dump-autoload
docker exec -it union_banking_app npm run dev
docker exec -it union_banking_app php artisan wayfinder:generate --with-form
docker exec -it union_banking_app chown -R www-data:www-data storage bootstrap/cache
docker exec -it union_banking_app chmod -R 775 storage bootstrap/cache
docker exec -it union_banking_app php artisan permissions:generate

chown -R $USER:$USER storage bootstrap/cache resources/js/actions/Laravel

sudo chown -R $USER:$USER /home/newton/Documents/workspace/personal/ccuss
chmod -R 775 storage bootstrap/cache
chmod -R 775 resources/js/actions
```

```
docker exec -it union_banking_app php artisan backup:delete-all
docker exec -it union_banking_app php artisan backup:run
docker exec -it union_banking_scheduler php artisan schedule:list
docker exec -it union_banking_scheduler php artisan schedule:run
docker logs -f union_banking_queue
docker exec -it union_banking_scheduler chown -R www-data:www-data storage
docker exec -it union_banking_scheduler chmod -R 775 storage
```
