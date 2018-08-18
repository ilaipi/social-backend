/**
 * 客服联系 消息记录
 */
module.exports = (Schema) => {
  const ContactMsg = new Schema({
    wechatUser: {
      type: Schema.ObjectId,
      comment: '发送客服消息的用户',
      ref: 'WechatUser'
    },
    date: {
      type: Date,
      comment: '发送时间'
    },
    content: {
      type: String,
      comment: '消息内容'
    },
    miniOriginId: {
      type: String,
      comment: '小程序原始ID'
    }
  });
  return ['ContactMsg', ContactMsg];
};
