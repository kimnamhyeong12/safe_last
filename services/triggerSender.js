const Will = require('../models/Will');
const Friend = require('../models/Friend');
const { sendEmail } = require('../utils/mailer');

async function handleDeathTrigger(userId) {
  try {
    console.log(`🚀 [TRIGGER START] 유언 전송 시작 for userId: ${userId}`);

    const wills = await Will.find({ userId });
    const friends = await Friend.find({ ownerId: userId });

    console.log(`📦 유언 개수: ${wills.length}`);
    console.log(`👥 보호자 수: ${friends.length}`);

    for (const will of wills) {
      if (!will._id) continue;

      const viewLink = `http://localhost:5000/login.html?redirect=/view.html?id=${will._id}`;

      for (const friend of friends) {
        if (!friend.email) continue;

        try {
          await sendEmail({
            to: friend.email,
            subject: '💌 [SafeLast] 고인의 마지막 메시지가 도착했습니다',
            text: `${friend.name}님께

고(故)인의 마지막 메시지가 도착했습니다.
해당 유언은 암호화된 상태로 안전하게 저장되어 있으며, 아래 링크를 통해 로그인 후 열람하실 수 있습니다.

🔗 유언 열람하기: ${viewLink}

※ 본 링크는 일정 시간 후 만료될 수 있으며, 유언자의 사망 판정 후에만 활성화됩니다.
감사합니다.
- SafeLast 팀 드림`,
          });

          console.log(`✅ 메일 전송 완료 → ${friend.email}`);
        } catch (e) {
          console.error(`❌ 메일 전송 실패 (${friend.email}):`, e.message);
        }
      }
    }

    console.log(`✅ [TRIGGER END] 유언 전송 완료 for userId: ${userId}`);
  } catch (err) {
    console.error('❌ handleDeathTrigger 전체 실패:', err);
  }
}

module.exports = { handleDeathTrigger };
