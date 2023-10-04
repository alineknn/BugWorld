import { Position, World} from "./world.js";
import { Color, Cell, Grid, CellMut} from "./cell.js";
import { checkFiles } from "../src/check_text_file.js";
import { Assembler } from "../src/BugAssembler.js";
import { testFormat } from "../src/testmapformat.js";
import { Instruction } from "./instr.js";


function loadImage(src) {
    return new Promise((resolve, reject) => {
        let img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
    })
}

// TODO: Draw the amount of food in each cell
class GridUI {
    #canvas;
    #ctx;
    #grid;
    #world;

    #padding = 10;
    #cellRadius = 20;
    #freeCellColor = "white";
    #wallColor = "gray";
    #redNestColor = "#FFC0CB";
    #blackNestColor = "#90ee90";
    #cellStrokeColor = "black";
    #bugImgSize = 20;
    #bugImages;

    #xSpacing;
    #ySpacing;
    #shiftHoriz;
    #shiftVert;
    #numCols;
    #numRows;

    constructor(grid, world, canvas, bugImages) {
        this.#canvas = canvas;
        this.#ctx = canvas.getContext("2d");
        this.#padding = 10;
        this.#cellRadius = 20;
        this.#grid = grid;
        this.#world = world;
        this.#bugImages = bugImages;

        this.#xSpacing = this.#cellRadius * Math.sqrt(3);
        this.#ySpacing = this.#cellRadius * 1.5;

        this.#numCols = this.#grid.width();
        this.#numRows = this.#grid.height();

        this.#shiftHoriz = this.#xSpacing / 2;
        this.#shiftVert = this.#cellRadius;
    }
    
    /**
     * This function returns x coordinate of the cell at given position
     * @param {int} row - row of the cell
     * @param {int} col - column of the cell    
     * @returns {int} - x coordinate of the cell  
     */
    #getCellX(row, col) {
        const rowShift = (row % 2) * (this.#xSpacing / 2);
        return col * this.#xSpacing + this.#shiftHoriz + this.#padding + rowShift;
    }

    /**
     * This function returns y coordinate of the cell at given position
     * @param {int} row - row of the cell
     * @param {int} col - column of the cell    
     * @returns {int} - y coordinate of the cell  
     */
    #getCellY(row, _col) {
        return row * this.#ySpacing + this.#shiftVert + this.#padding;
    }

    /**
     * This function renders grid on canvas
     */
    render() {
        const canvasHeight = this.#shiftVert * 2 +
            (this.#numRows - 1) * this.#ySpacing + 2 * this.#padding;
        let canvasWidth = this.#numCols * this.#xSpacing + 2 * this.#padding;
        if (this.#numRows > 1)
            canvasWidth += this.#xSpacing / 2;

        this.#canvas.width = canvasWidth;
        this.#canvas.height = canvasHeight;

        for (let row = 0; row < this.#numRows; row++) {
            for (let col = 0; col < this.#numCols; col++) {
                const x = this.#getCellX(row, col);
                const y = this.#getCellY(row, col);
                this.#drawHexagon(x, y, this.#getColorAt(row, col));
            }
        }

        for (let bug of this.#world.bugs()) {
            let row = bug.position().y;
            let col = bug.position().x;
            const x = this.#getCellX(row, col);
            const y = this.#getCellY(row, col);
            this.#drawBug(x, y, bug.color(), bug.direction());
        }
    }

    /**
     * This function returns color of the cell at given position
     * @param {Int} row - row of the cell
     * @param {int} col - column of the cell    
     * @returns {String} - color of the cell  
     */
    #getColorAt(row, col) {
        const cell = this.#grid.getCellAt(new Position(col, row));
        if (cell instanceof Cell.Wall) {
            return this.#wallColor;
        } else if (cell instanceof Cell.Free) {
            return this.#freeCellColor;
        } else if (cell instanceof Cell.Food) {
            return this.#freeCellColor;
        } else if (cell instanceof Cell.Nest) {
            switch (cell.color) {
                case Color.Red:
                    return this.#redNestColor;
                case Color.Black:
                    return this.#blackNestColor;
            }
        }
    }

      /**
     * This function draws Hexagon at certain coordinates
     * @param {int} x - X coordinate
     * @param {int} y - Y coordinate
     * @param {String} fillColor - color of the hexagon 
     * */
    #drawHexagon(x, y, fillColor) {
        this.#ctx.beginPath();

        const angleStart = Math.PI / 6;
        const angleStep = 2 * Math.PI / 6;

        this.#ctx.moveTo(x + this.#cellRadius * Math.cos(angleStart),
                         y + this.#cellRadius * Math.sin(angleStart));
        for (let i = 1; i <= 6; i++) {
            const angle = i * angleStep + angleStart;
            this.#ctx.lineTo(x + this.#cellRadius * Math.cos(angle),
                             y + this.#cellRadius * Math.sin(angle));
        }
        this.#ctx.closePath();
        this.#ctx.fillStyle = fillColor;
        this.#ctx.fill();
        this.#ctx.strokeStyle = this.#cellStrokeColor;
        this.#ctx.stroke();
    }

    
    /**
     * This function draws bug at certain coordinates
     * @param {int} x - X coordinate
     * @param {int} y - Y coordinate
     * @param {Color} color - color of the bug
     * @param {int} - direction to look at      
     * */
    #drawBug(x, y, color, direction) {
        this.#ctx.translate(x, y);
        const angle = Math.PI / 2 + direction * Math.PI / 3;
        this.#ctx.rotate(angle);
        this.#ctx.drawImage(this.#bugImages[color],
                            -this.#bugImgSize / 2,
                            -this.#bugImgSize / 2,
                            this.#bugImgSize,
                            this.#bugImgSize);
        this.#ctx.rotate(-angle);
        this.#ctx.translate(-x, -y);
    }
}


