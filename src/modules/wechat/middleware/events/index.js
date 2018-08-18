import { toLower, isEmpty, isString, isArray, isObject } from 'lodash';

import scan from './scan/';
import click from './click/';

import { getApi } from './../../../../common/initial/wechat/api';

const events = {
  scan,
  click
};

export default async (message) => {
  const event = events[toLower(message.Event)];
  if (!event) return '不支持的事件';
  const messages = await event(message);
  if (isEmpty(messages)) return '';
  const { FromUserName: openid } = message;
  const api = await getApi({ originId: message.ToUserName });
  if (isString(messages)) {
    await api.sendText(openid, messages);
  }
  if (isArray(messages)) {
    const timer = setInterval(async () => {
      let msg = messages.shift();
      if (isEmpty(messages)) {
        clearInterval(timer);
      }
      if (!msg) return;
      if (isString(msg)) {
        await api.sendText(openid, msg);
      }
      if (isObject(msg) && msg.content) { // { type, content }
        await api[`send${msg.type}`](openid, msg.content);
      }
    }, 1000);
  }
};
