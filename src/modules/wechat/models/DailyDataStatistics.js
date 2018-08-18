/**
 * 每日数据统计包括：
 * 累计用户： totalUser
 * 新增用户： newUser
 * 活跃用户：activeUser
 * 取消关注： unsubscribe
 * 平均日使用时间：averageDailyTime
 */
module.exports = function (Schema) {
  const DailyDataStatisticsSchema = new Schema({
    totalUserNum: {
      type: Number,
      comment: '累计用户'
    },
    newUserNum: {
      type: Number,
      comment: '新增用户'
    },
    activeUserNum: {
      type: Number,
      comment: '活跃用户'
    },
    unsubscribeNum: {
      type: Number,
      comment: '取消关注'
    },
    averageDailyTimeNum: {
      type: Number,
      comment: '平均日使用时间'
    },
    days7ActiveUser: {
      type: Number,
      comment: '过去7天活跃用户'
    },
    days30ActiveUser: {
      type: Number,
      comment: '过去30天活跃用户'
    },
    days7AvgUseTime: {
      type: Number,
      comment: '过去7天活跃用户日均使用时间'
    },
    originId: {
      type: String,
      comment: '微信原始id'
    },
    date: {
      type: Date,
      comment: '日期'
    }
  });

  return ['DailyDataStatistics', DailyDataStatisticsSchema];
};
