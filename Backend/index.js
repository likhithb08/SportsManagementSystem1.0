import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import registerRoute from './routes/register.js';
import bodyParser from 'body-parser';
import Player from './models/player.js'; 
import managerRoutes from './routes/managerRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; // 🔥 import adminRoutes
import session from 'express-session';
import playerRoutes from './routes/player.js';
import chatRoutes from './routes/chat.js';
import notificationRoutes from './routes/notifications.js';
import eventRoutes from './routes/eventRoutes.js'; // Import event routes
import dotenv from 'dotenv';
dotenv.config({path : '../Database/.env'})

// import { Server } from 'socket.io';




const app = express();
// Simple CORS setup that accepts all origins
app.use(cors({
  origin: 'http://localhost:5173',  // Allow all origins
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(session({
  secret: 'your-secret-key', // use a strong, secret string in prod
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,        // set to true in production with HTTPS
    httpOnly: true,
    sameSite: 'lax',
  },
}));
app.get("/", (req, res) => {
  res.send("Backend is live");
});
app.use('/api', registerRoute);
// or whatever the correct path is

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user in the Player schema (which contains all users including admins and managers)
    const user = await Player.findOne({ email });
    
    if (!user) {
      console.log("Login - User not found:", email);
      return res.status(404).json({ message: "No record found" });
    }
    
    // Direct password comparison
    if (user.password !== password) {
      console.log("Login - Incorrect password for user:", email);
      return res.status(401).json({ message: "Incorrect password" });
    }
    
    console.log("User role:", user.role);
    
    // Set user data in session
    req.session.user = { 
      email: user.email,
      _id: user._id.toString(), // Ensure ID is converted to string
      role: user.role,
      username: user.username
    };
    
    console.log("Login successful - User data in session:", req.session.user);
    
    // Make sure session is saved before sending response
    req.session.save(err => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Error saving session" });
      }
      
      res.status(200).json({ 
        message: "Login successful", 
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
          role: user.role
        } 
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.use('/api/player', playerRoutes);
app.use('/api/manager', managerRoutes)
app.use('/api/admin', adminRoutes) // 🔥 use adminRoutes
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes)
app.use('/api/events', eventRoutes); // Add event routes

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {})
.then(() => {
  console.log("✅ Connected to MongoDB");
  app.listen( process.env.PORT ||5000, () => console.log(`Server running on port {$PORT}`));
})
.catch(err => console.error(err));
