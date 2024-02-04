"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.artefactBucket = void 0;
const cdk = require("aws-cdk-lib");
const s3 = require("aws-cdk-lib/aws-s3");
class artefactBucket extends cdk.Stack {
    constructor(construct, id, props) {
        super(construct, id);
        new s3.Bucket(this, 'artefactBucket', {
            bucketName: props.bucketname,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });
    }
}
exports.artefactBucket = artefactBucket;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBa0M7QUFDbEMseUNBQXlDO0FBT3pDLE1BQWEsY0FBZSxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzNDLFlBQVksU0FBb0IsRUFBRSxFQUFVLEVBQUUsS0FBMEI7UUFDdEUsS0FBSyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNyQixJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ3BDLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVTtZQUM1QixhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQ3hDLGlCQUFpQixFQUFFLElBQUk7U0FDeEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBVEQsd0NBU0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgKiBhcyBzMyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgYXJ0ZWZhY3RCdWNrZXRQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3Bze1xuICBidWNrZXRuYW1lOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBhcnRlZmFjdEJ1Y2tldCBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKGNvbnN0cnVjdDogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogYXJ0ZWZhY3RCdWNrZXRQcm9wcykge1xuICAgIHN1cGVyKGNvbnN0cnVjdCwgaWQpO1xuICAgIG5ldyBzMy5CdWNrZXQodGhpcywgJ2FydGVmYWN0QnVja2V0Jywge1xuICAgICAgYnVja2V0TmFtZTogcHJvcHMuYnVja2V0bmFtZSxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSxcbiAgICB9KTtcbiAgfVxufVxuIl19