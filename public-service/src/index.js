const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/public_capsules';
let db;

async function connectToMongo() {
  const client = new MongoClient(mongoURI);
  await client.connect();
  console.log('Connected to MongoDB');
  db = client.db();
  return db;
}

// Connect to MongoDB when starting the server
connectToMongo().catch(console.error);

// Routes
app.post('/api/public-capsules', async (req, res) => {
  try {
    const { content, unlockDate } = req.body;
    
    if (!content || !unlockDate) {
      return res.status(400).json({ error: 'Content and unlock date are required' });
    }
    
    const result = await db.collection('capsules').insertOne({
      content,
      unlockDate,
      createdAt: new Date()
    });
    
    res.status(201).json({ 
      id: result.insertedId,
      content,
      unlockDate,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error creating public capsule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/public-capsules', async (req, res) => {
  try {
    const { status } = req.query;
    const now = new Date().toISOString().split('T')[0];
    
    let query = {};
    if (status === 'waiting') {
      query = { unlockDate: { $gt: now } };
    } else if (status === 'unlocked') {
      query = { unlockDate: { $lte: now } };
    }
    
    const capsules = await db.collection('capsules').find(query).toArray();
    res.json(capsules);
  } catch (error) {
    console.error('Error fetching public capsules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Public capsules service running on port ${port}`);
});

app.use(cors({
  origin: 'http://localhost:8080', // Autorise le frontend
  credentials: true
}));