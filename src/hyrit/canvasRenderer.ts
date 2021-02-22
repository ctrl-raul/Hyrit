import EntityBase from './classes/EntityBase';
import Hyrit from './hyrit';
import addCrossBrowserWheelEventListener from './utils/addCrossBrowserWheelEventListener';
import gridInCircle from './utils/gridInCircle';
import Vector2 from './utils/Vector2';


export default class CanvasRenderer {
  
  hyrit: Hyrit;

  root: HTMLDivElement;
  canvas: HTMLCanvasElement;
  infoPanel: HTMLElement;

  ctx: CanvasRenderingContext2D;

  config = {
    zoom: 1,
    panning: false, // Solely informational
    frame: 0,
    camera: Vector2.new(),
    mouse: {
      pos: Vector2.new(),
      clientPosition: Vector2.new(),
    },
  }

  cache = {
    visibleEntitiesCount: 0,
  };

  constructor (hyrit: Hyrit) {

    this.initDOM();

    this.hyrit = hyrit;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
  
    this.root.addEventListener('mousemove', e => this.updateMousePosition(e));
    window.addEventListener('resize', () => this.adjustToParentSize());
    hyrit.container.appendChild(this.root);
  
    this.adjustToParentSize();
    this.initPanning();
    this.initZooming();

  }

  private initDOM (): void {

    // Root
    this.root = document.createElement('div');
    this.root.id = 'hyrit-container';
  
    // Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.draggable = false;
    this.root.appendChild(this.canvas);
  
    // Info Panel
    this.infoPanel = document.createElement('hyrit-info-panel');
    this.root.appendChild(this.infoPanel);

  }

  public render (config: {
    entities: EntityBase[];
    worldRadius: number;
  }) {
  
    const {
      worldRadius,
      entities,
    } = config;
  
    const visibleEntities = this.getVisibleEntities(entities);
    const { ctx, canvas } = this;
  
    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Save current state to restore after transformations
    ctx.save();
  
    // Zooming
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(this.config.zoom, this.config.zoom);
  
    // Camera position
    ctx.translate(-this.config.camera.x, -this.config.camera.y);
  
    this.renderWorldLines(worldRadius);
    this.renderEntities(visibleEntities);
  
    // Mouse (Mostly for debug purposes)
    // ctx.beginPath();
    // ctx.lineWidth = 1;
    // ctx.strokeStyle = 'orange';
    // ctx.arc(this.config.mouse.pos.x, this.config.mouse.pos.y, 3, 0, Math.PI * 2);
    // ctx.stroke();
    // ctx.closePath();
  
    ctx.restore();
  
    // Center of screen
    if (this.hyrit.focusedEntity === null) {
      ctx.beginPath();
      ctx.strokeStyle = 'white';
      ctx.moveTo(canvas.width / 2 - 4, canvas.height / 2);
      ctx.lineTo(canvas.width / 2 + 4, canvas.height / 2);
      ctx.moveTo(canvas.width / 2, canvas.height / 2 - 4);
      ctx.lineTo(canvas.width / 2, canvas.height / 2 + 4);
      ctx.stroke();
      ctx.closePath();
    }
  
  }

  public updateInfoPanel (lines: string[]): void {
    this.infoPanel.innerText = lines.join('\n');
  }

  private updateMousePosition (e?: MouseEvent): void {
    this.config.mouse.clientPosition.x = e?.clientX || this.config.mouse.clientPosition.x;
    this.config.mouse.clientPosition.y = e?.clientY || this.config.mouse.clientPosition.y;
    this.config.mouse.pos.x = (this.config.mouse.clientPosition.x - (this.root.offsetWidth  / 2)) / this.config.zoom + this.config.camera.x;
    this.config.mouse.pos.y = (this.config.mouse.clientPosition.y - (this.root.offsetHeight / 2)) / this.config.zoom + this.config.camera.y;
  }

