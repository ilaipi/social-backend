/**
 * 期刊分区
 */
module.exports = (Schema) => {
  const SciPartSchema = new Schema({
    name: {
      type: String,
      comment: '期刊分区'
    }
  });
  return ['SciPart', SciPartSchema];
};
