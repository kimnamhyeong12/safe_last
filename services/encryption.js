const crypto = require('crypto');

// RSA 키 쌍 자동 생성
function generateRSAKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
  });

  return { publicKey, privateKey };
}

// 암호화 (AES + RSA 공개키)
function encryptText(plainText, publicKey) {
  const aesKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  // RSA 공개키로 AES 키 암호화
  const encryptedAESKey = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    aesKey
  ).toString('base64');

  return {
    encryptedData: encrypted,
    encryptedKey: encryptedAESKey,
    iv: iv.toString('base64'),
  };
}

// 복호화 (RSA 개인키 → AES → 평문)
function decryptText(encryptedData, encryptedKey, ivBase64, privateKey) {
  const aesKey = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, // 복호화도 OAEP로 맞춤
    },
    Buffer.from(encryptedKey, 'base64')
  );

  const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, Buffer.from(ivBase64, 'base64'));
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

module.exports = { generateRSAKeyPair, encryptText, decryptText };
