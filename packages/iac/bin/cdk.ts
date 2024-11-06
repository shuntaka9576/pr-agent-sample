import * as cdk from "aws-cdk-lib";
import { GitHubActionOIDCStack } from "../lib/github-action-role-stack";

const app = new cdk.App();

new GitHubActionOIDCStack(app, "github-action-oidc-stack");
