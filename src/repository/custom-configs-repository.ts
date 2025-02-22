import { BatchGetCommand } from '@aws-sdk/lib-dynamodb';

import type { ReturnValue } from '@aws-sdk/client-dynamodb';
import { updateRecord, getRecordByKey, queryRecords, docClient, createRecord } from '@/dynamo';
import { CustomConfig } from '@/types';
import type { CustomQueryCommandOutput as QueryOutput, QueryRequest } from '@/dynamo';
import { omit } from 'lodash';

const CUSTOM_CONFIG_TABLE = 'motforex-custom-configs';

type QueryResponse = QueryOutput<Partial<CustomConfig>>;

export async function getCustomConfigsByCodes(codes: string[]): Promise<CustomConfig[]> {
  if (codes.length === 0) return [];

  const params = {
    RequestItems: {
      [CUSTOM_CONFIG_TABLE]: {
        Keys: codes.map((code) => ({ code })),
      },
    },
  };

  try {
    const response = await docClient.send(new BatchGetCommand(params));
    return (response.Responses?.[CUSTOM_CONFIG_TABLE] || []) as CustomConfig[];
  } catch (err) {
    console.error(`BatchGetItem failed for codes: ${JSON.stringify(codes)}`, err);
    throw err;
  }
}

export async function getCustomConfigByCode(code: string, projection?: string): Promise<CustomConfig | undefined> {
  return await getRecordByKey<CustomConfig>({
    tableName: CUSTOM_CONFIG_TABLE,
    key: { code },
    projectionExpression: projection,
  });
}
export async function getCustomConfigByQuery(
  query: QueryRequest,
  projection?: string,
  scanIdxForward = false
): Promise<QueryResponse> {
  return await queryRecords<CustomConfig>({
    tableName: CUSTOM_CONFIG_TABLE,
    queryRequest: query,
    projectionExpression: projection,
    scanIdxForward,
  });
}

export async function updateCustomConfigByQuery(
  config: CustomConfig,
  updateExpression: string,
  expAttributeValues: Record<string, unknown>,
  conditionalExp?: string,
  returnValues = 'UPDATED_NEW' as ReturnValue
): Promise<CustomConfig | undefined> {
  return await updateRecord<CustomConfig>({
    tableName: CUSTOM_CONFIG_TABLE,
    key: { code: config.code },
    item: config,
    conditionExpression: conditionalExp,
    updateExpression,
    extraExpressionAttributeValues: expAttributeValues,
    returnValues,
  });
}

export async function updateCustomConfig(
  config: CustomConfig,
  conditionExpression?: string,
  returnValues = 'NONE' as ReturnValue
): Promise<CustomConfig> {
  await updateRecord<CustomConfig>({
    tableName: CUSTOM_CONFIG_TABLE,
    key: { code: config.code },
    item: { ...omit(config, ['code']) },
    conditionExpression,
    returnValues,
  });
  return config;
}

export async function createCustomConfig(config: CustomConfig): Promise<CustomConfig> {
  await createRecord<CustomConfig>({
    tableName: CUSTOM_CONFIG_TABLE,
    item: config,
  });

  return config;
}
