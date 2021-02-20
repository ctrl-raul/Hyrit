/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/hyrit/classes/CanvasRenderer.ts":
/*!*********************************************!*\
  !*** ./src/hyrit/classes/CanvasRenderer.ts ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EntityBase_1 = __importDefault(__webpack_require__(/*! ../entities/EntityBase */ "./src/hyrit/entities/EntityBase.ts"));
const ReplicatingCell_1 = __importDefault(__webpack_require__(/*! ../entities/ReplicatingCell */ "./src/hyrit/entities/ReplicatingCell.ts"));
const addCrossBrowserWheelEventListener_1 = __importDefault(__webpack_require__(/*! ../utils/addCrossBrowserWheelEventListener */ "./src/hyrit/utils/addCrossBrowserWheelEventListener.ts"));
const circleCollision_1 = __importDefault(__webpack_require__(/*! ../utils/circleCollision */ "./src/hyrit/utils/circleCollision.ts"));
const Vector2_1 = __importDefault(__webpack_require__(/*! ../utils/Vector2 */ "./src/hyrit/utils/Vector2.ts"));
function trimDecimals(x, digits = 2) {
    return Number(x.toFixed(digits));
}
class CanvasRenderer {
    constructor(hyrit) {
        this.camera = Vector2_1.default.new();
        this.mouse = {
            pos: new Vector2_1.default(),
            clientPosition: new Vector2_1.default()
        };
        this.zoom = 1;
        this.panning = false;
        this.cachedVisibleEntitiesCount = 0;
        this.hyrit = hyrit;
        this.createDOM();
        this.enablePanning();
        this.enableZooming();
    }
    createDOM() {
        window.addEventListener('keydown', e => {
            if (e.code === 'Escape') {
                e.preventDefault();
                this.hyrit.setFocusedEntity(null);
                this.camera = new Vector2_1.default();
                this.zoom = 1;
            }
        });
        // Root
        this.element = document.createElement('div');
        this.element.id = 'hyrit-container';
        this.element.addEventListener('mousemove', e => this.updateMousePosition(e));
        // Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.draggable = false;
        this.ctx = this.canvas.getContext('2d');
        this.element.appendChild(this.canvas);
        this.canvas.addEventListener('click', () => {
            if (this.panning) {
                return;
            }
            for (const entity of this.hyrit.stage.entities) {
                if (entity.type === EntityBase_1.default.types.REPLICATING_CELL) {
                    const { collides } = circleCollision_1.default(entity.pos.x, this.mouse.pos.x, entity.pos.y, this.mouse.pos.y, entity.radius, 0);
                    if (collides) {
                        this.hyrit.setFocusedEntity(entity);
                        return;
                    }
                }
            }
            this.hyrit.stage.addEntities(new ReplicatingCell_1.default({
                stage: this.hyrit.stage,
                mass: 10 + Math.random() * 90,
                pos: Vector2_1.default.from(this.mouse.pos)
            }));
        });
        // Info Panel
        this.infoPanel = document.createElement('hyrit-info-panel');
        this.element.appendChild(this.infoPanel);
    }
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // "Acid" mode
        // this.ctx.beginPath();
        // this.ctx.fillStyle = '#00000010';
        // this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // this.ctx.closePath();
    }
    render() {
        const { ctx, canvas, camera } = this;
        ctx.save();
        // Zooming
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(this.zoom, this.zoom);
        // ctx.save();
        // Camera position
        ctx.translate(-camera.x, -camera.y);
        // Center of world
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
        // World borders
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff88';
        ctx.arc(0, 0, this.hyrit.stage.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
        this.renderEntities(this.hyrit.stage.entities);
        // Mouse
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'orange';
        ctx.arc(this.mouse.pos.x, this.mouse.pos.y, 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
        // Center of screen
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.moveTo(canvas.width / 2 - 4, canvas.height / 2);
        ctx.lineTo(canvas.width / 2 + 4, canvas.height / 2);
        ctx.moveTo(canvas.width / 2, canvas.height / 2 - 4);
        ctx.lineTo(canvas.width / 2, canvas.height / 2 + 4);
        ctx.stroke();
        ctx.closePath();
    }
    renderInfo() {
        const { camera } = this;
        const lines = [
            `mouse x[${trimDecimals(this.mouse.pos.x)}] y[${(trimDecimals(this.mouse.pos.y))}]`,
            `camera x[${trimDecimals(camera.x)}] y[${trimDecimals(camera.y)}]`,
            `entities: ${this.hyrit.stage.entities.length} (${this.cachedVisibleEntitiesCount} visible)`,
            `total mass: ${trimDecimals(this.hyrit.stage.entities.reduce((a, b) => a + b.mass, 0))}`
        ];
        if (this.hyrit.focusedEntity !== null) {
            const entity = this.hyrit.focusedEntity;
            lines.push('', '- entity -', `mass: ${trimDecimals(entity.mass)}`, `stamina: ${entity.stamina}`, `hunting boredoom clock: ${entity.huntingBoredoomClock} / ${entity.huntingBoredoomCap}`, `hunting cooldown: ${entity.huntingCooldown} / ${entity.huntingCooldownCap}`, 'genes:', ...Object.entries(entity.dna.genes).map(([gene, value]) => ` ${gene}: ${trimDecimals(value)}`));
        }
        this.infoPanel.innerText = lines.join('\n');
    }
    adjustToParentSize() {
        if (this.element.parentElement === null) {
            throw new Error(`Hyrit element not in DOM`);
        }
        this.canvas.width = this.element.offsetWidth;
        this.canvas.height = this.element.offsetHeight;
    }
    updateMousePosition(e) {
        this.mouse.clientPosition.set((e === null || e === void 0 ? void 0 : e.clientX) || this.mouse.clientPosition.x, (e === null || e === void 0 ? void 0 : e.clientY) || this.mouse.clientPosition.y);
        this.mouse.pos.set((this.mouse.clientPosition.x - (this.element.offsetWidth / 2)) / this.zoom + this.camera.x, (this.mouse.clientPosition.y - (this.element.offsetHeight / 2)) / this.zoom + this.camera.y);
    }
    ;
    enablePanning() {
        let dragStartPosition = null;
        this.canvas.addEventListener('mousedown', e => {
            dragStartPosition = new Vector2_1.default(e.clientX, e.clientY);
            this.canvas.style.cursor = 'move';
        });
        this.canvas.addEventListener('mouseup', () => {
            dragStartPosition = null;
            setTimeout(() => this.panning = false, 10);
            this.canvas.style.cursor = '';
        });
        this.canvas.addEventListener('mousemove', e => {
            if (dragStartPosition !== null) {
                this.panning = true;
                this.hyrit.setFocusedEntity(null);
                this.camera.add((dragStartPosition.x - e.clientX) / this.zoom, (dragStartPosition.y - e.clientY) / this.zoom);
                dragStartPosition.set(e.clientX, e.clientY);
            }
        });
        // Alternative dragging code (Less accurate (Idk why))
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
    enableZooming() {
        addCrossBrowserWheelEventListener_1.default(this.canvas, (e, delta) => {
            e.preventDefault();
            this.updateMousePosition(e);
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const mouseX = e.clientX - this.canvas.offsetLeft;
            const mouseY = e.clientY - this.canvas.offsetTop;
            const oldZoom = this.zoom;
            const scale = 1 + 0.15 * -delta;
            this.zoom = Math.max(0.1, Math.min(3, this.zoom * scale));
            const zoomDifference = oldZoom - this.zoom;
            this.camera.x += Math.round((centerX - mouseX - zoomDifference) * 0.15 / this.zoom * delta);
            this.camera.y += Math.round((centerY - mouseY - zoomDifference) * 0.15 / this.zoom * delta);
        });
    }
    renderEntities(entities) {
        const visibleEntities = this.getVisibleEntities(entities);
        for (const entity of visibleEntities.sort((a, b) => a.mass - b.mass)) {
            entity.draw(this.ctx);
        }
    }
    getVisibleEntities(entities) {
        // return entities;
        const halfCanvasW = this.canvas.width / 2 / this.zoom;
        const halfCanvasH = this.canvas.height / 2 / this.zoom;
        const visibleEntities = entities.filter(entity => {
            const radius = entity.radius;
            return (entity.pos.x + radius > this.camera.x - halfCanvasW &&
                entity.pos.y + radius > this.camera.y - halfCanvasH &&
                entity.pos.x - radius < this.camera.x + halfCanvasW &&
                entity.pos.y - radius < this.camera.y + halfCanvasH);
        });
        this.cachedVisibleEntitiesCount = visibleEntities.length;
        return visibleEntities;
    }
}
exports.default = CanvasRenderer;


/***/ }),

/***/ "./src/hyrit/classes/HyritDNA.ts":
/*!***************************************!*\
  !*** ./src/hyrit/classes/HyritDNA.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class HyritDNA {
    constructor(dna) {
        this.genes = {
            speed: 0,
            huntingBoredoomCap: 0,
            decayEfficiency: 0,
            curvingRate: 0,
            massToNeededReproduce: 0
        };
        if (dna) {
            this.genes = Object.assign({}, dna.genes);
        }
        else {
            const maxPointsPerGene = 1000; // You probably don't need to edit this :)
            const geneNames = Object.keys(this.genes);
            const nonMaxedGeneNames = Array.from(geneNames);
            let genePoints = geneNames.length * (maxPointsPerGene / 3);
            while (genePoints > 0) {
                const randomGeneNameIndex = Math.floor(Math.random() * nonMaxedGeneNames.length);
                const randomGeneName = nonMaxedGeneNames[randomGeneNameIndex];
                const genePointsToAdd = Math.min(
                // Faster and less balanced than adding 1 by 1
                Math.ceil(Math.random() * maxPointsPerGene / 6), 
                // Makes sure it won't make it go over the max
                maxPointsPerGene - this.genes[randomGeneName], 
                // Makes sure it won't give more points than remaining
                genePoints);
                this.genes[randomGeneName] += genePointsToAdd;
                if (this.genes[randomGeneName] === maxPointsPerGene) {
                    nonMaxedGeneNames.splice(randomGeneNameIndex, 1);
                }
                genePoints -= genePointsToAdd;
            }
            // Normalize to 0-1
            for (const geneName of geneNames) {
                this.genes[geneName] /= maxPointsPerGene;
            }
        }
    }
    match(dna) {
        const geneNames = Object.keys(this.genes);
        for (const geneName of geneNames) {
            if (this.genes[geneName] !== dna.genes[geneName]) {
                return false;
            }
        }
        return true;
    }
    copy() {
        return new HyritDNA(this);
    }
}
exports.default = HyritDNA;


/***/ }),

/***/ "./src/hyrit/classes/Stage.ts":
/*!************************************!*\
  !*** ./src/hyrit/classes/Stage.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Stage {
    constructor(radius) {
        this.entities = [];
        this.radius = radius;
    }
    update() {
        for (const entity of this.entities) {
            entity.update();
        }
    }
    addEntities(...entities) {
        this.entities.push(...entities);
    }
    remEntity(entity) {
        this.entities.splice(this.entities.indexOf(entity), 1);
    }
}
exports.default = Stage;


/***/ }),

/***/ "./src/hyrit/entities/EntityBase.ts":
/*!******************************************!*\
  !*** ./src/hyrit/entities/EntityBase.ts ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Vector2_1 = __importDefault(__webpack_require__(/*! ../utils/Vector2 */ "./src/hyrit/utils/Vector2.ts"));
const HyritDNA_1 = __importDefault(__webpack_require__(/*! ../classes/HyritDNA */ "./src/hyrit/classes/HyritDNA.ts"));
function randomHSL() {
    const h = Math.floor(Math.random() * 360);
    const s = 80 + Math.round(20 * Math.random());
    const l = 50 + Math.round(30 * Math.random());
    return `hsl(${h},${s}%,${l}%)`;
}
// function randomReturnPoint (radius: number, pos: Vector2) {
//   const thetaCenter = Math.atan2(pos.y, pos.x);
//   const thetaMin = Math.PI * 2 + thetaCenter - Math.PI / 10;
//   const thetaMax = Math.PI * 2 + thetaCenter + Math.PI / 10;
//   const theta = thetaMin + Math.random() * (thetaMax - thetaMin);
//   const r = 0.9 + Math.random() * 0.1;
//   return new Vector2(
//     r * Math.cos(theta) * radius,
//     r * Math.sin(theta) * radius
//   );
// }
class EntityBase {
    constructor(type, stage, mass, color = randomHSL(), dna = new HyritDNA_1.default(), force = Vector2_1.default.new(), pos = Vector2_1.default.randomPointInCircle(stage.radius), stamina = 10000 + Math.ceil(mass * 100)) {
        this.speed = 0;
        this.radius = 0;
        this.stage = stage;
        this.type = type;
        this.mass = mass;
        this.color = color;
        this.dna = dna;
        this.stamina = stamina;
        this.pos = Vector2_1.default.from(pos);
        this.dir = Vector2_1.default.randomDirection();
        this.force = Vector2_1.default.from(force);
    }
    update() {
        throw new Error('Not implemented');
    }
    move() {
        this.pos.addVector(this.dir, this.speed);
    }
    applyForce() {
        this.pos.addVector(this.force, 1);
        this.force.x *= 0.99;
        this.force.y *= 0.99;
    }
    resolveCollisionPushing(entity, distance) {
        const hardness = 8;
        const radii = Math.atan2(entity.pos.y - this.pos.y, entity.pos.x - this.pos.x);
        const dx = Math.cos(radii);
        const dy = Math.sin(radii);
        const ratio = entity.mass / this.mass;
        this.pos.add(dx * (distance * ratio / hardness), dy * (distance * ratio / hardness));
        entity.pos.add(dx * (distance * (1 - ratio) / hardness), dy * (distance * (1 - ratio) / hardness), -1);
    }
    drain(entity, _distance) {
        // Assumes that you're always passing a smaller cell
        const drainRate = Math.cbrt(this.mass) - Math.cbrt(entity.mass);
        const drain = drainRate < entity.mass ? drainRate : entity.mass;
        let staminaBuffMultiplier = 1;
        switch (entity.type) {
            case EntityBase.types.PROTEIN:
                staminaBuffMultiplier = 64;
                break;
            case EntityBase.types.REPLICATING_CELL:
                staminaBuffMultiplier = 32;
                break;
        }
        this.mass += drain;
        this.stamina += Math.round(drain * staminaBuffMultiplier);
        entity.decay(drain);
    }
    decay(amount) {
        if (typeof amount === 'number') {
            this.mass -= amount;
        }
        else {
            this.mass *= 0.999 + this.dna.genes.decayEfficiency / 1000;
        }
        const isAlive = this.isAlive();
        if (!isAlive) {
            this.stage.remEntity(this);
        }
        return isAlive;
    }
    isAlive() {
        return this.mass >= 1;
    }
    // @ts-ignore
    draw(ctx) {
        throw new Error('Not implemented');
    }
    rotateTowards(target) {
        const newDir = Math.atan2(target.y - this.pos.y, target.x - this.pos.x);
        const rotationRate = 0.01 + 0.09 * this.dna.genes.curvingRate;
        this.dir.x = this.dir.x * (1 - rotationRate) + Math.cos(newDir) * rotationRate;
        this.dir.y = this.dir.y * (1 - rotationRate) + Math.sin(newDir) * rotationRate;
    }
    isWithinWorld() {
        return Math.hypot(this.pos.x, this.pos.y) < this.stage.radius;
    }
    getRadius() {
        return (Math.sqrt(this.mass) + Math.cbrt(this.mass)) * 1.5;
    }
}
exports.default = EntityBase;
EntityBase.types = {
    PROTEIN: Symbol('PROTEIN'),
    REPLICATING_CELL: Symbol('REPLICATING_CELL'),
};


