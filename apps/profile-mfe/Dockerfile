# Build context is the repo root (see docker-compose.yml).
# --- build stage ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY angular.json tsconfig.json ./
COPY libs ./libs
COPY apps ./apps
RUN npx ng build profile-mfe --configuration production

# --- runtime stage ---
FROM nginx:alpine
# Defaults for local docker compose; Railway overrides PORT (injected) and
# BACKEND_URL (service reference var). RESOLVER is exported at boot from
# /etc/resolv.conf by 15-resolver.envsh (must be executable to source).
ENV PORT=80
ENV BACKEND_URL=http://backend:8080
COPY --from=build /app/dist/profile-mfe /usr/share/nginx/html
# Served via nginx's built-in envsubst template mechanism (renders to conf.d).
COPY apps/profile-mfe/nginx.conf /etc/nginx/templates/default.conf.template
COPY apps/profile-mfe/docker/15-resolver.envsh /docker-entrypoint.d/15-resolver.envsh
RUN chmod +x /docker-entrypoint.d/15-resolver.envsh
EXPOSE 80
