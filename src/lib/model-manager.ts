/**
 * Model Manager
 * Unified interface for managing multiple LLM providers
 * Provides abstraction layer for GPT-2, Ollama, OpenRouter, Groq, and OpenAI
 */

import { writable, derived, type Readable, type Writable } from 'svelte/store';
import {
  type ModelProvider,
  type ModelMetadata,
  type GenerateOptions,
  type GenerateResponse,
  type ConnectionStatus,
  type ProviderConfig,
  type ApiUsage,
  ModelProviderError
} from './model-types';
import { OllamaClient, ollamaClient } from './ollama-client';

// Model definitions with metadata - UPDATED April 2026 with latest models
export const AVAILABLE_MODELS: ModelMetadata[] = [
  {
    id: 'gpt2',
    name: 'GPT-2 Small',
    provider: 'gpt2',
    description: '124M parameter transformer model for text generation',
    parameters: '124M',
    contextWindow: 1024,
    supportsStreaming: false,
    supportsLogprobs: true,
    tags: ['openai', 'legacy', 'small']
  }
];

// Recommended Ollama models - April 2026 (from Ollama Library scrape)
export const RECOMMENDED_OLLAMA_MODELS: ModelMetadata[] = [
  {
    id: 'ollama:llama3.2',
    name: 'llama3.2',
    provider: 'ollama',
    description: 'Meta\'s Llama 3.2 - small but capable (1B and 3B models)',
    parameters: '3B',
    contextWindow: 128000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['meta', 'local', 'tools']
  },
  {
    id: 'ollama:llama3.1',
    name: 'llama3.1',
    provider: 'ollama',
    description: 'Llama 3.1 - state-of-the-art from Meta (8B, 70B, 405B)',
    parameters: '8B',
    contextWindow: 128000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['meta', 'local', 'tools']
  },
  {
    id: 'ollama:llama4',
    name: 'llama4',
    provider: 'ollama',
    description: 'Meta\'s latest multimodal models (16x17B, 128x17B MoE)',
    parameters: '17B',
    contextWindow: 256000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['meta', 'local', 'vision', 'tools', 'moe']
  },
  {
    id: 'ollama:gemma4',
    name: 'gemma4',
    provider: 'ollama',
    description: 'Google Gemma 4 - frontier-level performance, multimodal',
    parameters: '31B',
    contextWindow: 128000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['google', 'local', 'vision', 'tools', 'thinking', 'audio']
  },
  {
    id: 'ollama:gemma3',
    name: 'gemma3',
    provider: 'ollama',
    description: 'Google Gemma 3 - most capable single-GPU model',
    parameters: '27B',
    contextWindow: 128000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['google', 'local', 'vision']
  },
  {
    id: 'ollama:mistral',
    name: 'mistral',
    provider: 'ollama',
    description: 'Mistral AI 7B model - efficient and capable',
    parameters: '7B',
    contextWindow: 32000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['mistral', 'local']
  },
  {
    id: 'ollama:mistral-large-3',
    name: 'mistral-large-3',
    provider: 'ollama',
    description: 'Mistral Large 3 - enterprise multimodal MoE',
    parameters: '123B',
    contextWindow: 256000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['mistral', 'local', 'cloud', 'vision', 'tools', 'moe']
  },
  {
    id: 'ollama:deepseek-r1',
    name: 'deepseek-r1',
    provider: 'ollama',
    description: 'DeepSeek-R1 - open reasoning model (1.5B to 671B)',
    parameters: '32B',
    contextWindow: 64000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['deepseek', 'local', 'thinking', 'reasoning']
  },
  {
    id: 'ollama:deepseek-v3',
    name: 'deepseek-v3',
    provider: 'ollama',
    description: 'DeepSeek V3 - 671B MoE language model',
    parameters: '671B',
    contextWindow: 64000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['deepseek', 'local', 'moe']
  },
  {
    id: 'ollama:qwen3',
    name: 'qwen3',
    provider: 'ollama',
    description: 'Alibaba Qwen3 - dense and MoE models (0.6B to 235B)',
    parameters: '32B',
    contextWindow: 128000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['alibaba', 'local', 'tools', 'thinking']
  },
  {
    id: 'ollama:qwen3.5',
    name: 'qwen3.5',
    provider: 'ollama',
    description: 'Qwen 3.5 - multimodal with exceptional utility',
    parameters: '35B',
    contextWindow: 128000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['alibaba', 'local', 'cloud', 'vision', 'tools', 'thinking']
  },
  {
    id: 'ollama:phi4',
    name: 'phi4',
    provider: 'ollama',
    description: 'Microsoft Phi-4 - 14B state-of-the-art',
    parameters: '14B',
    contextWindow: 16000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['microsoft', 'local']
  },
  {
    id: 'ollama:nemotron-3-nano',
    name: 'nemotron-3-nano',
    provider: 'ollama',
    description: 'NVIDIA Nemotron 3 Nano - 4B agentic model',
    parameters: '4B',
    contextWindow: 128000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['nvidia', 'local', 'cloud', 'tools', 'thinking']
  },
  {
    id: 'ollama:granite4',
    name: 'granite4',
    provider: 'ollama',
    description: 'IBM Granite 4 - enterprise tool-calling',
    parameters: '3B',
    contextWindow: 128000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['ibm', 'local', 'tools']
  },
  // OLLAMA CLOUD MODELS
  {
    id: 'ollama:gpt-oss:120b-cloud',
    name: 'gpt-oss:120b-cloud',
    provider: 'ollama',
    description: 'OpenAI GPT-OSS 120B Cloud - powerful reasoning (Cloud)',
    parameters: '120B',
    contextWindow: 128000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['openai', 'cloud', 'thinking', 'tools'],
    quantization: 'cloud'
  },
  {
    id: 'ollama:gpt-oss:20b-cloud',
    name: 'gpt-oss:20b-cloud',
    provider: 'ollama',
    description: 'OpenAI GPT-OSS 20B Cloud - efficient reasoning (Cloud)',
    parameters: '20B',
    contextWindow: 128000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['openai', 'cloud', 'thinking', 'tools'],
    quantization: 'cloud'
  },
  {
    id: 'ollama:gemma4:26b-cloud',
    name: 'gemma4:26b-cloud',
    provider: 'ollama',
    description: 'Google Gemma 4 26B Cloud - frontier performance (Cloud)',
    parameters: '26B',
    contextWindow: 128000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['google', 'cloud', 'vision', 'thinking'],
    quantization: 'cloud'
  },
  {
    id: 'ollama:qwen3-coder:30b-cloud',
    name: 'qwen3-coder:30b-cloud',
    provider: 'ollama',
    description: 'Qwen3 Coder 30B Cloud - agentic coding (Cloud)',
    parameters: '30B',
    contextWindow: 128000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['alibaba', 'cloud', 'coding', 'agentic'],
    quantization: 'cloud'
  },
  {
    id: 'ollama:deepseek-v3.1:671b-cloud',
    name: 'deepseek-v3.1:671b-cloud',
    provider: 'ollama',
    description: 'DeepSeek V3.1 671B Cloud - hybrid thinking model (Cloud)',
    parameters: '671B',
    contextWindow: 64000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['deepseek', 'cloud', 'thinking', 'moe'],
    quantization: 'cloud'
  },
  {
    id: 'ollama:nemotron-3-super:120b-cloud',
    name: 'nemotron-3-super:120b-cloud',
    provider: 'ollama',
    description: 'NVIDIA Nemotron 3 Super 120B Cloud - open MoE (Cloud)',
    parameters: '120B',
    contextWindow: 128000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['nvidia', 'cloud', 'tools', 'thinking', 'moe'],
    quantization: 'cloud'
  },
  {
    id: 'ollama:mistral-large-3:cloud',
    name: 'mistral-large-3:cloud',
    provider: 'ollama',
    description: 'Mistral Large 3 Cloud - enterprise multimodal (Cloud)',
    parameters: '123B',
    contextWindow: 256000,
    supportsStreaming: true,
    supportsLogprobs: false,
    tags: ['mistral', 'cloud', 'vision', 'tools', 'moe'],
    quantization: 'cloud'
  }
];

