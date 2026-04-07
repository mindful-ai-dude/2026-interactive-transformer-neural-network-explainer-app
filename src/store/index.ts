import { writable, derived, readable } from 'svelte/store';
import * as ort from 'onnxruntime-web';
import { colors } from '~/constants/colors';
import { ex0 } from '~/constants/examples';
import { textPages } from '~/utils/textbookPages';

// ─── Attention & Block State ─────────────────────────────────────────────────

export const attentionHeadIdxTemp = writable(0);
export const attentionHeadIdx = writable(0);
export const blockIdxTemp = writable(0);
export const blockIdx = writable(0);
export const isOnBlockTransition = writable(false);

export const isOnAnimation = writable(false);

// ─── Textbook State ──────────────────────────────────────────────────────────

export const textbookCurrentPage = writable<number>(0);
export const textbookPreviousPage = writable<number>(-1);
export const textbookCurrentPageId = writable<string>(textPages[0].id);
export const textbookPreviousPageId = writable<string>('');
export const isTextbookOpen = writable<boolean>(true);

// ─── Model Loading State ────────────────────────────────────────────────────

/** Whether the model is currently running inference */
export const isModelRunning = writable(false);

/** Whether the model ONNX chunks are still being fetched */
export const isFetchingModel = writable(true);

/** Whether the app has fully loaded */
export const isLoaded = writable(false);

// ─── Input Examples ──────────────────────────────────────────────────────────

export const inputTextExample = [
	'Data visualization empowers users to',
	'Artificial Intelligence is transforming the',
	'As the spaceship was approaching the',
	'On the deserted planet they discovered a',
	'IEEE VIS conference highlights the'
];

const initialExIdx = 0;
export const selectedExampleIdx = writable<number>(initialExIdx);

// ─── Model Session & Data ────────────────────────────────────────────────────

export const modelSession = writable<ort.InferenceSession>();

/** Transformer model output data (logits, attention, probabilities) */
export const modelData = writable<ModelData>(ex0);
export const predictedToken = writable<Probability>();
export const tokens = writable<string[]>(ex0?.tokens);
export const tokenIds = writable<number[]>(ex0?.tokenIds);

/** GPT-2 model architecture metadata */
export const modelMetaMap: Record<string, ModelMetaData> = {
	gpt2: { layer_num: 12, attention_head_num: 12, dimension: 768, chunkTotal: 63 },
	'gpt2-medium': { layer_num: 24, attention_head_num: 16, dimension: 1024 },
	'gpt2-large': { layer_num: 36, attention_head_num: 20, dimension: 1280 }
};

// ─── Token Selection State ───────────────────────────────────────────────────

export const highlightedToken = writable<HighlightedToken>({
	index: null,
	value: null,
	fix: false
});

export const highlightedHead = writable<HighlightedToken>({
	index: null,
	value: null,
	fix: false
});

// ─── Expanded Block State ────────────────────────────────────────────────────

export const expandedBlock = writable<ExpandedBlock>({ id: null });
export const isExpandOrCollapseRunning = writable(false);

// ─── User Input ──────────────────────────────────────────────────────────────

export const inputText = writable(inputTextExample[initialExIdx]);

// ─── Model Selection ─────────────────────────────────────────────────────────

const initialSelectedModel = 'gpt2';
export const selectedModel = writable(initialSelectedModel);
export const modelMeta = derived(selectedModel, ($selectedModel) => modelMetaMap[$selectedModel]);

// ─── Temperature & Sampling ──────────────────────────────────────────────────

export const initialTemperature = 0.8;
export const temperature = writable(initialTemperature);
export const sampling = writable<Sampling>({ type: 'top-k', value: 5 });

// ─── Prediction Visual State ─────────────────────────────────────────────────

export const highlightedIndex = writable(null);
export const finalTokenIndex = writable(null);

// ─── Visual Element Sizing ───────────────────────────────────────────────────

export const rootRem = 16;
export const minVectorHeight = 12;
export const maxVectorHeight = 30;
export const maxVectorScale = 3.4;

export const vectorHeight = writable(0);
export const headContentHeight = writable(0);
export const headGap = { x: 5, y: 8, scale: 0 };

export const isBoundingBoxActive = writable(false);

/** Color used for predicted token highlighting */
export const predictedColor = colors.purple[600];

// ─── Interactivity State ─────────────────────────────────────────────────────

export const hoveredPath = writable();
export const hoveredMatrixCell = writable({ row: null, col: null });
export const weightPopover = writable();
export const tooltip = writable();

// ─── Device Detection ────────────────────────────────────────────────────────

export const isMobile = readable(false, (set) => {
	if (typeof window !== 'undefined') {
		// Only run in browser environment
		const userAgent = navigator.userAgent.toLowerCase();
		set(/android|iphone|ipad|ipod/i.test(userAgent));
	}
	return () => {}; // Cleanup function
});

// ─── User Identification ─────────────────────────────────────────────────────

export const userId = writable<string | null>(null);