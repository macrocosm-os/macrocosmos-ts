import { GravityClient } from "macrocosmos";

// Only mock the gRPC service client, not the proto loading
jest.mock("@grpc/grpc-js", () => {
  const actual =
    jest.requireActual<typeof import("@grpc/grpc-js")>("@grpc/grpc-js");
  return {
    ...actual,
    credentials: {
      createFromMetadataGenerator: jest.fn(() => ({})),
      createSsl: jest.fn(() => ({})),
      combineChannelCredentials: jest.fn(() => ({})),
    },
    Metadata: jest.fn(() => ({
      add: jest.fn(),
    })),
  };
});

describe("GravityClient", () => {
  let client: GravityClient;
  interface MockGrpcClient {
    GetGravityTasks: jest.Mock;
    GetCrawler: jest.Mock;
    CreateGravityTask: jest.Mock;
    BuildDataset: jest.Mock;
    GetDataset: jest.Mock;
    CancelGravityTask: jest.Mock;
    CancelDataset: jest.Mock;
  }
  let mockGrpcClient: MockGrpcClient;

  beforeEach(() => {
    // Create a client with mock options
    client = new GravityClient({
      apiKey: "test-api-key",
      appName: "test-app",
    });

    // Create a mock gRPC client for testing
    mockGrpcClient = {
      GetGravityTasks: jest.fn(
        (
          params: { includeCrawlers: boolean },
          callback: (
            error: Error | null,
            response: { gravityTaskStates: { id: string; status: string }[] },
          ) => void,
        ) =>
          callback(null, {
            gravityTaskStates: [] as { id: string; status: string }[],
          }),
      ),
      GetCrawler: jest.fn(
        (
          params: { crawlerId: string },
          callback: (
            error: Error | null,
            response: { crawler: Record<string, unknown> },
          ) => void,
        ) => callback(null, { crawler: {} }),
      ),
      CreateGravityTask: jest.fn(
        (
          params: {
            gravityTasks: { platform: string; topic: string }[];
            name: string;
          },
          callback: (
            error: Error | null,
            response: { gravityTaskId: string },
          ) => void,
        ) => callback(null, { gravityTaskId: "test-id" }),
      ),
      BuildDataset: jest.fn(
        (
          params: Record<string, unknown>,
          callback: (
            error: Error | null,
            response: { datasetId: string; dataset: Record<string, unknown> },
          ) => void,
        ) => callback(null, { datasetId: "test-id", dataset: {} }),
      ),
      GetDataset: jest.fn(
        (
          params: { datasetId: string },
          callback: (
            error: Error | null,
            response: { dataset: Record<string, unknown> },
          ) => void,
        ) => callback(null, { dataset: {} }),
      ),
      CancelGravityTask: jest.fn(
        (
          params: { gravityTaskId: string },
          callback: (
            error: Error | null,
            response: { message: string },
          ) => void,
        ) => callback(null, { message: "Cancelled" }),
      ),
      CancelDataset: jest.fn(
        (
          params: { datasetId: string },
          callback: (
            error: Error | null,
            response: { message: string },
          ) => void,
        ) => callback(null, { message: "Cancelled" }),
      ),
    };

    // Replace the createGrpcClient method to return our mock
    jest
      .spyOn(
        client as unknown as { createGrpcClient: () => typeof mockGrpcClient },
        "createGrpcClient",
      )
      .mockReturnValue(mockGrpcClient);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getGravityTasks", () => {
    it("should call the GetGravityTasks method on the gRPC client", async () => {
      const result = await client.getGravityTasks({ includeCrawlers: true });

      expect(mockGrpcClient.GetGravityTasks).toHaveBeenCalledWith(
        { includeCrawlers: true },
        expect.any(Function),
      );
      expect(result).toEqual({ gravityTaskStates: [] });
    });

    it("should handle errors", async () => {
      mockGrpcClient.GetGravityTasks.mockImplementationOnce(
        (
          params: { includeCrawlers: boolean },
          callback: (
            error: Error | null,
            response: {
              gravityTaskStates: { id: string; status: string }[];
            } | null,
          ) => void,
        ) => callback(new Error("Test Error"), null),
      );

      await expect(client.getGravityTasks({})).rejects.toThrow("Test Error");
    });
  });

  describe("getCrawler", () => {
    it("should call the GetCrawler method on the gRPC client", async () => {
      const result = await client.getCrawler({ crawlerId: "test-id" });

      expect(mockGrpcClient.GetCrawler).toHaveBeenCalledWith(
        { crawlerId: "test-id" },
        expect.any(Function),
      );
      expect(result).toEqual({ crawler: {} });
    });
  });

  describe("createGravityTask", () => {
    it("should call the CreateGravityTask method on the gRPC client", async () => {
      const params = {
        gravityTasks: [{ platform: "x", topic: "#ai" }],
        name: "Test Task",
      };

      const result = await client.createGravityTask(params);

      expect(mockGrpcClient.CreateGravityTask).toHaveBeenCalledWith(
        params,
        expect.any(Function),
      );
      expect(result).toEqual({ gravityTaskId: "test-id" });
    });
  });

  describe("buildDataset", () => {
    it("should call the BuildDataset method on the gRPC client", async () => {
      const params = {
        crawlerId: "test-crawler-id",
        notificationRequests: [{ type: "email", address: "test@example.com" }],
      };

      const result = await client.buildDataset(params);

      expect(mockGrpcClient.BuildDataset).toHaveBeenCalledWith(
        params,
        expect.any(Function),
      );
      expect(result).toEqual({ datasetId: "test-id", dataset: {} });
    });
  });

  describe("getDataset", () => {
    it("should call the GetDataset method on the gRPC client", async () => {
      const result = await client.getDataset({ datasetId: "test-id" });

      expect(mockGrpcClient.GetDataset).toHaveBeenCalledWith(
        { datasetId: "test-id" },
        expect.any(Function),
      );
      expect(result).toEqual({ dataset: {} });
    });
  });

  describe("cancelGravityTask", () => {
    it("should call the CancelGravityTask method on the gRPC client", async () => {
      const result = await client.cancelGravityTask({
        gravityTaskId: "test-id",
      });

      expect(mockGrpcClient.CancelGravityTask).toHaveBeenCalledWith(
        { gravityTaskId: "test-id" },
        expect.any(Function),
      );
      expect(result).toEqual({ message: "Cancelled" });
    });
  });

  describe("cancelDataset", () => {
    it("should call the CancelDataset method on the gRPC client", async () => {
      const result = await client.cancelDataset({ datasetId: "test-id" });

      expect(mockGrpcClient.CancelDataset).toHaveBeenCalledWith(
        { datasetId: "test-id" },
        expect.any(Function),
      );
      expect(result).toEqual({ message: "Cancelled" });
    });
  });
});
