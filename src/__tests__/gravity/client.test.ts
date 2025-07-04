import {
  BuildDatasetRequest,
  CreateGravityTaskRequest,
  GravityClient,
} from "macrocosmos";
import { GravityServiceClient } from "macrocosmos/generated/gravity/v1/gravity";
import { vi } from "vitest";

describe("GravityClient", () => {
  let client: GravityClient;

  interface MockGrpcClient {
    getGravityTasks: ReturnType<typeof vi.fn>;
    getCrawler: ReturnType<typeof vi.fn>;
    createGravityTask: ReturnType<typeof vi.fn>;
    buildDataset: ReturnType<typeof vi.fn>;
    getDataset: ReturnType<typeof vi.fn>;
    cancelGravityTask: ReturnType<typeof vi.fn>;
    cancelDataset: ReturnType<typeof vi.fn>;
  }

  let mockGrpcClient: MockGrpcClient;

  beforeEach(() => {
    // Create a client with mock options
    // Create a mock gRPC client for testing
    mockGrpcClient = {
      getGravityTasks: vi.fn(
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
      getCrawler: vi.fn(
        (
          params: { crawlerId: string },
          callback: (
            error: Error | null,
            response: { crawler: Record<string, unknown> },
          ) => void,
        ) => callback(null, { crawler: {} }),
      ),
      createGravityTask: vi.fn(
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
      buildDataset: vi.fn(
        (
          params: Record<string, unknown>,
          callback: (
            error: Error | null,
            response: { datasetId: string; dataset: Record<string, unknown> },
          ) => void,
        ) => callback(null, { datasetId: "test-id", dataset: {} }),
      ),
      getDataset: vi.fn(
        (
          params: { datasetId: string },
          callback: (
            error: Error | null,
            response: { dataset: Record<string, unknown> },
          ) => void,
        ) => callback(null, { dataset: {} }),
      ),
      cancelGravityTask: vi.fn(
        (
          params: { gravityTaskId: string },
          callback: (
            error: Error | null,
            response: { message: string },
          ) => void,
        ) => callback(null, { message: "Cancelled" }),
      ),
      cancelDataset: vi.fn(
        (
          params: { datasetId: string },
          callback: (
            error: Error | null,
            response: { message: string },
          ) => void,
        ) => callback(null, { message: "Cancelled" }),
      ),
    };

    client = new GravityClient(
      {
        apiKey: "test-api-key",
        appName: "test-app",
      },
      mockGrpcClient as unknown as GravityServiceClient,
    );

    // Patch the prototype method so all instances use the mock
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("getGravityTasks", () => {
    it("should call the GetGravityTasks method on the gRPC client", async () => {
      const result = await client.getGravityTasks({ includeCrawlers: true });

      expect(mockGrpcClient.getGravityTasks).toHaveBeenCalledWith(
        { includeCrawlers: true },
        expect.any(Function),
      );
      expect(result).toEqual({ gravityTaskStates: [] });
    });

    it("should handle errors", async () => {
      mockGrpcClient.getGravityTasks.mockImplementationOnce(
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

      expect(mockGrpcClient.getCrawler).toHaveBeenCalledWith(
        { crawlerId: "test-id" },
        expect.any(Function),
      );
      expect(result).toEqual({ crawler: {} });
    });
  });

  describe("createGravityTask", () => {
    it("should call the CreateGravityTask method on the gRPC client", async () => {
      const params: CreateGravityTaskRequest = {
        gravityTasks: [{ platform: "x", topic: "#ai" }],
        name: "Test Task from typescript SDK",
      };

      const result = await client.createGravityTask(params);

      expect(mockGrpcClient.createGravityTask).toHaveBeenCalledWith(
        params,
        expect.any(Function),
      );
      expect(result).toEqual({ gravityTaskId: "test-id" });
    });
  });

  // describe("createGravityTask with keyword and datetimes", () => {
  //   it("should call the createGravityTask method on the gRPC client, using keyword and datetimes with ISO strings", async () => {
  //     const params: CreateGravityTaskRequest = {
  //       gravityTasks: [
  //         {
  //           platform: "x",
  //           topic: "#ai",
  //           keyword: "data",
  //           postStartDatetime: "2025-01-01T00:00:00Z",
  //           postEndDatetime: "2025-06-01T00:00:00Z",
  //         },
  //       ],
  //       name: "Test Task",
  //     };

  //     const result = await client.createGravityTask(params);

  //     expect(mockGrpcClient.createGravityTask).toHaveBeenCalled();
  //     expect(result).toEqual({ gravityTaskId: "test-id" });
  //   });
  // });

  describe("buildDataset", () => {
    it("should call the BuildDataset method on the gRPC client", async () => {
      const params: BuildDatasetRequest = {
        crawlerId: "test-crawler-id",
        notificationRequests: [{ type: "email", address: "test@example.com" }],
        maxRows: 100000,
      };

      const result = await client.buildDataset(params);

      expect(mockGrpcClient.buildDataset).toHaveBeenCalledWith(
        params,
        expect.any(Function),
      );
      expect(result).toEqual({ datasetId: "test-id", dataset: {} });
    });
  });

  describe("getDataset", () => {
    it("should call the GetDataset method on the gRPC client", async () => {
      const result = await client.getDataset({ datasetId: "test-id" });

      expect(mockGrpcClient.getDataset).toHaveBeenCalledWith(
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

      expect(mockGrpcClient.cancelGravityTask).toHaveBeenCalledWith(
        { gravityTaskId: "test-id" },
        expect.any(Function),
      );
      expect(result).toEqual({ message: "Cancelled" });
    });
  });

  describe("cancelDataset", () => {
    it("should call the CancelDataset method on the gRPC client", async () => {
      const result = await client.cancelDataset({ datasetId: "test-id" });

      expect(mockGrpcClient.cancelDataset).toHaveBeenCalledWith(
        { datasetId: "test-id" },
        expect.any(Function),
      );
      expect(result).toEqual({ message: "Cancelled" });
    });
  });
});
