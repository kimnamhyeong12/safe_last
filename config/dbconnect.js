const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect('mongodb+srv://rlaskagud12:swproject123@swproject.uosawgq.mongodb.net/safepass');
    console.log('✅ MongoDB Atlas 연결 성공!');
  } catch (err) {
    console.error('❌ MongoDB 연결 실패:', err);
    process.exit(1);
  }
}

module.exports = connectDB;
