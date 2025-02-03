import dayjs from 'dayjs';
import { QueryRequest } from '@/dynamo';
import { getDailySummaryByQuery } from '@/repository/daily-summary-repository';
import { CustomError } from '@/error';
import { getCustomConfigByCode } from '@/repository/custom-configs-repository';
import { CONFIG_VIP_LEVELS } from '@/constants';
import { VipConfig } from '@/types';
import { logger } from '@/libs';
import { determineVipTier, groupByEmail, sumTotalDepositAndLot } from '../utils/daily-summary-utils';

// export async function determineUserVipStatus(login: number): Promise<string> {
//   const vipData = (await getCustomConfigByCode(CONFIG_VIP_LEVELS)) as VipConfig | undefined;
//   if (!vipData) {
//     throw new CustomError(`VIP config '${CONFIG_VIP_LEVELS}' not found!`, 400);
//   }
//   const lastNDays = vipData?.promotionValidDateRange || 30;
//   const levels = vipData?.levels as VipLevel[];

//   if (!levels || levels.length === 0) {
//     throw new CustomError(`VIP levels are not configured!`, 400);
//   }

//   const fromDate = dayjs().subtract(lastNDays, 'days').startOf('day');
//   const fromTimestamp = fromDate.valueOf();

//   const query: QueryRequest = {
//     pKey: 'login',
//     pKeyType: 'N',
//     pKeyProp: String(login),
//     sKey: 'timestamp',
//     sKeyType: 'N',
//     sKeyProp: String(fromTimestamp),
//     skComparator: '>=',
//     indexName: 'login-timestamp-index',
//   };

//   const dailySummaries = await getDailySummaryByQuery(query);

//   let totalDeposit = 0;
//   let totalLots = 0;
//   for (const row of dailySummaries.items) {
//     totalDeposit += Number(row.totalDeposit || 0);
//     totalLots += Number(row.lot || 0);
//   }

//   let matchedLevelName = 'NO_STATUS';
//   for (const lvl of levels) {
//     const req = lvl.requirements;
//     const depositOk = totalDeposit >= req.depositMinAmount && totalDeposit <= req.depositMaxAmount;
//     const lotOk = totalLots >= req.lotMinAmount && totalLots <= req.lotMaxAmount;
//     if (depositOk && lotOk) {
//       matchedLevelName = lvl.name;
//       break;
//     }
//   }

//   return matchedLevelName;
// }

export async function determineAllUsersVipStatus(): Promise<void> {
  try {
    logger.info('Starting determineAllUsersVipStatus...');
    const now = new Date();

    logger.info(`Current time: ${now.toISOString()}`);

    const vipConfig = (await getCustomConfigByCode(CONFIG_VIP_LEVELS)) as VipConfig | undefined;
    if (!vipConfig) {
      throw new CustomError(`VIP config '${CONFIG_VIP_LEVELS}' not found!`, 400);
    }

    const days = vipConfig.promotionValidDateRange || 30;
    const fromDate = dayjs().subtract(days, 'days').startOf('day');
    const fromTimestamp = fromDate.valueOf();

    logger.info(`Determining all user VIP statuses from timestamp >= ${fromTimestamp}`);

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
        const newVip = determineVipTier(totalDeposit, totalLot, vipConfig);

        logger.info(`User:${email} => deposit:${totalDeposit}, lot:${totalLot} => VIP:${newVip}`);
      }

      totalProcessed += items.length;
      pageCounter++;

      if (!lastEvaluatedKey) {
        logger.info('No more pages, stopping pagination.');
        // log finish time
        logger.info(`Current time: ${new Date().toISOString()}`);
        break;
      }
      exclusiveKey = lastEvaluatedKey;
    }

    logger.info(`Finished VIP status for all users. totalProcessed=${totalProcessed}`);
  } catch (err) {
    logger.error(`determineAllUsersVipStatus error: ${String(err)}`);
  }
}
