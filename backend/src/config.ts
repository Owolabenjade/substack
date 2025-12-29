import { StacksMainnet, StacksTestnet, StacksDevnet } from '@stacks/network';
import * as dotenv from 'dotenv';

dotenv.config();

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

// Default deployer address (testnet)
const DEFAULT_ADDRESS = 'ST1XWA7MJQ336S4910WZS1WVHJ5R4GS78FJ6QM5WD';

export const config = {
  network: optionalEnv('STACKS_NETWORK', 'testnet'),
  
  contracts: {
    vault: optionalEnv('VAULT_CONTRACT', `${DEFAULT_ADDRESS}.subscription-vault`),
    plans: optionalEnv('PLANS_CONTRACT', `${DEFAULT_ADDRESS}.subscription-plans`),
    engine: optionalEnv('ENGINE_CONTRACT', `${DEFAULT_ADDRESS}.subscription-engine`),
  },
  
  keeper: {
    privateKey: process.env.KEEPER_PRIVATE_KEY || '',
    checkInterval: parseInt(optionalEnv('CHECK_INTERVAL', '10')),
    batchSize: parseInt(optionalEnv('BATCH_SIZE', '10')),
    minProfit: parseInt(optionalEnv('MIN_PROFIT', '1000')),
    maxPlans: parseInt(optionalEnv('MAX_PLANS', '100')),
  },
  
  logLevel: optionalEnv('LOG_LEVEL', 'info'),
};

export function getApiUrl(): string {
  switch (config.network) {
    case 'mainnet': return 'https://api.mainnet.hiro.so';
    case 'devnet': return 'http://localhost:3999';
    default: return 'https://api.testnet.hiro.so';
  }
}

export function getNetwork() {
  switch (config.network) {
    case 'mainnet': return new StacksMainnet();
    case 'devnet': return new StacksDevnet();
    default: return new StacksTestnet();
  }
}

export function parseContractId(contractId: string) {
  const [address, name] = contractId.split('.');
  return { address, name };
}