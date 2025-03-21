const express = require('express');
const Redis = require('ioredis');
const app = express();
const port = process.env.PORT || 3002;

// Connexion à Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');
const subscriber = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

// Middleware
app.use(express.json());

// S'abonner au canal de notification
subscriber.subscribe('capsule-notifications');
subscriber.on('message', (channel, message) => {
  if (channel === 'capsule-notifications') {
    console.log('Notification reçue:', message);
    // Ici, vous pourriez implémenter l'envoi d'emails ou de notifications push
    processCapsuleNotification(JSON.parse(message));
  }
});

// Traiter une notification de capsule
function processCapsuleNotification(data) {
  console.log(`Notification pour capsule ${data.id}: ${data.type} - ${data.action}`);
  // Simuler un traitement
  setTimeout(() => {
    console.log(`Traitement terminé pour la capsule ${data.id}`);
  }, 1000);
}

// Route pour vérifier la santé du service
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Route pour envoyer manuellement une notification (pour les tests)
app.post('/test-notification', (req, res) => {
  const { id, type, action } = req.body;
  
  if (!id || !type || !action) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const message = JSON.stringify({ id, type, action });
  redis.publish('capsule-notifications', message);
  
  res.status(200).json({ message: 'Notification envoyée' });
});

app.listen(port, () => {
  console.log(`Service de notification en écoute sur le port ${port}`);
});