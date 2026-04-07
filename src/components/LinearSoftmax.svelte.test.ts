import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LinearSoftmax from './LinearSoftmax.svelte';

describe('LinearSoftmax Component', () => {
	it('should render the LinearSoftmax visualizer', () => {
		const { container } = render(LinearSoftmax, {});
		expect(container).toBeDefined();
	});
});