// Default provider configurations
export const DEFAULT_PROVIDER_CONFIGS: Record<ModelProvider, ProviderConfig> = {
  gpt2: {
    enabled: true,
    defaultModel: 'gpt2'
  },
  ollama: {
    enabled: false,
    baseUrl: 'http://localhost:11434',
    defaultModel: 'llama3.2',
    apiKey: undefined // For Ollama Cloud API
  },
  openrouter: {
    enabled: false,
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-4o-mini'
  },
  groq: {
    enabled: false,
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.2-90b-vision-preview'
  },
  openai: {
    enabled: false,
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini'
  }
};

// Store types
export interface ModelManagerState {
  selectedModel: string;
  availableModels: ModelMetadata[];
  providerConfigs: Record<ModelProvider, ProviderConfig>;
  connectionStatus: Record<ModelProvider, ConnectionStatus>;
  isLoading: boolean;
  lastError: string | null;
}

// Create stores
function createModelManagerStore() {
  const { subscribe, set, update }: Writable<ModelManagerState> = writable({
    selectedModel: 'gpt2',
    availableModels: [...AVAILABLE_MODELS],
    providerConfigs: { ...DEFAULT_PROVIDER_CONFIGS },
    connectionStatus: {
      gpt2: 'connected',
      ollama: 'disconnected',
      openrouter: 'disconnected',
      groq: 'disconnected',
      openai: 'disconnected'
    },
    isLoading: false,
    lastError: null
  });

  return {
    subscribe,
    set,
    update,

    // Select a model by ID
    selectModel(modelId: string) {
      update((state) => ({
        ...state,
        selectedModel: modelId,
        lastError: null
      }));
    },

    // Update provider configuration
    updateProviderConfig(provider: ModelProvider, config: Partial<ProviderConfig>) {
      update((state) => ({
        ...state,
        providerConfigs: {
          ...state.providerConfigs,
          [provider]: {
            ...state.providerConfigs[provider],
            ...config
          }
        }
      }));
    },

    // Update connection status
    updateConnectionStatus(provider: ModelProvider, status: ConnectionStatus) {
      update((state) => ({
        ...state,
        connectionStatus: {
          ...state.connectionStatus,
          [provider]: status
        }
      }));
    },

    // Set loading state
    setLoading(loading: boolean) {
      update((state) => ({
        ...state,
        isLoading: loading
      }));
    },

    // Set error
    setError(error: string | null) {
      update((state) => ({
        ...state,
        lastError: error,
        isLoading: false
      }));
    },

    // Add available models (e.g., from Ollama)
    addAvailableModels(models: ModelMetadata[]) {
      update((state) => {
        const existingIds = new Set(state.availableModels.map((m) => m.id));
        const newModels = models.filter((m) => !existingIds.has(m.id));
        return {
          ...state,
          availableModels: [...state.availableModels, ...newModels]
        };
      });
    },

    // Remove models by provider
    removeModelsByProvider(provider: ModelProvider) {
      update((state) => ({
        ...state,
        availableModels: state.availableModels.filter((m) => m.provider !== provider)
      }));
    },

    // Reset to defaults
    reset() {
      set({
        selectedModel: 'gpt2',
        availableModels: [...AVAILABLE_MODELS],
        providerConfigs: { ...DEFAULT_PROVIDER_CONFIGS },
        connectionStatus: {
          gpt2: 'connected',
          ollama: 'disconnected',
          openrouter: 'disconnected',
          groq: 'disconnected',
          openai: 'disconnected'
        },
        isLoading: false,
        lastError: null
      });
    }
  };
}

