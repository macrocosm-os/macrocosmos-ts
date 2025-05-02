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
  IGravityServiceClient,
} from "../../generated/gravity/v1/gravity";
import { BaseClient, BaseClientOptions } from "../BaseClient";

// Client options
interface GravityClientOptions extends BaseClientOptions {}

interface GravityService
  extends grpc.ServiceClientConstructor,
    IGravityServiceClient {}

export interface GravityProtoClient {
  GravityService: {
    new (address: string, credentials: grpc.ChannelCredentials): GravityService;
  };
}

/**
 * Client for interacting with the Gravity API
 * Provides gRPC interface for data collection and dataset management
 */
export class GravityClient extends BaseClient {
  private protoClient: GravityProtoClient;

  constructor(options: GravityClientOptions) {
    super(options);
    this.protoClient = this.initializeGrpcClient();
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
    ) as unknown as {
      gravity: {
        v1: GravityProtoClient;
      };
    };

    return protoDescriptor.gravity.v1;
  }

  private createGrpcClient(): GravityService {
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
    return new this.protoClient.GravityService(this.getBaseURL(), credentials);
  }

  /**
   * Lists all data collection tasks for a user
   */
  getGravityTasks = async (
    params: IGetGravityTasksRequest,
  ): Promise<IGetGravityTasksResponse> => {
    const client = this.createGrpcClient();

    return new Promise<IGetGravityTasksResponse>((resolve, reject) => {
      void client.GetGravityTasks(
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
      void client.GetCrawler(
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
      void client.CreateGravityTask(
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
      void client.BuildDataset(
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
      void client.GetDataset(
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
      void client.CancelGravityTask(
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
      void client.CancelDataset(
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
