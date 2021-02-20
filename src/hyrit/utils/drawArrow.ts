type Vector = { x: number, y: number };

export default function drawArrow (ctx: CanvasRenderingContext2D, p1: Vector, p2: Vector): void {

  const p2Radii = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  const net1 = p2Radii - Math.PI * 1.25;
  const net2 = p2Radii + Math.PI * 1.25;

  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);

  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(p2.x + Math.cos(net1) * 10, p2.y + Math.sin(net1) * 10);
  
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(p2.x + Math.cos(net2) * 10, p2.y + Math.sin(net2) * 10);

}
