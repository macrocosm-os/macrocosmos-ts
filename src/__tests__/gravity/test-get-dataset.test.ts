import { GravityClient } from "../../lib/gravity/Client";

const baseURL = "";
const apiKey = "";
const datasetId = "";

const client = new GravityClient({
  baseURL,
  apiKey,
});

test("get dataset", async () => {
  const dataset = await client.getDataset({
    datasetId,
  });
  console.log(JSON.stringify(dataset, null, 2));
});
