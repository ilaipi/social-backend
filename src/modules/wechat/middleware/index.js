import mongoose from 'mongoose';
import { startsWith } from 'lodash';

import { getBot } from './../../../common/initial/wechat/bot';
import events from './events/';
import textHandle from './textHandle';

const wechat = () => {
  return async (ctx, next) => {
    if (!startsWith(ctx.path, '/open/mini')) {
      await next();
      return;
    }
    const { originId } = ctx.query;
    if (!originId) {
      ctx.log.warn('微信开发者地址必须带originId参数');
      await next();
      return;
    }

    const wechat = await getBot({ originId });
    const fn = wechat.middleware;
    const api = fn.apply(wechat, [(message) => {
      ctx.log.info({ message, xml: ctx.weixin_xml }, 'wechat push message');
      switch (message.MsgType) {
        case 'event':
          /* 延迟10ms执行，立即响应微信服务器，避免出现服务不可用的情况，以及重复推送事件的情况 */
          /* ctx.weixin_xml是推送过来的原始的xml内容 */
          setTimeout(() => events(message, ctx.weixin_xml), 10);
          break;
        case 'text':
          setTimeout(() => textHandle(message, ctx.weixin_xml), 10);
          break;
        case 'audio':
          break;
      }
      return '';
    }]);
    await api(ctx, next);
  };
};

export default wechat;

export const authenticated = wechatPrefix => async (ctx, next) => {
  if (!startsWith(ctx.path, wechatPrefix)) {
    await next();
    return;
  }
  const { 'x-token': token } = ctx.header;
  ctx.log.info('ctx.token', token, ctx.header);
  if (!token) {
    ctx.status = 401;
    ctx.body = { success: false, message: '需要微信认证' };
    return;
  }
  const WechatUser = mongoose.model('WechatUser');
  const wechatUser = await WechatUser.findById(token);
  if (wechatUser) {
    ctx.session.authInfo = wechatUser;
    await next();
  }
};
