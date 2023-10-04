import { TurnDirection } from "./instr.js";
import {SenseInstr} from "./instr.js";
import {MarkInstr} from "./instr.js";
import {UnmarkInstr} from "./instr.js";
import {PickUpInstr} from "./instr.js";
import {DropInstr} from "./instr.js";
import {TurnInstr} from "./instr.js";
import {MoveInstr} from "./instr.js";
import {FlipInstr} from "./instr.js";
import {DirectionInstr} from "./instr.js";
import {printInstructions} from "./instr.js";
import {GotoInstr} from "./instr.js";
import {CellDirection} from "./instr.js";
import {BugCondition} from "./instr.js";

import { Grid } from "./cell.js";
import { Position, WorldError, World} from "./world.js";
import { Cell } from "./cell.js";
import { Color } from "./cell.js";


export class BugData {
    color;
    position;
    instructions;
    // resting = 0; // ??? Not clear how to use it
    instrPointer = 0;
    carriesFood = false;
    direction = Direction.Right;

    constructor(color, instructions, position) {
        this.color = color;
        this.instructions = instructions;
        this.position = position;
    }
}

export class Bug {
    #grid;
    #id;
    #data;

    constructor(grid, id, data) {
        this.#grid = grid;
        this.#id = id;
        this.#data = data;
    }

    id() {
        return this.#id;
    }

    color() {
        return this.#data.color;
    }

    position() {
        return this.#data.position;
    }

    direction() {
        return this.#data.direction;
    }

    carriesFood() {
        return this.#data.carriesFood;
    }

    turn(turnDirection) {
        this.#data.direction = Direction.turn(this.#data.direction, turnDirection);
    }

