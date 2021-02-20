import CanvasRenderer from './canvasRenderer';
import EntityBase from './classes/EntityBase';
import Entity from './classes/EntityBase';
import Engine from './Engine';
import circleCollision from './utils/circleCollision';
import Timer from './utils/Timer';
import Vector2 from './utils/Vector2';


type RNGFunction = () => number;


export interface EntityModel <T extends typeof Entity = any> {
  EntityClass: T;
  initialCount: number;
  spawnEveryXFrame: number;
};


export default class Hyrit {

  container: HTMLElement;
  renderer: CanvasRenderer;
  engine: Engine;

  entityModelsMap: Record<string, EntityModel> = {};
  entitiesMap: Record<string, Entity[]> = {};

  focusedEntity: Entity | null = null;
  worldRadius: number;

  updateTimer = new Timer();
  renderTimer = new Timer();

  info = {
    frame: 0,
    msPerRender: 0,
    msPerUpdate: 0,
    totalMass: 0,
  };

  constructor (config: {
    container: HTMLElement;
    rngFunction: RNGFunction;
    worldRadius: number,
    entityModels: EntityModel[];
  }) {

    const {
      container,
      worldRadius,
      entityModels,
      // rngFunction, TODO
    } = config;

    this.container = container;
    this.worldRadius = worldRadius;

    for (const model of entityModels) {
      this.entityModelsMap[model.EntityClass.type] = model;
    }

    this.initEntities();
  
    this.renderer = new CanvasRenderer(this);
    this.engine = new Engine(this);

    this.renderer.canvas.addEventListener('click', () => {

      if (this.renderer.config.panning) return;

      for (const entity of this.getEntitiesList()) {

        const { collides } = circleCollision(
          entity.pos.x, this.renderer.config.mouse.pos.x,
          entity.pos.y, this.renderer.config.mouse.pos.y,
          entity.radius, 0
        );

        if (collides) {
          this.setFocusedEntity(entity);
          return;
        }

      }

      // this.replicatingCellManager.newEntity({
      //   hyrit: this.hyrit,
      //   mass: 10 + this.hyrit.random() * 90,
      //   pos: Vector2.from(this.mouse.pos)
      // });

    });

  }

  public update (): number {
  
    const entities = this.getEntitiesList();

    this.info.frame++;

    this.updateTimer.start();
    this.engine.update();
    this.updateTimer.stop();

    this.renderTimer.start();
    this.renderer.render({
      worldRadius: this.worldRadius,
      entities,
    });
    this.renderTimer.stop();


    if (this.info.frame % 30 === 0) {
      this.info.msPerUpdate = this.updateTimer.time;
      this.info.msPerRender = this.renderTimer.time;
      this.info.totalMass = entities.reduce((a, b) => a + b.mass, 0);
    }


    const infoLines = [
      '- general -',
      `entities: ${entities.length} (${this.renderer.cache.visibleEntitiesCount} visible)`,
      `total mass: ${Math.round(this.info.totalMass)}`,
      `ms per update: ${this.info.msPerUpdate.toFixed(3)}`,
      `ms per render: ${this.info.msPerRender.toFixed(3)}`,
    ];

    if (this.focusedEntity) {
      infoLines.push(
        '',
        '- focused entity -',
        `type: ${this.focusedEntity.type}`,
        `alive: ${this.focusedEntity.alive}`,
        `mass: ${this.focusedEntity.mass.toFixed(3)}`,
        `speed: ${this.focusedEntity.speed.toFixed(3)}`,
        ...this.focusedEntity.getInfo(),
        `dna:`,
        ...Object.entries(this.focusedEntity.dna).map(([gene, value]) => gene + ' ' + value.toFixed(3)),
      );
    }

    this.renderer.updateInfoPanel(infoLines);


    // Quick hack to make entitie spawn
    for (const [type, model] of Object.entries(this.entityModelsMap)) {
      if (this.info.frame % model.spawnEveryXFrame === 0) {
        this.entitiesMap[type].push(
          new model.EntityClass({
            pos: Vector2.randomPointInCircle(this.worldRadius),
          }),
        );
      }
    }


    return this.info.frame;

  }

  private initEntities (): void {
  
    for (const [type, model] of Object.entries(this.entityModelsMap)) {
      this.entitiesMap[type] = Array(model.initialCount).fill(null).map(() => {
        return new model.EntityClass({
          pos: Vector2.randomPointInCircle(this.worldRadius),
          // age: Math.round(Math.random() * 1000),
        });
      });
    }
  }

  public setFocusedEntity (entity: EntityBase | null): void {

    if (entity === null) {
      if (this.focusedEntity !== null) {
        this.renderer.config.camera = Vector2.from(this.focusedEntity.pos);
      }
    } else {
      this.renderer.config.camera = entity.pos;
      console.log('focusing:', entity);
    }

    this.focusedEntity = entity;

  }

  public createEntityModel <T extends typeof Entity> (model: EntityModel<T>): EntityModel<T> {
    return model;
  }


  // Utils

  public getEntitiesList (): EntityBase[] {
    const result: EntityBase[] = [];
    for (const [_type, entities] of Object.entries(this.entitiesMap)) {
      result.push(...entities);
    }
    return result;
  }

}
