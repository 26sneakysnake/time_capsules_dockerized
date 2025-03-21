const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const Redis = require('ioredis');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

// DB Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/private_capsules'
});

// Routes
app.post('/api/private-capsules', async (req, res) => {
  try {
    const { content, unlockDate } = req.body;
    
    if (!content || !unlockDate) {
      return res.status(400).json({ error: 'Content and unlock date are required' });
    }
    
    const result = await pool.query(
      'INSERT INTO capsules (content, unlock_date) VALUES ($1, $2) RETURNING *',
      [content, unlockDate]
    );
    
    // Transformer le résultat pour le format attendu par le frontend
    const capsule = {
      id: result.rows[0].id,
      content: result.rows[0].content,
      unlockDate: result.rows[0].unlock_date,
      createdAt: result.rows[0].created_at
    };
    
    // Publier l'événement de création de capsule dans Redis
    redis.publish('capsule-notifications', JSON.stringify({
      id: capsule.id,
      type: 'private',
      action: 'created',
      date: new Date().toISOString()
    }));
    
    res.status(201).json(capsule);
  } catch (error) {
    console.error('Error creating private capsule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/private-capsules', async (req, res) => {
  try {
    const { status } = req.query;
    const now = new Date().toISOString().split('T')[0];
    
    let query;
    if (status === 'waiting') {
      query = 'SELECT * FROM capsules WHERE unlock_date > $1';
    } else if (status === 'unlocked') {
      query = 'SELECT * FROM capsules WHERE unlock_date <= $1';
    } else {
      query = 'SELECT * FROM capsules';
    }
    
    const result = await pool.query(query, [now]);
    
    // Transformer les données pour correspondre au format attendu par le frontend
    const formattedResults = result.rows.map(capsule => ({
      id: capsule.id,
      content: capsule.content,
      unlockDate: capsule.unlock_date,
      createdAt: capsule.created_at
    }));
    
    res.json(formattedResults);
  } catch (error) {
    console.error('Error fetching private capsules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Private capsules service running on port ${port}`);
});

app.use(cors({
  origin: '*', // Modifié pour fonctionner avec le reverse proxy
  credentials: true
}));