import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import { 
  IChatCompletionRequest,
  IChatMessage, 
  ISamplingParameters,
  IChatCompletionResponse,
  IChatCompletionChunkResponse,
  IWebRetrievalRequest,
  IWebRetrievalResponse
} from '../../generated/apex/v1/apex';
import { CLIENT_NAME, VERSION, BASE_URL, APEX_API_KEY } from '../../constants';
import { ApexStream } from './Stream';

// Client options
interface ApexClientOptions {
  apiKey?: string;
  baseURL?: string;
  appName?: string;
}

// Re-export the interfaces from the proto for easier use
export type ChatMessage = IChatMessage;
export type SamplingParameters = ISamplingParameters;
export type ChatCompletionRequest = IChatCompletionRequest;
export type ChatCompletionResponse = IChatCompletionResponse;
export type ChatCompletionChunkResponse = IChatCompletionChunkResponse;
export type WebRetrievalRequest = IWebRetrievalRequest;
export type WebRetrievalResponse = IWebRetrievalResponse;

/**
 * Client for interacting with the Apex API
 * Provides OpenAI-compatible interface over gRPC
 */
export class ApexClient {
  public apiKey: string;
  private baseURL: string;
  private appName: string;
  private protoClient: any;

  constructor(options: ApexClientOptions) {
    this.apiKey = options.apiKey || APEX_API_KEY || '';
    this.baseURL = options.baseURL || BASE_URL;
    this.appName = options.appName || 'unknown';
    
    // Initialize gRPC client
    this.protoClient = this.initializeGrpcClient();

    // Check if the API key is valid
    if (!this.apiKey) {
      throw new Error('API key is required');
    }
  }

  private initializeGrpcClient() {
    // Load proto file directly
    const PROTO_PATH = path.resolve(__dirname, '../../../protos/apex/v1/apex.proto');
    
    // Load protos using standard protobuf loader
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });
    
    // Get the ApexService definition
    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
    return protoDescriptor.apex.v1;
  }

  private createGrpcClient() {
    // Create gRPC credentials with API key
    const callCreds = grpc.credentials.createFromMetadataGenerator((_params, callback) => {
      const meta = new grpc.Metadata();
      meta.add('authorization', `Bearer ${this.apiKey}`);
      meta.add('x-source', this.appName);
      meta.add('x-client-id', CLIENT_NAME);
      meta.add('x-client-version', VERSION);
      callback(null, meta);
    });

    // Create secure credentials
    const channelCreds = grpc.credentials.createSsl();
    const combinedCreds = grpc.credentials.combineChannelCredentials(channelCreds, callCreds);

    // Create gRPC client
    return new this.protoClient.ApexService(
      this.baseURL,
      combinedCreds
    );
  }

  /**
   * OpenAI-compatible chat completions API
   */
  chat = {
    completions: {
      create: async (params: ChatCompletionRequest, options?: any): Promise<ChatCompletionResponse | ApexStream<ChatCompletionChunkResponse>> => {
        const client = this.createGrpcClient();

        // Handle streaming vs non-streaming
        if (params.stream) {
          // Create a streaming call
          const stream = client.ChatCompletionStream(params);
          
          // Create controller for abort capability
          const controller = new AbortController();
          
          // Return a Stream object that wraps the gRPC stream
          return ApexStream.fromGrpcStream<ChatCompletionChunkResponse>(stream, controller);
        } else {
          // For non-streaming, return a promise that resolves with the completion
          return new Promise<ChatCompletionResponse>((resolve, reject) => {
            client.ChatCompletion(params, (error: Error | null, response: ChatCompletionResponse) => {
              if (error) {
                reject(error);
                return;
              }
              
              resolve(response);
            });
          });
        }
      }
    }
  };

  /**
   * Web retrieval API for searching the internet
   */
  webRetrieval = async (params: WebRetrievalRequest): Promise<WebRetrievalResponse> => {
    const client = this.createGrpcClient();
    
    return new Promise<WebRetrievalResponse>((resolve, reject) => {
      client.WebRetrieval(params, (error: Error | null, response: WebRetrievalResponse) => {
        if (error) {
          reject(error);
          return;
        }
        
        resolve(response);
      });
    });
  };
} 