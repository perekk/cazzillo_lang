enum TokenType {
    LITERAL,
    PLUS,
    MINUS,
    MULT,
    DIV,
    MOD,
    PRINT,
    PRIN,
    EMIT,
    NL,
    NOT,
    LT,
    EQ,
    GT,
    OPEN_BRACKETS,
    OPEN_REF_BRACKETS,
    CLOSE_BRACKETS,
    IF,
    EITHER,    
    BLOCK,
    REF_BLOCK,
    SET_WORD,
    LIT_WORD,
    WORD,
    WHILE,
    POKE,
    PEEK,
    CAST_BYTE,
    CAST_NUMBER,
    NUMBER,
    STRING,
    BYTE,
    BOOL,
    STR_JOIN,
    STR_LEN,
    HEAP,
    TOKEN_COUNT,
}

// todo: change valuetype as an algebraic type with 
// type NewValueType = "number" | "byte" | "string" | "bool" | "void" | { in: NewValueType[], out: NewValueType };

// const t: NewValueType = "number";
// const u: NewValueType = { in: ["number", "byte"], out: "bool" };

// if (typeof u === "string") {
//     console.log(u);
// } else {
//     console.log(u);
// }

enum ValueType {
    NUMBER,
    BYTE,
    STRING,
    BOOL,    
    VOID,
    ADDR,
    VALUETYPESCOUNT
}

const sizeForValueType: { [key in ValueType]: number } = {
    [ValueType.NUMBER]: 2,
    [ValueType.BYTE]: 1,
    [ValueType.STRING]: 4,
    [ValueType.BOOL]: 1,
    [ValueType.VOID]: 0,
    [ValueType.ADDR]: 2,
    [ValueType.VALUETYPESCOUNT]: 0,
}

function humanReadableToken(t: TokenType | undefined): string {
    if (t === undefined) return "undefined";
    console.assert(TokenType.TOKEN_COUNT === 36, "Exaustive token types count");
    switch (t) {
        case TokenType.LITERAL: return "LITERAL";
        case TokenType.PLUS: return "PLUS";
        case TokenType.MINUS: return "MINUS";
        case TokenType.MULT: return "MULT";
        case TokenType.DIV: return "DIV";
        case TokenType.MOD: return "MOD";
        case TokenType.PRINT: return "PRINT";
        case TokenType.PRIN: return "PRIN";
        case TokenType.EMIT: return "EMIT";
        case TokenType.NL: return "NL";
        case TokenType.NOT: return "NOT";
        case TokenType.LT: return "LT";
        case TokenType.EQ: return "EQ";
        case TokenType.GT: return "GT";
        case TokenType.OPEN_BRACKETS: return "OPEN_BRACKETS";
        case TokenType.OPEN_REF_BRACKETS: return "OPEN_REF_BRACKETS";
        case TokenType.CLOSE_BRACKETS: return "CLOSE_BRACKETS";
        case TokenType.IF: return "IF";
        case TokenType.EITHER: return "EITHER";
        case TokenType.BLOCK: return "BLOCK";
        case TokenType.REF_BLOCK: return "REF_BLOCK";
        case TokenType.SET_WORD: return "SET_WORD";
        case TokenType.WORD: return "WORD";
        case TokenType.LIT_WORD: return "LIT_WORD";
        case TokenType.WHILE: return "WHILE";
        case TokenType.POKE: return "POKE";
        case TokenType.PEEK: return "PEEK";
        case TokenType.CAST_BYTE: return "CAST_BYTE";
        case TokenType.CAST_NUMBER: return "CAST_NUMBER";
        case TokenType.NUMBER: return "NUMBER";
        case TokenType.STRING: return "STRING";
        case TokenType.BYTE: return "BYTE";
        case TokenType.BOOL: return "BOOL";
        case TokenType.STR_JOIN: return "STR_JOIN";
        case TokenType.HEAP: return "HEAP";
        case TokenType.STR_LEN: return "STR_LEN";
        default:
            throw new Error(`Token Type ${t} not defined`);
    }

}

function humanReadableType(t: ValueType | undefined): string {
    if (t === undefined) return "undefined";
    console.assert(ValueType.VALUETYPESCOUNT === 6, "Exaustive value types count");
    switch (t) {
        case ValueType.NUMBER: return "number";
        case ValueType.BYTE: return "byte";
        case ValueType.STRING: return "string";
        case ValueType.BOOL: return "boolean";
        case ValueType.ADDR: return "addr";
        case ValueType.VOID: return "void";        
        default:
            throw new Error(`Value Type ${t} not defined`);
    }

}

function humanReadableFunction(token: Token): string {
    if (token.ins === undefined) {
        logError(token.loc, `the input parameters for word '${token.txt}' are undefined`);
        Deno.exit(1);
    }
    const ins = token.ins.map(t => humanReadableType(t)).join(",");
    if (token.out === undefined) {
        logError(token.loc, `the return type of ${token.txt} is undefined`);
        Deno.exit(1);
    }

    const out = humanReadableType(token.out);
    return `(${ins})=>${out}`;
}

type Location = { row: number, col: number, filename: string }

type Token = {
    type: TokenType;    
    txt: string;
    loc: Location;
    internalValueType?: ValueType;
    context?: Context;
    expectedArity?: number,
    expectedArityOut?: number,
    ins?: Array<ValueType>;
    out?: ValueType;
    position?: InstructionPosition;
    priority?: number;
    isUserFunction?: boolean;
    functionIndex?: number;
    childs: Token[];
};

enum InstructionPosition {
    PREFIX,
    INFIX,
    POSTFIX,
}
type VarDefinitionSpec = {
    token: Token,    
    offset: number | undefined,
    isUserFunction: boolean,
    ins: ValueType[],
    out: ValueType,
    internalType: ValueType,
    position?: InstructionPosition,
    priority?: number
}

type Context = {
    element: Token | undefined,
    varsDefinition: Record<string, VarDefinitionSpec>;
    parent: Context | undefined;
}

function getArity(token: Token): number {
    if (token.ins !== undefined) return token.ins.length;
    const expectedArity = vocabulary[token.type]?.expectedArity;
    if (expectedArity !== undefined) return expectedArity;
    logError(token.loc, `cannot determine the expected arity for word '${token.txt}'`);
    Deno.exit(1);
}

function getInputParametersValue(token: Token): ValueType[] {
    if (token.ins === undefined) {
        logError(token.loc, `the input parameters for word '${token.txt}' are undefined`);
        Deno.exit(1);
    }
    return token.ins;
}

function getInstructionPosition(token: Token): InstructionPosition {
    if (token.position === undefined) {
        logError(token.loc, `the position for word '${token.txt}' is undefined`);
        Deno.exit(1);
    }
    return token.position;
}

type Instruction = {    
    txt: string;
    position: InstructionPosition;
    priority: number | undefined;
    userFunction: boolean,
    expectedArity: number,
    expectedArityOut: number,
    functionIndex?: number,
    ins: (ast: Token) => Array<ValueType>;
    out: (ast: Token) => ValueType;
    generateAsm: (ast: Token) => Assembly
    generateChildPreludeAsm?: (ast: Token, childIndex: number) => Assembly
};

type Vocabulary = Record<number, Instruction>;

type AST = Token[];

type Assembly = Array<string>;

function sizeOfContext(context: Context): number {
    let size = 0;
    Object.values(context.varsDefinition).forEach(varDef => {
        size += sizeForValueType[varDef.internalType];
    });
    return size;
}

function getWordDefinition(context: Context | undefined, variableName: string): ({ isGlobalContext: boolean } & VarDefinitionSpec) | undefined {
    if (context === undefined) return undefined;
    const debug = false;    
    const tryDef = context.varsDefinition[variableName];
    if (tryDef !== undefined) {        
        return { isGlobalContext: context.parent === undefined, ...tryDef };
    }
    if (context.parent !== undefined) {
        const actualContextSize = sizeOfContext(context);
        let varDef = getWordDefinition(context.parent, variableName);
        if (varDef !== undefined && varDef.offset !== undefined) {
            varDef = { ...varDef, offset: varDef.offset + actualContextSize };
        }
        return varDef;
    }     
    return undefined;
}

function getInternalType(token: Token): ValueType {

    if (token.type === TokenType.LITERAL) {
        if (token.out === undefined) {
            logError(token.loc, `'${token.txt}' does not have the out type value set`);
            Deno.exit(1);
        }
        return token.out;
    }

    if (token.type === TokenType.WORD) {
        if (token.isUserFunction) return ValueType.ADDR;
        if (token.out === undefined) {
            logError(token.loc, `'${token.txt}' does not have the out type value set`);
            Deno.exit(1);
        }
        return token.out;
    }

    logError(token.loc, `why asking for valuetype of '${token.txt}', it's a ${humanReadableToken(token.type)}`);
    Deno.exit(1);
}

function getAsmForSetWordGlobal(token: Token, varType: ValueType, varName: string): Assembly {

    const asmVarName = "V_" + varName;

    console.assert(ValueType.VALUETYPESCOUNT === 6, "Exaustive value types count");
    switch (varType) {
        case ValueType.BOOL:
            return [
                `JSR POP16`,
                `LDA STACKACCESS`,
                `STA ${asmVarName}`,
            ];
        case ValueType.NUMBER:
            return [
                `JSR POP16`,
                `LDA STACKACCESS`,
                `STA ${asmVarName}`,
                `LDA STACKACCESS + 1`,
                `STA ${asmVarName} + 1`,
            ];
        case ValueType.BYTE:
            return [
                `JSR POP16`,
                `LDA STACKACCESS`,
                `STA ${asmVarName}`,
            ];
        case ValueType.STRING:
            return [
                `JSR POP16`,
                `LDA STACKACCESS`,
                `STA ${asmVarName} + 2`,
                `LDA STACKACCESS + 1`,
                `STA ${asmVarName} + 3`,

                `JSR POP16`,
                `LDA STACKACCESS`,
                `STA ${asmVarName}`,
                `LDA STACKACCESS + 1`,
                `STA ${asmVarName} + 1`,
            ];
        case ValueType.ADDR:
            return [
                `JSR POP16`,
                `LDA STACKACCESS`,
                `STA ${asmVarName}`,
                `LDA STACKACCESS + 1`,
                `STA ${asmVarName} + 1`,
            ];
        default:
            logError(token.loc, `cannot compile asm to retrieve value for '${token.txt}' of '${humanReadableType(varType)}' type`);
            Deno.exit(1);
    }

}

function getAsmForSetWordLocal(token: Token, varType: ValueType, varName: string, offset: number): Assembly {

    const popAndOffsetStack = [
        `JSR POP16`,
        "TSX",
        "TXA",
        "CLC",
        `ADC #${offset + 1}`,
        "TAX"
    ];

    if (varType === ValueType.NUMBER) {
        return popAndOffsetStack.concat([
            "LDA STACKACCESS",
            "STA $0100,X",
            "LDA STACKACCESS + 1",
            "STA $0101,X"
        ]);
    } else if (varType === ValueType.STRING) {
        return popAndOffsetStack.concat([
            "LDA STACKACCESS",
            "STA $0102,X",
            "LDA STACKACCESS + 1",
            "STA $0103,X",
            "TXA",
            "PHA",
            "JSR POP16",
            "PLA",
            "TAX",
            "LDA STACKACCESS",
            "STA $0100,X",
            "LDA STACKACCESS + 1",
            "STA $0101,X",
        ]);
    } else if (varType === ValueType.BYTE) {
        return popAndOffsetStack.concat([
            "LDA STACKACCESS",
            "STA $0100,X",
        ]);
    } else if (varType === ValueType.BOOL) {
        return popAndOffsetStack.concat([
            "LDA STACKACCESS",
            "STA $0100,X",
        ]);
    } else if (varType === ValueType.ADDR) {
        return popAndOffsetStack.concat([
            "LDA STACKACCESS",
            "STA $0100,X",
            "LDA STACKACCESS + 1",
            "STA $0101,X"
        ]);
    }

    logError(token.loc, `'${varName}' set word local is not implemented yet for ${humanReadableType(varType)}`);
    Deno.exit(1);
}

