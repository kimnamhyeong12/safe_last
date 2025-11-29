require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// 기존 텍스트 메일 발송 함수
async function sendEmail({ to, subject, text }) {
  try {
    await transporter.sendMail({
      from: `"SafeLast 유언 시스템" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log(`📤 Email successfully sent to ${to}`);
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
}

// 새로운 확인용 HTML 메일 발송 함수
async function sendConfirmationEmail(user) {
  const confirmUrl = `http://localhost:5000/confirm?id=${user._id}`;

  const html = `
    <h2>안녕하세요, SafeLast입니다.</h2>
    <p>생존 여부 확인을 위해 아래 버튼을 눌러주세요.</p><br>
    <a href="${confirmUrl}" style="padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">✅ 확인하기</a>
    <br><br><p>확인하지 않을 경우 위험 수준이 증가합니다.</p>
  `;

  try {
    await transporter.sendMail({
      from: `"SafeLast 유언 시스템" <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: '📩 생존 확인 요청 메일',
      html,
    });
    console.log(`📨 확인 메일 전송 완료: ${user.email}`);
  } catch (error) {
    console.error('❌ 확인 메일 전송 실패:', error);
  }
}

module.exports = {
  sendEmail,
  sendConfirmationEmail,
};
