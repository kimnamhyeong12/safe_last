const express = require('express');
const router = express.Router();
const Friend = require('../models/Friend');
const auth = require('../middleware/authMiddleware');

// 연락처 추가
router.post('/add', auth, async (req, res) => {
  const { name, email } = req.body;
  try {
    const friend = new Friend({ ownerId: req.user.userId, name, email });
    await friend.save();
    res.status(201).json({ message: '연락처 저장 완료', friend });
  } catch (err) {
    console.error("❌ 저장 실패:", err);
    res.status(500).json({ message: '저장 실패', error: err.message });
  }
});

// 연락처 목록 조회
router.get('/', auth, async (req, res) => {
  try {
    const list = await Friend.find({ ownerId: req.user.userId });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: '불러오기 실패', error: err.message });
  }
});

// 연락처 삭제
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Friend.findOneAndDelete({ _id: req.params.id, ownerId: req.user.userId });
    if (!deleted) return res.status(404).json({ message: '삭제 대상 없음' });
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: '삭제 실패', error: err.message });
  }
});

module.exports = router;
