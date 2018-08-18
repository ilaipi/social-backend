import rp from 'request-promise';
import mongoose from 'mongoose';
import { forEach } from 'lodash';

import logger from '../../modules/util/log';
import { scenes } from './middleware/events/scan/';
import { getApi } from './../../common/initial/wechat/api';

const [ , helper ] = require('../util/service');

const sendTemplate = async ({ scope, originId, openid, link: url, params, content }) => {
  const WechatTemplate = mongoose.model('WechatTemplate');
  const wechatTemplate = await WechatTemplate.findOne({
    scope: {$all: scope}
  });
  forEach(wechatTemplate.fields, ({name, color}) => {
    params[name].color = color;
  });
  const TemplateMessage = mongoose.model('TemplateMessage');
  const _id = mongoose.Types.ObjectId();
  const link = helper.mergeUrl(url, { wechatMessageId: _id.toString(), from: 'tm' });
  await TemplateMessage.create({
    _id,
    openid,
    originId,
    template: wechatTemplate.number,
    link,
    content,
    params
  });
  const code = await addTemplate({ originId, templateNumber: wechatTemplate.number });
  const api = await getApi({ originId });
  logger.info('params', params);
  await api.sendTemplate(openid, code, link, null, params);
};

/**
 * 群发模板消息
 * @param {String} link 阅读原文链接
 * @param {String} wechatOfficial 公众号原始id
 * @param {String} code 模板消息在数据库中的id
 * @param {Object} params 发送模板消息需要的参数
 * @param {Array} openids 接收模板消息的用户的 openid 数组
 * @param {Boolean} all 全发标识。如果为 true, 则表示发给该公众号所有已关注的微信用户
 */
const massSendTemplate = async (data) => {
  const { link, wechatOfficial: originId, code: wechatTemplateId, params, openids, all } = data;
  const WechatTemplate = mongoose.model('WechatTemplate');
  const wechatTemplate = await WechatTemplate.findById(wechatTemplateId).select('number scope');

  let users = openids;
  if (all) {
    users = await mongoose.model('WechatUser').distinct('openid', { originId, subscribe: {$ne: null} });
  }

  for (let i = 0, length = users.length; i < length; i++) {
    try {
      await sendTemplate({scope: wechatTemplate.scope, link, originId, params, openid: users[i]});
    } catch (e) {
      logger.warn('群发模板消息失败, openid = ', users[i], e);
    }
  }
};

const sendText = async ({originId, openid, data}) => {
  const api = await getApi({ originId });
  await api.sendText(openid, data);
};

const generateQrcode = async (query) => {
  let url;
  const type = query.type;
  const handler = scenes[type];
  logger.info({ query, scenes, handler }, 'generate qrcode query');
  if (!handler) return url;
  const scene = await handler.generate(query);
  logger.info({ url: scene.url }, 'generate qrcode short url');
  const qrStream = await rp({
    url: scene.url,
    encoding: null
  });
  return `data:image/jpg;base64,${qrStream.toString('base64')}`;
};

const addTemplate = async ({ originId, templateNumber }) => {
  const WechatTemplateCustomize = mongoose.model('WechatTemplateCustomize');
  const wechatTemplate = await WechatTemplateCustomize.findOne({
    template: templateNumber,
    originId
  });
  if (wechatTemplate) {
    return wechatTemplate.code;
  }
  const api = await getApi({ originId });
  const content = await api.addTemplate(templateNumber);
  await WechatTemplateCustomize.create({
    originId,
    template: templateNumber,
    code: content.template_id
  });
  return content.template_id;
};

/**
 * 客服--发送图文消息
 */
const sendNewsByKefu = async ({ originId, openid, articles = [] }) => {
  const api = await getApi({ originId });
  await api.sendNews(openid, articles);
};

module.exports = ['wechat', {
  sendTemplate,
  sendText,
  generateQrcode,
  sendNewsByKefu,
  massSendTemplate
}];
