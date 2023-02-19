enum TokenType {
    VALUE,
    PLUS,
    MINUS,
    PRINT,
    FACT,
    LT,
    EQ,
    GT,    
    TOKEN_COUNT,
}

enum ValueType {
    NUMBER
}

type Location = { row: number, col: number, filename: string }

type Token = {
    type: TokenType;
    txt: string;
    loc: Location
};

enum InstructionPosition {
    PREFIX,
    INFIX,
    POSTFIX,
}

type Instruction = {
    txt: string;
    arity: number;
    position: InstructionPosition;
    priority: number;
    generateAsm: () => Assembly
};

type Vocabulary = Map<TokenType, Instruction>;

type AST = ASTElement[];

type ASTElement = {
    token: Token;
    instruction: Instruction
    childs: ASTElement[];
};

type Listing = Array<Token>;

type Assembly = Array<string>;

function createVocabulary(): Vocabulary {
    const voc: Vocabulary = new Map<TokenType, Instruction>();
    voc.set(TokenType.PRINT, {
        txt: "print",
        arity: 1,
        position: InstructionPosition.PREFIX,
        priority: 10,
        generateAsm: () => [
            "JSR POP16",
            "JSR PRINT_INT"
        ]
    });
    voc.set(TokenType.PLUS, {
        txt: "+",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 80,
        generateAsm: () => [
            "JSR ADD16"
        ]
    });
    voc.set(TokenType.MINUS, {
        txt: "-",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 80,
        generateAsm: () => [
            "JSR SUB16"
        ]
    });

    voc.set(TokenType.FACT, {
        txt: "!",
        arity: 1,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        generateAsm: () => [
            "LDA stackbase + 1,X",
            "EOR $FF",
            "STA stackbase + 1,X",
            "LDA stackbase + 2,X",
            "EOR $FF",
            "STA stackbase + 2,X"
        ]
    });
    voc.set(TokenType.LT, {
        txt: "<",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 110,
        // + 4 HI first
        // + 3 LO
        // + 2 HI second
        // + 1 LO
        // first < second
        generateAsm: () => [
            "LDA stackbase + 4,X",
            "CMP stackbase + 2,X",
            "BCC @1; jump isLower",
            "BNE @2; jump isHigher",
            "LDA stackbase + 3,X",
            "CMP stackbase + 1,X",
            "BCC @1; jump isLower",
            "@2: LDA #00",
            "JMP @3; store",
            "@1: LDA #01",
            "@3: INX",
            "INX",
            "STA stackbase + 1,X",
            "LDA #00",
            "STA stackbase + 2",
        ]
    });
    voc.set(TokenType.EQ, {
        txt: "=",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 110,
        generateAsm: () => [
            "LDA stackbase + 4,X",
            "CMP stackbase + 2,X",
            "BNE @1; jump different",
            "LDA stackbase + 3,X",
            "CMP stackbase + 1,X",
            "BNE @1; jump different",
            "LDA #01",
            "JMP @2; store",
            "@1: LDA #00",
            "@2: INX",
            "INX",
            "STA stackbase + 1,X",
            "LDA #00",
            "STA stackbase + 2"
        ]
    });
    voc.set(TokenType.GT, {
        txt: ">",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 110,
        generateAsm: () => [
            "LDA stackbase + 2,X",
            "CMP stackbase + 4,X",
            "BCC @1; jump isLower",
            "BNE @2; jump isHigher",
            "LDA stackbase + 1,X",
            "CMP stackbase + 3,X",
            "BCC @1; jump isLower",
            "@2: LDA #00",
            "JMP @3; store",
            "@1: LDA #01",
            "@3: INX",
            "INX",
            "STA stackbase + 1,X",
            "LDA #00",
            "STA stackbase + 2",

        ]
    });

    return voc;
}

function logError(loc: Location, msg: string) {
    console.error(loc.filename + ":" + loc.row + ":" + loc.col + " ERROR: " + msg);
}

function identifyToken(vocabulary: Vocabulary, txt: string): TokenType | undefined {
    for (const [tokenType, instr] of vocabulary) {
        if (txt === instr.txt) return tokenType;
    }
    if (txt.match(/^-?\d+$/)) return TokenType.VALUE;
    return undefined;
}

