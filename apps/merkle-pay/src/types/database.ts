// Database types (replacing Prisma generated types)

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  CONFIRMED = 'CONFIRMED',
  FINALIZED = 'FINALIZED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export interface Payment {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  amount: number;
  token: string;
  blockchain: string;
  orderId: string;
  status: PaymentStatus;
  business_name: string;
  recipient_address: string;
  payer_address: string | null;
  referencePublicKey: string;
  mpid: string;
  raw: unknown; // JSON type
  txId: string | null;
}

export interface Boss {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  is_email_verified: boolean;
  avatar_image_url: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  backup_email: string | null;
  first_name: string | null;
  last_name: string | null;
}

export interface Business {
  id: number;
  business_name: string;
  blockchain: string;
  wallets: string[];
  tokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Token {
  id: number;
  token: string;
  boss_id: number;
  boss_email: string;
  is_access_token: boolean;
  is_refresh_token: boolean;
  scope: string | null;
  is_valid: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhantomDeepLink {
  id: number;
  publicKey: string;
  privateKey: string;
  createdAt: Date;
  updatedAt: Date;
  mpid: string;
  orderId: string;
  requestId: string | null;
  paymentId: number;
  expiresAt: Date;
  txId: string | null;
  phantom_encryption_public_key: string | null;
}

// Type aliases for backward compatibility
export type PaymentTableRecord = Payment;
