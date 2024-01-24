var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var RET_STACK_CAPACITY = 640 * 1024;
var CTX_STACK_CAPACITY = 640 * 1024;
var MEM_CAPACITY = 640 * 1024;
var NO_PEEPHOLE_OPT_DIRECTIVE = ";no-peephole-opt";
var CTX_PAGE = 3;
//const CTX_PAGE = 159; // 9F00 - 9FFF last page of basic
var TokenType;
(function (TokenType) {
    TokenType[TokenType["LITERAL"] = 0] = "LITERAL";
    TokenType[TokenType["PLUS"] = 1] = "PLUS";
    TokenType[TokenType["MINUS"] = 2] = "MINUS";
    TokenType[TokenType["MULT"] = 3] = "MULT";
    TokenType[TokenType["DIV"] = 4] = "DIV";
    TokenType[TokenType["MOD"] = 5] = "MOD";
    TokenType[TokenType["PRINT"] = 6] = "PRINT";
    TokenType[TokenType["PRIN"] = 7] = "PRIN";
    TokenType[TokenType["EMIT"] = 8] = "EMIT";
    TokenType[TokenType["NL"] = 9] = "NL";
    TokenType[TokenType["NOT"] = 10] = "NOT";
    TokenType[TokenType["LT"] = 11] = "LT";
    TokenType[TokenType["LTEQ"] = 12] = "LTEQ";
    TokenType[TokenType["EQ"] = 13] = "EQ";
    TokenType[TokenType["GT"] = 14] = "GT";
    TokenType[TokenType["GTEQ"] = 15] = "GTEQ";
    TokenType[TokenType["AND"] = 16] = "AND";
    TokenType[TokenType["OR"] = 17] = "OR";
    TokenType[TokenType["OPEN_BRACKETS"] = 18] = "OPEN_BRACKETS";
    TokenType[TokenType["OPEN_REF_BRACKETS"] = 19] = "OPEN_REF_BRACKETS";
    TokenType[TokenType["OPEN_LIT_BRACKETS"] = 20] = "OPEN_LIT_BRACKETS";
    TokenType[TokenType["CLOSE_BRACKETS"] = 21] = "CLOSE_BRACKETS";
    TokenType[TokenType["IF"] = 22] = "IF";
    TokenType[TokenType["EITHER"] = 23] = "EITHER";
    TokenType[TokenType["BLOCK"] = 24] = "BLOCK";
    TokenType[TokenType["REF_BLOCK"] = 25] = "REF_BLOCK";
    TokenType[TokenType["ARRAY_BLOCK"] = 26] = "ARRAY_BLOCK";
    TokenType[TokenType["WORD_BLOCK"] = 27] = "WORD_BLOCK";
    TokenType[TokenType["SET_WORD"] = 28] = "SET_WORD";
    TokenType[TokenType["LIT_WORD"] = 29] = "LIT_WORD";
    TokenType[TokenType["WORD"] = 30] = "WORD";
    TokenType[TokenType["WHILE"] = 31] = "WHILE";
    TokenType[TokenType["POKE"] = 32] = "POKE";
    TokenType[TokenType["PEEK"] = 33] = "PEEK";
    TokenType[TokenType["CAST_BYTE"] = 34] = "CAST_BYTE";
    TokenType[TokenType["CAST_NUMBER"] = 35] = "CAST_NUMBER";
    TokenType[TokenType["CAST_STRING"] = 36] = "CAST_STRING";
    TokenType[TokenType["CAST_WORD"] = 37] = "CAST_WORD";
    TokenType[TokenType["NUMBER"] = 38] = "NUMBER";
    TokenType[TokenType["STRING"] = 39] = "STRING";
    TokenType[TokenType["WORD_TYPE"] = 40] = "WORD_TYPE";
    TokenType[TokenType["BYTE"] = 41] = "BYTE";
    TokenType[TokenType["BOOL"] = 42] = "BOOL";
    TokenType[TokenType["ADDR"] = 43] = "ADDR";
    TokenType[TokenType["STR_JOIN"] = 44] = "STR_JOIN";
    TokenType[TokenType["LENGHT"] = 45] = "LENGHT";
    TokenType[TokenType["STACK"] = 46] = "STACK";
    TokenType[TokenType["PROG"] = 47] = "PROG";
    TokenType[TokenType["INC"] = 48] = "INC";
    TokenType[TokenType["STRUCT"] = 49] = "STRUCT";
    TokenType[TokenType["ARROW"] = 50] = "ARROW";
    TokenType[TokenType["SET_ARROW"] = 51] = "SET_ARROW";
    TokenType[TokenType["NEW"] = 52] = "NEW";
    TokenType[TokenType["RECORD"] = 53] = "RECORD";
    TokenType[TokenType["ARRAY"] = 54] = "ARRAY";
    TokenType[TokenType["ARRAY_TYPE"] = 55] = "ARRAY_TYPE";
    TokenType[TokenType["AT"] = 56] = "AT";
    TokenType[TokenType["CHANGE"] = 57] = "CHANGE";
    TokenType[TokenType["INCLUDE"] = 58] = "INCLUDE";
    TokenType[TokenType["RETURN"] = 59] = "RETURN";
    TokenType[TokenType["SYSCALL3"] = 60] = "SYSCALL3";
    TokenType[TokenType["SYSCALL4"] = 61] = "SYSCALL4";
    TokenType[TokenType["DROP"] = 62] = "DROP";
    TokenType[TokenType["ASM"] = 63] = "ASM";
    TokenType[TokenType["TOKEN_COUNT"] = 64] = "TOKEN_COUNT";
})(TokenType || (TokenType = {}));
var InstructionPosition;
(function (InstructionPosition) {
    InstructionPosition[InstructionPosition["PREFIX"] = 0] = "PREFIX";
    InstructionPosition[InstructionPosition["INFIX"] = 1] = "INFIX";
    InstructionPosition[InstructionPosition["POSTFIX"] = 2] = "POSTFIX";
})(InstructionPosition || (InstructionPosition = {}));
function sizeOfStruct(context, t, target) {
    if (typeof t === "string") {
        logError(context.element.loc, "the type '".concat(t, "' is not a struct"));
        exit();
    }
    if (t[0] === "array")
        return sizeForValueType("addr", target);
    if (t[0] === "addr")
        return sizeForValueType("addr", target);
    var typeName = t[1];
    var structDef = getWordDefinition(context, typeName);
    if (structDef === undefined || structDef.type !== "struct") {
        logError(context.element.loc, "getting the size of struct, can't find struct ".concat(typeName));
        exit();
    }
    var size = 0;
    for (var i = 0; i < structDef.elements.length; i++) {
        var element = structDef.elements[i];
        var currSize = sizeForValueType(element.type, target);
        size += currSize;
    }
    return size;
}
function sizeForValueType(t, target) {
    if (target === "c64") {
        switch (t) {
            case "addr": return 2;
            case "bool": return 1;
            case "byte": return 1;
            case "number": return 2;
            case "string": return 4;
            case "word": return 4;
            case "void": return 0;
            case "record": return 0;
            default: {
                if (t[0] === "array") {
                    return 4;
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
            case "word": return 16;
            case "void": return 0;
            case "record": return 0;
            default: {
                if (t[0] === "array")
                    return 16;
                return 8; // usertype is always an address
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
            case "word": return 2;
            case "void": return 0;
            case "record": return 0;
            default: {
                if (t[0] === "array")
                    return 2;
                return 1; // usertype is alwaya an address
            }
        }
    }
    console.log("target system '".concat(target, "' unknown"));
    exit();
}
function isABlock(type) {
    return type === TokenType.BLOCK ||
        type === TokenType.REF_BLOCK ||
        type === TokenType.RECORD ||
        type === TokenType.ARRAY_BLOCK ||
        type === TokenType.WORD_BLOCK;
}
function humanReadableToken(t) {
    if (t === undefined)
        return "undefined";
    console.assert(TokenType.TOKEN_COUNT === 64, "Exaustive token types count");
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
        default:
            throw new Error("Token Type ".concat(t, " not defined"));
    }
}
function humanReadableType(t) {
    if (t === undefined)
        return "undefined";
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
            if (t[0] === "array")
                return "Array of " + humanReadableType(t[1]);
            if (t[0] === "addr")
                return "Address of " + humanReadableType(t[1]);
            return t[1];
    }
}
function getFunctionSignature(token) {
    var ins;
    var out;
    if (token.type === TokenType.WORD) {
        var varDef = getWordDefinition(token.context, token.txt);
        ins = varDef === null || varDef === void 0 ? void 0 : varDef.ins;
        out = varDef === null || varDef === void 0 ? void 0 : varDef.out;
    }
    else {
        ins = token.ins;
        out = token.out;
    }
    var strIns = ins === undefined ? "undefined" : ins.map(function (t) { return humanReadableType(t); }).join(",");
    var strOut = humanReadableType(out);
    return "(".concat(strIns, ")=>").concat(strOut);
}
function humanReadableFunction(token) {
    return token.txt + ":" + getFunctionSignature(token);
}
function getArity(token, vocabulary) {
    var _a;
    if (token.type === TokenType.WORD) {
        var varDef = getWordDefinition(token.context, token.txt);
        if (varDef === undefined) {
            logError(token.loc, "Unnkown word '".concat(token.txt, "'"));
            exit();
        }
        //return varDef.type === "function" ? varDef.ins.length : varDef.type === "struct" ? 1 : 0;
        return varDef.ins.length;
    }
    if (token.ins !== undefined)
        return token.ins.length;
    if (token.expectedArity !== undefined)
        return token.expectedArity;
    var expectedArity = (_a = vocabulary[token.type]) === null || _a === void 0 ? void 0 : _a.expectedArity;
    if (expectedArity !== undefined)
        return expectedArity;
    logError(token.loc, "cannot determine the expected arity for word '".concat(token.txt, "'"));
    exit();
}
function getInputParametersValue(token) {
    if (token.type === TokenType.WORD) {
        var varDef = getWordDefinition(token.context, token.txt);
        if (varDef === undefined) {
            logError(token.loc, "Unnkown word '".concat(token.txt, "'"));
            exit();
        }
        return varDef.ins;
    }
    if (token.ins === undefined) {
        logError(token.loc, "the input parameters for word '".concat(token.txt, "' are undefined"));
        exit();
    }
    return token.ins;
}
function getInstructionPosition(token) {
    if (token.position === undefined) {
        logError(token.loc, "the position for word '".concat(token.txt, "' is undefined"));
        exit();
    }
    return token.position;
}
function getWordOffset(context, varName, target) {
    if (context === undefined) {
        console.log("cannot find offset for word '".concat(varName, "' the context is undefined"));
        exit();
    }
    var sizeToReserve = 0;
    var currentContext = context;
    while (currentContext !== undefined) {
        for (var _i = 0, _a = Object.entries(currentContext.varsDefinition); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], varDef = _b[1];
            if (key === varName)
                return sizeToReserve;
            sizeToReserve += sizeForValueType(varDef.internalType, target);
        }
        currentContext = currentContext.parent;
    }
    logError(context.element.loc, "cannot find offset for word '".concat(varName, "'"));
    exit();
}
function sizeOfContext(context, target) {
    var size = 0;
    Object.values(context.varsDefinition).forEach(function (varDef) {
        size += sizeForValueType(varDef.internalType, target);
    });
    return size;
}
function getWordDefinition(context, variableName, passedThruRefBlock) {
    var _a;
    if (passedThruRefBlock === void 0) { passedThruRefBlock = false; }
    if (context === undefined)
        return undefined;
    var debug = false;
    var tryDef = context.varsDefinition[variableName];
    if (tryDef !== undefined) {
        var isGlobalContext = context.parent === undefined;
        // function cannot refer to a local words in parent context
        if (!isGlobalContext && passedThruRefBlock && tryDef.type !== "struct")
            return undefined;
        return __assign({ isGlobalContext: isGlobalContext }, tryDef);
    }
    if (context.parent !== undefined) {
        var isThisARefBlock = ((_a = context.element) === null || _a === void 0 ? void 0 : _a.type) === TokenType.REF_BLOCK;
        return getWordDefinition(context.parent, variableName, isThisARefBlock ? true : passedThruRefBlock);
    }
    return undefined;
}
function getAsmVarName(varName) {
    return "V_" + varName;
}
function simSetWordPointedByTOS(simEnv, varType, offset) {
    switch (varType) {
        case "number":
        case "byte":
        case "addr":
        case "bool":
            {
                var value = stackPop(simEnv);
                var address = stackPop(simEnv) + offset;
                storeNumberOnHeap(simEnv, value, address);
            }
            break;
        case "string":
        case "word":
            {
                var value = stackPop(simEnv);
                var lenght = stackPop(simEnv);
                var address = stackPop(simEnv) + offset;
                storeNumberOnHeap(simEnv, value, address);
                storeNumberOnHeap(simEnv, lenght, address + 8);
            }
            break;
        case "record":
        case "void":
            logError(simEnv.pc.loc, "'".concat(simEnv.pc.txt, "' cannot set word which address is on TOS since its type is '").concat(humanReadableType(varType), "'"));
            exit();
        default:
            if (varType[0] === "array") {
                var value = stackPop(simEnv);
                var lenght = stackPop(simEnv);
                var address = stackPop(simEnv) + offset;
                storeNumberOnHeap(simEnv, value, address);
                storeNumberOnHeap(simEnv, lenght, address + 8);
            }
            else {
                var value = stackPop(simEnv);
                var address = stackPop(simEnv) + offset;
                storeNumberOnHeap(simEnv, value, address);
            }
    }
}
function getAsmForSetWordPointedByTOS(varType, offset, target) {
    if (target === "c64") {
        switch (varType) {
            case "bool":
            case "byte":
                return [
                    "JSR POP16",
                    "LDA STACKBASE + 1,X",
                    "STA AUX",
                    "LDA STACKBASE + 2,X",
                    "STA AUX + 1",
                    "LDY #".concat(offset),
                    "LDA STACKACCESS",
                    "STA (AUX),Y",
                    "JSR POP16",
                ];
            case "number":
            case "addr":
                return [
                    NO_PEEPHOLE_OPT_DIRECTIVE,
                    "JSR POP16",
                    "LDA STACKBASE + 1,X",
                    "STA AUX",
                    "LDA STACKBASE + 2,X",
                    "STA AUX + 1",
                    "LDY #".concat(offset),
                    "LDA STACKACCESS",
                    "STA (AUX),Y",
                    "INY",
                    "LDA STACKACCESS + 1",
                    "STA (AUX),Y",
                    "JSR POP16",
                ];
            case "string":
            case "word":
                return [
                    "JSR POP16",
                    "LDA STACKBASE + 3,X",
                    "STA AUX",
                    "LDA STACKBASE + 4,X",
                    "STA AUX + 1",
                    "LDY #".concat(offset),
                    "LDA STACKACCESS",
                    "STA (AUX),Y",
                    "INY",
                    "LDA STACKACCESS + 1",
                    "STA (AUX),Y",
                    "INY",
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "STA (AUX),Y",
                    "INY",
                    "LDA STACKACCESS + 1",
                    "STA (AUX),Y",
                    "JSR POP16",
                ];
            case "record":
            case "void":
                return [];
            default:
                if (varType[0] === "array") {
                    return [
                        "JSR POP16",
                        "LDA STACKBASE + 3,X",
                        "STA AUX",
                        "LDA STACKBASE + 4,X",
                        "STA AUX + 1",
                        "LDY #".concat(offset),
                        "LDA STACKACCESS",
                        "STA (AUX),Y",
                        "INY",
                        "LDA STACKACCESS + 1",
                        "STA (AUX),Y",
                        "INY",
                        "JSR POP16",
                        "LDA STACKACCESS",
                        "STA (AUX),Y",
                        "INY",
                        "LDA STACKACCESS + 1",
                        "STA (AUX),Y",
                        "JSR POP16",
                    ];
                }
                return [
                    "JSR POP16",
                    "LDA STACKBASE + 1,X",
                    "STA AUX",
                    "LDA STACKBASE + 2,X",
                    "STA AUX + 1",
                    "LDY #".concat(offset),
                    "LDA STACKACCESS",
                    "STA (AUX),Y",
                    "INY",
                    "LDA STACKACCESS + 1",
                    "STA (AUX),Y",
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
                    "mov [rax + ".concat(offset, "], rbx"),
                ];
            case "string":
            case "word":
                return [
                    "pop rbx",
                    "pop rcx",
                    "pop rax",
                    "mov [rax + ".concat(offset, "], rbx"),
                    "mov [rax + ".concat(offset + 8, "], rcx"),
                ];
            case "record":
            case "void":
                return [];
            default:
                if (varType[0] === "array") {
                    return [
                        "pop rbx",
                        "pop rcx",
                        "pop rax",
                        "mov [rax + ".concat(offset, "], rbx"),
                        "mov [rax + ".concat(offset + 8, "], rcx"),
                    ];
                }
                return [
                    "pop rbx",
                    "pop rax",
                    "mov [rax + ".concat(offset, "], rbx"),
                ];
        }
    }
    console.log("target system '".concat(target, "' unknown"));
    exit();
}
function simGetWordPointedByTOS(simEnv, varType, offset) {
    switch (varType) {
        case "number":
        case "bool":
        case "byte":
        case "addr":
            {
                var address = stackPop(simEnv) + offset;
                simEnv.dataStack.push(readNumberFromHeap(simEnv, address));
            }
            break;
        case "string":
        case "word":
            {
                var address = stackPop(simEnv) + offset;
                simEnv.dataStack.push(readNumberFromHeap(simEnv, address + 8));
                simEnv.dataStack.push(readNumberFromHeap(simEnv, address));
            }
            break;
        case "record":
        case "void":
            logError(simEnv.pc.loc, "'".concat(simEnv.pc.txt, "' cannot get word which address is on TOS since its type is '").concat(humanReadableType(varType), "'"));
            exit();
        default:
            if (varType[0] === "array") {
                var address = stackPop(simEnv) + offset;
                simEnv.dataStack.push(readNumberFromHeap(simEnv, address + 8));
                simEnv.dataStack.push(readNumberFromHeap(simEnv, address));
            }
            else {
                var address = stackPop(simEnv) + offset;
                simEnv.dataStack.push(readNumberFromHeap(simEnv, address));
            }
    }
}
function getAsmForGetWordPointedByTOS(varType, offset, target) {
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
                    "LDY #".concat(offset),
                    "LDA (AUX),Y",
                    "STA STACKACCESS",
                    "LDA #0",
                    "STA STACKACCESS + 1",
                    "JSR PUSH16",
                ];
            case "number":
            case "addr":
                return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "STA AUX",
                    "LDA STACKACCESS + 1",
                    "STA AUX + 1",
                    "LDY #".concat(offset),
                    "LDA (AUX),Y",
                    "STA STACKACCESS",
                    "INY",
                    "LDA (AUX),Y",
                    "STA STACKACCESS + 1",
                    "JSR PUSH16",
                ];
            case "string":
            case "word":
                return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "STA AUX",
                    "LDA STACKACCESS + 1",
                    "STA AUX + 1",
                    "LDY #".concat(offset + 3),
                    "LDA (AUX),Y",
                    "STA STACKACCESS + 1",
                    "DEY",
                    "LDA (AUX),Y",
                    "STA STACKACCESS + 0",
                    "JSR PUSH16",
                    "DEY",
                    "LDA (AUX),Y",
                    "STA STACKACCESS + 1",
                    "DEY",
                    "LDA (AUX),Y",
                    "STA STACKACCESS + 0",
                    "JSR PUSH16",
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
                        "LDY #".concat(offset, " + 3"),
                        "LDA (AUX),Y",
                        "STA STACKACCESS + 1",
                        "DEY",
                        "LDA (AUX),Y",
                        "STA STACKACCESS",
                        "JSR PUSH16",
                        "DEY",
                        "LDA (AUX),Y",
                        "STA STACKACCESS + 1",
                        "DEY",
                        "LDA (AUX),Y",
                        "STA STACKACCESS",
                        "JSR PUSH16",
                    ];
                }
                return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "STA AUX",
                    "LDA STACKACCESS + 1",
                    "STA AUX + 1",
                    "LDY #".concat(offset),
                    "LDA (AUX),Y",
                    "STA STACKACCESS",
                    "INY",
                    "LDA (AUX),Y",
                    "STA STACKACCESS + 1",
                    "JSR PUSH16",
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
                    "mov rbx, [rax + ".concat(offset, "]"),
                    "push rbx",
                ];
            case "string":
            case "word":
                return [
                    "pop rax",
                    "mov rbx, [rax + ".concat(offset + 8, "]"),
                    "push rbx",
                    "mov rbx, [rax + ".concat(offset, "]"),
                    "push rbx",
                ];
            case "record":
            case "void":
                return [];
            default:
                if (varType[0] === "array") {
                    return [
                        "pop rax",
                        "mov rbx, [rax + ".concat(offset + 8, "]"),
                        "push rbx",
                        "mov rbx, [rax + ".concat(offset, "]"),
                        "push rbx",
                    ];
                }
                return [
                    "pop rax",
                    "mov rbx, [rax + ".concat(offset, "]"),
                    "push rbx",
                ];
        }
    }
    console.log("target system '".concat(target, "' unknown"));
    exit();
}
function getAsmForSetWordGlobal(varType, asmVarName, offset, target) {
    if (target === "c64") {
        switch (varType) {
            case "bool":
                return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "STA ".concat(asmVarName, " + ").concat(offset),
                ];
            case "number":
                return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "STA ".concat(asmVarName, " + ").concat(offset),
                    "LDA STACKACCESS + 1",
                    "STA ".concat(asmVarName, " + ").concat(offset + 1),
                ];
            case "byte":
                return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "STA ".concat(asmVarName, " + ").concat(offset),
                ];
            case "string":
            case "word":
                return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "STA ".concat(asmVarName, " + ").concat(offset + 0),
                    "LDA STACKACCESS + 1",
                    "STA ".concat(asmVarName, " + ").concat(offset + 1),
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "STA ".concat(asmVarName, " + ").concat(offset + 2),
                    "LDA STACKACCESS + 1",
                    "STA ".concat(asmVarName, " + ").concat(offset + 3),
                ];
            case "addr":
                return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "STA ".concat(asmVarName, " + ").concat(offset),
                    "LDA STACKACCESS + 1",
                    "STA ".concat(asmVarName, " + ").concat(offset + 1),
                ];
            case "record":
            case "void":
                return [];
            default:
                if (varType[0] === "array") {
                    return [
                        "JSR POP16",
                        "LDA STACKACCESS",
                        "STA ".concat(asmVarName, " + ").concat(offset + 0),
                        "LDA STACKACCESS + 1",
                        "STA ".concat(asmVarName, " + ").concat(offset + 1),
                        "JSR POP16",
                        "LDA STACKACCESS",
                        "STA ".concat(asmVarName, " + ").concat(offset + 2),
                        "LDA STACKACCESS + 1",
                        "STA ".concat(asmVarName, " + ").concat(offset + 3),
                    ];
                }
                return [
                    "JSR POP16",
                    "LDA STACKACCESS",
                    "STA ".concat(asmVarName, " + ").concat(offset),
                    "LDA STACKACCESS + 1",
                    "STA ".concat(asmVarName, " + ").concat(offset + 1),
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
                    "mov [".concat(asmVarName, "], rax"),
                ];
            case "byte":
                return [
                    "pop rax",
                    "mov [".concat(asmVarName, "], rax"),
                ];
            case "string":
            case "word":
                return [
                    "pop rax",
                    "mov [".concat(asmVarName, "], rax"),
                    "pop rax",
                    "mov [".concat(asmVarName, "+8], rax"),
                ];
            case "bool":
                return [
                    "pop rax",
                    "mov [".concat(asmVarName, "], rax"),
                ];
            case "addr":
                return [
                    "pop rax",
                    "mov [".concat(asmVarName, "], rax"),
                ];
            case "record":
            case "void":
                return [];
            default:
                if (varType[0] === "array") {
                    return [
                        "pop rax",
                        "mov [".concat(asmVarName, "], rax"),
                        "pop rax",
                        "mov [".concat(asmVarName, "+8], rax"),
                    ];
                }
                return [
                    "pop rax",
                    "mov [".concat(asmVarName, "], rax"),
                ];
        }
    }
    console.log("target system '".concat(target, "' unknown"));
    exit();
}
function simSetWordGlobal(simEnv, varType, varName) {
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
            }
            else {
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
                }
                else {
                    storeNumberOnHeap(simEnv, stackPop(simEnv), simEnv.vars[varName]);
                    storeNumberOnHeap(simEnv, stackPop(simEnv), simEnv.vars[varName] + 8);
                }
            }
            else {
                simEnv.vars[varName] = storeNumberOnHeap(simEnv, stackPop(simEnv), simEnv.vars[varName]);
            }
            return;
    }
}
function getAsmForSetWordLocal(varType, offset, target) {
    if (target === "c64") {
        var popAndOffsetStack = [
            "JSR POP16",
            "LDX CTX_SP16",
        ];
        var contextPage = CTX_PAGE * 256;
        var finalAddress = contextPage + offset;
        switch (varType) {
            case "number":
                return popAndOffsetStack.concat([
                    "LDA STACKACCESS",
                    "STA ".concat(finalAddress, ",X"),
                    "LDA STACKACCESS + 1",
                    "STA ".concat(finalAddress + 1, ",X")
                ]);
            case "string":
            case "word":
                return popAndOffsetStack.concat([
                    "LDA STACKACCESS",
                    "STA ".concat(finalAddress + 0, ",X"),
                    "LDA STACKACCESS + 1",
                    "STA ".concat(finalAddress + 1, ",X"),
                    "JSR POP16",
                    "LDX CTX_SP16",
                    "LDA STACKACCESS",
                    "STA ".concat(finalAddress + 2, ",X"),
                    "LDA STACKACCESS + 1",
                    "STA ".concat(finalAddress + 3, ",X"),
                ]);
            case "byte":
                return popAndOffsetStack.concat([
                    "LDA STACKACCESS",
                    "STA ".concat(finalAddress + 0, ",X"),
                ]);
            case "bool":
                return popAndOffsetStack.concat([
                    "LDA STACKACCESS",
                    "STA ".concat(finalAddress + 0, ",X"),
                ]);
            case "addr":
                return popAndOffsetStack.concat([
                    "LDA STACKACCESS",
                    "STA ".concat(finalAddress + 0, ",X"),
                    "LDA STACKACCESS + 1",
                    "STA ".concat(finalAddress + 1, ",X"),
                ]);
            case "record":
            case "void":
                return [];
            default:
                if (varType[0] === "array") {
                    return popAndOffsetStack.concat([
                        "LDA STACKACCESS",
                        "STA ".concat(finalAddress + 0, ",X"),
                        "LDA STACKACCESS + 1",
                        "STA ".concat(finalAddress + 1, ",X"),
                        "JSR POP16",
                        "LDX CTX_SP16",
                        "LDA STACKACCESS",
                        "STA ".concat(finalAddress + 2, ",X"),
                        "LDA STACKACCESS + 1",
                        "STA ".concat(finalAddress + 3, ",X"),
                    ]);
                }
                return popAndOffsetStack.concat([
                    "LDA STACKACCESS",
                    "STA ".concat(finalAddress + 0, ",X"),
                    "LDA STACKACCESS + 1",
                    "STA ".concat(finalAddress + 1, ",X"),
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
                    "add rax, ".concat(offset),
                    "mov [rax], rbx",
                ];
            case "string":
            case "word":
                return [
                    "pop rbx",
                    "mov rax, [ctx_stack_rsp]",
                    "add rax, ".concat(offset),
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
                        "add rax, ".concat(offset),
                        "mov [rax], rbx",
                        "pop rbx",
                        "add rax, 8",
                        "mov [rax], rbx",
                    ];
                }
                return [
                    "pop rbx",
                    "mov rax, [ctx_stack_rsp]",
                    "add rax, ".concat(offset),
                    "mov [rax], rbx",
                ];
        }
    }
    console.log("target system '".concat(target, "' unknown"));
    exit();
}
function simSetWordLocal(simEnv, varType, offset) {
    switch (varType) {
        case "number":
        case "bool":
        case "byte":
        case "addr":
            var valueToStore = stackPop(simEnv);
            simEnv.ctxStack[simEnv.ctxStack.length - 1 - offset] = valueToStore;
            return;
        case "string":
        case "word":
            var address = stackPop(simEnv);
            var lenght = stackPop(simEnv);
            simEnv.ctxStack[simEnv.ctxStack.length - 1 - offset] = address;
            simEnv.ctxStack[simEnv.ctxStack.length - 2 - offset] = lenght;
            return;
        case "record":
        case "void":
            return;
        default:
            if (varType[0] === "array") {
                var address_1 = stackPop(simEnv);
                var lenght_1 = stackPop(simEnv);
                simEnv.ctxStack[simEnv.ctxStack.length - 1 - offset] = address_1;
                simEnv.ctxStack[simEnv.ctxStack.length - 2 - offset] = lenght_1;
            }
            else {
                // struct or address
                var valueToStore_1 = stackPop(simEnv);
                simEnv.ctxStack[simEnv.ctxStack.length - 1 - offset] = valueToStore_1;
            }
            return;
    }
}
function getAsmForGetWordGlobal(token, varType, asmVarName, isFunction, target) {
    if (target === "c64") {
        if (isFunction) {
            return [
                "LDA ".concat(asmVarName),
                "STA CALL_FUN_@ + 1",
                "LDA ".concat(asmVarName, " + 1"),
                "STA CALL_FUN_@ + 2",
                "CALL_FUN_@:",
                "JSR $1111 ; will be overwritten"
            ];
        }
        switch (varType) {
            case "bool":
                return [
                    "LDA ".concat(asmVarName),
                    "STA STACKACCESS",
                    "LDA #0",
                    "STA STACKACCESS + 1",
                    "JSR PUSH16"
                ];
            case "number":
                return [
                    "LDA ".concat(asmVarName),
                    "STA STACKACCESS",
                    "LDA ".concat(asmVarName, " + 1"),
                    "STA STACKACCESS + 1",
                    "JSR PUSH16"
                ];
            case "byte":
                return [
                    "LDA ".concat(asmVarName),
                    "STA STACKACCESS",
                    "LDA #0",
                    "STA STACKACCESS + 1",
                    "JSR PUSH16"
                ];
            case "string":
            case "word":
                return [
                    "LDA ".concat(asmVarName, " + 2"),
                    "STA STACKACCESS",
                    "LDA ".concat(asmVarName, " + 3"),
                    "STA STACKACCESS + 1",
                    "JSR PUSH16",
                    "LDA ".concat(asmVarName, " + 0"),
                    "STA STACKACCESS",
                    "LDA ".concat(asmVarName, " + 1"),
                    "STA STACKACCESS + 1",
                    "JSR PUSH16"
                ];
            case "addr":
                return [
                    "LDA ".concat(asmVarName),
                    "STA CALL_FUN_@ + 1",
                    "LDA ".concat(asmVarName, " + 1"),
                    "STA CALL_FUN_@ + 2",
                    "CALL_FUN_@:",
                    "JSR $1111 ; will be overwritten"
                ];
            case "record":
                return [
                    "LDA ".concat(asmVarName),
                    "STA STACKACCESS",
                    "LDA ".concat(asmVarName, " + 1"),
                    "STA STACKACCESS + 1",
                    "JSR PUSH16"
                ];
            case "void":
                logError(token.loc, "cannot compile asm to retrieve value for '".concat(token.txt, "' of '").concat(humanReadableType(varType), "' type"));
                exit();
            default:
                if (varType[0] === "array") {
                    return [
                        "LDA ".concat(asmVarName, " + 2"),
                        "STA STACKACCESS",
                        "LDA ".concat(asmVarName, " + 3"),
                        "STA STACKACCESS + 1",
                        "JSR PUSH16",
                        "LDA ".concat(asmVarName, " + 0"),
                        "STA STACKACCESS",
                        "LDA ".concat(asmVarName, " + 1"),
                        "STA STACKACCESS + 1",
                        "JSR PUSH16"
                    ];
                }
                return [
                    "LDA ".concat(asmVarName),
                    "STA STACKACCESS",
                    "LDA ".concat(asmVarName, " + 1"),
                    "STA STACKACCESS + 1",
                    "JSR PUSH16"
                ];
        }
    }
    if (target === "freebsd") {
        if (isFunction) {
            return [
                "mov rbx, [".concat(asmVarName, "]"),
                "mov rax, rsp",
                "mov rsp, [ret_stack_rsp]",
                "call rbx",
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
                    "mov rax, [".concat(asmVarName, "]"),
                    "push rax",
                ];
            case "string":
            case "word":
                return [
                    "mov rax, [".concat(asmVarName, " + 8]"),
                    "push rax",
                    "mov rax, [".concat(asmVarName, "]"),
                    "push rax",
                ];
            case "void":
            case "record":
                logError(token.loc, "cannot compile asm to retrieve value for '".concat(token.txt, "' of '").concat(humanReadableType(varType), "' type"));
                exit();
            default:
                if (varType[0] === "array") {
                    return [
                        "mov rax, [".concat(asmVarName, " + 8]"),
                        "push rax",
                        "mov rax, [".concat(asmVarName, "]"),
                        "push rax",
                    ];
                }
                return [
                    //`mov rax, ${asmVarName}`,
                    "mov rax, [".concat(asmVarName, "]"),
                    "push rax",
                ];
        }
    }
    console.log("target system '".concat(target, "' unknown"));
    exit();
}
function simGetWordGlobal(simEnv, token, varType, varName) {
    switch (varType) {
        case "number":
        case "bool":
        case "byte":
        case "addr":
            {
                var addr = simEnv.vars[varName];
                if (addr === undefined) {
                    logError(token.loc, "'".concat(token.txt, "' vars is undefined"));
                    exit();
                }
                simEnv.dataStack.push(readNumberFromHeap(simEnv, addr));
            }
            break;
        case "string":
        case "word":
            {
                var addr = simEnv.vars[varName];
                if (addr === undefined) {
                    logError(token.loc, "'".concat(token.txt, "' vars is undefined"));
                    exit();
                }
                simEnv.dataStack.push(readNumberFromHeap(simEnv, addr + 8));
                simEnv.dataStack.push(readNumberFromHeap(simEnv, addr));
            }
            break;
        case "void":
        case "record":
            logError(token.loc, "cannot sim retrieve value for '".concat(token.txt, "' of '").concat(humanReadableType(varType), "' type"));
            exit();
        default:
            if (varType[0] === "array") {
                var addr = simEnv.vars[varName];
                if (addr === undefined) {
                    logError(token.loc, "'".concat(token.txt, "' vars is undefined"));
                    exit();
                }
                simEnv.dataStack.push(readNumberFromHeap(simEnv, addr + 8));
                simEnv.dataStack.push(readNumberFromHeap(simEnv, addr));
            }
            else {
                var addr = simEnv.vars[varName];
                if (addr === undefined) {
                    logError(token.loc, "'".concat(token.txt, "' vars is undefined"));
                    exit();
                }
                simEnv.dataStack.push(readNumberFromHeap(simEnv, addr));
            }
    }
}
function getAsmForGetWordLocal(varType, offset, isFunction, target) {
    if (target === "c64") {
        var asmOffset = [
            "LDX CTX_SP16",
        ];
        var contextPage = CTX_PAGE * 256;
        var finalAddress = contextPage + offset;
        if (isFunction) {
            return asmOffset.concat([
                "LDA ".concat(finalAddress + 0, ",X"),
                "STA CALL_FUN_@ + 1",
                "LDA ".concat(finalAddress + 1, ",X"),
                "STA CALL_FUN_@ + 2",
                "CALL_FUN_@:",
                "JSR $1111 ; will be overwritten"
            ]);
        }
        switch (varType) {
            case "number":
                return asmOffset.concat([
                    "LDA ".concat(finalAddress + 0, ",X"),
                    "STA STACKACCESS",
                    "LDA ".concat(finalAddress + 1, ",X"),
                    "STA STACKACCESS + 1",
                    "JSR PUSH16"
                ]);
            case "string":
            case "word":
                return asmOffset.concat([
                    "LDA ".concat(finalAddress + 2, ",X"),
                    "STA STACKACCESS",
                    "LDA ".concat(finalAddress + 3, ",X"),
                    "STA STACKACCESS + 1",
                    "JSR PUSH16",
                    "LDX CTX_SP16",
                    "LDA ".concat(finalAddress + 0, ",X"),
                    "STA STACKACCESS",
                    "LDA ".concat(finalAddress + 1, ",X"),
                    "STA STACKACCESS + 1",
                    "JSR PUSH16"
                ]);
            case "byte":
            case "bool":
                return asmOffset.concat([
                    "LDA ".concat(finalAddress + 0, ",X"),
                    "STA STACKACCESS",
                    "LDA #0",
                    "STA STACKACCESS + 1",
                    "JSR PUSH16"
                ]);
            case "addr":
                return asmOffset.concat([
                    "LDA ".concat(finalAddress + 0, ",X"),
                    "STA CALL_FUN_@ + 1",
                    "LDA ".concat(finalAddress + 1, ",X"),
                    "STA CALL_FUN_@ + 2",
                    "CALL_FUN_@:",
                    "JSR $1111 ; will be overwritten"
                ]);
            case "record":
            case "void":
                return [];
            default:
                if (varType[0] === "array") {
                    return asmOffset.concat([
                        "LDA ".concat(finalAddress + 2, ",X"),
                        "STA STACKACCESS",
                        "LDA ".concat(finalAddress + 3, ",X"),
                        "STA STACKACCESS + 1",
                        "JSR PUSH16",
                        "LDX CTX_SP16",
                        "LDA ".concat(finalAddress + 0, ",X"),
                        "STA STACKACCESS",
                        "LDA ".concat(finalAddress + 1, ",X"),
                        "STA STACKACCESS + 1",
                        "JSR PUSH16"
                    ]);
                }
                return asmOffset.concat([
                    "LDA ".concat(finalAddress + 0, ",X"),
                    "STA STACKACCESS",
                    "LDA ".concat(finalAddress + 1, ",X"),
                    "STA STACKACCESS + 1",
                    "JSR PUSH16",
                ]);
        }
    }
    if (target === "freebsd") {
        if (isFunction) {
            return [
                "mov rax, [ctx_stack_rsp]",
                "add rax, ".concat(offset),
                "mov rbx, [rax]",
                "mov rax, rsp",
                "mov rsp, [ret_stack_rsp]",
                "call rbx",
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
                    "add rax, ".concat(offset),
                    "mov rbx, [rax]",
                    "push rbx",
                ];
            case "string":
            case "word":
                return [
                    "mov rax, [ctx_stack_rsp]",
                    "add rax, ".concat(offset),
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
                        "add rax, ".concat(offset),
                        "mov rcx, [rax]",
                        "mov rbx, [rax + 8]",
                        "push rbx",
                        "push rcx"
                    ];
                }
                return [
                    "mov rax, [ctx_stack_rsp]",
                    "add rax, ".concat(offset),
                    "mov rbx, [rax]",
                    "push rbx",
                ];
        }
    }
    console.log("target system '".concat(target, "' unknown"));
    exit();
}
function simGetWordLocal(simEnv, token, varType, offset) {
    switch (varType) {
        case "number":
        case "bool":
        case "byte":
        case "addr":
            var valueToPush = simEnv.ctxStack.at(-(offset + 1));
            if (valueToPush === undefined) {
                logError(token.loc, "'".concat(token.txt, "' value in the context stack at position ").concat(-(offset + 1), " is undefined"));
                exit();
            }
            simEnv.dataStack.push(valueToPush);
            return;
        case "string":
        case "word":
            var address = simEnv.ctxStack.at(-(offset + 1));
            if (address === undefined) {
                logError(token.loc, "'".concat(token.txt, "' ").concat(varType, " address in the context stack at position ").concat(-(offset + 1), " is undefined"));
                exit();
            }
            var lenght = simEnv.ctxStack.at(-(offset + 2));
            if (lenght === undefined) {
                logError(token.loc, "'".concat(token.txt, "' ").concat(varType, " lenght in the context stack at position ").concat(-(offset + 1), " is undefined"));
                exit();
            }
            simEnv.dataStack.push(lenght);
            simEnv.dataStack.push(address);
            return;
        case "record":
        case "void":
            logError(token.loc, "cannot get '".concat(token.txt, "' value of type ").concat(humanReadableType(varType)));
            exit();
        default:
            if (varType[0] === "array") {
                var address_2 = simEnv.ctxStack.at(-(offset + 1));
                if (address_2 === undefined) {
                    logError(token.loc, "'".concat(token.txt, "' ").concat(varType, " address in the context stack at position ").concat(-(offset + 1), " is undefined"));
                    exit();
                }
                var lenght_2 = simEnv.ctxStack.at(-(offset + 2));
                if (lenght_2 === undefined) {
                    logError(token.loc, "'".concat(token.txt, "' ").concat(varType, " lenght in the context stack at position ").concat(-(offset + 1), " is undefined"));
                    exit();
                }
                simEnv.dataStack.push(lenght_2);
                simEnv.dataStack.push(address_2);
            }
            else {
                var valueToPush_1 = simEnv.ctxStack.at(-(offset + 1));
                if (valueToPush_1 === undefined) {
                    logError(token.loc, "'".concat(token.txt, "' value in the context stack at position ").concat(-(offset + 1), " is undefined"));
                    exit();
                }
                simEnv.dataStack.push(valueToPush_1);
            }
            return;
    }
}
function simGetWordValue(simEnv, token, context) {
    var findVarName = /{(.+)}/gm.exec(token.txt);
    if (findVarName === null) {
        logError(token.loc, "'".concat(token.txt, "' cannot find the word name"));
        exit();
    }
    var varName = findVarName[1];
    var varDef = getWordDefinition(context, varName);
    if (varDef === undefined) {
        logError(token.loc, "".concat(varName, " is undefined in the context of '").concat(token.txt, "'"));
        exit();
    }
    var varType = varDef.internalType;
    var ret;
    if (varDef.isGlobalContext) {
        switch (varType) {
            case "number":
            case "bool":
            case "byte":
            case "addr":
                {
                    var addr = simEnv.vars[varName];
                    if (addr === undefined) {
                        logError(token.loc, "'".concat(token.txt, "' vars is undefined"));
                        exit();
                    }
                    ret = String(readNumberFromHeap(simEnv, addr));
                }
                break;
            case "string":
            case "word":
                {
                    var addr = simEnv.vars[varName];
                    if (addr === undefined) {
                        logError(token.loc, "'".concat(token.txt, "' vars is undefined"));
                        exit();
                    }
                    var length_1 = readNumberFromHeap(simEnv, addr + 8);
                    var address = readNumberFromHeap(simEnv, addr);
                    ret = readStringFromHeap(simEnv, address, length_1);
                }
                break;
            case "void":
            case "record":
                logError(token.loc, "cannot sim retrieve value for '".concat(token.txt, "' of '").concat(humanReadableType(varType), "' type"));
                exit();
            default:
                if (varType[0] === "array") {
                    if (varType[1] === "string" || varType[1] === "word") {
                        var addr = simEnv.vars[varName];
                        if (addr === undefined) {
                            logError(token.loc, "'".concat(token.txt, "' vars is undefined"));
                            exit();
                        }
                        var arrAddress = readNumberFromHeap(simEnv, addr);
                        var arrLen = readNumberFromHeap(simEnv, addr + 8);
                        var str = [];
                        for (var i = 0; i < arrLen; i++) {
                            var strAddr = readNumberFromHeap(simEnv, arrAddress + i * 16);
                            var strLen = readNumberFromHeap(simEnv, arrAddress + i * 16 + 8);
                            str.push(readStringFromHeap(simEnv, strAddr, strLen));
                        }
                        ret = str.join(" ");
                    }
                    else {
                        ret = "[ARRAY...]";
                    }
                }
                else {
                    var addr = simEnv.vars[varName];
                    if (addr === undefined) {
                        logError(token.loc, "'".concat(token.txt, "' vars is undefined"));
                        exit();
                    }
                    ret = String(readNumberFromHeap(simEnv, addr));
                }
                break;
        }
    }
    else {
        var offset = getWordOffset(context, varName, "sim");
        switch (varType) {
            case "number":
            case "bool":
            case "byte":
            case "addr":
                var valueToPush = simEnv.ctxStack.at(-(offset + 1));
                if (valueToPush === undefined) {
                    logError(token.loc, "'".concat(token.txt, "' value in the context stack at position ").concat(-(offset + 1), " is undefined"));
                    exit();
                }
                ret = String(valueToPush);
                break;
            case "string":
            case "word":
                var address = simEnv.ctxStack.at(-(offset + 1));
                if (address === undefined) {
                    logError(token.loc, "'".concat(token.txt, "' string address in the context stack at position ").concat(-(offset + 1), " is undefined"));
                    exit();
                }
                var lenght = simEnv.ctxStack.at(-(offset + 2));
                if (lenght === undefined) {
                    logError(token.loc, "'".concat(token.txt, "' string lenght in the context stack at position ").concat(-(offset + 1), " is undefined"));
                    exit();
                }
                ret = readStringFromHeap(simEnv, address, lenght);
                break;
            case "record":
            case "void":
                logError(token.loc, "cannot get '".concat(token.txt, "' value of type ").concat(humanReadableType(varType)));
                exit();
            default:
                if (varType[0] === "array") {
                    if (varType[1] === "word" || varType[1] === "string") {
                        var address_3 = simEnv.ctxStack.at(-(offset + 1));
                        if (address_3 === undefined) {
                            logError(token.loc, "'".concat(token.txt, "' array address in the context stack at position ").concat(-(offset + 1), " is undefined"));
                            exit();
                        }
                        var lenght_3 = simEnv.ctxStack.at(-(offset + 2));
                        if (lenght_3 === undefined) {
                            logError(token.loc, "'".concat(token.txt, "' array lenght in the context stack at position ").concat(-(offset + 1), " is undefined"));
                            exit();
                        }
                        var str = [];
                        for (var i = 0; i < lenght_3; i++) {
                            var strAddr = readNumberFromHeap(simEnv, address_3 + i * 16);
                            var strLen = readNumberFromHeap(simEnv, address_3 + i * 16 + 8);
                            str.push(readStringFromHeap(simEnv, strAddr, strLen));
                        }
                        ret = str.join(" ");
                    }
                    else {
                        ret = "[ARRAY...]";
                    }
                }
                else {
                    var valueToPush_2 = simEnv.ctxStack.at(-(offset + 1));
                    if (valueToPush_2 === undefined) {
                        logError(token.loc, "'".concat(token.txt, "' value in the context stack at position ").concat(-(offset + 1), " is undefined"));
                        exit();
                    }
                    ret = String(valueToPush_2);
                }
                break;
        }
    }
    if (token.type === TokenType.LIT_WORD) {
        ret = "'" + ret;
    }
    else if (token.type === TokenType.SET_WORD) {
        ret = ret + ":";
    }
    else if (token.type === TokenType.LITERAL) {
        if (token.internalValueType === "word") {
            ret = "'" + ret + "'";
        }
        else if (token.internalValueType === "string") {
            ret = '"' + ret + '"';
        }
    }
    return ret;
}
function getReturnTypeOfAWord(token) {
    if (token.out === undefined) {
        logError(token.loc, "the type of word '".concat(token.txt, "' is undefined"));
        exit();
    }
    if (token.type === TokenType.REF_BLOCK)
        return "addr";
    if (token.type === TokenType.RECORD)
        return "record";
    if (token.type === TokenType.WORD_BLOCK)
        return ["array", "word"];
    return token.out;
}
function assertChildNumber(token, spec) {
    if (typeof spec === "number") {
        if (token.childs.length !== spec) {
            logError(token.loc, "'".concat(token.txt, "' is supposed to have ").concat(spec, " parameters, got ").concat(token.childs.length));
            dumpAst(token);
            exit();
        }
    }
    else {
        if (token.childs.length !== spec.length) {
            logError(token.loc, "'".concat(token.txt, "' is supposed to have ").concat(spec.length, " parameters, got ").concat(token.childs.length));
            dumpAst(token);
            exit();
        }
        for (var i = 0; i < spec.length; i++) {
            if (spec[i] !== "any" && getReturnTypeOfAWord(token.childs[i]) !== spec[i]) {
                var strParams = spec.map(function (t) { return t === "any" ? "Any Type" : humanReadableType(t); }).join(", ");
                var typeExpected = spec[i];
                var strParamType = humanReadableType(getReturnTypeOfAWord(token.childs[i]));
                var strExpectedParamType = typeExpected === "any" ? "Any Type" : humanReadableType(typeExpected);
                logError(token.childs[i].loc, "'".concat(token.txt, "' expects ").concat(strParams, " as parameters, but ").concat(token.childs[i].txt, " is a ").concat(strParamType, " (should be ").concat(strExpectedParamType, ")"));
                dumpAst(token);
                exit();
            }
        }
    }
}
function getAsmPrintTopOfStack(type, newLine, target) {
    if (target === "c64") {
        var newLineAsm = newLine ? ["LDA #13", "JSR EMIT"] : [];
        switch (type) {
            case "number":
                return __spreadArray([
                    "JSR POP16",
                    "JSR PRINT_INT"
                ], newLineAsm, true);
            case "string":
            case "word":
                return __spreadArray([
                    "JSR PRINT_STRING"
                ], newLineAsm, true);
            case "byte":
                return __spreadArray([
                    "JSR POP16",
                    "LDA #0",
                    "STA STACKACCESS + 1",
                    "JSR PRINT_INT"
                ], newLineAsm, true);
            case "bool":
                return __spreadArray([
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
                    "JSR EMIT"
                ], newLineAsm, true);
            case "addr":
                return __spreadArray([
                    "; print addr ?",
                    "JSR POP16",
                    "JSR PRINT_INT"
                ], newLineAsm, true);
            case "void":
            case "record":
                console.log("printing '".concat(humanReadableType(type), "' is not implemented"));
                exit();
            default:
                return __spreadArray([
                    "JSR POP16",
                    "LDA #91",
                    "JSR EMIT",
                    "LDA #46",
                    "JSR EMIT",
                    "LDA #46",
                    "JSR EMIT",
                    "LDA #46",
                    "JSR EMIT",
                    "LDA #93",
                    "JSR EMIT"
                ], newLineAsm, true);
        }
    }
    if (target === "freebsd") {
        var newLineAsm = newLine ? ["call print_lf"] : [];
        switch (type) {
            case "number":
            case "byte":
            case "addr":
                return __spreadArray([
                    "pop rax",
                    "call print_uint"
                ], newLineAsm, true);
            case "string":
            case "word":
                return __spreadArray([
                    "pop rax",
                    "mov rsi, rax",
                    "pop rax",
                    "mov rdx, rax",
                    "mov rax, 4",
                    "mov rdi, 1",
                    "syscall"
                ], newLineAsm, true);
            case "bool":
                return __spreadArray([
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
                    "pop rax"
                ], newLineAsm, true);
            case "void":
            case "record":
                console.log("printing '".concat(humanReadableType(type), "' is not implemented"));
                exit();
            default:
                return __spreadArray([
                    "pop rax",
                    "mov rsi, str__cantprint",
                    "mov rdx, 5",
                    "mov rax, 4",
                    "mov rdi, 1",
                    "syscall"
                ], newLineAsm, true);
        }
    }
    console.log("target system '".concat(target, "' unknown"));
    exit();
}
function simPrintTopOfStack(simEnv, type, newLine) {
    var toPrint = "";
    switch (type) {
        case "number":
        case "byte":
        case "addr":
            toPrint = String(stackPop(simEnv));
            break;
        case "string":
        case "word":
            var addr = stackPop(simEnv);
            var len = stackPop(simEnv);
            toPrint = readStringFromHeap(simEnv, addr, len);
            break;
        case "bool":
            toPrint = stackPop(simEnv) === 0 ? "N" : "Y";
            break;
        case "void":
        case "record":
            console.log("printing '".concat(humanReadableType(type), "' is not implemented"));
            exit();
        default:
            toPrint = "[...]";
            break;
    }
    for (var i = 0; i < toPrint.length; i++) {
        emit(simEnv, toPrint.charCodeAt(i));
    }
    if (newLine)
        emit(simEnv, 10);
}
function simPrintStruct(simEnv, token, structName, newline) {
    var structDef = getWordDefinition(token.context, structName);
    if (structDef === undefined) {
        logError(token.childs[0].loc, "Cannot find definition for '".concat(structName, "'"));
        exit();
    }
    if (structDef.type !== "struct") {
        logError(token.childs[0].loc, "'".concat(structName, "' is not a struct"));
        exit();
    }
    // print struct
    var structAddress = stackPop(simEnv);
    for (var i = 0; i < structDef.elements.length; i++) {
        var element = structDef.elements[i];
        if (i > 0) {
            var previousElement = structDef.elements[i - 1];
            var prevSize = sizeForValueType(previousElement.type, "sim");
            structAddress += prevSize * 8;
        }
        simEnv.dataStack.push(structAddress);
        simGetWordPointedByTOS(simEnv, element.def.internalType, 0);
        simPrintTopOfStack(simEnv, element.def.internalType, newline);
        if (!newline)
            emit(simEnv, 32);
    }
}
function getAsmAddressOfWord(context, varDef, varName, target) {
    if (varDef.isGlobalContext) {
        var asmVarName = getAsmVarName(varName);
        if (target === "c64") {
            if (varDef.internalType === "addr" || varDef.internalType === "bool" || varDef.internalType === "byte" || varDef.internalType === "number") {
                return [
                    "LDA #<".concat(asmVarName),
                    "STA STACKACCESS",
                    "LDA #>".concat(asmVarName),
                    "STA STACKACCESS+1",
                    "JSR PUSH16",
                ];
            }
            else {
                return [
                    "LDA ".concat(asmVarName),
                    "STA STACKACCESS",
                    "LDA ".concat(asmVarName, "+1"),
                    "STA STACKACCESS+1",
                    "JSR PUSH16",
                ];
            }
        }
        if (target === "freebsd") {
            return [
                "mov rax, ".concat(asmVarName),
                "push rax",
            ];
        }
        console.log("target system '".concat(target, "' unknown"));
        exit();
    }
    else {
        var offset = getWordOffset(context, varName, target);
        if (target === "c64") {
            var contextPage = CTX_PAGE * 256;
            var finalAddress = contextPage + offset;
            if (varDef.internalType === "addr" || varDef.internalType === "bool" || varDef.internalType === "byte" || varDef.internalType === "number") {
                return [
                    "CLC",
                    "LDA CTX_SP16",
                    "ADC #<".concat(finalAddress),
                    "STA STACKACCESS",
                    "LDA #0",
                    "ADC #>".concat(finalAddress),
                    "STA STACKACCESS+1",
                    "JSR PUSH16",
                ];
            }
            else {
                return [
                    "CLC",
                    "LDX CTX_SP16",
                    "LDA ".concat(finalAddress + 0, ",X"),
                    "STA STACKACCESS",
                    "LDA ".concat(finalAddress + 1, ",X"),
                    "STA STACKACCESS + 1",
                    "JSR PUSH16",
                ];
            }
        }
        if (target === "freebsd") {
            return [
                "mov rax, [ctx_stack_rsp]",
                "add rax, ".concat(offset),
                "push rax",
            ];
        }
        console.log("target system '".concat(target, "' unknown"));
        exit();
    }
}
function getAsmValueOfWord(context, varDef, varName, target) {
    if (varDef.isGlobalContext) {
        var asmVarName = getAsmVarName(varName);
        if (target === "c64") {
            if (varDef.internalType === "addr" || varDef.internalType === "bool" || varDef.internalType === "byte" || varDef.internalType === "number") {
                return [
                    "LDA ".concat(asmVarName),
                    "STA STACKACCESS",
                    "LDA ".concat(asmVarName, "+1"),
                    "STA STACKACCESS+1",
                    "JSR PUSH16",
                ];
            }
            else {
                return [
                    "LDA ".concat(asmVarName),
                    "STA STACKACCESS",
                    "LDA ".concat(asmVarName, "+1"),
                    "STA STACKACCESS+1",
                    "JSR PUSH16",
                ];
            }
        }
        if (target === "freebsd") {
            return [
                "mov rax, [".concat(asmVarName, "]"),
                "push rax",
            ];
        }
        console.log("target system '".concat(target, "' unknown"));
        exit();
    }
    else {
        var offset = getWordOffset(context, varName, target);
        if (target === "c64") {
            var contextPage = CTX_PAGE * 256;
            var finalAddress = contextPage + offset;
            return [
                "LDX CTX_SP16",
                "LDA ".concat(finalAddress + 0, ",X"),
                "STA STACKACCESS",
                "LDA ".concat(finalAddress + 1, ",X"),
                "STA STACKACCESS + 1",
                "JSR PUSH16",
            ];
        }
        if (target === "freebsd") {
            return [
                "mov rax, [ctx_stack_rsp]",
                "add rax, ".concat(offset),
                "push rax",
            ];
        }
        console.log("target system '".concat(target, "' unknown"));
        exit();
    }
}
function getSourceRapresentationOfAToken(token) {
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
            var opening = token.type === TokenType.REF_BLOCK ? ":[" : token.type === TokenType.WORD_BLOCK ? "'[" : "[";
            return opening + token.childs.map(getSourceRapresentationOfAToken).join(" ") + "]";
        }
        default: return token.txt;
    }
}
function createVocabulary() {
    console.assert(TokenType.TOKEN_COUNT === 64, "Exaustive token types count");
    var voc = {};
    voc[TokenType.PRINT] = {
        txt: "print",
        expectedArity: 1,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: function (token) {
            var valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType === undefined) {
                logError(token.loc, "cannot determine the type of '".concat(token.txt, "'"));
                exit();
            }
            return [valueType];
        },
        out: function () { return "void"; },
        sim: function (simEnv, token) {
            var valueType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof valueType === "string") {
                simPrintTopOfStack(simEnv, valueType, true);
                return;
            }
            if (valueType[0] === "array") {
                logError(token.loc, "'".concat(token.txt, "' is an array, can't print array yet"));
                exit();
            }
            if (valueType[0] === "addr") {
                logError(token.loc, "'".concat(token.txt, "' is an address, can't print address yet"));
                exit();
            }
            var structName = valueType[1];
            simPrintStruct(simEnv, token, structName, true);
        },
        generateAsm: function (token, target) {
            var valueType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof valueType === "string")
                return getAsmPrintTopOfStack(valueType, true, target);
            if (valueType[0] === "array") {
                logError(token.loc, "'".concat(token.txt, "' is an array, can't print array yet"));
                exit();
            }
            if (valueType[0] === "addr") {
                logError(token.loc, "'".concat(token.txt, "' is an address, can't print address yet"));
                exit();
            }
            var structName = valueType[1];
            var structDef = getWordDefinition(token.context, structName);
            if (structDef === undefined) {
                logError(token.childs[0].loc, "Cannot find definition for '".concat(structName, "'"));
                exit();
            }
            if (structDef.type !== "struct") {
                logError(token.childs[0].loc, "'".concat(structName, "' is not a struct"));
                exit();
            }
            // print struct
            if (target === "c64") {
                var ret = [
                    "LDX SP16",
                    "LDA STACKBASE + 1,X",
                    "STA STACKACCESS",
                    "LDA STACKBASE + 2,X",
                    "STA STACKACCESS + 1",
                ];
                for (var i = 0; i < structDef.elements.length; i++) {
                    var element = structDef.elements[i];
                    if (i > 0) {
                        var previousElement = structDef.elements[i - 1];
                        var prevSize = sizeForValueType(previousElement.type, target);
                        ret = ret.concat([
                            "JSR POP16",
                            // in stackaccess the pointer to the field in the record
                            "CLC",
                            "LDA STACKACCESS",
                            "ADC #".concat(prevSize),
                            "STA STACKACCESS",
                            "LDA STACKACCESS+1",
                            "ADC #0",
                            "STA STACKACCESS+1",
                            "JSR PUSH16",
                        ]);
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
                var ret = ["mov rax, [rsp]"];
                for (var i = 0; i < structDef.elements.length; i++) {
                    var element = structDef.elements[i];
                    if (i > 0) {
                        var previousElement = structDef.elements[i - 1];
                        var prevSize = sizeForValueType(previousElement.type, target);
                        ret = ret.concat([
                            // in stackaccess the pointer to the field in the record
                            "pop rax",
                            "add rax, ".concat(prevSize, " ; adding ").concat(previousElement.name, " size"),
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
            console.log("target system '".concat(target, "' unknown"));
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
        ins: function (token) {
            var valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType === undefined) {
                logError(token.loc, "cannot determine the type of '".concat(token.txt, "'"));
                exit();
            }
            return [valueType];
        },
        out: function () { return "void"; },
        sim: function (simEnv, token) {
            var valueType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof valueType === "string") {
                simPrintTopOfStack(simEnv, valueType, false);
                return;
            }
            if (valueType[0] === "array") {
                logError(token.loc, "'".concat(token.txt, "' is an array, can't print array yet"));
                exit();
            }
            if (valueType[0] === "addr") {
                logError(token.loc, "'".concat(token.txt, "' is an address, can't print address yet"));
                exit();
            }
            var structName = valueType[1];
            simPrintStruct(simEnv, token, structName, false);
        },
        generateAsm: function (token, target) {
            var valueType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof valueType === "string")
                return getAsmPrintTopOfStack(valueType, false, target);
            if (valueType[0] === "array") {
                logError(token.loc, "'".concat(token.txt, "' is an array, can't prin array yet"));
                exit();
            }
            if (valueType[0] === "addr") {
                logError(token.loc, "'".concat(token.txt, "' is an addr, can't prin addr yet"));
                exit();
            }
            var structName = valueType[1];
            var structDef = getWordDefinition(token.context, structName);
            if (structDef === undefined) {
                logError(token.loc, "Cannot find definition for '".concat(token.txt, "'"));
                exit();
            }
            if (structDef.type !== "struct") {
                logError(token.loc, "'".concat(token.txt, "' is not a struct"));
                exit();
            }
            if (target === "c64") {
                var ret = [
                    "LDX SP16",
                    "LDA STACKBASE + 1,X",
                    "STA STACKACCESS",
                    "LDA STACKBASE + 2,X",
                    "STA STACKACCESS + 1",
                ];
                for (var i = 0; i < structDef.elements.length; i++) {
                    var element = structDef.elements[i];
                    if (i > 0) {
                        var previousElement = structDef.elements[i - 1];
                        var prevSize = sizeForValueType(previousElement.type, target);
                        ret = ret.concat([
                            "LDA #32",
                            "JSR EMIT",
                            "JSR POP16",
                            // in stackaccess the pointer to the field in the record
                            "CLC",
                            "LDA STACKACCESS",
                            "ADC #".concat(prevSize),
                            "STA STACKACCESS",
                            "LDA STACKACCESS+1",
                            "ADC #0",
                            "STA STACKACCESS+1",
                            "JSR PUSH16",
                        ]);
                    }
                    ret = ret.concat(["JSR PUSH16"]);
                    ret = ret.concat(getAsmForGetWordPointedByTOS(element.def.internalType, 0, target));
                    ret = ret.concat(getAsmPrintTopOfStack(element.def.internalType, false, target));
                }
                ret = ret.concat("JSR POP16");
                return ret;
            }
            if (target === "freebsd") {
                var ret = ["pop rax", "push rax"];
                for (var i = 0; i < structDef.elements.length; i++) {
                    var element = structDef.elements[i];
                    if (i > 0) {
                        var previousElement = structDef.elements[i - 1];
                        var prevSize = sizeForValueType(previousElement.type, target);
                        ret = ret.concat([
                            // in stackaccess the pointer to the field in the record
                            "mov rcx, 32",
                            "call emit",
                            "pop rax",
                            "add rax, ".concat(prevSize),
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
            console.log("target system '".concat(target, "' unknown"));
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
        ins: function () { return ["byte"]; },
        out: function () { return "void"; },
        generateAsm: function (token, target) {
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
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        sim: function (simEnv, token) {
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
        ins: function (token) { return []; },
        out: function () { return "void"; },
        sim: function (simEnv, token) {
            emit(simEnv, 10);
        },
        generateAsm: function (token, target) {
            if (target === "c64") {
                return [
                    "LDA #13",
                    "JSR EMIT",
                ];
            }
            if (target === "freebsd") {
                return [
                    "call print_lf",
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        }
    };
    voc[TokenType.PLUS] = {
        txt: "+",
        expectedArity: 2,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.INFIX,
        priority: 80,
        userFunction: false,
        ins: function (token) {
            console.assert(token.childs.length === 2, "The childs of a plus operand should be 2, compiler error");
            var type1 = getReturnTypeOfAWord(token.childs[0]);
            var type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === "byte" || type1 === "number") && (type2 === "byte" || type2 === "number")) {
                return [type1, type2];
            }
            return ["number", "number"];
        },
        out: function (token) {
            console.assert(token.childs.length === 2, "The childs of a plus operand should be 2, compiler error");
            var type1 = getReturnTypeOfAWord(token.childs[0]);
            var type2 = getReturnTypeOfAWord(token.childs[1]);
            if (type1 === "byte" && type2 === "byte")
                return "byte";
            return "number";
        },
        generateChildPreludeAsm: function (token, n, target) {
            if (target === "c64") {
                if (n === 0 && token.childs[0].type === TokenType.LITERAL) {
                    return undefined;
                }
                return [];
            }
            if (target === "freebsd") {
                return [];
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        sim: function (simEnv, token) {
            simEnv.dataStack.push(stackPop(simEnv) + stackPop(simEnv));
        },
        generateAsm: function (token, target) {
            console.assert(token.childs.length === 2, "The childs of a plus operand should be 2, compiler error");
            var type1 = getReturnTypeOfAWord(token.childs[0]);
            var type2 = getReturnTypeOfAWord(token.childs[1]);
            if (target === "c64") {
                if (token.childs[0].type === TokenType.LITERAL) {
                    var childValue = getNumberFromLiteral(token.childs[0].txt);
                    if (type1 === "byte" && type2 === "byte") {
                        return [
                            "; add byte with ".concat(childValue),
                            "LDX SP16",
                            "CLC",
                            "LDA STACKBASE + 1,X",
                            "ADC #<".concat(childValue),
                            "STA STACKBASE + 1,X",
                            "LDA #0",
                            "STA STACKBASE + 2,X",
                        ];
                    }
                    return [
                        "; add number with ".concat(childValue),
                        "LDX SP16",
                        "CLC",
                        "LDA STACKBASE + 1,X",
                        "ADC #<".concat(childValue),
                        "STA STACKBASE + 1,X",
                        "LDA STACKBASE + 2,X",
                        "ADC #>".concat(childValue),
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
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
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
        ins: function (token) {
            console.assert(token.childs.length === 2, "The childs of a minus operand should be 2, compiler error");
            var type1 = getReturnTypeOfAWord(token.childs[0]);
            var type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === "byte" || type1 === "number") && (type2 === "byte" || type2 === "number")) {
                return [type1, type2];
            }
            return ["number", "number"];
        },
        out: function () { return "number"; },
        sim: function (simEnv, token) {
            simEnv.dataStack.push(-stackPop(simEnv) + stackPop(simEnv));
        },
        generateAsm: function (token, target) {
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
            console.log("target system '".concat(target, "' unknown"));
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
        ins: function (token) {
            console.assert(token.childs.length === 2, "The childs of a multiply operand should be 2, compiler error");
            var type1 = getReturnTypeOfAWord(token.childs[0]);
            var type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === "byte" || type1 === "number") && (type2 === "byte" || type2 === "number")) {
                return [type1, type2];
            }
            return ["number", "number"];
        },
        out: function () { return "number"; },
        sim: function (simEnv, token) {
            simEnv.dataStack.push(stackPop(simEnv) * stackPop(simEnv));
        },
        generateAsm: function (token, target) {
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
            console.log("target system '".concat(target, "' unknown"));
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
        ins: function (token) {
            assertChildNumber(token, 2);
            var type1 = getReturnTypeOfAWord(token.childs[0]);
            var type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === "byte" || type1 === "number") && (type2 === "byte" || type2 === "number")) {
                return [type1, type2];
            }
            return ["number", "number"];
        },
        out: function () { return "number"; },
        sim: function (simEnv, token) {
            simEnv.dataStack.push(Math.floor(1 / stackPop(simEnv) * stackPop(simEnv)));
        },
        generateAsm: function (token, target) {
            if (target === "c64") {
                assertChildNumber(token, 2);
                var divisor = token.childs[1];
                if (divisor.type === TokenType.LITERAL) {
                    var divisorValue = divisor.txt;
                    var powersOfTwo = {
                        "1": 0,
                        "2": 1,
                        "4": 2,
                        "8": 3,
                        "16": 4,
                        "32": 5,
                        "64": 6,
                        "128": 7,
                        "256": 8
                    };
                    if (divisorValue in powersOfTwo) {
                        var shiftValue = powersOfTwo[divisorValue];
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
                            ];
                        }
                        return [
                            "LDX SP16",
                            "INX",
                            "INX",
                            "STX SP16",
                            "LDY #".concat(shiftValue),
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
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
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
        ins: function (token) {
            console.assert(token.childs.length === 2, "The childs of a plus operand should be 2, compiler error");
            var type1 = getReturnTypeOfAWord(token.childs[0]);
            var type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === "byte" || type1 === "number") && (type2 === "byte" || type2 === "number")) {
                return [type1, type2];
            }
            return ["number", "number"];
        },
        out: function () { return "number"; },
        sim: function (simEnv, token) {
            var divisor = stackPop(simEnv);
            var dividend = stackPop(simEnv);
            simEnv.dataStack.push(dividend % divisor);
        },
        generateAsm: function (token, target) {
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
            console.log("target system '".concat(target, "' unknown"));
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
        ins: function (token) {
            console.assert(token.childs.length === 1, "The childs of a not operand should be 1, compiler error");
            var valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType === "byte" || valueType === "number" || valueType === "bool")
                return [valueType];
            return ["number"];
        },
        out: function (token) {
            console.assert(token.childs.length === 1, "The childs of a not operand should be 1, compiler error");
            var valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType === "byte" || valueType === "number" || valueType === "bool")
                return valueType;
            return "number";
        },
        sim: function (simEnv, token) {
            simEnv.dataStack.push((stackPop(simEnv) ^ parseInt("FFFFFFFFFFFFF", 16)) + 2);
        },
        generateAsm: function (token, target) {
            var valueType = getReturnTypeOfAWord(token.childs[0]);
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
                    ];
                }
                else if (valueType === "byte") {
                    return [
                        "LDX SP16",
                        "LDA STACKBASE + 1,X",
                        "EOR #$FF",
                        "STA STACKBASE + 1,X",
                        "INC STACKBASE + 1,X",
                        "INC STACKBASE + 1,X"
                    ];
                }
                else if (valueType === "bool") {
                    return [
                        "LDX SP16",
                        "LDA STACKBASE + 1,X",
                        "EOR #$FF",
                        "STA STACKBASE + 1,X",
                        "INC STACKBASE + 1,X",
                        "INC STACKBASE + 1,X"
                    ];
                }
                else {
                    logError(token.loc, "'not' operator for value ".concat(humanReadableType(valueType), " is not implemented"));
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
                    ];
                }
                else {
                    logError(token.loc, "'not' operator is not implemented for ".concat(humanReadableType(valueType)));
                    exit();
                }
            }
            console.log("target system '".concat(target, "' unknown"));
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
        ins: function (token) {
            assertChildNumber(token, 2);
            var type1 = getReturnTypeOfAWord(token.childs[0]);
            var type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === "byte" || type1 === "number") && (type2 === "byte" || type2 === "number")) {
                return [type1, type2];
            }
            return ["number", "number"];
        },
        out: function () { return "bool"; },
        sim: function (simEnv, token) {
            var b = stackPop(simEnv);
            var a = stackPop(simEnv);
            simEnv.dataStack.push(a < b ? 1 : 0);
        },
        generateAsm: function (token, target) {
            var type1 = getReturnTypeOfAWord(token.childs[0]);
            var type2 = getReturnTypeOfAWord(token.childs[1]);
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
                    ];
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
            console.log("target system '".concat(target, "' unknown"));
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
        ins: function (token) {
            assertChildNumber(token, 2);
            var type1 = getReturnTypeOfAWord(token.childs[0]);
            var type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === "byte" || type1 === "number") && (type2 === "byte" || type2 === "number")) {
                return [type1, type2];
            }
            return ["number", "number"];
        },
        out: function () { return "bool"; },
        sim: function (simEnv, token) {
            var b = stackPop(simEnv);
            var a = stackPop(simEnv);
            simEnv.dataStack.push(a <= b ? 1 : 0);
        },
        generateAsm: function (token, target) {
            var type1 = getReturnTypeOfAWord(token.childs[0]);
            var type2 = getReturnTypeOfAWord(token.childs[1]);
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
                    ];
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
            console.log("target system '".concat(target, "' unknown"));
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
        ins: function (token) {
            assertChildNumber(token, 2);
            var type1 = getReturnTypeOfAWord(token.childs[0]);
            var type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === "byte" || type1 === "number") && (type2 === "byte" || type2 === "number")) {
                return [type1, type2];
            }
            return ["number", "number"];
        },
        out: function () { return "bool"; },
        generateChildPreludeAsm: function (token, n, target) {
            if (target === "c64") {
                if (n === 0 && token.childs[0].type === TokenType.LITERAL)
                    return undefined;
                return [];
            }
            if (target === "freebsd") {
                return [];
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        sim: function (simEnv, token) {
            simEnv.dataStack.push(stackPop(simEnv) === stackPop(simEnv) ? 1 : 0);
        },
        generateAsm: function (token, target) {
            var type1 = getReturnTypeOfAWord(token.childs[0]);
            var isChild1Literal = token.childs[0].type === TokenType.LITERAL;
            var type2 = getReturnTypeOfAWord(token.childs[1]);
            if (target === "c64") {
                if (isChild1Literal) {
                    // only the second child on the stack
                    var child1Value = getNumberFromLiteral(token.childs[0].txt);
                    if (type1 === "byte" && type2 === "byte") {
                        return [
                            "LDX SP16",
                            "LDA STACKBASE + 1,X",
                            "CMP #<".concat(child1Value),
                            "BNE notequal@",
                            "LDA #01",
                            "JMP store@",
                            "notequal@:",
                            "LDA #00",
                            "store@:",
                            "STA STACKBASE + 1,X",
                            "LDA #00",
                            "STA STACKBASE + 2,X",
                        ];
                    }
                    else {
                        return [
                            "LDX SP16",
                            "LDA STACKBASE + 1,X",
                            "CMP #<".concat(child1Value),
                            "BNE notequal@",
                            "LDA STACKBASE + 2,X",
                            "CMP #>".concat(child1Value),
                            "BNE notequal@",
                            "LDA #01",
                            "JMP store@",
                            "notequal@:",
                            "LDA #00",
                            "store@:",
                            "STA STACKBASE + 1,X",
                            "LDA #00",
                            "STA STACKBASE + 2,X",
                        ];
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
                    ];
                }
                else {
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
                    ];
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
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
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
        ins: function (token) {
            console.assert(token.childs.length === 2, "The childs of a greater-than operand should be 2, compiler error");
            var type1 = getReturnTypeOfAWord(token.childs[0]);
            var type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === "byte" || type1 === "number") && (type2 === "byte" || type2 === "number")) {
                return [type1, type2];
            }
            return ["number", "number"];
        },
        out: function () { return "bool"; },
        sim: function (simEnv, token) {
            var b = stackPop(simEnv);
            var a = stackPop(simEnv);
            simEnv.dataStack.push(a > b ? 1 : 0);
        },
        generateAsm: function (token, target) {
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
                ];
            }
            ;
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
            console.log("target system '".concat(target, "' unknown"));
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
        ins: function (token) {
            console.assert(token.childs.length === 2, "The childs of a greater-than operand should be 2, compiler error");
            var type1 = getReturnTypeOfAWord(token.childs[0]);
            var type2 = getReturnTypeOfAWord(token.childs[1]);
            if ((type1 === "byte" || type1 === "number") && (type2 === "byte" || type2 === "number")) {
                return [type1, type2];
            }
            return ["number", "number"];
        },
        out: function () { return "bool"; },
        sim: function (simEnv, token) {
            var b = stackPop(simEnv);
            var a = stackPop(simEnv);
            simEnv.dataStack.push(a >= b ? 1 : 0);
        },
        generateAsm: function (token, target) {
            var type1 = getReturnTypeOfAWord(token.childs[0]);
            var type2 = getReturnTypeOfAWord(token.childs[1]);
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
                    ];
                }
                return [
                    "LDX SP16",
                    "LDA STACKBASE + 4,X",
                    "CMP STACKBASE + 2,X",
                    "BCC less@",
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
                ];
            }
            ;
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
            console.log("target system '".concat(target, "' unknown"));
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
        ins: function (token) {
            assertChildNumber(token, ["bool", "bool"]);
            return ["bool", "bool"];
        },
        out: function () { return "bool"; },
        generateAsm: function (token, target) {
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
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        sim: function (simEnv, token) {
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
        ins: function (token) {
            assertChildNumber(token, ["bool", "bool"]);
            return ["bool", "bool"];
        },
        out: function () { return "bool"; },
        generateAsm: function (token, target) {
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
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        sim: function (simEnv, token) {
            simEnv.dataStack.push(stackPop(simEnv) || stackPop(simEnv));
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
        ins: function () { return ["bool", "void"]; },
        out: function () { return "void"; },
        simPreludeChild: function (simEnv, ast, childIndex) {
            if (childIndex === 1) {
                // the second child (the true branch) is executed only
                // if the stack contains "1" the true value
                return stackPop(simEnv) === 1;
            }
            return true;
        },
        sim: function (simEnv, token) { },
        generateChildPreludeAsm: function (ast, n, target) {
            if (target === "c64") {
                // prelude for the true branch
                if (n === 1)
                    return [
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
                if (n === 1)
                    return [
                        "pop rax",
                        "cmp rax, 0",
                        "jne trueblock@",
                        "jmp endblock@",
                        "trueblock@:",
                    ];
                return [];
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        generateAsm: function (token) { return [
            "endblock@:"
        ]; }
    };
    voc[TokenType.EITHER] = {
        txt: "either",
        expectedArity: 3,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: function (token) {
            console.assert(token.childs.length === 3, "'Either' should have 3 childs");
            var typeThen = getReturnTypeOfAWord(token.childs[1]);
            var typeElse = getReturnTypeOfAWord(token.childs[2]);
            if (typeThen === undefined) {
                logError(token.childs[1].loc, "cannot determine the type of '".concat(token.childs[1].txt, "'"));
                exit();
            }
            if (typeElse === undefined) {
                logError(token.childs[2].loc, "cannot determine the type of '".concat(token.childs[2].txt, "'"));
                exit();
            }
            if (!areTypesEqual(typeThen, typeElse)) {
                logError(token.childs[1].loc, "the then branch returns '".concat(humanReadableType(typeThen), "'"));
                logError(token.childs[2].loc, "while the 'else' branch returns '".concat(humanReadableType(typeElse), "'"));
                exit();
            }
            return ["bool", typeThen, typeElse];
        },
        out: function (token) {
            console.assert(token.childs.length === 3, "'Either' should have 3 childs");
            return getReturnTypeOfAWord(token.childs[1]);
        },
        simPreludeChild: function (simEnv, token, childIndex) {
            if (childIndex === 0)
                return true;
            if (childIndex === 1) {
                token.auxSimValue = stackPop(simEnv);
                return token.auxSimValue === 1;
            }
            if (childIndex === 2) {
                return token.auxSimValue === 0;
            }
            logError(token.loc, "'".concat(token.txt, "' does have more than 3 child"));
            exit();
        },
        sim: function (simEnv, token) { },
        generateChildPreludeAsm: function (ast, n, target) {
            if (target === "c64") {
                // no prelude for condition
                if (n === 0)
                    return [];
                // prelude for true branch
                if (n === 1)
                    return [
                        "JSR POP16",
                        "LDA STACKACCESS",
                        "BNE trueblock@",
                        // "LDA STACKACCESS + 1",
                        // "BNE trueblock@",
                        "JMP elseblock@ ; if all zero",
                        "trueblock@:"
                    ];
                // prelude for else branch
                return [
                    "JMP endblock@",
                    "elseblock@:"
                ];
            }
            if (target === "freebsd") {
                if (n === 0)
                    return [];
                // prelude for true branch
                if (n === 1)
                    return [
                        "pop rax",
                        "cmp rax, 0",
                        "jne trueblock@",
                        "jmp elseblock@",
                        "trueblock@:"
                    ];
                // prelude for else branch
                return [
                    "jmp endblock@",
                    "elseblock@:"
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        generateAsm: function (token) { return [
            "endblock@:",
        ]; }
    };
    voc[TokenType.OPEN_BRACKETS] = {
        txt: "[",
        expectedArity: 0,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 150,
        userFunction: false,
        ins: function () { return []; },
        out: function () { return "void"; },
        generateAsm: function (token) { return []; }
    };
    voc[TokenType.OPEN_REF_BRACKETS] = {
        txt: ":[",
        expectedArity: 0,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 150,
        userFunction: false,
        ins: function () { return []; },
        out: function () { return "void"; },
        generateAsm: function (token) { return []; }
    };
    voc[TokenType.OPEN_LIT_BRACKETS] = {
        txt: ":[",
        expectedArity: 0,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 150,
        userFunction: false,
        ins: function () { return []; },
        out: function () { return "void"; },
        generateAsm: function (token) { return []; }
    };
    voc[TokenType.CLOSE_BRACKETS] = {
        txt: "]",
        expectedArity: 0,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.POSTFIX,
        priority: 150,
        userFunction: false,
        ins: function () { return []; },
        out: function () { return "void"; },
        generateAsm: function (token) { return []; }
    };
    voc[TokenType.BLOCK] = {
        txt: "",
        expectedArity: 0,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 150,
        userFunction: false,
        ins: function () {
            // const childNumber = token.childs.length;
            // if (childNumber === 0) return [];
            // //return new Array(childNumber).fill("void");
            // return token.childs.map((child, index) => index === childNumber - 1 ? getReturnTypeOfAWord(child) : "void");
            console.log("should not be called ever!");
            exit();
        },
        out: getReturnValueByBlock,
        generateAsm: function (token, target) {
            if (token.context === undefined) {
                logError(token.loc, "can't find context for ".concat(token.txt, ", compiler error"));
                exit();
            }
            if (token.context.parent === undefined)
                return []; // the global context
            var sizeToRelease = sizeOfContext(token.context, target);
            if (sizeToRelease === 0)
                return ["; no stack memory to release"];
            if (target === "c64") {
                return [
                    "; release ".concat(sizeToRelease, " on the stack"),
                    "LDA CTX_SP16",
                    "CLC",
                    "ADC #".concat(sizeToRelease),
                    "STA CTX_SP16",
                ];
            }
            if (target === "freebsd") {
                return [
                    "; release ".concat(sizeToRelease, " on the stack"),
                    "mov rax, [ctx_stack_rsp]",
                    "add rax, ".concat(sizeToRelease),
                    "mov [ctx_stack_rsp], rax",
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        generatePreludeAsm: function (token, target) {
            // at the start we make some space on the stack, for variables
            if (token.context === undefined) {
                logError(token.loc, "can't find context for ".concat(token.txt, ", compiler error"));
                exit();
            }
            if (token.context.parent === undefined)
                return []; // the global context
            var sizeToReserve = 0;
            for (var _i = 0, _a = Object.entries(token.context.varsDefinition); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], varDef = _b[1];
                sizeToReserve += sizeForValueType(varDef.internalType, target);
            }
            var strVariables = Object.values(token.context.varsDefinition).map(function (varDef) { return varDef.token.txt + " (" + humanReadableType(varDef.out) + ")"; }).join(", ");
            if (sizeToReserve === 0)
                return ["; no stack memory to reserve"];
            if (target === "c64") {
                return [
                    "; reserve ".concat(sizeToReserve, " on the stack for: ").concat(strVariables),
                    "LDA CTX_SP16",
                    "SEC",
                    "SBC #".concat(sizeToReserve),
                    "STA CTX_SP16"
                ];
            }
            if (target === "freebsd") {
                return [
                    "mov rax, [ctx_stack_rsp]",
                    "sub rax, ".concat(sizeToReserve),
                    "mov [ctx_stack_rsp], rax",
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        simPrelude: function (simEnv, token) {
            // at the start we make some space on the stack, for variables
            if (token.context === undefined) {
                logError(token.loc, "can't find context for ".concat(token.txt, ", sim error"));
                exit();
            }
            if (token.context.parent === undefined) {
                logError(token.loc, "the context of ".concat(token.txt, " is global ? sim error"));
                exit();
            }
            var sizeToReserve = 0;
            for (var _i = 0, _a = Object.entries(token.context.varsDefinition); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], varDef = _b[1];
                var valueType = varDef.internalType;
                var sizeForType = sizeForValueType(valueType, "sim"); // valueType === "string" || (valueType instanceof Array && valueType[0] === "array") ? 2 : 1
                sizeToReserve += sizeForType;
                if (sizeForType === 1) {
                    simEnv.ctxStack.push(0);
                }
                else {
                    simEnv.ctxStack.push(0);
                    simEnv.ctxStack.push(0);
                }
            }
        },
        sim: function (simEnv, token) {
            if (token.context === undefined) {
                logError(token.loc, "can't find context for ".concat(token.txt, ", sim error"));
                exit();
            }
            if (token.context.parent === undefined) {
                logError(token.loc, "'".concat(token.txt, "' the context does not have a parent"));
                exit();
            }
            for (var _i = 0, _a = Object.entries(token.context.varsDefinition); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], varDef = _b[1];
                var valueType = varDef.internalType;
                var sizeForType = sizeForValueType(valueType, "sim"); // valueType === "string" || (valueType instanceof Array && valueType[0] === "array") ? 2 : 1
                if (sizeForType === 1) {
                    simEnv.ctxStack.pop();
                }
                else {
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
        ins: function () {
            console.log("should not be called ever!");
            exit();
        },
        //out: getReturnValueByBlock,
        //out: () => ["array", "word"],
        out: function () { return "addr"; },
        generatePreludeAsm: function (token, target) {
            // at the start we make some space on the stack, for variables
            if (token.context === undefined) {
                logError(token.loc, "can't find context for ".concat(token.txt, ", compiler error"));
                exit();
            }
            if (token.context.parent === undefined) {
                logError(token.loc, "the context of '".concat(token.txt, "' is the global context, compiler error"));
                exit();
            }
            var sizeToReserve = 0;
            for (var _i = 0, _a = Object.entries(token.context.varsDefinition); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], varDef = _b[1];
                sizeToReserve += sizeForValueType(varDef.internalType, target);
            }
            var strVariables = Object.values(token.context.varsDefinition).map(function (varDef) { return varDef.token.txt + " (" + humanReadableType(varDef.internalType) + ")"; }).join(", ");
            token.functionIndex = getFunctionIndex();
            var asmFunctionName = getFunctionName(token.functionIndex);
            var asmAfterFunctionName = getAfterFunctionName(token.functionIndex);
            if (target === "c64") {
                var asmReserveStackSpace = sizeToReserve === 0 ? ["; no stack memory to reserve"] : [
                    "; reserve ".concat(sizeToReserve, " on the stack for: ").concat(strVariables),
                    "LDA CTX_SP16",
                    "SEC",
                    "SBC #".concat(sizeToReserve),
                    "STA CTX_SP16"
                ];
                return [
                    "JMP ".concat(asmAfterFunctionName),
                    "".concat(asmFunctionName, ":"),
                ].concat(asmReserveStackSpace);
            }
            if (target === "freebsd") {
                return [
                    "jmp ".concat(asmAfterFunctionName),
                    "".concat(asmFunctionName, ":"),
                    "mov [ret_stack_rsp], rsp",
                    "mov rsp, rax", // data stack was in rax before the call
                ].concat((sizeToReserve > 0 ? [
                    "mov rbx, [ctx_stack_rsp]",
                    "sub rbx, ".concat(sizeToReserve),
                    "mov [ctx_stack_rsp], rbx",
                ] : []));
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        generateAsm: function (token, target) {
            if (token.context === undefined) {
                logError(token.loc, "can't find context for ".concat(token.txt, ", compiler error"));
                exit();
            }
            if (token.context.parent === undefined)
                return []; // the global context
            if (token.functionIndex === undefined) {
                logError(token.loc, "'".concat(token.txt, "' function index is not defined"));
                exit();
            }
            var sizeToRelease = sizeOfContext(token.context, target);
            var asmFunctionName = getFunctionName(token.functionIndex);
            var asmAfterFunctionName = getAfterFunctionName(token.functionIndex);
            if (target === "c64") {
                var asmReleaseSpace = sizeToRelease === 0 ? ["; no stack memory to release"] : [
                    "; release ".concat(sizeToRelease, " on the stack"),
                    "LDA CTX_SP16",
                    "CLC",
                    "ADC #".concat(sizeToRelease),
                    "STA CTX_SP16"
                ];
                return asmReleaseSpace.concat([
                    "RTS",
                    "".concat(asmAfterFunctionName, ":"),
                    "LDA #<".concat(asmFunctionName),
                    "STA STACKACCESS",
                    "LDA #>".concat(asmFunctionName),
                    "STA STACKACCESS + 1",
                    "JSR PUSH16",
                ]);
            }
            if (target === "freebsd") {
                return (sizeToRelease > 0 ? [
                    "mov rax, [ctx_stack_rsp]",
                    "add rax, ".concat(sizeToRelease),
                    "mov [ctx_stack_rsp], rax",
                ] : []).concat([
                    "mov rax, rsp",
                    "mov rsp, [ret_stack_rsp]",
                    "ret",
                    "".concat(asmAfterFunctionName, ":"),
                    "push ".concat(asmFunctionName)
                ]);
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        simPrelude: function (simEnv, token) {
            // if we are defining the function we don't need to execute anything
            if (token.functionIndex === undefined)
                return;
            // at the start we make some space on the stack, for variables
            if (token.context === undefined) {
                logError(token.loc, "can't find context for ".concat(token.txt, ", sim error"));
                exit();
            }
            if (token.context.parent === undefined) {
                logError(token.loc, "the context of ".concat(token.txt, " is global ? sim error"));
                exit();
            }
            var sizeToReserve = 0;
            for (var _i = 0, _a = Object.entries(token.context.varsDefinition); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], varDef = _b[1];
                var valueType = varDef.internalType;
                var sizeForType = sizeForValueType(valueType, "sim"); // valueType === "string" || valueType === "word" || (valueType instanceof Array && valueType[0] === "array") ? 2 : 1
                sizeToReserve += sizeForType;
                if (sizeForType === 1) {
                    simEnv.ctxStack.push(0);
                }
                else {
                    simEnv.ctxStack.push(0);
                    simEnv.ctxStack.push(0);
                }
            }
        },
        simPreludeChild: function (simEnv, token, childIndex) {
            // if we are defining the function we don't need to execute anything
            if (token.functionIndex === undefined)
                return false;
            return true;
        },
        sim: function (simEnv, token) {
            if (token.context === undefined) {
                logError(token.loc, "can't find context for ".concat(token.txt, ", sim error"));
                exit();
            }
            if (token.context.parent === undefined) {
                logError(token.loc, "'".concat(token.txt, "' the context does not have a parent"));
                exit();
            }
            if (token.functionIndex === undefined) {
                token.functionIndex = getFunctionIndex();
                simEnv.dataStack.push(token.functionIndex);
                simEnv.addresses[token.functionIndex] = token;
            }
            else {
                for (var _i = 0, _a = Object.entries(token.context.varsDefinition); _i < _a.length; _i++) {
                    var _b = _a[_i], key = _b[0], varDef = _b[1];
                    var valueType = varDef.internalType;
                    var sizeForType = sizeForValueType(valueType, "sim"); // valueType === "string" || (valueType instanceof Array && valueType[0] === "array") ? 2 : 1
                    if (sizeForType === 1) {
                        simEnv.ctxStack.pop();
                    }
                    else {
                        simEnv.ctxStack.pop();
                        simEnv.ctxStack.pop();
                    }
                }
                var retAddress = simEnv.retStack.pop();
                if (retAddress === undefined) {
                    logError(token.loc, "'".concat(token.txt, "' return stack is empty"));
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
        ins: function () { return []; },
        out: function () { return "addr"; },
        generatePreludeAsm: function (token, target) {
            if (token.context === undefined) {
                logError(token.loc, "can't find context for ".concat(token.txt, ", compiler error"));
                exit();
            }
            if (token.context.parent === undefined) {
                logError(token.loc, "the context of '".concat(token.txt, "' is the global context, compiler error"));
                exit();
            }
            var elementType;
            for (var i = 0; i < token.childs.length; i++) {
                var child = token.childs[i];
                var currentType = getReturnTypeOfAWord(child);
                if (elementType === undefined)
                    elementType = currentType;
                if (!areTypesEqual(elementType, currentType)) {
                    logError(child.loc, "'".concat(child.txt, "' should be ").concat(humanReadableType(elementType), " but it's a ").concat(humanReadableType(currentType)));
                    exit();
                }
            }
            return [];
        },
        // generateChildEpilogueAsm: (token, childIndex, target) => {
        //     const childType = getReturnTypeOfAWord(token.childs[childIndex]);
        //     const numberOfPops = childType === "string" || (childType instanceof Array && childType[0] === "array") ? 2 : 1;
        //     if (numberOfPops === 1) {
        //         if (target === "c64") {
        //             if (childType === "byte" || childType === "bool") {
        //                 return [
        //                     "JSR POP16",
        //                     "JSR PUSHHEAP8",
        //                 ];
        //             } else {
        //                 return [
        //                     "JSR POP16",
        //                     "JSR PUSHHEAP16",
        //                 ];
        //             }
        //         }
        //         if (target === "freebsd") {
        //             return [
        //                 "pop rax",
        //                 "mov byte [mem_top], al",
        //                 "inc qword [mem_top]",
        //             ]
        //         }
        //         console.log(`target system '${target}' unknown`);
        //         exit();
        //     } else {
        //         if (target === "c64") {
        //             return [
        //                 "JSR POP16",
        //                 "JSR PUSHHEAP16",
        //                 "JSR POP16",
        //                 "JSR PUSHHEAP16",
        //             ];
        //         }
        //         if (target === "freebsd") {
        //             return [
        //                 "pop rax",
        //                 "mov byte [mem_top], al",
        //                 "inc qword [mem_top]",
        //                 "pop rax",
        //                 "mov byte [mem_top], al",
        //                 "inc qword [mem_top]"
        //             ]
        //         }
        //         console.log(`target system '${target}' unknown`);
        //         exit();
        //     }
        // },
        simPrelude: function (simEnv, token) {
            if (token.context === undefined) {
                logError(token.loc, "can't find context for ".concat(token.txt, ", compiler error"));
                exit();
            }
            if (token.context.parent === undefined) {
                logError(token.loc, "the context of '".concat(token.txt, "' is the global context, compiler error"));
                exit();
            }
            var elementType;
            for (var i = 0; i < token.childs.length; i++) {
                var child = token.childs[i];
                var currentType = getReturnTypeOfAWord(child);
                if (elementType === undefined)
                    elementType = currentType;
                if (!areTypesEqual(elementType, currentType)) {
                    logError(child.loc, "'".concat(child.txt, "' should be ").concat(humanReadableType(elementType), " but it's a ").concat(humanReadableType(currentType)));
                    exit();
                }
            }
        },
        generateAsm: function (token, target) {
            if (token.childs.length === 0) {
                logError(token.loc, "'".concat(token.txt, "' should have at least one element, cannot determine the type"));
                exit();
            }
            var arrayType = getReturnTypeOfAWord(token.childs[0]);
            var arrayLen = token.childs.length;
            var sizeOfType = sizeForValueType(arrayType, target);
            var totalSize = arrayLen * sizeOfType;
            if (target === "c64") {
                return [
                    "LDA SP16",
                    "STA FROMADD+1",
                    "INC FROMADD+1",
                    "CLC",
                    "ADC #".concat(totalSize),
                    "STA SP16",
                    "LDA #00",
                    "STA FROMADD + 2",
                    "LDA HEAPTOP",
                    "STA TOADD + 1",
                    "STA AUX",
                    "LDA HEAPTOP + 1",
                    "STA TOADD + 2",
                    "STA AUX + 1",
                    "LDY #".concat(totalSize),
                    "JSR COPYMEM",
                    "LDA TOADD + 1",
                    "STA HEAPTOP",
                    "LDA TOADD + 2",
                    "STA HEAPTOP + 1",
                    "LDA #<".concat(arrayLen),
                    "STA STACKACCESS",
                    "LDA #>".concat(arrayLen),
                    "STA STACKACCESS + 1",
                    "JSR PUSH16",
                    "LDA AUX",
                    "STA STACKACCESS",
                    "LDA AUX + 1",
                    "STA STACKACCESS + 1",
                    "JSR PUSH16",
                ];
            }
            if (target === "freebsd") {
                return [
                    "mov rax, ".concat(totalSize),
                    "call allocate",
                    "mov rsi, rsp",
                    "mov rdi, rbx",
                    "mov rcx, ".concat(totalSize),
                    "rep movsb",
                    "add rsp, ".concat(totalSize),
                    "push ".concat(arrayLen),
                    "push rbx", // push the address
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        sim: function (simEnv, token) {
            if (token.childs.length === 0) {
                logError(token.loc, "'".concat(token.txt, "' should have at least one element, cannot determine the type"));
                exit();
            }
            var arrayType = getReturnTypeOfAWord(token.childs[0]);
            var arrayLen = token.childs.length;
            var sizeOfType = sizeForValueType(arrayType, "sim");
            var totalSize = arrayLen * sizeOfType;
            var startHeapAddress = simEnv.heapTop;
            for (var i = 0; i < totalSize; i++) {
                var value = stackPop(simEnv);
                storeNumberOnHeap(simEnv, value, undefined);
            }
            simEnv.dataStack.push(arrayLen);
            simEnv.dataStack.push(startHeapAddress);
        }
    };
    voc[TokenType.WORD_BLOCK] = {
        txt: "",
        expectedArity: 0,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: true,
        ins: function () { return []; },
        out: function () { return ["array", "word"]; },
        generatePreludeAsm: function (token, target) {
            console.log("Using array of words is only available in simulation mode");
            exit();
        },
        generateChildEpilogueAsm: function (token, childIndex, target) {
            console.log("Using array of words is only available in simulation mode");
            exit();
        },
        simPreludeChild: function () {
            return false;
        },
        simPrelude: function (simEnv, token) {
        },
        generateAsm: function (token, target) {
            console.log("Using array of words is only available in simulation mode");
            exit();
        },
        sim: function (simEnv, token) {
            if (token.context === undefined) {
                logError(token.loc, "'".concat(token.txt, "' the context is undefined"));
                exit();
            }
            var arrayLen = token.childs.length;
            var sizeOfTypeInBytes = sizeForValueType("word", "sim") * 8; // 16 ??
            var totalSize = arrayLen * sizeOfTypeInBytes;
            var startArray = simEnv.heapTop;
            simEnv.heapTop += totalSize;
            for (var i = 0; i < token.childs.length; i++) {
                var cc = token.childs[i];
                var doInterpol = cc.txt.startsWith("{") && cc.txt.endsWith("}");
                var tokenSource = doInterpol ? simGetWordValue(simEnv, cc, token.context) : getSourceRapresentationOfAToken(cc);
                //console.log(i, tokenSource);
                var addr = storeStringOnHeap(simEnv, tokenSource);
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
        ins: function (token) {
            assertChildNumber(token, 1);
            var child = token.childs[0];
            var valueType = getReturnTypeOfAWord(child);
            if (valueType === undefined) {
                logError(child.loc, "cannot determine the type of '".concat(child.txt, "'"));
                exit();
            }
            if (valueType === "void") {
                logError(token.loc, "can't store 'void' values in variables");
                exit();
            }
            var varDef = getWordDefinition(token.context, token.txt);
            if (varDef === undefined) {
                logError(token.loc, "can't find variable definition for '".concat(token.txt, "', compiler error"));
                exit();
            }
            return [varDef.out];
        },
        out: function () { return "void"; },
        generateAsm: function (token, target) {
            var varName = token.txt;
            var varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, "cannot find declaration for '".concat(varName, "', compiler error"));
                exit();
            }
            if (varDef.isGlobalContext)
                return getAsmForSetWordGlobal(varDef.internalType, getAsmVarName(varName), 0, target);
            var offset = getWordOffset(token.context, varName, target);
            return getAsmForSetWordLocal(varDef.internalType, offset, target);
        },
        sim: function (simEnv, token) {
            var varName = token.txt;
            var varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, "cannot find declaration for '".concat(varName, "', compiler error"));
                exit();
            }
            if (varDef.isGlobalContext)
                return simSetWordGlobal(simEnv, varDef.internalType, varName);
            var offset = getWordOffset(token.context, varName, "sim");
            return simSetWordLocal(simEnv, varDef.internalType, offset);
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
        ins: function (token) {
            assertChildNumber(token, 1);
            var child = token.childs[0];
            var valueType = getReturnTypeOfAWord(child);
            if (valueType === undefined) {
                logError(child.loc, "cannot determine the type of '".concat(child.txt, "'"));
                exit();
            }
            if (valueType === "void") {
                logError(token.loc, "can't store 'void' values in variables");
                exit();
            }
            return [valueType];
        },
        out: function () { return "void"; },
        generateAsm: function (token, target) {
            var varName = token.txt;
            var varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, "LIT_WORD generateAsm cannot find declaration for '".concat(varName, "', compiler error"));
                console.log(token.context);
                exit();
            }
            if (varDef.isGlobalContext)
                return getAsmForSetWordGlobal(varDef.internalType, getAsmVarName(varName), 0, target);
            var offset = getWordOffset(token.context, varName, target);
            return getAsmForSetWordLocal(varDef.internalType, offset, target);
        },
        sim: function (simEnv, token) {
            var varName = token.txt;
            var varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, "LIT_WORD sim cannot find declaration for '".concat(varName, "', compiler error"));
                console.log(token.context);
                exit();
            }
            if (varDef.isGlobalContext) {
                simSetWordGlobal(simEnv, varDef.internalType, varName);
            }
            else {
                var offset = getWordOffset(token.context, varName, "sim");
                simSetWordLocal(simEnv, varDef.internalType, offset);
            }
        }
    };
    voc[TokenType.WORD] = {
        txt: "",
        expectedArity: 0,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: function (token) {
            var funcDef = getWordDefinition(token.context, token.txt);
            if (token.isUserFunction) {
                if (funcDef === undefined) {
                    logError(token.loc, "cannot find definition for function '".concat(token.txt, "', compiler error"));
                    exit();
                }
                if (funcDef.ins === undefined) {
                    logError(token.loc, "the function '".concat(token.txt, "' should have a list of parameters type, compiler error"));
                    exit();
                }
                return funcDef.ins;
            }
            return [];
        },
        out: function (token) {
            var varName = token.txt;
            var varDef = getWordDefinition(token.context, varName);
            if (token.isUserFunction) {
                if (varDef === undefined) {
                    logError(token.loc, "cannot find definition for function '".concat(token.txt, "', compiler error"));
                    exit();
                }
                if (varDef.out === undefined) {
                    logError(token.loc, "the function '".concat(token.txt, "' should return a type value, compiler error"));
                    exit();
                }
                return varDef.out;
            }
            else {
                if (varDef !== undefined)
                    return varDef.out;
                logError(token.loc, "word '".concat(varName, "' not defined"));
                exit();
            }
        },
        generateAsm: function (token, target) {
            var varName = token.txt;
            var varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, "cannot find declaration for '".concat(varName, "', compiler error"));
                exit();
            }
            if (varDef.type === "struct") {
                return [
                    "; no asm for constructor"
                ];
            }
            var valueType = varDef.out;
            if (valueType === undefined) {
                logError(token.loc, "cannot determine the result type of function '".concat(varName, "', compiler error"));
                exit();
            }
            if (varDef.isGlobalContext)
                return getAsmForGetWordGlobal(token, valueType, getAsmVarName(varName), varDef.type === "function", target);
            var offset = getWordOffset(token.context, varName, target);
            return getAsmForGetWordLocal(valueType, offset, varDef.type === "function", target);
        },
        sim: function (simEnv, token) {
            var varName = token.txt;
            var varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, "cannot find declaration for '".concat(varName, "', compiler error"));
                exit();
            }
            // no need to sim struct values ?
            if (varDef.type === "struct")
                return;
            var valueType = varDef.out;
            if (valueType === undefined) {
                logError(token.loc, "cannot determine the result type of function '".concat(varName, "', compiler error"));
                exit();
            }
            if (varDef.isGlobalContext) {
                if (varDef.type === "function") {
                    var addr = simEnv.vars[varName];
                    if (addr === undefined) {
                        logError(token.loc, "'".concat(token.txt, "' vars is undefined"));
                        exit();
                    }
                    var addressIndex = readNumberFromHeap(simEnv, addr);
                    var functionToken = simEnv.addresses[addressIndex];
                    simEnv.retStack.push(token);
                    return [functionToken, false];
                }
                else {
                    simGetWordGlobal(simEnv, token, valueType, varName);
                }
            }
            else {
                var offset = getWordOffset(token.context, varName, "sim");
                if (varDef.type === "function") {
                    var addressIndex = simEnv.ctxStack.at(-(offset + 1));
                    if (addressIndex === undefined) {
                        logError(token.loc, "'".concat(token.txt, "' at offset ").concat(offset, " is undefined"));
                        exit();
                    }
                    var functionToken = simEnv.addresses[addressIndex];
                    simEnv.retStack.push(token);
                    return [functionToken, false];
                }
                else {
                    simGetWordLocal(simEnv, token, varDef.internalType, offset);
                }
            }
        },
        preprocessTokens: function (sequence, createVocabulary) {
            var varName = sequence[0].txt;
            var varDef = getWordDefinition(sequence[0].context, varName);
            if (varDef === undefined || varDef.type !== "function" || !varDef.isMacro)
                return;
            for (var i = 0; i < varDef.ins.length; i++) {
                var paramType = varDef.ins[i];
                var token = sequence[1 + i];
                if (paramType === "word" && token.type === TokenType.WORD) {
                    // try to convert word to word literal
                    createLiteralFromToken(token, "word");
                }
                else if (paramType === "word" && (token.type === TokenType.LITERAL && token.internalValueType !== "word")) {
                    createLiteralFromToken(token, "word");
                    token.txt = token.sourceTxt;
                }
                else if (areTypesEqual(paramType, ["array", "word"]) && token.type === TokenType.BLOCK) {
                    token.type = TokenType.WORD_BLOCK;
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
        ins: function () { return ["bool", "void"]; },
        out: function () { return "void"; },
        simPreludeChild: function (simEnv, token, childIndex) {
            if (childIndex === 1) {
                token.auxSimValue = stackPop(simEnv);
                return token.auxSimValue === 1;
            }
            else {
                return true;
            }
        },
        sim: function (simEnv, token) {
            // if the condition is true, must repeat the while
            if (token.auxSimValue === 1) {
                return [token, false];
            }
        },
        generateChildPreludeAsm: function (ast, n, target) {
            if (target === "c64") {
                // prelude for the true branch
                if (n === 0) {
                    return [
                        "startloop@:"
                    ];
                }
                else {
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
                }
                else {
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
        generateAsm: function (token, target) {
            if (target === "c64") {
                return [
                    "JMP startloop@",
                    "endblock@:",
                ];
            }
            if (target === "freebsd") {
                return [
                    "jmp startloop@",
                    "endblock@:",
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        }
    };
    voc[TokenType.POKE] = {
        txt: "poke",
        expectedArity: 2,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: function () { return ["number", "byte"]; },
        out: function () { return "void"; },
        generateAsm: function (token) { return [
            "JSR POP16",
            "LDY STACKACCESS",
            "JSR POP16",
            "TYA",
            "LDY #0",
            "STA (STACKACCESS),Y"
        ]; },
        sim: function (simEnv, token) {
            var value = stackPop(simEnv);
            var addr = stackPop(simEnv);
            simEnv.memory[addr] = value;
        }
    };
    voc[TokenType.PEEK] = {
        txt: "peek",
        expectedArity: 1,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: function () { return ["number"]; },
        out: function () { return "byte"; },
        sim: function (simEnv, token) {
            simEnv.dataStack.push(simEnv.memory[stackPop(simEnv)]);
        },
        generateAsm: function (token, target) {
            if (target === "c64") {
                return [
                    "JSR POP16",
                    "LDY #0",
                    "LDA (STACKACCESS),Y",
                    "STA STACKACCESS",
                    "STY STACKACCESS+1",
                    "JSR PUSH16"
                ];
            }
            else {
                return [
                    "pop rbx",
                    "mov rax, [rbx]",
                    "push rax"
                ];
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
        ins: function (token) {
            assertChildNumber(token, 1);
            var type = getReturnTypeOfAWord(token.childs[0]);
            if (type === "addr" || type === "string" || type === "word" || type === "void") {
                logError(token.childs[0].loc, "expected Number, Byte or Boolean, but '".concat(token.childs[0].txt, "' is ").concat(humanReadableType(type)));
                exit();
            }
            return [type];
        },
        out: function () { return "byte"; },
        generateAsm: function () { return []; },
        sim: function (simEnv, token) {
            simEnv.dataStack.push(stackPop(simEnv) & 255);
        }
    };
    voc[TokenType.CAST_NUMBER] = {
        txt: "!n",
        expectedArity: 1,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: function () { return ["byte"]; },
        out: function () { return "number"; },
        generateAsm: function () { return []; }
    };
    voc[TokenType.CAST_STRING] = {
        txt: "!str",
        expectedArity: 1,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: function (token) {
            assertChildNumber(token, 1);
            var valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType instanceof Array || valueType === "record" || valueType === "void") {
                logError(token.loc, "'".concat(token.txt, "' type is '").concat(humanReadableType(valueType), "', cannot covert to a string"));
                exit();
            }
            return [valueType];
        },
        out: function () { return "string"; },
        generateAsm: function (token, target) {
            assertChildNumber(token, 1);
            var valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType instanceof Array || valueType === "record" || valueType === "void") {
                logError(token.loc, "'".concat(token.txt, "' type is '").concat(humanReadableType(valueType), "', cannot covert to a string"));
                exit();
            }
            if (valueType === "string" || valueType === "word")
                return [];
            if (target === "c64") {
                if (valueType === "addr" || valueType === "number" || valueType === "byte") {
                    return [
                        "JSR NUM2STR",
                    ];
                }
                if (valueType === "bool") {
                    return [
                        "JSR BOOL2STR",
                    ];
                }
            }
            if (target === "freebsd") {
                if (valueType === "addr" || valueType === "number" || valueType === "byte") {
                    return [
                        "JSR num2str",
                    ];
                }
                if (valueType === "bool") {
                    return [
                        "JSR bool2str",
                    ];
                }
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        sim: function (simEnv, token) {
            var valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType instanceof Array || valueType === "record" || valueType === "void") {
                logError(token.loc, "'".concat(token.txt, "' type is '").concat(humanReadableType(valueType), "', cannot covert to a string"));
                exit();
            }
            if (valueType === "string" || valueType === "word")
                return;
            var value = stackPop(simEnv);
            if (valueType === "addr" || valueType === "number" || valueType === "byte") {
                var str = String(value);
                simEnv.dataStack.push(str.length);
                simEnv.dataStack.push(storeStringOnHeap(simEnv, str));
            }
            else {
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
        ins: function (token) {
            assertChildNumber(token, 1);
            var valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType instanceof Array || valueType === "record" || valueType === "void") {
                logError(token.loc, "'".concat(token.txt, "' type is '").concat(humanReadableType(valueType), "', cannot covert to a string"));
                exit();
            }
            return [valueType];
        },
        out: function () { return "word"; },
        generateAsm: function (token, target) {
            assertChildNumber(token, 1);
            var valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType instanceof Array || valueType === "record" || valueType === "void") {
                logError(token.loc, "'".concat(token.txt, "' type is '").concat(humanReadableType(valueType), "', cannot covert to a string"));
                exit();
            }
            if (valueType === "string" || valueType === "word")
                return [];
            if (target === "c64") {
                if (valueType === "addr" || valueType === "number" || valueType === "byte") {
                    return [
                        "JSR NUM2STR",
                    ];
                }
                if (valueType === "bool") {
                    return [
                        "JSR BOOL2STR",
                    ];
                }
            }
            if (target === "freebsd") {
                if (valueType === "addr" || valueType === "number" || valueType === "byte") {
                    return [
                        "JSR num2str",
                    ];
                }
                if (valueType === "bool") {
                    return [
                        "JSR bool2str",
                    ];
                }
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        sim: function (simEnv, token) {
            var valueType = getReturnTypeOfAWord(token.childs[0]);
            if (valueType instanceof Array || valueType === "record" || valueType === "void") {
                logError(token.loc, "'".concat(token.txt, "' type is '").concat(humanReadableType(valueType), "', cannot covert to a string"));
                exit();
            }
            if (valueType === "string" || valueType === "word")
                return;
            var value = stackPop(simEnv);
            if (valueType === "addr" || valueType === "number" || valueType === "byte") {
                var str = String(value);
                simEnv.dataStack.push(str.length);
                simEnv.dataStack.push(storeStringOnHeap(simEnv, str));
            }
            else {
                simEnv.dataStack.push(value === 1 ? "Y".charCodeAt(0) : "N".charCodeAt(0));
            }
        }
    };
    voc[TokenType.NUMBER] = {
        txt: "Number",
        expectedArity: 0,
        expectedArityOut: 1,
        grabFromStack: true,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: function () { return []; },
        out: function () { return "number"; },
        generateAsm: function (token) {
            return [];
        },
        sim: function (simEnv, token) { }
    };
    voc[TokenType.WORD_TYPE] = {
        txt: "Word",
        expectedArity: 0,
        expectedArityOut: 1,
        grabFromStack: true,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: function () { return []; },
        out: function () { return "word"; },
        generateAsm: function (token) {
            return [];
        },
        sim: function () { }
    };
    voc[TokenType.STRING] = {
        txt: "String",
        expectedArity: 0,
        expectedArityOut: 1,
        grabFromStack: true,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: function () { return []; },
        out: function () { return "string"; },
        generateAsm: function () { return []; },
        sim: function () { }
    };
    voc[TokenType.BYTE] = {
        txt: "Byte",
        expectedArity: 0,
        expectedArityOut: 1,
        grabFromStack: true,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: function () { return []; },
        out: function () { return "byte"; },
        generateAsm: function () { return []; },
        sim: function () { }
    };
    voc[TokenType.BOOL] = {
        txt: "Bool",
        expectedArity: 0,
        expectedArityOut: 1,
        grabFromStack: true,
        position: InstructionPosition.PREFIX,
        priority: 100,
        userFunction: false,
        ins: function () { return []; },
        out: function () { return "bool"; },
        generateAsm: function () { return []; },
        sim: function () { }
    };
    voc[TokenType.ADDR] = {
        txt: "!addr",
        expectedArity: 1,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        userFunction: false,
        ins: function (token) {
            assertChildNumber(token, 1);
            var childReturnType = getReturnTypeOfAWord(token.childs[0]);
            if (childReturnType === "word" || childReturnType === "void") {
                logError(token.childs[0].loc, "'".concat(token.childs[0].txt, "' cannot get the address of ").concat(humanReadableType(childReturnType)));
                exit();
            }
            return [childReturnType];
        },
        out: function () { return "number"; },
        generateChildPreludeAsm: function () {
            return undefined;
        },
        generateAsm: function (token, target) {
            assertChildNumber(token, 1);
            var tokenVar = token.childs[0];
            var varName = tokenVar.txt;
            var varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(token.loc, "addr! generateAsm cannot find declaration for '".concat(varName, "', compiler error"));
                exit();
            }
            return getAsmAddressOfWord(token.context, varDef, varName, target);
        },
        sim: function (simEnv, token) {
            var childReturnType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof childReturnType === "string" && childReturnType !== "string") {
                logError(token.childs[0].loc, "the return type of '".concat(token.childs[0].txt, "' is ").concat(humanReadableType(token.childs[0].out), " but it should be a struct type or a string"));
                exit();
            }
            if (childReturnType === "string" || childReturnType[0] === "array") {
                var addr = stackPop(simEnv);
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
        ins: function (token) {
            assertChildNumber(token, 2);
            var childType1 = getReturnTypeOfAWord(token.childs[0]);
            var childType2 = getReturnTypeOfAWord(token.childs[1]);
            if (childType1 !== "string" && childType1 !== "word") {
                logError(token.childs[0].loc, "'".concat(token.childs[0].txt, "' should be a word or a string, but it's '").concat(humanReadableType(childType1), "'"));
                exit();
            }
            if (childType2 !== "string" && childType2 !== "word") {
                logError(token.childs[1].loc, "'".concat(token.childs[1].txt, "' should be a word or a string, but it's '").concat(humanReadableType(childType2), "'"));
                exit();
            }
            return [childType1, childType2];
        },
        out: function () { return "string"; },
        generateAsm: function (token, target) {
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
                    "pop r8",
                    "pop r9",
                    "pop r10",
                    "pop r11",
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
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        sim: function (simEnv, token) {
            var addr2 = stackPop(simEnv);
            var len2 = stackPop(simEnv);
            var addr1 = stackPop(simEnv);
            var len1 = stackPop(simEnv);
            var result = readStringFromHeap(simEnv, addr1, len1) + readStringFromHeap(simEnv, addr2, len2);
            var addr = storeStringOnHeap(simEnv, result);
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
        ins: function () { return []; },
        out: function () { return "number"; },
        sim: function (simEnv, token) {
            simEnv.dataStack.push(simEnv.dataStack.length);
        },
        generateAsm: function (token, target) {
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
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
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
        ins: function (token) {
            assertChildNumber(token, 1);
            var childType = getReturnTypeOfAWord(token.childs[0]);
            if (!(childType === "string" || (childType instanceof Array && childType[0] === "array"))) {
                logError(token.loc, "'".concat(token.txt, "' length expects a string or an array"));
                exit();
            }
            return [childType];
        },
        out: function () { return "number"; },
        generateAsm: function (token, target) {
            if (target === "c64") {
                return ["JSR POP16"];
            }
            if (target === "freebsd") {
                return ["pop rax"];
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        sim: function (simEnv, token) {
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
        ins: function () { return []; },
        out: function (token) {
            if (token.childs.length === 0)
                return "void";
            var lastChild = token.childs[token.childs.length - 1];
            var valueType = getReturnTypeOfAWord(lastChild);
            if (valueType === undefined) {
                logError(lastChild.loc, "cannot determine the type of '".concat(lastChild.txt, "'"));
                exit();
            }
            return valueType;
        },
        generateAsm: function (token, target) {
            if (target === "c64") {
                var lib = [
                    "END_PRG:",
                    "JMP END_PRG",
                    "BCD DS 3 ; USED IN BIN TO BCD",
                    "ASCIIBCD DS 6; USED IN NUM TO STR",
                    "HEAPSAVE DS 3 ; USED IN COPYSTRING",
                    "AUXMUL DS 2",
                    //"HEAPTOP DS 2",
                    "TEST_UPPER_BIT: BYTE $80",
                    "SAVE_X = $74",
                    "SAVE_Y = $75",
                    "CURX = $76",
                    "CURY = $77",
                    "CURSOR = $78",
                    "HEAPTOP = $7A",
                    "CTX_SP16 = $7C",
                    "AUX = $7D",
                    "SP16 = $7F",
                    "STACKACCESS = $0080",
                    "STACKBASE = $0000",
                    "CTX_STACKBASE = ".concat(CTX_PAGE * 256),
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
                    "STA $0400,X",
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
                    "JSR PUSH16",
                    "CLC",
                    "LDA HEAPTOP",
                    "STA STACKACCESS",
                    "ADC #1",
                    "STA HEAPTOP",
                    "LDA HEAPTOP+1",
                    "STA STACKACCESS+1",
                    "ADC #0",
                    "STA HEAPTOP+1",
                    "JSR PUSH16",
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
                    "JSR PUSH16",
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
                    "JSR PUSH16",
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
                    "LDA STACKBASE + 3,X",
                    "STA AUXMUL",
                    "LDA STACKBASE + 4,X",
                    "STA AUXMUL + 1",
                    "PHA",
                    "LDA #0",
                    "STA STACKBASE + 3",
                    "STA STACKBASE + 4",
                    "PLA",
                    "LDY #$10",
                    "shift_loop:",
                    "ASL STACKBASE + 3,X",
                    "ROL STACKBASE + 4,X",
                    "ROL STACKBASE + 1,X",
                    "ROL STACKBASE + 2,X",
                    "BCC skip_add",
                    "CLC",
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
                    "DEY",
                    "BNE shift_loop",
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
                    "LDA #0",
                    "STA STACKBASE + 1,X",
                    "STA STACKBASE + 2,X",
                    "LDY #16",
                    "DIV16WITHMOD_DIVLOOP:",
                    "ASL STACKBASE + 5,X",
                    "ROL STACKBASE + 6,X",
                    "ROL STACKBASE + 1,X",
                    "ROL STACKBASE + 2,X",
                    "LDA STACKBASE + 1,X",
                    "SEC",
                    "SBC STACKBASE + 3,X",
                    "STA SAVE_Y",
                    "LDA STACKBASE + 2,X",
                    "SBC STACKBASE + 4,X",
                    "BCC DIV16WITHMOD_SKIP",
                    "STA STACKBASE + 2,X",
                    "LDA SAVE_Y",
                    "STA STACKBASE + 1,X",
                    "INC STACKBASE + 5,X",
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
                    "STA STACKBASE + 1,X",
                    "STA STACKBASE + 2,X",
                    "STA STACKBASE + 3,X",
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
                    "BMI SKIP",
                    "BNE SUBTRACT",
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
                var literalStrings = stringTable.map(function (str, index) {
                    var bytes = [];
                    for (var i = 0; i < str.length; i++) {
                        bytes.push(String(str[i].charCodeAt(0) & 255));
                    }
                    var strBytes = bytes.join(",");
                    return "str".concat(index, ": BYTE ").concat(strBytes);
                });
                var vars = [];
                if (token.context !== undefined) {
                    for (var i = 0; i < Object.entries(token.context.varsDefinition).length; i++) {
                        var _a = Object.entries(token.context.varsDefinition)[i], name_1 = _a[0], varDef = _a[1];
                        var variableName = getAsmVarName(name_1);
                        var size = typeof varDef.out === "string" || varDef.out[0] === "array" ? sizeForValueType(varDef.internalType, target) : sizeOfStruct(token.context, varDef.out, target);
                        vars.push("".concat(variableName, " DS ").concat(size));
                    }
                }
                var heap = [
                    "HEAPSTART:",
                ];
                return lib.concat(literalStrings).concat(vars).concat(heap);
            }
            if (target === "freebsd") {
                var lib = [
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
                    "emit:",
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
                    "allocate:",
                    "mov rbx, [mem_top]",
                    "add [mem_top], rax",
                    "ret",
                ];
                var literalStrings = ["section .data"]
                    .concat(stringTable.map(function (str, index) {
                    var bytes = [];
                    for (var i = 0; i < str.length; i++) {
                        bytes.push(String(str[i].charCodeAt(0) & 255));
                    }
                    var strBytes = bytes.join(",");
                    return "str".concat(index, " db ").concat(strBytes);
                }));
                // hello	db	'Hello, World!', 0Ah
                literalStrings.push("str__cantprint db '[...]'");
                var vars = ["section .bss"];
                if (token.context !== undefined) {
                    for (var i = 0; i < Object.entries(token.context.varsDefinition).length; i++) {
                        var _b = Object.entries(token.context.varsDefinition)[i], name_2 = _b[0], varDef = _b[1];
                        var variableName = getAsmVarName(name_2);
                        var size = typeof varDef.out === "string" || varDef.out[0] === "array" ? sizeForValueType(varDef.internalType, target) : sizeOfStruct(token.context, varDef.out, target);
                        vars.push("".concat(variableName, ": resb ").concat(size));
                    }
                }
                vars.push("mem_top: resb 8");
                vars.push("ctx_stack_rsp: resb 8");
                vars.push("ret_stack_rsp: resb 8");
                vars.push("ret_stack: resb ".concat(CTX_STACK_CAPACITY));
                vars.push("ctx_stack_end:");
                vars.push("ctx_stack: resb ".concat(RET_STACK_CAPACITY));
                vars.push("ret_stack_end:");
                vars.push("mem: resb ".concat(MEM_CAPACITY));
                return lib.concat(literalStrings).concat(vars);
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        generatePreludeAsm: function (ast, target) {
            if (target === "c64")
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
                    "JSR CTX_INITSTACK",
                    "JSR CLS",
                ];
            if (target === "freebsd")
                return [
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
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        simPrelude: function (simEnv, ast) {
            simEnv.buffer = "";
            simEnv.dataStack = [];
            simEnv.ctxStack = [];
            simEnv.memory = new Uint8Array(640 * 1024);
            simEnv.heapTop = 0;
            simEnv.vars = {};
        },
        sim: function (simEnv, token) {
        }
    };
    voc[TokenType.INC] = {
        txt: "inc",
        expectedArity: 1,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 80,
        userFunction: false,
        ins: function (token) {
            assertChildNumber(token, 1);
            var child = token.childs[0];
            if (child.type !== TokenType.WORD) {
                logError(child.loc, "'INC' expects a word as parameter, but '".concat(child.txt, "' is a '").concat(humanReadableToken(child.type), "' "));
                exit();
            }
            var wordDef = getWordDefinition(token.context, child.txt);
            if (wordDef === undefined) {
                logError(child.loc, "unknown word '".concat(child.txt, "'"));
                exit();
            }
            if (wordDef.internalType !== "number" && wordDef.internalType !== "byte") {
                logError(child.loc, "'INC' expects a word of type 'number' or 'byte', but word '".concat(child.txt, "' has type '").concat(humanReadableType(wordDef.internalType), "'"));
                exit();
            }
            return [wordDef.internalType];
        },
        out: function () { return "void"; },
        simPreludeChild: function (simEnv, token, n) {
            return false;
        },
        generateChildPreludeAsm: function () { return undefined; },
        sim: function (simEnv, token) {
            var child = token.childs[0];
            var varName = child.txt;
            var varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(child.loc, "INC generateAsm cannot find declaration for '".concat(varName, "', sim error"));
                exit();
            }
            if (varDef.isGlobalContext) {
                var addr = simEnv.vars[varName];
                storeNumberOnHeap(simEnv, readNumberFromHeap(simEnv, addr) + 1, addr);
            }
            else {
                // LOCAL CONTEXT
                var offset = getWordOffset(token.context, varName, "sim");
                var indexOnCtxStack = simEnv.ctxStack.length - 1 - offset;
                simEnv.ctxStack[indexOnCtxStack]++;
            }
        },
        generateAsm: function (token, target) {
            assertChildNumber(token, 1);
            var child = token.childs[0];
            var varName = child.txt;
            var varDef = getWordDefinition(token.context, varName);
            if (varDef === undefined) {
                logError(child.loc, "INC generateAsm cannot find declaration for '".concat(varName, "', compiler error"));
                exit();
            }
            var offset = getWordOffset(token.context, varName, target);
            if (target === "c64") {
                if (varDef.isGlobalContext) {
                    var asmVarName = getAsmVarName(varName);
                    if (varDef.internalType === "byte")
                        return [
                            "INC ".concat(asmVarName),
                        ];
                    return [
                        "INC ".concat(asmVarName),
                        "BNE not_carry_@",
                        "INC ".concat(asmVarName, " + 1"),
                        "not_carry_@:",
                    ];
                }
                // LOCAL CONTEXT
                if (varDef.internalType === "byte") {
                    return [
                        "LDX CTX_SP16",
                        "INC ".concat(CTX_PAGE * 256 + offset, ",X")
                    ];
                }
                return [
                    "LDX CTX_SP16",
                    "INC ".concat(CTX_PAGE * 256 + offset, ",X"),
                    "BNE not_carry_@",
                    "INC ".concat(CTX_PAGE * 256 + offset + 1, ",X"),
                    "not_carry_@:",
                ];
            }
            if (target === "freebsd") {
                if (varDef.isGlobalContext) {
                    var asmVarName = getAsmVarName(varName);
                    return [
                        "add qword [".concat(asmVarName, "], 1"),
                    ];
                }
                // LOCAL CONTEXT
                if (offset === undefined) {
                    logError(token.loc, "INC generateAsm can't compute the offset of '".concat(varName, "' onto the stack, compiler error"));
                    exit();
                }
                return [
                    "mov rax, [ctx_stack_rsp]",
                    "add rax, ".concat(offset),
                    "add qword [rax], 1",
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
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
        ins: function (token) {
            assertChildNumber(token, 2);
            var firstChild = token.childs[0];
            var secondChild = token.childs[1];
            var valueType = getReturnTypeOfAWord(secondChild);
            if (firstChild.internalValueType !== "word") {
                logError(firstChild.loc, "the first parameter of struct should be a 'symbol', but '".concat(firstChild.txt, "' is a ").concat(humanReadableToken(firstChild.type)));
                exit();
            }
            return ["word", valueType];
        },
        out: function () { return "void"; },
        generateChildPreludeAsm: function (token, n) {
            // childs does not generate asm
            return undefined;
        },
        generateAsm: function () {
            return [];
        },
        preprocessTokens: function (ast, vocabulary) {
            if (ast[1].type === TokenType.WORD) {
                createLiteralFromToken(ast[1], "word");
            }
            if (ast[2].type === TokenType.BLOCK) {
                ast[2].type = TokenType.RECORD;
            }
        },
        sim: function () { },
        simPreludeChild: function () {
            // childs does not generate asm
            return false;
        }
    };
    voc[TokenType.ARROW] = {
        txt: "->",
        expectedArity: 2,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.INFIX,
        priority: 130,
        userFunction: false,
        ins: function (token) {
            assertChildNumber(token, 2);
            var structChild = token.childs[0];
            if (structChild.out === undefined) {
                logError(structChild.loc, "'".concat(structChild.txt, "' type is undefined"));
                exit();
            }
            if (typeof structChild.out === "string") {
                logError(structChild.loc, "'".concat(structChild.txt, "' is not a struct"));
                exit();
            }
            return [structChild.out, "word"];
        },
        out: function (token) {
            assertChildNumber(token, 2);
            var structChild = token.childs[0];
            if (structChild.out === undefined) {
                logError(structChild.loc, "'".concat(structChild.txt, "' type is undefined"));
                exit();
            }
            if (typeof structChild.out === "string" || structChild.out[0] === "array" || structChild.out[0] === "addr") {
                logError(structChild.loc, "'".concat(structChild.txt, "' is not a struct"));
                exit();
            }
            var structName = structChild.out[1];
            var structDef = getWordDefinition(structChild.context, structName);
            if ((structDef === null || structDef === void 0 ? void 0 : structDef.type) !== "struct") {
                logError(structChild.loc, "'".concat(structChild.txt, "' cannot find struct definition"));
                exit();
            }
            var secondChild = token.childs[1];
            var componentName = secondChild.txt;
            var type;
            for (var i = 0; i < structDef.elements.length; i++) {
                if (structDef.elements[i].name === componentName) {
                    type = structDef.elements[i].def;
                    break;
                }
            }
            if (type === undefined) {
                logError(secondChild.loc, "'".concat(secondChild.txt, "' is not part of ").concat(structChild.txt));
                exit();
            }
            return type.internalType;
        },
        generateChildPreludeAsm: function (token, n) {
            if (n === 1)
                return undefined;
            return [];
        },
        generateAsm: function (token, target) {
            var structChild = token.childs[0];
            if (structChild.out === undefined) {
                logError(structChild.loc, "'".concat(structChild.txt, "' type is undefined"));
                exit();
            }
            if (typeof structChild.out === "string" || structChild.out[0] === "array" || structChild.out[0] === "addr") {
                logError(structChild.loc, "'".concat(structChild.txt, "' is not a struct"));
                exit();
            }
            var structName = structChild.out[1];
            var structDef = getWordDefinition(structChild.context, structName);
            if ((structDef === null || structDef === void 0 ? void 0 : structDef.type) !== "struct") {
                logError(structChild.loc, "'".concat(structChild.txt, "' cannot find struct definition"));
                exit();
            }
            if ((structDef === null || structDef === void 0 ? void 0 : structDef.type) !== "struct") {
                logError(structChild.loc, "'".concat(structChild.txt, "' is not a struct"));
                exit();
            }
            var secondChild = token.childs[1];
            if (secondChild.out !== "word") {
                logError(secondChild.loc, "'".concat(secondChild.txt, "' is not a symbol"));
                exit();
            }
            var componentName = secondChild.txt;
            var offset = 0;
            var type;
            for (var i = 0; i < structDef.elements.length; i++) {
                if (structDef.elements[i].name === componentName) {
                    type = structDef.elements[i].def;
                    break;
                }
                offset += sizeForValueType(structDef.elements[i].type, target);
            }
            if (type === undefined) {
                logError(secondChild.loc, "'".concat(secondChild.txt, "' is not part of ").concat(structChild.txt));
                exit();
            }
            if (target === "c64") {
                return [
                    "LDX SP16",
                    "CLC",
                    "LDA STACKBASE + 1,X",
                    "ADC #".concat(offset),
                    "STA STACKBASE + 1,X",
                    "LDA STACKBASE + 2,X",
                    "ADC #0",
                    "STA STACKBASE + 2,X",
                ].concat(getAsmForGetWordPointedByTOS(type.internalType, 0, target));
            }
            if (target === "freebsd") {
                return [
                    "pop rax",
                    "add rax, ".concat(offset),
                    "push rax",
                ].concat(getAsmForGetWordPointedByTOS(type.internalType, 0, target));
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        preprocessTokens: function (ast, vocabulary) {
            if (ast[2].type === TokenType.WORD) {
                createLiteralFromToken(ast[2], "word");
            }
            else if (ast[2].type === TokenType.SET_WORD) {
                createLiteralFromToken(ast[2], "word");
                ast[1].type = TokenType.SET_ARROW;
                addInstrData(ast[1], vocabulary);
            }
        },
        simPreludeChild: function (simEnv, token, childNumber) {
            if (childNumber === 1)
                return false;
            return true;
        },
        sim: function (simEnv, token) {
            var structChild = token.childs[0];
            if (structChild.out === undefined) {
                logError(structChild.loc, "'".concat(structChild.txt, "' type is undefined"));
                exit();
            }
            if (typeof structChild.out === "string" || structChild.out[0] === "array" || structChild.out[0] === "addr") {
                logError(structChild.loc, "'".concat(structChild.txt, "' is not a struct"));
                exit();
            }
            var structName = structChild.out[1];
            var structDef = getWordDefinition(structChild.context, structName);
            if ((structDef === null || structDef === void 0 ? void 0 : structDef.type) !== "struct") {
                logError(structChild.loc, "'".concat(structChild.txt, "' cannot find struct definition"));
                exit();
            }
            if ((structDef === null || structDef === void 0 ? void 0 : structDef.type) !== "struct") {
                logError(structChild.loc, "'".concat(structChild.txt, "' is not a struct"));
                exit();
            }
            var secondChild = token.childs[1];
            if (secondChild.out !== "word") {
                logError(secondChild.loc, "'".concat(secondChild.txt, "' is not a symbol"));
                exit();
            }
            var componentName = secondChild.txt;
            var offset = 0;
            var type = undefined;
            for (var i = 0; i < structDef.elements.length; i++) {
                if (structDef.elements[i].name === componentName) {
                    type = structDef.elements[i].def;
                    break;
                }
                offset += sizeForValueType(structDef.elements[i].type, "sim");
            }
            if (type === undefined) {
                logError(secondChild.loc, "'".concat(secondChild.txt, "' is not part of ").concat(structChild.txt));
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
        ins: function (token) {
            assertChildNumber(token, 3);
            var structChild = token.childs[0];
            if (structChild.out === undefined) {
                logError(structChild.loc, "'".concat(structChild.txt, "' type is undefined"));
                exit();
            }
            if (typeof structChild.out === "string" || structChild.out[0] === "array" || structChild.out[0] === "addr") {
                logError(structChild.loc, "'".concat(structChild.txt, "' is not a struct"));
                exit();
            }
            var structName = structChild.out[1];
            var structDef = getWordDefinition(structChild.context, structName);
            if ((structDef === null || structDef === void 0 ? void 0 : structDef.type) !== "struct") {
                logError(structChild.loc, "'".concat(structChild.txt, "' cannot find struct definition"));
                exit();
            }
            var componentChild = token.childs[1];
            var componentName = componentChild.txt;
            var type;
            for (var i = 0; i < structDef.elements.length; i++) {
                if (structDef.elements[i].name === componentName) {
                    type = structDef.elements[i].def;
                    break;
                }
            }
            if (type === undefined) {
                logError(componentChild.loc, "'".concat(componentChild.txt, "' is not part of ").concat(structName));
                exit();
            }
            return [["usertype", structName], "word", type.internalType];
        },
        out: function () {
            return "void";
        },
        generateChildPreludeAsm: function (token, n, target) {
            if (n === 0)
                return []; // struct name
            if (n === 1)
                return undefined; //set word
            if (n === 2)
                return [];
        },
        generateAsm: function (token, target) {
            var structChild = token.childs[0];
            if (structChild.out === undefined) {
                logError(structChild.loc, "'".concat(structChild.txt, "' type is undefined"));
                exit();
            }
            if (typeof structChild.out === "string" || structChild.out[0] === "array" || structChild.out[0] === "addr") {
                logError(structChild.loc, "'".concat(structChild.txt, "' is not a struct"));
                exit();
            }
            var structName = structChild.out[1];
            var structDef = getWordDefinition(structChild.context, structName);
            if ((structDef === null || structDef === void 0 ? void 0 : structDef.type) !== "struct") {
                logError(structChild.loc, "'".concat(structChild.txt, "' is not a struct"));
                exit();
            }
            var componentChild = token.childs[1];
            if (componentChild.out !== "word") {
                logError(componentChild.loc, "'".concat(componentChild.txt, "' is not a symbol"));
                exit();
            }
            var componentName = componentChild.txt;
            var offset = 0;
            var type;
            for (var i = 0; i < structDef.elements.length; i++) {
                if (structDef.elements[i].name === componentName) {
                    type = structDef.elements[i].def;
                    break;
                }
                offset += sizeForValueType(structDef.elements[i].type, target);
            }
            if (type === undefined) {
                logError(componentChild.loc, "'".concat(componentChild.txt, "' is not part of ").concat(structChild.txt));
                exit();
            }
            return getAsmForSetWordPointedByTOS(type.internalType, offset, target);
        },
        simPreludeChild: function (simEnv, token, n) {
            if (n === 1)
                return false; //set word
            return true;
        },
        sim: function (simEnv, token) {
            var structChild = token.childs[0];
            if (structChild.out === undefined) {
                logError(structChild.loc, "'".concat(structChild.txt, "' type is undefined"));
                exit();
            }
            if (typeof structChild.out === "string" || structChild.out[0] === "array" || structChild.out[0] === "addr") {
                logError(structChild.loc, "'".concat(structChild.txt, "' is not a struct"));
                exit();
            }
            var structName = structChild.out[1];
            var structDef = getWordDefinition(structChild.context, structName);
            if ((structDef === null || structDef === void 0 ? void 0 : structDef.type) !== "struct") {
                logError(structChild.loc, "'".concat(structChild.txt, "' is not a struct"));
                exit();
            }
            var componentChild = token.childs[1];
            if (componentChild.out !== "word") {
                logError(componentChild.loc, "'".concat(componentChild.txt, "' is not a symbol"));
                exit();
            }
            var componentName = componentChild.txt;
            var offset = 0;
            var type;
            for (var i = 0; i < structDef.elements.length; i++) {
                if (structDef.elements[i].name === componentName) {
                    type = structDef.elements[i].def;
                    break;
                }
                offset += sizeForValueType(structDef.elements[i].type, "sim");
            }
            if (type === undefined) {
                logError(componentChild.loc, "'".concat(componentChild.txt, "' is not part of ").concat(structChild.txt));
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
        ins: function () {
            return ["word", "record"];
        },
        out: function (token) {
            var structName = token.childs[0].txt;
            return ["usertype", structName];
        },
        generateAsm: function (token) {
            return [
                "; do heap malloc for size of structure and return back the address"
            ];
        },
        generateChildPreludeAsm: function (ast, n) {
            if (n === 0)
                return undefined;
            return [];
        },
        preprocessTokens: function (ast, vocabulary) {
            if (ast[1].type === TokenType.WORD) {
                createLiteralFromToken(ast[1], "word");
            }
            if (ast[2].type === TokenType.BLOCK) {
                ast[2].type = TokenType.RECORD;
            }
        },
        sim: function () { },
        simPreludeChild: function (simEnv, token, childNumber) {
            if (childNumber === 0)
                return false;
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
        ins: function (token) {
            // const childNumber = token.childs.length;
            // if (childNumber === 0) return [];
            // //return new Array(childNumber).fill("void");
            // return token.childs.map(() => "void");
            console.log("should not be called ever!");
            exit();
        },
        out: function () { return "record"; },
        generateAsm: function (token, target) {
            if (token.context === undefined) {
                logError(token.loc, "can't find context for ".concat(token.txt, ", compiler error"));
                exit();
            }
            if (token.context.parent === undefined)
                return []; // the global context
            var sizeToRelease = sizeOfContext(token.context, target);
            if (sizeToRelease === 0)
                return ["; no stack memory to release"];
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
                    "LDA #".concat(CTX_PAGE),
                    "STA FROMADD+2",
                    "LDY #".concat(sizeToRelease),
                    "JSR COPYMEM",
                    "CLC",
                    "LDA HEAPTOP",
                    "ADC #".concat(sizeToRelease),
                    "STA HEAPTOP",
                    "; release ".concat(sizeToRelease, " on the stack"),
                    "LDA CTX_SP16",
                    "CLC",
                    "ADC #".concat(sizeToRelease),
                    "STA CTX_SP16"
                ];
            }
            if (target === "freebsd") {
                return [
                    "mov rax, ".concat(sizeToRelease),
                    "call allocate",
                    "mov rdi, rbx",
                    "mov rsi, [ctx_stack_rsp]",
                    "mov rcx, ".concat(sizeToRelease),
                    "rep movsb",
                    "; release ".concat(sizeToRelease, " on the stack"),
                    "mov rax, [ctx_stack_rsp]",
                    "add rax, ".concat(sizeToRelease),
                    "mov [ctx_stack_rsp], rax",
                    "push rbx",
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        generatePreludeAsm: function (token, target) {
            // at the start we make some space on the stack, for variables
            if (token.context === undefined) {
                logError(token.loc, "can't find context for ".concat(token.txt, ", compiler error"));
                exit();
            }
            if (token.context.parent === undefined)
                return []; // the global context
            var sizeToReserve = 0;
            for (var _i = 0, _a = Object.entries(token.context.varsDefinition); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], varDef = _b[1];
                sizeToReserve += sizeForValueType(varDef.internalType, target);
            }
            var strVariables = Object.values(token.context.varsDefinition).map(function (varDef) { return varDef.token.txt + " (" + humanReadableType(varDef.out) + ")"; }).join(", ");
            if (sizeToReserve === 0)
                return ["; no stack memory to reserve"];
            if (target === "c64") {
                return [
                    "; reserve ".concat(sizeToReserve, " on the stack for: ").concat(strVariables),
                    "LDA CTX_SP16",
                    "SEC",
                    "SBC #".concat(sizeToReserve),
                    "STA CTX_SP16",
                ];
            }
            if (target === "freebsd") {
                return [
                    "mov rax, [ctx_stack_rsp]",
                    "sub rax, ".concat(sizeToReserve),
                    "mov [ctx_stack_rsp], rax",
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        sim: function (simEnv, token) {
            if (token.context === undefined) {
                logError(token.loc, "can't find context for ".concat(token.txt, ", compiler error"));
                exit();
            }
            if (token.context.parent === undefined) {
                logError(token.loc, "context for ".concat(token.txt, " is global?"));
                exit();
            }
            var sizeToRelease = sizeOfContext(token.context, "sim");
            if (sizeToRelease === 0)
                return;
            var heapStructAddress = simEnv.heapTop;
            for (var i = 0; i < sizeToRelease; i++) {
                var number = simEnv.ctxStack.pop();
                if (number === undefined) {
                    logError(token.loc, "'".concat(token.txt, "' context stack underflow"));
                    exit();
                }
                storeNumberOnHeap(simEnv, number, undefined);
            }
            simEnv.dataStack.push(heapStructAddress);
        },
        simPrelude: function (simEnv, token) {
            // at the start we make some space on the stack, for variables
            if (token.context === undefined) {
                logError(token.loc, "can't find context for ".concat(token.txt, ", sim error"));
                exit();
            }
            if (token.context.parent === undefined) {
                logError(token.loc, "the context of ".concat(token.txt, " is global ? sim error"));
                exit();
            }
            var sizeToReserve = 0;
            for (var _i = 0, _a = Object.entries(token.context.varsDefinition); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], varDef = _b[1];
                var valueType = varDef.internalType;
                var sizeForType = valueType === "string" || (valueType instanceof Array && valueType[0] === "array") ? 2 : 1;
                sizeToReserve += sizeForType;
                if (sizeForType === 1) {
                    simEnv.ctxStack.push(0);
                }
                else {
                    simEnv.ctxStack.push(0);
                    simEnv.ctxStack.push(0);
                }
            }
        }
    };
    voc[TokenType.ARRAY] = {
        txt: "array",
        expectedArity: 2,
        expectedArityOut: 1,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 15,
        userFunction: false,
        ins: function (token) {
            if (token.childs.length === 1) {
                var firstChild = token.childs[0];
                if (firstChild.type !== TokenType.ARRAY_BLOCK) {
                    logError(firstChild.loc, "'".concat(firstChild.txt, "' should be an array block, but it's a ").concat(humanReadableToken(firstChild.type)));
                    exit();
                }
                return ["addr"];
            }
            else if (token.childs.length === 2) {
                var firstChild = token.childs[0];
                var firstChildType = getReturnTypeOfAWord(firstChild);
                if (firstChildType !== "number") {
                    logError(firstChild.loc, "'".concat(firstChild.txt, "' should be a number, but it's a ").concat(humanReadableType(firstChildType)));
                    exit();
                }
                var secondChild = token.childs[1];
                if (!isTypeToken(secondChild)) {
                    logError(secondChild.loc, "'".concat(secondChild.txt, "' should be a type, but it's a ").concat(humanReadableToken(secondChild.type)));
                    exit();
                }
                return ["number", getReturnTypeOfAWord(secondChild)];
            }
            else {
                logError(token.loc, "'".concat(token.txt, "' is supposed to have one or two child but it has ").concat(token.childs.length, " childs"));
                exit();
            }
        },
        out: function (token) {
            if (token.childs.length === 1) {
                var firstChild = token.childs[0].childs[0];
                return ["array", getReturnTypeOfAWord(firstChild)];
            }
            else if (token.childs.length === 2) {
                var secondChild = token.childs[1];
                return ["array", getReturnTypeOfAWord(secondChild)];
            }
            else {
                logError(token.loc, "'".concat(token.txt, "' is supposed to have one or two child but it has ").concat(token.childs.length, " childs"));
                exit();
            }
        },
        preprocessTokens: function (sequence, vocabulary) {
            if (sequence.length < 1) {
                logError(sequence[0].loc, "'".concat(sequence[0].txt, "' expects at least one parameter but none found"));
                exit();
            }
            if (sequence[1].type === TokenType.BLOCK) {
                sequence[0].expectedArity = 1;
                sequence[1].type = TokenType.ARRAY_BLOCK;
                addInstrData(sequence[1], vocabulary);
                return;
            }
            if (sequence.length < 2) {
                logError(sequence[0].loc, "'".concat(sequence[0].txt, "' expects at least two parameter but one found"));
                exit();
            }
            var nextToken = sequence[1];
            if (isTypeToken(nextToken) || nextToken.type === TokenType.ARRAY) {
                sequence[0].type = TokenType.ARRAY_TYPE;
                addInstrData(sequence[0], vocabulary);
            }
        },
        generateChildPreludeAsm: function (token, n) {
            if (n === 1)
                return undefined;
            return [];
        },
        simPreludeChild: function (simEnv, token, n) {
            if (n === 1)
                return false;
            return true;
        },
        generateAsm: function (token, target) {
            if (token.childs.length === 1) {
                return [];
            }
            else if (token.childs.length === 2) {
                if (token.context === undefined) {
                    logError(token.loc, "can't find context for ".concat(token.txt, ", compiler error"));
                    exit();
                }
                var secondChild = token.childs[1];
                var secontChildType = getReturnTypeOfAWord(secondChild);
                var structSize = typeof secontChildType === "string" ? sizeForValueType(secontChildType, target) : sizeOfStruct(token.context, secontChildType, target);
                if (target === "c64") {
                    return [
                        // size is on the stack
                        // push the heap
                        "JSR DUP16",
                        "LDA HEAPTOP",
                        "STA STACKACCESS",
                        "LDA HEAPTOP+1",
                        "STA STACKACCESS+1",
                        "JSR PUSH16",
                        "JSR SWAP16",
                        "JSR PUSH16",
                        "JSR SWAP16",
                        // push structsize
                        "LDA #".concat(structSize),
                        "STA STACKACCESS",
                        "LDA #0",
                        "STA STACKACCESS + 1",
                        "JSR PUSH16",
                        "JSR MUL16",
                        "JSR ADD16",
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
                        "pop rax",
                        "push rax",
                        "imul rax, ".concat(structSize),
                        "call allocate",
                        "push rbx", // the array address is on the stack
                    ];
                }
                console.log("target system '".concat(target, "' unknown"));
                exit();
            }
            else {
                logError(token.loc, "'".concat(token.txt, "' is supposed to have one or two child but it has ").concat(token.childs.length, " childs"));
                exit();
            }
        },
        sim: function (simEnv, token) {
            if (token.childs.length === 1)
                return;
            if (token.childs.length === 2) {
                if (token.context === undefined) {
                    logError(token.loc, "can't find context for ".concat(token.txt, ", compiler error"));
                    exit();
                }
                var secondChild = token.childs[1];
                var secontChildType = getReturnTypeOfAWord(secondChild);
                var structSize = typeof secontChildType === "string" ? sizeForValueType(secontChildType, "sim") : sizeOfStruct(token.context, secontChildType, "sim");
                var size = stackPop(simEnv);
                simEnv.dataStack.push(size);
                var totalSize = size * structSize * 8;
                var address = simEnv.heapTop;
                simEnv.heapTop += totalSize;
                simEnv.dataStack.push(address);
            }
            else {
                logError(token.loc, "'".concat(token.txt, "' is supposed to have one or two child but it has ").concat(token.childs.length, " childs"));
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
        ins: function (token) {
            assertChildNumber(token, 1);
            if (!isTypeToken(token.childs[0])) {
                logError(token.childs[0].loc, "'".concat(token.childs[0].txt, "' should be a Type but it's a ").concat(humanReadableToken(token.childs[0].type)));
                exit();
            }
            return [getReturnTypeOfAWord(token.childs[0])];
        },
        out: function (token) {
            assertChildNumber(token, 1);
            if (!isTypeToken(token.childs[0])) {
                logError(token.childs[0].loc, "'".concat(token.childs[0].txt, "' should be a Type but it's a ").concat(humanReadableToken(token.childs[0].type)));
                exit();
            }
            return ["array", getReturnTypeOfAWord(token.childs[0])];
        },
        generateAsm: function (token) {
            return [
                "; DO NOTHING"
            ];
        },
        sim: function () { }
    };
    voc[TokenType.CHANGE] = {
        txt: "change",
        expectedArity: 3,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 10,
        userFunction: false,
        ins: function (token) {
            assertChildNumber(token, 3);
            var arrayType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof arrayType === "string" || arrayType[0] !== "array") {
                logError(token.childs[0].loc, "'".concat(token.childs[0].txt, "' should be an array, it's a ").concat(humanReadableType(arrayType)));
                exit();
            }
            return [arrayType, "number", arrayType[1]];
        },
        out: function () { return "void"; },
        generateChildPreludeAsm: function (token, n, target) {
            if (n === 2) {
                assertChildNumber(token, 3);
                var arrayType = getReturnTypeOfAWord(token.childs[0]);
                if (typeof arrayType === "string" || arrayType[0] !== "array") {
                    logError(token.childs[0].loc, "'".concat(token.childs[0].txt, "' should be an array, it's a ").concat(humanReadableType(arrayType)));
                    exit();
                }
                var sizeOfElement = sizeForValueType(arrayType[1], target);
                if (target === "c64") {
                    return [
                        // len, address, index on the stack
                        "LDA #<".concat(sizeOfElement),
                        "STA STACKACCESS",
                        "LDA #>".concat(sizeOfElement),
                        "STA STACKACCESS + 1",
                        "JSR PUSH16",
                        "JSR MUL16",
                        "JSR ADD16",
                        "LDA STACKBASE + 1,X",
                        "STA STACKBASE + 3,X",
                        "LDA STACKBASE + 2,X",
                        "STA STACKBASE + 4,X",
                        "JSR POP16", // only the address on the stack
                    ];
                }
                if (target === "freebsd") {
                    return [
                        // len, address, index on the stack
                        "pop rcx",
                        "pop rax",
                        "pop rbx",
                        "imul rcx, ".concat(sizeOfElement),
                        "add rax, rcx",
                        "push rax", // push on the stack
                    ];
                }
                console.log("target system '".concat(target, "' unknown"));
                exit();
            }
            return [];
        },
        simPreludeChild: function (simEnv, token, n) {
            if (n === 2) {
                assertChildNumber(token, 3);
                var arrayType = getReturnTypeOfAWord(token.childs[0]);
                if (typeof arrayType === "string" || arrayType[0] !== "array") {
                    logError(token.childs[0].loc, "'".concat(token.childs[0].txt, "' should be an array, it's a ").concat(humanReadableType(arrayType)));
                    exit();
                }
                var sizeOfElement = sizeForValueType(arrayType[1], "sim") * 8;
                var index = stackPop(simEnv);
                var address = stackPop(simEnv);
                var length_2 = stackPop(simEnv);
                if (index < 0 || index >= length_2) {
                    logError(token.loc, "'".concat(token.txt, "' index ").concat(index, " is out of range [0..").concat(length_2, "]"));
                    exit();
                }
                simEnv.dataStack.push(address + index * sizeOfElement);
            }
            return true;
        },
        generateAsm: function (token, target) {
            assertChildNumber(token, 3);
            var arrayType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof arrayType === "string" || arrayType[0] !== "array") {
                logError(token.childs[0].loc, "'".concat(token.childs[0].txt, "' should be an array, it's a ").concat(humanReadableType(arrayType)));
                exit();
            }
            return getAsmForSetWordPointedByTOS(arrayType[1], 0, target);
        },
        sim: function (simEnv, token) {
            assertChildNumber(token, 3);
            var arrayType = getReturnTypeOfAWord(token.childs[0]);
            if (typeof arrayType === "string" || arrayType[0] !== "array") {
                logError(token.childs[0].loc, "'".concat(token.childs[0].txt, "' should be an array, it's a ").concat(humanReadableType(arrayType)));
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
        ins: function (token) {
            assertChildNumber(token, 2);
            var childType = getReturnTypeOfAWord(token.childs[0]);
            if (!(childType === "string" || (childType instanceof Array && childType[0] === "array"))) {
                logError(token.childs[0].loc, "'".concat(token.childs[0].txt, "' should be an array or string, it's a ").concat(humanReadableType(childType)));
                exit();
            }
            return [childType, "number"];
        },
        out: function (token) {
            assertChildNumber(token, 2);
            var arrayType = getReturnTypeOfAWord(token.childs[0]);
            if (!(arrayType === "string" || (arrayType instanceof Array && arrayType[0] === "array"))) {
                logError(token.childs[0].loc, "'".concat(token.childs[0].txt, "' should be an array or string, it's a ").concat(humanReadableType(arrayType)));
                exit();
            }
            return arrayType === "string" ? "string" : arrayType[1];
        },
        sim: function (simEnv, token) {
            assertChildNumber(token, 2);
            var childType = getReturnTypeOfAWord(token.childs[0]);
            if (!(childType === "string" || (childType instanceof Array && childType[0] === "array"))) {
                logError(token.childs[0].loc, "'".concat(token.childs[0].txt, "' should be an array or string, it's a ").concat(humanReadableType(childType)));
                exit();
            }
            if (childType instanceof Array) {
                var sizeOfElement = sizeForValueType(childType[1], "sim") * 8;
                var index = stackPop(simEnv);
                var address = stackPop(simEnv);
                var len = stackPop(simEnv);
                if (index < 0 || index >= len) {
                    logError(token.loc, "'".concat(token.txt, "' the index ").concat(index, " is out of array bounds [0..").concat(len, "]"));
                    exit();
                }
                simEnv.dataStack.push(address + index * sizeOfElement);
                simGetWordPointedByTOS(simEnv, childType[1], 0);
            }
            else {
                var index = stackPop(simEnv);
                var addr = stackPop(simEnv);
                var len = stackPop(simEnv);
                if (index < 0 || index >= len) {
                    logError(token.loc, "'".concat(token.txt, "' the index ").concat(index, " is out of string bounds [0..").concat(len, "]"));
                    exit();
                }
                var newAddr = storeStringOnHeap(simEnv, String.fromCharCode(simEnv.memory[addr + index]));
                simEnv.dataStack.push(1);
                simEnv.dataStack.push(newAddr);
            }
        },
        generateAsm: function (token, target) {
            assertChildNumber(token, 2);
            var childType = getReturnTypeOfAWord(token.childs[0]);
            if (!(childType === "string" || (childType instanceof Array && childType[0] === "array"))) {
                logError(token.childs[0].loc, "'".concat(token.childs[0].txt, "' should be an array or string, it's a ").concat(humanReadableType(childType)));
                exit();
            }
            if (childType instanceof Array) {
                var sizeOfElement = sizeForValueType(childType[1], target);
                if (target === "c64") {
                    return [
                        // len, address, index on the stack
                        "LDA #<".concat(sizeOfElement),
                        "STA STACKACCESS",
                        "LDA #>".concat(sizeOfElement),
                        "STA STACKACCESS + 1",
                        "JSR PUSH16",
                        "JSR MUL16",
                        "JSR ADD16",
                        "LDA STACKBASE + 1,X",
                        "STA STACKBASE + 3,X",
                        "LDA STACKBASE + 2,X",
                        "STA STACKBASE + 4,X",
                        "JSR POP16",
                        "; now get the ".concat(humanReadableType(childType[1]), " pointed by the tos")
                    ].concat(getAsmForGetWordPointedByTOS(childType[1], 0, target));
                }
                if (target === "freebsd") {
                    return [
                        // len, address and index on the stack
                        "pop rbx",
                        "pop rax",
                        "pop rcx",
                        "imul rbx, ".concat(sizeOfElement),
                        "add rax, rbx",
                        "push rax",
                        "; now get the ".concat(humanReadableType(childType[1]), " pointed by the tos")
                    ].concat(getAsmForGetWordPointedByTOS(childType[1], 0, target));
                }
                console.log("target system '".concat(target, "' unknown"));
                exit();
            }
            else {
                if (target === "c64") {
                    // len, address, index on the stack
                    return [
                        "JSR POP16",
                        "LDY STACKACCESS",
                        "JSR SWAP16",
                        "JSR POP16",
                        "JSR POP16",
                        "LDA (STACKACCESS),Y",
                        "TAY",
                        "LDA #1",
                        "STA STACKACCESS",
                        "LDA #0",
                        "STA STACKACCESS+1",
                        "JSR PUSH16",
                        "LDA HEAPTOP",
                        "STA STACKACCESS",
                        "LDA HEAPTOP+1",
                        "STA STACKACCESS+1",
                        "JSR PUSH16",
                        "TYA",
                        "LDY #0",
                        "STA (STACKACCESS),Y",
                        "INC STACKACCESS",
                        "BNE AT_STRING_NO_CARRY",
                        "INC STACKACCESS+1",
                        "AT_STRING_NO_CARRY:",
                    ];
                }
                if (target === "freebsd") {
                    return [
                        "pop rbx",
                        "pop rax",
                        "pop rcx",
                        "add rax, rbx",
                        "mov rcx, [rax]",
                        "mov rax, 1",
                        "push rax",
                        "call allocate",
                        "push rbx",
                        "mov [rbx], rcx", // save the char
                    ];
                }
                console.log("target system '".concat(target, "' unknown"));
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
        ins: function () { return ["string"]; },
        out: function () { return "void"; },
        generateChildPreludeAsm: function () { return []; },
        generateAsm: function () { return []; }
    };
    voc[TokenType.RETURN] = {
        txt: "return",
        expectedArity: 1,
        expectedArityOut: 0,
        grabFromStack: false,
        position: InstructionPosition.PREFIX,
        priority: 5,
        userFunction: false,
        ins: function (token) {
            assertChildNumber(token, 1);
            return [getReturnTypeOfAWord(token.childs[0])];
        },
        out: function (token) {
            assertChildNumber(token, 1);
            return getReturnTypeOfAWord(token.childs[0]);
        },
        generateChildPreludeAsm: function () { return []; },
        generateAsm: function (token, target) {
            var _a;
            if (token.context === undefined) {
                logError(token.loc, "can't find context for ".concat(token.txt, ", compiler error"));
                exit();
            }
            if (token.context.parent === undefined)
                return []; // the global context
            // return should release all the contexts space until reach the ref block
            var sizeToRelease = sizeOfContext(token.context, target);
            var context = token.context;
            while (((_a = context.element) === null || _a === void 0 ? void 0 : _a.type) !== TokenType.REF_BLOCK && context.parent !== undefined) {
                context = context.parent;
                sizeToRelease += sizeOfContext(context, target);
                if (context.element === undefined) {
                    logError(token.loc, "'".concat(token.txt, "' is not inside a function"));
                    exit();
                }
                token = context.element;
            }
            if (target === "c64") {
                var asmReleaseSpace = sizeToRelease === 0 ? ["; no stack memory to release"] : [
                    "; release ".concat(sizeToRelease, " on the stack"),
                    "LDA CTX_SP16",
                    "CLC",
                    "ADC #".concat(sizeToRelease),
                    "STA CTX_SP16",
                ];
                return asmReleaseSpace.concat([
                    "RTS",
                ]);
            }
            if (target === "freebsd") {
                return [
                    "mov rax, [ctx_stack_rsp]",
                    "add rax, ".concat(sizeToRelease),
                    "mov [ctx_stack_rsp], rax",
                    "mov rax, rsp",
                    "mov rsp, [ret_stack_rsp]",
                    "ret",
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
            exit();
        },
        sim: function (simEnv, token) {
            var _a;
            if (token.context === undefined) {
                logError(token.loc, "can't find context for ".concat(token.txt, ", compiler error"));
                exit();
            }
            if (token.context.parent === undefined) {
                logError(token.loc, "the context of '".concat(token.txt, "' is global?"));
                exit();
            }
            // return should release all the contexts space until reach the ref block
            var sizeToRelease = sizeOfContext(token.context, "sim");
            var context = token.context;
            while (((_a = context.element) === null || _a === void 0 ? void 0 : _a.type) !== TokenType.REF_BLOCK && context.parent !== undefined) {
                context = context.parent;
                sizeToRelease += sizeOfContext(context, "sim");
                if (context.element === undefined) {
                    logError(token.loc, "'".concat(token.txt, "' is not inside a function"));
                    exit();
                }
                token = context.element;
            }
            simEnv.ctxStack.length = simEnv.ctxStack.length - sizeToRelease;
            var retToken = simEnv.retStack.pop();
            if (retToken === undefined) {
                logError(token.loc, "'".concat(token.txt, "' ret stack underflow"));
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
        ins: function () { return ["number", "number", "number"]; },
        out: function () { return "number"; },
        generateAsm: function (token, target) {
            if (token.context === undefined) {
                logError(token.loc, "can't find context for ".concat(token.txt, ", compiler error"));
                exit();
            }
            if (token.context.parent === undefined)
                return []; // the global context
            if (target === "c64") {
                logError(token.loc, "'".concat(token.txt, "' is not implemented in C64"));
                exit();
            }
            if (target === "freebsd") {
                return [
                    "pop rsi",
                    "pop rdi",
                    "pop rax",
                    "syscall",
                    "push rax"
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
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
        ins: function () { return ["number", "number", "number", "number"]; },
        out: function () { return "number"; },
        generateAsm: function (token, target) {
            if (token.context === undefined) {
                logError(token.loc, "can't find context for ".concat(token.txt, ", compiler error"));
                exit();
            }
            if (token.context.parent === undefined)
                return []; // the global context
            if (target === "c64") {
                logError(token.loc, "'".concat(token.txt, "' is not implemented in C64"));
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
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
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
        ins: function (token) {
            assertChildNumber(token, 1);
            return [getReturnTypeOfAWord(token.childs[0])];
        },
        out: function () { return "void"; },
        generateAsm: function (token, target) {
            if (target === "c64") {
                return [
                    "JSR POP16",
                ];
            }
            if (target === "freebsd") {
                return [
                    "pop rax",
                ];
            }
            console.log("target system '".concat(target, "' unknown"));
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
        ins: function (token) {
            assertChildNumber(token, 1);
            if ((token.childs[0].type !== TokenType.LITERAL || getReturnTypeOfAWord(token.childs[0]) !== "string") && (token.childs[0].type !== TokenType.ARRAY_BLOCK)) {
                logError(token.loc, "'".concat(token.txt, "' is not a literal string nor an array of literal string"));
                exit();
            }
            return [getReturnTypeOfAWord(token.childs[0])];
        },
        out: function () { return "void"; },
        generateChildPreludeAsm: function () {
            return undefined;
        },
        generateAsm: function (token, target) {
            assertChildNumber(token, 1);
            var allCode = token.childs[0].type === TokenType.LITERAL ? [token.childs[0].txt] : token.childs[0].childs.map(function (token) { return token.txt; });
            var regex = /\!(\w+)\b/m;
            var ret = [];
            for (var i = 0; i < allCode.length; i++) {
                var code = allCode[i];
                var result = regex.exec(code);
                if (result === null) {
                    ret.push(code); // no var interpolation
                    continue;
                }
                if (result.length !== 2) {
                    logError(token.loc, "'".concat(code, "' cannot extract variable name in this code"));
                    exit();
                }
                var varName = result[1];
                var varDef = getWordDefinition(token.context, varName);
                var offset = getWordOffset(token.context, varName, target);
                if (varDef === undefined) {
                    logError(token.loc, "INC generateAsm cannot find declaration for '".concat(varName, "', compiler error"));
                    exit();
                }
                if (target === "c64") {
                    var newCode = code.replace("!" + varName, "(STACKACCESS),Y");
                    var instruction = code.trim().substring(0, 3).toUpperCase();
                    if (instruction === "INC") {
                        if (varDef.isGlobalContext) {
                            ret.push("INC ".concat(getAsmVarName(varName)));
                            continue;
                        }
                        ret.push("LDX CTX_SP16", "INC ".concat(CTX_PAGE * 256 + offset, ",X"));
                        continue;
                    }
                    if (instruction === "LDA") {
                        if (varDef.isGlobalContext) {
                            ret.push("LDA ".concat(getAsmVarName(varName)));
                            continue;
                        }
                        if (offset === undefined) {
                            logError(token.loc, "LDA generateAsm can't compute the offset of '".concat(varName, "' onto the stack, compiler error"));
                            exit();
                        }
                        ret.push("LDX CTX_SP16", "LDA ".concat(CTX_PAGE * 256 + offset, ",X"));
                        continue;
                    }
                    if (instruction === "STA") {
                        if (varDef.isGlobalContext) {
                            ret.push("LDY ".concat(getAsmVarName(varName)), "STY STACKACCESS", "LDY ".concat(getAsmVarName(varName), "+1"), "STY STACKACCESS+1", "LDY #0", "STA (STACKACCESS),Y");
                            continue;
                        }
                        if (offset === undefined) {
                            logError(token.loc, "STA generateAsm can't compute the offset of '".concat(varName, "' onto the stack, compiler error"));
                            exit();
                        }
                        var finalAddress = CTX_PAGE * 256 + offset;
                        ret.push("LDX CTX_SP16", "PHA", "LDA ".concat(finalAddress + 0, ",X"), "STA STACKACCESS", "LDA ".concat(finalAddress + 1, ",X"), "STA STACKACCESS + 1", "PLA", "LDY #0", "STA (STACKACCESS),Y");
                        continue;
                    }
                    var prelude = [];
                    switch (instruction) {
                        case "STA":
                            prelude = getAsmValueOfWord(token.context, varDef, varName, target);
                            break;
                        default:
                            prelude = getAsmAddressOfWord(token.context, varDef, varName, target);
                            break;
                    }
                    ret.push("PHA");
                    ret.push.apply(ret, prelude);
                    ret.push("JSR POP16", "LDY #0", "PLA", newCode);
                }
                else if (target === "freebsd") {
                    var asmGetAddr = getAsmAddressOfWord(token.context, varDef, varName, target);
                    logError(token.loc, "'".concat(token.txt, "' asm in freebsd tbd"));
                    exit();
                }
                else {
                    console.log("target system '".concat(target, "' unknown"));
                    exit();
                }
            }
            return ret;
        },
        preprocessTokens: function (sequence, vocabulary) {
            if (sequence[1].type === TokenType.BLOCK) {
                sequence[1].type = TokenType.ARRAY_BLOCK;
                addInstrData(sequence[1], vocabulary);
                return;
            }
        }
    };
    return voc;
}
function logError(loc, msg, warning) {
    if (warning === void 0) { warning = false; }
    var line = loc.filename in sourceCode ? sourceCode[loc.filename].split("\n")[loc.row - 1] : "<cannot retrieve the source line in file ".concat(loc.filename, ">");
    console.log(line);
    console.log(" ".repeat(loc.col - 1) + "^ (row: ".concat(loc.row, " col: ").concat(loc.col, ")"));
    if (warning) {
        console.warn("(file://".concat(loc.filename, ":").concat(loc.row, ":").concat(loc.col, ") WARNING: ").concat(msg));
    }
    else {
        console.error("(file://".concat(loc.filename, ":").concat(loc.row, ":").concat(loc.col, ") ERROR: ").concat(msg));
    }
}
function exit() {
    console.trace();
    Deno.exit(1);
}
function identifyToken(vocabulary, txt) {
    for (var _i = 0, _a = Object.entries(vocabulary); _i < _a.length; _i++) {
        var _b = _a[_i], tokenType = _b[0], instr = _b[1];
        if (txt === instr.txt)
            return { type: parseInt(tokenType, 10), literalType: undefined };
    }
    if (txt.match(/^-?\d+$/))
        return { type: TokenType.LITERAL, literalType: "number" };
    if (txt.match(/^0x[\dabcdefABCDEF]+$/)) {
        if (txt.length === 4) {
            return { type: TokenType.LITERAL, literalType: "byte" };
        }
        else {
            return { type: TokenType.LITERAL, literalType: "number" };
        }
    }
    if (txt.match(/^0b[01]+$/))
        return { type: TokenType.LITERAL, literalType: "number" };
    if (txt[0] === '"' && txt[txt.length - 1] === '"')
        return { type: TokenType.LITERAL, literalType: "string" };
    if (txt[0] === "'" && txt[txt.length - 1] === "'")
        return { type: TokenType.LITERAL, literalType: "word" };
    if (txt[txt.length - 1] === ":")
        return { type: TokenType.SET_WORD, literalType: undefined };
    if (txt[0] === "'")
        return { type: TokenType.LIT_WORD, literalType: undefined };
    if (txt === "true" || txt === "false")
        return { type: TokenType.LITERAL, literalType: "bool" };
    return { type: TokenType.WORD, literalType: undefined };
}
function absoluteFileName(path) {
    path = path.trim();
    if (path[0] !== "/")
        path = Deno.cwd() + "/" + path;
    var parts = path.split("/").filter(function (part) { return part !== "" && part !== "."; });
    for (var i = parts.length - 1; i >= 0; i--) {
        if (parts[i] === ".." && i > 0) {
            parts.splice(i - 1, 2);
            i--;
        }
    }
    return "/" + parts.join("/");
}
function readFile(filename) {
    return __awaiter(this, void 0, void 0, function () {
        var source;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Deno.readTextFile(filename)];
                case 1:
                    source = _a.sent();
                    sourceCode[filename] = source;
                    return [2 /*return*/, source];
            }
        });
    });
}
function tokenizer(source, filename, vocabulary) {
    return __awaiter(this, void 0, void 0, function () {
        var index, tokenStart, colStart, ret, row, col, stringStart, isSpace, pushToken, previousToken, currentToken, char, loc, loc, loc, loc, filename_1, source_1, included;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    index = 0;
                    tokenStart = -1;
                    colStart = -1;
                    ret = [];
                    row = 1;
                    col = 1;
                    stringStart = -1;
                    isSpace = function (x) { return " \t\n\r".includes(x); };
                    pushToken = function (tokenText) {
                        var loc = { row: row, col: colStart, filename: filename };
                        var token = identifyToken(vocabulary, tokenText);
                        if (token === undefined) {
                            logError(loc, "unknown token '".concat(tokenText, "'"));
                            exit();
                        }
                        var txt = tokenText;
                        if (token.type === TokenType.LITERAL && (token.literalType === "string" || token.literalType === "word")) {
                            txt = tokenText.substring(1, tokenText.length - 1);
                        }
                        else if (token.type === TokenType.SET_WORD) {
                            txt = tokenText.substring(0, tokenText.length - 1);
                        }
                        else if (token.type === TokenType.LIT_WORD) {
                            txt = tokenText.substring(1);
                        }
                        var toPush = { type: token.type, txt: txt, sourceTxt: tokenText, loc: loc, internalValueType: token.literalType, childs: [] };
                        ret.push(toPush);
                        return toPush;
                    };
                    previousToken = undefined;
                    currentToken = undefined;
                    _a.label = 1;
                case 1:
                    if (!(index < source.length)) return [3 /*break*/, 14];
                    char = source[index];
                    if (!isSpace(char)) return [3 /*break*/, 2];
                    if (tokenStart > -1) {
                        // space but was parsing a word
                        previousToken = currentToken;
                        currentToken = pushToken(source.substring(tokenStart, index));
                        tokenStart = -1;
                        colStart = -1;
                    }
                    return [3 /*break*/, 13];
                case 2:
                    if (!(char === "/" && index + 1 < source.length && source[index + 1] === "/")) return [3 /*break*/, 3];
                    while (index < source.length && source[index] !== "\n")
                        index++;
                    col = 0;
                    row++;
                    return [3 /*break*/, 13];
                case 3:
                    if (!(char === ";")) return [3 /*break*/, 4];
                    while (index < source.length && source[index] !== "\n")
                        index++;
                    col = 0;
                    row++;
                    return [3 /*break*/, 13];
                case 4:
                    if (!(char === ":" && index + 1 < source.length && source[index + 1] === "[")) return [3 /*break*/, 5];
                    loc = { row: row, col: col, filename: filename };
                    ret.push({ type: TokenType.OPEN_REF_BRACKETS, txt: ":[", sourceTxt: ":[", loc: loc, childs: [] });
                    index++;
                    col++;
                    return [3 /*break*/, 13];
                case 5:
                    if (!(char === "'" && index + 1 < source.length && source[index + 1] === "[")) return [3 /*break*/, 6];
                    loc = { row: row, col: col, filename: filename };
                    ret.push({ type: TokenType.OPEN_LIT_BRACKETS, txt: "'[", sourceTxt: "'[", loc: loc, childs: [] });
                    index++;
                    col++;
                    return [3 /*break*/, 13];
                case 6:
                    if (!(char === "[")) return [3 /*break*/, 7];
                    loc = { row: row, col: col, filename: filename };
                    ret.push({ type: TokenType.OPEN_BRACKETS, txt: "[", sourceTxt: "[", loc: loc, childs: [] });
                    return [3 /*break*/, 13];
                case 7:
                    if (!(char === "]")) return [3 /*break*/, 8];
                    if (tokenStart > -1) {
                        // space but was parsing a word
                        previousToken = currentToken;
                        currentToken = pushToken(source.substring(tokenStart, index));
                        tokenStart = -1;
                        colStart = -1;
                    }
                    loc = { row: row, col: col, filename: filename };
                    ret.push({ type: TokenType.CLOSE_BRACKETS, txt: "]", sourceTxt: "]", loc: loc, childs: [] });
                    return [3 /*break*/, 13];
                case 8:
                    if (!(char === '"' && tokenStart === -1)) return [3 /*break*/, 12];
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
                    if (!((previousToken === null || previousToken === void 0 ? void 0 : previousToken.type) === TokenType.INCLUDE && currentToken.type === TokenType.LITERAL && currentToken.internalValueType === "string")) return [3 /*break*/, 11];
                    filename_1 = absoluteFileName(currentToken.txt);
                    return [4 /*yield*/, readFile(filename_1)];
                case 9:
                    source_1 = _a.sent();
                    return [4 /*yield*/, tokenizer(source_1, filename_1, vocabulary)];
                case 10:
                    included = _a.sent();
                    ret.pop(); // pop the string
                    ret.pop(); // ... and "include"
                    ret = ret.concat(included);
                    _a.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    if (tokenStart === -1) {
                        colStart = col;
                        tokenStart = index;
                    }
                    _a.label = 13;
                case 13:
                    index++;
                    col++;
                    if (char === "\n") {
                        col = 1;
                        row++;
                    }
                    return [3 /*break*/, 1];
                case 14:
                    if (tokenStart > -1) {
                        previousToken = currentToken;
                        currentToken = pushToken(source.substring(tokenStart));
                    }
                    return [2 /*return*/, ret];
            }
        });
    });
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
function getDefinitionNeeded(macroCall, sequence) {
    var traverseAst = function (ast, filter, prevent) {
        var ret = [];
        for (var i = 0; i < ast.length; i++) {
            var token = ast[i];
            if (prevent(token))
                continue;
            if (filter(token))
                ret.push(token);
            ret.push.apply(ret, traverseAst(token.childs, filter, prevent));
        }
        return ret;
    };
    var currentDefinitions = [macroCall];
    var freeWords = [macroCall.txt];
    var lastFreeWords;
    var _loop_1 = function () {
        var newDefinitions = sequence.filter(function (token) { return token.type === TokenType.LIT_WORD && !isParameter(token) && freeWords.includes(token.txt); });
        currentDefinitions.push.apply(currentDefinitions, newDefinitions);
        var wordsReferenced = traverseAst(currentDefinitions, function (token) {
            if (token.type === TokenType.WORD || (token.type === TokenType.LITERAL && token.internalValueType === "word" && /{(.+)}/gm.exec(token.txt) !== null)) {
                var findName = /{(.+)}/gm.exec(token.txt);
                var wordName = findName === null ? token.txt : findName[1];
                var wordDef = getWordDefinition(token.context, wordName);
                if (wordDef === undefined) {
                    logError(token.loc, "'".concat(token.txt, "' cannot find word definition"));
                    exit();
                }
                var definitionToken = wordDef.token;
                return !isParameter(definitionToken);
            }
            return false;
        }, function (token) { return false; }).map(function (token) {
            var findName = /{(.+)}/gm.exec(token.txt);
            return findName === null ? token.txt : findName[1];
        });
        var wordsDefinited = traverseAst(currentDefinitions, function (token) { return token.type === TokenType.LIT_WORD; }, function () { return false; }).map(function (token) {
            var findName = /{(.+)}/gm.exec(token.txt);
            return findName === null ? token.txt : findName[1];
        });
        freeWords = wordsReferenced.filter(function (word) { return !wordsDefinited.includes(word); });
        var strFreeWords = freeWords.sort().join(",");
        if (strFreeWords === lastFreeWords) {
            logError(macroCall.loc, "cannot expand macro '".concat(macroCall.txt, "' can't find words '").concat(strFreeWords, "'"));
            exit();
        }
        lastFreeWords = strFreeWords;
    };
    do {
        _loop_1();
    } while (freeWords.length > 0);
    var ret = [];
    for (var i = 0; i < sequence.length; i++) {
        if (currentDefinitions.includes(sequence[i]))
            ret.push(sequence[i]);
    }
    return ret;
}
function doMacro(vocabulary, sequence, macroCall) {
    return __awaiter(this, void 0, void 0, function () {
        var completeCode, prog, returnedCode, filename, tokens, callStr, expandStr, ast;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    completeCode = sequence.filter(function (token) {
                        var _a;
                        return token.type === TokenType.LIT_WORD
                            && ((_a = getWordDefinition(macroCall.context, token.txt)) === null || _a === void 0 ? void 0 : _a.type) !== "value";
                    });
                    //const completeCode = getDefinitionNeeded(macroCall, sequence);
                    completeCode.push(macroCall);
                    prog = {
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
                        childs: completeCode,
                        context: macroCall.context
                    };
                    returnedCode = sim(vocabulary, prog, true);
                    filename = "macro_at_".concat(macroCall.loc.row, ":").concat(macroCall.loc.col);
                    sourceCode[filename] = returnedCode;
                    return [4 /*yield*/, tokenizer(returnedCode, filename, vocabulary)];
                case 1:
                    tokens = _a.sent();
                    callStr = (macroCall.txt + " " + macroCall.childs.map(function (t) { return getSourceRapresentationOfAToken(t); }).join(" ")).trim();
                    expandStr = tokens.map(function (token) { return getSourceRapresentationOfAToken(token); }).join(" ");
                    console.log("macro [".concat(callStr, "] expanded as [").concat(expandStr, "]"));
                    ast = groupSequence(filename, tokens, vocabulary, macroCall.context);
                    return [2 /*return*/, ast.childs];
            }
        });
    });
}
function groupFunctionToken(ast, index, vocabulary, sequence) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var functionElement, functionPosition, arity, currentNumOfChilds, childs, startPos, arityNeeded, lastChild, lastParameterArity, lastChild, lastParameterArity, wordDef, tokensExpanded, lastToken;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    functionElement = ast[index];
                    functionPosition = getInstructionPosition(functionElement);
                    arity = getArity(functionElement, vocabulary);
                    currentNumOfChilds = isABlock(functionElement.type) ? 0 : functionElement.childs.length;
                    childs = [];
                    startPos = index;
                    arityNeeded = arity - currentNumOfChilds;
                    if (!(functionPosition === InstructionPosition.INFIX)) return [3 /*break*/, 4];
                    if (!(arityNeeded > 0)) return [3 /*break*/, 3];
                    if (currentNumOfChilds === 0) {
                        if (index === 0) {
                            logError(functionElement.loc, "cannot find the left parameters of the operator '".concat(functionElement.txt, "'"));
                            exit();
                        }
                        childs = [ast[index - 1]];
                        startPos = index - 1;
                    }
                    childs = childs.concat(ast.slice(index + 1, index + 1 + arityNeeded - childs.length));
                    lastChild = childs.at(-1);
                    if (lastChild === undefined) {
                        logError(functionElement.loc, "cannot find childs of '".concat(functionElement.txt, "'"));
                        exit();
                    }
                    lastParameterArity = getArity(lastChild, vocabulary);
                    if (!(lastParameterArity > 0 && lastChild.childs.length !== lastParameterArity)) return [3 /*break*/, 2];
                    return [4 /*yield*/, groupFunctionToken(ast, index + arity - 1, vocabulary, sequence)];
                case 1:
                    _c.sent();
                    _c.label = 2;
                case 2:
                    if (arityNeeded !== childs.length) {
                        logError(functionElement.loc, "the operator ".concat(functionElement.txt, " expects ").concat(arity, " parameters, but got ").concat(currentNumOfChilds, "!"));
                        exit();
                    }
                    _c.label = 3;
                case 3: return [3 /*break*/, 8];
                case 4:
                    if (!(functionPosition === InstructionPosition.POSTFIX)) return [3 /*break*/, 5];
                    if (arityNeeded > 0) {
                        if (index === 0) {
                            logError(functionElement.loc, "postfix operator '".concat(humanReadableFunction(functionElement), "' does not have a left parameters"));
                            exit();
                        }
                        childs = [ast[index - 1]];
                        startPos = index - 1;
                    }
                    return [3 /*break*/, 8];
                case 5:
                    childs = ast.slice(index + 1, index + 1 + arityNeeded);
                    if (!(arityNeeded > 0)) return [3 /*break*/, 7];
                    lastChild = childs.at(-1);
                    if (lastChild === undefined) {
                        logError(functionElement.loc, "cannot find childs of '".concat(functionElement.txt, "'"));
                        exit();
                    }
                    lastParameterArity = getArity(lastChild, vocabulary);
                    if (!(lastParameterArity > 0 && lastChild.childs.length !== lastParameterArity)) return [3 /*break*/, 7];
                    return [4 /*yield*/, groupFunctionToken(ast, index + arity, vocabulary, sequence)];
                case 6:
                    _c.sent();
                    childs = ast.slice(index + 1, index + 1 + arityNeeded);
                    _c.label = 7;
                case 7:
                    if (childs.length !== arityNeeded) {
                        logError(functionElement.loc, "the word ".concat(humanReadableFunction(functionElement), " expects ").concat(arity, " parameters, but got only ").concat(childs.length, "!"));
                        dumpAst(functionElement);
                        exit();
                    }
                    startPos = index;
                    _c.label = 8;
                case 8:
                    functionElement.childs = functionElement.childs.concat(childs);
                    if (!(functionElement.type === TokenType.WORD)) return [3 /*break*/, 11];
                    wordDef = getWordDefinition(functionElement.context, functionElement.txt);
                    if (!((wordDef === null || wordDef === void 0 ? void 0 : wordDef.type) === "function" && wordDef.isMacro)) return [3 /*break*/, 11];
                    return [4 /*yield*/, doMacro(vocabulary, sequence, functionElement)];
                case 9:
                    tokensExpanded = _c.sent();
                    return [4 /*yield*/, groupByExpectedArityOutZero(tokensExpanded, vocabulary, sequence)];
                case 10:
                    _c.sent();
                    lastToken = tokensExpanded.at(-1);
                    if (lastToken === undefined) {
                        logError(functionElement.loc, "'".concat(functionElement.txt, "' expansion produced empty block"));
                        exit();
                    }
                    ast.splice.apply(ast, __spreadArray([startPos, childs.length + 1], tokensExpanded, false));
                    return [2 /*return*/, lastToken];
                case 11:
                    ast.splice(startPos, childs.length + 1, functionElement);
                    if (functionElement.type !== TokenType.WORD_BLOCK) {
                        functionElement.childs.forEach(function (token) {
                            var _a, _b;
                            if (token.ins === undefined)
                                token.ins = (_a = vocabulary[token.type]) === null || _a === void 0 ? void 0 : _a.ins(token);
                            if (token.ins === undefined) {
                                logError(token.loc, "'cannot determine the parameter list for function ".concat(token.txt, "'"));
                                exit();
                            }
                            if (token.out === undefined)
                                token.out = (_b = vocabulary[token.type]) === null || _b === void 0 ? void 0 : _b.out(token);
                            if (token.out === undefined) {
                                logError(token.loc, "'cannot determine the return type for function ".concat(token.txt, "'"));
                                exit();
                            }
                        });
                    }
                    if (functionElement.ins === undefined)
                        functionElement.ins = (_a = vocabulary[functionElement.type]) === null || _a === void 0 ? void 0 : _a.ins(functionElement);
                    if (functionElement.ins === undefined) {
                        logError(functionElement.loc, "'cannot determine the parameter list for function ".concat(functionElement.txt, "'"));
                        exit();
                    }
                    if (functionElement.out === undefined)
                        functionElement.out = (_b = vocabulary[functionElement.type]) === null || _b === void 0 ? void 0 : _b.out(functionElement);
                    if (functionElement.out === undefined) {
                        logError(functionElement.loc, "'cannot determine the return type for function ".concat(functionElement.txt, "'"));
                        exit();
                    }
                    typeCheck(functionElement, vocabulary);
                    optimize(functionElement);
                    if (functionElement.type === TokenType.LIT_WORD) {
                        setWordDefinition(functionElement);
                    }
                    else if (functionElement.type === TokenType.STRUCT) {
                        setStructDefinition(functionElement);
                    }
                    return [2 /*return*/, functionElement];
            }
        });
    });
}
function getParametersRequestedByBlock(block) {
    if (block.type !== TokenType.BLOCK && block.type !== TokenType.REF_BLOCK && block.type !== TokenType.PROG
        && block.type !== TokenType.RECORD && block.type !== TokenType.WORD_BLOCK) {
        logError(block.loc, "the token '".concat(block.txt, "' is not a BLOCK or REF_BLOCK or PROG!"));
        exit();
    }
    var ins = [];
    // let's search for something like ['x Number 'y Number] where Number accepts a value but does not have child
    ins = block.childs
        .filter(function (token) {
        if (token.type !== TokenType.LIT_WORD)
            return false;
        if (token.childs.length !== 1)
            return false;
        if (!isTypeToken(token.childs[0]))
            return false;
        if (token.childs[0].out === undefined) {
            logError(token.childs[0].loc, "the value of '".concat(token.childs[0].txt, "' is undefined"));
            exit();
        }
        if (block.type !== TokenType.REF_BLOCK && block.type !== TokenType.RECORD) {
            logError(token.childs[0].loc, "'".concat(token.childs[0].txt, "' should be used only as parameter type in functions or in a struct definition"));
            exit();
        }
        return true;
    }).map(function (token) { return token.childs[0].out; });
    return ins;
}
function getReturnValueByRefBlock(block) {
    if (block.type !== TokenType.REF_BLOCK) {
        logError(block.loc, "the token '".concat(block.txt, "' is not a REF_BLOCK"));
        exit();
    }
    if (block.childs.length === 0)
        return "void";
    // getTokensByTypeRecur recurs only in BLOCK not in REF_BLOCK
    // so every return here is related to the ref block as parameter
    var returns = getTokensByTypeRecur(block, TokenType.RETURN);
    var lastChild = block.childs.at(-1);
    if (lastChild && (lastChild === null || lastChild === void 0 ? void 0 : lastChild.type) !== TokenType.RETURN) {
        returns.unshift(lastChild);
    }
    if (returns.length === 0) {
        logError(block.loc, "Cannot determine the type of '".concat(block.txt, "'"));
        exit();
    }
    var firstType = getReturnTypeOfAWord(returns[0]);
    for (var i = 1; i < returns.length; i++) {
        var currentReturnType = getReturnTypeOfAWord(returns[i]);
        if (firstType !== currentReturnType) {
            logError(returns[0].loc, "return types mismatch: '".concat(returns[0].txt, "' returns ").concat(humanReadableType(firstType), "..."));
            logError(returns[i].loc, "... while '".concat(returns[i].txt, "' returns ").concat(humanReadableType(currentReturnType)));
            exit();
        }
    }
    return firstType;
}
function getReturnValueByBlock(block) {
    if (block.type !== TokenType.BLOCK && block.type !== TokenType.REF_BLOCK && block.type !== TokenType.PROG
        && block.type !== TokenType.RECORD && block.type !== TokenType.WORD_BLOCK) {
        logError(block.loc, "the token '".concat(block.txt, "' is not a BLOCK or REF_BLOCK or PROG!"));
        exit();
    }
    if (block.type === TokenType.WORD_BLOCK)
        return ["array", "word"];
    for (var i = 0; i < block.childs.length - 1; i++) {
        if (block.childs[i].type === TokenType.RETURN) {
            logError(block.childs[i + 1].loc, "'".concat(block.childs[i + 1].txt, "' is unreachable code"));
            exit();
        }
        else if (block.childs[i].out !== "void") {
            logError(block.childs[i].loc, "the expression '".concat(block.childs[i].txt, "' should not return unhandled data, currently it returns ").concat(humanReadableType(block.childs[i].out)));
            exit();
        }
    }
    if (block.type === TokenType.REF_BLOCK)
        return getReturnValueByRefBlock(block);
    var lastChild = block.childs.at(-1);
    if (lastChild === undefined || lastChild.type === TokenType.RETURN)
        return "void";
    var lastChildType = lastChild.out;
    if (lastChildType === undefined) {
        logError(lastChild.loc, "the return type of '".concat(lastChild.txt, "' is undefined"));
        exit();
    }
    return lastChildType;
}
function typeCheckBlock(block) {
    if (block.type !== TokenType.BLOCK && block.type !== TokenType.REF_BLOCK && block.type !== TokenType.PROG
        && block.type !== TokenType.RECORD && block.type !== TokenType.WORD_BLOCK) {
        logError(block.loc, "the token '".concat(block.txt, "' is not a BLOCK or REF_BLOCK or PROG!"));
        exit();
    }
    // let's search for something like ['x Number 'y Number] where Number accepts a value but does not have child
    // this will become a function
    var ins = getParametersRequestedByBlock(block);
    block.ins = [];
    block.expectedArity = ins.length;
    block.out = block.type === TokenType.REF_BLOCK ? "addr" : getReturnValueByBlock(block);
    block.expectedArityOut = block.out === "void" ? 0 : 1;
}
function typeCheckDataBlock(block) {
    if (block.type !== TokenType.ARRAY_BLOCK) {
        logError(block.loc, "the token '".concat(block.txt, "' is not a '").concat(humanReadableToken(TokenType.ARRAY_BLOCK), "'"));
        exit();
    }
    if (block.childs.length === 0) {
        logError(block.loc, "'".concat(block.txt, "' is empty. Cannot infer its type"));
        exit();
    }
    var elementType;
    for (var i = 0; i < block.childs.length; i++) {
        var child = block.childs[i];
        var currentType = getReturnTypeOfAWord(child);
        if (elementType === undefined)
            elementType = currentType;
        if (!areTypesEqual(elementType, currentType)) {
            logError(child.loc, "'".concat(child.txt, "' should be ").concat(humanReadableType(elementType), " but it's a ").concat(humanReadableType(currentType)));
            exit();
        }
    }
}
function optimize(token) {
    switch (token.type) {
        case TokenType.PLUS:
            if (token.childs[0].type === TokenType.LITERAL && token.childs[1].type === TokenType.LITERAL) {
                var result = (getNumberFromLiteral(token.childs[0].txt) + getNumberFromLiteral(token.childs[1].txt));
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
                var result = (getNumberFromLiteral(token.childs[0].txt) - getNumberFromLiteral(token.childs[1].txt));
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
                var result = getNumberFromLiteral(token.childs[1].txt) !== 0 ? (getNumberFromLiteral(token.childs[0].txt) / getNumberFromLiteral(token.childs[1].txt)) : 0;
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
                var result = (getNumberFromLiteral(token.childs[0].txt) * getNumberFromLiteral(token.childs[1].txt));
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
                var result = getNumberFromLiteral(token.childs[0].txt) & 255;
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
                var result = (token.childs[0].txt + token.childs[1].txt);
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
function areTypesEqual(t1, t2) {
    if (typeof t1 === "string") {
        return t1 === t2;
    }
    if (typeof t2 === "string")
        return false; // to make tsc happy
    if (t1[0] !== t2[0])
        return false;
    if (t1[0] === "usertype") {
        return t1[1] === t2[1];
    }
    if (t2[0] === "usertype")
        return false; // to make tsc happy
    return areTypesEqual(t1[1], t2[1]);
}
function areTypesCompatible(t1, token2) {
    // if the first type is word basically it matches with every single token that is not an array
    // if the first type is an array of word than it matches all the arrays
    // we'll se if this is enough...
    var t2 = getReturnTypeOfAWord(token2);
    if (t1 === "word" && (typeof t2 === "string" || t2[0] !== "array"))
        return true;
    if (typeof t1 !== "string" && t1[0] === "array" && t1[1] === "word" && (typeof t2 !== "string" && t2[0] === "array"))
        return true;
    return areTypesEqual(t1, t2);
}
function getTokenByName(name, tokens) {
    for (var i = 0; i < tokens.length; i++) {
        if (tokens[i].txt === name)
            return tokens[i];
    }
    return undefined;
}
function typeCheck(token, vocabulary) {
    // if some of the childs has no childs we shuld typecheck them because
    // they could be a function with lower priority not grouped and checked yet
    if (token.type !== TokenType.WORD_BLOCK) {
        for (var i = 0; i < token.childs.length; i++) {
            var child = token.childs[i];
            if (child.childs.length === 0)
                typeCheck(child, vocabulary);
        }
    }
    if (token.out === undefined || token.ins === undefined) {
        var instr = vocabulary[token.type];
        if (instr === undefined) {
            logError(token.loc, "unknown keyword '".concat(token.txt, "', can't do the typecheck"));
            exit();
        }
        if (token.ins === undefined)
            token.ins = instr.ins(token);
        if (token.out === undefined)
            token.out = instr.out(token);
    }
    var arity = getArity(token, vocabulary);
    if (isABlock(token.type)) {
        // in block the number of ins is not the number of childs
    }
    else {
        if (arity !== token.childs.length) {
            logError(token.loc, "the word '".concat(token.txt, "' expects ").concat(arity, " parameters, but got ").concat(token.childs.length));
            dumpAst(token);
            exit();
        }
    }
    var ins = getInputParametersValue(token);
    for (var i = 0; i < ins.length; i++) {
        //if (!areTypesEqual(ins[i], getReturnTypeOfAWord(token.childs[i]))) {
        if (!areTypesCompatible(ins[i], token.childs[i])) {
            logError(token.loc, "the word '".concat(token.txt, "' expects parameter in position ").concat(i + 1, " to be ").concat(humanReadableType(ins[i]), ", but it is ").concat(humanReadableType(token.childs[i].out)));
            logError(token.childs[i].loc, "here is the parameter '".concat(token.childs[i].txt, "'"));
            dumpAst(token);
            exit();
        }
    }
    if (token.type === TokenType.NEW) {
        assertChildNumber(token, 2);
        var childName = token.childs[0];
        var varDef = getWordDefinition(token.context, childName.txt);
        if ((varDef === null || varDef === void 0 ? void 0 : varDef.type) === "struct") {
            var varDefElements = varDef.elements;
            var childRecord_1 = token.childs[1];
            if (childRecord_1.context === undefined) {
                logError(childRecord_1.loc, "'".concat(childRecord_1.txt, "' does not have a context"));
                exit();
            }
            var recordEntries = Object.entries(childRecord_1.context.varsDefinition)
                .map(function (_a) {
                var name = _a[0], varDef = _a[1];
                return { name: name, type: varDef.out, token: varDef.token };
            });
            // check if all of the record entries are in the struct definition
            for (var i = 0; i < recordEntries.length; i++) {
                var componentToSearch = recordEntries[i];
                var found = false;
                for (var j = 0; j < varDefElements.length; j++) {
                    if (componentToSearch.name === varDefElements[j].name) {
                        if (areTypesEqual(componentToSearch.type, varDefElements[j].def.out)) {
                            found = true;
                            break;
                        }
                        else {
                            logError(componentToSearch.token.loc, "in '".concat(token.txt, "' struct '").concat(componentToSearch.name, "' is supposed to be '").concat(humanReadableType(varDefElements[j].def.out), "' but here it is '").concat(humanReadableType(componentToSearch.type), "'"));
                            exit();
                        }
                    }
                }
                if (!found) {
                    logError(componentToSearch.token.loc, "'".concat(componentToSearch.name, "' is not part of '").concat(token.txt, "' struct"));
                    exit();
                }
            }
            // sobstitute the current context var definitions with the definition of the struct
            childRecord_1.context.varsDefinition = Object.fromEntries(varDefElements
                .filter(function (defElem) { return defElem.def.type !== "function"; })
                .map(function (defElem) { return [defElem.name, defElem.def]; }));
            // change all lit words using the struct template
            childRecord_1.childs = varDefElements
                .filter(function (defElem) { return defElem.def.type !== "function"; })
                .map(function (defElem) {
                var _a, _b;
                var existingToken = getTokenByName(defElem.name, childRecord_1.childs);
                if (existingToken !== undefined)
                    return existingToken;
                if (((_a = defElem.def.out) === null || _a === void 0 ? void 0 : _a[0]) === "usertype") {
                    logError(childRecord_1.loc, "since '".concat(defElem.name, "' is a struct, you need to specify a value for it"));
                    exit();
                }
                if (((_b = defElem.def.out) === null || _b === void 0 ? void 0 : _b[0]) === "array") {
                    logError(childRecord_1.loc, "since '".concat(defElem.name, "' is an array, you need to specify a value for it"));
                    exit();
                }
                var valueToAssign = defElem.def.internalType === "string" ? "" : 0;
                var valueToken = {
                    type: TokenType.LITERAL,
                    loc: defElem.def.token.loc,
                    context: childRecord_1.context,
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
                    childs: []
                };
                var litToken = {
                    type: TokenType.LIT_WORD,
                    loc: defElem.def.token.loc,
                    context: childRecord_1.context,
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
                    childs: [valueToken]
                };
                return litToken;
            });
        }
    } // end check struct
}
function setWordDefinition(token) {
    var _a;
    if (token.type !== TokenType.LIT_WORD) {
        logError(token.loc, "'".concat(token.txt, "' is not a 'LIT WORD'"));
        exit();
    }
    if (token.context === undefined) {
        logError(token.loc, "The token '".concat(token.txt, "' does not have a context"));
        exit();
    }
    assertChildNumber(token, 1);
    var child = token.childs[0];
    if (child.ins === undefined) {
        logError(child.loc, "The word '".concat(child.txt, "' does not have a parameters value"));
        exit();
    }
    if (child.out === undefined) {
        logError(child.loc, "The word '".concat(child.txt, "' does not have a return value"));
        exit();
    }
    var varDef = getWordDefinition(token.context, token.txt);
    if (varDef !== undefined) {
        if (varDef.token.context === token.context) {
            logError(token.loc, "Can't redefine the word '".concat(token.txt, "'"));
            exit();
        }
        // else {
        //     logError(token.loc, `Can't overshadow the word '${token.txt}'`);
        // }
    }
    var isUserFunction = child.type === TokenType.REF_BLOCK;
    var ins = isUserFunction ? getParametersRequestedByBlock(token.childs[0]) : [];
    if (isUserFunction) {
        var outType = getReturnValueByBlock(child);
        var isMacro = outType === "word" || areTypesEqual(outType, ["array", "word"]);
        token.context.varsDefinition[token.txt] = {
            type: "function",
            ins: ins,
            out: getReturnValueByBlock(child),
            token: token,
            isMacro: isMacro,
            position: InstructionPosition.PREFIX,
            priority: child.priority,
            internalType: "addr",
            reference: []
        };
        if (isMacro)
            console.log("define macro: ".concat(token.txt));
    }
    else {
        // if (child.internalValueType === undefined) {
        //     logError(child.loc, `the internal type of '${child.txt}' is undefined`);
        //     exit();
        // }
        token.context.varsDefinition[token.txt] = {
            type: "value",
            ins: [],
            out: child.out,
            token: token,
            position: InstructionPosition.PREFIX,
            priority: child.priority,
            internalType: (_a = child.internalValueType) !== null && _a !== void 0 ? _a : child.out,
            reference: []
        };
    }
}
function setStructDefinition(token) {
    if (token.type !== TokenType.STRUCT) {
        logError(token.loc, "'".concat(token.txt, "' is not a 'STRUCT'"));
        exit();
    }
    if (token.context === undefined) {
        logError(token.loc, "The token '".concat(token.txt, "' does not have a context"));
        exit();
    }
    assertChildNumber(token, 2);
    if (token.childs[0].internalValueType !== "word") {
        logError(token.childs[0].loc, "struct expects the first parameters to be a 'symbol' but '".concat(token.childs[0].txt, "' is a ").concat(humanReadableType(token.childs[0].internalValueType)));
        exit();
    }
    if (token.childs[1].type !== TokenType.RECORD) {
        logError(token.childs[1].loc, "struct expects the second parameters to be a 'BLOCK' but '".concat(token.childs[1].txt, "' is a ").concat(humanReadableToken(token.childs[1].type)));
        exit();
    }
    var name = token.childs[0].txt;
    var block = token.childs[1];
    var structDefPresent = getWordDefinition(token.context, name);
    if (structDefPresent !== undefined) {
        var previousToken = structDefPresent.token;
        logError(token.childs[0].loc, "the word '".concat(name, "' was already defined"));
        logError(previousToken.loc, "here is the previous definition");
        exit();
    }
    if (block.context === undefined) {
        logError(block.loc, "The context for the block is undefined");
        exit();
    }
    var elements = [];
    for (var _i = 0, _a = Object.entries(block.context.varsDefinition); _i < _a.length; _i++) {
        var _b = _a[_i], name_3 = _b[0], varDef = _b[1];
        elements.push({
            name: name_3,
            type: varDef.internalType,
            def: varDef
        });
    }
    var structDef = {
        type: "struct",
        ins: [],
        out: ["usertype", name],
        token: token,
        position: InstructionPosition.PREFIX,
        priority: 100,
        internalType: "addr",
        elements: elements,
        reference: []
    };
    token.context.varsDefinition[name] = structDef;
    console.log("created struct word " + name);
}
function parseBlock(ast, vocabulary, sequence) {
    return __awaiter(this, void 0, void 0, function () {
        var i, token, wordDef, tokensExpanded, priorityList, i, priority, j, token, tokenPosition, group;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < ast.length)) return [3 /*break*/, 5];
                    token = ast[i];
                    if (!(token.type === TokenType.WORD)) return [3 /*break*/, 4];
                    wordDef = getWordDefinition(token.context, token.txt);
                    if (!((wordDef === null || wordDef === void 0 ? void 0 : wordDef.type) === "function" && wordDef.isMacro && wordDef.ins.length === 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, doMacro(vocabulary, sequence, token)];
                case 2:
                    tokensExpanded = _a.sent();
                    return [4 /*yield*/, groupByExpectedArityOutZero(tokensExpanded, vocabulary, sequence)];
                case 3:
                    _a.sent();
                    ast.splice.apply(ast, __spreadArray([i, 1], tokensExpanded, false));
                    i += tokensExpanded.length - 1;
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 1];
                case 5:
                    priorityList = __spreadArray([], new Set(ast.filter(function (element) { return element.priority !== undefined && element.type !== TokenType.LITERAL; })
                        .map(function (element) { return element.priority; })
                        .sort(function (a, b) { return (b !== null && b !== void 0 ? b : 0) - (a !== null && a !== void 0 ? a : 0); })), true);
                    i = 0;
                    _a.label = 6;
                case 6:
                    if (!(i < priorityList.length)) return [3 /*break*/, 11];
                    priority = priorityList[i];
                    j = 0;
                    _a.label = 7;
                case 7:
                    if (!(j < ast.length)) return [3 /*break*/, 10];
                    token = ast[j];
                    tokenPosition = token.position;
                    if (token.priority !== priority)
                        return [3 /*break*/, 9];
                    if (token.type === TokenType.LITERAL) {
                        return [3 /*break*/, 9];
                    }
                    if (token.type === TokenType.OPEN_BRACKETS || token.type === TokenType.CLOSE_BRACKETS) {
                        logError(token.loc, "found open or closed brackets in parse, compiler error");
                        exit();
                    }
                    return [4 /*yield*/, groupFunctionToken(ast, j, vocabulary, sequence)];
                case 8:
                    group = _a.sent();
                    if (j > 0 && ast[j - 1] === group)
                        j = j - 1;
                    _a.label = 9;
                case 9:
                    j++;
                    return [3 /*break*/, 7];
                case 10:
                    i++;
                    return [3 /*break*/, 6];
                case 11: return [2 /*return*/, ast];
            }
        });
    });
}
function getInsOutArity(token) {
    if (token.type === TokenType.LITERAL)
        return { ins: 0, out: 1 };
    if (token.type === TokenType.WORD) {
        var varDef = getWordDefinition(token.context, token.txt);
        if (varDef === undefined) {
            logError(token.loc, "unknown word '".concat(token.txt, "'"));
            exit();
        }
        return { ins: varDef.ins.length, out: varDef.out === "void" ? 0 : 1 };
    }
    if (token.type === TokenType.REF_BLOCK || token.type === TokenType.BLOCK ||
        token.type === TokenType.RECORD || token.type === TokenType.WORD_BLOCK) {
        return { ins: 0, out: 1 };
    }
    // instruction
    if (token.expectedArity === undefined) {
        logError(token.loc, "the arity of '".concat(token.txt, "' is undefined"));
        exit();
    }
    if (token.expectedArityOut === undefined) {
        logError(token.loc, "the type result of '".concat(token.txt, "' is undefined"));
        exit();
    }
    if (token.position === InstructionPosition.PREFIX) {
        if (token.type === TokenType.EITHER)
            return { ins: token.expectedArity, out: 0 };
        return { ins: token.expectedArity, out: token.expectedArityOut };
    }
    if (token.position === InstructionPosition.INFIX)
        return { ins: token.expectedArity, out: token.expectedArityOut };
    // POSTFIX
    return { ins: 1, out: 1 };
}
function getTokensRecur(token, pred) {
    var wordUsed = token.childs.filter(pred);
    //const wordUsedByChild = token.childs.filter(child => child.type === TokenType.BLOCK).map(child => getTokensRecur(child, pred));
    var wordUsedByChild = token.childs.map(function (child) { return getTokensRecur(child, pred); });
    return wordUsed.concat(wordUsedByChild.flat());
}
function getTokensByTypeRecur(token, type) {
    return getTokensRecur(token, function (token) { return token.type === type; });
    // const wordUsed = token.childs.filter(child => child.type === type);
    // const wordUsedByChild = token.childs.filter(child => child.type === TokenType.BLOCK).map(child => getTokensByTypeRecur(child, type));
    // return wordUsed.concat(wordUsedByChild.flat());
}
function getWordUsedButNotDefinedInABlock(token) {
    if (token.type === TokenType.WORD_BLOCK)
        return [];
    var wordsUsed = getTokensByTypeRecur(token, TokenType.WORD).map(function (token) { return token.txt; });
    var wordsDefined = getTokensByTypeRecur(token, TokenType.LIT_WORD).map(function (token) { return token.txt; });
    var wordsUsedButNotDefined = wordsUsed.filter(function (x) { return !wordsDefined.includes(x); });
    var freeWords = wordsUsedButNotDefined.filter(function (name) { return getWordDefinition(token.context, name) === undefined; });
    return freeWords;
}
function getNumTokensInAst(ast) {
    var ret = 0;
    for (var i = 0; i < ast.length; i++) {
        if (isABlock(ast[i].type)) {
            ret += 2;
        }
        else {
            ret++;
        }
        ret += getNumTokensInAst(ast[i].childs);
    }
    return ret;
}
// async function groupByExpectedArityOutZeroUntilIndex(sequence: AST, target: Target, vocabulary: Vocabulary, finalToken: Token): Promise<[AST, number]> {
//     let childLeft = 0;
//     let lastPointer = 0;
//     let startingNewSequence = true;
//     for (let j = 0; j < sequence.length; j++) {
//         let token = sequence[j];
//         changeTokenTypeOnContext(vocabulary, token, sequence.slice(token.position === InstructionPosition.PREFIX ? j : j - 1));
//         token = sequence[j];
//         let { ins, out } = getInsOutArity(token);
//         if (token.type === TokenType.REF_BLOCK || token.type === TokenType.BLOCK || token.type === TokenType.RECORD) {
//             const childs = token.childs;
//             await groupByExpectedArityOutZero(childs, target, vocabulary);
//             typeCheckBlock(token);
//         }
//         if (token.type === TokenType.ARRAY_BLOCK) {
//             const childs = token.childs;
//             await groupByExpectedArityOutZero(childs, target, vocabulary);
//             typeCheckDataBlock(token);
//         }
//         if (token.type === TokenType.WORD_BLOCK) {
//             const childs = token.childs;
//         }
//         if (token.type === TokenType.EITHER) out = (childLeft > 0 ? 1 : 0);
//         if (childLeft > 0 && out === 0) {
//             logError(token.loc, `expected a value but '${token.txt}' returns 'void'`);
//             exit();
//         }
//         // at the start of a new sequence, we dont count out values
//         childLeft = childLeft + ins - (startingNewSequence && ins > 0 ? 0 : out);
//         if (token.position === InstructionPosition.PREFIX) {
//             if (ins > 0 && childLeft < ins) childLeft = ins;
//         } else if (token.position === InstructionPosition.INFIX) {
//             if (ins > 1 && childLeft < ins - 1) childLeft = ins - 1;
//         } else if (token.position === InstructionPosition.POSTFIX) {
//             // no check for additional parameters
//         }
//         // naive one:
//         // childLeft = childLeft + ins - out;
//         //console.log(`${token.txt} ins: ${ins} out: ${out} childleft: ${childLeft}`);
//         if ((childLeft <= 0 && !startingNewSequence) || j === sequence.length - 1 || (startingNewSequence && ins === 0 && out === 0)) {
//             let endOfBlock = true;
//             if (j < sequence.length - 1) {
//                 if (sequence[j + 1].position === InstructionPosition.INFIX || sequence[j + 1].position === InstructionPosition.POSTFIX) {
//                     endOfBlock = false;
//                 } else if (ins > 0 && token.position !== InstructionPosition.POSTFIX) {
//                     endOfBlock = false;
//                 }
//             }
//             // if there is one more token that give one result on the stack before the end
//             // this could be part of current sequence as return value of the block
//             if (j === sequence.length - 2) {
//                 const nextToken = sequence[j + 1];
//                 if (nextToken.type === TokenType.REF_BLOCK || nextToken.type === TokenType.BLOCK ||
//                     nextToken.type === TokenType.RECORD || nextToken.type === TokenType.WORD_BLOCK || nextToken.type === TokenType.WORD) {
//                     const freeWords = nextToken.type === TokenType.WORD ? [nextToken.txt] : getWordUsedButNotDefinedInABlock(nextToken);
//                     const currentlyDefinedWords = sequence.slice(lastPointer, j + 1)
//                         .filter(token => token.type === TokenType.LIT_WORD)
//                         .map(token => token.txt);
//                     const wordsInBlockDefinedCurrently = freeWords.filter(x => currentlyDefinedWords.includes(x));
//                     // If there are words in the block that are defined in the current sequence
//                     // we must parse it before the block.
//                     // If there are not such words we can grab the last item in the sequence as child
//                     if (wordsInBlockDefinedCurrently.length === 0) {
//                         endOfBlock = false;
//                     }
//                 } else {
//                     const { ins, out } = getInsOutArity(sequence[j + 1]);
//                     if (ins === 0 && out === 1) endOfBlock = false
//                 }
//             }
//             // we check if the remaning part of the sequence yield a value, it could be the
//             // return value for the block
//             // as in the example :['tio Termios syscall4 54 0 21505 tio !addr]
//             // in this case we get childLeft = 0 at token "21505" but the last two tokens are needed
//             // if (j < sequence.length - 2) {
//             //     if (sequence[j + 2].position === InstructionPosition.INFIX || sequence[j + 2].position === InstructionPosition.POSTFIX) {
//             //         endOfBlock = false;
//             //     } else if (ins > 0 && token.position !== InstructionPosition.POSTFIX) {
//             //         endOfBlock = false;
//             //     }
//             // }
//             if (endOfBlock) {
//                 childLeft = 0;
//                 //console.log("----------");
//                 const toParse = sequence.slice(lastPointer, j + 1);
//                 const reachedTheEnd = toParse.map(token => token.loc).includes(finalToken.loc);
//                 const numberToParse = toParse.length;
//                 //dumpSequence(toParse, `from ${lastPointer} to ${j} :`);
//                 if (toParse.length === 1 && toParse[0].type === TokenType.BLOCK) {
//                     // already parsed
//                 } else {
//                     await parseBlock(toParse, target, vocabulary);
//                 }
//                 sequence.splice(lastPointer, numberToParse, ...toParse);
//                 j = lastPointer + toParse.length - 1;
//                 lastPointer = lastPointer + toParse.length;
//                 if (reachedTheEnd) {
//                     sequence = sequence.slice(0, lastPointer);
//                     //  count how many blocks we parsed
//                     const numBlocksInAst = getNumTokensInAst(toParse);
//                     return [sequence.slice(0, lastPointer), numBlocksInAst];
//                 }
//                 startingNewSequence = true;
//             }
//         } else {
//             startingNewSequence = false;
//         }
//     }
//     logError(finalToken.loc, `'${finalToken.txt}' cannot parse macro expected more tokens`);
//     exit();
// }
function groupByExpectedArityOutZero(sequence, vocabulary, definitions) {
    return __awaiter(this, void 0, void 0, function () {
        var childLeft, lastPointer, startingNewSequence, currentDefinitions, _loop_2, out_j_1, j;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    childLeft = 0;
                    lastPointer = 0;
                    startingNewSequence = true;
                    currentDefinitions = [];
                    _loop_2 = function (j) {
                        var token, _b, ins, out, childs, childs, childs, endOfBlock, nextToken, freeWords, currentlyDefinedWords_1, wordsInBlockDefinedCurrently, _c, ins_1, out_1, toParse, numberToParse;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    token = sequence[j];
                                    changeTokenTypeOnContext(vocabulary, token, sequence.slice(token.position === InstructionPosition.PREFIX ? j : j - 1));
                                    token = sequence[j];
                                    _b = getInsOutArity(token), ins = _b.ins, out = _b.out;
                                    if (!(token.type === TokenType.REF_BLOCK || token.type === TokenType.BLOCK || token.type === TokenType.RECORD)) return [3 /*break*/, 2];
                                    childs = token.childs;
                                    return [4 /*yield*/, groupByExpectedArityOutZero(childs, vocabulary, definitions.concat(currentDefinitions))];
                                case 1:
                                    _d.sent();
                                    typeCheckBlock(token);
                                    _d.label = 2;
                                case 2:
                                    if (!(token.type === TokenType.ARRAY_BLOCK)) return [3 /*break*/, 4];
                                    childs = token.childs;
                                    return [4 /*yield*/, groupByExpectedArityOutZero(childs, vocabulary, definitions.concat(currentDefinitions))];
                                case 3:
                                    _d.sent();
                                    typeCheckDataBlock(token);
                                    _d.label = 4;
                                case 4:
                                    if (token.type === TokenType.WORD_BLOCK) {
                                        childs = token.childs;
                                    }
                                    if (token.type === TokenType.EITHER)
                                        out = (childLeft > 0 ? 1 : 0);
                                    if (childLeft > 0 && out === 0) {
                                        logError(token.loc, "expected a value but '".concat(token.txt, "' returns 'void'"));
                                        exit();
                                    }
                                    // at the start of a new sequence, we dont count out values
                                    childLeft = childLeft + ins - (startingNewSequence && ins > 0 ? 0 : out);
                                    if (token.position === InstructionPosition.PREFIX) {
                                        if (ins > 0 && childLeft < ins)
                                            childLeft = ins;
                                    }
                                    else if (token.position === InstructionPosition.INFIX) {
                                        if (ins > 1 && childLeft < ins - 1)
                                            childLeft = ins - 1;
                                    }
                                    else if (token.position === InstructionPosition.POSTFIX) {
                                        // no check for additional parameters
                                    }
                                    if (!((childLeft <= 0 && !startingNewSequence) || j === sequence.length - 1)) return [3 /*break*/, 9];
                                    endOfBlock = true;
                                    if (j < sequence.length - 1) {
                                        if (sequence[j + 1].position === InstructionPosition.INFIX || sequence[j + 1].position === InstructionPosition.POSTFIX) {
                                            endOfBlock = false;
                                        }
                                        else if (ins > 0 && token.position !== InstructionPosition.POSTFIX) {
                                            endOfBlock = false;
                                        }
                                    }
                                    // if there is one more token that give one result on the stack before the end
                                    // this could be part of current sequence as return value of the block
                                    if (j === sequence.length - 2) {
                                        nextToken = sequence[j + 1];
                                        if (nextToken.type === TokenType.REF_BLOCK || nextToken.type === TokenType.BLOCK ||
                                            nextToken.type === TokenType.RECORD || nextToken.type === TokenType.WORD_BLOCK || nextToken.type === TokenType.WORD) {
                                            freeWords = nextToken.type === TokenType.WORD ? [nextToken.txt] : getWordUsedButNotDefinedInABlock(nextToken);
                                            currentlyDefinedWords_1 = sequence.slice(lastPointer, j + 1)
                                                .filter(function (token) { return token.type === TokenType.LIT_WORD || (token.type === TokenType.LITERAL && token.internalValueType === "word"); })
                                                .map(function (token) { return token.txt; });
                                            wordsInBlockDefinedCurrently = freeWords.filter(function (x) { return currentlyDefinedWords_1.includes(x); });
                                            // If there are words in the block that are defined in the current sequence
                                            // we must parse it before the block.
                                            // If there are not such words we can grab the last item in the sequence as child
                                            if (wordsInBlockDefinedCurrently.length === 0) {
                                                endOfBlock = false;
                                            }
                                        }
                                        else {
                                            _c = getInsOutArity(sequence[j + 1]), ins_1 = _c.ins, out_1 = _c.out;
                                            if (ins_1 === 0 && out_1 === 1)
                                                endOfBlock = false;
                                        }
                                    }
                                    if (!endOfBlock) return [3 /*break*/, 8];
                                    childLeft = 0;
                                    toParse = sequence.slice(lastPointer, j + 1);
                                    numberToParse = toParse.length;
                                    if (!(toParse.length === 1 && toParse[0].type === TokenType.BLOCK)) return [3 /*break*/, 5];
                                    return [3 /*break*/, 7];
                                case 5: return [4 /*yield*/, parseBlock(toParse, vocabulary, definitions.concat(currentDefinitions))];
                                case 6:
                                    _d.sent();
                                    currentDefinitions.push.apply(currentDefinitions, toParse);
                                    _d.label = 7;
                                case 7:
                                    sequence.splice.apply(sequence, __spreadArray([lastPointer, numberToParse], toParse, false));
                                    j = lastPointer + toParse.length - 1;
                                    lastPointer = lastPointer + toParse.length;
                                    startingNewSequence = true;
                                    _d.label = 8;
                                case 8: return [3 /*break*/, 10];
                                case 9:
                                    startingNewSequence = false;
                                    _d.label = 10;
                                case 10:
                                    out_j_1 = j;
                                    return [2 /*return*/];
                            }
                        });
                    };
                    j = 0;
                    _a.label = 1;
                case 1:
                    if (!(j < sequence.length)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_2(j)];
                case 2:
                    _a.sent();
                    j = out_j_1;
                    _a.label = 3;
                case 3:
                    j++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function createLiteralFromToken(token, valueType) {
    token.type = TokenType.LITERAL;
    token.internalValueType = valueType;
    token.ins = [];
    token.out = valueType;
    token.position = InstructionPosition.PREFIX;
    token.priority = 1000;
    token.isUserFunction = false;
    token.childs = [];
}
function createNewContext(parent) {
    return {
        parent: parent,
        element: undefined,
        varsDefinition: {}
    };
}
function addInstrData(token, vocabulary) {
    var instr = vocabulary[token.type];
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
function groupSequence(filename, program, vocabulary, startingContext) {
    var currentContext = startingContext ? startingContext : createNewContext(undefined);
    var ast = [];
    var stack = [];
    var inLitBlock = "NO";
    for (var j = 0; j < program.length; j++) {
        var token = program[j];
        if (token.type === TokenType.OPEN_BRACKETS) {
            stack.push({ pos: ast.length, context: currentContext, loc: token.loc, type: token.type });
            if (inLitBlock !== "NO") {
                ast.push(token);
                continue;
            }
            currentContext = createNewContext(currentContext);
        }
        else if (token.type === TokenType.OPEN_REF_BRACKETS) {
            stack.push({ pos: ast.length, context: currentContext, loc: token.loc, type: token.type });
            if (inLitBlock !== "NO") {
                ast.push(token);
                continue;
            }
            currentContext = createNewContext(currentContext);
        }
        else if (token.type === TokenType.OPEN_LIT_BRACKETS) {
            var pos = ast.length;
            stack.push({ pos: pos, context: currentContext, loc: token.loc, type: token.type });
            if (inLitBlock !== "NO") {
                ast.push(token);
                continue;
            }
            currentContext = createNewContext(currentContext);
            inLitBlock = pos;
        }
        else if (token.type === TokenType.CLOSE_BRACKETS) {
            var state_1 = stack.pop();
            if (state_1 === undefined) {
                logError(token.loc, "close brackets not bilanced");
                exit();
            }
            var matchingType = state_1.type;
            if (matchingType === TokenType.OPEN_LIT_BRACKETS && inLitBlock === state_1.pos)
                inLitBlock = "NO";
            if (inLitBlock !== "NO") {
                ast.push(token);
                continue;
            }
            var matchingIndex = state_1.pos;
            var matchingLoc = state_1.loc;
            var sequence = ast.splice(matchingIndex, j - matchingIndex + 1);
            // in word block every word context is the context of the block
            if (matchingType === TokenType.OPEN_LIT_BRACKETS)
                sequence.forEach(function (token) { return token.context = currentContext; });
            var blockToken = {
                type: matchingType === TokenType.OPEN_REF_BRACKETS ? TokenType.REF_BLOCK :
                    (matchingType === TokenType.OPEN_LIT_BRACKETS ? TokenType.WORD_BLOCK : TokenType.BLOCK),
                loc: matchingLoc,
                txt: (matchingType === TokenType.OPEN_REF_BRACKETS ? ":" : "") + "[" + sequence.map(function (t) { return t.txt; }).join(" ") + "]",
                sourceTxt: (matchingType === TokenType.OPEN_REF_BRACKETS ? ":" : "") + "[" + sequence.map(function (t) { return t.sourceTxt; }).join(" ") + "]",
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
            currentContext = state_1.context;
        }
        else {
            if (token.type === TokenType.LITERAL) {
                createLiteralFromToken(token, token.internalValueType);
                ast.push(token);
            }
            else {
                var tokenToPush = __assign({}, token);
                tokenToPush.context = currentContext;
                addInstrData(tokenToPush, vocabulary);
                ast.push(tokenToPush);
            }
        }
    }
    var state = stack.pop();
    if (state !== undefined) {
        var token = program[state.pos];
        logError(token.loc, "open brackets not bilanced");
        exit();
    }
    var prog = {
        loc: { col: 1, row: 1, filename: filename },
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
function changeTokenTypeOnContext(vocabulary, token, ast) {
    if (ast.length === 0)
        return;
    var instr = vocabulary[token.type];
    if (instr === undefined)
        return;
    if (instr.preprocessTokens)
        instr.preprocessTokens(ast, vocabulary);
}
function parse(vocabulary, program, filename) {
    return __awaiter(this, void 0, void 0, function () {
        var astProgram;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    astProgram = groupSequence(filename, program, vocabulary);
                    return [4 /*yield*/, groupByExpectedArityOutZero(astProgram.childs, vocabulary, [])];
                case 1:
                    _a.sent();
                    typeCheckBlock(astProgram);
                    return [2 /*return*/, astProgram];
            }
        });
    });
}
function checkForUnusedCode(ast) {
    var setWordRefInContexts = function (token) {
        if ((token.type === TokenType.BLOCK || token.type === TokenType.REF_BLOCK || token.type === TokenType.PROG)) {
            var context = token.context;
            if (!context) {
                logError(token.loc, "'".concat(token.txt, "' does not have a context"));
                exit();
            }
            for (var _i = 0, _a = Object.entries(context.varsDefinition); _i < _a.length; _i++) {
                var _b = _a[_i], name_4 = _b[0], def = _b[1];
                def.reference = [];
            }
        }
        for (var i = 0; i < token.childs.length; i++) {
            var child = token.childs[i];
            if (child.type === TokenType.WORD || child.type === TokenType.SET_WORD || (child.type === TokenType.LITERAL && child.out === "word" && token.type !== TokenType.STRUCT)) {
                var def = getWordDefinition(child.context, child.txt);
                // todo: find component definition in case of a struct
                // print a -> name , name as word is not found
                // if (def === undefined) {
                //     logError(child.loc, `cannot find the definition of word '${child.txt}'`);
                //     exit();
                // }
                if (def)
                    def.reference.push(child);
            }
            setWordRefInContexts(child);
        }
    };
    var removeUnusedWord = function (token) {
        if (token.type === TokenType.RECORD || token.type === TokenType.WORD_BLOCK)
            return 0;
        var ret = 0;
        // depth first
        for (var i = token.childs.length - 1; i >= 0; i--) {
            var child = token.childs[i];
            ret += removeUnusedWord(child);
            if (child.type === TokenType.LIT_WORD) {
                if (child.childs.length === 1 && child.childs[0].grabFromStack)
                    continue;
                var def = getWordDefinition(child.context, child.txt);
                if (def === undefined) {
                    logError(child.loc, "cannot find the definition of word '".concat(child.txt, "'"));
                    exit();
                }
                if (def.reference.length === 0) {
                    if (isTypeToken(child.childs[0])) {
                        logError(child.loc, "unused parameter '".concat(child.txt, "'"), true);
                    }
                    else {
                        //logError(child.loc, `removed definition of unused word '${child.txt}'`, true);
                        token.childs.splice(i, 1);
                        ret++;
                    }
                }
            }
        }
        return ret;
    };
    var removeUnusedDefinition = function (token) {
        if ((token.type === TokenType.BLOCK || token.type === TokenType.REF_BLOCK || token.type === TokenType.PROG)) {
            var context = token.context;
            if (!context) {
                logError(token.loc, "'".concat(token.txt, "' does not have a context"));
                exit();
            }
            context.varsDefinition = Object.fromEntries(Object.entries(context.varsDefinition)
                .filter(function (_a) {
                var key = _a[0], def = _a[1];
                return (def.token.childs.length === 1 && def.token.childs[0].grabFromStack) || def.reference.length > 0;
            }));
            // Object.entries(context.varsDefinition).forEach(([key, def]) => {
            //     console.log(`word: ${key}`, "refs", def.reference.map(ref => ref.loc))
            // });
        }
        for (var i = token.childs.length - 1; i >= 0; i--) {
            var child = token.childs[i];
            removeUnusedDefinition(child);
        }
    };
    var tryToRemove = true;
    while (tryToRemove) {
        setWordRefInContexts(ast);
        var numRemoved = removeUnusedWord(ast);
        tryToRemove = numRemoved > 0;
    }
    // todo: make it work
    removeUnusedDefinition(ast);
}
function getFunctionIndex() {
    return functionIndex++;
}
function getFunctionName(n) {
    return "CALL_" + n;
}
function getAfterFunctionName(n) {
    return "AFTER_" + n;
}
function getNumberFromLiteral(txt) {
    return txt.startsWith("0x") ? parseInt(txt.substring(2), 16) : txt.startsWith("0b") ? parseInt(txt.substring(2), 2) : parseInt(txt, 10);
}
function compileLiteral(ast, target) {
    var _a;
    var ret = [];
    if (target === "c64") {
        var toHeap = ((_a = ast.parent) === null || _a === void 0 ? void 0 : _a.type) === TokenType.ARRAY_BLOCK;
        var strDest = toHeap ? "heap" : "stack";
        if (ast.out === "number") {
            var number = getNumberFromLiteral(ast.txt);
            ret.push("; ".concat(ast.loc.row, ":").concat(ast.loc.col, " NUMBER ").concat(ast.txt));
            var LSB = number & 255;
            ret.push("LDA #".concat(LSB));
            ret.push("STA STACKACCESS");
            var MSB = (number >> 8) & 255;
            ret.push("LDA #".concat(MSB));
            ret.push("STA STACKACCESS+1");
            ret.push("JSR PUSH16");
        }
        else if (ast.out === "byte") {
            var number = getNumberFromLiteral(ast.txt);
            ret.push("; ".concat(ast.loc.row, ":").concat(ast.loc.col, " BYTE to ").concat(strDest, " ").concat(ast.txt));
            var LSB = number & 255;
            ret.push("LDA #".concat(LSB));
            ret.push("STA STACKACCESS");
            ret.push("LDA #0");
            ret.push("STA STACKACCESS+1");
            ret.push("JSR PUSH16");
        }
        else if (ast.out === "string" || ast.out === "word") {
            ret.push("; ".concat(ast.loc.row, ":").concat(ast.loc.col, " STRING \"").concat(ast.txt, "\""));
            // push lenght
            // todo: ora la lunghezza massima della stringa è 255 caratteri, aumentarla ?
            var stringToPush = ast.txt;
            // if (stringToPush.length > 255) {
            //     logError(ast.loc, "strings must be less than 256 chars");
            //     exit();
            // }
            ret.push("LDA #<".concat(ast.txt.length));
            ret.push("STA STACKACCESS");
            ret.push("LDA #>".concat(ast.txt.length));
            ret.push("STA STACKACCESS+1");
            ret.push("JSR PUSH16");
            // push address
            var labelIndex_1 = stringTable.length;
            stringTable.push(ast.txt);
            ret.push("LDA #>str".concat(labelIndex_1));
            ret.push("STA STACKACCESS+1");
            ret.push("LDA #<str".concat(labelIndex_1));
            ret.push("STA STACKACCESS");
            ret.push("JSR PUSH16");
        }
        else if (ast.out === "bool") {
            ret.push("; ".concat(ast.loc.row, ":").concat(ast.loc.col, " BOOL ").concat(ast.txt));
            ret.push("LDA #".concat(ast.txt === "true" ? "1" : "0"));
            ret.push("STA STACKACCESS");
            ret.push("LDA #0");
            ret.push("STA STACKACCESS+1");
            ret.push("JSR PUSH16");
        }
        else if (ast.out === "addr") {
            logError(ast.loc, "'Addr' should not be compiled as a value, compiler error");
            exit();
        }
        else if (ast.out === "void") {
            logError(ast.loc, "'Void' should not be compiled as a value, compiler error");
            exit();
        }
        else {
            logError(ast.loc, "compiling the type '".concat(ast.out, "' is not supported yet"));
            exit();
        }
        return ret;
    }
    else if (target === "freebsd") {
        if (ast.out === "number") {
            ret.push("; ".concat(ast.loc.row, ":").concat(ast.loc.col, " NUMBER ").concat(ast.txt));
            var num = getNumberFromLiteral(ast.txt);
            ret.push("push ".concat(num));
        }
        else if (ast.out === "byte") {
            ret.push("; ".concat(ast.loc.row, ":").concat(ast.loc.col, " BYTE ").concat(ast.txt));
            var LSB = getNumberFromLiteral(ast.txt) & 255;
            ret.push("push ".concat(LSB));
        }
        else if (ast.out === "string" || ast.out === "word") {
            ret.push("; ".concat(ast.loc.row, ":").concat(ast.loc.col, " STRING \"").concat(ast.txt, "\""));
            // push lenght
            var stringToPush = ast.txt;
            ret.push("push ".concat(ast.txt.length));
            // push address
            var labelIndex_2 = stringTable.length;
            stringTable.push(ast.txt);
            ret.push("push str".concat(labelIndex_2));
        }
        else if (ast.out === "bool") {
            ret.push("; ".concat(ast.loc.row, ":").concat(ast.loc.col, " BOOL ").concat(ast.txt));
            ret.push("push ".concat(ast.txt === "true" ? "1" : "0"));
        }
        else if (ast.out === "addr") {
            logError(ast.loc, "'Addr' should not be compiled as a value, compiler error");
            exit();
        }
        else if (ast.out === "void") {
            logError(ast.loc, "'Void' should not be compiled as a value, compiler error");
            exit();
        }
        else {
            logError(ast.loc, "compiling the type '".concat(ast.out, "' is not supported yet"));
            exit();
        }
        return ret;
    }
    console.log("target system unknown ".concat(target));
    exit();
}
function isTypeToken(token) {
    if (token.grabFromStack)
        return true;
    var varDef = getWordDefinition(token.context, token.txt);
    return (varDef === null || varDef === void 0 ? void 0 : varDef.type) === "struct";
}
function compile(vocabulary, ast, target) {
    var ret = [];
    var inst = vocabulary[ast.type];
    var loc = "".concat(ast.loc.row, ": ").concat(ast.loc.col);
    var wordtype = getFunctionSignature(ast);
    var tokenType = humanReadableToken(ast.type);
    var instructionLabel = "; ".concat(loc, " ").concat(tokenType, " ").concat(ast.txt.substring(0, 20) + (ast.txt.length > 20 ? "..." : ""), " type: ").concat(wordtype);
    // PRELUDE
    if (ast.type !== TokenType.LITERAL) {
        if (inst.generatePreludeAsm) {
            ret.push("; Prelude for:");
            ret.push(instructionLabel);
            ret = ret.concat(inst.generatePreludeAsm(ast, target));
        }
    }
    for (var i = 0; i < ast.childs.length; i++) {
        var generateAssemblyChild = true;
        if (inst.generateChildPreludeAsm) {
            var retAsseblyChild = inst.generateChildPreludeAsm(ast, i, target);
            if (retAsseblyChild !== undefined) {
                ret = ret.concat(retAsseblyChild);
            }
            else {
                ret = ret.concat([
                    "; no child generation for '".concat(ast.txt, "'")
                ]);
                generateAssemblyChild = false;
            }
        }
        if (generateAssemblyChild)
            ret = ret.concat(compile(vocabulary, ast.childs[i], target));
        if (inst.generateChildEpilogueAsm) {
            var retAsseblyChildEpilogue = inst.generateChildEpilogueAsm(ast, i, target);
            ret = ret.concat(retAsseblyChildEpilogue);
        }
    }
    // lets' compile for real
    if (ast.type === TokenType.LITERAL) {
        ret = ret.concat(compileLiteral(ast, target));
    }
    else {
        ret.push(instructionLabel);
        var inst_1 = vocabulary[ast.type];
        ret = ret.concat(inst_1.generateAsm(ast, target));
    }
    // LABEL NUMBERING, EACH @ found in instructions is changed to labelIndex
    for (var i = 0; i < ret.length; i++) {
        ret[i] = ret[i].replace("@", String(labelIndex));
    }
    labelIndex++;
    return ret;
}
function optimizeAsm(asm, target) {
    // simple peephole optimization
    var lastInstruction = "";
    var lastInstructionIndex = -1;
    for (var i = 0; i < asm.length; i++) {
        var instruction = asm[i];
        if (instruction === NO_PEEPHOLE_OPT_DIRECTIVE)
            lastInstruction = "";
        switch (target) {
            case "c64": {
                if (instruction[0] === ";")
                    continue;
                if (instruction === "JSR POP16" && lastInstruction === "JSR PUSH16") {
                    asm[lastInstructionIndex] = "; " + asm[lastInstructionIndex];
                    asm[i] = "; " + asm[i];
                }
                break;
            }
            case "freebsd": {
                if (instruction[0] === ";")
                    continue;
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
function addIndent(code) {
    for (var i = 0; i < code.length; i++) {
        var isAssignment = code[i].includes(" = ");
        if (isAssignment)
            continue;
        var isDeclareSpace = code[i].includes(" DS ");
        if (isDeclareSpace)
            continue;
        var hasLabel = /^\S+\:/.test(code[i]);
        if (hasLabel)
            continue;
        code[i] = "\t" + code[i];
    }
}
function dumpProgram(program) {
    console.log("Token listing:");
    for (var i = 0; i < program.length; i++) {
        var token = program[i];
        //logError(token.loc, `istr: ${token.type}, ${token.txt}`)
        console.log("".concat(token.loc.row, ":").concat(token.loc.col, " \t'").concat(token.txt, "' \t").concat(humanReadableToken(token.type)));
    }
}
function dumpAst(ast, prefix) {
    if (prefix === void 0) { prefix = ""; }
    var getVarsInContext = function (context) {
        if (context === undefined)
            return "Context undefined";
        var ctxVars = Object.entries(context.varsDefinition);
        return ctxVars.length === 0 ? "none" : ctxVars.map(function (_a) {
            var key = _a[0], def = _a[1];
            return "".concat(key, " (").concat(def.ins.map(function (t) { return humanReadableType(t); }).join(","), ")=>").concat(humanReadableType(def.out));
        }).join(", ");
    };
    var astToDump = ast instanceof Array ? ast : [ast];
    astToDump.forEach(function (element) {
        var _a, _b, _c;
        var tokenType = humanReadableToken(element.type);
        var ins;
        var out;
        var defType = "";
        if (element.type === TokenType.WORD) {
            var varDef = getWordDefinition(element.context, element.txt);
            defType = (varDef === null || varDef === void 0 ? void 0 : varDef.type) === "function" ? (varDef.isMacro ? "macro" : "function") : ((varDef === null || varDef === void 0 ? void 0 : varDef.type) === "struct" ? "struct" : "value");
            ins = varDef === null || varDef === void 0 ? void 0 : varDef.ins;
            out = varDef === null || varDef === void 0 ? void 0 : varDef.out;
        }
        else {
            ins = element.ins;
            out = element.out;
        }
        var strIns = ins === undefined ? "undefined" : ins.map(function (type) { return humanReadableType(type); }).join(",");
        var strOut = humanReadableType(out);
        var strType = "(" + strIns + ")=>" + strOut;
        var strFun = defType;
        var contextToken = (_a = element.context) === null || _a === void 0 ? void 0 : _a.element;
        var contextTokenName = (_b = contextToken === null || contextToken === void 0 ? void 0 : contextToken.txt) !== null && _b !== void 0 ? _b : "";
        var ctxName = contextTokenName.length > 10 ? "[" + contextTokenName.substring(1, 6) + "...]" : "[" + contextTokenName + "]";
        var ctx = ((_c = element.context) === null || _c === void 0 ? void 0 : _c.parent) === undefined ? "global" : ctxName;
        var vars = getVarsInContext(element.context);
        var parentVars = ""; //getVarsInContext(element.context?.parent);
        console.log(prefix, element.txt + " " + tokenType + " " + strFun + " " + strType + " ctx:" + ctx + " (" + vars + ") (" + parentVars + ")");
        // console.log(prefix, sourceCode.split("\n")[element.loc.row - 1]);
        // console.log(prefix, " ".repeat(element.loc.col - 1) + `^ (row: ${element.loc.row} col: ${element.loc.col})`);
        dumpAst(element.childs, prefix + "    ");
    });
}
function dumpContext(context) {
    if (context === undefined) {
        console.log("Context is undefined");
        return;
    }
    console.log("context for " + (context.element === undefined ? "global" : context.element.txt));
    Object.keys(context.varsDefinition).forEach(function (key) {
        var wordtype = "";
        wordtype = getFunctionSignature(context.varsDefinition[key].token);
        console.log("    " + key + ": " + wordtype);
    });
}
function usage() {
    console.log("USAGE:");
    console.log("    deno run --allow-all cazz.ts <target> <filename>");
    console.log("        <target> should be 'c64' or 'freebsd'");
    console.log("        <action> 'run' or 'compile'");
    console.log("        <filename> must have .cazz extension");
}
function isParameter(token) {
    if (token.type !== TokenType.LIT_WORD)
        return false;
    if (token.childs.length !== 1)
        return false;
    return isTypeToken(token.childs[0]);
}
function buildLinks(token, parent) {
    token.parent = parent;
    if (token.type === TokenType.REF_BLOCK && !token.parameterReversed) {
        // reorder the child: first the params in reverse order, then the other childs
        var params = token.childs
            .filter(isParameter)
            .reverse();
        var nonParams = token.childs
            .filter(function (t) { return !isParameter(t); });
        token.childs = params.concat(nonParams);
        token.parameterReversed = true;
    }
    else if (token.type === TokenType.ARRAY_BLOCK && !token.parameterReversed) {
        token.childs = token.childs.reverse();
        token.parameterReversed = true;
    }
    for (var i = 0; i < token.childs.length; i++) {
        token.childs[i].parent = token;
        token.childs[i].sibling = i < token.childs.length - 1 ? token.childs[i + 1] : undefined;
        token.childs[i].index = i;
        token.childs[i].functionIndex = undefined;
        token.childs[i].auxSimValue = undefined;
        buildLinks(token.childs[i], token);
    }
}
function storeStringOnHeap(simEnv, str) {
    var ret = simEnv.heapTop;
    //console.log(`store '${str}' on heap at ${ret}`);
    for (var i = 0; i < str.length; i++) {
        simEnv.memory[simEnv.heapTop] = str.charCodeAt(i);
        simEnv.heapTop++;
        if (simEnv.heapTop >= simEnv.memory.length) {
            logError(simEnv.pc.loc, "'".concat(simEnv.pc.txt, "' out of memory!"));
            exit();
        }
    }
    return ret;
}
function readStringFromHeap(simEnv, addr, len) {
    return String.fromCharCode.apply(String, simEnv.memory.slice(addr, addr + len));
}
function storeNumberOnHeap(simEnv, num, address) {
    var addr = address === undefined ? simEnv.heapTop : address;
    for (var i = 0; i < 8; i++) {
        simEnv.memory[addr + i] = num & 255;
        num = num >> 8;
        if (addr + i >= simEnv.memory.length) {
            logError(simEnv.pc.loc, "'".concat(simEnv.pc.txt, "' out of memory!"));
            exit();
        }
    }
    if (address === undefined)
        simEnv.heapTop = addr + 8;
    return addr;
}
function readNumberFromHeap(simEnv, addr) {
    var ret = 0;
    for (var i = 7; i >= 0; i--) {
        ret = (ret << 8) + simEnv.memory[addr + i];
    }
    return ret;
}
function stackPop(simEnv) {
    var ret = simEnv.dataStack.pop();
    if (ret === undefined) {
        logError(simEnv.pc.loc, "'".concat(simEnv.pc.txt, "' stack underflow"));
        exit();
    }
    return ret;
}
function emit(simEnv, code) {
    if (code === 10) {
        console.log(simEnv.buffer);
        simEnv.buffer = "";
    }
    else {
        simEnv.buffer += String.fromCharCode(code);
    }
}
function simLiteral(simEnv, ast) {
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
            var stringToPush = ast.txt;
            if (ast.auxSimValue === undefined) {
                var addr = storeStringOnHeap(simEnv, stringToPush);
                ast.auxSimValue = [addr, stringToPush.length];
            }
            if (ast.auxSimValue instanceof Array && ast.auxSimValue.length === 2) {
                simEnv.dataStack.push(ast.auxSimValue[1]);
                simEnv.dataStack.push(ast.auxSimValue[0]);
            }
            else {
                logError(ast.loc, "'".concat(ast.txt, "' string literal does not have addr/len in auxSimValue"));
                exit();
            }
            break;
        default:
            logError(ast.loc, "pushing type '".concat(humanReadableType(ast.out), "' on the stack is not supported"));
            exit();
    }
}
function localizeToken(token) {
    var loc = token.loc;
    var line = loc.filename in sourceCode ? sourceCode[loc.filename].split("\n")[loc.row - 1] : "<cannot retrieve the source line in file ".concat(loc.filename, ">");
    console.log(line);
    var info = "".concat(humanReadableToken(token.type), " - ").concat(token.txt);
    console.log(" ".repeat(loc.col - 1) + "^ (row: ".concat(loc.row, " col: ").concat(loc.col, ") ").concat(info));
}
function sim(vocabulary, ast, returnOutput) {
    var _a;
    buildLinks(ast, undefined);
    var simEnv = {
        addresses: [],
        buffer: "",
        dataStack: [],
        ctxStack: [],
        retStack: [],
        pc: undefined,
        memory: new Uint8Array(640 * 1024),
        heapTop: 0,
        vars: {},
        returnOutput: returnOutput
    };
    for (var i = 0; i < stringTable.length; i++) {
        var addr = storeStringOnHeap(simEnv, stringTable[i]);
        simEnv.vars["str" + i] = addr;
    }
    var nextToken = function () {
        var _a, _b;
        if (((_a = simEnv.pc) === null || _a === void 0 ? void 0 : _a.sibling) === undefined) {
            // console.log("to the parent");
            simEnv.pc = (_b = simEnv.pc) === null || _b === void 0 ? void 0 : _b.parent;
            return true;
        }
        else {
            // console.log("to the sibling");
            simEnv.pc = simEnv.pc.sibling;
            return false;
        }
    };
    var interpretToken = function (token) {
        // lets' sim for real
        // console.log(`${token.txt}`);
        // console.log(simEnv.dataStack);
        if (token.type === TokenType.LITERAL) {
            //console.log(`Literal ${ast.txt}`);
            simLiteral(simEnv, token);
            //console.log("stack:", simEnv.dataStack);
        }
        else {
            var inst = vocabulary[token.type];
            if (inst.sim) {
                return inst.sim(simEnv, token);
            }
            else {
                logError(token.loc, "'".concat(humanReadableToken(token.type), "' is not simulated yet!"));
                exit();
            }
        }
    };
    var returnedFromChilds = false;
    simEnv.pc = ast;
    while (simEnv.pc !== undefined) {
        // console.log(`Execute ${humanReadableToken(simEnv.pc.type)} ${simEnv.pc.txt}`);
        // localizeToken(simEnv.pc);
        // if (simEnv.pc.txt === "i") {
        //     const vardef = getWordDefinition(simEnv.pc.context, "i");
        //     console.log("vardef offset of i", vardef?.offset);
        // }
        if (!returnedFromChilds) {
            var simToken = true;
            if (simEnv.pc.parent) {
                var parentInst = vocabulary[simEnv.pc.parent.type];
                var tokenIndex = simEnv.pc.index;
                if (tokenIndex === undefined) {
                    logError(simEnv.pc.loc, "'".concat(simEnv.pc.txt, "' does not have an index"));
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
            var inst = vocabulary[simEnv.pc.type];
            if (inst.simPrelude) {
                inst.simPrelude(simEnv, simEnv.pc);
            }
        }
        if (returnedFromChilds || simEnv.pc.childs.length === 0) {
            returnedFromChilds = false;
            var jumpInstruction = interpretToken(simEnv.pc);
            if (jumpInstruction) {
                var tokenToJump = jumpInstruction[0], theNextOne = jumpInstruction[1];
                simEnv.pc = tokenToJump;
                if (theNextOne)
                    returnedFromChilds = nextToken();
            }
            else {
                returnedFromChilds = nextToken();
            }
        }
        else {
            //console.log("to the child");
            simEnv.pc = simEnv.pc.childs[0];
        }
    }
    if (simEnv.buffer !== "")
        emit(simEnv, 10);
    if (returnOutput) {
        var callElement = ast.childs.at(-1);
        if (!callElement) {
            logError({ col: 1, row: 1, filename: "" }, "the call does not return a lit block, btw cannot locate the call either");
            exit();
        }
        if (simEnv.dataStack.length !== 2) {
            logError(callElement.loc, "the call '".concat(callElement.txt, "' does not return a lit block"));
            exit();
        }
        var outType = (_a = getWordDefinition(callElement.context, callElement.txt)) === null || _a === void 0 ? void 0 : _a.out;
        if (outType === undefined) {
            logError(callElement.loc, "the return type of '".concat(callElement.txt, "' is undefined"));
            exit();
        }
        var blockAdd = stackPop(simEnv);
        var blockLen = stackPop(simEnv);
        var ret = [];
        if (outType === "word") {
            ret.push(readStringFromHeap(simEnv, blockAdd, blockLen));
        }
        else {
            for (var i = 0; i < blockLen; i++) {
                var tokenAdd = readNumberFromHeap(simEnv, blockAdd + i * 16);
                var tokenLen = readNumberFromHeap(simEnv, blockAdd + i * 16 + 8);
                ret.push(readStringFromHeap(simEnv, tokenAdd, tokenLen));
            }
        }
        return ret.join(" ");
    }
    return "";
}
var labelIndex = 0;
var stringTable = [];
var functionIndex = 0;
var sourceCode = {};
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var target, action, argFilename, basename, filename, vocabulary, source, program, astProgram, asm, cmd, dasm, dasmStatus, emu, emuStatus, cmd, nasm, nasmStatus, ld, ldStatus, runStatus;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (Deno.args.length !== 3 && Deno.args.length !== 2) {
                        usage();
                        exit();
                    }
                    if (Deno.args[0] !== "c64" && Deno.args[0] !== "freebsd" && Deno.args[0] !== "sim") {
                        console.error("ERROR: in the first parameter you need to specify the target 'c64', 'freebsd' or 'sim': ".concat(Deno.args[0], " is not a valid target"));
                        usage();
                        exit();
                    }
                    if (Deno.args[0] !== "sim" && (Deno.args[1] !== "run" && Deno.args[1] !== "compile")) {
                        console.error("ERROR: in the second parameter you need to specify the action 'run' or 'compile': ".concat(Deno.args[1], " is not a valid argument"));
                        usage();
                        exit();
                    }
                    target = Deno.args[0];
                    action = Deno.args[0] === "sim" ? "sim" : Deno.args[1];
                    argFilename = Deno.args[0] === "sim" ? Deno.args[1] : Deno.args[2];
                    basename = argFilename.substring(0, argFilename.lastIndexOf('.')) || argFilename;
                    filename = absoluteFileName(basename + ".cazz");
                    console.log("Cazzillo Lang: ", target);
                    vocabulary = createVocabulary();
                    return [4 /*yield*/, readFile(filename)];
                case 1:
                    source = _a.sent();
                    return [4 /*yield*/, tokenizer(source, filename, vocabulary)];
                case 2:
                    program = _a.sent();
                    return [4 /*yield*/, parse(vocabulary, program, filename)];
                case 3:
                    astProgram = _a.sent();
                    checkForUnusedCode(astProgram);
                    dumpAst(astProgram);
                    if (action === "sim") {
                        sim(vocabulary, astProgram, false);
                        Deno.exit(0);
                    }
                    buildLinks(astProgram, undefined);
                    dumpAst(astProgram);
                    asm = compile(vocabulary, astProgram, target);
                    if (target === "c64") {
                        optimizeAsm(asm, target);
                        addIndent(asm);
                    }
                    return [4 /*yield*/, Deno.writeTextFile(basename + ".asm", asm.join("\n"))];
                case 4:
                    _a.sent();
                    if (!(target === "c64")) return [3 /*break*/, 8];
                    cmd = ["dasm", basename + ".asm", "-o" + basename + ".prg", "-s" + basename + ".sym"];
                    console.log(cmd.join(" "));
                    dasm = Deno.run({ cmd: cmd });
                    return [4 /*yield*/, dasm.status()];
                case 5:
                    dasmStatus = _a.sent();
                    if (dasmStatus.success === false) {
                        console.log("ERROR: dasm returned an error " + dasmStatus.code);
                        exit();
                    }
                    if (!(action === "run")) return [3 /*break*/, 7];
                    emu = Deno.run({ opt: { stdout: "null" }, cmd: ["x64", "-silent", basename + ".prg"] });
                    return [4 /*yield*/, emu.status()];
                case 6:
                    emuStatus = _a.sent();
                    _a.label = 7;
                case 7:
                    console.log("Done");
                    _a.label = 8;
                case 8:
                    if (!(target === "freebsd")) return [3 /*break*/, 12];
                    cmd = ["nasm", "-f", "elf64", "-w-db-empty", basename + ".asm"];
                    console.log(cmd.join(" "));
                    nasm = Deno.run({ cmd: cmd });
                    return [4 /*yield*/, nasm.status()];
                case 9:
                    nasmStatus = _a.sent();
                    if (nasmStatus.success === false) {
                        console.log("ERROR: nasm returned an error " + nasmStatus.code);
                        exit();
                    }
                    ld = Deno.run({ cmd: ["ld", "-m", "elf_amd64_fbsd", "-o", basename, basename + ".o"] });
                    return [4 /*yield*/, ld.status()];
                case 10:
                    ldStatus = _a.sent();
                    if (ldStatus.success === false) {
                        console.log("ERROR: ld returned an error " + ldStatus.code);
                        exit();
                    }
                    if (!(action === "run")) return [3 /*break*/, 12];
                    Deno.run({ cmd: ["./" + basename] });
                    return [4 /*yield*/, nasm.status()];
                case 11:
                    runStatus = _a.sent();
                    if (runStatus.success === false) {
                        console.log("ERROR: ".concat(basename, " returned an error ").concat(runStatus.code));
                        exit();
                    }
                    _a.label = 12;
                case 12: return [2 /*return*/];
            }
        });
    });
}
await main();
