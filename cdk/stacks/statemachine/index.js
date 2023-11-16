"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateMachineStack = void 0;
const cdk = require("aws-cdk-lib");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const acm = require("aws-cdk-lib/aws-certificatemanager");
const route53 = require("aws-cdk-lib/aws-route53");
const route53targets = require("aws-cdk-lib/aws-route53-targets");
const stepfunctions = require("aws-cdk-lib/aws-stepfunctions");
class StateMachineStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const domainName = (props === null || props === void 0 ? void 0 : props.domainName) || '2024.lincolnhack.org';
        const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: domainName });
        const certificate = new acm.Certificate(this, 'Certificate', {
            domainName: 'api.' + domainName,
            validation: acm.CertificateValidation.fromDns(zone),
        });
        const gateway = new apigateway.RestApi(this, 'gateway', {
            restApiName: 'contact form state machine gateway',
            description: 'This service serves state machine requests.',
            domainName: {
                domainName: 'api.' + domainName,
                certificate: certificate,
            }
        });
        const stateMachine = new stepfunctions.StateMachine(this, 'StateMachine', {
            stateMachineName: 'ContactFormStateMachine',
            stateMachineType: stepfunctions.StateMachineType.EXPRESS,
            definitionBody: stepfunctions.DefinitionBody.fromChainable(new stepfunctions.Pass(this, 'StartState', {
                result: stepfunctions.Result.fromObject({
                    statusCode: 200,
                    body: 'Hello from API Gateway!',
                }),
            })),
        });
        const contact = gateway.root.addResource('contact');
        contact.addMethod('POST', apigateway.StepFunctionsIntegration.startExecution(stateMachine));
        contact.addCorsPreflight({
            allowOrigins: [domainName, 'api.' + domainName],
            allowMethods: apigateway.Cors.ALL_METHODS,
        });
        new route53.ARecord(this, 'AliasRecord', {
            zone: zone,
            recordName: 'api.' + domainName,
            target: route53.RecordTarget.fromAlias(new route53targets.ApiGateway(gateway)),
        });
    }
}
exports.StateMachineStack = StateMachineStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMseURBQXlEO0FBQ3pELDBEQUEwRDtBQUMxRCxtREFBbUQ7QUFDbkQsa0VBQWtFO0FBRWxFLCtEQUErRDtBQU8vRCxNQUFhLGlCQUFrQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzVDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBeUI7UUFDL0QsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEIsTUFBTSxVQUFVLEdBQUcsQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsVUFBVSxLQUFJLHNCQUFzQixDQUFBO1FBQzlELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUVyRixNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUN6RCxVQUFVLEVBQUUsTUFBTSxHQUFHLFVBQVU7WUFDL0IsVUFBVSxFQUFFLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1NBQ3RELENBQUMsQ0FBQztRQUVILE1BQU0sT0FBTyxHQUF1QixJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtZQUN4RSxXQUFXLEVBQUUsb0NBQW9DO1lBQ2pELFdBQVcsRUFBRSw2Q0FBNkM7WUFDMUQsVUFBVSxFQUFFO2dCQUNSLFVBQVUsRUFBRSxNQUFNLEdBQUcsVUFBVTtnQkFDL0IsV0FBVyxFQUFFLFdBQVc7YUFDM0I7U0FHSixDQUFDLENBQUM7UUFDSCxNQUFNLFlBQVksR0FBK0IsSUFBSSxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDbEcsZ0JBQWdCLEVBQUUseUJBQXlCO1lBQzNDLGdCQUFnQixFQUFFLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPO1lBQ3hELGNBQWMsRUFBRSxhQUFhLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtnQkFDbEcsTUFBTSxFQUFFLGFBQWEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO29CQUNwQyxVQUFVLEVBQUUsR0FBRztvQkFDZixJQUFJLEVBQUUseUJBQXlCO2lCQUNsQyxDQUFDO2FBQ0wsQ0FBQyxDQUFDO1NBQ04sQ0FBQyxDQUFDO1FBRUgsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLHdCQUF3QixDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQzVGLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztZQUNyQixZQUFZLEVBQUUsQ0FBQyxVQUFVLEVBQUUsTUFBTSxHQUFHLFVBQVUsQ0FBQztZQUMvQyxZQUFZLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXO1NBQzVDLENBQUMsQ0FBQztRQUVILElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ3JDLElBQUksRUFBRSxJQUFJO1lBQ1YsVUFBVSxFQUFFLE1BQU0sR0FBRyxVQUFVO1lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDakYsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBN0NELDhDQTZDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCAqIGFzIGFjbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2VydGlmaWNhdGVtYW5hZ2VyJztcbmltcG9ydCAqIGFzIHJvdXRlNTMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXJvdXRlNTMnO1xuaW1wb3J0ICogYXMgcm91dGU1M3RhcmdldHMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXJvdXRlNTMtdGFyZ2V0cyc7IFxuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBzdGVwZnVuY3Rpb25zIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zdGVwZnVuY3Rpb25zJztcblxuZXhwb3J0IGludGVyZmFjZSBTdGF0ZU1hY2hpbmVQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3Bze1xuICAgIGRvbWFpbk5hbWU6IHN0cmluZztcbiAgfVxuXG5cbmV4cG9ydCBjbGFzcyBTdGF0ZU1hY2hpbmVTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBTdGF0ZU1hY2hpbmVQcm9wcykge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcbiAgICAgICAgY29uc3QgZG9tYWluTmFtZSA9IHByb3BzPy5kb21haW5OYW1lIHx8ICcyMDI0LmxpbmNvbG5oYWNrLm9yZydcbiAgICAgICAgY29uc3Qgem9uZSA9IHJvdXRlNTMuSG9zdGVkWm9uZS5mcm9tTG9va3VwKHRoaXMsICdab25lJywgeyBkb21haW5OYW1lOiBkb21haW5OYW1lIH0pO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgY2VydGlmaWNhdGUgPSBuZXcgYWNtLkNlcnRpZmljYXRlKHRoaXMsICdDZXJ0aWZpY2F0ZScsIHtcbiAgICAgICAgICAgIGRvbWFpbk5hbWU6ICdhcGkuJyArIGRvbWFpbk5hbWUsXG4gICAgICAgICAgICB2YWxpZGF0aW9uOiBhY20uQ2VydGlmaWNhdGVWYWxpZGF0aW9uLmZyb21EbnMoem9uZSksXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgZ2F0ZXdheTogYXBpZ2F0ZXdheS5SZXN0QXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnZ2F0ZXdheScsIHtcbiAgICAgICAgICAgIHJlc3RBcGlOYW1lOiAnY29udGFjdCBmb3JtIHN0YXRlIG1hY2hpbmUgZ2F0ZXdheScsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RoaXMgc2VydmljZSBzZXJ2ZXMgc3RhdGUgbWFjaGluZSByZXF1ZXN0cy4nLFxuICAgICAgICAgICAgZG9tYWluTmFtZToge1xuICAgICAgICAgICAgICAgIGRvbWFpbk5hbWU6ICdhcGkuJyArIGRvbWFpbk5hbWUsXG4gICAgICAgICAgICAgICAgY2VydGlmaWNhdGU6IGNlcnRpZmljYXRlLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG5cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHN0YXRlTWFjaGluZTogc3RlcGZ1bmN0aW9ucy5TdGF0ZU1hY2hpbmUgPSBuZXcgc3RlcGZ1bmN0aW9ucy5TdGF0ZU1hY2hpbmUodGhpcywgJ1N0YXRlTWFjaGluZScsIHtcbiAgICAgICAgICAgIHN0YXRlTWFjaGluZU5hbWU6ICdDb250YWN0Rm9ybVN0YXRlTWFjaGluZScsXG4gICAgICAgICAgICBzdGF0ZU1hY2hpbmVUeXBlOiBzdGVwZnVuY3Rpb25zLlN0YXRlTWFjaGluZVR5cGUuRVhQUkVTUyxcbiAgICAgICAgICAgIGRlZmluaXRpb25Cb2R5OiBzdGVwZnVuY3Rpb25zLkRlZmluaXRpb25Cb2R5LmZyb21DaGFpbmFibGUobmV3IHN0ZXBmdW5jdGlvbnMuUGFzcyh0aGlzLCAnU3RhcnRTdGF0ZScsIHtcbiAgICAgICAgICAgICAgICByZXN1bHQ6IHN0ZXBmdW5jdGlvbnMuUmVzdWx0LmZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6ICdIZWxsbyBmcm9tIEFQSSBHYXRld2F5IScsXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB9KSksXG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICBjb25zdCBjb250YWN0ID0gZ2F0ZXdheS5yb290LmFkZFJlc291cmNlKCdjb250YWN0Jyk7XG4gICAgICAgIGNvbnRhY3QuYWRkTWV0aG9kKCdQT1NUJywgYXBpZ2F0ZXdheS5TdGVwRnVuY3Rpb25zSW50ZWdyYXRpb24uc3RhcnRFeGVjdXRpb24oc3RhdGVNYWNoaW5lKSk7XG4gICAgICAgIGNvbnRhY3QuYWRkQ29yc1ByZWZsaWdodCh7XG4gICAgICAgICAgICBhbGxvd09yaWdpbnM6IFtkb21haW5OYW1lLCAnYXBpLicgKyBkb21haW5OYW1lXSxcbiAgICAgICAgICAgIGFsbG93TWV0aG9kczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9NRVRIT0RTLFxuICAgICAgICB9KTtcblxuICAgICAgICBuZXcgcm91dGU1My5BUmVjb3JkKHRoaXMsICdBbGlhc1JlY29yZCcsIHtcbiAgICAgICAgICAgIHpvbmU6IHpvbmUsXG4gICAgICAgICAgICByZWNvcmROYW1lOiAnYXBpLicgKyBkb21haW5OYW1lLFxuICAgICAgICAgICAgdGFyZ2V0OiByb3V0ZTUzLlJlY29yZFRhcmdldC5mcm9tQWxpYXMobmV3IHJvdXRlNTN0YXJnZXRzLkFwaUdhdGV3YXkoZ2F0ZXdheSkpLFxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=