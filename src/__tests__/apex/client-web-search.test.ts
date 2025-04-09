/// <reference types="jest" />
import '@jest/globals';
import { ApexClient, WebRetrievalRequest, WebRetrievalResponse } from 'macrocosmos';

describe('ApexClient WebRetrieval', () => {
  const API_KEY = process.env.MACROCOSMOS_API_KEY;

  if (!API_KEY) {
    throw new Error('MACROCOSMOS_API_KEY environment variable is required');
  }

  it('should make a web retrieval request', async () => {
    // Create ApexClient
    const client = new ApexClient({
      apiKey: API_KEY,
      appName: 'apex-client-web-search.test.ts'
    });

    // Create web retrieval request
    const request: WebRetrievalRequest = {
      searchQuery: 'What is Bittensor?',
      nResults: 5,
      maxResponseTime: 10000 // 10 seconds
    };

    // Make the web retrieval call
    const response: WebRetrievalResponse = await client.webRetrieval(request);

    // Validate response
    expect(response).toBeTruthy();
    expect(response.results).toBeDefined();
    expect(Array.isArray(response.results)).toBe(true);
    
    // Check if we have results
    if (response.results && response.results.length > 0) {
      console.log(`Received ${response.results.length} search results`);
      
      // Log the first result
      const firstResult = response.results[0];
      console.log('First result URL:', firstResult.url);
      console.log('First result content snippet:', 
        firstResult.content?.substring(0, 100) + '...');
    }
    
    // Expect to have at least one result
    expect(response.results?.length).toBeGreaterThan(0);
  }, 30000); // Increase timeout to 30 seconds
}); 