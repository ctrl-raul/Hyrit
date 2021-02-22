import DNAFactory from '../classes/DNAFactory';
import circleCollision from '../utils/circleCollision';
import Vector2 from '../utils/Vector2';
import EntityBase from '../classes/EntityBase';
import drawArrow from '../utils/drawArrow';
import petname from '../node-petname/node-petname';
import mulberry32 from '../utils/mulberry32';


export default class Cell extends EntityBase {

  static type = 'cell';

  type = Cell.type;

  name: string;
  scope: number;
  huntingCooldown = 0;
  huntingCooldownCap = 180;
  huntingBoredoomCap: number;
  huntingBoredoomClock = 0;
  massNeededToReproduce: number;

  wandering = {
    rotation: 0,
    distance: 0,
    pos: Vector2.new(),
    dir: Vector2.randomDirection(),
  };

  wanderingDirRotation: number;
  wanderingDirDistance: number;
  wanderingDirRadii = mulberry32.random() * Math.PI * 2;

  targetedEntity = null as EntityBase | null;
  targetedPosition = Vector2.new();

  tryingToComeBackToWorld = false;


  constructor (args: ConstructorParameters<typeof EntityBase>[0]) {

    super({
      mass: args.mass || 25 + Math.round(mulberry32.random() * 25),
      ...args,
    });

    const nameWordsCount = Math.ceil(Math.pow(mulberry32.random(), 3) * 4);

    this.name = petname(nameWordsCount);
    this.scope = this.radius * 5;
    this.huntingBoredoomCap = Math.round(500 + 1500 * this.dna.huntingBoredoomCap);
    this.massNeededToReproduce = 800 + 200 * this.dna.massToNeededReproduce ** 2;
    this.updateWanderingController();

  }


  public update (config: {
    entitiesMap: Record<string, EntityBase[]>,
    worldRadius: number,
  }) {
    this.updateStats();
    this.manageTarget(config.entitiesMap, config.worldRadius);
    this.move();
    this.decay();
  }

