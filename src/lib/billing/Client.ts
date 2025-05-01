import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import * as path from "path";
import {
  IGetUsageRequest,
  IGetUsageResponse,
  IBillingServiceClient,
} from "../../generated/billing/v1/billing";
import { CLIENT_NAME, VERSION, BASE_URL, APEX_API_KEY } from "../../constants";

// Client options
interface BillingClientOptions {
  apiKey?: string;
  baseURL?: string;
  appName?: string;
  timeout?: number;
  secure?: boolean;
}

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
export class BillingClient {
  public apiKey: string;
  private baseURL: string;
  private appName: string;
  private protoClient: BillingProtoClient;
  private defaultTimeout: number;
  private secure: boolean;

  constructor(options: BillingClientOptions) {
    this.apiKey = options.apiKey || APEX_API_KEY || "";
    this.baseURL = options.baseURL || BASE_URL;
    this.appName = options.appName || "unknown";
    this.defaultTimeout = options.timeout || 60;

    // Check environment variable for HTTPS setting
    const useHttps = process.env.MACROCOSMOS_USE_HTTPS !== "false";

    // Use secure if explicitly set in options or if HTTPS is enabled via env var
    this.secure = options.secure !== undefined ? options.secure : useHttps;

    // Initialize gRPC client
    this.protoClient = this.initializeGrpcClient();

    // Check if the API key is valid
    if (!this.apiKey) {
      throw new Error("API key is required");
    }
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
        meta.add("authorization", `Bearer ${this.apiKey}`);
        meta.add("x-source", this.appName);
        meta.add("x-client-id", CLIENT_NAME);
        meta.add("x-client-version", VERSION);
        callback(null, meta);
      },
    );

    // Create credentials based on secure option
    let credentials: grpc.ChannelCredentials;
    if (this.secure) {
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
    return new this.protoClient.BillingService(this.baseURL, credentials);
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
