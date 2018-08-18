import mongoose from 'mongoose';

/**
 * moments
 */
const getMoments = async ctx => {
  const Moment = mongoose.model('Moment');
  ctx.body = await Moment.find().populate({
    path: 'member',
    select: ['name', 'avatar']
  });
};

export const register = ({ router, unauth }) => {
  router.get('/moments', getMoments);
  unauth.get('/moments', getMoments);
};
