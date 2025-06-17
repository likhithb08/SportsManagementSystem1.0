import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
});

const Team = mongoose.model('Team', teamSchema);
export default Team;