function getAsmForGetWordGlobal(token: Token, varType: ValueType, varName: string, isFunction: boolean): Assembly {

    const asmVarName = "V_" + varName;

    if (isFunction) {
        return [
            `LDA ${asmVarName}`,
            `STA CALL_FUN_@ + 1`,
            `LDA ${asmVarName} + 1`,
            `STA CALL_FUN_@ + 2`,
            "CALL_FUN_@:",
            `JSR $1111 ; will be overwritten`
        ];
    }

    console.assert(ValueType.VALUETYPESCOUNT === 6, "Exaustive value types count");
    switch (varType) {
        case ValueType.BOOL:
            return [
                `LDA ${asmVarName}`,
                `STA STACKACCESS`,
                `LDA #0`,
                `STA STACKACCESS + 1`,
                `JSR PUSH16`
            ];
        case ValueType.NUMBER:
            return [
                `LDA ${asmVarName}`,
                `STA STACKACCESS`,
                `LDA ${asmVarName} + 1`,
                `STA STACKACCESS + 1`,
                `JSR PUSH16`
            ];
        case ValueType.BYTE:
            return [
                `LDA ${asmVarName}`,
                `STA STACKACCESS`,
                `LDA #0`,
                `STA STACKACCESS + 1`,
                `JSR PUSH16`
            ];
        case ValueType.STRING:
            return [
                `LDA ${asmVarName}`,
                `STA STACKACCESS`,
                `LDA ${asmVarName} + 1`,
                `STA STACKACCESS + 1`,
                `JSR PUSH16`,
                `LDA ${asmVarName} + 2`,
                `STA STACKACCESS`,
                `LDA ${asmVarName} + 3`,
                `STA STACKACCESS + 1`,
                `JSR PUSH16`
            ];
        case ValueType.ADDR:
            return [
                `LDA ${asmVarName}`,
                `STA CALL_FUN_@ + 1`,
                `LDA ${asmVarName} + 1`,
                `STA CALL_FUN_@ + 2`,
                "CALL_FUN_@:",
                `JSR $1111 ; will be overwritten`
            ]
        default:
            logError(token.loc, `cannot compile asm to retrieve value for '${token.txt}' of '${humanReadableType(varType)}' type`);
            Deno.exit(1);
    }
}

function getAsmForGetWordLocal(token: Token, varType: ValueType, varName: string, offset: number, isFunction: boolean): Assembly {

    const asmOffset = [
        "TSX",
        "TXA",
        "CLC",
        `ADC #${offset + 1}`,
        "TAX"
    ];
    if (isFunction) {
        return asmOffset.concat([
            "LDA $0100,X",
            `STA CALL_FUN_@ + 1`,
            "LDA $0101,X",
            `STA CALL_FUN_@ + 2`,
            "CALL_FUN_@:",
            `JSR $1111 ; will be overwritten`
        ]);
    }

    if (varType === ValueType.NUMBER) {
        return asmOffset.concat([
            "LDA $0100,X",
            "STA STACKACCESS",
            "LDA $0101,X",
            "STA STACKACCESS + 1",
            "JSR PUSH16"
        ]);
    } else if (varType === ValueType.STRING) {
        return asmOffset.concat([
            "LDA $0100,X",
            "STA STACKACCESS",
            "LDA $0101,X",
            "STA STACKACCESS + 1",
            "TXA",
            "PHA",
            "JSR PUSH16",
            "PLA",
            "TAX",
            "LDA $0102,X",
            "STA STACKACCESS",
            "LDA $0103,X",
            "STA STACKACCESS + 1",
            "JSR PUSH16"
        ]);
    } else if (varType === ValueType.BYTE) {
        return asmOffset.concat([
            "LDA $0100,X",
            "STA STACKACCESS",
            "LDA #0",
            "STA STACKACCESS + 1",
            "JSR PUSH16"
        ]);
    } else if (varType === ValueType.BOOL) {
        return asmOffset.concat([
            "LDA $0100,X",
            "STA STACKACCESS",
            "LDA #0",
            "STA STACKACCESS + 1",
            "JSR PUSH16"
        ]);
    } if (varType === ValueType.ADDR) {
        return asmOffset.concat([
            "LDA $0100,X",
            `STA CALL_FUN_@ + 1`,
            "LDA $0101,X",
            `STA CALL_FUN_@ + 2`,
            "CALL_FUN_@:",
            `JSR $1111 ; will be overwritten`
        ]);
    }

    logError(token.loc, `get word local is not implemented yet for ${humanReadableType(varType)}`);
    Deno.exit(1);
}

function getReturnTypeOfAWord(token: Token): ValueType {
    if (token.out === undefined) {
        logError(token.loc, `the type of word '${token.txt}' is undefined`);
        dumpAst(astProgram);
        Deno.exit(1);
    }
    if (token.type === TokenType.REF_BLOCK) return ValueType.ADDR;
    return token.out;
}

function assertChildNumber(token: Token, num: number) {
    if (token.childs.length !== num) {
        logError(token.loc, `'${token.txt}' is supposed to have ${num} parameters, got ${token.childs.length}`);
        Deno.exit(1);
    }
}

