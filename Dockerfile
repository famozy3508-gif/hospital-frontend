# frontend/Dockerfile
# Multi-stage build: stage 1 builds the static React bundle with Node,
# stage 2 serves it with nginx. No Node runtime ships in the final image.

# ===== Stage 1: build =====
FROM node:20 AS build

WORKDIR /app

# ที่อยู่ backend API ที่ frontend จะเรียกใช้ตอนรันจริง (bake เข้าไปตอน build เพราะ Vite
# อ่านค่า env เฉพาะตอน build เท่านั้น)
ARG VITE_API_BASE=http://localhost:8080/api
ENV VITE_API_BASE=$VITE_API_BASE

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ===== Stage 2: serve =====
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
