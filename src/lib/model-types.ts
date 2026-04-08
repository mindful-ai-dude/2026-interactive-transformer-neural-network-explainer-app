/**
 * Model Types for LLM Integration
 * Defines shared interfaces for all model providers
 */

// Model provider types
export type ModelProvider = 'gpt2' | 'ollama' | 'openrouter' | 'groq' | 'openai';

// Connection status
export type ConnectionStatus = 'connected' | 'disconnected' | 'checking' | 'error';

// Model metadata interface
export interface ModelMetadata {
  id: string;
  name: string;
  provider: ModelProvider;
  description?: string;
  parameters?: string;
  contextWindow?: number;
  quantization?: string;
  tags?: string[];
  supportsStreaming?: boolean;
  supportsLogprobs?: boolean;
}

// Ollama-specific types
export interface OllamaModelInfo {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model?: string;
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}

export interface OllamaTagsResponse {
  models: OllamaModelInfo[];
}

// Generation options
export interface GenerateOptions {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxTokens?: number;
  stop?: string[];
  seed?: number;
}

// Token probability for visualization
export interface TokenProbability {
  token: string;
  probability: number;
  tokenId?: number;
}

// Generation response
export interface GenerateResponse {
  text: string;
  model: string;
  provider: ModelProvider;
  tokens?: TokenProbability[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  timing?: {
    totalDuration: number;
    loadDuration?: number;
    promptEvalDuration?: number;
    evalDuration?: number;
  };
}

// Message for chat-based APIs
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Chat completion options
export interface ChatOptions extends GenerateOptions {
  messages: Message[];
}

// Chat response
export interface ChatResponse extends GenerateResponse {
  choices: {
    message: Message;
    finishReason: string;
    index: number;
  }[];
}

// Provider configuration
export interface ProviderConfig {
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  rateLimit?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

// API usage tracking
export interface ApiUsage {
  provider: ModelProvider;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  timestamp: Date;
  requestId: string;
}

// Comparison mode state
export interface ComparisonState {
  enabled: boolean;
  models: string[]; // Array of model IDs to compare
  synchronized: boolean;
  highlightDifferences: boolean;
}

// Attention data for visualization
export interface AttentionData {
  tokens: string[];
  matrices: number[][][]; // [layer][head][token][token]
  model: string;
  provider: ModelProvider;
}

// Error types
export class ModelProviderError extends Error {
  constructor(
    message: string,
    public provider: ModelProvider,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ModelProviderError';
  }
}

export class ConnectionError extends ModelProviderError {
  constructor(provider: ModelProvider, message: string = 'Connection failed') {
    super(message, provider, 'CONNECTION_ERROR', true);
    this.name = 'ConnectionError';
  }
}

export class RateLimitError extends ModelProviderError {
  retryAfter?: number;

  constructor(provider: ModelProvider, retryAfter?: number) {
    super(
      `Rate limit exceeded for ${provider}`,
      provider,
      'RATE_LIMIT',
      true
    );
    this.name = 'RateLimitError';
    if (retryAfter) {
      this.retryAfter = retryAfter;
    }
  }
}
