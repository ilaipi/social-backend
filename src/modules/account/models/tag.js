/**
 * 名人标签
 */
module.exports = (Schema) => {
  const Model = new Schema({
    name: {
      type: String,
      comment: '名字',
      remark: '体育，音乐'
    }
  });

  return ['Tag', Model];
};
