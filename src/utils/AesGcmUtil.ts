import CryptoJS from "crypto-js";

/** 兼容去空白/补= */
function normalizeBase64(input: string) {
  if (!input) return "";
  let b64 = input.trim().replace(/[\r\n\s]/g, "");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  return b64;
}

function b64ToWA(b64: string) {
  return CryptoJS.enc.Base64.parse(normalizeBase64(b64));
}

function waToB64(wa: CryptoJS.lib.WordArray) {
  return CryptoJS.enc.Base64.stringify(wa);
}

/**
 * AES-CBC + PKCS7
 * 返回 { iv: base64, data: base64(ciphertext) }
 */
export function aesCbcEncrypt(plainText: string, keyBase64: string) {
  const key = b64ToWA(keyBase64);

  // key 必须是 16/24/32 字节
  const keyBytes = key.sigBytes;
  if (![16, 24, 32].includes(keyBytes)) {
    throw new Error(`AES key length invalid: ${keyBytes} bytes (need 16/24/32)`);
  }

  // CBC 需要 16字节 IV，每次随机生成
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return {
    iv: waToB64(iv),
    data: waToB64(encrypted.ciphertext), // 注意：这里只取 ciphertext，不要用 encrypted.toString()
  };
}
