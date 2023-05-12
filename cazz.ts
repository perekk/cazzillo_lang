const RET_STACK_CAPACITY = 640 * 1024;
const CTX_STACK_CAPACITY = 640 * 1024;
const MEM_CAPACITY = 640 * 1024;
const NO_PEEPHOLE_OPT_DIRECTIVE = ";no-peephole-opt";
const CTX_PAGE = 3;
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
    AND,
    OPEN_BRACKETS,
    OPEN_REF_BRACKETS,
    CLOSE_BRACKETS,
    IF,
    EITHER,
    BLOCK,
    REF_BLOCK,
    DATA_BLOCK,
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
    ADDR,
    STR_JOIN,
    STR_LEN,
    STACK,
    PROG,
    INC,
    DEFINE,
    STRUCT,
    ARROW,
    SET_ARROW,
    NEW,
    RECORD,
    ARRAY,
    ARRAY_TYPE,
    AT,
    CHANGE,
    INCLUDE,
    RETURN,
    SYSCALL3,
    SYSCALL4,
    DROP,
    TOKEN_COUNT,
}
enum InstructionPosition {
    PREFIX,
    INFIX,
    POSTFIX,
}

type Target = "c64" | "freebsd" | "sim";
type ValueTypeUser = ["usertype", string];
type ArrayType = ["array", ValueType];
type AddressType = ["addr", ValueType];
type ValueType = "number" | "byte" | "string" | "bool" | "void" | "addr" | "symbol" | "record" | ValueTypeUser | ArrayType | AddressType;
type Location = { row: number, col: number, filename: string }
type Token = {
    type: TokenType
    txt: string,
    loc: Location,
    internalValueType?: ValueType,
    context?: Context,
    expectedArity?: number,
    expectedArityOut?: number,
    grabFromStack?: boolean,
    ins?: Array<ValueType>,
    out?: ValueType,
    position?: InstructionPosition,
    priority?: number,
    isUserFunction?: boolean,
    functionIndex?: number,
    childs: Token[],
    index?: number,
    parent?: Token | undefined,
    sibling?: Token | undefined,
    auxSimValue?: number | [number, number] | undefined, // used by "either" and "while"
};

type VarDefinitionBase = {
    token: Token,
    position: InstructionPosition,
    priority?: number,
    out: ValueType,
    offset: number | undefined,
    reference: Token[]
}
type VarDefinitionValue = VarDefinitionBase & {
    type: "value",
    internalType: ValueType,
    ins: [],
    position: InstructionPosition.PREFIX,
}
type VarDefinitionFunction = VarDefinitionBase & {
    type: "function",
    internalType: "addr",
    ins: ValueType[],
}
type VarDefinitionStruct = VarDefinitionBase & {
    type: "struct",
    ins: [],
    internalType: "addr",
    size: number,
    elements: Array<{ name: string, size: number, offset: number, def: VarDefinitionSpec }>,
    position: InstructionPosition.PREFIX,
}
type VarDefinitionSpec = VarDefinitionValue | VarDefinitionFunction | VarDefinitionStruct;
type Context = {
    element: Token | undefined,
    varsDefinition: Record<string, VarDefinitionSpec>,
    parent: Context | undefined,
    size: number,
}
type Instruction = {
    txt: string,
    position: InstructionPosition,
    priority: number | undefined,
    userFunction: boolean,
    grabFromStack: boolean,
    expectedArity: number,
    expectedArityOut: number,
    functionIndex?: number,
    ins: (ast: Token) => Array<ValueType>,
    out: (ast: Token) => ValueType,
    generateAsm: (ast: Token, target: Target) => Assembly,
    generatePreludeAsm?: (ast: Token, target: Target) => Assembly,
    generateChildPreludeAsm?: (ast: Token, childIndex: number, target: Target) => Assembly | undefined,
    preprocessTokens?: (ast: AST, vocabulary: Vocabulary) => void,
    sim?: (simEnv: SimEnvironment, ast: Token) => [Token, boolean] | void,
    simPrelude?: (simEnv: SimEnvironment, ast: Token) => void,
    simPreludeChild?: (simEnv: SimEnvironment, ast: Token, childIndex: number) => boolean,
};
type Vocabulary = Record<number, Instruction>;
type AST = Token[];
type Assembly = Array<string>;

function sizeOfStruct(context: Context, t: ValueType, target: Target) {
    if (typeof t === "string") {
        logError(context.element!.loc, `the type '${t}' is not a struct`);
        exit();
    }
    if (t[0] === "array") return sizeForValueType("addr", target);
    if (t[0] === "addr") return sizeForValueType("addr", target);

    const typeName = t[1];
    const structDef = getWordDefinition(context, typeName);
    if (structDef === undefined || structDef.type !== "struct") {
        logError(context.element!.loc, `getting the size of struct, can't find struct ${typeName}`);
        exit();
    }
    return structDef.size;
}

function sizeForValueType(t: ValueType, target: Target): number {
    if (target === "c64") {
        switch (t) {
            case "addr": return 2;
            case "bool": return 1;
            case "byte": return 1;
            case "number": return 2;
            case "string": return 4;
            case "symbol": return 0;
            case "void": return 0;
            case "record": return 0;
            default: {
                if (t[0] === "array") {
                    return 4
                }
                return 2; // usertype is alwaya an address
            }
        }
    }
    if (target === "freebsd") {
        switch (t) {
            case "addr": return 8;
            case "bool": return 8;
            case "byte": return 8;
            case "number": return 8;
            case "string": return 16;
            case "symbol": return 0;
            case "void": return 0;
            case "record": return 0;
            default: {
                if (t[0] === "array") return 16;
                return 8; // usertype is alwaya an address
            }
        }
    }
    if (target === "sim") {
        switch (t) {
            case "addr": return 1;
            case "bool": return 1;
            case "byte": return 1;
            case "number": return 1;
            case "string": return 2;
            case "symbol": return 0;
            case "void": return 0;
            case "record": return 0;
            default: {
                if (t[0] === "array") return 2;
                return 1; // usertype is alwaya an address
            }
        }
    }

    console.log(`target system '${target}' unknown`);
    exit();
}

function humanReadableToken(t: TokenType | undefined): string {
    if (t === undefined) return "undefined";
    console.assert(TokenType.TOKEN_COUNT === 56, "Exaustive token types count");
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
        case TokenType.AND: return "AND";
        case TokenType.OPEN_BRACKETS: return "OPEN_BRACKETS";
        case TokenType.OPEN_REF_BRACKETS: return "OPEN_REF_BRACKETS";
        case TokenType.CLOSE_BRACKETS: return "CLOSE_BRACKETS";
        case TokenType.IF: return "IF";
        case TokenType.EITHER: return "EITHER";
        case TokenType.BLOCK: return "BLOCK";
        case TokenType.REF_BLOCK: return "REF_BLOCK";
        case TokenType.DATA_BLOCK: return "DATA_BLOCK";
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
        case TokenType.ADDR: return "ADDR";
        case TokenType.STR_JOIN: return "STR_JOIN";
        case TokenType.STACK: return "STACK";
        case TokenType.STR_LEN: return "STR_LEN";
        case TokenType.PROG: return "PROG";
        case TokenType.INC: return "INC";
        case TokenType.DEFINE: return "DEFINE";
        case TokenType.STRUCT: return "STRUCT";
        case TokenType.ARROW: return "ARROW";
        case TokenType.SET_ARROW: return "SET_ARROW";
        case TokenType.NEW: return "NEW";
        case TokenType.RECORD: return "RECORD";
        case TokenType.ARRAY: return "ARRAY";
        case TokenType.ARRAY_TYPE: return "ARRAY_TYPE";
        case TokenType.AT: return "AT";
        case TokenType.CHANGE: return "CHANGE";
        case TokenType.INCLUDE: return "INCLUDE";
        case TokenType.RETURN: return "RETURN";
        case TokenType.SYSCALL3: return "SYSCALL3";
        case TokenType.SYSCALL4: return "SYSCALL4";
        case TokenType.DROP: return "DROP";
        default:
            throw new Error(`Token Type ${t} not defined`);
    }

}

function humanReadableType(t: ValueType | undefined): string {
    if (t === undefined) return "undefined";
    switch (t) {
        case "number": return "number";
        case "byte": return "byte";
        case "string": return "string";
        case "bool": return "boolean";
        case "addr": return "addr";
        case "void": return "void";
        case "symbol": return "symbol";
        case "record": return "record";
        default:
            if (t[0] === "array") return "Array of " + humanReadableType(t[1]);
            if (t[0] === "addr") return "Address of " + humanReadableType(t[1]);
            return t[1];
    }

}

function getFunctionSignature(token: Token): string {
    let ins: ValueType[] | undefined;
    let out: ValueType | undefined;
    if (token.type === TokenType.WORD) {
        const varDef = getWordDefinition(token.context, token.txt);
        ins = varDef?.ins;
        out = varDef?.out
    } else {
        ins = token.ins;
        out = token.out;
    }
    const strIns = ins === undefined ? "undefined" : ins.map(t => humanReadableType(t)).join(",");
    const strOut = humanReadableType(out);
    return `(${strIns})=>${strOut}`;
}

function humanReadableFunction(token: Token): string {
    return token.txt + ":" + getFunctionSignature(token);
}

function getArity(token: Token, vocabulary: Vocabulary): number {
    if (token.type === TokenType.WORD) {
        const varDef = getWordDefinition(token.context, token.txt);
        if (varDef === undefined) {
            logError(token.loc, `Unnkown word '${token.txt}'`);
            exit();
        }
        //return varDef.type === "function" ? varDef.ins.length : varDef.type === "struct" ? 1 : 0;
        return varDef.ins.length;
    }
    if (token.ins !== undefined) return token.ins.length;
    if (token.expectedArity !== undefined) return token.expectedArity;
    const expectedArity = vocabulary[token.type]?.expectedArity;
    if (expectedArity !== undefined) return expectedArity;
    logError(token.loc, `cannot determine the expected arity for word '${token.txt}'`);
    exit();
}

function getInputParametersValue(token: Token): ValueType[] {
    if (token.type === TokenType.WORD) {
        const varDef = getWordDefinition(token.context, token.txt);
        if (varDef === undefined) {
            logError(token.loc, `Unnkown word '${token.txt}'`);
            exit();
        }
        return varDef.ins;
    }

    if (token.ins === undefined) {
        logError(token.loc, `the input parameters for word '${token.txt}' are undefined`);
        exit();
    }
    return token.ins;
}

function getInstructionPosition(token: Token): InstructionPosition {
    if (token.position === undefined) {
        logError(token.loc, `the position for word '${token.txt}' is undefined`);
        exit();
    }
    return token.position;
}

function sizeOfContext(context: Context, target: Target): number {
    let size = 0;
    Object.values(context.varsDefinition).forEach(varDef => {
        size += sizeForValueType(varDef.internalType, target);
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
        let varDef = getWordDefinition(context.parent, variableName);
        if (varDef !== undefined && varDef.offset !== undefined) {
            varDef = { ...varDef, offset: varDef.offset + context.size };
        }
        return varDef;
    }
    return undefined;
}

function getAsmVarName(varName: string): string {
    return "V_" + varName;
}

function simSetWordPointedByTOS(simEnv: SimEnvironment, varType: ValueType, offset: number) {

    switch (varType) {
        case "number":
        case "byte":
        case "addr":
        case "bool": {
            const value = stackPop(simEnv);
            const address = stackPop(simEnv) + offset;
            storeNumberOnHeap(simEnv, value, address);
        } break;

        case "string": {
            const value = stackPop(simEnv);
            const lenght = stackPop(simEnv);
            const address = stackPop(simEnv) + offset;
            storeNumberOnHeap(simEnv, value, address);
            storeNumberOnHeap(simEnv, lenght, address + 8);
        } break;
        case "record":
        case "void":
        case "symbol":
            logError(simEnv.pc!.loc, `'${simEnv.pc!.txt}' cannot set word which address is on TOS since its type is '${humanReadableType(varType)}'`);
            exit();
        default:
            if (varType[0] === "array") {
                const value = stackPop(simEnv);
                const lenght = stackPop(simEnv);
                const address = stackPop(simEnv) + offset;
                storeNumberOnHeap(simEnv, value, address);
                storeNumberOnHeap(simEnv, lenght, address + 8);
            } else {
                const value = stackPop(simEnv);
                const address = stackPop(simEnv) + offset;
                storeNumberOnHeap(simEnv, value, address);
            }
    }
}

function getAsmForSetWordPointedByTOS(varType: ValueType, offset: number, target: Target): Assembly {
    if (target === "c64") {
        switch (varType) {
            case "bool":
            case "byte":
                return [
                    `JSR POP16`,
                    "LDA STACKBASE + 1,X",
                    "STA AUX",
                    "LDA STACKBASE + 2,X",
                    "STA AUX + 1",
                    `LDY #${offset}`,
                    `LDA STACKACCESS`,
                    `STA (AUX),Y`,
                    "JSR POP16",
                ];
            case "number":
            case "addr":
                return [
                    NO_PEEPHOLE_OPT_DIRECTIVE,
                    `JSR POP16`,
                    "LDA STACKBASE + 1,X",
                    "STA AUX",
                    "LDA STACKBASE + 2,X",
                    "STA AUX + 1",
                    `LDY #${offset}`,
                    `LDA STACKACCESS`,
                    `STA (AUX),Y`,
                    "INY",
                    `LDA STACKACCESS + 1`,
                    `STA (AUX),Y`,
                    "JSR POP16",
                ];
            case "string":
                return [
                    `JSR POP16`,
                    "LDA STACKBASE + 3,X",
                    "STA AUX",
                    "LDA STACKBASE + 4,X",
                    "STA AUX + 1",

                    `LDY #${offset} + 3`,
                    `LDA STACKACCESS + 1`,
                    `STA (AUX),Y`,
                    "DEY",
                    `LDA STACKACCESS`,
                    `STA (AUX),Y`,
                    "DEY",

                    `JSR POP16`,
                    `LDA STACKACCESS + 1`,
                    `STA (AUX),Y`,
                    "DEY",
                    `LDA STACKACCESS`,
                    `STA (AUX),Y`,

                    `JSR POP16`,
                ];
            case "record":
            case "void":
            case "symbol":
                return [];
            default:
                if (varType[0] === "array") {
                    return [
                        "JSR POP16",
                        "LDA STACKBASE + 3,X",
                        "STA AUX",
                        "LDA STACKBASE + 4,X",
                        "STA AUX + 1",

                        `LDY #${offset}`,
                        `LDA STACKACCESS`,
                        `STA (AUX),Y`,
                        "INY",
                        `LDA STACKACCESS + 1`,
                        `STA (AUX),Y`,
                        "INY",

                        `JSR POP16`,
                        `LDA STACKACCESS`,
                        `STA (AUX),Y`,
                        "INY",
                        `LDA STACKACCESS + 1`,
                        `STA (AUX),Y`,
                        `JSR POP16`,
                    ]
                }
                return [
                    `JSR POP16`,
                    "LDA STACKBASE + 1,X",
                    "STA AUX",
                    "LDA STACKBASE + 2,X",
                    "STA AUX + 1",
                    `LDY #${offset}`,
                    `LDA STACKACCESS`,
                    `STA (AUX),Y`,
                    "INY",
                    `LDA STACKACCESS + 1`,
                    `STA (AUX),Y`,
                    "JSR POP16",
                ];
        }
    }
    if (target === "freebsd") {
        switch (varType) {
            case "number":
            case "byte":
            case "addr":
            case "bool":
                return [
                    "pop rbx",
                    "pop rax",
                    `mov [rax + ${offset}], rbx`,
                ];
            case "string":
                return [
                    "pop rbx",
                    "pop rcx",
                    "pop rax",
                    `mov [rax + ${offset}], rbx`,
                    `mov [rax + ${offset + 8}], rcx`,
                ];
            case "record":
            case "void":
            case "symbol":
                return [];
            default:
                if (varType[0] === "array") {
                    return [
                        "pop rbx", // array add
                        "pop rcx", // array len
                        "pop rax", // dest address
                        `mov [rax + ${offset}], rbx`,
                        `mov [rax + ${offset + 8}], rcx`,
                    ];
                }
                return [
                    "pop rbx",
                    "pop rax",
                    `mov [rax + ${offset}], rbx`,
                ];
        }
    }
    console.log(`target system '${target}' unknown`);
    exit();

}

function simGetWordPointedByTOS(simEnv: SimEnvironment, varType: ValueType, offset: number) {
    switch (varType) {
        case "number":
        case "bool":
        case "byte":
        case "addr": {
            const address = stackPop(simEnv) + offset;
            simEnv.dataStack.push(readNumberFromHeap(simEnv, address));
        } break;
        case "string": {
            const address = stackPop(simEnv) + offset;
            simEnv.dataStack.push(readNumberFromHeap(simEnv, address + 8));
            simEnv.dataStack.push(readNumberFromHeap(simEnv, address));
        } break;
        case "record":
        case "void":
        case "symbol":
            logError(simEnv.pc!.loc, `'${simEnv.pc!.txt}' cannot get word which address is on TOS since its type is '${humanReadableType(varType)}'`);
            exit();
        default:
            if (varType[0] === "array") {
                const address = stackPop(simEnv) + offset;
                simEnv.dataStack.push(readNumberFromHeap(simEnv, address + 8));
                simEnv.dataStack.push(readNumberFromHeap(simEnv, address));
            } else {
                const address = stackPop(simEnv) + offset;
                simEnv.dataStack.push(readNumberFromHeap(simEnv, address));
            }
    }
}

function getAsmForGetWordPointedByTOS(varType: ValueType, offset: number, target: Target): Assembly {
    if (target === "c64") {
        switch (varType) {
            case "bool":
            case "byte":
                return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "STA AUX",
                    "LDA STACKACCESS + 1",
                    "STA AUX + 1",
                    `LDY #${offset}`,
                    `LDA (AUX),Y`,
                    `STA STACKACCESS`,
                    `LDA #0`,
                    `STA STACKACCESS + 1`,
                    `JSR PUSH16`,
                ];
            case "number":
            case "addr":
                return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "STA AUX",
                    "LDA STACKACCESS + 1",
                    "STA AUX + 1",

                    `LDY #${offset}`,
                    `LDA (AUX),Y`,
                    `STA STACKACCESS`,
                    "INY",
                    `LDA (AUX),Y`,
                    `STA STACKACCESS + 1`,
                    `JSR PUSH16`,
                ];
            case "string":
                return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "STA AUX",
                    "LDA STACKACCESS + 1",
                    "STA AUX + 1",

                    `LDY #${offset}`,
                    `LDA (AUX),Y`,
                    `STA STACKACCESS`,
                    "INY",
                    `LDA (AUX),Y`,
                    `STA STACKACCESS + 1`,
                    `JSR PUSH16`,
                    "INY",
                    `LDA (AUX),Y`,
                    `STA STACKACCESS`,
                    "INY",
                    `LDA (AUX),Y`,
                    `STA STACKACCESS + 1`,
                    `JSR PUSH16`,
                ];
            case "record":
            case "void":
            case "symbol":
                return [];
            default:
                if (varType[0] === "array") {
                    return [
                        "JSR POP16",
                        "LDA STACKACCESS",
                        "STA AUX",
                        "LDA STACKACCESS + 1",
                        "STA AUX + 1",

                        `LDY #${offset} + 3`,
                        `LDA (AUX),Y`,
                        `STA STACKACCESS + 1`,
                        "DEY",
                        `LDA (AUX),Y`,
                        `STA STACKACCESS`,
                        `JSR PUSH16`,
                        "DEY",
                        `LDA (AUX),Y`,
                        `STA STACKACCESS + 1`,
                        "DEY",
                        `LDA (AUX),Y`,
                        `STA STACKACCESS`,
                        `JSR PUSH16`,
                    ];
                }
                return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "STA AUX",
                    "LDA STACKACCESS + 1",
                    "STA AUX + 1",

                    `LDY #${offset}`,
                    `LDA (AUX),Y`,
                    `STA STACKACCESS`,
                    "INY",
                    `LDA (AUX),Y`,
                    `STA STACKACCESS + 1`,
                    `JSR PUSH16`,
                ];
        }
    }
    if (target === "freebsd") {
        switch (varType) {
            case "number":
            case "bool":
            case "byte":
            case "addr":
                return [
                    "pop rax",
                    `mov rbx, [rax + ${offset}]`,
                    "push rbx",
                ];
            case "string":
                return [
                    "pop rax",
                    `mov rbx, [rax + ${offset + 8}]`,
                    "push rbx",
                    `mov rbx, [rax + ${offset}]`,
                    "push rbx",
                ];
            case "record":
            case "void":
            case "symbol":
                return [];
            default:
                if (varType[0] === "array") {
                    return [
                        "pop rax",
                        `mov rbx, [rax + ${offset + 8}]`,
                        "push rbx",
                        `mov rbx, [rax + ${offset}]`,
                        "push rbx",
                    ]
                }
                return [
                    "pop rax",
                    `mov rbx, [rax + ${offset}]`,
                    "push rbx",
                ];
        }

    }
    console.log(`target system '${target}' unknown`);
    exit();


}

function getAsmForSetWordGlobal(varType: ValueType, asmVarName: string, offset: number, target: Target): Assembly {
    if (target === "c64") {
        switch (varType) {
            case "bool":
                return [
                    `JSR POP16`,
                    `LDA STACKACCESS`,
                    `STA ${asmVarName} + ${offset}`,
                ];
            case "number":
                return [
                    `JSR POP16`,
                    `LDA STACKACCESS`,
                    `STA ${asmVarName} + ${offset}`,
                    `LDA STACKACCESS + 1`,
                    `STA ${asmVarName} + ${offset + 1}`,
                ];
            case "byte":
                return [
                    `JSR POP16`,
                    `LDA STACKACCESS`,
                    `STA ${asmVarName} + ${offset}`,
                ];
            case "string":
                return [
                    `JSR POP16`,
                    `LDA STACKACCESS`,
                    `STA ${asmVarName} + ${offset + 2}`,
                    `LDA STACKACCESS + 1`,
                    `STA ${asmVarName} + ${offset + 3}`,

                    `JSR POP16`,
                    `LDA STACKACCESS`,
                    `STA ${asmVarName} + ${offset}`,
                    `LDA STACKACCESS + 1`,
                    `STA ${asmVarName} + ${offset + 1}`,
                ];
            case "addr":
                return [
                    `JSR POP16`,
                    `LDA STACKACCESS`,
                    `STA ${asmVarName} + ${offset}`,
                    `LDA STACKACCESS + 1`,
                    `STA ${asmVarName} + ${offset + 1}`,
                ];
            case "record":
            case "void":
            case "symbol":
                return [];
            default:
                if (varType[0] === "array") {
                    return [
                        `JSR POP16`,
                        `LDA STACKACCESS`,
                        `STA ${asmVarName} + ${offset + 0}`,
                        `LDA STACKACCESS + 1`,
                        `STA ${asmVarName} + ${offset + 1}`,

                        `JSR POP16`,
                        `LDA STACKACCESS`,
                        `STA ${asmVarName} + ${offset + 2}`,
                        `LDA STACKACCESS + 1`,
                        `STA ${asmVarName} + ${offset + 3}`,
                    ]
                }
                return [
                    `JSR POP16`,
                    `LDA STACKACCESS`,
                    `STA ${asmVarName} + ${offset}`,
                    `LDA STACKACCESS + 1`,
                    `STA ${asmVarName} + ${offset + 1}`,
                ];
            //logError(token.loc, `cannot compile asm to retrieve value for '${token.txt}' of '${humanReadableType(varType)}' type`);
            //exit();
        }
    }
    if (target === "freebsd") {
        if (offset > 0) {
            console.log("cannot store with offset yet");
            exit();
        }
        switch (varType) {
            case "number":
                return [
                    "pop rax",
                    `mov [${asmVarName}], rax`,
                ]
            case "byte":
                return [
                    "pop rax",
                    `mov [${asmVarName}], rax`,
                ]

            case "string":
                return [
                    "pop rax",
                    `mov [${asmVarName}], rax`,
                    "pop rax",
                    `mov [${asmVarName}+8], rax`,
                ]
            case "bool":
                return [
                    "pop rax",
                    `mov [${asmVarName}], rax`,
                ]
            case "addr":
                return [
                    "pop rax",
                    `mov [${asmVarName}], rax`,
                ]
            case "record":
            case "void":
            case "symbol":
                return [];
            default:
                if (varType[0] === "array") {
                    return [
                        "pop rax",
                        `mov [${asmVarName}], rax`,
                        "pop rax",
                        `mov [${asmVarName}+8], rax`,
                    ];
                }
                return [
                    "pop rax",
                    `mov [${asmVarName}], rax`,
                ]

        }
    }
    console.log(`target system '${target}' unknown`);
    exit();
}

function simSetWordGlobal(simEnv: SimEnvironment, varType: ValueType, varName: string) {
    switch (varType) {
        case "number":
        case "byte":
        case "bool":
        case "addr": {
            simEnv.vars[varName] = storeNumberOnHeap(simEnv, stackPop(simEnv), simEnv.vars[varName]);
            return;
        }
        case "string": {
            if (simEnv.vars[varName] === undefined) {
                simEnv.vars[varName] = storeNumberOnHeap(simEnv, stackPop(simEnv), undefined);
                storeNumberOnHeap(simEnv, stackPop(simEnv), undefined);
            } else {
                storeNumberOnHeap(simEnv, stackPop(simEnv), simEnv.vars[varName]);
                storeNumberOnHeap(simEnv, stackPop(simEnv), simEnv.vars[varName] + 8);
            }
            return;
        }
        case "record":
        case "void":
        case "symbol":
            return;
        default:
            if (varType[0] === "array") {
                if (simEnv.vars[varName] === undefined) {
                    simEnv.vars[varName] = storeNumberOnHeap(simEnv, stackPop(simEnv), undefined);
                    storeNumberOnHeap(simEnv, stackPop(simEnv), undefined);
                } else {
                    storeNumberOnHeap(simEnv, stackPop(simEnv), simEnv.vars[varName]);
                    storeNumberOnHeap(simEnv, stackPop(simEnv), simEnv.vars[varName] + 8);
                }
            } else {
                simEnv.vars[varName] = storeNumberOnHeap(simEnv, stackPop(simEnv), simEnv.vars[varName]);
            }
            return;
    }
}

function getAsmForSetWordLocal(varType: ValueType, offset: number, target: Target): Assembly {

    if (target === "c64") {
        const popAndOffsetStack = [
            `JSR POP16`,
            "LDX CTX_SP16",
        ];
        const contextPage = CTX_PAGE * 256;
        const finalAddress = contextPage + offset;
        switch (varType) {
            case "number":
                return popAndOffsetStack.concat([
                    "LDA STACKACCESS",
                    `STA ${finalAddress},X`,
                    "LDA STACKACCESS + 1",
                    `STA ${finalAddress + 1},X`
                ]);
            case "string":
                return popAndOffsetStack.concat([
                    "LDA STACKACCESS",
                    `STA ${finalAddress + 2},X`,
                    "LDA STACKACCESS + 1",
                    `STA ${finalAddress + 3},X`,
                    "TXA",
                    "PHA",
                    "JSR POP16",
                    "PLA",
                    "TAX",
                    "LDA STACKACCESS",
                    `STA ${finalAddress + 0},X`,
                    "LDA STACKACCESS + 1",
                    `STA ${finalAddress + 1},X`,
                ]);
            case "byte":
                return popAndOffsetStack.concat([
                    "LDA STACKACCESS",
                    `STA ${finalAddress + 0},X`,
                ]);
            case "bool":
                return popAndOffsetStack.concat([
                    "LDA STACKACCESS",
                    `STA ${finalAddress + 0},X`,
                ]);
            case "addr":
                return popAndOffsetStack.concat([
                    "LDA STACKACCESS",
                    `STA ${finalAddress + 0},X`,
                    "LDA STACKACCESS + 1",
                    `STA ${finalAddress + 1},X`,
                ]);
            case "record":
            case "void":
            case "symbol":
                return [];
            default:
                if (varType[0] === "array") {
                    return popAndOffsetStack.concat([
                        "LDA STACKACCESS",
                        `STA ${finalAddress + 0},X`,
                        "LDA STACKACCESS + 1",
                        `STA ${finalAddress + 1},X`,
                        "TXA",
                        "PHA",
                        "JSR POP16",
                        "PLA",
                        "TAX",
                        "LDA STACKACCESS",
                        `STA ${finalAddress + 2},X`,
                        "LDA STACKACCESS + 1",
                        `STA ${finalAddress + 3},X`,
                    ]);
                }
                return popAndOffsetStack.concat([
                    "LDA STACKACCESS",
                    `STA ${finalAddress + 0},X`,
                    "LDA STACKACCESS + 1",
                    `STA ${finalAddress + 1},X`,
                ]);
        }
    }
    if (target === "freebsd") {
        switch (varType) {
            case "number":
            case "bool":
            case "byte":
            case "addr":
                return [
                    "pop rbx",
                    "mov rax, [ctx_stack_rsp]",
                    `add rax, ${offset}`,
                    "mov [rax], rbx",
                ];
            case "string":
                return [
                    "pop rbx",
                    "mov rax, [ctx_stack_rsp]",
                    `add rax, ${offset}`,
                    "mov [rax], rbx",
                    "pop rbx",
                    "add rax, 8",
                    "mov [rax], rbx",
                ];
            case "record":
            case "void":
            case "symbol":
                return [];
            default:
                if (varType[0] === "array") {
                    return [
                        "pop rbx",
                        "mov rax, [ctx_stack_rsp]",
                        `add rax, ${offset}`,
                        "mov [rax], rbx",
                        "pop rbx",
                        "add rax, 8",
                        "mov [rax], rbx",
                    ];
                }
                return [
                    "pop rbx",
                    "mov rax, [ctx_stack_rsp]",
                    `add rax, ${offset}`,
                    "mov [rax], rbx",
                ];
        }
    }
    console.log(`target system '${target}' unknown`);
    exit();
}

