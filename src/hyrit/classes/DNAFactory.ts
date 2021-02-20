export class HyritDNA {
  speed = 0;
  huntingBoredoomCap = 0;
  decayEfficiency = 0;
  curvingRate = 0;
  massToNeededReproduce = 0;
}


export default {
  create,
  match,
};


function create (from?: HyritDNA): HyritDNA {

  const dna = new HyritDNA();

  if (from) {
    return Object.assign({}, from);
  }

  const maxPointsPerGene = 1000; // You probably don't need to edit this :)
  const geneNames = Object.keys(dna) as (keyof HyritDNA)[];
  const nonMaxedGeneNames = Array.from(geneNames);

  let genePoints = geneNames.length * (maxPointsPerGene / 3);

  while (genePoints > 0) {

    const randomGeneNameIndex = Math.floor(Math.random() * nonMaxedGeneNames.length);
    const randomGeneName = nonMaxedGeneNames[randomGeneNameIndex];

    const genePointsToAdd = Math.min(
      // Faster and less balanced than adding 1 by 1
      Math.ceil(Math.random() * maxPointsPerGene / 6),
      // Makes sure it won't make it go over the max
      maxPointsPerGene - dna[randomGeneName],
      // Makes sure it won't give more points than remaining
      genePoints
    );

    dna[randomGeneName] += genePointsToAdd;

    if (dna[randomGeneName] === maxPointsPerGene) {
      nonMaxedGeneNames.splice(randomGeneNameIndex, 1);
    }

    genePoints -= genePointsToAdd;
  }

  // Normalize to 0-1
  for (const geneName of geneNames) {
    dna[geneName] /= maxPointsPerGene;
  }

  return dna;
}

function match (a: HyritDNA, b: HyritDNA): boolean {
  const geneNames = Object.keys(a) as (keyof HyritDNA)[];
  return !geneNames.some(gene => a[gene] !== b[gene]);
}
