import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';
import type { CustomAPIGatewayEvent as ApiFunc } from '@/libs/api-gateway';

import { middyfy } from '@/libs';
import { extractMetadata } from '@/libs/auth';
import { CustomError, handleApiFuncError } from '@/error';
import * as vipConfigService from '@/services/vip-status';
import { UpdateVipConfigRequest } from '@/types';

const getConfigsFunc: ApiFunc<null> = async (): Promise<ApiFuncRes> => {
  try {
    return await vipConfigService.getVipConfig();
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const putConfigFunc: ApiFunc<UpdateVipConfigRequest> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.code) throw new CustomError(`Path variable is missing`);

    return await vipConfigService.updateVipConfig(extractMetadata(event), event.pathParameters.code);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const postConfigFunc: ApiFunc<UpdateVipConfigRequest> = async (event): Promise<ApiFuncRes> => {
  try {
    return await vipConfigService.createVipConfig(extractMetadata(event));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const getVipConfigs = middyfy(getConfigsFunc);
export const updateVipConfig = middyfy(putConfigFunc);
export const createVipConfig = middyfy(postConfigFunc);
