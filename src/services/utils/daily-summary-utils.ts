import { DailySummary } from '@/types';

export function sumTotalDepositAndLot(rows: DailySummary[]): { totalDeposit: number; totalLot: number } {
  let deposit = 0;
  let lot = 0;
  for (const r of rows) {
    deposit += Number(r.totalDeposit || 0);
    lot += Number(r.lot || 0);
  }
  return { totalDeposit: deposit, totalLot: lot };
}
