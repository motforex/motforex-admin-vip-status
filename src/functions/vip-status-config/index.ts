import { createDefaultApiFunction } from '@/libs';

export const getVipConfigs = createDefaultApiFunction(__dirname, 'getVipConfigs', 'get', '/v1/configs');

export const updateVipConfig = createDefaultApiFunction(__dirname, 'updateVipConfig', 'put', '/v1/configs/{code}');

export const createVipConfig = createDefaultApiFunction(__dirname, 'createVipConfig', 'post', '/v1/configs');
