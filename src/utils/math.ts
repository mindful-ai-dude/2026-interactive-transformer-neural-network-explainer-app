/**
 * Mathematical utility functions for transformer model computations.
 * Extracted from data.ts for testability and reuse.
 */

/**
 * Compute softmax probabilities from an array of logits.
 * Uses the log-sum-exp trick for numerical stability.
 *
 * @param logits - Array of raw logit values
 * @returns Object containing exp(logits) and normalized probabilities
 */
export function softmax(logits: number[]): { expLogits: number[]; probabilities: number[] } {
	const maxLogit = Math.max(...logits);
	const expLogits = logits.map((logit) => (logit === -Infinity ? 0 : Math.exp(logit - maxLogit)));
	const sumExpLogits = expLogits.reduce((sum, val) => sum + val, 0);
	const probabilities = expLogits.map((val) => val / sumExpLogits);

	return { expLogits, probabilities };
}

/**
 * Format a token string for display by replacing whitespace characters
 * with human-readable labels.
 *
 * @param token - Raw token string from tokenizer
 * @returns Formatted string with visible whitespace labels
 */
export function formatTokenForDisplay(token: string): string {
	return token
		.replace(/\n/g, '[NEWLINE]')
		.replace(/\t/g, '[TAB]')
		.replace(/\r/g, '[CR]')
		.replace(/\s{2,}/g, (match) => `[${match.length} SPACES]`);
}

/**
 * Randomly sample an item from a probability distribution.
 * Simulates numpy's random.choice function.
 *
 * @param items - Array of items with probability fields
 * @returns A single sampled item
 */
export function randomChoice(items: Probabilities): Probability {
	const probabilities = items.map((d: Probability) => d.probability);

	// Generate a random number between 0 and 1
	const random = Math.random();

	// Accumulate probabilities and find the corresponding item
	let cumulativeProbability = 0;
	for (let i = 0; i < probabilities.length; i++) {
		cumulativeProbability += probabilities[i];
		if (random < cumulativeProbability) {
			return items[i];
		}
	}

	// Fallback in case of numerical issues
	return items[items.length - 1];
}