async function tokenizer(filename: string, vocabulary: Vocabulary): Promise<Listing> {

    const text = await Deno.readTextFile(filename);
    let index = 0;
    let tokenStart = -1;
    let colStart = -1;
    const ret: Listing = [];
    let row = 1;
    let col = 1;
    let ignore = false;

    const isSpace = (x: string) => " \t\n\r".includes(x);

    while (index < text.length) {
        const char = text[index];
        if (!ignore) {
            if (isSpace(char)) {
                if (tokenStart > -1) {
                    // space but was parsing a word
                    const tokenText = text.substring(tokenStart, index);
                    const loc = { row, col: colStart, filename };
                    const type = identifyToken(vocabulary, tokenText);
                    if (type === undefined) {
                        logError(loc, `unknown token '${tokenText}'`);
                        Deno.exit(1);
                    }
                    ret.push({ type, txt: tokenText, loc, });

                    tokenStart = -1;
                    colStart = -1;
                }
            } else {
                // not space, start parsing a word
                if (char === "/" && index + 1 < text.length && text[index + 1] === "/") {
                    ignore = true;
                } else {
                    if (tokenStart === -1) {
                        colStart = col;
                        tokenStart = index;
                    }
                }
            }
        }

        index++;
        col++;
        if (char === "\n") {
            col = 1;
            row++;
            ignore = false;
        }
    }
    if (tokenStart > -1) {
        const tokenText = text.substring(tokenStart);
        const loc = { row, col: colStart, filename };
        const type = identifyToken(vocabulary, tokenText);
        if (type === undefined) {
            logError(loc, `unknown token '${tokenText}'`);
            Deno.exit(1);
        }
        ret.push({ type, txt: tokenText, loc });
    }

    return ret;
}

function parse(vocabulary: Vocabulary, program: Listing): AST {

    let ast = program.map(token => {
        return {
            type: "astElement",
            token,
            instruction: token.type === TokenType.VALUE ? undefined : vocabulary.get(token.type),
            childs: [],
        } as ASTElement;
    });

    const priorityList = [...new Set(ast
        .filter(element => element.instruction !== undefined)
        .map(element => element.instruction.priority)
        .sort((a, b) => b - a)
    )];

    for (let i = 0; i < priorityList.length; i++) {
        const priority = priorityList[i];
        for (let j = 0; j < ast.length; j++) {
            const element = ast[j];
            if (element.instruction?.priority === priority) {
                if (element.instruction.position === InstructionPosition.PREFIX) {
                    const startPos = j;
                    const childs = ast.splice(startPos, element.instruction.arity + 1);
                    if (childs.length !== element.instruction.arity + 1) {
                        logError(childs[0].token.loc, `the function ${childs[0].instruction.txt} expexts ${childs[0].instruction.arity} parameters, ${childs.length - 1} got!`);
                        Deno.exit(1);
                    }
                    const toInsert = {
                        ...childs[0], childs: childs.filter((value, index) => index !== 0)
                    }
                    ast.splice(startPos, 0, toInsert);
                    j = startPos;
                } else if (element.instruction.position === InstructionPosition.INFIX) {
                    const startPos = j - 1;
                    const childs = ast.splice(startPos, element.instruction.arity + 1);
                    if (childs.length !== element.instruction.arity + 1) {
                        logError(childs[1].token.loc, `the function ${childs[1].instruction.txt} expexts ${childs[1].instruction.arity} parameters, ${childs.length - 1} got!`);
                        Deno.exit(1);
                    }
                    const toInsert = {
                        ...childs[1], childs: childs.filter((value, index) => index !== 1)
                    }
                    ast.splice(startPos, 0, toInsert);
                    j = startPos;
                } else if (element.instruction.position === InstructionPosition.POSTFIX) {
                    const startPos = j - element.instruction.arity;
                    const childs = ast.splice(startPos, element.instruction.arity + 1);
                    if (childs.length !== element.instruction.arity + 1) {
                        logError(childs[childs.length - 1].token.loc, `the function ${childs[childs.length - 1].instruction.txt} expexts ${childs[childs.length - 1].instruction.arity} parameters, ${childs.length - 1} got!`);
                        Deno.exit(1);
                    }
                    const toInsert = {
                        ...childs[childs.length - 1], childs: childs.filter((value, index) => index !== childs.length - 1)
                    }
                    ast.splice(startPos, 0, toInsert);
                    j = startPos;
                } else {
                    throw new Error("ERROR: unknown instruction position: " + element.instruction.position);
                    Deno.exit(1);
                }
            }
        }
    }

    return ast;
}

let labelIndex = 0;

