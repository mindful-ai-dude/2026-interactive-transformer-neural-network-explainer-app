import { describe, it, expect } from 'vitest';
import { topKSampling, topPSampling } from './sampling';
import type { PreTrainedTokenizer } from '@huggingface/transformers';

// A strict mock implementation of what the sampling functions need
const mockTokenizer = {
	decode: (ids: number[]) => `mock_token_${ids[0]}`
} as unknown as PreTrainedTokenizer;

describe('sampling utilities', () => {
	describe('topKSampling', () => {
		it('should select exactly k tokens', () => {
			const logits = [10, 2, 8, 4, 1, 9, 3, 7, 5, 6];
			// Expected sorted top 3 logits: 10, 9, 8 at indices 0, 5, 2
			
			const { probabilities, sampled } = topKSampling(mockTokenizer, logits, 3, 1.0);
			
			// Non-zero probability tokens should be exactly 3
			const validProbs = probabilities.filter(p => p.probability > 0);
			expect(validProbs.length).toBe(3);
			
			// The sum of probabilities for the top k should be 1
			const sum = validProbs.reduce((acc, p) => acc + p.probability, 0);
			expect(sum).toBeCloseTo(1.0);

			// Check that it's sorted by probability appropriately
			expect(probabilities[0].tokenId).toBe(0); // 10
			expect(probabilities[1].tokenId).toBe(5); // 9
			expect(probabilities[2].tokenId).toBe(2); // 8

			// It should sample one of the valid tokens
			expect(sampled).toBeDefined();
			expect(sampled.probability).toBeGreaterThan(0);
		});
	});

	describe('topPSampling', () => {
		it('should select tokens whose cumulative probability reaches p', () => {
			// Using large distinct differences so softmax gives a clear > 0.9 distribution
			const logits = [15, 12, 10, 1, 1, 1, 1, 1, 1, 1];
			
			const { probabilities, sampled } = topPSampling(mockTokenizer, logits, 0.9, 1.0);
			
			// Identify the cutoff index from the function's output metadata
			// The original softmax probabilities for [15, 12, 10] are approx:
			// exp(0) = 1, exp(-3) = ~0.05, exp(-5) = ~0.006. 
			// So index 0 alone is (1 / 1.056) ≈ 0.94. 
			// Wait, if p=0.9, and the first token has 0.94 probability, then it alone surpasses 0.9.
			// The cutoff should be 0.
			
			const firstToken = probabilities[0];
			expect(firstToken.tokenId).toBe(0);
			expect(firstToken.cumulativeProbability).toBeGreaterThanOrEqual(0.9);
			expect(firstToken.cutoffIndex).toBe(0);

			// The normalized probability for the selected subset should sum to 1
			const validProbs = probabilities.slice(0, firstToken.cutoffIndex! + 1);
			const sum = validProbs.reduce((acc, p) => acc + p.probability, 0);
			expect(sum).toBeCloseTo(1.0);

			expect(sampled).toBeDefined();
		});
	});
});
