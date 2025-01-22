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
