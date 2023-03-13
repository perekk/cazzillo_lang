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
    ADDR,
    STR_JOIN,
    STR_LEN,
    HEAP,
    PROG,
    INC,
    DEFINE,
    STRUCT,
    NEW,
    RECORD,
    TOKEN_COUNT,
}

type ValueTypeUser = ["usertype", string]
type ValueType = "number" | "byte" | "string" | "bool" | "void" | "addr" | "symbol" | "record" | ValueTypeUser;

function sizeForValueType(context: Context, t: ValueType): number {
    switch (t) {
        case "addr": return 2;
        case "bool": return 1;
        case "byte": return 1;
        case "number": return 2;
        case "string": return 4;
        case "symbol": return 0;
        case "void": return 0;
        default: {
            const typeName = t[1];
            const structDef = getWordDefinition(context, typeName);
            if (structDef === undefined || structDef.type !== "struct") {
                logError(context.element!.loc, `getting the size of struct, can't find struct ${typeName}`);
                Deno.exit(1);
            }
            return structDef.size;
        }
    }
}

function humanReadableToken(t: TokenType | undefined): string {
    if (t === undefined) return "undefined";
    console.assert(TokenType.TOKEN_COUNT === 43, "Exaustive token types count");
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
        case TokenType.ADDR: return "ADDR";
        case TokenType.STR_JOIN: return "STR_JOIN";
        case TokenType.HEAP: return "HEAP";
        case TokenType.STR_LEN: return "STR_LEN";
        case TokenType.PROG: return "PROG";
        case TokenType.INC: return "INC";
        case TokenType.DEFINE: return "DEFINE";
        case TokenType.STRUCT: return "STRUCT";
        case TokenType.NEW: return "NEW";
        case TokenType.RECORD: return "RECORD";
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
            return t[1];
    }

}

function getFunctionSignature(token: Token): string {
    const ins = token.ins === undefined ? "?" : token.ins.map(t => humanReadableType(t)).join(",");    
    const out = humanReadableType(token.out);
    return `(${ins})=>${out}`;
}

function humanReadableFunction(token: Token): string {
    return token.txt + ":" + getFunctionSignature(token);
}

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
};

enum InstructionPosition {
    PREFIX,
    INFIX,
    POSTFIX,
}

type VarDefinitionBase = {
    token: Token,
    position: InstructionPosition,
    priority?: number,
    out: ValueType,
    offset: number | undefined,
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
    elements: Array<{ name: string, size: number, offset: number, type: ValueType }>,
    position: InstructionPosition.PREFIX,
}

type VarDefinitionSpec = VarDefinitionValue | VarDefinitionFunction | VarDefinitionStruct;

const macros: Record<string, Token> = {};

type Context = {
    element: Token | undefined,
    varsDefinition: Record<string, VarDefinitionSpec>,
    parent: Context | undefined,
    size: number,
}

function getArity(token: Token): number {
    if (token.type === TokenType.WORD) {
        const varDef = getWordDefinition(token.context, token.txt);
        if (varDef === undefined) {
            logError(token.loc, `Unnkown word '${token.txt}'`);
            Deno.exit(1);
        }
        //return varDef.type === "function" ? varDef.ins.length : varDef.type === "struct" ? 1 : 0;
        return varDef.ins.length;
    }
    if (token.ins !== undefined) return token.ins.length;
    const expectedArity = vocabulary[token.type]?.expectedArity;
    if (expectedArity !== undefined) return expectedArity;
    logError(token.loc, `cannot determine the expected arity for word '${token.txt}'`);
    Deno.exit(1);
}

function getInputParametersValue(token: Token): ValueType[] {
    if (token.type === TokenType.WORD) {
        const varDef = getWordDefinition(token.context, token.txt);
        if (varDef === undefined) {
            logError(token.loc, `Unnkown word '${token.txt}'`);
            Deno.exit(1);
        }
        return varDef.ins;
    }

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
    generateAsm: (ast: Token) => Assembly,
    generatePreludeAsm?: (ast: Token) => Assembly,
    generateChildPreludeAsm?: (ast: Token, childIndex: number) => Assembly | undefined,
    preprocessTokens?: (ast: AST) => void,
};

type Vocabulary = Record<number, Instruction>;

type AST = Token[];

type Assembly = Array<string>;

