<!--
  ModelSelector Component
  Dropdown for selecting between GPT-2, Ollama (Local), Ollama Cloud, and OpenRouter models
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import SettingsModal from './SettingsModal.svelte';
  import {
    selectedModelId,
    availableModels,
    ollamaModels,
    cloudModels,
    isModelLoading,
    modelError,
    ollamaProvider
  } from '~/store/modelProviders';
  import { ollamaClient } from '~/lib/ollama-client';
  import { RECOMMENDED_OLLAMA_MODELS } from '~/lib/model-manager';
  import type { ModelMetadata } from '~/lib/model-types';

  // OpenRouter Models
  const OPENROUTER_MODELS: ModelMetadata[] = [
    {
      id: 'openrouter:gpt-5.4',
      name: 'GPT-5.4',
      provider: 'openrouter',
      description: 'OpenAI GPT-5.4 - most advanced model',
      parameters: 'Advanced',
      contextWindow: 400000,
      supportsStreaming: true,
      tags: ['openai', 'advanced']
    },
    {
      id: 'openrouter:claude-4.6-opus',
      name: 'Claude 4.6 Opus',
      provider: 'openrouter',
      description: 'Anthropic Claude 4.6 Opus - reasoning specialist',
      parameters: 'Advanced',
      contextWindow: 200000,
      supportsStreaming: true,
      tags: ['anthropic', 'reasoning']
    },
    {
      id: 'openrouter:gemini-3.1-pro',
      name: 'Gemini 3.1 Pro',
      provider: 'openrouter',
      description: 'Google Gemini 3.1 Pro - 1M context',
      parameters: 'Advanced',
      contextWindow: 1000000,
      supportsStreaming: true,
      tags: ['google', 'long-context']
    },
    {
      id: 'openrouter:llama-4',
      name: 'Llama 4',
      provider: 'openrouter',
      description: 'Meta Llama 4 via OpenRouter',
      parameters: '70B',
      contextWindow: 128000,
      supportsStreaming: true,
      tags: ['meta', 'open']
    }
  ];

  // Props
  interface Props {
    showOllamaSetup?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'minimal';
  }

  let {
    showOllamaSetup = $bindable(false),
    disabled = false,
    size = 'md',
    variant = 'default'
  }: Props = $props();

  // Local state
  let isOpen = $state(false);
  let isRefreshing = $state(false);
  let isSettingsOpen = $state(false);
  let selectedModel = $derived($availableModels.find((m) => m.id === $selectedModelId));

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  };

  // Group models by provider
  const groupedModels = $derived({
    gpt2: $availableModels.filter((m) => m.provider === 'gpt2'),
    ollama: $ollamaModels.filter(m => m.quantization !== 'cloud'),
    cloud: $cloudModels
  });

  // Get provider icon
  function getProviderIcon(provider: string): string {
    switch (provider) {
      case 'gpt2': return '🧠';
      case 'ollama': return '🦙';
      case 'openrouter': return '🔌';
      case 'groq': return '⚡';
      case 'openai': return '🤖';
      default: return '🔮';
    }
  }

  // Get provider color
  function getProviderColor(provider: string): string {
    switch (provider) {
      case 'gpt2': return 'text-blue-500';
      case 'ollama': return 'text-purple-500';
      case 'openrouter': return 'text-green-500';
      case 'groq': return 'text-yellow-500';
      case 'openai': return 'text-teal-500';
      default: return 'text-gray-500';
    }
  }

  // Get style for selected model
  let selectedModelIcon = $derived(selectedModel ? getProviderIcon(selectedModel.provider) : '');
  let selectedModelColor = $derived(selectedModel ? getProviderColor(selectedModel.provider) : '');

  // Handle model selection
  function selectModel(modelId: string) {
    selectedModelId.set(modelId);
    isOpen = false;
  }

  // Open settings modal
  function openSettings() {
    isSettingsOpen = true;
  }

  // Close settings modal
  function closeSettings() {
    isSettingsOpen = false;
  }

  // Refresh Ollama models
  async function refreshOllamaModels() {
    isRefreshing = true;
    try {
      const models = await ollamaClient.listModels();
      const metadata = models.map((m) => ollamaClient.toModelMetadata(m));

      availableModels.update((current) => {
        const nonOllama = current.filter((m) => m.provider !== 'ollama');
        return [...nonOllama, ...metadata];
      });
    } catch (error) {
      console.error('Failed to refresh Ollama models:', error);
      showOllamaSetup = true;
    } finally {
      isRefreshing = false;
    }
  }

  // Enable/disable Ollama
  function toggleOllama(enabled: boolean) {
    ollamaProvider.update((config) => ({ ...config, enabled }));
    if (enabled) {
      refreshOllamaModels();
    } else {
      availableModels.update((current) =>
        current.filter((m) => m.provider !== 'ollama')
      );
    }
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.model-selector')) {
      isOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  // Format model parameters for display
  function formatParams(params?: string): string {
    if (!params) return '';
    return params;
  }
</script>

<div class="model-selector relative inline-block {variant === 'minimal' ? '' : 'w-full max-w-xs'}"
>
  <!-- Trigger Button -->
  <button
    type="button"
    class="w-full flex items-center justify-between gap-2 rounded-lg border border-gray-200
           bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2
           focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
           {sizeClasses[size]}"
    {disabled}
    onclick={() => (isOpen = !isOpen)}
    aria-expanded={isOpen}
    aria-haspopup="listbox"
  >
    <div class="flex items-center gap-2 overflow-hidden">
      {#if selectedModel}
        <span class="flex-shrink-0" aria-hidden="true">{selectedModelIcon}</span>
        <span class="truncate font-medium {selectedModelColor}">
          {selectedModel.name}
        </span>
        {#if selectedModel.parameters}
          <span class="text-gray-400 text-xs flex-shrink-0">
            ({formatParams(selectedModel.parameters)})
          </span>
        {/if}
      {:else}
        <span class="text-gray-500">Select a model...</span>
      {/if}
    </div>

    <svg
      class="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform {isOpen ? 'rotate-180' : ''}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  <!-- Dropdown Menu -->
  {#if isOpen}
    <div
      class="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200
             max-h-96 overflow-auto"
      role="listbox"
    >
      <!-- GPT-2 (Always Available) -->
      {#if groupedModels.gpt2.length > 0}
        <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Local ONNX
        </div>
        {#each groupedModels.gpt2 as model}
          <button
            type="button"
            class="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50
                   focus:outline-none flex items-center gap-2
                   {$selectedModelId === model.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}"
            onclick={() => selectModel(model.id)}
            role="option"
            aria-selected={$selectedModelId === model.id}
          >
            <span>{getProviderIcon(model.provider)}</span>
            <div class="flex-1 min-w-0">
              <div class="font-medium truncate">{model.name}</div>
              {#if model.description}
                <div class="text-xs text-gray-500 truncate">{model.description}</div>
              {/if}
            </div>
            {#if $selectedModelId === model.id}
              <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            {/if}
          </button>
        {/each}
      {/if}

      <!-- Ollama Local Section -->
      <div class="border-t border-gray-100">
        <div
          class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider
                 flex items-center justify-between"
        >
          <span>🦙 Ollama (Local)</span>
          <button
            type="button"
            class="text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
            onclick={(e) => {
              e.stopPropagation();
              toggleOllama(!$ollamaProvider.enabled);
            }}
          >
            {$ollamaProvider.enabled ? 'Disable' : 'Enable'}
          </button>
        </div>

        {#if $ollamaProvider.enabled}
          {#if isRefreshing}
            <div class="px-3 py-4 text-center text-gray-500">
              <svg
                class="animate-spin h-5 w-5 mx-auto mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading models...
            </div>
          {:else if groupedModels.ollama.length === 0}
            <div class="px-3 py-4 text-center">
              <p class="text-sm text-gray-500 mb-2">No Ollama models found</p>
              <button
                type="button"
                class="text-xs text-blue-600 hover:text-blue-800 underline"
                onclick={(e) => {
                  e.stopPropagation();
                  showOllamaSetup = true;
                }}
              >
                How to set up Ollama →
              </button>
            </div>
          {:else}
            {#each groupedModels.ollama as model}
              <button
                type="button"
                class="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50
                       focus:outline-none flex items-center gap-2
                       {$selectedModelId === model.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}"
                onclick={() => selectModel(model.id)}
                role="option"
                aria-selected={$selectedModelId === model.id}
              >
                <span>{getProviderIcon(model.provider)}</span>
                <div class="flex-1 min-w-0">
                  <div class="font-medium truncate">{model.name}</div>
                  {#if model.parameters || model.quantization}
                    <div class="text-xs text-gray-500">
                      {formatParams(model.parameters)}
                      {#if model.quantization}• {model.quantization}{/if}
                    </div>
                  {/if}
                </div>
                {#if $selectedModelId === model.id}
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                {/if}
              </button>
            {/each}
          {/if}
        {:else}
          <div class="px-3 py-3 text-sm text-gray-500 text-center">Enable to connect to local Ollama</div>
        {/if}
      </div>

      <!-- Ollama Cloud Section -->
      <div class="border-t border-gray-100">
        <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
          <span>☁️ Ollama Cloud</span>
          <button type="button" class="text-xs text-blue-600 hover:text-blue-800"
            onclick={() => openSettings()}>
            Configure
          </button>
        </div>
        <div class="px-3 py-1 text-xs text-gray-500">Run large models without a GPU</div>
        
        {#each RECOMMENDED_OLLAMA_MODELS.filter(m => m.quantization === 'cloud') as model}
          <button type="button" class="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2"
            onclick={() => selectModel(model.id)}>
            <span>☁️</span>
            <div class="flex-1">
              <div class="font-medium truncate">{model.name}</div>
              <div class="text-xs text-gray-500">{model.parameters} • Cloud</div>
            </div>
          </button>
        {/each}
      </div>

      <!-- OpenRouter Section -->
      <div class="border-t border-gray-100">
        <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
          <span>🔌 OpenRouter</span>
          <button type="button" class="text-xs text-blue-600 hover:text-blue-800"
            onclick={() => openSettings()}>
            Configure
          </button>
        </div>
        <div class="px-3 py-1 text-xs text-gray-500">Access 100+ models including GPT-4, Claude</div>
        
        {#each OPENROUTER_MODELS as model}
          <button type="button" class="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2"
            onclick={() => selectModel(model.id)}>
            <span>{model.provider === 'openai' ? '🤖' : '🧠'}</span>
            <div class="flex-1">
              <div class="font-medium truncate">{model.name}</div>
              <div class="text-xs text-gray-500 truncate">{model.description}</div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  {#if $modelError}
    <div class="absolute z-50 w-full mt-1 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{$modelError}</div>
  {/if}
</div>

<!-- Settings Modal -->
<SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />

<style lang="scss">
  .model-selector {
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 3px; }
  }
</style>
