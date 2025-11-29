const express = require('express');
const router = express.Router();
const AlarmSetting = require('../models/AlarmSetting');
const auth = require('../middleware/authMiddleware');

// 알람 주기 저장 또는 수정
router.post('/', auth, async (req, res) => {
  const { intervalDays } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: '인증된 사용자 정보가 없습니다.' });
  }

  try {
    console.log('📩 저장 요청:', intervalDays);
    console.log('👤 사용자 ID:', userId);

    const result = await AlarmSetting.findOneAndUpdate(
      { ownerId: userId },
      { intervalDays, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    console.log('✅ 저장 성공:', result);
    res.json({ message: '저장 완료', data: result });
  } catch (err) {
    console.error('❌ 알람 주기 저장 실패:', err);
    res.status(500).json({ message: '저장 실패', error: err.message });
  }
});

// 알람 주기 조회
router.get('/', auth, async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: '인증된 사용자 정보가 없습니다.' });
  }

  try {
    const setting = await AlarmSetting.findOne({ ownerId: userId });
    res.json(setting || { intervalDays: 1 });
  } catch (err) {
    res.status(500).json({ message: '불러오기 실패', error: err.message });
  }
});

module.exports = router;