function createVocabulary(): Vocabulary {
    console.assert(TokenType.TOKEN_COUNT === 36, "Exaustive token types count");
    const voc: Vocabulary = {};
    voc[TokenType.PRINT] = {
        txt: "print",        
        expectedArity: 1,
        expectedArityOut: 0,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: (token) => {
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType === undefined) {
                logError(token.loc, `cannot determine the type of '${token.txt}'`);
                Deno.exit(1);
            }
            return [valueType];
        },
        out: () => ValueType.VOID,
        generateAsm: (token) => {
            console.assert(ValueType.VALUETYPESCOUNT === 6, "Exaustive value types count");
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType === ValueType.NUMBER) {
                return [
                    "JSR POP16",
                    "JSR PRINT_INT",
                    "LDA #13",
                    "JSR $FFD2",
                ];
            } else if (valueType === ValueType.BYTE) {
                return [
                    "JSR POP16",
                    "LDA #0",
                    "STA STACKACCESS + 1",
                    "JSR PRINT_INT",
                    "LDA #13",
                    "JSR $FFD2",
                ];
            } else if (valueType === ValueType.STRING) {
                return [
                    "JSR PRINT_STRING",
                    "LDA #13",
                    "JSR $FFD2",
                ];
            } else if (valueType === ValueType.BOOL) {
                return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "BNE print_true@",
                    "LDA STACKACCESS + 1",
                    "BNE print_true@",
                    "LDA #78 ; 'N'",
                    "JMP print_bool@",
                    "print_true@:",
                    "LDA #89 ; 'Y'",
                    "print_bool@:",
                    "JSR $FFD2",
                    "LDA #13",
                    "JSR $FFD2",
                ];
            } else if (valueType === ValueType.ADDR) {
                return [
                    "; print addr ?",
                    "JSR POP16",
                    "JSR PRINT_INT",
                    "LDA #13",
                    "JSR $FFD2",
                ];
            } else {
                logError(token.loc, `print of ${humanReadableType(valueType)} is not supported yet`)
                Deno.exit(1);
            }
        }
    };
    voc[TokenType.PRIN] = {
        txt: "prin",
        expectedArity: 1,
        expectedArityOut: 0,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: token => {
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType === undefined) {
                logError(token.loc, `cannot determine the type of '${token.txt}'`);
                Deno.exit(1);
            }
            return [valueType]
        },
        out: () => ValueType.VOID,        
        generateAsm: token => {
            console.assert(ValueType.VALUETYPESCOUNT === 6, "Exaustive value types count");
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType === ValueType.NUMBER) {
                return [
                    "JSR POP16",
                    "JSR PRINT_INT",
                ];
            } else if (valueType === ValueType.BYTE) {
                return [
                    "JSR POP16",
                    "LDA #0",
                    "STA STACKACCESS + 1",
                    "JSR PRINT_INT",
                ];
            } else if (valueType === ValueType.STRING) {
                return [
                    "JSR PRINT_STRING",
                ];
            } else if (valueType === ValueType.BOOL) {
                return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "BNE print_true@",
                    "LDA STACKACCESS + 1",
                    "BNE print_true@",
                    "LDA #78 ; 'N'",
                    "JMP print_bool@",
                    "print_true@:",
                    "LDA #89 ; 'Y'",
                    "print_bool@:",
                    "JSR $FFD2",
                ];
            } else if (valueType === ValueType.ADDR) {
                return [
                    "JSR POP16",
                    "JSR PRINT_INT",
                ];
            } else {
                logError(token.loc, `print of ${humanReadableType(valueType)} is not supported yet`)
                Deno.exit(1);
            }
        }
    };
    voc[TokenType.EMIT] = {
        txt: "emit",
        expectedArity: 1,
        expectedArityOut: 0,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: () => [ValueType.BYTE],
        out: () => ValueType.VOID,        
        generateAsm: (token) => [
            "JSR POP16",
            "LDA STACKACCESS",
            "JSR $FFD2",
        ],
    };
    voc[TokenType.NL] = {
        txt: "nl",
        expectedArity: 0,
        expectedArityOut: 0,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: (token) => [],
        out: () => ValueType.VOID,
        generateAsm: () => [
            "LDA #13",
            "JSR $FFD2",
        ],
    };
    voc[TokenType.PLUS] = {
        txt: "+",
        expectedArity: 2,
        expectedArityOut: 1,
        position: InstructionPosition.INFIX,
        priority: 80,
        userFunction: false,
        ins: token => {
            console.assert(token.childs.length === 2, "The childs of a plus operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === ValueType.BYTE || type1 === ValueType.NUMBER) && (type2 === ValueType.BYTE || type2 === ValueType.NUMBER)) {
                return [type1, type2]
            }
            return [ValueType.NUMBER, ValueType.NUMBER];
        },
        out: () => ValueType.NUMBER,
        generateAsm: (token) => [
            "JSR ADD16"
        ]
    };
    voc[TokenType.MINUS] = {
        txt: "-",
        expectedArity: 2,
        expectedArityOut: 1,
        position: InstructionPosition.INFIX,
        priority: 80,
        userFunction: false,
        ins: token => {
            console.assert(token.childs.length === 2, "The childs of a minus operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === ValueType.BYTE || type1 === ValueType.NUMBER) && (type2 === ValueType.BYTE || type2 === ValueType.NUMBER)) {
                return [type1, type2]
            }
            return [ValueType.NUMBER, ValueType.NUMBER];
        },
        out: () => ValueType.NUMBER,
        generateAsm: (token) => [
            "JSR SUB16"
        ]
    };
    voc[TokenType.MULT] = {
        txt: "*",
        expectedArity: 2,
        expectedArityOut: 1,
        position: InstructionPosition.INFIX,
        priority: 90,
        userFunction: false,
        ins: token => {
            console.assert(token.childs.length === 2, "The childs of a multiply operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === ValueType.BYTE || type1 === ValueType.NUMBER) && (type2 === ValueType.BYTE || type2 === ValueType.NUMBER)) {
                return [type1, type2]
            }
            return [ValueType.NUMBER, ValueType.NUMBER];
        },
        out: () => ValueType.NUMBER,
        generateAsm: (token) => [
            "JSR MUL16"
        ]
    };
    voc[TokenType.DIV] = {
        txt: "/",
        expectedArity: 2,
        expectedArityOut: 1,
        position: InstructionPosition.INFIX,
        priority: 90,
        userFunction: false,
        ins: token => {
            console.assert(token.childs.length === 2, "The childs of a division operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === ValueType.BYTE || type1 === ValueType.NUMBER) && (type2 === ValueType.BYTE || type2 === ValueType.NUMBER)) {
                return [type1, type2]
            }
            return [ValueType.NUMBER, ValueType.NUMBER];
        },
        out: () => ValueType.NUMBER,
        generateAsm: (token) => [
            "JSR DIV16"
        ]
    };
    voc[TokenType.MOD] = {
        txt: "%",
        expectedArity: 2,
        expectedArityOut: 1,
        position: InstructionPosition.INFIX,
        priority: 90,
        userFunction: false,
        ins: token => {
            console.assert(token.childs.length === 2, "The childs of a plus operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === ValueType.BYTE || type1 === ValueType.NUMBER) && (type2 === ValueType.BYTE || type2 === ValueType.NUMBER)) {
                return [type1, type2]
            }
            return [ValueType.NUMBER, ValueType.NUMBER];
        },
        out: () => ValueType.NUMBER,
        generateAsm: (token) => [
            "JSR MOD16"
        ]
    };
    voc[TokenType.NOT] = {
        txt: "!",
        expectedArity: 1,
        expectedArityOut: 1,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: token => {
            console.assert(token.childs.length === 1, "The childs of a not operand should be 1, compiler error");
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType === ValueType.BYTE || valueType === ValueType.NUMBER || valueType === ValueType.BOOL) return [valueType];
            return [ValueType.NUMBER];
        },
        out: token => {
            console.assert(token.childs.length === 1, "The childs of a not operand should be 1, compiler error");
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType === ValueType.BYTE || valueType === ValueType.NUMBER || valueType === ValueType.BOOL) return valueType;
            return ValueType.NUMBER;
        },
        generateAsm: (token) => {
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType === ValueType.NUMBER) {
                return [
                    "LDX SP16",
                    "LDA STACKBASE + 1,X",
                    "EOR #$FF",
                    "STA STACKBASE + 1,X",
                    "LDA STACKBASE + 2,X",
                    "EOR #$FF",
                    "STA STACKBASE + 2,X",
                    "LDA #2",
                    "STA STACKACCESS",
                    "LDA #0",
                    "STA STACKACCESS + 1",
                    "JSR PUSH16",
                    "JSR ADD16",
                ]
            } else if (valueType === ValueType.BYTE) {
                return [
                    "LDX SP16",
                    "LDA STACKBASE + 1,X",
                    "EOR #$FF",
                    "STA STACKBASE + 1,X",
                    "INC STACKBASE + 1,X",
                    "INC STACKBASE + 1,X"
                ]
            } else if (valueType === ValueType.BOOL) {
                return [
                    "LDX SP16",
                    "LDA STACKBASE + 1,X",
                    "EOR #$FF",
                    "STA STACKBASE + 1,X",
                    "INC STACKBASE + 1,X",
                    "INC STACKBASE + 1,X"
                ]
            } else {
                logError(token.loc, `value type for 'not' is ${humanReadableType(valueType)} compiler error`);
                Deno.exit(1);
            }


        }
    };
    voc[TokenType.LT] = {
        txt: "<",
        expectedArity: 2,
        expectedArityOut: 1,
        position: InstructionPosition.INFIX,
        priority: 70,
        userFunction: false,
        ins: token => {
            console.assert(token.childs.length === 2, "The childs of a less-than operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === ValueType.BYTE || type1 === ValueType.NUMBER) && (type2 === ValueType.BYTE || type2 === ValueType.NUMBER)) {
                return [type1, type2]
            }
            return [ValueType.NUMBER, ValueType.NUMBER];
        },
        out: () => ValueType.BOOL,
        generateAsm: () => [
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
            "STA STACKBASE + 2,X",
            "STX SP16",
        ]
    };
    voc[TokenType.EQ] = {
        txt: "=",
        expectedArity: 2,
        expectedArityOut: 1,
        position: InstructionPosition.INFIX,
        priority: 70,
        userFunction: false,
        ins: token => {
            console.assert(token.childs.length === 2, "The childs of a equal operand should be 2, compiler error");
            assertChildNumber(token, 2);
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === ValueType.BYTE || type1 === ValueType.NUMBER) && (type2 === ValueType.BYTE || type2 === ValueType.NUMBER)) {
                return [type1, type2]
            }
            return [ValueType.NUMBER, ValueType.NUMBER];
        },
        out: () => ValueType.BOOL,
        generateAsm: () => [
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
            "STA STACKBASE + 2,X",
            "STX SP16",
        ]
    };
    voc[TokenType.GT] = {
        txt: ">",
        expectedArity: 2,
        expectedArityOut: 1,
        position: InstructionPosition.INFIX,
        priority: 70,
        userFunction: false,
        ins: token => {
            console.assert(token.childs.length === 2, "The childs of a greater-than operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === ValueType.BYTE || type1 === ValueType.NUMBER) && (type2 === ValueType.BYTE || type2 === ValueType.NUMBER)) {
                return [type1, type2]
            }
            return [ValueType.NUMBER, ValueType.NUMBER];
        },
        out: () => ValueType.BOOL,
        generateAsm: (token) => [
            "LDX SP16",
            "LDA STACKBASE + 2,X",
            "CMP STACKBASE + 4,X",
            "BCC greater@",
            "BNE lessorequal@",
            "LDA STACKBASE + 1,X",
            "CMP STACKBASE + 3,X",
            "BCC greater@",

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
            "STA STACKBASE + 2,X",
            "STX SP16",
        ]
    };
    voc[TokenType.IF] = {
        txt: "if",
        expectedArity: 2,
        expectedArityOut: 0,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: () => [ValueType.BOOL, ValueType.VOID],
        out: () => ValueType.VOID,
        generateChildPreludeAsm: (ast, n) => {
            // prelude for the true branch
            if (n === 1) return [
                "JSR POP16",
                "LDA STACKACCESS",
                "BNE trueblock@",
                "LDA STACKACCESS + 1",
                "BNE trueblock@",
                "JMP endblock@ ; if all zero",
                "trueblock@:",
            ];
            return [];
        },
        generateAsm: (token) => [
            "endblock@:"
        ],
    };
    voc[TokenType.EITHER] = {
        txt: "either",
        expectedArity: 3,
        expectedArityOut: 1,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: token => {            
            console.assert(token.childs.length === 3, "'Either' should have 3 childs");

            const typeThen = getReturnTypeOfAWord(token.childs[1]);
            const typeElse = getReturnTypeOfAWord(token.childs[2]);

            if (typeThen === undefined) {
                logError(token.childs[1].loc, `cannot determine the type of '${token.childs[1].txt}'`);
                Deno.exit(1);
            }
            if (typeElse === undefined) {
                logError(token.childs[2].loc, `cannot determine the type of '${token.childs[2].txt}'`);
                Deno.exit(1);
            }
            if (typeThen !== typeElse) {
                logError(token.childs[1].loc, `the then branch returns '${humanReadableType(typeThen)}'`);
                logError(token.childs[2].loc, `while the 'else' branch returns '${humanReadableType(typeElse)}'`);
                Deno.exit(1);
            }
            return [ValueType.BOOL, typeThen, typeElse];
        },        
        out: token => {
            console.assert(token.childs.length === 3, "'Either' should have 3 childs");
            return getReturnTypeOfAWord(token.childs[1]);
        },
        generateChildPreludeAsm: (ast, n) => {
            // no prelude for condition
            if (n === 0) return [];

            // prelude for true branch
            if (n === 1) return [
                "JSR POP16",
                "LDA STACKACCESS",
                "BNE trueblock@",
                "LDA STACKACCESS + 1",
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
        generateAsm: (token) => [
            "endblock@:",
        ],
    };
    voc[TokenType.OPEN_BRACKETS] = {
        txt: "[",
        expectedArity: 0,
        expectedArityOut: 0,
        position: InstructionPosition.PREFIX,
        priority: 150,
        userFunction: false,
        ins: () => [],
        out: () => ValueType.VOID,
        generateAsm: (token) => []
    };
    voc[TokenType.OPEN_REF_BRACKETS] = {
        txt: ":[",
        expectedArity: 0,
        expectedArityOut: 0,
        position: InstructionPosition.PREFIX,
        priority: 150,
        userFunction: false,
        ins: () => [],
        out: () => ValueType.VOID,
        generateAsm: (token) => []
    };
    voc[TokenType.CLOSE_BRACKETS] = {
        txt: "]",
        expectedArity: 0,
        expectedArityOut: 0,
        position: InstructionPosition.POSTFIX,
        priority: 150,
        userFunction: false,
        ins: () => [],
        out: () => ValueType.VOID,
        generateAsm: (token) => []
    };
    voc[TokenType.BLOCK] = {
        txt: "",
        expectedArity: 0,
        expectedArityOut: 0,
        position: InstructionPosition.PREFIX,
        priority: 150,
        userFunction: false,
        ins: token => {
            const childNumber = token.childs.length;
            if (childNumber === 0) return [];
            //return new Array(childNumber).fill(ValueType.VOID);
            return token.childs.map((child, index) => index === childNumber - 1 ? getReturnTypeOfAWord(child) : ValueType.VOID);
        },
        out: token => {
            if (token.childs.length === 0) return ValueType.VOID;
            const lastChild = token.childs[token.childs.length - 1];
            const valueType = getReturnTypeOfAWord(lastChild);
            if (valueType === undefined) {
                logError(lastChild.loc, `cannot determine the type of '${lastChild.txt}'`);
                Deno.exit(1);
            }
            return valueType;
        },
        generateAsm: token => {
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                Deno.exit(1);
            }
            if (token.context.parent === undefined) return []; // the global context

            let sizeToRelease = sizeOfContext(token.context);
            if (sizeToRelease === 0) return ["; no stack memory to release"];
            return [
                `; release ${sizeToRelease} on the stack`,
                "TSX",
                "TXA",
                "CLC",
                `ADC #${sizeToRelease}`,
                "TAX",
                "TXS"
            ];
        },
        generateChildPreludeAsm: (token, n) => {
            if (n > 0) return [];
            // at the start we make some space on the stack, for variables
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                Deno.exit(1);
            }

            if (token.context.parent === undefined) return []; // the global context

            let sizeToReserve = 0;
            for (const [key, varDef] of Object.entries(token.context.varsDefinition)) {
                varDef.offset = sizeToReserve;
                const valueType = varDef.internalType;
                if (valueType === undefined) {
                    logError(varDef.token.loc, `the internal type of word '${varDef.token.txt}' is undefined, cannot reserve space on stack`);
                    Deno.exit(1);
                }
                if (!(valueType in sizeForValueType)) {
                    logError(varDef.token.loc, `cannot reserve space on the stack for type ${humanReadableType(valueType)} yet`);
                    Deno.exit(1);
                }
                sizeToReserve += sizeForValueType[valueType];
            }

            const strVariables = Object.values(token.context.varsDefinition).map(varDef => varDef.token.txt + " (" + humanReadableType(varDef.out) + " offset " + varDef.offset + ")").join(", ");
            if (sizeToReserve === 0) return ["; no stack memory to reserve"];
            return [
                `; reserve ${sizeToReserve} on the stack for: ${strVariables}`,
                "TSX",
                "TXA",
                "SEC",
                `SBC #${sizeToReserve}`,
                "TAX",
                "TXS"
            ];
        }
    };
    voc[TokenType.REF_BLOCK] = {
        txt: "",
        expectedArity: 0,
        expectedArityOut: 0,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: true,
        ins: getParametersRequestedByBlock,
        out: getReturnValueByBlock,
        generateChildPreludeAsm: (token, n) => {
            if (n > 0) return [];
            // at the start we make some space on the stack, for variables
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                Deno.exit(1);
            }
            if (token.context.parent === undefined) {
                logError(token.loc, `the context of '${token.txt}' is the global context, compiler error`);
                Deno.exit(1);
            }

            let sizeToReserve = 0;
            for (const [key, varDef] of Object.entries(token.context.varsDefinition)) {
                varDef.offset = sizeToReserve;
                const valueType = varDef.internalType;
                if (valueType === undefined) {
                    logError(varDef.token.loc, `the internal type of word '${varDef.token.txt}' is undefined, cannot reserve space on stack`);
                    Deno.exit(1);
                }
                if (!(valueType in sizeForValueType)) {
                    logError(varDef.token.loc, `cannot reserve space on the stack for type ${humanReadableType(valueType)} yet`);
                    Deno.exit(1);
                }
                sizeToReserve += sizeForValueType[valueType];
            }

            const strVariables = Object.values(token.context.varsDefinition).map(varDef => varDef.token.txt + " (" + humanReadableType(varDef.internalType) + " offset " + varDef.offset + ")").join(", ");

            const asmReserveStackSpace = sizeToReserve === 0 ? ["; no stack memory to reserve"] : [
                `; reserve ${sizeToReserve} on the stack for: ${strVariables}`,
                "TSX",
                "TXA",
                "SEC",
                `SBC #${sizeToReserve}`,
                "TAX",
                "TXS"
            ];
            token.functionIndex = getFunctionIndex();
            const asmFunctionName = getFunctionName(token.functionIndex);
            const asmAfterFunctionName = getAfterFunctionName(token.functionIndex);
            return [
                `JMP ${asmAfterFunctionName}`,
                `${asmFunctionName}:`,
            ].concat(asmReserveStackSpace);
        },
        generateAsm: token => {
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                Deno.exit(1);
            }
            if (token.context.parent === undefined) return []; // the global context

            let sizeToRelease = sizeOfContext(token.context);
            const asmReleaseSpace = sizeToRelease === 0 ? ["; no stack memory to release"] : [
                `; release ${sizeToRelease} on the stack`,
                "TSX",
                "TXA",
                "CLC",
                `ADC #${sizeToRelease}`,
                "TAX",
                "TXS"
            ];

            if (token.functionIndex === undefined) {
                logError(token.loc, `'${token.txt}' function index is not defined`);
                Deno.exit(1);
            }
            const asmFunctionName = getFunctionName(token.functionIndex);
            const asmAfterFunctionName = getAfterFunctionName(token.functionIndex);
            return asmReleaseSpace.concat([
                `RTS`,
                `${asmAfterFunctionName}:`,
                `LDA #<${asmFunctionName}`,
                "STA STACKACCESS",
                `LDA #>${asmFunctionName}`,
                "STA STACKACCESS + 1",
                "JSR PUSH16",
            ]);
        },
    };
    voc[TokenType.SET_WORD] = {
        txt: "",
        expectedArity: 1,
        expectedArityOut: 0,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: token => {
            console.assert(token.childs.length === 1, "'set word' should have one child");
            const child = token.childs[0];
            const valueType = getReturnTypeOfAWord(child);
            if (valueType === undefined) {
                logError(child.loc, `cannot determine the type of '${child.txt}'`);
                Deno.exit(1);
            }
            if (valueType === ValueType.VOID) {
                logError(token.loc, `can't store 'void' values in variables`);
                Deno.exit(1);
            }
                const varDef = getWordDefinition(token.context, token.txt);
            if (varDef === undefined) {
                logError(token.loc, `can't find variable definition for '${token.txt}', compiler error`);
                Deno.exit(1);
            }
            return [varDef.out];
        },
        out: () => ValueType.VOID,
        generateAsm: token => {
            const varName = token.txt;
            const varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, `cannot find declaration for '${varName}', compiler error`);
                Deno.exit(1);
            }
            if (varDef.isGlobalContext) return getAsmForSetWordGlobal(token, varDef.internalType, varName);

            if (varDef.offset === undefined) {
                logError(token.loc, `SET_WORD generateAsm can't compute the offset of '${varName}' onto the stack, compiler error`);
                Deno.exit(1);
            }
            return getAsmForSetWordLocal(token, varDef.internalType, varName, varDef.offset);            
        },
    };
    voc[TokenType.LIT_WORD] = {
        txt: "",
        expectedArity: 1,
        expectedArityOut: 0,
        position: InstructionPosition.PREFIX,
        priority: 5,
        userFunction: false,
        ins: token => {
            console.assert(token.childs.length === 1, "'lit word' should have one child");
            const child = token.childs[0];
            const valueType = getReturnTypeOfAWord(child);
            if (valueType === undefined) {
                logError(child.loc, `cannot determine the type of '${child.txt}'`);
                Deno.exit(1);
            }
            if (valueType === ValueType.VOID) {
                logError(token.loc, `can't store 'void' values in variables`);
                dumpAst(token);
                Deno.exit(1);
            }
            return [valueType];
        },
        out: () => ValueType.VOID,
        generateAsm: token => {
            const varName = token.txt;
            const varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, `LIT_WORD generateAsm cannot find declaration for '${varName}', compiler error`);
                Deno.exit(1);
            }
            if (varDef.isGlobalContext) return getAsmForSetWordGlobal(token, varDef.internalType, varName);

            if (varDef.offset === undefined) {
                logError(token.loc, `LIT_WORD generateAsm can't compute the offset of '${varName}' onto the stack, compiler error`);
                Deno.exit(1);
            }
            return getAsmForSetWordLocal(token, varDef.internalType, varName, varDef.offset);
        },
    };
    voc[TokenType.WORD] = {
        txt: "",
        expectedArity: 0,
        expectedArityOut: 1,
        position: InstructionPosition.PREFIX,
        priority: 10,        
        userFunction: false,
        ins: (token) => {
            const funcDef = getWordDefinition(token.context, token.txt);
            if (token.isUserFunction) {
                if (funcDef === undefined) {
                    logError(token.loc, `cannot find definition for function '${token.txt}', compiler error`);
                    Deno.exit(1);
                }
                if (funcDef.ins === undefined) {
                    logError(token.loc, `the function '${token.txt}' should have a list of parameters type, compiler error`);
                    Deno.exit(1);
                }
                return funcDef.ins;
            }
            return [];
        },
        out: token => {
            const varName = token.txt;
            const varDef = getWordDefinition(token.context, varName);
            if (token.isUserFunction) {
                if (varDef === undefined) {
                    logError(token.loc, `cannot find definition for function '${token.txt}', compiler error`);
                    Deno.exit(1);
                }
                if (varDef.out === undefined) {
                    logError(token.loc, `the function '${token.txt}' should return a type value, compiler error`);
                    Deno.exit(1);
                }
                return varDef.out;
            } else {
                if (varDef !== undefined) return varDef.out;
                    logError(token.loc, `word '${varName}' not defined`);
                Deno.exit(1);
            }
        },
        generateAsm: token => {
            const varName = token.txt;
            const varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, `cannot find declaration for '${varName}', compiler error`);
                Deno.exit(1);
            }
            //const valueType = token.valueType === ValueType.ADDR ? varDef.out : varDef.valueType;
            const valueType = varDef.out;
            if (valueType === undefined) {
                logError(token.loc, `cannot determine the result type of function '${varName}', compiler error`);
                Deno.exit(1);
            }

            if (varDef.isGlobalContext) return getAsmForGetWordGlobal(token, valueType, varName, varDef.isUserFunction);

            if (varDef.offset === undefined) {
                logError(token.loc, `WORD generateAsm can't compute the offset of '${varName}' onto the stack, compiler error`);
                Deno.exit(1);
            }
            return getAsmForGetWordLocal(token, valueType, varName, varDef.offset, varDef.isUserFunction);
        }
    };
    voc[TokenType.WHILE] = {
        txt: "while",
        expectedArity: 2,
        expectedArityOut: 0,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: () => [ValueType.BOOL, ValueType.VOID],
        out: () => ValueType.VOID,
        generateChildPreludeAsm: (ast, n) => {
            // prelude for the true branch
            if (n === 0) {
                return [
                    "startloop@:"
                ];
            } else {
                return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "BNE trueblock@",
                    "LDA STACKACCESS + 1",
                    "BNE trueblock@",
                    "JMP endblock@ ; if all zero",
                    "trueblock@:",
                ];
            }
        },
        generateAsm: (token) => [
            "JMP startloop@",
            "endblock@:",
        ],
    };
    voc[TokenType.POKE] = {
        txt: "poke",
        expectedArity: 2,
        expectedArityOut: 0,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: () => [ValueType.NUMBER, ValueType.BYTE],
        out: () => ValueType.VOID,
        generateAsm: (token) => [
            "JSR POP16",
            "LDY STACKACCESS",
            "JSR POP16",
            "TYA",
            "LDY #0",
            "STA (STACKACCESS),Y"
        ]
    };
    voc[TokenType.PEEK] = {
        txt: "peek",
        expectedArity: 1,
        expectedArityOut: 1,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: () => [ValueType.NUMBER],
        out: () => ValueType.BYTE,
        generateAsm: () => [
            "JSR POP16",
            "LDY #0",
            "LDA (STACKACCESS),Y",
            "STA STACKACCESS",
            "STY STACKACCESS+1",
            "JSR PUSH16"
        ]
    };
    voc[TokenType.CAST_BYTE] = {
        txt: "!<",
        expectedArity: 1,
        expectedArityOut: 1,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: () => [ValueType.NUMBER],
        out: () => ValueType.BYTE,
        generateAsm: () => [
            "LDX SP16",
            "LDA #0",
            "STA STACKBASE + 2,X"
        ]
    };
    voc[TokenType.CAST_NUMBER] = {
        txt: "!n",
        expectedArity: 1,
        expectedArityOut: 1,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: () => [ValueType.BYTE],
        out: () => ValueType.NUMBER,
        generateAsm: () => []
    };
    voc[TokenType.NUMBER] = {
        txt: "Number",
        expectedArity: 0,
        expectedArityOut: 1,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: () => [],
        out: () => ValueType.NUMBER,
        generateAsm: () => [
            // "LDA #0",
            // "STA STACKACCESS",
            // "STA STACKACCESS+1",
            // "JSR PUSH16",
            "; DO NOTHING"
        ]
    };
    voc[TokenType.STRING] = {
        txt: "String",
        expectedArity: 0,
        expectedArityOut: 1,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: () => [],
        out: () => ValueType.STRING,
        generateAsm: () => []
    };
    voc[TokenType.BYTE] = {
        txt: "Byte",
        expectedArity: 0,
        expectedArityOut: 1,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: () => [],
        out: () => ValueType.BYTE,
        generateAsm: () => [
            // "LDA #0",
            // "STA STACKACCESS",
            // "STA STACKACCESS+1",
            // "JSR PUSH16",
            "; DO NOTHING"
        ]
    };
    voc[TokenType.BOOL] = {
        txt: "Bool",
        expectedArity: 0,
        expectedArityOut: 1,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: () => [],
        out: () => ValueType.BOOL,
        generateAsm: () => [
            // "LDA #0",
            // "STA STACKACCESS",
            // "STA STACKACCESS+1",
            // "JSR PUSH16",
            "; DO NOTHING"
        ]
    };
    voc[TokenType.STR_JOIN] = {
        txt: ".",
        expectedArity: 2,
        expectedArityOut: 1,
        position: InstructionPosition.INFIX,
        priority: 100,
        userFunction: false,
        ins: () => [ValueType.STRING, ValueType.STRING],
        out: () => ValueType.STRING,
        generateAsm: () => [
            // 8 0
            // 7 len1
            // 6 add1H
            // 5 add1L
            // 4 0
            // 3 len2
            // 2 add2H
            // 1 add2L
            "NOP",
            "NOP",
            "NOP",
            "LDA HEAPTOP",
            "STA HEAPSAVE",
            "LDA HEAPTOP+1",
            "STA HEAPSAVE+1",

            "LDX SP16",

            // start of first string in FROMADD
            "LDA STACKBASE + 5,X",
            "STA FROMADD + 1",
            "LDA STACKBASE + 6,X",
            "STA FROMADD + 2",

            // DESTINATION
            "LDA HEAPTOP",
            "STA TOADD + 1",
            "LDA HEAPTOP + 1",
            "STA TOADD + 2",

            // LEN first string (and save first len)            
            "LDA STACKBASE + 7,X",
            "STA HEAPSAVE + 2",
            "TAY",

            "JSR COPYMEM",

            // start of second string in FROMADD
            "LDA STACKBASE + 1,X",
            "STA FROMADD + 1",
            "LDA STACKBASE + 2,X",
            "STA FROMADD + 2",

            // LEN second string ( and save total len )
            "LDX SP16",
            "LDA STACKBASE + 3,X",
            "TAY",
            "CLC",
            "ADC HEAPSAVE + 2",
            "STA HEAPSAVE + 2",

            "JSR COPYMEM",

            "LDA TOADD+1",
            "STA HEAPTOP",
            "LDA TOADD+2",
            "STA HEAPTOP+1",

            // POP 8 BYTE
            "LDA SP16",
            "ADC #8",
            "STA SP16",

            // len on the stack
            "LDA HEAPSAVE+2",
            "STA STACKACCESS",
            "LDA #0",
            "STA STACKACCESS + 1",
            "JSR PUSH16",

            // ADDRESS
            "LDA HEAPSAVE",
            "STA STACKACCESS",
            "LDA HEAPSAVE+1",
            "STA STACKACCESS+1",
            "JSR PUSH16",
        ]
    };
    voc[TokenType.HEAP] = {
        txt: "heap",
        expectedArity: 0,
        expectedArityOut: 1,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: () => [],
        out: () => ValueType.NUMBER,
        generateAsm: () => [
            "LDA HEAPTOP",
            "STA STACKACCESS",
            "LDA HEAPTOP +1 ",
            "STA STACKACCESS+1",
            "JSR PUSH16",
        ]
    };
    voc[TokenType.STR_LEN] = {
        txt: "#",
        expectedArity: 1,
        expectedArityOut: 1,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: () => [ValueType.STRING],
        out: () => ValueType.BYTE,
        generateAsm: () => [
            "JSR POP16",
        ]
    };

    return voc;
}

