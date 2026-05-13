import { describe, it, expect } from "vitest";
import { BillingClient, GetUsageRequest } from "macrocosmos";

// Live integration suite. Skipped when MACROCOSMOS_API_KEY is unset so
// untrusted CI (PRs) never needs the secret. Runs in the trusted integration
// workflow and locally when developers export the key.
const API_KEY = process.env.MACROCOSMOS_API_KEY;

describe.skipIf(!API_KEY)("BillingClient (live)", () => {
  it("should get usage information", async () => {
    // Create BillingClient
    const client = new BillingClient({
      apiKey: API_KEY,
    });

    // Create request
    const request: GetUsageRequest = {};

    // Get usage information
    const response = await client.getUsage(request);

    // Verify response structure
    expect(response).toBeDefined();
    expect(typeof response.availableCredits).toBe("number");
    expect(typeof response.usedCredits).toBe("number");
    expect(typeof response.remainingCredits).toBe("number");
    expect(Array.isArray(response.billingRates)).toBe(true);

    // Verify billing rates structure if present
    if (response.billingRates && response.billingRates.length > 0) {
      const rate = response.billingRates[0];
      expect(typeof rate.rateType).toBe("string");
      expect(typeof rate.unitType).toBe("string");
      expect(typeof rate.pricePerUnit).toBe("number");
      expect(typeof rate.currency).toBe("string");
    }

    // Log response for debugging
    console.log("Usage Response:", response);
  }, 30000); // Increase timeout to 30 seconds
});
