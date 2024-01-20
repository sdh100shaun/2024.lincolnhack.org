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
                    inputPath: '$.input',
                    body: {
                        "message": "Thanks for signing up to the LincolnHack mailing list",
                        "email": { "email": stepfunctions.renderJsonPath("$.input.email") },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMseURBQXlEO0FBQ3pELDBEQUEwRDtBQUMxRCxtREFBbUQ7QUFFbkQsK0RBQStEO0FBQy9ELHFEQUFxRDtBQUVyRCxtRUFBbUU7QUFDbkUsMkVBQTJFO0FBVTNFLE1BQWEsaUJBQWtCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDNUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF5QjtRQUMvRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4QixNQUFNLFVBQVUsR0FBRyxDQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxVQUFVLEtBQUksc0JBQXNCLENBQUE7UUFDOUQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBSXJGLE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ3pELFVBQVUsRUFBRSxNQUFNLEdBQUcsVUFBVTtZQUMvQixVQUFVLEVBQUUsR0FBRyxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7U0FDdEQsQ0FBQyxDQUFDO1FBRUgsTUFBTSxPQUFPLEdBQXVCLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQ3hFLFdBQVcsRUFBRSxvQ0FBb0M7WUFDakQsV0FBVyxFQUFFLDZDQUE2QztZQUMxRCxpQkFBaUIsRUFBRSxJQUFJO1lBQ3ZCLFVBQVUsRUFBRTtnQkFDUixVQUFVLEVBQUUsTUFBTSxHQUFHLFVBQVU7Z0JBQy9CLFdBQVcsRUFBRSxXQUFXO2FBRTNCO1NBSUosQ0FBQyxDQUFDO1FBR0gsTUFBTSxFQUFFLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRTtZQUMxRCxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUNwRSxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQywwQkFBMEI7U0FDOUQsQ0FBQyxDQUFDO1FBR0gsa0VBQWtFO1FBQ2xFLE1BQU0sT0FBTyxHQUFHLElBQUksbUJBQW1CLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDbkUsS0FBSyxFQUFFLEVBQUU7WUFDVCxJQUFJLEVBQUU7Z0JBQ0YsS0FBSyxFQUFFLG1CQUFtQixDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2FBQ3BIO1lBQ0QsVUFBVSxFQUFFLGlCQUFpQjtTQUNoQyxDQUFDLENBQUM7UUFHSCxNQUFNLFlBQVksR0FBK0IsSUFBSSxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDbEcsZ0JBQWdCLEVBQUUseUJBQXlCO1lBQzNDLGdCQUFnQixFQUFFLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPO1lBQ3hELGNBQWMsRUFBRSxhQUFhLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtnQkFDbEcsTUFBTSxFQUFFLGFBQWEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO29CQUNwQyxVQUFVLEVBQUUsR0FBRztvQkFDZixvQ0FBb0M7b0JBQ3BDLFNBQVMsRUFBRSxTQUFTO29CQUNwQixJQUFJLEVBQUk7d0JBQ0osU0FBUyxFQUFFLHVEQUF1RDt3QkFDbEUsT0FBTyxFQUFFLEVBQUMsT0FBTyxFQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLEVBQUM7cUJBQ25FO2lCQUNKLENBQUM7YUFHTCxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3BCLENBQUMsQ0FBQztRQUdILE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BELE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUNuRjtZQUNFLG9CQUFvQixFQUFFO2dCQUNsQjtvQkFDSSxVQUFVLEVBQUUsS0FBSztvQkFDakIsaUJBQWlCLEVBQUU7d0JBQ2Ysa0JBQWtCLEVBQUUsa0JBQWtCO3FCQUN6QztpQkFDSjthQUNKO1lBQ0QsZ0JBQWdCLEVBQUU7Z0JBQ2Qsa0JBQWtCLEVBQUUsNkVBQTZFLEdBQUcsWUFBWSxDQUFDLGVBQWUsR0FBRyxJQUFJO2FBQzFJO1NBQ0osQ0FDSixDQUFDLENBQUM7UUFFSCxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLDRCQUE0QixFQUFFO1lBQ3BELElBQUksRUFBRSxJQUFJO1lBQ1YsVUFBVSxFQUFFLEtBQUs7WUFDakIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNsRixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUF0RkQsOENBc0ZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xuaW1wb3J0ICogYXMgYWNtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jZXJ0aWZpY2F0ZW1hbmFnZXInO1xuaW1wb3J0ICogYXMgcm91dGU1MyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtcm91dGU1Myc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIHN0ZXBmdW5jdGlvbnMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXN0ZXBmdW5jdGlvbnMnO1xuaW1wb3J0ICogYXMgZHluYW1vZGIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiJztcblxuaW1wb3J0ICogYXMgcm91dGU1M190YXJnZXRzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1yb3V0ZTUzLXRhcmdldHMnO1xuaW1wb3J0ICogYXMgc3RlcGZ1bmN0aW9uc190YXNrcyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc3RlcGZ1bmN0aW9ucy10YXNrcyc7XG5cblxuXG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RhdGVNYWNoaW5lUHJvcHMgZXh0ZW5kcyBjZGsuU3RhY2tQcm9wc3tcbiAgICBkb21haW5OYW1lOiBzdHJpbmc7XG4gIH1cblxuXG5leHBvcnQgY2xhc3MgU3RhdGVNYWNoaW5lU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogU3RhdGVNYWNoaW5lUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG4gICAgICAgIGNvbnN0IGRvbWFpbk5hbWUgPSBwcm9wcz8uZG9tYWluTmFtZSB8fCAnMjAyNC5saW5jb2xuaGFjay5vcmcnXG4gICAgICAgIGNvbnN0IHpvbmUgPSByb3V0ZTUzLkhvc3RlZFpvbmUuZnJvbUxvb2t1cCh0aGlzLCAnWm9uZScsIHsgZG9tYWluTmFtZTogZG9tYWluTmFtZSB9KTtcbiAgICAgICAgXG4gICAgICAgXG5cbiAgICAgICAgY29uc3QgY2VydGlmaWNhdGUgPSBuZXcgYWNtLkNlcnRpZmljYXRlKHRoaXMsICdDZXJ0aWZpY2F0ZScsIHtcbiAgICAgICAgICAgIGRvbWFpbk5hbWU6ICdhcGkuJyArIGRvbWFpbk5hbWUsXG4gICAgICAgICAgICB2YWxpZGF0aW9uOiBhY20uQ2VydGlmaWNhdGVWYWxpZGF0aW9uLmZyb21EbnMoem9uZSksXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgZ2F0ZXdheTogYXBpZ2F0ZXdheS5SZXN0QXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnZ2F0ZXdheScsIHtcbiAgICAgICAgICAgIHJlc3RBcGlOYW1lOiAnY29udGFjdCBmb3JtIHN0YXRlIG1hY2hpbmUgZ2F0ZXdheScsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RoaXMgc2VydmljZSBzZXJ2ZXMgc3RhdGUgbWFjaGluZSByZXF1ZXN0cy4nLFxuICAgICAgICAgICAgcmV0YWluRGVwbG95bWVudHM6IHRydWUsXG4gICAgICAgICAgICBkb21haW5OYW1lOiB7XG4gICAgICAgICAgICAgICAgZG9tYWluTmFtZTogJ2FwaS4nICsgZG9tYWluTmFtZSxcbiAgICAgICAgICAgICAgICBjZXJ0aWZpY2F0ZTogY2VydGlmaWNhdGUsXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcbiAgICAgICAgXG5cbiAgICAgICAgfSk7XG5cblxuICAgICAgICBjb25zdCBkYiA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnTGluY29sbkhhY2tNYWlsaW5nTGlzdCcsIHtcbiAgICAgICAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAnZW1haWwnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOX09OX1VQREFURV9PUl9ERUxFVEUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIFxuICAgICAgICAvLyBhZGQgYSB0YXNrIHRvIHRoZSBjdXJyZW50IHN0YXRlIG1hY2hpbmUgdG8gcHV0IGRhdGEgaW4gZHluYW1vZGJcbiAgICAgICAgY29uc3QgcHV0SXRlbSA9IG5ldyBzdGVwZnVuY3Rpb25zX3Rhc2tzLkR5bmFtb1B1dEl0ZW0odGhpcywgJ1B1dEl0ZW0nLCB7XG4gICAgICAgICAgICB0YWJsZTogZGIsXG4gICAgICAgICAgICBpdGVtOiB7XG4gICAgICAgICAgICAgICAgZW1haWw6IHN0ZXBmdW5jdGlvbnNfdGFza3MuRHluYW1vQXR0cmlidXRlVmFsdWUuZnJvbVN0cmluZyhzdGVwZnVuY3Rpb25zLkpzb25QYXRoLnN0cmluZ0F0KCckLmJvZHkuZW1haWwuZW1haWwnKSksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzdWx0UGF0aDogJyQuUHV0SXRlbVJlc3VsdCcsXG4gICAgICAgIH0pO1xuIFxuICAgICAgICBcbiAgICAgICAgY29uc3Qgc3RhdGVNYWNoaW5lOiBzdGVwZnVuY3Rpb25zLlN0YXRlTWFjaGluZSA9IG5ldyBzdGVwZnVuY3Rpb25zLlN0YXRlTWFjaGluZSh0aGlzLCAnU3RhdGVNYWNoaW5lJywge1xuICAgICAgICAgICAgc3RhdGVNYWNoaW5lTmFtZTogJ0NvbnRhY3RGb3JtU3RhdGVNYWNoaW5lJyxcbiAgICAgICAgICAgIHN0YXRlTWFjaGluZVR5cGU6IHN0ZXBmdW5jdGlvbnMuU3RhdGVNYWNoaW5lVHlwZS5FWFBSRVNTLFxuICAgICAgICAgICAgZGVmaW5pdGlvbkJvZHk6IHN0ZXBmdW5jdGlvbnMuRGVmaW5pdGlvbkJvZHkuZnJvbUNoYWluYWJsZShuZXcgc3RlcGZ1bmN0aW9ucy5QYXNzKHRoaXMsICdTdGFydFN0YXRlJywge1xuICAgICAgICAgICAgICAgIHJlc3VsdDogc3RlcGZ1bmN0aW9ucy5SZXN1bHQuZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIGlucHV0IGZyb20gdGFzayBpbiBib2R5ICAgXG4gICAgICAgICAgICAgICAgICAgIGlucHV0UGF0aDogJyQuaW5wdXQnLFxuICAgICAgICAgICAgICAgICAgICBib2R5OiAgIHsgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibWVzc2FnZVwiOiBcIlRoYW5rcyBmb3Igc2lnbmluZyB1cCB0byB0aGUgTGluY29sbkhhY2sgbWFpbGluZyBsaXN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImVtYWlsXCI6IHtcImVtYWlsXCI6c3RlcGZ1bmN0aW9ucy5yZW5kZXJKc29uUGF0aChcIiQuaW5wdXQuZW1haWxcIil9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSkubmV4dChwdXRJdGVtKSksXG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICBcbiAgICAgICAgY29uc3QgY29udGFjdCA9IGdhdGV3YXkucm9vdC5hZGRSZXNvdXJjZSgnY29udGFjdCcpO1xuICAgICAgICBjb250YWN0LmFkZE1ldGhvZCgnUE9TVCcsIGFwaWdhdGV3YXkuU3RlcEZ1bmN0aW9uc0ludGVncmF0aW9uLnN0YXJ0RXhlY3V0aW9uKHN0YXRlTWFjaGluZSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGludGVncmF0aW9uUmVzcG9uc2VzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6ICcyMDAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VUZW1wbGF0ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYXBwbGljYXRpb24vanNvbic6ICd7XCJzdGF0dXNcIjogXCJva1wifScsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVxdWVzdFRlbXBsYXRlczoge1xuICAgICAgICAgICAgICAgICAgICAnYXBwbGljYXRpb24vanNvbic6ICd7XCJpbnB1dFwiOiBcIiR1dGlsLmVzY2FwZUphdmFTY3JpcHQoJGlucHV0Lmpzb24oXFwnJFxcJykpXCIsXCJzdGF0ZU1hY2hpbmVBcm5cIjogXCInICsgc3RhdGVNYWNoaW5lLnN0YXRlTWFjaGluZUFybiArICdcIn0nLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9XG4gICAgICAgICkpO1xuXG4gICAgICAgIG5ldyByb3V0ZTUzLkFSZWNvcmQodGhpcywgJ0FwaUdhdGV3YXlEb21haW5OYW1lUmVjb3JkJywge1xuICAgICAgICAgICAgem9uZTogem9uZSxcbiAgICAgICAgICAgIHJlY29yZE5hbWU6ICdhcGknLFxuICAgICAgICAgICAgdGFyZ2V0OiByb3V0ZTUzLlJlY29yZFRhcmdldC5mcm9tQWxpYXMobmV3IHJvdXRlNTNfdGFyZ2V0cy5BcGlHYXRld2F5KGdhdGV3YXkpKSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19