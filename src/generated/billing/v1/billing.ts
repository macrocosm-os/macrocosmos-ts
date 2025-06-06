// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.7.0
//   protoc               v5.29.2
// source: billing/v1/billing.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import {
  type CallOptions,
  ChannelCredentials,
  Client,
  type ClientOptions,
  type ClientUnaryCall,
  type handleUnaryCall,
  makeGenericClientConstructor,
  Metadata,
  type ServiceError,
  type UntypedServiceImplementation,
} from "@grpc/grpc-js";

export const protobufPackage = "billing.v1";

/** GetUsageRequest is the request message for getting the usage of the user's credits */
export interface GetUsageRequest {
  /** product_type: the type of the product (i.e. "gravity") */
  productType?: string | undefined;
}

/** ProductPlan is details of the subscription plan for a product */
export interface BillingRate {
  /** product_type: the type of the product (i.e. "gravity") */
  rateType: string;
  /** unit_size: the size of the unit of the subscription (e.g. 1000, 10000, 100000) */
  unitSize: number;
  /** unit_type: the type of the unit of the subscription (i.e. "rows") */
  unitType: string;
  /** price_per_unit: the price per unit of the subscription */
  pricePerUnit: number;
  /** currency: the currency of the subscription */
  currency: string;
}

/** GetUsageResponse is the response message for getting the usage of the user's credits */
export interface GetUsageResponse {
  /** available_credits: the number of credits available to the user */
  availableCredits: number;
  /** used_credits: the number of credits used by the user */
  usedCredits: number;
  /** remaining_credits: the number of credits remaining to the user */
  remainingCredits: number;
  /** subscription: the subscription that the user has */
  billingRates: BillingRate[];
}

function createBaseGetUsageRequest(): GetUsageRequest {
  return { productType: undefined };
}

export const GetUsageRequest: MessageFns<GetUsageRequest> = {
  encode(
    message: GetUsageRequest,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.productType !== undefined) {
      writer.uint32(10).string(message.productType);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): GetUsageRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetUsageRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.productType = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetUsageRequest {
    return {
      productType: isSet(object.productType)
        ? globalThis.String(object.productType)
        : undefined,
    };
  },

  toJSON(message: GetUsageRequest): unknown {
    const obj: any = {};
    if (message.productType !== undefined) {
      obj.productType = message.productType;
    }
    return obj;
  },

  create(base?: DeepPartial<GetUsageRequest>): GetUsageRequest {
    return GetUsageRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetUsageRequest>): GetUsageRequest {
    const message = createBaseGetUsageRequest();
    message.productType = object.productType ?? undefined;
    return message;
  },
};

function createBaseBillingRate(): BillingRate {
  return {
    rateType: "",
    unitSize: 0,
    unitType: "",
    pricePerUnit: 0,
    currency: "",
  };
}

export const BillingRate: MessageFns<BillingRate> = {
  encode(
    message: BillingRate,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.rateType !== "") {
      writer.uint32(10).string(message.rateType);
    }
    if (message.unitSize !== 0) {
      writer.uint32(16).int64(message.unitSize);
    }
    if (message.unitType !== "") {
      writer.uint32(26).string(message.unitType);
    }
    if (message.pricePerUnit !== 0) {
      writer.uint32(37).float(message.pricePerUnit);
    }
    if (message.currency !== "") {
      writer.uint32(42).string(message.currency);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): BillingRate {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBillingRate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.rateType = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 16) {
            break;
          }

          message.unitSize = longToNumber(reader.int64());
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.unitType = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 37) {
            break;
          }

          message.pricePerUnit = reader.float();
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }

          message.currency = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BillingRate {
    return {
      rateType: isSet(object.rateType)
        ? globalThis.String(object.rateType)
        : "",
      unitSize: isSet(object.unitSize) ? globalThis.Number(object.unitSize) : 0,
      unitType: isSet(object.unitType)
        ? globalThis.String(object.unitType)
        : "",
      pricePerUnit: isSet(object.pricePerUnit)
        ? globalThis.Number(object.pricePerUnit)
        : 0,
      currency: isSet(object.currency)
        ? globalThis.String(object.currency)
        : "",
    };
  },

  toJSON(message: BillingRate): unknown {
    const obj: any = {};
    if (message.rateType !== "") {
      obj.rateType = message.rateType;
    }
    if (message.unitSize !== 0) {
      obj.unitSize = Math.round(message.unitSize);
    }
    if (message.unitType !== "") {
      obj.unitType = message.unitType;
    }
    if (message.pricePerUnit !== 0) {
      obj.pricePerUnit = message.pricePerUnit;
    }
    if (message.currency !== "") {
      obj.currency = message.currency;
    }
    return obj;
  },

  create(base?: DeepPartial<BillingRate>): BillingRate {
    return BillingRate.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BillingRate>): BillingRate {
    const message = createBaseBillingRate();
    message.rateType = object.rateType ?? "";
    message.unitSize = object.unitSize ?? 0;
    message.unitType = object.unitType ?? "";
    message.pricePerUnit = object.pricePerUnit ?? 0;
    message.currency = object.currency ?? "";
    return message;
  },
};

