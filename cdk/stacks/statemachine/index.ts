import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets'; 
import { Construct } from 'constructs';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';

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
            domainName: {
                domainName: 'api.' + domainName,
                certificate: certificate,
            }
            

        });
        const stateMachine: stepfunctions.StateMachine = new stepfunctions.StateMachine(this, 'StateMachine', {
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
