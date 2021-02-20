import EntityBase from './classes/EntityBase';
import Hyrit from './hyrit';
import circleCollision from './utils/circleCollision';


export default class Engine {

  hyrit: Hyrit;

  constructor (hyrit: Hyrit) {
    this.hyrit = hyrit;
  }

  public update () {

    this.removeDeadEntities();

    const entities = this.hyrit.getEntitiesList();

    this.updateStats(entities);
    this.updateEntities(entities);
    this.handleCollisions(entities);
    this.updateAliveness(entities);
  }


  private handleCollisions (entities: EntityBase[]) {

    const possibleCollisions = this.getPossiblyCollidingEntitiesGroups(entities);

    for (const group of possibleCollisions) {
      for (const a of group) {
        for (const b of group) {

          if (!b.alive) {
            continue;
          }

          if (b.mass >= a.mass) {
            continue;
          }

          const { collides, distance } = circleCollision(
            a.pos.x,  b.pos.x,
            a.pos.y,  b.pos.y,
            a.radius, b.radius
          );

          if (!collides) {
            continue;
          }

          this.resolveCollisionPushing(a, b, distance);
          a.onCollide(b);
          this.updateAliveness(a, b);

        }
      }
    }
  }

  // Sweep And Prune Algorithm
  private getPossiblyCollidingEntitiesGroups (entities: EntityBase[]): EntityBase[][] {

    const possibleCollisions: EntityBase[][] = [];
    const sortedEntities = Array.from(entities).sort((a, b) => (a.pos.x - a.radius) - (b.pos.x - b.radius));
    const activeIntervals: EntityBase[] = [];

    // console.log(sortedEntities.length)

    for (const a of sortedEntities) {

      let canCollide = false;

      for (const b of activeIntervals) {
        if (a.pos.x - a.radius < b.pos.x + b.radius) {
          canCollide = true;
        }
      }

      if (!canCollide) {
        if (activeIntervals.length > 1) {
          possibleCollisions.push(Array.from(activeIntervals));
        }
        activeIntervals.splice(0, activeIntervals.length);
      }

      activeIntervals.push(a);

    }

    if (activeIntervals.length > 1) {
      possibleCollisions.push(Array.from(activeIntervals));
    }

    possibleCollisions.push(Array.from(activeIntervals));

    // console.log(JSON.stringify(possibleCollisions))

    return possibleCollisions;
  }

  private updateStats (entities: EntityBase[]): void {
    for (const entity of entities) {

      const withinWorld = circleCollision(
        entity.pos.x, 0,
        entity.pos.y, 0,
        entity.radius, this.hyrit.worldRadius
      ).collides;
  
      entity.updateStats();
      entity.alive = entity.mass >= 1;
      entity.age++;
      entity.withinWorld = withinWorld;
      entity.radius = this.getRadiusForMass(entity.mass);
      entity.speed = this.getEntitySpeed(entity);

    }
  }

  private updateEntities (entities: EntityBase[]): void {
    for (const entity of entities) {
      entity.update(this.hyrit);
      for (const child of entity.tryToReproduce()) {
        this.hyrit.entitiesMap[child.type].push(child);
      }
    }
  }

  // Assumes 'a' is bigger than 'b'
  private resolveCollisionPushing (a: EntityBase, b: EntityBase, distance: number): void {

    const hardness = 0.08; // 1 === 100% solid
    const theta = Math.atan2(b.pos.y - a.pos.y, b.pos.x - a.pos.x);
    const dx = Math.cos(theta);
    const dy = Math.sin(theta);
    const ratio = b.mass / a.mass;

    a.pos.x += dx * (distance * ratio * hardness);
    a.pos.y += dy * (distance * ratio * hardness);

    b.pos.x -= dx * (distance * (1 - ratio) * hardness);
    b.pos.y -= dy * (distance * (1 - ratio) * hardness);

  }

  private updateAliveness (...entities) {
    for (const entity of entities) {
      entity.alive = entity.mass > 0;
    }
  }

  private removeDeadEntities (): void {
    for (const type in this.hyrit.entitiesMap) {
      this.hyrit.entitiesMap[type] = this.hyrit.entitiesMap[type].filter(entity => entity.alive);
    }
  }

  private getRadiusForMass (mass: number): number {
    return (Math.sqrt(mass) + Math.cbrt(mass)) * 1.5;
  }

  private getEntitySpeed (entity: EntityBase): number {
    const multiplier = entity.dna.speed ** 2;
    const base = Math.log(entity.mass) / Math.sqrt(entity.mass);
    return (1 + 3 * base * multiplier);
  }

}
