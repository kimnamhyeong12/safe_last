const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// 예시 데이터베이스
const users = [
  { id: 'admin', email: 'admin@test.com' },
  { id: 'test', email: 'test@test.com' }
];

// 아이디 중복 확인 API
app.post('/api/check-id', (req, res) => {
  const { id } = req.body;
  const exists = users.some(user => user.id === id);
  res.json({ exists });
});

// 이메일 중복 확인 API
app.post('/api/check-email', (req, res) => {
  const { email } = req.body;
  const exists = users.some(user => user.email === email);
  res.json({ exists });
});

// 회원가입 API
app.post('/api/register', (req, res) => {
  const { id, email, password } = req.body;

  if (users.find(user => user.id === id)) {
    return res.status(400).json({ message: '이미 존재하는 ID입니다.' });
  }

  if (users.find(user => user.email === email)) {
    return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
  }

  users.push({ id, email, password });
  res.status(201).json({ message: '회원가입 성공!' });
});

// 서버 실행
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
