const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BoardSchema = new Schema({
  gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  boardNumber: Number,
  grid: [[Number]], // 5x5 grid numbers (null for free)
  marks: [[Boolean]], // same shape
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Board', BoardSchema);