    move() {
        const oldPos = this.position();
        const newPos = oldPos.translateAlong(this.#data.direction);
        const oldCell = this.#grid.getCellAt(oldPos);
        const newCell = this.#grid.getCellAt(newPos);

        newCell.putBug(this.#id);
        oldCell.clearBug();
        this.#data.position = newPos;
    }

    pickUpFood() {
        if (this.carriesFood()) {
            throw new WorldError(WorldError.Type.BugHasFood);
        }
        const cell = this.#grid.getCellAt(this.#data.position);
        cell.decrFood();
        this.#data.carriesFood = true;
    }

    dropFood() {
        if (!this.carriesFood()) {
            throw new WorldError(WorldError.Type.BugHasNoFood);
        }
        const cell = this.#grid.getCellAt(this.#data.position);
        cell.incrFood();
        this.#data.carriesFood = false;
    }

    putMarker(marker) {
        const cell = this.#grid.getCellAt(this.#data.position);
        cell.putMarker(this.#data.color, marker);
    }

    clearMarker(marker) {
        const cell = this.#grid.getCellAt(this.#data.position);
        cell.clearMarker(this.#data.color, marker);
    }

    hasMarker(marker) {
        const cell = this.#grid.getCellAt(this.#data.position);
        return cell.hasMarker(this.#data.color, marker);
    }

    isFullFilled(currentInstr){
        const dir = currentInstr.getDir();
        const cond = currentInstr.getCond();
        const pos = this.position();
        let newPos;

        // not very correct but still
        switch (dir){
            case "here":
                newPos = this.#grid.getCellAt(this.#data.position);
                break;
            case "leftahead":
                newPos = this.#grid.getCellAt(this.#data.position.x + 1, this.#data.position.y );
                break;
            case "righthead":
                newPos = this.#grid.getCellAt(this.#data.position.x - 1, this.#data.position.y );
                break;
            case "ahead":
                newPos = this.#grid.getCellAt(this.#data.position.x + 1, this.#data.position.y + 1);
                break;
        }



        switch (cond){
            case "friend":
                return !newPos.hasEnemyMarker(pos.color());
            case "foe":
                return newPos.hasEnemyMarker(pos.color());
            case "friendwithfood":
                return !newPos.hasEnemyMarker(pos.color()) && newPos.carriesFood();
            case "foewithfood":
                return newPos.hasEnemyMarker(pos.color()) && newPos.carriesFood();
            case "food":
                return newPos.getFood() != 0;

            case "rock":
                return newPos.isOccupied;

            case "marker":
                return newPos.hasMarker(this.color());

            case "foemarker":
                return newPos.hasMarker(this.color());

            case  "home":
                return newPos.isHomeNest();

            case "foehome":
                return newPos.isEnemyNest();

        }
    }

    tickBrain() {
        const instructions = this.#data.instructions;
        const instrPointer = this.#data.instrPointer;
        const currentInstr = instructions[instrPointer];

        if (currentInstr instanceof SenseInstr){
            // if (isFullFilled(currentInstr)){
            //     this.#data.instrPointer = currentInstr.getCondTrue();    
            // } else {
            //     this.#data.instrPointer = currentInstr.getCondFalse();
            // }
        } else if (currentInstr instanceof MarkInstr){
            this.putMarker(currentInstr.getMarkerNumber());
            this.#data.instrPointer = currentInstr.getNext();
        } else if (currentInstr instanceof UnmarkInstr){
            this.clearMarker( currentInstr.getMarkerNumber());
            this.#data.instrPointer = currentInstr.getNext();
        } else if (currentInstr instanceof PickUpInstr) {
            try {
                this.pickUpFood();
                this.#data.instrPointer = currentInstr.getCondTrue();
            } catch (WorldError){
                this.#data.instrPointer = currentInstr.getCondFalse();
            }

        } else if (currentInstr instanceof DropInstr) {
            if (this.carriesFood()) {
                this.dropFood();
                this.#data.instrPointer = currentInstr.getNext();
            }
        } else if (currentInstr instanceof TurnInstr) {
            this.turn(currentInstr.getDirection());
            this.#data.instrPointer = currentInstr.getNext();
        } else if (currentInstr instanceof MoveInstr) {
            try {
                this.move();
                this.#data.instrPointer = currentInstr.getCondTrue();
            } catch (WorldError){
                this.#data.instrPointer = currentInstr.getCondFalse();
            }
        } else if (currentInstr instanceof FlipInstr) {
            const p = currentInstr.getMaxRand();
            if (Math.floor(Math.random() * p) === 0) {
                this.#data.instrPointer = currentInstr.getCondTrue();
            } else {
                this.#data.instrPointer = currentInstr.getCondFalse();
            }
        } else if (currentInstr instanceof DirectionInstr) {
                if (this.direction() == currentInstr.getDir()){
                    this.#data.instrPointer = currentInstr.getCondTrue();
                } else {
                    this.#data.instrPointer = currentInstr.getCondFalse();
                a}
        } else {
            throw Error('There is no such instruction');
        }
    }


   
}

export const Direction = {
    Right: 0,
    DownRight: 1,
    DownLeft: 2,
    Left: 3,
    UpLeft: 4,
    UpRight: 5,

    turn: (direction, turnDirection) => {
        return (direction + turnDirection + 6) % 6;
    }
}

describe('Bug', () => {
    let world;
    let bug0;
    let bug1;

    beforeEach(() => {
        /// Example map (+ is red nest, # is wall, 0 is nothing):
        /// 0 + #
        ///  0 0 0
        /// 0 0 0
        const grid = new Grid(3, 3);
        grid.setCellAt(new Position(1, 0), new Cell.Nest(Color.Red));
        grid.setCellAt(new Position(2, 0), new Cell.Wall());
        world = new World(grid);

        /// Bugs are at (+ is red bugs, - is black bugs, 0 is nothing):
        /// 0 + 0
        ///  0 - 0
        /// 0 0 0
        const bugId0 = world.addBug(Color.Red, [], new Position(1, 0));
        const bugId1 = world.addBug(Color.Black, [], new Position(1, 1));
        bug0 = world.bug(bugId0);
        bug1 = world.bug(bugId1);
    });

    describe('turn', () => {
        it('should turn left if told so', () => {
            expect(bug0.direction()).toBe(Direction.Right);
            expect(() => bug0.turn(TurnDirection.Left)).not.toThrow();
            expect(bug0.direction()).toBe(Direction.UpRight);
        });
        it('should turn right if told so', () => {
            expect(bug0.direction()).toBe(Direction.Right);
            expect(() => bug0.turn(TurnDirection.Right)).not.toThrow();
            expect(bug0.direction()).toBe(Direction.DownRight);
        });
    });
 
    describe('move', () => {
        it('should throw if the bug is trying to move into a wall', () => {
            expect(bug0.position()).toEqual(new Position(1, 0));
            expect(() => bug0.move()).toThrowError(WorldError, WorldError.Type.Wall);
            expect(bug0.position()).toEqual(new Position(1, 0));
        });
        it('should throw if the bug is trying to move into an occupied cell', () => {
            bug0.turn(TurnDirection.Right);
            expect(bug0.position()).toEqual(new Position(1, 0));
            expect(bug0.direction()).toBe(Direction.DownRight);
            expect(() => bug0.move()).toThrowError(WorldError, WorldError.Type.Occupied);
            expect(bug0.position()).toEqual(new Position(1, 0));
            expect(bug0.direction()).toBe(Direction.DownRight);
        });
        it('should succeed if the bug is trying to move into a free cell', () => {
            bug0.turn(TurnDirection.Right);
            bug0.turn(TurnDirection.Right);
            expect(bug0.direction()).toBe(Direction.DownLeft);
            bug0.move();
            expect(bug0.position()).toEqual(new Position(0, 1));
            expect(bug0.direction()).toBe(Direction.DownLeft);
        });
    });
});

