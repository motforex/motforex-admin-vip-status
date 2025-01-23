import type { DescribeTableCommandOutput } from '@aws-sdk/client-dynamodb';
import type { CustomQueryCommandOutput as QueryOutput, QueryRequest } from '@/dynamo';

import { getTableDescription, queryRecords } from '@/dynamo';

const MT5_SUMMARY_TABLE = 'mt5-daily-summary';

export async function getDailySummaryTableDesc(): Promise<DescribeTableCommandOutput> {
  return await getTableDescription(MT5_SUMMARY_TABLE);
}

export async function getDailySummaryByQuery(
  query: QueryRequest,
  projection?: string
): Promise<QueryOutput<Partial<object>>> {
  return await queryRecords<object>({
    tableName: MT5_SUMMARY_TABLE,
    queryRequest: query,
    projectionExpression: projection,
  });
}

// src/repository/mt5-daily-summary-repository.ts

import { DynamoDBClient, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import logger from '@/libs/winston'; // or your logger
import { NoCredentialsError, CredentialsProviderError } from '@aws-sdk/property-provider';

const ddbClient = new DynamoDBClient({});

const TYPE_TIMESTAMP_INDEX = 'type-timestamp-index';

export async function getDailySummariesPageByTimestampGt(
  timestamp: number,
  exclusiveStartKey?: any,
  pageSize?: number
): Promise<{
  items: any[];
  lastKey?: string; // string-ified JSON for the LastEvaluatedKey
}> {
  try {
    const queryArgs: QueryCommandInput = {
      TableName: MT5_SUMMARY_TABLE,
      IndexName: TYPE_TIMESTAMP_INDEX,
      KeyConditionExpression: '#type = :typeVal AND #ts > :tsVal',
      ExpressionAttributeNames: {
        '#type': 'type',
        '#ts': 'timestamp',
      },
      ExpressionAttributeValues: {
        ':typeVal': { N: '0' }, // type = 0
        ':tsVal': { N: String(timestamp) }, // timestamp > input
      },
    };

    // optionally add a pageSize limit
    if (pageSize && pageSize > 0) {
      queryArgs.Limit = pageSize;
    }

    // handle ExclusiveStartKey if provided
    // If 'exclusiveStartKey' is a JSON string from a previous response, parse it
    if (exclusiveStartKey) {
      if (typeof exclusiveStartKey === 'string') {
        queryArgs.ExclusiveStartKey = JSON.parse(exclusiveStartKey);
      } else if (typeof exclusiveStartKey === 'object') {
        queryArgs.ExclusiveStartKey = exclusiveStartKey;
      }
    }

    const response = await ddbClient.send(new QueryCommand(queryArgs));

    // convert each item from AttributeValue map to plain object
    const items = (response.Items || []).map((item) => unmarshall(item));

    // convert LastEvaluatedKey to a JSON string if it exists
    const lastKey = response.LastEvaluatedKey ? JSON.stringify(response.LastEvaluatedKey) : undefined;

    return { items, lastKey };
  } catch (err: unknown) {
    if (err instanceof NoCredentialsError || err instanceof CredentialsProviderError) {
      logger.error('getDailySummariesPageByTimestampGt: No or partial credentials provided.');
    } else {
      logger.error(`getDailySummariesPageByTimestampGt: An error occurred: ${String(err)}`);
    }
    throw err;
  }
}
