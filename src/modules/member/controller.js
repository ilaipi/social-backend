import mongoose from 'mongoose';

/**
 * 成员列表
 */
const getMembers = async ctx => {
  const Member = mongoose.model('Member');
  ctx.body = await Member.find();
};

export const register = ({ router, unauth }) => {
  router.get('/members', getMembers);
  unauth.get('/members', getMembers);
};
