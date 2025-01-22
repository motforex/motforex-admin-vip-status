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
