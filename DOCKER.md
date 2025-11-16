# Docker Setup для Wink Project

## Команды для работы с Docker

### 1. Собрать образ

```bash
docker build -t wink-project:latest .
```

### 2. Запустить контейнер

```bash
docker run -d \
  --name wink-container \
  -p 8080:80 \
  wink-project:latest
```

### 3. Просмотреть логи

```bash
docker logs -f wink-container
```

### 4. Остановить контейнер

```bash
docker stop wink-container
```

### 5. Удалить контейнер

```bash
docker rm wink-container
```

### 6. Удалить образ

```bash
docker rmi wink-project:latest
```

## Полный процесс

```bash
# Собрать образ
docker build -t wink-project:latest .

# Запустить контейнер на порту 8080
docker run -d --name wink-container -p 8080:80 wink-project:latest

# Проверить логи
docker logs -f wink-container

# Приложение будет доступно на http://localhost:8080
```

## Информация

- **Образ**: Node 20 Alpine (для сборки) + Nginx Alpine (для раздачи)
- **Порт**: 80 (внутри контейнера) → 8080 (на хосте)
- **Оптимизация**: Gzip сжатие, кэширование статики, security headers
- **Размер**: ~50MB (благодаря multi-stage build)

## Полезные команды

```bash
# Просмотреть список контейнеров
docker ps -a

# Просмотреть список образов
docker images

# Проверить статистику контейнера
docker stats wink-container

# Войти в контейнер
docker exec -it wink-container sh
```
