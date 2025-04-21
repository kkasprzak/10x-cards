import { z } from "zod";
import type { ModelParameters, Message, ModelConfig, ResponseType, OpenRouterResponse } from "./openrouter.types";
import { LoggerService } from "./services/logger.service";

const DEFAULT_RETRY_OPTIONS = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
  backoffFactor: 2,
};

const DEFAULT_RATE_LIMIT = {
  maxRequestsPerMinute: 60,
  maxConcurrentRequests: 5,
};

interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

interface RateLimitOptions {
  maxRequestsPerMinute: number;
  maxConcurrentRequests: number;
}

// OpenRouter Service class
export class OpenRouterService {
  private readonly _config: ModelConfig;
  private readonly _messageQueue: Message[] = [];
  private _systemMessage?: Message;
  private _userMessage?: Message;
  private readonly _retryOptions: RetryOptions;
  private readonly _rateLimitOptions: RateLimitOptions;
  private _requestTimestamps: number[] = [];
  private _activeRequests = 0;
  private readonly _logger: LoggerService;

  constructor(
    apiKey: string,
    model = "openai/gpt-4o-mini",
    apiUrl = "https://openrouter.ai/api/v1/chat/completions",
    parameters: ModelParameters = {
      temperature: 0.7,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
    },
    retryOptions: Partial<RetryOptions> = {},
    rateLimitOptions: Partial<RateLimitOptions> = {}
  ) {
    if (!apiKey) {
      throw new Error("API key is required");
    }

    this._config = {
      model,
      parameters,
      apiUrl,
      apiKey,
    };

    this._retryOptions = {
      ...DEFAULT_RETRY_OPTIONS,
      ...retryOptions,
    };

    this._rateLimitOptions = {
      ...DEFAULT_RATE_LIMIT,
      ...rateLimitOptions,
    };

    this._logger = LoggerService.getInstance();
  }

  // Public methods
  public getModel(): string {
    return this._config.model;
  }

  public async sendChatMessage(message: string): Promise<ResponseType> {
    try {
      this.setUserMessage(message);
      const response = await this._sendRequest();
      return this._handleAPIResponse(response);
    } catch (error) {
      this._logError(error as Error);
      throw error;
    }
  }

  public setSystemMessage(message: string): void {
    this._systemMessage = this._formatMessage("system", message);
  }

  public setUserMessage(message: string): void {
    this._userMessage = this._formatMessage("user", message);
  }

  public setResponseFormat(schema: Record<string, unknown>): void {
    // Validate schema before setting
    try {
      this._config.responseFormat = {
        type: "json_schema",
        json_schema: {
          name: "response",
          strict: true,
          schema,
        },
      };
    } catch {
      throw new Error("Invalid JSON schema format");
    }
  }

  public setModel(name: string, parameters?: ModelParameters): void {
    this._config.model = name;
    if (parameters) {
      this._config.parameters = { ...this._config.parameters, ...parameters };
    }
  }

  // Private helper methods
  private _formatMessage(role: "system" | "user" | "assistant", content: string): Message {
    return { role, content };
  }

  private async _waitForRateLimit(): Promise<void> {
    // Wait for concurrent requests limit
    while (this._activeRequests >= this._rateLimitOptions.maxConcurrentRequests) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      this._logger.warn("Waiting for concurrent requests limit", {
        activeRequests: this._activeRequests,
        maxConcurrentRequests: this._rateLimitOptions.maxConcurrentRequests,
      });
    }

    // Clean up old timestamps
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    this._requestTimestamps = this._requestTimestamps.filter((timestamp) => timestamp > oneMinuteAgo);

    // Wait for rate limit
    if (this._requestTimestamps.length >= this._rateLimitOptions.maxRequestsPerMinute) {
      const oldestTimestamp = this._requestTimestamps[0];
      const waitTime = Math.max(0, oldestTimestamp + 60000 - now);
      this._logger.warn("Rate limit reached, waiting", {
        waitTime,
        requestsInLastMinute: this._requestTimestamps.length,
        maxRequestsPerMinute: this._rateLimitOptions.maxRequestsPerMinute,
      });
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this._requestTimestamps.shift();
    }

    this._requestTimestamps.push(now);
  }

  private async _sendRequest(): Promise<OpenRouterResponse> {
    await this._waitForRateLimit();
    this._activeRequests++;

    try {
      const messages: Message[] = [];

      if (this._systemMessage) {
        messages.push(this._systemMessage);
      }

      if (this._userMessage) {
        messages.push(this._userMessage);
      }

      const payload = {
        model: this._config.model,
        messages,
        ...this._config.parameters,
        response_format: this._config.responseFormat,
      };

      if (!this._validatePayload(payload)) {
        throw new Error("Invalid request payload");
      }

      let lastError: Error | null = null;
      let delay = this._retryOptions.initialDelay;

      for (let attempt = 1; attempt <= this._retryOptions.maxRetries; attempt++) {
        try {
          const response = await fetch(this._config.apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this._config.apiKey}`,
              "HTTP-Referer": "https://10xdevs.com",
              "X-Title": "10x Devs",
            },
            body: JSON.stringify(payload),
          });

          // Only retry on specific status codes that indicate transient failures
          if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
            throw new Error(`API request failed with status: ${response.status}`);
          }

          if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
          }

          return await response.json();
        } catch (error) {
          lastError = error as Error;
          this._logError(lastError, attempt);

          if (attempt === this._retryOptions.maxRetries) {
            break;
          }

          // Exponential backoff with jitter
          const jitter = Math.random() * 200 - 100; // ±100ms
          await new Promise((resolve) => setTimeout(resolve, delay + jitter));
          delay = Math.min(delay * this._retryOptions.backoffFactor, this._retryOptions.maxDelay);
        }
      }

      throw new Error(
        `Failed to communicate with OpenRouter API after ${this._retryOptions.maxRetries} attempts. Last error: ${lastError?.message}`
      );
    } finally {
      this._activeRequests--;
    }
  }

  private _validatePayload(payload: unknown): boolean {
    const payloadSchema = z.object({
      model: z.string(),
      messages: z.array(
        z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string(),
        })
      ),
      temperature: z.number().optional(),
      top_p: z.number().optional(),
      frequency_penalty: z.number().optional(),
      presence_penalty: z.number().optional(),
      response_format: z
        .object({
          type: z.literal("json_schema"),
          json_schema: z.object({
            name: z.string(),
            strict: z.boolean(),
            schema: z.record(z.unknown()),
          }),
        })
        .optional(),
    });

    try {
      payloadSchema.parse(payload);
      return true;
    } catch {
      return false;
    }
  }

  private _handleAPIResponse(response: OpenRouterResponse): ResponseType {
    try {
      if (!response.choices?.[0]?.message?.content) {
        throw new Error("Invalid API response format");
      }

      return {
        content: response.choices[0].message.content,
      };
    } catch (error: unknown) {
      this._logError(error as Error);
      throw new Error("Failed to process API response");
    }
  }

  private _logError(error: Error, attempt?: number): void {
    this._logger.error(error.message, {
      model: this._config.model,
      attempt,
      timestamp: new Date().toISOString(),
    });
  }
}
