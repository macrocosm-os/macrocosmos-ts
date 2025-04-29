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
import { CLIENT_NAME, VERSION, BASE_URL, APEX_API_KEY } from "../../constants";
import { ApexStream } from "./Stream";

// Client options
interface ApexClientOptions {
  apiKey?: string;
  baseURL?: string;
  appName?: string;
  timeout?: number;
  secure?: boolean;
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
export class ApexClient {
  public apiKey: string;
  private baseURL: string;
  private appName: string;
  private protoClient: ApexProtoClient;
  private defaultTimeout: number;
  private secure: boolean;

  constructor(options: ApexClientOptions) {
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
    return new this.protoClient.ApexService(this.baseURL, credentials);
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
          timeout: params.timeout || this.defaultTimeout,
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
