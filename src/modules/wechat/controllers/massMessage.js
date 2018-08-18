/**
 * by 范邦雨
 * 2017 10 27 10:06
 * 群发模板消息或图文消息
 */

import fs from 'fs';

import mongoose from 'mongoose';
import _ from 'lodash';
import querystring from 'querystring';

import logger from '../../util/log';
import config from './../../util/config';
import ServicesApi from '../services/api';
import UtilService from '../../util/service';

const [, wechatApi] = ServicesApi;
const [, helper] = UtilService;

/**
 * 发送模板消息
 * @param {*} ctx
 */
const newSendTemplate = async ctx => {
  const { wechat } = ctx.services;
  const body = ctx.request.body;
  await wechat.massSendTemplate(body);
  ctx.body = {success: '1'};
};

const getTemplateList = async ctx => {
  const WechatTemplate = mongoose.model('WechatTemplate');
  // let {originId} = ctx.request.query;
  const wechatTemplate = await WechatTemplate.find().select('title fields number');
  ctx.body = wechatTemplate;
};

const getOfficialAccountsList = async ctx => {
  const WechatAccount = mongoose.model('WechatAccount');
  const where = {};
  const customerRole = _.find(ctx.account.role, role => role > 10);
  if (customerRole) where.customer = ctx.account.customer;
  ctx.body = await WechatAccount.find(where).select('name originId');
};

const getNewsList = async ctx => {
  const {type, page = 0, limit = 1000, originId} = ctx.request.query;
  const api = await wechatApi.getApi({ originId: originId });
  const result = await api.getMaterials(type, page, limit);
  ctx.body = JSON.parse(result.toString());
};

const getNewsMaterial = async ctx => {
  const {media_id: mediaId, id} = ctx.request.query;
  const WechatAccount = mongoose.model('WechatAccount');
  const woaInfo = await WechatAccount.findById(id);
  const api = await wechatApi.getApi({ originId: woaInfo.originId });
  const result = await api.getMaterial(mediaId);
  ctx.body = JSON.parse(result.toString());
};

async function sendNewsByDepartment({originId, objNews, api, openids}) {
  const outApi = await wechatApi.getApi({ originId });
  // 2, 下载对应的图片 并上传照片, 删除图片
  const articles = [];
  for (let artical of objNews.news_item) {
    const imageBuffer = await api.getMaterial(artical.thumb_media_id);
    const path = `./${artical.thumb_media_id}.jpg`;
    await fs.writeFileSync(path, imageBuffer);
    const resultUpdate = await outApi.uploadMaterial(path, 'image');
    const outMediaId = JSON.parse(resultUpdate.toString()).media_id;
    await fs.unlinkSync(path);
    articles.push({
      title: artical.title,
      thumb_media_id: outMediaId,
      author: artical.author,
      digest: artical.digest,
      show_cover_pic: artical.show_cover_pic,
      content: artical.content,
      content_source_url: artical.content_source_url
    });
  }
  // 3, 上传图文消息
  const newNewsMediaIdResult = await outApi.uploadNewsMaterial({articles});
  const newNewsMediaId = JSON.parse(newNewsMediaIdResult.toString()).media_id;
  logger.info('新上传的永久图文素材的media_id为: ', newNewsMediaId);
  logger.info('此次群发图文消息发送给一下用户 ', openids);
  // 5, 群发图文消息
  try {
    const resultMassSend = await outApi.massSendNews(newNewsMediaId, openids);
    logger.info('这次群发的图文消息的msg_id为: ', resultMassSend);
  } catch (error) {
    logger.info('群发图文消息报错： ', error);
  }
}

const massSendNews = async ctx => {
  // 1， 获取到当前图文消息
  const {code: mediaId, officialId: originId, openids, all} = ctx.request.body;
  // const WechatUser = mongoose.model('WechatUser');
  // const openids = await WechatUser.find({ originId, subscribe: {$ne: null} }).distinct('openid');
  const api = await wechatApi.getApi({ originId });

  let users = openids;
  if (all) {
    users = await mongoose.model('WechatUser').distinct('openid', { originId, subscribe: {$ne: null} });
  }

  const result = await api.getMaterial(mediaId);
  const objNews = JSON.parse(result.toString());

  try {
    await sendNewsByDepartment({originId, objNews, api, openids: users});
  } catch (e) {
    logger.warn('群发图文消息失败', e);
  }
  ctx.body = {success: 1};
};

