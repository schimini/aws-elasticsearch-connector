import { Connection } from "@elastic/elasticsearch";
import aws4 from "aws4";
import AWS from "aws-sdk";
import * as http from 'http'



export default (awsConfig: AWS.Config): typeof Connection => {
  class AmazonConnection extends Connection {
    buildRequestObject(params: any) {
      const req = super.buildRequestObject(params) as http.ClientRequestArgs & {service: string, body: string, region?: string}

      req.service = "es";

      if (awsConfig.region) {
        req.region = awsConfig.region
      }
      
      if (!req.headers) {
        req.headers = {};
      }

      // Fix the Host header, since HttpConnector.makeReqParams() appends
      // the port number which will cause signature verification to fail
      req.headers.host = req.hostname;

      // This fix allows the connector to work with the older 6.x elastic branch.
      // The problem with that version, is that the Transport object would add a
      // `Content-Length` header (yes with Pascal Case), thus duplicating headers
      // (`Content-Length` and `content-length`), which makes the signature fail.
      let contentLength = 0
      if (params.body) {
        contentLength = Buffer.byteLength(params.body, 'utf8')
        req.body = params.body
      }
      const lengthHeader = 'content-length'
      const headerFound = Object.keys(req.headers).find(
        header => header.toLowerCase() === lengthHeader)
      if (headerFound === undefined) {
        req.headers[lengthHeader] = contentLength
      }

      return aws4.sign(req, awsConfig.credentials);
    }
  }

  return AmazonConnection;
};
