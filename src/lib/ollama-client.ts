/**
 * Ollama Client
 * API wrapper for local Ollama LLM server AND Ollama Cloud API
 * Provides model listing, generation, and health checking for both local and cloud
 */

import {
  type GenerateOptions,
  type GenerateResponse,
  type OllamaModelInfo,
  type OllamaTagsResponse,
  type ConnectionStatus,
  type ModelMetadata,
  type Message,
  ConnectionError,
  ModelProviderError
} from './model-types';

// Default Ollama configuration
const DEFAULT_BASE_URL = 'http://localhost:11434';
const OLLAMA_CLOUD_URL = 'https://ollama.com';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const REQUEST_TIMEOUT = 120000; // 120 seconds for generation (cloud models can be slower)

export interface OllamaClientConfig {
  baseUrl?: string;
  timeout?: number;
  apiKey?: string; // For Ollama Cloud API (OLLAMA_API_KEY)
  isCloud?: boolean; // Whether to use Ollama Cloud
}

export class OllamaClient {
  private baseUrl: string;
  private timeout: number;
  private apiKey: string | undefined;
  private isCloud: boolean;
  private abortController: AbortController | null = null;

  constructor(config: OllamaClientConfig = {}) {
    this.isCloud = config.isCloud || false;
    this.apiKey = config.apiKey;
    
    // Use Ollama Cloud URL if isCloud is true, otherwise use local or custom URL
    if (this.isCloud) {
      this.baseUrl = OLLAMA_CLOUD_URL;
    } else {
      this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    }
    
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
  }

  /**
   * Check if this client is configured for Ollama Cloud
   */
  isCloudClient(): boolean {
    return this.isCloud;
  }

