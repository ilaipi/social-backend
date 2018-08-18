import bunyan from 'bunyan';
import config from './config';

const isProduction = process.env.NODE_ENV === 'production';

const options = {
  name: config.app.name,
  level: 'debug'
};

if (isProduction) {
  options.streams = [{
    type: 'rotating-file',
    path: config.app.log,
    period: '1d',   // daily rotation
    level: 'debug',
    count: 60        // keep 2-months back copies
  }];
  options.src = true;
} else {
  options.src = true;
  options.serializers = bunyan.stdSerializers;
}

export default bunyan.createLogger(options);
