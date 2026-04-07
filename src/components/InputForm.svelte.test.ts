import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InputForm from './InputForm.svelte';

describe('InputForm Component', () => {
	it('should render the input elements', async () => {
		const { getByRole, getByText } = render(InputForm, {});
		
		await expect.element(getByRole('textbox')).toBeInTheDocument();
		await expect.element(getByText('Examples')).toBeInTheDocument();
	});
});