function logError(loc: Location, msg: string) {
    const line = sourceCode.split("\n")[loc.row - 1];
    console.log(line);
    console.log(" ".repeat(loc.col - 1) + `^ (row: ${loc.row} col: ${loc.col})`);    
    console.error("(file://" + Deno.cwd() + "/" + loc.filename + ":" + loc.row + ":" + loc.col + ") ERROR: " + msg);
    console.trace();
}

function identifyToken(vocabulary: Vocabulary, txt: string): { type: TokenType, literalType: ValueType | undefined } | undefined {
    for (const [tokenType, instr] of Object.entries(vocabulary)) {
        if (txt === instr.txt) return { type: parseInt(tokenType, 10) as TokenType, literalType: undefined };
    }

    if (txt.match(/^-?\d+$/)) return { type: TokenType.LITERAL, literalType: ValueType.NUMBER };
    if (txt[0] === '"' && txt[txt.length - 1] === '"') return { type: TokenType.LITERAL, literalType: ValueType.STRING };
    if (txt[txt.length - 1] === ":") return { type: TokenType.SET_WORD, literalType: undefined };
    if (txt[0] === "'") return { type: TokenType.LIT_WORD, literalType: undefined };
    if (txt === "true" || txt === "false") return { type: TokenType.LITERAL, literalType: ValueType.BOOL };

    return { type: TokenType.WORD, literalType: undefined };
}

