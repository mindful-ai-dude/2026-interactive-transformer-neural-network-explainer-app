import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Textbook from './textbook/Textbook.svelte';

describe('Textbook Component', () => {
	it('should render the Textbook container', () => {
		const { container } = render(Textbook, {});
		expect(container).toBeDefined();
	});
});
