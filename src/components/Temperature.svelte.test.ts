import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Temperature from './Temperature.svelte';

describe('Temperature Component', () => {
	it('should render temperature control', async () => {
		const { getByText, getByRole } = render(Temperature, {});
		
		await expect.element(getByText('Temperature')).toBeInTheDocument();
		await expect.element(getByRole('slider')).toBeInTheDocument();
	});
});
