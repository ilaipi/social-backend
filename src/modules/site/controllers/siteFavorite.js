import mongoose from 'mongoose';
import { map } from 'lodash';

/**
 * 获取用户收藏的站点列表
 */
const getFavoriteSites = async (ctx) => {
  const { page = 1, limit = 10, user } = ctx.query;
  const SiteFavorite = mongoose.model('SiteFavorite');
  const data = await SiteFavorite.paginate(
    { wechatUser: mongoose.Types.ObjectId(user) },
    {
      page: +page,
      limit: +limit,
      sort: '-date',
      populate: {
        path: 'site',
        model: 'Site',
        select: 'name domesticNum domesticRate factorRegion'
      }
    }
  );
  ctx.log.warn(data.docs);
  ctx.body = {
    total: data.total,
    data: map(data.docs, 'site')
  };
};

export const register = ({ unauth }) => {
  unauth.get('/site/favorite/list', getFavoriteSites);
};
