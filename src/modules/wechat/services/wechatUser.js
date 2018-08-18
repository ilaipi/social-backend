import mongoose from 'mongoose';
import md5 from 'md5';
import { isEmpty, remove } from 'lodash';

import logger from '../../util/log';

/**
 * @param { Object } profile 微信认证后的对象，openid是必须的
 * 所有属性：openid nickname sex headimgurl
 * @param { String } originId 公众号id
 */
const save = async ($wechatUser, originId, subscribe, source) => {
  const { openid, nickname: name, sex, headimgurl: headImg,
    province, city, country, unionid } = $wechatUser;
  const WechatUser = mongoose.model('WechatUser');
  const wechatUser = await WechatUser.findOne({ openid: openid, originId });
  let user;
  if ((!wechatUser || !wechatUser.user) && unionid) {
    const other = await WechatUser.findOne({ openid: { $ne: openid }, unionid });
    if (other) user = other.user;
  }
  if (wechatUser) {
    wechatUser.unionid = wechatUser.unionid || unionid;
    wechatUser.user = wechatUser.user || user;
    wechatUser.name = name || wechatUser.name;
    wechatUser.headImg = headImg || wechatUser.headImg;
    wechatUser.sex = sex || wechatUser.sex;
    wechatUser.province = province || wechatUser.province;
    wechatUser.city = city || wechatUser.city;
    wechatUser.country = country || wechatUser.country;
    wechatUser.subscribe = subscribe || wechatUser.subscribe;
    wechatUser.source = wechatUser.source || source; // 优先使用原值，如果没有设置过值，表示第一次设置，用传进来的值
    await wechatUser.save();
    return wechatUser;
  } else {
    return await WechatUser.create({
      user,
      openid,
      originId,
      name,
      headImg,
      sex,
      province,
      city,
      country,
      unionid,
      subscribe,
      source
    });
  }
};

/**
 * @param { Object } user 微信用户信息api的返回对象
 * @param { String } originId
 * @param { String } source 关注源
 */
const saveUser = async (user, originId, source) => {
  const WechatUser = mongoose.model('WechatUser');
  let wechatUser = await WechatUser.findOne({ openid: user.openid });
  const action = (wechatUser && wechatUser.subscribe) ? 'resubscribe' : 'subscribe';

  // 如果已经关注了，那不能刷新关注时间
  // 如果是没有关注的，那就要更新一下关注时间
  const date = (wechatUser && wechatUser.subscribe) ? undefined : new Date();

  wechatUser = await save(user, originId, date, source);
  wechatUser.action = action;
  return wechatUser;
};

/**
 * @deprecated 不再需要token
 */
const getToken = async ({ openid, auth, originId, profile }) => {
  const WechatUser = mongoose.model('WechatUser');
  let wechatUser = await WechatUser.findOne({ openid, originId });
  let createWechatUser = { openid };
  if (profile) {
    createWechatUser = profile;
  }
  if (!wechatUser) wechatUser = await save(createWechatUser, originId);
  if (!wechatUser.token) {
    wechatUser.token = md5(`${openid}-${Date.now()}`);
  }
  if (auth) wechatUser.auth = auth;
  await wechatUser.save();
  return wechatUser;
};

/**
 * 微信认证成功后，更新认证信息
 */
const saveWechatAuth = async ({ openid, auth }) => {
  const WechatUser = mongoose.model('WechatUser');
  await WechatUser.update({ openid }, { auth });
};

/**
 * 微信认证时，先拿存储的认证信息
 */
const getWechatAuth = async (openid) => {
  const WechatUser = mongoose.model('WechatUser');
  return await WechatUser.findOne({ openid });
};

/**
 * @deprecated 不再通过openid获取注册用户信息
 */
const getUser = async ({ openid }) => {
  const WechatUser = mongoose.model('WechatUser');
  const wechatUser = await WechatUser.findOne({ openid });
  if (!wechatUser.user) return {};
  const User = mongoose.model('User');
  const user = await User.findById(wechatUser.user);
  return user;
};

/**
 * 微信端内容页面发送附件到邮箱时调用
 * 每次发送，都可以写一个邮箱。后端会把邮箱保存下来。
 * 前端也会把邮箱保存到storage，自动填充到邮箱输入框
 */
const saveEmail = async (wechatUser, email) => {
  if (!wechatUser) return;
  const { email: curr = [] } = wechatUser;
  const WechatUser = mongoose.model('WechatUser');
  if (isEmpty(curr)) {
    await WechatUser.update({ _id: wechatUser.id }, { email: [email] });
    return;
  }
  // 先从已有的中删除
  remove(curr, e => !e || e === email);
  // 然后添加到第一个，保证第一个是最后一次用的
  curr.unshift(email);
  logger.debug({ curr, email, wechatUser }, '更新用户的email');
  await WechatUser.update({ _id: wechatUser.id }, { email: curr });
};

module.exports = ['wechatUser', { save, saveUser, saveWechatAuth, getWechatAuth, getToken, getUser, saveEmail }];
