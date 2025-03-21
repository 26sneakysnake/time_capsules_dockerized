# Utiliser une image Node.js légère comme base
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Exposer le port
EXPOSE 8080

# Commande pour démarrer l'application avec hot reload
CMD ["npm", "start"]