type Flow = {
	type?: 'path' | 'node';
	id: string;
	from?: string;
	to?: string;
	match?: boolean;
	arrow?: boolean;
	anchor?: { from?: 'l' | 'r' | 't' | 'b'; to?: 'l' | 'r' | 't' | 'b' };
	stroke?: { width?: number };
	transition?: gsap.TweenVars & { position?: gsap.Position };
	curve?: 'vh' | 'hv';
};

type MatrixData = number[][];

type ModelMetaData = {
	layer_num: number;
	attention_head_num: number;
	dimension: number;
	chunkTotal?: number;
};

type HighlightedToken = {
	index: number | string | null;
	value?: string | null;
	fix?: boolean;
};

type HighlightedHead = {
	index: number | string | null;
	value?: string | null;
	fix?: boolean;
};

type ExpandedBlock = { id: number | string | null };

type Probability = {
	rank: number;
	tokenId: number;
	token: string;
	logit: number;
	scaledLogit: number;
	expLogit: number;
	probability: number;
	topKLogit?: number;
	topPProbability?: number;
	cumulativeProbability?: number;
	cutoffIndex?: number;
};
type Probabilities = Probability[];
type ModelData = {
	logits: number[];
	outputs: Record<string, { data: number[][]; dims?: number[]; size?: number }>;
	probabilities: Probabilities;
	sampled: Probability;
	tokens?: string[];
	tokenIds?: number[];
};

type Sampling = { type: 'top-k' | 'top-p'; value: number };

// Google Analytics declarations
declare global {
	interface Window {
		dataLayer?: any[];
	}

	type Flow = Flow;
	type MatrixData = MatrixData;
	type ModelMetaData = ModelMetaData;
	type HighlightedToken = HighlightedToken;
	type HighlightedHead = HighlightedHead;
	type ExpandedBlock = ExpandedBlock;
	type Probability = Probability;
	type Probabilities = Probabilities;
	type ModelData = ModelData;
	type Sampling = Sampling;
}

declare const gtag: (...args: any[]) => void;

export {};
