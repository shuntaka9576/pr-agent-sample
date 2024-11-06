import { Stack, aws_iam } from 'aws-cdk-lib';
import type { Construct } from 'constructs';

const gitHubOwner = 'shuntaka9576';
const gitHubRepo = 'pr-agent-sample';

export class GitHubActionOIDCStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const accountId = Stack.of(this).account;

    new aws_iam.OpenIdConnectProvider(this, 'GitHubIdProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });

    new aws_iam.Role(this, 'GitHubActionsOidcRole', {
      roleName: 'github-action-assume-role',
      assumedBy: new aws_iam.FederatedPrincipal(
        `arn:aws:iam::${accountId}:oidc-provider/token.actions.githubusercontent.com`,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
          StringLike: {
            'token.actions.githubusercontent.com:sub': `repo:${gitHubOwner}/${gitHubRepo}:*`,
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      managedPolicies: [
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          'AWSCloudFormationFullAccess'
        ),
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName('IAMFullAccess'),
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
      ],
      inlinePolicies: {
        ssm: new aws_iam.PolicyDocument({
          statements: [
            new aws_iam.PolicyStatement({
              effect: aws_iam.Effect.ALLOW,
              actions: [
                'ssm:GetParameters',
                'ssm:GetParameter',
                'ssm:PutParameter',
              ],
              resources: ['*'],
            }),
          ],
        }),
        bedrock: new aws_iam.PolicyDocument({
          statements: [
            new aws_iam.PolicyStatement({
              effect: aws_iam.Effect.ALLOW,
              actions: [
                'bedrock:InvokeModel',
                'bedrock:InvokeModelWithResponseStream',
              ],
              resources: ['arn:aws:bedrock:*::foundation-model/anthropic.*'],
            }),
          ],
        }),
      },
    });
  }
}
