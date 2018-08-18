import mongoose from 'mongoose';

/**
 * 生成二维码的统一接口
 * get请求，参数尽量简洁
 */
const generateQrcode = async ctx => {
  const { query } = ctx;
  const { wechat } = ctx.services;
  const { originId } = ctx.header;
  const url = await wechat.generateQrcode({ ...query, originId: originId || query.originId });
  if (!url) ctx.throw(400, `不支持的二维码类型${query.type}`);
  ctx.body = url;
};

/**
 * 根据特定scope获取指定模板消息
 */
const getTemplate = async ctx => {
  let { scope, provider, department } = ctx.request.query;
  if (!provider && !department) {
    ctx.throw('科室和医生id必须传一个');
  }
  const { departmentCustomize } = ctx.services;
  const $department = await departmentCustomize.getDepartmentCustomize({ department, provider });
  const WechatTemplate = mongoose.model('WechatTemplate');
  const WechatTemplateCustomize = mongoose.model('WechatTemplateCustomize');
  const match = {
    originId: $department.originId
  };
  const templates = await WechatTemplateCustomize.aggregate([
    {
      $match: match
    }, {
      $lookup: {
        from: WechatTemplate.collection.collectionName,
        localField: 'template',
        foreignField: '_id',
        as: 'template'
      }
    }, {
      $project: {
        code: 1,
        template: { $arrayElemAt: ['$template', 0] }
      }
    }, {
      $project: {
        id: '$template._id',
        _id: 1,
        code: 1,
        scope: '$template.scope',
        title: '$template.title',
        fields: '$template.fields'
      }
    }, {
      $match: {
        scope: { $all: scope }
      }
    }
  ]);
  return templates;
};

async function wechatConfig(ctx) {
  const { originId } = ctx.header;
  const { url } = ctx.request.query;
  const { wechatApi: {getApi} } = ctx.services;
  ctx.log.info('url', ctx.request.query);
  let param = {
    debug: false,
    jsApiList: [
      'onMenuShareAppMessage', 'onMenuShareTimeline', 'showMenuItems', 'hideMenuItems', 'hideOptionMenu',
      'chooseImage', 'previewImage', 'getLocalImgData', 'uploadImage'
    ],
    url
  };
  const api = await getApi({ originId });
  return api.getJsConfig(param)
  .then((config) => {
    ctx.body = config;
  });
}

const getTemplateMessage = async (ctx) => {
  const { wechatMessageId } = ctx.query;
  const TemplateMessage = mongoose.model('TemplateMessage');
  const templateMessage = await TemplateMessage.findById(wechatMessageId) || {};
  ctx.body = {
    content: templateMessage.content
  };
};

/**
 * 发送文章
 */
const sendNews = async (ctx) => {
  const { wechatApi: {getApi} } = ctx.services;
  const api = await getApi({originId: 'gh_7b5168c527ea'});
  const news = [{
    'title': '欧洲鼻腔鼻窦解剖术语意见书（一）',
    'description': '',
    'url': 'http://yirenyi.adouhealth.com/article.html?id=5a5dade76fc510389b9362a2&originId=gh_7b5168c527ea',
    'picurl': 'http://cimg.adouhealth.com/1515763694200-timg.jpg'
  }];
  await api.sendNews('o85Gq0TA5xLT278JtS8OIyPKjhPE', news); // 野猪
  await api.sendNews('o85Gq0ZYSWVkOQZ50pnXmk0wLbrY', news); // Allen
  await api.sendNews('o85Gq0ULZ15KduRTwBbAahnQYmBo', news); // 侃侃
  ctx.body = '';
};
const getUser = async (ctx) => {
  const { wechatApi: {getApi} } = ctx.services;
  const api = await getApi({originId: 'gh_d5bb4981151f'});
  ctx.body = await api.getUser({openid: 'oplkawSKPUMkYk_GFDkrlkx6pi_A', lang: 'zh_CN'});
};
export const register = ({ unauth }) => {
  unauth.get('/wechat/qrcode', generateQrcode);
  unauth.get('/wechat/template', getTemplate);
  unauth.get('/wechat/config', wechatConfig);
  unauth.get('/wechat/templateMessage', getTemplateMessage);
  unauth.get('/wechat/sendNews', sendNews);
  unauth.get('/wechat/getUser', getUser);
};
