/**
 * 发布国家
 */
module.exports = (Schema) => {
  const CountrySchema = new Schema({
    name: {
      type: String,
      comment: '发布国家的名称'
    }
  });
  return ['Country', CountrySchema];
};
