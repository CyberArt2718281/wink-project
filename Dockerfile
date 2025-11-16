# Stage 1: Build Angular App
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение для production
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Удаляем конфиг nginx по умолчанию
RUN rm -rf /etc/nginx/conf.d/*

# Копируем конфиг nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранное приложение из builder stage
COPY --from=builder /app/dist/wink-project/browser /usr/share/nginx/html

# Expose порт
EXPOSE 8001

# Запускаем Nginx в foreground режиме
CMD ["nginx", "-g", "daemon off;"]

