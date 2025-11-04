# ===========================
# BUILD STAGE - Build React app
# ===========================
FROM node:22-alpine as builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --only=production && \
    npm ci --only=development

COPY . .

RUN npm run build

# ===========================
# PRODUCTION STAGE - Serve with Nginx
# ===========================
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
