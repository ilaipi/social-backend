import mongoose from 'mongoose';
import Promise from 'bluebird';
import originWechat from 'co-wechat';

const bots = {};

const createBot = ({ appid, aes, token }) => (
  originWechat({
    appid: appid,
    encodingAESKey: aes,
    token: token
  })
);

export default createBot;

export const getBot = async ({ originId }) => {
  if (bots[originId]) {
    return bots[originId];
  }
  const WechatAccount = mongoose.model('WechatAccount');
  const account = await WechatAccount.findOne({ originId }, { appid: 1, aes: 1, token: 1, originId: 1 });
  if (!account) Promise.reject(new Error(`公众号尚未配置 ${originId}`));
  bots[originId] = createBot(account);
  return bots[originId];
};
