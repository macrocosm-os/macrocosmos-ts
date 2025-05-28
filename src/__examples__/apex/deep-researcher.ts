import { ApexClient, ChatMessage } from "../../lib/apex/Client";
import { DeepResearch } from "../../lib/apex/DeepResearch";
import { DeepResearcherResultChunk } from "../../generated/apex/v1/apex";

interface ChunkContent {
  content: string;
}

// Helper function to extract content from a chunk
function extractContentFromChunk(chunkStr: string): string | null {
  try {
    const chunkList = JSON.parse(chunkStr) as ChunkContent[];
    if (chunkList && chunkList.length > 0 && "content" in chunkList[0]) {
      return chunkList[0].content;
    }
  } catch (error) {
    console.error("Failed to parse chunk:", error);
  }
  return null;
}

// Helper function to process result chunks
function processResultChunks(
  results: DeepResearcherResultChunk[],
  lastSeqId: number,
): number {
  for (const item of results) {
    try {
      const seqId = item.seqId;
      if (seqId > lastSeqId) {
        const content = extractContentFromChunk(item.chunk);
        if (content) {
          console.log(`\nseq_id ${seqId}:\n${content}`);
          lastSeqId = seqId;
        }
      }
    } catch (error) {
      console.error("Error processing sequence:", error);
    }
  }
  return lastSeqId;
}

async function demoDeepResearchPolling(): Promise<void> {
  console.log("\nRunning Deep Research example...");

  // Get API key from environment
  const API_KEY = process.env.MACROCOSMOS_API_KEY;
  if (!API_KEY) {
    throw new Error("MACROCOSMOS_API_KEY environment variable is required");
  }

  try {
    // Create ApexClient
    const client = new ApexClient({
      apiKey: API_KEY,
      appName: "apex-examples",
    });

    // Create DeepResearch instance
    const deepResearch = new DeepResearch(client);

    // Create initial messages for the deep research job
    const messages: ChatMessage[] = [
      {
        role: "user",
        content: `Can you propose a mechanism by which a decentralized network 
        of AI agents could achieve provable alignment on abstract ethical principles 
        without relying on human-defined ontologies or centralized arbitration?`,
      },
    ];

    // Submit the deep research job
    console.log("\nSubmitting deep research job...");
    const submittedResponse = await deepResearch.createJob({
      messages,
    });

    console.log("\nCreated deep research job.\n");
    console.log(`Initial status: ${submittedResponse.status}`);
    console.log(`Job ID: ${submittedResponse.jobId}`);
    console.log(`Created at: ${submittedResponse.createdAt}\n`);

    // Poll for job status
    console.log("Polling the results...");
    let lastSeqId = -1; // Track the highest sequence ID we've seen
    let lastUpdated: string | null = null; // Track the last update time

    while (true) {
      try {
        const polledResponse = await deepResearch.getJobResults(
          submittedResponse.jobId,
        );

        const currentStatus = polledResponse.status;
        const currentUpdated = polledResponse.updatedAt;

        // On completion, print the final answer and its sequence ID
        if (currentStatus === "completed") {
          console.log("\nJob completed successfully!");
          console.log(`\nLast update at: ${currentUpdated}`);
          if (polledResponse.result && polledResponse.result.length > 0) {
            const lastResult =
              polledResponse.result[polledResponse.result.length - 1];
            const content = extractContentFromChunk(lastResult.chunk);
            if (content) {
              console.log(
                `\nFinal answer (seq_id ${lastResult.seqId}):\n${content}`,
              );
            }
          }
          break;
        } else if (currentStatus === "failed") {
          console.log(
            `\nJob failed: ${polledResponse.error || "Unknown error"}`,
          );
          console.log(`\nLast update at: ${currentUpdated}`);
          break;
        }

        // Check if we have new content by comparing update times
        if (currentUpdated !== lastUpdated) {
          console.log(`\nNew update at ${currentUpdated}`);
          console.log(`Status: ${currentStatus}`);

          // Process new content
          if (polledResponse.result) {
            lastSeqId = processResultChunks(polledResponse.result, lastSeqId);
          } else {
            console.log(
              "No results available yet. Waiting for Deep Researcher to generate data...",
            );
          }
          lastUpdated = currentUpdated;
        }
      } catch (error) {
        console.error("Error during polling:", error);
      }

      // Wait for 20 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 20000));
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Run the example
demoDeepResearchPolling().catch(console.error);
