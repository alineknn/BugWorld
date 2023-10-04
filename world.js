import {BugData, Bug, Direction} from "./bug.js"
import { Color, Cell, CellMut} from "./cell.js";
export class WorldError extends Error {
    static Type = {
        Wall: "Wall",
        Nest: "Nest",
        Occupied: "Occupied",
        NoFood: "NoFood",
        TooMuchFood: "TooMuchFood",
        OutOfBounds: "OutOfBounds",
        CellHasNoFood: "CellHasNoFood",
        BugHasNoFood: "BugHasNoFood",
        BugHasFood: "BugHasFood",
    }

    constructor(type) {
        super(type);
        this.type = type;
    }
}
export class World {
    #grid;
    #bugsData = [];

    constructor(grid) {
        this.#grid = grid.map(cell => CellMut.from(cell));
    }

    bug(id) {
        return new Bug(this.#grid, id, this.#bugsData[id]);
    }

    bugIds() {
        let ids = [];
        for (let i = 0; i < this.#bugsData.length; i++) {
            ids.push(i);
        }
        return ids;
    }

    bugs() {
        return this.bugIds().map(id => this.bug(id));
    }

    foodAt(pos) {
        return this.#grid.getCellAt(pos).getFood();
    }

    addBug(color, instructions, position) {
        const bugData = new BugData(color, instructions, position);
        const id = this.#bugsData.length;
        const cell = this.#grid.getCellAt(position);
        cell.putBug(id);
        this.#bugsData.push(bugData);
        return id;
    }

    tickBrains() {
        for (const bug of this.bugs())
            bug.tickBrain();
    }   

}

describe('CellMut', () => {
    describe('from', () => {
        it('should map Cell.Free to CellMut.Free', () => {
            const cell = new Cell.Free();
            const newCell = CellMut.from(cell);
            expect(newCell).toBeInstanceOf(CellMut.Free);
            expect(newCell.getFood()).toBe(0);
        });
        it('should map Cell.Nest to CellMut.Nest', () => {
            const cell = new Cell.Nest(Color.Red);
            const newCell = CellMut.from(cell);
            expect(newCell).toBeInstanceOf(CellMut.Nest);
            expect(newCell.nestFor()).toBe(Color.Red);
        });
        it('should map Cell.Wall to CellMut.Wall', () => {
            const cell = new Cell.Wall();
            const newCell = CellMut.from(cell);
            expect(newCell).toBeInstanceOf(CellMut.Wall);
        });
        it('should map Cell.Food to CellMut.Free', () => {
            const cell = new Cell.Food(3);
            const newCell = CellMut.from(cell);
            expect(newCell).toBeInstanceOf(CellMut.Free);
            expect(newCell.getFood()).toBe(3);
        });
    });

    describe('putBug', () => {
        it('should throw if cell is not Free', () => {
            const cell = new CellMut.Free();
            expect(() => cell.putBug(0)).toThrowError(WorldError, WorldError.Type.Wall);
        });
        it('should throw if bug is already present', () => {
            const cell = new CellMut.Free();
            cell.putBug(0);
            expect(() => cell.putBug(0)).toThrowError(WorldError, WorldError.Type.Occupied);
        });
        it('should not throw if bug is not present', () => {
            const cell = new CellMut.Free();
            expect(() => cell.putBug(0)).not.toThrow();
        });
    });

    describe('clearBug', () => {
        it('should always return null if cell is not Free', () => {
            const cell = new CellMut.Wall();
            expect(cell.clearBug()).toBeNull();
        });
        it('should always return null if bug is not present', () => {
            const cell = new CellMut.Free();
            expect(cell.clearBug()).toBeNull();
        });
        it('should return the bug if the bug was present', () => {
            const cell = new CellMut.Free();
            cell.putBug(0);
            expect(cell.clearBug()).toBe(0);
            expect(cell.clearBug()).toBeNull();
        });
    });

    describe('incrFood', () => {
        it('should throw if cell is not Free', () => {
            const cell = new CellMut.Wall();
            expect(() => cell.incrFood()).toThrowError(WorldError, WorldError.Type.Wall);
        });
        it('should increment food if cell is Free', () => {
            const cell = new CellMut.Free(4);
            cell.incrFood();
            expect(cell.getFood()).toBe(5);
        });
        it('should throw if food is already at max', () => {
            const cell = new CellMut.Free(9);
            expect(() => cell.incrFood()).toThrowError(WorldError, WorldError.Type.TooMuchFood);
        });
    });

    describe('decrFood', () => {
        it('should throw if cell is not Free', () => {
            const cell = new CellMut.Wall();
            expect(() => cell.decrFood()).toThrowError(WorldError, WorldError.Type.Wall);
        });
        it('should decrement food if cell is Free', () => {
            const cell = new CellMut.Free(4);
            cell.decrFood();
            expect(cell.getFood()).toBe(3);
        });
        it('should throw if food is already at min', () => {
            const cell = new CellMut.Free(0);
            expect(() => cell.decrFood()).toThrowError(WorldError, WorldError.Type.NoFood);
        });
    });
});


export class Position {
    x;
    y;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    translateAlong(direction) {
        switch (direction) {
            case Direction.Right:
                return new Position(this.x + 1, this.y);
            case Direction.DownRight:
                return new Position(this.x, this.y + 1);
            case Direction.DownLeft:
                return new Position(this.x - 1, this.y + 1);
            case Direction.Left:
                return new Position(this.x - 1, this.y);
            case Direction.UpLeft:
                return new Position(this.x, this.y - 1);
            case Direction.UpRight:
                return new Position(this.x + 1, this.y - 1);
        }
    }
}




