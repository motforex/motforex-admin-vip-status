import { createDefaultApiFunction } from '@/libs';

export const getVipConfigs = createDefaultApiFunction(__dirname, 'getVipConfigs', 'get', '/v1/vip-configs');

export const updateVipConfig = createDefaultApiFunction(__dirname, 'updateVipConfig', 'put', '/v1/vip-configs/{code}');

export const createVipConfig = createDefaultApiFunction(__dirname, 'createVipConfig', 'post', '/v1/vip-configs');
