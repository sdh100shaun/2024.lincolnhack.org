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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMseURBQXlEO0FBQ3pELDBEQUEwRDtBQUMxRCxtREFBbUQ7QUFFbkQsK0RBQStEO0FBQy9ELHFEQUFxRDtBQUNyRCxtRUFBbUU7QUFDbkUsMkVBQTJFO0FBUzNFLE1BQWEsaUJBQWtCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDNUMsWUFBWSxTQUFvQixFQUFFLElBQVksRUFBRSxLQUF5QjtRQUNyRSxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sVUFBVSxHQUFHLENBQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLFVBQVUsS0FBSSxzQkFBc0IsQ0FBQTtRQUM5RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxNQUFNLEVBQUU7WUFDbkUsUUFBUSxFQUFFLFVBQVU7WUFDcEIsWUFBWSxFQUFFLENBQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLFlBQVksS0FBSSx1QkFBdUI7U0FDOUQsQ0FBQyxDQUFDO1FBSUosTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDekQsVUFBVSxFQUFFLE1BQU0sR0FBRyxVQUFVO1lBQy9CLFVBQVUsRUFBRSxHQUFHLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztTQUN0RCxDQUFDLENBQUM7UUFFSCxNQUFNLE9BQU8sR0FBdUIsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDeEUsV0FBVyxFQUFFLG9DQUFvQztZQUNqRCxXQUFXLEVBQUUsNkNBQTZDO1lBQzFELGlCQUFpQixFQUFFLElBQUk7WUFDdkIsVUFBVSxFQUFFO2dCQUNSLFVBQVUsRUFBRSxNQUFNLEdBQUcsVUFBVTtnQkFDL0IsV0FBVyxFQUFFLFdBQVc7YUFFM0I7U0FJSixDQUFDLENBQUM7UUFHSCxNQUFNLEVBQUUsR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFO1lBQzFELFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ3BFLFNBQVMsRUFBRSx3QkFBd0I7WUFDbkMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsMEJBQTBCO1NBQzlELENBQUMsQ0FBQztRQUdILGtFQUFrRTtRQUNsRSxNQUFNLE9BQU8sR0FBRyxJQUFJLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQ25FLEtBQUssRUFBRSxFQUFFO1lBQ1QsSUFBSSxFQUFFO2dCQUNGLEtBQUssRUFBRSxtQkFBbUIsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQzthQUNwSDtZQUNELFVBQVUsRUFBRSxpQkFBaUI7U0FDaEMsQ0FBQyxDQUFDO1FBR0gsTUFBTSxZQUFZLEdBQStCLElBQUksYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ2xHLGdCQUFnQixFQUFFLHlCQUF5QjtZQUMzQyxnQkFBZ0IsRUFBRSxhQUFhLENBQUMsZ0JBQWdCLENBQUMsT0FBTztZQUN4RCxjQUFjLEVBQUUsYUFBYSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7Z0JBQ2xHLE1BQU0sRUFBRSxhQUFhLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztvQkFDcEMsVUFBVSxFQUFFLEdBQUc7b0JBQ2Ysb0NBQW9DO29CQUNwQyxJQUFJLEVBQUk7d0JBQ0osU0FBUyxFQUFFLHVEQUF1RDt3QkFDbEUsT0FBTyxFQUFFLEVBQUMsT0FBTyxFQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxFQUFFO3FCQUM5RTtpQkFDSixDQUFDO2FBR0wsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNwQixDQUFDLENBQUM7UUFHSCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwRCxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsd0JBQXdCLENBQUMsY0FBYyxDQUFDLFlBQVksRUFDbkY7WUFDRSxvQkFBb0IsRUFBRTtnQkFDbEI7b0JBQ0ksVUFBVSxFQUFFLEtBQUs7b0JBQ2pCLGlCQUFpQixFQUFFO3dCQUNmLGtCQUFrQixFQUFFLGtCQUFrQjtxQkFDekM7aUJBQ0o7YUFDSjtZQUNELGdCQUFnQixFQUFFO2dCQUNkLGtCQUFrQixFQUFFLDZFQUE2RSxHQUFHLFlBQVksQ0FBQyxlQUFlLEdBQUcsSUFBSTthQUMxSTtTQUNKLENBQ0osQ0FBQyxDQUFDO1FBRUgsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSw0QkFBNEIsRUFBRTtZQUNwRCxJQUFJLEVBQUUsSUFBSTtZQUNWLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLE1BQU0sRUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDbEYsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBekZELDhDQXlGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCAqIGFzIGFjbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2VydGlmaWNhdGVtYW5hZ2VyJztcbmltcG9ydCAqIGFzIHJvdXRlNTMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXJvdXRlNTMnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBzdGVwZnVuY3Rpb25zIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zdGVwZnVuY3Rpb25zJztcbmltcG9ydCAqIGFzIGR5bmFtb2RiIGZyb20gJ2F3cy1jZGstbGliL2F3cy1keW5hbW9kYic7XG5pbXBvcnQgKiBhcyByb3V0ZTUzX3RhcmdldHMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXJvdXRlNTMtdGFyZ2V0cyc7XG5pbXBvcnQgKiBhcyBzdGVwZnVuY3Rpb25zX3Rhc2tzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zdGVwZnVuY3Rpb25zLXRhc2tzJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIFN0YXRlTWFjaGluZVByb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHN7XG4gICAgZG9tYWluTmFtZTogc3RyaW5nO1xuICAgIGhvc3RlZFpvbmVJZDogc3RyaW5nO1xuICB9XG5cblxuZXhwb3J0IGNsYXNzIFN0YXRlTWFjaGluZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25zdHJ1Y3Q6IENvbnN0cnVjdCwgbmFtZTogc3RyaW5nLCBwcm9wcz86IFN0YXRlTWFjaGluZVByb3BzKSB7XG4gICAgICAgIHN1cGVyKGNvbnN0cnVjdCwgbmFtZSk7XG4gICAgICAgIGNvbnN0IGRvbWFpbk5hbWUgPSBwcm9wcz8uZG9tYWluTmFtZSB8fCAnMjAyNC5saW5jb2xuaGFjay5vcmcnXG4gICAgICAgIGNvbnN0IHpvbmUgPSByb3V0ZTUzLkhvc3RlZFpvbmUuZnJvbUhvc3RlZFpvbmVBdHRyaWJ1dGVzKHRoaXMsICdab25lJywgeyBcbiAgICAgICAgICAgIHpvbmVOYW1lOiBkb21haW5OYW1lLFxuICAgICAgICAgICAgaG9zdGVkWm9uZUlkOiBwcm9wcz8uaG9zdGVkWm9uZUlkIHx8ICdaMDg0ODMwMDI0Q002N0k5Q0FENzAnXG4gICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgXG5cbiAgICAgICAgY29uc3QgY2VydGlmaWNhdGUgPSBuZXcgYWNtLkNlcnRpZmljYXRlKHRoaXMsICdDZXJ0aWZpY2F0ZScsIHtcbiAgICAgICAgICAgIGRvbWFpbk5hbWU6ICdhcGkuJyArIGRvbWFpbk5hbWUsXG4gICAgICAgICAgICB2YWxpZGF0aW9uOiBhY20uQ2VydGlmaWNhdGVWYWxpZGF0aW9uLmZyb21EbnMoem9uZSksXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgZ2F0ZXdheTogYXBpZ2F0ZXdheS5SZXN0QXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnZ2F0ZXdheScsIHtcbiAgICAgICAgICAgIHJlc3RBcGlOYW1lOiAnY29udGFjdCBmb3JtIHN0YXRlIG1hY2hpbmUgZ2F0ZXdheScsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RoaXMgc2VydmljZSBzZXJ2ZXMgc3RhdGUgbWFjaGluZSByZXF1ZXN0cy4nLFxuICAgICAgICAgICAgcmV0YWluRGVwbG95bWVudHM6IHRydWUsXG4gICAgICAgICAgICBkb21haW5OYW1lOiB7XG4gICAgICAgICAgICAgICAgZG9tYWluTmFtZTogJ2FwaS4nICsgZG9tYWluTmFtZSxcbiAgICAgICAgICAgICAgICBjZXJ0aWZpY2F0ZTogY2VydGlmaWNhdGUsXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcbiAgICAgICAgXG5cbiAgICAgICAgfSk7XG5cblxuICAgICAgICBjb25zdCBkYiA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnTGluY29sbkhhY2tNYWlsaW5nTGlzdCcsIHtcbiAgICAgICAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAnZW1haWwnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgICAgICAgdGFibGVOYW1lOiAnTGluY29sbkhhY2tNYWlsaW5nTGlzdCcsXG4gICAgICAgICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5SRVRBSU5fT05fVVBEQVRFX09SX0RFTEVURSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgXG4gICAgICAgIC8vIGFkZCBhIHRhc2sgdG8gdGhlIGN1cnJlbnQgc3RhdGUgbWFjaGluZSB0byBwdXQgZGF0YSBpbiBkeW5hbW9kYlxuICAgICAgICBjb25zdCBwdXRJdGVtID0gbmV3IHN0ZXBmdW5jdGlvbnNfdGFza3MuRHluYW1vUHV0SXRlbSh0aGlzLCAnUHV0SXRlbScsIHtcbiAgICAgICAgICAgIHRhYmxlOiBkYixcbiAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICBlbWFpbDogc3RlcGZ1bmN0aW9uc190YXNrcy5EeW5hbW9BdHRyaWJ1dGVWYWx1ZS5mcm9tU3RyaW5nKHN0ZXBmdW5jdGlvbnMuSnNvblBhdGguc3RyaW5nQXQoJyQuYm9keS5lbWFpbC5lbWFpbCcpKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXN1bHRQYXRoOiAnJC5QdXRJdGVtUmVzdWx0JyxcbiAgICAgICAgfSk7XG4gXG4gICAgICAgIFxuICAgICAgICBjb25zdCBzdGF0ZU1hY2hpbmU6IHN0ZXBmdW5jdGlvbnMuU3RhdGVNYWNoaW5lID0gbmV3IHN0ZXBmdW5jdGlvbnMuU3RhdGVNYWNoaW5lKHRoaXMsICdTdGF0ZU1hY2hpbmUnLCB7XG4gICAgICAgICAgICBzdGF0ZU1hY2hpbmVOYW1lOiAnQ29udGFjdEZvcm1TdGF0ZU1hY2hpbmUnLFxuICAgICAgICAgICAgc3RhdGVNYWNoaW5lVHlwZTogc3RlcGZ1bmN0aW9ucy5TdGF0ZU1hY2hpbmVUeXBlLkVYUFJFU1MsXG4gICAgICAgICAgICBkZWZpbml0aW9uQm9keTogc3RlcGZ1bmN0aW9ucy5EZWZpbml0aW9uQm9keS5mcm9tQ2hhaW5hYmxlKG5ldyBzdGVwZnVuY3Rpb25zLlBhc3ModGhpcywgJ1N0YXJ0U3RhdGUnLCB7XG4gICAgICAgICAgICAgICAgcmVzdWx0OiBzdGVwZnVuY3Rpb25zLlJlc3VsdC5mcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gaW5wdXQgZnJvbSB0YXNrIGluIGJvZHkgICBcbiAgICAgICAgICAgICAgICAgICAgYm9keTogICB7ICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIjogXCJUaGFua3MgZm9yIHNpZ25pbmcgdXAgdG8gdGhlIExpbmNvbG5IYWNrIG1haWxpbmcgbGlzdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJlbWFpbFwiOiB7XCJlbWFpbFwiOnN0ZXBmdW5jdGlvbnMuVGFza0lucHV0LmZyb21Kc29uUGF0aEF0KCckLmlucHV0LmVtYWlsJykgfSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pLm5leHQocHV0SXRlbSkpLFxuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGNvbnRhY3QgPSBnYXRld2F5LnJvb3QuYWRkUmVzb3VyY2UoJ2NvbnRhY3QnKTtcbiAgICAgICAgY29udGFjdC5hZGRNZXRob2QoJ1BPU1QnLCBhcGlnYXRld2F5LlN0ZXBGdW5jdGlvbnNJbnRlZ3JhdGlvbi5zdGFydEV4ZWN1dGlvbihzdGF0ZU1hY2hpbmUsXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpbnRlZ3JhdGlvblJlc3BvbnNlczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiAnMjAwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlVGVtcGxhdGVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL2pzb24nOiAne1wic3RhdHVzXCI6IFwib2tcIn0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlcXVlc3RUZW1wbGF0ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL2pzb24nOiAne1wiaW5wdXRcIjogXCIkdXRpbC5lc2NhcGVKYXZhU2NyaXB0KCRpbnB1dC5qc29uKFxcJyRcXCcpKVwiLFwic3RhdGVNYWNoaW5lQXJuXCI6IFwiJyArIHN0YXRlTWFjaGluZS5zdGF0ZU1hY2hpbmVBcm4gKyAnXCJ9JyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfVxuICAgICAgICApKTtcblxuICAgICAgICBuZXcgcm91dGU1My5BUmVjb3JkKHRoaXMsICdBcGlHYXRld2F5RG9tYWluTmFtZVJlY29yZCcsIHtcbiAgICAgICAgICAgIHpvbmU6IHpvbmUsXG4gICAgICAgICAgICByZWNvcmROYW1lOiAnYXBpJyxcbiAgICAgICAgICAgIHRhcmdldDogcm91dGU1My5SZWNvcmRUYXJnZXQuZnJvbUFsaWFzKG5ldyByb3V0ZTUzX3RhcmdldHMuQXBpR2F0ZXdheShnYXRld2F5KSksXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==