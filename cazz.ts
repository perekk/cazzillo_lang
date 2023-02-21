enum TokenType {
    LITERAL,
    PLUS,
    MINUS,
    PRINT,
    NOT,
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
    NUMBER,
    STRING
}

type Location = { row: number, col: number, filename: string }

type Token = {
    type: TokenType;
    valueType?: ValueType;
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
    generateAsm: (ast: ASTElement) => Assembly
    generateChildPreludeAsm?: (childIndex: number) => Assembly
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
        generateAsm: (ast) => {
            if (ast.childs[0].token.valueType === ValueType.NUMBER) {
                return [
                    "JSR POP16",
                    "JSR PRINT_INT"
                ];
            } else if (ast.childs[0].token.valueType === ValueType.STRING) {
                return [
                    "JSR PRINT_STRING",
                    "LDA #13",
                    "JSR $FFD2",
                ];
            } else {
                Deno.exit(1);
            }
        }
    });
    voc.set(TokenType.PLUS, {
        txt: "+",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 80,
        generateAsm: (ast) => [
            "JSR ADD16"
        ]
    });
    voc.set(TokenType.MINUS, {
        txt: "-",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 80,
        generateAsm: (ast) => [
            "JSR SUB16"
        ]
    });
    voc.set(TokenType.NOT, {
        txt: "!",
        arity: 1,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        generateAsm: (ast) => [
            "LDX SP16",
            "LDA STACKBASE + 1,X",
            "EOR #$FF",
            "STA STACKBASE + 1,X",
            "LDA STACKBASE + 2,X",
            "EOR #$FF",
            "STA STACKBASE + 2,X"
        ]
    });
    voc.set(TokenType.LT, {
        txt: "<",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 70,
        generateAsm: (ast) => [
            "LDX SP16",
            "LDA STACKBASE + 4,X",
            "CMP STACKBASE + 2,X",
            "BCC less@",
            "BNE greaterorequal@",
            "LDA STACKBASE + 3,X",
            "CMP STACKBASE + 1,X",
            "BCC less@",

            "greaterorequal@:",
            "LDA #00",
            "JMP store@",

            "less@:",
            "LDA #01",

            "store@:",
            "INX",
            "INX",
            "STA STACKBASE + 1,X",
            "LDA #00",
            "STA STACKBASE + 2",
            "STX SP16",
        ]
    });
    voc.set(TokenType.EQ, {
        txt: "=",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 70,
        generateAsm: (ast) => [
            "LDX SP16",
            "LDA STACKBASE + 4,X",
            "CMP STACKBASE + 2,X",
            "BNE notequal@",
            "LDA STACKBASE + 3,X",
            "CMP STACKBASE + 1,X",
            "BNE notequal@",
            "LDA #01",
            "JMP store@",

            "notequal@:",
            "LDA #00",

            "store@:",
            "INX",
            "INX",
            "STA STACKBASE + 1,X",
            "LDA #00",
            "STA STACKBASE + 2",
            "STX SP16",
        ]
    });
    voc.set(TokenType.GT, {
        txt: ">",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 70,
        generateAsm: (ast) => [
            "LDX SP16",
            "LDA STACKBASE + 2,X",
            "CMP STACKBASE + 4,X",
            "BCC greater@",
            "BNE lessorequal@",
            "LDA STACKBASE + 1,X",
            "CMP STACKBASE + 3,X",
            "BCC greater@:",

            "lessorequal@:",
            "LDA #00",
            "JMP result@",

            "greater@:",
            "LDA #01",

            "result@:",
            "INX",
            "INX",
            "STA STACKBASE + 1,X",
            "LDA #00",
            "STA STACKBASE + 2",
            "STX SP16",
        ]
    });
    voc.set(TokenType.IF, {
        txt: "if",
        arity: 2,
        position: InstructionPosition.PREFIX,
        priority: 10,
        generateChildPreludeAsm: (n) => {
            // prelude for the true branch
            if (n === 1) return [
                "LDX SP16",
                "LDA STACKBASE + 1,X",
                "BNE trueblock@",
                "LDA STACKBASE + 2,X",
                "BNE trueblock@",
                "JMP endblock@ ; if all zero",
                "trueblock@:",
            ];
            return [];
        },
        generateAsm: (ast) => [
            "LDX SP16",
            "INX",
            "INX",
            "STX SP16",
            "endblock@:"
        ],
    });
    voc.set(TokenType.EITHER, {
        txt: "either",
        arity: 3,
        position: InstructionPosition.PREFIX,
        priority: 10,
        generateChildPreludeAsm: (n) => {
            // no prelude for condition
            if (n === 0) return [];

            // prelude for true branch
            if (n === 1) return [
                "LDX SP16",
                "LDA STACKBASE + 1,X",
                "BNE trueblock@",
                "LDA STACKBASE + 2,X",
                "BNE trueblock@",
                "JMP elseblock@ ; if all zero",
                "trueblock@:"
            ]
            // prelude for else branch
            return [
                "JMP endblock@",
                "elseblock@:"
            ];
        },
        generateAsm: (ast) => [
            "endblock@:",
            "LDX SP16",
            "INX",
            "INX",
            "STX SP16",
            "endblock@:"
        ],
    });
    voc.set(TokenType.OPEN_BRACKETS, {
        txt: "[",
        arity: 0,
        position: InstructionPosition.PREFIX,
        priority: 150,
        generateAsm: (ast) => []
    });
    voc.set(TokenType.CLOSE_BRACKETS, {
        txt: "]",
        arity: 0,
        position: InstructionPosition.POSTFIX,
        priority: 150,
        generateAsm: (ast) => []
    });
    voc.set(TokenType.BLOCK, {
        txt: "",
        arity: 0,
        position: InstructionPosition.PREFIX,
        priority: 150,
        generateAsm: (ast) => []
    });

    return voc;
}

