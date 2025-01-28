import type { DescribeTableCommandOutput } from '@aws-sdk/client-dynamodb';
import type { CustomQueryCommandOutput as QueryOutput, QueryRequest } from '@/dynamo';

import { getTableDescription, queryRecords } from '@/dynamo';
import { DailySummary } from '@/types';

const MT5_SUMMARY_TABLE = 'MT5-daily-summary';

export async function getDailySummaryTableDesc(): Promise<DescribeTableCommandOutput> {
  return await getTableDescription(MT5_SUMMARY_TABLE);
}

export async function getDailySummaryByQuery(
  query: QueryRequest,
  projection?: string,
  indexForward: boolean = false
): Promise<QueryOutput<DailySummary>> {
  return await queryRecords<DailySummary>({
    tableName: MT5_SUMMARY_TABLE,
    queryRequest: query,
    projectionExpression: projection,
    scanIdxForward: indexForward,
  });
}
