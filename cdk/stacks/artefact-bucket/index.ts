import * as cdk from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface artefactBucketProps extends cdk.StackProps{
  bucketname: string;
}

export class artefactBucket extends cdk.Stack {
  constructor(construct: Construct, id: string, props: artefactBucketProps) {
    super(construct, id);
    new s3.Bucket(this, 'artefactBucket', {
      bucketName: props.bucketname,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
    });
  }
}
