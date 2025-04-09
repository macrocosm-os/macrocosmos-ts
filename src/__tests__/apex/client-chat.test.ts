/// <reference types="jest" />
import '@jest/globals';
import { ApexStream, ApexClient, ChatCompletionChunkResponse, ChatMessage, ChatCompletionResponse, ChatCompletionRequest } from 'macrocosmos';

describe('ApexClient', () => {
  const API_KEY = process.env.MACROCOSMOS_API_KEY;

  if (!API_KEY) {
    throw new Error('MACROCOSMOS_API_KEY environment variable is required');
  }

  it('should make a streaming chat completion call', async () => {
    // Create ApexClient
    const client = new ApexClient({
      apiKey: API_KEY,
      appName: 'apex-client.test.ts'
    });

    // Create request with the proper message type
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: 'What is the capital of France?'
      }
    ];

    // Create streaming completion
    const result = await client.chat.completions.create({
      messages,
      stream: true,
      samplingParameters: {
        temperature: 0.7,
        topP: 0.9,
        maxNewTokens: 100,
        doSample: true
      }
    } as ChatCompletionRequest);

    // Check if it's a Stream
    if (!(result instanceof ApexStream)) {
      throw new Error('Expected a Stream but got a regular response');
    }

    // Handle streaming response
    let fullResponse = '';
    const stream = result as ApexStream<ChatCompletionChunkResponse>;

    for await (const chunk of stream) {
      // We know the interface matches the proto definition
      const content = chunk.choices?.[0]?.delta?.content || '';
      fullResponse += content;
      console.log('Received chunk:', content);
    }

    console.log('Full response:', fullResponse);
    expect(fullResponse).toBeTruthy();
    expect(fullResponse.toLowerCase()).toContain('paris');
  }, 30000); // Increase timeout to 30 seconds for streaming

  it('should make a non-streaming chat completion call', async () => {
    // Create ApexClient
    const client = new ApexClient({
      apiKey: API_KEY,
      appName: 'apex-client.test.ts'
    });

    // Create request with the proper message type
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: 'What is the capital of France?'
      }
    ];

    // Create non-streaming completion
    const result = await client.chat.completions.create({
      messages,
      stream: false,
      samplingParameters: {
        temperature: 0.7,
        topP: 0.9,
        maxNewTokens: 100,
        doSample: true
      }
    } as ChatCompletionRequest);

    // Check if it's a regular response
    if (result instanceof ApexStream) {
      throw new Error('Expected a regular response but got a Stream');
    }

    // Cast to the correct type
    const response = result as ChatCompletionResponse;

    console.log('Response:', response.choices?.[0]?.message?.content);
    expect(response.choices?.[0]?.message?.content).toBeTruthy();
    expect(response.choices?.[0]?.message?.content?.toLowerCase()).toContain('paris');
  }, 30000); // Increase timeout to 30 seconds
}); 