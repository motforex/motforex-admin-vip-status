import { logger, middyfy } from '@/libs';
import { determineAllUsersVipStatus } from '@/services/vip-status/vip-status-util-service';

const determineUserVipStatusCron = async (): Promise<void> => {
  try {
    return await determineAllUsersVipStatus();
  } catch (error: unknown) {
    logger.error('Error in determineUserVipStatusCron(): ', error);
    return;
  }
};

export const determineUserVipStatus = middyfy(determineUserVipStatusCron);
