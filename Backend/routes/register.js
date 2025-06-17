// routes/register.js
import express from 'express';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

const router = express.Router();

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'sports-management';

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    await client.connect();
    const db = client.db(dbName);
    const users = db.collection('players');

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const newUser = {
      username,
      email,
      password,
      role,
      active: true,
      createdAt: new Date()
    };

    await users.insertOne(newUser);

    res.status(201).json({
      message: 'Player registered successfully!',
      user: {
        username,
        email,
        role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  } finally {
    await client.close();
  }
});

export default router;
