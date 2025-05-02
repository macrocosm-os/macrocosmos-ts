import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import * as path from "path";
import {
  IChatCompletionRequest,
  IChatMessage,
  ISamplingParameters,
  IChatCompletionResponse,
  IChatCompletionChunkResponse,
  IWebRetrievalRequest,
  IWebRetrievalResponse,
  IApexServiceClient,
} from "../../generated/apex/v1/apex";
import { BaseClient, BaseClientOptions } from "../BaseClient";
import { ApexStream } from "./Stream";

// Client options
interface ApexClientOptions extends BaseClientOptions {
  timeout?: number;
}

// Re-export the interfaces from the proto for easier use
export type ChatMessage = IChatMessage;
export type SamplingParameters = ISamplingParameters;
export type ChatCompletionRequest = IChatCompletionRequest;
export type ChatCompletionResponse = IChatCompletionResponse;
export type ChatCompletionChunkResponse = IChatCompletionChunkResponse;
export type WebRetrievalRequest = IWebRetrievalRequest;
export type WebRetrievalResponse = IWebRetrievalResponse;

interface ApexService
  extends grpc.ServiceClientConstructor,
    IApexServiceClient {}

export interface ApexProtoClient {
  ApexService: {
    new (address: string, credentials: grpc.ChannelCredentials): ApexService;
  };
}

/**
 * Client for interacting with the Apex API
 * Provides OpenAI-compatible interface over gRPC
 */
export class ApexClient extends BaseClient {
  private protoClient: ApexProtoClient;
  private defaultTimeout: number;

  constructor(options: ApexClientOptions) {
    super(options);
    this.defaultTimeout = options.timeout || 60;
    this.protoClient = this.initializeGrpcClient();
  }

  private initializeGrpcClient() {
    // Load proto file directly
    const PROTO_PATH = path.resolve(
      __dirname,
      "../../../protos/apex/v1/apex.proto",
    );

    // Load protos using standard protobuf loader
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    // Get the ApexService definition
    const protoDescriptor = grpc.loadPackageDefinition(
      packageDefinition,
    ) as unknown as {
      apex: {
        v1: ApexProtoClient;
      };
    };

    return protoDescriptor.apex.v1;
  }

  private createGrpcClient(): ApexService {
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
    return new this.protoClient.ApexService(this.getBaseURL(), credentials);
  }

  /**
   * Get the default timeout for chat completions
   */
  private getDefaultTimeout(): number {
    return this.defaultTimeout;
  }

  /**
   * OpenAI-compatible chat completions API
   */
  chat = {
    completions: {
      create: async (
        params: ChatCompletionRequest,
        _options?: unknown,
      ): Promise<
        ChatCompletionResponse | ApexStream<ChatCompletionChunkResponse>
      > => {
        const client = this.createGrpcClient();

        // Apply default timeout if not specified in params
        const requestParams = {
          ...params,
          timeout: params.timeout || this.getDefaultTimeout(),
        };

        // Handle streaming vs non-streaming
        if (requestParams.stream) {
          // Create a streaming call
          const stream = (await client.ChatCompletionStream(
            requestParams,
          )) as unknown as {
            on: (event: string, listener: (...args: unknown[]) => void) => void;
            cancel: () => void;
            removeAllListeners: (event: string) => void;
          };

          // Create controller for abort capability
          const controller = new AbortController();

          // Return a Stream object that wraps the gRPC stream
          return ApexStream.fromGrpcStream<ChatCompletionChunkResponse>(
            stream,
            controller,
          );
        } else {
          // For non-streaming, return a promise that resolves with the completion
          return new Promise<ChatCompletionResponse>((resolve, reject) => {
            void client.ChatCompletion(
              requestParams,
              (error: Error | null, response: ChatCompletionResponse) => {
                if (error) {
                  reject(error);
                  return;
                }

                resolve(response);
              },
            );
          });
        }
      },
    },
  };

  /**
   * Web retrieval API for searching the internet
   */
  webRetrieval = async (
    params: WebRetrievalRequest,
  ): Promise<WebRetrievalResponse> => {
    const client = this.createGrpcClient();

    return new Promise<WebRetrievalResponse>((resolve, reject) => {
      void client.WebRetrieval(
        params,
        (error: Error | null, response: WebRetrievalResponse) => {
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
