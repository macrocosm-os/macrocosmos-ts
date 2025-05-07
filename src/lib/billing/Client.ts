import {
  BillingServiceClient,
  GetUsageRequest,
  GetUsageResponse,
} from "../../generated/billing/v1/billing";
import * as grpc from "@grpc/grpc-js";
import { BaseClient, BaseClientOptions } from "../BaseClient";

// re-export the types for use in the package
export type { GetUsageResponse, GetUsageRequest };

/**
 * Client for interacting with the Billing API
 * Provides billing service interface over gRPC
 */
export class BillingClient extends BaseClient {
  private _grpcClient?: BillingServiceClient;

  constructor(options: BaseClientOptions, grpcClient?: BillingServiceClient) {
    super(options);

    this._grpcClient = grpcClient;
  }

  private createGrpcClient(): BillingServiceClient {
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
    return new BillingServiceClient(this.getBaseURL(), credentials);
  }

  /**
   * Get usage information for a product
   */
  getUsage = async (params: GetUsageRequest): Promise<GetUsageResponse> => {
    const client = this.createGrpcClient();

    return new Promise<GetUsageResponse>((resolve, reject) => {
      client.getUsage(params, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  };
}
