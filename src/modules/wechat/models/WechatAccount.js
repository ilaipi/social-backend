/**
 * 微信服务号
 */
module.exports = function (Schema) {
  const WechatAccountSchema = new Schema({
    name: {
      type: String,
      comment: '公众号名字'
    },
    originId: {
      type: String,
      comment: '原始ID'
    },
    customer: {
      type: Schema.Types.ObjectId,
      comment: '客户ObjectID（盖平、耳鼻喉）'
    },
    appid: {
      type: String,
      comment: 'AppId'
    },
    secret: {
      type: String,
      comment: 'AppSecret'
    },
    token: {
      type: String,
      comment: 'token',
      remark: '服务号后台服务器配置的token'
    },
    aes: {
      type: String,
      comment: 'EncodingAESKey',
      remark: '服务号后台服务器配置的EncodingAESKey'
    },
    accessToken: {
      type: Schema.Types.Mixed,
      comment: '访问token',
      remark: '主动调用api需要用到的token'
    },
    ticketToken: {
      type: Schema.Types.Mixed,
      comment: '票据token',
      remark: '主动调用api需要用到的ticket'
    },
    scope: {
      type: String,
      enum: ['inner', 'live'],
      comment: '公众号类型',
      remark: 'inner:企业内部使用，live:直播使用'
    },
    messages: {
      type: [],
      comment: '服务号通用关注欢迎语'
    },
    title: {
      type: String,
      comment: '关注后，发送的图文消息的标题'
    },
    description: {
      type: String,
      comment: '关注后，发送的图文消息的描述'
    },
    picUrl: {
      type: String,
      comment: '关注后，发送的图文消息的背景图'
    },
    exchangeKey: {
      type: String,
      comment: '变现猫的appKey'
    },
    theme: {
      type: Schema.Types.Mixed,
      comment: '主题配置',
      remark: '可以没有值。默认是绿色主题'
    },
    isServiceNum: {
      type: Boolean,
      comment: '是否是服务号',
      default: true
    }
  });
  return ['WechatAccount', WechatAccountSchema];
};
