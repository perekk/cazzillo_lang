enum TokenType {
    LITERAL,
    PLUS,
    MINUS,
    MULT,
    DIV,
    MOD,
    PRINT,
    PRIN,
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
    WORD,
    WHILE,
    POKE,
    PEEK,
    CAST_BYTE,
    TOKEN_COUNT
}

enum ValueType {
    NUMBER,
    BYTE,
    STRING,
    BOOL,
    VOID,
    VALUETYPESCOUNT
}

function humanReadableType(t: ValueType | undefined): string {
    if (t === undefined) return "undefined";
    console.assert(ValueType.VALUETYPESCOUNT === 5);
    switch (t) {
        case ValueType.NUMBER: return "number";
        case ValueType.BYTE: return "byte";
        case ValueType.STRING: return "string";
        case ValueType.BOOL: return "boolean";
        case ValueType.VOID: return "void";
    }
    throw new Error("Value Type not defined");
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

type VarsDefinition = Map<string, [ASTElement, ValueType]>;

function getArity(instr: Instruction): number {
    if (instr === undefined) return 0;
    if (instr.position === InstructionPosition.INFIX) return 2;
    if (instr.position === InstructionPosition.POSTFIX) return 1;
    return instr.arity;
}

type Instruction = {
    txt: string;
    arity: number;    
    position: InstructionPosition;
    priority: number | undefined;
    ins: (ast: ASTElement) => Array<ValueType>;
    out: (ast: ASTElement, vars: VarsDefinition) => ValueType;
    generateAsm: (ast: ASTElement, vars: VarsDefinition) => Assembly
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
    console.assert(TokenType.TOKEN_COUNT === 24);
    const voc: Vocabulary = new Map<TokenType, Instruction>();
    voc.set(TokenType.PRINT, {
        txt: "print",
        arity: 1,
        position: InstructionPosition.PREFIX,
        ins: (ast) => {
            if (ast.childs[0].token.valueType === undefined) {
                logError(ast.token.loc, `cannot determine the type of '${ast.token.txt}'`);
                Deno.exit(1);
            }            
            return [ast.childs[0].token.valueType]
        },
        out: () => ValueType.VOID,
        priority: 10,
        generateAsm: (ast) => {
            console.assert(ValueType.VALUETYPESCOUNT === 5);
            if (ast.childs[0].token.valueType === ValueType.NUMBER) {
                return [
                    "JSR POP16",
                    "JSR PRINT_INT",
                    "LDA #13",
                    "JSR $FFD2",
                ];
            } else if (ast.childs[0].token.valueType === ValueType.BYTE) {
                return [
                    "JSR POP16",
                    "LDA #0",
                    "STA STACKACCESS + 1",
                    "JSR PRINT_INT",
                    "LDA #13",
                    "JSR $FFD2",
                ];                
            } else if (ast.childs[0].token.valueType === ValueType.STRING) {
                return [
                    "JSR PRINT_STRING",
                    "LDA #13",
                    "JSR $FFD2",
                ];
            } else if (ast.childs[0].token.valueType === ValueType.BOOL) {
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
            } else {
                logError(ast.token.loc, `print of ${humanReadableType(ast.childs[0].token.valueType)} is not supported`)
                Deno.exit(1);
            }
        }
    });
    voc.set(TokenType.PRIN, {
        txt: "prin",
        arity: 1,
        position: InstructionPosition.PREFIX,
        ins: (ast) => {
            if (ast.childs[0].token.valueType === undefined) {
                logError(ast.token.loc, `cannot determine the type of '${ast.token.txt}'`);
                Deno.exit(1);
            }
            return [ast.childs[0].token.valueType]
        },
        out: () => ValueType.VOID,
        priority: 10,
        generateAsm: (ast) => {
            console.assert(ValueType.VALUETYPESCOUNT === 5);
            if (ast.childs[0].token.valueType === ValueType.NUMBER) {
                return [
                    "JSR POP16",
                    "JSR PRINT_INT",
                ];
            } else if (ast.childs[0].token.valueType === ValueType.BYTE) {
                return [
                    "JSR POP16",
                    "LDA #0",
                    "STA STACKACCESS + 1",
                    "JSR PRINT_INT",
                ];


            } else if (ast.childs[0].token.valueType === ValueType.STRING) {
                return [
                    "JSR PRINT_STRING",
                ];
            } else if (ast.childs[0].token.valueType === ValueType.BOOL) {
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
            } else {
                logError(ast.token.loc, `print of ${humanReadableType(ast.childs[0].token.valueType)} is not supported`)
                Deno.exit(1);
            }
        }
    });
    voc.set(TokenType.NL, {
        txt: "nl",
        arity: 0,
        position: InstructionPosition.PREFIX,
        ins: (ast) => [],
        out: () => ValueType.VOID,
        priority: 10,
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
        ins: (ast) => {
            console.assert(ast.childs.length === 2, "The childs of a plus operand should be 2, compiler error");
            const type1 = ast.childs[0].token.valueType;
            const type2 = ast.childs[1].token.valueType;
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
        ins: (ast) => {
            console.assert(ast.childs.length === 2, "The childs of a minus operand should be 2, compiler error");
            const type1 = ast.childs[0].token.valueType;
            const type2 = ast.childs[1].token.valueType;
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
        ins: (ast) => {
            console.assert(ast.childs.length === 2, "The childs of a multiply operand should be 2, compiler error");
            const type1 = ast.childs[0].token.valueType;
            const type2 = ast.childs[1].token.valueType;
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
        ins: (ast) => {
            console.assert(ast.childs.length === 2, "The childs of a division operand should be 2, compiler error");
            const type1 = ast.childs[0].token.valueType;
            const type2 = ast.childs[1].token.valueType;
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
        ins: (ast) => {
            console.assert(ast.childs.length === 2, "The childs of a plus operand should be 2, compiler error");
            const type1 = ast.childs[0].token.valueType;
            const type2 = ast.childs[1].token.valueType;
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
        ins: () => [ValueType.NUMBER],
        out: () => ValueType.NUMBER,
        generateAsm: (ast) => [
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
    });
    voc.set(TokenType.LT, {
        txt: "<",
        arity: 2,
        position: InstructionPosition.INFIX,
        priority: 70,
        ins: (ast) => {
            console.assert(ast.childs.length === 2, "The childs of a less-than operand should be 2, compiler error");
            const type1 = ast.childs[0].token.valueType;
            const type2 = ast.childs[1].token.valueType;
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
        ins: (ast) => {
            console.assert(ast.childs.length === 2, "The childs of a equal operand should be 2, compiler error");
            const type1 = ast.childs[0].token.valueType;
            const type2 = ast.childs[1].token.valueType;
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
        ins: (ast) => {
            console.assert(ast.childs.length === 2, "The childs of a greater-than operand should be 2, compiler error");
            const type1 = ast.childs[0].token.valueType;
            const type2 = ast.childs[1].token.valueType;
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
        ins: () => [ValueType.BOOL, ValueType.VOID],
        out: () => ValueType.VOID,
        generateChildPreludeAsm: (n) => {
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
        ins: ast => {
            console.assert(ast.childs.length === 3);
            const typeThen = ast.childs[1].token.valueType;
            const typeElse = ast.childs[2].token.valueType;
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
        generateChildPreludeAsm: (n) => {
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
        ins: () => [],
        out: () => ValueType.VOID,
        generateAsm: (ast) => []
    });
    voc.set(TokenType.CLOSE_BRACKETS, {
        txt: "]",
        arity: 0,
        position: InstructionPosition.POSTFIX,
        priority: 150,
        ins: () => [],
        out: () => ValueType.VOID,
        generateAsm: (ast) => []
    });
    voc.set(TokenType.BLOCK, {
        txt: "",
        arity: 0,
        position: InstructionPosition.PREFIX,
        priority: 150,
        ins: (ast) => {
            const childNumber = ast.childs.length;
            if (childNumber === 0) return [];
            return ast.childs.map((child, index) => index === childNumber - 1 ? child.token.valueType! : ValueType.VOID);
        },
        out: (ast) => {
            if (ast.childs.length === 0) return ValueType.VOID;
            const lastChild = ast.childs[ast.childs.length - 1];
            if (lastChild.token.valueType === undefined) {
                logError(lastChild.token.loc, `cannot determine the type of '${lastChild.token.txt}'`);
                Deno.exit(1);
            }
            return lastChild.token.valueType;
        },
        generateAsm: (ast) => []
    });
    voc.set(TokenType.SET_WORD, {
        txt: "",
        arity: 1,
        position: InstructionPosition.PREFIX,
        priority: 10,
        ins: (ast) => {
            console.assert(ast.childs.length === 1);
            const child = ast.childs[0];
            if (child.token.valueType === undefined) {
                logError(child.token.loc, `cannot determine the type of '${child.token.txt}'`);
                Deno.exit(1);
            }
            if (child.token.valueType === ValueType.VOID) {
                logError(ast.token.loc, `can't store 'void' values in variables`);
                Deno.exit(1);
            }
            return [child.token.valueType];
        },
        out: () => ValueType.VOID,
        generateAsm: (ast, vars) => {
            const varName = ast.token.txt;
            const variable = vars.get(varName);
            if (variable === undefined) {
                logError(ast.token.loc, `cannot find declaration for '${varName}', typechecker error`);
                Deno.exit(1);
            }
            const varType = variable[1];
            const asmVarName = "V_" + varName;
            console.assert(ValueType.VALUETYPESCOUNT === 5);
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
                        `LDA #0`,
                        `STA ${asmVarName} + 1`,
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

                default:
                    logError(ast.token.loc, `cannot compile asm to retrieve value for '${varName}' of '${humanReadableType(varType)}' type`);
                    Deno.exit(1);
            }
        },
    });
    voc.set(TokenType.WORD, {
        txt: "",
        arity: 0,
        position: InstructionPosition.PREFIX,
        priority: 10,
        ins: () => [],
        out: (ast, vars) => {
            if (vars.has(ast.token.txt)) {
                const declaration = vars.get(ast.token.txt)!;
                return declaration[1];
            }
            logError(ast.token.loc, `unknown token '${ast.token.txt}'`);
            Deno.exit(1);
        },
        generateAsm: (ast, vars) => {
            const varName = ast.token.txt;
            const variable = vars.get(varName);
            if (variable === undefined) {
                logError(ast.token.loc, `cannot find declaration for '${varName}', typechecker error`);
                Deno.exit(1);
            }
            const varType = variable[1];
            const asmVarName = "V_" + varName;
            console.assert(ValueType.VALUETYPESCOUNT === 5);
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

                default:
                    logError(ast.token.loc, `cannot compile asm to retrieve value for '${varName}' of '${humanReadableType(varType)}' type`);
                    Deno.exit(1);
            }
        }
    });
    voc.set(TokenType.WHILE, {
        txt: "while",
        arity: 2,
        position: InstructionPosition.PREFIX,
        priority: 10,
        ins: () => [ValueType.BOOL, ValueType.VOID],
        out: () => ValueType.VOID,
        generateChildPreludeAsm: (n) => {
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
        txt: "!>",
        arity: 1,
        position: InstructionPosition.POSTFIX,
        priority: 100,
        ins: () => [ValueType.NUMBER],
        out: () => ValueType.BYTE,
        generateAsm: (ast) => [
            "LDX SP16",
            "LDA #0",
            "STA STACKBASE + 2,X"
        ]
    });    

    return voc;
}

function logError(loc: Location, msg: string) {
    const line = sourceCode.split("\n")[loc.row - 1];
    console.log(line);
    console.log(" ".repeat(loc.col - 1) + "^");
    console.error(loc.filename + ":" + loc.row + ":" + loc.col + " ERROR: " + msg);
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
    if (txt[txt.length - 1] === ':') return { type: TokenType.SET_WORD, literalType: undefined };
    if (txt === "true" || txt === "false") return { type: TokenType.LITERAL, literalType: ValueType.BOOL };

    return { type: TokenType.WORD, literalType: undefined };
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
            } else if (char === "[") {
                const loc = { row, col, filename };
                ret.push({ type: TokenType.OPEN_BRACKETS, txt: "[", loc, });
            } else if (char === "]") {
                if (tokenStart > -1) {
                    // space but was parsing a word
                    pushToken(sourceCode.substring(tokenStart, index));
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
                while (index < sourceCode.length && sourceCode[index] !== '"') index++;

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

function groupFunctionToken(ast: AST, index: number) {
    const functionElement = ast[index];
    const functionPosition = functionElement.instruction.position;
    let childs: AST;
    let startPos: number;
    if (functionPosition === InstructionPosition.INFIX) {
        if (index + 1 > ast.length - 1) {
            logError(functionElement.token.loc, `the operator ${functionElement.instruction.txt} expexts 2 parameters, but one got!`);
            Deno.exit(1);
        }
        // check the second parameter 
        const secondParameterArity = getArity(ast[index + 1].instruction);
        if (secondParameterArity > 0 && ast[index + 1].childs.length !== secondParameterArity) {
            groupFunctionToken(ast, index + 1);
        }
        childs = [ast[index - 1], ast[index + 1]];
        startPos = index - 1;
    } else if (functionPosition === InstructionPosition.POSTFIX) {
        childs = [ast[index - 1]];
        startPos = index - 1;
    } else {
        const arity = getArity(functionElement.instruction);
        childs = ast.slice(index + 1, index + 1 + arity);
        if (childs.length !== arity) {
            logError(functionElement.token.loc, `the function ${functionElement.instruction.txt} expexts ${arity} parameters, but only ${childs.length - 1} got!`);
            Deno.exit(1);
        }
        startPos = index;
    }
    childs.forEach(child => child.parent = functionElement);
    const toInsert = { ...functionElement, childs };
    ast.splice(startPos, childs.length + 1, toInsert);
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
            const arity = getArity(element.instruction);
            if (!element.instruction || arity === 0) continue;
            if (element.token.type === TokenType.LITERAL) continue;
            if (element.token.type === TokenType.OPEN_BRACKETS || element.token.type === TokenType.CLOSE_BRACKETS) {
                logError(element.token.loc, `found open or closed brackets in parse, this should not happen`);
                Deno.exit(1);
            }
            if (element.instruction.priority !== priority) continue;

            // fixme: expression 1 + peek a does not get parsed correctly
            groupFunctionToken(ast, j);
            if (element.instruction.position !== InstructionPosition.PREFIX) j = j - 1; // we already taken as child the token before this
        }
    }

    return ast;
}

function traverseAST(ast: AST | ASTElement, f: (ast: ASTElement) => void) {
    if (ast instanceof Array) {
        for (let i = 0; i < ast.length; i++) {
            traverseAST(ast[i], f);
        }
    } else {
        for (let i = 0; i < ast.childs.length; i++) {
            traverseAST(ast.childs[i], f);
        }
        f.call({}, ast);
    }
}

function calculateTypes(ast: AST | ASTElement): VarsDefinition {
    const ret: VarsDefinition = new Map();
    traverseAST(ast, element => {
        if (element.token.valueType !== undefined) return;
        const typesExpected = element.instruction.ins(element);
        if (typesExpected.length !== element.childs.length) {
            dumpAst(ast);
            logError(element.token.loc, `the number of parameters expected for '${element.token.txt}' is ${typesExpected.length} but got ${element.childs.length}`);
            Deno.exit(1);
        }
        for (let i = 0; i < typesExpected.length; i++) {
            if (typesExpected[i] !== element.childs[i].token.valueType) {
                logError(element.childs[i].token.loc, `The parameter of ${element.token.txt} in position ${i + 1} is expected to be ${humanReadableType(typesExpected[i])} but got ${humanReadableType(element.childs[i].token.valueType!)}`);
                Deno.exit(1);
            }
        }
        element.token.valueType = element.instruction.out(element, ret);
        if (element.token.type === TokenType.SET_WORD) ret.set(element.token.txt, [element, element.instruction.ins(element)[0]]);
    });
    return ret;
}

let labelIndex = 0;
let stringTable: string[] = [];

function compile(ast: AST | ASTElement, setWords: VarsDefinition): Assembly {
    if (ast instanceof Array) {
        let ret: Assembly = [];
        for (let i = 0; i < ast.length; i++) {
            const asm = compile(ast[i], setWords);
            ret = ret.concat(asm)
        }
        return ret;
    } else {
        let ret: Assembly = [];

        for (let i = 0; i < ast.childs.length; i++) {
            if (ast.instruction.generateChildPreludeAsm) {
                ret = ret.concat(ast.instruction.generateChildPreludeAsm(i));
            }
            ret = ret.concat(compile(ast.childs[i], setWords))
        }

        // lets' compile for real        
        if (ast.token.type === TokenType.LITERAL) {
            console.assert(ValueType.VALUETYPESCOUNT === 5);
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

            }
        } else {
            ret.push(`; ${ast.token.loc.row}:${ast.token.loc.col} ${ast.token.txt}`);
            ret = ret.concat(ast.instruction.generateAsm(ast, setWords));
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

function asmFooter(setwords: VarsDefinition): Assembly {
    const lib = [
        "RTS",
        "BCD DS 3 ; USED IN BIN TO BCD",
        "AUXMUL DS 2",
        "TEST_UPPER_BIT: BYTE $80",
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
    setwords.forEach((value, key) => {
        const variableName = "V_" + key;
        if (value[0].instruction.ins.length === 0) {
            logError(value[0].token.loc, `cannot determine the value type stored in word '${value[0].token.txt}', it does not have inputs value types`);
            Deno.exit(1);
        }
        console.assert(ValueType.VALUETYPESCOUNT === 5);
        const valueType = value[1];
        if (valueType === ValueType.VOID) {
            logError(value[0].token.loc, "cannot reserve memory for VOID value type");
            Deno.exit(1);
        }
        if (valueType === ValueType.NUMBER) {
            vars.push(`${variableName} DS 2`);
        }
        if (valueType === ValueType.BYTE) {
            vars.push(`${variableName} DS 1`);
        }
        if (valueType === ValueType.STRING) {
            vars.push(`${variableName} DS 4`);
        }
        if (valueType === ValueType.BOOL) {
            vars.push(`${variableName} DS 1`);
        }

    });

    return lib.concat(literalStrings).concat(vars);
}

function dumpProgram(program: Listing) {
    console.log(`-------------------`);
    for (let i = 0; i < program.length; i++) {
        const token = program[i];
        //logError(token.loc, `istr: ${token.type}, ${token.txt}`)
        console.log(token);
    }
}

function dumpAst(ast: AST | ASTElement, prefix = "") {
    const astToDump = ast instanceof Array ? ast : [ast];
    astToDump.forEach(element => {
        //console.log(prefix, element.token, );
        const ins = element.childs.map(child => humanReadableType(child.token.valueType!)).join(", ");
        const out = humanReadableType(element.token.valueType!);
        console.log(prefix, element.token.txt + " (" + ins + ")=>" + out + " parent:" + element.parent?.token.txt);
        dumpAst(element.childs, prefix + "    ");
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

console.log(Deno.args)

const argFilename = Deno.args[0];
const basename = argFilename.substring(0, argFilename.lastIndexOf('.')) || argFilename;
const filename = basename + ".cazz";

console.log("start");
const vocabulary = createVocabulary();
const program = await tokenizer(filename, vocabulary);
const ast = parseWithBrackets(vocabulary, program);

const setWords = calculateTypes(ast);
dumpAst(ast);

const asm = asmHeader().concat(compile(ast, setWords)).concat(asmFooter(setWords));
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


