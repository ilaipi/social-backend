/**
 * 公众号场景
 */
module.exports = function (Schema) {
  const SceneSchema = new Schema({
    type: {
      type: String,
      comment: '类型(bindToPatient bindToDepartment bindToProvider)'
    },
    originId: {
      type: String,
      comment: '公众号'
    },
    ticket: {
      type: String,
      comment: '二维码ticket'
    },
    url: {
      type: String,
      comment: '二维码链接'
    },
    data: {
      type: Schema.Types.Mixed,
      comment: '包含数据'
    },
    valid: {
      type: Date,
      comment: '有效期',
      remark: '有效期结束的时间点'
    }
  });
  return ['Scene', SceneSchema];
};
