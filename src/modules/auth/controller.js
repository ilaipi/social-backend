import mongoose from 'mongoose';
import axios from 'axios';
import sha1 from 'sha1';

import config from '../util/config';
import { decrypt } from './service';

const WECHAT_MINA_LOGIN_URL = 'https://api.weixin.qq.com/sns/jscode2session';

const login = async ctx => {
  const { query: { code } } = ctx.request;
  const { data } = await axios.get(WECHAT_MINA_LOGIN_URL, {
    params: {
      appid: config.mina.appId,
      secret: config.mina.appSecret,
      js_code: code,
      grant_type: 'authorization_code'
    }
  });
  const WechatUser = mongoose.model('WechatUser');
  const wechatUser = await WechatUser.findOne({ openid: data.openid });
  let token = mongoose.Types.ObjectId();
  if (wechatUser) {
    wechatUser.sessionKey = data.session_key;
    token = wechatUser.id;
    await wechatUser.save();
  } else {
    await WechatUser.create({
      _id: token,
      sessionKey: data.session_key,
      openid: data.openid,
      unionid: data.unionid
    });
  }
  ctx.log.info({ code, data }, '登录js_code');
  ctx.body = { success: true, token };
};

const userinfo = async ctx => {
  const { iv, rawData, encryptedData, signature } = ctx.request.body;
  const signature2 = sha1(`${rawData}${ctx.session.authInfo.sessionKey}`);
  if (signature !== signature2) {
    ctx.body = { success: false, message: '参数不合法' };
    return;
  }
  const decrypted = await decrypt({ iv, encryptedData, sessionKey: ctx.session.authInfo.sessionKey });
  const WechatUser = mongoose.model('WechatUser');
  await WechatUser.update({ _id: ctx.session.authInfo.id }, {
    ...decrypted,
    openid: decrypted.openId,
    name: decrypted.nickName,
    sex: decrypted.gender,
    headImg: decrypted.avatarUrl
  });
  ctx.body = { success: true };
};

const authed = ctx => {
  ctx.body = { authed: ctx.isAuthenticated(), account: ctx.account };
};

module.exports.register = function ({ unauth, wechat }) {
  unauth.get('/auth/login', login);
  wechat.post('/userinfo', userinfo);
  unauth.get('/authed', authed);
};
