import Promise from 'bluebird';
import mongoose from 'mongoose';

import loadModels from './models';
import logger from './../../modules/util/log';

mongoose.set('debug', (collectionName, method, query, doc, options) => {
  const optionsString = options ? `, ${JSON.stringify(options, null, 2)}` : '';
  const msg = `${collectionName}.${method}(${JSON.stringify(query, null, 2)}, ${JSON.stringify(doc, null, 2)}${optionsString})`;
  logger.debug(`Mongoose: ${msg}`);
});

mongoose.Promise = Promise;

loadModels();

/**
 * Create the database connection
 */
export default config => mongoose.connect(config.mongodb, {
  useMongoClient: true,
  poolSize: 20,
  reconnectTries: Number.MAX_VALUE
});

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', () => {
  const connection = mongoose.connections[0];
  logger.info(`Mongoose default connection opened ${connection.name}`);
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
  logger.error(err, 'Mongoose default connection error');
  process.exit(0);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  logger.info('Mongoose default connection disconnected');
  if (process.env.NODE_ENV === 'production') {
    process.exit(0);
  }
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    logger.warn('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});
