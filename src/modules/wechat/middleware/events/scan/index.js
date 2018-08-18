import mongoose from 'mongoose';

import { getApi } from './../../../../../common/initial/wechat/api';

import * as share from './share';

import logger from '../../../../util/log';

/**
 * share:分享二维码
 */
const scenes = {
  share
};

export default async function (data) {
  const { Ticket: ticket } = data;
  const Scene = mongoose.model('Scene');
  const scene = await Scene.findOne({ ticket });
  const handler = scenes[scene.type];
  if (handler) {
    const { ToUserName: originId, FromUserName: openid } = data;
    const api = await getApi({ originId });
    const user = await api.getUser({openid, lang: 'zh_CN'});
    logger.info({ user }, `get wechat user ${openid}`);
    return await handler.handle({ scene, user, data });
  }
  logger.warn('无效的二维码', { data, scene });
  return '无效二维码';
};

/**
 * 根据scene的id生成ticket和shortUrl
 * @param {*} id scene的id
 * @param {*} originId 公众号的唯一id
 * @param {*} temp 临时二维码过期时间 以秒为单位
 */
const qrcodeUrl = async ({id, originId, temp}) => {
  const api = await getApi({ originId });
  let sceneTicket;
  if (temp) {
    sceneTicket = await api.createTmpQRCode(new Date().getTime(), temp);
  } else {
    sceneTicket = await api.createLimitQRCode(id);
  }
  let qrcodeURL = await api.showQRCodeURL(sceneTicket.ticket);
  const shortUrl = await api.shorturl(qrcodeURL);
  return {
    ticket: sceneTicket.ticket,
    url: shortUrl.short_url
  };
};

export { scenes, qrcodeUrl };
