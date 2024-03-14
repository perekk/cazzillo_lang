const RET_STACK_CAPACITY = 640 * 1024;
const CTX_STACK_CAPACITY = 640 * 1024;
const MEM_CAPACITY = 640 * 1024;
const NO_PEEPHOLE_OPT_DIRECTIVE = ";no-peephole-opt";
const CTX_PAGE = 3;
//const CTX_PAGE = 159; // 9F00 - 9FFF last page of basic
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
    LTEQ,
    EQ,
    GT,
    GTEQ,
    AND,
    OR,
    OPEN_BRACKETS,
    OPEN_REF_BRACKETS,
    OPEN_LIT_BRACKETS,
    CLOSE_BRACKETS,
    IF,
    EITHER,
    BLOCK,
    REF_BLOCK,
    ARRAY_BLOCK,
    WORD_BLOCK,
    SET_WORD,
    LIT_WORD,
    WORD,
    WHILE,
    POKE,
    PEEK,
    CAST_BYTE,
    CAST_NUMBER,
    CAST_STRING,
    CAST_WORD,
    CAST_BOOL,
    NUMBER,
    STRING,
    WORD_TYPE,
    BYTE,
    BOOL,
    ADDR,
    STR_JOIN,
    LENGHT,
    STACK,
    PROG,
    INC,    
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
    ASM,
    DEBUG,
    TYPEOF,
    TOKEN_COUNT,
}
enum InstructionPosition {
    PREFIX,
    INFIX,
    POSTFIX,
}

type Target = "c64" | "freebsd" | "sim";
type UserType = ["usertype", string];
type ArrayType = ["array", ValueType];
type AddressType = ["addr", ValueType];
type ValueType = "number" | "byte" | "string" | "bool" | "void" | "addr" | "word" | "record" | UserType | ArrayType | AddressType;
type Location = { row: number, col: number, filename: string };
type Token = {
    type: TokenType
    txt: string,
    sourceTxt: string,
    loc: Location,
    internalValueType?: ValueType,
    context?: Context,
    expectedArity?: number,
    expectedArityOut?: number,
    grabFromStack?: boolean,
    ins?: Array<ValueType>,
    out?: ValueType,
    originalOutType?: ValueType,
    position?: InstructionPosition,
    priority?: number,
    isUserFunction?: boolean,
    functionIndex?: number,
    childs: Token[],
    index?: number,
    parent?: Token | undefined,
    sibling?: Token | undefined,
    auxSimValue?: number | [number, number] | undefined, // used by "either" and "while"
    parameterReversed?: boolean,
    functionSignature?: FunctionSignature,
};

type VarDefinitionBase = {        
    priority: number,
    reference: Token[]
}

type VarDefinitionValue = VarDefinitionBase & {
    type: "value",
    token: Token,
    internalType: ValueType,
    out: ValueType,
    position: InstructionPosition.PREFIX,
}

type FunctionSignature = {
    index: number,
    position: InstructionPosition,
    ins: Array<ValueType>,
    out: ValueType,
    token: Token,
}

type VarDefinitionFunction = VarDefinitionBase & {    
    type: "function",
    internalType: "addr",
    isMacro: boolean,    
    arity: number,
    arityOut: number,
    signatures: Array<FunctionSignature>,
}

type VarDefinitionStruct = VarDefinitionBase & {
    type: "struct",
    token: Token,
    internalType: "addr",
    elements: Array<{ name: string, type: ValueType, def: VarDefinitionValue | VarDefinitionStruct }>,
    position: InstructionPosition.PREFIX,
    out: UserType
}
type VarDefinitionSpec = VarDefinitionValue | VarDefinitionFunction | VarDefinitionStruct;

type Context = {
    element: Token | undefined,
    varsDefinition: Record<string, VarDefinitionSpec>,
    parent: Context | undefined,
    level: number
    //size: number,
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
    generateChildEpilogueAsm?: (ast: Token, childIndex: number, target: Target) => Assembly,
    preprocessTokens?: (ast: AST, vocabulary: Vocabulary) => void,
    sim?: (simEnv: SimEnvironment, ast: Token) => [Token, boolean] | void,
    simPrelude?: (simEnv: SimEnvironment, ast: Token) => void,
    simPreludeChild?: (simEnv: SimEnvironment, ast: Token, childIndex: number) => boolean,
};
type Vocabulary = Record<number, Instruction>;
type AST = Token[];
type Assembly = Array<string>;

function sizeOfValueType(context: Context, t: ValueType, target: Target): number {

    const ADDR_SIZE: Record<Target, number> = { "c64": 2, "freebsd": 8, "sim": 1 };
    const BOOL_SIZE: Record<Target, number> = { "c64": 1, "freebsd": 8, "sim": 1 };
    const BYTE_SIZE: Record<Target, number> = { "c64": 1, "freebsd": 8, "sim": 1 };
    const NUMBER_SIZE: Record<Target, number> = { "c64": 2, "freebsd": 8, "sim": 1 };
    const STRING_SIZE = ADDR_SIZE[target] + NUMBER_SIZE[target];
    const ARRAY_SIZE = ADDR_SIZE[target] + NUMBER_SIZE[target];

    switch (t) {
        case "addr": return ADDR_SIZE[target];
        case "bool": return BOOL_SIZE[target];
        case "byte": return BYTE_SIZE[target];
        case "number": return NUMBER_SIZE[target];
        case "string": return STRING_SIZE;
        case "word": return STRING_SIZE;
        case "void": return 0;
        case "record": return 0;
        default: {
            if (t[0] === "addr") {
                return ADDR_SIZE[target]; // usertype is alwaya an address
            } else if (t[0] === "array") {
                return ARRAY_SIZE;
            } else if (t[0] === "usertype") {
                const typeName = t[1];
                const structDef = getWordDefinition(context, typeName);
                if (structDef === undefined || structDef.type !== "struct") {
                    logError(context.element!.loc, `getting the size of struct, can't find struct ${typeName}`);
                    exit();
                }

                let size = 0;
                for (let i = 0; i < structDef.elements.length; i++) {
                    const element = structDef.elements[i];
                    const currSize = sizeOfValueType(context, element.type, target);
                    size += currSize;
                }
                return size;
            }
        }
    }
    logError(context.element!.loc, `cannot compute the size for the type ${humanReadableType(t)}`);
    exit();
}

function isABlock(type: TokenType): boolean {
    return type === TokenType.BLOCK ||
        type === TokenType.REF_BLOCK ||
        type === TokenType.RECORD ||
        type === TokenType.ARRAY_BLOCK ||
        type === TokenType.WORD_BLOCK;
}

function humanReadableToken(t: TokenType | undefined): string {
    if (t === undefined) return "undefined";
    console.assert(TokenType.TOKEN_COUNT === 67, "Exaustive token types count");
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
        case TokenType.LTEQ: return "LTEQ";
        case TokenType.EQ: return "EQ";
        case TokenType.GT: return "GT";
        case TokenType.GTEQ: return "GTEQ";
        case TokenType.AND: return "AND";
        case TokenType.OR: return "OR";
        case TokenType.OPEN_BRACKETS: return "OPEN_BRACKETS";
        case TokenType.OPEN_REF_BRACKETS: return "OPEN_REF_BRACKETS";
        case TokenType.OPEN_LIT_BRACKETS: return "OPEN_LIT_BRACKETS";
        case TokenType.CLOSE_BRACKETS: return "CLOSE_BRACKETS";
        case TokenType.IF: return "IF";
        case TokenType.EITHER: return "EITHER";
        case TokenType.BLOCK: return "BLOCK";
        case TokenType.REF_BLOCK: return "REF_BLOCK";
        case TokenType.ARRAY_BLOCK: return "ARRAY_BLOCK";
        case TokenType.WORD_BLOCK: return "WORD_BLOCK";
        case TokenType.SET_WORD: return "SET_WORD";
        case TokenType.WORD: return "WORD";
        case TokenType.LIT_WORD: return "LIT_WORD";
        case TokenType.WHILE: return "WHILE";
        case TokenType.POKE: return "POKE";
        case TokenType.PEEK: return "PEEK";
        case TokenType.CAST_BYTE: return "CAST_BYTE";
        case TokenType.CAST_NUMBER: return "CAST_NUMBER";
        case TokenType.CAST_STRING: return "CAST_STRING";
        case TokenType.CAST_WORD: return "CAST_WORD";
        case TokenType.CAST_BOOL: return "CAST_BOOL";
        case TokenType.NUMBER: return "NUMBER";
        case TokenType.WORD_TYPE: return "WORD_TYPE";
        case TokenType.STRING: return "STRING";
        case TokenType.BYTE: return "BYTE";
        case TokenType.BOOL: return "BOOL";
        case TokenType.ADDR: return "ADDR";
        case TokenType.STR_JOIN: return "STR_JOIN";
        case TokenType.STACK: return "STACK";
        case TokenType.LENGHT: return "LENGHT";
        case TokenType.PROG: return "PROG";
        case TokenType.INC: return "INC";        
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
        case TokenType.ASM: return "ASM";
        case TokenType.DEBUG: return "DEBUG";
        case TokenType.TYPEOF: return "TYPEOF";
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
        case "word": return "word";
        case "record": return "record";
        default:
            if (t[0] === "array") return "Array of " + humanReadableType(t[1]);
            if (t[0] === "addr") return "Address of " + humanReadableType(t[1]);
            return t[1];
    }

}

function prettyPrintFunctionSignature(token: Token): string {
    let ins: ValueType[] | undefined;
    let out: ValueType | undefined;
    if (token.type === TokenType.WORD) {
        const varDef = getWordDefinition(token.context, token.txt);
        if (varDef === undefined) return `<def not found>`;
        if (varDef.type === "function") {
            ins = varDef.signatures[0].ins;
            out = varDef.signatures[0].out;
        } else if (varDef.type === "value") {
            out = varDef.out;
        }
    } else {
        ins = token.ins;
        out = token.out;
    }
    const strIns = ins === undefined ? "undefined" : ins.map(t => humanReadableType(t)).join(",");
    const strOut = humanReadableType(out);
    return `(${strIns})=>${strOut}`;
}

function humanReadableFunction(token: Token): string {
    return token.txt + ":" + prettyPrintFunctionSignature(token);
}

function getArity(token: Token, vocabulary: Vocabulary): number {
    if (token.type === TokenType.WORD) {
        const varDef = getWordDefinition(token.context, token.txt);
        if (varDef === undefined) {
            logError(token.loc, `Unnkown word '${token.txt}'`);
            exit();
        }
        return varDef.type === "function" ? varDef.arity : varDef.type === "struct" ? 1 : 0;        
    }
    if (token.ins !== undefined) return token.ins.length;
    if (token.expectedArity !== undefined) return token.expectedArity;
    const expectedArity = vocabulary[token.type]?.expectedArity;
    if (expectedArity !== undefined) return expectedArity;
    logError(token.loc, `cannot determine the expected arity for word '${token.txt}'`);
    exit();
}

function findSignature(tokenChilds: Array<Token>, signatures: Array<FunctionSignature>): FunctionSignature | undefined {

    for (let i = 0; i < signatures.length; i++) {
        const currentSignature = signatures[i];
        const currentParameters = currentSignature.ins;
        let currentSignatureOk = true;
        for (let j = 0; j < currentParameters.length; j++) {
            if (!areTypesCompatible(currentParameters[j], tokenChilds[j])) {
                currentSignatureOk = false;
                break;
            }
        }
        if (currentSignatureOk) return currentSignature;
    }

}

function storeSignatureThatMatches(token: Token): FunctionSignature | undefined {

    // this checks if the input parameters are of the correct type
    // in case of a function it also store the correct signature in the token

    if (token.type === TokenType.WORD) {
        const varDef = getWordDefinition(token.context, token.txt);
        if (varDef === undefined) {
            logError(token.loc, `Unnkown word '${token.txt}'`);
            exit();
        }
        // if it's not a function then returns only one parameter configuration
        // that is the configuration with no parameters
        if (varDef.type !== "function") {
            token.functionSignature = undefined;
            return;
        }

        const signature = findSignature(token.childs, varDef.signatures);
        if (signature) {
            token.functionSignature = signature;
            token.ins = signature.ins;
        } else {
            // no signature found !
            const strSignatures = varDef.signatures.map(
                signature => signature.ins.map(type => humanReadableType(type)).join(",")
            ).join("\n");
            logError(token.loc, `the word '${token.txt}' expects one of the following signatures:\n${strSignatures}, no one found!`);
            exit();
        }

    } else {
        if (token.ins === undefined) {
            logError(token.loc, `the input parameters for word '${token.txt}' are undefined`);
            exit();
        }
        for (let j = 0; j < token.ins.length; j++) {
            if (!areTypesCompatible(token.ins[j], token.childs[j])) {
                const strSignatures = token.ins.map(type => humanReadableType(type)).join(",");
                logError(token.loc, `the word '${token.txt}' expects the following signatures:\n${strSignatures}, but the parameters at position ${j + 1} should be '${humanReadableType(token.ins[j])}' instead it's '${humanReadableType(getReturnTypeOfAWord(token.childs[j]))}'`);
                logError(token.childs[j].loc, `here is the parameter '${token.childs[j].txt}'`);
                dumpAst(token);
                exit();
            }
        }
    }

    // If there are some parameters of type Word then convert them as word literal so they are not executed
    for (let i = 0; i < token.ins.length; i++) {
        if (token.ins[i] === "word") {
            const child = token.childs[i]
            if (child.type !== TokenType.WORD && child.type !== TokenType.LITERAL && child.type !== TokenType.WORD_TYPE) {
                logError(child.loc, `the parameter '${child.txt}' could not be converted to a literal word because it is a '${humanReadableToken(child.type)}'`);
                exit();
            }
            createLiteralFromToken(child, "word");
            token.txt = token.sourceTxt
        }
        if (areTypesEqual(token.ins[i], ["array", "word"])) {
            const child = token.childs[i]
            if (child.type !== TokenType.BLOCK) {
                logError(child.loc, `the parameter '${child.txt}' could not be converted to an array of word because it is a '${humanReadableToken(child.type)}'`);
                exit();
            }            
            child.type = TokenType.WORD_BLOCK;
        }
    }

}

function getInstructionPosition(token: Token): InstructionPosition {
    if (token.position === undefined) {
        logError(token.loc, `the position for word '${token.txt}' is undefined`);
        exit();
    }
    return token.position;
}

function getWordOffset(context: Context | undefined, varName: string, target: Target): number {

    if (context === undefined) {
        console.log(`cannot find offset for word '${varName}' the context is undefined`);
        exit();
    }

    let offset = 0;
    let currentContext: Context | undefined = context;
    while (currentContext !== undefined) {
        for (const [key, varDef] of Object.entries(currentContext.varsDefinition)) {
            if (key === varName) return offset;
            offset += sizeOfValueType(currentContext, varDef.internalType, target);
        }
        // no need to check for TokenType.PROG, we don't have a context beyond that
        if (currentContext.element?.type === TokenType.BLOCK ||
            currentContext.element?.type === TokenType.REF_BLOCK
        ) {
            offset += sizeOfContextMetadata(currentContext, target);
        }
        currentContext = currentContext.parent;

    }

    logError(context.element!.loc, `cannot find offset for word '${varName}'`);
    exit();
}

function getWordOffsetAndLevel(context: Context | undefined, varName: string, target: Target): { offset: number, levelToSkip: number } {

    if (context === undefined) {
        console.log(`cannot find offset for word '${varName}' the context is undefined`);
        exit();
    }

    let offset = 0;
    let levelToSkip = 0;
    let currentContext: Context | undefined = context;
    while (currentContext !== undefined) {
        for (const [key, varDef] of Object.entries(currentContext.varsDefinition)) {
            if (varDef.type === "struct") continue;
            if (key === varName) return { offset, levelToSkip };
            offset += sizeOfValueType(currentContext, varDef.internalType, target);
        }
        offset = 0;
        currentContext = currentContext.parent;
        levelToSkip++;
    }

    logError(context.element!.loc, `cannot find offset for word '${varName}'`);
    exit();
}

function sizeOfContextMetadata(context: Context, target: Target): number {

    if (context.parent === undefined) return 0;

    if (target === "c64") {
        return 1; // 1 byte for the static context in <CTX_PAGE> page
    }

    return sizeOfValueType(context, "addr", target);

}

function sizeOfContextWithMetadata(context: Context, target: Target): number {    
    return sizeOfContextMetadata(context, target) + sizeOfContext(context, target);
}

function sizeOfContext(context: Context, target: Target): number {    
    if (context.parent === undefined) return 0;
    return sizeOfRecord(context, target);
}

function sizeOfRecord(context: Context, target: Target): number {
    let size = 0;
    Object.values(context.varsDefinition).forEach(varDef => {
        if (varDef.type !== "struct") size += sizeOfValueType(context, varDef.internalType, target);
    });
    return size;
}

function sizeOfArray(token: Token, target: Target): [number, number] {
    const arrayType = getReturnTypeOfAWord(token.childs[0]);
    const arrayLen = token.childs.length;
    const sizeOfType = sizeOfValueType(token.context!, arrayType, target);
    return [arrayLen, arrayLen * sizeOfType];
}

function getWordDefinition_noparentcontext(context: Context | undefined, variableName: string, passedThruRefBlock: boolean = false): ({ isGlobalContext: boolean } & VarDefinitionSpec) | undefined {
    if (context === undefined) return undefined;
    const debug = false;
    const tryDef = context.varsDefinition[variableName];
    if (tryDef !== undefined) {        
        const isGlobalContext = context.parent === undefined;
        // function cannot refer to a local words in parent context
        if (!isGlobalContext && passedThruRefBlock && tryDef.type !== "struct") return undefined;
        return { isGlobalContext, ...tryDef };
    }
    if (context.parent !== undefined) {
        const isThisARefBlock = context.element?.type === TokenType.REF_BLOCK;
        return getWordDefinition_noparentcontext(context.parent, variableName, isThisARefBlock ? true : passedThruRefBlock);
    }
    return undefined;
}

function getWordDefinition(context: Context | undefined, variableName: string): ({ isGlobalContext: boolean } & VarDefinitionSpec) | undefined {
    if (context === undefined) return undefined;
    const tryDef = context.varsDefinition[variableName];
    if (tryDef !== undefined) {
        const isGlobalContext = context.parent === undefined;
        // function cannot refer to a local words in parent context        
        return { isGlobalContext, ...tryDef };
    }
    if (context.parent !== undefined) {
        const isThisARefBlock = context.element?.type === TokenType.REF_BLOCK;
        return getWordDefinition(context.parent, variableName);
    }
    return undefined;
}

function getFunctionDefinition(token: Token): ({ isGlobalContext: boolean } & VarDefinitionFunction) | undefined {

    const valueDef = getWordDefinition(token.context, token.txt);
    if (valueDef === undefined) return undefined;

    if (valueDef.type !== "function") {
        logError(token.loc, `the word '${token.txt}' should refer to a function not to a value or a struct`);
        exit();
    }
    return valueDef;
}


function getValueDefinition(token: Token): ({ isGlobalContext: boolean } & VarDefinitionValue) {

    const valueDef = getWordDefinition(token.context, token.txt);
    if (valueDef === undefined) {
        logError(token.loc, `can't find variable definition for '${token.txt}', compiler error`);
        exit();
    }
    if (valueDef?.type === "function" || valueDef?.type === "struct") {
        logError(token.loc, `the word '${token.txt}' should refer to a value not a function or a struct`);
        exit();
    }
    return valueDef;
}

