const mongoose = require('mongoose');

const bingoCardSchema = new mongoose.Schema({
  cardId: { type: String, required: true,},
  b1: { type: Number, required: true, min: 1, max: 15 },
  b2: { type: Number, required: true, min: 1, max: 15 },
  b3: { type: Number, required: true, min: 1, max: 15 },
  b4: { type: Number, required: true, min: 1, max: 15 },
  b5: { type: Number, required: true, min: 1, max: 15 },
  i1: { type: Number, required: true, min: 16, max: 30 },
  i2: { type: Number, required: true, min: 16, max: 30 },
  i3: { type: Number, required: true, min: 16, max: 30 },
  i4: { type: Number, required: true, min: 16, max: 30 },
  i5: { type: Number, required: true, min: 16, max: 30 },
  n1: { type: Number, required: true, min: 31, max: 45 },
  n2: { type: Number, required: true, min: 31, max: 45 },
  n3: { type: Number, default: 0 },
  n4: { type: Number, required: true, min: 31, max: 45 },
  n5: { type: Number, required: true, min: 31, max: 45 },
  g1: { type: Number, required: true, min: 46, max: 60 },
  g2: { type: Number, required: true, min: 46, max: 60 },
  g3: { type: Number, required: true, min: 46, max: 60 },
  g4: { type: Number, required: true, min: 46, max: 60 },
  g5: { type: Number, required: true, min: 46, max: 60 },
  o1: { type: Number, required: true, min: 61, max: 75 },
  o2: { type: Number, required: true, min: 61, max: 75 },
  o3: { type: Number, required: true, min: 61, max: 75 },
  o4: { type: Number, required: true, min: 61, max: 75 },
  o5: { type: Number, required: true, min: 61, max: 75 },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('BingoCard', bingoCardSchema);