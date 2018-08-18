import mongoose from 'mongoose';
import moment from 'moment';

import { qrcodeUrl } from './../middleware/events/scan/';

/**
 * 创建临时二维码
 * 有效期默认为30分钟
 * PS: co-wechat-api 文档里说最大不超过1800秒，但官方文档说是30天
 */
const createTempScene = async (originId, model, temp = 30 * 60) => {
  const Scene = mongoose.model('Scene');
  const _id = mongoose.Types.ObjectId();
  const { ticket, url } = await qrcodeUrl({
    id: _id.toString(),
    originId,
    temp
  });
  const scene = await Scene.create({
    _id,
    ...model,
    ticket,
    url,
    valid: moment().add(temp, 'seconds')
  });
  return scene;
};

module.exports = ['scene', { createTempScene }];