let sourceCode: string;
async function tokenizer(filename: string, vocabulary: Vocabulary): Promise<AST> {

    sourceCode = await Deno.readTextFile(filename);
    let index = 0;
    let tokenStart = -1;
    let colStart = -1;
    const ret: AST = [];
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
        } else if (tokenType.type === TokenType.SET_WORD) {
            tokenText = tokenText.substring(0, tokenText.length - 1);
        } else if (tokenType.type === TokenType.LIT_WORD) {
            tokenText = tokenText.substring(1);
        }
        ret.push({ type: tokenType.type, txt: tokenText, loc, internalValueType: tokenType.literalType, childs: [] });
    };

    while (index < sourceCode.length) {
        const char = sourceCode[index];

        if (isSpace(char)) {
            if (tokenStart > -1) {
                // space but was parsing a word
                pushToken(sourceCode.substring(tokenStart, index));
                tokenStart = -1;
                colStart = -1;
            }
        } else {
            // not space, start parsing a word
            if (char === "/" && index + 1 < sourceCode.length && sourceCode[index + 1] === "/") {
                while (index < sourceCode.length && sourceCode[index] !== "\n") index++;
                col = 0;
                row++;
            } else if (char === ":" && index + 1 < sourceCode.length && sourceCode[index + 1] === "[") {
                const loc = { row, col, filename };
                ret.push({ type: TokenType.OPEN_REF_BRACKETS, txt: ":[", loc, childs: [] });
                index++;
                col++;
            } else if (char === "[") {
                const loc = { row, col, filename };
                ret.push({ type: TokenType.OPEN_BRACKETS, txt: "[", loc, childs: [] });
            } else if (char === "]") {
                if (tokenStart > -1) {
                    // space but was parsing a word
                    pushToken(sourceCode.substring(tokenStart, index));
                    tokenStart = -1;
                    colStart = -1;
                }
                const loc = { row, col, filename };
                ret.push({ type: TokenType.CLOSE_BRACKETS, txt: "]", loc, childs: [] });
            } else if (char === '"') {
                // starting a string
                colStart = col;
                stringStart = index;
                index++;
                col++;
                while (index < sourceCode.length && sourceCode[index] !== '"') {
                    index++;
                    col++;
                } 

                pushToken(sourceCode.substring(stringStart, index + 1));

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
    if (tokenStart > -1) pushToken(sourceCode.substring(tokenStart));

    return ret;
}

function groupFunctionToken(ast: AST, index: number): Token {
    const functionElement = ast[index];    
    const functionPosition = getInstructionPosition(functionElement);
    const arity = getArity(functionElement);

    let childs: AST;
    let startPos: number;
    if (functionPosition === InstructionPosition.INFIX) {
        if (index + 1 > ast.length - 1) {
            logError(functionElement.loc, `the operator ${functionElement.txt} expects 2 parameters, but one got!`);
            Deno.exit(1);
        }        
        const secondParameterArity = getArity(ast[index + 1]);
        if (secondParameterArity > 0 && ast[index + 1].childs.length !== secondParameterArity) {
            groupFunctionToken(ast, index + 1);
        }
        childs = [ast[index - 1], ast[index + 1]];
        startPos = index - 1;
    } else if (functionPosition === InstructionPosition.POSTFIX) {
        childs = [ast[index - 1]];
        startPos = index - 1;
    } else {        
        childs = ast.slice(index + 1, index + 1 + arity);
        if (childs.length !== arity) {
            logError(functionElement.loc, `the function ${functionElement.txt} expects ${arity} parameters, but got only ${childs.length}!`);
            Deno.exit(1);
        }
        startPos = index;
    }
    functionElement.childs = functionElement.childs.concat(childs);
    ast.splice(startPos, childs.length + 1, functionElement);
    functionElement.childs.forEach(token => {
        if (token.ins === undefined) token.ins = vocabulary[token.type]?.ins(token);
        if (token.ins === undefined) {
            logError(token.loc, `'cannot determine the parameter list for function ${token.txt}'`);
            Deno.exit(1);
        }
        if (token.out === undefined) token.out = vocabulary[token.type]?.out(token);
        if (token.out === undefined) {
            logError(token.loc, `'cannot determine the return type for function ${token.txt}'`);
            Deno.exit(1);
        }
    });
    if (functionElement.ins === undefined) functionElement.ins = vocabulary[functionElement.type]?.ins(functionElement);
    if (functionElement.ins === undefined) {
        logError(functionElement.loc, `'cannot determine the parameter list for function ${functionElement.txt}'`);
        Deno.exit(1);
    }

    if (functionElement.out === undefined) functionElement.out = vocabulary[functionElement.type]?.out(functionElement);
    if (functionElement.out === undefined) {
        logError(functionElement.loc, `'cannot determine the return type for function ${functionElement.txt}'`);
        Deno.exit(1);
    }    
    return functionElement;
}

function getParametersRequestedByBlock(block: Token) {

    if (block.type !== TokenType.BLOCK && block.type !== TokenType.REF_BLOCK) {
        logError(block.loc, `the token '${block.txt}' is not a block or ref block!`);
        Deno.exit(1);
    }

    // let's search for something like ['x Number 'y Number] where Number accepts a value but does not have child
    let ins: ValueType[] = [];
    for (let i = 0; i < block.childs.length - 1; i++) {
        const currChild = block.childs[i];
        if (currChild.childs.length === 1) {
            const firstChildOfChild = currChild.childs[0];
            if (firstChildOfChild.ins === undefined) {
                logError(firstChildOfChild.loc, `can't get the parameter list for the function '${firstChildOfChild.txt}')}`);
                Deno.exit(1);
            }
            if (firstChildOfChild.ins.length! > firstChildOfChild.childs.length) {
                ins.concat(firstChildOfChild.ins.slice(firstChildOfChild.childs.length));
            }
        }
    }
    return ins;

}

function getReturnValueByBlock(block: Token) {

    if (block.type !== TokenType.BLOCK && block.type !== TokenType.REF_BLOCK) {
        logError(block.loc, `the token '${block.txt}' is not a block or ref block!`);
        Deno.exit(1);
    }
    const lastChild = block.childs.at(-1);
    if (lastChild === undefined) return ValueType.VOID;

    const lastChildType = lastChild.out;
    if (lastChildType === undefined) {
        logError(lastChild.loc, `the return type of '${lastChild.txt}' is undefined`);
        Deno.exit(1);
    }
    return lastChildType;
}

function typeCheckBlock(block: Token) {

    if (block.type !== TokenType.BLOCK && block.type !== TokenType.REF_BLOCK) {
        logError(block.loc, `the token '${block.txt}' is not a block or ref block!`);
        Deno.exit(1);
    }

    for (let i = 0; i < block.childs.length - 1; i++) {
        if (block.childs[i].out !== ValueType.VOID) {
            logError(block.childs[i].loc, `the expression '${block.childs[i].txt}' should not return unhandled data, currently it returns ${humanReadableType(block.childs[i].out)}`);
            dumpAst(block);
            Deno.exit(1);
        }
    }

    // let's search for something like ['x Number 'y Number] where Number accepts a value but does not have child
    // this will become a function
    let ins: ValueType[] = [];
    for (let i = 0; i < block.childs.length - 1; i++) {
        const currChild = block.childs[i];
        if (currChild.childs.length === 1) {
            const firstChildOfChild = currChild.childs[0];
            if (firstChildOfChild.ins === undefined) {
                logError(firstChildOfChild.loc, `can't get the parameter list for the function '${firstChildOfChild.txt}')}`);
                Deno.exit(1);
            }
            if (firstChildOfChild.ins.length! > firstChildOfChild.childs.length) {
                ins.concat(firstChildOfChild.ins.slice(firstChildOfChild.childs.length));
            }
        }
    }

    block.ins = getParametersRequestedByBlock(block);
    block.expectedArity = ins.length;
    block.out = getReturnValueByBlock(block);
    block.expectedArityOut = block.out === ValueType.VOID ? 0 : 1;

}

function typeCheck(token: Token) {

    if (token.out === undefined || token.ins === undefined) {
        const instr = vocabulary[token.type];
        if (instr === undefined) {
            logError(token.loc, `unknown keyword '${token.txt}', can't do the typecheck`);
            Deno.exit(1);
        }
        if (token.ins === undefined) token.ins = instr.ins(token);
        if (token.out === undefined) token.out = instr.out(token);

    }

    const arity = getArity(token);
    if (token.type === TokenType.BLOCK || token.type === TokenType.REF_BLOCK) {
        // in block the number of ins is not the number of childs
    } else {
        if (arity !== token.childs.length) {
            logError(token.loc, `the function '${token.txt}' expects ${arity} parameters, but got ${token.childs.length}`);
            dumpAst(token);
            Deno.exit(1);
        }
    }

    const ins = getInputParametersValue(token);
    for (let i = 0; i < ins.length; i++) {
        if (ins[i] !== getReturnTypeOfAWord(token.childs[i])) {
            logError(token.childs[i].loc, `the function '${token.txt}' expects parameter in position ${i + 1} to be ${humanReadableType(ins[i])}, but it is ${humanReadableType(token.childs[i].out)}`);
            dumpAst(token);
            Deno.exit(1);
        }
    }
}

function setWordDefinition(token: Token) {
    if (token.type !== TokenType.LIT_WORD) return;

    if (token.context === undefined) {
        logError(token.loc, `The token '${token.txt}' does not have a context`);
        Deno.exit(1);
    }

    if (token.childs.length !== 1) {
        logError(token.loc, `The word '${token.txt}' must have only one child`);
        Deno.exit(1);
    }

    const child = token.childs[0];
    if (child.ins === undefined) {
        logError(child.loc, `The word '${child.txt}' does not have a parameters value`);
        Deno.exit(1);
    }

    if (child.out === undefined) {
        logError(child.loc, `The word '${child.txt}' does not have a return value`);
        Deno.exit(1);
    }

    const varDef = getWordDefinition(token.context, token.txt);
    if (varDef !== undefined) {
        if (varDef.token.context === token.context) {
            logError(token.loc, `Can't redefine the word '${token.txt}'`);
        } else {
            logError(token.loc, `Can't overshadow the word '${token.txt}'`);
        }
        Deno.exit(1);
    }

    const isUserFunction = token.childs[0].type === TokenType.REF_BLOCK;
    //const isUserFunction = false;

    token.context.varsDefinition[token.txt] = {
        ins: child.ins,
        out: child.out,        
        token,
        position: child.position,
        priority: child.priority,
        isUserFunction: isUserFunction,
        internalType: isUserFunction ? ValueType.ADDR : child.out,
        offset: undefined
    };
}

function parseBlock(ast: AST): AST {

    const priorityList = [...new Set(
        ast.filter(element => element.priority !== undefined)
            .map(element => element.priority)
        .sort((a, b) => (b ?? 0) - (a ?? 0))
    )];
    for (let i = 0; i < priorityList.length; i++) {
        const priority = priorityList[i];
        //for (let j = ast.length - 1; j >= 0; j--) {
        for (let j = ast.length - 1; j >= 0; j--) {
            const token = ast[j];
            if (token.priority !== priority) continue;
            if (token.type === TokenType.LITERAL) continue;
            if (token.type === TokenType.OPEN_BRACKETS || token.type === TokenType.CLOSE_BRACKETS) {
                logError(token.loc, `found open or closed brackets in parse, compiler error`);
                Deno.exit(1);
            }

            const group = groupFunctionToken(ast, j);
            typeCheck(group);
            setWordDefinition(group);
            if (token.position !== InstructionPosition.PREFIX) j = j - 1; // we already taken as child the token before this
        }
    }

    return ast;
}

/// SECOND TRY

function dumpSequence(sequence: AST, txt: string) {
    let ctx = "{}";
    if (sequence.length === 0) {
        console.log("<empty sequence>");
        return;
    }
    if (sequence[0].context) {
        ctx = "{" + Object.keys(sequence[0].context.varsDefinition).join(",") + "}";
    }
    console.log(txt + " " + sequence.map(token => token.txt).join(" ") + " " + ctx);
}

function getTokensByTypeRecur(token: Token, type: TokenType): string[] {
    const wordUsed = token.childs.filter(child => child.type === type).map(child => child.txt);
    const wordUsedByChild = token.childs.filter(child => child.type === TokenType.BLOCK).map(child => getTokensByTypeRecur(child, type));
    return wordUsed.concat(wordUsedByChild.flat());
}
function getWordUsedButNotDefinedInABlock(token: Token): string[] {
    const wordsUsed = getTokensByTypeRecur(token, TokenType.WORD);
    const wordsDefined = getTokensByTypeRecur(token, TokenType.LIT_WORD);
    const wordsUsedButNotDefined = wordsUsed.filter(x => !wordsDefined.includes(x));
    const freeWords = wordsUsedButNotDefined.filter(name => getWordDefinition(token.context, name) === undefined);
    return freeWords;
}

/*
function groupByExpectedArityOutZeroOLD(sequence: AST) {

    if (sequence.length === 0) return sequence;
    if (sequence[0].expectedArityOut !== 0) {
        logError(sequence[0].loc, `The token '${sequence[0].txt}' is expected to return no value`);
        Deno.exit(1);
    }

    let lastPointer = -1;
    for (let j = 0; j < sequence.length; j++) {
        const token = sequence[j];
        if (token.type === TokenType.BLOCK) {            

            // if the block refers to a word that is not defined in it
            // and the word is still not defined, we suppose that the current sequence contains the definition
            // so we stop the sequence here
            dumpSequence(token.childs, "check for block arity");

            if (getWordUsedButNotDefinedInABlock(token).length > 0) {
                console.log("free words in block ", getWordUsedButNotDefinedInABlock(token).join(", "));
                token.expectedArityOut = 0;
            } else {
                parseBlock(token.childs);
                typeCheckBlock(token);
                dumpAst(token);
                if (token.out === undefined) {
                    logError(token.loc, `Cannot determine the ouput value of the list '${token.txt}'`);
                    Deno.exit(1);
                }
                console.log("the output of block is " + humanReadableType(token.out));
                token.expectedArityOut = token.out === ValueType.VOID ? 0 : 1;
                console.log("the arity out is " + token.expectedArityOut);
            }
        }
        if (token.expectedArityOut === 0 && token.type !== TokenType.BLOCK) {
            if (lastPointer !== -1) {
                const toParse = sequence.slice(lastPointer, j);
                const numberToParse = toParse.length;
                dumpSequence(toParse, `start: ${lastPointer} to: ${j}`);
                parseBlock(toParse);
                sequence.splice(lastPointer, numberToParse, ...toParse);
                j = lastPointer + toParse.length;                    
            }   
            lastPointer = j;
            if (token.type === TokenType.BLOCK) {
                const toParse = token.childs.slice();
                dumpSequence(toParse, `start: ${j} to: ${j}`);
                parseBlock(toParse);
                token.childs = toParse;
                typeCheckBlock(token);
                lastPointer = -1;
            }
        }
    }

    if (lastPointer < sequence.length && lastPointer !== -1) {
        const toParse = sequence.slice(lastPointer);
        const numberToParse = toParse.length;
        dumpSequence(toParse, `start: ${lastPointer} to the end`);
        parseBlock(toParse);
        sequence.splice(lastPointer, numberToParse, ...toParse);
    }

}
*/

function groupByExpectedArityOutZero(sequence: AST) {

    let childLeft = 0;
    let lastPointer = 0;
    for (let j = 0; j < sequence.length; j++) {
        const token = sequence[j];
        if (token.type === TokenType.LITERAL) {
            childLeft = childLeft - 1;
        } else if (token.type === TokenType.WORD) {
            const varDef = getWordDefinition(token.context, token.txt);
            if (varDef === undefined) {
                logError(token.loc, `unknown word '${token.txt}'`);
                Deno.exit(1);
            }
            childLeft = childLeft + varDef.ins.length - (varDef.out === ValueType.VOID ? 0 : 1);
        } else if (token.type === TokenType.REF_BLOCK) {
            const childs = token.childs;
            groupByExpectedArityOutZero(childs);
            //token.childs = childs;
            typeCheckBlock(token);
            // since we just type checked the block the arities must be a number
            //childLeft = childLeft + token.expectedArity! - token.expectedArityOut!;
            childLeft = childLeft - 1;
        } else if (token.type === TokenType.BLOCK) {
            const childs = token.childs;
            groupByExpectedArityOutZero(childs);
            //token.childs = childs;
            typeCheckBlock(token);
            // since we just type checked the block the arities must be a number
            //childLeft = childLeft + token.expectedArity! - token.expectedArityOut!;
            childLeft = childLeft - 1;
        } else {
            // instruction
            if (token.expectedArity === undefined) {
                logError(token.loc, `the arity of '${token.txt}' is undefined`);
                Deno.exit(1);
            }
            if (token.expectedArityOut === undefined) {
                logError(token.loc, `the type result of '${token.txt}' is undefined`);
                Deno.exit(1);
            }
            if (token.position === InstructionPosition.PREFIX) {
                if (token.type === TokenType.EITHER) {
                    childLeft = childLeft + token.expectedArity - (childLeft > 0 ? 1 : 0);
                } else {
                    childLeft = childLeft + token.expectedArity - token.expectedArityOut;
                }

            } else if (token.position === InstructionPosition.INFIX) {
                childLeft = childLeft + 1; // 2 in 1 out
            } else if (token.position === InstructionPosition.POSTFIX) {
                childLeft = childLeft + 0; // 1 in 1 out
            }
        }

        if (childLeft <= 0 || j === sequence.length - 1) {
            childLeft = 0;
            let endOfBlock = true;
            if (j < sequence.length - 1) {
                if (sequence[j + 1].position === InstructionPosition.INFIX || sequence[j + 1].position === InstructionPosition.POSTFIX) {
                    endOfBlock = false
                }
            }
            if (endOfBlock) {
                const toParse = sequence.slice(lastPointer, j + 1);
                const numberToParse = toParse.length;
                dumpSequence(toParse, `from ${lastPointer} to ${j} :`);
                if (toParse.length === 1 && toParse[0].type === TokenType.BLOCK) {
                    // already parsed
                } else {
                    parseBlock(toParse);
                }
                sequence.splice(lastPointer, numberToParse, ...toParse);
                j = lastPointer + toParse.length - 1;
                lastPointer = lastPointer + toParse.length;
            }
        }
        //  else {
        //     if (token.expectedArityOut === 0 && lastPointer < j) {
        //         childLeft = 0;
        //         const toParse = sequence.slice(lastPointer, j);
        //         const numberToParse = toParse.length;
        //         dumpSequence(toParse, `from ${lastPointer} to ${j} :`);
        //         if (toParse.length === 1 && toParse[0].type === TokenType.BLOCK) {
        //             // already parsed
        //         } else {
        //             parseBlock(toParse);
        //         }
        //         sequence.splice(lastPointer, numberToParse, ...toParse);
        //         j = lastPointer + toParse.length - 1;
        //         lastPointer = j;
        //     }
        // }
    }
}

function groupSequence(vocabulary: Vocabulary, program: AST): Token {

    let currentContext: Context = { parent: undefined, element: undefined, varsDefinition: {} };
    const ast: AST = [];
    const stack: { pos: number, context: Context, loc: Location, type: TokenType }[] = [];
    for (let j = 0; j < program.length; j++) {
        const token = program[j];
        if (token.type === TokenType.OPEN_BRACKETS) {
            stack.push({ pos: ast.length, context: currentContext, loc: token.loc, type: token.type });
            currentContext = { parent: currentContext, element: undefined, varsDefinition: {} };
        } else if (token.type === TokenType.OPEN_REF_BRACKETS) {
            stack.push({ pos: ast.length, context: currentContext, loc: token.loc, type: token.type });
            currentContext = { parent: currentContext, element: undefined, varsDefinition: {} };
        } else if (token.type === TokenType.CLOSE_BRACKETS) {
            const state = stack.pop();
            if (state === undefined) {
                logError(token.loc, "close brackets not bilanced");
                Deno.exit(1);
            }
            const matchingIndex = state.pos;
            const matchingLoc = state.loc;
            const matchingType = state.type;
            const sequence = ast.splice(matchingIndex, j - matchingIndex + 1);

            const blockToken: Token = {
                type: matchingType === TokenType.OPEN_REF_BRACKETS ? TokenType.REF_BLOCK : TokenType.BLOCK,
                loc: matchingLoc,
                txt: (matchingType === TokenType.OPEN_REF_BRACKETS ? ":" : "") + "[" + sequence.map(t => t.txt).join(" ") + "]",
                childs: sequence,
                position: InstructionPosition.PREFIX,
                context: currentContext,
                ins: [],
                out: 0,
                priority: 10,
                functionIndex: undefined,
                internalValueType: undefined,
                isUserFunction: undefined
            };
            currentContext.element = blockToken;
            ast.push(blockToken);
            currentContext = state.context;
        } else {

            if (token.type === TokenType.LITERAL) {
                ast.push({
                    loc: token.loc,
                    txt: token.txt,
                    type: token.type,
                    internalValueType: token.internalValueType,
                    ins: [],
                    out: token.internalValueType,
                    position: InstructionPosition.PREFIX,
                    priority: 1000,
                    isUserFunction: false,
                    childs: [],
                    context: currentContext
                });
            } else {
                const instr = vocabulary[token.type];
                if (instr) {
                    ast.push({
                        loc: token.loc,
                        txt: token.txt,
                        type: token.type,
                        internalValueType: token.internalValueType,
                        expectedArity: instr.expectedArity,
                        expectedArityOut: instr.expectedArityOut,
                        ins: undefined,
                        out: undefined,
                        position: instr.position,
                        priority: instr.priority,
                        isUserFunction: false,
                        childs: [],
                        context: currentContext
                    });
                }
            }
        }
    }

    const state = stack.pop();
    if (state !== undefined) {
        const token = program[state.pos];
        logError(token.loc, "open brackets not bilanced");
        Deno.exit(1);
    }

    const prog = {
        loc: { col: 1, row: 1, filename },
        txt: "[prog]",
        type: TokenType.BLOCK,
        internalValueType: ValueType.VOID,
        ins: [],
        out: ValueType.VOID,
        isUserFunction: false,
        priority: 0,
        position: InstructionPosition.PREFIX,
        functionIndex: undefined,
        childs: ast,
        context: currentContext
    };

    return prog;
}

function parse(vocabulary: Vocabulary, program: AST): Token {
    let astProgram = groupSequence(vocabulary, program);    
    groupByExpectedArityOutZero(astProgram.childs);
    typeCheckBlock(astProgram);
    return astProgram;
}

let labelIndex = 0;
let stringTable: string[] = [];
let functionIndex = 0;

function getFunctionIndex(): number {
    return functionIndex++;
}

function getFunctionName(n: number): string {
    return "CALL_" + n;
}

function getAfterFunctionName(n: number): string {
    return "AFTER_" + n;
}

function compileLiteral(ast: Token): Assembly {
    let ret: Assembly = [];
    console.assert(ValueType.VALUETYPESCOUNT === 6, "Exaustive value types count");
    if (ast.out === ValueType.NUMBER) {
        ret.push(`; ${ast.loc.row}:${ast.loc.col} NUMBER ${ast.txt}`);
        const MSB = (parseInt(ast.txt, 10) >> 8) & 255;
        ret.push(`LDA #${MSB}`);
        ret.push(`STA STACKACCESS+1`);
        const LSB = parseInt(ast.txt, 10) & 255;
        ret.push(`LDA #${LSB}`);
        ret.push(`STA STACKACCESS`);
        ret.push(`JSR PUSH16`);

    } else if (ast.out === ValueType.BYTE) {
        ret.push(`; ${ast.loc.row}:${ast.loc.col} BYTE ${ast.txt}`);
        const LSB = parseInt(ast.txt, 10) & 255;
        ret.push(`LDA #${LSB}`);
        ret.push(`STA STACKACCESS`);
        ret.push(`LDA #0`);
        ret.push(`STA STACKACCESS+1`);
        ret.push(`JSR PUSH16`);
    } else if (ast.out === ValueType.STRING) {
        ret.push(`; ${ast.loc.row}:${ast.loc.col} STRING "${ast.txt}"`);
        // push lenght 
        // todo: ora la lunghezza massima della stringa è 255 caratteri, aumentarla ?
        const stringToPush = ast.txt;
        if (stringToPush.length > 255) {
            logError(ast.loc, "strings must be less than 256 chars");
            Deno.exit(1);
        }
        ret.push(`LDA #0`);
        ret.push(`STA STACKACCESS+1`);
        ret.push(`LDA #${ast.txt.length}`);
        ret.push(`STA STACKACCESS`);
        ret.push(`JSR PUSH16`);

        // push address
        const labelIndex = stringTable.length;
        stringTable.push(ast.txt);
        ret.push(`LDA #>str${labelIndex}`);
        ret.push(`STA STACKACCESS+1`);
        ret.push(`LDA #<str${labelIndex}`);
        ret.push(`STA STACKACCESS`);
        ret.push(`JSR PUSH16`);

    } else if (ast.out === ValueType.BOOL) {
        ret.push(`; ${ast.loc.row}:${ast.loc.col} BOOL ${ast.txt}`);
        ret.push(`LDA #${ast.txt === "true" ? "1" : "0"}`);
        ret.push(`STA STACKACCESS`);
        ret.push(`LDA #0`);
        ret.push(`STA STACKACCESS+1`);
        ret.push(`JSR PUSH16`);
    } else if (ast.out === ValueType.ADDR) {
        logError(ast.loc, `'Addr' should not be compiled as a value, compiler error`);
        Deno.exit(1);
    } else if (ast.out === ValueType.VOID) {
        logError(ast.loc, `'Void' should not be compiled as a value, compiler error`);
        Deno.exit(1);
    } else {
        logError(ast.loc, `compiling the type '${ast.out}' is not supported yet`);
        Deno.exit(1);
    }

    return ret;
}

function compile(vocabulary: Vocabulary, ast: Token): Assembly {

    let ret: Assembly = [];


    // if (ast.type === TokenType.PARAM_BLOCK) {
    //     for (let i = ast.childs.length - 2; i >= 0; i--) {
    //         console.log("compiling param " + ast.childs[i].txt);
    //         const inst = vocabulary[ast.childs[i].type];
    //         if (inst.generateChildPreludeAsm) {
    //             ret = ret.concat(inst.generateChildPreludeAsm(ast, i));
    //         }
    //         ret = ret.concat(compile(vocabulary, ast.childs[i]))
    //     }
    //     const inst = vocabulary[ast.childs[ast.childs.length - 1].type];
    //     if (inst.generateChildPreludeAsm) ret = ret.concat(inst.generateChildPreludeAsm(ast, ast.childs.length - 1));
    //     ret = ret.concat(compile(vocabulary, ast.childs[ast.childs.length - 1]));
    // } else {
    const inst = vocabulary[ast.type];
        for (let i = 0; i < ast.childs.length; i++) {
            if (inst.generateChildPreludeAsm) {
                ret = ret.concat(inst.generateChildPreludeAsm(ast, i));
            }
            ret = ret.concat(compile(vocabulary, ast.childs[i]))
        }
    // }

    // lets' compile for real        
    if (ast.type === TokenType.LITERAL) {
        ret = ret.concat(compileLiteral(ast));
    } else {
        const loc = `${ast.loc.row}: ${ast.loc.col}`;
        const wordtype = humanReadableFunction(ast);
        const tokenType = humanReadableToken(ast.type);
        ret.push(`; ${loc} ${tokenType} ${ast.txt} type: ${wordtype}`);

        const inst = vocabulary[ast.type];
        ret = ret.concat(inst.generateAsm(ast));
    }

    // LABEL NUMBERING, EACH @ found in instructions is changed to labelIndex        
    for (let i = 0; i < ret.length; i++) {
        ret[i] = ret[i].replace("@", String(labelIndex));
    }
    labelIndex++;
    return ret;
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
        "; INIT HEAP",
        "LDA #<HEAPSTART",
        "STA HEAPTOP",
        "LDA #>HEAPSTART",
        "STA HEAPTOP+1",
        "JSR INITSTACK",
    ]
}

function asmFooter(ast: Token): Assembly {
    const lib = [
        "RTS",
        "BCD DS 3 ; USED IN BIN TO BCD",
        "HEAPSAVE DS 3 ; USED IN COPYSTRING",
        "AUXMUL DS 2",
        "HEAPTOP DS 2",
        "TEST_UPPER_BIT: BYTE $80",
        "SP16 = $7F",
        "STACKACCESS = $0080",
        "STACKBASE = $0000",

        // FROMADD, TOADD, Y LENGHT
        "COPYMEM:",
        "TYA",
        "BEQ ENDCOPY",
        "FROMADD:",
        "LDA $1111",
        "TOADD:",
        "STA $1111",
        "INC FROMADD + 1",
        "BNE COPY_NO_CARRY1",
        "INC FROMADD + 2",
        "COPY_NO_CARRY1:",
        "INC TOADD + 1",
        "BNE COPY_NO_CARRY2",
        "INC TOADD + 2",
        "COPY_NO_CARRY2:",
        "DEY",
        "BNE COPYMEM",
        "ENDCOPY:",
        "RTS",

        "PRINT_STRING:",
        "JSR POP16",
        "LDX SP16",
        "LDA STACKBASE + 1,X; LEN",
        "INX",
        "INX",
        "STX SP16",
        "TAX; NOW IN X WE HAVE THE LEN",
        "BEQ EXIT_PRINT_STR",
        "LDY #0",
        "LOOP_PRINT_STRING:",
        "LDA (STACKACCESS),Y",
        "JSR $FFD2",
        "INY",
        "DEX",
        "BNE LOOP_PRINT_STRING",
        "EXIT_PRINT_STR:",
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
        "RTS",

        "MUL16:",
        "LDX SP16",
        "LDA STACKBASE + 3,X    ; Get the multiplicand and",
        "STA AUXMUL             ; put it in the scratchpad.",
        "LDA STACKBASE + 4,X",
        "STA AUXMUL + 1",
        "PHA",
        "LDA #0",
        "STA STACKBASE + 3       ; Zero - out the original multiplicand area",
        "STA STACKBASE + 4",
        "PLA",
        "LDY #$10                ; We'll loop 16 times.",
        "shift_loop:",
        "ASL STACKBASE + 3,X     ; Shift the entire 32 bits over one bit position.",
        "ROL STACKBASE + 4,X",
        "ROL STACKBASE + 1,X",
        "ROL STACKBASE + 2,X",
        "BCC skip_add            ; Skip the adding -in to the result if the high bit shifted out was 0",
        "CLC                     ; Else, add multiplier to intermediate result.",
        "LDA AUXMUL",
        "ADC STACKBASE + 3,X",
        "STA STACKBASE + 3,X",
        "LDA AUXMUL + 1",
        "ADC STACKBASE + 4,X",
        "STA STACKBASE + 4,X",
        "LDA #0",
        "ADC STACKBASE + 1,X",
        "STA STACKBASE + 1,X",
        "skip_add:",
        "DEY                      ; If we haven't done 16 iterations yet,",
        "BNE  shift_loop          ; then go around again.",
        "INX",
        "INX",
        "STX SP16",
        "RTS",

        "; https://www.ahl27.com/posts/2022/12/SIXTH-div/",
        "DIV16WITHMOD:",
        ";; MAX ITERATIONS IS 16 = 0X10, SINCE WE HAVE 16 BIT NUMBERS",
        "LDX SP16",
        "LDY #$10",

        ";; ADD TWO SPACES ON STACK",
        "DEX",
        "DEX",
        "DEX",
        "DEX",

        "LDA #0",
        "STA STACKBASE + 1,X; REMAINDER",
        "STA STACKBASE + 2,X",
        "STA STACKBASE + 3,X; QUOTIENT",
        "STA STACKBASE + 4,X",
        "; +5 - 6 IS DENOMINATOR",
        "; +7 - 8 IS NUMERATOR",

        ";; SET UP THE NUMERATOR",
        "LDA #0",
        "ORA STACKBASE + 8,X",
        "ORA STACKBASE + 7,X",
        "BEQ EARLYEXIT",

        ";; CHECKING IS DENOMINATOR IS ZERO(IF SO WE'LL JUST STORE ZEROS)",
        "LDA #0",
        "ORA STACKBASE + 6,X",
        "ORA STACKBASE + 5,X",
        "BNE DIVMODLOOP1",

        "EARLYEXIT:",
        ";; NUMERATOR OR DENOMINATOR ARE ZERO, JUST RETURN",
        "LDA #0",
        "STA STACKBASE + 6,X",
        "STA STACKBASE + 5,X",
        "INX",
        "INX",
        "INX",
        "INX",
        "RTS",

        ";; TRIM DOWN TO LEADING BIT",
        "DIVMODLOOP1:",
        "LDA STACKBASE + 8,X",
        "BIT TEST_UPPER_BIT",
        "BNE END",
        "CLC",
        "ASL STACKBASE + 7,X",
        "ROL STACKBASE + 8,X",
        "DEY",
        "JMP DIVMODLOOP1",
        "END:",

        ";; MAIN DIVISION LOOP",
        "DIVMODLOOP2:",
        ";; LEFT - SHIFT THE REMAINDER",
        "CLC",
        "ASL STACKBASE + 1,X         ",
        "ROL STACKBASE + 2,X",

        ";; LEFT - SHIFT THE QUOTIENT",
        "CLC",
        "ASL STACKBASE + 3,X",
        "ROL STACKBASE + 4,X",

        ";; SET LEAST SIGNIFICANT BIT TO BIT I OF NUMERATOR",
        "CLC",
        "ASL STACKBASE + 7,X",
        "ROL STACKBASE + 8,X",

        "LDA STACKBASE + 1,X",
        "ADC #0",
        "STA STACKBASE + 1,X",
        "LDA STACKBASE + 2,X",
        "ADC #0",
        "STA STACKBASE + 2,X",

        ";; COMPARE REMAINDER TO DENOMINATOR",
        "; UPPER BYTE(STACKBASE + 2 IS ALREADY IN A)",
        "CMP STACKBASE + 6,X",
        "BMI SKIP; IF R < D, SKIP TO NEXT ITERATION ",
        "BNE SUBTRACT; IF R > D, WE CAN SKIP COMPARING LOWER BYTE",
        "; IF R = D, WE HAVE TO CHECK THE LOWER BYTE",

        "; LOWER BYTE",
        "LDA STACKBASE + 1,X",
        "CMP STACKBASE + 5,X",
        "BMI SKIP",

        "SUBTRACT:",
        ";; SUBTRACT DENOMINATOR FROM REMAINDER",
        "SEC",
        "; SUBTRACT LOWER BYTE",
        "LDA STACKBASE + 1,X",
        "SBC STACKBASE + 5,X",
        "STA STACKBASE + 1,X",

        "; SUBTRACT UPPER BYTE",
        "LDA STACKBASE + 2,X",
        "SBC STACKBASE + 6,X",
        "STA STACKBASE + 2,X",

        ";; ADD ONE TO QUOTIENT",
        "INC STACKBASE + 3,X",

        "SKIP:",
        "DEY",
        "BEQ EXIT",
        "JMP DIVMODLOOP2",

        "EXIT:  ",
        ";; CLEANUP",
        "LDA STACKBASE + 1,X",
        "STA STACKBASE + 5,X",
        "LDA STACKBASE + 2,X",
        "STA STACKBASE + 6,X",
        "LDA STACKBASE + 3,X",
        "STA STACKBASE + 7,X",
        "LDA STACKBASE + 4,X",
        "STA STACKBASE + 8,X",

        "INX",
        "INX",
        "INX",
        "INX",
        "RTS",

        "DIV16:",
        "JSR DIV16WITHMOD",
        "INX",
        "INX",
        "RTS",

        "MOD16:",
        "JSR DIV16WITHMOD",
        "LDA STACKBASE + 1,X",
        "STA STACKBASE + 3,X",
        "LDA STACKBASE + 2,X",
        "STA STACKBASE + 4,X",
        "INX",
        "INX",
        "RTS",

        "MALLOC:",
        "CLC",
        "ADC HEAPTOP",
        "STA HEAPTOP",
        "BCC NOCARRY",
        "INC HEAPTOP+1",
        "NOCARRY:",
        "LDA HEAPTOP",
        "STA STACKACCESS",
        "LDA HEAPTOP + 1",
        "STA STACKACCESS + 1",
        "JSR PUSH16",

        "RTS",

    ];

    const literalStrings = stringTable.map((str, index) => {
        const bytes: string[] = [];
        for (let i = 0; i < str.length; i++) {
            bytes.push(String(str[i].charCodeAt(0) & 255));
        }
        const strBytes = bytes.join(",");
        return `str${index}: BYTE ${strBytes}`;
    });

    const vars: string[] = [];
    if (ast.context !== undefined) {
        Object.entries(ast.context.varsDefinition).forEach(([name, varDef]) => {
            const variableName = "V_" + name;
            if (!(varDef.internalType in sizeForValueType)) {
                logError(varDef.token.loc, `cannot find the size of '${varDef.token.txt}' to allocate on the heap`);
                Deno.exit(1);
            }
            const size = sizeForValueType[varDef.internalType];
            vars.push(`${variableName} DS ${size}`);
        });
    }

    const heap = [        
        "HEAPSTART:",
    ]

    return lib.concat(literalStrings).concat(vars).concat(heap);
}

function dumpProgram(program: AST) {
    console.log(`Token listing:`);
    for (let i = 0; i < program.length; i++) {
        const token = program[i];
        //logError(token.loc, `istr: ${token.type}, ${token.txt}`)
        console.log(`${token.loc.row}:${token.loc.col} \t'${token.txt}' \t${humanReadableToken(token.type)}`);
    }
}

function dumpAst(ast: AST | Token, prefix = "") {
    const astToDump = ast instanceof Array ? ast : [ast];
    astToDump.forEach(element => {
        const tokenType = humanReadableToken(element.type);
        const ins = element.ins === undefined ? "undefined" : element.ins.map(type => humanReadableType(type)).join(", ");
        const out = humanReadableType(element.out);
        const strType = "(" + ins + ")=>" + out;
        const strFun = element.isUserFunction ? "USER FUN" : "";
        const contextToken = element.context?.element;
        const contextTokenName = contextToken?.txt ?? "";
        const ctxName = contextTokenName.length > 10 ? "[" + contextTokenName.substring(1, 6) + "...]" : "[" + contextTokenName + "]";
        const ctx = element.context?.parent === undefined ? "global" : ctxName;
        const ctxVars = Object.entries(element.context?.varsDefinition!);
        // const vars = ctxVars.length === 0 ? "none" : ctxVars.map(([key, def]) => {
        //     return `${key} ins: ${def.ins.map(t => humanReadableType(t)).join(",")} out ${humanReadableType(def.out)}`;
        // }).join(", ");
        const vars = ctxVars.length === 0 ? "none" : ctxVars.map(d => d[0]).join(",");
        console.log(prefix, element.txt + " " + tokenType + " " + strFun + " " + strType + " ctx:" + ctx + " (" + vars + ")");

        // console.log(prefix, sourceCode.split("\n")[element.loc.row - 1]);
        // console.log(prefix, " ".repeat(element.loc.col - 1) + `^ (row: ${element.loc.row} col: ${element.loc.col})`);

        dumpAst(element.childs, prefix + "    ");
    });
}

function dumpContext(context: Context) {
    if (context === undefined) {
        console.log("Context is undefined");
        return;
    }
    console.log("context for " + (context.element === undefined ? "global" : context.element.txt));
    Object.keys(context.varsDefinition).forEach(key => {
        let wordtype = "";
        wordtype = humanReadableFunction(context.varsDefinition[key].token);
        console.log("    " + key + ": " + wordtype + " offset: " + context.varsDefinition[key].offset);
    });
}

function usage() {
    console.log("USAGE:");
    console.log("    deno run --allow-all cazz.ts <filename>");
    console.log("    NOTE: filename must have .cazz extension");
}

if (Deno.args.length !== 1) {
    usage();
    Deno.exit(1);
}

const argFilename = Deno.args[0];
const basename = argFilename.substring(0, argFilename.lastIndexOf('.')) || argFilename;
const filename = basename + ".cazz";

console.log("start");
const vocabulary = createVocabulary();
const program = await tokenizer(filename, vocabulary);
const astProgram = parse(vocabulary, program);
dumpAst(astProgram);

const asm = asmHeader().concat(compile(vocabulary, astProgram)).concat(asmFooter(astProgram));
addIndent(asm);
await Deno.writeTextFile(basename + ".asm", asm.join("\n"));

const dasm = Deno.run({ cmd: ["dasm", basename + ".asm", "-o" + basename + ".prg"] });
const dasmStatus = await dasm.status();
if (dasmStatus.success === false) {
    console.log("ERROR: dasm returned an error " + dasmStatus.code);
    Deno.exit(1);
}

const emu = Deno.run({ opt: { stdout: "null" }, cmd: ["x64", "-silent", basename + ".prg"] });
const emuStatus = await emu.status();

console.log("Done");