  /**
   * Get the base URL being used
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get headers for API requests (includes auth for cloud)
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Add Authorization header for Ollama Cloud
    if (this.isCloud && this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    
    return headers;
  }

  /**
   * Check if Ollama server is reachable (local) or if cloud API is accessible
   */
  async checkHealth(): Promise<ConnectionStatus> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // For cloud, use /api/tags with auth; for local, same endpoint without auth
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return 'connected';
      }
      
      // Cloud specific error handling
      if (this.isCloud && response.status === 401) {
        return 'error'; // Unauthorized - need valid API key
      }
      
      return 'error';
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return 'error';
        }
        if (error.message.includes('fetch')) {
          return this.isCloud ? 'error' : 'disconnected';
        }
      }
      return 'error';
    }
  }

  /**
   * List all available models from Ollama (local or cloud)
   */
  async listModels(): Promise<OllamaModelInfo[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorMsg = this.isCloud 
          ? `Failed to list models from Ollama Cloud: ${response.status} ${response.statusText}`
          : `Failed to list models: ${response.status} ${response.statusText}`;
        throw new ConnectionError('ollama', errorMsg);
      }

      const data: OllamaTagsResponse = await response.json();
      return data.models || [];
    } catch (error) {
      if (error instanceof ModelProviderError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ConnectionError('ollama', this.isCloud ? 'Ollama Cloud request timed out' : 'Request timed out');
      }
      throw new ConnectionError(
        'ollama',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Convert Ollama model info to standardized metadata
   */
  toModelMetadata(modelInfo: OllamaModelInfo): ModelMetadata {
    const details = modelInfo.details || {};
    
    // Detect if this is a cloud model by name
    const isCloudModel = modelInfo.name.includes('-cloud') || modelInfo.name.includes(':cloud');

    return {
      id: `ollama:${modelInfo.name}`,
      name: modelInfo.name,
      provider: 'ollama',
      description: `${details.family || 'Unknown'} model${isCloudModel ? ' (Cloud)' : ''}`,
      parameters: details.parameter_size,
      quantization: isCloudModel ? 'cloud' : details.quantization_level,
      tags: details.families || (details.family ? [details.family] : []),
      supportsStreaming: true,
      supportsLogprobs: false // Ollama doesn't expose logprobs yet
    };
  }

  /**
   * Generate text using an Ollama model (local or cloud)
   */
  async generate(
    model: string,
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<GenerateResponse> {
    this.abortController = new AbortController();
    const timeoutId = setTimeout(
      () => this.abortController?.abort(),
      this.isCloud ? REQUEST_TIMEOUT * 2 : REQUEST_TIMEOUT // Longer timeout for cloud
    );

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: options.temperature ?? 0.7,
            top_k: options.topK,
            top_p: options.topP,
            num_predict: options.maxTokens,
            stop: options.stop,
            seed: options.seed
          }
        }),
        signal: this.abortController.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new ModelProviderError(
          this.isCloud 
            ? `Ollama Cloud generation failed: ${response.status} ${errorText}`
            : `Ollama generation failed: ${response.status} ${errorText}`,
          'ollama',
          `HTTP_${response.status}`,
          response.status === 429 // Retryable if rate limited
        );
      }

      const data = await response.json();

      return {
        text: data.response || '',
        model: data.model || model,
        provider: 'ollama',
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        },
        timing: {
          totalDuration: data.total_duration || 0,
          loadDuration: data.load_duration,
          promptEvalDuration: data.prompt_eval_duration,
          evalDuration: data.eval_duration
        }
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ModelProviderError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ModelProviderError(
            this.isCloud 
              ? 'Ollama Cloud request was cancelled or timed out'
              : 'Generation request was cancelled or timed out',
            'ollama',
            'ABORTED',
            true
          );
        }
        throw new ModelProviderError(
          error.message,
          'ollama',
          'GENERATION_ERROR',
          false
        );
      }

      throw new ModelProviderError(
        'Unknown error during generation',
        'ollama',
        'UNKNOWN',
        false
      );
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Chat completion using Ollama chat API (supports messages format)
   * Works for both local and cloud
   */
  async chat(
    model: string,
    messages: Message[],
    options: GenerateOptions = {}
  ): Promise<GenerateResponse> {
    this.abortController = new AbortController();
    const timeoutId = setTimeout(
      () => this.abortController?.abort(),
      this.isCloud ? REQUEST_TIMEOUT * 2 : REQUEST_TIMEOUT
    );

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: {
            temperature: options.temperature ?? 0.7,
            top_k: options.topK,
            top_p: options.topP,
            num_predict: options.maxTokens,
            stop: options.stop,
            seed: options.seed
          }
        }),
        signal: this.abortController.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new ModelProviderError(
          `Ollama chat failed: ${response.status} ${errorText}`,
          'ollama',
          `HTTP_${response.status}`,
          response.status === 429
        );
      }

      const data = await response.json();

      return {
        text: data.message?.content || '',
        model: data.model || model,
        provider: 'ollama',
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        },
        timing: {
          totalDuration: data.total_duration || 0,
          loadDuration: data.load_duration,
          promptEvalDuration: data.prompt_eval_duration,
          evalDuration: data.eval_duration
        }
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ModelProviderError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ModelProviderError(
            'Chat request was cancelled or timed out',
            'ollama',
            'ABORTED',
            true
          );
        }
        throw new ModelProviderError(
          error.message,
          'ollama',
          'CHAT_ERROR',
          false
        );
      }

      throw new ModelProviderError(
        'Unknown error during chat',
        'ollama',
        'UNKNOWN',
        false
      );
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Cancel the current generation request
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Check if a specific model is available
   */
  async isModelAvailable(modelName: string): Promise<boolean> {
    try {
      const models = await this.listModels();
      return models.some((m) => m.name === modelName);
    } catch {
      return false;
    }
  }

  /**
   * Pull a model from Ollama registry (requires Ollama 0.1.24+)
   * Note: Cloud models don't need to be pulled, they run on Ollama's infrastructure
   */
  async pullModel(
    modelName: string,
    onProgress?: (progress: { status: string; completed?: number; total?: number }) => void
  ): Promise<void> {
    // Cloud models don't need to be pulled
    if (this.isCloud) {
      throw new ModelProviderError(
        'Cloud models do not need to be pulled. They run on Ollama\'s infrastructure.',
        'ollama',
        'CLOUD_NO_PULL',
        false
      );
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          name: modelName,
          stream: false
        })
      });

      if (!response.ok) {
        throw new ModelProviderError(
          `Failed to pull model: ${response.statusText}`,
          'ollama',
          'PULL_ERROR',
          false
        );
      }

      const data = await response.json();

      if (data.status !== 'success') {
        throw new ModelProviderError(
          `Model pull failed: ${data.status}`,
          'ollama',
          'PULL_FAILED',
          false
        );
      }
    } catch (error) {
      if (error instanceof ModelProviderError) {
        throw error;
      }
      throw new ModelProviderError(
        error instanceof Error ? error.message : 'Unknown error pulling model',
        'ollama',
        'PULL_ERROR',
        false
      );
    }
  }

  /**
   * Get model information
   */
  async getModelInfo(modelName: string): Promise<OllamaModelInfo | null> {
    try {
      const models = await this.listModels();
      return models.find((m) => m.name === modelName) || null;
    } catch {
      return null;
    }
  }

  /**
   * Format model size for display
   */
  static formatModelSize(bytes: number): string {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) {
      return `${gb.toFixed(1)} GB`;
    }
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  }

  /**
   * Get recommended models for educational use
   * Updated April 2026 with latest models from Ollama Library
   */
  static getRecommendedModels(): string[] {
    return [
      // Local models
      'llama3.2',
      'llama3.1',
      'llama4',
      'gemma3',
      'gemma4',
      'mistral',
      'mistral-large-3',
      'deepseek-r1',
      'deepseek-v3',
      'qwen3',
      'qwen3.5',
      'phi4',
      'nemotron-3-nano',
      'granite4',
      // Cloud models
      'gpt-oss:20b-cloud',
      'gpt-oss:120b-cloud',
      'gemma4:26b-cloud',
      'qwen3-coder:30b-cloud',
      'deepseek-v3.1:671b-cloud',
      'nemotron-3-super:120b-cloud',
      'mistral-large-3:cloud'
    ];
  }

  /**
   * Get recommended cloud models (for users without powerful GPUs)
   */
  static getRecommendedCloudModels(): string[] {
    return [
      'gpt-oss:20b-cloud',
      'gpt-oss:120b-cloud',
      'gemma4:26b-cloud',
      'qwen3-coder:30b-cloud',
      'deepseek-v3.1:671b-cloud',
      'nemotron-3-super:120b-cloud',
      'mistral-large-3:cloud'
    ];
  }

  /**
   * Create a cloud client instance
   */
  static createCloudClient(apiKey?: string): OllamaClient {
    return new OllamaClient({
      isCloud: true,
      apiKey,
      timeout: 120000 // 2 minute timeout for cloud
    });
  }
}

// Export singleton instance for convenience (local by default)
export const ollamaClient = new OllamaClient();

// Export cloud client factory
export const createOllamaCloudClient = (apiKey?: string) => OllamaClient.createCloudClient(apiKey);
