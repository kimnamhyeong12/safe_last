const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const Will = require('../models/Will');
const auth = require('../middleware/authMiddleware');
const { encryptText, decryptText } = require('../services/encryption');

// 공개키는 사용할 때 직접 읽어오기
const getPublicKey = () => {
  return fs.readFileSync(path.join(__dirname, '../keys/public.pem'), 'utf8');
};

// 유언 존재 여부 확인 API
router.get('/will/check', auth, async (req, res) => {
  try {
    const existing = await Will.findOne({ userId: req.user.userId });
    if (existing) {
      return res.status(409).json({ message: '이미 유언이 존재합니다.' });
    }
    res.status(200).json({ message: '유언 작성 가능' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 유언 저장
router.post('/will', auth, async (req, res) => {
  try {
    const existing = await Will.findOne({ userId: req.user.userId });
    if (existing) {
      return res.status(409).json({ message: '이미 유언이 존재합니다. 수정 화면을 이용해주세요.' });
    }

    const { message, fileUrl, recipients } = req.body;
    const publicKey = getPublicKey();
    const encrypted = encryptText(message, publicKey);

    const newWill = new Will({
      userId: req.user.userId,
      encryptedData: encrypted.encryptedData,
      encryptedKey: encrypted.encryptedKey,
      iv: encrypted.iv,
      fileUrl,
      recipients,
    });

    await newWill.save();
    res.status(201).json({ message: '🔐 암호화된 유언 저장 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 유언 열람
router.get('/will/view/:id', auth, async (req, res) => {
  try {
    const will = await Will.findOne({ userId: req.params.id });
    if (!will) return res.status(404).json({ message: '유언을 찾을 수 없습니다.' });

    const privateKey = fs.readFileSync(path.join(__dirname, '../keys/private.pem'), 'utf8');
    const decryptedMessage = decryptText(will.encryptedData, will.encryptedKey, will.iv, privateKey);

    res.status(200).json({
      message: decryptedMessage,
      createdAt: will.createdAt,
      recipients: will.recipients,
      fileUrl: will.fileUrl
    });
  } catch (err) {
    res.status(500).json({ message: '복호화 실패', error: err.message });
  }
});

// 유언 수정
router.put('/will', auth, async (req, res) => {
  try {
    const { message, fileUrl, recipients } = req.body;
    const publicKey = getPublicKey();
    const encrypted = encryptText(message, publicKey);

    const updated = await Will.findOneAndUpdate(
      { userId: req.user.userId },
      {
        encryptedData: encrypted.encryptedData,
        encryptedKey: encrypted.encryptedKey,
        iv: encrypted.iv,
        fileUrl,
        recipients,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: '수정할 유언이 없습니다.' });
    res.status(200).json({ message: '🔁 유언 수정 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 유언 삭제
router.delete('/will', auth, async (req, res) => {
  try {
    const deleted = await Will.findOneAndDelete({ userId: req.user.userId });
    if (!deleted) return res.status(404).json({ message: '삭제할 유언이 없습니다.' });
    res.status(200).json({ message: '🗑️ 유언 삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;
