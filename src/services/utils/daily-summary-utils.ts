import { DailySummary, VipConfig } from '@/types';

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

export function determineVipTier(deposit: number, lot: number, vipConfig: VipConfig): string {
  const levels = vipConfig.levels;
  if (!levels || levels.length === 0) {
    return 'NO_STATUS';
  }

  let matched = 'NO_STATUS';
  for (const lvl of levels) {
    const req = lvl.requirements;
    if (
      req.depositMinAmount === undefined ||
      req.depositMaxAmount === undefined ||
      req.lotMinAmount === undefined ||
      req.lotMaxAmount === undefined
    ) {
      continue;
    }
    const depositOk = deposit >= req.depositMinAmount && deposit <= req.depositMaxAmount;
    const lotOk = lot >= req.lotMinAmount && lot <= req.lotMaxAmount;
    if (depositOk && lotOk) {
      matched = lvl.name;
      break;
    }
  }
  return matched;
}
