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
});
