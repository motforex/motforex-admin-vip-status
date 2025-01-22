import { formatApiResponse } from '@/libs/format';
import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';

import { getCustomConfigByCode, updateCustomConfig } from '@/repository/custom-configs-repository';
import { handleApiFuncError } from '@/error';
import CustomError from '@/error/custom-error';
import { logger } from '@/libs/winston';
import { checkAuthorization } from '@/libs/auth';
import { RequestMetadata } from '@/types/api-function.types';
import { UpdateVipConfigRequestSchema } from '@/types';

export const CONFIG_VIP_LEVELS = 'CONFIG_VIP_LEVELS';

export async function getVipConfig(): Promise<APIResponse> {
  try {
    const result = await getCustomConfigByCode(CONFIG_VIP_LEVELS);
    if (!result) {
      return formatApiResponse({});
    }
    return formatApiResponse(result);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

export async function updateVipConfig(metadata: RequestMetadata): Promise<APIResponse> {
  try {
    const { email } = checkAuthorization(metadata, 'update-vip-config');

    const existingConfig = await getCustomConfigByCode(CONFIG_VIP_LEVELS);
    if (!existingConfig) {
      throw new CustomError(`VIP config '${CONFIG_VIP_LEVELS}' not found!`, 400);
    }

    const body = metadata.body;

    if (!body) {
      throw new CustomError('Missing new config data in request body', 400);
    }

    const newBody = UpdateVipConfigRequestSchema.parse(body);

    const isEditable = existingConfig.isEditable || false;
    if (!isEditable) {
      throw new CustomError(`VIP config '${CONFIG_VIP_LEVELS}' is not editable!`, 400);
    }

    const updatedConfig = {
      ...existingConfig,
      value: newBody,
      updatedAt: Date.now(),
      updatedBy: email,
    };

    const result = await updateCustomConfig(updatedConfig);
    if (!result) {
      throw new CustomError('Unexpected error, return value is missing!', 500);
    }

    logger.info(`VIP config '${CONFIG_VIP_LEVELS}' updated by ${email}`);
    return formatApiResponse(result);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}
