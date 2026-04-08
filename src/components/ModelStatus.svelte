<!--
  ModelStatus Component
  Connection status indicator for model providers (Ollama, OpenRouter, etc.)
-->
<script lang="ts">
  import {
    allConnectionStatus,
    anyProviderConnected,
    ollamaConnectionStatus
  } from '~/store/modelProviders';
  import type { ConnectionStatus, ModelProvider } from '~/lib/model-types';

  // Props
  interface Props {
    provider?: ModelProvider;
    showLabel?: boolean;
    showTooltip?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'dot' | 'badge' | 'card';
  }

  let {
    provider = 'ollama',
    showLabel = true,
    showTooltip = true,
    size = 'md',
    variant = 'dot'
  }: Props = $props();

  // Get status for specific provider or overall
  let status = $derived(
    provider === 'ollama'
      ? $ollamaConnectionStatus
      : $allConnectionStatus[provider] || 'disconnected'
  );

  // Status configurations
  const statusConfig: Record<
    ConnectionStatus,
    { label: string; color: string; bg: string; icon: string }
  > = {
    connected: {
      label: 'Connected',
      color: 'text-green-600',
      bg: 'bg-green-500',
      icon: '✓'
    },
    disconnected: {
      label: 'Disconnected',
      color: 'text-gray-500',
      bg: 'bg-gray-400',
      icon: '○'
    },
    checking: {
      label: 'Checking...',
      color: 'text-yellow-600',
      bg: 'bg-yellow-500',
      icon: '⟳'
    },
    error: {
      label: 'Error',
      color: 'text-red-600',
      bg: 'bg-red-500',
      icon: '✕'
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: { dot: 'w-2 h-2', text: 'text-xs', badge: 'px-2 py-0.5' },
    md: { dot: 'w-3 h-3', text: 'text-sm', badge: 'px-2.5 py-1' },
    lg: { dot: 'w-4 h-4', text: 'text-base', badge: 'px-3 py-1.5' }
  };

  // Provider display names
  const providerNames: Record<ModelProvider, string> = {
    gpt2: 'GPT-2',
    ollama: 'Ollama',
    openrouter: 'OpenRouter',
    groq: 'Groq',
    openai: 'OpenAI'
  };

  // Tooltip text
  let tooltipText = $derived(() => {
    if (provider === 'ollama') {
      switch (status) {
        case 'connected':
          return 'Ollama is running locally on port 11434';
        case 'disconnected':
          return 'Ollama not found. Run "ollama serve" to start.';
        case 'checking':
          return 'Checking Ollama connection...';
        case 'error':
          return 'Error connecting to Ollama. Check if it\'s running.';
      }
    }
    return `${providerNames[provider]} is ${status}`;
  });

  // Animation class for checking status
  let animationClass = $derived(status === 'checking' ? 'animate-pulse' : '');
</script>

{#if variant === 'dot'}
  <!-- Dot Variant -->
  <div
    class="inline-flex items-center gap-2 {showTooltip ? 'group relative' : ''}"
    role="status"
    aria-label="{providerNames[provider]}: {statusConfig[status].label}"
  >
    <span
      class="inline-block rounded-full {sizeConfig[size].dot} {statusConfig[status].bg}
             {animationClass}"
    ></span>
    {#if showLabel}
      <span class="{sizeConfig[size].text} {statusConfig[status].color} font-medium">
        {provider === 'ollama' ? '' : providerNames[provider] + ': '}{statusConfig[status].label}
      </span>
    {/if}

    {#if showTooltip}
      <div
        class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
               px-3 py-2 bg-gray-900 text-white text-xs rounded-lg
               opacity-0 group-hover:opacity-100 transition-opacity
               pointer-events-none whitespace-nowrap z-50"
        role="tooltip"
      >
        {tooltipText()}
        <div
          class="absolute top-full left-1/2 transform -translate-x-1/2
                 border-4 border-transparent border-t-gray-900"
        ></div>
      </div>
    {/if}
  </div>

{:else if variant === 'badge'}
  <!-- Badge Variant -->
  <span
    class="inline-flex items-center gap-1.5 rounded-full font-medium
           {sizeConfig[size].badge} {sizeConfig[size].text}
           {status === 'connected'
      ? 'bg-green-100 text-green-800'
      : status === 'checking'
        ? 'bg-yellow-100 text-yellow-800'
        : status === 'error'
          ? 'bg-red-100 text-red-800'
          : 'bg-gray-100 text-gray-600'}"
    role="status"
  >
    <span class="{statusConfig[status].bg} {sizeConfig[size].dot} rounded-full {animationClass}">
    </span>
    {showLabel ? statusConfig[status].label : ''}
  </span>

{:else if variant === 'card'}
  <!-- Card Variant -->
  <div
    class="rounded-lg border p-4 {status === 'connected'
      ? 'border-green-200 bg-green-50'
      : status === 'checking'
        ? 'border-yellow-200 bg-yellow-50'
        : status === 'error'
          ? 'border-red-200 bg-red-50'
          : 'border-gray-200 bg-gray-50'}"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Provider Icon -->
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center text-xl
                 {status === 'connected'
            ? 'bg-green-100'
            : status === 'checking'
              ? 'bg-yellow-100'
              : status === 'error'
                ? 'bg-red-100'
                : 'bg-gray-200'}"
        >
          {#if provider === 'ollama'}
            🦙
          {:else if provider === 'openrouter'}
            ☁️
          {:else if provider === 'groq'}
            ⚡
          {:else if provider === 'openai'}
            🤖
          {:else}
            🧠
          {/if}
        </div>

        <div>
          <h3 class="font-semibold text-gray-900">{providerNames[provider]}</h3>
          <p class="text-sm {statusConfig[status].color}">
            {statusConfig[status].icon}
            {statusConfig[status].label}
          </p>
        </div>
      </div>

      <!-- Status Indicator -->
      <div class="flex items-center gap-2">
        <span
          class="w-3 h-3 rounded-full {statusConfig[status].bg} {animationClass}"
        ></span>
      </div>
    </div>

    <!-- Additional Info for Ollama -->
    {#if provider === 'ollama'}
      <div class="mt-3 pt-3 border-t border-gray-200/50">
        {#if status === 'disconnected'}
          <p class="text-sm text-gray-600 mb-2">
            Ollama lets you run large language models locally.
          </p>
          <div class="flex gap-2">
            <a
              href="https://ollama.com/download"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-3 py-1.5 text-xs font-medium
                     text-white bg-blue-600 rounded-md hover:bg-blue-700
                     transition-colors focus:outline-none focus:ring-2
                     focus:ring-blue-500 focus:ring-offset-2"
            >
              Download Ollama
            </a>
            <button
              type="button"
              class="inline-flex items-center px-3 py-1.5 text-xs font-medium
                     text-gray-700 bg-white border border-gray-300 rounded-md
                     hover:bg-gray-50 transition-colors focus:outline-none
                     focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onclick={() => window.open('https://github.com/ollama/ollama', '_blank')}
            >
              Documentation
            </button>
          </div>
        {:else if status === 'connected'}
          <p class="text-sm text-green-700">
            ✓ Connected to localhost:11434
          </p>
        {:else if status === 'error'}
          <p class="text-sm text-red-600">
            ✕ Connection failed. Make sure Ollama is running.
          </p>
          <code class="mt-2 block text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
            ollama serve
          </code>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<!-- Multi-Provider Status Summary (shown when no specific provider) -->
{#if provider === 'ollama' && variant === 'card'}
  <div class="mt-2 flex items-center gap-4 text-xs text-gray-500">
    <span class="flex items-center gap-1">
      <span class="w-2 h-2 rounded-full bg-green-500"></span>
      GPT-2: Ready
    </span>
    {#if $anyProviderConnected}
      <span class="flex items-center gap-1">
        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
        Extended models available
      </span>
    {/if}
  </div>
{/if}
