require('dotenv').config();
require('./statusMonitor');
require('./services/scheduler');

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

const authRoutes = require('./routes/auth');
const checkRoutes = require('./routes/check');
const willRoutes = require('./routes/will');
const confirmRoute = require('./routes/confirm');
const friendRoutes = require('./routes/friend');
const alarmSettingRouter = require('./routes/alarmSetting');
const willViewRoutes = require('./routes/willView');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'logout.html'));
});

app.use('/api', authRoutes);
app.use('/api', checkRoutes);
app.use('/api', willRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/alarm-setting', alarmSettingRouter);
app.use('/api/view', willViewRoutes);
app.use('/', confirmRoute);

const connectDB = require('./config/dbconnect');
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