function simSetWordLocal(simEnv: SimEnvironment, varType: ValueType, offset: number) {
    switch (varType) {
        case "number":
        case "bool":
        case "byte":
        case "addr":
            const valueToStore = stackPop(simEnv);
            simEnv.ctxStack[simEnv.ctxStack.length - 1 - offset] = valueToStore;
            return;
        case "string":
            const address = stackPop(simEnv);
            const lenght = stackPop(simEnv);
            simEnv.ctxStack[simEnv.ctxStack.length - 1 - offset] = address;
            simEnv.ctxStack[simEnv.ctxStack.length - 2 - offset] = lenght;
            return;
        case "record":
        case "void":
        case "symbol":
            return;
        default:
            if (varType[0] === "array") {
                const address = stackPop(simEnv);
                const lenght = stackPop(simEnv);
                simEnv.ctxStack[simEnv.ctxStack.length - 1 - offset] = address;
                simEnv.ctxStack[simEnv.ctxStack.length - 2 - offset] = lenght;
            } else {
                // struct or address                
                const valueToStore = stackPop(simEnv);
                simEnv.ctxStack[simEnv.ctxStack.length - 1 - offset] = valueToStore;
            }
            return;
    }
}

function getAsmForGetWordGlobal(token: Token, varType: ValueType, asmVarName: string, isFunction: boolean, target: Target): Assembly {
    if (target === "c64") {
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
        switch (varType) {
            case "bool":
                return [
                    `LDA ${asmVarName}`,
                    `STA STACKACCESS`,
                    `LDA #0`,
                    `STA STACKACCESS + 1`,
                    `JSR PUSH16`
                ];
            case "number":
                return [
                    `LDA ${asmVarName}`,
                    `STA STACKACCESS`,
                    `LDA ${asmVarName} + 1`,
                    `STA STACKACCESS + 1`,
                    `JSR PUSH16`
                ];
            case "byte":
                return [
                    `LDA ${asmVarName}`,
                    `STA STACKACCESS`,
                    `LDA #0`,
                    `STA STACKACCESS + 1`,
                    `JSR PUSH16`
                ];
            case "string":
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
            case "addr":
                return [
                    `LDA ${asmVarName}`,
                    `STA CALL_FUN_@ + 1`,
                    `LDA ${asmVarName} + 1`,
                    `STA CALL_FUN_@ + 2`,
                    "CALL_FUN_@:",
                    `JSR $1111 ; will be overwritten`
                ]
            case "record":
                return [
                    `LDA ${asmVarName}`,
                    `STA STACKACCESS`,
                    `LDA ${asmVarName} + 1`,
                    `STA STACKACCESS + 1`,
                    `JSR PUSH16`
                ];
            case "void":
            case "symbol":
                logError(token.loc, `cannot compile asm to retrieve value for '${token.txt}' of '${humanReadableType(varType)}' type`);
                exit();
            default:
                if (varType[0] === "array") {
                    return [
                        `LDA ${asmVarName} + 2`,
                        `STA STACKACCESS`,
                        `LDA ${asmVarName} + 3`,
                        `STA STACKACCESS + 1`,
                        `JSR PUSH16`,
                        `LDA ${asmVarName} + 0`,
                        `STA STACKACCESS`,
                        `LDA ${asmVarName} + 1`,
                        `STA STACKACCESS + 1`,
                        `JSR PUSH16`
                    ]
                }
                return [
                    `LDA ${asmVarName}`,
                    `STA STACKACCESS`,
                    `LDA ${asmVarName} + 1`,
                    `STA STACKACCESS + 1`,
                    `JSR PUSH16`
                ];

        }
    }
    if (target === "freebsd") {
        if (isFunction) {
            return [
                `mov rbx, [${asmVarName}]`,
                "mov rax, rsp",
                "mov rsp, [ret_stack_rsp]",
                `call rbx`,
                "mov [ret_stack_rsp], rsp",
                "mov rsp, rax",
            ];
        }
        switch (varType) {
            case "number":
            case "bool":
            case "byte":
            case "addr":
                return [
                    `mov rax, [${asmVarName}]`,
                    `push rax`,
                ]
            case "string":
                return [
                    `mov rax, [${asmVarName} + 8]`,
                    `push rax`,
                    `mov rax, [${asmVarName}]`,
                    `push rax`,
                ]
            case "void":
            case "symbol":
            case "record":
                logError(token.loc, `cannot compile asm to retrieve value for '${token.txt}' of '${humanReadableType(varType)}' type`);
                exit();
            default:
                if (varType[0] === "array") {
                    return [
                        `mov rax, [${asmVarName} + 8]`,
                        `push rax`,
                        `mov rax, [${asmVarName}]`,
                        `push rax`,
                    ]
                }
                return [
                    //`mov rax, ${asmVarName}`,
                    `mov rax, [${asmVarName}]`,
                    `push rax`,
                ];

        }
    }
    console.log(`target system '${target}' unknown`);
    exit();
}

function simGetWordGlobal(simEnv: SimEnvironment, token: Token, varType: ValueType, varName: string) {

    switch (varType) {
        case "number":
        case "bool":
        case "byte":
        case "addr": {
            const addr = simEnv.vars[varName];
            if (addr === undefined) {
                logError(token.loc, `'${token.txt}' vars is undefined`);
                exit();
            }
            simEnv.dataStack.push(readNumberFromHeap(simEnv, addr));
        } break;

        case "string": {
            const addr = simEnv.vars[varName];
            if (addr === undefined) {
                logError(token.loc, `'${token.txt}' vars is undefined`);
                exit();
            }
            simEnv.dataStack.push(readNumberFromHeap(simEnv, addr + 8));
            simEnv.dataStack.push(readNumberFromHeap(simEnv, addr));
        } break;
        case "void":
        case "symbol":
        case "record":
            logError(token.loc, `cannot sim retrieve value for '${token.txt}' of '${humanReadableType(varType)}' type`);
            exit();
        default:
            if (varType[0] === "array") {
                const addr = simEnv.vars[varName];
                if (addr === undefined) {
                    logError(token.loc, `'${token.txt}' vars is undefined`);
                    exit();
                }
                simEnv.dataStack.push(readNumberFromHeap(simEnv, addr + 8));
                simEnv.dataStack.push(readNumberFromHeap(simEnv, addr));
            } else {
                const addr = simEnv.vars[varName];
                if (addr === undefined) {
                    logError(token.loc, `'${token.txt}' vars is undefined`);
                    exit();
                }
                simEnv.dataStack.push(readNumberFromHeap(simEnv, addr));
            }
    }
}

function getAsmForGetWordLocal(varType: ValueType, offset: number, isFunction: boolean, target: Target): Assembly {

    if (target === "c64") {
        const asmOffset = [
            "LDX CTX_SP16",
        ];
        const contextPage = CTX_PAGE * 256;
        const finalAddress = contextPage + offset;

        if (isFunction) {
            return asmOffset.concat([
                `LDA ${finalAddress + 0},X`,
                `STA CALL_FUN_@ + 1`,
                `LDA ${finalAddress + 1},X`,
                `STA CALL_FUN_@ + 2`,
                "CALL_FUN_@:",
                `JSR $1111 ; will be overwritten`
            ]);
        }
        switch (varType) {
            case "number":
                return asmOffset.concat([
                    `LDA ${finalAddress + 0},X`,
                    "STA STACKACCESS",
                    `LDA ${finalAddress + 1},X`,
                    "STA STACKACCESS + 1",
                    "JSR PUSH16"
                ]);
            case "string":
                return asmOffset.concat([
                    `LDA ${finalAddress + 0},X`,
                    "STA STACKACCESS",
                    `LDA ${finalAddress + 1},X`,
                    "STA STACKACCESS + 1",
                    "TXA",
                    "PHA",
                    "JSR PUSH16",
                    "PLA",
                    "TAX",
                    `LDA ${finalAddress + 2},X`,
                    "STA STACKACCESS",
                    `LDA ${finalAddress + 3},X`,
                    "STA STACKACCESS + 1",
                    "JSR PUSH16"
                ]);
            case "byte":
            case "bool":
                return asmOffset.concat([
                    `LDA ${finalAddress + 0},X`,
                    "STA STACKACCESS",
                    "LDA #0",
                    "STA STACKACCESS + 1",
                    "JSR PUSH16"
                ]);
            case "addr":
                return asmOffset.concat([
                    `LDA ${finalAddress + 0},X`,
                    `STA CALL_FUN_@ + 1`,
                    `LDA ${finalAddress + 1},X`,
                    `STA CALL_FUN_@ + 2`,
                    "CALL_FUN_@:",
                    `JSR $1111 ; will be overwritten`
                ]);
            case "record":
            case "void":
            case "symbol":
                return [];
            default:
                if (varType[0] === "array") {
                    return asmOffset.concat([
                        `LDA ${finalAddress + 2},X`,
                        "STA STACKACCESS",
                        `LDA ${finalAddress + 3},X`,
                        "STA STACKACCESS + 1",
                        "TXA",
                        "PHA",
                        "JSR PUSH16",
                        "PLA",
                        "TAX",
                        `LDA ${finalAddress + 0},X`,
                        "STA STACKACCESS",
                        `LDA ${finalAddress + 1},X`,
                        "STA STACKACCESS + 1",
                        "JSR PUSH16"
                    ]);
                }
                return asmOffset.concat([
                    `LDA ${finalAddress + 0},X`,
                    "STA STACKACCESS",
                    `LDA ${finalAddress + 1},X`,
                    "STA STACKACCESS + 1",
                    "JSR PUSH16",
                ]);
        }
    }
    if (target === "freebsd") {

        if (isFunction) {
            return [
                "mov rax, [ctx_stack_rsp]",
                `add rax, ${offset}`,
                "mov rbx, [rax]",
                "mov rax, rsp",
                "mov rsp, [ret_stack_rsp]",
                `call rbx`,
                "mov [ret_stack_rsp], rsp",
                "mov rsp, rax",
            ];
        }
        switch (varType) {
            case "number":
            case "bool":
            case "byte":
            case "addr":
                return [
                    "mov rax, [ctx_stack_rsp]",
                    `add rax, ${offset}`,
                    "mov rbx, [rax]",
                    "push rbx",
                ];
            case "string":
                return [
                    "mov rax, [ctx_stack_rsp]",
                    `add rax, ${offset}`,
                    "mov rcx, [rax]",
                    "mov rbx, [rax + 8]",
                    "push rbx",
                    "push rcx",
                ];
            case "record":
            case "void":
            case "symbol":
                return [];
            default:
                if (varType[0] === "array") {
                    return [
                        "mov rax, [ctx_stack_rsp]",
                        `add rax, ${offset}`,
                        "mov rcx, [rax]",
                        "mov rbx, [rax + 8]",
                        "push rbx",
                        "push rcx"
                    ];
                }
                return [
                    "mov rax, [ctx_stack_rsp]",
                    `add rax, ${offset}`,
                    "mov rbx, [rax]",
                    "push rbx",
                ];
        }
    }
    console.log(`target system '${target}' unknown`);
    exit();
}

function simGetWordLocal(simEnv: SimEnvironment, token: Token, varType: ValueType, offset: number) {

    switch (varType) {
        case "number":
        case "bool":
        case "byte":
        case "addr":
            const valueToPush = simEnv.ctxStack.at(-(offset + 1));
            if (valueToPush === undefined) {
                logError(token.loc, `'${token.txt}' value in the context stack at position ${-(offset + 1)} is undefined`);
                exit();
            }
            simEnv.dataStack.push(valueToPush);
            return;
        case "string":
            const address = simEnv.ctxStack.at(-(offset + 1));
            if (address === undefined) {
                logError(token.loc, `'${token.txt}' string address in the context stack at position ${-(offset + 1)} is undefined`);
                exit();
            }
            const lenght = simEnv.ctxStack.at(-(offset + 2));
            if (lenght === undefined) {
                logError(token.loc, `'${token.txt}' string lenght in the context stack at position ${-(offset + 1)} is undefined`);
                exit();
            }
            simEnv.dataStack.push(lenght);
            simEnv.dataStack.push(address);
            return;

        case "record":
        case "void":
        case "symbol":
            logError(token.loc, `cannot get '${token.txt}' value of type ${humanReadableType(varType)}`);
            exit();

        default:
            if (varType[0] === "array") {
                const address = simEnv.ctxStack.at(-(offset + 1));
                if (address === undefined) {
                    logError(token.loc, `'${token.txt}' string address in the context stack at position ${-(offset + 1)} is undefined`);
                    exit();
                }
                const lenght = simEnv.ctxStack.at(-(offset + 2));
                if (lenght === undefined) {
                    logError(token.loc, `'${token.txt}' string lenght in the context stack at position ${-(offset + 1)} is undefined`);
                    exit();
                }
                simEnv.dataStack.push(lenght);
                simEnv.dataStack.push(address);
            } else {
                const valueToPush = simEnv.ctxStack.at(-(offset + 1));
                if (valueToPush === undefined) {
                    logError(token.loc, `'${token.txt}' value in the context stack at position ${-(offset + 1)} is undefined`);
                    exit();
                }
                simEnv.dataStack.push(valueToPush);
            }
            return;
    }

}

function getReturnTypeOfAWord(token: Token): ValueType {
    if (token.out === undefined) {
        logError(token.loc, `the type of word '${token.txt}' is undefined`);
        exit();
    }
    if (token.type === TokenType.REF_BLOCK) return "addr";
    if (token.type === TokenType.RECORD) return "record";
    return token.out;
}

function assertChildNumber(token: Token, spec: number | Array<ValueType | "any">) {
    if (typeof spec === "number") {
        if (token.childs.length !== spec) {
            logError(token.loc, `'${token.txt}' is supposed to have ${spec} parameters, got ${token.childs.length}`);
            dumpAst(token);
            exit();
        }
    } else {
        if (token.childs.length !== spec.length) {
            logError(token.loc, `'${token.txt}' is supposed to have ${spec.length} parameters, got ${token.childs.length}`);
            dumpAst(token);
            exit();
        }

        for (let i = 0; i < spec.length; i++) {
            if (spec[i] !== "any" && getReturnTypeOfAWord(token.childs[i]) !== spec[i]) {
                const strParams = spec.map(t => t === "any" ? "Any Type" : humanReadableType(t)).join(", ");
                const typeExpected = spec[i];
                const strParamType = humanReadableType(getReturnTypeOfAWord(token.childs[i]));
                const strExpectedParamType = typeExpected === "any" ? "Any Type" : humanReadableType(typeExpected);
                logError(token.childs[i].loc, `'${token.txt}' expects ${strParams} as parameters, but ${token.childs[i].txt} is a ${strParamType} (should be ${strExpectedParamType})`);
                dumpAst(token);
                exit();
            }
        }

    }

}

function getAsmPrintTopOfStack(type: ValueType, newLine: boolean, target: Target): Assembly {

    if (target === "c64") {
        const newLineAsm = newLine ? ["LDA #13", "JSR $FFD2"] : [];

        switch (type) {
            case "number":
                return [
                    "JSR POP16",
                    "JSR PRINT_INT",
                    ...newLineAsm
                ]
            case "string":
                return [
                    "JSR PRINT_STRING",
                    ...newLineAsm
                ]
            case "byte":
                return [
                    "JSR POP16",
                    "LDA #0",
                    "STA STACKACCESS + 1",
                    "JSR PRINT_INT",
                    ...newLineAsm
                ]
            case "bool":
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
                    ...newLineAsm
                ]
            case "addr":
                return [
                    "; print addr ?",
                    "JSR POP16",
                    "JSR PRINT_INT",
                    ...newLineAsm
                ]
            case "void":
            case "symbol":
            case "record":
                console.log(`printing '${humanReadableType(type)}' is not implemented`);
                exit();
            default:
                return [
                    "JSR POP16",
                    "LDA #91", // [
                    "JSR $FFD2",
                    "LDA #46", // dot
                    "JSR $FFD2",
                    "LDA #46", // dot
                    "JSR $FFD2",
                    "LDA #46", // dot
                    "JSR $FFD2",
                    "LDA #93", // ]
                    "JSR $FFD2",
                    ...newLineAsm
                ];
        }
    }
    if (target === "freebsd") {
        const newLineAsm = newLine ? ["call print_lf"] : [];
        switch (type) {
            case "number":
            case "byte":
            case "addr":
                return [
                    "pop rax",
                    "call print_uint",
                    ...newLineAsm
                ]
            case "string":
                return [
                    "pop rax",
                    "mov rsi, rax",
                    "pop rax",
                    "mov rdx, rax",
                    "mov rax, 4",
                    "mov rdi, 1",
                    "syscall",
                    ...newLineAsm
                ];
            case "bool":
                return [
                    "pop rax",
                    "cmp rax, 0",
                    "jne .not_zero@",
                    "push 'N'",
                    "jmp .print@",
                    ".not_zero@:",
                    "push 'Y'",
                    ".print@:",
                    "mov rsi, rsp",
                    "mov rdx, 1",
                    "mov rax, 4",
                    "mov rdi, 1",
                    "syscall",
                    "pop rax",
                    ...newLineAsm
                ]
            case "void":
            case "symbol":
            case "record":
                console.log(`printing '${humanReadableType(type)}' is not implemented`);
                exit();

            default:
                return [
                    "pop rax",
                    "mov rsi, str__cantprint",
                    "mov rdx, 5",
                    "mov rax, 4",
                    "mov rdi, 1",
                    "syscall",
                    ...newLineAsm
                ];
        }
    }
    console.log(`target system '${target}' unknown`);
    exit();
}

function simPrintTopOfStack(simEnv: SimEnvironment, type: ValueType, newLine: boolean) {

    let toPrint = "";
    switch (type) {
        case "number":
        case "byte":
        case "addr":
            toPrint = String(stackPop(simEnv));
            break;
        case "string":
            const addr = stackPop(simEnv);
            const len = stackPop(simEnv);
            toPrint = readStringFromHeap(simEnv, addr, len);
            break;
        case "bool":
            toPrint = stackPop(simEnv) === 0 ? "N" : "Y";
            break;
        case "void":
        case "symbol":
        case "record":
            console.log(`printing '${humanReadableType(type)}' is not implemented`);
            exit();

        default:
            toPrint = "[...]";
            break;
    }
    for (let i = 0; i < toPrint.length; i++) {
        emit(simEnv, toPrint.charCodeAt(i));
    }
    if (newLine) emit(simEnv, 10);
}

function simPrintStruct(simEnv: SimEnvironment, token: Token, structName: string, newline: boolean) {
    const structDef = getWordDefinition(token.context, structName);
    if (structDef === undefined) {
        logError(token.childs[0].loc, `Cannot find definition for '${structName}'`);
        exit();
    }
    if (structDef.type !== "struct") {
        logError(token.childs[0].loc, `'${structName}' is not a struct`);
        exit();
    }

    // print struct
    let structAddress = stackPop(simEnv);
    for (let i = 0; i < structDef.elements.length; i++) {
        const element = structDef.elements[i];
        if (i > 0) {
            const previousElement = structDef.elements[i - 1];
            structAddress += previousElement.size * 8;
        }
        simEnv.dataStack.push(structAddress);
        simGetWordPointedByTOS(simEnv, element.def.internalType, 0);
        simPrintTopOfStack(simEnv, element.def.internalType, newline);
        if (!newline) emit(simEnv, 32);
    }
}

