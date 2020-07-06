import AWS from "aws-sdk";
import AmazonConnection from './AmazonConnection';
import AmazonTransport from './AmazonTransport';
export default (awsConfig: AWS.Config) => ({
  Connection: AmazonConnection(awsConfig),
  Transport: AmazonTransport(awsConfig)
})
