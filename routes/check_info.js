const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 아이디 중복 확인
router.post('/check-id', async (req, res) => {
  const { id } = req.body;
  try {
    const exists = await User.exists({ id });
    res.json({ exists: !!exists });
  } catch (err) {
    res.status(500).json({ message: '서버 오류 (ID 확인)', error: err.message });
  }
});

// 이메일 중복 확인
router.post('/check-email', async (req, res) => {
  const { email } = req.body;
  try {
    const exists = await User.exists({ email });
    res.json({ exists: !!exists });
  } catch (err) {
    res.status(500).json({ message: '서버 오류 (이메일 확인)', error: err.message });
  }
});

module.exports = router;
