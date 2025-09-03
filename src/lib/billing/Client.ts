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

    // Create gRPC client with proper credentials
    return new BillingServiceClient(
      this.getBaseURL(),
      this.createChannelCredentials(),
    );
  }

  /**
   * Get usage information for a product
   */
  getUsage = async (params: GetUsageRequest): Promise<GetUsageResponse> => {
    const client = this.createGrpcClient();

    return new Promise<GetUsageResponse>((resolve, reject) => {
      // For insecure connections, we need to manually add auth metadata
      if (this.isSecure()) {
        client.getUsage(params, (error, response) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(response);
        });
      } else {
        const metadata = this.createAuthMetadata();
        client.getUsage(params, metadata, (error, response) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(response);
        });
      }
    });
  };
}
