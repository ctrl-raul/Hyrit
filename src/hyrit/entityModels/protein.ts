import mulberry32 from '../utils/mulberry32';
import EntityBase from '../classes/EntityBase';


export default class Protein extends EntityBase {

  static type = 'protein';

  type = Protein.type;

  rotation = {
    currentRadii: mulberry32.random() * Math.PI * 2,
    multiplier: mulberry32.random() > 0.5 ? 1 : -1,
    speed: 0.1 * mulberry32.random(),
  };

  constructor (args: ConstructorParameters<typeof EntityBase>[0]) {
    super({
      mass: Math.ceil(mulberry32.random() * 10),
      ...args
    });
  }


  public update () {
    this.rotation.currentRadii += Math.PI / 10 * this.rotation.speed * this.rotation.multiplier;
    if (this.rotation.currentRadii * this.rotation.multiplier > Math.PI) {
      this.rotation.currentRadii += Math.PI * -this.rotation.multiplier;
    }
  }

  public draw (ctx: CanvasRenderingContext2D) {

    const dx = Math.cos(this.rotation.currentRadii);
    const dy = Math.sin(this.rotation.currentRadii);

    ctx.beginPath();

    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.radius;
    ctx.lineCap = 'round';

    ctx.moveTo(
      this.pos.x - (this.radius / 2) * dx,
      this.pos.y - (this.radius / 2) * dy,
    );
    ctx.lineTo(
      this.pos.x + (this.radius / 2) * dx,
      this.pos.y + (this.radius / 2) * dy,
    );

    ctx.stroke();
    ctx.closePath();
  }

}
