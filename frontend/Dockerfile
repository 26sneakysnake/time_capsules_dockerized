# Stage de build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --production

# Stage final
FROM node:18-alpine

# Créer un utilisateur non-root
RUN addgroup -S nodeapp && adduser -S nodeapp -G nodeapp

WORKDIR /app

# Copier les dépendances du stage précédent
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Définir les permissions correctes
RUN chown -R nodeapp:nodeapp /app

# Utiliser l'utilisateur non-root
USER nodeapp

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080 || exit 1

CMD ["npm", "start"]