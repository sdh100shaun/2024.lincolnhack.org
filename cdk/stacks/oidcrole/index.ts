import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';


export interface OIDCRoleProps extends cdk.StackProps{
  oidcProviderUrl: string;
  clientIds: string[];
  thumbprints: string[];
  readonly repositoryConfig: { owner: string; repo: string; filter?: string }[];
}
  


class OidcConnection extends cdk.Stack {

constructor(construct: Construct, name: string, props: OIDCRoleProps) {
    
    super(construct, name);

    const oidcProvider = new iam.OpenIdConnectProvider(this, 'OIDCProvider', {
        url: props.oidcProviderUrl,
        clientIds: props.clientIds,
        thumbprints: props.thumbprints,
    });

    const iamRole: iam.Role = new iam.Role(this, 'OIDCRole',{
        assumedBy: new iam.WebIdentityPrincipal(oidcProvider.openIdConnectProviderArn),
        roleName: 'GitHubOIDCRole',
        managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')
        ],
        description: 'Role for GitHub OIDC to carry out cdk actions',
        maxSessionDuration: cdk.Duration.minutes(60)
    });

    const iamRepoDeployAccess = props.repositoryConfig.map(
        (r) => `repo:${r.owner}/${r.repo}:${r.filter ?? '*'}`
      );
      
      // grant only requests coming from a specific GitHub repository.
      //attach this to the role
        iamRole.addToPolicy(
            new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sts:AssumeRoleWithWebIdentity'],
            resources: [iamRole.roleArn],
            conditions: {
                StringLike: {
                [`${props.oidcProviderUrl}:sub`]: iamRepoDeployAccess,
                },
            },
            })
        );
    }
}
export default OidcConnection;
