const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  encryptedText: { type: String, required: true },
  encryptedKey: { type: String, required: true },
  iv: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
