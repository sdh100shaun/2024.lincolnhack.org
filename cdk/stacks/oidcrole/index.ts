import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { GithubActionsIdentityProvider, GithubActionsRole } from "aws-cdk-github-oidc";
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

    const provider = new GithubActionsIdentityProvider(this, "GithubProvider");
   
    
    
    const deployRole = new GithubActionsRole(this, "DeployRole", {
        provider: provider,
        owner: props.repositoryConfig[0].owner,
        repo: props.repositoryConfig[0].repo,
        filter: props.repositoryConfig[0].filter,
        roleName: "LincolnHack2024DeployRole",
        thumbprints: props.repositoryConfig[0].thumbprints, 
        description: "This role deploys stuff to AWS",
        maxSessionDuration: cdk.Duration.hours(2),
    });

    deployRole.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess")
    );
        }   
    
    }
export default OidcConnection;
