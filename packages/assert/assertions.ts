export function assertEnv<T extends readonly string[]>(
  env: NodeJS.ProcessEnv,
  ...varNames: T
): asserts env is { [K in T[number]]: string } {
  const missing = varNames.filter((name) => !(name in env));
  if (missing.length > 0) {
    const msg = `Missing environment variables: ${missing}`;
    throw new Error(msg);
  }
}
