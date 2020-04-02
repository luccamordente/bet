interface Normalizer {
  test: (obj: unknown) => boolean;
  normalize: (obj: unknown) => Bettable;
}

interface Success {
  status: "ok";
  object: Bettable;
}

interface Failure {
  status: "unhandled";
}

const normalizers: Normalizer[] = [];

export function register(normalizer: Normalizer) {
  normalizers.push(normalizer);
}

export default function normalize(obj: object): Success | Failure {
  for (const normalizer of normalizers) {
    if (normalizer.test(obj)) {
      return {
        status: "ok",
        object: normalizer.normalize(obj)
      };
    }
  }
  return { status: "unhandled" };
}
