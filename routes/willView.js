const express = require('express');
const router = express.Router();

const Will = require('../models/Will');
const Friend = require('../models/Friend');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const { decryptText } = require('../services/encryption');
const fs = require('fs');
const path = require('path');

// 보호자 유언 열람
router.get('/:willId', auth, async (req, res) => {
  try {
    const will = await Will.findById(req.params.willId);
    if (!will) return res.status(404).json({ error: '유언을 찾을 수 없습니다.' });

    // 로그인한 사용자의 이메일 조회
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(401).json({ error: '사용자 정보를 찾을 수 없습니다.' });

    // 해당 사용자가 사망자의 연락처에 포함되어 있는지 확인
    const friend = await Friend.findOne({ ownerId: will.userId, email: user.email });
    if (!friend) return res.status(403).json({ error: '유언 열람 권한이 없습니다.' });

    // 유언 복호화
    const privateKey = fs.readFileSync(path.join(__dirname, '../keys/private.pem'), 'utf8');
    const decryptedMessage = decryptText(will.encryptedData, will.encryptedKey, will.iv, privateKey);

    
    res.json({
      message: decryptedMessage,
      createdAt: will.createdAt,
      fileUrl: will.fileUrl
    });
  } catch (err) {
    console.error('❌ 유언 열람 오류:', err);
    res.status(500).json({ error: '복호화 실패', detail: err.message });
  }
});

module.exports = router;
