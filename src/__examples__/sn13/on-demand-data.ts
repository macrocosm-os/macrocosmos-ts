import { Sn13Client, OnDemandDataRequest } from "../../lib/sn13/Client";

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
      appName: "sn13-examples"
    });
    
    // Create request
    const request: OnDemandDataRequest = {
      source: "x",
      usernames: ["nasa", "spacex"],
      keywords: ["photo", "space", "mars"],
      startDate: "2024-04-01",
      endDate: "2025-04-25",
      limit: 3,
    };

    console.log("Fetching on-demand data...");

    // Call onDemandData method with request
    const response = await client.onDemandData(request);

    // Print response
    console.log("\nResponse:");
    console.log("--------");
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Run the example
main().catch(console.error);