function logError(loc: Location, msg: string) {
    console.error(loc.filename + ":" + loc.row + ":" + loc.col + " ERROR: " + msg);
}

function identifyToken(vocabulary: Vocabulary, txt: string): { type: TokenType, literalType: ValueType | undefined } | undefined {
    for (const [tokenType, instr] of vocabulary) {
        if (txt === instr.txt) return { type: tokenType, literalType: undefined };
    }
    if (txt.match(/^-?\d+$/)) return { type: TokenType.LITERAL, literalType: ValueType.NUMBER };
    if (txt[0] === '"' && txt[txt.length - 1] === '"') return { type: TokenType.LITERAL, literalType: ValueType.STRING };

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
    let stringStart = -1;

    const isSpace = (x: string) => " \t\n\r".includes(x);
    const pushToken = (tokenText: string) => {
        const loc = { row, col: colStart, filename };
        const tokenType = identifyToken(vocabulary, tokenText);
        if (tokenType === undefined) {
            logError(loc, `unknown token '${tokenText}'`);
            Deno.exit(1);
        }
        if (tokenType.type === TokenType.LITERAL && tokenType.literalType === ValueType.STRING) {
            tokenText = tokenText.substring(1, tokenText.length - 1);
        }
        ret.push({ type: tokenType.type, txt: tokenText, loc, valueType: tokenType.literalType });
    };

    while (index < text.length) {
        const char = text[index];

        if (isSpace(char)) {
            if (tokenStart > -1) {
                // space but was parsing a word
                pushToken(text.substring(tokenStart, index));
                tokenStart = -1;
                colStart = -1;
            }
        } else {
            // not space, start parsing a word
            if (char === "/" && index + 1 < text.length && text[index + 1] === "/") {
                while (index < text.length && text[index] !== "\n") index++;
            } else if (char === "[") {
                const loc = { row, col, filename };
                ret.push({ type: TokenType.OPEN_BRACKETS, txt: "[", loc, });
            } else if (char === "]") {
                if (tokenStart > -1) {
                    // space but was parsing a word
                    pushToken(text.substring(tokenStart, index));
                    tokenStart = -1;
                    colStart = -1;
                }
                const loc = { row, col, filename };
                ret.push({ type: TokenType.CLOSE_BRACKETS, txt: "]", loc, });
            } else if (char === '"') {
                // starting a string
                colStart = col;
                stringStart = index;
                index++;
                while (index < text.length && text[index] !== '"') index++;
                index++;
                pushToken(text.substring(stringStart, index));

            } else {
                if (tokenStart === -1) {
                    colStart = col;
                    tokenStart = index;
                }
            }
        }


        index++;
        col++;
        if (char === "\n") {
            col = 1;
            row++;
        }
    }
    if (tokenStart > -1) pushToken(text.substring(tokenStart));

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
                instruction: token.type === TokenType.LITERAL ? undefined : vocabulary.get(token.type),
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
        for (let j = ast.length - 1; j >= 0; j--) {
            const element = ast[j];
            if (!element.instruction || element.instruction.arity === 0) continue;
            if (element.token.type === TokenType.LITERAL) continue;
            if (element.token.type === TokenType.OPEN_BRACKETS || element.token.type === TokenType.CLOSE_BRACKETS) {
                logError(element.token.loc, `found open or closed brackets in parse, this should not happen`);
                Deno.exit(1);
            }
            if (element.instruction.priority !== priority) continue;

            const instrPos = element.instruction.position;
            const startPos = instrPos === InstructionPosition.PREFIX ? j : (instrPos === InstructionPosition.INFIX ? j - 1 : j - element.instruction.arity);
            const childs = ast.splice(startPos, element.instruction.arity + 1);
            const functionElement = childs[j - startPos];
            if (childs.length !== element.instruction.arity + 1) {
                logError(functionElement.token.loc, `the function ${functionElement.instruction.txt} expexts ${functionElement.instruction.arity} parameters, ${childs.length - 1} got!`);
                Deno.exit(1);
            }
            const childsOfTheFunction = childs
                .filter((value, index) => index !== j - startPos)
                .map(element => { return { ...element, parent: functionElement } });
            const toInsert = { ...functionElement, childs: childsOfTheFunction };
            ast.splice(startPos, 0, toInsert);
            j = startPos;

        }
    }

    return ast;
}

