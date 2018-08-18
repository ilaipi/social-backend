import glob from 'glob';
import path from 'path';
import _ from 'lodash';
import mongoose from 'mongoose';
import pagination from 'mongoose-paginate';
import timestamps from 'mongoose-timestamp';

const FileSchema = new mongoose.Schema({}, { strict: false, collection: 'fs.files' });

export default () => {
  let defines = glob.sync('*/model.js', {
    root: 'modules',
    cwd: path.resolve(__dirname, '../..', 'modules')
  });
  defines = _.union(defines, glob.sync('*/models/*.js', {
    root: 'modules',
    cwd: path.resolve(__dirname, '../..', 'modules')
  }));
  defines.forEach(function (define) {
    const [name, schema] = require('../../modules/' + define)(mongoose.Schema);
    schema.plugin(pagination);
    schema.plugin(timestamps);
    const toJSONSetting = schema.get('toJSON');
    schema.set('toJSON', _.merge({
      versionKey: false,
      transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      }
    }, toJSONSetting));
    mongoose.model(name, schema);
  });
  mongoose.model('File', FileSchema);
};
