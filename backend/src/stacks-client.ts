// src/stacks-client.ts
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  principalCV,
  listCV,
  tupleCV,
  cvToJSON,
  callReadOnlyFunction,
  ClarityValue,
} from '@stacks/transactions';
import { config, getNetwork, getApiUrl, parseContractId } from './config';

const network = getNetwork();

// Read-only function helper
async function callReadOnly(contractId: string, functionName: string, args: ClarityValue[]): Promise<any> {
  const { address, name } = parseContractId(contractId);
  const result = await callReadOnlyFunction({
    network,
    contractAddress: address,
    contractName: name,
    functionName,
    functionArgs: args,
    senderAddress: address,
  });
  return cvToJSON(result);
}

export async function getCurrentBlockHeight(): Promise<number> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/extended/v1/block?limit=1`);
  const data = await response.json() as { results: { height: number }[] };
  return data.results[0]?.height || 0;
}

export async function getTotalPlans(): Promise<number> {
  const result = await callReadOnly(config.contracts.plans, 'get-total-plans', []);
  return parseInt(result.value);
}

export async function getPlan(planId: number) {
  const result = await callReadOnly(config.contracts.plans, 'get-plan', [uintCV(planId)]);
  if (!result.value) return null;
  const plan = result.value.value;
  return {
    id: planId,
    merchant: plan.merchant.value,
    amount: parseInt(plan.amount.value),
    intervalBlocks: parseInt(plan['interval-blocks'].value),
    active: plan.active.value,
    subscriberCount: parseInt(plan['subscriber-count'].value),
  };
}

export async function getPlanSubscribers(planId: number): Promise<string[]> {
  const result = await callReadOnly(config.contracts.engine, 'get-plan-subscribers', [uintCV(planId)]);
  if (!result.value || !Array.isArray(result.value)) return [];
  return result.value.map((v: any) => v.value);
}

export async function isChargeDue(subscriber: string, planId: number): Promise<boolean> {
  const result = await callReadOnly(config.contracts.engine, 'is-charge-due', [principalCV(subscriber), uintCV(planId)]);
  return result.value === true;
}

export async function getSubscription(subscriber: string, planId: number) {
  const result = await callReadOnly(config.contracts.engine, 'get-subscription', [principalCV(subscriber), uintCV(planId)]);
  if (!result.value) return null;
  const sub = result.value.value;
  return {
    subscriber,
    planId,
    active: sub.active.value,
    planAmount: parseInt(sub['plan-amount'].value),
    planInterval: parseInt(sub['plan-interval'].value),
  };
}

export async function getVaultBalance(user: string): Promise<number> {
  const result = await callReadOnly(config.contracts.vault, 'get-balance', [principalCV(user)]);
  return parseInt(result.value);
}

export async function executeCharge(subscriber: string, planId: number, privateKey: string) {
  const { address, name } = parseContractId(config.contracts.engine);
  const txOptions = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: address,
    contractName: name,
    functionName: 'execute-charge',
    functionArgs: [principalCV(subscriber), uintCV(planId)],
    senderKey: privateKey,
    postConditionMode: PostConditionMode.Allow,
    fee: 10000n,
  };
  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  if ('error' in broadcastResponse) throw new Error(`Broadcast failed: ${broadcastResponse.error}`);
  return { txId: broadcastResponse.txid };
}

export async function findDueCharges(): Promise<{ subscriber: string; planId: number; amount: number }[]> {
  const dueCharges: { subscriber: string; planId: number; amount: number }[] = [];
  const totalPlans = await getTotalPlans();
  
  for (let planId = 1; planId <= Math.min(totalPlans, config.keeper.maxPlans); planId++) {
    const plan = await getPlan(planId);
    if (!plan || !plan.active || plan.subscriberCount === 0) continue;
    
    const subscribers = await getPlanSubscribers(planId);
    for (const subscriber of subscribers) {
      const isDue = await isChargeDue(subscriber, planId);
      if (isDue) {
        const sub = await getSubscription(subscriber, planId);
        if (sub && sub.active) {
          dueCharges.push({ subscriber, planId, amount: sub.planAmount });
        }
      }
    }
  }
  return dueCharges;
}

export default {
  getCurrentBlockHeight, getTotalPlans, getPlan, getPlanSubscribers,
  isChargeDue, getSubscription, getVaultBalance, executeCharge, findDueCharges,
};