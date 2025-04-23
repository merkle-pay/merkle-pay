/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PublicKey,
  Transaction,
  VersionedTransaction,
  SendOptions,
  TransactionSignature,
} from "@solana/web3.js";

export interface PhantomSolanaProvider {
  isPhantom: boolean;
  publicKey: PublicKey | null;
  isConnected: boolean;
  connect(options?: {
    onlyIfTrusted?: boolean;
  }): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signAndSendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    options?: SendOptions
  ): Promise<{ signature: TransactionSignature }>;
  signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
  // Basic event emitter structure (you might need a library like 'eventemitter3' for full typing)
  on(event: string, listener: (...args: any[]) => void): this;
  off(event: string, listener: (...args: any[]) => void): this;
  // Add other methods/properties if known
  request: (params: { method: string; params?: any }) => Promise<any>;
}

export interface PhantomEthereumProvider {
  chainId: string;
  handleNotification: (...args: any[]) => void;
  initializeMetamaskExplainer: () => Promise<void>;
  isMetaMask: boolean;
  isMetamaskExplainerEnabled: boolean;
  isPhantom: boolean;
  networkVersion: string;
  removeAllListeners: (...args: any[]) => void;
  request: (...args: any[]) => Promise<void>;
  selectedAddress: string | null;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomSolanaProvider;
      ethereum?: PhantomEthereumProvider;
    };
  }
}

// Adding this empty export statement makes the file a module,
// which is sometimes necessary for global augmentations to be applied correctly.
export {};
