import { z } from 'zod';

export const LbdFuncResponseSchema = z.object({
  statusCode: z.number(),
  body: z.any(),
});

export type LbdFuncResponse = z.infer<typeof LbdFuncResponseSchema>;

export type GenericFuncResponse<T> = {
  statusCode: number;
  body: T;
};

export type QueryParams = {
  [key: string]: string;
};

export const QueryParamsSchema = z.record(z.string());

export type RequestMetadata = {
  token?: string;
  ipAddress?: string;
  headers: object;
  queryParams?: QueryParams | undefined;
  body?: object | string | number | null;
};

export const RequestMetadataSchema = z.object({
  token: z.string().optional(),
  ipAddress: z.string().optional(),
  headers: z.object({}).passthrough(), // Allows any object
  queryParams: QueryParamsSchema.optional(),
  body: z.union([z.object({}).passthrough(), z.string(), z.number(), z.null()]).optional(),
});

export type CognitoIdToken = {
  sub: string;
  email_verified: boolean;
  iss: string;
  'cognito:username': string;
  origin_jti: string;
  aud: string;
  event_id: string;
  token_use: string;
  auth_time: number;
  exp: number;
  iat: number;
  jti: string;
  email: string;
};

export const CognitoIdTokenSchema = z.object({
  sub: z.string(),
  email_verified: z.boolean(),
  iss: z.string(),
  'cognito:username': z.string(),
  origin_jti: z.string(),
  aud: z.string(),
  event_id: z.string(),
  token_use: z.string(),
  auth_time: z.number(),
  exp: z.number(),
  iat: z.number(),
  jti: z.string(),
  email: z.string(),
});

export const OptionsSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export type Options = z.infer<typeof OptionsSchema>;

export const PaginationSchema = z.object({
  page: z.string(),
  lastKey: z.string().optional(),
  filterBy: z.string(),
  filterVal: z.string().optional(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const DailySummarySchema = z.object({
  login: z.number(),
  timestamp: z.number(),
  commission: z.string().default('0'),
  date: z.string(),
  email: z.string(),
  endDate: z.string(),
  group: z.string(),
  lot: z.number(),
  profit: z.string().default('0'),
  startDate: z.string(),
  swap: z.string().default('0'),
  totalDeposit: z.number().default(0),
  totalWithdraw: z.number().default(0),
  type: z.number(),
});

export type DailySummary = z.infer<typeof DailySummarySchema>;
