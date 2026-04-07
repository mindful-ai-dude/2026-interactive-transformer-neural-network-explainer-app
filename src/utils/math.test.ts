import { describe, it, expect } from 'vitest';
import { softmax, formatTokenForDisplay } from './math';

describe('math utilities', () => {
	describe('softmax', () => {
		it('should compute softmax for a simple array', () => {
			const logits = [1, 2, 3];
			const { probabilities } = softmax(logits);

			// Expected roughly [0.09, 0.24, 0.66]
			const sum = probabilities.reduce((a, b) => a + b, 0);
			expect(sum).toBeCloseTo(1.0);
			expect(probabilities[2]).toBeGreaterThan(probabilities[1]);
			expect(probabilities[1]).toBeGreaterThan(probabilities[0]);
		});

		it('should handle array with -Infinity', () => {
			const logits = [1, -Infinity, 2, -Infinity];
			const { probabilities } = softmax(logits);

			expect(probabilities[1]).toBe(0);
			expect(probabilities[3]).toBe(0);
			
			const sum = probabilities.reduce((a, b) => a + b, 0);
			expect(sum).toBeCloseTo(1.0);
		});

		it('should handle array with identical values', () => {
			const logits = [5, 5, 5, 5];
			const { probabilities } = softmax(logits);

			expect(probabilities).toEqual([0.25, 0.25, 0.25, 0.25]);
		});
	});

	describe('formatTokenForDisplay', () => {
		it('should format special characters', () => {
			expect(formatTokenForDisplay('\n')).toBe('[NEWLINE]');
			expect(formatTokenForDisplay('\t')).toBe('[TAB]');
			expect(formatTokenForDisplay('\r')).toBe('[CR]');
		});

		it('should format multiple spaces', () => {
			expect(formatTokenForDisplay('   ')).toBe('[3 SPACES]');
			expect(formatTokenForDisplay('    word')).toBe('[4 SPACES]word');
		});

		it('should leave normal token unchanged', () => {
			expect(formatTokenForDisplay('hello')).toBe('hello');
			expect(formatTokenForDisplay('world ')).toBe('world '); // single space left alone
		});
	});
});
