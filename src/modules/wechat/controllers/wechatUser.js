import mongoose from 'mongoose';
import { map, isEmpty } from 'lodash';
/**
 * 获取已关注的用户列表
 */
const getList = async ctx => {
  const WechatUser = mongoose.model('WechatUser');
  const {originId, page = 1, limit = 10} = ctx.query;
  let results = [];
  let params = {
    originId,
    subscribe: {$ne: null}
  };

  results = await WechatUser.paginate(
    params,
    {
      sort: { subscribe: -1 },
      page: +page,
      limit: +limit,
      populate: {
        path: 'user',
        model: 'User'
      }
    }
  );

  ctx.body = results;
};

/**
 * 查询出已关注的用户列表，
 * 同时关联查询对应的注册信息，
 * 并根据注册姓名或者微信昵称，省份，城市，医院过滤，
 * 返回的user和正常populat一样
 */
const searchWechatUser = async ctx => {
  const { name, page, limit, originId, province, city, hospital } = ctx.query;
  const WechatUser = mongoose.model('WechatUser');
  let result = {};

  // 可能是微信昵称，可能是注册用户名
  const regExpName = new RegExp(name);
  const hospitalMatch = { $match: { $or: [ { name: regExpName }, { 'user.name': regExpName } ] } };
  if (hospital) {
    hospitalMatch.$match['user.hospital'] = hospital;
  } else if (city) {
    hospitalMatch.$match['user.city'] = city;
  } else if (province) {
    hospitalMatch.$match['user.province'] = province;
  }

  const aggregate = [
    { $match: {originId, subscribe: {$ne: null}} },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    hospitalMatch
  ];

  const wechatUserList = await WechatUser.aggregate(aggregate);

  aggregate.push({ $skip: (page - 1) * limit }, { $limit: +limit });
  const wechatUsers = await WechatUser.aggregate(aggregate);

  if (wechatUsers) {
    const rows = map(wechatUsers, ({user, ...wechatUser}) => {
      return {
        ...wechatUser,
        id: wechatUser._id,
        user: user && user[0]
      };
    });
    result = {
      docs: rows,
      total: wechatUserList.length
    };
  }

  ctx.body = result;
};

/**
 * 获取已经注册且关注的微信用户
 */
const getRegistedWechatUsers = async ctx => {
  const { originId, page, limit } = ctx.query;
  const user = await mongoose.model('WechatUser')
    .paginate(
    {
      originId,
      user: { $exists: true },
      subscribe: {$ne: null}
    },
    {
      select: 'user name sex headImg',
      populate: {path: 'user', model: 'User', select: 'name phone'},
      page: +page,
      limit: +limit
    });

  let result = map(user.docs, ({ id, user, sex, name: wechatName, headImg }) => {
    return {id, sex: sex === '1' ? '男' : '女', wechatName, headImg, userName: user.name, phone: user.phone};
  });
  ctx.body = { docs: result, total: user.total };
};

/**
 * 根据微信昵称，注册名，手机号
 * 查询注册过且关注的微信用户
 */
const search = async ctx => {
  const { query, page, limit, originId } = ctx.query;
  const WechatUser = mongoose.model('WechatUser');
  let result = {};
  // 可能是微信昵称，可能是注册用户名，可能是手机号
  const regExpName = new RegExp(query);

  const match = { user: { $exists: true }, subscribe: {$ne: null} };
  if (originId) {
    match.originId = originId;
  } else {
    const originIds = [];
    const { live, inner } = ctx.account;
    originIds.push(live.originId);
    originIds.push(inner.originId);
    if (!isEmpty(originIds)) {
      match.originId = {$in: originIds};
    }
  }
  const aggregate = [
    { $match: match },
    { $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'wechat_docs'
    } },
    { $match: { $or: [ { name: regExpName }, { 'wechat_docs.name': regExpName }, { 'wechat_docs.phone': query } ] } }
  ];

  const wechatUserList = await WechatUser.aggregate(aggregate);

  aggregate.push({ $skip: (page - 1) * limit }, { $limit: +limit });
  const wechatUsers = await WechatUser.aggregate(aggregate);

  if (wechatUsers) {
    const rows = map(wechatUsers, ({_id, name, sex, headImg, wechat_docs}) => {
      return {
        id: _id,
        headImg,
        sex: sex === '1' ? '男' : '女',
        wechatName: name,
        userName: wechat_docs[0].name,
        phone: wechat_docs[0].phone
      };
    });
    result = {
      docs: rows,
      total: wechatUserList.length
    };
  }

  ctx.body = result;
};

const subscribe = async ctx => {
  const user = await mongoose.model('WechatUser').findOne({ _id: ctx.session.authInfo.wechatUser.id });
  ctx.body = user;
};

/**
 * 微信端个人中心首页获取个人信息
 * 返回：微信粉丝信息+积分
 */
const getInfo = async ctx => {
  let { wechatUser } = ctx.session.authInfo || {};
  let result = {};
  if (wechatUser) {
    result = wechatUser;
  } else {
    const { id } = ctx.request.query;
    const Model = mongoose.model('WechatUser');
    const user = await Model.findById(id);
    result = { ...user.toJSON() };
  }
  const Bonus = mongoose.model('Bonus');
  // 查询用户总积分
  const bonus = await Bonus.findOne({ wechatUser: result.id });
  if (bonus) result.bonus = bonus.total;
  const Notification = mongoose.model('Notification');
  const notifications = await Notification.count({ to: result.id, read: { $exists: false } });
  result.notifications = notifications;
  ctx.body = result;
};

module.exports.register = function ({ router, wechat, unauth }) {
  router.get('/wechatuser/getList', getList);
  router.get('/wechatuser/getRegistedList', getRegistedWechatUsers);
  router.get('/wechatuser/search', search);
  router.get('/wechatuser/search2', searchWechatUser);

  unauth.get('/wechatuser', getInfo);

  wechat.get('/wechatuser', getInfo);
  wechat.get('/wechatuser/subscribe', subscribe);
};
