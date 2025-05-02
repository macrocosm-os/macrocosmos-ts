import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import * as path from "path";
import {
  IGetUsageRequest,
  IGetUsageResponse,
  IBillingServiceClient,
} from "../../generated/billing/v1/billing";
import { BaseClient, BaseClientOptions } from "../BaseClient";

// Client options
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface BillingClientOptions extends BaseClientOptions {}

// Re-export the interfaces from the proto for easier use
export type GetUsageRequest = IGetUsageRequest;
export type GetUsageResponse = IGetUsageResponse;

interface BillingService
  extends grpc.ServiceClientConstructor,
    IBillingServiceClient {}

export interface BillingProtoClient {
  BillingService: {
    new (address: string, credentials: grpc.ChannelCredentials): BillingService;
  };
}

/**
 * Client for interacting with the Billing API
 * Provides billing service interface over gRPC
 */
export class BillingClient extends BaseClient {
  private protoClient: BillingProtoClient;

  constructor(options: BillingClientOptions) {
    super(options);
    this.protoClient = this.initializeGrpcClient();
  }

  private initializeGrpcClient() {
    // Load proto file directly
    const PROTO_PATH = path.resolve(
      __dirname,
      "../../../protos/billing/v1/billing.proto",
    );

    // Load protos using standard protobuf loader
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    // Get the BillingService definition
    const protoDescriptor = grpc.loadPackageDefinition(
      packageDefinition,
    ) as unknown as {
      billing: {
        v1: BillingProtoClient;
      };
    };

    return protoDescriptor.billing.v1;
  }

  private createGrpcClient(): BillingService {
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
    return new this.protoClient.BillingService(this.getBaseURL(), credentials);
  }

  /**
   * Get usage information for a product
   */
  getUsage = async (params: GetUsageRequest): Promise<GetUsageResponse> => {
    const client = this.createGrpcClient();

    return new Promise<GetUsageResponse>((resolve, reject) => {
      void client.GetUsage(
        params,
        (error: Error | null, response: GetUsageResponse) => {
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
