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

export interface ISn13ServiceClient {
  ListTopics(request: IListTopicsRequest): Promise<IListTopicsResponse>;
  ListTopics(
    request: IListTopicsRequest,
    callback: (error: Error | null, response: IListTopicsResponse) => void,
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
          },
        },
      },
    },
  },
};