  private getVisibleEntities (entities: EntityBase[]): EntityBase[]  {

    const halfCanvasW = this.canvas.width  / 2 / this.config.zoom;
    const halfCanvasH = this.canvas.height / 2 / this.config.zoom;

    const visibleEntities = entities.filter(entity => {
      const radius = entity.radius;
      return (
        entity.pos.x + radius > this.config.camera.x - halfCanvasW &&
        entity.pos.y + radius > this.config.camera.y - halfCanvasH &&
        entity.pos.x - radius < this.config.camera.x + halfCanvasW &&
        entity.pos.y - radius < this.config.camera.y + halfCanvasH
      );
    });

    this.cache.visibleEntitiesCount = visibleEntities.length;

    return visibleEntities;
  
  }

  private initPanning (): void {

    let dragStartPosition: Vector2 | null = null;

    this.canvas.addEventListener('mousedown', e => {
      dragStartPosition = Vector2.new(e.clientX, e.clientY);
      this.canvas.style.cursor = 'move';
    });

    this.canvas.addEventListener('mouseup', () => {
      dragStartPosition = null;
      setTimeout(() => this.config.panning = false, 10);
      this.canvas.style.cursor = '';
    });

    this.canvas.addEventListener('mousemove', e => {
      if (dragStartPosition !== null) {
        this.config.panning = true;
        this.hyrit.setFocusedEntity(null);
        this.config.camera.x += (dragStartPosition.x - e.clientX) / this.config.zoom;
        this.config.camera.y += (dragStartPosition.y - e.clientY) / this.config.zoom;
        dragStartPosition.x = e.clientX;
        dragStartPosition.y = e.clientY;
      }
    });

    // Alternative dragging code (Less accurate (Idk why)) (btw code of old engine)
    // const drag = (e: MouseEvent) => {
    //   this.camera.x -= e.movementX;
    //   this.camera.y -= e.movementY;
    // };
    // this.canvas.addEventListener('mousedown', () => {
    //   this.canvas.addEventListener('mousemove', drag);
    //   this.canvas.style.cursor = 'move';
    // });
    // this.canvas.addEventListener('mouseup', () => {
    //   this.canvas.removeEventListener('mousemove', drag);
    //   this.canvas.style.cursor = '';
    // });

  }

  private initZooming (): void {

    const minZoom = 0.1;
    const maxZoom = 3;

    addCrossBrowserWheelEventListener(this.canvas, (e, delta) => {

      e.preventDefault();

      this.updateMousePosition(e);

      const oldZoom = this.config.zoom;
      const scale = 1 + 0.15 * -delta;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, this.config.zoom * scale));

      this.config.zoom = newZoom;

      if (this.hyrit.focusedEntity === null && newZoom > minZoom && newZoom < maxZoom) {

        const centerX = window.innerWidth  / 2;
        const centerY = window.innerHeight / 2;
        const mouseX = e.clientX - this.canvas.offsetLeft;
        const mouseY = e.clientY - this.canvas.offsetTop;
        const zoomDifference = oldZoom - newZoom;

        this.config.camera.x += Math.round((centerX - mouseX - zoomDifference) * 0.15 / newZoom * delta);
        this.config.camera.y += Math.round((centerY - mouseY - zoomDifference) * 0.15 / newZoom * delta);

      }

    });
  }

  private renderWorldLines (worldRadius: number): void {

    const tileSize = 256;
    const { ctx } = this;
  
    ctx.beginPath();
    ctx.strokeStyle = ctx.fillStyle = '#ffffff22';
  
    // Center
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
  
    // Borders
    ctx.arc(0, 0, worldRadius, 0, Math.PI * 2);
  
    // Grid
    ctx.fillText(tileSize + 'x' + tileSize, 10, 20);
    for (const [a, b] of gridInCircle(worldRadius, tileSize)) {
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
  
    ctx.stroke();
    ctx.closePath();

  }
  
  private renderEntities (entities: EntityBase[]): void {
    for (const entity of entities.sort((a, b) => a.mass - b.mass)) {
      entity.draw(this.ctx);
    }
  }
  
  private adjustToParentSize (): void {
    if (this.canvas.parentElement === null) {
      throw new Error(`Hyrit element not in DOM`);
    }
    this.canvas.width  = this.canvas.parentElement.offsetWidth;
    this.canvas.height = this.canvas.parentElement.offsetHeight;
  }

}
