import { Sn13Client, ListTopicsRequest } from "../../lib/sn13/Client";

async function main() {
  // Get API key from environment
  const API_KEY = process.env.MACROCOSMOS_API_KEY;
  if (!API_KEY) {
    throw new Error("MACROCOSMOS_API_KEY environment variable is required");
  }

  try {
    // Create Sn13Client
    const client = new Sn13Client({
      apiKey: API_KEY,
      appName: "sn13-examples",
    });

    // Create request
    const request: ListTopicsRequest = {
      source: "reddit", // Example source
    };

    console.log("Fetching topics...");

    // Get topics
    const response = await client.listTopics(request);

    // Print response details
    console.log("\nResponse:");
    console.log("--------");
    if (response.details && response.details.length > 0) {
      response.details.forEach((detail, index) => {
        console.log(`\nTopic ${index + 1}:`);
        console.log(`Label: ${detail.labelValue}`);
        console.log(`Content Size: ${detail.contentSizeBytes} bytes`);
        console.log(
          `Adjacent Content Size: ${detail.adjContentSizeBytes} bytes`,
        );
      });
    } else {
      console.log("No topics found");
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Run the example
main().catch(console.error);
