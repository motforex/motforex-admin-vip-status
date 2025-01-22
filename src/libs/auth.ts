import type { APIGatewayProxyEvent } from 'aws-lambda';
import type { CognitoIdToken, QueryParams, RequestMetadata } from '@/types';

import * as jwt from 'jsonwebtoken';
import { logger } from '@/libs';
import { CustomError } from '@/error';

interface ExtendedAPIGatewayProxyEvent extends Omit<APIGatewayProxyEvent, 'body'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
}

const extractMetadata = (event: ExtendedAPIGatewayProxyEvent): RequestMetadata => {
  try {
    const ipAddress = event.requestContext.identity.sourceIp;
    const token = event.headers.Authorization?.replace('Bearer ', '');
    const queryParams = event.queryStringParameters as QueryParams;
    const headers = event.headers;
    const body = event.body;
    return { ipAddress, token, headers, queryParams, body };
  } catch (error) {
    logger.error('Err', error);
    throw new Error('Unable to process request!');
  }
};

export const extractJWTData = (token: string): object => {
  try {
    const decoded = jwt.decode(token, { complete: true });
    // If the token is valid, return the payload
    if (decoded) return decoded.payload as object;

    throw new CustomError('Invalid token', 400);
  } catch (error: unknown) {
    logger.error('Error on extractJWTData():', error);
    throw new CustomError('Failed to process TOKEN!', 400);
  }
};

export const extractCognitoToken = (cognitoToken: string): CognitoIdToken => {
  const res = extractJWTData(cognitoToken);
  return res as CognitoIdToken;
};

export type AuthorizationData = {
  sub: string;
  email: string;
  ipAddress: string;
};

export function checkAuthorization(metadata: RequestMetadata, funcName = 'Function'): AuthorizationData {
  // Validating metadata
  const { ipAddress, token } = metadata;
  if (!token || !ipAddress)
    throw new CustomError('Unable to process InternalTransfer: Missing token or IP address', 400);

  // Validating user data
  const { email, sub } = extractCognitoToken(token);
  if (!email || !sub) throw new CustomError('User credentials are missing!', 400);

  logger.info(`${funcName.toUpperCase()} email:${email} IP:${ipAddress}`);
  return { email, sub, ipAddress };
}

export { extractMetadata };
