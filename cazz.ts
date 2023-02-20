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
    OPEN_BRACKETS,
    CLOSE_BRACKETS,
    IF,
    EITHER,
    BLOCK,
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
    priority: number | undefined;
    generateAsm: () => Assembly
    generateBlockPreludeAsm?: (childIndex: number) => Assembly
};

type Vocabulary = Map<TokenType, Instruction>;

type AST = ASTElement[];

type ASTElement = {
    token: Token;
    instruction: Instruction;
    parent: ASTElement | undefined;
    childs: AST;
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
            "LDA STACKBASE + 1,X",
            "EOR $FF",
            "STA STACKBASE + 1,X",
            "LDA STACKBASE + 2,X",
            "EOR $FF",
            "STA STACKBASE + 2,X"
        ]
    });
    voc.set(TokenType.LT, {
        txt: "<",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 70,
        // + 4 HI first
        // + 3 LO
        // + 2 HI second
        // + 1 LO
        // first < second
        generateAsm: () => [
            "LDA STACKBASE + 4,X",
            "CMP STACKBASE + 2,X",
            "BCC @1",
            "BNE @2",
            "LDA STACKBASE + 3,X",
            "CMP STACKBASE + 1,X",
            "BCC @1",
            "@2: LDA #00",
            "JMP @3",
            "@1: LDA #01",
            "@3: INX",
            "INX",
            "STA STACKBASE + 1,X",
            "LDA #00",
            "STA STACKBASE + 2",
        ]
    });
    voc.set(TokenType.EQ, {
        txt: "=",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 70,
        generateAsm: () => [
            "LDA STACKBASE + 4,X",
            "CMP STACKBASE + 2,X",
            "BNE @1",
            "LDA STACKBASE + 3,X",
            "CMP STACKBASE + 1,X",
            "BNE @1",
            "LDA #01",
            "JMP @2",
            "@1: LDA #00",
            "@2: INX",
            "INX",
            "STA STACKBASE + 1,X",
            "LDA #00",
            "STA STACKBASE + 2"
        ]
    });
    voc.set(TokenType.GT, {
        txt: ">",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 70,
        generateAsm: () => [
            "LDA STACKBASE + 2,X",
            "CMP STACKBASE + 4,X",
            "BCC @1",
            "BNE @2",
            "LDA STACKBASE + 1,X",
            "CMP STACKBASE + 3,X",
            "BCC @1",
            "@2: LDA #00",
            "JMP @3",
            "@1: LDA #01",
            "@3: INX",
            "INX",
            "STA STACKBASE + 1,X",
            "LDA #00",
            "STA STACKBASE + 2",

        ]
    });
    voc.set(TokenType.IF, {
        txt: "if",
        arity: 2,
        position: InstructionPosition.PREFIX,
        priority: 10,
        generateBlockPreludeAsm: () => [
            "LDA STACKBASE + 1,X",
            "BNE NONZERO",
            "LDA STACKBASE + 2,X",
            "BNE NONZERO",
            "JMP endblock ; if all zero",
            "NONZERO:"
        ],
        generateAsm: () => [
            "endblock:"
        ],
    });
    voc.set(TokenType.EITHER, {
        txt: "either",
        arity: 3,
        position: InstructionPosition.PREFIX,
        priority: 15,
        generateBlockPreludeAsm: (n) => n === 1 ? [
            "LDA STACKBASE + 1,X",
            "BNE trueblock",
            "LDA STACKBASE + 2,X",
            "BNE trueblock",
            "JMP elseblock ; if all zero",
            "trueblock:"
        ] : n === 2 ? [
            "JMP endblock",
            "elseblock:"
        ] : [],
        generateAsm: () => [
            "endblock:"
        ],
    });
    voc.set(TokenType.OPEN_BRACKETS, {
        txt: "[",
        arity: 0,
        position: InstructionPosition.PREFIX,
        priority: 150,
        generateAsm: () => [
            "; TODO: ["
        ]
    });

    voc.set(TokenType.CLOSE_BRACKETS, {
        txt: "]",
        arity: 0,
        position: InstructionPosition.POSTFIX,
        priority: 150,
        generateAsm: () => [
            "; TODO: ]"
        ]
    });

    voc.set(TokenType.BLOCK, {
        txt: "",
        arity: 0,
        position: InstructionPosition.PREFIX,
        priority: 150,
        generateAsm: () => [
            "; TODO"
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
                } else if (char === "[") {
                    const loc = { row, col, filename };
                    ret.push({ type: TokenType.OPEN_BRACKETS, txt: "[", loc, });
                } else if (char === "]") {
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
                    const loc = { row, col, filename };
                    ret.push({ type: TokenType.CLOSE_BRACKETS, txt: "]", loc, });
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

function parseWithBrackets(vocabulary: Vocabulary, program: Listing): AST {

    const ast: AST = [];
    const stack = [];
    for (let j = 0; j < program.length; j++) {
        const token = program[j];
        if (token.type === TokenType.OPEN_BRACKETS) {
            stack.push(ast.length);
        } else if (token.type === TokenType.CLOSE_BRACKETS) {
            const matchingIndex = stack.pop();
            if (matchingIndex === undefined) {
                logError(token.loc, "close brackets not bilanced");
                Deno.exit(1);
            }
            const matchingToken = ast[matchingIndex];
            const sequence = ast.splice(matchingIndex, j - matchingIndex + 1);
            //console.log(`sequence from ${matchingIndex} to ${j}`, sequence);

            const block: ASTElement = {
                token: { type: TokenType.BLOCK, loc: matchingToken.token.loc, txt: "[...]" },
                instruction: vocabulary.get(TokenType.BLOCK)!,
                childs: [],
                parent: undefined
            };
            block.childs = parse(sequence).map(element => { return { ...element, parent: block } });

            ast.push(block);

        } else {
            ast.push({
                token,
                instruction: token.type === TokenType.VALUE ? undefined : vocabulary.get(token.type),
                childs: [],
                parent: undefined
            } as ASTElement);
        }
    }
    if (stack.length !== 0) {
        const token = program[stack.pop()!];
        logError(token.loc, "open brackets not bilanced");
        Deno.exit(1);
    }
    return parse(ast);
}

function parse(ast: AST): AST {

    const priorityList = [...new Set(ast
        .filter(element => element.instruction !== undefined && element.instruction.priority !== undefined)
        .map(element => element.instruction.priority)
        .sort((a, b) => (b ?? 0) - (a ?? 0))
    )];

    for (let i = 0; i < priorityList.length; i++) {
        const priority = priorityList[i];
        for (let j = 0; j < ast.length; j++) {
            const element = ast[j];
            if (!element.instruction || element.instruction.arity === 0) continue;
            if (element.token.type === TokenType.VALUE ||
                element.token.type === TokenType.OPEN_BRACKETS ||
                element.token.type === TokenType.CLOSE_BRACKETS) continue;

            if (element.instruction.priority === priority) {
                const instrPos = element.instruction.position;
                const startPos = instrPos === InstructionPosition.PREFIX ? j : (instrPos === InstructionPosition.INFIX ? j - 1 : j - element.instruction.arity);
                const childs = ast.splice(startPos, element.instruction.arity + 1);
                const functionElement = childs[j - startPos];
                if (childs.length !== element.instruction.arity + 1) {
                    logError(functionElement.token.loc, `the function ${functionElement.instruction.txt} expexts ${functionElement.instruction.arity} parameters, ${childs.length - 1} got!`);
                    Deno.exit(1);
                }
                const childOfTheFunction = childs
                    .filter((value, index) => index !== j - startPos)
                    .map(element => { return { ...element, parent: functionElement } });
                const toInsert = { ...functionElement, childs: childOfTheFunction };
                ast.splice(startPos, 0, toInsert);
                j = startPos;
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
            if (ast.instruction.generateBlockPreludeAsm) {
                ret = ret.concat(ast.instruction.generateBlockPreludeAsm(i));
            }
            ret = ret.concat(compile(ast.childs[i]))
        }

        // lets' compile for real
        if (ast.token.type === TokenType.VALUE) {
            ret.push(`; ${ast.token.loc.row}:${ast.token.loc.col} VAL ${ast.token.txt}`);
            const MSB = (parseInt(ast.token.txt) >> 8) & 255;
            ret.push(`LDA #${MSB}`);
            ret.push(`STA STACKACCESS+1`);
            const LSB = parseInt(ast.token.txt) & 255;
            ret.push(`LDA #${LSB}`);
            ret.push(`STA STACKACCESS`);
            ret.push(`JSR PUSH16`);        
        } else {
            ret.push(`; ${ast.token.loc.row}:${ast.token.loc.col} ${ast.token.txt}`);
            ret = ret.concat(ast.instruction.generateAsm());
        }

        // LABEL NUMBERING
        let maxLabel = 0;
        for (let i = 0; i < ret.length; i++) {
            const pos = ret[i].search(/@\d/);
            if (pos > -1) {
                const val = parseInt(ret[i][pos + 1], 10);
                if (val > maxLabel) maxLabel = val;
                const newLabelIndex = labelIndex + val;
                ret[i] = ret[i].substr(0, pos) + "L" + newLabelIndex + ret[i].substr(pos + 2);
            }
        }
        labelIndex = labelIndex + maxLabel;

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
        "; stack.a65 from https://github.com/dourish/mitemon/blob/master/stack.a65",
        "STACKACCESS = $0080",
        "STACKBASE = $0000",

        "INITSTACK:",
        "LDX #$FF",
        "RTS",

        "PUSH16:",
        "LDA STACKACCESS + 1",
        "STA STACKBASE,X",
        "DEX",
        "LDA STACKACCESS",
        "STA STACKBASE,X",
        "DEX",
        "RTS",

        "POP16:",
        "LDA STACKBASE + 1,X",
        "STA STACKACCESS",
        "INX",
        "LDA STACKBASE + 1,X",
        "STA STACKACCESS + 1",
        "INX",
        "RTS",

        "DUP16:",
        "LDA STACKBASE + 2,X",
        "STA STACKBASE,X",
        "DEX",
        "LDA STACKBASE + 2,X",
        "STA STACKBASE,X",
        "DEX",
        "RTS",

        "SWAP16:",
        "LDA STACKBASE + 2,X",
        "STA STACKBASE,X",
        "DEX",
        "LDA STACKBASE + 2,X",
        "STA STACKBASE,X",
        "DEX",
        "LDA STACKBASE + 5,X",
        "STA STACKBASE + 3,X",
        "LDA STACKBASE + 6,X",
        "STA STACKBASE + 4,X",
        "LDA STACKBASE + 1,X",
        "STA STACKBASE + 5,X",
        "LDA STACKBASE + 2,X",
        "STA STACKBASE + 6,X",
        "INX",
        "INX",
        "RTS",

        "ADD16:",
        "CLC",
        "LDA STACKBASE + 1,X;",
        "ADC STACKBASE + 3,X",
        "STA STACKBASE + 3,X",
        "LDA STACKBASE + 2,X",
        "ADC STACKBASE + 4,X",
        "STA STACKBASE + 4,X",
        "INX",
        "INX",
        "RTS",

        "SUB16:",
        "SEC",
        "LDA STACKBASE + 3,X",
        "SBC STACKBASE + 1,X",
        "STA STACKBASE + 3,X",
        "LDA STACKBASE + 4,X",
        "SBC STACKBASE + 2,X",
        "STA STACKBASE + 4,X",
        "INX",
        "INX",
        "RTS",

        "BINBCD16: SED",
        "LDA #0",
        "STA BCD + 0",
        "STA BCD + 1",
        "STA BCD + 2",
        "LDX #16",
        "CNVBIT: ASL STACKACCESS + 0",
        "ROL STACKACCESS + 1",
        "LDA BCD + 0",
        "ADC BCD + 0",
        "STA BCD + 0",
        "LDA BCD + 1",
        "ADC BCD + 1",
        "STA BCD + 1",
        "LDA BCD + 2",
        "ADC BCD + 2",
        "STA BCD + 2",
        "DEX",
        "BNE CNVBIT",
        "CLD",
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
        const token = program[i];
        //logError(token.loc, `istr: ${token.type}, ${token.txt}`)
        console.log(token);
    }
}

function dumpAst(ast: AST, prefix = "") {
    ast.forEach(element => {
        //console.log(prefix, element.token, );
        console.log(prefix, element.token.txt + "(" + element.childs.length + ") parent: " + element.parent?.token.txt);
        dumpAst(element.childs, prefix + "  ");
    });
}

const filename = "if.cazz";
const basename = filename.substring(0, filename.lastIndexOf('.')) || filename;

const vocabulary = createVocabulary();
const program = await tokenizer(filename, vocabulary);
const ast = parseWithBrackets(vocabulary, program);

const asm = asmHeader().concat(compile(ast)).concat(asmFooter());
addIndent(asm);
await Deno.writeTextFile(basename + ".asm", asm.join("\n"));
//dumpAst(ast);
//Deno.exit(1);

const dasm = Deno.run({ cmd: ["dasm", basename + ".asm", "-o" + basename + ".prg"] });
const dasmStatus = await dasm.status();
if (dasmStatus.success === false) {
    console.log("ERROR: dasm returned an error " + dasmStatus.code);
    Deno.exit(1);
}

const emu = Deno.run({ cmd: ["x64sc", "-silent", basename + ".prg"] });
const emuStatus = await emu.status();


console.log("Done");


