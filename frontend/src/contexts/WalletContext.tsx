import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { showConnect, UserSession, AppConfig } from '@stacks/connect';
import { 
  openContractCall,
  ContractCallOptions 
} from '@stacks/connect';
import { 
  uintCV, 
  principalCV,
  stringUtf8CV,
  PostConditionMode,
  Pc
} from '@stacks/transactions';
import { CONTRACTS, STACKS_NETWORK } from '@/lib/stacks-config';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const appConfig = new AppConfig(['store_write']);
const userSession = new UserSession({ appConfig });

interface WalletContextType {
  connected: boolean;
  address: string | null;
  balance: number;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  deposit: (amount: number) => Promise<string | null>;
  withdraw: (amount: number) => Promise<string | null>;
  authorizeMerchant: (merchant: string, maxPerPeriod: number, periodLength: number) => Promise<string | null>;
  revokeAuthorization: (merchant: string) => Promise<string | null>;
  subscribe: (planId: number) => Promise<string | null>;
  unsubscribe: (planId: number) => Promise<string | null>;
  createPlan: (amount: number, intervalBlocks: number, metadataUri: string) => Promise<string | null>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { updateProfile } = useAuth();
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [connecting, setConnecting] = useState(false);

  // Check if already connected on mount
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const userAddress = userData.profile.stxAddress.mainnet;
      setAddress(userAddress);
      setConnected(true);
      fetchBalance(userAddress);
    }
  }, []);

  const fetchBalance = async (addr: string) => {
    try {
      const response = await fetch(
        `https://api.mainnet.hiro.so/extended/v1/address/${addr}/balances`
      );
      const data = await response.json();
      const stxBalance = parseInt(data.stx?.balance || '0') / 1_000_000;
      setBalance(stxBalance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const connect = useCallback(async () => {
    setConnecting(true);
    
    try {
      showConnect({
        appDetails: {
          name: 'SubStack Protocol',
          icon: window.location.origin + '/favicon.ico',
        },
        onFinish: async () => {
          const userData = userSession.loadUserData();
          const userAddress = userData.profile.stxAddress.mainnet;
          setAddress(userAddress);
          setConnected(true);
          await fetchBalance(userAddress);
          
          // Update profile with wallet address
          await updateProfile({ wallet_address: userAddress });
          
          toast.success('Wallet connected successfully!');
        },
        onCancel: () => {
          toast.error('Wallet connection cancelled');
        },
        userSession,
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  }, [updateProfile]);

  const disconnect = useCallback(() => {
    userSession.signUserOut();
    setConnected(false);
    setAddress(null);
    setBalance(0);
    toast.info('Wallet disconnected');
  }, []);

  const deposit = useCallback(async (amount: number): Promise<string | null> => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return null;
    }

    const microStx = BigInt(Math.floor(amount * 1_000_000));

    const options: ContractCallOptions = {
      network: STACKS_NETWORK,
      contractAddress: CONTRACTS.subscriptionVault.address,
      contractName: CONTRACTS.subscriptionVault.name,
      functionName: 'deposit',
      functionArgs: [uintCV(microStx)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        Pc.principal(address).willSendEq(microStx).ustx(),
      ],
      onFinish: (data) => {
        toast.success(`Deposit submitted! TX: ${data.txId.slice(0, 10)}...`);
        fetchBalance(address);
      },
      onCancel: () => {
        toast.error('Transaction cancelled');
      },
    };

    try {
      await openContractCall(options);
      return 'pending';
    } catch (error) {
      console.error('Deposit failed:', error);
      toast.error('Deposit failed');
      return null;
    }
  }, [address]);

  const withdraw = useCallback(async (amount: number): Promise<string | null> => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return null;
    }

    const microStx = BigInt(Math.floor(amount * 1_000_000));

    const options: ContractCallOptions = {
      network: STACKS_NETWORK,
      contractAddress: CONTRACTS.subscriptionVault.address,
      contractName: CONTRACTS.subscriptionVault.name,
      functionName: 'withdraw',
      functionArgs: [uintCV(microStx)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        toast.success(`Withdrawal submitted! TX: ${data.txId.slice(0, 10)}...`);
        fetchBalance(address);
      },
      onCancel: () => {
        toast.error('Transaction cancelled');
      },
    };

    try {
      await openContractCall(options);
      return 'pending';
    } catch (error) {
      console.error('Withdrawal failed:', error);
      toast.error('Withdrawal failed');
      return null;
    }
  }, [address]);

  const authorizeMerchant = useCallback(async (
    merchant: string,
    maxPerPeriod: number,
    periodLength: number
  ): Promise<string | null> => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return null;
    }

    const microStx = BigInt(Math.floor(maxPerPeriod * 1_000_000));

    const options: ContractCallOptions = {
      network: STACKS_NETWORK,
      contractAddress: CONTRACTS.subscriptionVault.address,
      contractName: CONTRACTS.subscriptionVault.name,
      functionName: 'authorize-merchant',
      functionArgs: [
        principalCV(merchant),
        uintCV(microStx),
        uintCV(periodLength),
      ],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        toast.success(`Authorization submitted! TX: ${data.txId.slice(0, 10)}...`);
      },
      onCancel: () => {
        toast.error('Transaction cancelled');
      },
    };

    try {
      await openContractCall(options);
      return 'pending';
    } catch (error) {
      console.error('Authorization failed:', error);
      toast.error('Authorization failed');
      return null;
    }
  }, [address]);

  const revokeAuthorization = useCallback(async (merchant: string): Promise<string | null> => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return null;
    }

    const options: ContractCallOptions = {
      network: STACKS_NETWORK,
      contractAddress: CONTRACTS.subscriptionVault.address,
      contractName: CONTRACTS.subscriptionVault.name,
      functionName: 'revoke-authorization',
      functionArgs: [principalCV(merchant)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        toast.success(`Revocation submitted! TX: ${data.txId.slice(0, 10)}...`);
      },
      onCancel: () => {
        toast.error('Transaction cancelled');
      },
    };

    try {
      await openContractCall(options);
      return 'pending';
    } catch (error) {
      console.error('Revocation failed:', error);
      toast.error('Revocation failed');
      return null;
    }
  }, [address]);

  const subscribe = useCallback(async (planId: number): Promise<string | null> => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return null;
    }

    const options: ContractCallOptions = {
      network: STACKS_NETWORK,
      contractAddress: CONTRACTS.subscriptionEngine.address,
      contractName: CONTRACTS.subscriptionEngine.name,
      functionName: 'subscribe',
      functionArgs: [uintCV(planId)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        toast.success(`Subscription submitted! TX: ${data.txId.slice(0, 10)}...`);
      },
      onCancel: () => {
        toast.error('Transaction cancelled');
      },
    };

    try {
      await openContractCall(options);
      return 'pending';
    } catch (error) {
      console.error('Subscribe failed:', error);
      toast.error('Subscription failed');
      return null;
    }
  }, [address]);

  const unsubscribe = useCallback(async (planId: number): Promise<string | null> => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return null;
    }

    const options: ContractCallOptions = {
      network: STACKS_NETWORK,
      contractAddress: CONTRACTS.subscriptionEngine.address,
      contractName: CONTRACTS.subscriptionEngine.name,
      functionName: 'unsubscribe',
      functionArgs: [uintCV(planId)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        toast.success(`Unsubscribe submitted! TX: ${data.txId.slice(0, 10)}...`);
      },
      onCancel: () => {
        toast.error('Transaction cancelled');
      },
    };

    try {
      await openContractCall(options);
      return 'pending';
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      toast.error('Unsubscribe failed');
      return null;
    }
  }, [address]);

  const createPlan = useCallback(async (
    amount: number,
    intervalBlocks: number,
    metadataUri: string
  ): Promise<string | null> => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return null;
    }

    const microStx = BigInt(Math.floor(amount * 1_000_000));

    const options: ContractCallOptions = {
      network: STACKS_NETWORK,
      contractAddress: CONTRACTS.subscriptionPlans.address,
      contractName: CONTRACTS.subscriptionPlans.name,
      functionName: 'create-plan',
      functionArgs: [
        uintCV(microStx),
        uintCV(intervalBlocks),
        stringUtf8CV(metadataUri),
      ],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        toast.success(`Plan created! TX: ${data.txId.slice(0, 10)}...`);
      },
      onCancel: () => {
        toast.error('Transaction cancelled');
      },
    };

    try {
      await openContractCall(options);
      return 'pending';
    } catch (error) {
      console.error('Create plan failed:', error);
      toast.error('Plan creation failed');
      return null;
    }
  }, [address]);

  return (
    <WalletContext.Provider
      value={{
        connected,
        address,
        balance,
        connecting,
        connect,
        disconnect,
        deposit,
        withdraw,
        authorizeMerchant,
        revokeAuthorization,
        subscribe,
        unsubscribe,
        createPlan,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
