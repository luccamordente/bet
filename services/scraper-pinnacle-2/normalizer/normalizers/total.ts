function test(bet): boolean {
  return true;
}

function normalize(bet) {
  return Object.assign(bet, { normalized: true });
}

export {
  test,
  normalize
};
