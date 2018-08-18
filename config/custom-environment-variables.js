module.exports = {
  mongodb: 'MONGO_CONNECT',
  app: {
    port: 'APP_PORT',
    session: {
      cookieKey: 'COOKIE_KEY',
      key: 'SESSION_KEY'
    }
  },
  qiniu: {
    accessKey: 'QINIU_ACCESS_KEY',
    secretKey: 'QINIU_SECRET_KEY'
  },
  mina: {
    appId: 'MINA_APP_ID',
    appSecret: 'MINA_APP_SECRET'
  }
};
