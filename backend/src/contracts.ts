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
  fetchCallReadOnlyFunction,
} from '@stacks/transactions';
import { CONTRACTS, network, parseContractId, API_URL, KEEPER_PRIVATE_KEY } from './config';

export async function getCurrentBlockHeight(): Promise<number> {
  const response = await fetch(`${API_URL}/extended/v1/block?limit=1`);
  const data = await response.json();
  return data.results[0]?.height || 0;
}

export async function getTotalPlans(): Promise<number> {
  const { address, name } = parseContractId(CONTRACTS.plans);
  try {
    const result = await fetchCallReadOnlyFunction({
      network,
      contractAddress: address,
      contractName: name,
      functionName: 'get-total-plans',
      functionArgs: [],
      senderAddress: address,
    });
    return parseInt(cvToJSON(result).value);
  } catch (error) {
    console.error('Error fetching total plans:', error);
    return 0;
  }
}

export async function getPlan(planId: number) {
  const { address, name } = parseContractId(CONTRACTS.plans);
  try {
    const result = await fetchCallReadOnlyFunction({
      network,
      contractAddress: address,
      contractName: name,
      functionName: 'get-plan',
      functionArgs: [uintCV(planId)],
      senderAddress: address,
    });
    const json = cvToJSON(result);
    if (!json.value) return null;
    const plan = json.value.value;
    return {
      merchant: plan.merchant.value,
      amount: parseInt(plan.amount.value),
      intervalBlocks: parseInt(plan['interval-blocks'].value),
      active: plan.active.value,
      subscriberCount: parseInt(plan['subscriber-count'].value),
    };
  } catch (error) {
    return null;
  }
}

export async function getPlanSubscribers(planId: number): Promise<string[]> {
  const { address, name } = parseContractId(CONTRACTS.engine);
  try {
    const result = await fetchCallReadOnlyFunction({
      network,
      contractAddress: address,
      contractName: name,
      functionName: 'get-plan-subscribers',
      functionArgs: [uintCV(planId)],
      senderAddress: address,
    });
    const json = cvToJSON(result);
    if (!json.value || !Array.isArray(json.value)) return [];
    return json.value.map((item: any) => item.value);
  } catch (error) {
    return [];
  }
}

export async function isChargeDue(subscriber: string, planId: number): Promise<boolean> {
  const { address, name } = parseContractId(CONTRACTS.engine);
  try {
    const result = await fetchCallReadOnlyFunction({
      network,
      contractAddress: address,
      contractName: name,
      functionName: 'is-charge-due',
      functionArgs: [principalCV(subscriber), uintCV(planId)],
      senderAddress: address,
    });
    return cvToJSON(result).value === true;
  } catch (error) {
    return false;
  }
}

export async function getSubscription(subscriber: string, planId: number) {
  const { address, name } = parseContractId(CONTRACTS.engine);
  try {
    const result = await fetchCallReadOnlyFunction({
      network,
      contractAddress: address,
      contractName: name,
      functionName: 'get-subscription',
      functionArgs: [principalCV(subscriber), uintCV(planId)],
      senderAddress: address,
    });
    const json = cvToJSON(result);
    if (!json.value) return null;
    const sub = json.value.value;
    return {
      planAmount: parseInt(sub['plan-amount'].value),
      planInterval: parseInt(sub['plan-interval'].value),
      active: sub.active.value,
    };
  } catch (error) {
    return null;
  }
}

export async function getBalance(subscriber: string): Promise<number> {
  const { address, name } = parseContractId(CONTRACTS.vault);
  try {
    const result = await fetchCallReadOnlyFunction({
      network,
      contractAddress: address,
      contractName: name,
      functionName: 'get-balance',
      functionArgs: [principalCV(subscriber)],
      senderAddress: address,
    });
    return parseInt(cvToJSON(result).value);
  } catch (error) {
    return 0;
  }
}

export async function executeCharge(subscriber: string, planId: number): Promise<string | null> {
  if (!KEEPER_PRIVATE_KEY) throw new Error('Keeper private key not configured');
  const { address, name } = parseContractId(CONTRACTS.engine);
  try {
    const transaction = await makeContractCall({
      network,
      anchorMode: AnchorMode.Any,
      contractAddress: address,
      contractName: name,
      functionName: 'execute-charge',
      functionArgs: [principalCV(subscriber), uintCV(planId)],
      postConditionMode: PostConditionMode.Allow,
      senderKey: KEEPER_PRIVATE_KEY,
    });
    const response = await broadcastTransaction(transaction, network);
    if ('error' in response) return null;
    return response.txid;
  } catch (error) {
    return null;
  }
}

export async function executeBatchCharges(charges: { subscriber: string; planId: number }[]): Promise<string | null> {
  if (!KEEPER_PRIVATE_KEY) throw new Error('Keeper private key not configured');
  if (charges.length === 0) return null;
  if (charges.length > 10) charges = charges.slice(0, 10);
  
  const { address, name } = parseContractId(CONTRACTS.engine);
  try {
    const chargesList = listCV(
      charges.map(c => tupleCV({
        subscriber: principalCV(c.subscriber),
        'plan-id': uintCV(c.planId),
      }))
    );
    const transaction = await makeContractCall({
      network,
      anchorMode: AnchorMode.Any,
      contractAddress: address,
      contractName: name,
      functionName: 'batch-execute-charges',
      functionArgs: [chargesList],
      postConditionMode: PostConditionMode.Allow,
      senderKey: KEEPER_PRIVATE_KEY,
    });
    const response = await broadcastTransaction(transaction, network);
    if ('error' in response) return null;
    return response.txid;
  } catch (error) {
    return null;
  }
}