let labelIndex = 0;
let stringTable: string[] = [];

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
            if (ast.instruction.generateChildPreludeAsm) {
                ret = ret.concat(ast.instruction.generateChildPreludeAsm(i));
            }
            ret = ret.concat(compile(ast.childs[i]))
        }

        // lets' compile for real
        if (ast.token.type === TokenType.LITERAL) {
            if (ast.token.valueType === ValueType.NUMBER) {
                ret.push(`; ${ast.token.loc.row}:${ast.token.loc.col} VAL ${ast.token.txt}`);
                const MSB = (parseInt(ast.token.txt) >> 8) & 255;
                ret.push(`LDA #${MSB}`);
                ret.push(`STA STACKACCESS+1`);
                const LSB = parseInt(ast.token.txt) & 255;
                ret.push(`LDA #${LSB}`);
                ret.push(`STA STACKACCESS`);
                ret.push(`JSR PUSH16`);
            } else {
                ret.push(`; ${ast.token.loc.row}:${ast.token.loc.col} VAL ${ast.token.txt}`);
                // push lenght 
                // todo: ora la lunghezza massima della stringa è 255 caratteri, aumentarla ?
                const stringToPush = ast.token.txt;
                if (stringToPush.length > 255) {
                    logError(ast.token.loc, "strings must be less than 256 chars");
                    Deno.exit(1);
                }

                ret.push(`LDA #0`);
                ret.push(`STA STACKACCESS+1`);
                ret.push(`LDA #${ast.token.txt.length}`);
                ret.push(`STA STACKACCESS`);
                ret.push(`JSR PUSH16`);

                // push address
                const labelIndex = stringTable.length;
                stringTable.push(ast.token.txt);
                ret.push(`LDA #>str${labelIndex}`);
                ret.push(`STA STACKACCESS+1`);
                ret.push(`LDA #<str${labelIndex}`);
                ret.push(`STA STACKACCESS`);
                ret.push(`JSR PUSH16`);
            }
        } else {
            ret.push(`; ${ast.token.loc.row}:${ast.token.loc.col} ${ast.token.txt}`);
            ret = ret.concat(ast.instruction.generateAsm(ast));
        }

        // LABEL NUMBERING, EACH @ found in instructions is changed to labelIndex        
        for (let i = 0; i < ret.length; i++) {
            ret[i] = ret[i].replace("@", String(labelIndex));
        }
        labelIndex++;
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
    const lib = [
        "RTS",
        "BCD DS 3 ; USED IN BIN TO BCD",
        "SP16 = $7D",
        "STACKACCESS = $0080",
        "STACKBASE = $0000",

        "PRINT_STRING:",

        "JSR POP16",
        "LDX SP16",
        "LDA STACKBASE + 1,X; LEN",
        "INX",
        "INX",
        "STX SP16",
        "TAX; IN X WE HAVE THE LEN",

        "LDY #0",
        "LOOP_PRINT_STRING:",
        "LDA (STACKACCESS),Y",
        "JSR $FFD2",
        "INY",
        "DEX",
        "BNE LOOP_PRINT_STRING",
        "RTS",

        "; stack.a65 from https://github.com/dourish/mitemon/blob/master/stack.a65",
        "INITSTACK:",
        "LDX #$FF",
        "STX SP16",
        "RTS",

        "PUSH16:",
        "LDX SP16",
        "LDA STACKACCESS + 1",
        "STA STACKBASE,X",
        "DEX",
        "LDA STACKACCESS",
        "STA STACKBASE,X",
        "DEX",
        "STX SP16",
        "RTS",

        "POP16:",
        "LDX SP16",
        "LDA STACKBASE + 1,X",
        "STA STACKACCESS",
        "INX",
        "LDA STACKBASE + 1,X",
        "STA STACKACCESS + 1",
        "INX",
        "STX SP16",
        "RTS",

        "DUP16:",
        "LDX SP16",
        "LDA STACKBASE + 2,X",
        "STA STACKBASE,X",
        "DEX",
        "LDA STACKBASE + 2,X",
        "STA STACKBASE,X",
        "DEX",
        "STX SP16",
        "RTS",

        "SWAP16:",
        "LDX SP16",
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
        "STX SP16",
        "RTS",

        "ADD16:",
        "LDX SP16",
        "CLC",
        "LDA STACKBASE + 1,X;",
        "ADC STACKBASE + 3,X",
        "STA STACKBASE + 3,X",
        "LDA STACKBASE + 2,X",
        "ADC STACKBASE + 4,X",
        "STA STACKBASE + 4,X",
        "INX",
        "INX",
        "STX SP16",
        "RTS",

        "SUB16:",
        "LDX SP16",
        "SEC",
        "LDA STACKBASE + 3,X",
        "SBC STACKBASE + 1,X",
        "STA STACKBASE + 3,X",
        "LDA STACKBASE + 4,X",
        "SBC STACKBASE + 2,X",
        "STA STACKBASE + 4,X",
        "INX",
        "INX",
        "STX SP16",
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
    const strings = stringTable.map((str, index) => {
        const bytes: string[] = [];
        for (let i = 0; i < str.length; i++) {
            bytes.push(String(str[i].charCodeAt(0) & 255));
        }
        const strBytes = bytes.join(",");
        return `str${index}: BYTE ${strBytes}`;
    });

    return lib.concat(strings);
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

const filename = "string.cazz";
const basename = filename.substring(0, filename.lastIndexOf('.')) || filename;

console.log("start");
const vocabulary = createVocabulary();
const program = await tokenizer(filename, vocabulary);
dumpProgram(program);

const ast = parseWithBrackets(vocabulary, program);

const asm = asmHeader().concat(compile(ast)).concat(asmFooter());
addIndent(asm);
await Deno.writeTextFile(basename + ".asm", asm.join("\n"));

// dumpAst(ast);
// Deno.exit(1);

const dasm = Deno.run({ cmd: ["dasm", basename + ".asm", "-o" + basename + ".prg"] });
const dasmStatus = await dasm.status();
if (dasmStatus.success === false) {
    console.log("ERROR: dasm returned an error " + dasmStatus.code);
    Deno.exit(1);
}

const emu = Deno.run({ cmd: ["x64sc", "-silent", basename + ".prg"] });
const emuStatus = await emu.status();


console.log("Done");


