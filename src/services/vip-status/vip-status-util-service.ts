import dayjs from 'dayjs';
import { QueryRequest } from '@/dynamo';
import { getDailySummaryByQuery } from '@/repository/daily-summary-repository';
import { CustomError } from '@/error';
import { getCustomConfigByCode } from '@/repository/custom-configs-repository';
import { CONFIG_VIP_LEVELS } from '@/constants';
import { VipConfig, VipLevel } from '@/types';

export async function determineUserVipStatus(login: number): Promise<string> {
  const vipData = (await getCustomConfigByCode(CONFIG_VIP_LEVELS)) as VipConfig | undefined;
  if (!vipData) {
    throw new CustomError(`VIP config '${CONFIG_VIP_LEVELS}' not found!`, 400);
  }
  const lastNDays = vipData?.promotionValidDateRange || 30;
  const levels = vipData?.levels as VipLevel[];

  if (!levels || levels.length === 0) {
    throw new CustomError(`VIP levels are not configured!`, 400);
  }

  const fromDate = dayjs().subtract(lastNDays, 'days').startOf('day');
  const fromTimestamp = fromDate.valueOf();

  const query: QueryRequest = {
    pKey: 'login',
    pKeyType: 'N',
    pKeyProp: String(login),
    sKey: 'timestamp',
    sKeyType: 'N',
    sKeyProp: String(fromTimestamp),
    skComparator: '>=',
    indexName: 'login-timestamp-index',
  };

  const dailySummaries = await getDailySummaryByQuery(query);

  let totalDeposit = 0;
  let totalLots = 0;
  for (const row of dailySummaries.items) {
    totalDeposit += Number(row.totalDeposit || 0);
    totalLots += Number(row.lot || 0);
  }

  let matchedLevelName = 'NO_STATUS';
  for (const lvl of levels) {
    const req = lvl.requirements;
    const depositOk = totalDeposit >= req.depositMinAmount && totalDeposit <= req.depositMaxAmount;
    const lotOk = totalLots >= req.lotMinAmount && totalLots <= req.lotMaxAmount;
    if (depositOk && lotOk) {
      matchedLevelName = lvl.name;
      break;
    }
  }

  return matchedLevelName;
}

// determine all the user's daily summaries for the last N days
