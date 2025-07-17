// TypeScript interfaces and types for database models

export enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSED = "PROCESSED",
  CONFIRMED = "CONFIRMED",
  FINALIZED = "FINALIZED",
  EXPIRED = "EXPIRED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED",
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
  payer_address?: string;
  referencePublicKey: string;
  mpid: string;
  raw: Record<string, unknown>;
  txId?: string;
}

export interface PhantomDeepLink {
  id: number;
  publicKey: string;
  privateKey: string;
  createdAt: Date;
  updatedAt: Date;
  mpid: string;
  orderId: string;
  requestId?: string;
  paymentId: number;
  expiresAt: Date;
  txId?: string;
  phantom_encryption_public_key?: string;
}

export interface Boss {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  is_email_verified: boolean;
  avatar_image_url?: string;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  backup_email?: string;
  first_name?: string;
  last_name?: string;
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
  scope?: string;
  is_valid: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Utility types for database operations
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
  where?: Record<string, unknown>;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export interface DatabaseHealth {
  connected: boolean;
  connectionCount: number;
  idleConnectionCount: number;
  waitingCount: number;
  lastError?: string;
}

export interface ConnectionInfo {
  host: string;
  port: number;
  database: string;
  user: string;
  ssl: boolean;
  poolSize: number;
}

// Error types for database operations
export class DatabaseError extends Error {
  constructor(
    message: string,
    public query?: string,
    public params?: unknown[]
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class MigrationError extends Error {
  constructor(
    message: string,
    public migrationId?: string
  ) {
    super(message);
    this.name = "MigrationError";
  }
}

export class ConnectionError extends Error {
  constructor(
    message: string,
    public connectionString?: string
  ) {
    super(message);
    this.name = "ConnectionError";
  }
}
