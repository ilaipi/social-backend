import mongoose from 'mongoose';
import { isEmpty, sortBy } from 'lodash';

const parseCondition = (condition) => {
  const result = {};
  const {
    factorRegion, sciCountry = [], sciPart = [], sciType = [], name
  } = condition;
  if (factorRegion) {
    const { min, max } = factorRegion;
    result.factorRegion = {};
    if (min) {
      result.factorRegion.$gte = min;
    }
    if (max) {
      result.factorRegion.$lt = max;
    }
  }
  if (!isEmpty(sciCountry)) {
    result.sciCountry = {$in: sciCountry};
  }
  if (!isEmpty(sciType)) {
    result.sciType = {$in: sciType};
  }
  if (!isEmpty(sciPart)) {
    result.sciPart = {$in: sciPart};
  }
  if (name) {
    const nameReg = new RegExp(name, 'i');
    result.$or = [
      {name: nameReg},
      {shortName: nameReg}
    ];
  }
  return result;
};

/**
 * 获取文献列表
 */
const getSiteList = async ctx => {
  // sort 为：影响因子，国人发稿量，国产占比
  // condition 为：发布国家，期刊分区等
  // { sciCountry: '中国', sciPart: ['中科院一区'], sciType: ['内科'], factorRegion: {min, max} }
  const { page = 1, limit = 20, condition = {} } = ctx.request.body;

  const Site = mongoose.model('Site');

  const {
    sort = {field: 'factorRegion', value: -1}
  } = condition;
  const query = parseCondition(condition);

  const sites = await Site.paginate(
    query,
    {
      sort: { [sort.field]: sort.value },
      page: +page,
      limit: +limit,
      select: 'name domesticNum domesticRate factorRegion'
    }
  );
  ctx.body = sites;
};

/**
 * 获取文献详细信息
 */
const getSiteDetail = async ctx => {
  const { id } = ctx.query;
  const Site = mongoose.model('Site');
  const result = await Site.findById(id);
  ctx.body = result;
};

/**
 * 获取发布国家
 */
const getCountries = async ctx => {
  const Country = mongoose.model('Country');
  ctx.body = await Country.find();
};

/**
 * 获取期刊分区
 */
const getSciParts = async ctx => {
  const SciPart = mongoose.model('SciPart');
  ctx.body = await SciPart.find();
};

/**
 * 获取研究选刊
 */
const getSciTypes = async ctx => {
  const SciType = mongoose.model('SciType');
  ctx.body = await SciType.find();
};

/**
 * 获取文献的常量数组
 */
const getConsts = async ctx => {
  const SciType = mongoose.model('SciType');
  const SciPart = mongoose.model('SciPart');
  const Country = mongoose.model('Country');

  const countries = await Country.find();
  const parts = await SciPart.find();
  const types = await SciType.find();

  const func = (row) => { return row.name.length; };

  ctx.body = {
    countries: sortBy(countries, [func]),
    parts: sortBy(parts, [func]),
    types: sortBy(types, [func])
  };
};

export const register = ({ router, unauth }) => {
  unauth.get('/site/countries', getCountries);
  unauth.get('/site/sciParts', getSciParts);
  unauth.get('/site/sciTypes', getSciTypes);
  unauth.get('/site/consts', getConsts);

  unauth.post('/site/list', getSiteList);
  unauth.get('/site/detail', getSiteDetail);

  router.post('/site/list', getSiteList);
};
