import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const uri = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret';


app.use(express.static(join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB setup
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('test');
    console.log("Connected to MongoDB");

    //  shoes if empty
    const shoesCount = await db.collection('shoes').countDocuments();
    if (shoesCount === 0) {
      await db.collection('shoes').insertMany([
        { name: 'Air Max', gender: 'Men', size: 10 },
        { name: 'Superstar', gender: 'Women', size: 8 },
        { name: 'Jordan 1', gender: 'Men', size: 11 }
      ]);
      console.log("Seeded default shoes");
    }

    // admin user if empty
    const usersCount = await db.collection('users').countDocuments();
    if (usersCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.collection('users').insertOne({
        username: 'admin',
        password: hashedPassword,
        createdAt: new Date()
      });
      console.log("Created default admin user: admin / admin123");
    }
  } catch (err) {
    console.error(err);
  }
}
connectDB();

//  auth 
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

//routes
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username & password required' });

  const exists = await db.collection('users').findOne({ username });
  if (exists) return res.status(400).json({ error: 'Username exists' });

  const hashed = await bcrypt.hash(password, 10);
  const result = await db.collection('users').insertOne({ username, password: hashed, createdAt: new Date() });
  console.log(` User registered: ${username}`);
  res.status(201).json({ userId: result.insertedId });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username & password required' });

  const user = await db.collection('users').findOne({ username });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
  console.log(`User logged in: ${username}`);
  res.json({ token, user: { id: user._id, username: user.username } });
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.userId) }, { projection: { password: 0 } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

//other routes
app.get('/api/shoes', authenticateToken, async (req, res) => {
  const shoes = await db.collection('shoes').find().toArray();
  res.json(shoes);
});

app.post('/api/body', authenticateToken, async (req, res) => {
  const { name, gender, size } = req.body;
  const result = await db.collection('shoes').insertOne({
    name, gender, size,
    addedBy: req.user.username,
    createdAt: new Date()
  });
  console.log(` Added shoe: ${name} (${gender}, Size: ${size}) by ${req.user.username}`);
  res.json({ message: `Added shoe with ID: ${result.insertedId}` });
});

app.put('/api/body/:id', authenticateToken, async (req, res) => {
  const { name, gender, size } = req.body;
  const id = req.params.id;
  const result = await db.collection('shoes').updateOne(
    { _id: new ObjectId(id) },
    { $set: { name, gender, size, lastUpdatedBy: req.user.username, updatedAt: new Date() } }
  );
  console.log(` Updated shoe ID: ${id} by ${req.user.username}`);
  res.json({ message: `Updated ${result.modifiedCount} shoe(s)` });
});

app.delete('/api/body/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  const result = await db.collection('shoes').deleteOne({ _id: new ObjectId(id) });
  console.log(`Deleted shoe ID: ${id} by ${req.user.username}`);
  res.json({ message: `Deleted ${result.deletedCount} shoe(s)` });
});

// API greeting
app.get('/api/Van', authenticateToken, (req, res) => {
  res.json({ myVar: `Welcome to the Shoes Collection API, ${req.user.username}!` });
});

// serve HTML
app.get('/', (req, res) => res.sendFile(join(__dirname, 'public', 'auth.html')));
app.get('/shoes', (req, res) => res.sendFile(join(__dirname, 'public', 'Van.html')));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
