const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true }
});

module.exports = mongoose.model('Friend', friendSchema);
