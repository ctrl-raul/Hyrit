export default function circleCollision (
  x1: number, x2: number,
  y1: number, y2: number,
  r1: number, r2: number) {

  const distance = Math.hypot(x1 - x2, y1 - y2) - (r1 + r2);

  return {
    distance,
    collides: distance < 0
  };

};