function createVocabulary(): Vocabulary {
    console.assert(TokenType.TOKEN_COUNT === 56, "Exaustive token types count");
    const voc: Vocabulary = {};
    voc[TokenType.PRINT] = {
        txt: "print",
        expectedArity: 1,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: (token) => {
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType === undefined) {
                logError(token.loc, `cannot determine the type of '${token.txt}'`);
                exit();
            }
            return [valueType];
        },
        out: () => "void",
        sim: (simEnv, token) => {
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof valueType === "string") {
                simPrintTopOfStack(simEnv, valueType, true);
                return;
            }
            if (valueType[0] === "array") {
                logError(token.loc, `'${token.txt}' is an array, can't print array yet`);
                exit();
            }
            if (valueType[0] === "addr") {
                logError(token.loc, `'${token.txt}' is an address, can't print address yet`);
                exit();
            }
            const structName = valueType[1];
            simPrintStruct(simEnv, token, structName, true);
        },
        generateAsm: (token, target) => {
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof valueType === "string") return getAsmPrintTopOfStack(valueType, true, target);
            if (valueType[0] === "array") {
                logError(token.loc, `'${token.txt}' is an array, can't print array yet`);
                exit();
            }
            if (valueType[0] === "addr") {
                logError(token.loc, `'${token.txt}' is an address, can't print address yet`);
                exit();
            }
            const structName = valueType[1];
            const structDef = getWordDefinition(token.context, structName);
            if (structDef === undefined) {
                logError(token.childs[0].loc, `Cannot find definition for '${structName}'`);
                exit();
            }
            if (structDef.type !== "struct") {
                logError(token.childs[0].loc, `'${structName}' is not a struct`);
                exit();
            }
            // print struct
            if (target === "c64") {
                let ret: string[] = [
                    "LDX SP16",
                    "LDA STACKBASE + 1,X",
                    "STA STACKACCESS",
                    "LDA STACKBASE + 2,X",
                    "STA STACKACCESS + 1",
                ];
                for (let i = 0; i < structDef.elements.length; i++) {
                    const element = structDef.elements[i];
                    if (i > 0) {
                        const previousElement = structDef.elements[i - 1];
                        ret = ret.concat([
                            "JSR POP16",
                            // in stackaccess the pointer to the field in the record
                            "CLC",
                            "LDA STACKACCESS",
                            `ADC #${previousElement.size}`,
                            "STA STACKACCESS",
                            "LDA STACKACCESS+1",
                            `ADC #0`,
                            "STA STACKACCESS+1",
                            "JSR PUSH16",
                        ])
                    }
                    ret = ret.concat(["JSR PUSH16"]);
                    ret = ret.concat(getAsmForGetWordPointedByTOS(element.def.internalType, 0, target));
                    ret = ret.concat(getAsmPrintTopOfStack(element.def.internalType, true, target));
                }
                ret = ret.concat(["JSR POP16"]);
                return ret;
            }

            if (target === "freebsd") {
                //let ret: string[] = ["pop rax", "push rax"];
                let ret: string[] = ["mov rax, [rsp]"];
                for (let i = 0; i < structDef.elements.length; i++) {
                    const element = structDef.elements[i];
                    if (i > 0) {
                        const previousElement = structDef.elements[i - 1];
                        ret = ret.concat([
                            // in stackaccess the pointer to the field in the record
                            "pop rax",
                            `add rax, ${previousElement.size} ; adding ${previousElement.name} size`,
                            "push rax",
                        ]);
                    }
                    ret = ret.concat(["push rax"]);
                    ret = ret.concat(getAsmForGetWordPointedByTOS(element.def.internalType, 0, target));
                    ret = ret.concat(getAsmPrintTopOfStack(element.def.internalType, true, target));
                }
                ret = ret.concat(["pop rax"]);
                return ret;
            }
            console.log(`target system '${target}' unknown`);
            exit();
        }
    };
    voc[TokenType.PRIN] = {
        txt: "prin",
        expectedArity: 1,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: token => {
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType === undefined) {
                logError(token.loc, `cannot determine the type of '${token.txt}'`);
                exit();
            }
            return [valueType]
        },
        out: () => "void",
        sim: (simEnv, token) => {
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof valueType === "string") {
                simPrintTopOfStack(simEnv, valueType, false);
                return;
            }
            if (valueType[0] === "array") {
                logError(token.loc, `'${token.txt}' is an array, can't print array yet`);
                exit();
            }
            if (valueType[0] === "addr") {
                logError(token.loc, `'${token.txt}' is an address, can't print address yet`);
                exit();
            }
            const structName = valueType[1];
            simPrintStruct(simEnv, token, structName, false);

        },
        generateAsm: (token, target) => {
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof valueType === "string") return getAsmPrintTopOfStack(valueType, false, target);
            if (valueType[0] === "array") {
                logError(token.loc, `'${token.txt}' is an array, can't prin array yet`);
                exit();
            }
            if (valueType[0] === "addr") {
                logError(token.loc, `'${token.txt}' is an addr, can't prin addr yet`);
                exit();
            }
            const structName = valueType[1];
            const structDef = getWordDefinition(token.context, structName);
            if (structDef === undefined) {
                logError(token.loc, `Cannot find definition for '${token.txt}'`);
                exit();
            }
            if (structDef.type !== "struct") {
                logError(token.loc, `'${token.txt}' is not a struct`);
                exit();
            }
            if (target === "c64") {
                let ret: string[] = [
                    "LDX SP16",
                    "LDA STACKBASE + 1,X",
                    "STA STACKACCESS",
                    "LDA STACKBASE + 2,X",
                    "STA STACKACCESS + 1",
                ];
                for (let i = 0; i < structDef.elements.length; i++) {
                    const element = structDef.elements[i];
                    if (i > 0) {
                        const previousElement = structDef.elements[i - 1];
                        ret = ret.concat([
                            "LDA #32",
                            "JSR $FFD2",

                            "JSR POP16",
                            // in stackaccess the pointer to the field in the record
                            "CLC",
                            "LDA STACKACCESS",
                            `ADC #${previousElement.size}`,
                            "STA STACKACCESS",
                            "LDA STACKACCESS+1",
                            `ADC #0`,
                            "STA STACKACCESS+1",
                            "JSR PUSH16",
                        ])
                    }
                    ret = ret.concat(["JSR PUSH16"]);
                    ret = ret.concat(getAsmForGetWordPointedByTOS(element.def.internalType, 0, target));
                    ret = ret.concat(getAsmPrintTopOfStack(element.def.internalType, false, target));
                }
                ret = ret.concat("JSR POP16");
                return ret;
            }
            if (target === "freebsd") {
                let ret: string[] = ["pop rax", "push rax"];
                for (let i = 0; i < structDef.elements.length; i++) {
                    const element = structDef.elements[i];
                    if (i > 0) {
                        const previousElement = structDef.elements[i - 1];
                        ret = ret.concat([
                            // in stackaccess the pointer to the field in the record
                            "mov rcx, 32",
                            "call emit",
                            "pop rax",
                            `add rax, ${previousElement.size}`,
                            "push rax",
                        ]);
                    }
                    ret = ret.concat(["push rax"]);
                    ret = ret.concat(getAsmForGetWordPointedByTOS(element.def.internalType, 0, target));
                    ret = ret.concat(getAsmPrintTopOfStack(element.def.internalType, false, target));
                }
                ret = ret.concat("pop rax");
                return ret;
            }
            console.log(`target system '${target}' unknown`);
            exit();
        }
    };
    voc[TokenType.EMIT] = {
        txt: "emit",
        expectedArity: 1,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: () => ["byte"],
        out: () => "void",
        generateAsm: (token, target) => {
            if (target === "c64") {
                return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "JSR $FFD2",
                ];
            }
            if (target === "freebsd") {
                return [
                    "pop rcx",
                    "call emit",
                ]
            }
            console.log(`target system '${target}' unknown`);
            exit();
        },
        sim: (simEnv, token) => {
            emit(simEnv, stackPop(simEnv));
        }
    };
    voc[TokenType.NL] = {
        txt: "nl",
        expectedArity: 0,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: (token) => [],
        out: () => "void",
        sim: (simEnv, token) => {
            emit(simEnv, 10);
        },
        generateAsm: (token, target) => {
            if (target === "c64") {
                return [
                    "LDA #13",
                    "JSR $FFD2",
                ];
            }
            if (target === "freebsd") {
                return [
                    "call print_lf",
                ]
            }
            console.log(`target system '${target}' unknown`);
            exit();
        },
    };
    voc[TokenType.PLUS] = {
        txt: "+",
        expectedArity: 2,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.INFIX,
        priority: 80,
        userFunction: false,
        ins: token => {
            console.assert(token.childs.length === 2, "The childs of a plus operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === "byte" || type1 === "number") && (type2 === "byte" || type2 === "number")) {
                return [type1, type2]
            }
            return ["number", "number"];
        },
        out: token => {
            console.assert(token.childs.length === 2, "The childs of a plus operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if (type1 === "byte" && type2 === "byte") return "byte";
            return "number";
        },
        generateChildPreludeAsm: (token, n, target) => {
            if (target === "c64") {
                if (n === 0 && token.childs[0].type === TokenType.LITERAL) {
                    return undefined;
                }
                return [];
            }
            if (target === "freebsd") {
                return []
            }
            console.log(`target system '${target}' unknown`);
            exit();
        },
        sim: (simEnv, token) => {
            simEnv.dataStack.push(stackPop(simEnv) + stackPop(simEnv));
        },
        generateAsm: (token, target) => {
            console.assert(token.childs.length === 2, "The childs of a plus operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);

            if (target === "c64") {
                if (token.childs[0].type === TokenType.LITERAL) {
                    const childValue = parseInt(token.childs[0].txt, 10);
                    if (type1 === "byte" && type2 === "byte") {
                        return [
                            `; add byte with ${childValue}`,
                            "LDX SP16",
                            "CLC",
                            "LDA STACKBASE + 1,X",
                            `ADC #<${childValue}`,
                            "STA STACKBASE + 1,X",
                            "LDA #0",
                            "STA STACKBASE + 2,X",
                        ];
                    }
                    return [
                        `; add number with ${childValue}`,
                        "LDX SP16",
                        "CLC",
                        "LDA STACKBASE + 1,X",
                        `ADC #<${childValue}`,
                        "STA STACKBASE + 1,X",
                        "LDA STACKBASE + 2,X",
                        `ADC #>${childValue}`,
                        "STA STACKBASE + 2,X",
                    ];

                }
                if (type1 === "byte" && type2 === "byte") {
                    return [
                        "LDX SP16",
                        "CLC",
                        "LDA STACKBASE + 3,X",
                        "ADC STACKBASE + 1,X",
                        "STA STACKACCESS",
                        "LDA #0",
                        "STA STACKACCESS+1",
                        "INX",
                        "INX",
                        "INX",
                        "INX",
                        "STX SP16",
                        "JSR PUSH16",
                    ];
                }
                return [
                    "LDX SP16",
                    "CLC",
                    "LDA STACKBASE + 1,X",
                    "ADC STACKBASE + 3,X",
                    "STA STACKACCESS",
                    "LDA STACKBASE + 2,X",
                    "ADC STACKBASE + 4,X",
                    "STA STACKACCESS+1",
                    "INX",
                    "INX",
                    "INX",
                    "INX",
                    "STX SP16",
                    "JSR PUSH16",
                ];
            }
            if (target === "freebsd") {
                return [
                    "pop rax",
                    "pop rbx",
                    "add rax, rbx",
                    "push rax",
                ]
            }
            console.log(`target system '${target}' unknown`);
            exit();
        }
    };
    voc[TokenType.MINUS] = {
        txt: "-",
        expectedArity: 2,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.INFIX,
        priority: 80,
        userFunction: false,
        ins: token => {
            console.assert(token.childs.length === 2, "The childs of a minus operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === "byte" || type1 === "number") && (type2 === "byte" || type2 === "number")) {
                return [type1, type2]
            }
            return ["number", "number"];
        },
        out: () => "number",
        sim: (simEnv, token) => {
            simEnv.dataStack.push(- stackPop(simEnv) + stackPop(simEnv));
        },
        generateAsm: (token, target) => {
            if (target === "c64") {
                return ["JSR SUB16"];
            }
            if (target === "freebsd") {
                return [
                    "pop rbx",
                    "pop rax",
                    "sub rax, rbx",
                    "push rax"
                ];
            }
            console.log(`target system '${target}' unknown`);
            exit();
        }
    };
    voc[TokenType.MULT] = {
        txt: "*",
        expectedArity: 2,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.INFIX,
        priority: 90,
        userFunction: false,
        ins: token => {
            console.assert(token.childs.length === 2, "The childs of a multiply operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === "byte" || type1 === "number") && (type2 === "byte" || type2 === "number")) {
                return [type1, type2]
            }
            return ["number", "number"];
        },
        out: () => "number",
        sim: (simEnv, token) => {
            simEnv.dataStack.push(stackPop(simEnv) * stackPop(simEnv));
        },
        generateAsm: (token, target) => {
            if (target === "c64") {
                return ["JSR MUL16"];
            }
            if (target === "freebsd") {
                return [
                    "pop rbx",
                    "pop rax",
                    "mul rbx",
                    "push rax"
                ];
            }
            console.log(`target system '${target}' unknown`);
            exit();
        }
    };
    voc[TokenType.DIV] = {
        txt: "/",
        expectedArity: 2,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.INFIX,
        priority: 90,
        userFunction: false,
        ins: token => {
            console.assert(token.childs.length === 2, "The childs of a division operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === "byte" || type1 === "number") && (type2 === "byte" || type2 === "number")) {
                return [type1, type2]
            }
            return ["number", "number"];
        },
        out: () => "number",
        sim: (simEnv, token) => {
            simEnv.dataStack.push(Math.floor(1 / stackPop(simEnv) * stackPop(simEnv)));
        },
        generateAsm: (token, target) => {
            if (target === "c64") {
                return ["JSR DIV16"];
            }
            if (target === "freebsd") {
                return [
                    "pop rbx",
                    "pop rax",
                    "mov rdx, 0",
                    "idiv rbx",
                    "push rax"
                ]
            }
            console.log(`target system '${target}' unknown`);
            exit();
        }
    };
    voc[TokenType.MOD] = {
        txt: "%",
        expectedArity: 2,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.INFIX,
        priority: 90,
        userFunction: false,
        ins: token => {
            console.assert(token.childs.length === 2, "The childs of a plus operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === "byte" || type1 === "number") && (type2 === "byte" || type2 === "number")) {
                return [type1, type2]
            }
            return ["number", "number"];
        },
        out: () => "number",
        sim: (simEnv, token) => {
            const divisor = stackPop(simEnv);
            const dividend = stackPop(simEnv);
            simEnv.dataStack.push(dividend % divisor);
        },
        generateAsm: (token, target) => {
            if (target === "c64") {
                return ["JSR MOD16"];
            }
            if (target === "freebsd") {
                return [
                    "pop rbx",
                    "pop rax",
                    "mov rdx, 0",
                    "idiv rbx",
                    "push rdx", // modulo in rdx
                ];
            }
            console.log(`target system '${target}' unknown`);
            exit();
        }
    };
    voc[TokenType.NOT] = {
        txt: "!",
        expectedArity: 1,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: token => {
            console.assert(token.childs.length === 1, "The childs of a not operand should be 1, compiler error");
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType === "byte" || valueType === "number" || valueType === "bool") return [valueType];
            return ["number"];
        },
        out: token => {
            console.assert(token.childs.length === 1, "The childs of a not operand should be 1, compiler error");
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType === "byte" || valueType === "number" || valueType === "bool") return valueType;
            return "number";
        },
        sim: (simEnv, token) => {
            simEnv.dataStack.push((stackPop(simEnv) ^ parseInt("FFFFFFFFFFFFF", 16)) + 2);
        },
        generateAsm: (token, target) => {
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (target === "c64") {
                if (valueType === "number") {
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
                } else if (valueType === "byte") {
                    return [
                        "LDX SP16",
                        "LDA STACKBASE + 1,X",
                        "EOR #$FF",
                        "STA STACKBASE + 1,X",
                        "INC STACKBASE + 1,X",
                        "INC STACKBASE + 1,X"
                    ]
                } else if (valueType === "bool") {
                    return [
                        "LDX SP16",
                        "LDA STACKBASE + 1,X",
                        "EOR #$FF",
                        "STA STACKBASE + 1,X",
                        "INC STACKBASE + 1,X",
                        "INC STACKBASE + 1,X"
                    ]
                } else {
                    logError(token.loc, `'not' operator for value ${humanReadableType(valueType)} is not implemented`);
                    exit();
                }
            }
            if (target === "freebsd") {
                if (valueType === "number" || valueType === "byte" || valueType === "bool") {
                    return [
                        "pop rax",
                        "xor rax, 0xFFFFFFFFFFFFFFFF",
                        "inc rax",
                        "inc rax",
                        "push rax"
                    ]
                } else {
                    logError(token.loc, `'not' operator is not implemented for ${humanReadableType(valueType)}`);
                    exit();
                }
            }
            console.log(`target system '${target}' unknown`);
            exit();
        }
    };
    voc[TokenType.LT] = {
        txt: "<",
        expectedArity: 2,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.INFIX,
        priority: 70,
        userFunction: false,
        ins: token => {
            assertChildNumber(token, 2);
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === "byte" || type1 === "number") && (type2 === "byte" || type2 === "number")) {
                return [type1, type2]
            }
            return ["number", "number"];
        },
        out: () => "bool",
        sim: (simEnv, token) => {
            const b = stackPop(simEnv);
            const a = stackPop(simEnv);
            simEnv.dataStack.push(a < b ? 1 : 0);
        },
        generateAsm: (token, target) => {
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if (target === "c64") {
                if (type1 === "byte" && type2 === "byte") {
                    return [
                        "LDX SP16",
                        "LDA STACKBASE + 3,X",
                        "CMP STACKBASE + 1,X",
                        "BCC less@",
                        "LDA #00",
                        "JMP store@",
                        "less@:",
                        "LDA #01",
                        "store@:",
                        "STA STACKACCESS",
                        "LDA #00",
                        "STA STACKACCESS + 1",
                        "INX",
                        "INX",
                        "INX",
                        "INX",
                        "STX SP16",
                        "JSR PUSH16",
                    ]
                }
                return [
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
                    "STA STACKACCESS",
                    "LDA #00",
                    "STA STACKACCESS + 1",
                    "INX",
                    "INX",
                    "INX",
                    "INX",
                    "STX SP16",

                    "JSR PUSH16",

                ];
            }
            if (target === "freebsd") {
                return [
                    "pop rbx",
                    "pop rax",
                    "cmp rax, rbx",
                    "jl .less@",
                    "push 0",
                    "jmp .end@",
                    ".less@:",
                    "push 1",
                    ".end@:",
                ];
            }
            console.log(`target system '${target}' unknown`);
            exit();
        }
    };
    voc[TokenType.EQ] = {
        txt: "=",
        expectedArity: 2,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.INFIX,
        priority: 70,
        userFunction: false,
        ins: token => {
            assertChildNumber(token, 2);
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === "byte" || type1 === "number") && (type2 === "byte" || type2 === "number")) {
                return [type1, type2]
            }
            return ["number", "number"];
        },
        out: () => "bool",
        generateChildPreludeAsm: (token, n, target) => {
            if (target === "c64") {
                if (n === 0 && token.childs[0].type === TokenType.LITERAL) return undefined
                return [];
            }
            if (target === "freebsd") {
                return [];
            }
            console.log(`target system '${target}' unknown`);
            exit();

        },
        sim: (simEnv, token) => {
            simEnv.dataStack.push(stackPop(simEnv) === stackPop(simEnv) ? 1 : 0);
        },
        generateAsm: (token, target) => {
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const isChild1Literal = token.childs[0].type === TokenType.LITERAL;
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if (target === "c64") {
                if (isChild1Literal) {
                    // only the second child on the stack
                    const child1Value = parseInt(token.childs[0].txt, 10);
                    if (type1 === "byte" && type2 === "byte") {
                        return [
                            "LDX SP16",
                            "LDA STACKBASE + 1,X",
                            `CMP #<${child1Value}`,
                            "BNE notequal@",
                            "LDA #01",
                            "JMP store@",

                            "notequal@:",
                            "LDA #00",

                            "store@:",
                            "STA STACKBASE + 1,X",
                            "LDA #00",
                            "STA STACKBASE + 2,X",
                        ]
                    } else {
                        return [
                            "LDX SP16",
                            "LDA STACKBASE + 1,X",
                            `CMP #<${child1Value}`,
                            "BNE notequal@",
                            "LDA STACKBASE + 2,X",
                            `CMP #>${child1Value}`,
                            "BNE notequal@",
                            "LDA #01",
                            "JMP store@",

                            "notequal@:",
                            "LDA #00",

                            "store@:",
                            "STA STACKBASE + 1,X",
                            "LDA #00",
                            "STA STACKBASE + 2,X",
                        ]
                    }
                }

                if (type1 === "byte" && type2 === "byte") {
                    return [
                        "LDX SP16",
                        "LDA STACKBASE + 3,X",
                        "CMP STACKBASE + 1,X",
                        "BNE notequal@",
                        "LDA #01",
                        "JMP store@",

                        "notequal@:",
                        "LDA #00",

                        "store@:",
                        "STA STACKACCESS",
                        "LDA #00",
                        "STA STACKACCESS + 1",
                        "INX",
                        "INX",
                        "INX",
                        "INX",
                        "STX SP16",
                        "JSR PUSH16",
                    ]
                } else {
                    return [
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
                        "STA STACKACCESS",
                        "LDA #00",
                        "STA STACKACCESS + 1",
                        "INX",
                        "INX",
                        "INX",
                        "INX",
                        "STX SP16",
                        "JSR PUSH16",
                    ]
                }
            }
            if (target === "freebsd") {
                return [
                    "pop rax",
                    "pop rbx",
                    "cmp rax, rbx",
                    "jne .not_equal@",
                    "push 1",
                    "jmp .end@",
                    ".not_equal@:",
                    "push 0",
                    ".end@:",
                ]
            }
            console.log(`target system '${target}' unknown`);
            exit();

        }
    };
    voc[TokenType.GT] = {
        txt: ">",
        expectedArity: 2,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.INFIX,
        priority: 70,
        userFunction: false,
        ins: token => {
            console.assert(token.childs.length === 2, "The childs of a greater-than operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === "byte" || type1 === "number") && (type2 === "byte" || type2 === "number")) {
                return [type1, type2]
            }
            return ["number", "number"];
        },
        out: () => "bool",
        sim: (simEnv, token) => {
            const b = stackPop(simEnv);
            const a = stackPop(simEnv);
            simEnv.dataStack.push(a > b ? 1 : 0);
        },
        generateAsm: (token, target) => {
            if (target === "c64") {
                return [
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
            if (target === "freebsd") {
                return [
                    "pop rbx",
                    "pop rax",
                    "cmp rax, rbx",
                    "jg .greater@",
                    "push 0",
                    "jmp .end@",
                    ".greater@:",
                    "push 1",
                    ".end@:",
                ];
            }
            console.log(`target system '${target}' unknown`);
            exit();
        }
    };
    voc[TokenType.AND] = {
        txt: "and",
        expectedArity: 2,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.INFIX,
        priority: 60,
        userFunction: false,
        ins: token => {
            assertChildNumber(token, ["bool", "bool"]);
            return ["bool", "bool"];
        },
        out: () => "bool",
        generateAsm: (token, target) => {
            if (target === "c64") {
                return [
                    "LDX SP16",
                    "LDA STACKBASE + 1,X",
                    "AND STACKBASE + 3,X",
                    "BEQ and_zero@",
                    "LDA #1",
                    "JMP result@",
                    "and_zero@:",
                    "LDA #0",
                    "result@:",
                    "STA STACKACCESS",
                    "LDA #00",
                    "STA STACKBASE + 2,X",
                    "INX",
                    "INX",
                    "INX",
                    "INX",
                    "STX SP16",
                    "JSR PUSH16",
                ];
            }
            if (target === "freebsd") {
                return [
                    "pop rbx",
                    "pop rax",
                    "and rax, rbx",
                    "push rax",
                ]
            }
            console.log(`target system '${target}' unknown`);
            exit();
        },
        sim: (simEnv, token) => {
            simEnv.dataStack.push(stackPop(simEnv) && stackPop(simEnv));
        }
    };
    voc[TokenType.IF] = {
        txt: "if",
        expectedArity: 2,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: () => ["bool", "void"],
        out: () => "void",
        simPreludeChild: (simEnv, ast, childIndex) => {
            if (childIndex === 1) {
                // the second child (the true branch) is executed only 
                // if the stack contains "1" the true value
                return stackPop(simEnv) === 1;
            }
            return true;
        },
        sim: (simEnv, token) => { },
        generateChildPreludeAsm: (ast, n, target) => {
            if (target === "c64") {
                // prelude for the true branch
                if (n === 1) return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "BNE trueblock@",
                    // "LDA STACKACCESS + 1",
                    // "BNE trueblock@",
                    "JMP endblock@ ; if all zero",
                    "trueblock@:",
                ];
                return [];
            }
            if (target === "freebsd") {
                if (n === 1) return [
                    "pop rax",
                    "cmp rax, 0",
                    "jne trueblock@",
                    "jmp endblock@",
                    "trueblock@:",
                ];
                return [];
            }
            console.log(`target system '${target}' unknown`);
            exit();

        },
        generateAsm: (token) => [
            "endblock@:"
        ],
    };
    voc[TokenType.EITHER] = {
        txt: "either",
        expectedArity: 3,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: token => {
            console.assert(token.childs.length === 3, "'Either' should have 3 childs");

            const typeThen = getReturnTypeOfAWord(token.childs[1]);
            const typeElse = getReturnTypeOfAWord(token.childs[2]);

            if (typeThen === undefined) {
                logError(token.childs[1].loc, `cannot determine the type of '${token.childs[1].txt}'`);
                exit();
            }
            if (typeElse === undefined) {
                logError(token.childs[2].loc, `cannot determine the type of '${token.childs[2].txt}'`);
                exit();
            }
            if (typeThen !== typeElse) {
                logError(token.childs[1].loc, `the then branch returns '${humanReadableType(typeThen)}'`);
                logError(token.childs[2].loc, `while the 'else' branch returns '${humanReadableType(typeElse)}'`);
                exit();
            }
            return ["bool", typeThen, typeElse];
        },
        out: token => {
            console.assert(token.childs.length === 3, "'Either' should have 3 childs");
            return getReturnTypeOfAWord(token.childs[1]);
        },
        simPreludeChild: (simEnv, token, childIndex) => {
            if (childIndex === 0) return true;
            if (childIndex === 1) {
                token.auxSimValue = stackPop(simEnv);
                return token.auxSimValue === 1;
            }
            if (childIndex === 2) {
                return token.auxSimValue === 0;
            }
            logError(token.loc, `'${token.txt}' does have more than 3 child`);
            exit();
        },
        sim: (simEnv, token) => { },
        generateChildPreludeAsm: (ast, n, target) => {
            if (target === "c64") {
                // no prelude for condition
                if (n === 0) return [];

                // prelude for true branch
                if (n === 1) return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "BNE trueblock@",
                    // "LDA STACKACCESS + 1",
                    // "BNE trueblock@",
                    "JMP elseblock@ ; if all zero",
                    "trueblock@:"
                ]
                // prelude for else branch
                return [
                    "JMP endblock@",
                    "elseblock@:"
                ];
            }
            if (target === "freebsd") {
                if (n === 0) return [];

                // prelude for true branch
                if (n === 1) return [
                    "pop rax",
                    "cmp rax, 0",
                    "jne trueblock@",
                    "jmp elseblock@",
                    "trueblock@:"
                ]
                // prelude for else branch
                return [
                    "jmp endblock@",
                    "elseblock@:"
                ];
            }
            console.log(`target system '${target}' unknown`);
            exit();

        },
        generateAsm: (token) => [
            "endblock@:",
        ],
    };
    voc[TokenType.OPEN_BRACKETS] = {
        txt: "[",
        expectedArity: 0,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 150,
        userFunction: false,
        ins: () => [],
        out: () => "void",
        generateAsm: (token) => []
    };
    voc[TokenType.OPEN_REF_BRACKETS] = {
        txt: ":[",
        expectedArity: 0,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 150,
        userFunction: false,
        ins: () => [],
        out: () => "void",
        generateAsm: (token) => []
    };
    voc[TokenType.CLOSE_BRACKETS] = {
        txt: "]",
        expectedArity: 0,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.POSTFIX,
        priority: 150,
        userFunction: false,
        ins: () => [],
        out: () => "void",
        generateAsm: (token) => []
    };
    voc[TokenType.BLOCK] = {
        txt: "",
        expectedArity: 0,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 150,
        userFunction: false,
        ins: () => {
            // const childNumber = token.childs.length;
            // if (childNumber === 0) return [];
            // //return new Array(childNumber).fill("void");
            // return token.childs.map((child, index) => index === childNumber - 1 ? getReturnTypeOfAWord(child) : "void");
            console.log("should not be called ever!");
            exit();
        },
        out: getReturnValueByBlock,
        generateAsm: (token, target) => {
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                exit();
            }
            if (token.context.parent === undefined) return []; // the global context

            let sizeToRelease = sizeOfContext(token.context, target);
            if (sizeToRelease === 0) return ["; no stack memory to release"];
            if (target === "c64") {
                return [
                    `; release ${sizeToRelease} on the stack`,
                    "LDA CTX_SP16",
                    "CLC",
                    `ADC #${sizeToRelease}`,
                    "STA CTX_SP16",
                ];
            }
            if (target === "freebsd") {
                return [
                    `; release ${sizeToRelease} on the stack`,
                    "mov rax, [ctx_stack_rsp]",
                    `add rax, ${sizeToRelease}`,
                    "mov [ctx_stack_rsp], rax",
                ];
            }
            console.log(`target system '${target}' unknown`);
            exit();

        },
        generatePreludeAsm: (token, target) => {
            // at the start we make some space on the stack, for variables
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                exit();
            }

            if (token.context.parent === undefined) return []; // the global context

            let sizeToReserve = 0;
            for (const [key, varDef] of Object.entries(token.context.varsDefinition)) {
                varDef.offset = sizeToReserve;
                const valueType = varDef.internalType;
                sizeToReserve += sizeForValueType(varDef.internalType, target);
            }

            const strVariables = Object.values(token.context.varsDefinition).map(varDef => varDef.token.txt + " (" + humanReadableType(varDef.out) + " offset " + varDef.offset + ")").join(", ");
            if (sizeToReserve === 0) return ["; no stack memory to reserve"];

            if (target === "c64") {
                return [
                    `; reserve ${sizeToReserve} on the stack for: ${strVariables}`,
                    "LDA CTX_SP16",
                    "SEC",
                    `SBC #${sizeToReserve}`,
                    "STA CTX_SP16"
                ];
            }
            if (target === "freebsd") {
                return [
                    "mov rax, [ctx_stack_rsp]",
                    `sub rax, ${sizeToReserve}`,
                    "mov [ctx_stack_rsp], rax",
                ];
            }
            console.log(`target system '${target}' unknown`);
            exit();

        },
        simPrelude: (simEnv, token) => {
            // at the start we make some space on the stack, for variables
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, sim error`);
                exit();
            }

            if (token.context.parent === undefined) {
                logError(token.loc, `the context of ${token.txt} is global ? sim error`);
                exit();
            }

            let sizeToReserve = 0;
            for (const [key, varDef] of Object.entries(token.context.varsDefinition)) {
                varDef.offset = sizeToReserve;
                const valueType = varDef.internalType;
                const sizeForType = valueType === "string" || (valueType instanceof Array && valueType[0] === "array") ? 2 : 1
                sizeToReserve += sizeForType;
                if (sizeForType === 1) {
                    simEnv.ctxStack.push(0);
                } else {
                    simEnv.ctxStack.push(0);
                    simEnv.ctxStack.push(0);
                }
            }
        },
        sim: (simEnv, token) => {
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, sim error`);
                exit();
            }

            if (token.context.parent === undefined) {
                logError(token.loc, `'${token.txt}' the context does not have a parent`);
                exit();
            }

            for (const [key, varDef] of Object.entries(token.context.varsDefinition)) {
                const valueType = varDef.internalType;
                const sizeForType = valueType === "string" || (valueType instanceof Array && valueType[0] === "array") ? 2 : 1
                if (sizeForType === 1) {
                    simEnv.ctxStack.pop();
                } else {
                    simEnv.ctxStack.pop();
                    simEnv.ctxStack.pop();
                }
            }
        }
    };
    voc[TokenType.REF_BLOCK] = {
        txt: "",
        expectedArity: 0,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: true,
        ins: () => {
            console.log("should not be called ever!");
            exit();
        },
        //out: getReturnValueByBlock,
        out: () => "addr",
        generatePreludeAsm: (token, target) => {
            // at the start we make some space on the stack, for variables
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                exit();
            }
            if (token.context.parent === undefined) {
                logError(token.loc, `the context of '${token.txt}' is the global context, compiler error`);
                exit();
            }

            let sizeToReserve = 0;
            for (const [key, varDef] of Object.entries(token.context.varsDefinition)) {
                varDef.offset = sizeToReserve;
                const valueType = varDef.internalType;
                sizeToReserve += sizeForValueType(valueType, target);
            }

            const strVariables = Object.values(token.context.varsDefinition).map(varDef => varDef.token.txt + " (" + humanReadableType(varDef.internalType) + " offset " + varDef.offset + ")").join(", ");
            token.functionIndex = getFunctionIndex();
            const asmFunctionName = getFunctionName(token.functionIndex);
            const asmAfterFunctionName = getAfterFunctionName(token.functionIndex);

            if (target === "c64") {
                const asmReserveStackSpace = sizeToReserve === 0 ? ["; no stack memory to reserve"] : [
                    `; reserve ${sizeToReserve} on the stack for: ${strVariables}`,
                    "LDA CTX_SP16",
                    "SEC",
                    `SBC #${sizeToReserve}`,
                    "STA CTX_SP16"
                ];
                return [
                    `JMP ${asmAfterFunctionName}`,
                    `${asmFunctionName}:`,
                ].concat(asmReserveStackSpace);
            }
            if (target === "freebsd") {
                return [
                    `jmp ${asmAfterFunctionName}`,
                    `${asmFunctionName}:`,
                    `mov [ret_stack_rsp], rsp`,
                    "mov rsp, rax", // data stack was in rax before the call
                ].concat((sizeToReserve > 0 ? [
                    `mov rbx, [ctx_stack_rsp]`,
                    `sub rbx, ${sizeToReserve}`,
                    "mov [ctx_stack_rsp], rbx",
                ] : []));
            }
            console.log(`target system '${target}' unknown`);
            exit();

        },
        generateAsm: (token, target) => {
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                exit();
            }
            if (token.context.parent === undefined) return []; // the global context
            if (token.functionIndex === undefined) {
                logError(token.loc, `'${token.txt}' function index is not defined`);
                exit();
            }
            let sizeToRelease = sizeOfContext(token.context, target);
            const asmFunctionName = getFunctionName(token.functionIndex);
            const asmAfterFunctionName = getAfterFunctionName(token.functionIndex);

            if (target === "c64") {
                const asmReleaseSpace = sizeToRelease === 0 ? ["; no stack memory to release"] : [
                    `; release ${sizeToRelease} on the stack`,
                    "LDA CTX_SP16",
                    "CLC",
                    `ADC #${sizeToRelease}`,
                    "STA CTX_SP16"
                ];
                return asmReleaseSpace.concat([
                    `RTS`,
                    `${asmAfterFunctionName}:`,
                    `LDA #<${asmFunctionName}`,
                    "STA STACKACCESS",
                    `LDA #>${asmFunctionName}`,
                    "STA STACKACCESS + 1",
                    "JSR PUSH16",
                ]);
            }
            if (target === "freebsd") {

                return (sizeToRelease > 0 ? [
                    "mov rax, [ctx_stack_rsp]",
                    `add rax, ${sizeToRelease}`,
                    "mov [ctx_stack_rsp], rax",
                ] : []).concat([
                    "mov rax, rsp",
                    "mov rsp, [ret_stack_rsp]",
                    "ret",
                    `${asmAfterFunctionName}:`,
                    `push ${asmFunctionName}`
                ]);
            }
            console.log(`target system '${target}' unknown`);
            exit();
        },
        simPrelude: (simEnv, token) => {
            // if we are defining the function we don't need to execute anything
            if (token.functionIndex === undefined) return;

            // at the start we make some space on the stack, for variables
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, sim error`);
                exit();
            }

            if (token.context.parent === undefined) {
                logError(token.loc, `the context of ${token.txt} is global ? sim error`);
                exit();
            }

            let sizeToReserve = 0;
            for (const [key, varDef] of Object.entries(token.context.varsDefinition)) {
                varDef.offset = sizeToReserve;
                const valueType = varDef.internalType;
                const sizeForType = valueType === "string" || (valueType instanceof Array && valueType[0] === "array") ? 2 : 1
                sizeToReserve += sizeForType;
                if (sizeForType === 1) {
                    simEnv.ctxStack.push(0);
                } else {
                    simEnv.ctxStack.push(0);
                    simEnv.ctxStack.push(0);
                }
            }
        },
        simPreludeChild: (simEnv, token, childIndex) => {
            // if we are defining the function we don't need to execute anything
            if (token.functionIndex === undefined) return false;
            return true;
        },
        sim: (simEnv, token) => {
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, sim error`);
                exit();
            }

            if (token.context.parent === undefined) {
                logError(token.loc, `'${token.txt}' the context does not have a parent`);
                exit();
            }
            if (token.functionIndex === undefined) {
                token.functionIndex = getFunctionIndex();
                simEnv.dataStack.push(token.functionIndex);
                simEnv.addresses[token.functionIndex] = token;
            } else {
                for (const [key, varDef] of Object.entries(token.context.varsDefinition)) {
                    const valueType = varDef.internalType;
                    const sizeForType = valueType === "string" || (valueType instanceof Array && valueType[0] === "array") ? 2 : 1
                    if (sizeForType === 1) {
                        simEnv.ctxStack.pop();
                    } else {
                        simEnv.ctxStack.pop();
                        simEnv.ctxStack.pop();
                    }
                }
                const retAddress = simEnv.retStack.pop();
                if (retAddress === undefined) {
                    logError(token.loc, `'${token.txt}' return stack is empty`);
                    exit();
                }
                return [retAddress, true];
            }
        }        
    };
    voc[TokenType.DATA_BLOCK] = {
        txt: "",
        expectedArity: 0,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: true,
        ins: () => [],
        out: () => "addr",
        generatePreludeAsm: (token, target) => {
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                exit();
            }
            if (token.context.parent === undefined) {
                logError(token.loc, `the context of '${token.txt}' is the global context, compiler error`);
                exit();
            }

            let elementType;
            for (let i = 0; i < token.childs.length; i++) {
                const child = token.childs[i];
                const currentType = getReturnTypeOfAWord(child);
                if (elementType === undefined) elementType = currentType;
                if (!areTypesEqual(elementType, currentType)) {
                    logError(child.loc, `'${child.txt}' should be ${humanReadableType(elementType)} but it's a ${humanReadableType(currentType)}`);
                    exit();
                }
            }
            return [];
        },
        simPrelude: (simEnv, token) => {
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                exit();
            }
            if (token.context.parent === undefined) {
                logError(token.loc, `the context of '${token.txt}' is the global context, compiler error`);
                exit();
            }

            let elementType;
            for (let i = 0; i < token.childs.length; i++) {
                const child = token.childs[i];
                const currentType = getReturnTypeOfAWord(child);
                if (elementType === undefined) elementType = currentType;
                if (!areTypesEqual(elementType, currentType)) {
                    logError(child.loc, `'${child.txt}' should be ${humanReadableType(elementType)} but it's a ${humanReadableType(currentType)}`);
                    exit();
                }
            }
        },
        generateAsm: (token, target) => {
            if (token.childs.length === 0) {
                logError(token.loc, `'${token.txt}' should have at least one element, cannot determine the type`);
                exit();
            }
            const arrayType = getReturnTypeOfAWord(token.childs[0]);
            const arrayLen = token.childs.length;
            const sizeOfType = sizeForValueType(arrayType, target);
            const totalSize = arrayLen * sizeOfType;

            if (target === "c64") {
                return [
                    "LDA SP16",                     // from address $00SP + 1 es $00FA
                    "STA FROMADD+1",
                    "INC FROMADD+1",
                    "CLC",
                    `ADC #${totalSize}`,
                    "STA SP16",
                    "LDA #00",
                    "STA FROMADD + 2",
                    "LDA HEAPTOP",                  // to address [HEAPTOP] 
                    "STA TOADD + 1",
                    "STA AUX",                      // save heaptop in aux
                    "LDA HEAPTOP + 1",
                    "STA TOADD + 2",
                    "STA AUX + 1",
                    `LDY #${totalSize}`,            // size in bytes
                    "JSR COPYMEM",                  // copy from stack to heap
                    "LDA TOADD + 1",                // new [HEAPTOP]
                    "STA HEAPTOP",
                    "LDA TOADD + 2",
                    "STA HEAPTOP + 1",
                    `LDA #<${arrayLen}`,            // push LEN
                    "STA STACKACCESS",
                    `LDA #>${arrayLen}`,
                    "STA STACKACCESS + 1",
                    "JSR PUSH16",
                    `LDA AUX`,                      // push ADD
                    "STA STACKACCESS",
                    `LDA AUX + 1`,
                    "STA STACKACCESS + 1",
                    "JSR PUSH16",
                ];
            }
            if (target === "freebsd") {
                return [
                    `mov rax, ${totalSize}`, // allocate space
                    `call allocate`,
                    "mov rsi, rsp",          // from the new tos
                    "mov rdi, rbx",          // to the heap
                    `mov rcx, ${totalSize}`, // bytes count
                    "rep movsb",             // copy the array
                    `add rsp, ${totalSize}`, // pop all the elements
                    `push ${arrayLen}`,      // push len
                    "push rbx",              // push the address
                ];
            }
            console.log(`target system '${target}' unknown`);
            exit();
        },
        sim: (simEnv, token) => {
            if (token.childs.length === 0) {
                logError(token.loc, `'${token.txt}' should have at least one element, cannot determine the type`);
                exit();
            }
            const arrayType = getReturnTypeOfAWord(token.childs[0]);
            const arrayLen = token.childs.length;
            const sizeOfType = sizeForValueType(arrayType, "sim");
            const totalSize = arrayLen * sizeOfType;

            const startHeapAddress = simEnv.heapTop;
            for (let i = 0; i < totalSize; i++) {
                const value = stackPop(simEnv);
                storeNumberOnHeap(simEnv, value, undefined);
            }
            simEnv.dataStack.push(arrayLen);
            simEnv.dataStack.push(startHeapAddress);
        }
    };
    voc[TokenType.SET_WORD] = {
        txt: "",
        expectedArity: 1,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: token => {
            assertChildNumber(token, 1);
            const child = token.childs[0];
            const valueType = getReturnTypeOfAWord(child);
            if (valueType === undefined) {
                logError(child.loc, `cannot determine the type of '${child.txt}'`);
                exit();
            }
            if (valueType === "void") {
                logError(token.loc, `can't store 'void' values in variables`);
                exit();
            }
            const varDef = getWordDefinition(token.context, token.txt);
            if (varDef === undefined) {
                logError(token.loc, `can't find variable definition for '${token.txt}', compiler error`);
                exit();
            }
            return [varDef.out];
        },
        out: () => "void",
        generateAsm: (token, target) => {
            const varName = token.txt;
            const varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, `cannot find declaration for '${varName}', compiler error`);
                exit();
            }
            if (varDef.isGlobalContext) return getAsmForSetWordGlobal(varDef.internalType, getAsmVarName(varName), 0, target);

            if (varDef.offset === undefined) {
                logError(token.loc, `SET_WORD generateAsm can't compute the offset of '${varName}' onto the stack, compiler error`);
                exit();
            }
            return getAsmForSetWordLocal(varDef.internalType, varDef.offset, target);
        },
        sim: (simEnv, token) => {
            const varName = token.txt;
            const varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, `cannot find declaration for '${varName}', compiler error`);
                exit();
            }
            if (varDef.isGlobalContext) return simSetWordGlobal(simEnv, varDef.internalType, varName);

            if (varDef.offset === undefined) {
                logError(token.loc, `SET_WORD sim can't compute the offset of '${varName}' onto the stack, compiler error`);
                exit();
            }
            return simSetWordLocal(simEnv, varDef.internalType, varDef.offset);
        }
    };
    voc[TokenType.LIT_WORD] = {
        txt: "",
        expectedArity: 1,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 5,
        userFunction: false,
        ins: token => {
            assertChildNumber(token, 1);
            const child = token.childs[0];
            const valueType = getReturnTypeOfAWord(child);
            if (valueType === undefined) {
                logError(child.loc, `cannot determine the type of '${child.txt}'`);
                exit();
            }
            if (valueType === "void") {
                logError(token.loc, `can't store 'void' values in variables`);
                exit();
            }
            return [valueType];
        },
        out: () => "void",
        generateAsm: (token, target) => {
            const varName = token.txt;
            const varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, `LIT_WORD generateAsm cannot find declaration for '${varName}', compiler error`);
                console.log(token.context);
                exit();
            }
            if (varDef.isGlobalContext) return getAsmForSetWordGlobal(varDef.internalType, getAsmVarName(varName), 0, target);

            if (varDef.offset === undefined) {
                logError(token.loc, `LIT_WORD generateAsm can't compute the offset of '${varName}' onto the stack, compiler error`);
                exit();
            }
            return getAsmForSetWordLocal(varDef.internalType, varDef.offset, target);
        },
        sim: (simEnv, token) => {
            const varName = token.txt;
            const varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, `LIT_WORD sim cannot find declaration for '${varName}', compiler error`);
                console.log(token.context);
                exit();
            }
            if (varDef.isGlobalContext) {
                simSetWordGlobal(simEnv, varDef.internalType, varName);
            } else {
                const offset = varDef.offset;
                if (offset === undefined) {
                    logError(token.loc, `LIT_WORD sim can't compute the offset of '${varName}' onto the stack`);
                    exit();
                }
                simSetWordLocal(simEnv, varDef.internalType, offset);
            }
        },
    };
    voc[TokenType.WORD] = {
        txt: "",
        expectedArity: 0,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: (token) => {
            const funcDef = getWordDefinition(token.context, token.txt);
            if (token.isUserFunction) {
                if (funcDef === undefined) {
                    logError(token.loc, `cannot find definition for function '${token.txt}', compiler error`);
                    exit();
                }
                if (funcDef.ins === undefined) {
                    logError(token.loc, `the function '${token.txt}' should have a list of parameters type, compiler error`);
                    exit();
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
                    exit();
                }
                if (varDef.out === undefined) {
                    logError(token.loc, `the function '${token.txt}' should return a type value, compiler error`);
                    exit();
                }
                return varDef.out;
            } else {
                if (varDef !== undefined) return varDef.out;
                logError(token.loc, `word '${varName}' not defined`);
                exit();
            }
        },
        generateAsm: (token, target) => {
            const varName = token.txt;
            const varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, `cannot find declaration for '${varName}', compiler error`);
                exit();
            }

            if (varDef.type === "struct") {
                return [
                    "; no asm for constructor"
                ];
            }

            const valueType = varDef.out;
            if (valueType === undefined) {
                logError(token.loc, `cannot determine the result type of function '${varName}', compiler error`);
                exit();
            }

            if (varDef.isGlobalContext) return getAsmForGetWordGlobal(token, valueType, getAsmVarName(varName), varDef.type === "function", target);

            if (varDef.offset === undefined) {
                logError(token.loc, `WORD generateAsm can't compute the offset of '${varName}' onto the stack, compiler error`);
                exit();
            }
            return getAsmForGetWordLocal(valueType, varDef.offset, varDef.type === "function", target);
        },
        sim: (simEnv, token) => {
            const varName = token.txt;
            const varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, `cannot find declaration for '${varName}', compiler error`);
                exit();
            }
            // no need to sim struct values ?
            if (varDef.type === "struct") return;

            const valueType = varDef.out;
            if (valueType === undefined) {
                logError(token.loc, `cannot determine the result type of function '${varName}', compiler error`);
                exit();
            }

            if (varDef.isGlobalContext) {
                if (varDef.type === "function") {
                    const addr = simEnv.vars[varName];
                    if (addr === undefined) {
                        logError(token.loc, `'${token.txt}' vars is undefined`);
                        exit();
                    }
                    const addressIndex = readNumberFromHeap(simEnv, addr);
                    const functionToken = simEnv.addresses[addressIndex];
                    simEnv.retStack.push(token);
                    return [functionToken, false];
                } else {
                    simGetWordGlobal(simEnv, token, valueType, varName);
                }

            } else {
                if (varDef.offset === undefined) {
                    logError(token.loc, `WORD sim can't compute the offset of '${varName}' onto the stack, compiler error`);
                    exit();
                }
                if (varDef.type === "function") {
                    const addressIndex = simEnv.ctxStack.at(-(varDef.offset + 1));
                    if (addressIndex === undefined) {
                        logError(token.loc, `'${token.txt}' at offset ${varDef.offset} is undefined`);
                        exit();
                    }
                    const functionToken = simEnv.addresses[addressIndex];
                    simEnv.retStack.push(token);
                    return [functionToken, false];
                } else {
                    simGetWordLocal(simEnv, token, varDef.internalType, varDef.offset);
                }
            }
        }
    };
    voc[TokenType.WHILE] = {
        txt: "while",
        expectedArity: 2,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: () => ["bool", "void"],
        out: () => "void",
        simPreludeChild: (simEnv, token, childIndex) => {
            if (childIndex === 1) {
                token.auxSimValue = stackPop(simEnv);
                return token.auxSimValue === 1;
            } else {
                return true;
            }
        },
        sim: (simEnv, token) => {
            // if the condition is true, must repeat the while
            if (token.auxSimValue === 1) {
                return [token, false];
            }
        },
        generateChildPreludeAsm: (ast, n, target) => {
            if (target === "c64") {
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
                        // "LDA STACKACCESS + 1",
                        // "BNE trueblock@",
                        "JMP endblock@ ; if all zero",
                        "trueblock@:",
                    ];
                }
            }
            if (target === "freebsd") {
                // prelude for the true branch
                if (n === 0) {
                    return [
                        "startloop@:"
                    ];
                } else {
                    return [
                        "pop rax",
                        "cmp rax, 0",
                        "jne trueblock@",
                        "jmp endblock@",
                        "trueblock@:",
                    ];
                }
            }

        },
        generateAsm: (token, target) => {
            if (target === "c64") {
                return [
                    "JMP startloop@",
                    "endblock@:",
                ]
            }
            if (target === "freebsd") {
                return [
                    "jmp startloop@",
                    "endblock@:",
                ]
            }
            console.log(`target system '${target}' unknown`);
            exit();
        }
        ,
    };
    voc[TokenType.POKE] = {
        txt: "poke",
        expectedArity: 2,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: () => ["number", "byte"],
        out: () => "void",
        generateAsm: (token) => [
            "JSR POP16",
            "LDY STACKACCESS",
            "JSR POP16",
            "TYA",
            "LDY #0",
            "STA (STACKACCESS),Y"
        ],
        sim: (simEnv, token) => {
            const value = stackPop(simEnv);
            const addr = stackPop(simEnv);
            simEnv.memory[addr] = value;
        },
    };
    voc[TokenType.PEEK] = {
        txt: "peek",
        expectedArity: 1,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: () => ["number"],
        out: () => "byte",
        sim: (simEnv, token) => {
            simEnv.dataStack.push(simEnv.memory[stackPop(simEnv)]);
        },
        generateAsm: (token, target) => {
            if (target === "c64") {
                return [
                    "JSR POP16",
                    "LDY #0",
                    "LDA (STACKACCESS),Y",
                    "STA STACKACCESS",
                    "STY STACKACCESS+1",
                    "JSR PUSH16"
                ]
            } else {
                return [
                    "pop rbx",
                    "mov rax, [rbx]",
                    "push rax"
                ]
            }
        }
    };
    voc[TokenType.CAST_BYTE] = {
        txt: "!<",
        expectedArity: 1,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: token => {
            assertChildNumber(token, 1);
            const type = getReturnTypeOfAWord(token.childs[0]);
            if (type === "addr" || type === "string" || type === "symbol" || type === "void") {
                logError(token.childs[0].loc, `expected Number, Byte or Boolean, but '${token.childs[0].txt}' is ${humanReadableType(type)}`);
                exit();
            }
            return [type];
        },
        out: () => "byte",
        generateAsm: () => [],
        sim: (simEnv, token) => {
            simEnv.dataStack.push(stackPop(simEnv) & 255);
        },
    };
    voc[TokenType.CAST_NUMBER] = {
        txt: "!n",
        expectedArity: 1,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: () => ["byte"],
        out: () => "number",
        generateAsm: () => []
    };
    voc[TokenType.NUMBER] = {
        txt: "Number",
        expectedArity: 0,
        expectedArityOut: 1,
        grabFromStack: true,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: () => [],
        out: () => "number",
        generateAsm: token => {
            return []
        },
        sim: (simEnv, token) => { }
    };
    voc[TokenType.STRING] = {
        txt: "String",
        expectedArity: 0,
        expectedArityOut: 1,
        grabFromStack: true,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: () => [],
        out: () => "string",
        generateAsm: () => [],
        sim: () => { }
    };
    voc[TokenType.BYTE] = {
        txt: "Byte",
        expectedArity: 0,
        expectedArityOut: 1,
        grabFromStack: true,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: () => [],
        out: () => "byte",
        generateAsm: () => [],
        sim: () => { }
    };
    voc[TokenType.BOOL] = {
        txt: "Bool",
        expectedArity: 0,
        expectedArityOut: 1,
        grabFromStack: true,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: () => [],
        out: () => "bool",
        generateAsm: () => [],
        sim: () => { }
    };
    voc[TokenType.ADDR] = {
        txt: "!addr",
        expectedArity: 1,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: token => {
            assertChildNumber(token, 1);
            const childReturnType = getReturnTypeOfAWord(token.childs[0]);
            if (childReturnType === undefined) {
                logError(token.childs[0].loc, `the return type of '${token.childs[0].txt}' is undefined`);
                exit();
            }

            if (typeof childReturnType === "string" && childReturnType !== "string" && childReturnType !== "addr") {
                logError(token.childs[0].loc, `the return type of '${token.childs[0].txt}' is ${humanReadableType(token.childs[0].out)} but it should be a struct type or a string`);
                exit();
            }
            return [childReturnType];
        },
        out: () => "number",
        generateAsm: (token, target) => {
            assertChildNumber(token, 1);
            const childReturnType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof childReturnType === "string" && childReturnType !== "string") {
                logError(token.childs[0].loc, `the return type of '${token.childs[0].txt}' is ${humanReadableType(token.childs[0].out)} but it should be a struct type or a string`);
                exit();
            }
            if (target === "c64") {
                if (childReturnType === "string") {
                    return [
                        "LDX SP16",
                        "LDA STACKBASE + 1,X",
                        "STA STACKBASE + 3,X",
                        "INX",
                        "LDA STACKBASE + 1,X",
                        "STA STACKBASE + 3,X",
                        "INX",
                        "STX SP16",
                    ];
                }
                if (childReturnType[0] === "array") {
                    return [
                        "LDX SP16",
                        "LDA STACKBASE + 1,X",
                        "STA STACKBASE + 3,X",
                        "INX",
                        "LDA STACKBASE + 1,X",
                        "STA STACKBASE + 3,X",
                        "INX",
                        "STX SP16",
                    ];
                }
                return [];
            }
            if (target === "freebsd") {
                if (childReturnType === "string") {
                    return [
                        "pop rax", // address
                        "pop rbx", // get rid of the len
                        "push rax",
                    ];
                }
                if (childReturnType[0] === "array") {
                    return [
                        "pop rax", // address
                        "pop rbx", // get rid of the len
                        "push rax",
                    ];
                }
                return [];
            }
            console.log(`target system '${target}' unknown`);
            exit();
        },
        sim: (simEnv, token) => {
            const childReturnType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof childReturnType === "string" && childReturnType !== "string") {
                logError(token.childs[0].loc, `the return type of '${token.childs[0].txt}' is ${humanReadableType(token.childs[0].out)} but it should be a struct type or a string`);
                exit();
            }
            if (childReturnType === "string" || childReturnType[0] === "array") {
                const addr = stackPop(simEnv);
                stackPop(simEnv); // get rif of the len
                simEnv.dataStack.push(addr);
            }
        }
    };
    voc[TokenType.STR_JOIN] = {
        txt: ".",
        expectedArity: 2,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.INFIX,
        priority: 100,
        userFunction: false,
        ins: () => ["string", "string"],
        out: () => "string",
        generateAsm: (token, target) => {
            if (target === "c64") {
                return [
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
                ];
            }
            if (target === "freebsd") {
                return [
                    "pop r8", // add2
                    "pop r9", // len2
                    "pop r10", // add1
                    "pop r11", // len1                    
                    "mov rax, r9",
                    "add rax, r11",
                    "call allocate",
                    "mov rsi, r10",
                    "mov rdi, rbx",
                    "mov rcx, r11",
                    "rep movsb",
                    "mov rsi, r8",
                    "mov rcx, r9",
                    "rep movsb",
                    "push rax",
                    "push rbx",
                ];
            }
            console.log(`target system '${target}' unknown`);
            exit();
        },
        sim: (simEnv, token) => {
            const addr2 = stackPop(simEnv);
            const len2 = stackPop(simEnv);
            const addr1 = stackPop(simEnv);
            const len1 = stackPop(simEnv);
            const result = readStringFromHeap(simEnv, addr1, len1) + readStringFromHeap(simEnv, addr2, len2);
            const addr = storeStringOnHeap(simEnv, result);
            simEnv.dataStack.push(len1 + len2);
            simEnv.dataStack.push(addr);
        }
    };
    voc[TokenType.STACK] = {
        txt: "stack",
        expectedArity: 0,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: () => [],
        out: () => "number",
        sim: (simEnv, token) => {
            simEnv.dataStack.push(simEnv.dataStack.length);
        },
        generateAsm: (token, target) => {
            if (target === "c64") {
                return [
                    "LDA SP16",
                    "STA STACKACCESS",
                    "LDA #0",
                    "STA STACKACCESS+1",
                    "JSR PUSH16",
                ];
            }
            if (target === "freebsd") {
                return [
                    // "push rsp"
                    "push qword [ret_stack_rsp]"
                ]
            }
            console.log(`target system '${target}' unknown`);
            exit();
        }
    };
    voc[TokenType.STR_LEN] = {
        txt: "#",
        expectedArity: 1,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: () => ["string"],
        out: () => "byte",
        generateAsm: (token, target) => {
            if (target === "c64") {
                return ["JSR POP16"];
            }
            if (target === "freebsd") {
                return ["pop rax"];
            }
            console.log(`target system '${target}' unknown`);
            exit();
        },
        sim: (simEnv, token) => {
            stackPop(simEnv);
        }
    };
    voc[TokenType.PROG] = {
        txt: "",
        expectedArity: 0,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 150,
        userFunction: false,
        ins: () => [],
        out: token => {
            if (token.childs.length === 0) return "void";
            const lastChild = token.childs[token.childs.length - 1];
            const valueType = getReturnTypeOfAWord(lastChild);
            if (valueType === undefined) {
                logError(lastChild.loc, `cannot determine the type of '${lastChild.txt}'`);
                exit();
            }
            return valueType;
        },
        generateAsm: (token, target) => {
            if (target === "c64") {
                const lib = [
                    "RTS",
                    "BCD DS 3 ; USED IN BIN TO BCD",
                    "HEAPSAVE DS 3 ; USED IN COPYSTRING",
                    "AUXMUL DS 2",
                    "HEAPTOP DS 2",
                    "TEST_UPPER_BIT: BYTE $80",
                    "CTX_SP16 = $7C",
                    "AUX = $7D",
                    "SP16 = $7F",
                    "STACKACCESS = $0080",
                    "STACKBASE = $0000",

                    `CTX_STACKBASE = ${CTX_PAGE * 256}`,

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

                    "OVERSWAP16:",      // 6, 5, 4, 3, 2, 1 => 4, 3, 6, 5, 2, 1
                    "LDX SP16",

                    "LDA STACKBASE + 5,X",
                    "STA AUX",
                    "LDA STACKBASE + 6,X",
                    "STA AUX + 1",

                    "LDA STACKBASE + 3,X",
                    "STA STACKBASE + 5,X",
                    "LDA STACKBASE + 4,X",
                    "STA STACKBASE + 6,X",

                    "LDA AUX",
                    "STA STACKBASE + 3,X",
                    "LDA AUX + 1",
                    "STA STACKBASE + 4,X",
                    "RTS",

                    "OVER16:",      // 6, 5, 4, 3, 2, 1 => 4, 3, 2, 1, 6, 5
                    "LDX SP16",

                    "LDA STACKBASE + 5,X",
                    "STA AUX",
                    "LDA STACKBASE + 6,X",
                    "STA AUX + 1",

                    "LDA STACKBASE + 3,X",
                    "STA STACKBASE + 5,X",
                    "LDA STACKBASE + 4,X",
                    "STA STACKBASE + 6,X",

                    "LDA STACKBASE + 1,X",
                    "STA STACKBASE + 3,X",
                    "LDA STACKBASE + 2,X",
                    "STA STACKBASE + 4,X",

                    "LDA AUX",
                    "STA STACKBASE + 1,X",
                    "LDA AUX + 1",
                    "STA STACKBASE + 2,X",
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

                    // CTX_STACK
                    "CTX_INITSTACK:",
                    "LDX #$FF",
                    "STX CTX_SP16",
                    "RTS",

                    "CTX_PUSH16:",
                    "LDX CTX_SP16",
                    "LDA STACKACCESS + 1",
                    "STA CTX_STACKBASE,X",
                    "DEX",
                    "LDA STACKACCESS",
                    "STA CTX_STACKBASE,X",
                    "DEX",
                    "STX CTX_SP16",
                    "RTS",

                    "CTX_POP16:",
                    "LDX CTX_SP16",
                    "LDA CTX_STACKBASE + 1,X",
                    "STA STACKACCESS",
                    "INX",
                    "LDA CTX_STACKBASE + 1,X",
                    "STA STACKACCESS + 1",
                    "INX",
                    "STX CTX_SP16",
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
                    "LDY #0",
                    "JSR BINBCD16",
                    "LDA BCD+2",
                    "AND #$0F",
                    "BEQ DIGIT2",
                    "TAY",
                    "CLC",
                    "ADC #$30",
                    "JSR $FFD2",

                    "DIGIT2:",
                    "LDA BCD+1",
                    "LSR",
                    "LSR",
                    "LSR",
                    "LSR",
                    "BNE DO_DIGIT_2",
                    "CPY #00",
                    "BEQ DIGIT_3",
                    "DO_DIGIT_2:",
                    "LDY #1",
                    "CLC",
                    "ADC #$30",
                    "JSR $FFD2",

                    "DIGIT_3:",
                    "LDA BCD+1",
                    "AND #$0F",
                    "BNE DO_DIGIT_3",
                    "CPY #00",
                    "BEQ DIGIT_4",
                    "DO_DIGIT_3:",
                    "LDY #1",
                    "CLC",
                    "ADC #$30",
                    "JSR $FFD2",

                    "DIGIT_4:",
                    "LDA BCD+0",
                    "LSR",
                    "LSR",
                    "LSR",
                    "LSR",
                    "BNE DO_DIGIT_4",
                    "CPY #00",
                    "BEQ DIGIT_5",
                    "DO_DIGIT_4:",
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
                    "LDX SP16",
                    "INX",
                    "INX",
                    "STX SP16",
                    "RTS",

                    "MOD16:",
                    "JSR DIV16WITHMOD",
                    "LDX SP16",
                    "LDA STACKBASE + 1,X",
                    "STA STACKBASE + 3,X",
                    "LDA STACKBASE + 2,X",
                    "STA STACKBASE + 4,X",
                    "INX",
                    "INX",
                    "STX SP16",
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
                if (token.context !== undefined) {
                    for (let i = 0; i < Object.entries(token.context.varsDefinition).length; i++) {
                        const [name, varDef] = Object.entries(token.context.varsDefinition)[i];
                        const variableName = "V_" + name;
                        const size = typeof varDef.out === "string" || varDef.out[0] === "array" ? sizeForValueType(varDef.internalType, target) : sizeOfStruct(token.context, varDef.out, target);
                        vars.push(`${variableName} DS ${size}`);
                    }
                }

                const heap = [
                    "HEAPSTART:",
                ]

                return lib.concat(literalStrings).concat(vars).concat(heap);
            }
            if (target === "freebsd") {
                const lib = [
                    "mov rax, 1",
                    "mov rdi, 0",
                    "syscall",

                    "print_uint:",
                    "; division in 64bit save the quotient into rax and the reminder in rdx",
                    "xor rcx, rcx",
                    "mov r8, 10",
                    ".loop:",
                    "xor rdx, rdx; clearing the register that is going to be used as holder for the reminder",
                    "div r8",
                    "add dl, 0x30; make the reminder printable in ascii conversion 0x30 is '0'",
                    "dec rsp; reduce one byte from the address placed in rsp(freeing one byte of memory)",
                    "mov[rsp], dl; pour one byte into the address pointed",
                    "inc rcx",
                    "test rax, rax",
                    "jnz .loop",
                    ".print_chars_on_stack:",
                    "xor rax, rax",
                    "mov rsi, rsp;",
                    "mov rdx, rcx",
                    "push rcx",
                    "mov rax, 4",
                    "mov rdi, 1",
                    "syscall; rsi e rdx are respectively buffer starting point and length in byte",
                    "; the syscall is going to look at what is in memory at the address loaded in rsi(BE CAREFULL) and not at the content of rdi",
                    "pop rcx",
                    "add rsp, rcx; when printed we can free the stack",
                    "ret",

                    "print_lf:",
                    "mov rcx, 10",
                    "call emit",
                    "ret",

                    "emit:", // emit ascii char in rcx
                    "push rdx",
                    "push rax",
                    "push rdi",
                    "push rsi",
                    "push rcx",
                    "mov rsi, rsp",
                    "mov rdx, 1",
                    "mov rax, 4",
                    "mov rdi, 1",
                    "syscall",
                    "pop rcx",
                    "pop rsi",
                    "pop rdi",
                    "pop rax",
                    "pop rdx",
                    "ret",

                    "allocate:",          // rax: number of bytes to allocate
                    "mov rbx, [mem_top]", // return the starting address in rbx
                    "add [mem_top], rax",
                    "ret",
                ];
                const literalStrings = ["section .data"]
                    .concat(
                        stringTable.map((str, index) => {
                            const bytes = [];
                            for (let i = 0; i < str.length; i++) {
                                bytes.push(String(str[i].charCodeAt(0) & 255));
                            }
                            const strBytes = bytes.join(",");
                            return `str${index} db ${strBytes}`;
                        })
                    );
                // hello	db	'Hello, World!', 0Ah
                literalStrings.push("str__cantprint db '[...]'");

                const vars = ["section .bss"];
                if (token.context !== undefined) {
                    for (let i = 0; i < Object.entries(token.context.varsDefinition).length; i++) {
                        const [name, varDef] = Object.entries(token.context.varsDefinition)[i];
                        const variableName = "V_" + name;
                        const size = typeof varDef.out === "string" || varDef.out[0] === "array" ? sizeForValueType(varDef.internalType, target) : sizeOfStruct(token.context, varDef.out, target);
                        vars.push(`${variableName}: resb ${size}`);
                    }
                }

                vars.push("mem_top: resb 8");
                vars.push("ctx_stack_rsp: resb 8");
                vars.push("ret_stack_rsp: resb 8");
                vars.push(`ret_stack: resb ${CTX_STACK_CAPACITY}`);
                vars.push("ctx_stack_end:");
                vars.push(`ctx_stack: resb ${RET_STACK_CAPACITY}`);
                vars.push("ret_stack_end:");
                vars.push(`mem: resb ${MEM_CAPACITY}`);
                return lib.concat(literalStrings).concat(vars);
            }
            console.log(`target system '${target}' unknown`);
            exit();
        },
        generatePreludeAsm: (ast, target) => {
            if (target === "c64") return [
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
                "JSR CTX_INITSTACK",
            ];
            if (target === "freebsd") return [
                "BITS 64",
                "section .text",
                "global	_start",
                "_start:",
                // init ret_stack_rsp and ctx_stack_rsp
                "mov rax, ret_stack_end",
                "mov [ret_stack_rsp], rax",
                "mov rax, ctx_stack_end",
                "mov [ctx_stack_rsp], rax",
                "mov rax, mem",
                "mov [mem_top], rax",
            ];
            console.log(`target system '${target}' unknown`);
            exit();
        },
        simPrelude: (simEnv, ast) => {
            simEnv.buffer = "";
            simEnv.dataStack = [];
            simEnv.ctxStack = [];
            simEnv.memory = new Uint8Array(640 * 1024);
            simEnv.heapTop = 0;
            simEnv.vars = {};
        },
        sim: (simEnv, token) => {

        },
    };
    voc[TokenType.INC] = {
        txt: "inc",
        expectedArity: 1,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 80,
        userFunction: false,
        ins: token => {
            assertChildNumber(token, 1);
            const child = token.childs[0];
            if (child.type !== TokenType.WORD) {
                logError(child.loc, `'INC' expects a word as parameter, but '${child.txt}' is a '${humanReadableToken(child.type)}' `);
                exit();
            }
            const wordDef = getWordDefinition(token.context, child.txt);
            if (wordDef === undefined) {
                logError(child.loc, `unknown word '${child.txt}'`);
                exit();
            }
            if (wordDef.internalType !== "number" && wordDef.internalType !== "byte") {
                logError(child.loc, `'INC' expects a word of type 'number' or 'byte', but word '${child.txt}' has type '${humanReadableType(wordDef.internalType)}'`);
                exit();
            }
            return [wordDef.internalType];
        },
        out: () => "void",
        simPreludeChild: (simEnv, token, n) => {
            return false;
        },
        generateChildPreludeAsm: () => { return undefined }, // no child generation asm
        sim: (simEnv, token) => {
            const child = token.childs[0]
            const varName = child.txt;
            const varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(child.loc, `INC generateAsm cannot find declaration for '${varName}', sim error`);
                exit();
            }
            if (varDef.isGlobalContext) {
                const addr = simEnv.vars[varName];
                storeNumberOnHeap(simEnv, readNumberFromHeap(simEnv, addr) + 1, addr);
            } else {
                // LOCAL CONTEXT
                if (varDef.offset === undefined) {
                    logError(token.loc, `INC sim can't compute the offset of '${varName}' onto the stack, compiler error`);
                    exit();
                }
                const indexOnCtxStack = simEnv.ctxStack.length - 1 - varDef.offset;
                simEnv.ctxStack[indexOnCtxStack]++;
            }
        },
        generateAsm: (token, target) => {
            assertChildNumber(token, 1);
            const child = token.childs[0]
            const varName = child.txt;
            const varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(child.loc, `INC generateAsm cannot find declaration for '${varName}', compiler error`);
                exit();
            }
            if (target === "c64") {
                if (varDef.isGlobalContext) {
                    const asmVarName = "V_" + varName;
                    if (varDef.internalType === "byte") return [
                        `INC ${asmVarName}`,
                    ];

                    return [
                        `INC ${asmVarName}`,
                        "BNE not_carry_@",
                        `INC ${asmVarName} + 1`,
                        `not_carry_@:`,
                    ]
                }

                // LOCAL CONTEXT

                if (varDef.offset === undefined) {
                    logError(token.loc, `INC generateAsm can't compute the offset of '${varName}' onto the stack, compiler error`);
                    exit();
                }

                if (varDef.internalType === "byte") {
                    return [
                        "LDX CTX_SP16",
                        `INC ${CTX_PAGE * 256 + varDef.offset},X`
                    ];
                }
                return [
                    "LDX CTX_SP16",
                    `INC ${CTX_PAGE * 256 + varDef.offset},X`,
                    "BNE not_carry_@",
                    `INC ${CTX_PAGE * 256 + varDef.offset + 1},X`,
                    `not_carry_@:`,
                ]
            }
            if (target === "freebsd") {
                if (varDef.isGlobalContext) {
                    const asmVarName = "V_" + varName;
                    return [
                        `add qword [${asmVarName}], 1`,
                    ];
                }

                // LOCAL CONTEXT

                if (varDef.offset === undefined) {
                    logError(token.loc, `INC generateAsm can't compute the offset of '${varName}' onto the stack, compiler error`);
                    exit();
                }
                return [
                    "mov rax, [ctx_stack_rsp]",
                    `add rax, ${varDef.offset}`,
                    "add qword [rax], 1",
                ];

            }
            console.log(`target system '${target}' unknown`);
            exit();
        },
    };
    voc[TokenType.DEFINE] = {
        txt: "def",
        expectedArity: 2,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 5,
        userFunction: false,
        ins: token => {
            assertChildNumber(token, 2);
            const secondChild = token.childs[1];
            const valueType = getReturnTypeOfAWord(secondChild);
            if (valueType === undefined) {
                logError(secondChild.loc, `cannot determine the type of '${secondChild.txt}'`);
                exit();
            }
            if (valueType === "void") {
                logError(secondChild.loc, `'${secondChild.txt}' produce void value, can't define 'void' values`);
                exit();
            }

            return ["symbol", valueType];
        },
        out: () => "void",
        generateChildPreludeAsm: (token, n) => {
            if (n === 0) return undefined;
            return [];
        },
        generateAsm: () => [],
        simPreludeChild: (simEnv, token, childIndex) => {
            if (childIndex === 0) return false;
            return true;
        }
    };
    voc[TokenType.STRUCT] = {
        txt: "struct",
        expectedArity: 2,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 5,
        userFunction: false,
        ins: token => {
            assertChildNumber(token, 2);
            const firstChild = token.childs[0];
            const secondChild = token.childs[1];
            const valueType = getReturnTypeOfAWord(secondChild);
            if (firstChild.internalValueType !== "symbol") {
                logError(firstChild.loc, `the first parameter of struct should be a 'symbol', but '${firstChild.txt}' is a ${humanReadableToken(firstChild.type)}`);
                exit();
            }
            return ["symbol", valueType];
        },
        out: () => "void",
        generateChildPreludeAsm: (token, n) => {
            // childs does not generate asm
            return undefined;
        },
        generateAsm: () => {
            return [];
        },
        preprocessTokens: ast => {
            if (ast[1].type === TokenType.WORD) {
                createLiteralFromToken(ast[1], "symbol");
            }
            if (ast[2].type === TokenType.BLOCK) {
                ast[2].type = TokenType.RECORD;
            }
        },
        sim: () => { },
        simPreludeChild: () => {
            // childs does not generate asm
            return false;
        },

    };
    voc[TokenType.ARROW] = {
        txt: "->",
        expectedArity: 2,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.INFIX,
        priority: 130,
        userFunction: false,
        ins: token => {
            assertChildNumber(token, 2);
            const structChild = token.childs[0];
            if (structChild.out === undefined) {
                logError(structChild.loc, `'${structChild.txt}' type is undefined`);
                exit();
            }
            if (typeof structChild.out === "string") {
                logError(structChild.loc, `'${structChild.txt}' is not a struct`);
                exit();
            }
            return [structChild.out, "symbol"];
        },
        out: token => {
            assertChildNumber(token, 2);
            const structChild = token.childs[0];
            if (structChild.out === undefined) {
                logError(structChild.loc, `'${structChild.txt}' type is undefined`);
                exit();
            }
            if (typeof structChild.out === "string" || structChild.out[0] === "array" || structChild.out[0] === "addr") {
                logError(structChild.loc, `'${structChild.txt}' is not a struct`);
                exit();
            }
            const structName = structChild.out[1];
            const structDef = getWordDefinition(structChild.context, structName);
            if (structDef?.type !== "struct") {
                logError(structChild.loc, `'${structChild.txt}' cannot find struct definition`);
                exit();
            }

            const secondChild = token.childs[1];
            const componentName = secondChild.txt;
            let type;
            for (let i = 0; i < structDef.elements.length; i++) {
                if (structDef.elements[i].name === componentName) {
                    type = structDef.elements[i].def;
                    break;
                }
            }
            if (type === undefined) {
                logError(secondChild.loc, `'${secondChild.txt}' is not part of ${structChild.txt}`);
                exit();
            }

            return type.internalType;
        },
        generateChildPreludeAsm: (token, n) => {
            if (n === 1) return undefined;
            return [];
        },
        generateAsm: (token, target) => {
            const structChild = token.childs[0];
            if (structChild.out === undefined) {
                logError(structChild.loc, `'${structChild.txt}' type is undefined`);
                exit();
            }
            if (typeof structChild.out === "string" || structChild.out[0] === "array" || structChild.out[0] === "addr") {
                logError(structChild.loc, `'${structChild.txt}' is not a struct`);
                exit();
            }

            const structName = structChild.out[1];
            const structDef = getWordDefinition(structChild.context, structName);
            if (structDef?.type !== "struct") {
                logError(structChild.loc, `'${structChild.txt}' cannot find struct definition`);
                exit();
            }

            if (structDef?.type !== "struct") {
                logError(structChild.loc, `'${structChild.txt}' is not a struct`);
                exit();
            }

            const secondChild = token.childs[1];
            if (secondChild.out !== "symbol") {
                logError(secondChild.loc, `'${secondChild.txt}' is not a symbol`);
                exit();
            }
            const componentName = secondChild.txt;
            let offset = -1;
            let type;
            for (let i = 0; i < structDef.elements.length; i++) {
                if (structDef.elements[i].name === componentName) {
                    offset = structDef.elements[i].offset;
                    type = structDef.elements[i].def;
                    break;
                }
            }
            if (offset === -1 || type === undefined) {
                logError(secondChild.loc, `'${secondChild.txt}' is not part of ${structChild.txt}`);
                exit();
            }
            if (target === "c64") {
                return [
                    "LDX SP16",
                    "CLC",
                    "LDA STACKBASE + 1,X",
                    `ADC #${offset}`,
                    "STA STACKBASE + 1,X",
                    "LDA STACKBASE + 2,X",
                    `ADC #0`,
                    "STA STACKBASE + 2,X",
                ].concat(getAsmForGetWordPointedByTOS(type.internalType, 0, target));
            }
            if (target === "freebsd") {
                return [
                    "pop rax",
                    `add rax, ${offset}`,
                    "push rax",
                ].concat(getAsmForGetWordPointedByTOS(type.internalType, 0, target));
            }
            console.log(`target system '${target}' unknown`);
            exit();

        },
        preprocessTokens: (ast, vocabulary) => {
            if (ast[2].type === TokenType.WORD) {
                createLiteralFromToken(ast[2], "symbol");
            } else if (ast[2].type === TokenType.SET_WORD) {
                createLiteralFromToken(ast[2], "symbol");
                ast[1].type = TokenType.SET_ARROW;
                addInstrData(ast[1], vocabulary);
            }
        },
        simPreludeChild: (simEnv, token, childNumber) => {
            if (childNumber === 1) return false;
            return true;
        },
        sim: (simEnv, token) => {
            const structChild = token.childs[0];
            if (structChild.out === undefined) {
                logError(structChild.loc, `'${structChild.txt}' type is undefined`);
                exit();
            }
            if (typeof structChild.out === "string" || structChild.out[0] === "array" || structChild.out[0] === "addr") {
                logError(structChild.loc, `'${structChild.txt}' is not a struct`);
                exit();
            }

            const structName = structChild.out[1];
            const structDef = getWordDefinition(structChild.context, structName);
            if (structDef?.type !== "struct") {
                logError(structChild.loc, `'${structChild.txt}' cannot find struct definition`);
                exit();
            }

            if (structDef?.type !== "struct") {
                logError(structChild.loc, `'${structChild.txt}' is not a struct`);
                exit();
            }

            const secondChild = token.childs[1];
            if (secondChild.out !== "symbol") {
                logError(secondChild.loc, `'${secondChild.txt}' is not a symbol`);
                exit();
            }
            const componentName = secondChild.txt;
            let offset = -1;
            let type;
            for (let i = 0; i < structDef.elements.length; i++) {
                if (structDef.elements[i].name === componentName) {
                    offset = structDef.elements[i].offset;
                    type = structDef.elements[i].def;
                    break;
                }
            }
            if (offset === -1 || type === undefined) {
                logError(secondChild.loc, `'${secondChild.txt}' is not part of ${structChild.txt}`);
                exit();
            }
            simEnv.dataStack.push(stackPop(simEnv));
            simGetWordPointedByTOS(simEnv, type.internalType, offset * 8);
        }
    };
    voc[TokenType.SET_ARROW] = {
        txt: "",
        expectedArity: 3,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.INFIX,
        priority: 10,
        userFunction: false,
        ins: token => {
            assertChildNumber(token, 3);
            const structChild = token.childs[0];
            if (structChild.out === undefined) {
                logError(structChild.loc, `'${structChild.txt}' type is undefined`);
                exit();
            }
            if (typeof structChild.out === "string" || structChild.out[0] === "array" || structChild.out[0] === "addr") {
                logError(structChild.loc, `'${structChild.txt}' is not a struct`);
                exit();
            }

            const structName = structChild.out[1];
            const structDef = getWordDefinition(structChild.context, structName);
            if (structDef?.type !== "struct") {
                logError(structChild.loc, `'${structChild.txt}' cannot find struct definition`);
                exit();
            }

            const componentChild = token.childs[1];
            const componentName = componentChild.txt;
            let type;
            for (let i = 0; i < structDef.elements.length; i++) {
                if (structDef.elements[i].name === componentName) {
                    type = structDef.elements[i].def;
                    break;
                }
            }
            if (type === undefined) {
                logError(componentChild.loc, `'${componentChild.txt}' is not part of ${structName}`);
                exit();
            }

            return [["usertype", structName], "symbol", type.internalType];
        },
        out: () => {
            return "void";
        },
        generateChildPreludeAsm: (token, n, target) => {
            if (n === 0) return []; // struct name
            if (n === 1) return undefined; //set word
            if (n === 2) return [];
        },
        generateAsm: (token, target) => {
            const structChild = token.childs[0];
            if (structChild.out === undefined) {
                logError(structChild.loc, `'${structChild.txt}' type is undefined`);
                exit();
            }
            if (typeof structChild.out === "string" || structChild.out[0] === "array" || structChild.out[0] === "addr") {
                logError(structChild.loc, `'${structChild.txt}' is not a struct`);
                exit();
            }
            const structName = structChild.out[1];
            const structDef = getWordDefinition(structChild.context, structName);
            if (structDef?.type !== "struct") {
                logError(structChild.loc, `'${structChild.txt}' is not a struct`);
                exit();
            }

            const componentChild = token.childs[1];
            if (componentChild.out !== "symbol") {
                logError(componentChild.loc, `'${componentChild.txt}' is not a symbol`);
                exit();
            }
            const componentName = componentChild.txt;
            let offset = -1;
            let type;
            for (let i = 0; i < structDef.elements.length; i++) {
                if (structDef.elements[i].name === componentName) {
                    offset = structDef.elements[i].offset;
                    type = structDef.elements[i].def;
                    break;
                }
            }
            if (offset === -1 || type === undefined) {
                logError(componentChild.loc, `'${componentChild.txt}' is not part of ${structChild.txt}`);
                exit();
            }
            return getAsmForSetWordPointedByTOS(type.internalType, offset, target);
        },
        simPreludeChild: (simEnv, token, n) => {
            if (n === 1) return false; //set word
            return true;
        },
        sim: (simEnv, token) => {
            const structChild = token.childs[0];
            if (structChild.out === undefined) {
                logError(structChild.loc, `'${structChild.txt}' type is undefined`);
                exit();
            }
            if (typeof structChild.out === "string" || structChild.out[0] === "array" || structChild.out[0] === "addr") {
                logError(structChild.loc, `'${structChild.txt}' is not a struct`);
                exit();
            }
            const structName = structChild.out[1];
            const structDef = getWordDefinition(structChild.context, structName);
            if (structDef?.type !== "struct") {
                logError(structChild.loc, `'${structChild.txt}' is not a struct`);
                exit();
            }

            const componentChild = token.childs[1];
            if (componentChild.out !== "symbol") {
                logError(componentChild.loc, `'${componentChild.txt}' is not a symbol`);
                exit();
            }
            const componentName = componentChild.txt;
            let offset = -1;
            let type;
            for (let i = 0; i < structDef.elements.length; i++) {
                if (structDef.elements[i].name === componentName) {
                    offset = structDef.elements[i].offset;
                    type = structDef.elements[i].def;
                    break;
                }
            }
            if (offset === -1 || type === undefined) {
                logError(componentChild.loc, `'${componentChild.txt}' is not part of ${structChild.txt}`);
                exit();
            }
            simSetWordPointedByTOS(simEnv, type.internalType, offset * 8);
        }

    };
    voc[TokenType.NEW] = {
        txt: "new",
        expectedArity: 2,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: () => {
            return ["symbol", "record"];
        },
        out: token => {
            const structName = token.childs[0].txt;
            return ["usertype", structName];
        },
        generateAsm: token => {
            return [
                "; do heap malloc for size of structure and return back the address"
            ]
        },
        generateChildPreludeAsm: (ast, n) => {
            if (n === 0) return undefined
            return [];
        },
        preprocessTokens: ast => {
            if (ast[1].type === TokenType.WORD) {
                createLiteralFromToken(ast[1], "symbol");
            }
            if (ast[2].type === TokenType.BLOCK) {
                ast[2].type = TokenType.RECORD;
            }
        },
        sim: () => { },
        simPreludeChild: (simEnv, token, childNumber) => {
            if (childNumber === 0) return false;
            return true;
        }

    };
    voc[TokenType.RECORD] = {
        txt: "",
        expectedArity: 0,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 150,
        userFunction: false,
        ins: token => {
            // const childNumber = token.childs.length;
            // if (childNumber === 0) return [];
            // //return new Array(childNumber).fill("void");
            // return token.childs.map(() => "void");
            console.log("should not be called ever!");
            exit();
        },
        out: () => "record",
        generateAsm: (token, target) => {
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                exit();
            }
            if (token.context.parent === undefined) return []; // the global context

            let sizeToRelease = sizeOfContext(token.context, target);
            if (sizeToRelease === 0) return ["; no stack memory to release"];
            if (target === "c64") {
                return [
                    "; push the heap",
                    "SAVE_HEAP_@:",
                    "LDA HEAPTOP",
                    "STA STACKACCESS",
                    "STA TOADD+1",
                    "LDA HEAPTOP+1",
                    "STA STACKACCESS+1",
                    "STA TOADD+2",
                    "JSR PUSH16",
                    "; copy mem",
                    "LDX CTX_SP16",
                    "STX FROMADD+1",
                    `LDA #${CTX_PAGE}`,
                    "STA FROMADD+2",
                    `LDY #${sizeToRelease}`,
                    "JSR COPYMEM",
                    "CLC",
                    "LDA HEAPTOP",
                    `ADC #${sizeToRelease}`,
                    "STA HEAPTOP",
                    `; release ${sizeToRelease} on the stack`,
                    "LDA CTX_SP16",
                    "CLC",
                    `ADC #${sizeToRelease}`,
                    "STA CTX_SP16"
                ];
            }
            if (target === "freebsd") {
                return [
                    `mov rax, ${sizeToRelease}`,
                    "call allocate",
                    "mov rdi, rbx",
                    "mov rsi, [ctx_stack_rsp]",
                    `mov rcx, ${sizeToRelease}`,
                    "rep movsb",
                    `; release ${sizeToRelease} on the stack`,
                    "mov rax, [ctx_stack_rsp]",
                    `add rax, ${sizeToRelease}`,
                    "mov [ctx_stack_rsp], rax",
                    "push rbx",
                ];
            }
            console.log(`target system '${target}' unknown`);
            exit();
        },
        generatePreludeAsm: (token, target) => {
            // at the start we make some space on the stack, for variables
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                exit();
            }

            if (token.context.parent === undefined) return []; // the global context

            let sizeToReserve = 0;
            for (const [key, varDef] of Object.entries(token.context.varsDefinition)) {
                varDef.offset = sizeToReserve;
                const valueType = varDef.internalType;
                sizeToReserve += sizeForValueType(varDef.internalType, target);
            }

            const strVariables = Object.values(token.context.varsDefinition).map(varDef => varDef.token.txt + " (" + humanReadableType(varDef.out) + " offset " + varDef.offset + ")").join(", ");
            if (sizeToReserve === 0) return ["; no stack memory to reserve"];
            if (target === "c64") {
                return [
                    `; reserve ${sizeToReserve} on the stack for: ${strVariables}`,
                    "LDA CTX_SP16",
                    "SEC",
                    `SBC #${sizeToReserve}`,
                    "STA CTX_SP16",
                ];
            }
            if (target === "freebsd") {
                return [
                    "mov rax, [ctx_stack_rsp]",
                    `sub rax, ${sizeToReserve}`,
                    "mov [ctx_stack_rsp], rax",
                ];
            }
            console.log(`target system '${target}' unknown`);
            exit();
        },
        sim: (simEnv, token) => {
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                exit();
            }
            if (token.context.parent === undefined) {
                logError(token.loc, `context for ${token.txt} is global?`);
                exit();
            }

            let sizeToRelease = sizeOfContext(token.context, "sim");
            if (sizeToRelease === 0) return;

            const heapStructAddress = simEnv.heapTop;
            for (let i = 0; i < sizeToRelease; i++) {
                const number = simEnv.ctxStack.pop();
                if (number === undefined) {
                    logError(token.loc, `'${token.txt}' context stack underflow`);
                    exit();
                }
                storeNumberOnHeap(simEnv, number, undefined);
            }
            simEnv.dataStack.push(heapStructAddress);
        },
        simPrelude: (simEnv, token) => {
            // at the start we make some space on the stack, for variables
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, sim error`);
                exit();
            }

            if (token.context.parent === undefined) {
                logError(token.loc, `the context of ${token.txt} is global ? sim error`);
                exit();
            }

            let sizeToReserve = 0;
            for (const [key, varDef] of Object.entries(token.context.varsDefinition)) {
                varDef.offset = sizeToReserve;
                const valueType = varDef.internalType;
                const sizeForType = valueType === "string" || (valueType instanceof Array && valueType[0] === "array") ? 2 : 1
                sizeToReserve += sizeForType;
                if (sizeForType === 1) {
                    simEnv.ctxStack.push(0);
                } else {
                    simEnv.ctxStack.push(0);
                    simEnv.ctxStack.push(0);
                }
            }
        },
    };
    voc[TokenType.ARRAY] = {
        txt: "array",
        expectedArity: 2,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 15,
        userFunction: false,
        ins: token => {
            if (token.childs.length === 1) {
                const firstChild = token.childs[0];
                if (firstChild.type !== TokenType.DATA_BLOCK) {
                    logError(firstChild.loc, `'${firstChild.txt}' should be a data block, but it's a ${humanReadableToken(firstChild.type)}`);
                    exit();
                }
                return ["addr"];
            } else if (token.childs.length === 2) {
                const firstChild = token.childs[0];
                const firstChildType = getReturnTypeOfAWord(firstChild);
                if (firstChildType !== "number") {
                    logError(firstChild.loc, `'${firstChild.txt}' should be a number, but it's a ${humanReadableType(firstChildType)}`);
                    exit();
                }
                const secondChild = token.childs[1];
                if (!isTypeToken(secondChild)) {
                    logError(secondChild.loc, `'${secondChild.txt}' should be a type, but it's a ${humanReadableToken(secondChild.type)}`);
                    exit();
                }
                return ["number", getReturnTypeOfAWord(secondChild)];
            } else {
                logError(token.loc, `'${token.txt}' is supposed to have one or two child but it has ${token.childs.length} childs`);
                exit();
            }
        },
        out: (token) => {
            if (token.childs.length === 1) {
                const firstChild = token.childs[0].childs[0];
                return ["array", getReturnTypeOfAWord(firstChild)];
            } else if (token.childs.length === 2) {
                const secondChild = token.childs[1];
                return ["array", getReturnTypeOfAWord(secondChild)];
            } else {
                logError(token.loc, `'${token.txt}' is supposed to have one or two child but it has ${token.childs.length} childs`);
                exit();
            }
        },
        preprocessTokens: (sequence, vocabulary) => {
            if (sequence.length < 1) {
                logError(sequence[0].loc, `'${sequence[0].txt}' expects at least one parameter but none found`);
                exit();
            }
            if (sequence[1].type === TokenType.BLOCK) {
                sequence[0].expectedArity = 1;
                sequence[1].type = TokenType.DATA_BLOCK;
                addInstrData(sequence[1], vocabulary);
                return;
            }

            if (sequence.length < 2) {
                logError(sequence[0].loc, `'${sequence[0].txt}' expects at least one parameter but none found`);
                exit();
            }
            const nextToken = sequence[1];
            if (isTypeToken(nextToken) || nextToken.type === TokenType.ARRAY) {
                sequence[0].type = TokenType.ARRAY_TYPE;
                addInstrData(sequence[0], vocabulary);
            }
        },
        generateChildPreludeAsm: (token, n) => {
            if (n === 1) return undefined;
            return [];
        },
        simPreludeChild: (simEnv, token, n) => {
            if (n === 1) return false;
            return true;
        },        
        generateAsm: (token, target) => {
            if (token.childs.length === 1) {
                return [];
            } else if (token.childs.length === 2) {
                if (token.context === undefined) {
                    logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                    exit();
                }

                const secondChild = token.childs[1];
                const secontChildType = getReturnTypeOfAWord(secondChild);
                const structSize = typeof secontChildType === "string" ? sizeForValueType(secontChildType, target) : sizeOfStruct(token.context, secontChildType, target);
                if (target === "c64") {
                    return [
                        // size is on the stack
                        // push the heap
                        "JSR DUP16", // push the len will be returned
                        "LDA HEAPTOP",
                        "STA STACKACCESS",
                        "LDA HEAPTOP+1",
                        "STA STACKACCESS+1",
                        "JSR PUSH16",
                        "JSR SWAP16",
                        "JSR PUSH16",
                        "JSR SWAP16", // heap heap size
                        // push structsize                
                        `LDA #${structSize}`,
                        "STA STACKACCESS",
                        `LDA #0`,
                        "STA STACKACCESS + 1",
                        "JSR PUSH16", // heap heap size structsize
                        "JSR MUL16", // heap heap (size * structsize)
                        "JSR ADD16", // heap (heap + size * structsize)
                        // store the new heap
                        "JSR POP16",
                        "LDA STACKACCESS",
                        "STA HEAPTOP",
                        "LDA STACKACCESS + 1",
                        "STA HEAPTOP + 1", // the array address is on the stack
                    ];
                }
                if (target === "freebsd") {
                    return [
                        // size is on the stack
                        "pop rax", // the size
                        "push rax", // the len will be returned
                        `imul rax, ${structSize}`,
                        "call allocate",
                        "push rbx", // the array address is on the stack
                    ];
                }
                console.log(`target system '${target}' unknown`);
                exit();
            } else {
                logError(token.loc, `'${token.txt}' is supposed to have one or two child but it has ${token.childs.length} childs`);
                exit();
            }
        },
        sim: (simEnv, token) => {
            if (token.childs.length === 1) return

            if (token.childs.length === 2) {
                if (token.context === undefined) {
                    logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                    exit();
                }

                const secondChild = token.childs[1];
                const secontChildType = getReturnTypeOfAWord(secondChild);
                const structSize = typeof secontChildType === "string" ? sizeForValueType(secontChildType, "sim") : sizeOfStruct(token.context, secontChildType, "sim");

                const size = stackPop(simEnv);
                simEnv.dataStack.push(size);
                const totalSize = size * structSize * 8;
                const address = simEnv.heapTop;
                simEnv.heapTop += totalSize
                simEnv.dataStack.push(address);
            } else {
                logError(token.loc, `'${token.txt}' is supposed to have one or two child but it has ${token.childs.length} childs`);
                exit();
            }
        }
    };
    voc[TokenType.ARRAY_TYPE] = {
        txt: "",
        expectedArity: 1,
        expectedArityOut: 1,
        grabFromStack: true,
        position: InstructionPosition.PREFIX,
        priority: 15,
        userFunction: false,
        ins: token => {
            assertChildNumber(token, 1);
            if (!isTypeToken(token.childs[0])) {
                logError(token.childs[0].loc, `'${token.childs[0].txt}' should be a Type but it's a ${humanReadableToken(token.childs[0].type)}`);
                exit();
            }
            return [getReturnTypeOfAWord(token.childs[0])];
        },
        out: token => {
            assertChildNumber(token, 1);
            if (!isTypeToken(token.childs[0])) {
                logError(token.childs[0].loc, `'${token.childs[0].txt}' should be a Type but it's a ${humanReadableToken(token.childs[0].type)}`);
                exit();
            }
            return ["array", getReturnTypeOfAWord(token.childs[0])];
        },
        generateAsm: token => {
            return [
                "; DO NOTHING"
            ]
        },
        sim: () => { }
    };
    voc[TokenType.CHANGE] = {
        txt: "change",
        expectedArity: 3,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: token => {
            assertChildNumber(token, 3);
            const arrayType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof arrayType === "string" || arrayType[0] !== "array") {
                logError(token.childs[0].loc, `'${token.childs[0].txt}' should be an array, it's a ${humanReadableType(arrayType)}`);
                exit();
            }
            return [arrayType, "number", arrayType[1]]
        },
        out: () => "void",
        generateChildPreludeAsm: (token, n, target) => {
            if (n === 2) {
                assertChildNumber(token, 3);
                const arrayType = getReturnTypeOfAWord(token.childs[0]);
                if (typeof arrayType === "string" || arrayType[0] !== "array") {
                    logError(token.childs[0].loc, `'${token.childs[0].txt}' should be an array, it's a ${humanReadableType(arrayType)}`);
                    exit();
                }
                const sizeOfElement = sizeForValueType(arrayType[1], target);
                if (target === "c64") {
                    return [
                        // len, address, index on the stack
                        `LDA #<${sizeOfElement}`,
                        `STA STACKACCESS`,
                        `LDA #>${sizeOfElement}`,
                        `STA STACKACCESS + 1`,
                        "JSR PUSH16",               // len, address, index, sizeof(el)
                        "JSR MUL16",                // len, address, index * sizeof(el)
                        "JSR ADD16",                // len, address + index * sizeof(el)
                        "LDA STACKBASE + 1,X",     // copy the final address over the len
                        "STA STACKBASE + 3,X",
                        "LDA STACKBASE + 2,X",
                        "STA STACKBASE + 4,X",
                        "JSR POP16",                // only the address on the stack
                    ];
                }
                if (target === "freebsd") {
                    return [
                        // len, address, index on the stack
                        "pop rcx", // index
                        "pop rax", // address
                        "pop rbx", // len

                        `imul rcx, ${sizeOfElement}`, // index * sizeof(el)
                        "add rax, rcx",               // address + index * sizeof(el)
                        "push rax",                   // push on the stack
                    ];
                }
                console.log(`target system '${target}' unknown`);
                exit();
            }
            return [];
        },
        simPreludeChild: (simEnv, token, n) => {
            if (n === 2) {
                assertChildNumber(token, 3);
                const arrayType = getReturnTypeOfAWord(token.childs[0]);
                if (typeof arrayType === "string" || arrayType[0] !== "array") {
                    logError(token.childs[0].loc, `'${token.childs[0].txt}' should be an array, it's a ${humanReadableType(arrayType)}`);
                    exit();
                }
                const sizeOfElement = sizeForValueType(arrayType[1], "sim") * 8;

                const index = stackPop(simEnv);
                const address = stackPop(simEnv);
                const length = stackPop(simEnv);
                if (index < 0 || index >= length) {
                    logError(token.loc, `'${token.txt}' index ${index} is out of range [0..${length}]`);
                    exit();
                }
                simEnv.dataStack.push(address + index * sizeOfElement);
            }
            return true;
        },
        generateAsm: (token, target) => {
            assertChildNumber(token, 3);
            const arrayType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof arrayType === "string" || arrayType[0] !== "array") {
                logError(token.childs[0].loc, `'${token.childs[0].txt}' should be an array, it's a ${humanReadableType(arrayType)}`);
                exit();
            }
            return getAsmForSetWordPointedByTOS(arrayType[1], 0, target);
        },
        sim: (simEnv, token) => {
            assertChildNumber(token, 3);
            const arrayType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof arrayType === "string" || arrayType[0] !== "array") {
                logError(token.childs[0].loc, `'${token.childs[0].txt}' should be an array, it's a ${humanReadableType(arrayType)}`);
                exit();
            }
            simSetWordPointedByTOS(simEnv, arrayType[1], 0);
        }
    };
    voc[TokenType.AT] = {
        txt: "at",
        expectedArity: 2,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.INFIX,
        priority: 120,
        userFunction: false,
        ins: token => {
            assertChildNumber(token, 2);
            const arrayType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof arrayType === "string" || arrayType[0] !== "array") {
                logError(token.childs[0].loc, `'${token.childs[0].txt}' should be an array, it's a ${humanReadableType(arrayType)}`);
                exit();
            }
            return [arrayType, "number"]
        },
        out: token => {
            assertChildNumber(token, 2);
            const arrayType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof arrayType === "string" || arrayType[0] !== "array") {
                logError(token.childs[0].loc, `'${token.childs[0].txt}' should be an array, it's a ${humanReadableType(arrayType)}`);
                exit();
            }
            return arrayType[1];
        },
        sim: (simEnv, token) => {
            assertChildNumber(token, 2);
            const arrayType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof arrayType === "string" || arrayType[0] !== "array") {
                logError(token.childs[0].loc, `'${token.childs[0].txt}' should be an array, it's a ${humanReadableType(arrayType)}`);
                exit();
            }
            const sizeOfElement = sizeForValueType(arrayType[1], "sim") * 8;
            const index = stackPop(simEnv);
            const address = stackPop(simEnv);
            const lenght = stackPop(simEnv);
            simEnv.dataStack.push(address + index * sizeOfElement);
            simGetWordPointedByTOS(simEnv, arrayType[1], 0);
        },
        generateAsm: (token, target) => {
            assertChildNumber(token, 2);
            const arrayType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof arrayType === "string" || arrayType[0] !== "array") {
                logError(token.childs[0].loc, `'${token.childs[0].txt}' should be an array, it's a ${humanReadableType(arrayType)}`);
                exit();
            }
            const sizeOfElement = sizeForValueType(arrayType[1], target);

            if (target === "c64") {
                return [
                    // len, address, index on the stack                    
                    `LDA #<${sizeOfElement}`,
                    `STA STACKACCESS`,
                    `LDA #>${sizeOfElement}`,
                    `STA STACKACCESS + 1`,
                    "JSR PUSH16",               // len, address, index, sizeof(el)
                    "JSR MUL16",                // len, address, index * sizeof(el)
                    "JSR ADD16",                // len, address + index * sizeof(el)
                    "LDA STACKBASE + 1,X",
                    "STA STACKBASE + 3,X",
                    "LDA STACKBASE + 2,X",
                    "STA STACKBASE + 4,X",      // overwrite len with final address
                    "JSR POP16",
                    `; now get the ${humanReadableType(arrayType[1])} pointed by the tos`
                ].concat(getAsmForGetWordPointedByTOS(arrayType[1], 0, target));
            }

            if (target === "freebsd") {
                return [
                    // len, address and index on the stack                    
                    "pop rbx", // index
                    "pop rax", // address
                    "pop rcx", // len
                    `imul rbx, ${sizeOfElement}`,
                    "add rax, rbx",
                    "push rax",
                    `; now get the ${humanReadableType(arrayType[1])} pointed by the tos`
                ].concat(getAsmForGetWordPointedByTOS(arrayType[1], 0, target));
            }
            console.log(`target system '${target}' unknown`);
            exit();
        }
    };
    voc[TokenType.INCLUDE] = {
        txt: "include",
        expectedArity: 1,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 5,
        userFunction: false,
        ins: () => ["string"],
        out: () => "void",
        generateChildPreludeAsm: () => [],
        generateAsm: () => []
    };
    voc[TokenType.RETURN] = {
        txt: "return",
        expectedArity: 1,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 5,
        userFunction: false,
        ins: (token) => {
            assertChildNumber(token, 1);
            return [getReturnTypeOfAWord(token.childs[0])];
        },
        out: (token) => {
            assertChildNumber(token, 1);
            return getReturnTypeOfAWord(token.childs[0]);
        },
        generateChildPreludeAsm: () => [],
        generateAsm: (token, target) => {
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                exit();
            }
            if (token.context.parent === undefined) return []; // the global context

            // return should release all the contexts space until reach the ref block
            let sizeToRelease = sizeOfContext(token.context, target);
            let context = token.context;
            while (context.element?.type !== TokenType.REF_BLOCK && context.parent !== undefined) {
                context = context.parent;
                sizeToRelease += sizeOfContext(context, target);
                if (context.element === undefined) {
                    logError(token.loc, `'${token.txt}' is not inside a function`);
                    exit();
                }
                token = context.element;
            }
            if (target === "c64") {
                const asmReleaseSpace = sizeToRelease === 0 ? ["; no stack memory to release"] : [
                    `; release ${sizeToRelease} on the stack`,
                    "LDA CTX_SP16",
                    "CLC",
                    `ADC #${sizeToRelease}`,
                    "STA CTX_SP16",
                ];
                return asmReleaseSpace.concat([
                    `RTS`,
                ]);
            }
            if (target === "freebsd") {
                return [
                    "mov rax, [ctx_stack_rsp]",
                    `add rax, ${sizeToRelease}`,
                    "mov [ctx_stack_rsp], rax",
                    "mov rax, rsp",
                    "mov rsp, [ret_stack_rsp]",
                    "ret",
                ]
            }
            console.log(`target system '${target}' unknown`);
            exit();
        },
        sim: (simEnv, token) => {
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                exit();
            }
            if (token.context.parent === undefined) {
                logError(token.loc, `the context of '${token.txt}' is global?`);
                exit();
            }

            // return should release all the contexts space until reach the ref block
            let sizeToRelease = sizeOfContext(token.context, "sim");
            let context = token.context;
            while (context.element?.type !== TokenType.REF_BLOCK && context.parent !== undefined) {
                context = context.parent;
                sizeToRelease += sizeOfContext(context, "sim");
                if (context.element === undefined) {
                    logError(token.loc, `'${token.txt}' is not inside a function`);
                    exit();
                }
                token = context.element;
            }

            simEnv.ctxStack.length = simEnv.ctxStack.length - sizeToRelease;
            const retToken = simEnv.retStack.pop();
            if (retToken === undefined) {
                logError(token.loc, `'${token.txt}' ret stack underflow`);
                exit();
            }
            return [retToken, true];
        }
    };
    voc[TokenType.SYSCALL3] = {
        txt: "syscall3",
        expectedArity: 3,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: () => ["number", "number", "number"],
        out: () => "number",
        generateAsm: (token, target) => {
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                exit();
            }
            if (token.context.parent === undefined) return []; // the global context

            if (target === "c64") {
                logError(token.loc, `'${token.txt}' is not implemented in C64`);
                exit();
            }
            if (target === "freebsd") {
                return [
                    "pop rsi",
                    "pop rdi",
                    "pop rax",
                    "syscall",
                    "push rax"
                ]
            }
            console.log(`target system '${target}' unknown`);
            exit();
        }
    };
    voc[TokenType.SYSCALL4] = {
        txt: "syscall4",
        expectedArity: 4,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: () => ["number", "number", "number", "number"],
        out: () => "number",
        generateAsm: (token, target) => {
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                exit();
            }
            if (token.context.parent === undefined) return []; // the global context

            if (target === "c64") {
                logError(token.loc, `'${token.txt}' is not implemented in C64`);
                exit();
            }
            if (target === "freebsd") {
                return [
                    "pop rdx",
                    "pop rsi",
                    "pop rdi",
                    "pop rax",
                    "syscall",
                    "push rax"
                ]
            }
            console.log(`target system '${target}' unknown`);
            exit();
        }
    };
    voc[TokenType.DROP] = {
        txt: "drop",
        expectedArity: 1,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 5,
        userFunction: false,
        ins: (token) => {
            assertChildNumber(token, 1);
            return [getReturnTypeOfAWord(token.childs[0])];
        },
        out: () => "void",
        generateAsm: (token, target) => {
            if (target === "c64") {
                return [
                    "JSR POP16",
                ]
            }
            if (target === "freebsd") {
                return [
                    "pop rax",
                ]
            }
            console.log(`target system '${target}' unknown`);
            exit();
        }
    };

    return voc;
}

