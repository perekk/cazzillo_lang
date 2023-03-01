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
    CLOSE_BRACKETS,
    IF,
    EITHER,    
    BLOCK,
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
    FN,
    PARAM_BLOCK,
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
        case TokenType.CLOSE_BRACKETS: return "CLOSE_BRACKETS";
        case TokenType.IF: return "IF";
        case TokenType.EITHER: return "EITHER";
        case TokenType.BLOCK: return "BLOCK";
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
        case TokenType.FN: return "FN";
        case TokenType.PARAM_BLOCK: return "PARAM_BLOCK";

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

function humanReadableFunction(ast: ASTElement): string {
    if (ast.token.type === TokenType.WORD) {
        const defFun = getWordDefinition(ast.context, ast.token.txt);
        if (defFun === undefined) {
            logError(ast.token.loc, `cannot find the word declaration for '${ast.token.txt}'`);
            Deno.exit(1);
        }
        if (defFun.isFunction) {
            if (defFun.ins === undefined) {
                logError(ast.token.loc, `${ast.token.txt} does not have a list of parameters type`);
                Deno.exit(1);
            }
            const ins = defFun.ins?.map(t => humanReadableType(t)).join(",");
            const out = humanReadableType(defFun.out);
            return `(${ins})=>${out}`;
        } else {
            const out = humanReadableType(defFun.valueType);
            return `()=>${out}`;
        }
    } else {
        return humanReadableType(ast.token.valueType);
    }

}

type Location = { row: number, col: number, filename: string }

type Token = {
    type: TokenType;
    valueType?: ValueType;
    txt: string;
    loc: Location;
};

enum InstructionPosition {
    PREFIX,
    INFIX,
    POSTFIX,
}
type VarDefinitionSpec = {
    astElement: ASTElement,
    valueType: ValueType,
    offset: number | undefined,
    isFunction: boolean,
    ins?: ValueType[],
    out?: ValueType
}

type Context = {
    element: ASTElement | undefined,
    varsDefinition: Map<string, VarDefinitionSpec>;
    parent: Context | undefined;
}

function getArity(element: ASTElement): number {

    if (element.token.type === TokenType.WORD) {
        const varDef = getWordDefinition(element.context, element.token.txt);
        if (varDef !== undefined) return varDef.isFunction ? varDef.ins?.length || 0 : 0;
    }

    if (element.instruction === undefined) return 0;
    if (element.instruction.position === InstructionPosition.INFIX) return 2;
    if (element.instruction.position === InstructionPosition.POSTFIX) return 1;
    return element.instruction.arity;
}

function getInstructionPosition(element: ASTElement): InstructionPosition {

    if (element.token.type === TokenType.WORD) {
        const varDef = getWordDefinition(element.context, element.token.txt);
        if (varDef !== undefined) return InstructionPosition.PREFIX;
        return element.instruction.position;
    }

    return element.instruction.position;
}

type Instruction = {
    txt: string;
    arity: number;
    position: InstructionPosition;
    priority: number | undefined;
    userFunction: boolean,
    functionIndex?: number,
    ins: (ast: ASTElement) => Array<ValueType>;
    out?: (ast: ASTElement) => ValueType;
    generateAsm: (ast: ASTElement) => Assembly
    generateChildPreludeAsm?: (ast: ASTElement, childIndex: number) => Assembly
};

type Vocabulary = Map<TokenType, Instruction>;

type AST = ASTElement[];

type ASTElement = {
    token: Token;
    instruction: Instruction;
    childs: AST;
    context: Context;
};

type Listing = Array<Token>;

type Assembly = Array<string>;

