import normalizer, { register } from "@bet/normalizer";

import * as TotalNormalizer from './normalizers/total';
register(TotalNormalizer);

export default normalizer;