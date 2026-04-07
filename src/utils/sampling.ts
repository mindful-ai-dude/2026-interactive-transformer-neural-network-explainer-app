/**
 * Sampling strategies for token generation.
 * Extracted from data.ts for testability and reuse.
 */

import type { PreTrainedTokenizer } from '@huggingface/transformers';
import { softmax, formatTokenForDisplay, randomChoice } from './math';

/**
 * Top-K sampling: Select the top K most probable tokens,
 * apply temperature scaling, then softmax, then sample.
 */
export function topKSampling(
	tokenizer: PreTrainedTokenizer,
	logits: number[],
	k: number,
	temperature: number
): { probabilities: Probabilities; sampled: Probability } {
	// Trim the list to a reasonable number that can be displayed on the screen
	const max = 50;
	const sortedLogits = Array.from(logits)
		.map((logit, index) => ({
			tokenId: index,
			logit
		}))
		.sort((a, b) => b.logit - a.logit)
		.slice(0, max);

	// Temperature Scaling
	const scaledLogits = sortedLogits.map((item) => ({
		...item,
		scaledLogit: item.logit / temperature
	}));

	// Apply Top-k: Keep topK logits and set others to -Infinity
	const filteredLogits = scaledLogits.map((item, index) => ({
		...item,
		topKLogit: index < k ? item.scaledLogit : -Infinity
	}));

	// Softmax Normalization
	const topKLogits = filteredLogits.map((item) => item.topKLogit);
	const { expLogits, probabilities } = softmax(topKLogits);

	const output = filteredLogits.map((item, i) => ({
		...item,
		rank: i,
		token: formatTokenForDisplay(tokenizer.decode([item.tokenId])),
		expLogit: expLogits[i],
		probability: probabilities[i]
	}));

	// Sample from the top-k tokens
	const sampled = randomChoice(output);

	return { probabilities: output, sampled };
}

/**
 * Top-P (nucleus) sampling: Select tokens whose cumulative
 * probability mass reaches P, then sample from that set.
 */
export function topPSampling(
	tokenizer: PreTrainedTokenizer,
	logits: number[],
	p: number,
	temperature: number
): { probabilities: Probabilities; sampled: Probability } {
	// Trim the list to a reasonable number that can be displayed on the screen
	const max = 50;
	const sortedLogits = Array.from(logits)
		.map((logit, index) => ({
			tokenId: index,
			logit
		}))
		.sort((a, b) => b.logit - a.logit)
		.slice(0, max);

	// Temperature Scaling
	const scaledLogits = sortedLogits.map((item) => ({
		...item,
		scaledLogit: item.logit / temperature
	}));

	// Softmax Normalization
	const { expLogits, probabilities } = softmax(scaledLogits.map((item) => item.scaledLogit));

	// Compute cumulative probabilities
	const cumulativeProbabilities: number[] = [];
	probabilities.reduce((acc, prob, idx) => {
		cumulativeProbabilities[idx] = acc + prob;
		return cumulativeProbabilities[idx];
	}, 0);

	let cutoffIndex = cumulativeProbabilities.findIndex((cumProb) => cumProb >= p);
	cutoffIndex = cutoffIndex === -1 ? cumulativeProbabilities.length - 1 : cutoffIndex;

	const topIndices = scaledLogits.slice(0, cutoffIndex + 1);
	const topProbabilities = topIndices.map((d, i) => probabilities[i]);

	// Renormalize probabilities for top-p tokens
	const sumTopProbabilities = topProbabilities.reduce((sum, val) => sum + val, 0);
	const newProbabilities = topProbabilities.map((val) => val / sumTopProbabilities);

	// Sample from the top-p tokens
	const output = scaledLogits.map((item, i) => ({
		...item,
		rank: i,
		token: formatTokenForDisplay(tokenizer.decode([item.tokenId])),
		expLogit: expLogits[i],
		probability: newProbabilities[i] || 0,
		topPProbability: probabilities[i], //original
		cumulativeProbability: cumulativeProbabilities[i],
		cutoffIndex
	}));

	const nextToken = randomChoice(output);
	return { probabilities: output, sampled: nextToken };
}
