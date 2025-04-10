// Generated from apex/v1/apex.proto

// TypeScript interfaces generated from protobuf definitions
export interface IChatCompletionRequest {
  uids?: number[];
  messages?: IChatMessage[];
  seed?: number;
  task?: string;
  model?: string;
  testTimeInference?: boolean;
  mixture?: boolean;
  samplingParameters?: ISamplingParameters;
  inferenceMode?: string;
  jsonFormat?: boolean;
  stream?: boolean;
}

export interface ISamplingParameters {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxNewTokens?: number;
  doSample?: boolean;
}

export interface IChatCompletionResponse {
  id?: string;
  choices?: IChoice[];
  created?: number;
  model?: string;
  object?: string;
  serviceTier?: string;
  systemFingerprint?: string;
  usage?: ICompletionUsage;
}

export interface IChoice {
  finishReason?: string;
  index?: number;
  logprobs?: IChoiceLogprobs;
  message?: IChatCompletionMessage;
}

export interface IChatCompletionMessage {
  content?: string;
  refusal?: string;
  role?: string;
  annotations?: IAnnotation[];
  audio?: IChatCompletionAudio;
  functionCall?: IFunctionCall;
  toolCalls?: IChatCompletionMessageToolCall[];
}

export interface IAnnotation {
  content?: string;
  role?: string;
}

export interface IChatCompletionAudio {
  id?: string;
  data?: string;
  expiresAt?: number;
  transcript?: string;
}

export interface IFunctionCall {
  arguments?: string[];
  name?: string;
}

export interface IChatCompletionMessageToolCall {
  id?: string;
  function?: IFunction;
  type?: string;
}

export interface IFunction {
  arguments?: string[];
  name?: string;
}

export interface IChatCompletionChunkResponse {
  id?: string;
  choices?: IChunkChoice[];
  created?: number;
  model?: string;
  object?: string;
  serviceTier?: string;
  systemFingerprint?: string;
  usage?: ICompletionUsage;
}

export interface IChatMessage {
  role?: string;
  content?: string;
}

export interface IChunkChoice {
  delta?: IChoiceDelta;
  finishReason?: string;
  index?: number;
  logprobs?: IChoiceLogprobs;
}

export interface IChoiceLogprobs {
  content?: IChatCompletionTokenLogprob[];
  refusal?: IChatCompletionTokenLogprob[];
}

export interface IChoiceDelta {
  content?: string;
  functionCall?: IChoiceDeltaFunctionCall;
  refusal?: string;
  role?: string;
  toolCalls?: IChoiceDeltaToolCall[];
}

export interface IChoiceDeltaFunctionCall {
  arguments?: string[];
  name?: string;
}

export interface IChoiceDeltaToolCall {
  index?: number;
  id?: string;
  function?: IChoiceDeltaToolCallFunction;
  type?: string;
}

export interface IChoiceDeltaToolCallFunction {
  arguments?: string[];
  name?: string;
}

export interface IChatCompletionTokenLogprob {
  token?: string;
  bytes?: number[];
  logprob?: number;
  topLogprobs?: ITopLogprob[];
}

export interface ITopLogprob {
  token?: string;
  bytes?: number[];
  logprob?: number;
}

export interface ICompletionUsage {
  completionTokens?: number;
  promptTokens?: number;
  totalTokens?: number;
  completionTokensDetails?: ICompletionTokensDetails;
  promptTokensDetails?: IPromptTokensDetails;
}

export interface ICompletionTokensDetails {
  acceptedPredictionTokens?: number;
  audioTokens?: number;
  reasoningTokens?: number;
  rejectedPredictionTokens?: number;
}

export interface IPromptTokensDetails {
  audioTokens?: number;
  cachedTokens?: number;
}

export interface IWebRetrievalRequest {
  uids?: number[];
  searchQuery?: string;
  nMiners?: number;
  nResults?: number;
  maxResponseTime?: number;
}

export interface IWebSearchResult {
  url?: string;
  content?: string;
  relevant?: string;
}

export interface IWebRetrievalResponse {
  results?: IWebSearchResult[];
}

export interface IApexServiceClient {
  ChatCompletion(
    request: IChatCompletionRequest,
    callback: (error: Error | null, response: IChatCompletionResponse) => void,
  ): Promise<IChatCompletionResponse>;
  ChatCompletionStream(
    request: IChatCompletionRequest,
  ): Promise<AsyncIterable<IChatCompletionChunkResponse>>;
  WebRetrieval(
    request: IWebRetrievalRequest,
    callback: (error: Error | null, response: IWebRetrievalResponse) => void,
  ): Promise<IWebRetrievalResponse>;
}

