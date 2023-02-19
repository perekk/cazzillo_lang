enum TokenType {
    VALUE,
    PLUS,
    PRINT,
    FACT,
    LESS,
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
            "PLA",
            "JSR $FFD2 ; C64 print char on the screen"
        ]
    });
    voc.set(TokenType.PLUS, {
        txt: "+",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 80,
        generateAsm: () => [
            "PLA",
            "STA ADD_AUX",
            "PLA",
            "CLC",
            "ADC ADD_AUX",
            "PHA"
        ]
    });
    voc.set(TokenType.FACT, {
        txt: "!",
        arity: 1,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        generateAsm: () => [
            "PLA",
            "EOR $FF",
            "PHA"
        ]
    });
    voc.set(TokenType.LESS, {
        txt: "<",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 110,
        generateAsm: () => [
            "PLA",
            "STA ADD_AUX ; second operand",
            "PLA ; first operand",
            "CMP ADD_AUX",
            "BCC @1; salta se < ",
            "LDA #0",
            "JMP @2",
            "@1: LDA #1",
            "@2: PHA"
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
            ret.push(`\t; value`);
            ret.push(`\tLDA #${ast.token.txt}`);
            ret.push(`\tPHA`);
        } else {
            const generated = ast.instruction.generateAsm();
            let maxLabel = 0;
            for (let i = 0; i < generated.length; i++) {
                const hasLabel = /^\S+\:/.test(generated[i]);
                if (!hasLabel) generated[i] = "\t" + generated[i];

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

function asmHeader(): Assembly {
    return [
        "\tprocessor 6502 ; TEH BEAST",
        "\tORG $0801 ; BASIC STARTS HERE",
        "\tHEX 0C 08 0A 00 9E 20 32 30 36 34 00 00 00",
        "\tORG $0810 ; MY PROGRAM STARTS HERE",

    ]
}

function asmFooter(): Assembly {
    return [
        "\tRTS",
        "ADD_AUX DS 1 ; USED IN ADD INSTRUCTION"
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

const filename = "comparison.cazz";
const basename = filename.substring(0, filename.lastIndexOf('.')) || filename;

const vocabulary = createVocabulary();
const program = await tokenizer(filename, vocabulary);
const ast = parse(vocabulary, program);
dumpAst(ast);
const asm = asmHeader().concat(compile(ast)).concat(asmFooter());
await Deno.writeTextFile(basename + ".asm", asm.join("\n"));
const dasm = Deno.run({ cmd: ["dasm", basename + ".asm", "-o" + basename + ".prg"] });
const dasmStatus = await dasm.status();

const emu = Deno.run({ cmd: ["x64sc", "-silent", basename + ".prg"] });
const emuStatus = await emu.status();


console.log("Done");


