// seedable prng
// https://gist.github.com/tommyettinger/46a874533244883189143505d203312c

function mulberry32 (seed: number): () => number {
  return () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
};


// Wrapper

let _random: () => number = () => {
  throw new Error(`Not seeded`);
};

function random (): number {
  return _random();
}

function setSeed (seed: number): void {
  _random = mulberry32(seed);
}

export default {
  random,
  setSeed,
};
