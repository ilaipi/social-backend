/**
 * 成员
 */
module.exports = (Schema) => {
  const Model = new Schema({
    name: {
      type: String,
      comment: '名字',
      remark: '自定义名字，e.g. 老汉'
    },
    social: {
      type: String,
      comment: '社交媒体',
      enum: [
        'twitter',
        'facebook',
        'instagram'
      ]
    },
    avatar: {
      type: String,
      comment: '头像',
      remark: '同一个人在不同社交媒体上头像不同'
    },
    app: {
      type: String,
      comment: '小程序id'
    }
  });

  return ['Member', Model];
};
