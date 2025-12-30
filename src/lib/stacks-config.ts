// Stacks blockchain configuration
export const STACKS_NETWORK = 'mainnet' as const;

// Contract addresses - replace with deployed contract addresses
export const CONTRACTS = {
  subscriptionVault: {
    address: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9',
    name: 'subscription-vault',
  },
  subscriptionEngine: {
    address: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9',
    name: 'subscription-engine',
  },
  subscriptionPlans: {
    address: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9',
    name: 'subscription-plans',
  },
} as const;

// Block time estimation (Stacks averages ~10 min per block)
export const BLOCKS_PER_DAY = 144;
export const BLOCKS_PER_MONTH = 4320;
export const BLOCKS_PER_WEEK = 1008;

export function blocksToReadablePeriod(blocks: number): string {
  if (blocks >= BLOCKS_PER_MONTH) {
    const months = Math.round(blocks / BLOCKS_PER_MONTH);
    return months === 1 ? 'Monthly' : `Every ${months} months`;
  }
  if (blocks >= BLOCKS_PER_WEEK) {
    const weeks = Math.round(blocks / BLOCKS_PER_WEEK);
    return weeks === 1 ? 'Weekly' : `Every ${weeks} weeks`;
  }
  const days = Math.round(blocks / BLOCKS_PER_DAY);
  return days === 1 ? 'Daily' : `Every ${days} days`;
}

export function readablePeriodToBlocks(period: string): number {
  switch (period.toLowerCase()) {
    case 'daily':
      return BLOCKS_PER_DAY;
    case 'weekly':
      return BLOCKS_PER_WEEK;
    case 'monthly':
      return BLOCKS_PER_MONTH;
    default:
      return BLOCKS_PER_MONTH;
  }
}
