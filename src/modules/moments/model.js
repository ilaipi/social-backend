/**
 * 动态
 */
module.exports = (Schema) => {
  const Model = new Schema({
    member: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      comment: '用户'
    },
    text: {
      type: String,
      comment: '文本'
    },
    location: {
      type: String,
      comment: '地址'
    },
    imgs: {
      type: [String],
      comment: '图片'
    },
    videos: {
      type: [String],
      comment: '视频'
    },
    from: {
      type: Schema.Types.Mixed,
      comment: 'retweet from'
    },
    date: {
      type: Date,
      comment: '时间'
    }
  });

  return ['Moment', Model];
};