/**
     * This function creates grid from text file
     * @param {String} text - text to create grid from
     * @param {int} y - Y coordinate
     * @param {Color} color - color of the bug
     * @param {int} - direction to look at    
     * @returns {Grid}  
     */
function loadGridFromText(text) {
    // if (!testFormat(text)) {
    //     alert('Wrong input for the world file');
    //     return;
    //   }
    const lines = text.trim().split('\n');
    const x_size = parseInt(lines[0].trim().split(' ')[0]);
    const y_size = parseInt(lines[1].trim().split(' ')[0]);
    const grid = new Grid(x_size, y_size);
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      const cells = line.split('');
      for (let j = 0; j < cells.length; j++) {
        const character = cells[j];
        console.log(i + "" + j + " " + character );
        if (character === "#") {
          grid.setCellAt(new Position(i-2, j), new Cell.Wall());
        }
        else if (character === "-") {
          grid.setCellAt(new Position(i-2, j), new Cell.Nest(Color.Red));
        }
        else if (character === "+") {
          grid.setCellAt(new Position(i-2, j), new Cell.Nest(Color.Black));
        }
        else if (character === ".") {
          grid.setCellAt(new Position(i-2, j), new Cell.Free());
        }
        else {
          const food = parseInt(character);
          grid.setCellAt(new Position(i-2, j), new Cell.Free(food));
        }
      }
    }
    return grid;
}


/**
     * This function spawns bugs in cells 
     * @param {Grid} grid - grid in which bugs will be spawned
     * @param {World} world - world in which bugs will be added
     * @param {Instruction[]} instrs - intructions for bug
     */

function spawnBugs(grid, world, instrs) {
    for (let x = 0; x < grid.width(); x++) {
        for (let y = 0; y < grid.height(); y++) {
            const pos = new Position(x, y);
            const cell = grid.getCellAt(pos);
            if (cell instanceof Cell.Nest)
                world.addBug(cell.color, instrs[cell.color], pos);
        }
    }
}


console.log(localStorage.getItem('map'));
console.log(localStorage.getItem('bug1'));
console.log(localStorage.getItem('bug2'));
const grid = loadGridFromText(localStorage.getItem('map'));
const assembler = new Assembler();
let bug_assembler1 = localStorage.getItem('bug1');
let bug_assembler2 = localStorage.getItem('bug2');
let instrs = {};
instrs[Color.Black] = [];
// Assemble the bug assembler files provided by the user
if (bug_assembler1) {
    instrs[Color.Red] = assembler.assemble(bug_assembler1);
}
if (bug_assembler2) {
    instrs[Color.Black] = assembler.assemble(bug_assembler2);
}
// Check if the assemble has been done correctly. If not, show error message to the user.
if (bug_assembler1 == null || bug_assembler2 == null) {
  // Show error message to the user
  alert('Wrong input for the Bug Assembler');
}
const world = new World(grid);
spawnBugs(grid, world, instrs);


const redBugFile = "../img/red-ant.svg"
const blackBugFile = "../img/black-ant.svg"

const redBugImage = await loadImage(redBugFile);
const blackBugImage = await loadImage(blackBugFile);

let bugImages = new Map();
bugImages[Color.Red] = redBugImage;
bugImages[Color.Black] = blackBugImage;

const canvas = document.getElementById('board');  
const gridUI = new GridUI(grid, world, canvas, bugImages);
gridUI.render();  