/***/ }),

/***/ "./src/hyrit/entities/Protein.ts":
/*!***************************************!*\
  !*** ./src/hyrit/entities/Protein.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hyrit_1 = __webpack_require__(/*! ../hyrit */ "./src/hyrit/hyrit.ts");
const Vector2_1 = __importDefault(__webpack_require__(/*! ../utils/Vector2 */ "./src/hyrit/utils/Vector2.ts"));
const EntityBase_1 = __importDefault(__webpack_require__(/*! ./EntityBase */ "./src/hyrit/entities/EntityBase.ts"));
function randomHSL() {
    const h = Math.floor(Math.random() * 360);
    const s = 80 + Math.round(20 * Math.random());
    const l = 50 + Math.round(30 * Math.random());
    return `hsl(${h},${s}%,${l}%)`;
}
const pi2 = Math.PI * 2;
class Protein extends EntityBase_1.default {
    constructor(args) {
        super(EntityBase_1.default.types.PROTEIN, args.stage, args.mass, randomHSL(), undefined, args.force ? Vector2_1.default.from(args.force) : Vector2_1.default.new(), args.pos);
        this.rotation = {
            currentRadii: Math.random() * pi2,
            speed: Math.max(0.005, Math.random() / 50),
            multiplier: (Math.random() > 0.5 ? 1 : -1)
        };
    }
    update() {
        if (this.stage === null) {
            throw new Error(`Cannot update out of stage`);
        }
        this.updateRotation();
        this.grow();
        this.applyForce();
        if (Math.random() > 0.999) {
            this.tryToTurnIntoReplicatingCell();
        }
    }
    draw(ctx) {
        const radius = this.getRadius();
        const dir = new Vector2_1.default(Math.cos(this.rotation.currentRadii), Math.sin(this.rotation.currentRadii));
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = radius;
        ctx.lineCap = 'round';
        ctx.moveTo(this.pos.x - (radius / 2) * dir.x, this.pos.y - (radius / 2) * dir.y);
        ctx.lineTo(this.pos.x + (radius / 2) * dir.x, this.pos.y + (radius / 2) * dir.y);
        ctx.stroke();
        ctx.closePath();
        // Info
        // ctx.fillText('mass: ' + Number(this.mass.toFixed(2)), x + radius + 8, y);
        return this;
    }
    updateRotation() {
        this.rotation.currentRadii += this.rotation.speed * this.rotation.multiplier;
        if (this.rotation.currentRadii > pi2) {
            this.rotation.currentRadii -= pi2;
        }
        else if (this.rotation.currentRadii < 0) {
            this.rotation.currentRadii += pi2;
        }
    }
    grow() {
        this.mass += 0.001 + 0.014 * this.dna.genes.decayEfficiency;
    }
    tryToTurnIntoReplicatingCell() {
        if (this.mass < 10) {
            return;
        }
        const cell = new hyrit_1.ReplicatingCell(this);
        this.stage.remEntity(this);
        cell.pos.set(this.pos.x, this.pos.y);
        this.stage.addEntities(cell);
    }
}
exports.default = Protein;


/***/ }),

/***/ "./src/hyrit/entities/ReplicatingCell.ts":
/*!***********************************************!*\
  !*** ./src/hyrit/entities/ReplicatingCell.ts ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hyrit_1 = __webpack_require__(/*! ../hyrit */ "./src/hyrit/hyrit.ts");
const circleCollision_1 = __importDefault(__webpack_require__(/*! ../utils/circleCollision */ "./src/hyrit/utils/circleCollision.ts"));
const Vector2_1 = __importDefault(__webpack_require__(/*! ../utils/Vector2 */ "./src/hyrit/utils/Vector2.ts"));
const EntityBase_1 = __importDefault(__webpack_require__(/*! ./EntityBase */ "./src/hyrit/entities/EntityBase.ts"));
class DynamicTargetPosition {
    constructor(entity) {
        this.entity = entity;
        this.pos = Vector2_1.default.randomPointInCircle(200).addVector(entity.pos);
        this.dir = Vector2_1.default.randomDirection();
    }
    update() {
        if (Math.random() > 0.994) {
            this.rotateTowards(Vector2_1.default.randomPointInCircle(this.entity.stage.radius));
        }
        this.pos.addVector(this.dir, this.entity.speed * 1.2);
    }
    rotateTowards(target) {
        const { pos, dir } = this;
        const curDir = Math.atan2(dir.y, dir.x);
        const newDir = Math.atan2(target.y - pos.y, target.x - pos.x);
        const rotationRate = 1;
        dir.x = Math.cos(curDir) * (1 - rotationRate) + Math.cos(newDir) * rotationRate;
        dir.y = Math.sin(curDir) * (1 - rotationRate) + Math.sin(newDir) * rotationRate;
    }
}
class ReplicatingCell extends EntityBase_1.default {
    constructor(args) {
        super(EntityBase_1.default.types.REPLICATING_CELL, args.stage, args.mass, args.color, args.dna, void 0, args.pos, args.stamina);
        this.huntingBoredoomClock = 0;
        this.huntingCooldownCap = 128; // Prevents them from instantly targeting the same cell after getting bored
        this.huntingCooldown = 0;
        this.targetedEntity = null;
        this.scope = 0;
        this.targetedPosition = new DynamicTargetPosition(this);
        this.huntingBoredoomCap = Math.round(500 + 1500 * this.dna.genes.huntingBoredoomCap);
    }
    update() {
        var _a;
        this.updateStats();
        const isAlive = this.decay();
        if (!isAlive) {
            return;
        }
        this.resolveCollisions();
        this.manageTarget();
        this.rotateTowards(((_a = this.targetedEntity) === null || _a === void 0 ? void 0 : _a.pos) || this.targetedPosition.pos);
        this.move();
        this.tryToReplicate();
        this.stamina--;
        if (this.stamina < 1) {
            const proteinsToDrop = Math.ceil(this.mass / 50);
            const randomMassAddon = Math.sqrt(this.mass);
            for (let i = proteinsToDrop; i--;) {
                this.stage.addEntities(new hyrit_1.Protein({
                    stage: this.stage,
                    mass: 1 + Math.random() * randomMassAddon,
                    force: Vector2_1.default.randomDirection().multiply(Math.random()),
                    pos: this.pos
                }));
            }
            this.stage.remEntity(this);
        }
    }
    draw(ctx) {
        const radius = this.getRadius();
        const { pos, dir } = this;
        // Body
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        // Eye
        const eyeRadius = Math.sqrt(radius);
        ctx.beginPath();
        ctx.fillStyle = '#000000';
        ctx.arc(pos.x + (radius * 0.9 - eyeRadius) * dir.x, pos.y + (radius * 0.9 - eyeRadius) * dir.y, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        // Scope
        // ctx.beginPath();
        // ctx.strokeStyle = this.color;
        // ctx.arc(pos.x, pos.y, this.scope, 0, Math.PI * 2);
        // ctx.stroke();
        // ctx.closePath();
        // Info
        // ctx.beginPath();
        // ctx.fillStyle = this.color;
        // ctx.fillText('mass: ' + Number(this.mass.toFixed(2)), pos.x + radius + 8, pos.y);
        // ctx.fillText('stamina: ' + this.stamina, pos.x + radius + 8, pos.y + 14);
    }
    resolveCollisions() {
        for (const entity of this.stage.entities) {
            if (entity === this) {
                continue;
            }
            const { collides, distance } = circleCollision_1.default(this.pos.x, entity.pos.x, this.pos.y, entity.pos.y, this.radius, entity.radius);
            if (!collides)
                continue;
            switch (entity.type) {
                case EntityBase_1.default.types.REPLICATING_CELL:
                    if (this.mass >= entity.mass) {
                        this.resolveCollisionPushing(entity, distance);
                        if (this.mass > entity.mass && !this.dna.match(entity.dna)) {
                            this.drain(entity, distance);
                        }
                    }
                    break;
                case EntityBase_1.default.types.PROTEIN:
                    this.mass += entity.mass;
                    entity.decay(entity.mass);
                    break;
                default:
                    break;
            }
        }
    }
    manageTarget() {
        if (this.huntingCooldown > 0) {
            this.huntingCooldown--;
            return;
        }
        if (this.targetedEntity !== null) {
            this.huntingBoredoomClock++;
            const targetGotBigger = this.targetedEntity.mass >= this.mass;
            const gotBored = this.huntingBoredoomClock >= this.huntingBoredoomCap;
            const targetDied = !this.targetedEntity.isAlive();
            const targetRanAway = !circleCollision_1.default(this.pos.x, this.targetedEntity.pos.x, this.pos.y, this.targetedEntity.pos.y, this.getScope(), this.targetedEntity.radius).collides;
            if (targetGotBigger || gotBored || targetDied || targetRanAway) {
                if (gotBored) {
                    this.huntingCooldown = this.huntingCooldownCap;
                }
                this.huntingBoredoomClock = 0;
                this.targetedEntity = null;
            }
        }
        else {
            // Tries to find a cell to target
            for (const entity of this.stage.entities) {
                // Skips itself already
                if (entity.mass >= this.mass || this.dna.match(entity.dna)) {
                    continue;
                }
                const { collides } = circleCollision_1.default(this.pos.x, entity.pos.x, this.pos.y, entity.pos.y, this.getScope(), entity.radius);
                if (collides) {
                    // Not necessary because it doesn't get bored targeting positions
                    // this.huntingBoredoomClock = 0;
                    this.targetedEntity = entity;
                    break;
                }
            }
            // Still didn't find a good target
            if (this.targetedEntity === null) {
                this.targetedPosition.update();
            }
        }
    }
    tryToReplicate() {
        if (this.targetedEntity !== null && this.mass / 2 <= this.targetedEntity.mass) {
            return;
        }
        const multiplier = Math.pow(this.dna.genes.massToNeededReproduce, 2);
        if (this.mass > 100 + 900 * multiplier) {
            this.mass /= 2;
            this.stamina /= 2;
            const brother = new ReplicatingCell({
                stage: this.stage,
                mass: this.mass,
                color: this.color,
                dna: this.dna.copy(),
                stamina: this.stamina
            });
            brother.pos.set(this.pos.x, this.pos.y);
            this.stage.addEntities(brother);
        }
    }
    updateStats() {
        this.speed = this.getSpeed();
        this.radius = this.getRadius();
        this.scope = this.getScope();
    }
    getSpeed() {
        const multiplier = Math.pow(this.dna.genes.speed, 2);
        const base = Math.log(this.mass) / Math.sqrt(this.mass);
        const staminaPenalty = Math.min(100, this.stamina) / 100;
        return (1 + 3 * base * multiplier) * staminaPenalty;
    }
    getScope() {
        return 100 + this.radius;
    }
}
exports.default = ReplicatingCell;


/***/ }),

/***/ "./src/hyrit/hyrit.ts":
/*!****************************!*\
  !*** ./src/hyrit/hyrit.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HyritConfig = exports.Protein = exports.ReplicatingCell = void 0;
const Stage_1 = __importDefault(__webpack_require__(/*! ./classes/Stage */ "./src/hyrit/classes/Stage.ts"));
const CanvasRenderer_1 = __importDefault(__webpack_require__(/*! ./classes/CanvasRenderer */ "./src/hyrit/classes/CanvasRenderer.ts"));
const Vector2_1 = __importDefault(__webpack_require__(/*! ./utils/Vector2 */ "./src/hyrit/utils/Vector2.ts"));
const ReplicatingCell_1 = __importDefault(__webpack_require__(/*! ./entities/ReplicatingCell */ "./src/hyrit/entities/ReplicatingCell.ts"));
exports.ReplicatingCell = ReplicatingCell_1.default;
const Protein_1 = __importDefault(__webpack_require__(/*! ./entities/Protein */ "./src/hyrit/entities/Protein.ts"));
exports.Protein = Protein_1.default;
class HyritConfig {
    constructor(config = {}) {
        this.stage = {
            radius: 3072
        };
        Object.assign(this, config);
    }
}
exports.HyritConfig = HyritConfig;
class Hyrit {
    constructor(config = new HyritConfig()) {
        this.focusedEntity = null;
        this.onUpdate = null;
        const _config = new HyritConfig(config);
        console.log(':: Hyrit Config ::\n', JSON.stringify(_config, null, 2));
        this.renderer = new CanvasRenderer_1.default(this);
        this.stage = new Stage_1.default(_config.stage.radius);
        requestAnimationFrame(() => this.update());
        // @ts-ignore
        window.mouse = this.mouse;
    }
    update() {
        if (this.focusedEntity) {
            this.renderer.updateMousePosition();
            if (!this.focusedEntity.isAlive()) {
                this.setFocusedEntity(null);
            }
        }
        this.stage.update();
        this.renderer.clear();
        this.renderer.render();
        this.renderer.renderInfo();
        const frame = requestAnimationFrame(() => this.update());
        if (this.onUpdate !== null) {
            this.onUpdate(frame);
        }
    }
    setFocusedEntity(entity) {
        if (entity === null) {
            if (this.focusedEntity !== null) {
                this.renderer.camera = Vector2_1.default.from(this.focusedEntity.pos);
            }
        }
        else {
            this.renderer.camera = entity.pos;
            console.log('focusing:', entity);
        }
        this.focusedEntity = entity;
    }
}
exports.default = Hyrit;


/***/ }),

/***/ "./src/hyrit/utils/Vector2.ts":
/*!************************************!*\
  !*** ./src/hyrit/utils/Vector2.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    static new(x = 0, y = 0) {
        return new this(x, y);
    }
    static randomDirection() {
        const theta = Math.random() * Math.PI * 2;
        return new this(Math.cos(theta), Math.sin(theta));
    }
    static randomPointInCircle(radius) {
        const theta = 2 * Math.PI * Math.random();
        const u = Math.random() + Math.random();
        const r = u > 1 ? 2 - u : u;
        return new this(r * Math.cos(theta) * radius, r * Math.sin(theta) * radius);
    }
    static from(vector) {
        return new this(vector.x, vector.y);
    }
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    copy(vector) {
        this.set(vector.x, vector.y);
        return this;
    }
    add(x, y, multiplier = 1) {
        this.x += x * multiplier;
        this.y += y * multiplier;
        return this;
    }
    addVector(vector, multiplier = 1) {
        this.x += vector.x * multiplier,
            this.y += vector.y * multiplier;
        return this;
    }
    multiply(z) {
        this.x *= z;
        this.y *= z;
        return this;
    }
}
exports.default = Vector2;


/***/ }),

/***/ "./src/hyrit/utils/addCrossBrowserWheelEventListener.ts":
/*!**************************************************************!*\
  !*** ./src/hyrit/utils/addCrossBrowserWheelEventListener.ts ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* Notes
 * 1. At this point in time all browsers support the 'wheel' event, but only 80% of their versions.
 * 2. IE 9 and 10 does not have the 'onwheel' property in elements though supports it via addEventListener
 * 3. Most modern browsers support more than one of the events tested
 */