function logError(loc: Location, msg: string, warning: boolean = false) {
    const line = loc.filename in sourceCode ? sourceCode[loc.filename].split("\n")[loc.row - 1] : `<cannot retrieve the source line in file ${loc.filename}>`;
    console.log(line);
    console.log(" ".repeat(loc.col - 1) + `^ (row: ${loc.row} col: ${loc.col})`);
    if (warning) {
        console.warn(`(file://${loc.filename}:${loc.row}:${loc.col}) WARNING: ${msg}`);
    } else {
        console.error(`(file://${loc.filename}:${loc.row}:${loc.col}) ERROR: ${msg}`);
    }
}

function exit(): never {
    console.trace();
    Deno.exit(1);
}

function identifyToken(vocabulary: Vocabulary, txt: string): { type: TokenType, literalType: ValueType | undefined } | undefined {
    for (const [tokenType, instr] of Object.entries(vocabulary)) {
        if (txt === instr.txt) return { type: parseInt(tokenType, 10) as TokenType, literalType: undefined };
    }

    if (txt.match(/^-?\d+$/)) return { type: TokenType.LITERAL, literalType: "number" };
    if (txt[0] === '"' && txt[txt.length - 1] === '"') return { type: TokenType.LITERAL, literalType: "string" };
    if (txt[0] === "'" && txt[txt.length - 1] === "'") return { type: TokenType.LITERAL, literalType: "symbol" };
    if (txt[txt.length - 1] === ":") return { type: TokenType.SET_WORD, literalType: undefined };
    if (txt[0] === "'") return { type: TokenType.LIT_WORD, literalType: undefined };
    if (txt === "true" || txt === "false") return { type: TokenType.LITERAL, literalType: "bool" };

    return { type: TokenType.WORD, literalType: undefined };
}

