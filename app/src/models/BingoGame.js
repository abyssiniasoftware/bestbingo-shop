const mongoose = require('mongoose');

const bingoGameSchema = new mongoose.Schema({
  gameId: { type: Number, required: true },
  houseId: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stakeAmount: { type: Number, required: true, min: 5 },
  numberOfPlayers: { type: Number, required: true, min: 1 },
  totalStake: { type: Number, required: true },
  cutAmountPercent: { type: Number, required: true, min: 0, max: 100 },
  prize: { type: Number, required: true },
  systemEarnings: { type: Number, required: true },
  cartela: { type: [String], default: [] },
  winnerCardId: { type: String },
  startedAt: { type: Date, default: Date.now },
  finished: { type: Boolean, default: false },
});


module.exports = mongoose.model('BingoGame', bingoGameSchema);