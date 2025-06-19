import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const performanceSchema = new mongoose.Schema({
  fitness: { type: Number, default: 0, min: 0, max: 100 },
  technique: { type: Number, default: 0, min: 0, max: 100 },
  teamwork: { type: Number, default: 0, min: 0, max: 100 },
  consistency: { type: Number, default: 0, min: 0, max: 100 },
  discipline: { type: Number, default: 0, min: 0, max: 100 },
  notes: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' }
});

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'player' },
  position: { type: String, default: 'Unassigned' },
  status: { type: String, default: 'Active' },
  performance: performanceSchema,
  // Add any additional fields you want to store for players
});

// Hash the password before saving it
playerSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {  // Hash only if password is modified or new
    const salt = await bcrypt.genSalt(10); // Generate salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
  }
  next();
});

// Compare the password during login
playerSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password); // Compare the given password with the hashed one
};

const Player = mongoose.model('Player', playerSchema);

export default Player;
