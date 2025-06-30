import { ApexClient, ChatMessage } from "macrocosmos";
import { SamplingParameters } from "macrocosmos/generated/apex/v1/apex";

describe("ApexClient", () => {
  const API_KEY = process.env.MACROCOSMOS_API_KEY;

  if (!API_KEY) {
    throw new Error("MACROCOSMOS_API_KEY environment variable is required");
  }

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: "What is the capital of France?",
    },
  ];

  const deepResearchMessages: ChatMessage[] = [
    {
      role: "user",
      content: `Can you propose a mechanism by which a decentralized network 
      of AI agents could achieve provable alignment on abstract ethical principles 
      without relying on human-defined ontologies or centralized arbitration?`,
    },
  ];

  const samplingParameters: SamplingParameters = {
    temperature: 0.7,
    topP: 0.9,
    maxNewTokens: 100,
    doSample: true,
  };

  let client: ApexClient;

  beforeEach(() => {
    client = new ApexClient({
      apiKey: API_KEY,
      appName: "apex-client.test.ts",
    });
  });

  it("should make a streaming chat completion call", async () => {
    // Create streaming completion
    const result = await client.chat.completions.create({
      messages,
      stream: true,
      samplingParameters,
    });

    // Handle streaming response
    let fullResponse = "";
    const stream = result;

    for await (const chunk of stream) {
      // We know the interface matches the proto definition
      const content = chunk.choices?.[0]?.delta?.content || "";
      fullResponse += content;
      console.log("Received chunk:", content);
    }

    console.log("Full response:", fullResponse);

    expect(fullResponse).toBeTruthy();
    expect(fullResponse.toLowerCase()).toContain("paris");
  }, 30000); // Increase timeout to 30 seconds for streaming

  it("should make a non-streaming chat completion call", async () => {
    // Create non-streaming completion
    const response = await client.chat.completions.create({
      messages,
      stream: false,
      samplingParameters,
    });

    console.log("Response:", response.choices?.[0]?.message?.content);

    expect(response.choices?.[0]?.message?.content).toBeTruthy();
    expect(response.choices?.[0]?.message?.content?.toLowerCase()).toContain(
      "paris",
    );
  }, 30000); // Increase timeout to 30 seconds

  it("should retrieve stored chat completions", async () => {
    // chat ID for testing
    const chatId = "test-chat-id";

    // Get stored chat completions
    const result = await client.getStoredChatCompletions({ chatId });

    // Verify the response structure
    console.log("Stored chat completions:", result);
    expect(result).toBeDefined();
    expect(Array.isArray(result.chatCompletions)).toBe(true);
    // chat id doesn't exist so check first element is an empty object
    expect(Object.keys(result.chatCompletions[0] || {}).length).toBe(0);
  }, 30000);

  // Deep Researcher Tests
  it("should create a deep research job", async () => {
    // Create test parameters
    const params = {
      messages: deepResearchMessages,
      model: "Default",
      samplingParameters: samplingParameters,
      seed: 42,
      uids: [1, 2, 3],
    };

    // Submit the job
    const response = await client.submitDeepResearcherJob(params);

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
    // First create a job. Use simple inputs as job creation is tested in the previous test.
    const createParams = {
      messages: deepResearchMessages,
    };

    const createResponse = await client.submitDeepResearcherJob(createParams);
    const jobId = createResponse.jobId;

    // Then get the results
    const response = await client.getDeepResearcherJob({ jobId: jobId });

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
