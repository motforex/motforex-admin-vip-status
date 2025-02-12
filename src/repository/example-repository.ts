// import type { DescribeTableCommandOutput } from '@aws-sdk/client-dynamodb';
// import type { CustomQueryCommandOutput as QueryOutput, QueryRequest } from '@/dynamo';

// import { createRecord, getRecordByKey, getTableDescription, queryRecords, updateRecord } from '@/dynamo';

// const TABLE_NAME = '';

// export async function getExampleTableDescription(): Promise<DescribeTableCommandOutput> {
//   return await getTableDescription(TABLE_NAME);
// }

// export async function getExampleItemById(id: string, projectionExp?: string): Promise<object | undefined> {
//   const params = {
//     tableName: TABLE_NAME,
//     key: { id },
//     projectionExpression: projectionExp,
//   };

//   return await getRecordByKey<object>(params);
// }

// export async function getExampleByQuery(queryRequest: QueryRequest): Promise<QueryOutput<Partial<object>>> {
//   return await queryRecords<object>({ tableName: TABLE_NAME, queryRequest });
// }

// export async function createExampleItem(newItem: object): Promise<object> {
//   return await createRecord<object>({ tableName: TABLE_NAME, item: newItem });
// }

// export async function updateExampleItem(exampleItem: object): Promise<object | undefined> {
//   return await updateRecord<object>({ tableName: TABLE_NAME, key: { id: 0 }, item: exampleItem });
// }

// src/repository/mt5-daily-summary-repository.ts

import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const ddbClient = new DynamoDBClient({});
const MT5_SUMMARY_TABLE = 'mt5-daily-summary';

/**
 * Summation of deposit + lot for a single user login over the last N days
 */
export async function getUserMetrics(
  login: number,
  fromTimestamp: number
): Promise<{ totalDeposit: number; totalLots: number }> {
  // We'll do a naive scan, then filter
  const command = new ScanCommand({
    TableName: MT5_SUMMARY_TABLE,
  });
  const resp = await ddbClient.send(command);
  if (!resp.Items) return { totalDeposit: 0, totalLots: 0 };

  let sumDeposit = 0;
  let sumLots = 0;

  for (const item of resp.Items) {
    const row = unmarshall(item);
    // e.g. row.timestamp, row.login, row.totalDeposit, row.lot
    if (row.login === login && row.timestamp >= fromTimestamp) {
      sumDeposit += Number(row.totalDeposit || 0);
      sumLots += Number(row.lot || 0);
    }
  }

  return { totalDeposit: sumDeposit, totalLots: sumLots };
}
