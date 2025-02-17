import { createAuthenticatedApiFunction } from '@/libs';

export const getVipConfigs = createAuthenticatedApiFunction(__dirname, 'getVipConfigs', 'get', '/v1/configs');

export const updateVipConfig = createAuthenticatedApiFunction(
  __dirname,
  'updateVipConfig',
  'put',
  '/v1/configs/{code}'
);

export const createVipConfig = createAuthenticatedApiFunction(__dirname, 'createVipConfig', 'post', '/v1/configs');
