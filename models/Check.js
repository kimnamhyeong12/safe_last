const mongoose = require('mongoose');

const checkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastPing: { type: Date, default: Date.now },
  missedCount: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ['normal', 'warning', 'danger','dead'], default: 'normal' },
finalTriggered: { type: Boolean, default: false }  
});

module.exports = mongoose.model('Check', checkSchema);
