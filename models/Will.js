const mongoose = require('mongoose');

const willSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  encryptedData: String,
  encryptedKey: String,
  iv: String,
  fileUrl: String,
  recipients: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Will', willSchema);
