import {
  Sn13Client,
  ListTopicsRequest,
  ValidateRedditTopicRequest,
} from "macrocosmos";

describe("Sn13Client", () => {
  const API_KEY = process.env.MACROCOSMOS_API_KEY;

  if (!API_KEY) {
    throw new Error("MACROCOSMOS_API_KEY environment variable is required");
  }

  it("should validate a Reddit topic", async () => {
    // Create Sn13Client
    const client = new Sn13Client({
      apiKey: API_KEY,
      appName: "sn13-client.test.ts",
    });

    // Create request
    const request: ValidateRedditTopicRequest = {
      topic: "programming", // Example topic
    };

    // Validate topic
    const response = await client.validateRedditTopic(request);

    // Verify response structure
    expect(response).toBeDefined();
    expect(typeof response.platform).toBe("string");
    expect(typeof response.topic).toBe("string");
    expect(typeof response.exists).toBe("boolean");
    expect(typeof response.over18).toBe("boolean");
    expect(typeof response.quarantine).toBe("boolean");

    // Log response for debugging
    console.log("Validation Response:", response);
  }, 30000); // Increase timeout to 30 seconds
}); 