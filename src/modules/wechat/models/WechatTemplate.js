/**
 * 微信模板消息
 * 仅定义需要在群发或单独聊天界面发送的模板
 * 其它模板消息在具体的地方直接生成
 */
module.exports = function (Schema) {
  const WechatTemplateSchema = new Schema({
    title: {
      type: String,
      comment: '模板标题',
      remark: '即模板库中的标题'
    },
    number: {
      type: String,
      comment: '模板编号',
      remark: '即模板库中的编号'
    },
    scope: {
      type: [String],
      comment: '使用场景',
      enum: [ // 如果单人和群发都合适，就都写上
        'message.single', // 单人聊天
        'message.multi', // 群发
        'remind', // 随访提醒
        'care' // 病人关爱
      ]
    },
    /**
     * 微信模板消息的组成是
     *  第一个必需是 标题first
     *  若干字段keyword(2-5个) 在fields字段中定义
     *  最后一个必需是 备注remark
     */
    fields: {
      type: [Schema.Types.Mixed],
      comment: '内容字段',
      definition: {
        type: { type: String, enum: ['text', 'date', 'datetime', 'datetimerange', 'textarea'] },
        label: { type: String, comment: '提示标签' },
        color: { type: String, comment: '颜色' },
        required: { type: Boolean, comment: '必需' },
        name: { type: String, comment: '参数名' }
      }
    }
  });
  return ['WechatTemplate', WechatTemplateSchema];
};
