import wechat from './wechat/';
// import schedule from './schedule';

export default async () => {
  await wechat();
  // await schedule.init();
};
