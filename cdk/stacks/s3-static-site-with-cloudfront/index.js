"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticSite = void 0;
const route53 = require("aws-cdk-lib/aws-route53");
const s3 = require("aws-cdk-lib/aws-s3");
const acm = require("aws-cdk-lib/aws-certificatemanager");
const cloudfront = require("aws-cdk-lib/aws-cloudfront");
const s3deploy = require("aws-cdk-lib/aws-s3-deployment");
const targets = require("aws-cdk-lib/aws-route53-targets");
const cloudfront_origins = require("aws-cdk-lib/aws-cloudfront-origins");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const iam = require("aws-cdk-lib/aws-iam");
const constructs_1 = require("constructs");
const path = require('path');
/**
 * Static site infrastructure, which deploys site content to an S3 bucket.
 *
 * The site redirects from HTTP to HTTPS, using a CloudFront distribution,
 * Route53 alias record, and ACM certificate.
 */
class StaticSite extends constructs_1.Construct {
    constructor(parent, name, props) {
        super(parent, name);
        const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: props.domainName });
        const siteDomain = props.domainName;
        const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'cloudfront-OAI', {
            comment: `OAI for ${name}`
        });
        new aws_cdk_lib_1.CfnOutput(this, 'Site', { value: 'https://' + siteDomain });
        // Content bucket
        const siteBucket = new s3.Bucket(this, 'SiteBucket', {
            bucketName: siteDomain,
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            /**
             * The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
             * the new bucket, and it will remain in your account until manually deleted. By setting the policy to
             * DESTROY, cdk destroy will attempt to delete the bucket, but will error if the bucket is not empty.
             */
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
            /**
             * For sample purposes only, if you create an S3 bucket then populate it, stack destruction fails.  This
             * setting will enable full cleanup of the demo.
             */
            autoDeleteObjects: true, // NOT recommended for production code
        });
        // Grant access to cloudfront
        siteBucket.addToResourcePolicy(new iam.PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [siteBucket.arnForObjects('*')],
            principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
        }));
        new aws_cdk_lib_1.CfnOutput(this, 'Bucket', { value: siteBucket.bucketName });
        // TLS certificate
        const certificate = new acm.Certificate(this, 'SiteCertificate', {
            domainName: siteDomain,
            validation: acm.CertificateValidation.fromDns(zone),
        });
        new aws_cdk_lib_1.CfnOutput(this, 'Certificate', { value: certificate.certificateArn });
        // CloudFront distribution
        const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
            certificate: certificate,
            defaultRootObject: "index.html",
            domainNames: [siteDomain],
            minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
            errorResponses: [
                {
                    httpStatus: 403,
                    responseHttpStatus: 403,
                    responsePagePath: '/error.html',
                    ttl: aws_cdk_lib_1.Duration.minutes(30),
                }
            ],
            defaultBehavior: {
                origin: new cloudfront_origins.S3Origin(siteBucket, { originAccessIdentity: cloudfrontOAI }),
                compress: true,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            }
        });
        new aws_cdk_lib_1.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
        // Route53 alias record for the CloudFront distribution
        new route53.ARecord(this, 'SiteAliasRecord', {
            recordName: siteDomain,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
            zone
        });
        // Deploy site contents to S3 bucket
        new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
            sources: [s3deploy.Source.asset(path.join(__dirname, '../../../site'))],
            destinationBucket: siteBucket,
            distribution,
            distributionPaths: ['/*'],
        });
    }
}
exports.StaticSite = StaticSite;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtREFBbUQ7QUFDbkQseUNBQXlDO0FBQ3pDLDBEQUEwRDtBQUMxRCx5REFBeUQ7QUFDekQsMERBQTBEO0FBQzFELDJEQUEyRDtBQUMzRCx5RUFBeUU7QUFDekUsNkNBQXdFO0FBQ3hFLDJDQUEyQztBQUMzQywyQ0FBdUM7QUFDdkMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBTTdCOzs7OztHQUtHO0FBQ0gsTUFBYSxVQUFXLFNBQVEsc0JBQVM7SUFDdkMsWUFBWSxNQUFhLEVBQUUsSUFBWSxFQUFFLEtBQXNCO1FBQzdELEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFcEIsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUMzRixNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO1FBQ3BDLE1BQU0sYUFBYSxHQUFHLElBQUksVUFBVSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUNoRixPQUFPLEVBQUUsV0FBVyxJQUFJLEVBQUU7U0FDM0IsQ0FBQyxDQUFDO1FBRUgsSUFBSSx1QkFBUyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsVUFBVSxHQUFHLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFFaEUsaUJBQWlCO1FBQ2pCLE1BQU0sVUFBVSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ25ELFVBQVUsRUFBRSxVQUFVO1lBQ3RCLGdCQUFnQixFQUFFLEtBQUs7WUFDdkIsaUJBQWlCLEVBQUUsRUFBRSxDQUFD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Q1osaUJBQWlCLEVBQUUsQ0FBQyxJQUFJLENBQUM7U0FDMUIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBdkZELGdDQXVGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHJvdXRlNTMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXJvdXRlNTMnO1xuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcbmltcG9ydCAqIGFzIGFjbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2VydGlmaWNhdGVtYW5hZ2VyJztcbmltcG9ydCAqIGFzIGNsb3VkZnJvbnQgZnJvbSAnYXdzLWNkay1saWIvYXdzLWNsb3VkZnJvbnQnO1xuaW1wb3J0ICogYXMgczNkZXBsb3kgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzLWRlcGxveW1lbnQnO1xuaW1wb3J0ICogYXMgdGFyZ2V0cyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtcm91dGU1My10YXJnZXRzJztcbmltcG9ydCAqIGFzIGNsb3VkZnJvbnRfb3JpZ2lucyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udC1vcmlnaW5zJztcbmltcG9ydCB7IENmbk91dHB1dCwgRHVyYXRpb24sIFJlbW92YWxQb2xpY3ksIFN0YWNrIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN0YXRpY1NpdGVQcm9wcyB7XG4gIGRvbWFpbk5hbWU6IHN0cmluZztcbn1cblxuLyoqXG4gKiBTdGF0aWMgc2l0ZSBpbmZyYXN0cnVjdHVyZSwgd2hpY2ggZGVwbG95cyBzaXRlIGNvbnRlbnQgdG8gYW4gUzMgYnVja2V0LlxuICpcbiAqIFRoZSBzaXRlIHJlZGlyZWN0cyBmcm9tIEhUVFAgdG8gSFRUUFMsIHVzaW5nIGEgQ2xvdWRGcm9udCBkaXN0cmlidXRpb24sXG4gKiBSb3V0ZTUzIGFsaWFzIHJlY29yZCwgYW5kIEFDTSBjZXJ0aWZpY2F0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFN0YXRpY1NpdGUgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICBjb25zdHJ1Y3RvcihwYXJlbnQ6IFN0YWNrLCBuYW1lOiBzdHJpbmcsIHByb3BzOiBTdGF0aWNTaXRlUHJvcHMpIHtcbiAgICBzdXBlcihwYXJlbnQsIG5hbWUpO1xuXG4gICAgY29uc3Qgem9uZSA9IHJvdXRlNTMuSG9zdGVkWm9uZS5mcm9tTG9va3VwKHRoaXMsICdab25lJywgeyBkb21haW5OYW1lOiBwcm9wcy5kb21haW5OYW1lIH0pO1xuICAgIGNvbnN0IHNpdGVEb21haW4gPSBwcm9wcy5kb21haW5OYW1lO1xuICAgIGNvbnN0IGNsb3VkZnJvbnRPQUkgPSBuZXcgY2xvdWRmcm9udC5PcmlnaW5BY2Nlc3NJZGVudGl0eSh0aGlzLCAnY2xvdWRmcm9udC1PQUknLCB7XG4gICAgICBjb21tZW50OiBgT0FJIGZvciAke25hbWV9YFxuICAgIH0pO1xuXG4gICAgbmV3IENmbk91dHB1dCh0aGlzLCAnU2l0ZScsIHsgdmFsdWU6ICdodHRwczovLycgKyBzaXRlRG9tYWluIH0pO1xuXG4gICAgLy8gQ29udGVudCBidWNrZXRcbiAgICBjb25zdCBzaXRlQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnU2l0ZUJ1Y2tldCcsIHtcbiAgICAgIGJ1Y2tldE5hbWU6IHNpdGVEb21haW4sXG4gICAgICBwdWJsaWNSZWFkQWNjZXNzOiBmYWxzZSxcbiAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIGRlZmF1bHQgcmVtb3ZhbCBwb2xpY3kgaXMgUkVUQUlOLCB3aGljaCBtZWFucyB0aGF0IGNkayBkZXN0cm95IHdpbGwgbm90IGF0dGVtcHQgdG8gZGVsZXRlXG4gICAgICAgKiB0aGUgbmV3IGJ1Y2tldCwgYW5kIGl0IHdpbGwgcmVtYWluIGluIHlvdXIgYWNjb3VudCB1bnRpbCBtYW51YWxseSBkZWxldGVkLiBCeSBzZXR0aW5nIHRoZSBwb2xpY3kgdG9cbiAgICAgICAqIERFU1RST1ksIGNkayBkZXN0cm95IHdpbGwgYXR0ZW1wdCB0byBkZWxldGUgdGhlIGJ1Y2tldCwgYnV0IHdpbGwgZXJyb3IgaWYgdGhlIGJ1Y2tldCBpcyBub3QgZW1wdHkuXG4gICAgICAgKi9cbiAgICAgIHJlbW92YWxQb2xpY3k6IFJlbW92YWxQb2xpY3kuREVTVFJPWSwgLy8gTk9UIHJlY29tbWVuZGVkIGZvciBwcm9kdWN0aW9uIGNvZGVcblxuICAgICAgLyoqXG4gICAgICAgKiBGb3Igc2FtcGxlIHB1cnBvc2VzIG9ubHksIGlmIHlvdSBjcmVhdGUgYW4gUzMgYnVja2V0IHRoZW4gcG9wdWxhdGUgaXQsIHN0YWNrIGRlc3RydWN0aW9uIGZhaWxzLiAgVGhpc1xuICAgICAgICogc2V0dGluZyB3aWxsIGVuYWJsZSBmdWxsIGNsZWFudXAgb2YgdGhlIGRlbW8uXG4gICAgICAgKi9cbiAgICAgIGF1dG9EZWxldGVPYmplY3RzOiB0cnVlLCAvLyBOT1QgcmVjb21tZW5kZWQgZm9yIHByb2R1Y3Rpb24gY29kZVxuICAgIH0pO1xuXG4gICAgLy8gR3JhbnQgYWNjZXNzIHRvIGNsb3VkZnJvbnRcbiAgICBzaXRlQnVja2V0LmFkZFRvUmVzb3VyY2VQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgYWN0aW9uczogWydzMzpHZXRPYmplY3QnXSxcbiAgICAgIHJlc291cmNlczogW3NpdGVCdWNrZXQuYXJuRm9yT2JqZWN0cygnKicpXSxcbiAgICAgIHByaW5jaXBhbHM6IFtuZXcgaWFtLkNhbm9uaWNhbFVzZXJQcmluY2lwYWwoY2xvdWRmcm9udE9BSS5jbG91ZEZyb250T3JpZ2luQWNjZXNzSWRlbnRpdHlTM0Nhbm9uaWNhbFVzZXJJZCldXG4gICAgfSkpO1xuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ0J1Y2tldCcsIHsgdmFsdWU6IHNpdGVCdWNrZXQuYnVja2V0TmFtZSB9KTtcblxuICAgIC8vIFRMUyBjZXJ0aWZpY2F0ZVxuICAgIGNvbnN0IGNlcnRpZmljYXRlID0gbmV3IGFjbS5DZXJ0aWZpY2F0ZSh0aGlzLCAnU2l0ZUNlcnRpZmljYXRlJywge1xuICAgICAgZG9tYWluTmFtZTogc2l0ZURvbWFpbixcbiAgICAgIHZhbGlkYXRpb246IGFjbS5DZXJ0aWZpY2F0ZVZhbGlkYXRpb24uZnJvbURucyh6b25lKSxcbiAgICB9KTtcblxuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ0NlcnRpZmljYXRlJywgeyB2YWx1ZTogY2VydGlmaWNhdGUuY2VydGlmaWNhdGVBcm4gfSk7XG4gICAgXG4gICAgLy8gQ2xvdWRGcm9udCBkaXN0cmlidXRpb25cbiAgICBjb25zdCBkaXN0cmlidXRpb24gPSBuZXcgY2xvdWRmcm9udC5EaXN0cmlidXRpb24odGhpcywgJ1NpdGVEaXN0cmlidXRpb24nLCB7XG4gICAgICBjZXJ0aWZpY2F0ZTogY2VydGlmaWNhdGUsXG4gICAgICBkZWZhdWx0Um9vdE9iamVjdDogXCJpbmRleC5odG1sXCIsXG4gICAgICBkb21haW5OYW1lczogW3NpdGVEb21haW5dLFxuICAgICAgbWluaW11bVByb3RvY29sVmVyc2lvbjogY2xvdWRmcm9udC5TZWN1cml0eVBvbGljeVByb3RvY29sLlRMU19WMV8yXzIwMjEsXG4gICAgICBlcnJvclJlc3BvbnNlczpbXG4gICAgICAgIHtcbiAgICAgICAgICBodHRwU3RhdHVzOiA0MDMsXG4gICAgICAgICAgcmVzcG9uc2VIdHRwU3RhdHVzOiA0MDMsXG4gICAgICAgICAgcmVzcG9uc2VQYWdlUGF0aDogJy9lcnJvci5odG1sJyxcbiAgICAgICAgICB0dGw6IER1cmF0aW9uLm1pbnV0ZXMoMzApLFxuICAgICAgICB9XG4gICAgICBdLFxuICAgICAgZGVmYXVsdEJlaGF2aW9yOiB7XG4gICAgICAgIG9yaWdpbjogbmV3IGNsb3VkZnJvbnRfb3JpZ2lucy5TM09yaWdpbihzaXRlQnVja2V0LCB7b3JpZ2luQWNjZXNzSWRlbnRpdHk6IGNsb3VkZnJvbnRPQUl9KSxcbiAgICAgICAgY29tcHJlc3M6IHRydWUsXG4gICAgICAgIGFsbG93ZWRNZXRob2RzOiBjbG91ZGZyb250LkFsbG93ZWRNZXRob2RzLkFMTE9XX0dFVF9IRUFEX09QVElPTlMsXG4gICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgfVxuICAgIH0pXG5cbiAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdEaXN0cmlidXRpb25JZCcsIHsgdmFsdWU6IGRpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25JZCB9KTtcblxuICAgIC8vIFJvdXRlNTMgYWxpYXMgcmVjb3JkIGZvciB0aGUgQ2xvdWRGcm9udCBkaXN0cmlidXRpb25cbiAgICBuZXcgcm91dGU1My5BUmVjb3JkKHRoaXMsICdTaXRlQWxpYXNSZWNvcmQnLCB7XG4gICAgICByZWNvcmROYW1lOiBzaXRlRG9tYWluLFxuICAgICAgdGFyZ2V0OiByb3V0ZTUzLlJlY29yZFRhcmdldC5mcm9tQWxpYXMobmV3IHRhcmdldHMuQ2xvdWRGcm9udFRhcmdldChkaXN0cmlidXRpb24pKSxcbiAgICAgIHpvbmVcbiAgICB9KTtcblxuICAgIC8vIERlcGxveSBzaXRlIGNvbnRlbnRzIHRvIFMzIGJ1Y2tldFxuICAgIG5ldyBzM2RlcGxveS5CdWNrZXREZXBsb3ltZW50KHRoaXMsICdEZXBsb3lXaXRoSW52YWxpZGF0aW9uJywge1xuICAgICAgc291cmNlczogW3MzZGVwbG95LlNvdXJjZS5hc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc2l0ZScpKV0sXG4gICAgICBkZXN0aW5hdGlvbkJ1Y2tldDogc2l0ZUJ1Y2tldCxcbiAgICAgIGRpc3RyaWJ1dGlvbixcbiAgICAgIGRpc3RyaWJ1dGlvblBhdGhzOiBbJy8qJ10sXG4gICAgfSk7XG4gIH1cbn0iXX0=