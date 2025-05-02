import { CLIENT_NAME, VERSION, BASE_URL } from "../constants";

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
    this.apiKey = options.apiKey || "";
    this.baseURL = options.baseURL || BASE_URL;
    this.appName = options.appName || "unknown";
    this.userId = options.userId || "";

    // Check environment variable for HTTPS setting
    const useHttps = process.env.MACROCOSMOS_USE_HTTPS !== "false";

    // Use secure if explicitly set in options or if HTTPS is enabled via env var
    this.secure = options.secure !== undefined ? options.secure : useHttps;

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
} 