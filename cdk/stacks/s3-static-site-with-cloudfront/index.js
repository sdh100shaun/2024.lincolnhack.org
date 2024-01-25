"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticSite = void 0;
const cdk = require("aws-cdk-lib");
const route53 = require("aws-cdk-lib/aws-route53");
const s3 = require("aws-cdk-lib/aws-s3");
const acm = require("aws-cdk-lib/aws-certificatemanager");
const cloudfront = require("aws-cdk-lib/aws-cloudfront");
const s3deploy = require("aws-cdk-lib/aws-s3-deployment");
const targets = require("aws-cdk-lib/aws-route53-targets");
const cloudfront_origins = require("aws-cdk-lib/aws-cloudfront-origins");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const iam = require("aws-cdk-lib/aws-iam");
const path = require('path');
/**
 * Static site infrastructure, which deploys site content to an S3 bucket.
 *
 * The site redirects from HTTP to HTTPS, using a CloudFront distribution,
 * Route53 alias record, and ACM certificate.
 */
class StaticSite extends cdk.Stack {
    constructor(construct, name, props) {
        super(construct, name);
        const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', {
            zoneName: props.domainName,
            hostedZoneId: props.hostedZoneId
        });
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
        const corsRule = {
            allowedMethods: [s3.HttpMethods.POST, s3.HttpMethods.GET, s3.HttpMethods.HEAD],
            allowedOrigins: ['api.' + siteDomain, siteDomain],
        };
        siteBucket.addCorsRule(corsRule);
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
                originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBa0M7QUFDbEMsbURBQW1EO0FBQ25ELHlDQUF5QztBQUN6QywwREFBMEQ7QUFDMUQseURBQXlEO0FBQ3pELDBEQUEwRDtBQUMxRCwyREFBMkQ7QUFDM0QseUVBQXlFO0FBQ3pFLDZDQUFpRTtBQUNqRSwyQ0FBMkM7QUFHM0MsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBTzdCOzs7OztHQUtHO0FBQ0gsTUFBYSxVQUFXLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDdkMsWUFBWSxTQUFvQixFQUFFLElBQVksRUFBRSxLQUFzQjtRQUNwRSxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXZCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsd0JBQXdCLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtZQUNyRSxRQUFRLEVBQUUsS0FBSyxDQUFDLFVBQVU7WUFDMUIsWUFBWSxFQUFFLEtBQUssQ0FBQyxZQUFZO1NBQ2pDLENBQUMsQ0FBQztRQUVILE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7UUFDcEMsTUFBTSxhQUFhLEdBQUcsSUFBSSxVQUFVLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ2hGLE9BQU8sRUFBRSxXQUFXLElBQUksRUFBRTtTQUMzQixDQUFDLENBQUM7UUFFSCxJQUFJLHVCQUFTLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxVQUFVLEdBQUcsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUVoRSxpQkFBaUI7UUFDakIsTUFBTSxVQUFVLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDbkQsVUFBVSxFQUFFLFVBQVU7WUFDdEIs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RSxVQUFVO1lBQ3RCLE1BQU0sRUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNsRixJQUFJO1NBQ0wsQ0FBQyxDQUFDO1FBRUgsb0NBQW9DO1FBQ3BDLElBQUksUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRTtZQUM1RCxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLGlCQUFpQixFQUFFLFVBQVU7WUFDN0IsWUFBWTtZQUNaLGlCQUFpQixFQUFFLENBQUMsSUFBSSxDQUFDO1NBQzFCLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQW5HRCxnQ0FtR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgKiBhcyByb3V0ZTUzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1yb3V0ZTUzJztcbmltcG9ydCAqIGFzIHMzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XG5pbXBvcnQgKiBhcyBhY20gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNlcnRpZmljYXRlbWFuYWdlcic7XG5pbXBvcnQgKiBhcyBjbG91ZGZyb250IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZGZyb250JztcbmltcG9ydCAqIGFzIHMzZGVwbG95IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMy1kZXBsb3ltZW50JztcbmltcG9ydCAqIGFzIHRhcmdldHMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXJvdXRlNTMtdGFyZ2V0cyc7XG5pbXBvcnQgKiBhcyBjbG91ZGZyb250X29yaWdpbnMgZnJvbSAnYXdzLWNkay1saWIvYXdzLWNsb3VkZnJvbnQtb3JpZ2lucyc7XG5pbXBvcnQgeyBDZm5PdXRwdXQsIER1cmF0aW9uLCBSZW1vdmFsUG9saWN5IH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RhdGljU2l0ZVByb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHN7XG4gIGRvbWFpbk5hbWU6IHN0cmluZztcbiAgaG9zdGVkWm9uZUlkOiBzdHJpbmc7XG59XG5cbi8qKlxuICogU3RhdGljIHNpdGUgaW5mcmFzdHJ1Y3R1cmUsIHdoaWNoIGRlcGxveXMgc2l0ZSBjb250ZW50IHRvIGFuIFMzIGJ1Y2tldC5cbiAqXG4gKiBUaGUgc2l0ZSByZWRpcmVjdHMgZnJvbSBIVFRQIHRvIEhUVFBTLCB1c2luZyBhIENsb3VkRnJvbnQgZGlzdHJpYnV0aW9uLFxuICogUm91dGU1MyBhbGlhcyByZWNvcmQsIGFuZCBBQ00gY2VydGlmaWNhdGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBTdGF0aWNTaXRlIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3IoY29uc3RydWN0OiBDb25zdHJ1Y3QsIG5hbWU6IHN0cmluZywgcHJvcHM6IFN0YXRpY1NpdGVQcm9wcykge1xuICAgIHN1cGVyKGNvbnN0cnVjdCwgbmFtZSk7XG4gICBcbiAgICBjb25zdCB6b25lID0gcm91dGU1My5Ib3N0ZWRab25lLmZyb21Ib3N0ZWRab25lQXR0cmlidXRlcyh0aGlzLCAnWm9uZScsIHsgXG4gICAgICB6b25lTmFtZTogcHJvcHMuZG9tYWluTmFtZSxcbiAgICAgIGhvc3RlZFpvbmVJZDogcHJvcHMuaG9zdGVkWm9uZUlkXG4gICAgfSk7XG5cbiAgICBjb25zdCBzaXRlRG9tYWluID0gcHJvcHMuZG9tYWluTmFtZTtcbiAgICBjb25zdCBjbG91ZGZyb250T0FJID0gbmV3IGNsb3VkZnJvbnQuT3JpZ2luQWNjZXNzSWRlbnRpdHkodGhpcywgJ2Nsb3VkZnJvbnQtT0FJJywge1xuICAgICAgY29tbWVudDogYE9BSSBmb3IgJHtuYW1lfWBcbiAgICB9KTtcblxuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ1NpdGUnLCB7IHZhbHVlOiAnaHR0cHM6Ly8nICsgc2l0ZURvbWFpbiB9KTtcblxuICAgIC8vIENvbnRlbnQgYnVja2V0XG4gICAgY29uc3Qgc2l0ZUJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ1NpdGVCdWNrZXQnLCB7XG4gICAgICBidWNrZXROYW1lOiBzaXRlRG9tYWluLFxuICAgICAgcHVibGljUmVhZEFjY2VzczogZmFsc2UsXG4gICAgICBibG9ja1B1YmxpY0FjY2VzczogczMuQmxvY2tQdWJsaWNBY2Nlc3MuQkxPQ0tfQUxMLFxuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBkZWZhdWx0IHJlbW92YWwgcG9saWN5IGlzIFJFVEFJTiwgd2hpY2ggbWVhbnMgdGhhdCBjZGsgZGVzdHJveSB3aWxsIG5vdCBhdHRlbXB0IHRvIGRlbGV0ZVxuICAgICAgICogdGhlIG5ldyBidWNrZXQsIGFuZCBpdCB3aWxsIHJlbWFpbiBpbiB5b3VyIGFjY291bnQgdW50aWwgbWFudWFsbHkgZGVsZXRlZC4gQnkgc2V0dGluZyB0aGUgcG9saWN5IHRvXG4gICAgICAgKiBERVNUUk9ZLCBjZGsgZGVzdHJveSB3aWxsIGF0dGVtcHQgdG8gZGVsZXRlIHRoZSBidWNrZXQsIGJ1dCB3aWxsIGVycm9yIGlmIHRoZSBidWNrZXQgaXMgbm90IGVtcHR5LlxuICAgICAgICovXG4gICAgICByZW1vdmFsUG9saWN5OiBSZW1vdmFsUG9saWN5LkRFU1RST1ksIC8vIE5PVCByZWNvbW1lbmRlZCBmb3IgcHJvZHVjdGlvbiBjb2RlXG5cbiAgICAgIC8qKlxuICAgICAgICogRm9yIHNhbXBsZSBwdXJwb3NlcyBvbmx5LCBpZiB5b3UgY3JlYXRlIGFuIFMzIGJ1Y2tldCB0aGVuIHBvcHVsYXRlIGl0LCBzdGFjayBkZXN0cnVjdGlvbiBmYWlscy4gIFRoaXNcbiAgICAgICAqIHNldHRpbmcgd2lsbCBlbmFibGUgZnVsbCBjbGVhbnVwIG9mIHRoZSBkZW1vLlxuICAgICAgICovXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSwgLy8gTk9UIHJlY29tbWVuZGVkIGZvciBwcm9kdWN0aW9uIGNvZGVcbiAgICB9KTtcblxuICAgIGNvbnN0IGNvcnNSdWxlOiBzMy5Db3JzUnVsZSA9IHtcbiAgICAgIGFsbG93ZWRNZXRob2RzOiBbczMuSHR0cE1ldGhvZHMuUE9TVCwgczMuSHR0cE1ldGhvZHMuR0VULCBzMy5IdHRwTWV0aG9kcy5IRUFEIF0sXG4gICAgICBhbGxvd2VkT3JpZ2luczogWydhcGkuJyArIHNpdGVEb21haW4sIHNpdGVEb21haW5dLFxuICAgIH07XG4gICAgc2l0ZUJ1Y2tldC5hZGRDb3JzUnVsZShjb3JzUnVsZSk7XG5cbiAgICAvLyBHcmFudCBhY2Nlc3MgdG8gY2xvdWRmcm9udFxuICAgIHNpdGVCdWNrZXQuYWRkVG9SZXNvdXJjZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBhY3Rpb25zOiBbJ3MzOkdldE9iamVjdCddLFxuICAgICAgcmVzb3VyY2VzOiBbc2l0ZUJ1Y2tldC5hcm5Gb3JPYmplY3RzKCcqJyldLFxuICAgICAgcHJpbmNpcGFsczogW25ldyBpYW0uQ2Fub25pY2FsVXNlclByaW5jaXBhbChjbG91ZGZyb250T0FJLmNsb3VkRnJvbnRPcmlnaW5BY2Nlc3NJZGVudGl0eVMzQ2Fub25pY2FsVXNlcklkKV1cbiAgICB9KSk7XG4gICAgbmV3IENmbk91dHB1dCh0aGlzLCAnQnVja2V0JywgeyB2YWx1ZTogc2l0ZUJ1Y2tldC5idWNrZXROYW1lIH0pO1xuXG4gICAgLy8gVExTIGNlcnRpZmljYXRlXG4gICAgY29uc3QgY2VydGlmaWNhdGUgPSBuZXcgYWNtLkNlcnRpZmljYXRlKHRoaXMsICdTaXRlQ2VydGlmaWNhdGUnLCB7XG4gICAgICBkb21haW5OYW1lOiBzaXRlRG9tYWluLFxuICAgICAgdmFsaWRhdGlvbjogYWNtLkNlcnRpZmljYXRlVmFsaWRhdGlvbi5mcm9tRG5zKHpvbmUpLFxuICAgIH0pO1xuXG4gICAgbmV3IENmbk91dHB1dCh0aGlzLCAnQ2VydGlmaWNhdGUnLCB7IHZhbHVlOiBjZXJ0aWZpY2F0ZS5jZXJ0aWZpY2F0ZUFybiB9KTtcbiAgICBcbiAgICAvLyBDbG91ZEZyb250IGRpc3RyaWJ1dGlvblxuICAgIGNvbnN0IGRpc3RyaWJ1dGlvbiA9IG5ldyBjbG91ZGZyb250LkRpc3RyaWJ1dGlvbih0aGlzLCAnU2l0ZURpc3RyaWJ1dGlvbicsIHtcbiAgICAgIGNlcnRpZmljYXRlOiBjZXJ0aWZpY2F0ZSxcbiAgICAgIGRlZmF1bHRSb290T2JqZWN0OiBcImluZGV4Lmh0bWxcIixcbiAgICAgIGRvbWFpbk5hbWVzOiBbc2l0ZURvbWFpbl0sXG4gICAgICBtaW5pbXVtUHJvdG9jb2xWZXJzaW9uOiBjbG91ZGZyb250LlNlY3VyaXR5UG9saWN5UHJvdG9jb2wuVExTX1YxXzJfMjAyMSxcbiAgICAgIGVycm9yUmVzcG9uc2VzOltcbiAgICAgICAge1xuICAgICAgICAgIGh0dHBTdGF0dXM6IDQwMyxcbiAgICAgICAgICByZXNwb25zZUh0dHBTdGF0dXM6IDQwMyxcbiAgICAgICAgICByZXNwb25zZVBhZ2VQYXRoOiAnL2Vycm9yLmh0bWwnLFxuICAgICAgICAgIHR0bDogRHVyYXRpb24ubWludXRlcygzMCksXG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBkZWZhdWx0QmVoYXZpb3I6IHtcbiAgICAgICAgb3JpZ2luOiBuZXcgY2xvdWRmcm9udF9vcmlnaW5zLlMzT3JpZ2luKHNpdGVCdWNrZXQsIHtvcmlnaW5BY2Nlc3NJZGVudGl0eTogY2xvdWRmcm9udE9BSX0pLFxuICAgICAgICBjb21wcmVzczogdHJ1ZSxcbiAgICAgICAgb3JpZ2luUmVxdWVzdFBvbGljeTogY2xvdWRmcm9udC5PcmlnaW5SZXF1ZXN0UG9saWN5LkNPUlNfUzNfT1JJR0lOLFxuICAgICAgICBhbGxvd2VkTWV0aG9kczogY2xvdWRmcm9udC5BbGxvd2VkTWV0aG9kcy5BTExPV19HRVRfSEVBRF9PUFRJT05TLFxuICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICAgICAgXG4gICAgICB9XG4gICAgfSlcblxuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ0Rpc3RyaWJ1dGlvbklkJywgeyB2YWx1ZTogZGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbklkIH0pO1xuXG4gICAgLy8gUm91dGU1MyBhbGlhcyByZWNvcmQgZm9yIHRoZSBDbG91ZEZyb250IGRpc3RyaWJ1dGlvblxuICAgIG5ldyByb3V0ZTUzLkFSZWNvcmQodGhpcywgJ1NpdGVBbGlhc1JlY29yZCcsIHtcbiAgICAgIHJlY29yZE5hbWU6IHNpdGVEb21haW4sXG4gICAgICB0YXJnZXQ6IHJvdXRlNTMuUmVjb3JkVGFyZ2V0LmZyb21BbGlhcyhuZXcgdGFyZ2V0cy5DbG91ZEZyb250VGFyZ2V0KGRpc3RyaWJ1dGlvbikpLFxuICAgICAgem9uZVxuICAgIH0pO1xuXG4gICAgLy8gRGVwbG95IHNpdGUgY29udGVudHMgdG8gUzMgYnVja2V0XG4gICAgbmV3IHMzZGVwbG95LkJ1Y2tldERlcGxveW1lbnQodGhpcywgJ0RlcGxveVdpdGhJbnZhbGlkYXRpb24nLCB7XG4gICAgICBzb3VyY2VzOiBbczNkZXBsb3kuU291cmNlLmFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi9zaXRlJykpXSxcbiAgICAgIGRlc3RpbmF0aW9uQnVja2V0OiBzaXRlQnVja2V0LFxuICAgICAgZGlzdHJpYnV0aW9uLFxuICAgICAgZGlzdHJpYnV0aW9uUGF0aHM6IFsnLyonXSxcbiAgICB9KTtcbiAgfVxufSJdfQ==