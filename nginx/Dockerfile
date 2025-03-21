FROM nginx:1.24-alpine

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

# Nginx doit s'exécuter en tant que root pour les ports privilégiés
# Nous gardons cette configuration simple pour le projet