  public draw (ctx: CanvasRenderingContext2D) {

    const wanderIndicator = 0;
    const scope = 0;
    const body = 1;
    const eye = 1;

    // Target
    // ctx.beginPath();
    // ctx.strokeStyle = this.color;
    // ctx.lineWidth = 1;
    // ctx.moveTo(this.pos.x, this.pos.y);
    // ctx.lineTo(this.targetedPosition.x, this.targetedPosition.y);
    // ctx.stroke();
    // ctx.closePath();

    if (wanderIndicator) {
      ctx.beginPath();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1;
      drawArrow(ctx, this.pos, this.targetedPosition);
      // ctx.moveTo(this.pos.x, this.pos.y);
      // ctx.lineTo(this.pos.x + wanderingDir.x, this.pos.y + wanderingDir.y);
      ctx.stroke();
      ctx.closePath();
    }

    if (scope) {
      ctx.beginPath();
      ctx.fillStyle = this.color + '10';
      ctx.arc(this.pos.x, this.pos.y, this.scope, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }

    if (body) {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }

    if (eye) {
      const eyeRadius = Math.sqrt(this.radius);
      ctx.beginPath();
      ctx.fillStyle = '#000000';
      ctx.arc(
        this.pos.x + (this.radius * 0.9 - eyeRadius) * this.dir.x,
        this.pos.y + (this.radius * 0.9 - eyeRadius) * this.dir.y,
        eyeRadius, 0, Math.PI * 2
      );
      ctx.fill();
      ctx.closePath();
    }

    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.fillText(this.name, this.pos.x - this.name.length * 2.2, this.pos.y + this.radius + 10);
    ctx.closePath();
  }

  public onCollide (entity): void {
    switch (entity.type) {
      case 'cell':
        if (DNAFactory.match(this.dna, entity.dna)) {
          return;
        }
        const drain = Math.min(
          1,
          entity.mass,
          Math.cbrt(this.mass) - Math.cbrt(entity.mass)
        );
        this.mass += drain;
        entity.mass -= drain;
        break;
      case 'protein':
        this.mass += entity.mass;
        entity.mass = 0;
        break;
    }
  }


  private move (): void {
    Vector2.addVector(this.pos, this.dir, this.speed);
  }

  private manageTarget (entitiesMap: Record<string, EntityBase[]>, _worldRadius: number): void {

    if (this.huntingCooldown > 0) {
      this.huntingCooldown--;
      return;
    }
  
    if (this.targetedEntity !== null) {
  
      this.huntingBoredoomClock++;
  
      const tookTooLongToReach = this.huntingBoredoomClock >= this.huntingBoredoomCap;
      const canTarget = this.canTargetEntity(this.targetedEntity);
  
      if (tookTooLongToReach || !canTarget) {
  
        if (tookTooLongToReach) {
          this.huntingCooldown = this.huntingCooldownCap;
        }
  
        this.huntingBoredoomClock = 0;
        this.targetedEntity = null;
      }
  
    } else if (this.age % 10 === 0) {
  
      const targetableEntities = [
        ...entitiesMap['cell'],
        ...entitiesMap['protein'],
      ];
  
      // Tries to find a cell to target
      for (const target of targetableEntities) {
  
        // Skips itself, entities of the same dna, and entities with same mass
        if (!this.canTargetEntity(target)) {
          continue;
        }
  
        const { collides } = circleCollision(
          this.pos.x, target.pos.x,
          this.pos.y, target.pos.y,
          this.scope, target.radius
        );
  
        if (collides) {
          // this.huntingBoredoomClock = 0; Not necessary because it doesn't get bored targeting positions
          this.targetedEntity = target;
          break;
        }
  
      }
    }
  
    // Still didn't find a good target
    // if (this.targetedEntity === null) {
      this.updateWanderingController();
    // }

    this.targetedPosition = this.targetedEntity?.pos || this.wandering.pos;

    Vector2.rotateTowards(
      this.dir,
      Vector2.getDir(this.pos, this.targetedPosition),
      0.01 + 0.09 * this.dna.curvingRate
    );
  }

  private updateWanderingController (): void {

    if (this.age % 130 === 0) {
      this.wandering.distance = 50 + mulberry32.random() * 450;
      this.wandering.rotation = (mulberry32.random() - 0.5) * 0.025;
    }

    const radii = this.wandering.rotation + (
      !this.withinWorld && this.age % 120 === 0
      ? this.getSpotInWorldDirection()
      : Math.atan2(this.wandering.dir.y, this.wandering.dir.x)
    );

    this.wandering.dir.x = Math.cos(radii);
    this.wandering.dir.y = Math.sin(radii);
    this.wandering.pos.x = this.pos.x + this.wandering.dir.x * this.wandering.distance;
    this.wandering.pos.y = this.pos.y + this.wandering.dir.y * this.wandering.distance;

  }

  private getSpotInWorldDirection (): number {
    const radii = Math.atan2(-this.pos.y, -this.pos.x);
    const limitA = radii - Math.PI / 2;
    const limitB = radii + Math.PI / 2;
    return mulberry32.random() * (limitB - limitA) + limitA;
  }

  private canTargetEntity (entity: EntityBase): boolean {

    const inScope = circleCollision(
      this.pos.x, entity.pos.x,
      this.pos.y, entity.pos.y,
      this.scope, entity.radius
    ).collides;

    // Don't need to check itself, since already checks mass difference

    return (
      inScope &&
      entity.alive &&
      entity.withinWorld &&
      this.mass > entity.mass &&
      !DNAFactory.match(this.dna, entity.dna)
    );

  }

  public updateStats (): void {
    this.scope = this.radius * 5;
  }

  public tryToReproduce (): EntityBase[] {

    if (this.targetedEntity !== null) {
      if (this.mass / 2 > this.targetedEntity.mass) {
        // Nothing
      } else {
        return [];
      }
    }

    if (this.mass > this.massNeededToReproduce) {

      this.mass /= 2;
      // this.stamina /= 2;

      return [
        new Cell({
          mass: this.mass,
          color: this.color,
          pos: Vector2.new(
            this.pos.x + mulberry32.random(),
            this.pos.y + mulberry32.random(),
          ),
          dna: DNAFactory.create(this.dna),
          // stamina: this.stamina
        })
      ];

    }

    return [];
  }

  public getInfo (): string[] {
    return [
      `name: ${this.name}`,
      `hunting boredoom: ${this.huntingBoredoomClock}/${this.huntingBoredoomCap}`,
    ];
  }

  private decay (): void {
    // this.stamina--;
    this.mass *= 0.9994 + this.dna.decayEfficiency / 2000;
  }

}