Object.defineProperty(exports, "__esModule", { value: true });
const support = {
    wheel: false,
    mousewheel: false,
    DOMMouseScroll: false
};
function getDelta(e) {
    // @ts-ignore These three properties never exist in the same event
    return (((e.deltaY || -e.wheelDelta || e.detail) >> 10) || 1);
}
let addCrossBrowserWheelEventListener = (...args) => {
    const [element, listener, options] = args;
    const handleSupport = e => {
        // This prevents from calling twice if the
        // browser supports more than one of the events
        if (Object.values(support).some(Boolean)) {
            return; // Has already been handled by another listener
        }
        support[e.type] = true;
        // Remove tests
        element.removeEventListener('wheel', handleSupport);
        element.removeEventListener('mousewheel', handleSupport);
        element.removeEventListener('DOMMouseScroll', handleSupport);
        addCrossBrowserWheelEventListener = (...args) => {
            const [_element, _listener, _options] = args;
            _element.addEventListener(e.type, e_ => {
                _listener(e_, getDelta(e_));
            }, _options);
        };
        // Add actual event listener
        addCrossBrowserWheelEventListener(...args);
        // Trigger the first time
        listener(e, getDelta(e));
    };
    // Add tests
    element.addEventListener('wheel', handleSupport, options);
    element.addEventListener('mousewheel', handleSupport, options);
    element.addEventListener('DOMMouseScroll', handleSupport, options);
};
exports.default = (...args) => addCrossBrowserWheelEventListener(...args);


/***/ }),

/***/ "./src/hyrit/utils/circleCollision.ts":
/*!********************************************!*\
  !*** ./src/hyrit/utils/circleCollision.ts ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function circleCollision(x1, x2, y1, y2, r1, r2) {
    const distance = Math.hypot(x1 - x2, y1 - y2) - (r1 + r2);
    return {
        distance,
        collides: distance < 0
    };
}
exports.default = circleCollision;
;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const hyrit_1 = __importStar(__webpack_require__(/*! ./hyrit/hyrit */ "./src/hyrit/hyrit.ts"));
const hyrit = new hyrit_1.default();
hyrit.stage.addEntities(...Array(100).fill(null).map(() => Math.random() > 1
    ? new hyrit_1.ReplicatingCell({
        stage: hyrit.stage,
        mass: 10 + Math.random() * 90
    })
    : new hyrit_1.Protein({
        stage: hyrit.stage,
        mass: 1
    })));
