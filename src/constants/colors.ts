/**
 * Color constants extracted from TailwindCSS config.
 * Avoids importing tailwindcss/resolveConfig at runtime (heavy import).
 */

export const colors = {
	purple: {
		600: '#9333ea'
	},
	gray: {
		200: '#e5e7eb',
		300: '#d1d5db',
		400: '#9ca3af',
		600: '#4b5563',
		700: '#374151'
	},
	cyan: {
		50: '#ecfeff',
		100: '#cffafe',
		200: '#a5f3fc',
		300: '#67e8f9',
		400: '#22d3ee',
		500: '#06b6d4',
		600: '#0891b2',
		700: '#0e7490',
		800: '#155e75',
		900: '#164e63',
		950: '#083344'
	}
} as const;