function sizeOfContext(context: Context): number {
    let size = 0;
    Object.values(context.varsDefinition).forEach(varDef => {
        if (typeof varDef.internalType === "string") {
            size += sizeForValueType(context, varDef.internalType);
        } else {
            size += 2;
        }
        
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

function getAsmForSetWordGlobal(token: Token, varType: ValueType, varName: string): Assembly {

    const asmVarName = "V_" + varName;
    switch (varType) {
        case "bool":
            return [
                `JSR POP16`,
                `LDA STACKACCESS`,
                `STA ${asmVarName}`,
            ];
        case "number":
            return [
                `JSR POP16`,
                `LDA STACKACCESS`,
                `STA ${asmVarName}`,
                `LDA STACKACCESS + 1`,
                `STA ${asmVarName} + 1`,
            ];
        case "byte":
            return [
                `JSR POP16`,
                `LDA STACKACCESS`,
                `STA ${asmVarName}`,
            ];
        case "string":
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
        case "addr":
            return [
                `JSR POP16`,
                `LDA STACKACCESS`,
                `STA ${asmVarName}`,
                `LDA STACKACCESS + 1`,
                `STA ${asmVarName} + 1`,
            ];
        default:
            return [
                `JSR POP16`,
                `LDA STACKACCESS`,
                `STA ${asmVarName}`,
                `LDA STACKACCESS + 1`,
                `STA ${asmVarName} + 1`,
            ];
            //logError(token.loc, `cannot compile asm to retrieve value for '${token.txt}' of '${humanReadableType(varType)}' type`);
            //Deno.exit(1);
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

    switch (varType) {
        case "number":
            return popAndOffsetStack.concat([
                "LDA STACKACCESS",
                "STA $0100,X",
                "LDA STACKACCESS + 1",
                "STA $0101,X"
            ]);
        case "string":
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
        case "byte":
            return popAndOffsetStack.concat([
                "LDA STACKACCESS",
                "STA $0100,X",
            ]);
        case "bool":
            return popAndOffsetStack.concat([
                "LDA STACKACCESS",
                "STA $0100,X",
            ]);
        case "addr":
            return popAndOffsetStack.concat([
                "LDA STACKACCESS",
                "STA $0100,X",
                "LDA STACKACCESS + 1",
                "STA $0101,X"
            ]);
        default:
            return popAndOffsetStack.concat([
                "LDA STACKACCESS",
                "STA $0100,X",
                "LDA STACKACCESS + 1",
                "STA $0101,X"
            ]);
    }
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
            Deno.exit(1);            
        default:
            return [
                `LDA ${asmVarName}`,
                `STA STACKACCESS`,
                `LDA ${asmVarName} + 1`,
                `STA STACKACCESS + 1`,
                `JSR PUSH16`
            ];

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

    switch (varType) {
        case "number":
            return asmOffset.concat([
                "LDA $0100,X",
                "STA STACKACCESS",
                "LDA $0101,X",
                "STA STACKACCESS + 1",
                "JSR PUSH16"
            ]);            
        case "string":
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
        case "byte":
            return asmOffset.concat([
                "LDA $0100,X",
                "STA STACKACCESS",
                "LDA #0",
                "STA STACKACCESS + 1",
                "JSR PUSH16"
            ]);
        case "bool":
            return asmOffset.concat([
                "LDA $0100,X",
                "STA STACKACCESS",
                "LDA #0",
                "STA STACKACCESS + 1",
                "JSR PUSH16"
            ]);
        case "addr":
            return asmOffset.concat([
                "LDA $0100,X",
                `STA CALL_FUN_@ + 1`,
                "LDA $0101,X",
                `STA CALL_FUN_@ + 2`,
                "CALL_FUN_@:",
                `JSR $1111 ; will be overwritten`
            ]);
        default:
            return asmOffset.concat([
                "LDA $0100,X",
                "STA STACKACCESS",
                "LDA $0101,X",
                "STA STACKACCESS + 1",
                "JSR PUSH16",
            ]);
    }
}

function getReturnTypeOfAWord(token: Token): ValueType {
    if (token.out === undefined) {
        logError(token.loc, `the type of word '${token.txt}' is undefined`);
        dumpAst(astProgram);
        Deno.exit(1);
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
            Deno.exit(1);
        }
    } else {
        if (token.childs.length !== spec.length) {
            logError(token.loc, `'${token.txt}' is supposed to have ${spec.length} parameters, got ${token.childs.length}`);
            dumpAst(token);
            Deno.exit(1);
        }

        for (let i = 0; i < spec.length; i++) {
            if (spec[i] !== "any" && getReturnTypeOfAWord(token.childs[i]) !== spec[i]) {
                const strParams = spec.map(t => t === "any" ? "Any Type" : humanReadableType(t)).join(", ");
                const typeExpected = spec[i];
                const strParamType = humanReadableType(getReturnTypeOfAWord(token.childs[i]));
                const strExpectedParamType = typeExpected === "any" ? "Any Type" : humanReadableType(typeExpected);
                logError(token.childs[i].loc, `'${token.txt}' expects ${strParams} as parameters, but ${token.childs[i].txt} is a ${strParamType} (should be ${strExpectedParamType})`);
                dumpAst(token);
                Deno.exit(1);
            }
        }

    }

}

function createVocabulary(): Vocabulary {
    console.assert(TokenType.TOKEN_COUNT === 43, "Exaustive token types count");
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
                Deno.exit(1);
            }
            return [valueType];
        },
        out: () => "void",
        generateAsm: (token) => {            
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType === "number") {
                return [
                    "JSR POP16",
                    "JSR PRINT_INT",
                    "LDA #13",
                    "JSR $FFD2",
                ];
            } else if (valueType === "byte") {
                return [
                    "JSR POP16",
                    "LDA #0",
                    "STA STACKACCESS + 1",
                    "JSR PRINT_INT",
                    "LDA #13",
                    "JSR $FFD2",
                ];
            } else if (valueType === "string") {
                return [
                    "JSR PRINT_STRING",
                    "LDA #13",
                    "JSR $FFD2",
                ];
            } else if (valueType === "bool") {
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
            } else if (valueType === "addr") {
                return [
                    "; print addr ?",
                    "JSR POP16",
                    "JSR PRINT_INT",
                    "LDA #13",
                    "JSR $FFD2",
                ];
            } else if (valueType === "void" || valueType === "symbol" || valueType === "record") {
                logError(token.loc, `print of ${humanReadableType(valueType)} is not supported yet`)
                Deno.exit(1);
            } else {
                const structName = valueType[1];
                const structDef = getWordDefinition(token.context, structName);
                if (structDef === undefined) {
                    logError(token.loc, `Cannot find definition for '${token.txt}'`);
                    Deno.exit(1);
                }
                if (structDef.type !== "struct") {
                    logError(token.loc, `'${token.txt}' is not a struct`);
                    Deno.exit(1);
                }
                let ret: string[] = [
                    "JSR POP16",
                ];
                for (let i = 0; i < structDef.elements.length; i++) {
                    const element = structDef.elements[i];
                    if (i > 0) {
                        const previousElement = structDef.elements[i - 1];
                        ret = ret.concat([
                            // in stackaccess the pointer to the field in the record
                            "CLC",
                            "LDA STACKACCESS",
                            `ADC #${previousElement.size}`,
                            "STA STACKACCESS",
                            "LDA STACKACCESS+1",
                            `ADC #0`,
                            "STA STACKACCESS+1",
                        ])
                    }
                    if (element.type === "number") {
                        ret = ret.concat([
                            "JSR PUSH16",
                            // save address in aux
                            "LDA STACKACCESS",
                            "STA AUX",
                            "LDA STACKACCESS+1",
                            "STA AUX+1",

                            // load in stackaccess the value pointed by aux
                            "LDY #0",
                            "LDA (AUX),Y",
                            "STA STACKACCESS",
                            "INY",
                            "LDA (AUX),Y",
                            "STA STACKACCESS+1",

                            "JSR PRINT_INT",
                            "LDA #13",
                            "JSR $FFD2",

                            // get the address back
                            "JSR POP16",
                        ]);
                    } else if (element.type === "string") {
                        ret = ret.concat([
                            "JSR PUSH16",
                            "PRINT_COMPONENT_STRING_@:",
                            // save address in aux
                            "LDA STACKACCESS",
                            "STA AUX",
                            "LDA STACKACCESS+1",
                            "STA AUX+1",

                            // push len                            
                            "LDY #0",
                            "LDA (AUX),Y",
                            "STA STACKACCESS",
                            "INY",
                            "LDA (AUX),Y",
                            "STA STACKACCESS+1",
                            "JSR PUSH16",

                            //push address
                            "INY",
                            "LDA (AUX),Y",
                            "STA STACKACCESS",
                            "INY",
                            "LDA (AUX),Y",
                            "STA STACKACCESS+1",
                            "JSR PUSH16",


                            "JSR PRINT_STRING",
                            "LDA #13",
                            "JSR $FFD2",

                            // get the address back
                            "JSR POP16",

                        ]);
                    } else {
                        logError(token.loc, `'${token.txt}' the printing of ${humanReadableType(element.type)} in a record is not implemented yet`);
                        Deno.exit(1);
                    }
                }
                return ret;
            }
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
                Deno.exit(1);
            }
            return [valueType]
        },
        out: () => "void",
        generateAsm: token => {            
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType === "number") {
                return [
                    "JSR POP16",
                    "JSR PRINT_INT",
                ];
            } else if (valueType === "byte") {
                return [
                    "JSR POP16",
                    "LDA #0",
                    "STA STACKACCESS + 1",
                    "JSR PRINT_INT",
                ];
            } else if (valueType === "string") {
                return [
                    "JSR PRINT_STRING",
                ];
            } else if (valueType === "bool") {
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
            } else if (valueType === "addr") {
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
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: () => ["byte"],
        out: () => "void",        
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
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: (token) => [],
        out: () => "void",
        generateAsm: () => [
            "LDA #13",
            "JSR $FFD2",
        ],
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
        generateAsm: token => {
            console.assert(token.childs.length === 2, "The childs of a plus operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if (type1 === "byte" && type2 === "byte") {
                return [
                    "LDX SP16",
                    "CLC",
                    "LDA STACKBASE + 3,X",
                    "ADC STACKBASE + 1,X",
                    "STA STACKBASE + 3,X",
                    "INX",
                    "INX",
                    "STX SP16",
                ];
            }

            return ["JSR ADD16"];

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
        generateAsm: (token) => [
            "JSR SUB16"
        ]
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
        generateAsm: (token) => [
            "JSR MUL16"
        ]
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
        generateAsm: (token) => [
            "JSR DIV16"
        ]
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
        generateAsm: (token) => [
            "JSR MOD16"
        ]
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
        generateAsm: (token) => {
            const valueType = getReturnTypeOfAWord(token.childs[0]);
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
                logError(token.loc, `value type for 'not' is ${humanReadableType(valueType)} compiler error`);
                Deno.exit(1);
            }


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
        generateAsm: token => {
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
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
                    "INX",
                    "INX",
                    "STA STACKBASE + 1,X",
                    "LDA #00",
                    "STA STACKBASE + 2,X",
                    "STX SP16",
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
                "INX",
                "INX",
                "STA STACKBASE + 1,X",
                "LDA #00",
                "STA STACKBASE + 2,X",
                "STX SP16",
            ]
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
        generateAsm: (token) => {
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
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
                    "INX",
                    "INX",
                    "STA STACKBASE + 1,X",
                    "LDA #00",
                    "STA STACKBASE + 2,X",
                    "STX SP16",
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
                    "INX",
                    "INX",
                    "STA STACKBASE + 1,X",
                    "LDA #00",
                    "STA STACKBASE + 2,X",
                    "STX SP16",
                ]
            }
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
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: () => ["bool", "void"],
        out: () => "void",
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
            return ["bool", typeThen, typeElse];
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
        ins: token => {
            const childNumber = token.childs.length;
            if (childNumber === 0) return [];
            //return new Array(childNumber).fill("void");
            return token.childs.map((child, index) => index === childNumber - 1 ? getReturnTypeOfAWord(child) : "void");
        },
        out: token => {
            if (token.childs.length === 0) return "void";
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
        generatePreludeAsm: token => {
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
                sizeToReserve += sizeForValueType(token.context, valueType);
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
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: true,
        ins: getParametersRequestedByBlock,
        out: getReturnValueByBlock,
        generatePreludeAsm: token => {
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
                if (typeof valueType === "string") {
                    sizeToReserve += sizeForValueType(token.context, valueType);
                } else {
                    // user types in stack are always 2 byte
                    sizeToReserve += 2;
                }

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
                Deno.exit(1);
            }
            if (valueType === "void") {
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
        out: () => "void",
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
                Deno.exit(1);
            }
            if (valueType === "void") {
                logError(token.loc, `can't store 'void' values in variables`);
                Deno.exit(1);
            }
            return [valueType];
        },
        out: () => "void",
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
        grabFromStack: false,
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

            if (varDef.type === "struct") {
                return [
                    "; no asm for constructor"
                ];
            }

            const valueType = varDef.out;
            if (valueType === undefined) {
                logError(token.loc, `cannot determine the result type of function '${varName}', compiler error`);
                Deno.exit(1);
            }

            if (varDef.isGlobalContext) return getAsmForGetWordGlobal(token, valueType, varName, varDef.type === "function");

            if (varDef.offset === undefined) {
                logError(token.loc, `WORD generateAsm can't compute the offset of '${varName}' onto the stack, compiler error`);
                Deno.exit(1);
            }
            return getAsmForGetWordLocal(token, valueType, varName, varDef.offset, varDef.type === "function");
        },
        // preprocessTokens: ast => {
        //     const varName = ast[0].txt;
        //     const varDef = getWordDefinition(ast[0].context, varName);
        //     if (varDef?.type === "struct") {
        //         if (ast.length < 2) {
        //             logError(ast[0].loc, `'${ast[0].txt}' expects a block, but none found`);
        //             Deno.exit(1);
        //         }
        //         if (ast[1].type === TokenType.BLOCK) {
        //             ast[1].type = TokenType.RECORD;
        //         }
        //     }
        // }

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
        ]
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
        grabFromStack: false,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: token => {
            assertChildNumber(token, 1);
            const type = getReturnTypeOfAWord(token.childs[0]);
            if (type === "addr" || type === "string" || type === "symbol" || type === "void") {
                logError(token.loc, `expected Number, Byte or Boolean, but '${token.txt}' returns a ${humanReadableType(type)}`);
                Deno.exit(1);
            }
            return [type];
        },
        out: () => "byte",
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
            return [
                "; DO NOTHING"
            ]
        }
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
        generateAsm: () => []
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
        grabFromStack: true,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: () => [],
        out: () => "bool",
        generateAsm: () => [
            // "LDA #0",
            // "STA STACKACCESS",
            // "STA STACKACCESS+1",
            // "JSR PUSH16",
            "; DO NOTHING"
        ]
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
            if (typeof token.childs[0].out === "string") {
                logError(token.childs[0].loc, `the return type of '${token.childs[0].txt}' is ${humanReadableType(token.childs[0].out)} but it should be a struct type`);
                Deno.exit(1);
            }
            if (token.childs[0].out === undefined) {
                logError(token.childs[0].loc, `the return type of '${token.childs[0].txt}' is undefined`);
                Deno.exit(1);
            }
            return [token.childs[0].out];
        },
        out: () => "number",
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
        grabFromStack: false,
        position: InstructionPosition.INFIX,
        priority: 100,
        userFunction: false,
        ins: () => ["string", "string"],
        out: () => "string",
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
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: () => [],
        out: () => "number",
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
        grabFromStack: false,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: () => ["string"],
        out: () => "byte",
        generateAsm: () => [
            "JSR POP16",
        ]
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
                Deno.exit(1);
            }
            return valueType;
        },
        generateAsm: token => {
            const lib = [
                "RTS",
                "BCD DS 3 ; USED IN BIN TO BCD",
                "HEAPSAVE DS 3 ; USED IN COPYSTRING",
                "AUXMUL DS 2",
                "HEAPTOP DS 2",
                "TEST_UPPER_BIT: BYTE $80",
                "AUX = $7D",
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
            if (token.context !== undefined) {
                for (let i = 0; i < Object.entries(token.context.varsDefinition).length; i++) {
                    const [name, varDef] = Object.entries(token.context.varsDefinition)[i];
                    const variableName = "V_" + name;
                    const size = sizeForValueType(token.context, varDef.internalType);
                    vars.push(`${variableName} DS ${size}`);
                }
            }

            const heap = [
                "HEAPSTART:",
            ]

            return lib.concat(literalStrings).concat(vars).concat(heap);
        },
        generatePreludeAsm: () => [
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
        ],


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
                Deno.exit(1);
            }
            const wordDef = getWordDefinition(token.context, child.txt);
            if (wordDef === undefined) {
                logError(child.loc, `unknown word '${child.txt}'`);
                Deno.exit(1);
            }
            if (wordDef.internalType !== "number" && wordDef.internalType !== "byte") {
                logError(child.loc, `'INC' expects a word of type 'number' or 'byte', but word '${child.txt}' has type '${humanReadableType(wordDef.internalType)}'`);
                Deno.exit(1);
            }
            return [wordDef.internalType];
        },
        out: () => "void",
        generateChildPreludeAsm: () => { return undefined }, // no child generation asm
        generateAsm: token => {
            assertChildNumber(token, 1);
            const child = token.childs[0]
            const varName = child.txt;
            const varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(child.loc, `INC generateAsm cannot find declaration for '${varName}', compiler error`);
                Deno.exit(1);
            }
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
                Deno.exit(1);
            }

            if (varDef.internalType === "byte") {
                return [
                    "TSX",
                    "TXA",
                    "CLC",
                    `ADC #${varDef.offset + 1}`,
                    "TAX",
                    "INC $0100,X"
                ];
            }
            return [
                "TSX",
                "TXA",
                "CLC",
                `ADC #${varDef.offset + 1}`,
                "TAX",
                "INC $0100,X",
                "BNE not_carry_@",
                `INC $0101,X`,
                `not_carry_@:`,
            ]

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
                Deno.exit(1);
            }
            if (valueType === "void") {
                logError(secondChild.loc, `'${secondChild.txt}' produce void value, can't define 'void' values`);
                Deno.exit(1);
            }

            return ["symbol", valueType];
        },
        out: () => "void",
        generateChildPreludeAsm: (token, n) => {
            if (n === 0) return undefined;
            return [];
        },
        generateAsm: () => {

            return [];
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
                Deno.exit(1);
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
        ins: token => {
            // assertChildNumber(token, ["symbol", "record"]);            

            // if (token.childs[0].type !== TokenType.WORD) {
            //     logError(token.loc, `'${token.txt}' expects a block`);
            //     Deno.exit(1);
            // }            

            // if (token.childs[1].type !== TokenType.RECORD) {
            //     logError(token.childs[1].loc, `the second argument '${token.txt}' expects a record`);
            //     Deno.exit(1);
            // }
            return ["symbol", "record"];
        },
        out: token => {
            const structName = token.childs[0].txt;
            return ["usertype", structName];
        },
        generateAsm: token => {
            const strucName = token.txt;

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
            const childNumber = token.childs.length;
            if (childNumber === 0) return [];
            //return new Array(childNumber).fill("void");
            return token.childs.map(() => "void");
        },
        out: () => "record",
        generateAsm: token => {
            if (token.context === undefined) {
                logError(token.loc, `can't find context for ${token.txt}, compiler error`);
                Deno.exit(1);
            }
            if (token.context.parent === undefined) return []; // the global context

            let sizeToRelease = sizeOfContext(token.context);
            if (sizeToRelease === 0) return ["; no stack memory to release"];
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
                "TSX",
                "INX",
                "STX FROMADD+1",
                "LDA #01",
                "STA FROMADD+2",
                `LDY #${sizeToRelease}`,
                "JSR COPYMEM",
                "CLC",
                "LDA HEAPTOP",
                `ADC #<${sizeToRelease}`,
                "STA HEAPTOP",
                "LDA HEAPTOP+1",
                `ADC #0`,
                "STA HEAPTOP+1",
                `; release ${sizeToRelease} on the stack`,
                "TSX",
                "TXA",
                "CLC",
                `ADC #${sizeToRelease}`,
                "TAX",
                "TXS"
            ];
        },
        generatePreludeAsm: token => {
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
                sizeToReserve += sizeForValueType(token.context, valueType);
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

    if (txt.match(/^-?\d+$/)) return { type: TokenType.LITERAL, literalType: "number" };
    if (txt[0] === '"' && txt[txt.length - 1] === '"') return { type: TokenType.LITERAL, literalType: "string" };
    if (txt[0] === "'" && txt[txt.length - 1] === "'") return { type: TokenType.LITERAL, literalType: "symbol" };
    if (txt[txt.length - 1] === ":") return { type: TokenType.SET_WORD, literalType: undefined };
    if (txt[0] === "'") return { type: TokenType.LIT_WORD, literalType: undefined };
    if (txt === "true" || txt === "false") return { type: TokenType.LITERAL, literalType: "bool" };

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
        const token = identifyToken(vocabulary, tokenText);
        if (token === undefined) {
            logError(loc, `unknown token '${tokenText}'`);
            Deno.exit(1);
        }
        if (token.type === TokenType.LITERAL && (token.literalType === "string" || token.literalType === "symbol")) {
            tokenText = tokenText.substring(1, tokenText.length - 1);
        } else if (token.type === TokenType.SET_WORD) {
            tokenText = tokenText.substring(0, tokenText.length - 1);
        } else if (token.type === TokenType.LIT_WORD) {
            tokenText = tokenText.substring(1);
        }
        ret.push({ type: token.type, txt: tokenText, loc, internalValueType: token.literalType, childs: [] });
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
            } else if (char === ";") {
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

function preprocess(program: AST): AST {

    const defines: Record<string, AST> = {};

    for (let i = 0; i < program.length; i++) {
        const token = program[i];
        if (token.type === TokenType.DEFINE) {
            if (i + 2 >= program.length) {
                logError(token.loc, `Definition not complete`);
                Deno.exit(1);
            }

            const name = program[i + 1];
            if (name.type !== TokenType.WORD) {
                logError(name.loc, `definition started, but '${name.txt}' is not a word!`);
                Deno.exit(1);
            }

            const value = program[i + 2];
            if (value.type !== TokenType.OPEN_BRACKETS && value.type !== TokenType.OPEN_REF_BRACKETS) {
                defines[name.txt] = [value];
                program.splice(i, 3);
                console.log("DEFINE", name.txt, "=", defines[name.txt].map(t => t.txt).join(" "));
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
                        if (program[index].type === TokenType.WORD && program[index].txt in defines) {
                            program.splice(index, 1, ...defines[program[index].txt]);
                        }
                    }
                    index++;
                }

                if (parens > 0) {
                    logError(program[i + 2].loc, `paren not closed`);
                    Deno.exit(1);
                }
                defines[name.txt] = program.slice(i + 3, index);

                console.log("DEFINE", name.txt, "=", defines[name.txt].map(t => t.txt).join(" "));

                program.splice(i, defines[name.txt].length + 4);
                i = i - 1;
            }

        } else {
            if (token.type === TokenType.WORD && token.txt in defines) {
                program.splice(i, 1, ...defines[token.txt]);
            }
        }
    }

    return program;

}