hyrit.onUpdate = frame => {
    const stageArea = Math.PI * hyrit.stage.radius * hyrit.stage.radius;
    const module = Math.ceil(50 / (stageArea / (Math.PI * 1000000)));
    if (frame % module === 0) {
        hyrit.stage.addEntities(new hyrit_1.Protein({
            stage: hyrit.stage,
            mass: 1 + Math.random() * 5
        }));
    }
};
document.body.appendChild(hyrit.renderer.element);
hyrit.renderer.adjustToParentSize();
window.addEventListener('resize', () => hyrit.renderer.adjustToParentSize());
// @ts-ignore
window.hyrit = hyrit;


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2h5cml0L2NsYXNzZXMvQ2FudmFzUmVuZGVyZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2h5cml0L2NsYXNzZXMvSHlyaXRETkEudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2h5cml0L2NsYXNzZXMvU3RhZ2UudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2h5cml0L2VudGl0aWVzL0VudGl0eUJhc2UudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2h5cml0L2VudGl0aWVzL1Byb3RlaW4udHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2h5cml0L2VudGl0aWVzL1JlcGxpY2F0aW5nQ2VsbC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvaHlyaXQvaHlyaXQudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2h5cml0L3V0aWxzL1ZlY3RvcjIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2h5cml0L3V0aWxzL2FkZENyb3NzQnJvd3NlcldoZWVsRXZlbnRMaXN0ZW5lci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvaHlyaXQvdXRpbHMvY2lyY2xlQ29sbGlzaW9uLnRzIiwid2VicGFjazovLy8uL3NyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSx5Q0FBeUMsaUNB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QUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ3BFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFakUsSUFBSSxLQUFLLEdBQUcsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUN4QixLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FDckIsSUFBSSxlQUFPLENBQUM7WUFDVixLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUs7WUFDbEIsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztTQUM1QixDQUFDLENBQ0gsQ0FBQztLQUNIO0FBRUgsQ0FBQyxDQUFDO0FBR0YsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNsRCxLQUFLLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFFcEMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQztBQUc3RSxhQUFhO0FBQ2IsTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2luZGV4LnRzXCIpO1xuIiwiaW1wb3J0IEVudGl0eUJhc2UgZnJvbSAnLi4vZW50aXRpZXMvRW50aXR5QmFzZSc7XHJcbmltcG9ydCBSZXBsaWNhdGluZ0NlbGwgZnJvbSAnLi4vZW50aXRpZXMvUmVwbGljYXRpbmdDZWxsJztcclxuaW1wb3J0IEh5cml0IGZyb20gJy4uL2h5cml0JztcclxuaW1wb3J0IGFkZENyb3NzQnJvd3NlcldoZWVsRXZlbnRMaXN0ZW5lciBmcm9tICcuLi91dGlscy9hZGRDcm9zc0Jyb3dzZXJXaGVlbEV2ZW50TGlzdGVuZXInO1xyXG5pbXBvcnQgY2lyY2xlQ29sbGlzaW9uIGZyb20gJy4uL3V0aWxzL2NpcmNsZUNvbGxpc2lvbic7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uL3V0aWxzL1ZlY3RvcjInO1xyXG5cclxuXHJcbmZ1bmN0aW9uIHRyaW1EZWNpbWFscyAoeDogbnVtYmVyLCBkaWdpdHM6IG51bWJlciA9IDIpOiBudW1iZXIge1xyXG4gIHJldHVybiBOdW1iZXIoeC50b0ZpeGVkKGRpZ2l0cykpO1xyXG59XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2FudmFzUmVuZGVyZXIge1xyXG5cclxuICBlbGVtZW50OiBIVE1MRWxlbWVudDtcclxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xyXG4gIGluZm9QYW5lbDogSFRNTEVsZW1lbnQ7XHJcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XHJcblxyXG4gIHByaXZhdGUgaHlyaXQ6IEh5cml0O1xyXG5cclxuICBjYW1lcmEgPSBWZWN0b3IyLm5ldygpO1xyXG4gIG1vdXNlID0ge1xyXG4gICAgcG9zOiBuZXcgVmVjdG9yMigpLFxyXG4gICAgY2xpZW50UG9zaXRpb246IG5ldyBWZWN0b3IyKClcclxuICB9O1xyXG4gIHpvb20gPSAxO1xyXG4gIHBhbm5pbmcgPSBmYWxzZTtcclxuXHJcbiAgcHJpdmF0ZSBjYWNoZWRWaXNpYmxlRW50aXRpZXNDb3VudCA9IDA7XHJcblxyXG4gIGNvbnN0cnVjdG9yIChoeXJpdDogSHlyaXQpIHtcclxuICAgIHRoaXMuaHlyaXQgPSBoeXJpdDtcclxuICAgIHRoaXMuY3JlYXRlRE9NKCk7XHJcbiAgICB0aGlzLmVuYWJsZVBhbm5pbmcoKTtcclxuICAgIHRoaXMuZW5hYmxlWm9vbWluZygpO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlRE9NICgpOiB2b2lkIHtcclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGUgPT4ge1xyXG4gICAgICBpZiAoZS5jb2RlID09PSAnRXNjYXBlJykge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB0aGlzLmh5cml0LnNldEZvY3VzZWRFbnRpdHkobnVsbCk7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgVmVjdG9yMigpO1xyXG4gICAgICAgIHRoaXMuem9vbSA9IDE7XHJcbiAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgLy8gUm9vdFxyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICB0aGlzLmVsZW1lbnQuaWQgPSAnaHlyaXQtY29udGFpbmVyJztcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBlID0+IHRoaXMudXBkYXRlTW91c2VQb3NpdGlvbihlKSk7XHJcblxyXG4gICAgLy8gQ2FudmFzXHJcbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgdGhpcy5jYW52YXMuZHJhZ2dhYmxlID0gZmFsc2U7XHJcbiAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJykgYXMgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xyXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcclxuICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG5cclxuICAgICAgaWYgKHRoaXMucGFubmluZykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChjb25zdCBlbnRpdHkgb2YgdGhpcy5oeXJpdC5zdGFnZS5lbnRpdGllcykge1xyXG5cclxuICAgICAgICBpZiAoZW50aXR5LnR5cGUgPT09IEVudGl0eUJhc2UudHlwZXMuUkVQTElDQVRJTkdfQ0VMTCkge1xyXG4gICAgICAgICAgY29uc3QgeyBjb2xsaWRlcyB9ID0gY2lyY2xlQ29sbGlzaW9uKFxyXG4gICAgICAgICAgICBlbnRpdHkucG9zLngsIHRoaXMubW91c2UucG9zLngsXHJcbiAgICAgICAgICAgIGVudGl0eS5wb3MueSwgdGhpcy5tb3VzZS5wb3MueSxcclxuICAgICAgICAgICAgZW50aXR5LnJhZGl1cywgMFxyXG4gICAgICAgICAgKTtcclxuICBcclxuICAgICAgICAgIGlmIChjb2xsaWRlcykge1xyXG4gICAgICAgICAgICB0aGlzLmh5cml0LnNldEZvY3VzZWRFbnRpdHkoZW50aXR5IGFzIFJlcGxpY2F0aW5nQ2VsbCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmh5cml0LnN0YWdlLmFkZEVudGl0aWVzKFxyXG4gICAgICAgIG5ldyBSZXBsaWNhdGluZ0NlbGwoe1xyXG4gICAgICAgICAgc3RhZ2U6IHRoaXMuaHlyaXQuc3RhZ2UsXHJcbiAgICAgICAgICBtYXNzOiAxMCArIE1hdGgucmFuZG9tKCkgKiA5MCxcclxuICAgICAgICAgIHBvczogVmVjdG9yMi5mcm9tKHRoaXMubW91c2UucG9zKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICk7XHJcblxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSW5mbyBQYW5lbFxyXG4gICAgdGhpcy5pbmZvUGFuZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoeXJpdC1pbmZvLXBhbmVsJyk7XHJcbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5pbmZvUGFuZWwpO1xyXG4gIH1cclxuXHJcbiAgY2xlYXIgKCkge1xyXG4gICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgIC8vIFwiQWNpZFwiIG1vZGVcclxuICAgIC8vIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgLy8gdGhpcy5jdHguZmlsbFN0eWxlID0gJyMwMDAwMDAxMCc7XHJcbiAgICAvLyB0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICAgIC8vIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xyXG4gIH1cclxuXHJcbiAgcmVuZGVyICgpIHtcclxuXHJcbiAgICBjb25zdCB7IGN0eCwgY2FudmFzLCBjYW1lcmEgfSA9IHRoaXM7XHJcblxyXG4gICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAvLyBab29taW5nXHJcbiAgICBjdHgudHJhbnNsYXRlKGNhbnZhcy53aWR0aCAvIDIsIGNhbnZhcy5oZWlnaHQgLyAyKTtcclxuICAgIGN0eC5zY2FsZSh0aGlzLnpvb20sIHRoaXMuem9vbSk7XHJcblxyXG4gICAgLy8gY3R4LnNhdmUoKTtcclxuXHJcbiAgICAvLyBDYW1lcmEgcG9zaXRpb25cclxuICAgIGN0eC50cmFuc2xhdGUoLSBjYW1lcmEueCwgLSBjYW1lcmEueSk7XHJcblxyXG4gICAgLy8gQ2VudGVyIG9mIHdvcmxkXHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnd2hpdGUnO1xyXG4gICAgY3R4LmFyYygwLCAwLCA0LCAwLCBNYXRoLlBJICogMik7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICBjdHguY2xvc2VQYXRoKCk7XHJcblxyXG4gICAgLy8gV29ybGQgYm9yZGVyc1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJyNmZmZmZmY4OCc7XHJcbiAgICBjdHguYXJjKDAsIDAsIHRoaXMuaHlyaXQuc3RhZ2UucmFkaXVzLCAwLCBNYXRoLlBJICogMik7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICBjdHguY2xvc2VQYXRoKCk7XHJcblxyXG4gICAgdGhpcy5yZW5kZXJFbnRpdGllcyh0aGlzLmh5cml0LnN0YWdlLmVudGl0aWVzKTtcclxuXHJcbiAgICAvLyBNb3VzZVxyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4LmxpbmVXaWR0aCA9IDE7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnb3JhbmdlJztcclxuICAgIGN0eC5hcmModGhpcy5tb3VzZS5wb3MueCwgdGhpcy5tb3VzZS5wb3MueSwgMywgMCwgTWF0aC5QSSAqIDIpO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgY3R4LmNsb3NlUGF0aCgpO1xyXG4gIFxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuXHJcbiAgICAvLyBDZW50ZXIgb2Ygc2NyZWVuXHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnd2hpdGUnO1xyXG4gICAgY3R4Lm1vdmVUbyhjYW52YXMud2lkdGggLyAyIC0gNCwgY2FudmFzLmhlaWdodCAvIDIpO1xyXG4gICAgY3R4LmxpbmVUbyhjYW52YXMud2lkdGggLyAyICsgNCwgY2FudmFzLmhlaWdodCAvIDIpO1xyXG4gICAgY3R4Lm1vdmVUbyhjYW52YXMud2lkdGggLyAyLCBjYW52YXMuaGVpZ2h0IC8gMiAtIDQpO1xyXG4gICAgY3R4LmxpbmVUbyhjYW52YXMud2lkdGggLyAyLCBjYW52YXMuaGVpZ2h0IC8gMiArIDQpO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgY3R4LmNsb3NlUGF0aCgpO1xyXG5cclxuICB9XHJcblxyXG4gIHJlbmRlckluZm8gKCkge1xyXG5cclxuICAgIGNvbnN0IHsgY2FtZXJhIH0gPSB0aGlzO1xyXG5cclxuICAgIGNvbnN0IGxpbmVzID0gW1xyXG4gICAgICBgbW91c2UgeFske3RyaW1EZWNpbWFscyh0aGlzLm1vdXNlLnBvcy54KX1dIHlbJHsodHJpbURlY2ltYWxzKHRoaXMubW91c2UucG9zLnkpKX1dYCxcclxuICAgICAgYGNhbWVyYSB4WyR7dHJpbURlY2ltYWxzKGNhbWVyYS54KX1dIHlbJHt0cmltRGVjaW1hbHMoY2FtZXJhLnkpfV1gLFxyXG4gICAgICBgZW50aXRpZXM6ICR7dGhpcy5oeXJpdC5zdGFnZS5lbnRpdGllcy5sZW5ndGh9ICgke3RoaXMuY2FjaGVkVmlzaWJsZUVudGl0aWVzQ291bnR9IHZpc2libGUpYCxcclxuICAgICAgYHRvdGFsIG1hc3M6ICR7dHJpbURlY2ltYWxzKHRoaXMuaHlyaXQuc3RhZ2UuZW50aXRpZXMucmVkdWNlKChhLCBiKSA9PiBhICsgYi5tYXNzLCAwKSl9YFxyXG4gICAgXTtcclxuXHJcbiAgICBpZiAodGhpcy5oeXJpdC5mb2N1c2VkRW50aXR5ICE9PSBudWxsKSB7XHJcblxyXG4gICAgICBjb25zdCBlbnRpdHkgPSB0aGlzLmh5cml0LmZvY3VzZWRFbnRpdHk7XHJcblxyXG4gICAgICBsaW5lcy5wdXNoKFxyXG4gICAgICAgICcnLFxyXG4gICAgICAgICctIGVudGl0eSAtJyxcclxuICAgICAgICBgbWFzczogJHt0cmltRGVjaW1hbHMoZW50aXR5Lm1hc3MpfWAsXHJcbiAgICAgICAgYHN0YW1pbmE6ICR7ZW50aXR5LnN0YW1pbmF9YCxcclxuICAgICAgICBgaHVudGluZyBib3JlZG9vbSBjbG9jazogJHtlbnRpdHkuaHVudGluZ0JvcmVkb29tQ2xvY2t9IC8gJHtlbnRpdHkuaHVudGluZ0JvcmVkb29tQ2FwfWAsXHJcbiAgICAgICAgYGh1bnRpbmcgY29vbGRvd246ICR7ZW50aXR5Lmh1bnRpbmdDb29sZG93bn0gLyAke2VudGl0eS5odW50aW5nQ29vbGRvd25DYXB9YCxcclxuICAgICAgICAnZ2VuZXM6JyxcclxuICAgICAgICAuLi5PYmplY3QuZW50cmllcyhlbnRpdHkuZG5hLmdlbmVzKS5tYXA8c3RyaW5nPigoW2dlbmUsIHZhbHVlXSkgPT4gYCAke2dlbmV9OiAke3RyaW1EZWNpbWFscyh2YWx1ZSl9YClcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmluZm9QYW5lbC5pbm5lclRleHQgPSBsaW5lcy5qb2luKCdcXG4nKTtcclxuXHJcbiAgfVxyXG5cclxuICBhZGp1c3RUb1BhcmVudFNpemUgKCkge1xyXG5cclxuICAgIGlmICh0aGlzLmVsZW1lbnQucGFyZW50RWxlbWVudCA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEh5cml0IGVsZW1lbnQgbm90IGluIERPTWApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY2FudmFzLndpZHRoICA9IHRoaXMuZWxlbWVudC5vZmZzZXRXaWR0aDtcclxuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuZWxlbWVudC5vZmZzZXRIZWlnaHQ7XHJcblxyXG4gIH1cclxuXHJcbiAgdXBkYXRlTW91c2VQb3NpdGlvbiAoZT86IE1vdXNlRXZlbnQpOiB2b2lkIHtcclxuICAgIHRoaXMubW91c2UuY2xpZW50UG9zaXRpb24uc2V0KFxyXG4gICAgICBlPy5jbGllbnRYIHx8IHRoaXMubW91c2UuY2xpZW50UG9zaXRpb24ueCxcclxuICAgICAgZT8uY2xpZW50WSB8fCB0aGlzLm1vdXNlLmNsaWVudFBvc2l0aW9uLnlcclxuICAgICk7XHJcbiAgICB0aGlzLm1vdXNlLnBvcy5zZXQoXHJcbiAgICAgICh0aGlzLm1vdXNlLmNsaWVudFBvc2l0aW9uLnggLSAodGhpcy5lbGVtZW50Lm9mZnNldFdpZHRoICAvIDIpKSAvIHRoaXMuem9vbSArIHRoaXMuY2FtZXJhLngsXHJcbiAgICAgICh0aGlzLm1vdXNlLmNsaWVudFBvc2l0aW9uLnkgLSAodGhpcy5lbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpKSAvIHRoaXMuem9vbSArIHRoaXMuY2FtZXJhLnlcclxuICAgICk7XHJcbiAgfTtcclxuXHJcbiAgcHJpdmF0ZSBlbmFibGVQYW5uaW5nICgpIHtcclxuXHJcbiAgICBsZXQgZHJhZ1N0YXJ0UG9zaXRpb246IFZlY3RvcjIgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBlID0+IHtcclxuICAgICAgZHJhZ1N0YXJ0UG9zaXRpb24gPSBuZXcgVmVjdG9yMihlLmNsaWVudFgsIGUuY2xpZW50WSk7XHJcbiAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmN1cnNvciA9ICdtb3ZlJztcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoKSA9PiB7XHJcbiAgICAgIGRyYWdTdGFydFBvc2l0aW9uID0gbnVsbDtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnBhbm5pbmcgPSBmYWxzZSwgMTApO1xyXG4gICAgICB0aGlzLmNhbnZhcy5zdHlsZS5jdXJzb3IgPSAnJztcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGUgPT4ge1xyXG4gICAgICBpZiAoZHJhZ1N0YXJ0UG9zaXRpb24gIT09IG51bGwpIHtcclxuICAgICAgICB0aGlzLnBhbm5pbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaHlyaXQuc2V0Rm9jdXNlZEVudGl0eShudWxsKTtcclxuICAgICAgICB0aGlzLmNhbWVyYS5hZGQoXHJcbiAgICAgICAgICAoZHJhZ1N0YXJ0UG9zaXRpb24ueCAtIGUuY2xpZW50WCkgLyB0aGlzLnpvb20sXHJcbiAgICAgICAgICAoZHJhZ1N0YXJ0UG9zaXRpb24ueSAtIGUuY2xpZW50WSkgLyB0aGlzLnpvb21cclxuICAgICAgICApO1xyXG4gICAgICAgIGRyYWdTdGFydFBvc2l0aW9uLnNldChlLmNsaWVudFgsIGUuY2xpZW50WSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFsdGVybmF0aXZlIGRyYWdnaW5nIGNvZGUgKExlc3MgYWNjdXJhdGUgKElkayB3aHkpKVxyXG4gICAgLy8gY29uc3QgZHJhZyA9IChlOiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICAvLyAgIHRoaXMuY2FtZXJhLnggLT0gZS5tb3ZlbWVudFg7XHJcbiAgICAvLyAgIHRoaXMuY2FtZXJhLnkgLT0gZS5tb3ZlbWVudFk7XHJcbiAgICAvLyB9O1xyXG4gICAgLy8gdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKCkgPT4ge1xyXG4gICAgLy8gICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBkcmFnKTtcclxuICAgIC8vICAgdGhpcy5jYW52YXMuc3R5bGUuY3Vyc29yID0gJ21vdmUnO1xyXG4gICAgLy8gfSk7XHJcbiAgICAvLyB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKCkgPT4ge1xyXG4gICAgLy8gICB0aGlzLmNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBkcmFnKTtcclxuICAgIC8vICAgdGhpcy5jYW52YXMuc3R5bGUuY3Vyc29yID0gJyc7XHJcbiAgICAvLyB9KTtcclxuXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGVuYWJsZVpvb21pbmcgKCkge1xyXG4gICAgYWRkQ3Jvc3NCcm93c2VyV2hlZWxFdmVudExpc3RlbmVyKHRoaXMuY2FudmFzLCAoZSwgZGVsdGEpID0+IHtcclxuXHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlTW91c2VQb3NpdGlvbihlKTtcclxuXHJcbiAgICAgIGNvbnN0IGNlbnRlclggPSB3aW5kb3cuaW5uZXJXaWR0aCAgLyAyO1xyXG4gICAgICBjb25zdCBjZW50ZXJZID0gd2luZG93LmlubmVySGVpZ2h0IC8gMjtcclxuICAgICAgY29uc3QgbW91c2VYID0gZS5jbGllbnRYIC0gdGhpcy5jYW52YXMub2Zmc2V0TGVmdDtcclxuICAgICAgY29uc3QgbW91c2VZID0gZS5jbGllbnRZIC0gdGhpcy5jYW52YXMub2Zmc2V0VG9wO1xyXG5cclxuICAgICAgY29uc3Qgb2xkWm9vbSA9IHRoaXMuem9vbTtcclxuICAgICAgY29uc3Qgc2NhbGUgPSAxICsgMC4xNSAqIC1kZWx0YTtcclxuXHJcbiAgICAgIHRoaXMuem9vbSA9IE1hdGgubWF4KDAuMSwgTWF0aC5taW4oMywgdGhpcy56b29tICogc2NhbGUpKTtcclxuXHJcbiAgICAgIGNvbnN0IHpvb21EaWZmZXJlbmNlID0gb2xkWm9vbSAtIHRoaXMuem9vbTtcclxuXHJcbiAgICAgIHRoaXMuY2FtZXJhLnggKz0gTWF0aC5yb3VuZCgoY2VudGVyWCAtIG1vdXNlWCAtIHpvb21EaWZmZXJlbmNlKSAqIDAuMTUgLyB0aGlzLnpvb20gKiBkZWx0YSk7XHJcbiAgICAgIHRoaXMuY2FtZXJhLnkgKz0gTWF0aC5yb3VuZCgoY2VudGVyWSAtIG1vdXNlWSAtIHpvb21EaWZmZXJlbmNlKSAqIDAuMTUgLyB0aGlzLnpvb20gKiBkZWx0YSk7XHJcblxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlbmRlckVudGl0aWVzIChlbnRpdGllczogRW50aXR5QmFzZVtdKSB7XHJcblxyXG4gICAgY29uc3QgdmlzaWJsZUVudGl0aWVzID0gdGhpcy5nZXRWaXNpYmxlRW50aXRpZXMoZW50aXRpZXMpO1xyXG5cclxuICAgIGZvciAoY29uc3QgZW50aXR5IG9mIHZpc2libGVFbnRpdGllcy5zb3J0KChhLCBiKSA9PiBhLm1hc3MgLSBiLm1hc3MpKSB7XHJcbiAgICAgIGVudGl0eS5kcmF3KHRoaXMuY3R4KTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFZpc2libGVFbnRpdGllcyAoZW50aXRpZXM6IEVudGl0eUJhc2VbXSkge1xyXG5cclxuICAgIC8vIHJldHVybiBlbnRpdGllcztcclxuICAgIGNvbnN0IGhhbGZDYW52YXNXID0gdGhpcy5jYW52YXMud2lkdGggIC8gMiAvIHRoaXMuem9vbTtcclxuICAgIGNvbnN0IGhhbGZDYW52YXNIID0gdGhpcy5jYW52YXMuaGVpZ2h0IC8gMiAvIHRoaXMuem9vbTtcclxuXHJcbiAgICBjb25zdCB2aXNpYmxlRW50aXRpZXMgPSBlbnRpdGllcy5maWx0ZXIoZW50aXR5ID0+IHtcclxuICAgICAgY29uc3QgcmFkaXVzID0gZW50aXR5LnJhZGl1cztcclxuICAgICAgcmV0dXJuIChcclxuICAgICAgICBlbnRpdHkucG9zLnggKyByYWRpdXMgPiB0aGlzLmNhbWVyYS54IC0gaGFsZkNhbnZhc1cgJiZcclxuICAgICAgICBlbnRpdHkucG9zLnkgKyByYWRpdXMgPiB0aGlzLmNhbWVyYS55IC0gaGFsZkNhbnZhc0ggJiZcclxuICAgICAgICBlbnRpdHkucG9zLnggLSByYWRpdXMgPCB0aGlzLmNhbWVyYS54ICsgaGFsZkNhbnZhc1cgJiZcclxuICAgICAgICBlbnRpdHkucG9zLnkgLSByYWRpdXMgPCB0aGlzLmNhbWVyYS55ICsgaGFsZkNhbnZhc0hcclxuICAgICAgKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuY2FjaGVkVmlzaWJsZUVudGl0aWVzQ291bnQgPSB2aXNpYmxlRW50aXRpZXMubGVuZ3RoO1xyXG5cclxuICAgIHJldHVybiB2aXNpYmxlRW50aXRpZXM7XHJcblxyXG4gIH1cclxuXHJcbn1cclxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgSHlyaXRETkEge1xyXG5cclxuICBnZW5lcyA9IHtcclxuICAgIHNwZWVkOiAwLFxyXG4gICAgaHVudGluZ0JvcmVkb29tQ2FwOiAwLFxyXG4gICAgZGVjYXlFZmZpY2llbmN5OiAwLFxyXG4gICAgY3VydmluZ1JhdGU6IDAsXHJcbiAgICBtYXNzVG9OZWVkZWRSZXByb2R1Y2U6IDBcclxuICB9O1xyXG5cclxuICBjb25zdHJ1Y3RvciAoZG5hPzogSHlyaXRETkEpIHtcclxuXHJcbiAgICBpZiAoZG5hKSB7XHJcblxyXG4gICAgICB0aGlzLmdlbmVzID0gT2JqZWN0LmFzc2lnbih7fSwgZG5hLmdlbmVzKTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgY29uc3QgbWF4UG9pbnRzUGVyR2VuZSA9IDEwMDA7IC8vIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIGVkaXQgdGhpcyA6KVxyXG4gICAgICBjb25zdCBnZW5lTmFtZXMgPSBPYmplY3Qua2V5cyh0aGlzLmdlbmVzKSBhcyAoa2V5b2YgSHlyaXRETkFbJ2dlbmVzJ10pW107XHJcbiAgICAgIGNvbnN0IG5vbk1heGVkR2VuZU5hbWVzID0gQXJyYXkuZnJvbShnZW5lTmFtZXMpO1xyXG5cclxuICAgICAgbGV0IGdlbmVQb2ludHMgPSBnZW5lTmFtZXMubGVuZ3RoICogKG1heFBvaW50c1BlckdlbmUgLyAzKTtcclxuXHJcbiAgICAgIHdoaWxlIChnZW5lUG9pbnRzID4gMCkge1xyXG5cclxuICAgICAgICBjb25zdCByYW5kb21HZW5lTmFtZUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbm9uTWF4ZWRHZW5lTmFtZXMubGVuZ3RoKTtcclxuICAgICAgICBjb25zdCByYW5kb21HZW5lTmFtZSA9IG5vbk1heGVkR2VuZU5hbWVzW3JhbmRvbUdlbmVOYW1lSW5kZXhdO1xyXG5cclxuICAgICAgICBjb25zdCBnZW5lUG9pbnRzVG9BZGQgPSBNYXRoLm1pbihcclxuICAgICAgICAgIC8vIEZhc3RlciBhbmQgbGVzcyBiYWxhbmNlZCB0aGFuIGFkZGluZyAxIGJ5IDFcclxuICAgICAgICAgIE1hdGguY2VpbChNYXRoLnJhbmRvbSgpICogbWF4UG9pbnRzUGVyR2VuZSAvIDYpLFxyXG4gICAgICAgICAgLy8gTWFrZXMgc3VyZSBpdCB3b24ndCBtYWtlIGl0IGdvIG92ZXIgdGhlIG1heFxyXG4gICAgICAgICAgbWF4UG9pbnRzUGVyR2VuZSAtIHRoaXMuZ2VuZXNbcmFuZG9tR2VuZU5hbWVdLFxyXG4gICAgICAgICAgLy8gTWFrZXMgc3VyZSBpdCB3b24ndCBnaXZlIG1vcmUgcG9pbnRzIHRoYW4gcmVtYWluaW5nXHJcbiAgICAgICAgICBnZW5lUG9pbnRzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5nZW5lc1tyYW5kb21HZW5lTmFtZV0gKz0gZ2VuZVBvaW50c1RvQWRkO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5nZW5lc1tyYW5kb21HZW5lTmFtZV0gPT09IG1heFBvaW50c1BlckdlbmUpIHtcclxuICAgICAgICAgIG5vbk1heGVkR2VuZU5hbWVzLnNwbGljZShyYW5kb21HZW5lTmFtZUluZGV4LCAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdlbmVQb2ludHMgLT0gZ2VuZVBvaW50c1RvQWRkO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBOb3JtYWxpemUgdG8gMC0xXHJcbiAgICAgIGZvciAoY29uc3QgZ2VuZU5hbWUgb2YgZ2VuZU5hbWVzKSB7XHJcbiAgICAgICAgdGhpcy5nZW5lc1tnZW5lTmFtZV0gLz0gbWF4UG9pbnRzUGVyR2VuZTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICBtYXRjaCAoZG5hOiBIeXJpdEROQSkge1xyXG5cclxuICAgIGNvbnN0IGdlbmVOYW1lcyA9IE9iamVjdC5rZXlzKHRoaXMuZ2VuZXMpIGFzIChrZXlvZiBIeXJpdEROQVsnZ2VuZXMnXSlbXTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGdlbmVOYW1lIG9mIGdlbmVOYW1lcykge1xyXG4gICAgICBpZiAodGhpcy5nZW5lc1tnZW5lTmFtZV0gIT09IGRuYS5nZW5lc1tnZW5lTmFtZV0pIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfVxyXG5cclxuICBjb3B5ICgpIHtcclxuICAgIHJldHVybiBuZXcgSHlyaXRETkEodGhpcyk7XHJcbiAgfVxyXG5cclxufVxyXG4iLCJpbXBvcnQgRW50aXR5QmFzZSBmcm9tICcuLi9lbnRpdGllcy9FbnRpdHlCYXNlJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGFnZSB7XHJcblxyXG4gIGVudGl0aWVzOiBFbnRpdHlCYXNlW10gPSBbXTtcclxuICByYWRpdXM6IG51bWJlcjtcclxuXHJcbiAgY29uc3RydWN0b3IgKHJhZGl1czogbnVtYmVyKSB7XHJcbiAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuICB9XHJcblxyXG4gIHVwZGF0ZSAoKSB7XHJcbiAgICBmb3IgKGNvbnN0IGVudGl0eSBvZiB0aGlzLmVudGl0aWVzKSB7XHJcbiAgICAgIGVudGl0eS51cGRhdGUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFkZEVudGl0aWVzICguLi5lbnRpdGllczogRW50aXR5QmFzZVtdKSB7XHJcbiAgICB0aGlzLmVudGl0aWVzLnB1c2goLi4uZW50aXRpZXMpO1xyXG4gIH1cclxuXHJcbiAgcmVtRW50aXR5IChlbnRpdHk6IEVudGl0eUJhc2UpIHtcclxuICAgIHRoaXMuZW50aXRpZXMuc3BsaWNlKHRoaXMuZW50aXRpZXMuaW5kZXhPZihlbnRpdHkpLCAxKTtcclxuICB9XHJcblxyXG59XHJcbiIsImltcG9ydCBWZWN0b3IyIGZyb20gJy4uL3V0aWxzL1ZlY3RvcjInO1xyXG5pbXBvcnQgU3RhZ2UgZnJvbSAnLi4vY2xhc3Nlcy9TdGFnZSc7XHJcbmltcG9ydCBIeXJpdEROQSBmcm9tICcuLi9jbGFzc2VzL0h5cml0RE5BJztcclxuXHJcblxyXG5mdW5jdGlvbiByYW5kb21IU0wgKCk6IHN0cmluZyB7XHJcblx0Y29uc3QgaCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MCk7XHJcblx0Y29uc3QgcyA9IDgwICsgTWF0aC5yb3VuZCgyMCAqIE1hdGgucmFuZG9tKCkpO1xyXG4gIGNvbnN0IGwgPSA1MCArIE1hdGgucm91bmQoMzAgKiBNYXRoLnJhbmRvbSgpKTtcclxuICByZXR1cm4gYGhzbCgke2h9LCR7c30lLCR7bH0lKWA7XHJcbn1cclxuXHJcbi8vIGZ1bmN0aW9uIHJhbmRvbVJldHVyblBvaW50IChyYWRpdXM6IG51bWJlciwgcG9zOiBWZWN0b3IyKSB7XHJcblxyXG4vLyAgIGNvbnN0IHRoZXRhQ2VudGVyID0gTWF0aC5hdGFuMihwb3MueSwgcG9zLngpO1xyXG4vLyAgIGNvbnN0IHRoZXRhTWluID0gTWF0aC5QSSAqIDIgKyB0aGV0YUNlbnRlciAtIE1hdGguUEkgLyAxMDtcclxuLy8gICBjb25zdCB0aGV0YU1heCA9IE1hdGguUEkgKiAyICsgdGhldGFDZW50ZXIgKyBNYXRoLlBJIC8gMTA7XHJcbi8vICAgY29uc3QgdGhldGEgPSB0aGV0YU1pbiArIE1hdGgucmFuZG9tKCkgKiAodGhldGFNYXggLSB0aGV0YU1pbik7XHJcblxyXG4vLyAgIGNvbnN0IHIgPSAwLjkgKyBNYXRoLnJhbmRvbSgpICogMC4xO1xyXG5cclxuLy8gICByZXR1cm4gbmV3IFZlY3RvcjIoXHJcbi8vICAgICByICogTWF0aC5jb3ModGhldGEpICogcmFkaXVzLFxyXG4vLyAgICAgciAqIE1hdGguc2luKHRoZXRhKSAqIHJhZGl1c1xyXG4vLyAgICk7XHJcblxyXG4vLyB9XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRW50aXR5QmFzZSB7XHJcblxyXG4gIHN0YXRpYyB0eXBlcyA9IHtcclxuICAgIFBST1RFSU46IFN5bWJvbCgnUFJPVEVJTicpLFxyXG4gICAgUkVQTElDQVRJTkdfQ0VMTDogU3ltYm9sKCdSRVBMSUNBVElOR19DRUxMJyksXHJcbiAgfTtcclxuXHJcblxyXG4gIHN0YWdlOiBTdGFnZTtcclxuXHJcbiAgdHlwZTogc3ltYm9sO1xyXG4gIG1hc3M6IG51bWJlcjtcclxuICBjb2xvcjogc3RyaW5nO1xyXG5cclxuICBkbmE6IEh5cml0RE5BO1xyXG5cclxuICBzdGFtaW5hOiBudW1iZXI7XHJcblxyXG4gIHNwZWVkID0gMDtcclxuICByYWRpdXMgPSAwO1xyXG5cclxuICBwb3M6IFZlY3RvcjI7XHJcbiAgZGlyOiBWZWN0b3IyO1xyXG4gIGZvcmNlOiBWZWN0b3IyO1xyXG5cclxuICBjb25zdHJ1Y3RvciAoXHJcbiAgICB0eXBlOiBzeW1ib2wsXHJcbiAgICBzdGFnZTogU3RhZ2UsXHJcbiAgICBtYXNzOiBudW1iZXIsXHJcbiAgICBjb2xvciA9IHJhbmRvbUhTTCgpLFxyXG4gICAgZG5hID0gbmV3IEh5cml0RE5BKCksXHJcbiAgICBmb3JjZSA9IFZlY3RvcjIubmV3KCksXHJcbiAgICBwb3MgPSBWZWN0b3IyLnJhbmRvbVBvaW50SW5DaXJjbGUoc3RhZ2UucmFkaXVzKSxcclxuICAgIHN0YW1pbmEgPSAxMDAwMCArIE1hdGguY2VpbChtYXNzICogMTAwKVxyXG4gICAgKSB7XHJcblxyXG4gICAgdGhpcy5zdGFnZSA9IHN0YWdlO1xyXG5cclxuICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICB0aGlzLm1hc3MgPSBtYXNzO1xyXG4gICAgdGhpcy5jb2xvciA9IGNvbG9yO1xyXG5cclxuICAgIHRoaXMuZG5hID0gZG5hO1xyXG5cclxuICAgIHRoaXMuc3RhbWluYSA9IHN0YW1pbmE7XHJcblxyXG4gICAgdGhpcy5wb3MgPSBWZWN0b3IyLmZyb20ocG9zKTtcclxuICAgIHRoaXMuZGlyID0gVmVjdG9yMi5yYW5kb21EaXJlY3Rpb24oKTtcclxuICAgIHRoaXMuZm9yY2UgPSBWZWN0b3IyLmZyb20oZm9yY2UpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlICgpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XHJcbiAgfVxyXG5cclxuICBtb3ZlICgpIHtcclxuICAgIHRoaXMucG9zLmFkZFZlY3Rvcih0aGlzLmRpciwgdGhpcy5zcGVlZCk7XHJcbiAgfVxyXG5cclxuICBhcHBseUZvcmNlICgpIHtcclxuICAgIHRoaXMucG9zLmFkZFZlY3Rvcih0aGlzLmZvcmNlLCAxKTtcclxuICAgIHRoaXMuZm9yY2UueCAqPSAwLjk5O1xyXG4gICAgdGhpcy5mb3JjZS55ICo9IDAuOTk7XHJcbiAgfVxyXG5cclxuICByZXNvbHZlQ29sbGlzaW9uUHVzaGluZyAoZW50aXR5OiBFbnRpdHlCYXNlLCBkaXN0YW5jZTogbnVtYmVyKTogdm9pZCB7XHJcblxyXG4gICAgY29uc3QgaGFyZG5lc3MgPSA4O1xyXG4gICAgY29uc3QgcmFkaWkgPSBNYXRoLmF0YW4yKGVudGl0eS5wb3MueSAtIHRoaXMucG9zLnksIGVudGl0eS5wb3MueCAtIHRoaXMucG9zLngpO1xyXG4gICAgY29uc3QgZHggPSBNYXRoLmNvcyhyYWRpaSk7XHJcbiAgICBjb25zdCBkeSA9IE1hdGguc2luKHJhZGlpKTtcclxuICAgIGNvbnN0IHJhdGlvID0gZW50aXR5Lm1hc3MgLyB0aGlzLm1hc3M7XHJcblxyXG4gICAgdGhpcy5wb3MuYWRkKFxyXG4gICAgICBkeCAqIChkaXN0YW5jZSAqIHJhdGlvIC8gaGFyZG5lc3MpLFxyXG4gICAgICBkeSAqIChkaXN0YW5jZSAqIHJhdGlvIC8gaGFyZG5lc3MpXHJcbiAgICApO1xyXG5cclxuICAgIGVudGl0eS5wb3MuYWRkKFxyXG4gICAgICBkeCAqIChkaXN0YW5jZSAqICgxIC0gcmF0aW8pIC8gaGFyZG5lc3MpLFxyXG4gICAgICBkeSAqIChkaXN0YW5jZSAqICgxIC0gcmF0aW8pIC8gaGFyZG5lc3MpLFxyXG4gICAgICAtMVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGRyYWluIChlbnRpdHk6IEVudGl0eUJhc2UsIF9kaXN0YW5jZTogbnVtYmVyKSB7XHJcblxyXG4gICAgLy8gQXNzdW1lcyB0aGF0IHlvdSdyZSBhbHdheXMgcGFzc2luZyBhIHNtYWxsZXIgY2VsbFxyXG5cclxuICAgIGNvbnN0IGRyYWluUmF0ZSA9IE1hdGguY2JydCh0aGlzLm1hc3MpIC0gTWF0aC5jYnJ0KGVudGl0eS5tYXNzKTtcclxuICAgIGNvbnN0IGRyYWluID0gZHJhaW5SYXRlIDwgZW50aXR5Lm1hc3MgPyBkcmFpblJhdGUgOiBlbnRpdHkubWFzcztcclxuICAgIGxldCBzdGFtaW5hQnVmZk11bHRpcGxpZXIgPSAxO1xyXG5cclxuICAgIHN3aXRjaCAoZW50aXR5LnR5cGUpIHtcclxuICAgICAgY2FzZSBFbnRpdHlCYXNlLnR5cGVzLlBST1RFSU46XHJcbiAgICAgICAgc3RhbWluYUJ1ZmZNdWx0aXBsaWVyID0gNjQ7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgRW50aXR5QmFzZS50eXBlcy5SRVBMSUNBVElOR19DRUxMOlxyXG4gICAgICAgIHN0YW1pbmFCdWZmTXVsdGlwbGllciA9IDMyO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubWFzcyArPSBkcmFpbjtcclxuICAgIHRoaXMuc3RhbWluYSArPSBNYXRoLnJvdW5kKGRyYWluICogc3RhbWluYUJ1ZmZNdWx0aXBsaWVyKTtcclxuICAgIGVudGl0eS5kZWNheShkcmFpbik7XHJcblxyXG4gIH1cclxuXHJcbiAgZGVjYXkgKGFtb3VudD86IG51bWJlcikge1xyXG5cclxuICAgIGlmICh0eXBlb2YgYW1vdW50ID09PSAnbnVtYmVyJykge1xyXG4gICAgICB0aGlzLm1hc3MgLT0gYW1vdW50O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5tYXNzICo9IDAuOTk5ICsgdGhpcy5kbmEuZ2VuZXMuZGVjYXlFZmZpY2llbmN5IC8gMTAwMDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpc0FsaXZlID0gdGhpcy5pc0FsaXZlKCk7XHJcblxyXG4gICAgaWYgKCFpc0FsaXZlKSB7XHJcbiAgICAgIHRoaXMuc3RhZ2UucmVtRW50aXR5KHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBpc0FsaXZlO1xyXG5cclxuICB9XHJcblxyXG4gIGlzQWxpdmUgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubWFzcyA+PSAxO1xyXG4gIH1cclxuXHJcbiAgLy8gQHRzLWlnbm9yZVxyXG4gIGRyYXcgKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xyXG4gIH1cclxuXHJcbiAgcm90YXRlVG93YXJkcyAodGFyZ2V0OiBWZWN0b3IyKSB7XHJcblxyXG4gICAgY29uc3QgbmV3RGlyID0gTWF0aC5hdGFuMih0YXJnZXQueSAtIHRoaXMucG9zLnksIHRhcmdldC54IC0gdGhpcy5wb3MueCk7XHJcbiAgICBjb25zdCByb3RhdGlvblJhdGUgPSAwLjAxICsgMC4wOSAqIHRoaXMuZG5hLmdlbmVzLmN1cnZpbmdSYXRlO1xyXG5cclxuXHRcdHRoaXMuZGlyLnggPSB0aGlzLmRpci54ICogKDEgLSByb3RhdGlvblJhdGUpICsgTWF0aC5jb3MobmV3RGlyKSAqIHJvdGF0aW9uUmF0ZTtcclxuICAgIHRoaXMuZGlyLnkgPSB0aGlzLmRpci55ICogKDEgLSByb3RhdGlvblJhdGUpICsgTWF0aC5zaW4obmV3RGlyKSAqIHJvdGF0aW9uUmF0ZTtcclxuXHJcbiAgfVxyXG5cclxuICBpc1dpdGhpbldvcmxkICgpIHtcclxuICAgIHJldHVybiBNYXRoLmh5cG90KHRoaXMucG9zLngsIHRoaXMucG9zLnkpIDwgdGhpcy5zdGFnZS5yYWRpdXM7XHJcbiAgfVxyXG5cclxuXHJcbiAgcHJvdGVjdGVkIGdldFJhZGl1cyAoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiAoTWF0aC5zcXJ0KHRoaXMubWFzcykgKyBNYXRoLmNicnQodGhpcy5tYXNzKSkgKiAxLjU7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBTdGFnZSBmcm9tICcuLi9jbGFzc2VzL1N0YWdlJztcclxuaW1wb3J0IHsgUmVwbGljYXRpbmdDZWxsIH0gZnJvbSAnLi4vaHlyaXQnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi91dGlscy9WZWN0b3IyJztcclxuaW1wb3J0IEVudGl0eUJhc2UgZnJvbSAnLi9FbnRpdHlCYXNlJztcclxuXHJcblxyXG5mdW5jdGlvbiByYW5kb21IU0wgKCkge1xyXG5cclxuXHRjb25zdCBoID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKTtcclxuXHRjb25zdCBzID0gODAgKyBNYXRoLnJvdW5kKDIwICogTWF0aC5yYW5kb20oKSk7XHJcbiAgY29uc3QgbCA9IDUwICsgTWF0aC5yb3VuZCgzMCAqIE1hdGgucmFuZG9tKCkpO1xyXG5cclxuICByZXR1cm4gYGhzbCgke2h9LCR7c30lLCR7bH0lKWA7XHJcblxyXG59XHJcblxyXG5cclxuY29uc3QgcGkyID0gTWF0aC5QSSAqIDIgYXMgNi4yODMxODUzMDcxNzk1ODY7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvdGVpbiBleHRlbmRzIEVudGl0eUJhc2Uge1xyXG5cclxuICByb3RhdGlvbiA9IHtcclxuICAgIGN1cnJlbnRSYWRpaTogTWF0aC5yYW5kb20oKSAqIHBpMixcclxuICAgIHNwZWVkOiBNYXRoLm1heCgwLjAwNSwgTWF0aC5yYW5kb20oKSAvIDUwKSxcclxuICAgIG11bHRpcGxpZXI6IChNYXRoLnJhbmRvbSgpID4gMC41ID8gMSA6IC0xKSBhcyAxIHwgLTFcclxuICB9O1xyXG5cclxuICBjb25zdHJ1Y3RvciAoYXJnczoge1xyXG4gICAgc3RhZ2U6IFN0YWdlO1xyXG4gICAgbWFzczogbnVtYmVyO1xyXG4gICAgZm9yY2U/OiBWZWN0b3IyO1xyXG4gICAgcG9zPzogVmVjdG9yMjtcclxuICB9KSB7XHJcblxyXG4gICAgc3VwZXIoXHJcbiAgICAgIEVudGl0eUJhc2UudHlwZXMuUFJPVEVJTixcclxuICAgICAgYXJncy5zdGFnZSxcclxuICAgICAgYXJncy5tYXNzLFxyXG4gICAgICByYW5kb21IU0woKSxcclxuICAgICAgdW5kZWZpbmVkLFxyXG4gICAgICBhcmdzLmZvcmNlID8gVmVjdG9yMi5mcm9tKGFyZ3MuZm9yY2UpIDogVmVjdG9yMi5uZXcoKSxcclxuICAgICAgYXJncy5wb3NcclxuICAgICk7XHJcblxyXG4gIH1cclxuXHJcbiAgdXBkYXRlICgpIHtcclxuXHJcbiAgICBpZiAodGhpcy5zdGFnZSA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCB1cGRhdGUgb3V0IG9mIHN0YWdlYCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51cGRhdGVSb3RhdGlvbigpO1xyXG4gICAgdGhpcy5ncm93KCk7XHJcbiAgICB0aGlzLmFwcGx5Rm9yY2UoKTtcclxuXHJcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA+IDAuOTk5KSB7XHJcbiAgICAgIHRoaXMudHJ5VG9UdXJuSW50b1JlcGxpY2F0aW5nQ2VsbCgpO1xyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIGRyYXcgKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKTogdGhpcyB7XHJcblxyXG4gICAgY29uc3QgcmFkaXVzID0gdGhpcy5nZXRSYWRpdXMoKTtcclxuXHJcbiAgICBjb25zdCBkaXIgPSBuZXcgVmVjdG9yMihcclxuICAgICAgTWF0aC5jb3ModGhpcy5yb3RhdGlvbi5jdXJyZW50UmFkaWkpLFxyXG4gICAgICBNYXRoLnNpbih0aGlzLnJvdGF0aW9uLmN1cnJlbnRSYWRpaSksXHJcbiAgICApO1xyXG5cclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4gICAgY3R4LmxpbmVXaWR0aCA9IHJhZGl1cztcclxuICAgIGN0eC5saW5lQ2FwID0gJ3JvdW5kJztcclxuXHJcbiAgICBjdHgubW92ZVRvKFxyXG4gICAgICB0aGlzLnBvcy54IC0gKHJhZGl1cyAvIDIpICogZGlyLngsXHJcbiAgICAgIHRoaXMucG9zLnkgLSAocmFkaXVzIC8gMikgKiBkaXIueSxcclxuICAgICk7XHJcbiAgICBjdHgubGluZVRvKFxyXG4gICAgICB0aGlzLnBvcy54ICsgKHJhZGl1cyAvIDIpICogZGlyLngsXHJcbiAgICAgIHRoaXMucG9zLnkgKyAocmFkaXVzIC8gMikgKiBkaXIueSxcclxuICAgICk7XHJcblxyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgY3R4LmNsb3NlUGF0aCgpO1xyXG5cclxuICAgIC8vIEluZm9cclxuICAgIC8vIGN0eC5maWxsVGV4dCgnbWFzczogJyArIE51bWJlcih0aGlzLm1hc3MudG9GaXhlZCgyKSksIHggKyByYWRpdXMgKyA4LCB5KTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgfVxyXG5cclxuICB1cGRhdGVSb3RhdGlvbiAoKSB7XHJcblxyXG4gICAgdGhpcy5yb3RhdGlvbi5jdXJyZW50UmFkaWkgKz0gdGhpcy5yb3RhdGlvbi5zcGVlZCAqIHRoaXMucm90YXRpb24ubXVsdGlwbGllcjtcclxuXHJcbiAgICBpZiAodGhpcy5yb3RhdGlvbi5jdXJyZW50UmFkaWkgPiBwaTIpIHtcclxuICAgICAgdGhpcy5yb3RhdGlvbi5jdXJyZW50UmFkaWkgLT0gcGkyO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLnJvdGF0aW9uLmN1cnJlbnRSYWRpaSA8IDApIHtcclxuICAgICAgdGhpcy5yb3RhdGlvbi5jdXJyZW50UmFkaWkgKz0gcGkyO1xyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIGdyb3cgKCkge1xyXG4gICAgdGhpcy5tYXNzICs9IDAuMDAxICsgMC4wMTQgKiB0aGlzLmRuYS5nZW5lcy5kZWNheUVmZmljaWVuY3k7XHJcbiAgfVxyXG5cclxuICB0cnlUb1R1cm5JbnRvUmVwbGljYXRpbmdDZWxsICgpIHtcclxuXHJcbiAgICBpZiAodGhpcy5tYXNzIDwgMTApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNlbGwgPSBuZXcgUmVwbGljYXRpbmdDZWxsKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuc3RhZ2UucmVtRW50aXR5KHRoaXMpO1xyXG4gICAgY2VsbC5wb3Muc2V0KHRoaXMucG9zLngsIHRoaXMucG9zLnkpO1xyXG4gICAgdGhpcy5zdGFnZS5hZGRFbnRpdGllcyhjZWxsKTtcclxuXHJcbiAgfVxyXG5cclxufVxyXG4iLCJpbXBvcnQgSHlyaXRETkEgZnJvbSAnLi4vY2xhc3Nlcy9IeXJpdEROQSc7XHJcbmltcG9ydCBTdGFnZSBmcm9tICcuLi9jbGFzc2VzL1N0YWdlJztcclxuaW1wb3J0IHsgUHJvdGVpbiB9IGZyb20gJy4uL2h5cml0JztcclxuaW1wb3J0IGNpcmNsZUNvbGxpc2lvbiBmcm9tICcuLi91dGlscy9jaXJjbGVDb2xsaXNpb24nO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi91dGlscy9WZWN0b3IyJztcclxuaW1wb3J0IEVudGl0eUJhc2UgZnJvbSAnLi9FbnRpdHlCYXNlJztcclxuXHJcblxyXG5jbGFzcyBEeW5hbWljVGFyZ2V0UG9zaXRpb24ge1xyXG5cclxuICBlbnRpdHk6IFJlcGxpY2F0aW5nQ2VsbDtcclxuXHJcbiAgcG9zOiBWZWN0b3IyO1xyXG4gIGRpcjogVmVjdG9yMjtcclxuXHJcbiAgY29uc3RydWN0b3IgKGVudGl0eTogUmVwbGljYXRpbmdDZWxsKSB7XHJcbiAgICB0aGlzLmVudGl0eSA9IGVudGl0eTtcclxuICAgIHRoaXMucG9zID0gVmVjdG9yMi5yYW5kb21Qb2ludEluQ2lyY2xlKDIwMCkuYWRkVmVjdG9yKGVudGl0eS5wb3MpO1xyXG4gICAgdGhpcy5kaXIgPSBWZWN0b3IyLnJhbmRvbURpcmVjdGlvbigpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlICgpIHtcclxuICAgIGlmIChNYXRoLnJhbmRvbSgpID4gMC45OTQpIHtcclxuICAgICAgdGhpcy5yb3RhdGVUb3dhcmRzKFxyXG4gICAgICAgIFZlY3RvcjIucmFuZG9tUG9pbnRJbkNpcmNsZSh0aGlzLmVudGl0eS5zdGFnZS5yYWRpdXMpXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnBvcy5hZGRWZWN0b3IodGhpcy5kaXIsIHRoaXMuZW50aXR5LnNwZWVkICogMS4yKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcm90YXRlVG93YXJkcyAodGFyZ2V0OiBWZWN0b3IyKSB7XHJcbiAgICBcclxuICAgIGNvbnN0IHsgcG9zLCBkaXIgfSA9IHRoaXM7XHJcblx0XHRjb25zdCBjdXJEaXIgPSBNYXRoLmF0YW4yKGRpci55LCBkaXIueCk7XHJcbiAgICBjb25zdCBuZXdEaXIgPSBNYXRoLmF0YW4yKHRhcmdldC55IC0gcG9zLnksIHRhcmdldC54IC0gcG9zLngpO1xyXG4gICAgY29uc3Qgcm90YXRpb25SYXRlID0gMTtcclxuXHJcblx0XHRkaXIueCA9IE1hdGguY29zKGN1ckRpcikgKiAoMSAtIHJvdGF0aW9uUmF0ZSkgKyBNYXRoLmNvcyhuZXdEaXIpICogcm90YXRpb25SYXRlO1xyXG4gICAgZGlyLnkgPSBNYXRoLnNpbihjdXJEaXIpICogKDEgLSByb3RhdGlvblJhdGUpICsgTWF0aC5zaW4obmV3RGlyKSAqIHJvdGF0aW9uUmF0ZTtcclxuXHJcbiAgfVxyXG5cclxufVxyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlcGxpY2F0aW5nQ2VsbCBleHRlbmRzIEVudGl0eUJhc2Uge1xyXG5cclxuICBodW50aW5nQm9yZWRvb21DYXA6IG51bWJlcjtcclxuICBodW50aW5nQm9yZWRvb21DbG9jayA9IDA7XHJcbiAgaHVudGluZ0Nvb2xkb3duQ2FwID0gMTI4OyAvLyBQcmV2ZW50cyB0aGVtIGZyb20gaW5zdGFudGx5IHRhcmdldGluZyB0aGUgc2FtZSBjZWxsIGFmdGVyIGdldHRpbmcgYm9yZWRcclxuICBodW50aW5nQ29vbGRvd24gPSAwO1xyXG5cclxuICBwcml2YXRlIHRhcmdldGVkRW50aXR5OiBFbnRpdHlCYXNlIHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSB0YXJnZXRlZFBvc2l0aW9uOiBEeW5hbWljVGFyZ2V0UG9zaXRpb247XHJcblxyXG4gIHNjb3BlID0gMDtcclxuXHJcbiAgY29uc3RydWN0b3IgKGFyZ3M6IHtcclxuICAgIHN0YWdlOiBTdGFnZTtcclxuICAgIG1hc3M6IG51bWJlcjtcclxuICAgIGNvbG9yPzogc3RyaW5nO1xyXG4gICAgZG5hPzogSHlyaXRETkE7XHJcbiAgICBzdGFtaW5hPzogbnVtYmVyO1xyXG4gICAgcG9zPzogVmVjdG9yMjtcclxuICB9KSB7XHJcblxyXG4gICAgc3VwZXIoXHJcbiAgICAgIEVudGl0eUJhc2UudHlwZXMuUkVQTElDQVRJTkdfQ0VMTCxcclxuICAgICAgYXJncy5zdGFnZSxcclxuICAgICAgYXJncy5tYXNzLFxyXG4gICAgICBhcmdzLmNvbG9yLFxyXG4gICAgICBhcmdzLmRuYSxcclxuICAgICAgdm9pZCAwLFxyXG4gICAgICBhcmdzLnBvcyxcclxuICAgICAgYXJncy5zdGFtaW5hXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMudGFyZ2V0ZWRQb3NpdGlvbiA9IG5ldyBEeW5hbWljVGFyZ2V0UG9zaXRpb24odGhpcyk7XHJcbiAgICB0aGlzLmh1bnRpbmdCb3JlZG9vbUNhcCA9IE1hdGgucm91bmQoNTAwICsgMTUwMCAqIHRoaXMuZG5hLmdlbmVzLmh1bnRpbmdCb3JlZG9vbUNhcCk7XHJcbiAgICBcclxuICB9XHJcblxyXG4gIHVwZGF0ZSAoKSB7XHJcblxyXG4gICAgdGhpcy51cGRhdGVTdGF0cygpO1xyXG5cclxuICAgIGNvbnN0IGlzQWxpdmUgPSB0aGlzLmRlY2F5KCk7XHJcblxyXG4gICAgaWYgKCFpc0FsaXZlKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlc29sdmVDb2xsaXNpb25zKCk7XHJcbiAgICB0aGlzLm1hbmFnZVRhcmdldCgpO1xyXG4gICAgdGhpcy5yb3RhdGVUb3dhcmRzKHRoaXMudGFyZ2V0ZWRFbnRpdHk/LnBvcyB8fCB0aGlzLnRhcmdldGVkUG9zaXRpb24ucG9zKTtcclxuICAgIHRoaXMubW92ZSgpO1xyXG4gICAgdGhpcy50cnlUb1JlcGxpY2F0ZSgpO1xyXG5cclxuICAgIHRoaXMuc3RhbWluYS0tO1xyXG5cclxuXHJcbiAgICBpZiAodGhpcy5zdGFtaW5hIDwgMSkge1xyXG5cclxuICAgICAgY29uc3QgcHJvdGVpbnNUb0Ryb3AgPSBNYXRoLmNlaWwodGhpcy5tYXNzIC8gNTApO1xyXG4gICAgICBjb25zdCByYW5kb21NYXNzQWRkb24gPSBNYXRoLnNxcnQodGhpcy5tYXNzKTtcclxuXHJcbiAgICAgIGZvciAobGV0IGkgPSBwcm90ZWluc1RvRHJvcDsgaS0tOykge1xyXG5cclxuICAgICAgICB0aGlzLnN0YWdlLmFkZEVudGl0aWVzKFxyXG4gICAgICAgICAgbmV3IFByb3RlaW4oe1xyXG4gICAgICAgICAgICBzdGFnZTogdGhpcy5zdGFnZSxcclxuICAgICAgICAgICAgbWFzczogMSArIE1hdGgucmFuZG9tKCkgKiByYW5kb21NYXNzQWRkb24sXHJcbiAgICAgICAgICAgIGZvcmNlOiBWZWN0b3IyLnJhbmRvbURpcmVjdGlvbigpLm11bHRpcGx5KE1hdGgucmFuZG9tKCkpLFxyXG4gICAgICAgICAgICBwb3M6IHRoaXMucG9zXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnN0YWdlLnJlbUVudGl0eSh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICBkcmF3IChjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkge1xyXG5cclxuICAgIGNvbnN0IHJhZGl1cyA9IHRoaXMuZ2V0UmFkaXVzKCk7XHJcbiAgICBjb25zdCB7IHBvcywgZGlyIH0gPSB0aGlzO1xyXG4gIFxyXG4gICAgLy8gQm9keVxyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XHJcbiAgICBjdHguYXJjKHBvcy54LCBwb3MueSwgcmFkaXVzLCAwLCBNYXRoLlBJICogMik7XHJcbiAgICBjdHguZmlsbCgpO1xyXG4gICAgY3R4LmNsb3NlUGF0aCgpO1xyXG5cclxuICAgIC8vIEV5ZVxyXG4gICAgY29uc3QgZXllUmFkaXVzID0gTWF0aC5zcXJ0KHJhZGl1cyk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gJyMwMDAwMDAnO1xyXG4gICAgY3R4LmFyYyhcclxuICAgICAgcG9zLnggKyAocmFkaXVzICogMC45IC0gZXllUmFkaXVzKSAqIGRpci54LFxyXG4gICAgICBwb3MueSArIChyYWRpdXMgKiAwLjkgLSBleWVSYWRpdXMpICogZGlyLnksXHJcbiAgICAgIGV5ZVJhZGl1cywgMCwgTWF0aC5QSSAqIDJcclxuICAgICk7XHJcbiAgICBjdHguZmlsbCgpO1xyXG4gICAgY3R4LmNsb3NlUGF0aCgpO1xyXG4gIFxyXG4gICAgLy8gU2NvcGVcclxuICAgIC8vIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIC8vIGN0eC5zdHJva2VTdHlsZSA9IHRoaXMuY29sb3I7XHJcbiAgICAvLyBjdHguYXJjKHBvcy54LCBwb3MueSwgdGhpcy5zY29wZSwgMCwgTWF0aC5QSSAqIDIpO1xyXG4gICAgLy8gY3R4LnN0cm9rZSgpO1xyXG4gICAgLy8gY3R4LmNsb3NlUGF0aCgpO1xyXG5cclxuXHJcbiAgICAvLyBJbmZvXHJcbiAgICAvLyBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAvLyBjdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuICAgIC8vIGN0eC5maWxsVGV4dCgnbWFzczogJyArIE51bWJlcih0aGlzLm1hc3MudG9GaXhlZCgyKSksIHBvcy54ICsgcmFkaXVzICsgOCwgcG9zLnkpO1xyXG4gICAgLy8gY3R4LmZpbGxUZXh0KCdzdGFtaW5hOiAnICsgdGhpcy5zdGFtaW5hLCBwb3MueCArIHJhZGl1cyArIDgsIHBvcy55ICsgMTQpO1xyXG5cclxuICB9XHJcblxyXG4gIHJlc29sdmVDb2xsaXNpb25zICgpIHtcclxuICAgIGZvciAoY29uc3QgZW50aXR5IG9mIHRoaXMuc3RhZ2UuZW50aXRpZXMpIHtcclxuXHJcbiAgICAgIGlmIChlbnRpdHkgPT09IHRoaXMpIHtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgeyBjb2xsaWRlcywgZGlzdGFuY2UgfSA9IGNpcmNsZUNvbGxpc2lvbihcclxuICAgICAgICB0aGlzLnBvcy54LCAgZW50aXR5LnBvcy54LFxyXG4gICAgICAgIHRoaXMucG9zLnksICBlbnRpdHkucG9zLnksXHJcbiAgICAgICAgdGhpcy5yYWRpdXMsIGVudGl0eS5yYWRpdXNcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGlmICghY29sbGlkZXMpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgc3dpdGNoIChlbnRpdHkudHlwZSkge1xyXG5cclxuICAgICAgICBjYXNlIEVudGl0eUJhc2UudHlwZXMuUkVQTElDQVRJTkdfQ0VMTDpcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYgKHRoaXMubWFzcyA+PSBlbnRpdHkubWFzcykge1xyXG4gICAgICAgICAgICB0aGlzLnJlc29sdmVDb2xsaXNpb25QdXNoaW5nKGVudGl0eSwgZGlzdGFuY2UpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMubWFzcyA+IGVudGl0eS5tYXNzICYmICF0aGlzLmRuYS5tYXRjaChlbnRpdHkuZG5hKSkge1xyXG4gICAgICAgICAgICAgIHRoaXMuZHJhaW4oZW50aXR5LCBkaXN0YW5jZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBFbnRpdHlCYXNlLnR5cGVzLlBST1RFSU46XHJcbiAgICAgICAgICB0aGlzLm1hc3MgKz0gZW50aXR5Lm1hc3M7XHJcbiAgICAgICAgICBlbnRpdHkuZGVjYXkoZW50aXR5Lm1hc3MpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbWFuYWdlVGFyZ2V0ICgpIHtcclxuXHJcbiAgICBpZiAodGhpcy5odW50aW5nQ29vbGRvd24gPiAwKSB7XHJcbiAgICAgIHRoaXMuaHVudGluZ0Nvb2xkb3duLS07XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy50YXJnZXRlZEVudGl0eSAhPT0gbnVsbCkge1xyXG5cclxuICAgICAgdGhpcy5odW50aW5nQm9yZWRvb21DbG9jaysrO1xyXG5cclxuICAgICAgY29uc3QgdGFyZ2V0R290QmlnZ2VyID0gdGhpcy50YXJnZXRlZEVudGl0eS5tYXNzID49IHRoaXMubWFzcztcclxuICAgICAgY29uc3QgZ290Qm9yZWQgPSB0aGlzLmh1bnRpbmdCb3JlZG9vbUNsb2NrID49IHRoaXMuaHVudGluZ0JvcmVkb29tQ2FwO1xyXG4gICAgICBjb25zdCB0YXJnZXREaWVkID0gIXRoaXMudGFyZ2V0ZWRFbnRpdHkuaXNBbGl2ZSgpO1xyXG4gICAgICBjb25zdCB0YXJnZXRSYW5Bd2F5ID0gIWNpcmNsZUNvbGxpc2lvbihcclxuICAgICAgICB0aGlzLnBvcy54LCB0aGlzLnRhcmdldGVkRW50aXR5LnBvcy54LFxyXG4gICAgICAgIHRoaXMucG9zLnksIHRoaXMudGFyZ2V0ZWRFbnRpdHkucG9zLnksXHJcbiAgICAgICAgdGhpcy5nZXRTY29wZSgpLCB0aGlzLnRhcmdldGVkRW50aXR5LnJhZGl1c1xyXG4gICAgICApLmNvbGxpZGVzO1xyXG5cclxuICAgICAgaWYgKHRhcmdldEdvdEJpZ2dlciB8fCBnb3RCb3JlZCB8fCB0YXJnZXREaWVkIHx8IHRhcmdldFJhbkF3YXkpIHtcclxuICAgICAgICBpZiAoZ290Qm9yZWQpIHtcclxuICAgICAgICAgIHRoaXMuaHVudGluZ0Nvb2xkb3duID0gdGhpcy5odW50aW5nQ29vbGRvd25DYXA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaHVudGluZ0JvcmVkb29tQ2xvY2sgPSAwO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ZWRFbnRpdHkgPSBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIC8vIFRyaWVzIHRvIGZpbmQgYSBjZWxsIHRvIHRhcmdldFxyXG4gICAgICBmb3IgKGNvbnN0IGVudGl0eSBvZiB0aGlzLnN0YWdlLmVudGl0aWVzKSB7XHJcblxyXG4gICAgICAgIC8vIFNraXBzIGl0c2VsZiBhbHJlYWR5XHJcbiAgICAgICAgaWYgKGVudGl0eS5tYXNzID49IHRoaXMubWFzcyB8fCB0aGlzLmRuYS5tYXRjaChlbnRpdHkuZG5hKSkge1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB7IGNvbGxpZGVzIH0gPSBjaXJjbGVDb2xsaXNpb24oXHJcbiAgICAgICAgICB0aGlzLnBvcy54LCBlbnRpdHkucG9zLngsXHJcbiAgICAgICAgICB0aGlzLnBvcy55LCBlbnRpdHkucG9zLnksXHJcbiAgICAgICAgICB0aGlzLmdldFNjb3BlKCksIGVudGl0eS5yYWRpdXNcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoY29sbGlkZXMpIHtcclxuICAgICAgICAgIC8vIE5vdCBuZWNlc3NhcnkgYmVjYXVzZSBpdCBkb2Vzbid0IGdldCBib3JlZCB0YXJnZXRpbmcgcG9zaXRpb25zXHJcbiAgICAgICAgICAvLyB0aGlzLmh1bnRpbmdCb3JlZG9vbUNsb2NrID0gMDtcclxuICAgICAgICAgIHRoaXMudGFyZ2V0ZWRFbnRpdHkgPSBlbnRpdHk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTdGlsbCBkaWRuJ3QgZmluZCBhIGdvb2QgdGFyZ2V0XHJcbiAgICAgIGlmICh0aGlzLnRhcmdldGVkRW50aXR5ID09PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy50YXJnZXRlZFBvc2l0aW9uLnVwZGF0ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgdHJ5VG9SZXBsaWNhdGUgKCkge1xyXG5cclxuICAgIGlmICh0aGlzLnRhcmdldGVkRW50aXR5ICE9PSBudWxsICYmIHRoaXMubWFzcyAvIDIgPD0gdGhpcy50YXJnZXRlZEVudGl0eS5tYXNzKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBtdWx0aXBsaWVyID0gdGhpcy5kbmEuZ2VuZXMubWFzc1RvTmVlZGVkUmVwcm9kdWNlICoqIDI7XHJcblxyXG4gICAgaWYgKHRoaXMubWFzcyA+IDEwMCArIDkwMCAqIG11bHRpcGxpZXIpIHtcclxuXHJcbiAgICAgIHRoaXMubWFzcyAvPSAyO1xyXG4gICAgICB0aGlzLnN0YW1pbmEgLz0gMjtcclxuXHJcbiAgICAgIGNvbnN0IGJyb3RoZXIgPSBuZXcgUmVwbGljYXRpbmdDZWxsKHtcclxuICAgICAgICBzdGFnZTogdGhpcy5zdGFnZSxcclxuICAgICAgICBtYXNzOiB0aGlzLm1hc3MsXHJcbiAgICAgICAgY29sb3I6IHRoaXMuY29sb3IsXHJcbiAgICAgICAgZG5hOiB0aGlzLmRuYS5jb3B5KCksXHJcbiAgICAgICAgc3RhbWluYTogdGhpcy5zdGFtaW5hXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgYnJvdGhlci5wb3Muc2V0KHRoaXMucG9zLngsIHRoaXMucG9zLnkpO1xyXG5cclxuICAgICAgdGhpcy5zdGFnZS5hZGRFbnRpdGllcyhicm90aGVyKTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVTdGF0cyAoKTogdm9pZCB7XHJcbiAgICB0aGlzLnNwZWVkID0gdGhpcy5nZXRTcGVlZCgpO1xyXG4gICAgdGhpcy5yYWRpdXMgPSB0aGlzLmdldFJhZGl1cygpO1xyXG4gICAgdGhpcy5zY29wZSA9IHRoaXMuZ2V0U2NvcGUoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0U3BlZWQgKCk6IG51bWJlciB7XHJcbiAgICBjb25zdCBtdWx0aXBsaWVyID0gdGhpcy5kbmEuZ2VuZXMuc3BlZWQgKiogMjtcclxuICAgIGNvbnN0IGJhc2UgPSBNYXRoLmxvZyh0aGlzLm1hc3MpIC8gTWF0aC5zcXJ0KHRoaXMubWFzcyk7XHJcbiAgICBjb25zdCBzdGFtaW5hUGVuYWx0eSA9IE1hdGgubWluKDEwMCwgdGhpcy5zdGFtaW5hKSAvIDEwMDtcclxuICAgIHJldHVybiAoMSArIDMgKiBiYXNlICogbXVsdGlwbGllcikgKiBzdGFtaW5hUGVuYWx0eTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0U2NvcGUgKCkge1xyXG4gICAgcmV0dXJuIDEwMCArIHRoaXMucmFkaXVzO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgU3RhZ2UgZnJvbSAnLi9jbGFzc2VzL1N0YWdlJztcclxuaW1wb3J0IENhbnZhc1JlbmRlcmVyIGZyb20gJy4vY2xhc3Nlcy9DYW52YXNSZW5kZXJlcic7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4vdXRpbHMvVmVjdG9yMic7XHJcbmltcG9ydCBSZXBsaWNhdGluZ0NlbGwgZnJvbSAnLi9lbnRpdGllcy9SZXBsaWNhdGluZ0NlbGwnO1xyXG5pbXBvcnQgUHJvdGVpbiBmcm9tICcuL2VudGl0aWVzL1Byb3RlaW4nO1xyXG5cclxuXHJcbmV4cG9ydCB7XHJcbiAgUmVwbGljYXRpbmdDZWxsLFxyXG4gIFByb3RlaW5cclxufTtcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgSHlyaXRDb25maWcge1xyXG5cclxuICBzdGFnZSA9IHtcclxuICAgIHJhZGl1czogMzA3MlxyXG4gIH07XHJcblxyXG4gIGNvbnN0cnVjdG9yIChjb25maWc6IFBhcnRpYWw8SHlyaXRDb25maWc+ID0ge30pIHtcclxuICAgIE9iamVjdC5hc3NpZ24odGhpcywgY29uZmlnKTtcclxuICB9XHJcblxyXG59XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSHlyaXQge1xyXG5cclxuICByZW5kZXJlcjogQ2FudmFzUmVuZGVyZXI7XHJcbiAgc3RhZ2U6IFN0YWdlO1xyXG5cclxuICBmb2N1c2VkRW50aXR5OiBSZXBsaWNhdGluZ0NlbGwgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgb25VcGRhdGU6ICgoZnJhbWU6IG51bWJlcikgPT4gYW55KSB8IG51bGwgPSBudWxsO1xyXG5cclxuICBjb25zdHJ1Y3RvciAoY29uZmlnOiBQYXJ0aWFsPEh5cml0Q29uZmlnPiA9IG5ldyBIeXJpdENvbmZpZygpKSB7XHJcblxyXG4gICAgY29uc3QgX2NvbmZpZyA9IG5ldyBIeXJpdENvbmZpZyhjb25maWcpO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKCc6OiBIeXJpdCBDb25maWcgOjpcXG4nLCBKU09OLnN0cmluZ2lmeShfY29uZmlnLCBudWxsLCAyKSk7XHJcblxyXG4gICAgdGhpcy5yZW5kZXJlciA9IG5ldyBDYW52YXNSZW5kZXJlcih0aGlzKTtcclxuICAgIHRoaXMuc3RhZ2UgPSBuZXcgU3RhZ2UoX2NvbmZpZy5zdGFnZS5yYWRpdXMpO1xyXG5cclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLnVwZGF0ZSgpKTtcclxuXHJcbiAgICAvLyBAdHMtaWdub3JlXHJcbiAgICB3aW5kb3cubW91c2UgPSB0aGlzLm1vdXNlO1xyXG5cclxuICB9XHJcblxyXG4gIHVwZGF0ZSAoKSB7XHJcblxyXG4gICAgaWYgKHRoaXMuZm9jdXNlZEVudGl0eSkge1xyXG4gICAgICB0aGlzLnJlbmRlcmVyLnVwZGF0ZU1vdXNlUG9zaXRpb24oKTtcclxuICAgICAgaWYgKCF0aGlzLmZvY3VzZWRFbnRpdHkuaXNBbGl2ZSgpKSB7XHJcbiAgICAgICAgdGhpcy5zZXRGb2N1c2VkRW50aXR5KG51bGwpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zdGFnZS51cGRhdGUoKTtcclxuXHJcbiAgICB0aGlzLnJlbmRlcmVyLmNsZWFyKCk7XHJcbiAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcigpO1xyXG4gICAgdGhpcy5yZW5kZXJlci5yZW5kZXJJbmZvKCk7XHJcbiAgXHJcbiAgICBjb25zdCBmcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLnVwZGF0ZSgpKTtcclxuICBcclxuICAgIGlmICh0aGlzLm9uVXBkYXRlICE9PSBudWxsKSB7XHJcbiAgICAgIHRoaXMub25VcGRhdGUoZnJhbWUpO1xyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIHNldEZvY3VzZWRFbnRpdHkgKGVudGl0eTogUmVwbGljYXRpbmdDZWxsIHwgbnVsbCk6IHZvaWQge1xyXG5cclxuICAgIGlmIChlbnRpdHkgPT09IG51bGwpIHtcclxuICAgICAgaWYgKHRoaXMuZm9jdXNlZEVudGl0eSAhPT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuY2FtZXJhID0gVmVjdG9yMi5mcm9tKHRoaXMuZm9jdXNlZEVudGl0eS5wb3MpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnJlbmRlcmVyLmNhbWVyYSA9IGVudGl0eS5wb3M7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdmb2N1c2luZzonLCBlbnRpdHkpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZm9jdXNlZEVudGl0eSA9IGVudGl0eTtcclxuXHJcbiAgfVxyXG5cclxufVxyXG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBWZWN0b3IyIHtcclxuXHJcbiAgc3RhdGljIG5ldyAoeDogbnVtYmVyID0gMCwgeTogbnVtYmVyID0gMCk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgsIHkpO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIHJhbmRvbURpcmVjdGlvbiAoKSB7XHJcblxyXG4gICAgY29uc3QgdGhldGEgPSBNYXRoLnJhbmRvbSgpICogTWF0aC5QSSAqIDI7XHJcblxyXG4gICAgcmV0dXJuIG5ldyB0aGlzKFxyXG4gICAgICBNYXRoLmNvcyh0aGV0YSksXHJcbiAgICAgIE1hdGguc2luKHRoZXRhKVxyXG4gICAgKTtcclxuXHJcbiAgfVxyXG5cclxuICBzdGF0aWMgcmFuZG9tUG9pbnRJbkNpcmNsZSAocmFkaXVzOiBudW1iZXIpIHtcclxuXHJcbiAgICBjb25zdCB0aGV0YSA9IDIgKiBNYXRoLlBJICogTWF0aC5yYW5kb20oKTtcclxuICAgIGNvbnN0IHUgPSBNYXRoLnJhbmRvbSgpICsgTWF0aC5yYW5kb20oKTtcclxuICAgIGNvbnN0IHIgPSB1ID4gMSA/IDIgLSB1IDogdTtcclxuXHJcbiAgICByZXR1cm4gbmV3IHRoaXMoXHJcbiAgICAgIHIgKiBNYXRoLmNvcyh0aGV0YSkgKiByYWRpdXMsXHJcbiAgICAgIHIgKiBNYXRoLnNpbih0aGV0YSkgKiByYWRpdXNcclxuICAgICk7XHJcblxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGZyb20gKHZlY3RvcjogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9KSB7XHJcbiAgICByZXR1cm4gbmV3IHRoaXModmVjdG9yLngsIHZlY3Rvci55KVxyXG4gIH1cclxuXHJcblxyXG4gIHg6IG51bWJlcjtcclxuICB5OiBudW1iZXI7XHJcblxyXG4gIGNvbnN0cnVjdG9yICh4OiBudW1iZXIgPSAwLCB5OiBudW1iZXIgPSAwKSB7XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICB9XHJcblxyXG5cclxuICBzZXQgKHg6IG51bWJlciwgeTogbnVtYmVyKTogdGhpcyB7XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgY29weSAodmVjdG9yOiBWZWN0b3IyKTogdGhpcyB7XHJcbiAgICB0aGlzLnNldCh2ZWN0b3IueCwgdmVjdG9yLnkpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBhZGQgKHg6IG51bWJlciwgeTogbnVtYmVyLCBtdWx0aXBsaWVyID0gMSk6IHRoaXMge1xyXG4gICAgdGhpcy54ICs9IHggKiBtdWx0aXBsaWVyO1xyXG4gICAgdGhpcy55ICs9IHkgKiBtdWx0aXBsaWVyO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBhZGRWZWN0b3IgKHZlY3RvcjogVmVjdG9yMiwgbXVsdGlwbGllciA9IDEpOiB0aGlzIHtcclxuICAgIHRoaXMueCArPSB2ZWN0b3IueCAqIG11bHRpcGxpZXIsXHJcbiAgICB0aGlzLnkgKz0gdmVjdG9yLnkgKiBtdWx0aXBsaWVyO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBtdWx0aXBseSAoejogbnVtYmVyKSB7XHJcbiAgICB0aGlzLnggKj0gejtcclxuICAgIHRoaXMueSAqPSB6O1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxufVxyXG4iLCIvKiBOb3Rlc1xyXG4gKiAxLiBBdCB0aGlzIHBvaW50IGluIHRpbWUgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdGhlICd3aGVlbCcgZXZlbnQsIGJ1dCBvbmx5IDgwJSBvZiB0aGVpciB2ZXJzaW9ucy5cclxuICogMi4gSUUgOSBhbmQgMTAgZG9lcyBub3QgaGF2ZSB0aGUgJ29ud2hlZWwnIHByb3BlcnR5IGluIGVsZW1lbnRzIHRob3VnaCBzdXBwb3J0cyBpdCB2aWEgYWRkRXZlbnRMaXN0ZW5lclxyXG4gKiAzLiBNb3N0IG1vZGVybiBicm93c2VycyBzdXBwb3J0IG1vcmUgdGhhbiBvbmUgb2YgdGhlIGV2ZW50cyB0ZXN0ZWRcclxuICovXHJcblxyXG50eXBlIERlbHRhID0gLTEgfCAxO1xyXG5cclxudHlwZSBQYXJhbWV0ZXJzID0gW1xyXG4gIGVsZW1lbnQ6IEhUTUxFbGVtZW50LFxyXG4gIGxpc3RlbmVyOiAoZXZlbnQ6IFdoZWVsRXZlbnQsIGRlbHRhOiBEZWx0YSkgPT4gdm9pZCxcclxuICBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zXHJcbl07XHJcblxyXG5jb25zdCBzdXBwb3J0ID0ge1xyXG4gIHdoZWVsOiBmYWxzZSxcclxuICBtb3VzZXdoZWVsOiBmYWxzZSxcclxuICBET01Nb3VzZVNjcm9sbDogZmFsc2VcclxufTtcclxuXHJcbmZ1bmN0aW9uIGdldERlbHRhIChlOiBFdmVudCk6IERlbHRhIHtcclxuICAvLyBAdHMtaWdub3JlIFRoZXNlIHRocmVlIHByb3BlcnRpZXMgbmV2ZXIgZXhpc3QgaW4gdGhlIHNhbWUgZXZlbnRcclxuICByZXR1cm4gKCgoZS5kZWx0YVkgfHwgLWUud2hlZWxEZWx0YSB8fCBlLmRldGFpbCkgPj4gMTApIHx8IDEpIGFzIERlbHRhXHJcbn1cclxuXHJcbmxldCBhZGRDcm9zc0Jyb3dzZXJXaGVlbEV2ZW50TGlzdGVuZXIgPSAoLi4uYXJnczogUGFyYW1ldGVycykgPT4ge1xyXG5cclxuICBjb25zdCBbZWxlbWVudCwgbGlzdGVuZXIsIG9wdGlvbnNdID0gYXJncztcclxuXHJcbiAgY29uc3QgaGFuZGxlU3VwcG9ydDogRXZlbnRMaXN0ZW5lciA9IGUgPT4ge1xyXG5cclxuICAgIC8vIFRoaXMgcHJldmVudHMgZnJvbSBjYWxsaW5nIHR3aWNlIGlmIHRoZVxyXG4gICAgLy8gYnJvd3NlciBzdXBwb3J0cyBtb3JlIHRoYW4gb25lIG9mIHRoZSBldmVudHNcclxuICAgIGlmIChPYmplY3QudmFsdWVzKHN1cHBvcnQpLnNvbWUoQm9vbGVhbikpIHtcclxuICAgICAgcmV0dXJuOyAvLyBIYXMgYWxyZWFkeSBiZWVuIGhhbmRsZWQgYnkgYW5vdGhlciBsaXN0ZW5lclxyXG4gICAgfVxyXG5cclxuICAgIHN1cHBvcnRbZS50eXBlXSA9IHRydWU7XHJcblxyXG4gICAgLy8gUmVtb3ZlIHRlc3RzXHJcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3doZWVsJywgaGFuZGxlU3VwcG9ydCk7XHJcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCBoYW5kbGVTdXBwb3J0KTtcclxuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignRE9NTW91c2VTY3JvbGwnLCBoYW5kbGVTdXBwb3J0KTtcclxuXHJcblxyXG4gICAgYWRkQ3Jvc3NCcm93c2VyV2hlZWxFdmVudExpc3RlbmVyID0gKC4uLmFyZ3M6IFBhcmFtZXRlcnMpID0+IHtcclxuXHJcbiAgICAgIGNvbnN0IFtfZWxlbWVudCwgX2xpc3RlbmVyLCBfb3B0aW9uc10gPSBhcmdzO1xyXG5cclxuICAgICAgX2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihlLnR5cGUsIGVfID0+e1xyXG4gICAgICAgIF9saXN0ZW5lcihlXyBhcyBXaGVlbEV2ZW50LCBnZXREZWx0YShlXykpO1xyXG4gICAgICB9LCBfb3B0aW9ucyk7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBBZGQgYWN0dWFsIGV2ZW50IGxpc3RlbmVyXHJcbiAgICBhZGRDcm9zc0Jyb3dzZXJXaGVlbEV2ZW50TGlzdGVuZXIoLi4uYXJncyk7XHJcblxyXG4gICAgLy8gVHJpZ2dlciB0aGUgZmlyc3QgdGltZVxyXG4gICAgbGlzdGVuZXIoZSBhcyBXaGVlbEV2ZW50LCBnZXREZWx0YShlKSk7XHJcbiAgfTtcclxuXHJcbiAgLy8gQWRkIHRlc3RzXHJcbiAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIGhhbmRsZVN1cHBvcnQsIG9wdGlvbnMpO1xyXG4gIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIGhhbmRsZVN1cHBvcnQsIG9wdGlvbnMpO1xyXG4gIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NTW91c2VTY3JvbGwnLCBoYW5kbGVTdXBwb3J0LCBvcHRpb25zKTtcclxufTtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCAoLi4uYXJnczogUGFyYW1ldGVycykgPT4gYWRkQ3Jvc3NCcm93c2VyV2hlZWxFdmVudExpc3RlbmVyKC4uLmFyZ3MpO1xyXG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjaXJjbGVDb2xsaXNpb24gKFxyXG4gIHgxOiBudW1iZXIsIHgyOiBudW1iZXIsXHJcbiAgeTE6IG51bWJlciwgeTI6IG51bWJlcixcclxuICByMTogbnVtYmVyLCByMjogbnVtYmVyKSB7XHJcblxyXG4gIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5oeXBvdCh4MSAtIHgyLCB5MSAtIHkyKSAtIChyMSArIHIyKTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGRpc3RhbmNlLFxyXG4gICAgY29sbGlkZXM6IGRpc3RhbmNlIDwgMFxyXG4gIH07XHJcblxyXG59O1xyXG4iLCJpbXBvcnQgSHlyaXQsIHsgUmVwbGljYXRpbmdDZWxsLCBQcm90ZWluIH0gZnJvbSAnLi9oeXJpdC9oeXJpdCc7XHJcblxyXG5cclxuY29uc3QgaHlyaXQgPSBuZXcgSHlyaXQoKTtcclxuXHJcblxyXG5oeXJpdC5zdGFnZS5hZGRFbnRpdGllcyhcclxuICAuLi5BcnJheSgxMDApLmZpbGwobnVsbCkubWFwKCgpID0+IFxyXG5cclxuICAgIE1hdGgucmFuZG9tKCkgPiAxXHJcblxyXG4gICAgPyBuZXcgUmVwbGljYXRpbmdDZWxsKHtcclxuICAgICAgc3RhZ2U6IGh5cml0LnN0YWdlLFxyXG4gICAgICBtYXNzOiAxMCArIE1hdGgucmFuZG9tKCkgKiA5MFxyXG4gICAgfSlcclxuXHJcbiAgICA6IG5ldyBQcm90ZWluKHtcclxuICAgICAgc3RhZ2U6IGh5cml0LnN0YWdlLFxyXG4gICAgICBtYXNzOiAxXHJcbiAgICB9KVxyXG5cclxuICApXHJcbik7XHJcblxyXG5cclxuaHlyaXQub25VcGRhdGUgPSBmcmFtZSA9PiB7XHJcblxyXG4gIGNvbnN0IHN0YWdlQXJlYSA9IE1hdGguUEkgKiBoeXJpdC5zdGFnZS5yYWRpdXMgKiBoeXJpdC5zdGFnZS5yYWRpdXM7XHJcbiAgY29uc3QgbW9kdWxlID0gTWF0aC5jZWlsKDUwIC8gKHN0YWdlQXJlYSAvIChNYXRoLlBJICogMTAwMDAwMCkpKTtcclxuXHJcbiAgaWYgKGZyYW1lICUgbW9kdWxlID09PSAwKSB7XHJcbiAgICBoeXJpdC5zdGFnZS5hZGRFbnRpdGllcyhcclxuICAgICAgbmV3IFByb3RlaW4oe1xyXG4gICAgICAgIHN0YWdlOiBoeXJpdC5zdGFnZSxcclxuICAgICAgICBtYXNzOiAxICsgTWF0aC5yYW5kb20oKSAqIDVcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxufTtcclxuXHJcblxyXG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGh5cml0LnJlbmRlcmVyLmVsZW1lbnQpO1xyXG5oeXJpdC5yZW5kZXJlci5hZGp1c3RUb1BhcmVudFNpemUoKTtcclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiBoeXJpdC5yZW5kZXJlci5hZGp1c3RUb1BhcmVudFNpemUoKSk7XHJcblxyXG5cclxuLy8gQHRzLWlnbm9yZVxyXG53aW5kb3cuaHlyaXQgPSBoeXJpdDtcclxuIl0sInNvdXJjZVJvb3QiOiIifQ==