import { BatchGetCommand } from '@aws-sdk/lib-dynamodb';

import type { ReturnValue } from '@aws-sdk/client-dynamodb';
import { updateRecord, getRecordByKey, queryRecords, docClient } from '@/dynamo';
// import { omit } from 'lodash';
import { CustomConfig } from '@/types';
import type { CustomQueryCommandOutput as QueryOutput, QueryRequest } from '@/dynamo';

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
export async function getCustomConfigByQuery(query: QueryRequest, projection?: string): Promise<QueryResponse> {
  return await queryRecords<CustomConfig>({
    tableName: CUSTOM_CONFIG_TABLE,
    queryRequest: query,
    projectionExpression: projection,
  });
}
export async function updateCustomConfig(config: CustomConfig): Promise<CustomConfig | undefined> {
  return await updateRecord<CustomConfig>({
    tableName: CUSTOM_CONFIG_TABLE,
    key: { code: config.code },
    item: config,
  });
}

export async function updateCustomConfigByCustomUpdateQuery(
  config: CustomConfig,
  updateExpression: string,
  expAttributeValues: Record<string, unknown>,
  conditionExpression?: string,
  returnValues = 'UPDATED_NEW' as ReturnValue
): Promise<CustomConfig | undefined> {
  return await updateRecord<CustomConfig>({
    tableName: CUSTOM_CONFIG_TABLE,
    key: { code: config.code },
    item: config,
    updateExpression,
    conditionExpression,
    extraExpressionAttributeValues: expAttributeValues,
    returnValues,
  });
}
