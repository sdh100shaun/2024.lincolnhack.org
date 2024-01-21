import { Stack, App } from 'aws-cdk-lib';
import { StaticSite } from "./stacks/s3-static-site-with-cloudfront";
import { StateMachineStack } from './stacks/statemachine';
import OidcConnection from './stacks/oidcrole';

const app = new App();
const stack = new Stack(app, "LincolnHack",{ env: {
        account: app.node.tryGetContext("account"),
        region: app.node.tryGetContext("region"),
      } });

new StaticSite(stack, "site", {
  domainName: "2024.lincolnhack.org",
});

new StateMachineStack(stack, "StateMachineStack", {
    env: {
        account: app.node.tryGetContext("account"),
        region: app.node.tryGetContext("region"),
    },
    domainName: "2024.lincolnhack.org",
});

new OidcConnection(stack, "OidcConnection", {
    oidcProviderUrl: "https://token.actions.githubusercontent.com",
    clientIds: ["sts.amazonaws.com"],
    thumbprints: ["a031c46782e6e6c662c2c87c76da9aa62ccabd8e"],
    repositoryConfig: [
        { owner: "sdh100shaun", repo: "lincolnhack2024", filter: "main" },
        ],
      });

app.synth();