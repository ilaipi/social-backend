/**
 * created by Bottle on 2018/08/03
 */
import mongoose from 'mongoose';
import { forEach, countBy, filter, map, flatten } from 'lodash';

/**
 * 增加行为记录
 */
const addRecord = async ctx => {
  const { action, site, user: wechatUser } = ctx.query;
  const { siteFavorite } = ctx.services;
  const SiteActionRecord = mongoose.model('SiteActionRecord');
  const date = new Date();
  if (action === 'favorited') {
    await siteFavorite.favorite({ site, wechatUser, date });
  } else if (action === 'unFavorite') {
    await siteFavorite.unfavorite({ site, wechatUser });
  }
  await SiteActionRecord.create({
    action,
    site,
    wechatUser,
    date
  });
  ctx.body = { status: 'success' };
};

/**
 * 获取用户对某个站点的收藏信息
 */
const getSiteFavoriteStatus = async ctx => {
  const { site, user } = ctx.query;
  const SiteActionRecord = mongoose.model('SiteActionRecord');
  const regrex = new RegExp('favorite', 'i');
  const row = await SiteActionRecord.findOne(
    {
      site,
      action: regrex,
      wechatUser: user
    },
    'action',
    { sort: '-date' }
  ) || {};
  ctx.log.info('row = ', row);
  const status = row.action === 'favorited';
  ctx.body = { status };
};

/**
 * 获取用户的站点收藏数和访问数
 */
const getSiteCountByUser = async ctx => {
  const { user } = ctx.query;
  const { siteFavorite } = ctx.services;

  const SiteActionRecord = mongoose.model('SiteActionRecord');
  const data = await SiteActionRecord.distinct('site', { wechatUser: user, action: 'join' });

  const favoriteNum = await siteFavorite.getFavoriteNum(user);

  ctx.body = {
    footPrint: data.length,
    favoriteNum
  };
};

/**
 * 获取用户的站点浏览记录
 */
const getUserFoots = async ctx => {
  const { user, page = 1, limit = 20 } = ctx.query;
  const SiteActionRecord = mongoose.model('SiteActionRecord');
  const aggregates = [
    { $match: { wechatUser: mongoose.Types.ObjectId(user), action: 'join' } },
    {
      $group: {
        _id: '$site',
        date: {$max: '$date'}
      }
    },
    {
      $lookup: {
        from: 'sites',
        localField: '_id',
        foreignField: '_id',
        as: 'site'
      }
    },
    {
      $project: {
        date: 1,
        _id: 0,
        'site._id': 1,
        'site.name': 1,
        'site.domesticNum': 1,
        'site.domesticRate': 1,
        'site.factorRegion': 1
      }
    }
  ];
  const records = await SiteActionRecord.aggregate(aggregates);

  aggregates.push({ $sort: {date: -1} });
  aggregates.push({ $skip: (page - 1) * limit });
  aggregates.push({ $limit: +limit });

  const rows = await SiteActionRecord.aggregate(aggregates);
  ctx.body = {
    total: records.length,
    data: flatten(map(rows, row => row.site))
  };
};

export const register = ({ unauth }) => {
  unauth.get('/site/record', addRecord);
  unauth.get('/user/site/count', getSiteCountByUser);
  unauth.get('/site/favorite', getSiteFavoriteStatus);
  unauth.get('/user/foots', getUserFoots);
};
