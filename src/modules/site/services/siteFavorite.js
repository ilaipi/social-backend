import mongoose from 'mongoose';
import logger from '../../util/log';

/**
 * 收藏站点
 */
const favorite = async ({ site, wechatUser, date }) => {
  const SiteFavorite = mongoose.model('SiteFavorite');
  const row = await SiteFavorite.findOne({ site, wechatUser });
  if (row) logger.warn('已经收藏过了');
  await SiteFavorite.create({ site, wechatUser, date });
};

/**
 * 取消收藏
 */
const unfavorite = async ({ site, wechatUser }) => {
  const SiteFavorite = mongoose.model('SiteFavorite');
  const row = await SiteFavorite.findOne({ site, wechatUser });
  if (!row) logger.warn('尚未收藏');
  await SiteFavorite.remove({ site, wechatUser });
};

/**
 * 获取用户的收藏站点的数量
 */
const getFavoriteNum = async (wechatUser) => {
  const SiteFavorite = mongoose.model('SiteFavorite');
  const num = await SiteFavorite.count({ wechatUser });
  return num || 0;
};

module.exports = [
  'siteFavorite',
  {
    favorite,
    unfavorite,
    getFavoriteNum
  }
];
