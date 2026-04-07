import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Sankey from './Sankey.svelte';

describe('Sankey Component', () => {
	it('should render the D3 Sankey container', () => {
		const { container } = render(Sankey, {});
		expect(container).toBeDefined();
	});
});
