import querystring from 'querystring';

import config from './../../util/config';
import logger from './../../util/log';

const [, service] = require('./../../util/service');

const getArticles = async ({ account, originId, wechatUser, type, src }) => {
  const host = service.compileHost(config.hosts.local, originId);
  const search = { type, src, wechatUser };

  let { description, picUrl, title } = account;
  if (!picUrl) {
    picUrl = config.picUrl.register;
  }

  let pathname;
  if (account.scope === 'live') {
    pathname = 'register';
    if (!description) {
      description = '👉请立即点击完成注册，即可查看手术点评直播、手术直播、病案讨论、会议直播等联盟精品内容。';
    }
    if (!title) {
      title = '您好，请您注册并完善个人信息，即可查看精彩内容。';
    }
  } else if (account.scope === 'inner') {
    pathname = 'mrRegister';
    if (!description) {
      description = '👉请立即点击完成注册，即可邀请医生上线和体验医生端虚拟账号。';
    }
    if (!title) {
      title = '您好，请您注册并完善个人信息，即可查看精彩内容。';
    }
  }
  const url = `${host}/open/link/${pathname}?${querystring.stringify(search)}`;
  logger.info({ url }, 'generate article url');

  const articles = [
    {
      description,
      title,
      url,
      picurl: picUrl
    }
  ];
  return {
    type: 'News',
    content: articles
  };
};

module.exports = [
  'wechatAccount',
  { getArticles }
];
