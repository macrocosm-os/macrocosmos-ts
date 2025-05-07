import {
  Sn13ServiceClient,
  ListTopicsRequest,
  ListTopicsResponse,
  ListTopicsResponseDetail,
  ValidateRedditTopicRequest,
  ValidateRedditTopicResponse,
} from "../../generated/sn13/v1/sn13_validator";
import * as grpc from "@grpc/grpc-js";
import { BaseClient, BaseClientOptions } from "../BaseClient";

// re-export the types for use in the package
export type {
  ListTopicsRequest,
  ListTopicsResponse,
  ListTopicsResponseDetail,
  ValidateRedditTopicRequest,
  ValidateRedditTopicResponse,
};

/**
 * Client for interacting with the SN13 API
 * Provides SN13 service interface over gRPC
 */
export class Sn13Client extends BaseClient {
  private _grpcClient?: Sn13ServiceClient;

  constructor(options: BaseClientOptions, grpcClient?: Sn13ServiceClient) {
    super(options);

    this._grpcClient = grpcClient;
  }

  private createGrpcClient(): Sn13ServiceClient {
    if (this._grpcClient) return this._grpcClient;

    // Create gRPC credentials with API key
    const callCreds = grpc.credentials.createFromMetadataGenerator(
      (_params, callback) => {
        const meta = new grpc.Metadata();
        meta.add("authorization", `Bearer ${this.getApiKey()}`);
        meta.add("x-source", this.getAppName());
        meta.add("x-client-id", this.getClientName());
        meta.add("x-client-version", this.getClientVersion());
        meta.add("x-forwarded-user", this.getUserId());
        callback(null, meta);
      },
    );

    // Create credentials based on secure option
    let credentials: grpc.ChannelCredentials;
    if (this.isSecure()) {
      // Use secure credentials for production
      const channelCreds = grpc.credentials.createSsl();
      credentials = grpc.credentials.combineChannelCredentials(
        channelCreds,
        callCreds,
      );
    } else {
      // For insecure connections, create insecure channel credentials
      credentials = grpc.credentials.createInsecure();
    }

    // Create gRPC client
    return new Sn13ServiceClient(this.getBaseURL(), credentials);
  }

  /**
   * List topics from a source
   */
  listTopics = async (
    params: ListTopicsRequest,
  ): Promise<ListTopicsResponse> => {
    const client = this.createGrpcClient();
    return new Promise<ListTopicsResponse>((resolve, reject) => {
      client.listTopics(params, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  };

  /**
   * Validate a Reddit topic
   */
  validateRedditTopic = async (
    params: ValidateRedditTopicRequest,
  ): Promise<ValidateRedditTopicResponse> => {
    const client = this.createGrpcClient();
    return new Promise<ValidateRedditTopicResponse>((resolve, reject) => {
      client.validateRedditTopic(params, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  };
}
