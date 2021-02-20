export default function trimDecimals (x: number, digits: number = 2): number {
  return Number(x.toFixed(digits));
};
