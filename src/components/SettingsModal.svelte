<!--
  SettingsModal Component
  Modal for configuring API keys for Ollama Cloud and OpenRouter
-->
<script lang="ts">
  import { onMount } from 'svelte';
  
  // Props
  interface Props {
    isOpen: boolean;
    onClose: () => void;
  }
  
  let { isOpen = $bindable(false), onClose }: Props = $props();
  
  // API Key state
  let ollamaApiKey = $state('');
  let openrouterApiKey = $state('');
  let saveMessage = $state('');
  let saveSuccess = $state(false);
  
  // Load saved keys on mount
  onMount(() => {
    if (typeof window !== 'undefined') {
      ollamaApiKey = localStorage.getItem('ollama_api_key') || '';
      openrouterApiKey = localStorage.getItem('openrouter_api_key') || '';
    }
  });
  
  // Save API keys to localStorage
  function saveSettings() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ollama_api_key', ollamaApiKey);
      localStorage.setItem('openrouter_api_key', openrouterApiKey);
      
      // Also set as environment variables for the session
      (window as any).OLLAMA_API_KEY = ollamaApiKey;
      (window as any).OPENROUTER_API_KEY = openrouterApiKey;
      
      saveSuccess = true;
      saveMessage = 'Settings saved successfully!';
      
      setTimeout(() => {
        saveMessage = '';
        onClose();
      }, 1500);
    }
  }
  
  // Close on escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
  }
  
  // Close on backdrop click
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="settings-title"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 id="settings-title" class="text-lg font-semibold text-gray-900">Settings</h2>
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600 focus:outline-none"
          onclick={onClose}
          aria-label="Close settings"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Content -->
      <div class="px-6 py-4 space-y-6">
        <!-- Ollama Cloud API Key -->
        <div>
          <label for="ollama-api-key" class="block text-sm font-medium text-gray-700 mb-2">
            ☁️ Ollama Cloud API Key
          </label>
          <input
            id="ollama-api-key"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your Ollama Cloud API key"
            bind:value={ollamaApiKey}
          />
          <p class="mt-1 text-xs text-gray-500">
            Get your API key from <a href="https://ollama.com/settings/keys" target="_blank" class="text-blue-600 hover:underline">ollama.com/settings/keys</a>
          </p>
        </div>
        
        <!-- OpenRouter API Key -->
        <div>
          <label for="openrouter-api-key" class="block text-sm font-medium text-gray-700 mb-2">
            🔌 OpenRouter API Key
          </label>
          <input
            id="openrouter-api-key"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your OpenRouter API key"
            bind:value={openrouterApiKey}
          />
          <p class="mt-1 text-xs text-gray-500">
            Get your API key from <a href="https://openrouter.ai/keys" target="_blank" class="text-blue-600 hover:underline">openrouter.ai/keys</a>
          </p>
        </div>
        
        <!-- Environment Variables Info -->
        <div class="bg-gray-50 rounded-md p-3 text-xs text-gray-600">
          <p class="font-medium mb-1">For Developers:</p>
          <p>You can also set these as environment variables:</p>
          <code class="block mt-1 bg-gray-100 px-2 py-1 rounded">
            OLLAMA_API_KEY=your_key<br/>
            OPENROUTER_API_KEY=your_key
          </code>
        </div>
        
        <!-- Save Message -->
        {#if saveMessage}
          <div class="text-sm {saveSuccess ? 'text-green-600' : 'text-red-600'}">
            {saveMessage}
          </div>
        {/if}
      </div>
      
      <!-- Footer -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onclick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onclick={saveSettings}
        >
          Save Settings
        </button>
      </div>
    </div>
  </div>
{/if}
