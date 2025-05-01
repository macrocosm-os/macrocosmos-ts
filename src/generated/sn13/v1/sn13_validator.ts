// Generated from sn13/v1/sn13_validator.proto

// TypeScript interfaces generated from protobuf definitions
export interface IListTopicsRequest {
  source?: string;
}

export interface IListTopicsResponseDetail {
  labelValue?: string;
  contentSizeBytes?: number;
  adjContentSizeBytes?: number;
}

export interface IListTopicsResponse {
  details?: IListTopicsResponseDetail[];
}

export interface IValidateRedditTopicRequest {
  topic?: string;
}

export interface IValidateRedditTopicResponse {
  platform?: string;
  topic?: string;
  exists?: boolean;
  over18?: boolean;
  quarantine?: boolean;
}

export interface ISn13ServiceClient {
  ListTopics(request: IListTopicsRequest): Promise<IListTopicsResponse>;
  ListTopics(
    request: IListTopicsRequest,
    callback: (error: Error | null, response: IListTopicsResponse) => void,
  ): void;
  ValidateRedditTopic(
    request: IValidateRedditTopicRequest,
  ): Promise<IValidateRedditTopicResponse>;
  ValidateRedditTopic(
    request: IValidateRedditTopicRequest,
    callback: (
      error: Error | null,
      response: IValidateRedditTopicResponse,
    ) => void,
  ): void;
}

// Original protobuf JSON schema
export const sn13_validator = {
  options: {
    syntax: "proto3",
  },
  nested: {
    sn13: {
      nested: {
        v1: {
          options: {
            go_package: "macrocosm-os/rift/constellation_api/gen/sn13/v1",
          },
          nested: {
            Sn13Service: {
              methods: {
                ListTopics: {
                  requestType: "ListTopicsRequest",
                  responseType: "ListTopicsResponse",
                },
                ValidateRedditTopic: {
                  requestType: "ValidateRedditTopicRequest",
                  responseType: "ValidateRedditTopicResponse",
                },
              },
            },
            ListTopicsRequest: {
              fields: {
                source: {
                  type: "string",
                  id: 1,
                },
              },
            },
            ListTopicsResponseDetail: {
              fields: {
                labelValue: {
                  type: "string",
                  id: 1,
                },
                contentSizeBytes: {
                  type: "uint64",
                  id: 2,
                },
                adjContentSizeBytes: {
                  type: "uint64",
                  id: 3,
                },
              },
            },
            ListTopicsResponse: {
              fields: {
                details: {
                  rule: "repeated",
                  type: "ListTopicsResponseDetail",
                  id: 1,
                },
              },
            },
            ValidateRedditTopicRequest: {
              fields: {
                topic: {
                  type: "string",
                  id: 1,
                },
              },
            },
            ValidateRedditTopicResponse: {
              fields: {
                platform: {
                  type: "string",
                  id: 1,
                },
                topic: {
                  type: "string",
                  id: 2,
                },
                exists: {
                  type: "bool",
                  id: 3,
                },
                over18: {
                  type: "bool",
                  id: 4,
                },
                quarantine: {
                  type: "bool",
                  id: 5,
                },
              },
            },
          },
        },
      },
    },
  },
};
