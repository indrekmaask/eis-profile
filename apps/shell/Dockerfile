# Build context is the repo root (see docker-compose.yml).
# --- build stage ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY angular.json tsconfig.json ./
COPY apps ./apps
RUN npx ng build shell --configuration production

# --- runtime stage ---
FROM nginx:alpine
COPY --from=build /app/dist/shell /usr/share/nginx/html
COPY apps/shell/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
