function americanToDecimal(american: number): number {
  let ret: number;
  if (american < 0) {
    ret = 1 + -100 / american;
  } else {
    ret = 1 + american / 100;
  }
  return ret;
}

export { americanToDecimal };
