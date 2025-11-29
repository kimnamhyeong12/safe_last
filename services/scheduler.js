require('dotenv').config();
const cron = require('node-cron');
const mongoose = require('mongoose');
const Check = require('../models/Check');
const User = require('../models/User');
const AlarmSetting = require('../models/AlarmSetting');
const evaluateUserStatus = require('./statusEvaluator');
const { handleDeathTrigger } = require('./triggerSender');
const { sendConfirmationEmail } = require('../utils/mailer');

async function getAllUsers() {
  const users = await User.find();
  const checks = await Check.find();

  return users
    .filter(user => user._id)
    .map(user => {
      const check = checks.find(c => c?.userId?.toString() === user._id.toString());

      return {
        _id: user._id,
        email: user.email,
        status: check?.riskLevel || 'normal',
        danger_level: check?.missedCount ?? 0,
        last_ping_time: check?.lastPing,
      };
    });
}

async function updateUser(user) {
  let check = await Check.findOne({ userId: user._id });
  if (!check) check = new Check({ userId: user._id });

  check.missedCount = user.danger_level;
  check.riskLevel = user.status;
  check.lastPing = user.last_ping_time || new Date();

  await check.save();
}

// 매분마다 사용자별 intervalDays 기준 확인 메일 전송
cron.schedule('* * * * *', async () => {
  try {
    const users = await getAllUsers();
    const now = new Date();

    for (const user of users) {
      const alarm = await AlarmSetting.findOne({ ownerId: user._id });
      const intervalDays = alarm?.intervalDays || 1;

      const minutesSinceLastPing = (now - new Date(user.last_ping_time || 0)) / (1000 * 60);

      if (minutesSinceLastPing >= intervalDays) {
        user.danger_level += 1;
        user.last_ping_time = now;

        if (user.danger_level >= 5) user.status = 'dead';
        else if (user.danger_level >= 3) user.status = 'danger';
        else user.status = 'normal';

        await updateUser(user);

        // DEAD 상태 제외하고 메일 전송
        if (user.status !== 'dead') {
          await sendConfirmationEmail(user);
          console.log(`📨 확인 메일 전송 완료: ${user.email}`);
        } else {
          console.log(`☠️ ${user.email} 은 DEAD 상태이므로 메일 미전송`);
        }
      }
    }

    console.log(`[${now.toISOString()}] 사용자별 알람 주기로 확인 메일 전송 완료`);
  } catch (err) {
    console.error('❌ 매분 스케줄러 오류:', err);
  }
});

// 상태 평가용 10초 주기 스케줄러
cron.schedule('*/10 * * * * *', async () => {
  try {
    const users = await getAllUsers();
    console.log(`⏱ 사용자 상태 체크 시작`);

    for (const user of users) {
      const updatedUser = evaluateUserStatus(user);

      console.log(`📢 [현재 사용자 상태]\n- ID: ${user._id}, Email: ${user.email}, Status: ${updatedUser.status}, Danger Level: ${updatedUser.danger_level}\n--------------------------------------`);

      if (updatedUser.status === 'dead') {
        const check = await Check.findOne({ userId: updatedUser._id });
        console.log(`[DEBUG] DEAD 상태 확인됨: ${user.email}, finalTriggered: ${check?.finalTriggered}`);

        if (check && !check.finalTriggered) {
          console.log(`⚠ handleDeathTrigger 호출 직전: ${user.email}`);

          try {
            await handleDeathTrigger(updatedUser._id);
            console.log(`✅ handleDeathTrigger 정상 호출 완료: ${user.email}`);
          } catch (err) {
            console.error(`❌ handleDeathTrigger 내부 오류:`, err.message, err.stack);
          }

          check.finalTriggered = true;
          await check.save();
        }
      }

      await updateUser(updatedUser);
    }

    console.log(`[${new Date().toISOString()}] 사용자 상태 평가 완료`);
  } catch (err) {
    console.error('❌ 상태 평가 오류:', err);
  }
});

module.exports = { getAllUsers, updateUser };