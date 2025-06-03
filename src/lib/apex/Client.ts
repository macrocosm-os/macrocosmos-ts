import {
  ApexServiceClient,
  ChatCompletionRequest as GeneratedChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunkResponse,
  WebRetrievalRequest as GeneratedWebRetrievalRequest,
  WebRetrievalResponse,
  ChatMessage,
  SubmitDeepResearcherJobResponse,
  GetDeepResearcherJobRequest,
  GetDeepResearcherJobResponse,
  GetStoredChatCompletionsRequest,
  GetStoredChatCompletionsResponse,
} from "../../generated/apex/v1/apex";
import * as grpc from "@grpc/grpc-js";
import { BaseClient, BaseClientOptions } from "../BaseClient";
import { ApexStream } from "./Stream";
import { MarkFieldsOptional } from "../util.types";

type ChatCompletionRequest = MarkFieldsOptional<
  GeneratedChatCompletionRequest,
  "uids"
>;

type WebRetrievalRequest = MarkFieldsOptional<
  GeneratedWebRetrievalRequest,
  "uids"
>;

// re-export the types for use in the package
export {
  ApexStream,
  WebRetrievalRequest,
  WebRetrievalResponse,
  ChatCompletionRequest,
  ChatMessage,
  SubmitDeepResearcherJobResponse,
  GetDeepResearcherJobRequest,
  GetDeepResearcherJobResponse,
  GetStoredChatCompletionsRequest,
  GetStoredChatCompletionsResponse,
};

// Client options
interface ApexClientOptions extends BaseClientOptions {
  timeout?: number;
}

interface ApexService
  extends grpc.ServiceClientConstructor,
    ApexServiceClient {}

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
  private _grpcClient?: ApexServiceClient;

  private defaultTimeout: number;

  constructor(options: ApexClientOptions, grpcClient?: ApexServiceClient) {
    super(options);
    this.defaultTimeout = options.timeout || 60;
    this._grpcClient = grpcClient;
  }

  private createGrpcClient(): ApexServiceClient {
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
    return new ApexServiceClient(this.getBaseURL(), credentials);
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
          uids: params.uids ?? [],
          timeout: params.timeout || this.getDefaultTimeout(),
        };

        // Handle streaming vs non-streaming
        if (requestParams.stream) {
          // Create a streaming call
          const stream = client.chatCompletionStream(requestParams);

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
            client.chatCompletion(requestParams, (error, response) => {
              if (error) {
                reject(error);
                return;
              }
              resolve(response);
            });
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
      client.webRetrieval(
        { ...params, uids: params.uids ?? [] },
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
   * Submit a deep researcher job
   */
  submitDeepResearcherJob = async (
    params: ChatCompletionRequest,
  ): Promise<SubmitDeepResearcherJobResponse> => {
    const client = this.createGrpcClient();

    return new Promise<SubmitDeepResearcherJobResponse>((resolve, reject) => {
      client.submitDeepResearcherJob(
        { ...params, uids: params.uids ?? [] },
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
   * Get a deep researcher job
   */
  getDeepResearcherJob = async (
    params: GetDeepResearcherJobRequest,
  ): Promise<GetDeepResearcherJobResponse> => {
    const client = this.createGrpcClient();

    return new Promise<GetDeepResearcherJobResponse>((resolve, reject) => {
      client.getDeepResearcherJob(params, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  };

  /**
   * Get completions of a chat
   */
  getStoredChatCompletions = async (
    params: GetStoredChatCompletionsRequest,
  ): Promise<GetStoredChatCompletionsResponse> => {
    const client = this.createGrpcClient();

    return new Promise<GetStoredChatCompletionsResponse>((resolve, reject) => {
      client.getStoredChatCompletions(params, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  };
}