// Create the store
export const modelManager = createModelManagerStore();

// Derived stores
export const selectedModelMetadata: Readable<ModelMetadata | undefined> = derived(
  modelManager,
  ($manager) => $manager.availableModels.find((m) => m.id === $manager.selectedModel)
);

export const ollamaModels: Readable<ModelMetadata[]> = derived(
  modelManager,
  ($manager) => $manager.availableModels.filter((m) => m.provider === 'ollama')
);

export const cloudModels: Readable<ModelMetadata[]> = derived(
  modelManager,
  ($manager) =>
    $manager.availableModels.filter(
      (m) => m.provider === 'openrouter' || m.provider === 'groq' || m.provider === 'openai'
    )
);

export const isOllamaConnected: Readable<boolean> = derived(
  modelManager,
  ($manager) => $manager.connectionStatus.ollama === 'connected'
);

export const enabledProviders: Readable<ModelProvider[]> = derived(
  modelManager,
  ($manager) =>
    Object.entries($manager.providerConfigs)
      .filter(([, config]) => config.enabled)
      .map(([provider]) => provider as ModelProvider)
);

// Model Manager Service
export class ModelManagerService {
  private ollamaClient: OllamaClient;
  private usageHistory: ApiUsage[] = [];

  constructor() {
    this.ollamaClient = ollamaClient;
  }

  /**
   * Check connection status for all enabled providers
   */
  async checkAllConnections(): Promise<void> {
    const state = this.getCurrentState();

    // Ollama connection check
    if (state.providerConfigs.ollama.enabled) {
      modelManager.updateConnectionStatus('ollama', 'checking');
      try {
        const status = await this.ollamaClient.checkHealth();
        modelManager.updateConnectionStatus('ollama', status);

        if (status === 'connected') {
          await this.refreshOllamaModels();
        } else if (status === 'disconnected') {
          modelManager.removeModelsByProvider('ollama');
        }
      } catch {
        modelManager.updateConnectionStatus('ollama', 'error');
        modelManager.removeModelsByProvider('ollama');
      }
    }

    // TODO: Add checks for OpenRouter, Groq, OpenAI in future phases
  }

  /**
   * Refresh Ollama models from the server
   */
  async refreshOllamaModels(): Promise<void> {
    try {
      modelManager.setLoading(true);
      const ollamaModels = await this.ollamaClient.listModels();
      const metadata = ollamaModels.map((m) => this.ollamaClient.toModelMetadata(m));

      // Remove old Ollama models and add new ones
      modelManager.removeModelsByProvider('ollama');
      modelManager.addAvailableModels(metadata);

      modelManager.setLoading(false);
    } catch (error) {
      modelManager.setLoading(false);
      modelManager.setError(
        error instanceof Error ? error.message : 'Failed to refresh Ollama models'
      );
      throw error;
    }
  }

