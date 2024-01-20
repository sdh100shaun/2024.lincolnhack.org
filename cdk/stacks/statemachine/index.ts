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
  }


export class StateMachineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: StateMachineProps) {
        super(scope, id, props);
        const domainName = props?.domainName || '2024.lincolnhack.org'
        const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: domainName });
        
       

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
 
        
        const stateMachine: stepfunctions.StateMachine = new stepfunctions.StateMachine(this, 'StateMachine', {
            stateMachineName: 'ContactFormStateMachine',
            stateMachineType: stepfunctions.StateMachineType.EXPRESS,
            definitionBody: stepfunctions.DefinitionBody.fromChainable(new stepfunctions.Pass(this, 'StartState', {
                result: stepfunctions.Result.fromObject({
                    statusCode: 200,
                    // return input from task in body   
                    inputPath: '$.input',
                    body:   {   
                        "message": "Thanks for signing up to the LincolnHack mailing list",
                        "email": {"email":stepfunctions.renderJsonPath("$.input.email")},
                    },
                }),
                
                
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
