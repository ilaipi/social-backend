/**
 * 用户收藏站点对应表
 */
module.exports = (Schema) => {
  const SiteFavorite = new Schema({
    date: {
      type: Date,
      comment: '收藏时间'
    },
    site: {
      type: Schema.ObjectId,
      comment: '站点ID'
    },
    wechatUser: {
      type: Schema.ObjectId,
      comment: '微信用户'
    }
  });
  return ['SiteFavorite', SiteFavorite];
};
