export interface ModelParameters {
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelConfig {
  model: string;
  parameters: ModelParameters;
  apiUrl: string;
  apiKey: string;
  responseFormat?: {
    type: "json_schema";
    json_schema: {
      name: string;
      strict: boolean;
      schema: Record<string, unknown>;
    };
  };
}

export interface ResponseType {
  content: string;
  error?: string;
}

export interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}
