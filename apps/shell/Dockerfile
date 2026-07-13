# Build context is the repo root (see docker-compose.yml).
# --- build stage ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY angular.json tsconfig.json ./
COPY libs ./libs
COPY apps ./apps
RUN npx ng build shell --configuration production

# --- runtime stage ---
FROM nginx:alpine
# Defaults for local docker compose; Railway overrides PORT (injected) and
# BACKEND_URL / PROFILE_MFE_URL (service reference vars). RESOLVER is derived
# at boot from /etc/resolv.conf by 15-resolver.envsh.
ENV PORT=80
ENV BACKEND_URL=http://backend:8080
COPY --from=build /app/dist/shell /usr/share/nginx/html
# Served via nginx's built-in envsubst template mechanism (renders to conf.d).
COPY apps/shell/nginx.conf /etc/nginx/templates/default.conf.template
COPY apps/shell/docker/15-resolver.envsh /docker-entrypoint.d/15-resolver.envsh
COPY apps/shell/docker/30-render-manifest.sh /docker-entrypoint.d/30-render-manifest.sh
RUN chmod +x /docker-entrypoint.d/30-render-manifest.sh
EXPOSE 80
