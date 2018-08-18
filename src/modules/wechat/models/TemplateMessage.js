/**
 * 模板消息
 */
module.exports = function (Schema) {
  const TemplateMessageSchema = new Schema({
    template: {
      type: String,
      comment: '通用模版id' //
    },
    originId: {
      type: String,
      comment: '微信原始id'
    },
    openid: {
      type: String,
      comment: '微信用户的openid'
    },
    link: {
      type: String,
      comment: '模板链接'
    },
    content: {
      type: Schema.Types.Mixed,
      comment: '数据'
    },
    params: {
      type: Schema.Types.Mixed,
      comment: '发送至微信时的所需参数'
    },
    status: {
      type: Schema.Types.Boolean,
      comment: '模板消息是否发送至患者微信'
    },
    read: {
      type: Boolean,
      comment: '标识模版消息是否点开'
    },
    response: {
      type: Schema.Types.Mixed,
      comment: '返回属性'
    }
  });

  return ['TemplateMessage', TemplateMessageSchema];
};
