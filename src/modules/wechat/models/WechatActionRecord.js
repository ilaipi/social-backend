/**
 * 微信事件记录
 */
module.exports = function (Schema) {
  const WechatActionRecordSchema = new Schema({
    action: {
      type: String,
      comment: '分类名称',
      enum: [
        'view',
        'click',
        'location',
        'subscribe',
        'resubscribe',
        'unsubscribe'
      ]
    },
    content: {
      type: Schema.Types.Mixed,
      comment: '内容',
      definition: {
        type: [
          'self', // 扫描自己的二维码
          'share', // 通过分享内容中的关注二维码
          'hcp2hcp', // 医生邀请医生
          'mr2hcp', // 代表邀请医生
          'mrbind' // 代表绑定内容端
        ],
        erbihou: 'hlhcp' // 特邀令邀请，针对耳鼻喉公司的
      }
    },
    wechatUser: {
      type: Schema.ObjectId,
      comment: '操作者',
      ref: 'WechatUser'
    },
    date: {
      type: Date,
      comment: '日期'
    },
    originId: {
      type: String,
      comment: '微信原始ID'
    }
  });
  return ['WechatActionRecord', WechatActionRecordSchema];
};
