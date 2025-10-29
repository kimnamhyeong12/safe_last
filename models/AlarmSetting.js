const mongoose = require('mongoose');

const alarmSettingSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  intervalDays: { type: Number, required: true, default: 1 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AlarmSetting', alarmSettingSchema);
