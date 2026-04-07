import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Embedding from './Embedding.svelte';

describe('Embedding Component', () => {
	it('should render the Embedding visualization component', () => {
		const { container } = render(Embedding, {});
		expect(container).toBeDefined();
	});
});