function compile(ast: AST | ASTElement): Assembly {
    if (ast instanceof Array) {
        let ret: Assembly = [];
        for (let i = 0; i < ast.length; i++) {
            const asm = compile(ast[i]);
            ret = ret.concat(asm)
        }
        return ret;
    } else {
        let ret: Assembly = [];
        for (let i = 0; i < ast.childs.length; i++) {
            const asm = compile(ast.childs[i]);
            ret = ret.concat(asm)
        }
        // lets' compile for real
        if (ast.token.type === TokenType.VALUE) {
            ret.push(`; value`);
            const MSB = (parseInt(ast.token.txt) >> 8) & 255;
            ret.push(`LDA #${MSB}`);
            ret.push(`STA stackaccess+1`);
            const LSB = parseInt(ast.token.txt) & 255;
            ret.push(`LDA #${LSB}`);
            ret.push(`STA stackaccess`);
            ret.push(`JSR PUSH16`);
        } else {
            const generated = ast.instruction.generateAsm();
            let maxLabel = 0;
            for (let i = 0; i < generated.length; i++) {
                const pos = generated[i].search(/@\d/);
                if (pos > -1) {
                    const val = parseInt(generated[i][pos + 1], 10);
                    if (val > maxLabel) maxLabel = val;
                    const newLabelIndex = labelIndex + val;
                    generated[i] = generated[i].substr(0, pos) + "I_" + newLabelIndex + generated[i].substr(pos + 2);
                }
            }
            labelIndex = labelIndex + maxLabel;
            const instr = [`\t; ${ast.token.loc.row}:${ast.token.loc.col} ${ast.instruction.txt}`].concat(generated);
            ret = ret.concat(instr);
        }
        return ret;
    }
}

function addIndent(code: Assembly) {
    for (let i = 0; i < code.length; i++) {
        const isAssignment = code[i].includes(" = ");
        if (isAssignment) continue;
        const isDeclareSpace = code[i].includes(" DS ");
        if (isDeclareSpace) continue;
        const hasLabel = /^\S+\:/.test(code[i]);
        if (hasLabel) continue;

        code[i] = "\t" + code[i];
    }
}

function asmHeader(): Assembly {
    return [
        "processor 6502 ; TEH BEAST",
        "ORG $0801 ; BASIC STARTS HERE",
        "HEX 0C 08 0A 00 9E 20 32 30 36 34 00 00 00",
        "ORG $0810 ; MY PROGRAM STARTS HERE",
        "JSR INITSTACK"
    ]
}

