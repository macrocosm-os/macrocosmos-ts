// Generated from billing/v1/billing.proto

// TypeScript interfaces generated from protobuf definitions
export interface IGetUsageRequest {
  productType?: string;
}

export interface IBillingRate {
  rateType?: string;
  unitSize?: number;
  unitType?: string;
  pricePerUnit?: number;
  currency?: string;
}

export interface IGetUsageResponse {
  availableCredits?: number;
  usedCredits?: number;
  remainingCredits?: number;
  billingRates?: IBillingRate[];
}

export interface IBillingServiceClient {
  GetUsage(request: IGetUsageRequest): Promise<IGetUsageResponse>;
  GetUsage(
    request: IGetUsageRequest,
    callback: (error: Error | null, response: IGetUsageResponse) => void,
  ): void;
}

// Original protobuf JSON schema
export const billing = {
  options: {
    syntax: "proto3",
  },
  nested: {
    billing: {
      nested: {
        v1: {
          options: {
            go_package: "macrocosm-os/rift/constellation_api/gen/billing/v1",
          },
          nested: {
            BillingService: {
              methods: {
                GetUsage: {
                  requestType: "GetUsageRequest",
                  responseType: "GetUsageResponse",
                },
              },
            },
            GetUsageRequest: {
              fields: {
                productType: {
                  type: "string",
                  id: 1,
                },
              },
            },
            BillingRate: {
              fields: {
                rateType: {
                  type: "string",
                  id: 1,
                },
                unitSize: {
                  type: "int64",
                  id: 2,
                },
                unitType: {
                  type: "string",
                  id: 3,
                },
                pricePerUnit: {
                  type: "float",
                  id: 4,
                },
                currency: {
                  type: "string",
                  id: 5,
                },
              },
            },
            GetUsageResponse: {
              fields: {
                availableCredits: {
                  type: "float",
                  id: 1,
                },
                usedCredits: {
                  type: "float",
                  id: 2,
                },
                remainingCredits: {
                  type: "float",
                  id: 3,
                },
                billingRates: {
                  rule: "repeated",
                  type: "BillingRate",
                  id: 4,
                },
              },
            },
          },
        },
      },
    },
  },
};
