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
            sortKey: { name: 'created', type: dynamodb.AttributeType.NUMBER },
        });
        // add a task to the current state machine to put data in dynamodb
        const putItem = new stepfunctions_tasks.DynamoPutItem(this, 'PutItem', {
            table: db,
            item: {
                email: stepfunctions_tasks.DynamoAttributeValue.fromString(stepfunctions.JsonPath.stringAt('$.email')),
                created: stepfunctions_tasks.DynamoAttributeValue.fromNumber(stepfunctions.JsonPath.numberAt('$.created')),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMseURBQXlEO0FBQ3pELDBEQUEwRDtBQUMxRCxtREFBbUQ7QUFFbkQsK0RBQStEO0FBQy9ELHFEQUFxRDtBQUNyRCxtRUFBbUU7QUFDbkUsMkVBQTJFO0FBUzNFLE1BQWEsaUJBQWtCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDNUMsWUFBWSxTQUFvQixFQUFFLElBQVksRUFBRSxLQUF5QjtRQUNyRSxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sVUFBVSxHQUFHLENBQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLFVBQVUsS0FBSSxzQkFBc0IsQ0FBQTtRQUM5RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxNQUFNLEVBQUU7WUFDbkUsUUFBUSxFQUFFLFVBQVU7WUFDcEIsWUFBWSxFQUFFLENBQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLFlBQVksS0FBSSx1QkFBdUI7U0FDOUQsQ0FBQyxDQUFDO1FBSUosTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDekQsVUFBVSxFQUFFLE1BQU0sR0FBRyxVQUFVO1lBQy9CLFVBQVUsRUFBRSxHQUFHLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztTQUN0RCxDQUFDLENBQUM7UUFFSCxNQUFNLE9BQU8sR0FBdUIsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDeEUsV0FBVyxFQUFFLG9DQUFvQztZQUNqRCxXQUFXLEVBQUUsNkNBQTZDO1lBQzFELGlCQUFpQixFQUFFLElBQUk7WUFDdkIsVUFBVSxFQUFFO2dCQUNSLFVBQVUsRUFBRSxNQUFNLEdBQUcsVUFBVTtnQkFDL0IsV0FBVyxFQUFFLFdBQVc7YUFFM0I7U0FJSixDQUFDLENBQUM7UUFHSCxNQUFNLEVBQUUsR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFO1lBQzFELFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ3BFLFNBQVMsRUFBRSx3QkFBd0I7WUFDbkMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsMEJBQTBCO1lBQzNELE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1NBQ3BFLENBQUMsQ0FBQztRQUdILGtFQUFrRTtRQUNsRSxNQUFNLE9BQU8sR0FBRyxJQUFJLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQ25FLEtBQUssRUFBRSxFQUFFO1lBQ1QsSUFBSSxFQUFFO2dCQUNGLEtBQUssRUFBRSxtQkFBbUIsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3RHLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDN0c7WUFDRCxVQUFVLEVBQUUsaUJBQWlCO1NBQ2hDLENBQUMsQ0FBQztRQUdILE1BQU0sWUFBWSxHQUErQixJQUFJLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUNsRyxnQkFBZ0IsRUFBRSx5QkFBeUI7WUFDM0MsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDLGdCQUFnQixDQUFDLE9BQU87WUFDeEQsY0FBYyxFQUFFLGFBQWEsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO2dCQUNsRyxVQUFVLEVBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQyxPQUFPO2FBQzlDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDcEIsQ0FBQyxDQUFDO1FBR0gsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLHdCQUF3QixDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQ25GO1lBQ0Usb0JBQW9CLEVBQUU7Z0JBQ2xCO29CQUNJLFVBQVUsRUFBRSxLQUFLO29CQUNqQixpQkFBaUIsRUFBRTt3QkFDZixrQkFBa0IsRUFBRSxrQkFBa0I7cUJBQ3pDO2lCQUNKO2FBQ0o7WUFDRCxnQkFBZ0IsRUFBRTtnQkFDZCxrQkFBa0IsRUFBRSw2RUFBNkUsR0FBRyxZQUFZLENBQUMsZUFBZSxHQUFHLElBQUk7YUFDMUk7U0FDSixDQUNKLENBQUMsQ0FBQztRQUVILElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsNEJBQTRCLEVBQUU7WUFDcEQsSUFBSSxFQUFFLElBQUk7WUFDVixVQUFVLEVBQUUsS0FBSztZQUNqQixNQUFNLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFlLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2xGLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQWxGRCw4Q0FrRkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgKiBhcyBhY20gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNlcnRpZmljYXRlbWFuYWdlcic7XG5pbXBvcnQgKiBhcyByb3V0ZTUzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1yb3V0ZTUzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgc3RlcGZ1bmN0aW9ucyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc3RlcGZ1bmN0aW9ucyc7XG5pbXBvcnQgKiBhcyBkeW5hbW9kYiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0ICogYXMgcm91dGU1M190YXJnZXRzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1yb3V0ZTUzLXRhcmdldHMnO1xuaW1wb3J0ICogYXMgc3RlcGZ1bmN0aW9uc190YXNrcyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc3RlcGZ1bmN0aW9ucy10YXNrcyc7XG5cblxuZXhwb3J0IGludGVyZmFjZSBTdGF0ZU1hY2hpbmVQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3Bze1xuICAgIGRvbWFpbk5hbWU6IHN0cmluZztcbiAgICBob3N0ZWRab25lSWQ6IHN0cmluZztcbiAgfVxuXG5cbmV4cG9ydCBjbGFzcyBTdGF0ZU1hY2hpbmVTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gICAgY29uc3RydWN0b3IoY29uc3RydWN0OiBDb25zdHJ1Y3QsIG5hbWU6IHN0cmluZywgcHJvcHM/OiBTdGF0ZU1hY2hpbmVQcm9wcykge1xuICAgICAgICBzdXBlcihjb25zdHJ1Y3QsIG5hbWUpO1xuICAgICAgICBjb25zdCBkb21haW5OYW1lID0gcHJvcHM/LmRvbWFpbk5hbWUgfHwgJzIwMjQubGluY29sbmhhY2sub3JnJ1xuICAgICAgICBjb25zdCB6b25lID0gcm91dGU1My5Ib3N0ZWRab25lLmZyb21Ib3N0ZWRab25lQXR0cmlidXRlcyh0aGlzLCAnWm9uZScsIHsgXG4gICAgICAgICAgICB6b25lTmFtZTogZG9tYWluTmFtZSxcbiAgICAgICAgICAgIGhvc3RlZFpvbmVJZDogcHJvcHM/Lmhvc3RlZFpvbmVJZCB8fCAnWjA4NDgzMDAyNENNNjdJOUNBRDcwJ1xuICAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgIFxuXG4gICAgICAgIGNvbnN0IGNlcnRpZmljYXRlID0gbmV3IGFjbS5DZXJ0aWZpY2F0ZSh0aGlzLCAnQ2VydGlmaWNhdGUnLCB7XG4gICAgICAgICAgICBkb21haW5OYW1lOiAnYXBpLicgKyBkb21haW5OYW1lLFxuICAgICAgICAgICAgdmFsaWRhdGlvbjogYWNtLkNlcnRpZmljYXRlVmFsaWRhdGlvbi5mcm9tRG5zKHpvbmUpLFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGdhdGV3YXk6IGFwaWdhdGV3YXkuUmVzdEFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ2dhdGV3YXknLCB7XG4gICAgICAgICAgICByZXN0QXBpTmFtZTogJ2NvbnRhY3QgZm9ybSBzdGF0ZSBtYWNoaW5lIGdhdGV3YXknLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUaGlzIHNlcnZpY2Ugc2VydmVzIHN0YXRlIG1hY2hpbmUgcmVxdWVzdHMuJyxcbiAgICAgICAgICAgIHJldGFpbkRlcGxveW1lbnRzOiB0cnVlLFxuICAgICAgICAgICAgZG9tYWluTmFtZToge1xuICAgICAgICAgICAgICAgIGRvbWFpbk5hbWU6ICdhcGkuJyArIGRvbWFpbk5hbWUsXG4gICAgICAgICAgICAgICAgY2VydGlmaWNhdGU6IGNlcnRpZmljYXRlLFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXG4gICAgICAgIFxuXG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgY29uc3QgZGIgPSBuZXcgZHluYW1vZGIuVGFibGUodGhpcywgJ0xpbmNvbG5IYWNrTWFpbGluZ0xpc3QnLCB7XG4gICAgICAgICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ2VtYWlsJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgICAgICAgIHRhYmxlTmFtZTogJ0xpbmNvbG5IYWNrTWFpbGluZ0xpc3QnLFxuICAgICAgICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOX09OX1VQREFURV9PUl9ERUxFVEUsXG4gICAgICAgICAgICBzb3J0S2V5OiB7IG5hbWU6ICdjcmVhdGVkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5OVU1CRVIgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgXG4gICAgICAgIC8vIGFkZCBhIHRhc2sgdG8gdGhlIGN1cnJlbnQgc3RhdGUgbWFjaGluZSB0byBwdXQgZGF0YSBpbiBkeW5hbW9kYlxuICAgICAgICBjb25zdCBwdXRJdGVtID0gbmV3IHN0ZXBmdW5jdGlvbnNfdGFza3MuRHluYW1vUHV0SXRlbSh0aGlzLCAnUHV0SXRlbScsIHtcbiAgICAgICAgICAgIHRhYmxlOiBkYixcbiAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICBlbWFpbDogc3RlcGZ1bmN0aW9uc190YXNrcy5EeW5hbW9BdHRyaWJ1dGVWYWx1ZS5mcm9tU3RyaW5nKHN0ZXBmdW5jdGlvbnMuSnNvblBhdGguc3RyaW5nQXQoJyQuZW1haWwnKSksXG4gICAgICAgICAgICAgICAgY3JlYXRlZDogc3RlcGZ1bmN0aW9uc190YXNrcy5EeW5hbW9BdHRyaWJ1dGVWYWx1ZS5mcm9tTnVtYmVyKHN0ZXBmdW5jdGlvbnMuSnNvblBhdGgubnVtYmVyQXQoJyQuY3JlYXRlZCcpKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXN1bHRQYXRoOiAnJC5QdXRJdGVtUmVzdWx0JyxcbiAgICAgICAgfSk7XG4gXG4gICAgICAgIFxuICAgICAgICBjb25zdCBzdGF0ZU1hY2hpbmU6IHN0ZXBmdW5jdGlvbnMuU3RhdGVNYWNoaW5lID0gbmV3IHN0ZXBmdW5jdGlvbnMuU3RhdGVNYWNoaW5lKHRoaXMsICdTdGF0ZU1hY2hpbmUnLCB7XG4gICAgICAgICAgICBzdGF0ZU1hY2hpbmVOYW1lOiAnQ29udGFjdEZvcm1TdGF0ZU1hY2hpbmUnLFxuICAgICAgICAgICAgc3RhdGVNYWNoaW5lVHlwZTogc3RlcGZ1bmN0aW9ucy5TdGF0ZU1hY2hpbmVUeXBlLkVYUFJFU1MsXG4gICAgICAgICAgICBkZWZpbml0aW9uQm9keTogc3RlcGZ1bmN0aW9ucy5EZWZpbml0aW9uQm9keS5mcm9tQ2hhaW5hYmxlKG5ldyBzdGVwZnVuY3Rpb25zLlBhc3ModGhpcywgJ1N0YXJ0U3RhdGUnLCB7XG4gICAgICAgICAgICAgICAgcmVzdWx0UGF0aCA6IHN0ZXBmdW5jdGlvbnMuSnNvblBhdGguRElTQ0FSRCxcbiAgICAgICAgICAgIH0pLm5leHQocHV0SXRlbSkpLFxuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGNvbnRhY3QgPSBnYXRld2F5LnJvb3QuYWRkUmVzb3VyY2UoJ2NvbnRhY3QnKTtcbiAgICAgICAgY29udGFjdC5hZGRNZXRob2QoJ1BPU1QnLCBhcGlnYXRld2F5LlN0ZXBGdW5jdGlvbnNJbnRlZ3JhdGlvbi5zdGFydEV4ZWN1dGlvbihzdGF0ZU1hY2hpbmUsXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpbnRlZ3JhdGlvblJlc3BvbnNlczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiAnMjAwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlVGVtcGxhdGVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL2pzb24nOiAne1wic3RhdHVzXCI6IFwib2tcIn0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlcXVlc3RUZW1wbGF0ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL2pzb24nOiAne1wiaW5wdXRcIjogXCIkdXRpbC5lc2NhcGVKYXZhU2NyaXB0KCRpbnB1dC5qc29uKFxcJyRcXCcpKVwiLFwic3RhdGVNYWNoaW5lQXJuXCI6IFwiJyArIHN0YXRlTWFjaGluZS5zdGF0ZU1hY2hpbmVBcm4gKyAnXCJ9JyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfVxuICAgICAgICApKTtcblxuICAgICAgICBuZXcgcm91dGU1My5BUmVjb3JkKHRoaXMsICdBcGlHYXRld2F5RG9tYWluTmFtZVJlY29yZCcsIHtcbiAgICAgICAgICAgIHpvbmU6IHpvbmUsXG4gICAgICAgICAgICByZWNvcmROYW1lOiAnYXBpJyxcbiAgICAgICAgICAgIHRhcmdldDogcm91dGU1My5SZWNvcmRUYXJnZXQuZnJvbUFsaWFzKG5ldyByb3V0ZTUzX3RhcmdldHMuQXBpR2F0ZXdheShnYXRld2F5KSksXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==