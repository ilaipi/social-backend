/**
 * 微信用户
 */
module.exports = function (Schema) {
  const WechatUserSchema = new Schema({
    openid: {
      type: String,
      comment: 'openid',
      remark: '每个用户在每个公众号中的唯一标识'
    },
    originId: {
      type: String,
      comment: '所属服务号'
    },
    sex: {
      type: String,
      comment: '性别',
      remark: '微信中设置的性别'
    },
    province: {
      type: String,
      comment: '省份',
      remark: '微信中设置省份'
    },
    city: {
      type: String,
      comment: '普通用户个人资料填写的城市',
      remark: '微信中设置城市'
    },
    country: {
      type: String,
      comment: '国家，如中国为CN',
      remark: '微信中设置国家'
    },
    name: {
      type: String,
      comment: '微信昵称'
    },
    headImg: {
      type: String,
      comment: '微信头像'
    },
    unionid: {
      type: String,
      comment: '整合多个微信公众号的用户'
    },
    subscribe: {
      type: Date,
      comment: '关注时间',
      remark: '最新关注时间，取消关注时置空'
    },
    source: {
      type: String,
      comment: '关注源',
      remark: '第一次关注的关注源，值和WechatActionRecord.content.type相同，不随着多次关注而改变'
    },
    token: {
      type: String,
      comment: '认证身份标识'
    },
    auth: {
      type: Schema.Types.Mixed,
      comment: '认证信息',
      remark: '认证完成后微信服务器响应的信息'
    },
    email: {
      type: [String],
      comment: '邮箱地址'
    },
    sessionKey: {
      type: String,
      comment: '登录凭证'
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      comment: 'User表的id',
      remark: '关联wechatUser和user'
    }
  });
  return ['WechatUser', WechatUserSchema];
};
