import * as grpc from "@grpc/grpc-js";
import {
  GravityServiceClient,
  GetGravityTasksRequest,
  GetGravityTasksResponse,
  GetCrawlerRequest,
  GetCrawlerResponse,
  CreateGravityTaskRequest as GeneratedCreateGravityTaskRequest,
  CreateGravityTaskResponse,
  BuildDatasetRequest as GeneratedBuildDatasetRequest,
  BuildDatasetResponse,
  GetDatasetRequest,
  GetDatasetResponse,
  CancelGravityTaskRequest,
  CancelGravityTaskResponse,
  CancelDatasetRequest,
  CancelDatasetResponse,
} from "../../generated/gravity/v1/gravity";
import { BaseClient, BaseClientOptions } from "../BaseClient";
import { MarkFieldsOptional } from "../util.types";

// re-work some generated fields to be optional -
// the generated types are stricter than they need to be.

type CreateGravityTaskRequest = MarkFieldsOptional<
  GeneratedCreateGravityTaskRequest,
  "notificationRequests"
>;

type BuildDatasetRequest = MarkFieldsOptional<
  GeneratedBuildDatasetRequest,
  "notificationRequests"
>;
// re-export the types for use in the package
export type {
  GetGravityTasksRequest,
  GetGravityTasksResponse,
  GetCrawlerRequest,
  GetCrawlerResponse,
  CreateGravityTaskRequest,
  CreateGravityTaskResponse,
  BuildDatasetRequest,
  BuildDatasetResponse,
  GetDatasetRequest,
  GetDatasetResponse,
  CancelGravityTaskRequest,
  CancelGravityTaskResponse,
  CancelDatasetRequest,
  CancelDatasetResponse,
};

/**
 * Client for interacting with the Gravity API
 * Provides gRPC interface for data collection and dataset management
 */
export class GravityClient extends BaseClient {
  private _grpcClient?: GravityServiceClient;

  constructor(options: BaseClientOptions, grpcClient?: GravityServiceClient) {
    super(options);
    this._grpcClient = grpcClient;
  }

  private createGrpcClient(): GravityServiceClient {
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
    return new GravityServiceClient(this.getBaseURL(), credentials);
  }

  /**
   * Lists all data collection tasks for a user
   */
  getGravityTasks = async (
    params: GetGravityTasksRequest,
  ): Promise<GetGravityTasksResponse> => {
    const client = this.createGrpcClient();
    return new Promise<GetGravityTasksResponse>((resolve, reject) => {
      client.getGravityTasks(params, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  };

  /**
   * Get a single crawler by its ID
   */
  getCrawler = async (
    params: GetCrawlerRequest,
  ): Promise<GetCrawlerResponse> => {
    const client = this.createGrpcClient();
    return new Promise<GetCrawlerResponse>((resolve, reject) => {
      client.getCrawler(params, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  };

  /**
   * Create a new gravity task
   */
  createGravityTask = async (
    params: CreateGravityTaskRequest,
  ): Promise<CreateGravityTaskResponse> => {
    const client = this.createGrpcClient();
    return new Promise<CreateGravityTaskResponse>((resolve, reject) => {
      client.createGravityTask(
        params as GeneratedCreateGravityTaskRequest,
        (error, response) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(response);
        },
      );
    });
  };

  /**
   * Build a dataset for a single crawler
   */
  buildDataset = async (
    params: BuildDatasetRequest,
  ): Promise<BuildDatasetResponse> => {
    const client = this.createGrpcClient();
    return new Promise<BuildDatasetResponse>((resolve, reject) => {
      client.buildDataset(
        params as GeneratedBuildDatasetRequest,
        (error, response) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(response);
        },
      );
    });
  };

  /**
   * Get the dataset build status and results
   */
  getDataset = async (
    params: GetDatasetRequest,
  ): Promise<GetDatasetResponse> => {
    const client = this.createGrpcClient();
    return new Promise<GetDatasetResponse>((resolve, reject) => {
      client.getDataset(params, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  };

  /**
   * Cancel a gravity task and any crawlers associated with it
   */
  cancelGravityTask = async (
    params: CancelGravityTaskRequest,
  ): Promise<CancelGravityTaskResponse> => {
    const client = this.createGrpcClient();
    return new Promise<CancelGravityTaskResponse>((resolve, reject) => {
      client.cancelGravityTask(params, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  };

  /**
   * Cancel dataset build if it is in progress and purges the dataset
   */
  cancelDataset = async (
    params: CancelDatasetRequest,
  ): Promise<CancelDatasetResponse> => {
    const client = this.createGrpcClient();
    return new Promise<CancelDatasetResponse>((resolve, reject) => {
      client.cancelDataset(params, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  };
}
