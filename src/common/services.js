import glob from 'glob';
import path from 'path';
import _ from 'lodash';

export default (app) => {
  let defines = glob.sync('*/service.js', {
    root: 'modules',
    cwd: path.resolve(__dirname, '..', 'modules')
  });
  defines = _.union(defines, glob.sync('*/services/*.js', {
    root: 'modules',
    cwd: path.resolve(__dirname, '..', 'modules')
  }));
  app.context.services = {};
  _.forEach(defines, $define => {
    const svc = require('../modules/' + $define);
    if (svc.name) {
      app.context.services[svc.name] = svc;
      return;
    }
    const [name, service] = svc;
    app.context.services[name] = service;
  });
};
