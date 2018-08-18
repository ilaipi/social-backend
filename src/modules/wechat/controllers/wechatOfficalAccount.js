/**
 * by 范邦雨
 * 2017 09 13 18:06
 * 公众号配置管理
 */

import mongoose from 'mongoose';
import { find, isEmpty } from 'lodash';

const createWechatOfficalAccount = async ctx => {
  const body = ctx.request.body;
  const WechatAccount = mongoose.model('WechatAccount');
  ctx.body = await WechatAccount.create(body);
};

const getList = async ctx => {
  const {page, limit, name} = ctx.request.query;
  const condition = {};
  if (name) {
    const regExpName = new RegExp(name);
    condition.name = regExpName;
  }
  const WechatAccount = mongoose.model('WechatAccount');
  ctx.body = await WechatAccount.paginate(condition, { page: +page, limit: +limit });
};

const modifyWechatOfficalAccount = async ctx => {
  const {id} = ctx.request.body;
  const WechatAccount = mongoose.model('WechatAccount');
  ctx.body = await WechatAccount.update({_id: id}, {$set: ctx.request.body});
};

const deleteWechatOfficalAccount = async ctx => {
  const {id} = ctx.request.query;
  const WechatAccount = mongoose.model('WechatAccount');
  ctx.body = await WechatAccount.remove({_id: id});
};

const getAllList = async ctx => {
  const {name} = ctx.request.query;
  const condition = {};
  if (name) {
    const regExpName = new RegExp(name);
    condition.name = regExpName;
  }
  const customerRole = find(ctx.account.role, role => role > 10);
  if (customerRole) condition.customer = ctx.account.customer;
  const WechatAccount = mongoose.model('WechatAccount');
  ctx.body = await WechatAccount.find(condition);
};

/**
 * 获取登陆账号的绑定公众号
 */
const getAccount = async ctx => {
  const { live, inner } = ctx.account;
  if (isEmpty(live) && isEmpty(inner)) {
    ctx.body = [];
    return;
  }
  const results = [];
  if (!isEmpty(live)) results.push({ id: live.id, originId: live.originId, name: live.name });
  if (!isEmpty(inner)) results.push({ id: inner.id, originId: inner.originId, name: inner.name });
  ctx.body = results;
};

module.exports.register = function ({ router }) {
  // 新增
  router.post('/wechatOfficalAccount/create', createWechatOfficalAccount);
  // 查询
  router.get('/wechatOfficalAccount/getList', getList);
  router.get('/wechatOfficalAccount/all', getAllList);
  router.get('/wechatOfficalAccount/account', getAccount);
  // 修改
  router.put('/wechatOfficalAccount/modify', modifyWechatOfficalAccount);
  // 删除
  router.delete('/wechatOfficalAccount/delete', deleteWechatOfficalAccount);
};
