/**
 * 站点
 */
module.exports = (Schema) => {
  const Model = new Schema({
    name: {
      type: String,
      comment: '名字'
    },
    sciType: {
      type: [String],
      comment: '类型。'
    },
    sciPart: {
      type: [String],
      comment: '期刊分区'
    },
    shortName: {
      type: String,
      comment: '缩写名称'
    },
    sciCountry: {
      type: String,
      comment: '发布国家。如 中国'
    },
    factorRegion: {
      type: Number,
      comment: '影响因子。'
    },
    hireRate: {
      type: String,
      comment: '录用难度。如 命中率约23%'
    },
    issn: {
      type: String,
      comment: '国际标准期刊编号。如 0007-9235'
    },
    domesticRate: {
      type: Number,
      comment: '国产占比'
    },
    domesticNum: {
      type: Number,
      comment: '中国发稿'
    },
    firstTrialCycle: {
      type: String,
      comment: '一审周期。如 平均1.5月'
    },
    contentInfo: {
      type: String,
      comment: '内容介绍'
    },
    influence: {
      type: Schema.Types.Mixed,
      comment: '影响因子趋势。 2011 - 2016 年的影响因子数据'
    },
    chinese: {
      type: Schema.Types.Mixed,
      comment: '中国发稿分析。'
      // {
      //   all: [],
      //   china: []
      // }
    },
    submit: {
      type: String,
      comment: '点击投稿，投稿入口'
    },
    feeDesc: {
      type: String,
      comment: '版面费说明'
    },
    submitNeedKnow: {
      type: String,
      comment: '投稿须知'
    },
    homepage: {
      type: String,
      comment: '官网入口'
    }
  });

  return ['Site', Model];
};
