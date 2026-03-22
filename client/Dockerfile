FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime

WORKDIR /usr/share/nginx/html

# SPA routing: on 404 serve index.html so client-side routes work.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build ./

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

