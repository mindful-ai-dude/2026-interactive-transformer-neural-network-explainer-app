import { describe, it, expect } from 'vitest';
import { reshapeArray } from './array';

describe('array utilities', () => {
	describe('reshapeArray', () => {
		it('should reshape 1D array to 2D', () => {
			const arr = [1, 2, 3, 4, 5, 6];
			const dims = [2, 3];
			const result = reshapeArray([...arr], dims);

			expect(result).toEqual([
				[1, 2, 3],
				[4, 5, 6]
			]);
		});

		it('should reshape 1D array to 3D', () => {
			const arr = [1, 2, 3, 4, 5, 6, 7, 8];
			const dims = [2, 2, 2];
			const result = reshapeArray([...arr], dims);

			expect(result).toEqual([
				[
					[1, 2],
					[3, 4]
				],
				[
					[5, 6],
					[7, 8]
				]
			]);
		});

		it('should handle 1D to 1D', () => {
			const arr = [1, 2, 3];
			const dims = [3];
			// reshapeArray mutates via splice, so pass a copy
			const result = reshapeArray([...arr], dims);

			expect(result).toEqual([1, 2, 3]);
		});
	});
});
