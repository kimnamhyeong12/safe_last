const { getAllUsers } = require('./services/scheduler');

async function monitorUserStatus() {
  console.log("⏱ 사용자 상태 체크 시작");
  const users = await getAllUsers();
  console.log('📢 [현재 사용자 상태]');
  users.forEach(user => {
    console.log(`- ID: ${user._id}, Email: ${user.email}, Status: ${user.status}, Danger Level: ${user.danger_level}`);
  });
  console.log('--------------------------------------\n');
}

setInterval(monitorUserStatus, 10000);
