import { Instruction, SenseInstr, TurnInstr, MarkInstr, MoveInstr, PickUpInstr, UnmarkInstr, DropInstr, FlipInstr } from './instr.js';

/**
 * Assembles a bug program from a string of code
 * @class
 */
export default class Assembler {

    /**
     * This function assembles a bug program from a string of code
     * @param {String} inputFile - The input file to assemble 
     * @returns {Instruction[]} - An array of instructions
     */
    assemble(inputFile) {
        const labelsMap = this.buildLabelsMap(inputFile);
        const instructions = this.translateInstructions(inputFile, labelsMap);
        return instructions;
    }

    /**
     * This function builds a map of labels to their addresses
     * @param {String} inputFile - The input file to translate
     * @returns {Map} - A map of labels to their addresses
     */
    buildLabelsMap(inputFile) {
        const labelsMap = new Map();
        let position = 0;

        inputFile.split('\n').forEach((line) => {
            // Remove comments
            const commentIndex = line.indexOf(';');
            if (commentIndex !== -1) {
                line = line.substring(0, commentIndex);
            }
            line = line.trim();
            if (line === '') {
                return;
            }
            // Add label to map
            if (line.includes(':')) {
                const label = line.substring(0, line.indexOf(':'));
                labelsMap.set(label, position);
            }
            position++;
        });

        return labelsMap;
    }

    /**
     * This function translates a string of code into an array of instructions
     * @param {String} inputFile - The input file to translate
     * @param {Map} labelsMap - A map of labels to their addresses
     * @returns {Instruction[]} - An array of instructions
     */
    translateInstructions(inputFile, labelsMap) {
        const instructions = [];

        inputFile.split('\n').forEach((line) => {
            // Remove comments
            const commentIndex = line.indexOf(';');
            if (commentIndex !== -1) {
                line = line.substring(0, commentIndex);
            }
            line = line.trim();
            if (line === '') {
                return;
            }

            // Parse instruction
            const parts = line.split(' ');
            const op = parts[0];
            let args = parts.slice(1);

            // Replace labels with addresses
            for (let i = 0; i < args.length; i++) {
                const arg = args[i];
                if (labelsMap.has(arg)) {
                    args[i] = labelsMap.get(arg);
                }
            };

            // Translate instruction to machine code
            switch (op) {
                case 'sense':
                    console.log("sense");
                    instructions.push(new SenseInstr(args[0], args[1], args[2], args[3]));
                    break;
                case 'turn':
                    if (args.length === 1) {
                        instructions.push(new TurnInstr(args[0]));
                    } else if (args.length === 2) {
                        instructions.push(new TurnInstr(args[0], args[1]));
                    }
                    break;
                case 'mark':
                    instructions.push(new MarkInstr(args[0], args[1]));
                    break;
                case 'move':
                    instructions.push(new MoveInstr(args[0], args[1]));
                    break;
                case 'pickup':
                    instructions.push(new PickUpInstr(args[0], args[1]));
                    break;
                case 'unmark':
                    instructions.push(new UnmarkInstr(args[0], args[1]));
                    break;
                case 'drop':
                    instructions.push(new DropInstr(args[0]));
                    break;
                case 'flip':
                    instructions.push(new FlipInstr(args[0], args[1], args[2]));
                    break;
                default:
                    if (op.includes(':')) {
                        const recursiveInstructions = this.assemble(line.substring(line.indexOf(':') + 1));
                        instructions.push(recursiveInstructions[0]);
                    } else {
                        throw Error('There is no such instruction');
                        return null;
                    }
            }
        });

        return instructions;
    }
}

export { Assembler};