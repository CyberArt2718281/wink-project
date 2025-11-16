# 🚀 Deployment Guide - Wink Project

## Pre-Deployment Checklist

### 1️⃣ Локальная проверка

```bash
# Очистить node_modules и dist
rm -r node_modules dist

# Переустановить зависимости
npm install

# Production build
npm run build

# Проверить размеры
du -sh dist/wink-project/browser
# Должно быть < 1 MB

# Проверить содержимое
ls -la dist/wink-project/browser/
```

### 2️⃣ Локальное тестирование Docker

```bash
# Build image
docker build -t wink-project:latest .

# Run контейнер
docker run -d \
  --name wink-test \
  -p 8001:8001 \
  wink-project:latest

# Проверить в браузере: http://localhost:8001

# Смотреть логи
docker logs -f wink-test

# Остановить
docker stop wink-test
docker rm wink-test
```

### 3️⃣ Проверить на ошибки в коде

```bash
# Lint
ng lint

# Type check
ng build --configuration=production --source-map=false

# Проверить нет ли больших файлов
webpack-bundle-analyzer dist/wink-project/browser/stats.json
```

---

## 🌐 Deployment на Netlify

### Способ 1: Через Git интеграцию (рекомендуется)

#### Шаг 1: Настройка на Netlify.com

