export default class Vector2 {

  static new (x: number = 0, y: number = 0): Vector2 {
    return new this(x, y);
  }

  static randomDirection () {

    const theta = Math.random() * Math.PI * 2;

    return new this(
      Math.cos(theta),
      Math.sin(theta)
    );

  }

  static randomPointInCircle (radius: number) {

    const theta = 2 * Math.PI * Math.random();
    const u = Math.random() + Math.random();
    const r = u > 1 ? 2 - u : u;

    return new this(
      r * Math.cos(theta) * radius,
      r * Math.sin(theta) * radius
    );

  }

  static from (vector: { x: number; y: number }) {
    return new this(vector.x, vector.y)
  }

  static rotateTowards (a: Vector2, b: Vector2, rotationRate = 1): void {
    const newDir = Math.atan2(b.y - a.y, b.x - a.x);
    a.x = a.x * (1 - rotationRate) + Math.cos(newDir) * rotationRate;
    a.y = a.y * (1 - rotationRate) + Math.sin(newDir) * rotationRate;
  }

  static addVector (a: Vector2, b: Vector2, multiplier = 1): void {
    a.x += b.x * multiplier,
    a.y += b.y * multiplier;
  }

  static getDir (a: Vector2, b: Vector2): Vector2 {
    const t = Math.atan2(b.y - a.y, b.x - a.x);
    return this.new(Math.cos(t), Math.sin(t));
  }


  x: number;
  y: number;

  constructor (x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }


  // set (x: number, y: number): this {
  //   this.x = x;
  //   this.y = y;
  //   return this;
  // }

  // copy (vector: Vector2): this {
  //   this.set(vector.x, vector.y);
  //   return this;
  // }

  // add (x: number, y: number, multiplier = 1): this {
  //   this.x += x * multiplier;
  //   this.y += y * multiplier;
  //   return this;
  // }

  // multiply (z: number) {
  //   this.x *= z;
  //   this.y *= z;
  //   return this;
  // }

}
