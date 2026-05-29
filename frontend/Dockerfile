FROM node:20-slim AS builder
WORKDIR /app

ARG VITE_YANDEX_MAPS_KEY=""
ENV VITE_YANDEX_MAPS_KEY=$VITE_YANDEX_MAPS_KEY

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
