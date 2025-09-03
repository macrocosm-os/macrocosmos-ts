import {
  Sn13ServiceClient,
  ListTopicsRequest,
  ListTopicsResponse,
  ListTopicsResponseDetail,
  ValidateRedditTopicRequest,
  ValidateRedditTopicResponse,
  OnDemandDataRequest,
  OnDemandDataResponse,
} from "../../generated/sn13/v1/sn13_validator";
import { BaseClient, BaseClientOptions } from "../BaseClient";

// re-export the types for use in the package
export type {
  ListTopicsRequest,
  ListTopicsResponse,
  ListTopicsResponseDetail,
  ValidateRedditTopicRequest,
  ValidateRedditTopicResponse,
  OnDemandDataRequest,
  OnDemandDataResponse,
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

    // Create gRPC client with proper credentials
    return new Sn13ServiceClient(
      this.getBaseURL(),
      this.createChannelCredentials(),
    );
  }

  /**
   * List topics from a source
   */
  listTopics = (params: ListTopicsRequest): Promise<ListTopicsResponse> => {
    const client = this.createGrpcClient();

    if (this.isSecure()) {
      return new Promise<ListTopicsResponse>((resolve, reject) => {
        client.listTopics(params, (error, response) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(response);
        });
      });
    }

    const metadata = this.createAuthMetadata();
    return new Promise<ListTopicsResponse>((resolve, reject) => {
      client.listTopics(params, metadata, (error, response) => {
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
  validateRedditTopic = (
    params: ValidateRedditTopicRequest,
  ): Promise<ValidateRedditTopicResponse> => {
    const client = this.createGrpcClient();

    if (this.isSecure()) {
      return new Promise<ValidateRedditTopicResponse>((resolve, reject) => {
        client.validateRedditTopic(params, (error, response) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(response);
        });
      });
    }

    const metadata = this.createAuthMetadata();
    return new Promise<ValidateRedditTopicResponse>((resolve, reject) => {
      client.validateRedditTopic(params, metadata, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  };

  /**
   * Retrieve on-demand data from the SN13 API service
   */
  onDemandData = (
    params: OnDemandDataRequest,
  ): Promise<OnDemandDataResponse> => {
    const client = this.createGrpcClient();

    if (this.isSecure()) {
      return new Promise<OnDemandDataResponse>((resolve, reject) => {
        client.onDemandData(params, (error, response) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(response);
        });
      });
    }

    const metadata = this.createAuthMetadata();
    return new Promise<OnDemandDataResponse>((resolve, reject) => {
      client.onDemandData(params, metadata, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  };
}
