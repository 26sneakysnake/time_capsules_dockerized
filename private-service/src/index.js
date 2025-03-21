const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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
    
    res.status(201).json(result.rows[0]);
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
    res.json(result.rows);
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
  origin: 'http://localhost:8080', // Autorise le frontend
  credentials: true
}));