function getAsmVarName(token: Token): string {
    let name = "V_" + token.txt;
    if (token.functionSignature) {
        name += "_" + token.functionSignature.index;
    }
    return name
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

        case "string":
        case "word": {
            const value = stackPop(simEnv);
            const lenght = stackPop(simEnv);
            const address = stackPop(simEnv) + offset;
            storeNumberOnHeap(simEnv, value, address);
            storeNumberOnHeap(simEnv, lenght, address + 8);
        } break;
        case "record":
        case "void":
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

function getAsmForSetWordPointedByTOS(varType: ValueType, offset: number, dereference: "YES" | "NO" | "AUXISONSTACK", target: Target): Assembly {
    if (target === "c64") {

        let getAddress: Assembly;
        switch (dereference) {
            case "NO":
                getAddress = [
                    `JSR POP16`,
                    `LDA STACKACCESS`,
                    "STA AUX",
                    `LDA STACKACCESS+1`,
                    "STA AUX + 1",
                ];
                break;
            case "YES":
                getAddress = [
                    "JSR POP16",
                    "LDY #0",
                    "LDA (STACKACCESS),Y",
                    "STA AUX",
                    "INY",
                    "LDA (STACKACCESS),Y",
                    "STA AUX + 1",
                ];
                break;
            case "AUXISONSTACK":
                getAddress = [
                    "PLA",
                    "STA AUX + 1",
                    "PLA",
                    "STA AUX",
                ];
                break;
        }

        switch (varType) {
            case "bool":
            case "byte":
                return getAddress.concat([
                    // NO_PEEPHOLE_OPT_DIRECTIVE,
                    "JSR POP16",
                    `LDY #${offset}`,
                    "LDA STACKACCESS",
                    `STA (AUX),Y`,
                ]);
            case "number":
            case "addr":                
                return getAddress.concat([
                    // NO_PEEPHOLE_OPT_DIRECTIVE,
                    "JSR POP16",
                    `LDY #${offset}`,
                    "LDA STACKACCESS",
                    `STA (AUX),Y`,
                    "INY",
                    "LDA STACKACCESS + 1",
                    `STA (AUX),Y`,
                ]);
            case "string":
            case "word":
                return getAddress.concat([
                    `LDY #${offset}`,
                    `JSR POP16`,
                    "LDA STACKACCESS",
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
                ]);

            case "record":
            case "void":                            
                console.log(`cannot compile set word for type ${varType}`);
                exit();
            default:
                if (varType[0] === "array") {
                    return getAddress.concat([
                        `LDY #${offset}`,
                        `JSR POP16`,
                        "LDA STACKACCESS",
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
                    ]);
                }
                return getAddress.concat([
                    "JSR POP16",
                    `LDY #${offset}`,
                    "LDA STACKACCESS",
                    `STA (AUX),Y`,
                    "INY",
                    "LDA STACKACCESS + 1",
                    `STA (AUX),Y`,
                ]);
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
            case "word":
                return [
                    "pop rbx",
                    "pop rcx",
                    "pop rax",
                    `mov [rax + ${offset}], rbx`,
                    `mov [rax + ${offset + 8}], rcx`,
                ];
            case "record":
            case "void":            
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
        case "string":
        case "word": {
            const address = stackPop(simEnv) + offset;
            simEnv.dataStack.push(readNumberFromHeap(simEnv, address + 8));
            simEnv.dataStack.push(readNumberFromHeap(simEnv, address));
        } break;
        case "record":
        case "void":
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
            case "word":
                return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "STA AUX",
                    "LDA STACKACCESS + 1",
                    "STA AUX + 1",

                    `LDY #${offset + 3}`,
                    `LDA (AUX),Y`,
                    `STA STACKACCESS + 1`,
                    "DEY",
                    `LDA (AUX),Y`,
                    `STA STACKACCESS + 0`,
                    `JSR PUSH16`,
                    "DEY",
                    `LDA (AUX),Y`,
                    `STA STACKACCESS + 1`,
                    "DEY",
                    `LDA (AUX),Y`,
                    `STA STACKACCESS + 0`,
                    `JSR PUSH16`,
                ];
            case "record":
            case "void":            
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
            case "word":
                return [
                    "pop rax",
                    `mov rbx, [rax + ${offset + 8}]`,
                    "push rbx",
                    `mov rbx, [rax + ${offset}]`,
                    "push rbx",
                ];
            case "record":
            case "void":            
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
            case "word":
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
            case "word":
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
        case "string":
        case "word": {
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
        const finalAddress = contextPage + offset + 1;
        switch (varType) {
            case "number":
                return popAndOffsetStack.concat([
                    "LDA STACKACCESS",
                    `STA ${finalAddress},X`,
                    "LDA STACKACCESS + 1",
                    `STA ${finalAddress + 1},X`
                ]);
            case "string":
            case "word":
                return popAndOffsetStack.concat([
                    "LDA STACKACCESS",
                    `STA ${finalAddress + 0},X`,
                    "LDA STACKACCESS + 1",
                    `STA ${finalAddress + 1},X`,
                    "JSR POP16",
                    "LDX CTX_SP16",
                    "LDA STACKACCESS",
                    `STA ${finalAddress + 2},X`,
                    "LDA STACKACCESS + 1",
                    `STA ${finalAddress + 3},X`,
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
                return [];
            default:
                if (varType[0] === "array") {
                    return popAndOffsetStack.concat([
                        "LDA STACKACCESS",
                        `STA ${finalAddress + 0},X`,
                        "LDA STACKACCESS + 1",
                        `STA ${finalAddress + 1},X`,
                        "JSR POP16",
                        "LDX CTX_SP16",
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
            case "word":
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

function getAsmPutWordAddressOnTOS(valueType: ValueType, caller: Token, callee: Token, offset: number, saveStaticContextOnStack: boolean, target: Target): Assembly {
    if (target !== "c64") {
        console.log(`target system '${target}' unknown`);
        exit();
    }

    const callerLevel = caller.context?.level;
    const calleeLevel = callee.context?.level;

    if (calleeLevel === undefined || callerLevel === undefined) {
        logError(caller.loc, `Cannot find levels in context: caller level ${callerLevel}, callee level ${calleeLevel}`);
        exit();
    }

    if (callerLevel < calleeLevel) {
        logError(caller.loc, `caller context level could not be lesser than callee context level: caller level ${callerLevel}, callee level ${calleeLevel}`);
        exit();
    }

    let levelsToClimb = callerLevel - calleeLevel;
    let currentContext: Context | undefined = caller.context!;
    const ret: Assembly = [];
    const sizeOfCurrentContext = sizeOfContextWithMetadata(currentContext, target);

    // todo: make this optimization works !
    if (levelsToClimb === 0) {
        if (saveStaticContextOnStack) {
            const offsetFromBottom = sizeOfContextWithMetadata(currentContext!, target) - offset - 1;
            return [
                `LDA #${CTX_PAGE}`,
                "STA STACKACCESS + 1",
                "LDA CTX_SP16",
                "CLC",
                `ADC #${sizeOfCurrentContext}`,
                "STA STACKACCESS",
                "; save the start of the static context on the 6502 stack",
                "PHA",
                "SEC",
                `SBC #${offsetFromBottom}`,
                "STA STACKACCESS",
                "JSR PUSH16"
            ];
        } else {
            const offsetFromBottom = sizeOfContextWithMetadata(currentContext!, target) - offset - 1;
            const offsetFromTop = sizeOfCurrentContext - offsetFromBottom;
            return [
                `LDA #${CTX_PAGE}`,
                "STA STACKACCESS + 1",
                "LDA CTX_SP16",
                "CLC",
                `ADC #${offsetFromTop}`,
                "STA STACKACCESS",
                "JSR PUSH16"
            ];
        }


    //     const offsetFromBottom = sizeOfContextWithMetadata(currentContext!, target) - offset - 1;
    //     if (saveStaticContextOnStack) {
    //         ret.push(...[
    //             `LDA #${CTX_PAGE}`,
    //             "STA STACKACCESS + 1",
    //             "LDA CTX_SP16",
    //             "CLC",
    //             `ADC #${sizeOfCurrentContext}`,
    //             "; save the start of the static context on the 6502 stack",
    //             "PHA",
    //             "SEC",
    //             `SBC #${offsetFromBottom}`,
    //             "STA STACKACCESS"
    //         ]);
    //     } else {
    //         ret.push(...[
    //             `LDA #${CTX_PAGE}`,
    //             "STA STACKACCESS + 1",
    //             "LDA CTX_SP16",
    //             "CLC",
    //             `ADC #${sizeOfCurrentContext - offsetFromBottom}`,
    //             "STA STACKACCESS"
    //         ]);
    //     }
    //     return ret;
    }

    //let currentAddress = simEnv.ctxStack.length - sizeOfContextWithMetadata(currentContext, "sim");

    ret.push(...[
        "LDY #0",
        `LDA #${CTX_PAGE}`,
        "STA STACKACCESS + 1",
        "LDA CTX_SP16",
        "CLC",
        `ADC #${sizeOfCurrentContext}`,
        "STA STACKACCESS",
    ]);

    while (levelsToClimb > 0) {
        if (currentContext === undefined) {
            logError(caller.loc, `cannot climb thru the contexts: caller level ${callerLevel}, callee level ${calleeLevel}, levels to climb: ${levelsToClimb}`);
            exit();
        }
        currentContext = currentContext.parent;
        levelsToClimb--;

        //currentAddress = simEnv.ctxStack[currentAddress];
        ret.push("LDA (STACKACCESS),Y");
        if (levelsToClimb > 0) ret.push("STA STACKACCESS");
    }

    // In case of a function call, push the start of static context in the stack
    ret.push(saveStaticContextOnStack ? `; word '${caller.txt}' is a function` : `; no need to save the static context address on stack for word '${caller.txt}'`);
    if (saveStaticContextOnStack) ret.push(...[
        "; save the start of the static context on the 6502 stack",
        "PHA",
    ]);

    // in stackaccess now we have the start of the static context containing the word
    // now is time to add the offset
    // currentAddress += sizeOfContextWithMetadata(currentContext!, "sim") - offset - 1;
    const offsetFromBottom = sizeOfContextWithMetadata(currentContext!, target) - offset - 1;
    if (offsetFromBottom !== 0) {
        ret.push(...[
            "SEC",
            `SBC #${offsetFromBottom}`,
            "STA STACKACCESS",
        ]);
    }
    ret.push(...[
        "JSR PUSH16"
    ]);

    return ret;
}

function simSetWordLocal(simEnv: SimEnvironment, varType: ValueType, indexInStack: number) {
    switch (varType) {
        case "number":
        case "bool":
        case "byte":
        case "addr":
            const valueToStore = stackPop(simEnv);
            simEnv.ctxStack[indexInStack] = valueToStore;
            return;
        case "string":
        case "word":
            const address = stackPop(simEnv);
            const lenght = stackPop(simEnv);
            simEnv.ctxStack[indexInStack] = address;
            simEnv.ctxStack[indexInStack - 1] = lenght;
            return;
        case "record":
        case "void":
            return;
        default:
            if (varType[0] === "array") {
                const address = stackPop(simEnv);
                const lenght = stackPop(simEnv);
                simEnv.ctxStack[indexInStack] = address;
                simEnv.ctxStack[indexInStack - 1] = lenght;
            } else {
                // struct or address
                const valueToStore = stackPop(simEnv);
                simEnv.ctxStack[indexInStack] = valueToStore;
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

                // Push the static context address onto stack
                // since we are getting a global function we store 0
                "; Push the static context address onto stack (1 byte)",
                "LDY CTX_SP16",
                "LDA #0",
                `STA ${CTX_PAGE * 256},Y`,
                "DEY",
                "STY CTX_SP16",

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
            case "word":
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
            case "word":
                return [
                    `mov rax, [${asmVarName} + 8]`,
                    `push rax`,
                    `mov rax, [${asmVarName}]`,
                    `push rax`,
                ]
            case "void":            
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

        case "string":
        case "word": {
            const addr = simEnv.vars[varName];
            if (addr === undefined) {
                logError(token.loc, `'${token.txt}' vars is undefined`);
                exit();
            }
            simEnv.dataStack.push(readNumberFromHeap(simEnv, addr + 8));
            simEnv.dataStack.push(readNumberFromHeap(simEnv, addr));
        } break;

        case "void":
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
            case "word":
                return asmOffset.concat([
                    `LDA ${finalAddress + 2},X`,
                    "STA STACKACCESS",
                    `LDA ${finalAddress + 3},X`,
                    "STA STACKACCESS + 1",
                    "JSR PUSH16",
                    "LDX CTX_SP16",
                    `LDA ${finalAddress + 0},X`,
                    "STA STACKACCESS",
                    `LDA ${finalAddress + 1},X`,
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
                return [];
            default:
                if (varType[0] === "array") {
                    return asmOffset.concat([
                        `LDA ${finalAddress + 2},X`,
                        "STA STACKACCESS",
                        `LDA ${finalAddress + 3},X`,
                        "STA STACKACCESS + 1",
                        "JSR PUSH16",
                        "LDX CTX_SP16",
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
            case "word":
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

function getAsmForGetWordLocalUsingOffsetAndLevel(valueType: ValueType, caller: Token, callee: Token, isFunction: boolean, offset: number, target: Target): Assembly {

    if (target !== "c64") {
        console.log(`target system '${target}' unknown`);
        exit();
    }

    const ret: Assembly = [];

    ret.push(...getAsmPutWordAddressOnTOS(valueType, caller, callee, offset, isFunction, target));
    ret.push(...getAsmForGetWordPointedByTOS(isFunction ? "addr" : valueType, 0, target));

    if (isFunction) {
        ret.push(...[
            // set the address for the call
            "JSR POP16",
            `LDA STACKACCESS`,
            `STA CALL_FUN_@ + 1`,
            `LDA STACKACCESS + 1`,
            `STA CALL_FUN_@ + 2`,

            // Push the static context address onto stack
            // CTXPAGE * 256,X
            "; Push the static context address onto stack (1 byte)",
            "LDY CTX_SP16",

            "PLA",
            `STA ${CTX_PAGE * 256},Y`,
            "DEY",
            "STY CTX_SP16",

            "CALL_FUN_@:",
            `JSR $1111 ; will be overwritten`
        ]);
    }

    return ret;

}

function simGetWordLocal(simEnv: SimEnvironment, token: Token, varType: ValueType, indexInStack: number) {

    switch (varType) {
        case "number":
        case "bool":
        case "byte":
        case "addr":
            const valueToPush = simEnv.ctxStack.at(indexInStack);
            if (valueToPush === undefined) {
                logError(token.loc, `'${token.txt}' value in the context stack at position ${indexInStack} is undefined`);
                exit();
            }
            simEnv.dataStack.push(valueToPush);
            return;
        case "string":
        case "word":
            const address = simEnv.ctxStack.at(indexInStack);
            if (address === undefined) {
                logError(token.loc, `'${token.txt}' ${varType} address in the context stack at position ${indexInStack} is undefined`);
                exit();
            }
            const lenght = simEnv.ctxStack.at(indexInStack - 1);
            if (lenght === undefined) {
                logError(token.loc, `'${token.txt}' ${varType} lenght in the context stack at position ${indexInStack - 1} is undefined`);
                exit();
            }
            simEnv.dataStack.push(lenght);
            simEnv.dataStack.push(address);
            return;

        case "record":
        case "void":
            logError(token.loc, `cannot get '${token.txt}' value of type ${humanReadableType(varType)}`);
            exit();

        default:
            if (varType[0] === "array") {
                const address = simEnv.ctxStack.at(indexInStack);
                if (address === undefined) {
                    logError(token.loc, `'${token.txt}' ${varType} address in the context stack at position ${indexInStack} is undefined`);
                    exit();
                }
                const lenght = simEnv.ctxStack.at(indexInStack - 1);
                if (lenght === undefined) {
                    logError(token.loc, `'${token.txt}' ${varType} lenght in the context stack at position ${indexInStack - 1} is undefined`);
                    exit();
                }
                simEnv.dataStack.push(lenght);
                simEnv.dataStack.push(address);
            } else {
                const valueToPush = simEnv.ctxStack.at(indexInStack);
                if (valueToPush === undefined) {
                    logError(token.loc, `'${token.txt}' value in the context stack at position ${indexInStack} is undefined`);
                    exit();
                }
                simEnv.dataStack.push(valueToPush);
            }
            return;
    }

}

function simGetWordValue(simEnv: SimEnvironment, token: Token, context: Context): string {
    const findVarName = /{(.+)}/gm.exec(token.txt);
    if (findVarName === null) {
        logError(token.loc, `'${token.txt}' cannot find the word name`);
        exit();
    }
    const varName = findVarName[1];
    const varDef = getWordDefinition(context, varName);
    if (varDef === undefined) {
        logError(token.loc, `${varName} is undefined in the context of '${token.txt}'`);
        exit();
    }
    const varType = varDef.internalType;
    let ret: string;
    if (varDef.isGlobalContext) {
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
                ret = String(readNumberFromHeap(simEnv, addr));
            } break;
            case "string":
            case "word": {
                const addr = simEnv.vars[varName];
                if (addr === undefined) {
                    logError(token.loc, `'${token.txt}' vars is undefined`);
                    exit();
                }
                const length = readNumberFromHeap(simEnv, addr + 8);
                const address = readNumberFromHeap(simEnv, addr);
                ret = readStringFromHeap(simEnv, address, length);
            } break;
            case "void":
            case "record":
                logError(token.loc, `cannot sim retrieve value for '${token.txt}' of '${humanReadableType(varType)}' type`);
                exit();
            default:
                if (varType[0] === "array") {
                    if (varType[1] === "string" || varType[1] === "word") {
                        const addr = simEnv.vars[varName];
                        if (addr === undefined) {
                            logError(token.loc, `'${token.txt}' vars is undefined`);
                            exit();
                        }
                        const arrAddress = readNumberFromHeap(simEnv, addr);
                        const arrLen = readNumberFromHeap(simEnv, addr + 8);

                        const str: string[] = [];
                        for (let i = 0; i < arrLen; i++) {
                            const strAddr = readNumberFromHeap(simEnv, arrAddress + i * 16);
                            const strLen = readNumberFromHeap(simEnv, arrAddress + i * 16 + 8);
                            str.push(readStringFromHeap(simEnv, strAddr, strLen));
                        }
                        ret = str.join(" ");
                    } else {
                        ret = "[ARRAY...]";
                    }
                } else {
                    const addr = simEnv.vars[varName];
                    if (addr === undefined) {
                        logError(token.loc, `'${token.txt}' vars is undefined`);
                        exit();
                    }
                    ret = String(readNumberFromHeap(simEnv, addr));
                }
                break;
        }
    } else {
        // const offset = getWordOffset(context, varName, "sim");
        const { offset, levelToSkip } = getWordOffsetAndLevel(token.context, varName, "sim");
        const addressInStack = simGetIndexFromOffsetAndLevel(simEnv, token.context!, offset, levelToSkip);
        switch (varType) {
            case "number":
            case "bool":
            case "byte":
            case "addr":
                const valueToPush = simEnv.ctxStack.at(addressInStack);
                if (valueToPush === undefined) {
                    logError(token.loc, `'${token.txt}' value in the context stack at position ${addressInStack} is undefined`);
                    exit();
                }
                ret = String(valueToPush);
                break;
            case "string":
            case "word":
                const address = simEnv.ctxStack.at(addressInStack);
                if (address === undefined) {
                    logError(token.loc, `'${token.txt}' string address in the context stack at position ${addressInStack} is undefined`);
                    exit();
                }
                const lenght = simEnv.ctxStack.at(addressInStack - 1);
                if (lenght === undefined) {
                    logError(token.loc, `'${token.txt}' string lenght in the context stack at position ${addressInStack} is undefined`);
                    exit();
                }
                ret = readStringFromHeap(simEnv, address, lenght);
                break;
            case "record":
            case "void":
                logError(token.loc, `cannot get '${token.txt}' value of type ${humanReadableType(varType)}`);
                exit();

            default:
                if (varType[0] === "array") {
                    if (varType[1] === "word" || varType[1] === "string") {
                        const address = simEnv.ctxStack.at(addressInStack);
                        if (address === undefined) {
                            logError(token.loc, `'${token.txt}' array address in the context stack at position ${addressInStack} is undefined`);
                            exit();
                        }
                        const lenght = simEnv.ctxStack.at(addressInStack - 1);
                        if (lenght === undefined) {
                            logError(token.loc, `'${token.txt}' array lenght in the context stack at position ${addressInStack - 1} is undefined`);
                            exit();
                        }
                        const str: string[] = [];
                        for (let i = 0; i < lenght; i++) {
                            const strAddr = readNumberFromHeap(simEnv, address + i * 16);
                            const strLen = readNumberFromHeap(simEnv, address + i * 16 + 8);
                            str.push(readStringFromHeap(simEnv, strAddr, strLen));
                        }
                        ret = str.join(" ");
                    } else {
                        ret = "[ARRAY...]";
                    }
                } else {
                    const valueToPush = simEnv.ctxStack.at(addressInStack);
                    if (valueToPush === undefined) {
                        logError(token.loc, `'${token.txt}' value in the context stack at position ${addressInStack} is undefined`);
                        exit();
                    }
                    ret = String(valueToPush);
                }
                break;
        }
    }

    if (token.type === TokenType.LIT_WORD) {
        ret = "'" + ret;
    } else if (token.type === TokenType.SET_WORD) {
        ret = ret + ":";
    } else if (token.type === TokenType.LITERAL) {
        if (token.internalValueType === "word") {
            ret = "'" + ret + "'";
        } else if (token.internalValueType === "string") {
            ret = '"' + ret + '"';
        }
    }

    return ret;
}

function getReturnTypeOfAWord(token: Token): ValueType {
    if (token.out === undefined) {
        logError(token.loc, `the type of word '${token.txt}' is undefined`);
        exit();
    }
    if (token.type === TokenType.REF_BLOCK) return "addr";
    if (token.type === TokenType.RECORD) return "record";
    if (token.type === TokenType.WORD_BLOCK) return ["array", "word"];    
    return token.out;
}

function assertChildNumber(token: Token, spec: number | Array<ValueType | TokenType | "any">) {

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
            const paramSpec = spec[i];
            if (paramSpec === "any") continue;
            const strParams = spec.map(t => t === "any" ? "Any Type" : (typeof t === "number" ? humanReadableToken(t) : humanReadableType(t))).join(", ");
            if (typeof paramSpec === "number") {
                if (token.childs[i].type !== paramSpec) {
                    const strParamType = humanReadableToken(token.childs[i].type);
                    const strExpectedParamType = humanReadableToken(paramSpec);
                    logError(token.childs[i].loc, `'${token.txt}' expects ${strParams} as parameters, but ${token.childs[i].txt} is a ${strParamType} (should be ${strExpectedParamType})`);
                    dumpAst(token);
                    exit();
                }
            } else {
                if (!areTypesEqual(getReturnTypeOfAWord(token.childs[i]), paramSpec)) {
                    const strParamType = humanReadableType(getReturnTypeOfAWord(token.childs[i]));
                    const strExpectedParamType = humanReadableType(paramSpec);
                    logError(token.childs[i].loc, `'${token.txt}' expects ${strParams} as parameters, but ${token.childs[i].txt} is a ${strParamType} (should be ${strExpectedParamType})`);
                    dumpAst(token);
                    exit();
                }
            }

        }

    }

}

function getAsmPrintTopOfStack(type: ValueType, newLine: boolean, target: Target): Assembly {

    if (target === "c64") {
        const newLineAsm = newLine ? ["LDA #13", "JSR EMIT"] : [];

        switch (type) {
            case "number":
                return [
                    "JSR POP16",
                    "JSR PRINT_INT",
                    ...newLineAsm
                ]
            case "string":
            case "word":
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
                    "JSR EMIT",
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
            case "record":
                console.log(`printing '${humanReadableType(type)}' is not implemented`);
                exit();
            default:
                return [
                    "JSR POP16",
                    "LDA #91", // [
                    "JSR EMIT",
                    "LDA #46", // dot
                    "JSR EMIT",
                    "LDA #46", // dot
                    "JSR EMIT",
                    "LDA #46", // dot
                    "JSR EMIT",
                    "LDA #93", // ]
                    "JSR EMIT",
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
            case "word":
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
        case "word":
            const addr = stackPop(simEnv);
            const len = stackPop(simEnv);
            toPrint = readStringFromHeap(simEnv, addr, len);
            break;
        case "bool":
            toPrint = stackPop(simEnv) === 0 ? "N" : "Y";
            break;
        case "void":
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
            const prevSize = sizeOfValueType(token.context!, previousElement.type, "sim");
            structAddress += prevSize * 8;
        }
        simEnv.dataStack.push(structAddress);
        simGetWordPointedByTOS(simEnv, element.def.internalType, 0);
        simPrintTopOfStack(simEnv, element.def.internalType, newline);
        if (!newline) emit(simEnv, 32);
    }
}

function getAsmAddressOfLiteral(context: Context, type: ValueType, target: Target) {
    if (target === "c64") {
        switch (type) {
            case "addr":
            case "bool":
            case "byte":
            case "number":
                const size = sizeOfValueType(context, type, target);
                const ret: Assembly = [];
                ret.push(...[
                    NO_PEEPHOLE_OPT_DIRECTIVE,
                    "JSR POP16",
                    "LDX SP16",
                    "DEX",
                    "STX STACKACCESS",
                    "LDX #0",
                    "STX STACKACCESS + 1",
                    "JSR PUSH16",
                    //"INX",
                ]);
                return ret;
            case "record":
            case "string":
            case "word":
                return [
                    "LDX SP16",
                    "LDA STACKBASE + 1,X",
                    "STA STACKBASE + 3,X",
                    "LDA STACKBASE + 2,X",
                    "STA STACKBASE + 4,X",
                    "INX",
                    "INX",
                    "STX SP16",
                ];
            default:
                console.log(`unable to get address for word of type ${humanReadableType(type)}`);
                exit();
        }
    }
    if (target === "freebsd") {
        console.log(`address of literal is not implemented yet!`);
        exit();
    }
    console.log(`target system '${target}' unknown`);
    exit();
}

function getAsmAddressOfWord(token: Token, varDef: { isGlobalContext: boolean } & VarDefinitionValue, varName: string, target: Target) {

    if (varDef.isGlobalContext) {
        const asmVarName = getAsmVarName(token);
        if (target === "c64") {
            if (varDef.internalType === "addr" || varDef.internalType === "bool" || varDef.internalType === "byte" || varDef.internalType === "number") {
                return [
                    `LDA #<${asmVarName}`,
                    `STA STACKACCESS`,
                    `LDA #>${asmVarName}`,
                    `STA STACKACCESS+1`,
                    "JSR PUSH16",
                ]
            } else {
                return [
                    `LDA ${asmVarName}`,
                    `STA STACKACCESS`,
                    `LDA ${asmVarName}+1`,
                    `STA STACKACCESS+1`,
                    "JSR PUSH16",
                ]
            }
        }
        if (target === "freebsd") {
            return [
                `mov rax, ${asmVarName}`,
                `push rax`,
            ]
        }
        console.log(`target system '${target}' unknown`);
        exit();
    } else {
        const { offset, levelToSkip } = getWordOffsetAndLevel(token.context, varName, target);
        if (target === "c64") {            
            switch (varDef.internalType) {
                case "addr":
                case "bool":
                case "byte":
                case "number":
                    return getAsmPutWordAddressOnTOS(varDef.internalType, token, varDef.token, offset, false, target);
                case "record":
                case "string":
                case "word":
                    const ret = getAsmPutWordAddressOnTOS(varDef.internalType, token, varDef.token, offset, false, target);
                    ret.push(...getAsmForGetWordPointedByTOS(varDef.internalType, 0, target));
                    ret.push(...[
                        "LDX SP16",
                        "LDA STACKBASE + 1,X",
                        "STA STACKBASE + 3,X",
                        "LDA STACKBASE + 2,X",
                        "STA STACKBASE + 4,X",
                        "INX",
                        "INX",
                        "STX SP16",
                    ]);
                    return ret;
                default:
                    console.log(`unable to get address for word '${token.txt}' of type ${humanReadableType(varDef.internalType)}`);
                    exit();
            }
        }
        if (target === "freebsd") {
            return [
                "mov rax, [ctx_stack_rsp]",
                `add rax, ${offset}`,
                "push rax",
            ];
        }
        console.log(`target system '${target}' unknown`);
        exit();
    }
}

function getSourceRapresentationOfAToken(token: Token): string {
    switch (token.type) {
        case TokenType.LITERAL: {
            switch (token.internalValueType) {
                case "word": return "'" + token.txt + "'";
                case "string": return '"' + token.txt + '"';
                default: return token.txt;
            }
        }
        case TokenType.LIT_WORD: return "'" + token.txt;
        case TokenType.SET_WORD: return token.txt + ":";
        case TokenType.REF_BLOCK:
        case TokenType.BLOCK:
        case TokenType.RECORD:
        case TokenType.ARRAY_BLOCK:
        case TokenType.WORD_BLOCK: {
            const opening = token.type === TokenType.REF_BLOCK ? ":[" : token.type === TokenType.WORD_BLOCK ? "'[" : "[";
            return opening + token.childs.map(getSourceRapresentationOfAToken).join(" ") + "]";
        }

        default: return token.txt;
    }
}

function simGetAddressOfStaticContext(simEnv: SimEnvironment, caller: Token, callee: Token): number {

    const callerLevel = caller.context?.level!;
    const calleeLevel = callee.context?.level! - 1;

    if (calleeLevel === undefined || callerLevel === undefined) {
        logError(caller.loc, `Cannot find levels in context: caller level ${callerLevel}, callee level ${calleeLevel}`);
        exit();
    }
    if (callerLevel < calleeLevel) {
        logError(caller.loc, `caller context level could not be lesser than callee context level: caller level ${callerLevel}, callee level ${calleeLevel}`);
        exit();
    }

    let levelsToClimb = callerLevel - calleeLevel;
    let currentContext: Context | undefined = caller.context!;
    let currentAddress = simEnv.ctxStack.length - sizeOfContextWithMetadata(currentContext, "sim");
    while (levelsToClimb > 0) {
        if (currentContext === undefined) {
            logError(caller.loc, `cannot climb thru the contexts: caller level ${callerLevel}, callee level ${calleeLevel}, levels to climb: ${levelsToClimb}`);
            exit();
        }
        currentContext = currentContext.parent;
        levelsToClimb--;
        currentAddress = simEnv.ctxStack[currentAddress];
    }
    return currentAddress;
}

function simGetIndexFromOffsetAndLevel(simEnv: SimEnvironment, context: Context, offset: number, levelToSkip: number): number {

    let currentContext: Context | undefined = context;
    let currentAddress = simEnv.ctxStack.length - sizeOfContextWithMetadata(currentContext, "sim");
    while (levelToSkip > 0) {
        if (currentContext === undefined) {
            logError(context.element!.loc, `cannot climb thru the contexts: still ${levelToSkip} level to climb `);
            exit();
        }
        currentContext = currentContext.parent;
        levelToSkip--;
        currentAddress = simEnv.ctxStack[currentAddress];
    }
    currentAddress += sizeOfContextWithMetadata(currentContext!, "sim") - offset - 1;
    return currentAddress;
}

function simGetValueFromOffsetAndLevel(simEnv: SimEnvironment, context: Context, offset: number, levelToSkip: number): number {
    const index = simGetIndexFromOffsetAndLevel(simEnv, context, offset, levelToSkip);
    return simEnv.ctxStack[index];
}

function simPrintContextStack(simEnv: SimEnvironment, context: Context) {

    const stk = simEnv.ctxStack.slice();
    console.log(stk);
    const parts = [];
    const contextSize = sizeOfContextWithMetadata(context, "sim");
    const part = stk.splice(- contextSize, contextSize);
    parts.unshift([stk.length, part]);
    console.log(parts);
}


let nStrJoin = 0;
function createVocabulary(): Vocabulary {
    console.assert(TokenType.TOKEN_COUNT === 67, "Exaustive token types count");
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
                        const prevSize = sizeOfValueType(token.context!, previousElement.type, target);
                        ret = ret.concat([
                            "JSR POP16",
                            // in stackaccess the pointer to the field in the record
                            "CLC",
                            "LDA STACKACCESS",
                            `ADC #${prevSize}`,
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
                        const prevSize = sizeOfValueType(token.context!, previousElement.type, target);
                        ret = ret.concat([
                            // in stackaccess the pointer to the field in the record
                            "pop rax",
                            `add rax, ${prevSize} ; adding ${previousElement.name} size`,
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
                // simPrintContextStack(simEnv, token.context!);
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
                        const prevSize = sizeOfValueType(token.context!, previousElement.type, target);
                        ret = ret.concat([
                            "LDA #32",
                            "JSR EMIT",

                            "JSR POP16",
                            // in stackaccess the pointer to the field in the record
                            "CLC",
                            "LDA STACKACCESS",
                            `ADC #${prevSize}`,
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
                        const prevSize = sizeOfValueType(token.context!, previousElement.type, target);
                        ret = ret.concat([
                            // in stackaccess the pointer to the field in the record
                            "mov rcx, 32",
                            "call emit",
                            "pop rax",
                            `add rax, ${prevSize}`,
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
        generateAsm: (_token, target) => {
            if (target === "c64") {
                return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "JSR EMIT",
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
        sim: (simEnv, _token) => {
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
        ins: (_token) => [],
        out: () => "void",
        sim: (simEnv, _token) => {
            emit(simEnv, 10);
        },
        generateAsm: (_token, target) => {
            if (target === "c64") {
                return [
                    "LDA #13",
                    "JSR EMIT",
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
        sim: (simEnv, _token) => {
            simEnv.dataStack.push(stackPop(simEnv) + stackPop(simEnv));
        },
        generateAsm: (token, target) => {
            console.assert(token.childs.length === 2, "The childs of a plus operand should be 2, compiler error");
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);

            if (target === "c64") {
                if (token.childs[0].type === TokenType.LITERAL) {
                    const childValue = getNumberFromLiteral(token.childs[0].txt);
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
        sim: (simEnv, _token) => {
            simEnv.dataStack.push(- stackPop(simEnv) + stackPop(simEnv));
        },
        generateAsm: (_token, target) => {
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
        sim: (simEnv, _token) => {
            simEnv.dataStack.push(stackPop(simEnv) * stackPop(simEnv));
        },
        generateAsm: (_token, target) => {
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
            assertChildNumber(token, 2);
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === "byte" || type1 === "number") && (type2 === "byte" || type2 === "number")) {
                return [type1, type2]
            }
            return ["number", "number"];
        },
        out: () => "number",
        sim: (simEnv, _token) => {
            simEnv.dataStack.push(Math.floor(1 / stackPop(simEnv) * stackPop(simEnv)));
        },
        generateAsm: (token, target) => {
            if (target === "c64") {
                assertChildNumber(token, 2);
                const divisor = token.childs[1];
                if (divisor.type === TokenType.LITERAL) {
                    const divisorValue = divisor.txt;
                    const powersOfTwo: Record<string, number> = {
                        "1": 0,
                        "2": 1,
                        "4": 2,
                        "8": 3,
                        "16": 4,
                        "32": 5,
                        "64": 6,
                        "128": 7,
                        "256": 8,
                    }
                    if (divisorValue in powersOfTwo) {
                        const shiftValue = powersOfTwo[divisorValue];
                        if (shiftValue === 8) {
                            return [
                                "LDX SP16",
                                "INX",
                                "INX",
                                "STX SP16",
                                "LDA STACKBASE + 2,X",
                                "STA STACKBASE + 1,X",
                                "LDA #0",
                                "STA STACKBASE + 2,X",
                            ]
                        }
                        return [
                            "LDX SP16",
                            "INX",
                            "INX",
                            "STX SP16",
                            `LDY #${shiftValue}`,
                            "LOOP_SHIFT_@:",
                            "LSR STACKBASE + 2,X",
                            "ROR STACKBASE + 1,X",
                            "DEY",
                            "BNE LOOP_SHIFT_@"
                        ];
                    }
                }
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
        sim: (simEnv, _token) => {
            const divisor = stackPop(simEnv);
            const dividend = stackPop(simEnv);
            simEnv.dataStack.push(dividend % divisor);
        },
        generateAsm: (_token, target) => {
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
        sim: (simEnv, _token) => {
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
        sim: (simEnv, _token) => {
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
    voc[TokenType.LTEQ] = {
        txt: "<=",
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
        sim: (simEnv, _token) => {
            const b = stackPop(simEnv);
            const a = stackPop(simEnv);
            simEnv.dataStack.push(a <= b ? 1 : 0);
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
                        "BCC less_or_eq@",
                        "BEQ less_or_eq@",
                        "LDA #00",
                        "JMP store@",
                        "less_or_eq@:",
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
                    "BCC less_or_equal@",
                    "BNE greater@",
                    "LDA STACKBASE + 3,X",
                    "CMP STACKBASE + 1,X",
                    "BCC less_or_equal@",
                    "BEQ less_or_equal@",

                    "greater@:",
                    "LDA #00",
                    "JMP store@",

                    "less_or_equal@:",
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
                    "jle .less_or_eq@",
                    "push 0",
                    "jmp .end@",
                    ".less_or_eq@:",
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
        sim: (simEnv, _token) => {
            simEnv.dataStack.push(stackPop(simEnv) === stackPop(simEnv) ? 1 : 0);
        },
        generateAsm: (token, target) => {
            const type1 = getReturnTypeOfAWord(token.childs[0]);
            const isChild1Literal = token.childs[0].type === TokenType.LITERAL;
            const type2 = getReturnTypeOfAWord(token.childs[1]);
            if (target === "c64") {
                if (isChild1Literal) {
                    // only the second child on the stack
                    const child1Value = getNumberFromLiteral(token.childs[0].txt);
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
        sim: (simEnv, _token) => {
            const b = stackPop(simEnv);
            const a = stackPop(simEnv);
            simEnv.dataStack.push(a > b ? 1 : 0);
        },
        generateAsm: (_token, target) => {
            if (target === "c64") {
                return [
                    "LDX SP16",
                    "LDA STACKBASE + 2,X",
                    "CMP STACKBASE + 4,X",
                    "BCC greater@",       //b > a 
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
    voc[TokenType.GTEQ] = {
        txt: ">=",
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
        sim: (simEnv, _token) => {
            const b = stackPop(simEnv);
            const a = stackPop(simEnv);
            simEnv.dataStack.push(a >= b ? 1 : 0);
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
                        "BCS greater_or_equal@",
                        "LDA #00",
                        "BEQ result@",
                        "greater_or_equal@:",
                        "LDA #01",
                        "result@:",
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
                    "LDA STACKBASE + 4,X", // a
                    "CMP STACKBASE + 2,X", // cmp b
                    "BCC less@", // 
                    "BNE greater_or_equal@",
                    "LDA STACKBASE + 3,X",
                    "CMP STACKBASE + 1,X",
                    "BCS greater_or_equal@",
                    "less@:",
                    "LDA #00",
                    "JMP result@",
                    "greater_or_equal@:",
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
                    "jge .greater_or_equal@",
                    "push 0",
                    "jmp .end@",
                    ".greater_or_equal@:",
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
        generateAsm: (_token, target) => {
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
        sim: (simEnv, _token) => {
            simEnv.dataStack.push(stackPop(simEnv) && stackPop(simEnv));
        }
    };
    voc[TokenType.OR] = {
        txt: "or",
        expectedArity: 2,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.INFIX,
        priority: 50,
        userFunction: false,
        ins: token => {
            assertChildNumber(token, ["bool", "bool"]);
            return ["bool", "bool"];
        },
        out: () => "bool",
        generateAsm: (_token, target) => {
            if (target === "c64") {
                return [
                    "LDX SP16",
                    "LDA STACKBASE + 1,X",
                    "ORA STACKBASE + 3,X",
                    "BEQ or_zero@",
                    "LDA #1",
                    "JMP result@",
                    "or_zero@:",
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
                    "or rax, rbx",
                    "push rax",
                ]
            }
            console.log(`target system '${target}' unknown`);
            exit();
        },
        sim: (simEnv, _token) => {
            simEnv.dataStack.push(stackPop(simEnv) || stackPop(simEnv));
        }
    };
    voc[TokenType.IF] = {
        txt: "if",
        expectedArity: 2,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 8,
        userFunction: false,
        ins: () => ["bool", "void"],
        out: () => "void",
        simPreludeChild: (simEnv, _ast, childIndex) => {
            if (childIndex === 1) {
                // the second child (the true branch) is executed only
                // if the stack contains "1" the true value
                return stackPop(simEnv) === 1;
            }
            return true;
        },
        sim: (_simEnv, _token) => { },
        generateChildPreludeAsm: (_ast, n, target) => {
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
        generateAsm: (_token) => [
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
            if (!areTypesEqual(typeThen, typeElse)) {
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
        sim: (_simEnv, _token) => { },
        generateChildPreludeAsm: (_ast, n, target) => {
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
        generateAsm: (_token) => [
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
        generateAsm: (_token) => []
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
        generateAsm: (_token) => []
    };
    voc[TokenType.OPEN_LIT_BRACKETS] = {
        txt: ":[",
        expectedArity: 0,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 150,
        userFunction: false,
        ins: () => [],
        out: () => "void",
        generateAsm: (_token) => []
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
        generateAsm: (_token) => []
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

            let sizeToRelease = sizeOfContextWithMetadata(token.context, target);
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
            const context = token.context;
            if (context.parent === undefined) return []; // the global context

            const sizeToReserve = sizeOfContextWithMetadata(context, target);

            const strVariables = Object.entries(context.varsDefinition)
                .filter(([_name, varDef]) => varDef.type !== "struct")
                .map(
                    ([name, varDef]) => name + ` (${sizeOfContextWithMetadata(context, target) - getWordOffsetAndLevel(token.context, name, target).offset - 1
                        }: ${humanReadableType(varDef.internalType)})`
                ).join(", ");
            if (sizeToReserve === 0) return ["; no stack memory to reserve"];

            const sizeOfParentContext = sizeOfContextWithMetadata(context.parent, target);

            if (target === "c64") {
                const ret: Assembly = sizeOfParentContext > 0 ? [
                    "; save the address of the parent context",
                    "LDA CTX_SP16",
                    "TAY",
                    "CLC",
                    `ADC #${sizeOfParentContext}`,
                    `STA ${CTX_PAGE * 256},Y`,
                ] : [
                    "; this is the top context pointer is 0",
                    "LDY CTX_SP16",
                    "LDA #0",
                    `STA ${CTX_PAGE * 256},Y`,
                ]
                ret.push(...[
                    `; reserve ${sizeToReserve} on the stack for: context metadata, ${strVariables}`,
                    "LDA CTX_SP16",
                    "SEC",
                    `SBC #${sizeToReserve}`,
                    "STA CTX_SP16"
                ]);
                return ret;
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

            const addrOfStaticContext = token.context!.level <= 1 ? 0 : simEnv.ctxStack.length - sizeOfContextWithMetadata(token.context!.parent, "sim");
            simEnv.ctxStack.push(addrOfStaticContext);            
            simEnv.ctxStack.length += sizeOfContext(token.context, "sim");
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

            simEnv.ctxStack.length -= sizeOfContextWithMetadata(token.context, "sim");
            // when closing a block we need to assign token.functionIndex = undefined for each ref block
            // because their context is closed 
            resetRecurFunctionIndex(token);
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
        //out: () => ["array", "word"],
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

            // let sizeToReserve = 0;
            // for (const [key, varDef] of Object.entries(token.context.varsDefinition)) {                
            //     sizeToReserve += sizeForValueType(varDef.internalType, target);
            // }
            const sizeToReserve = sizeOfContext(token.context, target);
            const strVariables = Object.entries(token.context.varsDefinition)
                .filter(([_name, varDef]) => varDef.type !== "struct")
                .map(
                    ([name, varDef]) => name + ` (${sizeOfContextWithMetadata(token.context!, target) - getWordOffsetAndLevel(token.context, name, target).offset - 1
                        }: ${humanReadableType(varDef.internalType)})`
                ).join(", ");

            token.functionIndex = getFunctionIndex();
            const asmFunctionName = getFunctionName(token.functionIndex);
            const asmAfterFunctionName = getAfterFunctionName(token.functionIndex);

            if (target === "c64") {
                const asmReserveStackSpace = sizeToReserve === 0 ?
                    ["; no stack memory to reserve"] :
                    [
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
            const sizeToRelease = sizeOfContextWithMetadata(token.context, target);
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

            // reserve the context stack  
            simEnv.ctxStack.length += sizeOfContext(token.context, "sim");

        },
        simPreludeChild: (_simEnv, token, _childIndex) => {
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
                // release the context stack  
                simEnv.ctxStack.length -= sizeOfContextWithMetadata(token.context, "sim");

                // when closing a block we need to assign token.functionIndex = undefined for each ref block
                // because their context is closed 
                resetRecurFunctionIndex(token);

                const retAddress = simEnv.retStack.pop();
                if (retAddress === undefined) {
                    logError(token.loc, `'${token.txt}' return stack is empty`);
                    exit();
                }
                return [retAddress, true];
            }
        }
    };
    voc[TokenType.ARRAY_BLOCK] = {
        txt: "",
        expectedArity: 0,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: true,
        ins: () => [],
        out: () => "addr",
        generatePreludeAsm: (token, _target) => {
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
        simPrelude: (_simEnv, token) => {
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
            const [arrayLen, totalSize] = sizeOfArray(token, target);

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
            const [arrayLen, totalSize] = sizeOfArray(token, "sim");
            const startHeapAddress = simEnv.heapTop;            
            for (let i = 0; i < totalSize; i++) {
                const value = stackPop(simEnv);
                storeNumberOnHeap(simEnv, value, undefined);
            }            
            simEnv.dataStack.push(arrayLen);
            simEnv.dataStack.push(startHeapAddress);
        },

    };
    voc[TokenType.WORD_BLOCK] = {
        txt: "",
        expectedArity: 0,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: true,
        ins: () => [],
        out: () => ["array", "word"],
        generatePreludeAsm: (_token, _target) => {
            console.log(`Using array of words is only available in simulation mode`);
            exit();
        },
        generateChildEpilogueAsm: (_token, _childIndex, _target) => {
            console.log(`Using array of words is only available in simulation mode`);
            exit();
        },
        simPreludeChild: () => {
            return false;
        },
        simPrelude: (_simEnv, _token) => {
        },
        generateAsm: (_token, _target) => {
            console.log(`Using array of words is only available in simulation mode`);
            exit();
        },
        sim: (simEnv, token) => {
            if (token.context === undefined) {
                logError(token.loc, `'${token.txt}' the context is undefined`);
                exit();
            }

            const arrayLen = token.childs.length;
            const sizeOfTypeInBytes = sizeOfValueType(token.context, "word", "sim") * 16;
            const totalSize = arrayLen * sizeOfTypeInBytes;

            const startArray = simEnv.heapTop;
            simEnv.heapTop += totalSize;
            for (let i = 0; i < token.childs.length; i++) {
                const cc = token.childs[i];
                const doInterpol = cc.txt.startsWith("{") && cc.txt.endsWith("}");
                const tokenSource = doInterpol ? simGetWordValue(simEnv, cc, token.context) : getSourceRapresentationOfAToken(cc);
                //console.log(i, tokenSource);
                const addr = storeStringOnHeap(simEnv, tokenSource);
                storeNumberOnHeap(simEnv, addr, startArray + i * 16);
                storeNumberOnHeap(simEnv, tokenSource.length, startArray + i * 16 + 8);
            }
            simEnv.dataStack.push(arrayLen);
            simEnv.dataStack.push(startArray);
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
            const varDef = getValueDefinition(token);
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
            if (varDef.isGlobalContext) return getAsmForSetWordGlobal(varDef.internalType, getAsmVarName(token), 0, target);

            const offset = getWordOffset(token.context, varName, target);
            return getAsmForSetWordLocal(varDef.internalType, offset, target);
        },
        sim: (simEnv, token) => {
            const varName = token.txt;
            const varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, `cannot find declaration for '${varName}', compiler error`);
                exit();
            }
            if (varDef.isGlobalContext) return simSetWordGlobal(simEnv, varDef.internalType, varName);

            //const offset = getWordOffset(token.context, varName, "sim");
            const { offset, levelToSkip } = getWordOffsetAndLevel(token.context, varName, "sim");
            const addressInStack = simGetIndexFromOffsetAndLevel(simEnv, token.context!, offset, levelToSkip);
            return simSetWordLocal(simEnv, varDef.internalType, addressInStack);
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
            if (target !== "c64") {
                console.log(`target system '${target}' not yet implemented`);
                exit();
            }

            const varName = token.txt;
            const varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, `LIT_WORD generateAsm cannot find declaration for '${varName}', compiler error`);                
                exit();
            }
            if (varDef.isGlobalContext) return getAsmForSetWordGlobal(varDef.internalType, getAsmVarName(token), 0, target);

            //const offset = getWordOffset(token.context, varName, target);
            //return getAsmForSetWordLocal(varDef.internalType, offset, target);
            const { offset, levelToSkip } = getWordOffsetAndLevel(token.context, varName, target);

            const ret: Assembly = [];
            const callee = varDef.type === "function" ? token.functionSignature?.token : varDef.token;
            if (callee === undefined) {
                logError(token.loc, `LIT_WORD generateAsm cannot find callee for '${varName}', compiler error`);
                exit();
            }
            ret.push(...getAsmPutWordAddressOnTOS(varDef.internalType, token, callee, offset, false, target));
            ret.push(...getAsmForSetWordPointedByTOS(varDef.internalType, 0, "NO", target));
            return ret;

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
                simSetWordGlobal(simEnv, varDef.internalType, getAsmVarName(token));
            } else {                
                const { offset, levelToSkip } = getWordOffsetAndLevel(token.context, varName, "sim");
                const addressInStack = simGetIndexFromOffsetAndLevel(simEnv, token.context!, offset, levelToSkip);
                simSetWordLocal(simEnv, varDef.internalType, addressInStack);
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
            const varDef = getWordDefinition(token.context, token.txt);
            if (varDef === undefined) {
                logError(token.loc, `cannot find definition for function '${token.txt}', compiler error`);
                exit();
            }

            if (varDef.type === "function") {
                const signature = findSignature(token.childs, varDef.signatures);
                if (signature === undefined) {
                    const strSignatures = varDef.signatures.map(
                        signature => signature.ins.map(type => humanReadableType(type)).join(",")
                    ).join("\n");
                    logError(token.loc, `the word '${token.txt}' expects one of the following signatures:\n${strSignatures}, no one found!`);
                    exit();
                }                
                return signature.ins;
            }
            return [];
        },
        out: token => {
            const varName = token.txt;
            const varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, `cannot find definition for function '${token.txt}', compiler error`);
                exit();
            }

            if (varDef.type === "function") {
                const signature = findSignature(token.childs, varDef.signatures);
                if (signature === undefined) {
                    const strSignatures = varDef.signatures.map(
                        signature => signature.ins.map(type => humanReadableType(type)).join(",")
                    ).join("\n");
                    logError(token.loc, `the word '${token.txt}' expects one of the following signatures:\n${strSignatures}, no one found!`);
                    exit();
                }
                return signature.out;
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

            const valueType = varDef.type === "function" ? token.functionSignature?.out : token.out;
            const asmVarName = getAsmVarName(token);
            if (valueType === undefined) {
                logError(token.loc, `cannot determine the result type of function '${varName}', compiler error`);
                exit();
            }

            if (varDef.isGlobalContext) return getAsmForGetWordGlobal(token, valueType, asmVarName, varDef.type === "function", target);

            //const offset = getWordOffset(token.context, varName, target);
            const { offset, levelToSkip } = getWordOffsetAndLevel(token.context, varName, target);
            const callee = varDef.type === "function" ? token.functionSignature?.token : varDef.token;
            if (callee === undefined) {
                logError(token.loc, `cannot determine the callee of the word '${varName}', compiler error`);
                exit();
            }
            return getAsmForGetWordLocalUsingOffsetAndLevel(valueType, token, callee, varDef.type === "function", offset, target);

            //return getAsmForGetWordLocal(valueType, offset, varDef.type === "function", target);
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

            const valueType = varDef.type === "function" ? token.functionSignature?.out : varDef.out;
            if (valueType === undefined) {
                logError(token.loc, `cannot determine the result type of function '${varName}', compiler error`);
                exit();
            }

            if (varDef.isGlobalContext) {
                if (varDef.type === "function") {
                    const addr = simEnv.vars[getAsmVarName(token)];
                    if (addr === undefined) {
                        logError(token.loc, `'${token.txt}' vars is undefined`);
                        exit();
                    }
                    const addressIndex = readNumberFromHeap(simEnv, addr);
                    const functionToken = simEnv.addresses[addressIndex];
                    simEnv.retStack.push(token);

                    // before calling the procedure
                    // we push the pointers of the static context and the dynamic one
                    const addrOfStaticContext = -1;
                    const addrOfDynamicContext = -1;
                    simEnv.ctxStack.push(addrOfStaticContext);
                    simEnv.ctxStack.push(addrOfDynamicContext);

                    return [functionToken, false];
                } else {
                    simGetWordGlobal(simEnv, token, valueType, getAsmVarName(token));
                }

            } else {                
                const { offset, levelToSkip } = getWordOffsetAndLevel(token.context, getAsmVarName(token), "sim");
                if (varDef.type === "function") {
                    const addressIndex = simGetValueFromOffsetAndLevel(simEnv, token.context!, offset, levelToSkip);
                    const functionToken = simEnv.addresses[addressIndex];
                    simEnv.retStack.push(token);

                    // before calling the procedure
                    // we push the pointers of the static context and the dynamic one
                    const addrOfStaticContext = simGetAddressOfStaticContext(simEnv, token, functionToken);                    
                    simEnv.ctxStack.push(addrOfStaticContext);                    
                    return [functionToken, false];
                } else {
                    const addressInStack = simGetIndexFromOffsetAndLevel(simEnv, token.context!, offset, levelToSkip);
                    simGetWordLocal(simEnv, token, varDef.internalType, addressInStack);
                }
            }
        },
        preprocessTokens: (sequence, _createVocabulary) => {
            const varName = sequence[0].txt;
            const varDef = getWordDefinition(sequence[0].context, varName);

            //if (varDef === undefined || varDef.type !== "function" || !varDef.isMacro) return;
            if (varDef?.type === "function" && varDef?.isMacro) {
                sequence[0].priority = 1000;                

                const signature = findSignature(sequence.slice(1), varDef.signatures);
                const parameterList = signature?.ins;

                if (parameterList === undefined) {
                    logError(sequence[0].loc, `cannot determine the parameter list of function '${varName}', compiler error`);
                    exit();
                }
                for (let i = 0; i < parameterList.length; i++) {
                    const paramType = parameterList[i];
                    const token = sequence[1 + i];
                    if (paramType === "word" && token.type === TokenType.WORD) {
                        // try to convert word to word literal
                        createLiteralFromToken(token, "word");
                    } else if (paramType === "word" && (token.type === TokenType.LITERAL && token.internalValueType !== "word")) {
                        createLiteralFromToken(token, "word");
                        token.txt = token.sourceTxt;
                    } else if (areTypesEqual(paramType, ["array", "word"]) && token.type === TokenType.BLOCK) {
                        token.type = TokenType.WORD_BLOCK;
                    }
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
        sim: (_simEnv, token) => {
            // if the condition is true, must repeat the while
            if (token.auxSimValue === 1) {
                return [token, false];
            }
        },
        generateChildPreludeAsm: (_ast, n, target) => {
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
        generateAsm: (_token, target) => {
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
        generateAsm: (_token) => [
            "JSR POP16",
            "LDY STACKACCESS",
            "JSR POP16",
            "TYA",
            "LDY #0",
            "STA (STACKACCESS),Y"
        ],
        sim: (simEnv, _token) => {
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
        sim: (simEnv, _token) => {
            simEnv.dataStack.push(simEnv.memory[stackPop(simEnv)]);
        },
        generateAsm: (_token, target) => {
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
            if (type === "addr" || type === "string" || type === "word" || type === "void") {
                logError(token.childs[0].loc, `expected Number, Byte or Boolean, but '${token.childs[0].txt}' is ${humanReadableType(type)}`);
                exit();
            }
            return [type];
        },
        out: () => "byte",
        generateAsm: () => [],
        sim: (simEnv, _token) => {
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
        generateAsm: () => [],
        sim: () => { }
    };
    voc[TokenType.CAST_STRING] = {
        txt: "!str",
        expectedArity: 1,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: (token) => {
            assertChildNumber(token, 1);
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType instanceof Array || valueType === "record" || valueType === "void") {
                logError(token.loc, `'${token.txt}' type is '${humanReadableType(valueType)}', cannot covert to a string`);
                exit();
            }
            return [valueType];
        },
        out: () => "string",
        generateAsm: (token, target) => {
            assertChildNumber(token, 1);
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType instanceof Array || valueType === "record" || valueType === "void") {
                logError(token.loc, `'${token.txt}' type is '${humanReadableType(valueType)}', cannot covert to a string`);
                exit();
            }
            if (valueType === "string" || valueType === "word") return [];
            if (target === "c64") {
                if (valueType === "addr" || valueType === "number" || valueType === "byte") {
                    return [
                        "JSR NUM2STR",
                    ]
                }
                if (valueType === "bool") {
                    return [
                        "JSR BOOL2STR",
                    ]
                }
            }
            if (target === "freebsd") {
                if (valueType === "addr" || valueType === "number" || valueType === "byte") {
                    return [
                        "JSR num2str",
                    ]
                }
                if (valueType === "bool") {
                    return [
                        "JSR bool2str",
                    ]
                }
            }
            console.log(`target system '${target}' unknown`);
            exit();
        },
        sim: (simEnv, token) => {
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType instanceof Array || valueType === "record" || valueType === "void") {
                logError(token.loc, `'${token.txt}' type is '${humanReadableType(valueType)}', cannot covert to a string`);
                exit();
            }
            if (valueType === "string" || valueType === "word") return;

            const value = stackPop(simEnv);
            if (valueType === "addr" || valueType === "number" || valueType === "byte") {
                const str = String(value);
                simEnv.dataStack.push(str.length);
                simEnv.dataStack.push(storeStringOnHeap(simEnv, str));
            } else {
                simEnv.dataStack.push(value === 1 ? "Y".charCodeAt(0) : "N".charCodeAt(0));
            }
        }
    };
    voc[TokenType.CAST_WORD] = {
        txt: "!word",
        expectedArity: 1,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: (token) => {
            assertChildNumber(token, 1);
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType instanceof Array || valueType === "record" || valueType === "void") {
                logError(token.loc, `'${token.txt}' type is '${humanReadableType(valueType)}', cannot covert to a string`);
                exit();
            }
            return [valueType];
        },
        out: () => "word",
        generateAsm: (token, target) => {
            assertChildNumber(token, 1);
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType instanceof Array || valueType === "record" || valueType === "void") {
                logError(token.loc, `'${token.txt}' type is '${humanReadableType(valueType)}', cannot covert to a string`);
                exit();
            }
            if (valueType === "string" || valueType === "word") return [];
            if (target === "c64") {
                if (valueType === "addr" || valueType === "number" || valueType === "byte") {
                    return [
                        "JSR NUM2STR",
                    ]
                }
                if (valueType === "bool") {
                    return [
                        "JSR BOOL2STR",
                    ]
                }
            }
            if (target === "freebsd") {
                if (valueType === "addr" || valueType === "number" || valueType === "byte") {
                    return [
                        "JSR num2str",
                    ]
                }
                if (valueType === "bool") {
                    return [
                        "JSR bool2str",
                    ]
                }
            }
            console.log(`target system '${target}' unknown`);
            exit();
        },
        sim: (simEnv, token) => {
            const valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType instanceof Array || valueType === "record" || valueType === "void") {
                logError(token.loc, `'${token.txt}' type is '${humanReadableType(valueType)}', cannot covert to a string`);
                exit();
            }
            if (valueType === "string" || valueType === "word") return;

            const value = stackPop(simEnv);
            if (valueType === "addr" || valueType === "number" || valueType === "byte") {
                const str = String(value);
                simEnv.dataStack.push(str.length);
                simEnv.dataStack.push(storeStringOnHeap(simEnv, str));
            } else {
                simEnv.dataStack.push(value === 1 ? "Y".charCodeAt(0) : "N".charCodeAt(0));
            }
        }
    };    
    voc[TokenType.CAST_BOOL] = {
        txt: "!bool",
        expectedArity: 1,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: token => {
            assertChildNumber(token, 1);
            const type = getReturnTypeOfAWord(token.childs[0]);
            if (type === "addr" || type === "string" || type === "word" || type === "void") {
                logError(token.childs[0].loc, `expected Number, Byte or Boolean, but '${token.childs[0].txt}' is ${humanReadableType(type)}`);
                exit();
            }
            return [type];
        },
        out: () => "bool",
        generateAsm: () => [],
        sim: (simEnv, _token) => {
            simEnv.dataStack.push(stackPop(simEnv) !== 0 ? 1 : 0);
        },
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
        generateAsm: _token => {
            return []
        },
        sim: (_simEnv, _token) => { }
    };
    voc[TokenType.WORD_TYPE] = {
        txt: "Word",
        expectedArity: 0,
        expectedArityOut: 1,
        grabFromStack: true,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: () => [],
        out: () => "word",
        generateAsm: _token => {
            return []
        },
        sim: () => { }
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
            //if (childReturnType === "word" || childReturnType === "void") {
            if (childReturnType === "void") {
                logError(token.childs[0].loc, `'${token.childs[0].txt}' cannot get the address of ${humanReadableType(childReturnType)}`);
                exit();
            }
            return [childReturnType];
        },
        out: () => "number",
        generateChildPreludeAsm: (token) => {
            const tokenVar = token.childs[0];
            if (tokenVar.type === TokenType.LITERAL) return [];
            return undefined;
        },
        generateAsm: (token, target) => {
            assertChildNumber(token, 1);
            const tokenVar = token.childs[0];
            if (tokenVar.type === TokenType.LITERAL) {
                return getAsmAddressOfLiteral(token.context!, tokenVar.internalValueType!, target);
            }
            const varName = tokenVar.txt;
            const varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, `addr! generateAsm cannot find declaration for '${varName}', compiler error`);
                exit();
            }
            if (varDef.type !== "value") {
                logError(token.loc, `addr! generateAsm cannot compute the address of '${varName} because it's a ${varDef.type}', compiler error`);
                exit();
            }

            return getAsmAddressOfWord(token, varDef, varName, target);
        },
        sim: (simEnv, token) => {
            const childReturnType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof childReturnType === "string" && (childReturnType !== "string" && childReturnType !== "word")) {
                logError(token.childs[0].loc, `the return type of '${token.childs[0].txt}' is ${humanReadableType(token.childs[0].out)} but it should be a struct type or a string`);
                exit();
            }
            if (childReturnType === "string" || childReturnType === "word" || childReturnType[0] === "array") {
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
        priority: 90,
        userFunction: false,
        ins: (token) => {
            assertChildNumber(token, 2);
            const childType1 = getReturnTypeOfAWord(token.childs[0]);
            const childType2 = getReturnTypeOfAWord(token.childs[1]);
            if (childType1 !== "string" && childType1 !== "word") {
                logError(token.childs[0].loc, `'${token.childs[0].txt}' should be a word or a string, but it's '${humanReadableType(childType1)}'`);
                exit();
            }
            if (childType2 !== "string" && childType2 !== "word") {
                logError(token.childs[1].loc, `'${token.childs[1].txt}' should be a word or a string, but it's '${humanReadableType(childType2)}'`);
                exit();
            }
            return [childType1, childType2];
        },
        out: () => "string",
        generateAsm: (_token, target) => {
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
        sim: (simEnv, _token) => {
            nStrJoin++;
            const addr2 = stackPop(simEnv);
            const len2 = stackPop(simEnv);
            const addr1 = stackPop(simEnv);
            const len1 = stackPop(simEnv);
            const lastHeapTop = simEnv.heapTop;
            // if the two strings are adjacent then simply returns the address of the first and the sum of the lenghts
            if (addr2 === addr1 + len1) {
                simEnv.dataStack.push(len1 + len2);
                simEnv.dataStack.push(addr1);
            } else if (addr1 + len1 === simEnv.heapTop) {
                const newAddr2 = storeStringOnHeap(simEnv, readStringFromHeap(simEnv, addr2, len2));
                simEnv.dataStack.push(len1 + len2);
                simEnv.dataStack.push(addr1);
            } else {
                const result = readStringFromHeap(simEnv, addr1, len1) + readStringFromHeap(simEnv, addr2, len2);
                const addr = storeStringOnHeap(simEnv, result);
                simEnv.dataStack.push(len1 + len2);
                simEnv.dataStack.push(addr);
            }
            //console.log("JOIN n.", nStrJoin, "HEAP TOP:", simEnv.heapTop);
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
        sim: (simEnv, _token) => {
            simEnv.dataStack.push(simEnv.dataStack.length);
        },
        generateAsm: (_token, target) => {
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
    voc[TokenType.LENGHT] = {
        txt: "#",
        expectedArity: 1,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: (token) => {
            assertChildNumber(token, 1);
            const childType = getReturnTypeOfAWord(token.childs[0]);
            if (!(childType === "string" || childType === "word" || (childType instanceof Array && childType[0] === "array"))) {
                logError(token.loc, `'${token.txt}' length expects a string or an array`);
                exit();
            }
            return [childType];
        },
        out: () => "number",
        generateAsm: (_token, target) => {
            if (target === "c64") {
                return ["JSR POP16"];
            }
            if (target === "freebsd") {
                return ["pop rax"];
            }
            console.log(`target system '${target}' unknown`);
            exit();
        },
        sim: (simEnv, _token) => {
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
                    "END_PRG:",
                    "JMP END_PRG",
                    "BCD DS 3 ; USED IN BIN TO BCD",
                    "ASCIIBCD DS 6; USED IN NUM TO STR",
                    "HEAPSAVE DS 3 ; USED IN COPYSTRING",
                    "AUXMUL DS 2",
                    //"HEAPTOP DS 2",
                    "TEST_UPPER_BIT: BYTE $80",
                    "SAVE_X = $74", // used in EMIT
                    "SAVE_Y = $75", // used in EMIT and IN DIV
                    "CURX = $76",
                    "CURY = $77",
                    "CURSOR = $78",
                    "HEAPTOP = $7A",
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
                    "JSR EMIT",
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

                    //SCREEN
                    "CLS:",
                    "LDX #4",
                    "STX CURSOR+1",
                    "LDX #0",
                    "STX CURX",
                    "STX CURY",
                    "STX CURSOR",
                    "LDA #$20",
                    "LOOP_CLS:",
                    "STA $0400,X", // write 4 bytes per loop
                    "STA $04FA,X",
                    "STA $05F4,X",
                    "STA $06EE,X",
                    "INX",
                    "CPX #$FA",
                    "BNE LOOP_CLS",
                    "RTS",

                    "EMIT:",
                    "STX SAVE_X",
                    "STY SAVE_Y",
                    "CMP #13",
                    "BNE EMIT_IS_CLS",
                    "SEC",
                    "LDA #40",
                    "SBC CURX",
                    "CLC",
                    "ADC CURSOR",
                    "BCC EMIT_NO_CARRY_ON_NL",
                    "INC CURSOR+1",
                    "EMIT_NO_CARRY_ON_NL:",
                    "STA CURSOR",
                    "JMP NEW_LINE",
                    "EMIT_IS_CLS:",
                    "CMP #147",
                    "BEQ CLS",
                    "LDY #0",
                    "CMP #$20",
                    "BCC DDREV",
                    "CMP #$60",
                    "BCC DD1",
                    "CMP #$80",
                    "BCC DD2",
                    "CMP #$A0",
                    "BCC DD3",
                    "CMP #$C0",
                    "BCC DD4",
                    "CMP #$FF",
                    "BCC DDREV",
                    "LDA #$7E",
                    "BNE DDEND",
                    "DD2:",
                    "AND #$5F",
                    "BNE DDEND",
                    "DD3:",
                    "ORA #$40",
                    "BNE DDEND",
                    "DD4:",
                    "EOR #$C0",
                    "BNE DDEND",
                    "DD1:",
                    "AND #$3F",
                    "BPL DDEND",
                    "DDREV:",
                    "EOR #$80",
                    "DDEND:",
                    "STA (CURSOR),Y",
                    "INC CURSOR",
                    "BNE EMIT_NO_CARRY",
                    "INC CURSOR+1",
                    "EMIT_NO_CARRY:",
                    "INC CURX",
                    "LDA #40",
                    "CMP CURX",
                    "BNE EMIT_EXIT",
                    "NEW_LINE:",
                    "LDA #0",
                    "STA CURX",
                    "INC CURY",
                    "LDX #25",
                    "CPX CURY",
                    "BNE EMIT_EXIT",
                    "DEX",
                    "TXA",
                    "STA CURY",
                    "LDA #$C0",
                    "STA CURSOR",
                    "LDA #$07",
                    "STA CURSOR+1",
                    "JSR SCROLL_UP",
                    "EMIT_EXIT:",
                    "LDX SAVE_X",
                    "LDY SAVE_Y",
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
                    "JSR EMIT",

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
                    "JSR EMIT",

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
                    "JSR EMIT",

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
                    "JSR EMIT",

                    "DIGIT_5:",
                    "LDA BCD+0",
                    "AND #$0F",
                    "CLC",
                    "ADC #$30",
                    "JSR EMIT",
                    "RTS",

                    "BOOL2STR:",
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "BNE B2S_true",
                    "LDA #78 ; 'N'",
                    "JMP B2S_memo",
                    "B2S_true:",
                    "LDA #89 ; 'Y'",

                    "B2S_memo:",
                    "LDY #0",
                    "STA (HEAPTOP),Y",
                    "LDA #1",
                    "STA STACKACCESS",
                    "LDA #0",
                    "STA STACKACCESS+1",
                    "JSR PUSH16",               // push len

                    "CLC",
                    "LDA HEAPTOP",
                    "STA STACKACCESS",
                    "ADC #1",
                    "STA HEAPTOP",
                    "LDA HEAPTOP+1",
                    "STA STACKACCESS+1",
                    "ADC #0",
                    "STA HEAPTOP+1",
                    "JSR PUSH16",               // push addr
                    "RTS",

                    "NUM2STR:",
                    "JSR POP16",
                    "LDY #0",
                    "JSR BINBCD16",
                    "LDA BCD+2",
                    "AND #$0F",
                    "BEQ N2S_DIGIT2",
                    "CLC",
                    "ADC #$30",
                    "STA ASCIIBCD,Y",
                    "INY",

                    "N2S_DIGIT2:",
                    "LDA BCD+1",
                    "LSR",
                    "LSR",
                    "LSR",
                    "LSR",
                    "BNE N2S_DO_DIGIT_2",
                    "CPY #00",
                    "BEQ N2S_DIGIT_3",
                    "N2S_DO_DIGIT_2:",
                    "CLC",
                    "ADC #$30",
                    "STA ASCIIBCD,Y",
                    "INY",

                    "N2S_DIGIT_3:",
                    "LDA BCD+1",
                    "AND #$0F",
                    "BNE N2S_DO_DIGIT_3",
                    "CPY #00",
                    "BEQ N2S_DIGIT_4",
                    "N2S_DO_DIGIT_3:",
                    "CLC",
                    "ADC #$30",
                    "STA ASCIIBCD,Y",
                    "INY",

                    "N2S_DIGIT_4:",
                    "LDA BCD+0",
                    "LSR",
                    "LSR",
                    "LSR",
                    "LSR",
                    "BNE N2S_DO_DIGIT_4",
                    "CPY #00",
                    "BEQ N2S_DIGIT_5",
                    "N2S_DO_DIGIT_4:",
                    "CLC",
                    "ADC #$30",
                    "STA ASCIIBCD,Y",
                    "INY",

                    "N2S_DIGIT_5:",
                    "LDA BCD+0",
                    "AND #$0F",
                    "CLC",
                    "ADC #$30",
                    "STA ASCIIBCD,Y",
                    "INY",
                    "STY STACKACCESS",
                    "LDA #0",
                    "STA STACKACCESS+1",
                    "JSR PUSH16",           // push len

                    // start of first string in FROMADD
                    "LDA #<ASCIIBCD",
                    "STA FROMADD + 1",
                    "LDA #>ASCIIBCD",
                    "STA FROMADD + 2",

                    // DESTINATION
                    "LDA HEAPTOP",
                    "STA TOADD + 1",
                    "STA STACKACCESS",
                    "LDA HEAPTOP + 1",
                    "STA TOADD + 2",
                    "STA STACKACCESS+1",
                    "JSR PUSH16",           // push addr

                    "CLC",
                    "TYA",
                    "ADC HEAPTOP",
                    "STA HEAPTOP",
                    "LDA HEAPTOP+1",
                    "ADC #0",
                    "STA HEAPTOP+1",

                    "JSR COPYMEM",
                    "RTS",

                    "MUL16:",
                    "LDX SP16",
                    "LDA STACKBASE + 3,X",  // Get the multiplicand and",
                    "STA AUXMUL",           // put it in the scratchpad.",
                    "LDA STACKBASE + 4,X",
                    "STA AUXMUL + 1",
                    "PHA",
                    "LDA #0",
                    "STA STACKBASE + 3",    // Zero - out the original multiplicand area",
                    "STA STACKBASE + 4",
                    "PLA",
                    "LDY #$10",             // We'll loop 16 times
                    "shift_loop:",
                    "ASL STACKBASE + 3,X",  // Shift the entire 32 bits over one bit position
                    "ROL STACKBASE + 4,X",
                    "ROL STACKBASE + 1,X",
                    "ROL STACKBASE + 2,X",
                    "BCC skip_add",          // Skip the adding -in to the result if the high bit shifted out was 0
                    "CLC",                   // Else, add multiplier to intermediate result
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
                    "DEY",                      // If we haven't done 16 iterations yet
                    "BNE shift_loop",           // then go around again
                    "INX",
                    "INX",
                    "STX SP16",
                    "RTS",

                    "DIV16WITHMOD:",
                    "LDX SP16",
                    // ADD TWO SPACES ON STACK
                    "DEX",
                    "DEX",

                    // REMAINDER        STACKBASE + 1,X  
                    // REMAINDER + 1    STACKBASE + 2,X
                    // DIVISOR          STACKBASE + 3,X
                    // DIVISOR + 1      STACKBASE + 4,X
                    // DIVIDEND         STACKBASE + 5,X
                    // DIVIDEND + 1     STACKBASE + 6,X
                    // RESULT           STACKBASE + 5,X (the same as dividend)
                    // RESULT + 1       STACKBASE + 6,X

                    "LDA #0",	                    // PRESET REMAINDER TO 0
                    "STA STACKBASE + 1,X",
                    "STA STACKBASE + 2,X",
                    "LDY #16",                      // REPEAT FOR EACH BIT: ...

                    "DIV16WITHMOD_DIVLOOP:",
                    "ASL STACKBASE + 5,X",	        // DIVIDEND LB & HB * 2, MSB -> CARRY
                    "ROL STACKBASE + 6,X",
                    "ROL STACKBASE + 1,X",          // REMAINDER LB & HB * 2 + MSB FROM CARRY
                    "ROL STACKBASE + 2,X",
                    "LDA STACKBASE + 1,X",
                    "SEC",
                    "SBC STACKBASE + 3,X",          // SUBSTRACT DIVISOR TO SEE IF IT FITS IN
                    "STA SAVE_Y",                   // LB RESULT -> SAVE_Y, FOR WE MAY NEED IT LATER
                    "LDA STACKBASE + 2,X",
                    "SBC STACKBASE + 4,X",
                    "BCC DIV16WITHMOD_SKIP",        // IF CARRY = 0 THEN DIVISOR DIDN'T FIT IN YET

                    "STA STACKBASE + 2,X",          // ELSE SAVE SUBSTRACTION RESULT AS NEW REMAINDER,
                    "LDA SAVE_Y",
                    "STA STACKBASE + 1,X",
                    "INC STACKBASE + 5,X",          // AND INCREMENT RESULT CAUSE DIVISOR FIT IN 1 TIMES

                    "DIV16WITHMOD_SKIP:",
                    "DEY",
                    "BNE DIV16WITHMOD_DIVLOOP",

                    // CLEANUP
                    "LDA STACKBASE + 1,X",
                    "STA STACKBASE + 3,X",
                    "LDA STACKBASE + 2,X",
                    "STA STACKBASE + 4,X",
                    "INX",
                    "INX",
                    "RTS",


                    // https://www.ahl27.com/posts/2023/01/SIXTH-div/
                    // MAX ITERATIONS IS 16 = 0X10, SINCE WE HAVE 16 BIT NUMBERS
                    "DIV16WITHMOD_OLD:",
                    "LDX SP16",
                    "LDY #$10",
                    // ADD TWO SPACES ON STACK
                    "DEX",
                    "DEX",
                    "DEX",
                    "DEX",

                    "LDA #0",
                    "STA STACKBASE + 1,X", // REMAINDER
                    "STA STACKBASE + 2,X",
                    "STA STACKBASE + 3,X", // QUOTIENT
                    "STA STACKBASE + 4,X",
                    // +5 - 6 IS DENOMINATOR",
                    // +7 - 8 IS NUMERATOR",

                    // SET UP THE NUMERATOR
                    "LDA #0",
                    "ORA STACKBASE + 8,X",
                    "ORA STACKBASE + 7,X",
                    "BEQ EARLYEXIT",

                    // CHECKING IS DENOMINATOR IS ZERO(IF SO WE'LL JUST STORE ZEROS)",
                    "LDA #0",
                    "ORA STACKBASE + 6,X",
                    "ORA STACKBASE + 5,X",
                    "BNE DIVMODLOOP1",

                    "EARLYEXIT:",
                    // NUMERATOR OR DENOMINATOR ARE ZERO, JUST RETURN
                    "LDA #0",
                    "STA STACKBASE + 6,X",
                    "STA STACKBASE + 5,X",
                    "INX",
                    "INX",
                    "INX",
                    "INX",
                    "RTS",

                    // TRIM DOWN TO LEADING BIT
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

                    // MAIN DIVISION LOOP
                    // LEFT - SHIFT THE REMAINDER
                    "DIVMODLOOP2:",
                    "CLC",
                    "ASL STACKBASE + 1,X",
                    "ROL STACKBASE + 2,X",

                    // LEFT - SHIFT THE QUOTIENT
                    "CLC",
                    "ASL STACKBASE + 3,X",
                    "ROL STACKBASE + 4,X",

                    // SET LEAST SIGNIFICANT BIT TO BIT I OF NUMERATOR
                    "CLC",
                    "ASL STACKBASE + 7,X",
                    "ROL STACKBASE + 8,X",
                    "LDA STACKBASE + 1,X",
                    "ADC #0",
                    "STA STACKBASE + 1,X",
                    "LDA STACKBASE + 2,X",
                    "ADC #0",
                    "STA STACKBASE + 2,X",

                    // COMPARE REMAINDER TO DENOMINATOR
                    // UPPER BYTE(STACKBASE + 2 IS ALREADY IN A)
                    "CMP STACKBASE + 6,X",
                    "BMI SKIP",                     // IF R < D, SKIP TO NEXT ITERATION ",
                    "BNE SUBTRACT",                 // IF R > D, WE CAN SKIP COMPARING LOWER BYTE",
                    // IF R = D, WE HAVE TO CHECK THE LOWER BYTE",

                    // LOWER BYTE
                    "LDA STACKBASE + 1,X",
                    "CMP STACKBASE + 5,X",
                    "BMI SKIP",

                    // SUBTRACT DENOMINATOR FROM REMAINDER
                    // SUBTRACT LOWER BYTE
                    "SUBTRACT:",
                    "SEC",
                    "LDA STACKBASE + 1,X",
                    "SBC STACKBASE + 5,X",
                    "STA STACKBASE + 1,X",

                    // SUBTRACT UPPER BYTE
                    "LDA STACKBASE + 2,X",
                    "SBC STACKBASE + 6,X",
                    "STA STACKBASE + 2,X",

                    // ADD ONE TO QUOTIENT
                    "INC STACKBASE + 3,X",
                    "SKIP:",
                    "DEY",
                    "BEQ EXIT",
                    "JMP DIVMODLOOP2",

                    // CLEANUP
                    "EXIT:",
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

                    "PUSHHEAP8:",
                    "LDA HEAPTOP",
                    "STA AUX",
                    "LDA HEAPTOP+1",
                    "STA AUX+1",
                    "LDY #0",
                    "LDA STACKACCESS",
                    "STA (AUX),Y",
                    "INC HEAPTOP",
                    "BNE PUSHHEAP8_NO_CARRY",
                    "INC HEAPTOP+1",
                    "PUSHHEAP8_NO_CARRY:",
                    "RTS",

                    "PUSHHEAP16:",
                    "LDA HEAPTOP",
                    "STA AUX",
                    "LDA HEAPTOP+1",
                    "STA AUX+1",
                    "LDY #0",
                    "LDA STACKACCESS",
                    "STA (AUX),Y",
                    "INY",
                    "LDA STACKACCESS+1",
                    "STA (AUX),Y",
                    "CLC",
                    "LDA HEAPTOP",
                    "ADC #02",
                    "STA HEAPTOP",
                    "LDA HEAPTOP+1",
                    "ADC #0",
                    "STA HEAPTOP+1",
                    "RTS",

                    "SCROLL_UP:",
                    "LDX #39",
                    "LOOP_SCROLL_COLUMN:",
                    "LDA 1064,X",
                    "STA 1024,X",
                    "LDA 1104,X",
                    "STA 1064,X",
                    "LDA 1144,X",
                    "STA 1104,X",
                    "LDA 1184,X",
                    "STA 1144,X",
                    "LDA 1224,X",
                    "STA 1184,X",
                    "LDA 1264,X",
                    "STA 1224,X",
                    "LDA 1304,X",
                    "STA 1264,X",
                    "LDA 1344,X",
                    "STA 1304,X",
                    "LDA 1384,X",
                    "STA 1344,X",
                    "LDA 1424,X",
                    "STA 1384,X",
                    "LDA 1464,X",
                    "STA 1424,X",
                    "LDA 1504,X",
                    "STA 1464,X",
                    "LDA 1544,X",
                    "STA 1504,X",
                    "LDA 1584,X",
                    "STA 1544,X",
                    "LDA 1624,X",
                    "STA 1584,X",
                    "LDA 1664,X",
                    "STA 1624,X",
                    "LDA 1704,X",
                    "STA 1664,X",
                    "LDA 1744,X",
                    "STA 1704,X",
                    "LDA 1784,X",
                    "STA 1744,X",
                    "LDA 1824,X",
                    "STA 1784,X",
                    "LDA 1864,X",
                    "STA 1824,X",
                    "LDA 1904,X",
                    "STA 1864,X",
                    "LDA 1944,X",
                    "STA 1904,X",
                    "LDA 1984,X",
                    "STA 1944,X",
                    "DEX",
                    "BMI EXIT_LOOP_SCROLL_COLUMN",
                    "JMP LOOP_SCROLL_COLUMN",
                    "EXIT_LOOP_SCROLL_COLUMN:",
                    "LDA #32",
                    "STA 1984",
                    "STA 1985",
                    "STA 1986",
                    "STA 1987",
                    "STA 1988",
                    "STA 1989",
                    "STA 1990",
                    "STA 1991",
                    "STA 1992",
                    "STA 1993",
                    "STA 1994",
                    "STA 1995",
                    "STA 1996",
                    "STA 1997",
                    "STA 1998",
                    "STA 1999",
                    "STA 2000",
                    "STA 2001",
                    "STA 2002",
                    "STA 2003",
                    "STA 2004",
                    "STA 2005",
                    "STA 2006",
                    "STA 2007",
                    "STA 2008",
                    "STA 2009",
                    "STA 2010",
                    "STA 2011",
                    "STA 2012",
                    "STA 2013",
                    "STA 2014",
                    "STA 2015",
                    "STA 2016",
                    "STA 2017",
                    "STA 2018",
                    "STA 2019",
                    "STA 2020",
                    "STA 2021",
                    "STA 2022",
                    "STA 2023",
                    "RTS",
                ];

                const literalStrings = stringTable.map((str, index) => {
                    const parts = str.match(/(.{0,50})/g);
                    if (parts === null) return "";
                    let strAsBytes = `str${index}:` + "\n";
                    for (let j = 0; j < parts!.length; j++) {
                        const bytes: string[] = [];
                        for (let i = 0; i < parts[j].length; i++) {
                            bytes.push(String(parts[j][i].charCodeAt(0) & 255));
                        }
                        const strBytes = bytes.join(",");
                        strAsBytes += `    BYTE ${strBytes}` + "\n";
                    }
                    return strAsBytes;
                });

                const vars: string[] = [];
                if (token.context !== undefined) {
                    for (let i = 0; i < Object.entries(token.context.varsDefinition).length; i++) {
                        const [name, varDef] = Object.entries(token.context.varsDefinition)[i];                        
                        if (varDef.type === "function") {
                            const size = sizeOfValueType(token.context, "addr", target);
                            for (let i = 0; i < varDef.signatures.length; i++) {
                                const variableName = getAsmVarName(varDef.signatures[i].token);
                                vars.push(`${variableName} DS ${size}`);
                            }
                        } else {
                            const variableName = getAsmVarName(varDef.token);
                            const size = sizeOfValueType(token.context, varDef.out, target);
                            vars.push(`${variableName} DS ${size}`);
                        }
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
                        if (varDef.type === "function") {
                            const size = sizeOfValueType(token.context, "addr", target);
                            for (let i = 0; i < varDef.signatures.length; i++) {
                                const variableName = getAsmVarName(varDef.signatures[i].token);
                                vars.push(`${variableName}: resb ${size}`);
                            }
                        } else {
                            const variableName = getAsmVarName(varDef.token);
                            const size = sizeOfValueType(token.context, varDef.out, target);
                            vars.push(`${variableName}: resb ${size}`);
                        }
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
        generatePreludeAsm: (_ast, target) => {
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
                "JSR CLS",
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
        simPrelude: (simEnv, _ast) => {
            simEnv.buffer = "";
            simEnv.dataStack = [];
            simEnv.ctxStack = [];
            simEnv.memory = new Uint8Array(640 * 1024 * 1024);
            simEnv.heapTop = 0;
            simEnv.vars = {};
        },
        sim: (_simEnv, _token) => {

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
        simPreludeChild: (_simEnv, _token, _n) => {
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
                // const offset = getWordOffset(token.context, varName, "sim");
                // const indexOnCtxStack = simEnv.ctxStack.length - 1 - offset;

                const { offset, levelToSkip } = getWordOffsetAndLevel(token.context, varName, "sim");
                const addressInStack = simGetIndexFromOffsetAndLevel(simEnv, token.context!, offset, levelToSkip);
                simEnv.ctxStack[addressInStack]++;
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
            if (varDef.type === "function") {
                logError(child.loc, `Cannot increment a function '${varName}', compiler error`);
                exit();
            }
            const { offset, levelToSkip } = getWordOffsetAndLevel(token.context, varName, target);
            if (target === "c64") {
                if (varDef.isGlobalContext) {
                    const asmVarName = getAsmVarName(child);

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
                const ret: Assembly = [];                
                ret.push(...getAsmPutWordAddressOnTOS(varDef.internalType, token, varDef.token, offset, false, target));

                if (varDef.internalType === "byte") {
                    ret.push(...[
                        "JSR POP16",
                        "LDY #0",
                        "CLC",
                        "LDA (STACKACCESS),Y",
                        "ADC #1",
                        "STA (STACKACCESS),Y",
                    ]);
                } else {
                    ret.push(...[
                        "JSR POP16",
                        "LDY #0",
                        "CLC",
                        "LDA (STACKACCESS),Y",
                        "ADC #1",
                        "STA (STACKACCESS),Y",
                        "INY",
                        "LDA (STACKACCESS),Y",
                        "ADC #0",
                        "STA (STACKACCESS),Y"
                    ]);
                }            
                return ret;    
            }
            if (target === "freebsd") {
                if (varDef.isGlobalContext) {
                    const asmVarName = getAsmVarName(child);
                    return [
                        `add qword [${asmVarName}], 1`,
                    ];
                }

                // LOCAL CONTEXT

                if (offset === undefined) {
                    logError(token.loc, `INC generateAsm can't compute the offset of '${varName}' onto the stack, compiler error`);
                    exit();
                }
                return [
                    "mov rax, [ctx_stack_rsp]",
                    `add rax, ${offset}`,
                    "add qword [rax], 1",
                ];

            }
            console.log(`target system '${target}' unknown`);
            exit();
        },
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
            if (firstChild.internalValueType !== "word") {
                logError(firstChild.loc, `the first parameter of struct should be a 'symbol', but '${firstChild.txt}' is a ${humanReadableToken(firstChild.type)}`);
                exit();
            }
            return ["word", valueType];
        },
        out: () => "void",
        generateChildPreludeAsm: (_token, _n) => {
            // childs does not generate asm
            return undefined;
        },
        generateAsm: () => {
            return [];
        },
        preprocessTokens: (ast, _vocabulary) => {
            if (ast[1].type === TokenType.WORD) {
                createLiteralFromToken(ast[1], "word");
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
            return [structChild.out, "word"];
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
        generateChildPreludeAsm: (_token, n) => {
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
            if (secondChild.out !== "word") {
                logError(secondChild.loc, `'${secondChild.txt}' is not a symbol`);
                exit();
            }
            const componentName = secondChild.txt;
            let offset = 0;
            let type;
            for (let i = 0; i < structDef.elements.length; i++) {
                if (structDef.elements[i].name === componentName) {                    
                    type = structDef.elements[i].def;
                    break;
                }
                offset += sizeOfValueType(token.context!, structDef.elements[i].type, target);
            }
            if (type === undefined) {
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
                createLiteralFromToken(ast[2], "word");
            } else if (ast[2].type === TokenType.SET_WORD) {
                createLiteralFromToken(ast[2], "word");
                ast[1].type = TokenType.SET_ARROW;
                addInstrData(ast[1], vocabulary);
            }
        },
        simPreludeChild: (_simEnv, _token, childNumber) => {
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
            if (secondChild.out !== "word") {
                logError(secondChild.loc, `'${secondChild.txt}' is not a symbol`);
                exit();
            }
            const componentName = secondChild.txt;
            let offset = 0;
            let type: VarDefinitionSpec | undefined = undefined;
            for (let i = 0; i < structDef.elements.length; i++) {
                if (structDef.elements[i].name === componentName) {                    
                    type = structDef.elements[i].def;
                    break;
                }
                offset += sizeOfValueType(token.context!, structDef.elements[i].type, "sim");
            }
            if (type === undefined) {
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

            return [["usertype", structName], "word", type.internalType];
        },
        out: () => {
            return "void";
        },
        generateChildPreludeAsm: (_token, n, _target) => {
            if (n === 0) return undefined; // struct name
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
            const varDef = getWordDefinition(structChild.context, structChild.txt);
            if (varDef === undefined) {
                logError(structChild.loc, `cannot find definition for '${structChild.txt}'`);
                exit();
            }

            const structName = structChild.out[1];
            const structDef = getWordDefinition(structChild.context, structName);
            if (structDef?.type !== "struct") {
                logError(structChild.loc, `'${structChild.txt}' is not a struct`);
                exit();
            }

            const componentChild = token.childs[1];
            if (componentChild.out !== "word") {
                logError(componentChild.loc, `'${componentChild.txt}' is not a symbol`);
                exit();
            }
            const componentName = componentChild.txt;
            let offset = 0;
            let type;
            for (let i = 0; i < structDef.elements.length; i++) {
                if (structDef.elements[i].name === componentName) {                    
                    type = structDef.elements[i].def;
                    break;
                }
                offset += sizeOfValueType(token.context!, structDef.elements[i].type, target);
            }
            if (type === undefined) {
                logError(componentChild.loc, `'${componentChild.txt}' is not part of ${structChild.txt}`);
                exit();
            }
            if (varDef.isGlobalContext) {
                const asmVarName = getAsmVarName(structChild);
                return [
                    `LDA ${asmVarName}`,
                    `STA STACKACCESS`,
                    `LDA ${asmVarName} + 1`,
                    `STA STACKACCESS+1`,
                    "JSR PUSH16"
                ].concat(getAsmForSetWordPointedByTOS(type.internalType, offset, "NO", target));
            }

            return getAsmPutWordAddressOnTOS("addr", structChild, structDef.token, 0, false, target)
                .concat(getAsmForSetWordPointedByTOS(type.internalType, offset, "YES", target));
        },
        simPreludeChild: (_simEnv, _token, n) => {
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
            if (componentChild.out !== "word") {
                logError(componentChild.loc, `'${componentChild.txt}' is not a symbol`);
                exit();
            }
            const componentName = componentChild.txt;
            let offset = 0;
            let type;
            for (let i = 0; i < structDef.elements.length; i++) {
                if (structDef.elements[i].name === componentName) {                    
                    type = structDef.elements[i].def;
                    break;
                }
                offset += sizeOfValueType(token.context!, structDef.elements[i].type, "sim");
            }
            if (type === undefined) {
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
            return ["word", "record"];
        },
        out: token => {
            const structName = token.childs[0].txt;
            return ["usertype", structName];
        },
        generateAsm: _token => {
            return [
                "; do heap malloc for size of structure and return back the address"
            ]
        },
        generateChildPreludeAsm: (_ast, n) => {
            if (n === 0) return undefined
            return [];
        },
        preprocessTokens: (ast, _vocabulary) => {
            if (ast[1].type === TokenType.WORD) {
                createLiteralFromToken(ast[1], "word");
            }
            if (ast[2].type === TokenType.BLOCK) {
                ast[2].type = TokenType.RECORD;
            }
        },
        sim: () => { },
        simPreludeChild: (_simEnv, _token, childNumber) => {
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
        ins: _token => {
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

            let recordSize = sizeOfRecord(token.context, target);
            let sizeToRelease = sizeOfContextWithMetadata(token.context, target);
            if (recordSize === 0) return ["; no stack memory to release"];
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
                    "INX", // CTX_SP16 POINTS TO THE FIRST FREE BYTE SO MUST INCREMENTED
                    "STX FROMADD+1",
                    `LDA #${CTX_PAGE}`,
                    "STA FROMADD+2",
                    `LDY #${recordSize}`,
                    "JSR COPYMEM",
                    "CLC",
                    "LDA HEAPTOP",
                    `ADC #${recordSize}`,
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
                    `mov rax, ${recordSize}`,
                    "call allocate",
                    "mov rdi, rbx",
                    "mov rsi, [ctx_stack_rsp]",
                    `mov rcx, ${recordSize}`,
                    "rep movsb",
                    `; release ${recordSize} on the stack`,
                    "mov rax, [ctx_stack_rsp]",
                    `add rax, ${recordSize}`,
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

            const context = token.context;
            if (context.parent === undefined) return []; // the global context
            const sizeToReserve = sizeOfContextWithMetadata(context, target);
            const strVariables = Object.entries(context.varsDefinition).map(
                ([name, varDef]) => name + ` (${sizeOfContextWithMetadata(context, target) - getWordOffsetAndLevel(token.context, name, target).offset - 1
                    }: ${humanReadableType(varDef.internalType)})`
            ).join(", ");
            if (sizeToReserve === 0) return ["; no stack memory to reserve"];

            const sizeOfParentContext = sizeOfContextWithMetadata(context.parent, target);

            if (target === "c64") {
                const ret: Assembly = sizeOfParentContext > 0 ? [
                    "; save the address of the parent context",
                    "LDA CTX_SP16",
                    "TAY",
                    "CLC",
                    `ADC #${sizeOfParentContext}`,
                    `STA ${CTX_PAGE * 256},Y`,
                ] : [
                    "; this is the top context pointer is 0",
                    "LDY CTX_SP16",
                    "LDA #0",
                    `STA ${CTX_PAGE * 256},Y`,
                ]
                ret.push(...[
                    `; reserve ${sizeToReserve} on the stack for: context metadata, ${strVariables}`,
                    "LDA CTX_SP16",
                    "SEC",
                    `SBC #${sizeToReserve}`,
                    "STA CTX_SP16"
                ]);
                return ret;
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

            let sizeToRelease = sizeOfRecord(token.context, "sim");
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

            // let sizeToReserve = 0;
            // for (const [key, varDef] of Object.entries(token.context.varsDefinition)) {                
            //     const valueType = varDef.internalType;
            //     const sizeForType = valueType === "string" || (valueType instanceof Array && valueType[0] === "array") ? 2 : 1
            //     sizeToReserve += sizeForType;
            //     if (sizeForType === 1) {
            //         simEnv.ctxStack.push(0);
            //     } else {
            //         simEnv.ctxStack.push(0);
            //         simEnv.ctxStack.push(0);
            //     }
            // }

            const sizeToReserve = sizeOfRecord(token.context, "sim");
            for (let i = 0; i < sizeToReserve; i++) {
                simEnv.ctxStack.push(0);
            }
        },
    };
    voc[TokenType.ARRAY] = {
        txt: "array",
        expectedArity: 1,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 15,
        userFunction: false,
        ins: token => {
            if (token.childs.length === 1) {
                const firstChild = token.childs[0];
                if (firstChild.type !== TokenType.ARRAY_BLOCK && firstChild.type !== TokenType.WORD_TYPE) {
                    logError(firstChild.loc, `'${firstChild.txt}' should be an array block ora a word type, but it's a ${humanReadableToken(firstChild.type)}`);
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
                sequence[1].type = TokenType.ARRAY_BLOCK;
                addInstrData(sequence[1], vocabulary);
                return;
            }

            if (sequence.length < 2) {
                logError(sequence[0].loc, `'${sequence[0].txt}' expects at least two parameter but one found`);
                exit();
            }
            const nextToken = sequence[1];
            if (isTypeToken(nextToken) || nextToken.type === TokenType.ARRAY) {
                sequence[0].type = TokenType.ARRAY_TYPE;
                addInstrData(sequence[0], vocabulary);
            }
        },
        generateChildPreludeAsm: (_token, n) => {
            if (n === 1) return undefined;
            return [];
        },
        simPreludeChild: (_simEnv, _token, n) => {
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
                const structSize = sizeOfValueType(token.context, secontChildType, target);
                if (target === "c64") {
                    return [
                        // size is on the stack
                        // push the heap
                        "JSR DUP16", // push the len (will be returned)
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
                const structSize = sizeOfValueType(token.context, secontChildType, "sim");

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
        generateAsm: _token => {
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
                const sizeOfElement = sizeOfValueType(token.context!, arrayType[1], target);
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

                        "LDX SP16",
                        "; HERE WE STORE AUX!",
                        "LDA STACKBASE + 1,X",     // save the final address on the normal stack
                        "PHA",
                        "INX",
                        "LDA STACKBASE + 1,X",
                        "PHA",
                        "INX",

                        "INX",
                        "INX",
                        "STX SP16"                  // empty the stack 
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
                const sizeOfElement = sizeOfValueType(token.context!, arrayType[1], "sim") * 8;

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
            return ["; HERE WE NEED AUX!"].concat(getAsmForSetWordPointedByTOS(arrayType[1], 0, "AUXISONSTACK", target));
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
            const childType = getReturnTypeOfAWord(token.childs[0]);
            if (!(childType === "string" || childType === "word" || (childType instanceof Array && childType[0] === "array"))) {
                logError(token.childs[0].loc, `'${token.childs[0].txt}' should be an array or string, it's a ${humanReadableType(childType)}`);
                exit();
            }
            return [childType, "number"]
        },
        out: token => {
            assertChildNumber(token, 2);
            const arrayType = getReturnTypeOfAWord(token.childs[0]);
            if (!(arrayType === "string" || arrayType === "word" || (arrayType instanceof Array && arrayType[0] === "array"))) {
                logError(token.childs[0].loc, `'${token.childs[0].txt}' should be an array or string, it's a ${humanReadableType(arrayType)}`);
                exit();
            }
            return arrayType === "string" || arrayType === "word" ? "string" : arrayType[1];
        },
        sim: (simEnv, token) => {
            assertChildNumber(token, 2);
            const childType = getReturnTypeOfAWord(token.childs[0]);
            if (!(childType === "string" || childType === "word" || (childType instanceof Array && childType[0] === "array"))) {
                logError(token.childs[0].loc, `'${token.childs[0].txt}' should be an array or string or word, it's a ${humanReadableType(childType)}`);
                exit();
            }
            if (childType instanceof Array) {
                const sizeOfElement = sizeOfValueType(token.context!, childType[1], "sim") * 8;
                const index = stackPop(simEnv);
                const address = stackPop(simEnv);
                const len = stackPop(simEnv);
                if (index < 0 || index >= len) {
                    logError(token.loc, `'${token.txt}' the index ${index} is out of array bounds [0..${len}]`);
                    exit();
                }
                simEnv.dataStack.push(address + index * sizeOfElement);
                simGetWordPointedByTOS(simEnv, childType[1], 0);
            } else {
                const index = stackPop(simEnv);
                const addr = stackPop(simEnv);
                const len = stackPop(simEnv);
                if (index < 0 || index >= len) {
                    logError(token.loc, `'${token.txt}' the index ${index} is out of string bounds [0..${len}]`);
                    exit();
                }
                const newAddr = storeStringOnHeap(simEnv, String.fromCharCode(simEnv.memory[addr + index]));
                simEnv.dataStack.push(1);
                simEnv.dataStack.push(newAddr);
            }
        },
        generateAsm: (token, target) => {
            assertChildNumber(token, 2);
            const childType = getReturnTypeOfAWord(token.childs[0]);
            if (!(childType === "string" || childType === "word" || (childType instanceof Array && childType[0] === "array"))) {
                logError(token.childs[0].loc, `'${token.childs[0].txt}' should be an array or string or word, it's a ${humanReadableType(childType)}`);
                exit();
            }

            if (childType instanceof Array) {
                const sizeOfElement = sizeOfValueType(token.context!, childType[1], target);
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
                        `; now get the ${humanReadableType(childType[1])} pointed by the tos`
                    ].concat(getAsmForGetWordPointedByTOS(childType[1], 0, target));
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
                        `; now get the ${humanReadableType(childType[1])} pointed by the tos`
                    ].concat(getAsmForGetWordPointedByTOS(childType[1], 0, target));
                }

                console.log(`target system '${target}' unknown`);
                exit();
            } else {
                if (target === "c64") {
                    // len, address, index on the stack
                    return [
                        "JSR POP16",
                        "LDY STACKACCESS",      // index in Y
                        "JSR SWAP16",           // address, len
                        "JSR POP16",            // drop len
                        "JSR POP16",            // address in STACKACCESS
                        "LDA (STACKACCESS),Y",
                        "TAY",                  // char in Y
                        "LDA #1",
                        "STA STACKACCESS",
                        "LDA #0",
                        "STA STACKACCESS+1",
                        "JSR PUSH16",           // PUSH len 1
                        "LDA HEAPTOP",
                        "STA STACKACCESS",
                        "LDA HEAPTOP+1",
                        "STA STACKACCESS+1",
                        "JSR PUSH16",           // PUSH addr (HEAPTOP)
                        "TYA",
                        "LDY #0",
                        "STA (STACKACCESS),Y",  // save in (HEAPTOP) location
                        "INC STACKACCESS",
                        "BNE AT_STRING_NO_CARRY",
                        "INC STACKACCESS+1",
                        "AT_STRING_NO_CARRY:",
                    ];
                }
                if (target === "freebsd") {
                    return [
                        "pop rbx", // index
                        "pop rax", // address
                        "pop rcx", // len
                        `add rax, rbx`,
                        "mov rcx, [rax]",
                        "mov rax, 1",
                        "push rax",             // push len = 1
                        "call allocate",
                        "push rbx",             // push address
                        "mov [rbx], rcx",       // save the char
                    ]
                }
                console.log(`target system '${target}' unknown`);
                exit();
            }


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
            let sizeToRelease = sizeOfContextWithMetadata(token.context, target);
            let context = token.context;
            while (context.element?.type !== TokenType.REF_BLOCK && context.parent !== undefined) {
                context = context.parent;
                sizeToRelease += sizeOfContextWithMetadata(context, target);
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
            let context = token.context;
            let sizeToRelease = sizeOfContextWithMetadata(token.context, "sim");
            while (context.element?.type !== TokenType.REF_BLOCK && context.parent !== undefined) {
                context = context.parent;
                sizeToRelease += sizeOfContextWithMetadata(context, "sim");
                if (context.element === undefined) {
                    logError(token.loc, `'${token.txt}' is not inside a function`);
                    exit();
                }
                token = context.element;
            }

            simEnv.ctxStack.length -= sizeToRelease;
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
        generateAsm: (_token, target) => {
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
    voc[TokenType.ASM] = {
        txt: "asm",
        expectedArity: 1,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 5,
        userFunction: false,
        ins: (token) => {
            assertChildNumber(token, 1);
            if ((token.childs[0].type !== TokenType.LITERAL || getReturnTypeOfAWord(token.childs[0]) !== "string") && (token.childs[0].type !== TokenType.ARRAY_BLOCK)) {
                logError(token.loc, `'${token.txt}' is not a literal string nor an array of literal string`);
                exit();
            }
            return [getReturnTypeOfAWord(token.childs[0])];
        },
        out: () => "void",
        generateChildPreludeAsm: () => {
            return undefined;
        },
        generateAsm: (token, target) => {
            assertChildNumber(token, 1);
            const allCode = token.childs[0].type === TokenType.LITERAL ? [token.childs[0].txt] : token.childs[0].childs.map(token => token.txt).reverse();

            const regex = /\!(\w+)\b/m;
            const ret = [];
            for (let i = 0; i < allCode.length; i++) {
                const code = allCode[i];
                const result = regex.exec(code);
                if (result === null) {
                    ret.push(code); // no var interpolation
                    continue;
                }

                if (result.length !== 2) {
                    logError(token.loc, `'${code}' cannot extract variable name in this code`);
                    exit();
                }

                ret.push(`; ASM FOR '${code}'`);
                const varName = result[1];
                const varDef = getValueDefinition(token);
                if (varDef === undefined) {
                    logError(token.loc, `Cannot find declaration for word '${varName}' inside ASM instruction '${code}', compiler error`);
                    exit();
                }
                //const offset = getWordOffset(token.context, varName, target);        

                const { offset, levelToSkip } = getWordOffsetAndLevel(token.context, varName, target);
                if (target === "c64") {
                    const instruction = code.trim().substring(0, 3).toUpperCase();
                    if (varDef.isGlobalContext) {
                        switch (instruction) {
                            case "INC":
                                ret.push(`INC ${getAsmVarName(varDef.token)}`);
                                break;
                            case "DEC":
                                ret.push(`DEC ${getAsmVarName(varDef.token)}`);
                                break;
                            case "LDA":
                                ret.push(`LDA ${getAsmVarName(varDef.token)}`);
                                break;
                            case "STA":
                                ret.push(
                                    `LDY ${getAsmVarName(varDef.token)}`,
                                    `STY STACKACCESS`,
                                    `LDY ${getAsmVarName(varDef.token)}+1`,
                                    `STY STACKACCESS+1`,
                                    "LDY #0",
                                    "STA (STACKACCESS),Y"
                                );
                                break;
                            default:
                                logError(token.loc, `No var interpolation for this asm code '${code}' `);
                                exit();
                        }
                    } else {
                        switch (instruction) {
                            case "INC":
                                ret.push(
                                    "LDX CTX_SP16",
                                    `INC ${CTX_PAGE * 256 + offset},X`
                                );
                                break;
                            case "DEC":
                                ret.push(...getAsmPutWordAddressOnTOS(varDef.internalType, token, varDef.token, offset, false, target));
                                ret.push(
                                    "JSR POP16",
                                    "LDY #0",
                                    "SEC",
                                    "LDA (STACKACCESS),Y",
                                    "SBC #1",
                                    "STA (STACKACCESS),Y",
                                );
                                break;

                            case "LDA":                                
                                ret.push(...getAsmPutWordAddressOnTOS(varDef.internalType, token, varDef.token, offset, false, target));
                                ret.push(
                                    "JSR POP16",
                                    "LDY #0",                                    
                                    "LDA (STACKACCESS),Y"
                                );
                                break;
                            case "STA":
                                ret.push("PHA");                            
                                ret.push(...getAsmForGetWordLocalUsingOffsetAndLevel(varDef.internalType, token, varDef.token, false, offset, target));
                                ret.push(
                                    "JSR POP16",
                                    "LDY #0",
                                    "PLA",
                                    "STA (STACKACCESS),Y"
                                );                            
                                break;
                            default:
                                logError(token.loc, `No var interpolation for this asm code '${code}' `);
                                exit();

                        }
                    }
                } else if (target === "freebsd") {
                    const asmGetAddr = getAsmAddressOfWord(token, varDef, varName, target);
                    logError(token.loc, `'${token.txt}' asm in freebsd tbd`);
                    exit();
                } else {
                    console.log(`target system '${target}' unknown`);
                    exit();
                }

            }
            return ret;

        },
        preprocessTokens: (sequence, vocabulary) => {
            if (sequence[1].type === TokenType.BLOCK) {
                sequence[1].type = TokenType.ARRAY_BLOCK;
                addInstrData(sequence[1], vocabulary);
                return;
            }
        }

    };
    voc[TokenType.DEBUG] = {
        txt: "debug",
        expectedArity: 0,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 1000,
        userFunction: false,
        ins: () => [],
        out: () => "void",
        generateAsm: (token, target) => {
            return [
                "__debug:",
                "JMP __debug"
            ];
        },
        sim: (simEnv, ast) => {

        },
    };
    voc[TokenType.TYPEOF] = {
        txt: "typeof",
        expectedArity: 1,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 1000,
        userFunction: false,
        ins: (token) => {
            assertChildNumber(token, 1);
            const child = token.childs[0];
            return [child.out!];
        },
        out: () => "string",
        generateAsm: (token) => {
            logError(token.loc, "typeof is  implemented only in sim mode");
            Deno.exit();
        },
        sim: (simEnv, token) => {
            const child = token.childs[0];
            const typeToPush = humanReadableType(child.out);
            simEnv.dataStack.push(typeToPush.length);
            simEnv.dataStack.push(storeStringOnHeap(simEnv, typeToPush));
        },
        simPreludeChild: () => false
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
    if (txt.match(/^0x[\dabcdefABCDEF]+$/)) {
        if (txt.length === 4) {
            return { type: TokenType.LITERAL, literalType: "byte" };
        } else {
            return { type: TokenType.LITERAL, literalType: "number" };
        }
    }
    if (txt.match(/^0b[01]+$/)) return { type: TokenType.LITERAL, literalType: "number" };
    if (txt[0] === '"' && txt[txt.length - 1] === '"') return { type: TokenType.LITERAL, literalType: "string" };
    if (txt[0] === "'" && txt[txt.length - 1] === "'") return { type: TokenType.LITERAL, literalType: "word" };
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
        let txt = tokenText;
        if (token.type === TokenType.LITERAL && (token.literalType === "string" || token.literalType === "word")) {
            txt = tokenText.substring(1, tokenText.length - 1);
        } else if (token.type === TokenType.SET_WORD) {
            txt = tokenText.substring(0, tokenText.length - 1);
        } else if (token.type === TokenType.LIT_WORD) {
            txt = tokenText.substring(1);
        }
        const toPush = { type: token.type, txt, sourceTxt: tokenText, loc, internalValueType: token.literalType, childs: [] };
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
                ret.push({ type: TokenType.OPEN_REF_BRACKETS, txt: ":[", sourceTxt: ":[", loc, childs: [] });
                index++;
                col++;
            } else if (char === "'" && index + 1 < source.length && source[index + 1] === "[") {
                const loc = { row, col, filename };
                ret.push({ type: TokenType.OPEN_LIT_BRACKETS, txt: "'[", sourceTxt: "'[", loc, childs: [] });
                index++;
                col++;
            } else if (char === "[") {
                const loc = { row, col, filename };
                ret.push({ type: TokenType.OPEN_BRACKETS, txt: "[", sourceTxt: "[", loc, childs: [] });
            } else if (char === "]") {
                if (tokenStart > -1) {
                    // space but was parsing a word
                    previousToken = currentToken;
                    currentToken = pushToken(source.substring(tokenStart, index));
                    tokenStart = -1;
                    colStart = -1;
                }
                const loc = { row, col, filename };
                ret.push({ type: TokenType.CLOSE_BRACKETS, txt: "]", sourceTxt: "]", loc, childs: [] });
            } else if (char === '"' && tokenStart === -1) {
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

// async function preprocessOLD(program: AST, vocabulary: Vocabulary) {

//     const defines: Record<string, [AST, number]> = {};

//     const doSubstitution = async (program: AST, index: number) => {
//         const macroElement = program[index];
//         const macroName = macroElement.txt;
//         //const filename = macroElement.loc.filename;
//         const filename = `macro_at_${macroElement.loc.row}:${macroElement.loc.col}`;
//         const startOfDefine = defines[macroName][1];
//         const codeUntilDefinition = program.slice(0, startOfDefine).map(token => structuredClone(token) as Token);
//         const copyOfDefines = defines[macroName][0].map(elem => structuredClone(elem) as Token);
//         if (copyOfDefines[0].type === TokenType.OPEN_REF_BRACKETS) {
//             let definesForSim: Token[] = [];
//             const macro: Token = {
//                 type: TokenType.LIT_WORD,
//                 txt: macroName,
//                 loc: copyOfDefines[0].loc,
//                 childs: []
//             }
//             definesForSim.push(macro);
//             definesForSim = definesForSim.concat(copyOfDefines);
//             let k = index;
//             let parens = 0;
//             while (k < program.length) {
//                 if (program[k].type === TokenType.OPEN_BRACKETS || program[k].type === TokenType.OPEN_REF_BRACKETS) {
//                     parens++;
//                 } else if (program[k].type === TokenType.CLOSE_BRACKETS) {
//                     parens--;
//                     if (parens < 0) break;
//                 } else if (program[k].type === TokenType.WORD && macroName !== program[k].txt && program[k].txt in defines) {
//                     await doSubstitution(program, k);
//                 }

//                 k++;
//             }
//             const macroCallElement = program[index];
//             const macroCallComplete = codeUntilDefinition.concat(definesForSim.concat(program.slice(index, k)));

//             let astMacroCall = groupSequence(filename, macroCallComplete, vocabulary);
//             const [astMacroCallChilds, macroCallLenght] = await groupByExpectedArityOutZeroUntilIndex(astMacroCall.childs, "sim", vocabulary, macroCallElement);
//             astMacroCall.childs = astMacroCallChilds;
//             typeCheckBlock(astMacroCall);

//             const returnedCode = sim(vocabulary, astMacroCall, true);


//             sourceCode[filename] = returnedCode;
//             const returnedTokens = await tokenizer(returnedCode, filename, vocabulary);

//             //returnedTokens.forEach(token => token.loc = macroCallElement.loc);

//             program.splice(index, macroCallLenght, ...(returnedTokens !== undefined ? returnedTokens : []));
//             dumpProgram(program);
//         } else {
//             program.splice(index, 1, ...copyOfDefines);
//         }
//     };

//     for (let i = 0; i < program.length; i++) {
//         const token = program[i];
//         if (token.type === TokenType.DEFINE) {
//             if (i + 2 >= program.length) {
//                 logError(token.loc, `Definition not complete`);
//                 exit();
//             }

//             const name = program[i + 1];
//             if (name.type !== TokenType.WORD) {
//                 logError(name.loc, `definition started, but '${name.txt}' is not a word!`);
//                 exit();
//             }

//             const value = program[i + 2];
//             if (value.type !== TokenType.OPEN_BRACKETS && value.type !== TokenType.OPEN_REF_BRACKETS) {
//                 if (value.txt === '(') {
//                     value.type = TokenType.OPEN_BRACKETS;
//                 } else if (value.txt === ')') {
//                     value.type = TokenType.CLOSE_BRACKETS;
//                 }

//                 defines[name.txt] = [[value], i];
//                 program.splice(i, 3);
//                 i = i - 1;
//             } else {
//                 let parens = 1;
//                 let index = i + 3;
//                 while (parens > 0 && index < program.length) {
//                     if (program[index].type === TokenType.CLOSE_BRACKETS) {
//                         parens--;
//                         if (parens === 0) break;
//                     } else if (program[index].type === TokenType.OPEN_BRACKETS || program[index].type === TokenType.OPEN_REF_BRACKETS) {
//                         parens++;
//                     } else {
//                         if (program[index].txt === '(') {
//                             program[index].type = TokenType.OPEN_BRACKETS;
//                         } else if (program[index].txt === ')') {
//                             program[index].type = TokenType.CLOSE_BRACKETS;
//                         } else if (program[index].type === TokenType.WORD && program[index].txt in defines) {
//                             await doSubstitution(program, index);
//                             index--; // we should process the first token substituted
//                         }
//                     }
//                     index++;
//                 }

//                 if (parens > 0) {
//                     logError(program[i + 2].loc, `paren not closed`);
//                     exit();
//                 }
//                 if (program[i + 2].type === TokenType.OPEN_REF_BRACKETS) {
//                     defines[name.txt] = [program.slice(i + 2, index + 1), i];
//                     program.splice(i, defines[name.txt][0].length + 2);
//                 } else {
//                     defines[name.txt] = [program.slice(i + 3, index), i];
//                     program.splice(i, defines[name.txt][0].length + 4);
//                 }
//                 console.log("DEFINE", name.txt, "=", defines[name.txt][0].map(t => t.txt).join(" "));
//                 i = i - 1;
//             }

//         } else {
//             if (token.type === TokenType.WORD && token.txt in defines) {
//                 await doSubstitution(program, i);
//             }
//         }
//     }

//     return program;

// }

function traverseAst(ast: AST, filter: (t: Token) => boolean, prevent: (t: Token) => boolean): Token[] {
    const ret: Token[] = [];
    for (let i = 0; i < ast.length; i++) {
        const token = ast[i];
        if (prevent(token)) continue;
        if (filter(token)) ret.push(token);
        ret.push(...traverseAst(token.childs, filter, prevent));
    }
    return ret;
}

function resetRecurFunctionIndex(token: Token) {
    const refBlocks = traverseAst(token.childs, token => token.type === TokenType.REF_BLOCK, _token => false);
    refBlocks.forEach(refBlock => refBlock.functionIndex = undefined);
}

async function doMacro(vocabulary: Vocabulary, sequence: AST, macroCall: Token): Promise<AST> {
    const prog: Token = {
        loc: { col: 1, row: 1, filename: macroCall.loc.filename },
        txt: "[PROG]",
        sourceTxt: "[PROG]",
        type: TokenType.PROG,
        internalValueType: "void",
        ins: [],
        out: undefined,
        isUserFunction: false,
        priority: 0,
        position: InstructionPosition.PREFIX,
        functionIndex: undefined,
        childs: [],
        //context: macroCall.context
        context: createNewContext(undefined)
    };
    // copy the ast
    const copyOfCode = structuredClone(sequence) as AST;

    const completeCode = copyOfCode
        .filter(token =>
            // we take every lit word of struct and function
            // and take only values with literal
            // if we take every expression, could lead to a parameter passed inside a function
            // this does not make sense
            token!.type === TokenType.LIT_WORD && (
                getWordDefinition(macroCall.context, token.txt)?.type !== "value" ||
                token.childs[0].type === TokenType.LITERAL
            )
        );
    //const completeCode = getDefinitionNeeded(macroCall, sequence);

    // adjust the context of the child (context of recursive childs is ok)
    // and define every lit word
    completeCode.forEach(token => {
        token.context = prog.context;
        setWordDefinition(token);
    });
    const newCall = structuredClone(macroCall) as Token;
    newCall.context = prog.context;    
    completeCode.push(newCall);
    prog.childs = completeCode;

    // const macroFilenameRunnig = `macro_running_${macroCall.loc.row}:${macroCall.loc.col}`;
    // const code = completeCode
    //     .map(token => token.sourceTxt + " " + token.childs[0].sourceTxt)
    //     .join("\n")
    //     + "\n"
    //     + macroCall.sourceTxt
    //     + " "
    //     + macroCall.childs
    //         .map(child => child.sourceTxt).join(" ")
    //     + "\n";

    // sourceCode[macroFilenameRunnig] = code;
    // const program = await tokenizer(code, macroFilenameRunnig, vocabulary);
    // const astProgram = await parse(vocabulary, program, macroFilenameRunnig);
    // checkForUnusedCode(astProgram);


    const returnedCode = sim(vocabulary, prog, true);

    const filename = `macro_at_${macroCall.loc.row}:${macroCall.loc.col}`;
    sourceCode[filename] = returnedCode;
    const tokens = await tokenizer(returnedCode, filename, vocabulary);
    const callStr = (macroCall.txt + " " + macroCall.childs.map(t => getSourceRapresentationOfAToken(t)).join(" ")).trim();
    const expandStr = tokens.map(token => getSourceRapresentationOfAToken(token)).join(" ");
    console.log(`macro ${callStr} expanded as ${expandStr}`);
    const ast = groupSequence(filename, tokens, vocabulary, macroCall.context);    
    return ast.childs;
}

async function checkForMacroCall(functionElement: Token, vocabulary: Vocabulary, sequence: AST) {

    if (functionElement.type === TokenType.WORD) {
        const wordDef = getWordDefinition(functionElement.context, functionElement.txt);
        if (wordDef?.type === "function" && wordDef.isMacro) {
            const tokensExpanded = await doMacro(vocabulary, sequence, functionElement);
            await groupByExpectedArityOutZero(tokensExpanded, vocabulary, sequence);
            return tokensExpanded;
        }
    }

    return undefined;
}

async function groupFunctionToken(ast: AST, index: number, vocabulary: Vocabulary, sequence: AST): Promise<Token> {
    const functionElement = ast[index];    
    const functionPosition = getInstructionPosition(functionElement);
    const arity = getArity(functionElement, vocabulary);
    const currentNumOfChilds = isABlock(functionElement.type) ? 0 : functionElement.childs.length;

    // already grouped
    //if (currentNumOfChilds === arity) return functionElement;

    let childs: AST = [];
    let startPos: number = index;
    // NB. function element could already have childs ( from one-word macro substitution )

    const arityNeeded = arity - currentNumOfChilds;

    if (functionPosition === InstructionPosition.INFIX) {
        // p1 <op> p2 p3 ... pn                
        if (arityNeeded > 0) {
            if (currentNumOfChilds === 0) {
                if (index === 0) {
                    logError(functionElement.loc, `cannot find the left parameters of the operator '${functionElement.txt}'`);
                    exit();
                }
                childs = [ast[index - 1]];
                startPos = index - 1;
            }
            childs = childs.concat(ast.slice(index + 1, index + 1 + arityNeeded - childs.length));
            const lastChild = childs.at(-1);
            if (lastChild === undefined) {
                logError(functionElement.loc, `cannot find childs of '${functionElement.txt}'`);
                exit();
            }

            const lastParameterArity = getArity(lastChild, vocabulary);
            if (lastParameterArity > 0 && lastChild.childs.length !== lastParameterArity) {
                await groupFunctionToken(ast, index + arity - 1, vocabulary, sequence);
            }
            if (arityNeeded !== childs.length) {
                logError(functionElement.loc, `the operator ${functionElement.txt} expects ${arity} parameters, but got ${currentNumOfChilds}!`);
                exit();
            }
        }        
    } else if (functionPosition === InstructionPosition.POSTFIX) {
        if (arityNeeded > 0) {
            if (index === 0) {
                logError(functionElement.loc, `postfix operator '${humanReadableFunction(functionElement)}' does not have a left parameters`);
                exit();
            }
            childs = [ast[index - 1]];
            startPos = index - 1;
        }

    } else {
        childs = ast.slice(index + 1, index + 1 + arityNeeded);
        if (arityNeeded > 0) {
            const lastChild = childs.at(-1);
            if (lastChild === undefined) {
                logError(functionElement.loc, `cannot find childs of '${functionElement.txt}'`);
                exit();
            }
            const lastParameterArity = getArity(lastChild, vocabulary);
            if (lastParameterArity > 0 && lastChild.childs.length !== lastParameterArity) {
                await groupFunctionToken(ast, index + arity, vocabulary, sequence);
                childs = ast.slice(index + 1, index + 1 + arityNeeded);
            }
        }

        if (childs.length !== arityNeeded) {
            logError(functionElement.loc, `the word ${humanReadableFunction(functionElement)} expects ${arity} parameters, but got only ${childs.length}!`);
            dumpAst(functionElement);
            exit();
        }

        startPos = index;
    }

    functionElement.childs = functionElement.childs.concat(childs);

    // old macro call was here!


    ast.splice(startPos, childs.length + 1, functionElement);
    if (functionElement.type !== TokenType.WORD_BLOCK) {
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
    }
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
    optimize(functionElement);

    // check for macro call
    const tokensExpanded = await checkForMacroCall(functionElement, vocabulary, sequence);
    if (tokensExpanded !== undefined) {
        const lastToken = tokensExpanded.at(-1);
        if (lastToken === undefined) {
            logError(functionElement.loc, `'${functionElement.txt}' expansion produced empty block`);
            exit();
        }
        ast.splice(startPos, childs.length + 1, ...tokensExpanded);
        return lastToken;
    }


    if (functionElement.type === TokenType.LIT_WORD) {
        setWordDefinition(functionElement);
    } else if (functionElement.type === TokenType.STRUCT) {
        setStructDefinition(functionElement);
    }

    return functionElement;
}

function getParametersRequestedByBlock(block: Token) {

    if (block.type !== TokenType.BLOCK && block.type !== TokenType.REF_BLOCK && block.type !== TokenType.PROG
        && block.type !== TokenType.RECORD && block.type !== TokenType.WORD_BLOCK) {
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
        if (!areTypesEqual(firstType, currentReturnType)) {
            logError(returns[0].loc, `return types mismatch: '${returns[0].txt}' returns ${humanReadableType(firstType)}...`);
            logError(returns[i].loc, `... while '${returns[i].txt}' returns ${humanReadableType(currentReturnType)}`);
            exit();
        }
    }
    return firstType;

}

function getReturnValueByBlock(block: Token): ValueType {

    if (block.type !== TokenType.BLOCK && block.type !== TokenType.REF_BLOCK && block.type !== TokenType.PROG
        && block.type !== TokenType.RECORD && block.type !== TokenType.WORD_BLOCK) {
        logError(block.loc, `the token '${block.txt}' is not a BLOCK or REF_BLOCK or PROG!`);
        exit();
    }
    if (block.type === TokenType.WORD_BLOCK) return ["array", "word"];

    for (let i = 0; i < block.childs.length - 1; i++) {
        if (block.childs[i].type === TokenType.RETURN) {
            logError(block.childs[i + 1].loc, `'${block.childs[i + 1].txt}' is unreachable code`);
            exit();
        } else if (block.childs[i].out !== "void") {
            dumpAst(block);
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

    if (block.type !== TokenType.BLOCK && block.type !== TokenType.REF_BLOCK && block.type !== TokenType.PROG
        && block.type !== TokenType.RECORD && block.type !== TokenType.WORD_BLOCK) {
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
    if (block.type !== TokenType.ARRAY_BLOCK) {
        logError(block.loc, `the token '${block.txt}' is not a '${humanReadableToken(TokenType.ARRAY_BLOCK)}'`);
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

function optimize(token: Token) {    
    switch (token.type) {
        case TokenType.PLUS:
            if (token.childs[0].type === TokenType.LITERAL && token.childs[1].type === TokenType.LITERAL) {
                const result = (getNumberFromLiteral(token.childs[0].txt) + getNumberFromLiteral(token.childs[1].txt));
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
                const result = (getNumberFromLiteral(token.childs[0].txt) - getNumberFromLiteral(token.childs[1].txt));
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
                const result = getNumberFromLiteral(token.childs[1].txt) !== 0 ? (getNumberFromLiteral(token.childs[0].txt) / getNumberFromLiteral(token.childs[1].txt)) : 0;
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
                const result = (getNumberFromLiteral(token.childs[0].txt) * getNumberFromLiteral(token.childs[1].txt));
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
                const result = getNumberFromLiteral(token.childs[0].txt) & 255;
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
        case TokenType.STR_JOIN:
            if (token.childs[0].type === TokenType.LITERAL && token.childs[1].type === TokenType.LITERAL) {
                const result = (token.childs[0].txt + token.childs[1].txt);
                token.type = TokenType.LITERAL;
                token.txt = result;
                token.expectedArity = 0;
                token.expectedArityOut = 1;
                token.internalValueType = "string";
                token.out = "string";
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

function areTypesCompatible(t1: ValueType, token2: Token): boolean {
    // if the first type is word basically it matches with every single token that is not an array
    // if the first type is an array of word than it matches all the arrays
    // we'll se if this is enough...

    const t2 = getReturnTypeOfAWord(token2);

    // word is compatible with anything but arrays
    if (t1 === "word" && (typeof t2 === "string" || t2[0] !== "array")) return true;

    // array of word are compatible with arrays
    if (typeof t1 !== "string" && t1[0] === "array" && t1[1] === "word" && (typeof t2 !== "string" && t2[0] === "array")) return true;

    return areTypesEqual(t1, t2);
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
    if (token.type !== TokenType.WORD_BLOCK) {
        for (let i = 0; i < token.childs.length; i++) {
            const child = token.childs[i];
            if (child.childs.length === 0) typeCheck(child, vocabulary);
        }
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
    if (isABlock(token.type)) {
        // in block the number of ins is not the number of childs
    } else {
        if (arity !== token.childs.length) {
            logError(token.loc, `the word '${token.txt}' expects ${arity} parameters, but got ${token.childs.length}`);
            dumpAst(token);
            exit();
        }
    }

    storeSignatureThatMatches(token);

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

            // const recordEntries = Object.entries(childRecord.context.varsDefinition)                
            //     .filter(([name, varDef]) => varDef.type !== "function")
            //     .map(([name, varDef]) => {
            //         if (varDef.type !== "function") {
            //             return { name, type: varDef.out, token: varDef.token }
            //         }                    
            //     });
            const recordEntries: Array<{ name: string, type: ValueType, token: Token }> = [];
            for (let defName of Object.keys(childRecord.context.varsDefinition)) {
                const varDef = childRecord.context.varsDefinition[defName];
                if (varDef.type !== "function") {
                    recordEntries.push()
                    return [{ name, type: varDef.out, token: varDef.token }];
                }
            }


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
            // WHYYY ???
            // childRecord.context.varsDefinition = Object.fromEntries(
            //     varDefElements
            //         .filter(defElem => defElem.def.type !== "function")
            //         .map(defElem => [defElem.name, defElem.def])
            // );

            // change all lit words using the struct template
            childRecord.childs = varDefElements                
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
                        sourceTxt: String(valueToAssign),
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
                        sourceTxt: defElem.name,
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

function setFunctionDefinition(token: Token) {

    const functionName = token.txt;
    const refBlock = token.childs[0];

    if (token.context === undefined) {
        logError(token.loc, `The token '${token.txt}' does not have a context`);
        exit();
    }

    assertChildNumber(token, [TokenType.REF_BLOCK]);

    const outType = getReturnValueByBlock(refBlock);
    const isMacro = outType === "word" || areTypesEqual(outType, ["array", "word"]);
    const ins = getParametersRequestedByBlock(refBlock);
    const arityOut = outType === "void" ? 0 : 1;

    const presentDefinition = getFunctionDefinition(token);
    if (presentDefinition !== undefined) {
        if (presentDefinition.arity !== ins.length) {
            logError(token.loc, `The function '${functionName}' needs to have arity ${presentDefinition.arity}, but currently it is ${ins.length}`);
            exit();
        }
        if (presentDefinition.arityOut !== arityOut) {
            if (arityOut === 0) {
                logError(token.loc, `The function '${functionName}' needs to return a value (as defined before)`);
                exit();
            }
            logError(token.loc, `The function '${functionName}' must not return a value (as defined before)`);
            exit();
        }
    }
    const signatureToStore: FunctionSignature = {
        index: 0,
        ins,
        out: outType,
        position: 1,
        token
    };

    if (presentDefinition !== undefined) {
        signatureToStore.index = presentDefinition.signatures.length;
        presentDefinition.signatures.push(signatureToStore);
    } else {
        token.context.varsDefinition[functionName] = {
            type: "function",
            arity: ins.length,
            arityOut,
            internalType: "addr",
            priority: refBlock.priority ?? 10,
            isMacro,
            reference: [],
            signatures: [signatureToStore]
        }
    }
    token.functionSignature = signatureToStore;
}

function setWordDefinition(token: Token) {

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
    if (child.out === undefined) {
        logError(child.loc, `The word '${child.txt}' does not have a return value`);
        exit();
    }

    const isUserFunction = child.type === TokenType.REF_BLOCK;
    if (isUserFunction) {
        setFunctionDefinition(token);
    } else {
        // if (child.internalValueType === undefined) {
        //     logError(child.loc, `the internal type of '${child.txt}' is undefined`);
        //     exit();
        // }
        const varDef = getWordDefinition(token.context, token.txt);
        if (varDef !== undefined) {
            if (varDef.type === "function" || varDef.token.context === token.context) {
                logError(token.loc, `Can't redefine the word '${token.txt}'`);
                exit();
            }
            // else {
            //     logError(token.loc, `Can't overshadow the word '${token.txt}'`);
            // }
        }

        token.context.varsDefinition[token.txt] = {
            type: "value",            
            out: child.out,
            token,
            position: InstructionPosition.PREFIX,
            priority: child.priority!,
            internalType: child.internalValueType ?? child.out,            
            reference: []
        };        

    }


}

function setStructDefinition(token: Token) {

    if (token.type !== TokenType.STRUCT) {
        logError(token.loc, `'${token.txt}' is not a 'STRUCT'`);
        exit();
    }

    if (token.context === undefined) {
        logError(token.loc, `The token '${token.txt}' does not have a context`);
        exit();
    }

    assertChildNumber(token, 2);
    if (token.childs[0].internalValueType !== "word") {
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
        logError(token.childs[0].loc, `the word '${name}' was already defined`);        
        exit();
    }

    if (block.context === undefined) {
        logError(block.loc, `The context for the block is undefined`);
        exit();
    }

    const elements = [];
    for (const [name, varDef] of Object.entries(block.context.varsDefinition)) {      
        if (varDef.type !== "function") {
            elements.push({
                name,
                type: varDef.internalType,
                def: varDef,
            });
        }
    }

    const structDef: VarDefinitionStruct = {
        type: "struct",        
        out: ["usertype", name],
        token,
        position: InstructionPosition.PREFIX,
        priority: 100,
        internalType: "addr",
        elements,
        reference: []
    };
    token.context.varsDefinition[name] = structDef;
    console.log("created struct word " + name);
}


async function parseBlock(ast: AST, vocabulary: Vocabulary, sequence: AST): Promise<AST> {

    // preprocess macro with no params
    for (let i = 0; i < ast.length; i++) {
        const token = ast[i];
        if (token.type === TokenType.WORD) {
            const wordDef = getWordDefinition(token.context, token.txt);
            if (wordDef?.type === "function" && wordDef.isMacro && wordDef.arity === 0) {
                const tokensExpanded = await doMacro(vocabulary, sequence, token);
                await groupByExpectedArityOutZero(tokensExpanded, vocabulary, sequence);
                ast.splice(i, 1, ...tokensExpanded);
                i += tokensExpanded.length - 1;
            }
        }
    }

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

            const group = await groupFunctionToken(ast, j, vocabulary, sequence);

            if (j > 0 && ast[j - 1] === group) j = j - 1;
            //if (tokenPosition !== InstructionPosition.PREFIX) j = j - 1; // we already take as child the token before this
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
        if (varDef.type === "function") {
            return { ins: varDef.arity, out: varDef.arityOut };
        } else {
            return { ins: 0, out: varDef.out === "void" ? 0 : 1 };
        }
    }
    if (token.type === TokenType.REF_BLOCK || token.type === TokenType.BLOCK ||
        token.type === TokenType.RECORD || token.type === TokenType.WORD_BLOCK) {
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
    if (token.type === TokenType.WORD_BLOCK) return [];

    const wordsUsed = getTokensByTypeRecur(token, TokenType.WORD).map(token => token.txt);
    const wordsDefined = getTokensByTypeRecur(token, TokenType.LIT_WORD).map(token => token.txt);
    const wordsUsedButNotDefined = wordsUsed.filter(x => !wordsDefined.includes(x));
    const freeWords = wordsUsedButNotDefined.filter(name => getWordDefinition(token.context, name) === undefined);
    return freeWords;
}

function getNumTokensInAst(ast: AST): number {
    let ret = 0;
    for (let i = 0; i < ast.length; i++) {
        if (isABlock(ast[i].type)) {
            ret += 2;
        } else {
            ret++;
        }
        ret += getNumTokensInAst(ast[i].childs);
    }
    return ret;
}

async function groupByExpectedArityOutZero(sequence: AST, vocabulary: Vocabulary, definitions: AST) {    
    let childLeft = 0;
    let lastPointer = 0;
    let startingNewSequence = true;
    const currentDefinitions: AST = [];
    for (let j = 0; j < sequence.length; j++) {
        let token = sequence[j];

        // preprocess token
        // changeTokenTypeOnContext(vocabulary, token, sequence.slice(token.position === InstructionPosition.PREFIX ? j : j - 1));
        // token = sequence[j];

        let { ins, out } = getInsOutArity(token);
        if (token.type === TokenType.REF_BLOCK || token.type === TokenType.BLOCK || token.type === TokenType.RECORD) {
            const childs = token.childs;
            await groupByExpectedArityOutZero(childs, vocabulary, definitions.concat(currentDefinitions));
            typeCheckBlock(token);
        }
        if (token.type === TokenType.ARRAY_BLOCK) {
            const childs = token.childs;
            await groupByExpectedArityOutZero(childs, vocabulary, definitions.concat(currentDefinitions));
            typeCheckDataBlock(token);
        }
        if (token.type === TokenType.WORD_BLOCK) {
            const childs = token.childs;
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
                    nextToken.type === TokenType.RECORD || nextToken.type === TokenType.WORD_BLOCK || nextToken.type === TokenType.WORD) {

                    const freeWords = nextToken.type === TokenType.WORD ? [nextToken.txt] : getWordUsedButNotDefinedInABlock(nextToken);
                    const currentlyDefinedWords = sequence.slice(lastPointer, j + 1)
                        .filter(token => token.type === TokenType.LIT_WORD || (token.type === TokenType.LITERAL && token.internalValueType === "word"))
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
                let toParse = sequence.slice(lastPointer, j + 1);
                const numberToParse = toParse.length;
                //dumpSequence(toParse, `from ${lastPointer} to ${j} :`);
                if (toParse.length === 1 && toParse[0].type === TokenType.BLOCK) {
                    // already parsed
                } else {
                    await parseBlock(toParse, vocabulary, definitions.concat(currentDefinitions));
                    currentDefinitions.push(...toParse);
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
    token.originalOutType = token.out;
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
        level: parent === undefined ? 0 : parent.level + 1
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

function groupSequence(filename: string, program: AST, vocabulary: Vocabulary, startingContext?: Context): Token {

    let currentContext: Context = startingContext ? startingContext : createNewContext(undefined);
    const ast: AST = [];
    const stack: { pos: number, context: Context, loc: Location, type: TokenType }[] = [];
    let inLitBlock: "NO" | Number = "NO"; 
    for (let j = 0; j < program.length; j++) {
        const token = program[j];
        if (token.type === TokenType.OPEN_BRACKETS) {
            stack.push({ pos: ast.length, context: currentContext, loc: token.loc, type: token.type });
            if (inLitBlock !== "NO") {
                ast.push(token);
                continue;
            }
            currentContext = createNewContext(currentContext);
        } else if (token.type === TokenType.OPEN_REF_BRACKETS) {
            stack.push({ pos: ast.length, context: currentContext, loc: token.loc, type: token.type });
            if (inLitBlock !== "NO") {
                ast.push(token);
                continue;
            }
            currentContext = createNewContext(currentContext);
        } else if (token.type === TokenType.OPEN_LIT_BRACKETS) {
            const pos = ast.length;
            stack.push({ pos, context: currentContext, loc: token.loc, type: token.type });
            if (inLitBlock !== "NO") {
                ast.push(token);
                continue;
            }
            // dont need new context here !
            //currentContext = createNewContext(currentContext);
            inLitBlock = pos;
        } else if (token.type === TokenType.CLOSE_BRACKETS) {
            const state = stack.pop();
            if (state === undefined) {
                logError(token.loc, "close brackets not bilanced");
                exit();
            }
            const matchingType = state.type;
            if (matchingType === TokenType.OPEN_LIT_BRACKETS && inLitBlock === state.pos) inLitBlock = "NO";
            if (inLitBlock !== "NO") {
                ast.push(token);
                continue;
            }

            const matchingIndex = state.pos;
            const matchingLoc = state.loc;
            const sequence = ast.splice(matchingIndex, j - matchingIndex + 1);
            // in word block every word context is the context of the block
            if (matchingType === TokenType.OPEN_LIT_BRACKETS) sequence.forEach(token => token.context = currentContext);
            const blockToken: Token = {
                type: matchingType === TokenType.OPEN_REF_BRACKETS ? TokenType.REF_BLOCK :
                    (matchingType === TokenType.OPEN_LIT_BRACKETS ? TokenType.WORD_BLOCK : TokenType.BLOCK),
                loc: matchingLoc,
                txt: (matchingType === TokenType.OPEN_REF_BRACKETS ? ":" : "") + "[" + sequence.map(t => t.txt).join(" ") + "]",
                sourceTxt: (matchingType === TokenType.OPEN_REF_BRACKETS ? ":" : matchingType === TokenType.OPEN_LIT_BRACKETS ? "'" : "") + "[" + sequence.map(t => t.sourceTxt).join(" ") + "]",
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
        txt: "[PROG]",
        sourceTxt: "[PROG]",
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

async function parse(vocabulary: Vocabulary, program: AST, filename: string): Promise<Token> {

    let astProgram = groupSequence(filename, program, vocabulary);
    await groupByExpectedArityOutZero(astProgram.childs, vocabulary, []);    
    typeCheckBlock(astProgram);

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
            if (child.type === TokenType.WORD || child.type === TokenType.SET_WORD || (child.type === TokenType.LITERAL && child.out === "word" && token.type !== TokenType.STRUCT)) {
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
        if (token.type === TokenType.RECORD || token.type === TokenType.WORD_BLOCK) return 0;
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
                        //logError(child.loc, `removed definition of unused word '${child.txt}'`, true);
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
                    .filter(([key, def]) => {
                        return def.reference.length > 0 || (def.type !== "function" && def.token.childs.length === 1 && def.token.childs[0].grabFromStack);
                    })
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

// function memoryLayout(ast: Token, startAddress: number) {
//     let ret: [name: string, type: ValueType, addr: number][] = [];
//     let addr = startAddress;
//     for (let i = 0; i < ast.childs.length; i++) {
//         const token = ast.childs[i];
//         let functionDefinition = false;
//         if (token.type === TokenType.LIT_WORD) {
//             const worddef = getWordDefinition(token.context, token.txt)!;
//             functionDefinition = worddef.type === "function";
//             ret.push([token.txt, worddef?.internalType, addr]);
//             addr += sizeForValueType(worddef?.internalType, "c64");
//         }
//         if (token.type === TokenType.WORD) {
//             const worddef = getWordDefinition(token.context, token.txt)!;
//             const isFunctionCall = worddef.type === "function";
//             if (isFunctionCall) {
//                 console.log(token.txt, "is a function call", worddef.token.childs[0].txt);
//                 ret.concat(memoryLayout(worddef.token.childs[0], addr));
//             }
//         }
//         if (!functionDefinition) ret = ret.concat(memoryLayout(token, addr));

//     }
//     return ret;
// }

function getFunctionIndex(): number {
    return functionIndex++;
}

function getFunctionName(n: number): string {
    return "CALL_" + n;
}

function getAfterFunctionName(n: number): string {
    return "AFTER_" + n;
}

function getNumberFromLiteral(txt: string): number {
    return txt.startsWith("0x") ? parseInt(txt.substring(2), 16) : txt.startsWith("0b") ? parseInt(txt.substring(2), 2) : parseInt(txt, 10);
}

function compileLiteral(ast: Token, target: Target): Assembly {
    let ret: Assembly = [];
    if (target === "c64") {
        const toHeap = ast.parent?.type === TokenType.ARRAY_BLOCK;
        const strDest = toHeap ? "heap" : "stack";
        if (ast.out === "number") {
            const number = getNumberFromLiteral(ast.txt);
            ret.push(`; ${ast.loc.row}:${ast.loc.col} NUMBER ${ast.txt}`);
            const LSB = number & 255;
            ret.push(`LDA #${LSB}`);
            ret.push(`STA STACKACCESS`);
            const MSB = (number >> 8) & 255;
            ret.push(`LDA #${MSB}`);
            ret.push(`STA STACKACCESS+1`);
            ret.push(`JSR PUSH16`);

        } else if (ast.out === "byte") {
            const number = getNumberFromLiteral(ast.txt);
            ret.push(`; ${ast.loc.row}:${ast.loc.col} BYTE to ${strDest} ${ast.txt}`);
            const LSB = number & 255;
            ret.push(`LDA #${LSB}`);
            ret.push(`STA STACKACCESS`);
            ret.push(`LDA #0`);
            ret.push(`STA STACKACCESS+1`);
            ret.push(`JSR PUSH16`);
        } else if (ast.out === "string" || ast.out === "word") {
            ret.push(`; ${ast.loc.row}:${ast.loc.col} STRING "${ast.txt}"`);
            // push lenght
            // todo: ora la lunghezza massima della stringa è 255 caratteri, aumentarla ?
            const stringToPush = ast.txt;
            // if (stringToPush.length > 255) {
            //     logError(ast.loc, "strings must be less than 256 chars");
            //     exit();
            // }
            ret.push(`LDA #<${ast.txt.length}`);
            ret.push(`STA STACKACCESS`);
            ret.push(`LDA #>${ast.txt.length}`);
            ret.push(`STA STACKACCESS+1`);
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
            const num = getNumberFromLiteral(ast.txt);
            ret.push(`push ${num}`);
        } else if (ast.out === "byte") {
            ret.push(`; ${ast.loc.row}:${ast.loc.col} BYTE ${ast.txt}`);
            const LSB = getNumberFromLiteral(ast.txt) & 255;
            ret.push(`push ${LSB}`);
        } else if (ast.out === "string" || ast.out === "word") {
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
    const wordtype = prettyPrintFunctionSignature(ast);
    const tokenType = humanReadableToken(ast.type);
    const instructionLabel = `; ${loc} ${tokenType} ${ast.sourceTxt.substring(0, 20) + (ast.sourceTxt.length > 20 ? "..." : "")} type: ${wordtype}`;

    // PRELUDE
    if (ast.type !== TokenType.LITERAL) {
        if (inst.generatePreludeAsm) {
            ret.push("; Prelude for:");
            ret.push(instructionLabel);
            ret = ret.concat(inst.generatePreludeAsm(ast, target));
        }
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
        if (inst.generateChildEpilogueAsm) {
            const retAsseblyChildEpilogue = inst.generateChildEpilogueAsm(ast, i, target);
            ret = ret.concat(retAsseblyChildEpilogue);
        }
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

    // const getVarsInContext = (context: Context | undefined) => {
    //     if (context === undefined) return "Context undefined";
    //     const ctxVars = Object.entries(context.varsDefinition);
    //     return ctxVars.length === 0 ? "none" : ctxVars.map(([key, def]) => {
    //         return `${key} (${def.ins.map(t => humanReadableType(t)).join(",")})=>${humanReadableType(def.out)}`;
    //     }).join(", ");
    // }

    const astToDump = ast instanceof Array ? ast : [ast];
    astToDump.forEach(element => {
        const tokenType = humanReadableToken(element.type);
        let ins: ValueType[] | undefined;
        let out: ValueType | undefined;
        let defType = "";
        if (element.type === TokenType.WORD) {
            const varDef = getWordDefinition(element.context, element.txt);
            defType = varDef?.type === "function" ? (varDef.isMacro ? "macro" : "function") : (varDef?.type === "struct" ? "struct" : "value");
            ins = varDef?.type === "function" ? element.functionSignature?.ins : [];
            out = element.out;
        } else {            
            ins = element.ins;
            out = element.out;
        }
        const strIns = ins === undefined ? "undefined" : ins.map(type => humanReadableType(type)).join(",")
        const strOut = humanReadableType(out);
        const strType = "(" + strIns + ")=>" + strOut;
        const strFun = defType;
        const contextToken = element.context?.element;
        const contextTokenName = contextToken?.txt ?? "";
        const ctxName = "lev. " + element.context?.level + " " + (contextTokenName.length > 10 ? "[" + contextTokenName.substring(1, 6) + "...]" : "[" + contextTokenName + "]");
        const ctx = element.context?.parent === undefined ? "global" : ctxName;
        const vars = ""; // getVarsInContext(element.context);
        const parentVars = ""; //getVarsInContext(element.context?.parent);
        console.log(prefix, element.txt + " " + tokenType + " " + strFun + " " + strType + " ctx:" + ctx + " (" + vars + ") (" + parentVars + ")");

        // console.log(prefix, sourceCode.split("\n")[element.loc.row - 1]);
        // console.log(prefix, " ".repeat(element.loc.col - 1) + `^ (row: ${element.loc.row} col: ${element.loc.col})`);

        dumpAst(element.childs, prefix + "    ");
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

function isParameter(token: Token): boolean {
    if (token.type !== TokenType.LIT_WORD) return false;
    if (token.childs.length !== 1) return false;
    return isTypeToken(token.childs[0]);
}

function buildLinks(token: Token, parent: Token | undefined) {

    token.parent = parent;

    if (token.type === TokenType.REF_BLOCK && !token.parameterReversed) {
        // reorder the child: first the params in reverse order, then the other childs
        const params = token.childs
            .filter(isParameter)
            .reverse();
        const nonParams = token.childs
            .filter(t => !isParameter(t));
        token.childs = params.concat(nonParams);
        token.parameterReversed = true;
    } else if (token.type === TokenType.ARRAY_BLOCK && !token.parameterReversed) {
        token.childs = token.childs.reverse();
        token.parameterReversed = true;
    }

    for (let i = 0; i < token.childs.length; i++) {
        token.childs[i].parent = token;
        token.childs[i].sibling = i < token.childs.length - 1 ? token.childs[i + 1] : undefined;
        token.childs[i].index = i;
        token.childs[i].functionIndex = undefined;
        token.childs[i].auxSimValue = undefined;
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
        if (code === 10) {
            console.log(simEnv.buffer);
            simEnv.buffer = "";
        } else {
            simEnv.buffer += String.fromCharCode(code);
    }
}

function simLiteral(simEnv: SimEnvironment, ast: Token) {
    switch (ast.out) {
        case "number":
            simEnv.dataStack.push(getNumberFromLiteral(ast.txt));
            break;
        case "byte":
            simEnv.dataStack.push(getNumberFromLiteral(ast.txt) & 255);
            break;
        case "bool":
            simEnv.dataStack.push(ast.txt === "true" ? 1 : 0);
            break;

        case "string":
        case "word":
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
        memory: new Uint8Array(0),
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
        // console.log(`Execute ${humanReadableToken(simEnv.pc.type)} ${simEnv.pc.txt}`);
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
            // console.log(`Execute ${humanReadableToken(simEnv.pc.type)} '${simEnv.pc.txt}'`, "stack:", simEnv.dataStack, "context:",
            //     simEnv.ctxStack.map(x => x === undefined ? "?" : String(x)).join(", ")
            // );
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
    if (simEnv.buffer !== "") emit(simEnv, 10);
    if (returnOutput) {
        const callElement = ast.childs.at(-1);
        if (!callElement) {
            logError({ col: 1, row: 1, filename: "" }, `the call does not return a lit block, btw cannot locate the call either`);
            exit();
        }
        if (simEnv.dataStack.length !== 2) {
            logError(callElement.loc, `the call '${callElement.txt}' did not return a lit block`);
            exit();
        }
        const outType = callElement.out;
        if (outType === undefined) {
            logError(callElement.loc, `the return type of '${callElement.txt}' is undefined`);
            exit();
        }

        const blockAdd = stackPop(simEnv);
        const blockLen = stackPop(simEnv);

        const ret: string[] = [];
        if (outType === "word") {
            ret.push(readStringFromHeap(simEnv, blockAdd, blockLen));
        } else {
            for (let i = 0; i < blockLen; i++) {
                const tokenAdd = readNumberFromHeap(simEnv, blockAdd + i * 16);
                const tokenLen = readNumberFromHeap(simEnv, blockAdd + i * 16 + 8);
                ret.push(readStringFromHeap(simEnv, tokenAdd, tokenLen));
            }
        }
        return ret.join(" ");
    }
    return "";
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
    const astProgram = await parse(vocabulary, program, filename);
    checkForUnusedCode(astProgram);

    dumpAst(astProgram);
    if (action === "sim") {
        sim(vocabulary, astProgram, false);
        Deno.exit(0);
    }

    buildLinks(astProgram, undefined);
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

