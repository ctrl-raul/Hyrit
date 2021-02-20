import Hyrit from './hyrit/hyrit';

import Cell from './entityModels/cell';
import Protein from './entityModels/protein';


// @ts-ignore
const hyrit = window.hyrit = new Hyrit({

  container: document.body,
  rngFunction: Math.random,
  worldRadius: 6000,

  entityModels: [
    {
      EntityClass: Cell,
      initialCount: 0,
      spawnEveryXFrame: 15,
    },
    {
      EntityClass: Protein,
      initialCount: 0,
      spawnEveryXFrame: 5,
    }
  ],

});


function run () {
  hyrit.update();
  requestAnimationFrame(run);
}


run();
console.log(hyrit);
