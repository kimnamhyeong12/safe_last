const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { id, email, password } = req.body;

    const existingEmail = await User.findOne({ email });
    const existingId = id ? await User.findOne({ id }) : null;

    if (existingEmail) return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
    if (existingId) return res.status(400).json({ message: '이미 존재하는 ID입니다.' });

    const newUser = new User({ id, email, password });
    await newUser.save();

    res.status(201).json({ message: '회원가입 완료!' });
  } catch (err) {
    console.error('❌ 회원가입 오류:', err);
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { id, password } = req.body;

    const user = await User.findOne({ id });
    if (!user) return res.status(400).json({ message: '존재하지 않는 ID입니다.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: '비밀번호가 틀립니다.' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({ message: '로그인 성공!', token });
  } catch (err) {
    console.error('❌ 로그인 오류:', err);
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 비밀번호 확인
router.post('/verify-password', auth, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.userId);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 사용자 정보 조회
router.get('/me', auth, async (req, res) => {
  res.json({ userId: req.user.userId });
});

// 비밀번호 변경
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: '기존 비밀번호가 틀렸습니다.' });

    user.password = newPassword;
    await user.save();

    res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (err) {
    console.error('❌ 비밀번호 변경 오류:', err);
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;
