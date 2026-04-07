import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Alert from './Alert.svelte';

describe('Alert Component', () => {
	it('should render the alert container', async () => {
		const { container } = render(Alert, {});
		expect(container).toBeDefined();
	});
});
