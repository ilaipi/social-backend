import passport from 'koa-passport';
import { Strategy } from 'passport-local';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const strategy = new Strategy({
  usernameField: 'username',
  passwordField: 'password'
}, async function (username, password, done) {
  const Account = mongoose.model('Account');
  const user = await Account.findOne({ username });
  if (!user) {
    return done({
      success: false,
      message: '用户不存在'
    });
  }
  const matched = await bcrypt.compare(password, user.password);
  if (matched) {
    user.password = undefined;
    const Privilege = mongoose.model('Privilege');
    const where = { role: { $in: user.role } };
    const privilege = await Privilege.findOne(where);
    return done(null, {
      ...user.toJSON(),
      privilege
    });
  }
  return done({
    success: false,
    message: '密码错误'
  });
});

// serializeUser 在用户登录验证成功以后将会把用户的数据存储到 session 中
passport.serializeUser(function (user, done) {
  done(null, user);
});

// deserializeUser 在每次请求的时候将从 session 中读取用户对象
passport.deserializeUser(function (user, done) {
  done(null, user);
});

export default () => {
  passport.use('local', strategy);
};
