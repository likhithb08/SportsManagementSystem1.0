import mongoose from 'mongoose';

const managerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'manager' }
});

const Manager = mongoose.model('Manager', managerSchema);

export default Manager;