function absoluteFileName(path: string): string {
    path = path.trim();
    if (path[0] !== "/") path = Deno.cwd() + "/" + path;

    const parts = path.split("/").filter(part => part !== "" && part !== ".");
    for (let i = parts.length - 1; i >= 0; i--) {
        if (parts[i] === ".." && i > 0) {
            parts.splice(i - 1, 2);
            i--;
        }
    }
    return "/" + parts.join("/");
}

async function readFile(filename: string): Promise<string> {
    const source = await Deno.readTextFile(filename);
    sourceCode[filename] = source;
    return source;
}

async function tokenizer(source: string, filename: string, vocabulary: Vocabulary): Promise<AST> {

    let index = 0;
    let tokenStart = -1;
    let colStart = -1;
    let ret: AST = [];
    let row = 1;
    let col = 1;
    let stringStart = -1;

    const isSpace = (x: string) => " \t\n\r".includes(x);
    const pushToken = (tokenText: string) => {
        const loc = { row, col: colStart, filename };
        const token = identifyToken(vocabulary, tokenText);
        if (token === undefined) {
            logError(loc, `unknown token '${tokenText}'`);
            exit();
        }
        if (token.type === TokenType.LITERAL && (token.literalType === "string" || token.literalType === "symbol")) {
            tokenText = tokenText.substring(1, tokenText.length - 1);
        } else if (token.type === TokenType.SET_WORD) {
            tokenText = tokenText.substring(0, tokenText.length - 1);
        } else if (token.type === TokenType.LIT_WORD) {
            tokenText = tokenText.substring(1);
        }
        const toPush = { type: token.type, txt: tokenText, loc, internalValueType: token.literalType, childs: [] };
        ret.push(toPush);
        return toPush;
    };

    let previousToken: Token | undefined = undefined;
    let currentToken: Token | undefined = undefined;
    while (index < source.length) {
        const char = source[index];

        if (isSpace(char)) {
            if (tokenStart > -1) {
                // space but was parsing a word
                previousToken = currentToken;
                currentToken = pushToken(source.substring(tokenStart, index));
                tokenStart = -1;
                colStart = -1;
            }
        } else {
            // not space, start parsing a word
            if (char === "/" && index + 1 < source.length && source[index + 1] === "/") {
                while (index < source.length && source[index] !== "\n") index++;
                col = 0;
                row++;
            } else if (char === ";") {
                while (index < source.length && source[index] !== "\n") index++;
                col = 0;
                row++;
            } else if (char === ":" && index + 1 < source.length && source[index + 1] === "[") {
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
                    previousToken = currentToken;
                    currentToken = pushToken(source.substring(tokenStart, index));
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
                while (index < source.length && source[index] !== '"') {
                    index++;
                    col++;
                }
                previousToken = currentToken;
                currentToken = pushToken(source.substring(stringStart, index + 1));
                if (previousToken?.type === TokenType.INCLUDE && currentToken.type === TokenType.LITERAL && currentToken.internalValueType === "string") {
                    //do include
                    const filename = absoluteFileName(currentToken.txt);
                    const source = await readFile(filename);
                    const included = await tokenizer(source, filename, vocabulary);
                    ret.pop(); // pop the string
                    ret.pop(); // ... and "include"
                    ret = ret.concat(included);
                }
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
    if (tokenStart > -1) {
        previousToken = currentToken;
        currentToken = pushToken(source.substring(tokenStart));
    }

    return ret;
}

async function preprocess(program: AST, vocabulary: Vocabulary) {

    const defines: Record<string, AST> = {};

    const doSubstitution = async (program: AST, index: number) => {
        const macroElement = program[index];
        const macroName = macroElement.txt;
        const copyOfDefines = defines[macroName].map(elem => structuredClone(elem));
        if (copyOfDefines[0].type === TokenType.OPEN_REF_BRACKETS) {
            let definesForSim: Token[] = [];
            const macro: Token = {
                type: TokenType.LIT_WORD,
                txt: macroName,
                loc: macroElement.loc,
                childs: []
            }
            definesForSim.push(macro);
            definesForSim = definesForSim.concat(copyOfDefines);
            const macroAST = parse(vocabulary, definesForSim, "sim", macroElement.loc.filename);
            const macroArity = macroAST.context?.varsDefinition[macroName].ins.length;
            if (macroArity === undefined) {
                logError(macroElement.loc, `'${macroElement.txt}' cannot determine the arity of the macro`);
                exit();
            }
            const macroCall = program.slice(index, index + 1 + macroArity);
            definesForSim = definesForSim.concat(macroCall);
            const macroCallComplete = parse(vocabulary, definesForSim, "sim", macroElement.loc.filename);

            const returnedCode = sim(vocabulary, macroCallComplete, true);
            const returnedTokens = await tokenizer(returnedCode, macroElement.loc.filename, vocabulary);

            program.splice(index, macroArity + 1, ...(returnedTokens !== undefined ? returnedTokens : []));
            dumpProgram(program);
        } else {
            program.splice(index, 1, ...copyOfDefines);
        }
    };

    for (let i = 0; i < program.length; i++) {
        const token = program[i];
        if (token.type === TokenType.DEFINE) {
            if (i + 2 >= program.length) {
                logError(token.loc, `Definition not complete`);
                exit();
            }

            const name = program[i + 1];
            if (name.type !== TokenType.WORD) {
                logError(name.loc, `definition started, but '${name.txt}' is not a word!`);
                exit();
            }

            const value = program[i + 2];
            if (value.type !== TokenType.OPEN_BRACKETS && value.type !== TokenType.OPEN_REF_BRACKETS) {
                if (value.txt === '(') {
                    value.type = TokenType.OPEN_BRACKETS;
                } else if (value.txt === ')') {
                    value.type = TokenType.CLOSE_BRACKETS;
                }

                defines[name.txt] = [value];
                program.splice(i, 3);
                i = i - 1;
            } else {
                let parens = 1;
                let index = i + 3;
                while (parens > 0 && index < program.length) {
                    if (program[index].type === TokenType.CLOSE_BRACKETS) {
                        parens--;
                        if (parens === 0) break;
                    } else if (program[index].type === TokenType.OPEN_BRACKETS || program[index].type === TokenType.OPEN_REF_BRACKETS) {
                        parens++;
                    } else {
                        if (program[index].txt === '(') {
                            program[index].type = TokenType.OPEN_BRACKETS;
                        } else if (program[index].txt === ')') {
                            program[index].type = TokenType.CLOSE_BRACKETS;
                        } else if (program[index].type === TokenType.WORD && program[index].txt in defines) {
                            await doSubstitution(program, index);
                        }
                    }
                    index++;
                }

                if (parens > 0) {
                    logError(program[i + 2].loc, `paren not closed`);
                    exit();
                }
                if (program[i + 2].type === TokenType.OPEN_REF_BRACKETS) {
                    defines[name.txt] = program.slice(i + 2, index + 1);
                    program.splice(i, defines[name.txt].length + 2);
                } else {
                    defines[name.txt] = program.slice(i + 3, index);
                    program.splice(i, defines[name.txt].length + 4);
                }
                console.log("DEFINE", name.txt, "=", defines[name.txt].map(t => t.txt).join(" "));                
                i = i - 1;                    
            }

        } else {
            if (token.type === TokenType.WORD && token.txt in defines) {
                await doSubstitution(program, i);
            }
        }
    }

    return program;

}

function groupFunctionToken(ast: AST, index: number, vocabulary: Vocabulary, target: Target): Token {
    const functionElement = ast[index];
    const functionPosition = getInstructionPosition(functionElement);
    const arity = getArity(functionElement, vocabulary);

    let childs: AST;
    let startPos: number;
    if (functionPosition === InstructionPosition.INFIX) {
        // p1 <op> p2 p3 ... pn
        if (index + arity - 1 > ast.length - 1) {
            logError(functionElement.loc, `the operator ${functionElement.txt} expects ${arity} parameters, but got ${ast.length - index}!`);
            exit();
        }
        childs = [ast[index - 1]].concat(ast.slice(index + 1, index + arity));
        const lastChild = childs.at(-1);
        if (lastChild === undefined) {
            logError(functionElement.loc, `cannot find childs of '${functionElement.txt}'`);
            exit();
        }

        const lastParameterArity = getArity(lastChild, vocabulary);
        if (lastParameterArity > 0 && lastChild.childs.length !== lastParameterArity) {
            groupFunctionToken(ast, index + arity - 1, vocabulary, target);
        }
        if (childs.length !== arity) {
            logError(functionElement.loc, `the operator ${humanReadableFunction(functionElement)} expects ${arity} parameters, but got only ${childs.length}!`);
            dumpAst(functionElement);
            exit();
        }
        startPos = index - 1;
    } else if (functionPosition === InstructionPosition.POSTFIX) {
        childs = [ast[index - 1]];
        if (childs[0] === undefined) {
            logError(functionElement.loc, `postfix operator '${humanReadableFunction(functionElement)}' does not have a left parameters`);
            exit();
        }
        startPos = index - 1;
    } else {
        childs = ast.slice(index + 1, index + 1 + arity);
        if (arity > 0) {
            const lastChild = childs.at(-1);
            if (lastChild === undefined) {
                logError(functionElement.loc, `cannot find childs of '${functionElement.txt}'`);
                exit();
            }
            const lastParameterArity = getArity(lastChild, vocabulary);
            if (lastParameterArity > 0 && lastChild.childs.length !== lastParameterArity) {
                groupFunctionToken(ast, index + arity, vocabulary, target);
            }
        }

        if (childs.length !== arity) {
            logError(functionElement.loc, `the word ${humanReadableFunction(functionElement)} expects ${arity} parameters, but got only ${childs.length}!`);
            dumpAst(functionElement);
            exit();
        }

        startPos = index;
    }
    functionElement.childs = functionElement.childs.concat(childs);
    ast.splice(startPos, childs.length + 1, functionElement);
    functionElement.childs.forEach(token => {
        if (token.ins === undefined) token.ins = vocabulary[token.type]?.ins(token);
        if (token.ins === undefined) {
            logError(token.loc, `'cannot determine the parameter list for function ${token.txt}'`);
            exit();
        }
        if (token.out === undefined) token.out = vocabulary[token.type]?.out(token);
        if (token.out === undefined) {
            logError(token.loc, `'cannot determine the return type for function ${token.txt}'`);
            exit();
        }
    });
    if (functionElement.ins === undefined) functionElement.ins = vocabulary[functionElement.type]?.ins(functionElement);
    if (functionElement.ins === undefined) {
        logError(functionElement.loc, `'cannot determine the parameter list for function ${functionElement.txt}'`);
        exit();
    }

    if (functionElement.out === undefined) functionElement.out = vocabulary[functionElement.type]?.out(functionElement);
    if (functionElement.out === undefined) {
        logError(functionElement.loc, `'cannot determine the return type for function ${functionElement.txt}'`);
        exit();
    }
    typeCheck(functionElement, vocabulary);
    optimize(functionElement, target);
    if (functionElement.type === TokenType.LIT_WORD) {
        setWordDefinition(functionElement, target);
    } else if (functionElement.type === TokenType.STRUCT) {
        setStructDefinition(functionElement, target);
    }

    return functionElement;
}

function getParametersRequestedByBlock(block: Token) {

    if (block.type !== TokenType.BLOCK && block.type !== TokenType.REF_BLOCK && block.type !== TokenType.PROG && block.type !== TokenType.RECORD) {
        logError(block.loc, `the token '${block.txt}' is not a BLOCK or REF_BLOCK or PROG!`);
        exit();
    }

    let ins: ValueType[] = [];

    // let's search for something like ['x Number 'y Number] where Number accepts a value but does not have child
    ins = block.childs
        .filter(token => {
            if (token.type !== TokenType.LIT_WORD) return false;
            if (token.childs.length !== 1) return false;
            if (!isTypeToken(token.childs[0])) return false;
            if (token.childs[0].out === undefined) {
                logError(token.childs[0].loc, `the value of '${token.childs[0].txt}' is undefined`);
                exit();
            }
            if (block.type !== TokenType.REF_BLOCK && block.type !== TokenType.RECORD) {
                logError(token.childs[0].loc, `'${token.childs[0].txt}' should be used only as parameter type in functions or in a struct definition`);
                exit();
            }
            return true;
        }
        ).map(token => token.childs[0].out!);

    return ins;

}

function getReturnValueByRefBlock(block: Token): ValueType {
    if (block.type !== TokenType.REF_BLOCK) {
        logError(block.loc, `the token '${block.txt}' is not a REF_BLOCK`);
        exit();
    }
    if (block.childs.length === 0) return "void";

    // getTokensByTypeRecur recurs only in BLOCK not in REF_BLOCK
    // so every return here is related to the ref block as parameter
    const returns = getTokensByTypeRecur(block, TokenType.RETURN);
    const lastChild = block.childs.at(-1);
    if (lastChild && lastChild?.type !== TokenType.RETURN) {
        returns.unshift(lastChild);
    }
    if (returns.length === 0) {
        logError(block.loc, `Cannot determine the type of '${block.txt}'`);
        exit();
    }

    const firstType = getReturnTypeOfAWord(returns[0]);
    for (let i = 1; i < returns.length; i++) {
        const currentReturnType = getReturnTypeOfAWord(returns[i]);
        if (firstType !== currentReturnType) {
            logError(returns[0].loc, `return types mismatch: '${returns[0].txt}' returns ${humanReadableType(firstType)}...`);
            logError(returns[i].loc, `... while '${returns[i].txt}' returns ${humanReadableType(currentReturnType)}`);
            exit();
        }
    }
    return firstType;

}

function getReturnValueByBlock(block: Token) {

    if (block.type !== TokenType.BLOCK && block.type !== TokenType.REF_BLOCK && block.type !== TokenType.PROG && block.type !== TokenType.RECORD) {
        logError(block.loc, `the token '${block.txt}' is not a BLOCK or REF_BLOCK or PROG!`);
        exit();
    }

    for (let i = 0; i < block.childs.length - 1; i++) {
        if (block.childs[i].type === TokenType.RETURN) {
            logError(block.childs[i + 1].loc, `'${block.childs[i + 1].txt}' is unreachable code`);
            exit();
        } else if (block.childs[i].out !== "void") {
            logError(block.childs[i].loc, `the expression '${block.childs[i].txt}' should not return unhandled data, currently it returns ${humanReadableType(block.childs[i].out)}`);
            exit();
        }
    }
    if (block.type === TokenType.REF_BLOCK) return getReturnValueByRefBlock(block);

    const lastChild = block.childs.at(-1);
    if (lastChild === undefined || lastChild.type === TokenType.RETURN) return "void";

    const lastChildType = lastChild.out;
    if (lastChildType === undefined) {
        logError(lastChild.loc, `the return type of '${lastChild.txt}' is undefined`);
        exit();
    }
    return lastChildType;
}

function typeCheckBlock(block: Token) {

    if (block.type !== TokenType.BLOCK && block.type !== TokenType.REF_BLOCK && block.type !== TokenType.PROG && block.type !== TokenType.RECORD) {
        logError(block.loc, `the token '${block.txt}' is not a BLOCK or REF_BLOCK or PROG!`);
        exit();
    }

    // let's search for something like ['x Number 'y Number] where Number accepts a value but does not have child
    // this will become a function
    const ins = getParametersRequestedByBlock(block);

    block.ins = [];
    block.expectedArity = ins.length;
    block.out = block.type === TokenType.REF_BLOCK ? "addr" : getReturnValueByBlock(block);
    block.expectedArityOut = block.out === "void" ? 0 : 1;

}

function typeCheckDataBlock(block: Token) {
    if (block.type !== TokenType.DATA_BLOCK) {
        logError(block.loc, `the token '${block.txt}' is not a DATA_BLOCK`);
        exit();
    }

    if (block.childs.length === 0) {
        logError(block.loc, `'${block.txt}' is empty. Cannot infer its type`);
        exit();
    }

    let elementType;
    for (let i = 0; i < block.childs.length; i++) {
        const child = block.childs[i];
        const currentType = getReturnTypeOfAWord(child);
        if (elementType === undefined) elementType = currentType;
        if (!areTypesEqual(elementType, currentType)) {
            logError(child.loc, `'${child.txt}' should be ${humanReadableType(elementType)} but it's a ${humanReadableType(currentType)}`);
            exit();
        }
    }

}

function optimize(token: Token, target: Target) {
    switch (token.type) {
        case TokenType.PLUS:
            if (token.childs[0].type === TokenType.LITERAL && token.childs[1].type === TokenType.LITERAL) {
                const result = (parseInt(token.childs[0].txt, 10) + parseInt(token.childs[1].txt, 10));
                token.type = TokenType.LITERAL;
                token.txt = target === "c64" ? String(result & 65535) : String(result);
                token.expectedArity = 0;
                token.expectedArityOut = 1;
                token.internalValueType = "number";
                token.out = "number";
                token.ins = [];
                token.position = InstructionPosition.PREFIX;
                token.priority = 1000;
                token.isUserFunction = false;
                token.childs = [];
            }
            break;
        case TokenType.MINUS:
            if (token.childs[0].type === TokenType.LITERAL && token.childs[1].type === TokenType.LITERAL) {
                const result = (parseInt(token.childs[0].txt, 10) - parseInt(token.childs[1].txt, 10));
                token.type = TokenType.LITERAL;
                token.txt = target === "c64" ? String(result & 65535) : String(result);
                token.expectedArity = 0;
                token.expectedArityOut = 1;
                token.internalValueType = "number";
                token.out = "number";
                token.ins = [];
                token.position = InstructionPosition.PREFIX;
                token.priority = 1000;
                token.isUserFunction = false;
                token.childs = [];
            }
            break;
        case TokenType.DIV:
            if (token.childs[0].type === TokenType.LITERAL && token.childs[1].type === TokenType.LITERAL) {

                const result = parseInt(token.childs[1].txt, 10) !== 0 ? (parseInt(token.childs[0].txt, 10) / parseInt(token.childs[1].txt, 10)) : 0;
                token.type = TokenType.LITERAL;
                token.txt = target === "c64" ? String(result & 65535) : String(result & 65535);
                token.expectedArity = 0;
                token.expectedArityOut = 1;
                token.internalValueType = "number";
                token.out = "number";
                token.ins = [];
                token.position = InstructionPosition.PREFIX;
                token.priority = 1000;
                token.isUserFunction = false;
                token.childs = [];
            }
            break;
        case TokenType.MULT:
            if (token.childs[0].type === TokenType.LITERAL && token.childs[1].type === TokenType.LITERAL) {
                const result = (parseInt(token.childs[0].txt, 10) * parseInt(token.childs[1].txt, 10));
                token.type = TokenType.LITERAL;
                token.txt = target === "c64" ? String(result & 65535) : String(result);
                token.expectedArity = 0;
                token.expectedArityOut = 1;
                token.internalValueType = "number";
                token.out = "number";
                token.ins = [];
                token.position = InstructionPosition.PREFIX;
                token.priority = 1000;
                token.isUserFunction = false;
                token.childs = [];
            }
            break;
        case TokenType.CAST_BYTE:
            if (token.childs[0].type === TokenType.LITERAL) {
                const result = parseInt(token.childs[0].txt, 10) & 255;
                token.type = TokenType.LITERAL;
                token.txt = String(result);
                token.expectedArity = 0;
                token.expectedArityOut = 1;
                token.internalValueType = "byte";
                token.out = "byte";
                token.ins = [];
                token.position = InstructionPosition.PREFIX;
                token.priority = 1000;
                token.isUserFunction = false;
                token.childs = [];
            }
            break;
    }

}

function areTypesEqual(t1: ValueType, t2: ValueType): boolean {
    if (typeof t1 === "string") {
        return t1 === t2;
    }
    if (typeof t2 === "string") return false; // to make tsc happy
    if (t1[0] !== t2[0]) return false
    if (t1[0] === "usertype") {
        return t1[1] === t2[1];
    }
    if (t2[0] === "usertype") return false; // to make tsc happy
    return areTypesEqual(t1[1], t2[1]);
}

function getTokenByName(name: string, tokens: Token[]): Token | undefined {
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].txt === name) return tokens[i];
    }
    return undefined;
}

