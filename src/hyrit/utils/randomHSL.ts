import mulberry32 from "./mulberry32";

export function randomHSL (randomFunction = mulberry32.random): [number, number, number] {
  const h = Math.floor(randomFunction() * 360);
  const s = 80 + Math.round(20 * randomFunction());
  const l = 50 + Math.round(30 * randomFunction());
  return [h, s, l];
};
