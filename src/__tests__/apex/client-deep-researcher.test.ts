import { ApexClient } from "../../lib/apex/Client";
import {
  DeepResearch,
  DeepResearchJobParams,
} from "../../lib/apex/DeepResearch";

describe("DeepResearch", () => {
  const API_KEY = process.env.MACROCOSMOS_API_KEY;

  if (!API_KEY) {
    throw new Error("MACROCOSMOS_API_KEY environment variable is required");
  }

  it("should create a deep research job", async () => {
    // Create ApexClient
    const client = new ApexClient({
      apiKey: API_KEY,
      appName: "apex-client.test.ts",
    });

    // Create DeepResearch instance
    const deepResearch = new DeepResearch(client);

    // Create test parameters, enter all DeepResearchJobParams fields for coverage
    const params: DeepResearchJobParams = {
      messages: [
        {
          role: "user",
          content: `Can you propose a mechanism by which a decentralized network 
        of AI agents could achieve provable alignment on abstract ethical principles 
        without relying on human-defined ontologies or centralized arbitration?`,
        },
      ],
      model: "Default",
      samplingParameters: {
        temperature: 0.7,
        topP: 0.95,
        maxNewTokens: 100,
        doSample: false,
      },
      seed: 42,
      uids: [1, 2, 3],
    };

    // Submit the job
    const response = await deepResearch.createJob(params);

    // Verify response structure
    expect(response).toBeDefined();
    expect(typeof response.jobId).toBe("string");
    expect(typeof response.status).toBe("string");
    expect(typeof response.createdAt).toBe("string");
    expect(typeof response.updatedAt).toBe("string");

    // Log response for debugging
    console.log("Create Job Response:", response);
  }, 30000);

  it("should get deep researcher job results", async () => {
    // Create ApexClient
    const client = new ApexClient({
      apiKey: API_KEY,
      appName: "apex-client.test.ts",
    });

    // Create DeepResearch instance
    const deepResearch = new DeepResearch(client);

    // First create a job. Use simple inputs as job creation is tested in the previous test.
    const createParams: DeepResearchJobParams = {
      messages: [
        {
          role: "user",
          content: `Can you propose a mechanism by which a decentralized network 
          of AI agents could achieve provable alignment on abstract ethical principles 
          without relying on human-defined ontologies or centralized arbitration?`,
        },
      ],
    };

    const createResponse = await deepResearch.createJob(createParams);
    const jobId = createResponse.jobId;

    // Then get the results
    const response = await deepResearch.getJobResults(jobId);

    // Verify response structure
    expect(response).toBeDefined();
    expect(response.jobId).toBe(jobId); // Job ID should match the one from the create response
    expect(typeof response.status).toBe("string");
    expect(typeof response.jobId).toBe("string");
    expect(typeof response.createdAt).toBe("string");
    expect(typeof response.updatedAt).toBe("string");
    expect(Array.isArray(response.result)).toBe(true);

    // Log response for debugging
    console.log("Get Job Results Response:", response);
  }, 60000); // Longer timeout for this test as it involves multiple API calls
});
