import Hyrit from './hyrit/hyrit';

import Cell from './hyrit/entityModels/cell';
import Protein from './hyrit/entityModels/protein';


// @ts-ignore
const hyrit = window.hyrit = new Hyrit({

  seed: Math.round(Math.random() * 1000000),
  container: document.body,
  worldRadius: 5000,

  entityModels: [
    {
      EntityClass: Cell,
      initialCount: 1000,
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
