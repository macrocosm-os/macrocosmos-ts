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

  it("should append a chat completion", async () => {
    // create a test chat
    const create_chat_result = await client.createChatAndCompletion({
      userPrompt: "This is a test chat, how are you?",
      chatType: "apex",
      completionType: "basic",
      title: "Test Chat",
    });

    // Verify a chat id exists (i.e., a chat was created)
    console.log("Create chat response:", create_chat_result);
    expect(create_chat_result).toBeDefined();
    expect(create_chat_result.parsedChat?.id).toBeDefined();
    // Create Completion under this chat
    const result = await client.createCompletion({
      chatId: create_chat_result.parsedChat?.id ?? "",
      userPrompt: "This is a test completion, how are you?",
      completionType: "basic",
    });

    // Verify the response structure
    console.log("Create completion response:", result);
    expect(result).toBeDefined();

    // Check ParsedCompletion
    expect(result.parsedCompletion).toBeDefined();
    expect(result.parsedCompletion!.id).toBeDefined();
    expect(result.parsedCompletion!.chatId).toBe(
      create_chat_result.parsedChat!.id,
    );
    // make sure the completion type is basic
    expect(result.parsedCompletion!.completionType).toBe("basic");
    // make sure the completion text is what we sent
    expect(result.parsedCompletion!.userPromptText).toBe(
      "This is a test completion, how are you?",
    );
    // Delete test chat
    const delete_chat_result = await client.deleteChats({
      chatIds: [create_chat_result.parsedChat?.id ?? ""],
    });
    expect(delete_chat_result).toBeDefined();
    expect(delete_chat_result.success).toBeTruthy();
  }, 30000);

  it("should delete a chat", async () => {
    // chat ID for testing
    const create_chat_result = await client.createChatAndCompletion({
      userPrompt: "This is a test chat, how are you?",
      chatType: "apex",
      completionType: "basic",
      title: "Test Chat",
    });

    // Verify the response structure
    console.log("Create chat response:", create_chat_result);
    expect(create_chat_result).toBeDefined();

    // Delete test chat
    const delete_chat_result = await client.deleteChats({
      chatIds: [create_chat_result.parsedChat?.id ?? ""],
    });
    expect(delete_chat_result).toBeDefined();
    expect(delete_chat_result.success).toBeTruthy();
    const get_chat_sessions_result = await client.getChatSessions();

    // Verify the response structure
    console.log("Stored chats:", get_chat_sessions_result);
    expect(get_chat_sessions_result).toBeDefined();
    // make sure the chat does not exist in the chats retrieved
    expect(Array.isArray(get_chat_sessions_result.chatSessions)).toBe(true);
    expect(
      get_chat_sessions_result.chatSessions.some(
        session => session.id === create_chat_result.parsedChat?.id,
      ),
    ).toBe(false);
  }, 30000);

  it("should delete a completion", async () => {
    // chat ID for testing
    const create_completion_result = await client.createChatAndCompletion({
      userPrompt: "This is a test chat, how is it going?",
      chatType: "apex",
      completionType: "basic",
      title: "Test Chat",
    });

    console.log("Create completion response:", create_completion_result);
    expect(create_completion_result).toBeDefined();

    // Delete test completion
    const delete_completion_result = await client.deleteCompletions({
      completionIds: [create_completion_result.parsedCompletion?.id ?? ""],
    });
    expect(delete_completion_result).toBeDefined();
    expect(delete_completion_result.success).toBeTruthy();
    const get_chat_completions_result = await client.getStoredChatCompletions({
      chatId: create_completion_result.parsedChat?.id ?? "",
    });

    console.log("Stored completions:", get_chat_completions_result);
    expect(get_chat_completions_result).toBeDefined();
    // make sure the completion does not exist in the chats retrieved
    expect(
      get_chat_completions_result.chatCompletions.some(
        completion =>
          completion.id === create_completion_result.parsedCompletion?.id,
      ),
    ).toBe(false);
    // Now delete test chat
    const delete_chat_result = await client.deleteChats({
      chatIds: [create_completion_result.parsedChat?.id ?? ""],
    });
    expect(delete_chat_result.success).toBeTruthy();
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

  it("should retrieve a user's completions based on the search term", async () => {
    const searchTerm = "France?";
    // Get stored chat completions
    const result = await client.searchChatIdsByPromptAndCompletionText({
      searchTerm: searchTerm,
    });

    // Verify the response structure
    console.log("Stored chats:", result);
    expect(result).toBeDefined();
    expect(Array.isArray(result.chatIds)).toBe(true);
    // chat id doesn't exist so check first element is an empty object
    expect(Object.keys(result.chatIds[0] || {}).length).toBe(0);
  }, 30000);

  it("should create a chat and completion for a user", async () => {
    const result = await client.createChatAndCompletion({
      userPrompt: "This is a test chat, how are you?",
      chatType: "apex",
      completionType: "basic",
      title: "Test Chat",
    });

    // Verify the response structure
    console.log("Create chat and completion response:", result);
    expect(result).toBeDefined();
    // Check ParsedChat
    expect(result.parsedChat).toBeDefined();
    expect(result.parsedChat!.id).toBeDefined();
    expect(result.parsedChat!.title).toBe("Test Chat");
    expect(result.parsedChat!.chatType).toBe("apex");
    expect(result.parsedChat!.createdAt).toBeDefined();
    // Check ParsedCompletion
    expect(result.parsedCompletion).toBeDefined();
    expect(result.parsedCompletion!.id).toBeDefined();
    expect(result.parsedCompletion!.chatId).toBe(result.parsedChat!.id);
    expect(result.parsedCompletion!.completionType).toBe("basic");
    expect(result.parsedCompletion!.userPromptText).toBe(
      "This is a test chat, how are you?",
    );
    expect(result.parsedCompletion!.completionText).toBeDefined();
    expect(result.parsedCompletion!.createdAt).toBeDefined();
    // Delete test chat
    const delete_chat_result = await client.deleteChats({
      chatIds: [result.parsedChat?.id ?? ""],
    });
    expect(delete_chat_result.success).toBeTruthy();
  }, 30000);

  it("should retrieve a user's stored chats", async () => {
    // Get stored chat completions
    const result = await client.getChatSessions();

    // Verify the response structure
    console.log("Stored chats:", result);
    expect(result).toBeDefined();
    expect(Array.isArray(result.chatSessions)).toBe(true);
  }, 30000);

  it("should update chat attribute", async () => {
    // chat ID for testing
    const create_chat_result = await client.createChatAndCompletion({
      userPrompt: "This is a test user prompt. Capital of France?",
      chatType: "apex",
      completionType: "basic",
      title: "Test Chat",
    });

    // Verify the response structure
    console.log("Create chat response:", create_chat_result);
    expect(create_chat_result).toBeDefined();

    const update_chat_attributes = await client.updateChatAttributes({
      chatId: create_chat_result.parsedChat?.id ?? "",
      attributes: {
        title: "Updated Test Chat",
        chat_type: "gravity",
      },
    });


    expect(update_chat_attributes.chat?.title).toBe("Updated Test Chat");
    expect(update_chat_attributes.chat?.chatType).toBe("gravity");

    // Delete test chat
    const delete_chat_result = await client.deleteChats({
      chatIds: [create_chat_result.parsedChat?.id ?? ""],
    });
    expect(delete_chat_result.success).toBeTruthy();
  }, 30000);
});