function asmFooter(): Assembly {
    return [
        "RTS",
        "AUX_REG DS 1 ; USED IN ADD INSTRUCTION",
        "BCD DS 3 ; USED IN BIN TO BCD",
        "stackaccess = $0080",
        "stackbase = $0000",

        "INITSTACK:",
        "ldx #$FF",
        "rts",

        "PUSH16:",
        "lda stackaccess + 1          ; first byte(big end)",
        "sta stackbase,X",
        "dex",
        "lda stackaccess            ; second byte(little end)",
        "sta stackbase,X",
        "dex",
        "rts",

        "POP16:",
        "lda stackbase + 1,X          ; the little end",
        "sta stackaccess",
        "inx",
        "lda stackbase + 1,X          ; retrieve second byte",
        "sta stackaccess + 1",
        "inx",
        "rts",

        "dup16:",
        "lda stackbase + 2,X          ; copy big end byte to next available slot",
        "sta stackbase,X",
        "dex",
        "lda stackbase + 2,X          ; do again for little end",
        "sta stackbase,X",
        "dex",
        "rts",

        "swap16:",
        "; first, do a dup",
        "lda stackbase + 2,X; copy big end byte to next available slot",
        "sta stackbase,X",
        "dex",
        "lda stackbase + 2,X; do again for little end",
        "sta stackbase,X",
        "dex",
        "; stack has now grown by one",
        "; now copy item from slot 3 to slot 2",
        "; low end byte is already in accumulator",
        "lda stackbase + 5,X",
        "sta stackbase + 3,X",
        "lda stackbase + 6,X",
        "sta stackbase + 4,X",
        "; now copy top-of-stack item into slot 3",
        "lda stackbase + 1,X",
        "sta stackbase + 5,X",
        "lda stackbase + 2,X",
        "sta stackbase + 6,X",
        "; discard temporary value on the top of the stack",
        "inx",
        "inx",
        "rts",

        ";; Add the two 16 - byte words on the top of the stack, leaving",
        ";; the result on the stack in their place.",
        "ADD16:",
        "clc; clear carry",
        "lda stackbase + 1,X; add the lower byte",
        "adc stackbase + 3,X",
        "sta stackbase + 3,X; put it back in the second slot",
        "lda stackbase + 2,X; then the upper byte",
        "adc stackbase + 4,X",
        "sta stackbase + 4,X; again, back in the second slot",
        "inx; shink the stack so that sum is now",
        "inx; in the top slot",
        "rts",

        ";; Subtract the two 16 - byte words on the top of the stack, leaving",
        ";; the result on the stack in their place.",
        "SUB16:",
        "sec; set the carry",
        "lda stackbase + 3,X; substract the lower byte",
        "sbc stackbase + 1,X",
        "sta stackbase + 3,X; put it back in the second slot",
        "lda stackbase + 4,X; then the upper byte",
        "sbc stackbase + 2,X",
        "sta stackbase + 4,X; again, back in the second slot",
        "inx; shink the stack so that result is now",
        "inx; in the top slot",
        "rts",

        "BINBCD16: SED ; Switch to decimal mode",
        "LDA #0 ; Ensure the result is clear",
        "STA BCD + 0",
        "STA BCD + 1",
        "STA BCD + 2",
        "LDX #16 ; The number of source bits",
        "CNVBIT: ASL stackaccess + 0 ; Shift out one bit",
        "ROL stackaccess + 1",
        "LDA BCD + 0 ; And add into result",
        "ADC BCD + 0",
        "STA BCD + 0",
        "LDA BCD + 1 ; propagating any carry",
        "ADC BCD + 1",
        "STA BCD + 1",
        "LDA BCD + 2 ; ...thru whole result",
        "ADC BCD + 2",
        "STA BCD + 2",
        "DEX ; And repeat for next bit",
        "BNE CNVBIT",
        "CLD; Back to binary",
        "RTS",

        "PRINT_INT:",
        "JSR BINBCD16",
        "LDA BCD+2",
        "TAY",
        "BEQ DIGIT2",
        "AND #$0F",
        "CLC",
        "ADC #$30",
        "JSR $FFD2",

        "DIGIT2:",
        "LDA BCD+1",
        "LSR",
        "LSR",
        "LSR",
        "LSR",
        "BNE PRINT_DIGIT_2",
        "CPY #00",
        "BEQ DIGIT_3",
        "PRINT_DIGIT_2:",
        "TAY",
        "CLC",
        "ADC #$30",
        "JSR $FFD2",

        "DIGIT_3:",
        "LDA BCD+1",
        "AND #$0F",
        "BNE PRINT_DIGIT_3",
        "CPY #00",
        "BEQ DIGIT_4",
        "PRINT_DIGIT_3:",
        "TAY",
        "CLC",
        "ADC #$30",
        "JSR $FFD2",

        "DIGIT_4:",
        "LDA BCD+0",
        "LSR",
        "LSR",
        "LSR",
        "LSR",
        "BNE PRINT_DIGIT_4",
        "CPY #00",
        "BEQ DIGIT_5",
        "PRINT_DIGIT_4:",
        "TAY",
        "CLC",
        "ADC #$30",
        "JSR $FFD2",

        "DIGIT_5:",
        "LDA BCD+0",
        "AND #$0F",
        "CLC",
        "ADC #$30",
        "JSR $FFD2",
        "LDA #13",
        "JSR $FFD2",
        "RTS",
    ]
}


function dumpProgram(program: Listing) {
    console.log(`-------------------`);
    for (let i = 0; i < program.length; i++) {
        console.log(`istr: ${program[i].type}, ${program[i].txt}`);
    }
}

function dumpAst(ast: AST, prefix = "") {
    ast.forEach(element => {
        console.log(prefix, element.token);
        dumpAst(element.childs, prefix + "  ");
    });
}

const filename = "compare.cazz";
const basename = filename.substring(0, filename.lastIndexOf('.')) || filename;

const vocabulary = createVocabulary();
const program = await tokenizer(filename, vocabulary);
const ast = parse(vocabulary, program);
dumpAst(ast);
const asm = asmHeader().concat(compile(ast)).concat(asmFooter());
addIndent(asm);
await Deno.writeTextFile(basename + ".asm", asm.join("\n"));
const dasm = Deno.run({ cmd: ["dasm", basename + ".asm", "-o" + basename + ".prg"] });
const dasmStatus = await dasm.status();
if (dasmStatus.success === false) {
    console.log("ERROR: dasm returned an error " + dasmStatus.code);
    Deno.exit(1);
}

const emu = Deno.run({ cmd: ["x64sc", "-silent", basename + ".prg"] });
const emuStatus = await emu.status();


console.log("Done");


