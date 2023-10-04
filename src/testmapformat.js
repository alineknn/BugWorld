/**
 * Check whether the world map file is correctly formatted and valid
 *
 * @param {string} worldFile - The file to check
 * @returns {boolean} - true if the file is correct, false otherwise
 */
export default function testFormat(worldFile) {

    /** Splits the file into lines in order to check dimensions */
    const fileRows = worldFile.split("\n");

    /** checks whether the first two rows are numbers */
    if (isNaN(fileRows[0]) || isNaN(fileRows[1])) {
        console.log("The first two rows of the world file must be numbers");
        return false;
    }

    /** checks whether the field corresponds to the indicated dimensions */
    const numRows = parseInt(fileRows[0]);
    const numCols = parseInt(fileRows[1]);

    if (fileRows.length !== 2 + numCols) {
        console.log("The number of rows in the world file is incorrect");
        return false;
    }

    for (let i = 2; i < numCols + 2; i++) {
        /** check if the number of characters in each row is equal to the number of columns*/
        if (fileRows[i].length !== numRows) {
            console.log("The number of characters in line " + (i + 1) + " is incorrect, expected: " + numCols + " found: " + fileRows[i].length);
            return false;
        }
    }

    /** check outer borders */
    if (!validateOuterBorders(fileRows, numRows, numCols)) {
        return false;
    }

    /** check if values are in legal scope */
    if (!validateCharacters(fileRows, numRows, numCols)) {
        return false;
    }

    /** check if the swarms are linked and if two are present*/
    if (!validateSwarms(fileRows, numRows, numCols)) {
        return false;
    }

    return true;
}

/**
 * Checks if the swarms are linked
 * 
 * @param {Array[String]} worldLines - The lines of the world file
 * @param {number} numRows - The number of rows in the world
 * @param {number} numCols - The number of columns in the world
 * @returns {boolean} - True if the swarms are linked, false otherwise
 */
export function validateSwarms(worldLines, numRows, numCols) {

    let nest1Exists = false;
    let nest2Exists = false;
    const nestP = new Set();
    const nestM = new Set();

    for (let i = 2; i < numCols + 2; i++) {
        for (let j = 0; j < numRows; j++) {
            /**
             * The character at position j in line i
             */
            const nestChar = worldLines[i].charAt(j);

            /** Check if the nests are linked */
            if (nestChar == "+") {
                if (nest1Exists && !nestP.has(j + "," + i)) {
                    console.log("Nest " + nestChar + " not linked");
                    return false;
                } else if (!nest1Exists) {
                    nestP.add(j + "," + i);
                    nest1Exists = true;
                    findNest(worldLines, nestP, j, i, "+");
                }
            } else if (nestChar == "-") {
                if (nest2Exists && !nestM.has(j + "," + i)) {
                    console.log("Nest " + nestChar + " not linked");
                    return false;
                } else if (!nest2Exists) {
                    nestM.add(j + "," + i);
                    nest2Exists = true;
                    findNest(worldLines, nestM, j, i, "-");
                }
            }
        }
    }
    if (!nest1Exists || !nest2Exists) {
        console.log("The world file is missing a/the nest/s");
        return false;
    }
    return true;
}

/**
     * Finds all adjacent cells that are part of the nest and adds them to a set
     * 
     * @param {Array[String]} lines - The lines of the file
     * @param {Set} nestSet - The set of cells that are part of the nest
     * @param {int} xCoord - The x-coordinate of the cell
     * @param {int} yCoord - The y-coordinate of the cell
     * @param {char} nestChar - The character that represents the nest
     */
export function findNest(lines, nestSet, xCoord, yCoord, nestChar) {

    const adjCells = getAdjacentCells(xCoord, yCoord);
    for (const cell of adjCells) {
        if (nestSet.has(cell)) {
            continue;
        }
        const [x, y] = cell.split(",");
        if (lines[y].charAt(x) == nestChar) {
            nestSet.add(cell);
            findNest(lines, nestSet, parseInt(x), parseInt(y), nestChar);
        }
    }
}



/**
 * Returns a set of all neighbors of a cell
 * Since shape is hexagonal the neighbors are different for even and odd rows
 * shift is used to determine if the row is even or odd and change the neighbors accordingly
 * @param {int} xCoord - the x coordinate of the cell
 * @param {int} yCoord - the y coordinate of the cell
 * @returns {Set} - the set of all adjacent cells to the given cell
 */
export function getAdjacentCells(xCoord, yCoord) {

    let j = 0;
    let shift = j % 2 == 0 ? 1 : -1;
    const neighbors = new Set();
    neighbors.add((xCoord + 1) + "," + yCoord);
    neighbors.add((xCoord - 1) + "," + yCoord);
    neighbors.add(xCoord + "," + (yCoord + 1));
    neighbors.add(xCoord + "," + (yCoord - 1));
    neighbors.add((xCoord + shift) + "," + (yCoord + 1));
    neighbors.add((xCoord + shift) + "," + (yCoord - 1));
    return neighbors;
}

/**
 * Checks if the outer borders of the world are closed
 * @param {Array<String>} lines - the lines of the file
 * @param {number} row_num - the number of rows in the world
 * @param {number} col_num - the number of columns in the world
 * @returns {boolean} - true if the outer borders are closed, false otherwise
 */
export function validateOuterBorders(lines, row_num, col_num) {
    for (let i = 2; i < col_num + 2; i++) {
        for (let j = 0; j < row_num; j++) {
            const borderChar = lines[i].charAt(j);
            if (i == 2 || i == col_num + 1 || j == 0 || j == row_num - 1) {
                if (borderChar !== '#') {
                    console.log(`The border in the world file is not closed at line ${i + 1} and column ${j + 1}`);
                    return false;
                }
            }
        }
    }
    return true;
}

/**
 * Check if the characters in the world file are in the legal scope
 * @param {Array[String]} lines - the lines of the file
 * @param {int} row_num - the number of rows in the world
 * @param {int} col_num - the number of columns in the world
 * @returns {boolean} - true if the characters are in the legal scope, false otherwise
 */
export function validateCharacters(lines, row_num, col_num) {
    const validChars = new Set(["#", ".", "-", "+"]);

    for (let i = 2; i < col_num + 2; i++) {
        for (let j = 0; j < row_num; j++) {
            const char = lines[i].charAt(j);
            if (!validChars.has(char) && isNaN(char)) {
                console.log(`Invalid character "${char}" found at row ${i + 1} and column ${j + 1}`);
                return false;
            }
        }
    }
    
    return true;
}


export { testFormat };

