import { ApexClient } from "./Client";
import {
  ChatCompletionRequest,
  ChatMessage,
  SamplingParameters,
  SubmitDeepResearcherJobResponse,
  GetDeepResearcherJobResponse,
} from "../../generated/apex/v1/apex";

/** interface for input parameters that can be defined by the user */
export interface DeepResearchJobParams {
  /** The messages to generate completions for */
  messages: ChatMessage[];
  /** The miner UIDs that will be used to generate the completion */
  uids?: number[];
  /** The LLM name to use for the completion */
  model?: string;
  /** The seed to use for the completion */
  seed?: number;
  /** The sampling parameters to use for the completion */
  samplingParameters?: SamplingParameters;
}

export class DeepResearch {
  private client: ApexClient;

  // Default sampling parameters for deep research
  private readonly defaultSamplingParameters: SamplingParameters = {
    temperature: 0.7,
    topP: 0.95,
    maxNewTokens: 8192,
    doSample: false,
  };

  constructor(client: ApexClient) {
    this.client = client;
  }

  /**
   * Create a deep research job with proper defaults
   */
  async createJob(
    params: DeepResearchJobParams,
  ): Promise<SubmitDeepResearcherJobResponse> {
    const request: ChatCompletionRequest = {
      // User configurable fields
      messages: params.messages,
      uids: params.uids ?? [], // Default to empty array if not provided
      model: params.model,
      seed: params.seed,
      samplingParameters:
        params.samplingParameters ?? this.defaultSamplingParameters,

      // Required internal fields for Deep Researcher
      task: "InferenceTask",
      mixture: false,
      inferenceMode: "Chain-of-Thought",
      stream: true,
    };

    return this.client.submitDeepResearcherJob(request);
  }

  /**
   * Get the status and results of a deep research job
   */
  async getJobResults(jobId: string): Promise<GetDeepResearcherJobResponse> {
    return this.client.getDeepResearcherJob({ jobId });
  }
}
