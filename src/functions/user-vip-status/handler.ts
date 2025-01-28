// import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';
// import type { CustomAPIGatewayEvent as ApiFunc } from '@/libs/api-gateway';
// import { formatApiResponse, middyfy } from '@/libs';
// import { determineAllUsersVipStatus } from '@/services/vip-status/vip-status-util-service';

// const determineUserVipStatusFunc: ApiFunc<null> = async (): Promise<ApiFuncRes> => {
//   const res = await determineAllUsersVipStatus();

//   return formatApiResponse(res);
// };

// export const determineUserVipStatus = middyfy(determineUserVipStatusFunc);
