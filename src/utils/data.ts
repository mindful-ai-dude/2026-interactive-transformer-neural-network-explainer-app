import type { PreTrainedTokenizer } from '@huggingface/transformers';
import * as ort from 'onnxruntime-web';
import {
	modelData,
	tokens,
	tokenIds,
	isModelRunning,
	predictedToken,
	modelSession,
	modelMetaMap
} from '~/store';
import { get } from 'svelte/store';
import { reshapeArray } from './array';
import { showFlowAnimation } from './animation';
import { topKSampling, topPSampling } from './sampling';

export const fakeRunWithCachedData = async ({
	cachedData,
	tokenizer,
	temperature,
	sampling
}: {
	cachedData: any;
	tokenizer: PreTrainedTokenizer;
	temperature: number;
	sampling: Sampling;
}) => {
	isModelRunning.set(true);

	modelData.set(cachedData);
	tokens.set(cachedData.tokens);
	tokenIds.set(cachedData.tokenIds);

	setTimeout(async () => {
		await showFlowAnimation(cachedData.tokens.length, true);
		adjustTemperature({
			tokenizer,
			logits: cachedData.logits,
			temperature,
			sampling
		});
		isModelRunning.set(false);
	}, 0);
};

export const runModel = async ({
	tokenizer,
	input,
	temperature,
	sampling
}: {
	tokenizer: PreTrainedTokenizer;
	input: string;
	temperature: number;
	sampling: Sampling;
}) => {
	isModelRunning.set(true);

	const { token_ids, input_tokens } = await getTokenization(tokenizer, input === '' ? ' ' : input);

	let isOneTokenAdded: boolean;
	tokens.set(input_tokens);
	tokenIds.update((prev) => {
		isOneTokenAdded =
			prev.length === token_ids.length - 1 && prev.every((id, idx) => id === token_ids[idx]);
		return token_ids;
	});

	const { logits, outputs } = await getData(token_ids);

	const { probabilities, sampled } = getProbabilities({ tokenizer, logits, sampling, temperature });

	modelData.set({ logits, outputs, probabilities, sampled });

	// To ensure the animation starts after all elements have been rendered
	setTimeout(async () => {
		await showFlowAnimation(input_tokens.length, isOneTokenAdded);

		predictedToken.set(sampled);

		isModelRunning.set(false);
	}, 0);
};

export const adjustTemperature = async ({
	tokenizer,
	logits,
	temperature,
	sampling
}: {
	tokenizer: PreTrainedTokenizer;
	logits: number[];
	temperature: number;
	sampling: Sampling;
}) => {
	const { probabilities, sampled } = getProbabilities({ tokenizer, logits, sampling, temperature });

	modelData.update((d) => ({ ...d, probabilities, sampled }));

	predictedToken.set(sampled);
};

export const getTokenization = async (tokenizer: PreTrainedTokenizer, input: string) => {
	const token_ids = tokenizer.encode(input);
	const input_tokens = token_ids.map((id: number) => tokenizer.decode([id])).flat();

	return {
		token_ids,
		input_tokens
	};
};

export const getData = async (token_ids: number[]) => {
	try {
		// Convert token_ids to tensor
		const inputTensor = new ort.Tensor('int64', token_ids, [1, token_ids.length]);

		// Get the session from the store
		const session = get(modelSession);
		if (!session) {
			throw new Error('Model session is not initialized.');
		}

		// Prepare the feeds (inputs)
		const feeds = { input: inputTensor };

		// Run inference
		const results = await session.run(feeds);

		// Extract the logits
		const logits = results['linear_output'].data;

		// Extract the dictionary values
		const outputs = targetTensors.reduce(
			(obj, key) => {
				const out = results[key];
				const processedData = {
					data: reshapeArray([...out.cpuData], out.dims)
				};
				obj[key] = processedData;
				return obj;
			},
			{} as ModelData['outputs']
		);

		return {
			logits,
			outputs
		};
	} catch (error) {
		console.error('Error during inference:', (error as Error).message);
		throw error;
	}
};

export const getProbabilities = ({
	tokenizer,
	logits,
	sampling = { type: 'top-k', value: 10 },
	temperature = 1
}: {
	tokenizer: PreTrainedTokenizer;
	logits: number[];
	sampling: Sampling;
	temperature: number;
}): { probabilities: Probabilities; sampled: Probability } => {
	if (sampling.type === 'top-p') {
		return topPSampling(tokenizer, logits, sampling.value, temperature);
	} else {
		return topKSampling(tokenizer, logits, sampling.value, temperature);
	}
};

const attentionTensors = Array(modelMetaMap.gpt2.layer_num)
	.fill(0)
	.flatMap((_, i) => {
		return Array(modelMetaMap.gpt2.attention_head_num)
			.fill(0)
			.flatMap((_, j) => [
				`block_${i}_attn_head_${j}_attn`,
				`block_${i}_attn_head_${j}_attn_scaled`,
				`block_${i}_attn_head_${j}_attn_masked`,
				`block_${i}_attn_head_${j}_attn_softmax`,
				`block_${i}_attn_head_${j}_attn_dropout`
			]);
	});

const targetTensors = [...attentionTensors];