// Original protobuf JSON schema
export const apex = {
  options: {
    syntax: "proto3",
  },
  nested: {
    apex: {
      nested: {
        v1: {
          options: {
            go_package: "macrocosm-os/rift/constellation_api/gen/apex/v1",
          },
          nested: {
            ApexService: {
              methods: {
                ChatCompletion: {
                  requestType: "ChatCompletionRequest",
                  responseType: "ChatCompletionResponse",
                },
                ChatCompletionStream: {
                  requestType: "ChatCompletionRequest",
                  responseType: "ChatCompletionChunkResponse",
                  responseStream: true,
                },
                WebRetrieval: {
                  requestType: "WebRetrievalRequest",
                  responseType: "WebRetrievalResponse",
                },
              },
            },
            ChatCompletionRequest: {
              fields: {
                uids: {
                  rule: "repeated",
                  type: "int64",
                  id: 1,
                },
                messages: {
                  rule: "repeated",
                  type: "ChatMessage",
                  id: 2,
                },
                seed: {
                  type: "int64",
                  id: 3,
                },
                task: {
                  type: "string",
                  id: 4,
                },
                model: {
                  type: "string",
                  id: 5,
                },
                testTimeInference: {
                  type: "bool",
                  id: 6,
                },
                mixture: {
                  type: "bool",
                  id: 7,
                },
                samplingParameters: {
                  type: "SamplingParameters",
                  id: 8,
                },
                inferenceMode: {
                  type: "string",
                  id: 9,
                },
                jsonFormat: {
                  type: "bool",
                  id: 10,
                },
                stream: {
                  type: "bool",
                  id: 11,
                },
              },
            },
            SamplingParameters: {
              fields: {
                temperature: {
                  type: "double",
                  id: 1,
                },
                topP: {
                  type: "double",
                  id: 2,
                },
                topK: {
                  type: "double",
                  id: 3,
                },
                maxNewTokens: {
                  type: "int64",
                  id: 4,
                },
                doSample: {
                  type: "bool",
                  id: 5,
                },
              },
            },
            ChatCompletionResponse: {
              fields: {
                id: {
                  type: "string",
                  id: 1,
                },
                choices: {
                  rule: "repeated",
                  type: "Choice",
                  id: 2,
                },
                created: {
                  type: "int64",
                  id: 3,
                },
                model: {
                  type: "string",
                  id: 4,
                },
                object: {
                  type: "string",
                  id: 5,
                },
                serviceTier: {
                  type: "string",
                  id: 6,
                },
                systemFingerprint: {
                  type: "string",
                  id: 7,
                },
                usage: {
                  type: "CompletionUsage",
                  id: 8,
                },
              },
            },
            Choice: {
              fields: {
                finishReason: {
                  type: "string",
                  id: 1,
                },
                index: {
                  type: "int64",
                  id: 2,
                },
                logprobs: {
                  type: "ChoiceLogprobs",
                  id: 3,
                },
                message: {
                  type: "ChatCompletionMessage",
                  id: 4,
                },
              },
            },
            ChatCompletionMessage: {
              fields: {
                content: {
                  type: "string",
                  id: 1,
                },
                refusal: {
                  type: "string",
                  id: 2,
                },
                role: {
                  type: "string",
                  id: 3,
                },
                annotations: {
                  rule: "repeated",
                  type: "Annotation",
                  id: 4,
                },
                audio: {
                  type: "ChatCompletionAudio",
                  id: 5,
                },
                functionCall: {
                  type: "FunctionCall",
                  id: 6,
                },
                toolCalls: {
                  rule: "repeated",
                  type: "ChatCompletionMessageToolCall",
                  id: 7,
                },
              },
            },
            Annotation: {
              fields: {
                content: {
                  type: "string",
                  id: 1,
                },
                role: {
                  type: "string",
                  id: 2,
                },
              },
            },
            ChatCompletionAudio: {
              fields: {
                id: {
                  type: "string",
                  id: 1,
                },
                data: {
                  type: "string",
                  id: 2,
                },
                expiresAt: {
                  type: "int64",
                  id: 3,
                },
                transcript: {
                  type: "string",
                  id: 4,
                },
              },
            },
            FunctionCall: {
              fields: {
                arguments: {
                  rule: "repeated",
                  type: "string",
                  id: 1,
                },
                name: {
                  type: "string",
                  id: 2,
                },
              },
            },
            ChatCompletionMessageToolCall: {
              fields: {
                id: {
                  type: "string",
                  id: 1,
                },
                function: {
                  type: "Function",
                  id: 2,
                },
                type: {
                  type: "string",
                  id: 3,
                },
              },
            },
            Function: {
              fields: {
                arguments: {
                  rule: "repeated",
                  type: "string",
                  id: 1,
                },
                name: {
                  type: "string",
                  id: 2,
                },
              },
            },
            ChatCompletionChunkResponse: {
              fields: {
                id: {
                  type: "string",
                  id: 1,
                },
                choices: {
                  rule: "repeated",
                  type: "ChunkChoice",
                  id: 2,
                },
                created: {
                  type: "int64",
                  id: 3,
                },
                model: {
                  type: "string",
                  id: 4,
                },
                object: {
                  type: "string",
                  id: 5,
                },
                serviceTier: {
                  type: "string",
                  id: 6,
                },
                systemFingerprint: {
                  type: "string",
                  id: 7,
                },
                usage: {
                  type: "CompletionUsage",
                  id: 8,
                },
              },
            },
            ChatMessage: {
              fields: {
                role: {
                  type: "string",
                  id: 1,
                },
                content: {
                  type: "string",
                  id: 2,
                },
              },
            },
            ChunkChoice: {
              fields: {
                delta: {
                  type: "ChoiceDelta",
                  id: 1,
                },
                finishReason: {
                  type: "string",
                  id: 2,
                },
                index: {
                  type: "int64",
                  id: 3,
                },
                logprobs: {
                  type: "ChoiceLogprobs",
                  id: 4,
                },
              },
            },
            ChoiceLogprobs: {
              fields: {
                content: {
                  rule: "repeated",
                  type: "ChatCompletionTokenLogprob",
                  id: 1,
                },
                refusal: {
                  rule: "repeated",
                  type: "ChatCompletionTokenLogprob",
                  id: 2,
                },
              },
            },
            ChoiceDelta: {
              fields: {
                content: {
                  type: "string",
                  id: 1,
                },
                functionCall: {
                  type: "ChoiceDeltaFunctionCall",
                  id: 2,
                },
                refusal: {
                  type: "string",
                  id: 3,
                },
                role: {
                  type: "string",
                  id: 4,
                },
                toolCalls: {
                  rule: "repeated",
                  type: "ChoiceDeltaToolCall",
                  id: 5,
                },
              },
            },
            ChoiceDeltaFunctionCall: {
              fields: {
                arguments: {
                  rule: "repeated",
                  type: "string",
                  id: 1,
                },
                name: {
                  type: "string",
                  id: 2,
                },
              },
            },
            ChoiceDeltaToolCall: {
              fields: {
                index: {
                  type: "int64",
                  id: 1,
                },
                id: {
                  type: "string",
                  id: 2,
                },
                function: {
                  type: "ChoiceDeltaToolCallFunction",
                  id: 3,
                },
                type: {
                  type: "string",
                  id: 4,
                },
              },
            },
            ChoiceDeltaToolCallFunction: {
              fields: {
                arguments: {
                  rule: "repeated",
                  type: "string",
                  id: 1,
                },
                name: {
                  type: "string",
                  id: 2,
                },
              },
            },
            ChatCompletionTokenLogprob: {
              fields: {
                token: {
                  type: "string",
                  id: 1,
                },
                bytes: {
                  rule: "repeated",
                  type: "int64",
                  id: 2,
                },
                logprob: {
                  type: "double",
                  id: 3,
                },
                topLogprobs: {
                  rule: "repeated",
                  type: "TopLogprob",
                  id: 4,
                },
              },
            },
            TopLogprob: {
              fields: {
                token: {
                  type: "string",
                  id: 1,
                },
                bytes: {
                  rule: "repeated",
                  type: "int64",
                  id: 2,
                },
                logprob: {
                  type: "double",
                  id: 3,
                },
              },
            },
            CompletionUsage: {
              fields: {
                completionTokens: {
                  type: "int64",
                  id: 1,
                },
                promptTokens: {
                  type: "int64",
                  id: 2,
                },
                totalTokens: {
                  type: "int64",
                  id: 3,
                },
                completionTokensDetails: {
                  type: "CompletionTokensDetails",
                  id: 4,
                },
                promptTokensDetails: {
                  type: "PromptTokensDetails",
                  id: 5,
                },
              },
            },
            CompletionTokensDetails: {
              fields: {
                acceptedPredictionTokens: {
                  type: "int64",
                  id: 1,
                },
                audioTokens: {
                  type: "int64",
                  id: 2,
                },
                reasoningTokens: {
                  type: "int64",
                  id: 3,
                },
                rejectedPredictionTokens: {
                  type: "int64",
                  id: 4,
                },
              },
            },
            PromptTokensDetails: {
              fields: {
                audioTokens: {
                  type: "int64",
                  id: 1,
                },
                cachedTokens: {
                  type: "int64",
                  id: 2,
                },
              },
            },
            WebRetrievalRequest: {
              fields: {
                uids: {
                  rule: "repeated",
                  type: "int64",
                  id: 1,
                },
                searchQuery: {
                  type: "string",
                  id: 2,
                },
                nMiners: {
                  type: "int64",
                  id: 3,
                },
                nResults: {
                  type: "int64",
                  id: 4,
                },
                maxResponseTime: {
                  type: "int64",
                  id: 5,
                },
              },
            },
            WebSearchResult: {
              fields: {
                url: {
                  type: "string",
                  id: 1,
                },
                content: {
                  type: "string",
                  id: 2,
                },
                relevant: {
                  type: "string",
                  id: 3,
                },
              },
            },
            WebRetrievalResponse: {
              fields: {
                results: {
                  rule: "repeated",
                  type: "WebSearchResult",
                  id: 1,
                },
              },
            },
          },
        },
      },
    },
  },
};
