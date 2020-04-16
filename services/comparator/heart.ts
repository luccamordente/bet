import { createHeart } from "@bet/heart-beat-health";

const heart = createHeart({ maxMeanInterval: 60 * 1000 });
export default heart;
