// import { determineUserVipStatus } from '@/functions/user-vip-status';
import { getVipConfigs, updateVipConfig, createVipConfig } from '@/functions/vip-status-config';

import type { AWS } from '@serverless/typescript';

const serverlessConfig: AWS = {
  service: 'motforex-admin-vip-status',
  frameworkVersion: '4',
  app: 'motforex-admin-vip-status-app',
  plugins: ['serverless-offline', 'serverless-prune-plugin'],
  provider: {
    name: 'aws',
    stage: "${opt:stage, 'prod'}",
    runtime: 'nodejs18.x',
    region: 'ap-southeast-1',
    profile: 'default',
    logRetentionInDays: 365,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
      usagePlan: {
        throttle: {
          burstLimit: 150, // Maximum number of requests per second
          rateLimit: 100, // Average number of requests per second
        },
      },
    },
    iam: {
      role: 'arn:aws:iam::786487424160:role/vip-status-role',
    },
    environment: {
      COGNITO_USER_POOL_ID: 'ap-southeast-1_iSsIgz0kc',
    },
  },

  functions: {
    // determineUserVipStatus,
    getVipConfigs,
    updateVipConfig,
    createVipConfig,
  },
  package: { individually: true },

  resources: {
    Resources: {
      CognitoAuthorizer: {
        Type: 'AWS::ApiGateway::Authorizer',
        Properties: {
          RestApiId: { Ref: 'ApiGatewayRestApi' },
          Type: 'COGNITO_USER_POOLS',
          IdentitySource: 'method.request.header.Authorization',
          AuthorizerResultTtlInSeconds: 300,
          Name: 'CognitoAuthorizer',
          ProviderARNs: [
            'arn:aws:cognito-idp:${self:provider.region}:786487424160:userpool/${self:provider.environment.COGNITO_USER_POOL_ID}',
          ],
        },
      },
      GatewayResponseDefault4XX: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
          },
          ResponseType: 'DEFAULT_4XX',
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
        },
      },
    },
  },
  custom: {
    prune: {
      automatic: true,
      number: 2,
    },
    function_timeout: {
      ain: 29,
    },
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk', 'pg-hstore'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfig;
