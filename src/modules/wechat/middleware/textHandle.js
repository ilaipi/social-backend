import mongoose from 'mongoose';

// import logger from '../../util/log';

/**
 * message 数据内容展示
 * "ToUserName": "gh_5640de1ef206",
 * "FromUserName": "oyoKP4nOcnI7obvgQZnJdiVg_dRI",
 * "CreateTime": "1533720995",
 * "MsgType": "text",
 * "Content": "666",
 * "MsgId": "6587281515151234919",
 */
export default async (message) => {
  const ContactMsg = mongoose.model('ContactMsg');
  const WechatUser = mongoose.model('WechatUser');

  const {
    ToUserName: miniOriginId, FromUserName: openid, Content, CreateTime
  } = message;
  // PS: 用户可能存在多条数据，
  const user = await WechatUser.findOne({ openid }).select('_id');
  await ContactMsg.create({
    miniOriginId,
    content: Content,
    wechatUser: user._id,
    date: new Date(+CreateTime * 1000)
  });
};
