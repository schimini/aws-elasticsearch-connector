import { Connection } from "@elastic/elasticsearch";
import aws4 from "aws4";
import AWS from "aws-sdk";
import * as http from 'http'



export default (awsConfig: AWS.Config): typeof Connection => {
  class AmazonConnection extends Connection {
    buildRequestObject(params: any) {
      const req = super.buildRequestObject(params) as http.ClientRequestArgs & {service: string, body: string}

      req.service = "es";

      if (!req.headers) {
        req.headers = {};
      }

      // Fix the Host header, since HttpConnector.makeReqParams() appends
      // the port number which will cause signature verification to fail
      req.headers.host = req.hostname;

      if (params.body) {
        req.headers["content-length"] = Buffer.byteLength(params.body, "utf8");
        req.body = params.body;
      } else {
        req.headers["content-length"] = 0;
      }

      return aws4.sign(req, awsConfig.credentials);
    }
  }

  return AmazonConnection;
};