function groupFunctionToken(ast: AST, index: number): Token {
    const functionElement = ast[index];    
    const functionPosition = getInstructionPosition(functionElement);
    const arity = getArity(functionElement);

    let childs: AST;
    let startPos: number;
    if (functionPosition === InstructionPosition.INFIX) {
        if (index + 1 > ast.length - 1) {
            logError(functionElement.loc, `the operator ${functionElement.txt} expects 2 parameters, but got one!`);
            Deno.exit(1);
        }        
        const secondParameterArity = getArity(ast[index + 1]);
        if (secondParameterArity > 0 && ast[index + 1].childs.length !== secondParameterArity) {
            groupFunctionToken(ast, index + 1);
        }
        childs = [ast[index - 1], ast[index + 1]];
        if (childs[0] === undefined) {
            logError(functionElement.loc, `operator '${functionElement.txt}' does not have a left parameters`);
            Deno.exit(1);
        }
        if (childs[1] === undefined) {
            logError(functionElement.loc, `operator '${functionElement.txt}' does not have a right parameters`);
            Deno.exit(1);
        }

        startPos = index - 1;
    } else if (functionPosition === InstructionPosition.POSTFIX) {
        childs = [ast[index - 1]];
        if (childs[0] === undefined) {
            logError(functionElement.loc, `postfix operator '${humanReadableFunction(functionElement)}' does not have a left parameters`);
            Deno.exit(1);
        }
        startPos = index - 1;
    } else {        
        childs = ast.slice(index + 1, index + 1 + arity);
        if (childs.length !== arity) {            
            logError(functionElement.loc, `the word ${humanReadableFunction(functionElement)} expects ${arity} parameters, but got only ${childs.length}!`);
            dumpAst(functionElement);
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


    let ins: ValueType[] = [];

    // let's search for something like ['x Number 'y Number] where Number accepts a value but does not have child
    ins = block.childs
        .filter(
            child => {
                if (child.type !== TokenType.LIT_WORD) return false;
                if (child.childs.length !== 1) return false;
                const varDef = getWordDefinition(block.context, child.childs[0].txt);
                const isAStructName = varDef?.type === "struct";
                if (!child.childs[0].grabFromStack && !isAStructName) return false;
                if (child.childs[0].out === undefined) return false;
                return true;
            } 
        ).map(child => child.childs[0].out!);

    return ins;

}

function getReturnValueByBlock(block: Token) {

    if (block.type !== TokenType.BLOCK && block.type !== TokenType.REF_BLOCK && block.type !== TokenType.PROG && block.type !== TokenType.RECORD) {        
        logError(block.loc, `the token '${block.txt}' is not a BLOCK or REF_BLOCK or PROG!`);
        Deno.exit(1);
    }
    const lastChild = block.childs.at(-1);
    if (lastChild === undefined) return "void";

    const lastChildType = lastChild.out;
    if (lastChildType === undefined) {
        logError(lastChild.loc, `the return type of '${lastChild.txt}' is undefined`);
        Deno.exit(1);
    }
    return lastChildType;
}

function typeCheckBlock(block: Token) {

    if (block.type !== TokenType.BLOCK && block.type !== TokenType.REF_BLOCK && block.type !== TokenType.PROG && block.type !== TokenType.RECORD) {
        logError(block.loc, `the token '${block.txt}' is not a BLOCK or REF_BLOCK or PROG!`);
        Deno.exit(1);
    }

    for (let i = 0; i < block.childs.length - 1; i++) {
        if (block.childs[i].out !== "void") {
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

    block.ins = [];
    block.expectedArity = ins.length;
    block.out = getReturnValueByBlock(block);
    block.expectedArityOut = block.out === "void" ? 0 : 1;

}

/*
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
*/

function optimize(token: Token) {
    switch (token.type) {
        case TokenType.PLUS:
            if (token.childs[0].type === TokenType.LITERAL && token.childs[1].type === TokenType.LITERAL) {
                const result = (parseInt(token.childs[0].txt, 10) + parseInt(token.childs[1].txt, 10)) & 65535;
                token.type = TokenType.LITERAL;
                token.txt = String(result);
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
                const result = (parseInt(token.childs[0].txt, 10) - parseInt(token.childs[1].txt, 10)) & 65535;
                token.type = TokenType.LITERAL;
                token.txt = String(result);
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

                const result = parseInt(token.childs[1].txt, 10) !== 0 ? (parseInt(token.childs[0].txt, 10) / parseInt(token.childs[1].txt, 10)) & 65535 : 65535;
                token.type = TokenType.LITERAL;
                token.txt = String(result);
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
                const result = (parseInt(token.childs[0].txt, 10) * parseInt(token.childs[1].txt, 10)) & 65535;
                token.type = TokenType.LITERAL;
                token.txt = String(result);
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
    if (typeof t1 !== typeof t2) return false;
    if (typeof t1 === "string") return t1 === t2;
    return t1[1] === t2[1];
}

function typeCheck(token: Token) {

    // if some of the childs has no childs we shuld typecheck them because 
    // they could be a function with lower priority not grouped and checked yet    
    for (let i = 0; i < token.childs.length; i++) {
        const child = token.childs[i];
        if (child.childs.length === 0) typeCheck(child);
    }

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
    if (token.type === TokenType.BLOCK || token.type === TokenType.REF_BLOCK || token.type === TokenType.RECORD) {
        // in block the number of ins is not the number of childs
    } else {
        if (arity !== token.childs.length) {
            logError(token.loc, `the word '${token.txt}' expects ${arity} parameters, but got ${token.childs.length}`);
            dumpAst(token);
            Deno.exit(1);
        }
    }

    const ins = getInputParametersValue(token);
    for (let i = 0; i < ins.length; i++) {
        if (!areTypesEqual(ins[i], getReturnTypeOfAWord(token.childs[i]))) {
            logError(token.childs[i].loc, `the word '${token.txt}' expects parameter in position ${i + 1} to be ${humanReadableType(ins[i])}, but it is ${humanReadableType(token.childs[i].out)}`);
            dumpAst(token);
            Deno.exit(1);
        }
    }

    if (token.type === TokenType.NEW) {
        assertChildNumber(token, 2);
        const childName = token.childs[0];
        const varDef = getWordDefinition(token.context, childName.txt);
        if (varDef?.type === "struct") {
            varDef.elements;
            const childRecord = token.childs[1];
            if (childRecord.context === undefined) {
                logError(childRecord.loc, `'${childRecord.txt}' does not have a context`);
                Deno.exit(1);
            }
            const recordEntries = Object.entries(childRecord.context.varsDefinition).map(([name, varDef]) => { return { name, type: varDef.out, token: varDef.token } });

            if (varDef.elements.length < recordEntries.length) {
                const unwantedWord = recordEntries[varDef.elements.length];
                logError(unwantedWord.token.loc, `'${unwantedWord.name}' is not part of '${token.txt}' struct`);
                Deno.exit(1);
            }

            if (varDef.elements.length > recordEntries.length) {
                const neededWord = varDef.elements[recordEntries.length];
                logError(childRecord.loc, `'${neededWord.name}' should be in '${token.txt}' struct`);
                Deno.exit(1);
            }

            for (let i = 0; i < varDef.elements.length; i++) {
                const structDef = varDef.elements[i];
                const recordDef = recordEntries[i];
                if (structDef.name !== recordDef.name) {
                    logError(recordDef.token.loc, `the word at position ${i + 1} should be '${structDef.name}' but it is '${recordDef.name}'`);
                    Deno.exit(1);
                }
                if (structDef.type !== recordDef.type) {
                    logError(recordDef.token.loc, `'${recordDef.name}' should be ${humanReadableType(structDef.type)} but it is ${humanReadableType(recordDef.type)}`);
                    Deno.exit(1);
                }
            }


        }
    } // end check struct



}

function setWordDefinition(token: Token) {

    if (token.type !== TokenType.LIT_WORD) {
        logError(token.loc, `'${token.txt}' is not a 'LIT WORD'`);
        Deno.exit(1);
    }

    if (token.context === undefined) {
        logError(token.loc, `The token '${token.txt}' does not have a context`);
        Deno.exit(1);
    }

    assertChildNumber(token, 1);

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
    const ins = isUserFunction ? getParametersRequestedByBlock(token.childs[0]) : [];    
    if (isUserFunction) {
        token.context.varsDefinition[token.txt] = {
            type: "function",
            ins,
            out: child.out,
            token,
            position: InstructionPosition.PREFIX,
            priority: child.priority,
            internalType: "addr",
            offset: undefined,
        };
        token.context.size += sizeForValueType(token.context, "addr");
    } else {
        // if (child.internalValueType === undefined) {
        //     logError(child.loc, `the internal type of '${child.txt}' is undefined`);
        //     Deno.exit(1);
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
        };
        token.context.size += sizeForValueType(token.context, child.out);
    }

}

function setStructDefinition(token: Token) {

    if (token.type !== TokenType.STRUCT) {
        logError(token.loc, `'${token.txt}' is not a 'STRUCT'`);
        Deno.exit(1);
    }

    if (token.context === undefined) {
        logError(token.loc, `The token '${token.txt}' does not have a context`);
        Deno.exit(1);
    }

    assertChildNumber(token, 2);
    if (token.childs[0].internalValueType !== "symbol") {
        logError(token.childs[0].loc, `struct expects the first parameters to be a 'symbol' but '${token.childs[0].txt}' is a ${humanReadableType(token.childs[0].internalValueType)}`);
        Deno.exit(1);
    }
    if (token.childs[1].type !== TokenType.RECORD) {
        logError(token.childs[1].loc, `struct expects the second parameters to be a 'BLOCK' but '${token.childs[1].txt}' is a ${humanReadableToken(token.childs[1].type)}`);
        Deno.exit(1);
    }

    const name = token.childs[0].txt;
    const block = token.childs[1];

    const structDefPresent = getWordDefinition(token.context, name);
    if (structDefPresent !== undefined) {
        const previousToken = structDefPresent.token;
        logError(token.childs[0].loc, `the word '${name}' was already defined`);
        logError(previousToken.loc, `here is the previous definition`);
        Deno.exit(1);
    }

    if (block.context === undefined) {
        logError(block.loc, `The context for the block is undefined`);
        Deno.exit(1);
    }

    let size = 0;
    const elements = [];
    for (const [name, varDef] of Object.entries(block.context.varsDefinition)) {
        const currSize = sizeForValueType(block.context, varDef.internalType);
        elements.push({
            name,
            offset: size,
            size: currSize,
            type: varDef.internalType,
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
        elements
    };
    token.context.varsDefinition[name] = structDef;
    console.log("created struct word " + name);
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
            if (token.type === TokenType.LITERAL) {
                continue;
            }

            if (token.type === TokenType.OPEN_BRACKETS || token.type === TokenType.CLOSE_BRACKETS) {
                logError(token.loc, `found open or closed brackets in parse, compiler error`);
                Deno.exit(1);
            }

            const group = groupFunctionToken(ast, j);
            typeCheck(group);
            optimize(group);
            if (group.type === TokenType.LIT_WORD) {
                setWordDefinition(group);
            } else if (group.type === TokenType.STRUCT) {
                setStructDefinition(group);
            }

            if (token.position !== InstructionPosition.PREFIX) j = j - 1; // we already taken as child the token before this
        }
    }

    return ast;
}

function groupByExpectedArityOutZero(sequence: AST) {

    let childLeft = 0;
    let lastPointer = 0;
    let startingNewSequence = true;
    for (let j = 0; j < sequence.length; j++) {
        const token = sequence[j];
        changeTokenTypeOnContext(vocabulary, sequence.slice(j));
        let ins = 0;
        let out = 0;
        if (token.type === TokenType.LITERAL) {
            out = 1;
        } else if (token.type === TokenType.WORD) {
            const varDef = getWordDefinition(token.context, token.txt);
            if (varDef === undefined) {
                logError(token.loc, `unknown word '${token.txt}'`);                
                Deno.exit(1);
            }
            if (childLeft > 0 && varDef.out === "void") {
                logError(token.loc, `expected a value but '${token.txt}' returns 'void' `);
                Deno.exit(1);
            }            
            ins = varDef.ins.length;
            out = (varDef.out === "void" ? 0 : 1);
        } else if (token.type === TokenType.REF_BLOCK || token.type === TokenType.BLOCK || token.type === TokenType.RECORD) {
            const childs = token.childs;
            groupByExpectedArityOutZero(childs);
            //token.childs = childs;
            typeCheckBlock(token);
            // since we just type checked the block the arities must be a number
            //childLeft = childLeft + token.expectedArity! - token.expectedArityOut!;
            out = 1;
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
                    ins = token.expectedArity;
                    out = (childLeft > 0 ? 1 : 0);                    
                } else {
                    if (childLeft > 0 && token.expectedArityOut === 0) {
                        logError(token.loc, `expected a value but '${token.txt}' returns 'void' `);
                        Deno.exit(1);
                    }
                    ins = token.expectedArity;
                    out = token.expectedArityOut;                    
                }

            } else if (token.position === InstructionPosition.INFIX) {
                // 2 in 1 out
                ins = 2;
                out = 1;
            } else if (token.position === InstructionPosition.POSTFIX) {
                // 1 in 1 out
                ins = 1;
                out = 1;
            }
        }

        // at the start of a new sequence, we dont count out values
        childLeft = childLeft + ins - (startingNewSequence ? 0 : out);
        startingNewSequence = false;

        if (childLeft <= 0 || j === sequence.length - 1) {
            childLeft = 0;
            let endOfBlock = true;
            if (j < sequence.length - 1) {
                if (sequence[j + 1].position === InstructionPosition.INFIX || sequence[j + 1].position === InstructionPosition.POSTFIX) {
                    endOfBlock = false;
                } else if (ins > 0) {
                    endOfBlock = false;
                }

            }
            if (endOfBlock) {
                const toParse = sequence.slice(lastPointer, j + 1);
                const numberToParse = toParse.length;
                //dumpSequence(toParse, `from ${lastPointer} to ${j} :`);
                if (toParse.length === 1 && toParse[0].type === TokenType.BLOCK) {
                    // already parsed
                } else {                    
                    parseBlock(toParse);
                }
                sequence.splice(lastPointer, numberToParse, ...toParse);
                j = lastPointer + toParse.length - 1;
                lastPointer = lastPointer + toParse.length;
                startingNewSequence = true;
            }
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

function groupSequence(vocabulary: Vocabulary, program: AST): Token {

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
                const instr = vocabulary[token.type];
                if (instr) {
                    ast.push({
                        loc: token.loc,
                        txt: token.txt,
                        type: token.type,
                        internalValueType: token.internalValueType,
                        expectedArity: instr.expectedArity,
                        expectedArityOut: instr.expectedArityOut,
                        grabFromStack: instr.grabFromStack,
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

function changeTokenTypeOnContext(vocabulary: Vocabulary, ast: AST) {
    if (ast.length === 0) return;
    const instr = vocabulary[ast[0].type];
    if (instr === undefined) return;
    if (instr.preprocessTokens) instr.preprocessTokens(ast);
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

    } else if (ast.out === "bool") {
        ret.push(`; ${ast.loc.row}:${ast.loc.col} BOOL ${ast.txt}`);
        ret.push(`LDA #${ast.txt === "true" ? "1" : "0"}`);
        ret.push(`STA STACKACCESS`);
        ret.push(`LDA #0`);
        ret.push(`STA STACKACCESS+1`);
        ret.push(`JSR PUSH16`);
    } else if (ast.out === "addr") {
        logError(ast.loc, `'Addr' should not be compiled as a value, compiler error`);
        Deno.exit(1);
    } else if (ast.out === "void") {
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
            ret = ret.concat(inst.generatePreludeAsm(ast));
        }
    }

    if (ast.type === TokenType.REF_BLOCK) {
        // reorder the child: first the params in reverse order, then the other childs
        const isParam = (token: Token) => {
            if (token.type !== TokenType.LIT_WORD) return false;
            if (token.childs.length !== 1) return false;
            const varDef = getWordDefinition(token.context, token.childs[0].txt);
            const isAStruct = varDef?.type === "struct";
            if (!token.childs[0].grabFromStack && !isAStruct) return false;
            return true;
        } 
        const params = ast.childs
            .filter(isParam)
            .reverse();
        const nonParams = ast.childs
            .filter(t => !isParam(t));
        ast.childs = params.concat(nonParams);
    }

    for (let i = 0; i < ast.childs.length; i++) {
        let generateAssemblyChild: boolean = true;
        if (inst.generateChildPreludeAsm) {
            const retAsseblyChild = inst.generateChildPreludeAsm(ast, i);
            if (retAsseblyChild !== undefined) {
                ret = ret.concat(retAsseblyChild);
            } else {
                ret = ret.concat([
                    `; no child generation for '${ast.txt}'`
                ]);
                generateAssemblyChild = false;
            }
        }
        if (generateAssemblyChild) ret = ret.concat(compile(vocabulary, ast.childs[i]))
    }

    // lets' compile for real        
    if (ast.type === TokenType.LITERAL) {
        ret = ret.concat(compileLiteral(ast));
    } else {
        ret.push(instructionLabel);
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

function optimizeAsm(asm: Assembly) {
    let lastInstruction = "";
    let lastInstructionIndex = -1;
    for (let i = 0; i < asm.length; i++) {
        const instruction = asm[i];
        if (instruction[0] === ";") continue;
        if (instruction === "JSR POP16" && lastInstruction === "JSR PUSH16") {
            asm[lastInstructionIndex] = "; " + asm[lastInstructionIndex];
            asm[i] = "; " + asm[i];
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
        if (element.type === TokenType.WORD) {
            const varDef = getWordDefinition(element.context, element.txt);
            ins = varDef?.ins;
        } else {
            ins = element.ins;
        }
        const strIns = ins === undefined ? "undefined" : ins.map(type => humanReadableType(type)).join(",")
        const out = humanReadableType(element.out);
        const strType = "(" + strIns + ")=>" + out;
        const strFun = element.isUserFunction ? "USER FUN" : "";
        const contextToken = element.context?.element;
        const contextTokenName = contextToken?.txt ?? "";
        const ctxName = contextTokenName.length > 10 ? "[" + contextTokenName.substring(1, 6) + "...]" : "[" + contextTokenName + "]";
        const ctx = element.context?.parent === undefined ? "global" : ctxName;
        const vars = ""; // getVarsInContext(element.context);
        const parentVars = ""; // getVarsInContext(element.context?.parent);
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
    console.log("    deno run --allow-all cazz.ts <filename>");
    console.log("    NOTE: filename must have .cazz extension");
}

type Target = "c64" | "freebsd";

if (Deno.args.length !== 2) {
    usage();
    Deno.exit(1);
}

if (Deno.args[0] !== "c64" && Deno.args[1] !== "freebsd") {
    console.error(`ERROR: in the first parametere you need to specify the target 'c64' or 'freebsd': ${Deno.args[0]} is not a valid target`);
    usage();
    Deno.exit(1);
}

const target: Target = Deno.args[0] as Target;
const argFilename = Deno.args[1];

const basename = argFilename.substring(0, argFilename.lastIndexOf('.')) || argFilename;
const filename = basename + ".cazz";

console.log("Cazzillo Lang: ", target);

const vocabulary = createVocabulary();
const program = await tokenizer(filename, vocabulary);
preprocess(program);
//dumpProgram(program);

const astProgram = parse(vocabulary, program);
dumpAst(astProgram);
//Deno.exit(1);

const asm = compile(vocabulary, astProgram);
optimizeAsm(asm);
addIndent(asm);
await Deno.writeTextFile(basename + ".asm", asm.join("\n"));

const dasm = Deno.run({ cmd: ["dasm", basename + ".asm", "-o" + basename + ".prg", "-s" + basename + ".sym"] });
const dasmStatus = await dasm.status();
if (dasmStatus.success === false) {
    console.log("ERROR: dasm returned an error " + dasmStatus.code);
    Deno.exit(1);
}

const emu = Deno.run({ opt: { stdout: "null" }, cmd: ["x64", "-silent", basename + ".prg"] });
const emuStatus = await emu.status();

console.log("Done");


