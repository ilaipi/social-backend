import { getApi } from './../../../../../common/initial/wechat/api';

import logger from '../../../../util/log';

const handlers = {
};

/**
 * 点击key类型菜单事件
 */
export default async function (data) {
  const { EventKey } = data;
  const handler = handlers[EventKey];
  if (!handler) {
    logger.warn('未处理的菜单', { data });
    return '';
  }
  const { ToUserName: originId, FromUserName: openid } = data;
  const api = await getApi({ originId });
  const user = await api.getUser({openid, lang: 'zh_CN'});
  return await handler.handle({ data, user });
};
