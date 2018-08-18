import mongoose from 'mongoose';
import querystring from 'querystring';

import config from './../../../../util/config';

const [ , wechatUserService ] = require('./../../../services/wechatUser');
const [ , sceneService ] = require('./../../../services/scene');
const [ , helper ] = require('./../../../../util/service');
const [ , wechatAccountService ] = require('./../../../services/wechatAccount');

/**
 * 页面可以有多个区域出现二维码：
 * signup 报名
 * play 回放页面播放视频
 * top 文章页面标题下面的关注按钮
 * middle 评论区上面的关注按钮
 * bottom 弃用。本打算放在页面最底部
 * comment 点击写评论弹出的二维码
 */
const handle = async ({ scene, data: { ToUserName: originId }, user }) => {
  const src = scene.data.src;
  const role = scene.data.role;
  const share = scene.data.share;
  const action = scene.data.action;
  const WechatAccount = mongoose.model('WechatAccount');
  const account = await WechatAccount.findOne({ originId });
  const content = {
    src,
    role,
    type: 'share',
    share,
    action
  };
  const WechatActionRecord = mongoose.model('WechatActionRecord');
  const wechatUser = await wechatUserService.saveUser(user, originId, 'share');
  const { action: subscribe } = wechatUser;
  if (wechatUser && src === wechatUser.id.toString()) {
    // 自己扫描自己的邀请二维码，不做处理
    content.type = 'self';
  }
  await WechatActionRecord.create({
    content,
    originId,
    wechatUser: wechatUser.id,
    action: subscribe,
    date: new Date()
  });
  if (content.type === 'self') return '自己的分享让别人去扫描吧！';
  // 推的第一条消息应该都是企业的欢迎语
  let messages = account.messages;
  // gh_1ac9f22658e6 世界骨关节之窗 不需要注册
  if (!wechatUser.user && originId !== 'gh_1ac9f22658e6') { // 已注册用户不再推注册链接
    // 未注册第二条推送注册链接
    const articles = await wechatAccountService.getArticles({ account, originId, wechatUser: wechatUser.id });
    messages.push(articles);
  }
  // 第三条推地址，以图文消息的形式，点击打开直播推广页面。
  const CategoryContent = mongoose.model('CategoryContent');
  const categoryContent = await CategoryContent.findById(share);
  const categoryContentParams = {
    fromWechatUser: src,
    id: share,
    type: categoryContent.type
  };
  const url = `${helper.compileHost(config.hosts.local, originId)}/open/link/page?${querystring.stringify(categoryContentParams)}`;
  const articlesZhiBo = [
    {
      title: categoryContent.title1 || categoryContent.title2,
      description: categoryContent.desc,
      url,
      picurl: categoryContent.thumb
    }
  ];
  messages.push({ type: 'News', content: articlesZhiBo });
  return messages;
};

/**
 * 创建一个场景并且返回
 * src: mr_id/hcp_id
 * type: share
 * share: categorycontent.id
 * action: signup/play/top/middle/bottom
 * @param
 */
const generate = async ({ src: fromWechatUser, type, action, share, originId }) => {
  const WechatUser = mongoose.model('WechatUser');
  // fromWechatUser 有可能没有，通过公众号菜单里面点开的，或者模版消息点开的
  const wechatUser = (fromWechatUser && await WechatUser.findById(fromWechatUser)) || {};
  const User = mongoose.model('User');
  let user = {};
  if (wechatUser.user) {
    user = await User.findById(wechatUser.user);
  }
  const model = {
    data: {
      share,
      action,
      src: fromWechatUser,
      role: user.role
    },
    type,
    originId
  };
  return await sceneService.createTempScene(originId, model, 30 * 60);
};

export { handle, generate };
