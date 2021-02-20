import hslToHex from '../utils/hslTohex';
import { randomHSL } from '../utils/randomHSL';
import Vector2 from '../utils/Vector2';
import DNAFactory, { HyritDNA } from './DNAFactory';


export default class EntityBase {

  static type = 'none';

  type = EntityBase.type;
  dna: HyritDNA;
  mass: number;
  pos: Vector2;
  dir: Vector2;
  radius = 100;
  speed = 0;
  color: string;
  alive = true;
  age = 0;
  withinWorld = true;


  constructor (args: {
    dna?: HyritDNA;
    mass?: number;
    pos?: Vector2;
    dir?: Vector2;
    color?: string;
    age?: number;
  }) {

    const {
      dna = DNAFactory.create(),
      mass = 25,
      pos = Vector2.new(),
      dir = Vector2.randomDirection(),
      color = hslToHex(...randomHSL()),
      age = 0,
    } = args;

    this.dna = dna;
    this.mass = mass;
    this.pos = pos;
    this.dir = dir;
    this.color = color;
    this.age = age;
    this.radius = 0;

  }


  // Main methods

  public draw (ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  public update (config: {
    entitiesMap: Record<string, EntityBase[]>,
    worldRadius: number,
  }) {
    config;
  }

  public onCollide (entity: EntityBase): void {
    entity;
  }

  public tryToReproduce (): EntityBase[] {
    return [];
  }

  public updateStats (): void {}

  public getInfo (): string[] {
    return [];
  }

}
