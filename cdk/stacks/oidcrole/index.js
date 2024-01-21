"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("aws-cdk-lib");
const iam = require("aws-cdk-lib/aws-iam");
class OidcConnection extends cdk.Stack {
    constructor(construct, name, props) {
        super(construct, name);
        const oidcProvider = new iam.OpenIdConnectProvider(this, 'OIDCProvider', {
            url: props.oidcProviderUrl,
            clientIds: props.clientIds,
            thumbprints: props.thumbprints,
        });
        const iamRole = new iam.Role(this, 'OIDCRole', {
            assumedBy: new iam.WebIdentityPrincipal(oidcProvider.openIdConnectProviderArn),
            roleName: 'GitHubOIDCRole',
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')
            ],
            description: 'Role for GitHub OIDC to carry out cdk actions',
            maxSessionDuration: cdk.Duration.minutes(60)
        });
        const iamRepoDeployAccess = props.repositoryConfig.map((r) => { var _a; return `repo:${r.owner}/${r.repo}:${(_a = r.filter) !== null && _a !== void 0 ? _a : '*'}`; });
        // grant only requests coming from a specific GitHub repository.
        //attach this to the role
        iamRole.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sts:AssumeRoleWithWebIdentity'],
            resources: [iamRole.roleArn],
            conditions: {
                StringLike: {
                    [`${props.oidcProviderUrl}:sub`]: iamRepoDeployAccess,
                },
            },
        }));
    }
}
exports.default = OidcConnection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFtQztBQUVuQywyQ0FBMkM7QUFZM0MsTUFBTSxjQUFlLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFFdEMsWUFBWSxTQUFvQixFQUFFLElBQVksRUFBRSxLQUFvQjtRQUVoRSxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXZCLE1BQU0sWUFBWSxHQUFHLElBQUksR0FBRyxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDckUsR0FBRyxFQUFFLEtBQUssQ0FBQyxlQUFlO1lBQzFCLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUztZQUMxQixXQUFXLEVBQUUsS0FBSyxDQUFDLFdBQVc7U0FDakMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxPQUFPLEdBQWEsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUM7WUFDcEQsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFDLG9CQUFvQixDQUFDLFlBQVksQ0FBQyx3QkFBd0IsQ0FBQztZQUM5RSxRQUFRLEVBQUUsZ0JBQWdCO1lBQzFCLGVBQWUsRUFBRTtnQkFDYixHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLHFCQUFxQixDQUFDO2FBQ3BFO1lBQ0QsV0FBVyxFQUFFLCtDQUErQztZQUM1RCxrQkFBa0IsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7U0FDL0MsQ0FBQyxDQUFDO1FBRUgsTUFBTSxtQkFBbUIsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUNsRCxDQUFDLENBQUMsRUFBRSxFQUFFLFdBQUMsT0FBQSxRQUFRLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxNQUFBLENBQUMsQ0FBQyxNQUFNLG1DQUFJLEdBQUcsRUFBRSxDQUFBLEVBQUEsQ0FDdEQsQ0FBQztRQUVGLGdFQUFnRTtRQUNoRSx5QkFBeUI7UUFDdkIsT0FBTyxDQUFDLFdBQVcsQ0FDZixJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDeEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSztZQUN4QixPQUFPLEVBQUUsQ0FBQywrQkFBK0IsQ0FBQztZQUMxQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO1lBQzVCLFVBQVUsRUFBRTtnQkFDUixVQUFVLEVBQUU7b0JBQ1osQ0FBQyxHQUFHLEtBQUssQ0FBQyxlQUFlLE1BQU0sQ0FBQyxFQUFFLG1CQUFtQjtpQkFDcEQ7YUFDSjtTQUNBLENBQUMsQ0FDTCxDQUFDO0lBQ04sQ0FBQztDQUNKO0FBQ0Qsa0JBQWUsY0FBYyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgT0lEQ1JvbGVQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3Bze1xuICBvaWRjUHJvdmlkZXJVcmw6IHN0cmluZztcbiAgY2xpZW50SWRzOiBzdHJpbmdbXTtcbiAgdGh1bWJwcmludHM6IHN0cmluZ1tdO1xuICByZWFkb25seSByZXBvc2l0b3J5Q29uZmlnOiB7IG93bmVyOiBzdHJpbmc7IHJlcG86IHN0cmluZzsgZmlsdGVyPzogc3RyaW5nIH1bXTtcbn1cbiAgXG5cblxuY2xhc3MgT2lkY0Nvbm5lY3Rpb24gZXh0ZW5kcyBjZGsuU3RhY2sge1xuXG5jb25zdHJ1Y3Rvcihjb25zdHJ1Y3Q6IENvbnN0cnVjdCwgbmFtZTogc3RyaW5nLCBwcm9wczogT0lEQ1JvbGVQcm9wcykge1xuICAgIFxuICAgIHN1cGVyKGNvbnN0cnVjdCwgbmFtZSk7XG5cbiAgICBjb25zdCBvaWRjUHJvdmlkZXIgPSBuZXcgaWFtLk9wZW5JZENvbm5lY3RQcm92aWRlcih0aGlzLCAnT0lEQ1Byb3ZpZGVyJywge1xuICAgICAgICB1cmw6IHByb3BzLm9pZGNQcm92aWRlclVybCxcbiAgICAgICAgY2xpZW50SWRzOiBwcm9wcy5jbGllbnRJZHMsXG4gICAgICAgIHRodW1icHJpbnRzOiBwcm9wcy50aHVtYnByaW50cyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGlhbVJvbGU6IGlhbS5Sb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdPSURDUm9sZScse1xuICAgICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uV2ViSWRlbnRpdHlQcmluY2lwYWwob2lkY1Byb3ZpZGVyLm9wZW5JZENvbm5lY3RQcm92aWRlckFybiksXG4gICAgICAgIHJvbGVOYW1lOiAnR2l0SHViT0lEQ1JvbGUnLFxuICAgICAgICBtYW5hZ2VkUG9saWNpZXM6IFtcbiAgICAgICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQWRtaW5pc3RyYXRvckFjY2VzcycpXG4gICAgICAgIF0sXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUm9sZSBmb3IgR2l0SHViIE9JREMgdG8gY2Fycnkgb3V0IGNkayBhY3Rpb25zJyxcbiAgICAgICAgbWF4U2Vzc2lvbkR1cmF0aW9uOiBjZGsuRHVyYXRpb24ubWludXRlcyg2MClcbiAgICB9KTtcblxuICAgIGNvbnN0IGlhbVJlcG9EZXBsb3lBY2Nlc3MgPSBwcm9wcy5yZXBvc2l0b3J5Q29uZmlnLm1hcChcbiAgICAgICAgKHIpID0+IGByZXBvOiR7ci5vd25lcn0vJHtyLnJlcG99OiR7ci5maWx0ZXIgPz8gJyonfWBcbiAgICAgICk7XG4gICAgICBcbiAgICAgIC8vIGdyYW50IG9ubHkgcmVxdWVzdHMgY29taW5nIGZyb20gYSBzcGVjaWZpYyBHaXRIdWIgcmVwb3NpdG9yeS5cbiAgICAgIC8vYXR0YWNoIHRoaXMgdG8gdGhlIHJvbGVcbiAgICAgICAgaWFtUm9sZS5hZGRUb1BvbGljeShcbiAgICAgICAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgIGFjdGlvbnM6IFsnc3RzOkFzc3VtZVJvbGVXaXRoV2ViSWRlbnRpdHknXSxcbiAgICAgICAgICAgIHJlc291cmNlczogW2lhbVJvbGUucm9sZUFybl0sXG4gICAgICAgICAgICBjb25kaXRpb25zOiB7XG4gICAgICAgICAgICAgICAgU3RyaW5nTGlrZToge1xuICAgICAgICAgICAgICAgIFtgJHtwcm9wcy5vaWRjUHJvdmlkZXJVcmx9OnN1YmBdOiBpYW1SZXBvRGVwbG95QWNjZXNzLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBPaWRjQ29ubmVjdGlvbjtcbiJdfQ==