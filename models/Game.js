const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
  status: { type: String, enum: ['waiting','started','ended'], default: 'waiting' },
  stake: { type: Number, default: 10 },
  players: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  calls: [Number],
  createdAt: { type: Date, default: Date.now },
  nextCallIndex: { type: Number, default: 0 }
});

module.exports = mongoose.model('Game', GameSchema);
