import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import HeadStack from './HeadStack.svelte';

describe('HeadStack Component', () => {
	it('should render the Multi-head stack visualizer', () => {
		const { container } = render(HeadStack, {});
		expect(container).toBeDefined();
	});
});
