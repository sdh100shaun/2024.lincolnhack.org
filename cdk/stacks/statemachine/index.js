"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateMachineStack = void 0;
const cdk = require("aws-cdk-lib");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const acm = require("aws-cdk-lib/aws-certificatemanager");
const route53 = require("aws-cdk-lib/aws-route53");
const stepfunctions = require("aws-cdk-lib/aws-stepfunctions");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const route53_targets = require("aws-cdk-lib/aws-route53-targets");
const stepfunctions_tasks = require("aws-cdk-lib/aws-stepfunctions-tasks");
class StateMachineStack extends cdk.Stack {
    constructor(construct, name, props) {
        super(construct, name);
        const domainName = (props === null || props === void 0 ? void 0 : props.domainName) || '2024.lincolnhack.org';
        const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', {
            zoneName: domainName,
            hostedZoneId: (props === null || props === void 0 ? void 0 : props.hostedZoneId) || 'Z084830024CM67I9CAD70'
        });
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
        const dietaryTable = new dynamodb.Table(this, 'LincolnHackDietary', {
            partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
            tableName: 'LincolnHackDietary',
            removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
            sortKey: { name: 'created', type: dynamodb.AttributeType.NUMBER },
        });
        // add a task to the current state machine to put data in dynamodb
        const putItem = new stepfunctions_tasks.DynamoPutItem(this, 'PutItem', {
            table: dietaryTable,
            item: {
                email: stepfunctions_tasks.DynamoAttributeValue.fromString(stepfunctions.JsonPath.stringAt('$.email')),
                created: stepfunctions_tasks.DynamoAttributeValue.fromNumber(stepfunctions.JsonPath.numberAt('$.created')),
                dietaryRequirements: stepfunctions_tasks.DynamoAttributeValue.fromString(stepfunctions.JsonPath.stringAt('$.dietaryRequirements')),
                ticketReference: stepfunctions_tasks.DynamoAttributeValue.fromString(stepfunctions.JsonPath.stringAt('$.ticketRef'))
            },
            resultPath: '$.PutItemResult',
        });
        const stateMachine = new stepfunctions.StateMachine(this, 'StateMachine', {
            stateMachineName: 'ContactFormStateMachine',
            stateMachineType: stepfunctions.StateMachineType.EXPRESS,
            definitionBody: stepfunctions.DefinitionBody.fromChainable(new stepfunctions.Pass(this, 'StartState', {
                resultPath: stepfunctions.JsonPath.DISCARD,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMseURBQXlEO0FBQ3pELDBEQUEwRDtBQUMxRCxtREFBbUQ7QUFFbkQsK0RBQStEO0FBQy9ELHFEQUFxRDtBQUNyRCxtRUFBbUU7QUFDbkUsMkVBQTJFO0FBUzNFLE1BQWEsaUJBQWtCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDNUMsWUFBWSxTQUFvQixFQUFFLElBQVksRUFBRSxLQUF5QjtRQUNyRSxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sVUFBVSxHQUFHLENBQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLFVBQVUsS0FBSSxzQkFBc0IsQ0FBQTtRQUM5RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxNQUFNLEVBQUU7WUFDbkUsUUFBUSxFQUFFLFVBQVU7WUFDcEIsWUFBWSxFQUFFLENBQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLFlBQVksS0FBSSx1QkFBdUI7U0FDOUQsQ0FBQyxDQUFDO1FBSUosTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDekQsVUFBVSxFQUFFLE1BQU0sR0FBRyxVQUFVO1lBQy9CLFVBQVUsRUFBRSxHQUFHLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztTQUN0RCxDQUFDLENBQUM7UUFFSCxNQUFNLE9BQU8sR0FBdUIsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDeEUsV0FBVyxFQUFFLG9DQUFvQztZQUNqRCxXQUFXLEVBQUUsNkNBQTZDO1lBQzFELGlCQUFpQixFQUFFLElBQUk7WUFDdkIsVUFBVSxFQUFFO2dCQUNSLFVBQVUsRUFBRSxNQUFNLEdBQUcsVUFBVTtnQkFDL0IsV0FBVyxFQUFFLFdBQVc7YUFFM0I7U0FJSixDQUFDLENBQUM7UUFFSCxNQUFNLFlBQVksR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQ2hFLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ3BFLFNBQVMsRUFBRSxvQkFBb0I7WUFDL0IsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsMEJBQTBCO1lBQzNELE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1NBQ3BFLENBQUMsQ0FBQztRQUdILGtFQUFrRTtRQUNsRSxNQUFNLE9BQU8sR0FBRyxJQUFJLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQ25FLEtBQUssRUFBRSxZQUFZO1lBQ25CLElBQUksRUFBRTtnQkFDRixLQUFLLEVBQUUsbUJBQW1CLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN0RyxPQUFPLEVBQUUsbUJBQW1CLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUMxRyxtQkFBbUIsRUFBRSxtQkFBbUIsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsQ0FBQztnQkFDbEksZUFBZSxFQUFFLG1CQUFtQixDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUN2SDtZQUNELFVBQVUsRUFBRSxpQkFBaUI7U0FDaEMsQ0FBQyxDQUFDO1FBR0gsTUFBTSxZQUFZLEdBQStCLElBQUksYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ2xHLGdCQUFnQixFQUFFLHlCQUF5QjtZQUMzQyxnQkFBZ0IsRUFBRSxhQUFhLENBQUMsZ0JBQWdCLENBQUMsT0FBTztZQUN4RCxjQUFjLEVBQUUsYUFBYSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7Z0JBQ2xHLFVBQVUsRUFBRyxhQUFhLENBQUMsUUFBUSxDQUFDLE9BQU87YUFDOUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNwQixDQUFDLENBQUM7UUFHSCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwRCxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsd0JBQXdCLENBQUMsY0FBYyxDQUFDLFlBQVksRUFDbkY7WUFDRSxvQkFBb0IsRUFBRTtnQkFDbEI7b0JBQ0ksVUFBVSxFQUFFLEtBQUs7b0JBQ2pCLGlCQUFpQixFQUFFO3dCQUNmLGtCQUFrQixFQUFFLGtCQUFrQjtxQkFDekM7aUJBQ0o7YUFDSjtZQUNELGdCQUFnQixFQUFFO2dCQUNkLGtCQUFrQixFQUFFLDZFQUE2RSxHQUFHLFlBQVksQ0FBQyxlQUFlLEdBQUcsSUFBSTthQUMxSTtTQUNKLENBQ0osQ0FBQyxDQUFDO1FBRUgsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSw0QkFBNEIsRUFBRTtZQUNwRCxJQUFJLEVBQUUsSUFBSTtZQUNWLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLE1BQU0sRUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDbEYsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBbkZELDhDQW1GQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCAqIGFzIGFjbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2VydGlmaWNhdGVtYW5hZ2VyJztcbmltcG9ydCAqIGFzIHJvdXRlNTMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXJvdXRlNTMnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBzdGVwZnVuY3Rpb25zIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zdGVwZnVuY3Rpb25zJztcbmltcG9ydCAqIGFzIGR5bmFtb2RiIGZyb20gJ2F3cy1jZGstbGliL2F3cy1keW5hbW9kYic7XG5pbXBvcnQgKiBhcyByb3V0ZTUzX3RhcmdldHMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXJvdXRlNTMtdGFyZ2V0cyc7XG5pbXBvcnQgKiBhcyBzdGVwZnVuY3Rpb25zX3Rhc2tzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zdGVwZnVuY3Rpb25zLXRhc2tzJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIFN0YXRlTWFjaGluZVByb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHN7XG4gICAgZG9tYWluTmFtZTogc3RyaW5nO1xuICAgIGhvc3RlZFpvbmVJZDogc3RyaW5nO1xuICB9XG5cblxuZXhwb3J0IGNsYXNzIFN0YXRlTWFjaGluZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25zdHJ1Y3Q6IENvbnN0cnVjdCwgbmFtZTogc3RyaW5nLCBwcm9wcz86IFN0YXRlTWFjaGluZVByb3BzKSB7XG4gICAgICAgIHN1cGVyKGNvbnN0cnVjdCwgbmFtZSk7XG4gICAgICAgIGNvbnN0IGRvbWFpbk5hbWUgPSBwcm9wcz8uZG9tYWluTmFtZSB8fCAnMjAyNC5saW5jb2xuaGFjay5vcmcnXG4gICAgICAgIGNvbnN0IHpvbmUgPSByb3V0ZTUzLkhvc3RlZFpvbmUuZnJvbUhvc3RlZFpvbmVBdHRyaWJ1dGVzKHRoaXMsICdab25lJywgeyBcbiAgICAgICAgICAgIHpvbmVOYW1lOiBkb21haW5OYW1lLFxuICAgICAgICAgICAgaG9zdGVkWm9uZUlkOiBwcm9wcz8uaG9zdGVkWm9uZUlkIHx8ICdaMDg0ODMwMDI0Q002N0k5Q0FENzAnXG4gICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgXG5cbiAgICAgICAgY29uc3QgY2VydGlmaWNhdGUgPSBuZXcgYWNtLkNlcnRpZmljYXRlKHRoaXMsICdDZXJ0aWZpY2F0ZScsIHtcbiAgICAgICAgICAgIGRvbWFpbk5hbWU6ICdhcGkuJyArIGRvbWFpbk5hbWUsXG4gICAgICAgICAgICB2YWxpZGF0aW9uOiBhY20uQ2VydGlmaWNhdGVWYWxpZGF0aW9uLmZyb21EbnMoem9uZSksXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgZ2F0ZXdheTogYXBpZ2F0ZXdheS5SZXN0QXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnZ2F0ZXdheScsIHtcbiAgICAgICAgICAgIHJlc3RBcGlOYW1lOiAnY29udGFjdCBmb3JtIHN0YXRlIG1hY2hpbmUgZ2F0ZXdheScsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RoaXMgc2VydmljZSBzZXJ2ZXMgc3RhdGUgbWFjaGluZSByZXF1ZXN0cy4nLFxuICAgICAgICAgICAgcmV0YWluRGVwbG95bWVudHM6IHRydWUsXG4gICAgICAgICAgICBkb21haW5OYW1lOiB7XG4gICAgICAgICAgICAgICAgZG9tYWluTmFtZTogJ2FwaS4nICsgZG9tYWluTmFtZSxcbiAgICAgICAgICAgICAgICBjZXJ0aWZpY2F0ZTogY2VydGlmaWNhdGUsXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcbiAgICAgICAgXG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgZGlldGFyeVRhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdMaW5jb2xuSGFja0RpZXRhcnknLCB7XG4gICAgICAgICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ2VtYWlsJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgICAgICAgIHRhYmxlTmFtZTogJ0xpbmNvbG5IYWNrRGlldGFyeScsXG4gICAgICAgICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5SRVRBSU5fT05fVVBEQVRFX09SX0RFTEVURSxcbiAgICAgICAgICAgIHNvcnRLZXk6IHsgbmFtZTogJ2NyZWF0ZWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLk5VTUJFUiB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBcbiAgICAgICAgLy8gYWRkIGEgdGFzayB0byB0aGUgY3VycmVudCBzdGF0ZSBtYWNoaW5lIHRvIHB1dCBkYXRhIGluIGR5bmFtb2RiXG4gICAgICAgIGNvbnN0IHB1dEl0ZW0gPSBuZXcgc3RlcGZ1bmN0aW9uc190YXNrcy5EeW5hbW9QdXRJdGVtKHRoaXMsICdQdXRJdGVtJywge1xuICAgICAgICAgICAgdGFibGU6IGRpZXRhcnlUYWJsZSxcbiAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICBlbWFpbDogc3RlcGZ1bmN0aW9uc190YXNrcy5EeW5hbW9BdHRyaWJ1dGVWYWx1ZS5mcm9tU3RyaW5nKHN0ZXBmdW5jdGlvbnMuSnNvblBhdGguc3RyaW5nQXQoJyQuZW1haWwnKSksXG4gICAgICAgICAgICAgICAgY3JlYXRlZDogc3RlcGZ1bmN0aW9uc190YXNrcy5EeW5hbW9BdHRyaWJ1dGVWYWx1ZS5mcm9tTnVtYmVyKHN0ZXBmdW5jdGlvbnMuSnNvblBhdGgubnVtYmVyQXQoJyQuY3JlYXRlZCcpKSxcbiAgICAgICAgICAgICAgICBkaWV0YXJ5UmVxdWlyZW1lbnRzOiBzdGVwZnVuY3Rpb25zX3Rhc2tzLkR5bmFtb0F0dHJpYnV0ZVZhbHVlLmZyb21TdHJpbmcoc3RlcGZ1bmN0aW9ucy5Kc29uUGF0aC5zdHJpbmdBdCgnJC5kaWV0YXJ5UmVxdWlyZW1lbnRzJykpLFxuICAgICAgICAgICAgICAgIHRpY2tldFJlZmVyZW5jZTogc3RlcGZ1bmN0aW9uc190YXNrcy5EeW5hbW9BdHRyaWJ1dGVWYWx1ZS5mcm9tU3RyaW5nKHN0ZXBmdW5jdGlvbnMuSnNvblBhdGguc3RyaW5nQXQoJyQudGlja2V0UmVmJykpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzdWx0UGF0aDogJyQuUHV0SXRlbVJlc3VsdCcsXG4gICAgICAgIH0pO1xuIFxuICAgICAgICBcbiAgICAgICAgY29uc3Qgc3RhdGVNYWNoaW5lOiBzdGVwZnVuY3Rpb25zLlN0YXRlTWFjaGluZSA9IG5ldyBzdGVwZnVuY3Rpb25zLlN0YXRlTWFjaGluZSh0aGlzLCAnU3RhdGVNYWNoaW5lJywge1xuICAgICAgICAgICAgc3RhdGVNYWNoaW5lTmFtZTogJ0NvbnRhY3RGb3JtU3RhdGVNYWNoaW5lJyxcbiAgICAgICAgICAgIHN0YXRlTWFjaGluZVR5cGU6IHN0ZXBmdW5jdGlvbnMuU3RhdGVNYWNoaW5lVHlwZS5FWFBSRVNTLFxuICAgICAgICAgICAgZGVmaW5pdGlvbkJvZHk6IHN0ZXBmdW5jdGlvbnMuRGVmaW5pdGlvbkJvZHkuZnJvbUNoYWluYWJsZShuZXcgc3RlcGZ1bmN0aW9ucy5QYXNzKHRoaXMsICdTdGFydFN0YXRlJywge1xuICAgICAgICAgICAgICAgIHJlc3VsdFBhdGggOiBzdGVwZnVuY3Rpb25zLkpzb25QYXRoLkRJU0NBUkQsXG4gICAgICAgICAgICB9KS5uZXh0KHB1dEl0ZW0pKSxcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgIFxuICAgICAgICBjb25zdCBjb250YWN0ID0gZ2F0ZXdheS5yb290LmFkZFJlc291cmNlKCdjb250YWN0Jyk7XG4gICAgICAgIGNvbnRhY3QuYWRkTWV0aG9kKCdQT1NUJywgYXBpZ2F0ZXdheS5TdGVwRnVuY3Rpb25zSW50ZWdyYXRpb24uc3RhcnRFeGVjdXRpb24oc3RhdGVNYWNoaW5lLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaW50ZWdyYXRpb25SZXNwb25zZXM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogJzIwMCcsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZVRlbXBsYXRlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhcHBsaWNhdGlvbi9qc29uJzogJ3tcInN0YXR1c1wiOiBcIm9rXCJ9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXF1ZXN0VGVtcGxhdGVzOiB7XG4gICAgICAgICAgICAgICAgICAgICdhcHBsaWNhdGlvbi9qc29uJzogJ3tcImlucHV0XCI6IFwiJHV0aWwuZXNjYXBlSmF2YVNjcmlwdCgkaW5wdXQuanNvbihcXCckXFwnKSlcIixcInN0YXRlTWFjaGluZUFyblwiOiBcIicgKyBzdGF0ZU1hY2hpbmUuc3RhdGVNYWNoaW5lQXJuICsgJ1wifScsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgKSk7XG5cbiAgICAgICAgbmV3IHJvdXRlNTMuQVJlY29yZCh0aGlzLCAnQXBpR2F0ZXdheURvbWFpbk5hbWVSZWNvcmQnLCB7XG4gICAgICAgICAgICB6b25lOiB6b25lLFxuICAgICAgICAgICAgcmVjb3JkTmFtZTogJ2FwaScsXG4gICAgICAgICAgICB0YXJnZXQ6IHJvdXRlNTMuUmVjb3JkVGFyZ2V0LmZyb21BbGlhcyhuZXcgcm91dGU1M190YXJnZXRzLkFwaUdhdGV3YXkoZ2F0ZXdheSkpLFxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=