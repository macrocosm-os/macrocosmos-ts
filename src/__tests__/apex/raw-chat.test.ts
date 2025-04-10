import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import * as path from "path";
import * as fs from "fs";
import { CLIENT_NAME } from "../../constants";

// Load package.json for version
const packageJsonPath = path.resolve(__dirname, "../../../package.json");
const packageVersion = JSON.parse(
  fs.readFileSync(packageJsonPath, "utf8"),
).version;

// Load proto file directly
const PROTO_PATH = path.resolve(
  __dirname,
  "../../../protos/apex/v1/apex.proto",
);

// Load protos using standard protobuf loader
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false, // Use camelCase for keys
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Get the ApexService definition
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const apexProto = protoDescriptor.apex.v1;

describe("Apex Raw", () => {
  const API_URL =
    process.env.MACROCOSMOS_BASE_URL ||
    "constellation.api.cloud.macrocosmos.ai";
  const API_KEY = process.env.MACROCOSMOS_API_KEY;

  if (!API_KEY) {
    throw new Error("MACROCOSMOS_API_KEY environment variable is required");
  }

  it("should make a streaming chat completion call", async () => {
    // Create gRPC credentials with API key
    const callCreds = grpc.credentials.createFromMetadataGenerator(
      (_params, callback) => {
        const meta = new grpc.Metadata();
        meta.add("authorization", `Bearer ${API_KEY}`);
        meta.add("x-source", "apex-raw.test.ts");
        meta.add("x-client-id", CLIENT_NAME);
        meta.add("x-client-version", packageVersion);
        callback(null, meta);
      },
    );

    // Create secure credentials
    const channelCreds = grpc.credentials.createSsl();
    const combinedCreds = grpc.credentials.combineChannelCredentials(
      channelCreds,
      callCreds,
    );

    // Create gRPC client
    const client = new apexProto.ApexService(API_URL, combinedCreds);

    // Create request
    const request = {
      messages: [
        {
          role: "user",
          content: "What is the capital of Australia?",
        },
      ],
      samplingParameters: {
        temperature: 0.7,
        topP: 0.9,
        maxNewTokens: 100,
        doSample: true,
      },
      stream: true,
    };

    // Create streaming call
    const stream = client.ChatCompletionStream(request);

    // Handle stream events
    return new Promise<void>((resolve, reject) => {
      let fullResponse = "";

      stream.on("data", (chunk: any) => {
        const content = chunk.choices?.[0]?.delta?.content || "";
        fullResponse += content;
        console.log("Received chunk:", content);
      });

      stream.on("end", () => {
        console.log("Stream ended. Full response:", fullResponse);
        expect(fullResponse).toBeTruthy();
        resolve();
      });

      stream.on("error", (error: Error) => {
        console.error("Stream error:", error);
        reject(error);
      });
    });
  }, 30000); // Increase timeout to 30 seconds for streaming
});
