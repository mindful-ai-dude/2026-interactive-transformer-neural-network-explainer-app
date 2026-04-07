import { describe, it, expect } from 'vitest';
import { getTokenization, getProbabilities } from './data';
import type { PreTrainedTokenizer } from '@huggingface/transformers';

const mockTokenizer = {
	encode: (input: string) => [101, 102], // Mock token IDs
	decode: (ids: number[]) => {
		// Match the logic in getTokenization mapping logic
		if (ids[0] === 101) return 'hello';
		if (ids[0] === 102) return 'world';
		return 'unknown';
	}
} as unknown as PreTrainedTokenizer;

describe('data utilities', () => {
	describe('getTokenization', () => {
		it('should tokenize input correctly', async () => {
			const result = await getTokenization(mockTokenizer, 'hello world');
			
			expect(result.token_ids).toEqual([101, 102]);
			// getTokenization maps over ids and flat()s them
			expect(result.input_tokens).toEqual(['hello', 'world']);
		});
	});

	describe('getProbabilities', () => {
		it('should route to topKSampling when type is top-k', () => {
			// A sample logits array
			const logits = [10, 5, 2, 0];
			
			const { probabilities, sampled } = getProbabilities({
				tokenizer: mockTokenizer,
				logits,
				sampling: { type: 'top-k', value: 2 },
				temperature: 1
			});

			// Top-K filters down to K tokens, rest are filtered out
			const nonZero = probabilities.filter(p => p.probability > 0);
			expect(nonZero.length).toBeLessThanOrEqual(2);
			expect(sampled).toBeDefined();
		});

		it('should route to topPSampling when type is top-p', () => {
			const logits = [10, 5, 2, 0];
			
			const { probabilities, sampled } = getProbabilities({
				tokenizer: mockTokenizer,
				logits,
				sampling: { type: 'top-p', value: 0.9 },
				temperature: 1
			});

			// Should run without error and return a sampled token
			expect(probabilities.length).toBeGreaterThan(0);
			expect(sampled).toBeDefined();
		});
	});
});
