import dayjs from 'dayjs';
import { QueryRequest } from '@/dynamo';
import { getDailySummaryByQuery } from '@/repository/daily-summary-repository';

import { logger } from '@/libs';
import { determineVipTier, groupByEmail, sumTotalDepositAndLot } from '../utils/daily-summary-utils';
import { getCustomConfigByQuery } from '@/repository/custom-configs-repository';

export async function determineAllUsersVipStatus(): Promise<void> {
  try {
    const query: QueryRequest = {
      indexName: 'parentCode-createdAt-index',
      pKey: 'VIP',
      pKeyProp: 'parentCode',
      pKeyType: 'S',
    };
    const customConfig = await getCustomConfigByQuery(
      query,
      'code, value, valueType, description, isActive, isEditable, createdAt, createdBy, updatedAt, updatedBy'
    );
    const days = 30;
    const fromDate = dayjs().subtract(days, 'days').startOf('day');
    const fromTimestamp = fromDate.valueOf();

    let pageCounter = 1;
    let totalProcessed = 0;
    let exclusiveKey: string | undefined = undefined;

    const querySet: QueryRequest = {
      pKey: '0',
      pKeyType: 'N',
      pKeyProp: 'type',
      sKey: String(fromTimestamp),
      sKeyType: 'N',
      sKeyProp: 'timestamp',
      skComparator: '>=',
      indexName: 'type-timestamp-index',
      limit: '100',
    };

    while (true) {
      logger.info(`Fetching page ${pageCounter} with lastKey=${exclusiveKey || 'none'}`);
      if (exclusiveKey) {
        querySet.lastEvaluatedKey = exclusiveKey;
      } else {
        delete querySet.lastEvaluatedKey;
      }

      const { items, lastEvaluatedKey } = await getDailySummaryByQuery(querySet);

      logger.info(`Page ${pageCounter} => fetched ${items.length} daily summaries.`);

      if (items.length === 0) {
        logger.info('No more items found. Possibly end of data.');
        break;
      }

      const groupedMap = groupByEmail(items);
      for (const [email, rows] of Object.entries(groupedMap)) {
        const { totalDeposit, totalLot } = sumTotalDepositAndLot(rows);
        const newVip = determineVipTier(totalDeposit, totalLot, customConfig.items);

        logger.info(`User:${email} => deposit:${totalDeposit}, lot:${totalLot} => VIP:${newVip}`);
      }

      totalProcessed += items.length;
      pageCounter++;

      if (!lastEvaluatedKey) {
        logger.info('No more pages, stopping pagination.');

        break;
      }
      exclusiveKey = lastEvaluatedKey;
    }

    logger.info(`Finished VIP status for all users. totalProcessed=${totalProcessed}`);
  } catch (err) {
    logger.error(`determineAllUsersVipStatus error: ${String(err)}`);
  }
}
