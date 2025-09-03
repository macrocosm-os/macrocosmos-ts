import { CLIENT_NAME, VERSION, BASE_URL } from "../constants";
import * as grpc from "@grpc/grpc-js";

export interface BaseClientOptions {
  apiKey?: string;
  baseURL?: string;
  appName?: string;
  secure?: boolean;
  userId?: string; // optional: used when apiKey is a service account key
}

/**
 * Base client class that provides common functionality for all clients
 */
export abstract class BaseClient {
  protected apiKey: string;
  protected baseURL: string;
  protected appName: string;
  protected secure: boolean;
  protected userId: string;

  constructor(options: BaseClientOptions) {
    this.apiKey = options.apiKey ?? "";
    this.baseURL = options.baseURL ?? BASE_URL;
    this.appName = options.appName ?? "unknown";
    this.userId = options.userId ?? "";

    // Check environment variable for HTTPS setting
    const useHttps = process.env.MACROCOSMOS_USE_HTTPS !== "false";

    // Use secure if explicitly set in options or if HTTPS is enabled via env var
    // But automatically disable secure for localhost connections
    const isLocalhost =
      this.baseURL.includes("localhost") || this.baseURL.includes("127.0.0.1");
    this.secure = options.secure ?? (useHttps && !isLocalhost);

    // Check if the API key is valid
    if (!this.apiKey) {
      throw new Error("API key is required");
    }
  }

  /**
   * Get the API key for authentication
   */
  protected getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Get the base URL for the client
   */
  protected getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Get the app name for the client
   */
  protected getAppName(): string {
    return this.appName;
  }

  /**
   * Get whether the client is using secure connections
   */
  protected isSecure(): boolean {
    return this.secure;
  }

  /**
   * Get the client name
   */
  protected getClientName(): string {
    return CLIENT_NAME;
  }

  /**
   * Get the client version
   */
  protected getClientVersion(): string {
    return VERSION;
  }

  /**
   * Get the user ID for service account authentication
   */
  protected getUserId(): string {
    return this.userId;
  }

  /**
   * Create the standard authentication metadata
   * This is shared between secure and insecure connection methods
   */
  private createStandardMetadata(): grpc.Metadata {
    const metadata = new grpc.Metadata();
    metadata.add("authorization", `Bearer ${this.getApiKey()}`);
    metadata.add("x-source", this.getAppName());
    metadata.add("x-client-id", this.getClientName());
    metadata.add("x-client-version", this.getClientVersion());
    metadata.add("x-forwarded-user", this.getUserId());
    return metadata;
  }

  /**
   * Create authentication metadata for gRPC calls
   * This is used for insecure connections where call credentials cannot be combined
   */
  protected createAuthMetadata(): grpc.Metadata {
    return this.createStandardMetadata();
  }

  /**
   * Create gRPC channel credentials with proper authentication
   * This handles both secure and insecure connections correctly
   */
  protected createChannelCredentials(): grpc.ChannelCredentials {
    // Create gRPC credentials with API key
    const callCreds = grpc.credentials.createFromMetadataGenerator(
      (_params, callback) => {
        callback(null, this.createStandardMetadata());
      },
    );

    // Create credentials based on secure option
    if (this.isSecure()) {
      // Use secure credentials for production
      const channelCreds = grpc.credentials.createSsl();
      return grpc.credentials.combineChannelCredentials(
        channelCreds,
        callCreds,
      );
    } else {
      // For insecure connections, we can't combine with call credentials
      // The authentication headers will be added via metadata in individual calls
      return grpc.credentials.createInsecure();
    }
  }
}
