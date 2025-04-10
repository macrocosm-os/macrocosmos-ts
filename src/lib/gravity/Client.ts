import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import * as path from "path";
import {
  IGetGravityTasksRequest,
  IGetGravityTasksResponse,
  IGetCrawlerRequest,
  IGetCrawlerResponse,
  ICreateGravityTaskRequest,
  ICreateGravityTaskResponse,
  IBuildDatasetRequest,
  IBuildDatasetResponse,
  IGetDatasetRequest,
  IGetDatasetResponse,
  ICancelGravityTaskRequest,
  ICancelGravityTaskResponse,
  ICancelDatasetRequest,
  ICancelDatasetResponse,
  IGravityTask,
  ICrawler,
  IDataset,
} from "../../generated/gravity/v1/gravity";
import {
  CLIENT_NAME,
  VERSION,
  BASE_URL,
  GRAVITY_API_KEY,
} from "../../constants";

// Client options
interface GravityClientOptions {
  apiKey?: string;
  baseURL?: string;
  appName?: string;
}

// Re-export the interfaces from the proto for easier use
export type GravityTask = IGravityTask;
export type Crawler = ICrawler;
export type Dataset = IDataset;

/**
 * Client for interacting with the Gravity API
 * Provides gRPC interface for data collection and dataset management
 */
export class GravityClient {
  public apiKey: string;
  private baseURL: string;
  private appName: string;
  private protoClient: any;

  constructor(options: GravityClientOptions) {
    this.apiKey = options.apiKey || GRAVITY_API_KEY || "";
    this.baseURL = options.baseURL || BASE_URL;
    this.appName = options.appName || "unknown";

    // Initialize gRPC client
    this.protoClient = this.initializeGrpcClient();

    // Check if the API key is valid
    if (!this.apiKey) {
      throw new Error("API key is required");
    }
  }

  private initializeGrpcClient() {
    // Load proto file directly
    const PROTO_PATH = path.resolve(
      __dirname,
      "../../../protos/gravity/v1/gravity.proto",
    );

    // Load protos using standard protobuf loader
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    // Get the GravityService definition
    const protoDescriptor = grpc.loadPackageDefinition(
      packageDefinition,
    ) as any;
    return protoDescriptor.gravity.v1;
  }

  private createGrpcClient() {
    // Create gRPC credentials with API key
    const callCreds = grpc.credentials.createFromMetadataGenerator(
      (_params, callback) => {
        const meta = new grpc.Metadata();
        meta.add("authorization", `Bearer ${this.apiKey}`);
        meta.add("x-source", this.appName);
        meta.add("x-client-id", CLIENT_NAME);
        meta.add("x-client-version", VERSION);
        callback(null, meta);
      },
    );

    // Create secure credentials
    const channelCreds = grpc.credentials.createSsl();
    const combinedCreds = grpc.credentials.combineChannelCredentials(
      channelCreds,
      callCreds,
    );

    // Create gRPC client
    return new this.protoClient.GravityService(this.baseURL, combinedCreds);
  }

  /**
   * Lists all data collection tasks for a user
   */
  getGravityTasks = async (
    params: IGetGravityTasksRequest,
  ): Promise<IGetGravityTasksResponse> => {
    const client = this.createGrpcClient();

    return new Promise<IGetGravityTasksResponse>((resolve, reject) => {
      client.GetGravityTasks(
        params,
        (error: Error | null, response: IGetGravityTasksResponse) => {
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
   * Get a single crawler by its ID
   */
  getCrawler = async (
    params: IGetCrawlerRequest,
  ): Promise<IGetCrawlerResponse> => {
    const client = this.createGrpcClient();

    return new Promise<IGetCrawlerResponse>((resolve, reject) => {
      client.GetCrawler(
        params,
        (error: Error | null, response: IGetCrawlerResponse) => {
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
   * Create a new gravity task
   */
  createGravityTask = async (
    params: ICreateGravityTaskRequest,
  ): Promise<ICreateGravityTaskResponse> => {
    const client = this.createGrpcClient();

    return new Promise<ICreateGravityTaskResponse>((resolve, reject) => {
      client.CreateGravityTask(
        params,
        (error: Error | null, response: ICreateGravityTaskResponse) => {
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
    params: IBuildDatasetRequest,
  ): Promise<IBuildDatasetResponse> => {
    const client = this.createGrpcClient();

    return new Promise<IBuildDatasetResponse>((resolve, reject) => {
      client.BuildDataset(
        params,
        (error: Error | null, response: IBuildDatasetResponse) => {
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
    params: IGetDatasetRequest,
  ): Promise<IGetDatasetResponse> => {
    const client = this.createGrpcClient();

    return new Promise<IGetDatasetResponse>((resolve, reject) => {
      client.GetDataset(
        params,
        (error: Error | null, response: IGetDatasetResponse) => {
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
   * Cancel a gravity task and any crawlers associated with it
   */
  cancelGravityTask = async (
    params: ICancelGravityTaskRequest,
  ): Promise<ICancelGravityTaskResponse> => {
    const client = this.createGrpcClient();

    return new Promise<ICancelGravityTaskResponse>((resolve, reject) => {
      client.CancelGravityTask(
        params,
        (error: Error | null, response: ICancelGravityTaskResponse) => {
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
   * Cancel dataset build if it is in progress and purges the dataset
   */
  cancelDataset = async (
    params: ICancelDatasetRequest,
  ): Promise<ICancelDatasetResponse> => {
    const client = this.createGrpcClient();

    return new Promise<ICancelDatasetResponse>((resolve, reject) => {
      client.CancelDataset(
        params,
        (error: Error | null, response: ICancelDatasetResponse) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(response);
        },
      );
    });
  };
}
