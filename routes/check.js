const express = require('express');
const router = express.Router();
const Check = require('../models/Check');
const auth = require('../middleware/authMiddleware');

// 생존 응답 저장 API
router.post('/check/respond', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    let check = await Check.findOne({ userId });

    if (!check) {
      check = new Check({ userId });
    }

    check.lastPing = new Date();
    check.missedCount = 0;
    check.riskLevel = 'normal';

    await check.save();

    res.status(200).json({ message: '응답 기록 완료', lastPing: check.lastPing });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;




// 유저 생존 상태 조회 API
router.get('/check/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const check = await Check.findOne({ userId });

    if (!check) {
      return res.status(404).json({ message: '응답 기록이 없습니다.' });
    }

    res.status(200).json({
      userId: check.userId,
      lastPing: check.lastPing,
      missedCount: check.missedCount,
      riskLevel: check.riskLevel
    });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});
