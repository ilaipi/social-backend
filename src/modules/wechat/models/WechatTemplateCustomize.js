/**
 * 微信模板消息Customize
 * 仅定义需要在群发或单独聊天界面发送的模板
 * 其它模板消息在具体的地方直接生成
 */
module.exports = function (Schema) {
  const WechatTemplateCustomizeSchema = new Schema({
    code: { // 每个公众号都不同
      type: String,
      comment: '微信公众号中的模板id'
    },
    originId: {
      type: String,
      comment: '公众号唯一标识'
    },
    template: {
      type: String,
      comment: '通用模板编号'
    }
  });
  return ['WechatTemplateCustomize', WechatTemplateCustomizeSchema];
};
