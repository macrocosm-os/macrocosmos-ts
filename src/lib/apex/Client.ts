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
  GetChatSessionsResponse,
  SearchChatIdsByPromptAndCompletionTextRequest,
  SearchChatIdsByPromptAndCompletionTextResponse,
  CreateChatAndCompletionRequest,
  CreateChatAndCompletionResponse,
  CreateCompletionRequest,
  CreateCompletionResponse,
  DeleteChatsRequest,
  DeleteChatsResponse,
  DeleteCompletionsRequest,
  DeleteCompletionsResponse,
  UpdateChatAttributesRequest,
  UpdateChatAttributesResponse,
  UpdateCompletionAttributesRequest,
  UpdateCompletionAttributesResponse,
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
  ChatCompletionChunkResponse,
  WebRetrievalRequest,
  WebRetrievalResponse,
  ChatCompletionRequest,
  ChatMessage,
  SubmitDeepResearcherJobResponse,
  GetDeepResearcherJobRequest,
  GetDeepResearcherJobResponse,
  GetStoredChatCompletionsRequest,
  GetStoredChatCompletionsResponse,
  GetChatSessionsResponse,
};

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
export interface ChatCompletionsCreate {
  (
    params: ChatCompletionRequest & { stream: true },
    /** options are not used, but are accepted for compatibility with the OpenAI API */
    _options?: unknown,
  ): Promise<ApexStream<ChatCompletionChunkResponse>>;
  (
    params: ChatCompletionRequest & { stream?: false | undefined },
    /** options are not used, but are accepted for compatibility with the OpenAI API */
    _options?: unknown,
  ): Promise<ChatCompletionResponse>;
}

function chatCompletionsCreate(
  this: ApexClient,
  params: ChatCompletionRequest & { stream: true },
  /** options are not used, but are accepted for compatibility with the OpenAI API */
  _options?: unknown,
): Promise<ApexStream<ChatCompletionChunkResponse>>;
function chatCompletionsCreate(
  this: ApexClient,
  params: ChatCompletionRequest & { stream?: false | undefined },
  _options?: unknown,
): Promise<ChatCompletionResponse>;
function chatCompletionsCreate(
  this: ApexClient,
  params: ChatCompletionRequest,
  _options?: unknown,
): Promise<ApexStream<ChatCompletionChunkResponse> | ChatCompletionResponse> {
  const client = this.createGrpcClient();
  const requestParams = {
    ...params,
    uids: params.uids ?? [],
    timeout: params.timeout || this.getDefaultTimeout(),
  };
  if (requestParams.stream) {
    const stream = client.chatCompletionStream(requestParams);
    const controller = new AbortController();
    return Promise.resolve(
      ApexStream.fromGrpcStream<ChatCompletionChunkResponse>(
        stream,
        controller,
      ),
    );
  } else {
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

  protected createGrpcClient(): ApexServiceClient {
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
  protected getDefaultTimeout(): number {
    return this.defaultTimeout;
  }

  /**
   * OpenAI-compatible chat completions API
   */
  chat = {
    completions: {
      create: chatCompletionsCreate.bind(this) as ChatCompletionsCreate,
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
   * Submit a deep researcher job with proper defaults
   */
  submitDeepResearcherJob = async (
    params: ChatCompletionRequest,
  ): Promise<SubmitDeepResearcherJobResponse> => {
    const client = this.createGrpcClient();
    const request: GeneratedChatCompletionRequest = {
      ...params,
      uids: params.uids ?? [],
      // Required internal fields for Deep Researcher
      task: "InferenceTask",
      mixture: false,
      inferenceMode: "Chain-of-Thought",
      stream: true,
    };

    return new Promise<SubmitDeepResearcherJobResponse>((resolve, reject) => {
      client.submitDeepResearcherJob(request, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  };

  /**
   * Get the status and results of a deep research job
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

  /**
   * Get the user's stored chats
   */
  getChatSessions = async (): Promise<GetChatSessionsResponse> => {
    const client = this.createGrpcClient();

    return new Promise<GetChatSessionsResponse>((resolve, reject) => {
      client.getChatSessions(
        {},
        (
          error: grpc.ServiceError | null,
          response: GetChatSessionsResponse,
        ) => {
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
   * Search a user's prompt and completion text and return associated chat ids
   */
  searchChatIdsByPromptAndCompletionText = async (
    params: SearchChatIdsByPromptAndCompletionTextRequest,
  ): Promise<SearchChatIdsByPromptAndCompletionTextResponse> => {
    const client = this.createGrpcClient();

    return new Promise<SearchChatIdsByPromptAndCompletionTextResponse>(
      (resolve, reject) => {
        client.searchChatIdsByPromptAndCompletionText(
          params,
          (
            error: grpc.ServiceError | null,
            response: SearchChatIdsByPromptAndCompletionTextResponse,
          ) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(response);
          },
        );
      },
    );
  };

  /**
   * Create a chat and completion for a user
   */
  createChatAndCompletion = async (
    params: CreateChatAndCompletionRequest,
  ): Promise<CreateChatAndCompletionResponse> => {
    const client = this.createGrpcClient();

    return new Promise<CreateChatAndCompletionResponse>((resolve, reject) => {
      client.createChatAndCompletion(
        params,
        (
          error: grpc.ServiceError | null,
          response: CreateChatAndCompletionResponse,
        ) => {
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
   * Create completion for a chat
   */
  createCompletion = async (
    params: CreateCompletionRequest,
  ): Promise<CreateCompletionResponse> => {
    const client = this.createGrpcClient();

    return new Promise<CreateCompletionResponse>((resolve, reject) => {
      client.createCompletion(
        params,
        (
          error: grpc.ServiceError | null,
          response: CreateCompletionResponse,
        ) => {
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
   * Delete a chat given its id
   */
  deleteChats = async (
    params: DeleteChatsRequest,
  ): Promise<DeleteChatsResponse> => {
    const client = this.createGrpcClient();

    return new Promise<DeleteChatsResponse>((resolve, reject) => {
      client.deleteChats(
        params,
        (error: grpc.ServiceError | null, response: DeleteChatsResponse) => {
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
   * Delete completions given their id
   */
  deleteCompletions = async (
    params: DeleteCompletionsRequest,
  ): Promise<DeleteCompletionsResponse> => {
    const client = this.createGrpcClient();

    return new Promise<DeleteCompletionsResponse>((resolve, reject) => {
      client.deleteCompletions(
        params,
        (
          error: grpc.ServiceError | null,
          response: DeleteCompletionsResponse,
        ) => {
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
   * Update chat attributes
   */
  updateChatAttributes = async (
    params: UpdateChatAttributesRequest,
  ): Promise<UpdateChatAttributesResponse> => {
    const client = this.createGrpcClient();

    return new Promise<UpdateChatAttributesResponse>((resolve, reject) => {
      client.updateChatAttributes(
        params,
        (
          error: grpc.ServiceError | null,
          response: UpdateChatAttributesResponse,
        ) => {
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
   * Update completion attributes
   */
  updateCompletionAttributes = async (
    params: UpdateCompletionAttributesRequest,
  ): Promise<UpdateCompletionAttributesResponse> => {
    const client = this.createGrpcClient();

    return new Promise<UpdateCompletionAttributesResponse>(
      (resolve, reject) => {
        client.updateCompletionAttributes(
          params,
          (
            error: grpc.ServiceError | null,
            response: UpdateCompletionAttributesResponse,
          ) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(response);
          },
        );
      },
    );
  };
}
