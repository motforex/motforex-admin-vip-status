import { createDefaultApiFunction } from '@/libs';

export const determineUserVipStatus = createDefaultApiFunction(
  __dirname,
  'determineUserVipStatus',
  'get',
  '/v1/user/vip-status'
);
// cron every 5min
// export const determineVipStatusCron = createScheduledFunc(__dirname, 'determineUserVipStatus', ['']);
