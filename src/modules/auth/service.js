import crypto from 'crypto';

import config from '../util/config';

/**
 * @param { Object } options
 * @definition
 *   {
 *     sessionKey,
 *     encryptedData,
 *     iv
 *   }
 */
export const decrypt = async (options) => {
  // base64 decode
  const sessionKey = new Buffer(options.sessionKey, 'base64');
  const encryptedData = new Buffer(options.encryptedData, 'base64');
  const iv = new Buffer(options.iv, 'base64');
  let decoded;

  try {
     // 解密
    const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv);
    // 设置自动 padding 为 true，删除填充补位
    decipher.setAutoPadding(true);
    decoded = decipher.update(encryptedData, 'binary', 'utf8');
    decoded += decipher.final('utf8');

    decoded = JSON.parse(decoded);
  } catch (err) {
    throw new Error('Illegal Buffer');
  }

  if (decoded.watermark.appid !== config.mina.appId) {
    throw new Error('Illegal Buffer');
  }

  return decoded;
};

export const name = 'auth';
