
export const CellDirection = {
    Here: "here",
    LeftAhead: "leftahead",
    RightAhead: "rightahead",
    Ahead: "ahead"
}

export const TurnDirection = {
    Left: -1,
    Right: 1
}

export const BugCondition = {
    Friend: "friend",
    Foe: "foe",
    FriendWithFood: "friendwithfood",
    FoeWithFood: "foewithfood",
    Food: "food",
    Rock: "rock",
    Marker: "marker",
    FoeMarker: "foemarker",
    Home: "home",
    FoeHome: "foehome"
}

export class Instruction {
    toString() { throw Error("Not implemented"); }
}

export class SenseInstr extends Instruction {
    #dir;
    #cond;
    #condTrue;
    #condFalse;

    constructor(dir, cond, condTrue, condFalse) {
        super();
        this.#dir = dir;
        this.#cond = cond;
        this.#condTrue = condTrue;
        this.#condFalse = condFalse;
    }

    getDir() {
        return this.#dir;
    }

    getCond() {
        return this.#cond;
    }

    getCondTrue() {
        return this.#condTrue;
    }

    getCondFalse() {
        return this.#condFalse;
    }

    toString() {
        return `${this.constructor.name} ${this.#dir} ${this.#cond} ${this.#condTrue} ${this.#condFalse}`;
    }
}

export class MarkInstr extends Instruction {
    #markerNumber;
    #next;

    constructor(markerNumber, next) {
        super();
        this.#markerNumber = markerNumber;
        this.#next = next;
    }

    getMarkerNumber() {
        return this.#markerNumber;
    }

    getNext() {
        return this.#next;
    }

    toString() {
        return `${this.constructor.name} ${this.#markerNumber} ${this.#next}`;
    }
}

export class UnmarkInstr extends Instruction {
    #markerNumber;
    #next;

    constructor(markerNumber, next) {
        super();
        this.#markerNumber = markerNumber;
        this.#next = next;
    }
    getMarkerNumber() {
        return this.#markerNumber;
    }

    getNext() {
        return this.#next;
    }

    toString() {
        return `${this.constructor.name} ${this.#markerNumber} ${this.#next}`;
    }
}

export class PickUpInstr extends Instruction {
    #condTrue;
    #condFalse;

    constructor(condTrue, condFalse) {
        super();
        this.#condTrue = condTrue;
        this.#condFalse = condFalse;
    }
    getCondTrue() {
        return this.#condTrue;
    }

    getCondFalse() {
        return this.#condFalse;
    }

    toString() {
        return `${this.constructor.name} ${this.#condTrue} ${this.#condFalse}`;
    }
}

export class DropInstr extends Instruction {
    #next;

    constructor(next) {
        super();
        this.#next = next;
    }
    getNext() {
        return this.#next;
    }

    toString() {
        return `${this.constructor.name} ${this.#next}`;
    }
}

export class TurnInstr extends Instruction {
    #dir;

    #next;

    constructor(dir, next) {
        super();
        this.#dir = dir;
        this.#next = next;
    }
    getDirection() {
        return this.#dir;
    }

    getNext() {
        return this.#next;
    }

    toString() {
        return `${this.constructor.name} ${this.#dir} ${this.#next}`;
    }

}

export class MoveInstr extends Instruction {
    #condTrue;
    #condFalse;

    constructor(condTrue, condFalse) {
        super();
        this.#condTrue = condTrue;
        this.#condFalse = condFalse;
    }
    getCondTrue() {
        return this.#condTrue;
    }

    getCondFalse() {
        return this.#condFalse;
    }

    toString() {
        return `${this.constructor.name} ${this.#condTrue} ${this.#condFalse}`;
    }
}

export class FlipInstr extends Instruction {
    #maxRand;
    #condTrue;
    #condFalse;

    constructor(maxRand, condTrue, condFalse) {
        super();
        this.#maxRand = maxRand;
        this.#condTrue = condTrue;
        this.#condFalse = condFalse;
    }
    getMaxRand() {
        return this.#maxRand;
    }

    getCondTrue() {
        return this.#condTrue;
    }

    getCondFalse() {
        return this.#condFalse;
    }

    toString() {
        return `${this.constructor.name} ${this.#maxRand} ${this.#condTrue} ${this.#condFalse}`;
    }
}

export class DirectionInstr extends Instruction {
    #dir;
    #condTrue;
    #condFalse;

    constructor(dir, condTrue, condFalse) {
        super();
        this.#dir = dir;
        this.#condTrue = condTrue;
        this.#condFalse = condFalse;
    }

    getDir() {
        return this.#dir;
    }

    getCondTrue() {
        return this.#condTrue;
    }

    getCondFalse() {
        return this.#condFalse;
    }

    toString() {
        return `${this.constructor.name} ${this.#dir} ${this.#condTrue} ${this.#condFalse}`;
    }
}

export class GotoInstr extends Instruction {
    #next;

    constructor(next) {
        super();
        this.#next = next;
    }

    getNext() {
        return this.#next;
    }

    toString() {
        return `${this.constructor.name} ${this.#next}`
    }
}

/*
    help function for output instruction in good view
 */
function printInstructions(instructions) {
    // let result = "";
    // const outputElement = document.getElementById('output');
    // for (let i = 0; i < instructions.length; i++) {
    //     result += `${instructions[i].toString()} ; [${i.toString()}]<br>`;
    // }
    // outputElement.innerHTML = result;
    console.log(instructions);
}
export{printInstructions}
