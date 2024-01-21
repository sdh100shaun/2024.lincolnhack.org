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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMseURBQXlEO0FBQ3pELDBEQUEwRDtBQUMxRCxtREFBbUQ7QUFFbkQsK0RBQStEO0FBQy9ELHFEQUFxRDtBQUVyRCxtRUFBbUU7QUFDbkUsMkVBQTJFO0FBVTNFLE1BQWEsaUJBQWtCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDNUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF5QjtRQUMvRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4QixNQUFNLFVBQVUsR0FBRyxDQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxVQUFVLEtBQUksc0JBQXNCLENBQUE7UUFDOUQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBSXJGLE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ3pELFVBQVUsRUFBRSxNQUFNLEdBQUcsVUFBVTtZQUMvQixVQUFVLEVBQUUsR0FBRyxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7U0FDdEQsQ0FBQyxDQUFDO1FBRUgsTUFBTSxPQUFPLEdBQXVCLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQ3hFLFdBQVcsRUFBRSxvQ0FBb0M7WUFDakQsV0FBVyxFQUFFLDZDQUE2QztZQUMxRCxpQkFBaUIsRUFBRSxJQUFJO1lBQ3ZCLFVBQVUsRUFBRTtnQkFDUixVQUFVLEVBQUUsTUFBTSxHQUFHLFVBQVU7Z0JBQy9CLFdBQVcsRUFBRSxXQUFXO2FBRTNCO1NBSUosQ0FBQyxDQUFDO1FBR0gsTUFBTSxFQUFFLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRTtZQUMxRCxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUNwRSxTQUFTLEVBQUUsd0JBQXdCO1lBQ25DLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLDBCQUEwQjtTQUM5RCxDQUFDLENBQUM7UUFHSCxrRUFBa0U7UUFDbEUsTUFBTSxPQUFPLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtZQUNuRSxLQUFLLEVBQUUsRUFBRTtZQUNULElBQUksRUFBRTtnQkFDRixLQUFLLEVBQUUsbUJBQW1CLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLENBQUM7YUFDcEg7WUFDRCxVQUFVLEVBQUUsaUJBQWlCO1NBQ2hDLENBQUMsQ0FBQztRQUdILE1BQU0sWUFBWSxHQUErQixJQUFJLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUNsRyxnQkFBZ0IsRUFBRSx5QkFBeUI7WUFDM0MsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDLGdCQUFnQixDQUFDLE9BQU87WUFDeEQsY0FBYyxFQUFFLGFBQWEsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO2dCQUNsRyxNQUFNLEVBQUUsYUFBYSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7b0JBQ3BDLFVBQVUsRUFBRSxHQUFHO29CQUNmLG9DQUFvQztvQkFDcEMsSUFBSSxFQUFJO3dCQUNKLFNBQVMsRUFBRSx1REFBdUQ7d0JBQ2xFLE9BQU8sRUFBRSxFQUFDLE9BQU8sRUFBQyxhQUFhLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsRUFBRTtxQkFDOUU7aUJBQ0osQ0FBQzthQUdMLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDcEIsQ0FBQyxDQUFDO1FBR0gsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLHdCQUF3QixDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQ25GO1lBQ0Usb0JBQW9CLEVBQUU7Z0JBQ2xCO29CQUNJLFVBQVUsRUFBRSxLQUFLO29CQUNqQixpQkFBaUIsRUFBRTt3QkFDZixrQkFBa0IsRUFBRSxrQkFBa0I7cUJBQ3pDO2lCQUNKO2FBQ0o7WUFDRCxnQkFBZ0IsRUFBRTtnQkFDZCxrQkFBa0IsRUFBRSw2RUFBNkUsR0FBRyxZQUFZLENBQUMsZUFBZSxHQUFHLElBQUk7YUFDMUk7U0FDSixDQUNKLENBQUMsQ0FBQztRQUVILElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsNEJBQTRCLEVBQUU7WUFDcEQsSUFBSSxFQUFFLElBQUk7WUFDVixVQUFVLEVBQUUsS0FBSztZQUNqQixNQUFNLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFlLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2xGLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXRGRCw4Q0FzRkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgKiBhcyBhY20gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNlcnRpZmljYXRlbWFuYWdlcic7XG5pbXBvcnQgKiBhcyByb3V0ZTUzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1yb3V0ZTUzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgc3RlcGZ1bmN0aW9ucyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc3RlcGZ1bmN0aW9ucyc7XG5pbXBvcnQgKiBhcyBkeW5hbW9kYiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuXG5pbXBvcnQgKiBhcyByb3V0ZTUzX3RhcmdldHMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXJvdXRlNTMtdGFyZ2V0cyc7XG5pbXBvcnQgKiBhcyBzdGVwZnVuY3Rpb25zX3Rhc2tzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zdGVwZnVuY3Rpb25zLXRhc2tzJztcblxuXG5cblxuZXhwb3J0IGludGVyZmFjZSBTdGF0ZU1hY2hpbmVQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3Bze1xuICAgIGRvbWFpbk5hbWU6IHN0cmluZztcbiAgfVxuXG5cbmV4cG9ydCBjbGFzcyBTdGF0ZU1hY2hpbmVTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBTdGF0ZU1hY2hpbmVQcm9wcykge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcbiAgICAgICAgY29uc3QgZG9tYWluTmFtZSA9IHByb3BzPy5kb21haW5OYW1lIHx8ICcyMDI0LmxpbmNvbG5oYWNrLm9yZydcbiAgICAgICAgY29uc3Qgem9uZSA9IHJvdXRlNTMuSG9zdGVkWm9uZS5mcm9tTG9va3VwKHRoaXMsICdab25lJywgeyBkb21haW5OYW1lOiBkb21haW5OYW1lIH0pO1xuICAgICAgICBcbiAgICAgICBcblxuICAgICAgICBjb25zdCBjZXJ0aWZpY2F0ZSA9IG5ldyBhY20uQ2VydGlmaWNhdGUodGhpcywgJ0NlcnRpZmljYXRlJywge1xuICAgICAgICAgICAgZG9tYWluTmFtZTogJ2FwaS4nICsgZG9tYWluTmFtZSxcbiAgICAgICAgICAgIHZhbGlkYXRpb246IGFjbS5DZXJ0aWZpY2F0ZVZhbGlkYXRpb24uZnJvbURucyh6b25lKSxcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBnYXRld2F5OiBhcGlnYXRld2F5LlJlc3RBcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsICdnYXRld2F5Jywge1xuICAgICAgICAgICAgcmVzdEFwaU5hbWU6ICdjb250YWN0IGZvcm0gc3RhdGUgbWFjaGluZSBnYXRld2F5JyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGhpcyBzZXJ2aWNlIHNlcnZlcyBzdGF0ZSBtYWNoaW5lIHJlcXVlc3RzLicsXG4gICAgICAgICAgICByZXRhaW5EZXBsb3ltZW50czogdHJ1ZSxcbiAgICAgICAgICAgIGRvbWFpbk5hbWU6IHtcbiAgICAgICAgICAgICAgICBkb21haW5OYW1lOiAnYXBpLicgKyBkb21haW5OYW1lLFxuICAgICAgICAgICAgICAgIGNlcnRpZmljYXRlOiBjZXJ0aWZpY2F0ZSxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFxuICAgICAgICBcblxuICAgICAgICB9KTtcblxuXG4gICAgICAgIGNvbnN0IGRiID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdMaW5jb2xuSGFja01haWxpbmdMaXN0Jywge1xuICAgICAgICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdlbWFpbCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICAgICAgICB0YWJsZU5hbWU6ICdMaW5jb2xuSGFja01haWxpbmdMaXN0JyxcbiAgICAgICAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LlJFVEFJTl9PTl9VUERBVEVfT1JfREVMRVRFLFxuICAgICAgICB9KTtcblxuICAgICAgICBcbiAgICAgICAgLy8gYWRkIGEgdGFzayB0byB0aGUgY3VycmVudCBzdGF0ZSBtYWNoaW5lIHRvIHB1dCBkYXRhIGluIGR5bmFtb2RiXG4gICAgICAgIGNvbnN0IHB1dEl0ZW0gPSBuZXcgc3RlcGZ1bmN0aW9uc190YXNrcy5EeW5hbW9QdXRJdGVtKHRoaXMsICdQdXRJdGVtJywge1xuICAgICAgICAgICAgdGFibGU6IGRiLFxuICAgICAgICAgICAgaXRlbToge1xuICAgICAgICAgICAgICAgIGVtYWlsOiBzdGVwZnVuY3Rpb25zX3Rhc2tzLkR5bmFtb0F0dHJpYnV0ZVZhbHVlLmZyb21TdHJpbmcoc3RlcGZ1bmN0aW9ucy5Kc29uUGF0aC5zdHJpbmdBdCgnJC5ib2R5LmVtYWlsLmVtYWlsJykpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3VsdFBhdGg6ICckLlB1dEl0ZW1SZXN1bHQnLFxuICAgICAgICB9KTtcbiBcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHN0YXRlTWFjaGluZTogc3RlcGZ1bmN0aW9ucy5TdGF0ZU1hY2hpbmUgPSBuZXcgc3RlcGZ1bmN0aW9ucy5TdGF0ZU1hY2hpbmUodGhpcywgJ1N0YXRlTWFjaGluZScsIHtcbiAgICAgICAgICAgIHN0YXRlTWFjaGluZU5hbWU6ICdDb250YWN0Rm9ybVN0YXRlTWFjaGluZScsXG4gICAgICAgICAgICBzdGF0ZU1hY2hpbmVUeXBlOiBzdGVwZnVuY3Rpb25zLlN0YXRlTWFjaGluZVR5cGUuRVhQUkVTUyxcbiAgICAgICAgICAgIGRlZmluaXRpb25Cb2R5OiBzdGVwZnVuY3Rpb25zLkRlZmluaXRpb25Cb2R5LmZyb21DaGFpbmFibGUobmV3IHN0ZXBmdW5jdGlvbnMuUGFzcyh0aGlzLCAnU3RhcnRTdGF0ZScsIHtcbiAgICAgICAgICAgICAgICByZXN1bHQ6IHN0ZXBmdW5jdGlvbnMuUmVzdWx0LmZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiBpbnB1dCBmcm9tIHRhc2sgaW4gYm9keSAgIFxuICAgICAgICAgICAgICAgICAgICBib2R5OiAgIHsgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibWVzc2FnZVwiOiBcIlRoYW5rcyBmb3Igc2lnbmluZyB1cCB0byB0aGUgTGluY29sbkhhY2sgbWFpbGluZyBsaXN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImVtYWlsXCI6IHtcImVtYWlsXCI6c3RlcGZ1bmN0aW9ucy5UYXNrSW5wdXQuZnJvbUpzb25QYXRoQXQoJyQuaW5wdXQuZW1haWwnKSB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSkubmV4dChwdXRJdGVtKSksXG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICBcbiAgICAgICAgY29uc3QgY29udGFjdCA9IGdhdGV3YXkucm9vdC5hZGRSZXNvdXJjZSgnY29udGFjdCcpO1xuICAgICAgICBjb250YWN0LmFkZE1ldGhvZCgnUE9TVCcsIGFwaWdhdGV3YXkuU3RlcEZ1bmN0aW9uc0ludGVncmF0aW9uLnN0YXJ0RXhlY3V0aW9uKHN0YXRlTWFjaGluZSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGludGVncmF0aW9uUmVzcG9uc2VzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6ICcyMDAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VUZW1wbGF0ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYXBwbGljYXRpb24vanNvbic6ICd7XCJzdGF0dXNcIjogXCJva1wifScsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVxdWVzdFRlbXBsYXRlczoge1xuICAgICAgICAgICAgICAgICAgICAnYXBwbGljYXRpb24vanNvbic6ICd7XCJpbnB1dFwiOiBcIiR1dGlsLmVzY2FwZUphdmFTY3JpcHQoJGlucHV0Lmpzb24oXFwnJFxcJykpXCIsXCJzdGF0ZU1hY2hpbmVBcm5cIjogXCInICsgc3RhdGVNYWNoaW5lLnN0YXRlTWFjaGluZUFybiArICdcIn0nLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9XG4gICAgICAgICkpO1xuXG4gICAgICAgIG5ldyByb3V0ZTUzLkFSZWNvcmQodGhpcywgJ0FwaUdhdGV3YXlEb21haW5OYW1lUmVjb3JkJywge1xuICAgICAgICAgICAgem9uZTogem9uZSxcbiAgICAgICAgICAgIHJlY29yZE5hbWU6ICdhcGknLFxuICAgICAgICAgICAgdGFyZ2V0OiByb3V0ZTUzLlJlY29yZFRhcmdldC5mcm9tQWxpYXMobmV3IHJvdXRlNTNfdGFyZ2V0cy5BcGlHYXRld2F5KGdhdGV3YXkpKSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19