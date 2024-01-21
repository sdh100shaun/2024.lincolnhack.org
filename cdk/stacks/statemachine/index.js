"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateMachineStack = void 0;
const cdk = require("aws-cdk-lib");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const acm = require("aws-cdk-lib/aws-certificatemanager");
const route53 = require("aws-cdk-lib/aws-route53");
const constructs_1 = require("constructs");
const stepfunctions = require("aws-cdk-lib/aws-stepfunctions");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const route53_targets = require("aws-cdk-lib/aws-route53-targets");
const stepfunctions_tasks = require("aws-cdk-lib/aws-stepfunctions-tasks");
class StateMachineStack extends constructs_1.Construct {
    constructor(parent, id, props) {
        super(parent, id);
        const domainName = (props === null || props === void 0 ? void 0 : props.domainName) || '2024.lincolnhack.org';
        const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: domainName });
        const certificate = new acm.Certificate(this, 'Certificate', {
            domainName: 'api.' + domainName,
            validation: acm.CertificateValidation.fromDns(zone),
        });
        const gateway = new apigateway.RestApi(this, 'gateway', {
            restApiName: 'contact form state machine gateway',
            description: 'This service serves state machine requests.',
            retainDeployments: true,
            domainName: {
                domainName: 'api.' + domainName,
                certificate: certificate,
            },
        });
        const db = new dynamodb.Table(this, 'LincolnHackMailingList', {
            partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
            tableName: 'LincolnHackMailingList',
            removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
        });
        // add a task to the current state machine to put data in dynamodb
        const putItem = new stepfunctions_tasks.DynamoPutItem(this, 'PutItem', {
            table: db,
            item: {
                email: stepfunctions_tasks.DynamoAttributeValue.fromString(stepfunctions.JsonPath.stringAt('$.body.email.email')),
            },
            resultPath: '$.PutItemResult',
        });
        const stateMachine = new stepfunctions.StateMachine(this, 'StateMachine', {
            stateMachineName: 'ContactFormStateMachine',
            stateMachineType: stepfunctions.StateMachineType.EXPRESS,
            definitionBody: stepfunctions.DefinitionBody.fromChainable(new stepfunctions.Pass(this, 'StartState', {
                result: stepfunctions.Result.fromObject({
                    statusCode: 200,
                    // return input from task in body   
                    body: {
                        "message": "Thanks for signing up to the LincolnHack mailing list",
                        "email": { "email": stepfunctions.TaskInput.fromJsonPathAt('$.input.email') },
                    },
                }),
            }).next(putItem)),
        });
        const contact = gateway.root.addResource('contact');
        contact.addMethod('POST', apigateway.StepFunctionsIntegration.startExecution(stateMachine, {
            integrationResponses: [
                {
                    statusCode: '200',
                    responseTemplates: {
                        'application/json': '{"status": "ok"}',
                    },
                },
            ],
            requestTemplates: {
                'application/json': '{"input": "$util.escapeJavaScript($input.json(\'$\'))","stateMachineArn": "' + stateMachine.stateMachineArn + '"}',
            },
        }));
        new route53.ARecord(this, 'ApiGatewayDomainNameRecord', {
            zone: zone,
            recordName: 'api',
            target: route53.RecordTarget.fromAlias(new route53_targets.ApiGateway(gateway)),
        });
    }
}
exports.StateMachineStack = StateMachineStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMseURBQXlEO0FBQ3pELDBEQUEwRDtBQUMxRCxtREFBbUQ7QUFDbkQsMkNBQXVDO0FBQ3ZDLCtEQUErRDtBQUMvRCxxREFBcUQ7QUFDckQsbUVBQW1FO0FBQ25FLDJFQUEyRTtBQVEzRSxNQUFhLGlCQUFrQixTQUFRLHNCQUFTO0lBQzVDLFlBQVksTUFBYSxFQUFFLEVBQVUsRUFBRSxLQUF5QjtRQUM1RCxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2xCLE1BQU0sVUFBVSxHQUFHLENBQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLFVBQVUsS0FBSSxzQkFBc0IsQ0FBQTtRQUM5RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFJckYsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDekQsVUFBVSxFQUFFLE1BQU0sR0FBRyxVQUFVO1lBQy9CLFVBQVUsRUFBRSxHQUFHLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztTQUN0RCxDQUFDLENBQUM7UUFFSCxNQUFNLE9BQU8sR0FBdUIsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDeEUsV0FBVyxFQUFFLG9DQUFvQztZQUNqRCxXQUFXLEVBQUUsNkNBQTZDO1lBQzFELGlCQUFpQixFQUFFLElBQUk7WUFDdkIsVUFBVSxFQUFFO2dCQUNSLFVBQVUsRUFBRSxNQUFNLEdBQUcsVUFBVTtnQkFDL0IsV0FBVyxFQUFFLFdBQVc7YUFFM0I7U0FJSixDQUFDLENBQUM7UUFHSCxNQUFNLEVBQUUsR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFO1lBQzFELFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ3BFLFNBQVMsRUFBRSx3QkFBd0I7WUFDbkMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsMEJBQTBCO1NBQzlELENBQUMsQ0FBQztRQUdILGtFQUFrRTtRQUNsRSxNQUFNLE9BQU8sR0FBRyxJQUFJLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQ25FLEtBQUssRUFBRSxFQUFFO1lBQ1QsSUFBSSxFQUFFO2dCQUNGLEtBQUssRUFBRSxtQkFBbUIsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQzthQUNwSDtZQUNELFVBQVUsRUFBRSxpQkFBaUI7U0FDaEMsQ0FBQyxDQUFDO1FBR0gsTUFBTSxZQUFZLEdBQStCLElBQUksYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ2xHLGdCQUFnQixFQUFFLHlCQUF5QjtZQUMzQyxnQkFBZ0IsRUFBRSxhQUFhLENBQUMsZ0JBQWdCLENBQUMsT0FBTztZQUN4RCxjQUFjLEVBQUUsYUFBYSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7Z0JBQ2xHLE1BQU0sRUFBRSxhQUFhLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztvQkFDcEMsVUFBVSxFQUFFLEdBQUc7b0JBQ2Ysb0NBQW9DO29CQUNwQyxJQUFJLEVBQUk7d0JBQ0osU0FBUyxFQUFFLHVEQUF1RDt3QkFDbEUsT0FBTyxFQUFFLEVBQUMsT0FBTyxFQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxFQUFFO3FCQUM5RTtpQkFDSixDQUFDO2FBR0wsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNwQixDQUFDLENBQUM7UUFHSCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwRCxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsd0JBQXdCLENBQUMsY0FBYyxDQUFDLFlBQVksRUFDbkY7WUFDRSxvQkFBb0IsRUFBRTtnQkFDbEI7b0JBQ0ksVUFBVSxFQUFFLEtBQUs7b0JBQ2pCLGlCQUFpQixFQUFFO3dCQUNmLGtCQUFrQixFQUFFLGtCQUFrQjtxQkFDekM7aUJBQ0o7YUFDSjtZQUNELGdCQUFnQixFQUFFO2dCQUNkLGtCQUFrQixFQUFFLDZFQUE2RSxHQUFHLFlBQVksQ0FBQyxlQUFlLEdBQUcsSUFBSTthQUMxSTtTQUNKLENBQ0osQ0FBQyxDQUFDO1FBRUgsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSw0QkFBNEIsRUFBRTtZQUNwRCxJQUFJLEVBQUUsSUFBSTtZQUNWLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLE1BQU0sRUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDbEYsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBdEZELDhDQXNGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCAqIGFzIGFjbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2VydGlmaWNhdGVtYW5hZ2VyJztcbmltcG9ydCAqIGFzIHJvdXRlNTMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXJvdXRlNTMnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBzdGVwZnVuY3Rpb25zIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zdGVwZnVuY3Rpb25zJztcbmltcG9ydCAqIGFzIGR5bmFtb2RiIGZyb20gJ2F3cy1jZGstbGliL2F3cy1keW5hbW9kYic7XG5pbXBvcnQgKiBhcyByb3V0ZTUzX3RhcmdldHMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXJvdXRlNTMtdGFyZ2V0cyc7XG5pbXBvcnQgKiBhcyBzdGVwZnVuY3Rpb25zX3Rhc2tzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zdGVwZnVuY3Rpb25zLXRhc2tzJztcbmltcG9ydCB7IFN0YWNrIH0gZnJvbSAnYXdzLWNkay1saWInO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN0YXRlTWFjaGluZVByb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHN7XG4gICAgZG9tYWluTmFtZTogc3RyaW5nO1xuICB9XG5cblxuZXhwb3J0IGNsYXNzIFN0YXRlTWFjaGluZVN0YWNrIGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQ6IFN0YWNrLCBpZDogc3RyaW5nLCBwcm9wcz86IFN0YXRlTWFjaGluZVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHBhcmVudCwgaWQpO1xuICAgICAgICBjb25zdCBkb21haW5OYW1lID0gcHJvcHM/LmRvbWFpbk5hbWUgfHwgJzIwMjQubGluY29sbmhhY2sub3JnJ1xuICAgICAgICBjb25zdCB6b25lID0gcm91dGU1My5Ib3N0ZWRab25lLmZyb21Mb29rdXAodGhpcywgJ1pvbmUnLCB7IGRvbWFpbk5hbWU6IGRvbWFpbk5hbWUgfSk7XG4gICAgICAgIFxuICAgICAgIFxuXG4gICAgICAgIGNvbnN0IGNlcnRpZmljYXRlID0gbmV3IGFjbS5DZXJ0aWZpY2F0ZSh0aGlzLCAnQ2VydGlmaWNhdGUnLCB7XG4gICAgICAgICAgICBkb21haW5OYW1lOiAnYXBpLicgKyBkb21haW5OYW1lLFxuICAgICAgICAgICAgdmFsaWRhdGlvbjogYWNtLkNlcnRpZmljYXRlVmFsaWRhdGlvbi5mcm9tRG5zKHpvbmUpLFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGdhdGV3YXk6IGFwaWdhdGV3YXkuUmVzdEFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ2dhdGV3YXknLCB7XG4gICAgICAgICAgICByZXN0QXBpTmFtZTogJ2NvbnRhY3QgZm9ybSBzdGF0ZSBtYWNoaW5lIGdhdGV3YXknLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUaGlzIHNlcnZpY2Ugc2VydmVzIHN0YXRlIG1hY2hpbmUgcmVxdWVzdHMuJyxcbiAgICAgICAgICAgIHJldGFpbkRlcGxveW1lbnRzOiB0cnVlLFxuICAgICAgICAgICAgZG9tYWluTmFtZToge1xuICAgICAgICAgICAgICAgIGRvbWFpbk5hbWU6ICdhcGkuJyArIGRvbWFpbk5hbWUsXG4gICAgICAgICAgICAgICAgY2VydGlmaWNhdGU6IGNlcnRpZmljYXRlLFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXG4gICAgICAgIFxuXG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgY29uc3QgZGIgPSBuZXcgZHluYW1vZGIuVGFibGUodGhpcywgJ0xpbmNvbG5IYWNrTWFpbGluZ0xpc3QnLCB7XG4gICAgICAgICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ2VtYWlsJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgICAgICAgIHRhYmxlTmFtZTogJ0xpbmNvbG5IYWNrTWFpbGluZ0xpc3QnLFxuICAgICAgICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOX09OX1VQREFURV9PUl9ERUxFVEUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIFxuICAgICAgICAvLyBhZGQgYSB0YXNrIHRvIHRoZSBjdXJyZW50IHN0YXRlIG1hY2hpbmUgdG8gcHV0IGRhdGEgaW4gZHluYW1vZGJcbiAgICAgICAgY29uc3QgcHV0SXRlbSA9IG5ldyBzdGVwZnVuY3Rpb25zX3Rhc2tzLkR5bmFtb1B1dEl0ZW0odGhpcywgJ1B1dEl0ZW0nLCB7XG4gICAgICAgICAgICB0YWJsZTogZGIsXG4gICAgICAgICAgICBpdGVtOiB7XG4gICAgICAgICAgICAgICAgZW1haWw6IHN0ZXBmdW5jdGlvbnNfdGFza3MuRHluYW1vQXR0cmlidXRlVmFsdWUuZnJvbVN0cmluZyhzdGVwZnVuY3Rpb25zLkpzb25QYXRoLnN0cmluZ0F0KCckLmJvZHkuZW1haWwuZW1haWwnKSksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzdWx0UGF0aDogJyQuUHV0SXRlbVJlc3VsdCcsXG4gICAgICAgIH0pO1xuIFxuICAgICAgICBcbiAgICAgICAgY29uc3Qgc3RhdGVNYWNoaW5lOiBzdGVwZnVuY3Rpb25zLlN0YXRlTWFjaGluZSA9IG5ldyBzdGVwZnVuY3Rpb25zLlN0YXRlTWFjaGluZSh0aGlzLCAnU3RhdGVNYWNoaW5lJywge1xuICAgICAgICAgICAgc3RhdGVNYWNoaW5lTmFtZTogJ0NvbnRhY3RGb3JtU3RhdGVNYWNoaW5lJyxcbiAgICAgICAgICAgIHN0YXRlTWFjaGluZVR5cGU6IHN0ZXBmdW5jdGlvbnMuU3RhdGVNYWNoaW5lVHlwZS5FWFBSRVNTLFxuICAgICAgICAgICAgZGVmaW5pdGlvbkJvZHk6IHN0ZXBmdW5jdGlvbnMuRGVmaW5pdGlvbkJvZHkuZnJvbUNoYWluYWJsZShuZXcgc3RlcGZ1bmN0aW9ucy5QYXNzKHRoaXMsICdTdGFydFN0YXRlJywge1xuICAgICAgICAgICAgICAgIHJlc3VsdDogc3RlcGZ1bmN0aW9ucy5SZXN1bHQuZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIGlucHV0IGZyb20gdGFzayBpbiBib2R5ICAgXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6ICAgeyAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJtZXNzYWdlXCI6IFwiVGhhbmtzIGZvciBzaWduaW5nIHVwIHRvIHRoZSBMaW5jb2xuSGFjayBtYWlsaW5nIGxpc3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZW1haWxcIjoge1wiZW1haWxcIjpzdGVwZnVuY3Rpb25zLlRhc2tJbnB1dC5mcm9tSnNvblBhdGhBdCgnJC5pbnB1dC5lbWFpbCcpIH0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KS5uZXh0KHB1dEl0ZW0pKSxcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgIFxuICAgICAgICBjb25zdCBjb250YWN0ID0gZ2F0ZXdheS5yb290LmFkZFJlc291cmNlKCdjb250YWN0Jyk7XG4gICAgICAgIGNvbnRhY3QuYWRkTWV0aG9kKCdQT1NUJywgYXBpZ2F0ZXdheS5TdGVwRnVuY3Rpb25zSW50ZWdyYXRpb24uc3RhcnRFeGVjdXRpb24oc3RhdGVNYWNoaW5lLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaW50ZWdyYXRpb25SZXNwb25zZXM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogJzIwMCcsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZVRlbXBsYXRlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhcHBsaWNhdGlvbi9qc29uJzogJ3tcInN0YXR1c1wiOiBcIm9rXCJ9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXF1ZXN0VGVtcGxhdGVzOiB7XG4gICAgICAgICAgICAgICAgICAgICdhcHBsaWNhdGlvbi9qc29uJzogJ3tcImlucHV0XCI6IFwiJHV0aWwuZXNjYXBlSmF2YVNjcmlwdCgkaW5wdXQuanNvbihcXCckXFwnKSlcIixcInN0YXRlTWFjaGluZUFyblwiOiBcIicgKyBzdGF0ZU1hY2hpbmUuc3RhdGVNYWNoaW5lQXJuICsgJ1wifScsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgKSk7XG5cbiAgICAgICAgbmV3IHJvdXRlNTMuQVJlY29yZCh0aGlzLCAnQXBpR2F0ZXdheURvbWFpbk5hbWVSZWNvcmQnLCB7XG4gICAgICAgICAgICB6b25lOiB6b25lLFxuICAgICAgICAgICAgcmVjb3JkTmFtZTogJ2FwaScsXG4gICAgICAgICAgICB0YXJnZXQ6IHJvdXRlNTMuUmVjb3JkVGFyZ2V0LmZyb21BbGlhcyhuZXcgcm91dGU1M190YXJnZXRzLkFwaUdhdGV3YXkoZ2F0ZXdheSkpLFxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=