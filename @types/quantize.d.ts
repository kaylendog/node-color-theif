declare module "quantize" {
	export default function(
		pixels: Array<[number, number, number]>,
		maxColorCount: number
	): ColorMap;

	class ColorMap {
		palette(): Array<[number, number, number]>;
		map(pixel: [number, number, number]): [number, number, number];
	}
}
