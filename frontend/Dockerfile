# ---- build stage ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# frontend/.env exists only for this step, so Vite can read it without it
# being stored in an image layer. VITE_ values do end up in the public JS bundle.
RUN --mount=type=secret,id=frontend_env,target=/app/.env npm run build

# ---- runtime stage ----
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]