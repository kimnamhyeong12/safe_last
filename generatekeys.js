const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// RSA 키 쌍 생성
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',   // 공개키는 spki
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',  // 개인키는 pkcs8
    format: 'pem',
  }
});

const keysDir = path.join(__dirname, 'keys');
if (!fs.existsSync(keysDir)) fs.mkdirSync(keysDir);

fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey);
fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey);

console.log('✅ RSA 키 쌍 생성 완료 (spki/public + pkcs8/private)');
