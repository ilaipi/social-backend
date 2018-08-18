/**
 * 研究选刊
 */
module.exports = (Schema) => {
  const SciTypeSchema = new Schema({
    name: {
      type: String,
      comment: '选刊名称'
    }
  });
  return ['SciType', SciTypeSchema];
};
