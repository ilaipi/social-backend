import mongoose from 'mongoose';
import Promise from 'bluebird';
import WechatApi from 'co-wechat-api';

const allApi = {};

const createApi = (account) => {
  const { appid, secret } = account;
  return new WechatApi(
    appid,
    secret,
    () => account.accessToken,
    async (accessToken) => {
      account.accessToken = accessToken;
      await account.save();
    }
  );
};

export default createApi;

export const getApi = async ({ originId }) => {
  if (allApi[originId]) {
    return allApi[originId];
  }
  const WechatAccount = mongoose.model('WechatAccount');
  const account = await WechatAccount.findOne({ originId });
  if (!account) Promise.reject(new Error(`公众号尚未配置 ${originId}`));
  allApi[originId] = createApi(account);
  return allApi[originId];
};
