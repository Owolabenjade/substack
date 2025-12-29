import * as cron from 'node-cron';
import { config } from './config';
import stacksClient from './stacks-client';

function formatSTX(microSTX: number): string {
  return (microSTX / 1_000_000).toFixed(6);
}

function log(level: string, message: string, data?: any): void {
  const levels = ['debug', 'info', 'warn', 'error'];
  if (levels.indexOf(level) >= levels.indexOf(config.logLevel)) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data || '');
  }
}

function calculateKeeperFee(amount: number): number {
  return Math.floor((amount * 20) / 10000); // 0.2%
}

let isRunning = false;

async function runKeeperCycle(): Promise<void> {
  if (isRunning) {
    log('warn', 'Previous cycle still running, skipping...');
    return;
  }
  
  isRunning = true;
  log('info', '=== Starting keeper cycle ===');
  
  try {
    const blockHeight = await stacksClient.getCurrentBlockHeight();
    log('info', `Current block height: ${blockHeight}`);
    
    const dueCharges = await stacksClient.findDueCharges();
    log('info', `Found ${dueCharges.length} due charges`);
    
    if (dueCharges.length === 0) {
      log('info', '=== Cycle complete (no charges) ===');
      isRunning = false;
      return;
    }
    
    // Filter by profit threshold
    const profitableCharges = dueCharges.filter(c => calculateKeeperFee(c.amount) >= config.keeper.minProfit);
    log('info', `${profitableCharges.length} charges above profit threshold`);
    
    let executed = 0;
    for (const charge of profitableCharges.slice(0, config.keeper.batchSize)) {
      try {
        log('info', `Executing: ${charge.subscriber} -> Plan #${charge.planId}`);
        const result = await stacksClient.executeCharge(charge.subscriber, charge.planId, config.keeper.privateKey);
        log('info', `✓ TX: ${result.txId}`);
        executed++;
      } catch (error) {
        log('error', `✗ Failed:`, error);
      }
    }
    
    log('info', `=== Cycle complete: ${executed} charges executed ===`);
  } catch (error) {
    log('error', 'Cycle failed:', error);
  } finally {
    isRunning = false;
  }
}

export function startKeeper(): void {
  if (!config.keeper.privateKey) {
    console.error('[FATAL] KEEPER_PRIVATE_KEY not configured');
    console.error('Copy .env.example to .env and add your private key');
    process.exit(1);
  }
  
  console.log('');
  console.log('========================================');
  console.log('   SubStack Protocol - Keeper Service');
  console.log('========================================');
  console.log(`Network:        ${config.network}`);
  console.log(`Check Interval: ${config.keeper.checkInterval} minutes`);
  console.log(`Batch Size:     ${config.keeper.batchSize}`);
  console.log(`Min Profit:     ${formatSTX(config.keeper.minProfit)} STX`);
  console.log('========================================');
  console.log('');
  
  // Run immediately
  runKeeperCycle();
  
  // Schedule runs
  const intervalMs = config.keeper.checkInterval * 60 * 1000;
  setInterval(runKeeperCycle, intervalMs);
  
  log('info', `Keeper running every ${config.keeper.checkInterval} minutes`);
  log('info', 'Press Ctrl+C to stop');
}

// Run if executed directly
if (require.main === module) {
  startKeeper();
}