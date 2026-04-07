import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AttentionMatrix from './AttentionMatrix.svelte';

describe('AttentionMatrix Component', () => {
	it('should render the AttentionMatrix component', () => {
		const { container } = render(AttentionMatrix, {});
		expect(container).toBeDefined();
	});
});
