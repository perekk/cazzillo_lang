enum TokenType {
    VALUE,
    PLUS,
    PRINT,
    FACT,
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
    });
    voc.set(TokenType.PLUS, {
        txt: "+",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 80,
    });
    voc.set(TokenType.FACT, {
        txt: "!",
        arity: 1,
        position: InstructionPosition.POSTFIX,
        priority: 100,
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

    const isSpace = (x: string) => " \t\n\r".includes(x);

    while (index < text.length) {
        const char = text[index];
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
            if (tokenStart === -1) {
                colStart = col;
                tokenStart = index;
            }
        }

        index++;
        col++;
        if (char === "\n") {
            col = 1;
            row++;
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

    console.log("INIZIALE ---------------");
    dumpAst(ast);        
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
        console.log("DOPO ITERAZIONE " + i + " pri: " + priority + " --------------");
        dumpAst(ast);        

    }

    return ast;
}

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
        switch (ast.token.type) {
            case TokenType.VALUE:
                ret.push(`; value`);
                ret.push(`\tLDA #${ast.token.txt}`);
                ret.push(`\tPHA`);
                break;
            case TokenType.PLUS:
                ret.push(`; ADD`);
                ret.push(`\tPLA`);
                ret.push(`\tSTA ADD_AUX`);
                ret.push(`\tPLA`);
                ret.push(`\tADC ADD_AUX`);
                ret.push(`\tPHA`);
                break;
            case TokenType.PRINT:
                ret.push(`; PRINT`);
                ret.push(`\tPLA`);
                ret.push(`\tJSR $FFD2 ; C64 print char on the screen`);
                break;
            case TokenType.FACT:
                ret.push(`; FACT`);
                ret.push(`\tPLA`);
                ret.push(`\tEOR $FF`);
                ret.push(`\tPHA`);
            default:
                logError(ast.token.loc, `Compiler error: Token type ${ast.token.type} not found. this should never happen`);
                Deno.exit(1);
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

const vocabulary = createVocabulary();
const program = await tokenizer("esempio.cazz", vocabulary);
const ast = parse(vocabulary, program);
const asm = asmHeader().concat(compile(ast)).concat(asmFooter());
await Deno.writeTextFile("esempio.asm", asm.join("\n"));
const dasm = Deno.run({ cmd: ["dasm", "esempio.asm", "-oesempio.prg"] });
const dasmStatus = await dasm.status();

const emu = Deno.run({ cmd: ["x64sc", "-silent", "esempio.prg"] });
const emuStatus = await emu.status();


console.log("Done");

//dumpAst(ast);
