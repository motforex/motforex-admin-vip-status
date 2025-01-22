import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';
import type { CustomAPIGatewayEvent as ApiFunc } from '@/libs/api-gateway';

import { middyfy } from '@/libs';
import { extractMetadata } from '@/libs/auth';
import { handleApiFuncError } from '@/error';
import * as vipConfigService from '@/services/vip-status';
import { UpdateVipConfigRequest } from '@/types';

const getConfigsFunc: ApiFunc<null> = async (): Promise<ApiFuncRes> => {
  try {
    return await vipConfigService.getVipConfig();
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const putUpdateConfigFunc: ApiFunc<UpdateVipConfigRequest> = async (event): Promise<ApiFuncRes> => {
  try {
    return await vipConfigService.updateVipConfig(extractMetadata(event));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const getVipConfigs = middyfy(getConfigsFunc);
export const updateVipConfig = middyfy(putUpdateConfigFunc);
