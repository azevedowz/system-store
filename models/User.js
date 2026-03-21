const mongoose = require('mongoose');

module.exports = mongoose.model('User', new mongoose.Schema({
  userId: String,
  pontos: { type: Number, default: 0 }
}));