/**
 * 根据内容ID，类型生成URL地址
 */
const generatorUrl = ({ originId, contentId, type }) => {
  const search = {
    id: contentId,
    type
  };
  const url = `${helper.compileHost(config.hosts.local, originId)}/open/link/page?${querystring.stringify(search)}`;
  return url;
};

/**
 * 通过客服，发送图文消息
 */
const sendNewsByKefu = async ctx => {
  const { wechat: wechatApi } = ctx.services;
  const { wechatOfficial: originId, openids, news, all } = ctx.request.body;

  const CategoryContent = mongoose.model('CategoryContent');

  const articles = [];
  for (let i = 0, length = news.length; i < length; i++) {
    const {title, description, id: contentId, picurl} = news[i];
    const content = await CategoryContent.findById(contentId).select('title1 title2 thumb type');
    const url = generatorUrl({ originId, type: content.type, contentId });
    let artical = {
      description,
      url,
      title,
      picurl
    };
    if (!title || !picurl) {
      artical.title = title || content.title1 || content.title2;
      artical.picurl = picurl || content.thumb;
    };
    articles.push(artical);
  }

  let users = openids;
  if (all) {
    users = await mongoose.model('WechatUser').distinct('openid', { originId, subscribe: {$ne: null} });
  }
  for (let i = 0, length = users.length; i < length; i++) {
    try {
      await wechatApi.sendNewsByKefu({ originId, openid: users[i], articles });
    } catch (e) {
      logger.warn(`客服发送图文消息失败, openid = ${users[i]}`, e);
    }
  }
  ctx.body = { success: 'success', code: 200 };
};

/**
 * 通过客服，发送图文消息--测试
 */
const sendNewsByKefuTest = async ctx => {
  const { wechat: wechatApi } = ctx.services;
  const originId = 'gh_85be8ef28950'; // "三甲健康"
  const openid = 'o1syiwNTHoaAZ6LRNjQG6PuLq0ZQ'; // 似水
  const contentId = '5a2bf0baa6f2e8ab95b64343';
  const url = generatorUrl({ originId, type: 'News', contentId });
  const articles = [
    {
      title: '测试图文',
      description: '这是一个描述',
      url,
      picurl: 'http://cimg.adouhealth.com/11.jpg'
    }, {
      title: '测试图文222',
      description: '这是一个描述2',
      url,
      picurl: 'http://cimg.adouhealth.com/11.jpg'
    }, {
      title: '测试图文',
      description: '这是一个描述',
      url,
      picurl: 'http://cimg.adouhealth.com/11.jpg'
    }
  ];
  try {
    await wechatApi.sendNewsByKefu({ originId, openid, articles });
  } catch (e) {
    logger.warn('客服发送图文消息失败', e);
  }
  ctx.body = { success: 'success', code: 200 };
};

/**
 * 通过定时任务发送群发模板消息
 */
const massSendTplBySchedule = async ctx => {
  // 发送模板所需参数 { scope, originId, openid, link, params, content, read }
  const { job } = ctx.services;
  const { data, date } = ctx.request.body;
  // Schedule.scheduleJob(new Date(date), () => {
  //   wechat.massSendTemplate(data);
  // });
  await job.createJobAndSave({
    data,
    date: new Date(date),
    func: 'massSendTemplate'
  });
  ctx.body = {success: '1'};
};

export function register({ router }) {
  // 模板消息
  router.post('/massMessage/sendTemplate', newSendTemplate);
  // 获取模板消息列表
  router.get('/massMessage/getTemplateList', getTemplateList);
  // 获取全部公众号
  router.get('/massMessage/getOfficialAccountsList', getOfficialAccountsList);
  // 根据公众号来获取所有图文消息
  router.get('/massMessage/getNewsList', getNewsList);
  // 根据media_id 来获取图文消息
  router.get('/massMessage/getNewsMaterial', getNewsMaterial);
  // 群发图文消息
  router.post('/massMessage/massSendNews', massSendNews);
  router.post('/massMessage/sendKefuNews', sendNewsByKefu);
  router.post('/massMessage/sendNews/test', sendNewsByKefuTest);
  // 定时群发--模板消息
  router.post('/massMessage/template/schedule', massSendTplBySchedule);
}