function typeCheck(token: Token, vocabulary: Vocabulary) {

    // if some of the childs has no childs we shuld typecheck them because 
    // they could be a function with lower priority not grouped and checked yet    
    for (let i = 0; i < token.childs.length; i++) {
        const child = token.childs[i];
        if (child.childs.length === 0) typeCheck(child, vocabulary);
    }

    if (token.out === undefined || token.ins === undefined) {
        const instr = vocabulary[token.type];
        if (instr === undefined) {
            logError(token.loc, `unknown keyword '${token.txt}', can't do the typecheck`);
            exit();
        }
        if (token.ins === undefined) token.ins = instr.ins(token);
        if (token.out === undefined) token.out = instr.out(token);

    }

    const arity = getArity(token, vocabulary);
    if (token.type === TokenType.BLOCK || token.type === TokenType.REF_BLOCK || token.type === TokenType.RECORD) {
        // in block the number of ins is not the number of childs
    } else {
        if (arity !== token.childs.length) {
            logError(token.loc, `the word '${token.txt}' expects ${arity} parameters, but got ${token.childs.length}`);
            dumpAst(token);
            exit();
        }
    }

    const ins = getInputParametersValue(token);
    for (let i = 0; i < ins.length; i++) {
        if (!areTypesEqual(ins[i], getReturnTypeOfAWord(token.childs[i]))) {
            logError(token.loc, `the word '${token.txt}' expects parameter in position ${i + 1} to be ${humanReadableType(ins[i])}, but it is ${humanReadableType(token.childs[i].out)}`);
            logError(token.childs[i].loc, `here is the parameter '${token.childs[i].txt}'`);
            dumpAst(token);
            exit();
        }
    }

    if (token.type === TokenType.NEW) {
        assertChildNumber(token, 2);
        const childName = token.childs[0];
        const varDef = getWordDefinition(token.context, childName.txt);
        if (varDef?.type === "struct") {
            const varDefElements = varDef.elements;

            const childRecord = token.childs[1];
            if (childRecord.context === undefined) {
                logError(childRecord.loc, `'${childRecord.txt}' does not have a context`);
                exit();
            }

            const recordEntries = Object.entries(childRecord.context.varsDefinition)
                .map(([name, varDef]) => {
                    return { name, type: varDef.out, token: varDef.token }
                });

            // check if all of the record entries are in the struct definition 
            for (let i = 0; i < recordEntries.length; i++) {
                const componentToSearch = recordEntries[i];
                let found = false;
                for (let j = 0; j < varDefElements.length; j++) {
                    if (componentToSearch.name === varDefElements[j].name) {
                        if (areTypesEqual(componentToSearch.type, varDefElements[j].def.out)) {
                            found = true;
                            break;
                        } else {
                            logError(componentToSearch.token.loc, `in '${token.txt}' struct '${componentToSearch.name}' is supposed to be '${humanReadableType(varDefElements[j].def.out)}' but here it is '${humanReadableType(componentToSearch.type)}'`);
                            exit();
                        }
                    }
                }
                if (!found) {
                    logError(componentToSearch.token.loc, `'${componentToSearch.name}' is not part of '${token.txt}' struct`);
                    exit();
                }
            }

            // sobstitute the current context var definitions with the definition of the struct
            childRecord.context.varsDefinition = Object.fromEntries(
                varDefElements
                    .filter(defElem => defElem.def.type !== "function")
                    .map(defElem => [defElem.name, defElem.def])
            );

            // change all lit words using the struct template
            childRecord.childs = varDefElements
                .filter(defElem => defElem.def.type !== "function")
                .map(defElem => {
                    const existingToken = getTokenByName(defElem.name, childRecord.childs);
                    if (existingToken !== undefined) return existingToken;
                    if (defElem.def.out?.[0] === "usertype") {
                        logError(childRecord.loc, `since '${defElem.name}' is a struct, you need to specify a value for it`);
                        exit();
                    }
                    if (defElem.def.out?.[0] === "array") {
                        logError(childRecord.loc, `since '${defElem.name}' is an array, you need to specify a value for it`);
                        exit();
                    }
                    const valueToAssign = defElem.def.internalType === "string" ? "" : 0;
                    const valueToken = {
                        type: TokenType.LITERAL,
                        loc: defElem.def.token.loc,
                        context: childRecord.context,
                        txt: String(valueToAssign),
                        grabFromStack: false,
                        expectedArity: 0,
                        expectedArityOut: 1,
                        ins: [],
                        priority: 1000,
                        position: InstructionPosition.PREFIX,
                        internalValueType: defElem.def.internalType,
                        out: defElem.def.out,
                        childs: [],
                    } as Token;
                    const litToken = {
                        type: TokenType.LIT_WORD,
                        loc: defElem.def.token.loc,
                        context: childRecord.context,
                        txt: defElem.name,
                        grabFromStack: false,
                        expectedArity: 1,
                        expectedArityOut: 0,
                        ins: [defElem.def.out],
                        priority: 5,
                        userFunction: false,
                        position: InstructionPosition.PREFIX,
                        internalValueType: defElem.def.internalType,
                        out: "void",
                        childs: [valueToken],
                    } as Token;

                    return litToken;
                });
        }
    } // end check struct

}

