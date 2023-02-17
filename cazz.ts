enum TokenType {
    VALUE,
    PLUS,
    PRINT,
    FACT,
    TOKEN_COUNT,
}

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

type Token = {
    type: TokenType;
    txt: string;
};

type AST = ASTElement[];

type ASTElement = {
    token: Token;
    instruction: Instruction
    childs: ASTElement[];
};

type Listing = Array<Token>;

function identifyToken(vocabulary: Vocabulary, txt: string): TokenType {
    for (const [tokenType, instr] of vocabulary) {
        if (txt === instr.txt) return tokenType;
    }
    return TokenType.VALUE;
}

function tokenizer(vocabulary: Vocabulary, source: string): Listing {
    return source
        .split(/\s+/)
        .filter((txt) => txt !== "")
        .map((txt) => {
            return {
                type: identifyToken(vocabulary, txt),
                txt,
            };
        });
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
                    const toInsert = {
                        ...childs[0], childs: childs.filter((value, index) => index !== 0)
                    }
                    ast.splice(startPos, 0, toInsert);
                    j = startPos;
                } else if (element.instruction.position === InstructionPosition.INFIX) {
                    const startPos = j - 1;
                    const childs = ast.splice(startPos, element.instruction.arity + 1);
                    const toInsert = {
                        ...childs[1], childs: childs.filter((value, index) => index !== 1)
                    }
                    ast.splice(startPos, 0, toInsert);
                    j = startPos;
                } else if (element.instruction.position === InstructionPosition.POSTFIX) {
                    const startPos = j - element.instruction.arity;
                    const childs = ast.splice(startPos, element.instruction.arity + 1);
                    const toInsert = {
                        ...childs[childs.length - 1], childs: childs.filter((value, index) => index !== childs.length - 1)
                    }
                    ast.splice(startPos, 0, toInsert);
                    j = startPos;
                } else {
                    throw new Error("ERROR: unknown instruction position: " + element.instruction.position);
                }
            }
        }
        console.log("DOPO ITERAZIONE " + i + " pri: " + priority + " --------------");
        dumpAst(ast);        

    }

    return ast;
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

const text = await Deno.readTextFile("esempio.cazz");
const program = tokenizer(vocabulary, text);

const ast = parse(vocabulary, program);
//dumpAst(ast);
