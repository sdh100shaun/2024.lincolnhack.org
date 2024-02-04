import { App } from 'aws-cdk-lib';
import { StaticSite } from "./stacks/s3-static-site-with-cloudfront";
import { StateMachineStack } from './stacks/statemachine';
import OidcConnection from './stacks/oidcrole';
import { artefactBucket } from './stacks/artefact-bucket';

const app = new App();


new StaticSite(app, "site", {
  env: {
    account: app.node.tryGetContext("account"),
    region: app.node.tryGetContext("region"),
  },
  domainName: "2024.lincolnhack.org",
  hostedZoneId: "Z084830024CM67I9CAD70",
});

new StaticSite(app, "demosite", {
  env: {
    account: app.node.tryGetContext("account"),
    region: app.node.tryGetContext("region"),
  },
  domainName: "demo.2024.lincolnhack.org",
  hostedZoneId: "Z084830024CM67I9CAD70",
});

new StateMachineStack(app, "StateMachine", {
    env: {
        account: app.node.tryGetContext("account"),
        region: app.node.tryGetContext("region"),
    },
    domainName: "2024.lincolnhack.org",
    hostedZoneId: "Z084830024CM67I9CAD70",
});

new OidcConnection(app, "OidcConnection", {
    env: {
        account: app.node.tryGetContext("account"),
        region: app.node.tryGetContext("region"),
    },
    oidcProviderUrl: "https://token.actions.githubusercontent.com",
    clientIds: ["sts.amazonaws.com"],
    thumbprints: ["a031c46782e6e6c662c2c87c76da9aa62ccabd8e"],
    repositoryConfig: [
          { owner: "sdh100shaun", repo: "2024.lincolnhack.org", filter: "ref:refs/heads/main" },
        ],
      });

new artefactBucket(app, "artefactBucket", {
  env: {
    account: app.node.tryGetContext("account"),
    region: app.node.tryGetContext("region"),
  },
  bucketname: "lincolnhack-artefacts",
});

app.synth();