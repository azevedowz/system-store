const mongoose = require('mongoose');

module.exports = mongoose.model('Saque', new mongoose.Schema({
  userId: String,
  valor: Number,
  premio: String,
  status: { type: String, default: 'pendente' }
}));
