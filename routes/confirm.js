const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Check = require('../models/Check');

const ObjectId = mongoose.Types.ObjectId;

router.get('/confirm', async (req, res) => {
  const userId = req.query.id;

  if (!userId) {
    return res.status(400).send(' 잘못된 요청입니다. 사용자 ID가 필요합니다.');
  }

  const check = await Check.findOne({ userId: new ObjectId(userId) });

  if (!check) {
    return res.status(404).send(' 사용자를 찾을 수 없습니다.');
  }

  check.missedCount = 0;
  check.riskLevel = 'normal';
  check.lastPing = new Date();

  await check.save();

  res.send(' 상태가 확인되었습니다. danger level이 초기화되었습니다.');
});

module.exports = router;


