import { BASIC_USER_VIP_STATUS } from '@/constants';
import { CustomConfig, DailySummary } from '@/types';

export function sumTotalDepositAndLot(rows: DailySummary[]): { totalDeposit: number; totalLot: number } {
  let deposit = 0;
  let lot = 0;
  for (const r of rows) {
    deposit += Number(r.totalDeposit || 0);
    lot += Number(r.lot || 0);
  }
  return { totalDeposit: deposit, totalLot: lot };
}

export function groupByEmail(rows: DailySummary[]): Record<string, DailySummary[]> {
  const map: Record<string, DailySummary[]> = {};

  for (const r of rows) {
    const email = r.email;
    if (!map[email]) {
      map[email] = [];
    }
    map[email].push(r);
  }

  return map;
}

export function sumDailySummaries(rows: DailySummary[]): { deposit: number; lot: number } {
  let deposit = 0;
  let lot = 0;
  for (const r of rows) {
    deposit += Number(r.totalDeposit || 0);
    lot += Number(r.lot || 0);
  }
  return { deposit, lot };
}

export function determineVipTier(deposit: number, lot: number, customConfigs: Partial<CustomConfig>[]): string {
  if (!customConfigs || customConfigs.length === 0) {
    return BASIC_USER_VIP_STATUS;
  }

  let matched = BASIC_USER_VIP_STATUS;
  for (const lvl of customConfigs) {
    const req = lvl.value;

    if (req?.lotMinAmount === undefined || req?.lotMaxAmount === undefined) {
      continue;
    }
    const lotOk = lot >= Number(req.lotMinAmount) && lot <= Number(req.lotMaxAmount);
    if (lotOk) {
      matched = req.subTitle;
      break;
    }
  }
  return matched;
}