function setWordDefinition(token: Token, target: Target) {

    if (token.type !== TokenType.LIT_WORD) {
        logError(token.loc, `'${token.txt}' is not a 'LIT WORD'`);
        exit();
    }

    if (token.context === undefined) {
        logError(token.loc, `The token '${token.txt}' does not have a context`);
        exit();
    }

    assertChildNumber(token, 1);

    const child = token.childs[0];
    if (child.ins === undefined) {
        logError(child.loc, `The word '${child.txt}' does not have a parameters value`);
        exit();
    }

    if (child.out === undefined) {
        logError(child.loc, `The word '${child.txt}' does not have a return value`);
        exit();
    }
    const varDef = getWordDefinition(token.context, token.txt);
    if (varDef !== undefined) {
        if (varDef.token.context === token.context) {
            logError(token.loc, `Can't redefine the word '${token.txt}'`);
            exit();
        }
        // else {
        //     logError(token.loc, `Can't overshadow the word '${token.txt}'`);
        // }        
    }

    const isUserFunction = child.type === TokenType.REF_BLOCK;
    const ins = isUserFunction ? getParametersRequestedByBlock(token.childs[0]) : [];
    if (isUserFunction) {
        token.context.varsDefinition[token.txt] = {
            type: "function",
            ins,
            out: getReturnValueByBlock(child),
            token,
            position: InstructionPosition.PREFIX,
            priority: child.priority,
            internalType: "addr",
            offset: undefined,
            reference: []
        };
        token.context.size += sizeForValueType("addr", target);
    } else {
        // if (child.internalValueType === undefined) {
        //     logError(child.loc, `the internal type of '${child.txt}' is undefined`);
        //     exit();
        // }

        token.context.varsDefinition[token.txt] = {
            type: "value",
            ins: [],
            out: child.out,
            token,
            position: InstructionPosition.PREFIX,
            priority: child.priority,
            internalType: child.internalValueType ?? child.out,
            offset: undefined,
            reference: []
        };
        token.context.size += sizeForValueType(child.out, target);
    }

}

function setStructDefinition(token: Token, target: Target) {

    if (token.type !== TokenType.STRUCT) {
        logError(token.loc, `'${token.txt}' is not a 'STRUCT'`);
        exit();
    }

    if (token.context === undefined) {
        logError(token.loc, `The token '${token.txt}' does not have a context`);
        exit();
    }

    assertChildNumber(token, 2);
    if (token.childs[0].internalValueType !== "symbol") {
        logError(token.childs[0].loc, `struct expects the first parameters to be a 'symbol' but '${token.childs[0].txt}' is a ${humanReadableType(token.childs[0].internalValueType)}`);
        exit();
    }
    if (token.childs[1].type !== TokenType.RECORD) {
        logError(token.childs[1].loc, `struct expects the second parameters to be a 'BLOCK' but '${token.childs[1].txt}' is a ${humanReadableToken(token.childs[1].type)}`);
        exit();
    }

    const name = token.childs[0].txt;
    const block = token.childs[1];

    const structDefPresent = getWordDefinition(token.context, name);
    if (structDefPresent !== undefined) {
        const previousToken = structDefPresent.token;
        logError(token.childs[0].loc, `the word '${name}' was already defined`);
        logError(previousToken.loc, `here is the previous definition`);
        exit();
    }

    if (block.context === undefined) {
        logError(block.loc, `The context for the block is undefined`);
        exit();
    }

    let size = 0;
    const elements = [];
    for (const [name, varDef] of Object.entries(block.context.varsDefinition)) {
        const currSize = sizeForValueType(varDef.internalType, target);
        elements.push({
            name,
            offset: size,
            size: currSize,
            def: varDef,
        });
        size += currSize;
    }

    const structDef: VarDefinitionStruct = {
        type: "struct",
        ins: [],
        out: ["usertype", name],
        token,
        position: InstructionPosition.PREFIX,
        priority: 100,
        internalType: "addr",
        offset: undefined,
        size,
        elements,
        reference: []
    };
    token.context.varsDefinition[name] = structDef;
    console.log("created struct word " + name);
}

function parseBlock(ast: AST, target: Target, vocabulary: Vocabulary): AST {

    const priorityList = [...new Set(
        ast.filter(element => element.priority !== undefined && element.type !== TokenType.LITERAL)
            .map(element => element.priority)
            .sort((a, b) => (b ?? 0) - (a ?? 0))
    )];

    for (let i = 0; i < priorityList.length; i++) {
        const priority = priorityList[i];
        for (let j = 0; j < ast.length; j++) {
            //for (let j = ast.length - 1; j >= 0; j--) {
            const token = ast[j];
            const tokenPosition = token.position; // save the token position since the original token could be replaced by optimization
            if (token.priority !== priority) continue;
            if (token.type === TokenType.LITERAL) {
                continue;
            }

            if (token.type === TokenType.OPEN_BRACKETS || token.type === TokenType.CLOSE_BRACKETS) {
                logError(token.loc, `found open or closed brackets in parse, compiler error`);
                exit();
            }

            const group = groupFunctionToken(ast, j, vocabulary, target);
            if (tokenPosition !== InstructionPosition.PREFIX) j = j - 1; // we already taken as child the token before this

        }
    }

    return ast;
}

function getInsOutArity(token: Token): { ins: number, out: number } {

    if (token.type === TokenType.LITERAL) return { ins: 0, out: 1 };
    if (token.type === TokenType.WORD) {
        const varDef = getWordDefinition(token.context, token.txt);
        if (varDef === undefined) {
            logError(token.loc, `unknown word '${token.txt}'`);
            exit();
        }
        return { ins: varDef.ins.length, out: varDef.out === "void" ? 0 : 1 };
    }
    if (token.type === TokenType.REF_BLOCK || token.type === TokenType.BLOCK || token.type === TokenType.RECORD) {
        return { ins: 0, out: 1 };

    }
    // instruction
    if (token.expectedArity === undefined) {
        logError(token.loc, `the arity of '${token.txt}' is undefined`);
        exit();
    }
    if (token.expectedArityOut === undefined) {
        logError(token.loc, `the type result of '${token.txt}' is undefined`);
        exit();
    }
    if (token.position === InstructionPosition.PREFIX) {
        if (token.type === TokenType.EITHER) return { ins: token.expectedArity, out: 0 };
        return { ins: token.expectedArity, out: token.expectedArityOut };
    }
    if (token.position === InstructionPosition.INFIX) return { ins: token.expectedArity, out: token.expectedArityOut };

    // POSTFIX
    return { ins: 1, out: 1 };

}

function getTokensRecur(token: Token, pred: (token: Token) => boolean): Token[] {
    const wordUsed = token.childs.filter(pred);
    //const wordUsedByChild = token.childs.filter(child => child.type === TokenType.BLOCK).map(child => getTokensRecur(child, pred));
    const wordUsedByChild = token.childs.map(child => getTokensRecur(child, pred));
    return wordUsed.concat(wordUsedByChild.flat());
}

function getTokensByTypeRecur(token: Token, type: TokenType): Token[] {
    return getTokensRecur(token, (token: Token) => token.type === type);

    // const wordUsed = token.childs.filter(child => child.type === type);
    // const wordUsedByChild = token.childs.filter(child => child.type === TokenType.BLOCK).map(child => getTokensByTypeRecur(child, type));
    // return wordUsed.concat(wordUsedByChild.flat());
}

function getWordUsedButNotDefinedInABlock(token: Token): string[] {
    const wordsUsed = getTokensByTypeRecur(token, TokenType.WORD).map(token => token.txt);
    const wordsDefined = getTokensByTypeRecur(token, TokenType.LIT_WORD).map(token => token.txt);
    const wordsUsedButNotDefined = wordsUsed.filter(x => !wordsDefined.includes(x));
    const freeWords = wordsUsedButNotDefined.filter(name => getWordDefinition(token.context, name) === undefined);
    return freeWords;
}

function groupByExpectedArityOutZero(sequence: AST, target: Target, vocabulary: Vocabulary) {

    let childLeft = 0;
    let lastPointer = 0;
    let startingNewSequence = true;
    for (let j = 0; j < sequence.length; j++) {
        let token = sequence[j];
        changeTokenTypeOnContext(vocabulary, token, sequence.slice(token.position === InstructionPosition.PREFIX ? j : j - 1));
        token = sequence[j];
        let { ins, out } = getInsOutArity(token);
        if (token.type === TokenType.REF_BLOCK || token.type === TokenType.BLOCK || token.type === TokenType.RECORD) {
            const childs = token.childs;
            groupByExpectedArityOutZero(childs, target, vocabulary);
            typeCheckBlock(token);
        }
        if (token.type === TokenType.DATA_BLOCK) {
            const childs = token.childs;
            groupByExpectedArityOutZero(childs, target, vocabulary);
            typeCheckDataBlock(token);
        }
        if (token.type === TokenType.EITHER) out = (childLeft > 0 ? 1 : 0);

        if (childLeft > 0 && out === 0) {
            logError(token.loc, `expected a value but '${token.txt}' returns 'void'`);
            exit();
        }

        // at the start of a new sequence, we dont count out values
        childLeft = childLeft + ins - (startingNewSequence && ins > 0 ? 0 : out);
        if (token.position === InstructionPosition.PREFIX) {
            if (ins > 0 && childLeft < ins) childLeft = ins;
        } else if (token.position === InstructionPosition.INFIX) {
            if (ins > 1 && childLeft < ins - 1) childLeft = ins - 1;
        } else if (token.position === InstructionPosition.POSTFIX) {
            // no check for additional parameters
        }

        // naive one:
        // childLeft = childLeft + ins - out;

        //console.log(`${token.txt} ins: ${ins} out: ${out} childleft: ${childLeft}`);
        if ((childLeft <= 0 && !startingNewSequence) || j === sequence.length - 1) {
            let endOfBlock = true;
            if (j < sequence.length - 1) {
                if (sequence[j + 1].position === InstructionPosition.INFIX || sequence[j + 1].position === InstructionPosition.POSTFIX) {
                    endOfBlock = false;
                } else if (ins > 0 && token.position !== InstructionPosition.POSTFIX) {
                    endOfBlock = false;
                }
            }
            // if there is one more token that give one result on the stack before the end
            // this could be part of current sequence as return value of the block
            if (j === sequence.length - 2) {
                const nextToken = sequence[j + 1];
                if (nextToken.type === TokenType.REF_BLOCK || nextToken.type === TokenType.BLOCK ||
                    nextToken.type === TokenType.RECORD || nextToken.type === TokenType.WORD) {

                    const freeWords = nextToken.type === TokenType.WORD ? [nextToken.txt] : getWordUsedButNotDefinedInABlock(nextToken);
                    const currentlyDefinedWords = sequence.slice(lastPointer, j + 1)
                        .filter(token => token.type === TokenType.LIT_WORD)
                        .map(token => token.txt);
                    const wordsInBlockDefinedCurrently = freeWords.filter(x => currentlyDefinedWords.includes(x));

                    // If there are words in the block that are defined in the current sequence
                    // we must parse it before the block. 
                    // If there are not such words we can grab the last item in the sequence as child
                    if (wordsInBlockDefinedCurrently.length === 0) {
                        endOfBlock = false;
                    }
                } else {
                    const { ins, out } = getInsOutArity(sequence[j + 1]);
                    if (ins === 0 && out === 1) endOfBlock = false
                }
            }

            // we check if the remaning part of the sequence yield a value, it could be the
            // return value for the block
            // as in the example :['tio Termios syscall4 54 0 21505 tio !addr]
            // in this case we get childLeft = 0 at token "21505" but the last two tokens are needed
            // if (j < sequence.length - 2) {
            //     if (sequence[j + 2].position === InstructionPosition.INFIX || sequence[j + 2].position === InstructionPosition.POSTFIX) {
            //         endOfBlock = false;
            //     } else if (ins > 0 && token.position !== InstructionPosition.POSTFIX) {
            //         endOfBlock = false;
            //     }
            // }

            if (endOfBlock) {
                childLeft = 0;
                //console.log("----------");
                const toParse = sequence.slice(lastPointer, j + 1);
                const numberToParse = toParse.length;
                //dumpSequence(toParse, `from ${lastPointer} to ${j} :`);
                if (toParse.length === 1 && toParse[0].type === TokenType.BLOCK) {
                    // already parsed
                } else {
                    parseBlock(toParse, target, vocabulary);
                }
                sequence.splice(lastPointer, numberToParse, ...toParse);
                j = lastPointer + toParse.length - 1;
                lastPointer = lastPointer + toParse.length;
                startingNewSequence = true;
            }
        } else {
            startingNewSequence = false;
        }
    }
}

function createLiteralFromToken(token: Token, valueType: ValueType | undefined) {
    token.type = TokenType.LITERAL;
    token.internalValueType = valueType;
    token.ins = [];
    token.out = valueType;
    token.position = InstructionPosition.PREFIX;
    token.priority = 1000;
    token.isUserFunction = false;
    token.childs = [];
}

function createNewContext(parent: Context | undefined): Context {
    return {
        parent,
        element: undefined,
        varsDefinition: {},
        size: 0
    };
}

function addInstrData(token: Token, vocabulary: Vocabulary) {
    const instr = vocabulary[token.type];
    if (instr) {
        token.expectedArity = instr.expectedArity;
        token.expectedArityOut = instr.expectedArityOut;
        token.grabFromStack = instr.grabFromStack;
        token.ins = undefined;
        token.out = undefined;
        token.position = instr.position;
        token.priority = instr.priority;
        token.isUserFunction = false;
    }
}

