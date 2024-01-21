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
            maxSessionDuration: cdk.Duration.minutes(20)
        });
    }
}
exports.default = OidcConnection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFtQztBQUVuQywyQ0FBMkM7QUFTM0MsTUFBTSxjQUFlLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFFdEMsWUFBWSxTQUFvQixFQUFFLElBQVksRUFBRSxLQUFvQjtRQUVoRSxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXZCLE1BQU0sWUFBWSxHQUFHLElBQUksR0FBRyxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDckUsR0FBRyxFQUFFLEtBQUssQ0FBQyxlQUFlO1lBQzFCLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUztZQUMxQixXQUFXLEVBQUUsS0FBSyxDQUFDLFdBQVc7U0FDakMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxPQUFPLEdBQWEsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUM7WUFDcEQsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFDLG9CQUFvQixDQUFDLFlBQVksQ0FBQyx3QkFBd0IsQ0FBQztZQUM5RSxRQUFRLEVBQUUsZ0JBQWdCO1lBQzFCLGVBQWUsRUFBRTtnQkFDYixHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLHFCQUFxQixDQUFDO2FBQ3BFO1lBQ0QsV0FBVyxFQUFFLCtDQUErQztZQUM1RCxrQkFBa0IsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7U0FDL0MsQ0FBQyxDQUFDO0lBRUgsQ0FBQztDQUNKO0FBQ0Qsa0JBQWUsY0FBYyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgT0lEQ1JvbGVQcm9wcyB7XG4gIG9pZGNQcm92aWRlclVybDogc3RyaW5nO1xuICBjbGllbnRJZHM6IHN0cmluZ1tdO1xuICB0aHVtYnByaW50czogc3RyaW5nW107XG59XG5cbmNsYXNzIE9pZGNDb25uZWN0aW9uIGV4dGVuZHMgY2RrLlN0YWNrIHtcblxuY29uc3RydWN0b3IoY29uc3RydWN0OiBDb25zdHJ1Y3QsIG5hbWU6IHN0cmluZywgcHJvcHM6IE9JRENSb2xlUHJvcHMpIHtcbiAgICBcbiAgICBzdXBlcihjb25zdHJ1Y3QsIG5hbWUpO1xuXG4gICAgY29uc3Qgb2lkY1Byb3ZpZGVyID0gbmV3IGlhbS5PcGVuSWRDb25uZWN0UHJvdmlkZXIodGhpcywgJ09JRENQcm92aWRlcicsIHtcbiAgICAgICAgdXJsOiBwcm9wcy5vaWRjUHJvdmlkZXJVcmwsXG4gICAgICAgIGNsaWVudElkczogcHJvcHMuY2xpZW50SWRzLFxuICAgICAgICB0aHVtYnByaW50czogcHJvcHMudGh1bWJwcmludHMsXG4gICAgfSk7XG5cbiAgICBjb25zdCBpYW1Sb2xlOiBpYW0uUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnT0lEQ1JvbGUnLHtcbiAgICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLldlYklkZW50aXR5UHJpbmNpcGFsKG9pZGNQcm92aWRlci5vcGVuSWRDb25uZWN0UHJvdmlkZXJBcm4pLFxuICAgICAgICByb2xlTmFtZTogJ0dpdEh1Yk9JRENSb2xlJyxcbiAgICAgICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FkbWluaXN0cmF0b3JBY2Nlc3MnKVxuICAgICAgICBdLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JvbGUgZm9yIEdpdEh1YiBPSURDIHRvIGNhcnJ5IG91dCBjZGsgYWN0aW9ucycsXG4gICAgICAgIG1heFNlc3Npb25EdXJhdGlvbjogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoMjApXG4gICAgfSk7XG5cbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBPaWRjQ29ubmVjdGlvbjsiXX0=