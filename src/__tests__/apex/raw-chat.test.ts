import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import * as path from "path";
import { CLIENT_NAME, VERSION } from "../../constants";

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
interface ApexProto {
  apex: {
    v1: {
      ApexService: grpc.ServiceClientConstructor;
    };
  };
}

const protoDescriptor = grpc.loadPackageDefinition(
  packageDefinition,
) as unknown as ApexProto;
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
        meta.add("x-client-version", VERSION);
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
    const client: InstanceType<ApexProto["apex"]["v1"]["ApexService"]> =
      new apexProto.ApexService(API_URL, combinedCreds);

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
    const stream = (
      client.ChatCompletionStream as unknown as (
        request: unknown,
      ) => grpc.ClientReadableStream<{
        choices: { delta: { content: string } }[];
      }>
    )(request);

    // Handle stream events
    return new Promise<void>((resolve, reject) => {
      let fullResponse = "";

      stream.on(
        "data",
        (chunk: { choices?: { delta?: { content?: string } }[] }) => {
          const content = chunk.choices?.[0]?.delta?.content || "";
          fullResponse += content;
          console.log("Received chunk:", content);
        },
      );

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
