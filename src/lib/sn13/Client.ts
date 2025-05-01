import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import * as path from "path";
import {
  IListTopicsRequest,
  IListTopicsResponse,
  IListTopicsResponseDetail,
  IValidateRedditTopicRequest,
  IValidateRedditTopicResponse,
  ISn13ServiceClient,
} from "../../generated/sn13/v1/sn13_validator";
import { CLIENT_NAME, VERSION, BASE_URL, APEX_API_KEY } from "../../constants";

// Client options
interface Sn13ClientOptions {
  apiKey?: string;
  baseURL?: string;
  appName?: string;
  timeout?: number;
  secure?: boolean;
}

// Re-export the interfaces from the proto for easier use
export type ListTopicsRequest = IListTopicsRequest;
export type ListTopicsResponse = IListTopicsResponse;
export type ListTopicsResponseDetail = IListTopicsResponseDetail;
export type ValidateRedditTopicRequest = IValidateRedditTopicRequest;
export type ValidateRedditTopicResponse = IValidateRedditTopicResponse;

interface Sn13Service
  extends grpc.ServiceClientConstructor,
    ISn13ServiceClient {}

export interface Sn13ProtoClient {
  Sn13Service: {
    new (address: string, credentials: grpc.ChannelCredentials): Sn13Service;
  };
}

/**
 * Client for interacting with the SN13 API
 * Provides SN13 service interface over gRPC
 */
export class Sn13Client {
  public apiKey: string;
  private baseURL: string;
  private appName: string;
  private protoClient: Sn13ProtoClient;
  private defaultTimeout: number;
  private secure: boolean;

  constructor(options: Sn13ClientOptions) {
    this.apiKey = options.apiKey || APEX_API_KEY || "";
    this.baseURL = options.baseURL || BASE_URL;
    this.appName = options.appName || "unknown";
    this.defaultTimeout = options.timeout || 60;

    // Check environment variable for HTTPS setting
    const useHttps = process.env.MACROCOSMOS_USE_HTTPS !== "false";

    // Use secure if explicitly set in options or if HTTPS is enabled via env var
    this.secure = options.secure !== undefined ? options.secure : useHttps;

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
      "../../../protos/sn13/v1/sn13_validator.proto",
    );

    // Load protos using standard protobuf loader
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    // Get the Sn13Service definition
    const protoDescriptor = grpc.loadPackageDefinition(
      packageDefinition,
    ) as unknown as {
      sn13: {
        v1: Sn13ProtoClient;
      };
    };

    return protoDescriptor.sn13.v1;
  }

  private createGrpcClient(): Sn13Service {
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

    // Create credentials based on secure option
    let credentials: grpc.ChannelCredentials;
    if (this.secure) {
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
    return new this.protoClient.Sn13Service(this.baseURL, credentials);
  }

  /**
   * List topics from a source
   */
  listTopics = async (
    params: ListTopicsRequest,
  ): Promise<ListTopicsResponse> => {
    const client = this.createGrpcClient();

    return new Promise<ListTopicsResponse>((resolve, reject) => {
      void client.ListTopics(
        params,
        (error: Error | null, response: ListTopicsResponse) => {
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
   * Validate a Reddit topic
   */
  validateRedditTopic = async (
    params: ValidateRedditTopicRequest,
  ): Promise<ValidateRedditTopicResponse> => {
    const client = this.createGrpcClient();

    return new Promise<ValidateRedditTopicResponse>((resolve, reject) => {
      void client.ValidateRedditTopic(
        params,
        (error: Error | null, response: ValidateRedditTopicResponse) => {
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