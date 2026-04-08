/**
 * Model Provider Stores
 * Svelte stores for managing model provider state
 */

import { writable, derived, type Readable } from 'svelte/store';
import {
  type ModelProvider,
  type ModelMetadata,
  type ConnectionStatus,
  type ComparisonState
} from '~/lib/model-types';

// ============================================================================
// Provider Configuration Stores
// ============================================================================

export interface ProviderState {
  enabled: boolean;
  apiKey: string | null;
  baseUrl: string | null;
  defaultModel: string | null;
}

const defaultProviderState: ProviderState = {
  enabled: false,
  apiKey: null,
  baseUrl: null,
  defaultModel: null
};

// Individual provider stores
export const ollamaProvider = writable<ProviderState>({
  ...defaultProviderState,
  baseUrl: 'http://localhost:11434',
  defaultModel: 'llama3.2'
});

export const openrouterProvider = writable<ProviderState>({
  ...defaultProviderState,
  baseUrl: 'https://openrouter.ai/api/v1',
  defaultModel: 'openai/gpt-4o-mini'
});

export const groqProvider = writable<ProviderState>({
  ...defaultProviderState,
  baseUrl: 'https://api.groq.com/openai/v1',
  defaultModel: 'llama-3.2-90b-vision-preview'
});

export const openaiProvider = writable<ProviderState>({
  ...defaultProviderState,
  baseUrl: 'https://api.openai.com/v1',
  defaultModel: 'gpt-4o-mini'
});

// ============================================================================
// Connection Status Stores
// ============================================================================

export const ollamaConnectionStatus = writable<ConnectionStatus>('disconnected');
export const openrouterConnectionStatus = writable<ConnectionStatus>('disconnected');
export const groqConnectionStatus = writable<ConnectionStatus>('disconnected');
export const openaiConnectionStatus = writable<ConnectionStatus>('disconnected');

// Combined connection status
export const allConnectionStatus: Readable<Record<ModelProvider, ConnectionStatus>> = derived(
  [
    ollamaConnectionStatus,
    openrouterConnectionStatus,
    groqConnectionStatus,
    openaiConnectionStatus
  ],
  ([$ollama, $openrouter, $groq, $openai]) => ({
    gpt2: 'connected' as ConnectionStatus, // GPT-2 is always available (local ONNX)
    ollama: $ollama,
    openrouter: $openrouter,
    groq: $groq,
    openai: $openai
  })
);

// Any provider connected (for UI indicators)
export const anyProviderConnected: Readable<boolean> = derived(
  allConnectionStatus,
  ($status) => Object.values($status).some((s) => s === 'connected')
);

// ============================================================================
// Model Selection Stores
// ============================================================================

// Currently selected model ID
export const selectedModelId = writable<string>('gpt2');

// Available models (populated from various providers)
export const availableModels = writable<ModelMetadata[]>([
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
]);

// Derived store for the currently selected model metadata
export const selectedModel: Readable<ModelMetadata | undefined> = derived(
  [selectedModelId, availableModels],
  ([$selectedId, $models]) => $models.find((m) => m.id === $selectedId)
);

// Derived stores for filtering by provider
export const ollamaModels: Readable<ModelMetadata[]> = derived(availableModels, ($models) =>
  $models.filter((m) => m.provider === 'ollama')
);

export const openrouterModels: Readable<ModelMetadata[]> = derived(availableModels, ($models) =>
  $models.filter((m) => m.provider === 'openrouter')
);

export const groqModels: Readable<ModelMetadata[]> = derived(availableModels, ($models) =>
  $models.filter((m) => m.provider === 'groq')
);

export const openaiModels: Readable<ModelMetadata[]> = derived(availableModels, ($models) =>
  $models.filter((m) => m.provider === 'openai')
);

// All cloud models (excluding local GPT-2 and Ollama)
export const cloudModels: Readable<ModelMetadata[]> = derived(availableModels, ($models) =>
  $models.filter((m) => ['openrouter', 'groq', 'openai'].includes(m.provider))
);

// ============================================================================
// Comparison Mode Stores
// ============================================================================

export const comparisonMode = writable<ComparisonState>({
  enabled: false,
  models: [],
  synchronized: true,
  highlightDifferences: true
});

// Derived store for whether comparison mode is active
export const isComparisonMode: Readable<boolean> = derived(
  comparisonMode,
  ($mode) => $mode.enabled && $mode.models.length >= 2
);

// Number of models being compared
export const comparisonModelCount: Readable<number> = derived(
  comparisonMode,
  ($mode) => ($mode.enabled ? $mode.models.length : 0)
);

// ============================================================================
// Loading & Error Stores
// ============================================================================

