import { Stack, App } from 'aws-cdk-lib';
import { StaticSite } from "./stacks/s3-static-site-with-cloudfront";
import { StateMachineStack } from './stacks/statemachine';

const app = new App();
const stack = new Stack(app, "LincolnHackHoldingPage",{ env: {
        account: app.node.tryGetContext("account"),
        region: app.node.tryGetContext("region"),
      } });
new StaticSite(stack, "HoldingPage", {
  domainName: "2024.lincolnhack.org",
});

new StateMachineStack(stack, "StateMachineStack", {
    env: {
        account: app.node.tryGetContext("account"),
        region: app.node.tryGetContext("region"),
    },
    domainName: "2024.lincolnhack.org",
});


app.synth();