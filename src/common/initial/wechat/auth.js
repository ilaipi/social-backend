import mongoose from 'mongoose';
import passport from 'koa-passport';
import WechatStrategy from 'passport-wechat';

const [ , service ] = require('./../../../modules/wechat/services/wechatUser');

const allStrategy = {};

const init = ({ appid, secret, originId }) => (
  new WechatStrategy({
    appID: appid,
    appSecret: secret,
    client: 'wechat',
    name: originId,
    lang: 'zh_CN',
    saveToken: async (openid, accessToken, cb) => {
      await service.saveWechatAuth({ openid, auth: accessToken });
      cb(null, accessToken);
    },
    getToken: async (openid, cb) => {
      const wechatToken = await service.getToken({ openid });
      cb(null, wechatToken.auth);
    },
    scope: 'snsapi_base' // 'snsapi_base'
  }, async (accessToken, refreshToken, profile, expires, done) => {
    const wechatUser = await service.save(profile, originId);
    done(null, wechatUser);
  })
);

export default init;

export const getStrategy = async (id) => {
  let originId = id;

  // 生产环境 会议即将开始的模板消息，推出去的链接，originId是空的
  // 这里做一下兼容
  // 2018/7/1后可以删除
  if (originId === 'gh_') {
    originId = 'gh_7b5168c527ea';
  }

  if (allStrategy[originId]) {
    return allStrategy[originId];
  }
  const WechatAccount = mongoose.model('WechatAccount');
  const account = await WechatAccount.findOne({ originId });
  if (!account) Promise.reject(new Error(`公众号尚未配置 ${originId}`));
  const strategy = init(account);
  passport.use(strategy);
  allStrategy[originId] = strategy;
  return strategy;
};
