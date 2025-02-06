import { formatApiResponse } from '@/libs/format';
import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';

import {
  createCustomConfig,
  getCustomConfigByCode,
  getCustomConfigByQuery,
  updateCustomConfig,
} from '@/repository/custom-configs-repository';
import { handleApiFuncError } from '@/error';
import CustomError from '@/error/custom-error';
import { logger } from '@/libs/winston';
import { checkAuthorization } from '@/libs/auth';
import { RequestMetadata } from '@/types/api-function.types';
import { CreateVipConfigRequestSchema, CustomConfigSchema, UpdateVipConfigRequestSchema } from '@/types';
import { CONFIG_VIP_LEVELS, CUSTOM_CONFIG_VIP_PREFIX } from '@/constants';
import { QueryRequest } from '@/dynamo';

export async function getVipConfig(): Promise<APIResponse> {
  try {
    const query: QueryRequest = {
      indexName: 'parentCode-createdAt-index',
      pKey: 'VIP',
      pKeyProp: 'parentCode',
      pKeyType: 'S',
    };
    const result = await getCustomConfigByQuery(
      query,
      'code, value, valueType, description, isActive, isEditable, createdAt, createdBy, updatedAt, updatedBy'
    );
    if (!result) {
      return formatApiResponse({});
    }
    return formatApiResponse(result.items);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

export async function updateVipConfig(metadata: RequestMetadata, code: string): Promise<APIResponse> {
  try {
    const { email } = checkAuthorization(metadata, 'update-vip-config');
    const existingConfig = await getCustomConfigByCode(code);

    if (!existingConfig) {
      throw new CustomError(`VIP config '${CONFIG_VIP_LEVELS}' not found!`, 400);
    }
    const newBody = metadata.body;
    if (!existingConfig.isEditable) {
      throw new CustomError(`VIP config '${CONFIG_VIP_LEVELS}' is not editable!`, 400);
    }
    const values = UpdateVipConfigRequestSchema.parse(newBody.value);
    const updatedValue = { ...existingConfig.value, ...values };
    const updatePayload = CustomConfigSchema.parse({
      ...existingConfig,
      value: updatedValue,
      updatedAt: Date.now(),
      updatedBy: email,
    });

    const result = await updateCustomConfig(updatePayload);
    if (!result) {
      throw new CustomError('Unexpected error, return value is missing!', 500);
    }
    logger.info(`VIP config '${code}' updated by ${email}`);
    return formatApiResponse(result);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

export async function createVipConfig(metadata: RequestMetadata): Promise<APIResponse> {
  try {
    const { email } = checkAuthorization(metadata, 'create-vip-config');
    const body = metadata.body;
    if (!body) {
      throw new CustomError('Missing new config data in request body', 400);
    }
    const newBody = CreateVipConfigRequestSchema.parse(body);
    if (!newBody.title) {
      throw new CustomError('Missing VIP title in config data', 400);
    }
    const configCode = `${CUSTOM_CONFIG_VIP_PREFIX}${newBody.title.toUpperCase()}`;
    const result = await createCustomConfig(
      CustomConfigSchema.parse({
        code: configCode,
        periodCode: null,
        description: `VIP config for ${newBody.title}`,
        value: newBody,
        valueType: 'object',
        helperType: null,
        parentCode: 'VIP',
        isEditable: true,
        isActive: true,
        postDate: new Date().toISOString(),
        createdAt: Date.now(),
        createdBy: email,
        updatedAt: null,
        updatedBy: null,
      })
    );
    if (!result) {
      throw new CustomError('Unexpected error, return value is missing!', 500);
    }
    logger.info(`VIP config '${configCode}' created by ${email}`);
    return formatApiResponse(result);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}
