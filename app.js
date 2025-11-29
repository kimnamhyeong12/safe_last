const express = require('express');
const connectDB = require('./config/dbconnect');
const alarmSettingRouter = require('./routes/alarmSetting');
const friendRouter = require('./routes/friend');
const app = express();

// DB 연결
connectDB();

// JSON 파싱 미들웨어
app.use(express.json());

// API 라우터 연결
app.use('/api/alarm-setting', alarmSettingRouter);
app.use('/api/friend', friendRouter);

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
