import extract from "./extract";
import transform from "./transform";
import load from "./load";

extract((marketGroup) => {
  transform(marketGroup, load);
});