export const isModelLoading = writable<boolean>(false);
export const modelError = writable<string | null>(null);

// ============================================================================
// API Usage Tracking Stores
// ============================================================================

export interface UsageStats {
  provider: ModelProvider;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  timestamp: Date;
}

export const usageHistory = writable<UsageStats[]>([]);

// Derived stats
export const totalRequests: Readable<number> = derived(usageHistory, ($history) =>
  $history.length
);

export const totalTokensUsed: Readable<number> = derived(usageHistory, ($history) =>
  $history.reduce((sum, h) => sum + h.totalTokens, 0)
);

export const estimatedCost: Readable<number> = derived(usageHistory, ($history) =>
  $history.reduce((sum, h) => sum + h.cost, 0)
);

// Usage by provider
export const usageByProvider: Readable<Record<ModelProvider, { requests: number; tokens: number; cost: number }>> =
  derived(usageHistory, ($history) => {
    const stats: Record<ModelProvider, { requests: number; tokens: number; cost: number }> = {
      gpt2: { requests: 0, tokens: 0, cost: 0 },
      ollama: { requests: 0, tokens: 0, cost: 0 },
      openrouter: { requests: 0, tokens: 0, cost: 0 },
      groq: { requests: 0, tokens: 0, cost: 0 },
      openai: { requests: 0, tokens: 0, cost: 0 }
    };

    for (const usage of $history) {
      stats[usage.provider].requests++;
      stats[usage.provider].tokens += usage.totalTokens;
      stats[usage.provider].cost += usage.cost;
    }

    return stats;
  });

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Add a model to the available models list
 */
export function addModel(model: ModelMetadata): void {
  availableModels.update((models) => {
    // Remove existing model with same ID
    const filtered = models.filter((m) => m.id !== model.id);
    return [...filtered, model];
  });
}

/**
 * Remove a model by ID
 */
export function removeModel(modelId: string): void {
  availableModels.update((models) => models.filter((m) => m.id !== modelId));
}

/**
 * Remove all models from a specific provider
 */
export function removeModelsByProvider(provider: ModelProvider): void {
  availableModels.update((models) => models.filter((m) => m.provider !== provider));
}

/**
 * Add usage to history
 */
export function trackUsage(usage: UsageStats): void {
  usageHistory.update((history) => {
    const newHistory = [...history, usage];
    // Keep only last 1000 entries to prevent memory bloat
    return newHistory.length > 1000 ? newHistory.slice(-1000) : newHistory;
  });
}

/**
 * Reset all stores to defaults
 */
export function resetProviderStores(): void {
  ollamaProvider.set({
    ...defaultProviderState,
    baseUrl: 'http://localhost:11434',
    defaultModel: 'llama3.2'
  });
  openrouterProvider.set({
    ...defaultProviderState,
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-4o-mini'
  });
  groqProvider.set({
    ...defaultProviderState,
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.2-90b-vision-preview'
  });
  openaiProvider.set({
    ...defaultProviderState,
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini'
  });

  ollamaConnectionStatus.set('disconnected');
  openrouterConnectionStatus.set('disconnected');
  groqConnectionStatus.set('disconnected');
  openaiConnectionStatus.set('disconnected');

  selectedModelId.set('gpt2');
  availableModels.set([
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
  ]);

  comparisonMode.set({
    enabled: false,
    models: [],
    synchronized: true,
    highlightDifferences: true
  });

  isModelLoading.set(false);
  modelError.set(null);
  usageHistory.set([]);
}

/**
 * Enable/disable comparison mode
 */
export function setComparisonMode(enabled: boolean, modelIds?: string[]): void {
  comparisonMode.update((mode) => {
    let currentModelId = 'gpt2';
    const unsubscribe = selectedModelId.subscribe((id) => {
      currentModelId = id;
    });
    unsubscribe();
    return {
      ...mode,
      enabled,
      models: modelIds || (enabled ? [currentModelId] : [])
    };
  });
}

/**
 * Add a model to comparison
 */
export function addModelToComparison(modelId: string): void {
  comparisonMode.update((mode) => {
    if (!mode.enabled) {
      return { ...mode, enabled: true, models: [modelId] };
    }
    if (!mode.models.includes(modelId)) {
      return { ...mode, models: [...mode.models, modelId] };
    }
    return mode;
  });
}

/**
 * Remove a model from comparison
 */
export function removeModelFromComparison(modelId: string): void {
  comparisonMode.update((mode) => ({
    ...mode,
    models: mode.models.filter((id) => id !== modelId),
    enabled: mode.models.filter((id) => id !== modelId).length >= 2
  }));
}
