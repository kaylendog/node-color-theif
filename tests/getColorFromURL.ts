import { getColorFromUrl } from "../src/color-thief";

getColorFromUrl(
	"https://upload.wikimedia.org/wikipedia/commons/6/66/An_up-close_picture_of_a_curious_male_domestic_shorthair_tabby_cat.jpg",
	10
).then((v) => console.log(v));