function createBaseGetUsageResponse(): GetUsageResponse {
  return {
    availableCredits: 0,
    usedCredits: 0,
    remainingCredits: 0,
    billingRates: [],
  };
}

export const GetUsageResponse: MessageFns<GetUsageResponse> = {
  encode(
    message: GetUsageResponse,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.availableCredits !== 0) {
      writer.uint32(13).float(message.availableCredits);
    }
    if (message.usedCredits !== 0) {
      writer.uint32(21).float(message.usedCredits);
    }
    if (message.remainingCredits !== 0) {
      writer.uint32(29).float(message.remainingCredits);
    }
    for (const v of message.billingRates) {
      BillingRate.encode(v!, writer.uint32(34).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): GetUsageResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetUsageResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 13) {
            break;
          }

          message.availableCredits = reader.float();
          continue;
        }
        case 2: {
          if (tag !== 21) {
            break;
          }

          message.usedCredits = reader.float();
          continue;
        }
        case 3: {
          if (tag !== 29) {
            break;
          }

          message.remainingCredits = reader.float();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.billingRates.push(
            BillingRate.decode(reader, reader.uint32()),
          );
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetUsageResponse {
    return {
      availableCredits: isSet(object.availableCredits)
        ? globalThis.Number(object.availableCredits)
        : 0,
      usedCredits: isSet(object.usedCredits)
        ? globalThis.Number(object.usedCredits)
        : 0,
      remainingCredits: isSet(object.remainingCredits)
        ? globalThis.Number(object.remainingCredits)
        : 0,
      billingRates: globalThis.Array.isArray(object?.billingRates)
        ? object.billingRates.map((e: any) => BillingRate.fromJSON(e))
        : [],
    };
  },

  toJSON(message: GetUsageResponse): unknown {
    const obj: any = {};
    if (message.availableCredits !== 0) {
      obj.availableCredits = message.availableCredits;
    }
    if (message.usedCredits !== 0) {
      obj.usedCredits = message.usedCredits;
    }
    if (message.remainingCredits !== 0) {
      obj.remainingCredits = message.remainingCredits;
    }
    if (message.billingRates?.length) {
      obj.billingRates = message.billingRates.map(e => BillingRate.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<GetUsageResponse>): GetUsageResponse {
    return GetUsageResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetUsageResponse>): GetUsageResponse {
    const message = createBaseGetUsageResponse();
    message.availableCredits = object.availableCredits ?? 0;
    message.usedCredits = object.usedCredits ?? 0;
    message.remainingCredits = object.remainingCredits ?? 0;
    message.billingRates =
      object.billingRates?.map(e => BillingRate.fromPartial(e)) || [];
    return message;
  },
};

export type BillingServiceService = typeof BillingServiceService;
export const BillingServiceService = {
  /** Get the usage of the user's credits */
  getUsage: {
    path: "/billing.v1.BillingService/GetUsage",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: GetUsageRequest) =>
      Buffer.from(GetUsageRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => GetUsageRequest.decode(value),
    responseSerialize: (value: GetUsageResponse) =>
      Buffer.from(GetUsageResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => GetUsageResponse.decode(value),
  },
} as const;

export interface BillingServiceServer extends UntypedServiceImplementation {
  /** Get the usage of the user's credits */
  getUsage: handleUnaryCall<GetUsageRequest, GetUsageResponse>;
}

export interface BillingServiceClient extends Client {
  /** Get the usage of the user's credits */
  getUsage(
    request: GetUsageRequest,
    callback: (error: ServiceError | null, response: GetUsageResponse) => void,
  ): ClientUnaryCall;
  getUsage(
    request: GetUsageRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: GetUsageResponse) => void,
  ): ClientUnaryCall;
  getUsage(
    request: GetUsageRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: GetUsageResponse) => void,
  ): ClientUnaryCall;
}

export const BillingServiceClient = makeGenericClientConstructor(
  BillingServiceService,
  "billing.v1.BillingService",
) as unknown as {
  new (
    address: string,
    credentials: ChannelCredentials,
    options?: Partial<ClientOptions>,
  ): BillingServiceClient;
  service: typeof BillingServiceService;
  serviceName: string;
};

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends globalThis.Array<infer U>
    ? globalThis.Array<DeepPartial<U>>
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : T extends {}
        ? { [K in keyof T]?: DeepPartial<T[K]> }
        : Partial<T>;

function longToNumber(int64: { toString(): string }): number {
  const num = globalThis.Number(int64.toString());
  if (num > globalThis.Number.MAX_SAFE_INTEGER) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  if (num < globalThis.Number.MIN_SAFE_INTEGER) {
    throw new globalThis.Error("Value is smaller than Number.MIN_SAFE_INTEGER");
  }
  return num;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

export interface MessageFns<T> {
  encode(message: T, writer?: BinaryWriter): BinaryWriter;
  decode(input: BinaryReader | Uint8Array, length?: number): T;
  fromJSON(object: any): T;
  toJSON(message: T): unknown;
  create(base?: DeepPartial<T>): T;
  fromPartial(object: DeepPartial<T>): T;
}