1. Перейти на [netlify.com](https://netlify.com)
2. Нажать "Add new site" → "Import an existing project"
3. Выбрать GitHub → авторизоваться
4. Выбрать репозиторий `wink-project`
5. Выбрать branch: `frontend`

#### Шаг 2: Build Settings

| Параметр | Значение |
|----------|----------|
| **Build command** | `npm run build` |
| **Publish directory** | `dist/wink-project/browser` |
| **Node version** | `20.x` |

#### Шаг 3: Environment Variables (если нужны)

```
API_URL=https://api.production.com
```

#### Шаг 4: Deploy

```bash
# Git push → автоматический деплой
git add .
git commit -m "Production ready"
git push origin frontend
```

#### Шаг 5: Проверка

- Netlify автоматически создаст preview deploy
- После прохождения проверок → production deploy
- URL: `https://wink-project-xxxx.netlify.app`

---

### Способ 2: Через Netlify CLI

#### Установка CLI

```bash
npm install -g netlify-cli
```

#### Аутентификация

```bash
netlify login
# Откроется браузер для авторизации
```

#### Deploy

```bash
# Первый деплой
netlify deploy

# Production deploy
netlify deploy --prod

# С указанием директории
netlify deploy --prod --dir=dist/wink-project/browser
```

#### Проверить статус

```bash
netlify status
netlify open
```

---

## 🐳 Deployment на VPS/Cloud

### Требования

- Linux сервер (Ubuntu 20.04+)
- Docker & Docker Compose
- Domain name + DNS
- SSL сертификат (Let's Encrypt бесплатно)

### Шаг 1: Подготовка сервера

```bash
# SSH на сервер
ssh user@your-server.com

# Обновить систему
sudo apt update && sudo apt upgrade -y

# Установить Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установить Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Проверить установку
docker --version
docker-compose --version
```

### Шаг 2: Клонирование репозитория

```bash
# Клонировать проект
git clone https://github.com/CyberArt2718281/wink-project.git
cd wink-project

# Checkout на production branch
git checkout frontend
```

### Шаг 3: Конфигурация DNS

```bash
# В панели управления хостингом (GoDaddy, Cloudflare и т.д.)
# Создать A record:
# Type: A
# Name: @
# Value: your-server-ip
# TTL: 3600

# Или CNAME (если используется CDN):
# Type: CNAME
# Name: www
# Value: your-domain.com
# TTL: 3600
```

### Шаг 4: SSL сертификат (Let's Encrypt)

```bash
# Метод 1: Certbot + Nginx
sudo apt install certbot python3-certbot-nginx -y

# Получить сертификат
sudo certbot certonly --standalone \
  -d your-domain.com \
  -d www.your-domain.com \
  --non-interactive \
  --agree-tos \
  -m your-email@example.com

# Проверить сертификат
sudo ls -la /etc/letsencrypt/live/your-domain.com/

# Автоматическое обновление
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Шаг 5: Обновить nginx.conf

```bash
# Отредактировать nginx.conf
sudo nano nginx.conf
```

**nginx.conf с SSL**:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;  # Redirect HTTP → HTTPS
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL параметры
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Остальная конфигурация...
    root /usr/share/nginx/html;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css text/javascript application/json application/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache для статики
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

### Шаг 6: Docker Compose deployment

**docker-compose.prod.yml**:
```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: wink-app
    restart: unless-stopped
    ports:
      - "8001:8001"
    networks:
      - wink-network
    environment:
      - NODE_ENV=production

networks:
  wink-network:
    driver: bridge
```

```bash
# Build и запуск
docker-compose -f docker-compose.prod.yml up -d --build

# Проверить статус
docker-compose ps

# Смотреть логи
docker-compose logs -f web

# Остановить
docker-compose down
```

### Шаг 7: Reverse Proxy (Nginx)

```bash
# Запустить Nginx контейнер перед приложением
docker run -d \
  --name nginx-proxy \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  nginx:alpine
```

### Шаг 8: Monitoring и Logs

```bash
# Смотреть логи приложения
docker logs -f wink-app

# Очистить старые логи
docker system prune -a

# Проверить ресурсы
docker stats

# Backup данных
docker exec wink-app tar czf /tmp/backup.tar.gz /usr/share/nginx/html
```

---

## 🔍 Тестирование после деплоя

### 1. Проверить доступность

```bash
# Linux/Mac
curl -I https://your-domain.com

# Должен вернуть:
# HTTP/2 200
# Content-Type: text/html
# Cache-Control: public, max-age=0, must-revalidate
```

### 2. Проверить SSL

```bash
# SSL тест
openssl s_client -connect your-domain.com:443

# Online SSL checker
https://www.sslshopper.com/ssl-checker.html
```

### 3. Lighthouse test

```bash
# Chrome DevTools → Lighthouse → Generate report
# или через CLI
npm install -g lighthouse
lighthouse https://your-domain.com --view
```

### 4. Мобильный тест

```bash
# На мобильном устройстве
1. Открыть браузер
2. Перейти на https://your-domain.com
3. Проверить:
   - Загрузка контента
   - Загрузка файла (Drag & Drop)
   - Таблица работает
   - Экспорт работает
   - Мобильный вид ОК
```

### 5. PageSpeed Insights

```
https://pagespeed.web.dev/
Ввести: https://your-domain.com
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### Автоматический деплой на деплой

**`.github/workflows/deploy.yml`**:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ frontend ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Netlify
        uses: nflx-github-actions/netlify-deploy-action@main
        with:
          auth-token: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          deploy-dir: './dist/wink-project/browser'
          production-deploy: true
```

---

## 🚨 Troubleshooting

### Проблема: "404 при обновлении страницы"

**Решение**: Проверить nginx.conf редирект

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

или в netlify.toml:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Проблема: "Медленная загрузка на мобилке"

**Решение**: Проверить:
1. Gzip включен
2. Кэш статики настроен (1 год)
3. Нет больших JS файлов
4. CDN включен (Netlify по умолчанию)

### Проблема: "SSL ошибка"

**Решение**:
```bash
# Проверить сертификат
sudo openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -text -noout

# Обновить сертификат
sudo certbot renew --dry-run
sudo certbot renew
```

### Проблема: "Out of memory"

**Решение**: Увеличить лимиты Docker
```bash
docker run -m 512m --cpus 1 wink-project
```

---

## 📋 Post-Deployment Checklist

- [ ] HTTPS работает (green lock в браузере)
- [ ] Robots.txt настроен (для SEO)
- [ ] Sitemap.xml создан
- [ ] Analytics подключена (Google Analytics)
- [ ] Monitoring настроен (Sentry, DataDog и т.д.)
- [ ] Backups автоматические
- [ ] Логи отправляются (ELK, Splunk и т.д.)
- [ ] Alerts настроены (uptime monitoring)
- [ ] CDN включена (Cloudflare, Netlify и т.д.)
- [ ] Rate limiting включен (DDoS защита)
- [ ] WAF включен (Web Application Firewall)

---

## 📞 Support & Monitoring

### Мониторинг приложения

```bash
# UptimeRobot (бесплатный)
https://uptimerobot.com/

# Sentry (ошибки)
https://sentry.io/

# Cloudflare (DDoS protection)
https://www.cloudflare.com/

# Google Search Console (SEO)
https://search.google.com/search-console/
```

### Контакты

- **GitHub**: https://github.com/CyberArt2718281/wink-project
- **Issues**: GitHub Issues для баг репортов
- **Discussions**: GitHub Discussions для вопросов

---

**Дата создания**: 17 ноября 2025  
**Статус**: ✅ READY FOR PRODUCTION
