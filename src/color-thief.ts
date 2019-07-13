/*
 * Color Thief v2.0
 * by Lokesh Dhakar - http://www.lokeshdhakar.com
 *
 * Thanks
 * ------
 * Nick Rabinowitz - For creating quantize.js.
 * John Schulz - For clean up and optimization. @JFSIII
 * Nathan Spady - For adding drag and drop support to the demo page.
 *
 * License
 * -------
 * Copyright 2011, 2015 Lokesh Dhakar
 * Released under the MIT license
 * https://raw.githubusercontent.com/lokesh/color-thief/master/LICENSE
 *
 * @license
 *
 * node bindings by ori
 */

import { Canvas, CanvasRenderingContext2D, Image, ImageData } from "canvas";
import { default as quantize } from "quantize";

/**
 * Class that wraps the html image element and canvas.
 * It also simplifies some of the canvas context manipulation
 * with a set of helper functions.
 */
class CanvasImage {
	public width: number;
	public height: number;

	public canvas: Canvas;
	public context: CanvasRenderingContext2D;

	constructor(image: Image) {
		this.canvas = new Canvas(10, 10);
		this.context = this.canvas.getContext("2d");

		this.width = this.canvas.width = image.width;
		this.height = this.canvas.height = image.height;

		this.context.drawImage(image, 0, 0, this.width, this.height);
	}

	clear() {
		this.context.clearRect(0, 0, this.width, this.height);
	}

	update(imageData: ImageData) {
		this.context.putImageData(imageData, 0, 0);
	}

	getPixelCount() {
		return this.width * this.height;
	}

	getImageData() {
		return this.context.getImageData(0, 0, this.width, this.height);
	}
}

/**

 *
 * Quality is 
 **/

/**
 * Use the median cut algorithm provided by quantize.js to cluster similar
 * colors and return the base color from the largest cluster.
 * @param sourceImage
 * @param quality An optional argument. It needs to be an integer. 1 is the highest quality settings.
 * 10 is the default. There is a trade-off between quality and speed. The bigger the number, the
 * faster a color will be returned but the greater the likelihood that it will not be the visually
 * most dominant color.
 */
export const getColor = (sourceImage: Image, quality: number) => {
	const palette = getPalette(sourceImage, 5, quality);
	const dominantColor = palette ? palette[0] : null;
	return dominantColor;
};

/**
 * Use the median cut algorithm provided by quantize.js to cluster similar colors.
 *
 * BUGGY: Function does not always return the requested amount of colors. It can be +/- 2.
 * @param sourceImage
 * @param colorCount Determines the size of the palette; the number of colors returned. If not set, it
 * defaults to 10.
 * @param quality An optional argument. It needs to be an integer. 1 is the highest quality settings.
 * 10 is the default. There is a trade-off between quality and speed. The bigger the number, the
 * faster the palette generation but the greater the likelihood that colors will be missed.
 */
export const getPalette = (
	sourceImage: Image,
	colorCount = 10,
	quality = 10
): Array<[number, number, number]> | null => {
	if (colorCount < 2 || colorCount > 256) {
		colorCount = 10;
	}
	if (quality < 1) {
		quality = 10;
	}

	// Create custom CanvasImage object
	const image = new CanvasImage(sourceImage);
	const imageData = image.getImageData();
	const pixels = imageData.data;
	const pixelCount = image.getPixelCount();

	// Store the RGB values in an array format suitable for quantize function
	const pixelArray: Array<[number, number, number]> = [];
	for (
		let i = 0, offset: number, r: number, g: number, b: number, a: number;
		i < pixelCount;
		i = i + quality
	) {
		offset = i * 4;
		r = pixels[offset + 0];
		g = pixels[offset + 1];
		b = pixels[offset + 2];
		a = pixels[offset + 3];
		// If pixel is mostly opaque and not white
		if (a >= 125) {
			if (!(r > 250 && g > 250 && b > 250)) {
				pixelArray.push([r, g, b]);
			}
		}
	}

	// Send array to quantize function which clusters values
	// using median cut algorithm
	const cmap = quantize(pixelArray, colorCount);
	const palette = cmap ? cmap.palette() : null;

	// Clean up

	return palette;
};

export const getColorFromUrl = (
	imageUrl: string,
	quality: number
): Promise<[number, number, number] | null> => {
	return new Promise((resolve, reject) => {
		const sourceImage = new Image();
		sourceImage.src = imageUrl;

		sourceImage.onload = () => {
			const palette = getPalette(sourceImage, 5, quality);
			const dominantColor = palette ? palette[0] : null;
			resolve(dominantColor);
		};

		sourceImage.onerror = (err) => reject(err);
	});
};
