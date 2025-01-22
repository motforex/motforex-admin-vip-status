// src/services/vip-status/vip-status-service.ts

import { getVipConfig } from './vip-status-config-service';
import { getUserMetrics } from '@/repository/mt5-daily-summary-repository';
import CustomError from '@/error/custom-error';
import dayjs from 'dayjs';

export async function determineUserVipStatus(login: number): Promise<string> {
  // 1. Get the config item
  const configItem = await getVipConfig();
  let vipData;
  if (typeof configItem.value === 'string') {
    vipData = JSON.parse(configItem.value);
  } else {
    vipData = configItem.value; // e.g. { promotionValidDateRange: 30, levels: [ ... ] }
  }

  const lastNDays = vipData.promotionValidDateRange || 30;

  // 2. Compute fromTimestamp
  const fromDate = dayjs().subtract(lastNDays, 'days').startOf('day');
  const fromTimestamp = fromDate.valueOf();

  // 3. Get deposit & lots from daily summary
  const { totalDeposit, totalLots } = await getUserMetrics(login, fromTimestamp);

  // 4. Determine which level
  if (!vipData.levels || !Array.isArray(vipData.levels)) {
    throw new CustomError('Invalid VIP config, no levels array found', 500);
  }

  let matchedLevelName = 'NO_STATUS';
  for (const lvl of vipData.levels) {
    const req = lvl.requirements;
    const depositOk = totalDeposit >= req.depositMinAmount && totalDeposit <= req.depositMaxAmount;
    const lotOk = totalLots >= req.lotMinAmount && totalLots <= req.lotMaxAmount;

    if (depositOk && lotOk) {
      matchedLevelName = lvl.name; // e.g. "GOLD VIP"
      // if you want highest possible, don't break; but otherwise break on first match
      break;
    }
  }

  return matchedLevelName;
}

/**
 * Example function that updates or returns the user’s new VIP
 * e.g. store it in a user table or just return it
 */
export async function recalcAndUpdateUserVip(login: number, userId: string): Promise<string> {
  const newLevel = await determineUserVipStatus(login);
  // store in user table if needed
  // e.g. await updateUser({ userId, vipLevel: newLevel });
  return newLevel;
}
