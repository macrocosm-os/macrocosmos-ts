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
import { BaseClient, BaseClientOptions } from "../BaseClient";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Sn13ClientOptions extends BaseClientOptions {}

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
export class Sn13Client extends BaseClient {
  private protoClient: Sn13ProtoClient;

  constructor(options: Sn13ClientOptions) {
    super(options);
    this.protoClient = this.initializeGrpcClient();
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
    return new this.protoClient.Sn13Service(this.getBaseURL(), credentials);
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