function getWordDefinition(context: Context, variableName: string): ({ isGlobalContext: boolean } & VarDefinitionSpec) | undefined {

    const debug = false;
    if (debug) console.log(`searchin ${variableName} in context ${context.parent === undefined ? "global" : context.element?.token.txt ?? "not yet assigned to an element"}`);
    const tryDef = context.varsDefinition.get(variableName);
    if (tryDef !== undefined) {
        if (debug) console.log(`found! ${variableName} in ${ast.token.txt}`);
        return { isGlobalContext: context.parent === undefined, ...tryDef };
    }

    if (context.parent !== undefined) {
        if (debug) console.log(`try with parent`);
        return getWordDefinition(context.parent, variableName);
    } 
    if (debug) console.log(`found nothing`);
    return undefined;
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

function getAsmForSetWordLocal(ast: ASTElement, varType: ValueType, varName: string, offset: number): Assembly {

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

    logError(ast.token.loc, `set word local is not implemented yet for ${humanReadableType(varType)}`);
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

function getAsmForGetWordLocal(ast: ASTElement, varType: ValueType, varName: string, offset: number, isFunction: boolean): Assembly {

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

    logError(ast.token.loc, `get word local is not implemented yet for ${humanReadableType(varType)}`);
    Deno.exit(1);
}

function getReturnTypeOfAWord(ast: ASTElement): ValueType {
    if (ast.token.type === TokenType.WORD) {
        const defWord = getWordDefinition(ast.context, ast.token.txt);
        if (defWord === undefined) {
            logError(ast.token.loc, `cannot find the function declaration for '${ast.token.txt}'`);
            Deno.exit(1);
        }
        if (defWord.isFunction) {
            if (defWord.out === undefined) {
                logError(ast.token.loc, `${ast.token.txt} is a function but does not have a return value (valuetype btw is ${humanReadableType(defWord.valueType)})`);
                Deno.exit(1);
            }
            return defWord.out;
        } else {
            if (defWord.valueType === undefined) {
                logError(ast.token.loc, `${ast.token.txt} is a word but does not have a valuetype`);
                Deno.exit(1);
            }
            return defWord.valueType;
        }

    } else {
        if (ast.token.valueType === undefined) {
            console.log("ast", ast);
            logError(ast.token.loc, `${ast.token.txt} is a ${humanReadableToken(ast.token.type)} but does not have a return value`);
            Deno.exit(1);
        }
        return ast.token.valueType;
    }
}

function createVocabulary(): Vocabulary {
    console.assert(TokenType.TOKEN_COUNT === 36, "Exaustive token types count");
    const voc: Vocabulary = new Map<TokenType, Instruction>();
    voc.set(TokenType.PRINT, {
        txt: "print",
        arity: 1,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: (ast) => {
            const valueType = getReturnTypeOfAWord(ast.childs[0]);
            if (valueType === undefined) {
                logError(ast.token.loc, `cannot determine the type of '${ast.token.txt}'`);
                Deno.exit(1);
            }
            return [valueType];
        },
        out: () => ValueType.VOID,        
        generateAsm: (ast) => {
            console.assert(ValueType.VALUETYPESCOUNT === 6, "Exaustive value types count");
            const valueType = getReturnTypeOfAWord(ast.childs[0]);
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
                logError(ast.token.loc, `print of ${humanReadableType(valueType)} is not supported yet`)
                Deno.exit(1);
            }
        }
    });
    voc.set(TokenType.PRIN, {
        txt: "prin",
        arity: 1,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: (ast) => {
            const valueType = getReturnTypeOfAWord(ast.childs[0]);
            if (valueType === undefined) {
                logError(ast.token.loc, `cannot determine the type of '${ast.token.txt}'`);
                Deno.exit(1);
            }
            return [valueType]
        },
        out: () => ValueType.VOID,        
        generateAsm: (ast) => {
            console.assert(ValueType.VALUETYPESCOUNT === 6, "Exaustive value types count");
            const valueType = getReturnTypeOfAWord(ast.childs[0]);
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
                logError(ast.token.loc, `print of ${humanReadableType(valueType)} is not supported yet`)
                Deno.exit(1);
            }
        }
    });
    voc.set(TokenType.EMIT, {
        txt: "emit",
        arity: 1,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: (ast) => [ValueType.BYTE],
        out: () => ValueType.VOID,        
        generateAsm: (ast) => [
            "JSR POP16",
            "LDA STACKACCESS",
            "JSR $FFD2",
        ],
    });
    voc.set(TokenType.NL, {
        txt: "nl",
        arity: 0,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: (ast) => [],
        out: () => ValueType.VOID,
        generateAsm: () => [
            "LDA #13",
            "JSR $FFD2",
        ],
    });
    voc.set(TokenType.PLUS, {
        txt: "+",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 80,
        userFunction: false,
        ins: (ast) => {
            console.assert(ast.childs.length === 2, "The childs of a plus operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(ast.childs[0]);
            const type2 = getReturnTypeOfAWord(ast.childs[1]);
            if ((type1 === ValueType.BYTE || type1 === ValueType.NUMBER) && (type2 === ValueType.BYTE || type2 === ValueType.NUMBER)) {
                return [type1, type2]
            }
            return [ValueType.NUMBER, ValueType.NUMBER];
        },
        out: () => ValueType.NUMBER,
        generateAsm: (ast) => [
            "JSR ADD16"
        ]
    });
    voc.set(TokenType.MINUS, {
        txt: "-",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 80,
        userFunction: false,
        ins: (ast) => {
            console.assert(ast.childs.length === 2, "The childs of a minus operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(ast.childs[0]);
            const type2 = getReturnTypeOfAWord(ast.childs[1]);
            if ((type1 === ValueType.BYTE || type1 === ValueType.NUMBER) && (type2 === ValueType.BYTE || type2 === ValueType.NUMBER)) {
                return [type1, type2]
            }
            return [ValueType.NUMBER, ValueType.NUMBER];
        },
        out: () => ValueType.NUMBER,
        generateAsm: (ast) => [
            "JSR SUB16"
        ]
    });
    voc.set(TokenType.MULT, {
        txt: "*",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 90,
        userFunction: false,
        ins: (ast) => {
            console.assert(ast.childs.length === 2, "The childs of a multiply operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(ast.childs[0]);
            const type2 = getReturnTypeOfAWord(ast.childs[1]);
            if ((type1 === ValueType.BYTE || type1 === ValueType.NUMBER) && (type2 === ValueType.BYTE || type2 === ValueType.NUMBER)) {
                return [type1, type2]
            }
            return [ValueType.NUMBER, ValueType.NUMBER];
        },
        out: () => ValueType.NUMBER,
        generateAsm: (ast) => [
            "JSR MUL16"
        ]
    });
    voc.set(TokenType.DIV, {
        txt: "/",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 90,
        userFunction: false,
        ins: (ast) => {
            console.assert(ast.childs.length === 2, "The childs of a division operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(ast.childs[0]);
            const type2 = getReturnTypeOfAWord(ast.childs[1]);
            if ((type1 === ValueType.BYTE || type1 === ValueType.NUMBER) && (type2 === ValueType.BYTE || type2 === ValueType.NUMBER)) {
                return [type1, type2]
            }
            return [ValueType.NUMBER, ValueType.NUMBER];
        },
        out: () => ValueType.NUMBER,
        generateAsm: (ast) => [
            "JSR DIV16"
        ]
    });
    voc.set(TokenType.MOD, {
        txt: "%",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 90,
        userFunction: false,
        ins: (ast) => {
            console.assert(ast.childs.length === 2, "The childs of a plus operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(ast.childs[0]);
            const type2 = getReturnTypeOfAWord(ast.childs[1]);
            if ((type1 === ValueType.BYTE || type1 === ValueType.NUMBER) && (type2 === ValueType.BYTE || type2 === ValueType.NUMBER)) {
                return [type1, type2]
            }
            return [ValueType.NUMBER, ValueType.NUMBER];
        },
        out: () => ValueType.NUMBER,
        generateAsm: (ast) => [
            "JSR MOD16"
        ]
    });
    voc.set(TokenType.NOT, {
        txt: "!",
        arity: 1,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: (ast) => {
            console.assert(ast.childs.length === 1, "The childs of a not operand should be 1, compiler error");
            const valueType = getReturnTypeOfAWord(ast.childs[0]);
            if (valueType === ValueType.BYTE || valueType === ValueType.NUMBER || valueType === ValueType.BOOL) return [valueType];
            return [ValueType.NUMBER];
        },
        out: (ast) => {
            console.assert(ast.childs.length === 1, "The childs of a not operand should be 1, compiler error");
            const valueType = getReturnTypeOfAWord(ast.childs[0]);
            if (valueType === ValueType.BYTE || valueType === ValueType.NUMBER || valueType === ValueType.BOOL) return valueType;
            return ValueType.NUMBER;
        },
        generateAsm: (ast) => {
            const valueType = getReturnTypeOfAWord(ast.childs[0]);
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
                logError(ast.token.loc, `value type for 'not' is ${humanReadableType(valueType)} compiler error`);
                Deno.exit(1);
            }


        }
    });
    voc.set(TokenType.LT, {
        txt: "<",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 70,
        userFunction: false,
        ins: (ast) => {
            console.assert(ast.childs.length === 2, "The childs of a less-than operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(ast.childs[0]);
            const type2 = getReturnTypeOfAWord(ast.childs[1]);
            if ((type1 === ValueType.BYTE || type1 === ValueType.NUMBER) && (type2 === ValueType.BYTE || type2 === ValueType.NUMBER)) {
                return [type1, type2]
            }
            return [ValueType.NUMBER, ValueType.NUMBER];
        },
        out: () => ValueType.BOOL,
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
            "STA STACKBASE + 2,X",
            "STX SP16",
        ]
    });
    voc.set(TokenType.EQ, {
        txt: "=",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 70,
        userFunction: false,
        ins: (ast) => {
            console.assert(ast.childs.length === 2, "The childs of a equal operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(ast.childs[0]);
            const type2 = getReturnTypeOfAWord(ast.childs[1]);
            if ((type1 === ValueType.BYTE || type1 === ValueType.NUMBER) && (type2 === ValueType.BYTE || type2 === ValueType.NUMBER)) {
                return [type1, type2]
            }
            return [ValueType.NUMBER, ValueType.NUMBER];
        },

        out: () => ValueType.BOOL,
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
        userFunction: false,
        ins: (ast) => {
            console.assert(ast.childs.length === 2, "The childs of a greater-than operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(ast.childs[0]);
            const type2 = getReturnTypeOfAWord(ast.childs[1]);
            if ((type1 === ValueType.BYTE || type1 === ValueType.NUMBER) && (type2 === ValueType.BYTE || type2 === ValueType.NUMBER)) {
                return [type1, type2]
            }
            return [ValueType.NUMBER, ValueType.NUMBER];
        },
        out: () => ValueType.BOOL,
        generateAsm: (ast) => [
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
    });
    voc.set(TokenType.IF, {
        txt: "if",
        arity: 2,
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
        generateAsm: (ast) => [
            "endblock@:"
        ],
    });
    voc.set(TokenType.EITHER, {
        txt: "either",
        arity: 3,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: ast => {
            console.assert(ast.childs.length === 3, "'Either' should have 3 childs");
            const typeThen = getReturnTypeOfAWord(ast.childs[1]);
            const typeElse = getReturnTypeOfAWord(ast.childs[2]);

            if (typeThen === undefined) {
                logError(ast.childs[1].token.loc, `cannot determine the type of '${ast.childs[1].token.txt}'`);
                Deno.exit(1);
            }
            if (typeElse === undefined) {
                logError(ast.childs[2].token.loc, `cannot determine the type of '${ast.childs[2].token.txt}'`);
                Deno.exit(1);
            }
            if (typeThen !== typeElse) {
                logError(ast.childs[1].token.loc, `the then branch returns '${humanReadableType(typeThen)}'`);
                logError(ast.childs[2].token.loc, `while the 'else' branch returns '${humanReadableType(typeElse)}'`);
                Deno.exit(1);
            }
            return [ValueType.BOOL, typeThen, typeElse];
        },
        out: (ast) => ast.childs[1].token.valueType!,
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
        generateAsm: (ast) => [
            "endblock@:",
        ],
    });
    voc.set(TokenType.OPEN_BRACKETS, {
        txt: "[",
        arity: 0,
        position: InstructionPosition.PREFIX,
        priority: 150,
        userFunction: false,
        ins: () => [],
        out: () => ValueType.VOID,
        generateAsm: (ast) => []
    });
    voc.set(TokenType.CLOSE_BRACKETS, {
        txt: "]",
        arity: 0,
        position: InstructionPosition.POSTFIX,
        priority: 150,
        userFunction: false,
        ins: () => [],
        out: () => ValueType.VOID,
        generateAsm: (ast) => []
    });
    voc.set(TokenType.BLOCK, {
        txt: "",
        arity: 0,
        position: InstructionPosition.PREFIX,
        priority: 150,
        userFunction: false,
        ins: ast => {
            const childNumber = ast.childs.length;
            if (childNumber === 0) return [];
            //return new Array(childNumber).fill(ValueType.VOID);
            return ast.childs.map((child, index) => index === childNumber - 1 ? getReturnTypeOfAWord(child) : ValueType.VOID);
        },
        out: (ast) => {
            if (ast.childs.length === 0) return ValueType.VOID;
            const lastChild = ast.childs[ast.childs.length - 1];
            const valueType = getReturnTypeOfAWord(lastChild);
            if (valueType === undefined) {
                logError(lastChild.token.loc, `cannot determine the type of '${lastChild.token.txt}'`);
                Deno.exit(1);
            }
            return valueType;
        },
        generateAsm: ast => {
            if (ast.context === undefined) {
                logError(ast.token.loc, `can't find context for ${ast.token.txt}, compiler error`);
                Deno.exit(1);
            }
            if (ast.context.varsDefinition.size === 0) return [];
            if (ast.context.element === undefined) return []; // the global context

            let sizeToRelease = 0;
            ast.context.varsDefinition.forEach(varDef => {                
                if (varDef.valueType === ValueType.NUMBER) {
                    sizeToRelease += 2;
                } else if (varDef.valueType === ValueType.STRING) {
                    sizeToRelease += 4;
                } else if (varDef.valueType === ValueType.BYTE) {
                    sizeToRelease += 1;
                } else if (varDef.valueType === ValueType.BOOL) {
                    sizeToRelease += 1;
                } else if (varDef.valueType === ValueType.ADDR) {
                    sizeToRelease += 2;
                } else {                
                    logError(ast.token.loc, `cannot release space on the stack for type ${humanReadableType(varDef.valueType)} yet`);
                    Deno.exit(1);
                }
            });
            return [
                "TSX",
                "TXA",
                "CLC",
                `ADC #${sizeToRelease}`,
                "TAX",
                "TXS"
            ];
        },
        generateChildPreludeAsm: (ast, n) => {
            if (n > 0) return [];
            // at the start we make some space on the stack, for variables
            if (ast.context === undefined) {
                logError(ast.token.loc, `can't find context for ${ast.token.txt}, compiler error`);
                Deno.exit(1);
            }
            if (ast.context.varsDefinition.size === 0) return [];
            if (ast.context.element === undefined) return []; // the global context
            let sizeToReserve = 0;            
            ast.context.varsDefinition.forEach(varDef => {
                varDef.offset = sizeToReserve;
                if (varDef.valueType === ValueType.NUMBER) {
                    sizeToReserve += 2;
                } else if (varDef.valueType === ValueType.STRING) {
                    sizeToReserve += 4;
                } else if (varDef.valueType === ValueType.BYTE) {
                    sizeToReserve += 1;
                } else if (varDef.valueType === ValueType.BOOL) {
                    sizeToReserve += 1;
                } else if (varDef.valueType === ValueType.ADDR) {
                    sizeToReserve += 2;
                } else {
                    logError(ast.token.loc, `cannot reserve space on the stack for type ${humanReadableType(varDef.valueType)} yet`);
                    Deno.exit(1);
                }
            });

            return [
                "TSX",
                "TXA",
                "SEC",
                `SBC #${sizeToReserve}`,
                "TAX",
                "TXS"
            ];
        }
    });
    voc.set(TokenType.SET_WORD, {
        txt: "",
        arity: 1,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: ast => {
            console.assert(ast.childs.length === 1, "'set word' should have one child");
            const child = ast.childs[0];
            const valueType = getReturnTypeOfAWord(child);
            if (valueType === undefined) {
                logError(child.token.loc, `cannot determine the type of '${child.token.txt}'`);
                Deno.exit(1);
            }
            if (valueType === ValueType.VOID) {
                logError(ast.token.loc, `can't store 'void' values in variables`);
                Deno.exit(1);
            }
            const varDef = getWordDefinition(ast.context, ast.token.txt);
            if (varDef === undefined) {
                logError(ast.token.loc, `can't find variable definition for '${ast.token.txt}', compiler error`);
                Deno.exit(1);
            }
            return [varDef.valueType];
        },
        out: () => ValueType.VOID,
        generateAsm: ast => {
            const varName = ast.token.txt;
            const varDef = getWordDefinition(ast.context, varName);
            if (varDef === undefined) {
                logError(ast.token.loc, `cannot find declaration for '${varName}', compiler error`);
                Deno.exit(1);
            }
            if (varDef.isGlobalContext) return getAsmForSetWordGlobal(ast.token, varDef.valueType, varName);

            if (varDef.offset === undefined) {
                logError(ast.token.loc, `SET_WORD generateAsm can't compute the offset of '${varName}' onto the stack, compiler error`);
                Deno.exit(1);
            }
            return getAsmForSetWordLocal(ast, varDef.valueType, varName, varDef.offset);            
        },
    });
    voc.set(TokenType.LIT_WORD, {
        txt: "",
        arity: 1,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: ast => {
            console.assert(ast.childs.length === 1, "'lit word' should have one child");
            const child = ast.childs[0];
            const valueType = getReturnTypeOfAWord(child);
            if (valueType === undefined) {
                logError(child.token.loc, `cannot determine the type of '${child.token.txt}'`);
                Deno.exit(1);
            }
            if (valueType === ValueType.VOID) {
                logError(ast.token.loc, `can't store 'void' values in variables`);
                Deno.exit(1);
            }
            return [valueType];
        },
        out: () => ValueType.VOID,
        generateAsm: ast => {
            const varName = ast.token.txt;
            const varDef = getWordDefinition(ast.context, varName);
            if (varDef === undefined) {
                logError(ast.token.loc, `LIT_WORD generateAsm cannot find declaration for '${varName}', compiler error`);
                Deno.exit(1);
            }
            if (varDef.isGlobalContext) return getAsmForSetWordGlobal(ast.token, varDef.valueType, varName);

            if (varDef.offset === undefined) {
                logError(ast.token.loc, `LIT_WORD generateAsm can't compute the offset of '${varName}' onto the stack, compiler error`);
                Deno.exit(1);
            }
            return getAsmForSetWordLocal(ast, varDef.valueType, varName, varDef.offset);            
        },
    });
    voc.set(TokenType.WORD, {
        txt: "",
        arity: 0,
        position: InstructionPosition.PREFIX,
        priority: 10,        
        userFunction: false,
        ins: (ast) => {
            const funcDef = getWordDefinition(ast.context, ast.token.txt);
            if (ast.token.valueType === ValueType.ADDR) {
                if (funcDef === undefined) {
                    logError(ast.token.loc, `cannot find definition for function '${ast.token.txt}', compiler error`);
                    Deno.exit(1);
                }
                if (funcDef.ins === undefined) {
                    logError(ast.token.loc, `the function '${ast.token.txt}' should have a list of parameters type, compiler error`);
                    Deno.exit(1);
                }
                return funcDef.ins;
            }
            return [];
        },
        out: ast => {
            const varName = ast.token.txt;
            const varDef = getWordDefinition(ast.context, varName);
            if (ast.token.valueType === ValueType.ADDR) {
                if (varDef === undefined) {
                    logError(ast.token.loc, `cannot find definition for function '${ast.token.txt}', compiler error`);
                    Deno.exit(1);
                }
                if (varDef.out === undefined) {
                    logError(ast.token.loc, `the function '${ast.token.txt}' should return a type value, compiler error`);
                    Deno.exit(1);
                }
                return varDef.out;
            } else {
                if (varDef !== undefined) return varDef.valueType;
                logError(ast.token.loc, `word '${varName}' not defined`);
                Deno.exit(1);
            }
        },
        generateAsm: ast => {
            const varName = ast.token.txt;
            const varDef = getWordDefinition(ast.context, varName);
            if (varDef === undefined) {
                logError(ast.token.loc, `cannot find declaration for '${varName}', compiler error`);
                Deno.exit(1);
            }
            //const valueType = ast.token.valueType === ValueType.ADDR ? varDef.out : varDef.valueType;
            const valueType = varDef.valueType;
            if (valueType === undefined) {
                logError(ast.token.loc, `cannot determine the result type of function '${varName}', compiler error`);
                Deno.exit(1);
            }

            if (varDef.isGlobalContext) return getAsmForGetWordGlobal(ast.token, valueType, varName, varDef.isFunction);

            if (varDef.offset === undefined) {
                logError(ast.token.loc, `WORD generateAsm can't compute the offset of '${varName}' onto the stack, compiler error`);
                Deno.exit(1);
            }
            return getAsmForGetWordLocal(ast, valueType, varName, varDef.offset, varDef.isFunction);
        }
    });
    voc.set(TokenType.WHILE, {
        txt: "while",
        arity: 2,
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
        generateAsm: (ast) => [
            "JMP startloop@",
            "endblock@:",
        ],
    });
    voc.set(TokenType.POKE, {
        txt: "poke",
        arity: 2,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: () => [ValueType.NUMBER, ValueType.BYTE],
        out: () => ValueType.VOID,
        generateAsm: (ast) => [
            "JSR POP16",
            "LDY STACKACCESS",
            "JSR POP16",
            "TYA",
            "LDY #0",
            "STA (STACKACCESS),Y"
        ]
    });
    voc.set(TokenType.PEEK, {
        txt: "peek",
        arity: 1,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: () => [ValueType.NUMBER],
        out: () => ValueType.BYTE,
        generateAsm: (ast) => [
            "JSR POP16",
            "LDY #0",
            "LDA (STACKACCESS),Y",
            "STA STACKACCESS",
            "STY STACKACCESS+1",
            "JSR PUSH16"
        ]
    });
    voc.set(TokenType.CAST_BYTE, {
        txt: "!<",
        arity: 1,
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
    });
    voc.set(TokenType.CAST_NUMBER, {
        txt: "!n",
        arity: 1,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: () => [ValueType.BYTE],
        out: () => ValueType.NUMBER,
        generateAsm: () => []
    });
    voc.set(TokenType.NUMBER, {
        txt: "Number",
        arity: 0,
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
    });
    voc.set(TokenType.STRING, {
        txt: "String",
        arity: 0,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: () => [],
        out: () => ValueType.STRING,
        generateAsm: () => []
    });
    voc.set(TokenType.BYTE, {
        txt: "Byte",
        arity: 0,
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
    });
    voc.set(TokenType.BOOL, {
        txt: "Bool",
        arity: 0,
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
    });
    voc.set(TokenType.STR_JOIN, {
        txt: ".",
        arity: 2,
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
    });
    voc.set(TokenType.HEAP, {
        txt: "heap",
        arity: 0,
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
    });
    voc.set(TokenType.STR_LEN, {
        txt: "#",
        arity: 0,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: () => [ValueType.STRING],
        out: () => ValueType.BYTE,
        generateAsm: () => [
            "JSR POP16",
        ]
    });
    voc.set(TokenType.FN, {
        txt: "fn",
        arity: 1,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: ast => {
            console.assert(ast.childs.length === 1, "'fn' should have one parameter");
            if (ast.childs[0].token.valueType === undefined) {
                logError(ast.token.loc, `can't determine the output value for function`);
                Deno.exit(1);
            }
            return [ast.childs[0].token.valueType];
        },
        out: () => ValueType.ADDR,
        generateChildPreludeAsm: (ast, n) => {
            if (n === 0) {
                ast.instruction.functionIndex = getFunctionIndex();
                const asmFunctionName = getFunctionName(ast.instruction.functionIndex);
                const asmAfterFunctionName = getAfterFunctionName(ast.instruction.functionIndex);
                return [
                    `JMP ${asmAfterFunctionName}`,
                    `${asmFunctionName}:`,
                ];
            }
            logError(ast.token.loc, `'fn should have only one parameter'`);
            Deno.exit(1);
        },
        generateAsm: (ast) => {
            const asmFunctionName = getFunctionName(ast.instruction.functionIndex!);
            const asmAfterFunctionName = getAfterFunctionName(ast.instruction.functionIndex!);
            return [
                `RTS`,
                `${asmAfterFunctionName}:`,
                `LDA #<${asmFunctionName}`,
                "STA STACKACCESS",
                `LDA #>${asmFunctionName}`,
                "STA STACKACCESS + 1",
                "JSR PUSH16",
            ];
        },
    });
    voc.set(TokenType.PARAM_BLOCK, {
        txt: "",
        arity: 0,
        position: InstructionPosition.PREFIX,
        priority: 150,
        userFunction: false,
        ins: ast => {
            const childNumber = ast.childs.length;
            if (childNumber === 0) return [];
            //return new Array(childNumber).fill(ValueType.VOID);
            return ast.childs.map((child, index) => index === childNumber - 1 ? getReturnTypeOfAWord(child) : ValueType.VOID);
        },
        out: (ast) => {
            if (ast.childs.length === 0) return ValueType.VOID;
            const lastChild = ast.childs[ast.childs.length - 1];
            const valueType = getReturnTypeOfAWord(lastChild);
            if (valueType === undefined) {
                logError(lastChild.token.loc, `cannot determine the type of '${lastChild.token.txt}'`);
                Deno.exit(1);
            }
            return valueType;
        },
        generateAsm: ast => {
            if (ast.context === undefined) {
                logError(ast.token.loc, `can't find context for ${ast.token.txt}, compiler error`);
                Deno.exit(1);
            }
            if (ast.context.varsDefinition.size === 0) return [];
            if (ast.context.element === undefined) return []; // the global context

            let sizeToRelease = 0;
            ast.context.varsDefinition.forEach(varDef => {
                if (varDef.valueType === ValueType.NUMBER) {
                    sizeToRelease += 2;
                } else if (varDef.valueType === ValueType.STRING) {
                    sizeToRelease += 4;
                } else if (varDef.valueType === ValueType.BYTE) {
                    sizeToRelease += 1;
                } else if (varDef.valueType === ValueType.BOOL) {
                    sizeToRelease += 1;
                } else if (varDef.valueType === ValueType.ADDR) {
                    sizeToRelease += 2;
                } else {
                    logError(ast.token.loc, `cannot release space on the stack for type ${humanReadableType(varDef.valueType)} yet`);
                    Deno.exit(1);
                }
            });
            return [
                "TSX",
                "TXA",
                "CLC",
                `ADC #${sizeToRelease}`,
                "TAX",
                "TXS"
            ];
        },
        generateChildPreludeAsm: (ast, n) => {
            // in param_block the first child is the penultimate
            const indexFirstChild = ast.childs.length - 2;
            if (n !== indexFirstChild) return [];
            // at the start we make some space on the stack, for variables
            if (ast.context === undefined) {
                logError(ast.token.loc, `can't find context for ${ast.token.txt}, compiler error`);
                Deno.exit(1);
            }
            if (ast.context.varsDefinition.size === 0) return [];
            if (ast.context.element === undefined) return []; // the global context
            let sizeToReserve = 0;
            ast.context.varsDefinition.forEach(varDef => {
                varDef.offset = sizeToReserve;
                if (varDef.valueType === ValueType.NUMBER) {
                    sizeToReserve += 2;
                } else if (varDef.valueType === ValueType.STRING) {
                    sizeToReserve += 4;
                } else if (varDef.valueType === ValueType.BYTE) {
                    sizeToReserve += 1;
                } else if (varDef.valueType === ValueType.BOOL) {
                    sizeToReserve += 1;
                } else if (varDef.valueType === ValueType.ADDR) {
                    sizeToReserve += 2;
                } else {
                    logError(ast.token.loc, `cannot reserve space on the stack for type ${humanReadableType(varDef.valueType)} yet`);
                    Deno.exit(1);
                }
            });

            return [
                "TSX",
                "TXA",
                "SEC",
                `SBC #${sizeToReserve}`,
                "TAX",
                "TXS",
                "; NOW WE SHOULD GRAB THE PARAMS VALUE FROM THE STACK"
            ];
        }
    });
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
    for (const [tokenType, instr] of vocabulary) {
        if (txt === instr.txt) return { type: tokenType, literalType: undefined };
    }
    if (txt.match(/^-?\d+$/)) {
        if (parseInt(txt) < 256) {
            return { type: TokenType.LITERAL, literalType: ValueType.BYTE };
        } else {
            return { type: TokenType.LITERAL, literalType: ValueType.NUMBER };
        }
    }
    if (txt[0] === '"' && txt[txt.length - 1] === '"') return { type: TokenType.LITERAL, literalType: ValueType.STRING };
    if (txt[txt.length - 1] === ":") return { type: TokenType.SET_WORD, literalType: undefined };
    if (txt[0] === "'") return { type: TokenType.LIT_WORD, literalType: undefined };
    if (txt === "true" || txt === "false") return { type: TokenType.LITERAL, literalType: ValueType.BOOL };

    return { type: TokenType.WORD, literalType: undefined };
}

function getInstructionForToken(vocabulary: Vocabulary, context: Context, token: Token): Instruction {

    if (token.type === TokenType.LITERAL) {
        return {
            arity: 0,
            ins: () => [],
            out: () => { return token.valueType! },
            generateAsm: compileLiteral,
            position: InstructionPosition.PREFIX,
            userFunction: false,
            priority: 10,
            txt: token.txt,
            generateChildPreludeAsm: () => []
        };
    } else if (token.type === TokenType.WORD) {
        const varDef = getWordDefinition(context, token.txt);
        if (varDef === undefined) {
            return {
                arity: 0,
                ins: () => [],
                out: (ast) => {
                    // the return value will be generated in the future
                    const varDef = getWordDefinition(ast.context, ast.token.txt);
                    if (varDef?.isFunction) return varDef.out!;
                    return varDef?.valueType!;
                },
                generateAsm: vocabulary.get(TokenType.WORD)?.generateAsm!,
                position: InstructionPosition.PREFIX,
                priority: 10,
                userFunction: false,
                txt: token.txt,
                generateChildPreludeAsm: vocabulary.get(TokenType.WORD)?.generateChildPreludeAsm,
            };
        }
        const wordInstruction = vocabulary.get(TokenType.WORD)!;
        if (varDef.isFunction) {
            return {
                arity: varDef.ins?.length!,
                ins: () => varDef.ins!,
                out: () => varDef.out!,
                generateAsm: wordInstruction.generateAsm,
                position: InstructionPosition.PREFIX,
                userFunction: true,
                priority: 10,
                txt: token.txt + "()",
                generateChildPreludeAsm: wordInstruction.generateChildPreludeAsm
            };
        }
        return {
            arity: 0,
            ins: () => [],
            out: () => varDef.out!,
            generateAsm: wordInstruction.generateAsm,
            position: InstructionPosition.PREFIX,
            userFunction: false,
            priority: 10,
            txt: token.txt,
            generateChildPreludeAsm: wordInstruction.generateChildPreludeAsm
        };
    } else if (vocabulary.has(token.type)) {
        return vocabulary.get(token.type)!;
    } else {
        logError(token.loc, `unknown token '${token.txt}'`);
        Deno.exit(1);
    }

}

let sourceCode: string;
async function tokenizer(filename: string, vocabulary: Vocabulary): Promise<Listing> {

    sourceCode = await Deno.readTextFile(filename);
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
        } else if (tokenType.type === TokenType.SET_WORD) {
            tokenText = tokenText.substring(0, tokenText.length - 1);
        } else if (tokenType.type === TokenType.LIT_WORD) {
            tokenText = tokenText.substring(1);
        }
        ret.push({ type: tokenType.type, txt: tokenText, loc, valueType: tokenType.literalType });
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
            } else if (char === "[") {
                const loc = { row, col, filename };
                ret.push({ type: TokenType.OPEN_BRACKETS, txt: "[", loc });
            } else if (char === "]") {
                if (tokenStart > -1) {
                    // space but was parsing a word
                    pushToken(sourceCode.substring(tokenStart, index));
                    tokenStart = -1;
                    colStart = -1;
                }
                const loc = { row, col, filename };
                ret.push({ type: TokenType.CLOSE_BRACKETS, txt: "]", loc });
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

function parse(vocabulary: Vocabulary, program: Listing, filename: string): ASTElement {
    let currentContext: Context = { parent: undefined, element: undefined, varsDefinition: new Map<string, VarDefinitionSpec>() };
    const ast: AST = [];
    const stack: { pos: number, context: Context }[] = [];
    for (let j = 0; j < program.length; j++) {
        const token = program[j];
        if (token.type === TokenType.OPEN_BRACKETS) {
            stack.push({ pos: ast.length, context: currentContext });
            currentContext = { parent: currentContext, element: undefined, varsDefinition: new Map() };
        } else if (token.type === TokenType.CLOSE_BRACKETS) {
            const state = stack.pop();
            if (state === undefined) {
                logError(token.loc, "close brackets not bilanced");
                Deno.exit(1);
            }
            const matchingIndex = state.pos;            
            const matchingToken = program[matchingIndex];
            const sequence = ast.splice(matchingIndex, j - matchingIndex + 1);  
            const childs = parseBlock(sequence);
            const blockToken = { type: TokenType.BLOCK, loc: matchingToken.loc, txt: "[" + sequence.map(t => t.token.txt).join(" ") + "]" };
            const block: ASTElement = {
                token: blockToken,
                instruction: getInstructionForToken(vocabulary, currentContext, blockToken),
                childs,
                context: currentContext
            };
            currentContext.element = block;

            ast.push(block);
            currentContext = state.context;
        } else {
            ast.push({
                token,
                instruction: getInstructionForToken(vocabulary, currentContext, token),
                childs: [],                
                context: currentContext
            });
        }

    }

    const state = stack.pop();
    if (state !== undefined) {
        const token = program[state.pos];
        logError(token.loc, "open brackets not bilanced");
        Deno.exit(1);
    }

    const childs = parseBlock(ast);

    const topLevelToken = {
        loc: { col: 1, row: 1, filename },
        txt: "[prog]",
        type: TokenType.BLOCK,
        valueType: ValueType.VOID
    };

    return {
        token: topLevelToken,
        instruction: getInstructionForToken(vocabulary, currentContext, topLevelToken),
        childs: childs,
        context: currentContext
    } as ASTElement;

}

function groupFunctionToken(ast: AST, index: number): ASTElement {
    const functionElement = ast[index];
    const functionPosition = getInstructionPosition(functionElement);
    let childs: AST;
    let startPos: number;
    let currentChildsNumber = functionElement.childs.length;
    if (functionPosition === InstructionPosition.INFIX) {
        if (currentChildsNumber > 0) {
            logError(functionElement.token.loc, `Cannot rebalance tree for infix operator yet`);
            Deno.exit(1);
        }
        if (index + 1 > ast.length - 1) {
            logError(functionElement.token.loc, `the operator ${functionElement.instruction.txt} expects 2 parameters, but one got!`);
            Deno.exit(1);
        }
        // check the second parameter 
        const secondParameterArity = getArity(ast[index + 1]);
        if (secondParameterArity > 0 && ast[index + 1].childs.length !== secondParameterArity) {
            groupFunctionToken(ast, index + 1);
        }
        childs = [ast[index - 1], ast[index + 1]];
        startPos = index - 1;
    } else if (functionPosition === InstructionPosition.POSTFIX) {
        if (currentChildsNumber > 0) {
            logError(functionElement.token.loc, `Cannot rebalance tree for postfix operator yet`);
            Deno.exit(1);
        }
        childs = [ast[index - 1]];
        startPos = index - 1;
    } else {
        const arity = getArity(functionElement);
        const arityToGrab = arity - currentChildsNumber;
        childs = ast.slice(index + 1, index + 1 + arityToGrab);
        if (childs.length !== arityToGrab) {
            logError(functionElement.token.loc, `the function ${functionElement.instruction.txt} expects ${arity} parameters, but got only ${childs.length + currentChildsNumber}!`);
            Deno.exit(1);
        }
        startPos = index;
    }
    //const toInsert = { ...functionElement, childs };    
    functionElement.childs = functionElement.childs.concat(childs);
    ast.splice(startPos, childs.length + 1, functionElement);
    return functionElement;
}

function parseBlock(ast: AST): AST {

    const priorityList = [...new Set(ast
        .filter(element => element.instruction !== undefined && element.instruction.priority !== undefined)
        .map(element => element.instruction.priority)
        .sort((a, b) => (b ?? 0) - (a ?? 0))
    )];

    for (let i = 0; i < priorityList.length; i++) {
        const priority = priorityList[i];
        for (let j = ast.length - 1; j >= 0; j--) {
            const element = ast[j];
            if (element.token.type === TokenType.LITERAL) continue;
            if (element.token.type === TokenType.OPEN_BRACKETS || element.token.type === TokenType.CLOSE_BRACKETS) {
                logError(element.token.loc, `found open or closed brackets in parse, compiler error`);
                Deno.exit(1);
            }

            const arity = getArity(element);
            if (!element.instruction || arity === 0) continue;
            if (element.childs.length === arity) continue;
            if (element.instruction.priority !== priority) continue;

            const functionGroup = groupFunctionToken(ast, j);
            if (element.instruction.position !== InstructionPosition.PREFIX) j = j - 1; // we already taken as child the token before this
        }
    }

    return ast;
}

function traverseAST(currentElement: ASTElement, f: (ast: ASTElement, index: number, sequence: AST | undefined) => boolean, childsFirst: boolean, index: number, sequence: AST | undefined) {
    if (!childsFirst) {
        const ret = f.call({}, currentElement, index, sequence);
        if (ret) return;
    }
    for (let i = 0; i < currentElement.childs.length; i++) {
        const sequenceLenBefore = currentElement.childs.length;
        traverseAST(currentElement.childs[i], f, childsFirst, i, currentElement.childs);
        const sequenceLenAfter = currentElement.childs.length;
        if (sequenceLenAfter < sequenceLenBefore) i = i - (sequenceLenBefore - sequenceLenAfter);
    }
    if (childsFirst) f.call({}, currentElement, index, sequence);
}

function calculateTypes(ast: ASTElement) {    
    traverseAST(ast, element => {
        if (element.token.valueType !== undefined) return false;
        const typesExpected = element.instruction.ins(element);
        if (typesExpected === undefined) {
            logError(ast.token.loc, `instruction ${element.token.txt} does not return the correct input params, returns undefined, compiler error`);
            console.log("ins = " + element.instruction.ins.toString());
            Deno.exit(1);
        }
        if (typesExpected.length !== element.childs.length) {
            logError(element.token.loc, `calculateTypes: the number of parameters expected for '${element.token.txt}' is ${typesExpected.length} but got ${element.childs.length}`);
            Deno.exit(1);
        }
        for (let i = 0; i < typesExpected.length; i++) {
            if (typesExpected[i] !== getReturnTypeOfAWord(element.childs[i])) {
                logError(element.childs[i].token.loc, `calculateTypes: The token '${element.childs[i].token.txt}' is expected to be ${humanReadableType(typesExpected[i])} but got ${humanReadableType(getReturnTypeOfAWord(element.childs[i]))}`);
                Deno.exit(1);
            }
        }
        element.token.valueType = element.instruction.out?.(element);
        if (element.token.type === TokenType.LIT_WORD) {
            if (element.context === undefined) {
                logError(element.token.loc, `calculateTypes: The token '${element.token.txt}' does not have a context, compiler error`);
                Deno.exit(1);
            }
            if (element.childs[0].token.valueType === ValueType.ADDR) {
                // 'name                  element
                //   fn                   element.childs[0]
                //     [... params]       element.childs[0].childs[0] paramBlock
                //       [... body]       element.childs[0].childs[0].childs[0]

                if (element.childs[0].token.type !== TokenType.FN) {
                    logError(ast.token.loc, `calculateTypes: cannot find the 'fn' word of '${element.token.txt}', compiler error`);
                    Deno.exit(1);
                }

                const paramBlock = element.childs[0].childs[0];
                if (paramBlock === undefined || paramBlock.token.type !== TokenType.BLOCK) {
                    logError(ast.token.loc, `calculateTypes: cannot find the param block of '${element.token.txt}', compiler error`);
                    Deno.exit(1);
                }
                const returningValueType = paramBlock.token.valueType;
                if (returningValueType === undefined) {
                    logError(ast.token.loc, `calculateTypes: cannot determine the return value of '${element.token.txt}', compiler error`);
                    Deno.exit(1);
                }

                const bodyBlock = paramBlock.childs.at(-1)!;
                let ins: ValueType[] = [];
                if (bodyBlock && bodyBlock.token.type === TokenType.BLOCK) {
                    // there is a param block
                    if (paramBlock.context === undefined) {
                        logError(ast.token.loc, `calculateTypes: the param block of '${element.token.txt}' is undefined, compiler error`);
                        Deno.exit(1);
                    }
                    paramBlock.token.type = TokenType.PARAM_BLOCK;
                    paramBlock.instruction = vocabulary.get(TokenType.PARAM_BLOCK)!;
                    paramBlock.context?.varsDefinition.forEach((varDef, key) => ins.push(varDef.valueType));
                }

                element.context.varsDefinition.set(
                    element.token.txt, {
                    astElement: element,
                    valueType: ValueType.ADDR,
                    isFunction: true,
                    ins,
                    out: returningValueType,
                    offset: undefined
                });

            } else {
                element.context.varsDefinition.set(
                    element.token.txt, {
                    astElement: element,
                    isFunction: false,
                    valueType: typesExpected[0],
                    offset: undefined
                });
            }

        }
        return false;
    }, true, 0, undefined);
}

function rebalanceTreeOLD(ast: ASTElement) {
    // now we have all the declaration, we know the arity of each function declared
    // 
    console.log("REBALANCE TREE ---------- ");
    let keepAsChild = 0;
    let parentToAssign: ASTElement | undefined;

    traverseAST(ast, (element, index, sequence) => {
        if (keepAsChild > 0) {
            console.log("KEEP as CHILD " + element.token.txt);
            if (parentToAssign === undefined) {
                logError(element.token.loc, `cannot rebalance tree, the parent node is undefined`);
                Deno.exit(1);
            }

            const inputsExpected = parentToAssign.instruction.ins(parentToAssign);
            if (inputsExpected === undefined) {
                logError(parentToAssign.token.loc, `cannot determine the expected types for ${parentToAssign?.token.txt}`);
                Deno.exit(1);
            }
            const paramIndex = inputsExpected.length - keepAsChild;
            const inputExpected = inputsExpected.at(paramIndex);
            if (inputExpected === undefined) {
                logError(parentToAssign.token.loc, `cannot determine the expected type for the parameter at ${paramIndex + 1} position for function '${parentToAssign.token}'`);
                Deno.exit(1);
            }

            if (element.token.valueType !== inputExpected) {
                logError(element.token.loc, `the function ${parentToAssign?.token.txt} expects '${element.token.txt}' to be ${humanReadableType(inputExpected)}, but is ${humanReadableType(element.token.valueType)}`);
                Deno.exit(1);
            }
            keepAsChild--;
            const child = sequence?.splice(index, 1);
            if (child === undefined || child.length !== 1) {
                logError(ast.token.loc, `cannot detach element ${element.token.txt} from ast tree`);
                Deno.exit(1);
            }
            parentToAssign?.childs.push(child[0]);

            if (keepAsChild === 0 && parentToAssign?.childs.length !== parentToAssign.instruction.arity) {
                logError(element.token.loc, `the function ${parentToAssign?.token.txt} expects ${parentToAssign.instruction.arity} arguments, got ${parentToAssign?.childs.length}`);
                Deno.exit(1);
            }

            return true;
        }
        if (element.token.type === TokenType.WORD) {
            console.log("word found: ", element.token.txt);
            const wordDef = getWordDefinition(element.context, element.token.txt);
            if (!wordDef) {
                logError(ast.token.loc, `rebalanceTree: word ${element.token.txt} is not defined`);
                Deno.exit(1);
            }
            element.instruction.arity = wordDef.ins?.length!;
            element.instruction.ins = () => wordDef.ins!;
            element.instruction.userFunction = wordDef.isFunction;
            const outType = wordDef.isFunction ? wordDef.out! : wordDef.valueType;
            if (outType === undefined) {
                logError(ast.token.loc, `the return type of ${element.token.txt} is undefined!`);
                console.log(wordDef);
                Deno.exit(1);
            }
            element.instruction.out = () => wordDef.isFunction ? wordDef.out! : wordDef.valueType;
            element.instruction.position = InstructionPosition.PREFIX;
            element.instruction.priority = 10;
            if (wordDef.isFunction) {
                console.log("is a function!");
                if (wordDef.ins?.length !== element.childs.length) {
                    console.log("Huston we have a problem");
                    console.log("child length", element.childs.length);
                    console.log("param length", wordDef.ins?.length);
                    keepAsChild = wordDef.ins?.length!;
                    parentToAssign = element;
                }
            }
        }
        return false;
    }, false, 0, undefined);

    if (keepAsChild !== 0) {
        if (parentToAssign === undefined) {
            logError(ast.token.loc, `error during re-balance tree`);
            Deno.exit(1);
        }
        if (parentToAssign.childs.length !== parentToAssign.instruction.arity) {
            logError(parentToAssign.token.loc, `the function ${parentToAssign.token.txt} expects ${parentToAssign.instruction.arity} arguments, got ${parentToAssign?.childs.length}`);
            Deno.exit(1);
        }
    }

    console.log("END REBALANCE ---------- ");
}

function rebalanceTree(ast: ASTElement) {
    // now we have all the declaration, we know the arity of each function declared
    // 
    console.log("REBALANCE TREE ---------- ");

    function needRebalance(element: ASTElement): boolean {
        if (element.token.type === TokenType.WORD) {
            console.log("word found: ", element.token.txt);
            const wordDef = getWordDefinition(element.context, element.token.txt);
            if (!wordDef) {
                logError(ast.token.loc, `rebalanceTree: word ${element.token.txt} is not defined`);
                Deno.exit(1);
            }
            element.instruction.arity = wordDef.ins?.length!;
            element.instruction.ins = () => wordDef.ins!;
            element.instruction.userFunction = wordDef.isFunction;
            const outType = wordDef.isFunction ? wordDef.out! : wordDef.valueType;
            if (outType === undefined) {
                logError(ast.token.loc, `the return type of ${element.token.txt} is undefined!`);
                console.log(wordDef);
                Deno.exit(1);
            }
            element.instruction.out = () => wordDef.isFunction ? wordDef.out! : wordDef.valueType;
            element.instruction.position = InstructionPosition.PREFIX;
            element.instruction.priority = 10;
            if (wordDef.isFunction) {
                console.log("is a function!");
                if (wordDef.ins?.length !== element.childs.length) {
                    console.log("Huston we have a problem");
                    console.log("child length", element.childs.length);
                    console.log("param length", wordDef.ins?.length);
                    return true
                }
            }
        }
        return false;
    }

    traverseAST(ast, (element, index, sequence) => {
        for (let i = 0; i < element.childs.length; i++) {
            const child = element.childs[i];
            if (needRebalance(child)) {
                // if (sequence === undefined) {
                //     logError(child.token.loc, `the function call ${child.token.txt} needs to be rebalanced, but it does not have a sequence, could be possible?`);
                //     Deno.exit(1);
                // }
                // const problematicChild = element.childs.splice(i, 1);
                // sequence.splice(index + 1, 0, ...problematicChild);
                // const rebalancedChilds = parseBlock(sequence);
                // sequence = rebalancedChilds;
                const rebalancedChilds = parseBlock(element.childs);
                element.childs = rebalancedChilds;
                break;
            }
        }
        return false;
    }, true, 0, undefined);

    console.log("END REBALANCE ---------- ");
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

function compileLiteral(ast: ASTElement): Assembly {
    let ret: Assembly = [];
    console.assert(ValueType.VALUETYPESCOUNT === 6, "Exaustive value types count");
    if (ast.token.valueType === ValueType.NUMBER) {
        ret.push(`; ${ast.token.loc.row}:${ast.token.loc.col} NUMBER VAL ${ast.token.txt}`);
        const MSB = (parseInt(ast.token.txt, 10) >> 8) & 255;
        ret.push(`LDA #${MSB}`);
        ret.push(`STA STACKACCESS+1`);
        const LSB = parseInt(ast.token.txt, 10) & 255;
        ret.push(`LDA #${LSB}`);
        ret.push(`STA STACKACCESS`);
        ret.push(`JSR PUSH16`);

    } else if (ast.token.valueType === ValueType.BYTE) {
        ret.push(`; ${ast.token.loc.row}:${ast.token.loc.col} BYTE VAL ${ast.token.txt}`);
        const LSB = parseInt(ast.token.txt, 10) & 255;
        ret.push(`LDA #${LSB}`);
        ret.push(`STA STACKACCESS`);
        ret.push(`LDA #0`);
        ret.push(`STA STACKACCESS+1`);
        ret.push(`JSR PUSH16`);


    } else if (ast.token.valueType === ValueType.STRING) {
        ret.push(`; ${ast.token.loc.row}:${ast.token.loc.col} STRING VAL ${ast.token.txt}`);
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

    } else if (ast.token.valueType === ValueType.BOOL) {
        ret.push(`; ${ast.token.loc.row}:${ast.token.loc.col} BOOL VAL ${ast.token.txt}`);
        ret.push(`LDA #${ast.token.txt === "true" ? "1" : "0"}`);
        ret.push(`STA STACKACCESS`);
        ret.push(`LDA #0`);
        ret.push(`STA STACKACCESS+1`);
        ret.push(`JSR PUSH16`);
    } else if (ast.token.valueType === ValueType.ADDR) {
        logError(ast.token.loc, `'Addr' should not be compiled as a value, compiler error`);
        Deno.exit(1);
    } else if (ast.token.valueType === ValueType.VOID) {
        logError(ast.token.loc, `'Void' should not be compiled as a value, compiler error`);
        Deno.exit(1);
    } else {
        logError(ast.token.loc, `compiling the type '${ast.token.valueType}' is not supported yet`);
        Deno.exit(1);
    }

    return ret;
}

function compile(ast: ASTElement): Assembly {

    let ret: Assembly = [];
    if (ast.token.type === TokenType.PARAM_BLOCK) {
        for (let i = ast.childs.length - 2; i >= 0; i--) {
            console.log("compiling param " + ast.childs[i].token.txt);
            if (ast.instruction.generateChildPreludeAsm) {
                ret = ret.concat(ast.instruction.generateChildPreludeAsm(ast, i));
            }
            ret = ret.concat(compile(ast.childs[i]))
        }
        if (ast.instruction.generateChildPreludeAsm) ret = ret.concat(ast.instruction.generateChildPreludeAsm(ast, ast.childs.length - 1));
        ret = ret.concat(compile(ast.childs[ast.childs.length - 1]))

        /*
         for (let i = 0; i < ast.childs.length; i++) {
             if (ast.instruction.generateChildPreludeAsm) {
                 ret = ret.concat(ast.instruction.generateChildPreludeAsm(ast, i));
             }
             ret = ret.concat(compile(ast.childs[i]))
         }
         */

    } else {
        for (let i = 0; i < ast.childs.length; i++) {
            if (ast.instruction.generateChildPreludeAsm) {
                ret = ret.concat(ast.instruction.generateChildPreludeAsm(ast, i));
            }
            ret = ret.concat(compile(ast.childs[i]))
        }
    }

    // lets' compile for real        
    if (ast.token.type === TokenType.LITERAL) {
        ret = ret.concat(compileLiteral(ast));
    } else {
        const loc = `${ast.token.loc.row}: ${ast.token.loc.col}`;
        const wordtype = humanReadableFunction(ast);
        const tokenType = humanReadableToken(ast.token.type);
        ret.push(`; ${loc} ${tokenType} ${ast.token.txt} type: ${wordtype}`);
        ret = ret.concat(ast.instruction.generateAsm(ast));
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

function asmFooter(ast: ASTElement): Assembly {
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
        "BCC COPY_NO_CARRY1",
        "INC FROMADD + 2",
        "COPY_NO_CARRY1:",
        "INC TOADD + 1",
        "BCC COPY_NO_CARRY2",
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
    ast.context?.varsDefinition.forEach((value, key) => {
        const variableName = "V_" + key;
        if (value.astElement.instruction.ins.length === 0) {
            logError(value.astElement.token.loc, `cannot determine the value type stored in word '${value.astElement.token.txt}', it does not have inputs value types`);
            Deno.exit(1);
        }
        console.assert(ValueType.VALUETYPESCOUNT === 6, "Exaustive value types count");
        const valueType = value.valueType;
        if (valueType === ValueType.VOID) {
            logError(value.astElement.token.loc, "cannot reserve memory for 'VOID' value type, compiler error");
            Deno.exit(1);
        } else if (valueType === ValueType.NUMBER) {
            vars.push(`${variableName} DS 2`);
        } else if (valueType === ValueType.BYTE) {
            vars.push(`${variableName} DS 1`);
        } else if (valueType === ValueType.STRING) {
            vars.push(`${variableName} DS 4`);
        } else if (valueType === ValueType.BOOL) {
            vars.push(`${variableName} DS 1`);
        } else if (valueType === ValueType.ADDR) {
            vars.push(`${variableName} DS 2`);
        } else {
            logError(ast.token.loc, `reserving global memory for type '${humanReadableType(valueType)}' is not implemented yet`);
            Deno.exit(1);
        }
    });

    const heap = [
        "HEAPSTART:",
    ]

    return lib.concat(literalStrings).concat(vars).concat(heap);
}

function dumpProgram(program: Listing) {
    console.log(`Token listing:`);
    for (let i = 0; i < program.length; i++) {
        const token = program[i];
        //logError(token.loc, `istr: ${token.type}, ${token.txt}`)
        console.log(`${token.loc.row}:${token.loc.col} \t'${token.txt}' \t${humanReadableToken(token.type)} type is ${humanReadableType(token.valueType)}`);
    }
}

function dumpAst(ast: AST | ASTElement, prefix = "") {
    const astToDump = ast instanceof Array ? ast : [ast];
    astToDump.forEach(element => {
        //console.log(prefix, element.token, );      
        const tokenType = humanReadableToken(element.token.type);
        let strType: string;
        if (element.token.type === TokenType.WORD) {
            strType = humanReadableFunction(element);
        } else {
            const ins = element.childs.map(child => humanReadableType(child.token.valueType!)).join(", ");
            const out = humanReadableType(element.token.valueType!);
            strType = "(" + ins + ")=>" + out;
        }
        const strFun = element.instruction.userFunction ? "USER FUN" : "";
        const ctx = element.context.parent === undefined ? "global" : element.context.element?.token.txt;
        let ctxVars: string[] = [];
        element.context?.varsDefinition.forEach((value, key) => ctxVars.push(key));
        const vars = element.context?.varsDefinition.size === 0 ? "none" : ctxVars.join(", ");
        console.log(prefix, element.token.txt + " " + tokenType + " " + strFun + " " + strType + " ctx:" + ctx + " (" + vars + ")");

        console.log(prefix, sourceCode.split("\n")[element.token.loc.row - 1]);
        console.log(prefix, " ".repeat(element.token.loc.col - 1) + `^ (row: ${element.token.loc.row} col: ${element.token.loc.col})`);

        dumpAst(element.childs, prefix + "    ");
    });
}

function dumpContext(context: Context) {
    if (context === undefined) {
        console.log("Context is undefined");
        return;
    }
    console.log("context for " + (context.element === undefined ? "global" : context.element.token.txt));
    context.varsDefinition.forEach((value, key) => {
        let wordtype = "";
        if (value.isFunction) {
            //wordtype = "(" + value.ins!.map(t => humanReadableType(t)).join(",") + ")=>" + humanReadableType(value.out);
            wordtype = humanReadableFunction(value.astElement);
        } else {
            wordtype = humanReadableType(value.valueType);
        }
        console.log("    " + key + ": " + wordtype + " offset: " + value.offset);
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
//dumpProgram(program);
const ast = parse(vocabulary, program, filename);
//dumpProgram(program);
calculateTypes(ast);
dumpAst(ast);
rebalanceTree(ast);
dumpAst(ast);
//Deno.exit(1);

const asm = asmHeader().concat(compile(ast)).concat(asmFooter(ast));
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


