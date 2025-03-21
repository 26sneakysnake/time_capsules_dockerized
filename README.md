# TimeCapsule - Messages vers le futur

## Description du projet

TimeCapsule est une application moderne basée sur une architecture microservices qui permet aux utilisateurs d'écrire des messages destinés à être lus dans le futur. Les utilisateurs peuvent créer deux types de capsules temporelles:

- **Capsules privées** : Accessibles uniquement par leur créateur après la date de déblocage, stockées dans PostgreSQL
- **Capsules publiques** : Visibles par tous une fois débloquées, stockées dans MongoDB

## Architecture

L'application est construite avec une architecture microservices conteneurisée:

- **Frontend** : Interface utilisateur simple et intuitive avec hot reload
- **Service Capsules Privées** : API REST avec PostgreSQL
- **Service Capsules Publiques** : API REST avec MongoDB
- **Reverse Proxy (Nginx)** : Point d'entrée unique pour l'application

Les services sont isolés sur différents réseaux Docker pour garantir la sécurité:
- `frontend-network` : Connecte le reverse proxy, le frontend et les APIs
- `private-network` : Relie uniquement le service privé et sa base de données
- `public-network` : Relie uniquement le service public et sa base de données

![Architecture diagram](docs/architecture.png)

## Technologies utilisées

- **Frontend** : HTML, CSS, JavaScript vanilla
- **Backend** : Node.js, Express
- **Bases de données** : PostgreSQL, MongoDB
- **Conteneurisation** : Docker, Docker Compose
- **CI/CD** : GitLab CI/CD (SAST, Build, Deploy)
- **Reverse Proxy** : Nginx

## Fonctionnalités

- Création de capsules temporelles privées ou publiques
- Choix de la date de déblocage pour chaque capsule
- Consultation des capsules en attente
- Consultation et lecture des capsules débloquées
- Hot reload pour le développement frontend
- Persistance des données via des volumes Docker

## Installation et démarrage

### Prérequis

- Docker et Docker Compose installés sur votre machine
- Git pour cloner le dépôt

### Installation

1. Clonez le dépôt:
```bash
git clone https://gitlab.sre.paris/votre-groupe/timecapsule.git
cd timecapsule
```

2. Lancez l'application avec Docker Compose:
```bash
docker-compose up -d
```

3. Accédez à l'application dans votre navigateur:
```
http://localhost
```

## Structure du projet

```
timecapsule/
├── frontend/                # Interface utilisateur
│   ├── src/                 # Code source frontend (hot reload activé)
│   └── Dockerfile           # Conteneur frontend
├── private-service/         # Service pour capsules privées
│   ├── src/                 # Code source API
│   ├── db/                  # Scripts d'initialisation SQL
│   └── Dockerfile           # Conteneur service privé
├── public-service/          # Service pour capsules publiques
│   ├── src/                 # Code source API
│   └── Dockerfile           # Conteneur service public
├── nginx/                   # Configuration reverse proxy
│   ├── nginx.conf           # Configuration Nginx
│   └── Dockerfile           # Conteneur Nginx
├── .gitlab-ci.yml           # Pipeline CI/CD GitLab
├── docker-compose.yml       # Configuration Docker Compose
└── README.md                # Documentation
```

## CI/CD

Le projet utilise GitLab CI/CD avec les étapes suivantes:
1. **Sécurité** : Analyse statique des Dockerfiles avec Kics
2. **Build** : Construction des images Docker
3. **Deploy** : Publication des images sur Docker Hub

## Bonnes pratiques implémentées

- **Multi-stage builds** pour optimiser la taille des images
- **Utilisateurs non-root** dans les conteneurs pour la sécurité
- **Healthchecks** pour la résilience du système
- **Isolation réseau** entre les services
- **Hot reload** pour le développement frontend efficace
- **Volumes nommés** pour la persistance des données

## Auteurs

Voir le fichier [AUTHORS.md](AUTHORS.md) pour la liste des contributeurs.