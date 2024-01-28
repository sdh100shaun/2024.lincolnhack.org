import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as route53_targets from 'aws-cdk-lib/aws-route53-targets';
import * as stepfunctions_tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';


export interface StateMachineProps extends cdk.StackProps{
    domainName: string;
    hostedZoneId: string;
  }


export class StateMachineStack extends cdk.Stack {
    constructor(construct: Construct, name: string, props?: StateMachineProps) {
        super(construct, name);
        const domainName = props?.domainName || '2024.lincolnhack.org'
        const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', { 
            zoneName: domainName,
            hostedZoneId: props?.hostedZoneId || 'Z084830024CM67I9CAD70'
         });
        
       

        const certificate = new acm.Certificate(this, 'Certificate', {
            domainName: 'api.' + domainName,
            validation: acm.CertificateValidation.fromDns(zone),
        });
        
        const gateway: apigateway.RestApi = new apigateway.RestApi(this, 'gateway', {
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
 
        
        const stateMachine: stepfunctions.StateMachine = new stepfunctions.StateMachine(this, 'StateMachine', {
            stateMachineName: 'ContactFormStateMachine',
            stateMachineType: stepfunctions.StateMachineType.EXPRESS,
            definitionBody: stepfunctions.DefinitionBody.fromChainable(new stepfunctions.Pass(this, 'StartState', {
                resultPath : stepfunctions.JsonPath.DISCARD,
            }).next(putItem)),
        });
    
        
        const contact = gateway.root.addResource('contact');
        contact.addMethod('POST', apigateway.StepFunctionsIntegration.startExecution(stateMachine,
              {
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
            }
        ));

        new route53.ARecord(this, 'ApiGatewayDomainNameRecord', {
            zone: zone,
            recordName: 'api',
            target: route53.RecordTarget.fromAlias(new route53_targets.ApiGateway(gateway)),
        });
    }
}
