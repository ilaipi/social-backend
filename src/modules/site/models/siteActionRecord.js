/**
 * 用户进入站点的记录
 */
module.exports = (Schema) => {
  const SiteActionRecordSchema = new Schema({
    action: {
      type: String,
      comment: '行为名称',
      enum: [ 'join', 'leave', 'favorited', 'unFavorite' ]
    },
    date: {
      type: Date
    },
    site: {
      type: Schema.ObjectId,
      comment: '站点',
      ref: 'Site'
    },
    wechatUser: {
      type: Schema.ObjectId,
      comment: '操作用户',
      ref: 'WechatUser'
    }
  });
  return ['SiteActionRecord', SiteActionRecordSchema];
};
