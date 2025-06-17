import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'admin' },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

export default Admin;
