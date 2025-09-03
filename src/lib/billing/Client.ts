import {
  BillingServiceClient,
  GetUsageRequest,
  GetUsageResponse,
} from "../../generated/billing/v1/billing";
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

    if (this.isSecure()) {
      return new Promise<GetUsageResponse>((resolve, reject) => {
        client.getUsage(params, (error, response) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(response);
        });
      });
    }

    const metadata = this.createAuthMetadata();
    return new Promise<GetUsageResponse>((resolve, reject) => {
      client.getUsage(params, metadata, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  };
}
