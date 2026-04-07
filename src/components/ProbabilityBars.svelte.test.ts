import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProbabilityBars from './ProbabilityBars.svelte';

describe('ProbabilityBars Component', () => {
	it('should render without crashing when given probabilities', async () => {
		const mockProbabilities = [
			{ token: 'hello', probability: 0.8, rank: 0, tokenId: 1, logit: 10, scaledLogit: 10, expLogit: 100 },
			{ token: 'world', probability: 0.2, rank: 1, tokenId: 2, logit: 2, scaledLogit: 2, expLogit: 20 }
		];
		
		const { getByText } = render(ProbabilityBars, {
			probabilities: mockProbabilities
		});
		
		await expect.element(getByText('hello')).toBeInTheDocument();
		await expect.element(getByText('world')).toBeInTheDocument();
		await expect.element(getByText('80.0%')).toBeInTheDocument();
		await expect.element(getByText('20.0%')).toBeInTheDocument();
	});
});
