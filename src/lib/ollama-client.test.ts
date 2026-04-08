/**
 * Ollama Client Tests
 * Unit tests for the Ollama API wrapper
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OllamaClient, ollamaClient } from './ollama-client';
import { ConnectionError, ModelProviderError } from './model-types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('OllamaClient', () => {
  let client: OllamaClient;

  beforeEach(() => {
    client = new OllamaClient();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should use default base URL', () => {
      expect(client).toBeDefined();
    });

    it('should accept custom base URL', () => {
      const customClient = new OllamaClient({ baseUrl: 'http://custom:11434' });
      expect(customClient).toBeDefined();
    });
  });

  describe('checkHealth', () => {
    it('should return "connected" when server is reachable', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ models: [] })
      });

      const status = await client.checkHealth();
      expect(status).toBe('connected');
    });

    it('should return "disconnected" when server is not running', async () => {
      mockFetch.mockRejectedValueOnce(new Error('fetch failed'));

      const status = await client.checkHealth();
      expect(status).toBe('disconnected');
    });

    it('should return "error" on timeout', async () => {
      mockFetch.mockImplementationOnce(() => {
        const error = new Error('Timeout');
        (error as Error & { name: string }).name = 'AbortError';
        return Promise.reject(error);
      });

      const status = await client.checkHealth();
      expect(status).toBe('error');
    });

    it('should return "error" on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const status = await client.checkHealth();
      expect(status).toBe('error');
    });
  });

  describe('listModels', () => {
    const mockModelsResponse = {
      models: [
        {
          name: 'llama3.2',
          model: 'llama3.2:latest',
          modified_at: '2024-01-01T00:00:00Z',
          size: 2012755000,
          digest: 'sha256:abc123',
          details: {
            parent_model: '',
            format: 'gguf',
            family: 'llama',
            families: ['llama'],
            parameter_size: '3.2B',
            quantization_level: 'Q4_0'
          }
        },
        {
          name: 'mistral',
          model: 'mistral:latest',
          modified_at: '2024-01-01T00:00:00Z',
          size: 4108274244,
          digest: 'sha256:def456',
          details: {
            family: 'llama',
            parameter_size: '7B',
            quantization_level: 'Q4_0'
          }
        }
      ]
    };

    it('should return list of models', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockModelsResponse)
      });

      const models = await client.listModels();

      expect(models).toHaveLength(2);
      expect(models[0].name).toBe('llama3.2');
      expect(models[1].name).toBe('mistral');
    });

    it('should throw ConnectionError on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.listModels()).rejects.toThrow(ConnectionError);
    });

    it('should throw ConnectionError on timeout', async () => {
      mockFetch.mockImplementationOnce(() => {
        const error = new Error('Timeout');
        (error as Error & { name: string }).name = 'AbortError';
        return Promise.reject(error);
      });

      await expect(client.listModels()).rejects.toThrow(ConnectionError);
    });

    it('should throw ConnectionError on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error'
      });

      await expect(client.listModels()).rejects.toThrow(ConnectionError);
    });

    it('should handle empty models list', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ models: [] })
      });

      const models = await client.listModels();
      expect(models).toHaveLength(0);
    });
  });

  describe('toModelMetadata', () => {
    it('should convert Ollama model info to metadata', () => {
      const ollamaInfo = {
        name: 'llama3.2',
        model: 'llama3.2:latest',
        modified_at: '2024-01-01T00:00:00Z',
        size: 2012755000,
        digest: 'sha256:abc123',
        details: {
          family: 'llama',
          families: ['llama'],
          parameter_size: '3.2B',
          quantization_level: 'Q4_0'
        }
      };

      const metadata = client.toModelMetadata(ollamaInfo);

      expect(metadata.id).toBe('ollama:llama3.2');
      expect(metadata.name).toBe('llama3.2');
      expect(metadata.provider).toBe('ollama');
      expect(metadata.parameters).toBe('3.2B');
      expect(metadata.quantization).toBe('Q4_0');
      expect(metadata.tags).toContain('llama');
    });

    it('should handle missing details', () => {
      const ollamaInfo = {
        name: 'test-model',
        model: 'test-model:latest',
        modified_at: '2024-01-01T00:00:00Z',
        size: 1000,
        digest: 'sha256:abc',
        details: {}
      };

      const metadata = client.toModelMetadata(ollamaInfo);

      expect(metadata.id).toBe('ollama:test-model');
      expect(metadata.parameters).toBeUndefined();
      expect(metadata.tags).toEqual([]);
    });
  });

  describe('generate', () => {
    const mockGenerateResponse = {
      model: 'llama3.2',
      created_at: '2024-01-01T00:00:00Z',
      response: 'This is a test response',
      done: true,
      total_duration: 1234567890,
      load_duration: 123456789,
      prompt_eval_count: 10,
      prompt_eval_duration: 234567890,
      eval_count: 20,
      eval_duration: 345678901
    };

    it('should generate text successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGenerateResponse)
      });

      const result = await client.generate('llama3.2', 'Test prompt');

      expect(result.text).toBe('This is a test response');
      expect(result.model).toBe('llama3.2');
      expect(result.provider).toBe('ollama');
      expect(result.usage).toEqual({
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30
      });
      expect(result.timing).toBeDefined();
    });

    it('should pass generation options', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGenerateResponse)
      });

      await client.generate('llama3.2', 'Test prompt', {
        temperature: 0.5,
        topK: 40,
        topP: 0.9,
        maxTokens: 100,
        stop: ['\n'],
        seed: 42
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/generate',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"temperature":0.5')
        })
      );
    });

    it('should use default temperature of 0.7', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGenerateResponse)
      });

      await client.generate('llama3.2', 'Test prompt');

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.options.temperature).toBe(0.7);
    });

    it('should throw ModelProviderError on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error')
      });

      await expect(client.generate('llama3.2', 'Test')).rejects.toThrow(ModelProviderError);
    });

    it('should handle abort/cancellation', async () => {
      mockFetch.mockImplementationOnce(() => {
        const error = new Error('Aborted');
        (error as Error & { name: string }).name = 'AbortError';
        return Promise.reject(error);
      });

      await expect(client.generate('llama3.2', 'Test')).rejects.toThrow(ModelProviderError);
    });

    it('should be cancellable', async () => {
      const generatePromise = client.generate('llama3.2', 'Test prompt');

      // Cancel immediately
      client.cancel();

      await expect(generatePromise).rejects.toThrow();
    });
  });

  describe('isModelAvailable', () => {
    it('should return true for available model', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          models: [{ name: 'llama3.2', model: 'llama3.2:latest', modified_at: '', size: 1, digest: '', details: {} }]
        })
      });

      const available = await client.isModelAvailable('llama3.2');
      expect(available).toBe(true);
    });

    it('should return false for unavailable model', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          models: [{ name: 'other-model', model: 'other-model:latest', modified_at: '', size: 1, digest: '', details: {} }]
        })
      });

      const available = await client.isModelAvailable('llama3.2');
      expect(available).toBe(false);
    });

    it('should return false on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const available = await client.isModelAvailable('llama3.2');
      expect(available).toBe(false);
    });
  });

  describe('getModelInfo', () => {
    it('should return model info for existing model', async () => {
      const modelInfo = {
        name: 'llama3.2',
        model: 'llama3.2:latest',
        modified_at: '2024-01-01T00:00:00Z',
        size: 1000,
        digest: 'sha256:abc',
        details: {}
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ models: [modelInfo] })
      });

      const info = await client.getModelInfo('llama3.2');
      expect(info).toEqual(modelInfo);
    });

    it('should return null for non-existing model', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ models: [] })
      });

      const info = await client.getModelInfo('nonexistent');
      expect(info).toBeNull();
    });

    it('should return null on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const info = await client.getModelInfo('llama3.2');
      expect(info).toBeNull();
    });
  });

  describe('formatModelSize', () => {
    it('should format GB correctly', () => {
      expect(OllamaClient.formatModelSize(2012755000)).toBe('1.9 GB');
      expect(OllamaClient.formatModelSize(4108274244)).toBe('3.8 GB');
    });

    it('should format MB correctly', () => {
      expect(OllamaClient.formatModelSize(500000000)).toBe('476.8 MB');
      expect(OllamaClient.formatModelSize(1000000)).toBe('1.0 MB');
    });
  });

  describe('getRecommendedModels', () => {
    it('should return array of recommended models', () => {
      const recommended = OllamaClient.getRecommendedModels();

      expect(recommended).toBeInstanceOf(Array);
      expect(recommended.length).toBeGreaterThan(0);
      expect(recommended).toContain('llama3.2');
      expect(recommended).toContain('mistral');
    });
  });

  describe('pullModel', () => {
    it('should pull a model successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'success' })
      });

      await expect(client.pullModel('llama3.2')).resolves.not.toThrow();
    });

    it('should throw on failed pull', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'error', error: 'Download failed' })
      });

      await expect(client.pullModel('llama3.2')).rejects.toThrow(ModelProviderError);
    });

    it('should throw on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(client.pullModel('llama3.2')).rejects.toThrow(ModelProviderError);
    });
  });
});

describe('ollamaClient singleton', () => {
  it('should be exported', () => {
    expect(ollamaClient).toBeDefined();
    expect(ollamaClient).toBeInstanceOf(OllamaClient);
  });
});
