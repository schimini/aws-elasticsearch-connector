import { Transport } from "@elastic/elasticsearch";
import AWS from "aws-sdk";
import {
  TransportRequestParams,
  TransportRequestOptions,
  ApiError,
  ApiResponse,
  TransportRequestCallback,
  TransportOptions,
} from "@elastic/elasticsearch/lib/Transport";

function awaitAwsCredentials(awsConfig: AWS.Config) {
  return new Promise((resolve, reject) => {
    awsConfig.getCredentials((err) => {
      err ? reject(err) : resolve();
    });
  });
}

export default (awsConfig: AWS.Config): typeof Transport => {
  class AmazonTransport extends Transport {
    request(params: TransportRequestParams, options?: TransportRequestOptions): Promise<ApiResponse>;
    request(params: TransportRequestParams, options?: TransportRequestOptions, callback?: (err: ApiError, result: ApiResponse) => void): TransportRequestCallback;
    request(
      params: TransportRequestParams = { method: undefined, path: undefined },
      options: TransportRequestOptions = undefined,
      callback?: (err: ApiError, result?: ApiResponse) => void
    ) {
      // options is optional, so if it is omitted, options will be the callback
      if (typeof options === "function") {
        callback = options;
        options = {};
      }

      // Promise support
      if (typeof callback === "undefined") {
        return awaitAwsCredentials(awsConfig).then(() =>
          super.request(params, options)
        );
      } else {
        // Callback support
        awaitAwsCredentials(awsConfig)
          .then(() => super.request(params, options, callback))
          .catch(callback);
        return { abort: () => {} };
      }
    }
  }

  return AmazonTransport;
};

