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
  Crawler,
  CrawlerCriteria,
  CrawlerNotification,
  HfRepo,
  CrawlerState,
  GravityTaskState,
  NotificationRequest,
  Dataset,
  DatasetFile,
  DatasetStep,
  Nebula,
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
  Crawler,
  CrawlerCriteria,
  CrawlerNotification,
  HfRepo,
  CrawlerState,
  GravityTaskState,
  NotificationRequest,
  Dataset,
  DatasetFile,
  DatasetStep,
  Nebula,
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

    // Create gRPC client with proper credentials
    return new GravityServiceClient(
      this.getBaseURL(),
      this.createChannelCredentials(),
    );
  }

  /**
   * Lists all data collection tasks for a user
   */
  getGravityTasks = (
    params: GetGravityTasksRequest,
  ): Promise<GetGravityTasksResponse> => {
    const client = this.createGrpcClient();

    if (this.isSecure()) {
      return new Promise<GetGravityTasksResponse>((resolve, reject) => {
        client.getGravityTasks(params, (error, response) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(response);
        });
      });
    }

    const metadata = this.createAuthMetadata();
    return new Promise<GetGravityTasksResponse>((resolve, reject) => {
      client.getGravityTasks(params, metadata, (error, response) => {
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
  getCrawler = (params: GetCrawlerRequest): Promise<GetCrawlerResponse> => {
    const client = this.createGrpcClient();

    if (this.isSecure()) {
      return new Promise<GetCrawlerResponse>((resolve, reject) => {
        client.getCrawler(params, (error, response) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(response);
        });
      });
    }

    const metadata = this.createAuthMetadata();
    return new Promise<GetCrawlerResponse>((resolve, reject) => {
      client.getCrawler(params, metadata, (error, response) => {
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
  createGravityTask = (
    params: CreateGravityTaskRequest,
  ): Promise<CreateGravityTaskResponse> => {
    const client = this.createGrpcClient();

    if (this.isSecure()) {
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
    }

    const metadata = this.createAuthMetadata();
    return new Promise<CreateGravityTaskResponse>((resolve, reject) => {
      client.createGravityTask(
        params as GeneratedCreateGravityTaskRequest,
        metadata,
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
  buildDataset = (
    params: BuildDatasetRequest,
  ): Promise<BuildDatasetResponse> => {
    const client = this.createGrpcClient();

    if (this.isSecure()) {
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
    }

    const metadata = this.createAuthMetadata();
    return new Promise<BuildDatasetResponse>((resolve, reject) => {
      client.buildDataset(
        params as GeneratedBuildDatasetRequest,
        metadata,
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
  getDataset = (params: GetDatasetRequest): Promise<GetDatasetResponse> => {
    const client = this.createGrpcClient();

    if (this.isSecure()) {
      return new Promise<GetDatasetResponse>((resolve, reject) => {
        client.getDataset(params, (error, response) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(response);
        });
      });
    }

    const metadata = this.createAuthMetadata();
    return new Promise<GetDatasetResponse>((resolve, reject) => {
      client.getDataset(params, metadata, (error, response) => {
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
  cancelGravityTask = (
    params: CancelGravityTaskRequest,
  ): Promise<CancelGravityTaskResponse> => {
    const client = this.createGrpcClient();

    if (this.isSecure()) {
      return new Promise<CancelGravityTaskResponse>((resolve, reject) => {
        client.cancelGravityTask(params, (error, response) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(response);
        });
      });
    }

    const metadata = this.createAuthMetadata();
    return new Promise<CancelGravityTaskResponse>((resolve, reject) => {
      client.cancelGravityTask(params, metadata, (error, response) => {
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
  cancelDataset = (
    params: CancelDatasetRequest,
  ): Promise<CancelDatasetResponse> => {
    const client = this.createGrpcClient();

    if (this.isSecure()) {
      return new Promise<CancelDatasetResponse>((resolve, reject) => {
        client.cancelDataset(params, (error, response) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(response);
        });
      });
    }

    const metadata = this.createAuthMetadata();
    return new Promise<CancelDatasetResponse>((resolve, reject) => {
      client.cancelDataset(params, metadata, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  };
}
