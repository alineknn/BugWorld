import { Position, WorldError} from "./world.js";
export const Cell = {
    Wall: class { },
    Food: class { amount; constructor(amount) { this.amount = amount; } },
    Nest: class { color; constructor(color) { this.color = color; } },
    Free: class { },
};

export class CellMut {
    constructor() { }

    // returns true if the cell is occupied by a bug
    isOccupied() { throw Error("Not implemented"); }

    // return true if the cell is free for a bug to move into
    freeToMove() { throw Error("Not implemented"); }

    // put a bug id into the cell
    // throws WorldError if the cell is occupied or a wall
    putBug(_bugId) { throw Error("Not implemented"); }

    // remove a bug id from the cell
    // returns the bug id that was removed
    clearBug() { throw Error("Not implemented"); }

    // get the id of the bug in the cell
    // returns null if the cell is not occupied
    getBug() { throw Error("Not implemented"); }

    // add food to the cell
    // throws WorldError if the cell is a wall or if there is already 9 units of food
    incrFood() { throw Error("Not implemented"); }

    // remove food from the cell
    // throws WorldError if the cell is a wall or if there is no food
    decrFood() { throw Error("Not implemented"); }

    // get the amount of food in the cell
    // returns 0 if there is no food or if the cell is a wall
    getFood() { throw Error("Not implemented"); }

    // put a marker into the cell
    // throws WorldError if the cell is a wall
    putMarker(_color, _marker) { throw Error("Not implemented"); }

    // remove a marker from the cell
    // returns true if the marker was removed, false if the marker was not present
    clearMarker(_color, _marker) { throw Error("Not implemented"); }

    // check if a marker is present in the cell
    // returns true if the marker is present, false otherwise
    hasMarker(_color, _marker) { throw Error("Not implemented"); }

    // check if an enemy marker is present in the cell
    // returns true if an enemy marker is present, false otherwise
    hasEnemyMarker(_color) { throw Error("Not implemented"); }

    // returns true if the cell is the home nest for the given color, false otherwise
    isHomeNest(_color) { throw Error("Not implemented"); }

    // returns true if the cell is the enemy nest for the given color, false otherwise
    isEnemyNest(_color) { throw Error("Not implemented"); }

    // returns the color of the nest if the cell is a nest, null otherwise
    nestFor() { throw Error("Not implemented"); }

    static Wall = class extends CellMut {
        constructor() { super(); }

        isOccupied() { return false; }
        freeToMove() { return false; }

        putBug(_bugId) { throw new WorldError(WorldError.Type.Wall); }
        clearBug() { return null; }
        getBug() { return null; }

        incrFood() { throw new WorldError(WorldError.Type.Wall); }
        decrFood() { throw new WorldError(WorldError.Type.Wall); }
        getFood() { return 0; }

        putMarker(_color, _marker) { throw new WorldError(WorldError.Type.Wall); }
        clearMarker(_color, _marker) { return false; }
        hasMarker(_color, _marker) { return false; }
        hasEnemyMarker(_color) { return false; }

        isHomeNest(_color) { return false; }
        isEnemyNest(_color) { return false; }
        nestFor() { return null; }
    }

    static _Occupiable = class _Occupiable extends CellMut {
        #bugId = null;
        #markers = {};

        constructor() { super(); }

        isOccupied() { return this.#bugId !== null; }
        freeToMove() { return this.#bugId === null; }

        putBug(bugId) {
            if (this.#bugId !== null) {
                throw new WorldError(WorldError.Type.Occupied);
            }
            this.#bugId = bugId;
        }

        clearBug() {
            const bug = this.#bugId;
            this.#bugId = null;
            return bug;
        }

        getBug() { return this.#bugId; }

        putMarker(color, marker) {
            if (this.#markers[color] === undefined) {
                this.#markers[color] = {};
            }
            this.#markers[color][marker] = true;
        }

        clearMarker(color, marker) {
            if (this.#markers[color] === undefined) {
                return false;
            }
            if (this.#markers[color][marker] === undefined) {
                return false;
            }
            delete this.#markers[color][marker];
            return true;
        }

        hasMarker(color, marker) {
            if (this.#markers[color] === undefined) {
                return false;
            }
            return this.#markers[color][marker] !== undefined;
        }

        hasEnemyMarker(color) {
            const enemyColor = Color.enemyColor(color);
            if (this.#markers[enemyColor] === undefined) {
                return false;
            }
            for (_ in this.#markers[enemyColor]) {
                return true;
            }
        }
    }

    static Free = class extends this._Occupiable {
        #food;
        constructor(initialFood = 0) {
            super();
            this.#food = initialFood;
        }

        incrFood() {
            if (this.#food === 9) {
                throw new WorldError(WorldError.Type.TooMuchFood);
            }
            this.#food++;
        }

        decrFood() {
            if (this.#food === 0) {
                throw new WorldError(WorldError.Type.NoFood);
            }
            this.#food--;
        }

        getFood() { return this.#food; }

        isHomeNest(_color) { return false; }
        isEnemyNest(_color) { return false; }
        nestFor() { return null; }
    }

    static Nest = class extends this._Occupiable {
        #color;
        constructor(color) {
            super();
            this.#color = color;
        }

        incrFood() {
            throw new WorldError(WorldError.Type.Nest);
        }

        decrFood() {
            throw new WorldError(WorldError.Type.Nest);
        }

        getFood() { return 0; }

        isHomeNest(color) { return this.#color === color; }
        isEnemyNest(color) { return this.#color === Color.enemyColor(color); }
        nestFor() { return this.#color; }
    }

    static from(cell) {
        if (cell instanceof Cell.Wall) {
            return new this.Wall();
        } else if (cell instanceof Cell.Free) {
            return new this.Free();
        } else if (cell instanceof Cell.Nest) {
            return new this.Nest(cell.color);
        } else if (cell instanceof Cell.Food) {
            return new this.Free(cell.amount);
        }
    }
}

export class Grid {
    #width;
    #height;
    #cells;

    constructor(width, height) {
        this.#width = width;
        this.#height = height;
        this.#cells = [];
        for (let i = 0; i < this.#height; i++) {
            this.#cells.push([]);
            for (let j = 0; j < this.#width; j++) {
                this.#cells[i].push(new Cell.Free());
            }
        }
    }

    width() {
        return this.#width;
    }

    height() {
        return this.#height;
    }

    inBounds(pos) {
        return pos.x >= 0 && pos.x < this.width() && pos.y >= 0 && pos.y < this.height();
    }

    #checkBounds(pos) {
        if (!this.inBounds(pos)) {
            throw new WorldError(WorldError.Type.OutOfBounds);
        }
    }

    getCellAt(pos) {
        this.#checkBounds(pos);
        return this.#cells[pos.y][pos.x];
    }

    setCellAt(pos, cell) {
        this.#checkBounds(pos);
        this.#cells[pos.y][pos.x] = cell;
    }

    map(f) {
        const newGrid = new Grid(this.width(), this.height());
        for (let i = 0; i < this.height(); i++) {
            for (let j = 0; j < this.width(); j++) {
                const pos = new Position(j, i);
                newGrid.setCellAt(pos, f(this.getCellAt(pos)));
            }
        }
        return newGrid;
    }
}
export const Color = {
    Red: "Red",
    Black: "Black",

    enemyColor: (color) => {
        if (color === Red) {
            return Black;
        }
        if (color === Black) {
            return Red;
        }
    }
};