# Macrocosmos TypeScript SDK

The official TypeScript SDK for [Macrocosmos](https://www.macrocosmos.ai/).

## Installation

```bash
npm install macrocosmos
```

## Usage

### Apex Client

The Apex client provides an interface for accessing the Apex API for chat completions, web search and deep research.

```typescript
import { ApexClient } from 'macrocosmos';

// Initialize the client
const client = new ApexClient({ apiKey: 'your-api-key' });

// Chat completions
const response = await client.chat.completions.create({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello, how are you?' }
  ],
  stream: true
});

// Web retrieval
const webResults = await client.webRetrieval({
  query: 'latest news about AI'
});

// Deep Researcher

// Submit a deep research job
const submittedJob = await client.submitDeepResearcherJob({
      messages: [
      { role: "user",
        content: `Can you propose a mechanism by which a decentralized network 
        of AI agents could achieve provable alignment on abstract ethical principles 
        without relying on human-defined ontologies or centralized arbitration?`},
    ],
    });

// Get the results of a deep research job
const polledJobResult = await client.getDeepResearcherJob({jobId: submittedJob.jobId});
```

### Gravity Client

The Gravity client provides an interface for data collection and dataset management.

```typescript
import { GravityClient } from 'macrocosmos';

// Initialize the client
const client = new GravityClient({ apiKey: 'your-api-key' });

// Create a new gravity task
const task = await client.createGravityTask({
  name: 'My Data Collection Task',
  gravityTasks: [
    { platform: 'x', topic: '#ai' },
    { platform: 'reddit', topic: 'r/ai' }
  ],
  notificationRequests: [
    { type: 'email', address: 'user@example.com', redirectUrl: 'https://example.com/datasets' }
  ]
});

// List all gravity tasks
const tasks = await client.getGravityTasks({
  includeCrawlers: true
});

// Get a specific crawler
const crawler = await client.getCrawler({
  crawlerId: 'crawler-id'
});

// Build a dataset from a crawler
const dataset = await client.buildDataset({
  crawlerId: 'crawler-id',
  notificationRequests: [
    { type: 'email', address: 'user@example.com' }
  ]
});

// Get a dataset
const datasetStatus = await client.getDataset({
  datasetId: 'dataset-id'
});

// Cancel a gravity task
const cancelResult = await client.cancelGravityTask({
  gravityTaskId: 'task-id'
});

// Cancel a dataset build
const cancelDataset = await client.cancelDataset({
  datasetId: 'dataset-id'
});
```

### SN13 Client

The SN13 client provides an interface for the SN13 Validator API.

```typescript
import { Sn13Client } from 'macrocosmos';

// Initialize the client
const client = new Sn13Client({apiKey: 'your-api-key'});

// Get the onDemandData response
const response = await client.onDemandData({  
  source: 'x',
  usernames: ['nasa', 'spacex'],
  keywords: ['photo', 'space', 'mars'],
  startDate: '2024-04-01',
  endDate: '2025-04-25',
  limit: 3
});

```