  /**
   * Generate text using the selected model
   */
  async generate(prompt: string, options: GenerateOptions = {}): Promise<GenerateResponse> {
    const state = this.getCurrentState();
    const model = state.availableModels.find((m) => m.id === state.selectedModel);

    if (!model) {
      throw new ModelProviderError('Selected model not found', 'gpt2', 'MODEL_NOT_FOUND', false);
    }

    modelManager.setLoading(true);

    try {
      let response: GenerateResponse;

      switch (model.provider) {
        case 'ollama':
          response = await this.ollamaClient.generate(model.name, prompt, options);
          break;

        case 'gpt2':
          // GPT-2 is handled by the existing ONNX runtime
          throw new ModelProviderError(
            'GPT-2 generation should use existing ONNX runtime',
            'gpt2',
            'USE_ONNX_RUNTIME',
            false
          );

        case 'openrouter':
        case 'groq':
        case 'openai':
          throw new ModelProviderError(
            `${model.provider} integration not yet implemented`,
            model.provider,
            'NOT_IMPLEMENTED',
            false
          );

        default:
          throw new ModelProviderError(
            `Unknown provider: ${model.provider}`,
            model.provider,
            'UNKNOWN_PROVIDER',
            false
          );
      }

      // Track usage
      this.trackUsage({
        provider: model.provider,
        model: model.name,
        promptTokens: response.usage?.promptTokens || 0,
        completionTokens: response.usage?.completionTokens || 0,
        totalTokens: response.usage?.totalTokens || 0,
        cost: 0, // Calculate based on provider pricing
        timestamp: new Date(),
        requestId: crypto.randomUUID()
      });

      modelManager.setLoading(false);
      return response;
    } catch (error) {
      modelManager.setLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      modelManager.setError(errorMessage);
      throw error;
    }
  }

  /**
   * Track API usage
   */
  private trackUsage(usage: ApiUsage): void {
    this.usageHistory.push(usage);
    // Keep only last 1000 entries
    if (this.usageHistory.length > 1000) {
      this.usageHistory = this.usageHistory.slice(-1000);
    }
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): {
    totalRequests: number;
    totalTokens: number;
    byProvider: Record<ModelProvider, { requests: number; tokens: number }>;
  } {
    const byProvider: Record<ModelProvider, { requests: number; tokens: number }> = {
      gpt2: { requests: 0, tokens: 0 },
      ollama: { requests: 0, tokens: 0 },
      openrouter: { requests: 0, tokens: 0 },
      groq: { requests: 0, tokens: 0 },
      openai: { requests: 0, tokens: 0 }
    };

    for (const usage of this.usageHistory) {
      byProvider[usage.provider].requests++;
      byProvider[usage.provider].tokens += usage.totalTokens;
    }

    return {
      totalRequests: this.usageHistory.length,
      totalTokens: this.usageHistory.reduce((sum, u) => sum + u.totalTokens, 0),
      byProvider
    };
  }

  /**
   * Get current state from store
   */
  private getCurrentState(): ModelManagerState {
    let state: ModelManagerState | undefined;
    const unsubscribe = modelManager.subscribe((s) => {
      state = s;
    });
    unsubscribe();
    return state!;
  }

  /**
   * Enable/disable a provider
   */
  setProviderEnabled(provider: ModelProvider, enabled: boolean): void {
    modelManager.updateProviderConfig(provider, { enabled });

    if (enabled) {
      // Check connection when enabling
      if (provider === 'ollama') {
        this.checkAllConnections();
      }
    } else {
      // Remove models when disabling
      if (provider !== 'gpt2') {
        modelManager.removeModelsByProvider(provider);
      }
      modelManager.updateConnectionStatus(provider, 'disconnected');
    }
  }

  /**
   * Get recommended model based on use case
   */
  getRecommendedModel(useCase: 'fast' | 'accurate' | 'balanced'): string {
    const state = this.getCurrentState();

    switch (useCase) {
      case 'fast':
        // Prefer smaller models or Groq
        return (
          state.availableModels.find((m) => m.id.includes('groq') || m.parameters?.includes('7B'))
            ?.id || 'gpt2'
        );

      case 'accurate':
        // Prefer larger models
        return (
          state.availableModels.find(
            (m) =>
              m.provider === 'openrouter' ||
              m.provider === 'openai' ||
              m.parameters?.includes('70B')
          )?.id || 'gpt2'
        );

      case 'balanced':
      default:
        return 'gpt2';
    }
  }
}

// Export singleton instance
export const modelManagerService = new ModelManagerService();
