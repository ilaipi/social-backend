import Koa from 'koa';
import moment from 'moment';
import responseTime from 'koa-response-time';
import { pick, merge, trimEnd } from 'lodash';
import bytes from 'bytes';
import logger, { requestIdContext, requestLogger, timeContext } from 'koa-bunyan-logger';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import session from 'koa-session';
import passport from 'koa-passport';
import multer from 'koa-multer';

import config from './modules/util/config';
import initial from './common/initial/';
import bunyan from './modules/util/log';
import auth from './modules/auth/';
import mongo from './common/mongo/';
import services from './common/services';
import wechat, { authenticated } from './modules/wechat/middleware/';

const app = new Koa();
const prefix = { prefix: '/api' };
const wechatPrefix = '/wechatapi';
const publicRouter = new Router(prefix);
const wechatRouter = new Router({ prefix: wechatPrefix });
const openRouter = new Router({ prefix: '/open' });
const secureRouter = new Router(prefix);

services(app);

app.use(responseTime());
app.use(logger(bunyan));

app.use(requestIdContext({
  header: 'Request-Id'
}));
app.use(requestLogger({
  durationField: 'responseTime',
  updateRequestLogFields: (ctx) => {
    return pick(ctx.req.headers, ['host', 'referer', 'accept-encoding', 'accept-language']);
  },
  updateResponseLogFields: (ctx) => {
    const { _headers: headers } = ctx.res;
    const time = headers['x-response-time'];
    const length = bytes(headers['content-length']);
    const fields = pick(ctx.res._headers, ['host', 'content-type', 'accept-encoding', 'accept-language']);
    return merge(fields, {
      responseTime: trimEnd(time, 'ms'),
      bodySize: length ? bytes(length) : '-'
    });
  }
}));
app.use(timeContext({ logLevel: 'debug' }));

// 所有异常捕获
app.use(async (ctx, next) => {
  try {
    ctx.services.helper.handleHost(ctx);
    await next();
    if (ctx.status === 404) ctx.throw(404);
  } catch (err) {
    bunyan.error(err);
    ctx.status = err.status || 500;
    ctx.body = { message: err.message, success: false };
  }
});

// the key to sign the cookie
app.keys = [config.app.session.cookieKey];

app.use(session({
  key: config.app.session.key,
  rolling: false, // 微信端不刷新会话有效期。从第一次认证后，每7天需要重新认证
  maxAge: 7 * 24 * 60 * 60 * 1000 // 每7天认证一次
}, app));
// 自定义
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/data/temp/');
  },
  filename: (req, file, cb) => {
    const filename = `${moment().format('YYYYMMDD_HHmmssSSS')}-${file.originalname}`;
    cb(null, filename);
  }
});
const upload = multer({ storage });
app.use(upload.any());
app.use(bodyParser({
  enableTypes: ['json', 'form'],
  textLimit: '100mb',
  jsonLimit: '100mb',
  formLimit: '100mb'
}));

app.use(passport.initialize());
app.use(passport.session());
// 加载所有路由
import registerCtrl from './common/controllers';
registerCtrl({
  unauth: publicRouter,
  open: openRouter,
  router: secureRouter,
  wechat: wechatRouter
});
app.use(publicRouter.routes());

// 过滤需要微信认证的请求
app.use(authenticated(wechatPrefix));
app.use(wechatRouter.routes());
app.use(openRouter.routes());
app.use(wechat());

app.use(async (ctx, next) => {
  if (ctx.isAuthenticated()) {
    ctx.account = ctx.state.user;
    await next();
  } else {
    ctx.status = 401;
    ctx.body = { success: false, message: '需要登录' };
  }
});
app.use(secureRouter.routes());

const server = require('http').Server(app.callback());
auth();
mongo(config)
.then(() => {
  server.listen(config.app.port, async function () {
    await initial();
    bunyan.info(`Server started on ${config.app.port}`);
  });
});
