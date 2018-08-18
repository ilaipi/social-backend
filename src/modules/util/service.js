import { URL } from 'url';
import { merge, startsWith, template, trimStart } from 'lodash';
import querystring from 'querystring';
import moment from 'moment';

/**
 * 域名中，如果第四层域名是这个字符串开头的，认为是公众号的originId
 */
const ORIGIN_ID_PREFIX = 'ldgh';

/**
 * 服务端的类型和前端的地址对应关系
 */
const PAGE_TYPES = {
  Live: '/zhibo.html',
  Playback: '/playback.html',
  Homepage: '/homepageDetail.html',
  News: '/article.html',
  HistoryNews: '/historyNews.html',
  List: '/list.html',
  HomepageList: '/homepage.html'
};

/**
 * 把uri和query合并
 * uri中可能带有参数
 */
const mergeUrl = (uri, query) => {
  const urlObj = new URL(uri);
  const { search } = urlObj;
  urlObj.search = querystring.stringify(merge(querystring.parse(trimStart(search, '?')), query));
  const { protocol, host, hash, search: merged, pathname } = urlObj;
  return `${protocol}//${host}${pathname}${hash}${merged}`;
};

const dateonly = (day) => {
  let d = day || new Date();
  return {
    $gte: moment(d).startOf('day').toDate(),
    $lt: moment(d).add(1, 'days').startOf('day').toDate()
  };
};

/**
 * 如果host是以'ldgh'开头的，那么设置其header[originId]
 * 需要用到的地方：ctx.header.originId
 */
const handleHost = ctx => {
  const { host } = ctx;
  if (!startsWith(host, ORIGIN_ID_PREFIX)) {
    return;
  }
  const originId = `gh_${host.substring(ORIGIN_ID_PREFIX.length, host.indexOf('.'))}`;
  ctx.header.originId = originId;
};

/**
 * 如果host中有需要替换的originId，替换成'ldgh'开头的
 */
const compileHost = (host, originId) => {
  const compile = template(host);
  return compile({ originId: `${ORIGIN_ID_PREFIX}${trimStart(originId, 'gh_')}` });
};

/**
 * 生成页面的地址
 * e.g. type = Live return zhibo.html
 */
const pageUri = type => {
  return PAGE_TYPES[type];
};

module.exports = ['helper', { mergeUrl, dateonly, handleHost, compileHost, pageUri }];