function groupSequence(filename: string, program: AST, vocabulary: Vocabulary): Token {

    let currentContext: Context = createNewContext(undefined);
    const ast: AST = [];
    const stack: { pos: number, context: Context, loc: Location, type: TokenType }[] = [];
    for (let j = 0; j < program.length; j++) {
        const token = program[j];
        if (token.type === TokenType.OPEN_BRACKETS) {
            stack.push({ pos: ast.length, context: currentContext, loc: token.loc, type: token.type });
            currentContext = createNewContext(currentContext);
        } else if (token.type === TokenType.OPEN_REF_BRACKETS) {
            stack.push({ pos: ast.length, context: currentContext, loc: token.loc, type: token.type });
            currentContext = createNewContext(currentContext);
        } else if (token.type === TokenType.CLOSE_BRACKETS) {
            const state = stack.pop();
            if (state === undefined) {
                logError(token.loc, "close brackets not bilanced");
                exit();
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
                out: undefined,
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
                createLiteralFromToken(token, token.internalValueType);
                ast.push(token);
            } else {
                const tokenToPush = { ...token };
                tokenToPush.context = currentContext;
                addInstrData(tokenToPush, vocabulary);
                ast.push(tokenToPush);
            }
        }
    }

    const state = stack.pop();
    if (state !== undefined) {
        const token = program[state.pos];
        logError(token.loc, "open brackets not bilanced");
        exit();
    }

    const prog: Token = {
        loc: { col: 1, row: 1, filename },
        txt: "[prog]",
        type: TokenType.PROG,
        internalValueType: "void",
        ins: [],
        out: undefined,
        isUserFunction: false,
        priority: 0,
        position: InstructionPosition.PREFIX,
        functionIndex: undefined,
        childs: ast,
        context: currentContext
    };

    return prog;
}

function changeTokenTypeOnContext(vocabulary: Vocabulary, token: Token, ast: AST) {
    if (ast.length === 0) return;
    const instr = vocabulary[token.type];
    if (instr === undefined) return;
    if (instr.preprocessTokens) instr.preprocessTokens(ast, vocabulary);
}

function parse(vocabulary: Vocabulary, program: AST, target: Target, filename: string): Token {
    let astProgram = groupSequence(filename, program, vocabulary);
    groupByExpectedArityOutZero(astProgram.childs, target, vocabulary);
    typeCheckBlock(astProgram);
    return astProgram;
}

// MACRO 
function domacro(astProgram: Token): Token {




    return astProgram;
}


function checkForUnusedCode(ast: Token) {
    const setWordRefInContexts = (token: Token) => {
        if ((token.type === TokenType.BLOCK || token.type === TokenType.REF_BLOCK || token.type === TokenType.PROG)) {
            const context = token.context;
            if (!context) {
                logError(token.loc, `'${token.txt}' does not have a context`);
                exit();
            }
            for (const [name, def] of Object.entries(context.varsDefinition)) {
                def.reference = [];
            }
        }
        for (let i = 0; i < token.childs.length; i++) {
            const child = token.childs[i];
            if (child.type === TokenType.WORD || child.type === TokenType.SET_WORD || (child.type === TokenType.LITERAL && child.out === "symbol" && token.type !== TokenType.STRUCT)) {
                const def = getWordDefinition(child.context, child.txt);
                // todo: find component definition in case of a struct
                // print a -> name , name as word is not found
                // if (def === undefined) {
                //     logError(child.loc, `cannot find the definition of word '${child.txt}'`);
                //     exit();
                // }
                if (def) def.reference.push(child);
            }
            setWordRefInContexts(child);
        }
    }
    const removeUnusedWord = (token: Token) => {
        if (token.type === TokenType.RECORD) return 0;
        let ret = 0;
        // depth first
        for (let i = token.childs.length - 1; i >= 0; i--) {
            const child = token.childs[i];
            ret += removeUnusedWord(child);
            if (child.type === TokenType.LIT_WORD) {
                if (child.childs.length === 1 && child.childs[0].grabFromStack) continue;
                const def = getWordDefinition(child.context, child.txt);
                if (def === undefined) {
                    logError(child.loc, `cannot find the definition of word '${child.txt}'`);
                    exit();
                }
                if (def.reference.length === 0) {
                    if (isTypeToken(child.childs[0])) {
                        logError(child.loc, `unused parameter '${child.txt}'`, true);
                    } else {
                        logError(child.loc, `removed definition of unused word '${child.txt}'`, true);
                        token.childs.splice(i, 1);
                        ret++;
                    }

                }
            }
        }
        return ret;
    }
    const removeUnusedDefinition = (token: Token) => {
        if ((token.type === TokenType.BLOCK || token.type === TokenType.REF_BLOCK || token.type === TokenType.PROG)) {
            const context = token.context;
            if (!context) {
                logError(token.loc, `'${token.txt}' does not have a context`);
                exit();
            }
            context.varsDefinition = Object.fromEntries(
                Object.entries(context.varsDefinition)
                    .filter(([key, def]) => (def.token.childs.length === 1 && def.token.childs[0].grabFromStack) || def.reference.length > 0)
            );
            // Object.entries(context.varsDefinition).forEach(([key, def]) => {
            //     console.log(`word: ${key}`, "refs", def.reference.map(ref => ref.loc))
            // });


        }
        for (let i = token.childs.length - 1; i >= 0; i--) {
            const child = token.childs[i];
            removeUnusedDefinition(child);
        }
    }
    let tryToRemove = true;
    while (tryToRemove) {
        setWordRefInContexts(ast);
        const numRemoved = removeUnusedWord(ast);
        tryToRemove = numRemoved > 0;
    }
    // todo: make it work
    removeUnusedDefinition(ast);
}

function getFunctionIndex(): number {
    return functionIndex++;
}

function getFunctionName(n: number): string {
    return "CALL_" + n;
}

function getAfterFunctionName(n: number): string {
    return "AFTER_" + n;
}

function compileLiteral(ast: Token, target: Target): Assembly {
    let ret: Assembly = [];
    if (target === "c64") {
        if (ast.out === "number") {
            ret.push(`; ${ast.loc.row}:${ast.loc.col} NUMBER ${ast.txt}`);
            const MSB = (parseInt(ast.txt, 10) >> 8) & 255;
            ret.push(`LDA #${MSB}`);
            ret.push(`STA STACKACCESS+1`);
            const LSB = parseInt(ast.txt, 10) & 255;
            ret.push(`LDA #${LSB}`);
            ret.push(`STA STACKACCESS`);
            ret.push(`JSR PUSH16`);

        } else if (ast.out === "byte") {
            ret.push(`; ${ast.loc.row}:${ast.loc.col} BYTE ${ast.txt}`);
            const LSB = parseInt(ast.txt, 10) & 255;
            ret.push(`LDA #${LSB}`);
            ret.push(`STA STACKACCESS`);
            ret.push(`LDA #0`);
            ret.push(`STA STACKACCESS+1`);
            ret.push(`JSR PUSH16`);
        } else if (ast.out === "string") {
            ret.push(`; ${ast.loc.row}:${ast.loc.col} STRING "${ast.txt}"`);
            // push lenght 
            // todo: ora la lunghezza massima della stringa è 255 caratteri, aumentarla ?
            const stringToPush = ast.txt;
            if (stringToPush.length > 255) {
                logError(ast.loc, "strings must be less than 256 chars");
                exit();
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

        } else if (ast.out === "bool") {
            ret.push(`; ${ast.loc.row}:${ast.loc.col} BOOL ${ast.txt}`);
            ret.push(`LDA #${ast.txt === "true" ? "1" : "0"}`);
            ret.push(`STA STACKACCESS`);
            ret.push(`LDA #0`);
            ret.push(`STA STACKACCESS+1`);
            ret.push(`JSR PUSH16`);
        } else if (ast.out === "addr") {
            logError(ast.loc, `'Addr' should not be compiled as a value, compiler error`);
            exit();
        } else if (ast.out === "void") {
            logError(ast.loc, `'Void' should not be compiled as a value, compiler error`);
            exit();
        } else {
            logError(ast.loc, `compiling the type '${ast.out}' is not supported yet`);
            exit();
        }
        return ret;
    } else if (target === "freebsd") {
        if (ast.out === "number") {
            ret.push(`; ${ast.loc.row}:${ast.loc.col} NUMBER ${ast.txt}`);
            const num = parseInt(ast.txt, 10);
            ret.push(`push ${num}`);
        } else if (ast.out === "byte") {
            ret.push(`; ${ast.loc.row}:${ast.loc.col} BYTE ${ast.txt}`);
            const LSB = parseInt(ast.txt, 10) & 255;
            ret.push(`push ${LSB}`);
        } else if (ast.out === "string") {
            ret.push(`; ${ast.loc.row}:${ast.loc.col} STRING "${ast.txt}"`);
            // push lenght 
            const stringToPush = ast.txt;
            ret.push(`push ${ast.txt.length}`);
            // push address
            const labelIndex = stringTable.length;
            stringTable.push(ast.txt);
            ret.push(`push str${labelIndex}`);
        } else if (ast.out === "bool") {
            ret.push(`; ${ast.loc.row}:${ast.loc.col} BOOL ${ast.txt}`);
            ret.push(`push ${ast.txt === "true" ? "1" : "0"}`);
        } else if (ast.out === "addr") {
            logError(ast.loc, `'Addr' should not be compiled as a value, compiler error`);
            exit();
        } else if (ast.out === "void") {
            logError(ast.loc, `'Void' should not be compiled as a value, compiler error`);
            exit();
        } else {
            logError(ast.loc, `compiling the type '${ast.out}' is not supported yet`);
            exit();
        }
        return ret;
    }
    console.log(`target system unknown ${target}`);
    exit();
}

function isTypeToken(token: Token): boolean {
    if (token.grabFromStack) return true;
    const varDef = getWordDefinition(token.context, token.txt);
    return varDef?.type === "struct";
}

function compile(vocabulary: Vocabulary, ast: Token, target: Target): Assembly {

    let ret: Assembly = [];
    const inst = vocabulary[ast.type];

    const loc = `${ast.loc.row}: ${ast.loc.col}`;
    const wordtype = getFunctionSignature(ast);
    const tokenType = humanReadableToken(ast.type);
    const instructionLabel = `; ${loc} ${tokenType} ${ast.txt} type: ${wordtype}`;

    // PRELUDE
    if (ast.type !== TokenType.LITERAL) {
        if (inst.generatePreludeAsm) {
            ret.push("; Prelude for:");
            ret.push(instructionLabel);
            ret = ret.concat(inst.generatePreludeAsm(ast, target));
        }
    }

    if (ast.type === TokenType.REF_BLOCK) {
        // reorder the child: first the params in reverse order, then the other childs
        const isParam = (token: Token) => {
            if (token.type !== TokenType.LIT_WORD) return false;
            if (token.childs.length !== 1) return false;
            return isTypeToken(token.childs[0]);
        }
        const params = ast.childs
            .filter(isParam)
            .reverse();
        const nonParams = ast.childs
            .filter(t => !isParam(t));
        ast.childs = params.concat(nonParams);
    } else if (ast.type === TokenType.DATA_BLOCK) {
        ast.childs = ast.childs.reverse();
    }

    for (let i = 0; i < ast.childs.length; i++) {
        let generateAssemblyChild: boolean = true;
        if (inst.generateChildPreludeAsm) {
            const retAsseblyChild = inst.generateChildPreludeAsm(ast, i, target);
            if (retAsseblyChild !== undefined) {
                ret = ret.concat(retAsseblyChild);
            } else {
                ret = ret.concat([
                    `; no child generation for '${ast.txt}'`
                ]);
                generateAssemblyChild = false;
            }
        }
        if (generateAssemblyChild) ret = ret.concat(compile(vocabulary, ast.childs[i], target));
    }

    // lets' compile for real        
    if (ast.type === TokenType.LITERAL) {
        ret = ret.concat(compileLiteral(ast, target));
    } else {
        ret.push(instructionLabel);
        const inst = vocabulary[ast.type];
        ret = ret.concat(inst.generateAsm(ast, target));
    }

    // LABEL NUMBERING, EACH @ found in instructions is changed to labelIndex        
    for (let i = 0; i < ret.length; i++) {
        ret[i] = ret[i].replace("@", String(labelIndex));
    }
    labelIndex++;
    return ret;
}

function optimizeAsm(asm: Assembly, target: Target) {
    // simple peephole optimization
    let lastInstruction = "";
    let lastInstructionIndex = -1;
    for (let i = 0; i < asm.length; i++) {
        const instruction = asm[i];
        if (instruction === NO_PEEPHOLE_OPT_DIRECTIVE) lastInstruction = "";
        switch (target) {
            case "c64": {
                if (instruction[0] === ";") continue;
                if (instruction === "JSR POP16" && lastInstruction === "JSR PUSH16") {
                    asm[lastInstructionIndex] = "; " + asm[lastInstructionIndex];
                    asm[i] = "; " + asm[i];
                }
                break;
            }
            case "freebsd": {
                if (instruction[0] === ";") continue;
                if (instruction === "pop rax" && lastInstruction === "push rax") {
                    asm[lastInstructionIndex] = "; " + asm[lastInstructionIndex];
                    asm[i] = "; " + asm[i];
                }
                break;
            }
        }
        lastInstruction = instruction;
        lastInstructionIndex = i;
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

function dumpProgram(program: AST) {
    console.log(`Token listing:`);
    for (let i = 0; i < program.length; i++) {
        const token = program[i];
        //logError(token.loc, `istr: ${token.type}, ${token.txt}`)
        console.log(`${token.loc.row}:${token.loc.col} \t'${token.txt}' \t${humanReadableToken(token.type)}`);
    }
}

function dumpAst(ast: AST | Token, prefix = "") {

    const getVarsInContext = (context: Context | undefined) => {
        if (context === undefined) return "Context undefined";
        const ctxVars = Object.entries(context.varsDefinition);
        return ctxVars.length === 0 ? "none" : ctxVars.map(([key, def]) => {
            return `${key} (${def.ins.map(t => humanReadableType(t)).join(",")})=>${humanReadableType(def.out)}`;
        }).join(", ");
    }

    const astToDump = ast instanceof Array ? ast : [ast];
    astToDump.forEach(element => {
        const tokenType = humanReadableToken(element.type);
        let ins: ValueType[] | undefined;
        let out: ValueType | undefined;
        if (element.type === TokenType.WORD) {
            const varDef = getWordDefinition(element.context, element.txt);
            ins = varDef?.ins;
            out = varDef?.out;
        } else {
            ins = element.ins;
            out = element.out;
        }
        const strIns = ins === undefined ? "undefined" : ins.map(type => humanReadableType(type)).join(",")
        const strOut = humanReadableType(out);
        const strType = "(" + strIns + ")=>" + strOut;
        const strFun = element.isUserFunction ? "USER FUN" : "";
        const contextToken = element.context?.element;
        const contextTokenName = contextToken?.txt ?? "";
        const ctxName = contextTokenName.length > 10 ? "[" + contextTokenName.substring(1, 6) + "...]" : "[" + contextTokenName + "]";
        const ctx = element.context?.parent === undefined ? "global" : ctxName;
        const vars = getVarsInContext(element.context);
        const parentVars = ""; //getVarsInContext(element.context?.parent);
        console.log(prefix, element.txt + " " + tokenType + " " + strFun + " " + strType + " ctx:" + ctx + " (" + vars + ") (" + parentVars + ")");

        // console.log(prefix, sourceCode.split("\n")[element.loc.row - 1]);
        // console.log(prefix, " ".repeat(element.loc.col - 1) + `^ (row: ${element.loc.row} col: ${element.loc.col})`);

        dumpAst(element.childs, prefix + "    ");
    });
}

function dumpContext(context: Context | undefined) {
    if (context === undefined) {
        console.log("Context is undefined");
        return;
    }
    console.log("context for " + (context.element === undefined ? "global" : context.element.txt));
    Object.keys(context.varsDefinition).forEach(key => {
        let wordtype = "";
        wordtype = getFunctionSignature(context.varsDefinition[key].token);
        console.log("    " + key + ": " + wordtype + " offset: " + context.varsDefinition[key].offset);
    });
}

function usage() {
    console.log("USAGE:");
    console.log("    deno run --allow-all cazz.ts <target> <filename>");
    console.log("        <target> should be 'c64' or 'freebsd'");
    console.log("        <action> 'run' or 'compile'");
    console.log("        <filename> must have .cazz extension");
}

// SIM

type SimEnvironment = {
    addresses: Array<Token>,
    buffer: string,
    dataStack: Array<number>,
    ctxStack: Array<number>,
    retStack: Array<Token>,
    pc: Token | undefined,
    memory: Uint8Array,
    vars: Record<string, number>,
    heapTop: number,
    returnOutput: boolean,
}

function buildLinks(token: Token, parent: Token | undefined) {

    token.parent = parent;

    if (token.type === TokenType.REF_BLOCK) {
        // reorder the child: first the params in reverse order, then the other childs
        const isParam = (token: Token) => {
            if (token.type !== TokenType.LIT_WORD) return false;
            if (token.childs.length !== 1) return false;
            return isTypeToken(token.childs[0]);
        }
        const params = token.childs
            .filter(isParam)
            .reverse();
        const nonParams = token.childs
            .filter(t => !isParam(t));
        token.childs = params.concat(nonParams);
    } else if (token.type === TokenType.DATA_BLOCK) {
        token.childs = token.childs.reverse();
    }

    for (let i = 0; i < token.childs.length; i++) {
        token.childs[i].parent = token;
        token.childs[i].sibling = i < token.childs.length - 1 ? token.childs[i + 1] : undefined;
        token.childs[i].index = i;
        buildLinks(token.childs[i], token);
    }

}

function storeStringOnHeap(simEnv: SimEnvironment, str: string) {
    const ret = simEnv.heapTop;
    //console.log(`store '${str}' on heap at ${ret}`);
    for (let i = 0; i < str.length; i++) {
        simEnv.memory[simEnv.heapTop] = str.charCodeAt(i);
        simEnv.heapTop++;
        if (simEnv.heapTop >= simEnv.memory.length) {
            logError(simEnv.pc!.loc, `'${simEnv.pc!.txt}' out of memory!`);
            exit();
        }
    }
    return ret;
}

function readStringFromHeap(simEnv: SimEnvironment, addr: number, len: number) {
    return String.fromCharCode(...simEnv.memory.slice(addr, addr + len));
}

function storeNumberOnHeap(simEnv: SimEnvironment, num: number, address: number | undefined): number {
    let addr = address === undefined ? simEnv.heapTop : address;
    for (let i = 0; i < 8; i++) {
        simEnv.memory[addr + i] = num & 255;
        num = num >> 8;
        if (addr + i >= simEnv.memory.length) {
            logError(simEnv.pc!.loc, `'${simEnv.pc!.txt}' out of memory!`);
            exit();
        }
    }
    if (address === undefined) simEnv.heapTop = addr + 8;
    return addr;
}

function readNumberFromHeap(simEnv: SimEnvironment, addr: number): number {
    let ret = 0;
    for (let i = 7; i >= 0; i--) {
        ret = (ret << 8) + simEnv.memory[addr + i];
    }
    return ret;
}

function stackPop(simEnv: SimEnvironment): number {
    const ret = simEnv.dataStack.pop();
    if (ret === undefined) {
        logError(simEnv.pc!.loc, `'${simEnv.pc!.txt}' stack underflow`);
        exit();
    }
    return ret;
}

function emit(simEnv: SimEnvironment, code: number) {
    if (simEnv.returnOutput) {
        simEnv.buffer += String.fromCharCode(code);
    } else {
        if (code === 10) {
            console.log(simEnv.buffer);
            simEnv.buffer = "";
        } else {
            simEnv.buffer += String.fromCharCode(code);
        }
    }
}

function simLiteral(simEnv: SimEnvironment, ast: Token) {
    switch (ast.out) {
        case "number":
            simEnv.dataStack.push(parseInt(ast.txt, 10));
            break;
        case "byte":
            simEnv.dataStack.push(parseInt(ast.txt, 10) & 255);
            break;
        case "bool":
            simEnv.dataStack.push(ast.txt === "true" ? 1 : 0);
            break;

        case "string":
            const stringToPush = ast.txt;
            if (ast.auxSimValue === undefined) {
                const addr = storeStringOnHeap(simEnv, stringToPush);
                ast.auxSimValue = [addr, stringToPush.length];
            }
            if (ast.auxSimValue instanceof Array && ast.auxSimValue.length === 2) {
                simEnv.dataStack.push(ast.auxSimValue[1]);
                simEnv.dataStack.push(ast.auxSimValue[0]);
            } else {
                logError(ast.loc, `'${ast.txt}' string literal does not have addr/len in auxSimValue`);
                exit();
            }
            break;

        default:
            logError(ast.loc, `pushing type '${humanReadableType(ast.out)}' on the stack is not supported`);
            exit();
    }
}

function localizeToken(token: Token) {
    const loc = token.loc;
    const line = loc.filename in sourceCode ? sourceCode[loc.filename].split("\n")[loc.row - 1] : `<cannot retrieve the source line in file ${loc.filename}>`;
    console.log(line);
    const info = `${humanReadableToken(token.type)} - ${token.txt}`;
    console.log(" ".repeat(loc.col - 1) + `^ (row: ${loc.row} col: ${loc.col}) ${info}`);

}

function sim(vocabulary: Vocabulary, ast: Token, returnOutput: boolean): string {

    buildLinks(ast, undefined);
    const simEnv: SimEnvironment = {
        addresses: [],
        buffer: "",
        dataStack: [],
        ctxStack: [],
        retStack: [],
        pc: undefined,
        memory: new Uint8Array(640 * 1024),
        heapTop: 0,
        vars: {},
        returnOutput
    };

    for (let i = 0; i < stringTable.length; i++) {
        const addr = storeStringOnHeap(simEnv, stringTable[i]);
        simEnv.vars["str" + i] = addr;
    }
    const nextToken = (): boolean => {
        if (simEnv.pc?.sibling === undefined) {
            // console.log("to the parent");
            simEnv.pc = simEnv.pc?.parent;
            return true;
        } else {
            // console.log("to the sibling");
            simEnv.pc = simEnv.pc.sibling;
            return false;
        }
    }

    const interpretToken = (token: Token) => {
        // lets' sim for real    
        // console.log(`${token.txt}`);
        // console.log(simEnv.dataStack);
        if (token.type === TokenType.LITERAL) {
            //console.log(`Literal ${ast.txt}`);
            simLiteral(simEnv, token);
            //console.log("stack:", simEnv.dataStack);
        } else {
            const inst = vocabulary[token.type];
            if (inst.sim) {
                //console.log(`Sim ${ast.txt}`);
                return inst.sim(simEnv, token);
            } else {
                logError(token.loc, `'${humanReadableToken(token.type)}' is not simulated yet!`);
                exit();
            }
        }
    };

    let returnedFromChilds = false;
    simEnv.pc = ast;
    while (simEnv.pc !== undefined) {
        // localizeToken(simEnv.pc);
        // if (simEnv.pc.txt === "i") {
        //     const vardef = getWordDefinition(simEnv.pc.context, "i");
        //     console.log("vardef offset of i", vardef?.offset);
        // }

        if (!returnedFromChilds) {
            let simToken = true;
            if (simEnv.pc.parent) {
                const parentInst = vocabulary[simEnv.pc.parent.type];
                const tokenIndex = simEnv.pc.index;
                if (tokenIndex === undefined) {
                    logError(simEnv.pc.loc, `'${simEnv.pc.txt}' does not have an index`);
                    exit();
                }
                if (parentInst.simPreludeChild) {
                    simToken = parentInst.simPreludeChild(simEnv, simEnv.pc.parent, tokenIndex);
                }
            }
            if (!simToken) {
                returnedFromChilds = nextToken();
                continue;
            }
        }
        // PRELUDE
        if (!returnedFromChilds && simEnv.pc.type !== TokenType.LITERAL) {
            const inst = vocabulary[simEnv.pc.type];
            if (inst.simPrelude) {
                inst.simPrelude(simEnv, simEnv.pc);
            }
        }

        if (returnedFromChilds || simEnv.pc.childs.length === 0) {
            returnedFromChilds = false;
            const jumpInstruction = interpretToken(simEnv.pc);
            if (jumpInstruction) {
                const [tokenToJump, theNextOne] = jumpInstruction;
                simEnv.pc = tokenToJump;
                if (theNextOne) returnedFromChilds = nextToken();
            } else {
                returnedFromChilds = nextToken();
            }
        } else {
            //console.log("to the child");
            simEnv.pc = simEnv.pc.childs[0];
        }
    }
    //if (simEnv.buffer !== "") emit(simEnv, 10);

    return simEnv.buffer;
}

let labelIndex = 0;
let stringTable: string[] = [];
let functionIndex = 0;
let sourceCode: Record<string, string> = {};

async function main() {

    if (Deno.args.length !== 3 && Deno.args.length !== 2) {
        usage();
        exit();
    }

    if (Deno.args[0] !== "c64" && Deno.args[0] !== "freebsd" && Deno.args[0] !== "sim") {
        console.error(`ERROR: in the first parameter you need to specify the target 'c64', 'freebsd' or 'sim': ${Deno.args[0]} is not a valid target`);
        usage();
        exit();
    }

    if (Deno.args[0] !== "sim" && (Deno.args[1] !== "run" && Deno.args[1] !== "compile")) {
        console.error(`ERROR: in the second parameter you need to specify the action 'run' or 'compile': ${Deno.args[1]} is not a valid argument`);
        usage();
        exit();
    }

    const target: Target = Deno.args[0] as Target;
    const action = Deno.args[0] === "sim" ? "sim" : Deno.args[1];
    const argFilename = Deno.args[0] === "sim" ? Deno.args[1] : Deno.args[2];

    const basename = argFilename.substring(0, argFilename.lastIndexOf('.')) || argFilename;
    const filename = absoluteFileName(basename + ".cazz");

    console.log("Cazzillo Lang: ", target);

    const vocabulary = createVocabulary();
    const source = await readFile(filename);
    const program = await tokenizer(source, filename, vocabulary);
    await preprocess(program, vocabulary);
    console.log(program.map(t => t.txt).join(" "));
    //dumpProgram(program);
    //Deno.exit(1);

    const astProgram = parse(vocabulary, program, target, filename);
    domacro(astProgram);
    //dumpAst(astProgram);
    checkForUnusedCode(astProgram);

    if (action === "sim") {
        sim(vocabulary, astProgram, false);
        Deno.exit(0);
    }

    const asm = compile(vocabulary, astProgram, target);
    if (target === "c64") {
        optimizeAsm(asm, target);
        addIndent(asm);
    }

    await Deno.writeTextFile(basename + ".asm", asm.join("\n"));

    if (target === "c64") {
        const cmd = ["dasm", basename + ".asm", "-o" + basename + ".prg", "-s" + basename + ".sym"];
        console.log(cmd.join(" "));
        const dasm = Deno.run({ cmd });
        const dasmStatus = await dasm.status();
        if (dasmStatus.success === false) {
            console.log("ERROR: dasm returned an error " + dasmStatus.code);
            exit();
        }
        if (action === "run") {
            const emu = Deno.run({ opt: { stdout: "null" }, cmd: ["x64", "-silent", basename + ".prg"] });
            const emuStatus = await emu.status();
        }
        console.log("Done");
    }
    if (target === "freebsd") {
        const cmd = ["nasm", "-f", "elf64", "-w-db-empty", basename + ".asm"];
        console.log(cmd.join(" "));
        const nasm = Deno.run({ cmd });
        const nasmStatus = await nasm.status();
        if (nasmStatus.success === false) {
            console.log("ERROR: nasm returned an error " + nasmStatus.code);
            exit();
        }
        //const ld = Deno.run({ cmd: ["ld", "-m", "elf_amd64_fbsd", "-o", basename, "-s", basename + ".o"] });
        const ld = Deno.run({ cmd: ["ld", "-m", "elf_amd64_fbsd", "-o", basename, basename + ".o"] });
        const ldStatus = await ld.status();
        if (ldStatus.success === false) {
            console.log("ERROR: ld returned an error " + ldStatus.code);
            exit();
        }
        if (action === "run") {
            Deno.run({ cmd: ["./" + basename] });
            const runStatus = await nasm.status();
            if (runStatus.success === false) {
                console.log(`ERROR: ${basename} returned an error ${runStatus.code}`);
                exit();
            }
        }
    }
}

await main();

