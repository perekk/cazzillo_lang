	processor 6502 ; TEH BEAST
	ORG $0801 ; BASIC STARTS HERE
	HEX 0C 08 0A 00 9E 20 32 30 36 34 00 00 00
	ORG $0810 ; MY PROGRAM STARTS HERE
	; INIT HEAP
	LDA #<HEAPSTART
	STA HEAPTOP
	LDA #>HEAPSTART
	STA HEAPTOP+1
	JSR INITSTACK
	; Prelude for:
	; 1: 1 BLOCK [prog] type: ()=>void
	; Prelude for:
	; 1: 10 REF_BLOCK :[x Number x + 1] type: ()=>number
	JMP AFTER_0
CALL_0:
	; reserve 2 on the stack for: x (number offset 0)
	TSX
	TXA
	SEC
	SBC #2
	TAX
	TXS
	; 1: 15 NUMBER Number type: ()=>number
	; DO NOTHING
	; 1: 12 LIT_WORD x type: (number)=>void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
	; 1: 22 WORD x type: ()=>number
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	JSR PUSH16
	; 1:26 NUMBER 1
	LDA #0
	STA STACKACCESS+1
	LDA #1
	STA STACKACCESS
	JSR PUSH16
	; 1: 24 PLUS + type: (number,number)=>number
	JSR ADD16
	; 1: 10 REF_BLOCK :[x Number x + 1] type: ()=>number
	; release 2 on the stack
	TSX
	TXA
	CLC
	ADC #2
	TAX
	TXS
	RTS
AFTER_0:
	LDA #<CALL_0
	STA STACKACCESS
	LDA #>CALL_0
	STA STACKACCESS + 1
	JSR PUSH16
	; 1: 1 LIT_WORD plusone type: (addr)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_plusone
	LDA STACKACCESS + 1
	STA V_plusone + 1
	; 2:15 NUMBER 11
	LDA #0
	STA STACKACCESS+1
	LDA #11
	STA STACKACCESS
	JSR PUSH16
	; 2: 7 WORD plusone type: ()=>number
	LDA V_plusone
	STA CALL_FUN_8 + 1
	LDA V_plusone + 1
	STA CALL_FUN_8 + 2
CALL_FUN_8:
	JSR $1111 ; will be overwritten
	; 2: 1 PRINT print type: (number)=>void
	JSR POP16
	JSR PRINT_INT
	LDA #13
	JSR $FFD2
	; Prelude for:
	; 4: 9 REF_BLOCK :[name String print HELLO  . name] type: ()=>void
	JMP AFTER_1
CALL_1:
	; reserve 4 on the stack for: name (string offset 0)
	TSX
	TXA
	SEC
	SBC #4
	TAX
	TXS
	; 4: 17 STRING String type: ()=>string
	; 4: 11 LIT_WORD name type: (string)=>void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA STACKACCESS
	STA $0102,X
	LDA STACKACCESS + 1
	STA $0103,X
	TXA
	PHA
	JSR POP16
	PLA
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
	; 4:30 STRING "HELLO "
	LDA #0
	STA STACKACCESS+1
	LDA #6
	STA STACKACCESS
	JSR PUSH16
	LDA #>str0
	STA STACKACCESS+1
	LDA #<str0
	STA STACKACCESS
	JSR PUSH16
	; 4: 41 WORD name type: ()=>string
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	TXA
	PHA
	JSR PUSH16
	PLA
	TAX
	LDA $0102,X
	STA STACKACCESS
	LDA $0103,X
	STA STACKACCESS + 1
	JSR PUSH16
	; 4: 39 STR_JOIN . type: (string,string)=>string
	NOP
	NOP
	NOP
	LDA HEAPTOP
	STA HEAPSAVE
	LDA HEAPTOP+1
	STA HEAPSAVE+1
	LDX SP16
	LDA STACKBASE + 5,X
	STA FROMADD + 1
	LDA STACKBASE + 6,X
	STA FROMADD + 2
	LDA HEAPTOP
	STA TOADD + 1
	LDA HEAPTOP + 1
	STA TOADD + 2
	LDA STACKBASE + 7,X
	STA HEAPSAVE + 2
	TAY
	JSR COPYMEM
	LDA STACKBASE + 1,X
	STA FROMADD + 1
	LDA STACKBASE + 2,X
	STA FROMADD + 2
	LDX SP16
	LDA STACKBASE + 3,X
	TAY
	CLC
	ADC HEAPSAVE + 2
	STA HEAPSAVE + 2
	JSR COPYMEM
	LDA TOADD+1
	STA HEAPTOP
	LDA TOADD+2
	STA HEAPTOP+1
	LDA SP16
	ADC #8
	STA SP16
	LDA HEAPSAVE+2
	STA STACKACCESS
	LDA #0
	STA STACKACCESS + 1
	JSR PUSH16
	LDA HEAPSAVE
	STA STACKACCESS
	LDA HEAPSAVE+1
	STA STACKACCESS+1
	JSR PUSH16
	; 4: 24 PRINT print type: (string)=>void
	JSR PRINT_STRING
	LDA #13
	JSR $FFD2
	; 4: 9 REF_BLOCK :[name String print HELLO  . name] type: ()=>void
	; release 4 on the stack
	TSX
	TXA
	CLC
	ADC #4
	TAX
	TXS
	RTS
AFTER_1:
	LDA #<CALL_1
	STA STACKACCESS
	LDA #>CALL_1
	STA STACKACCESS + 1
	JSR PUSH16
	; 4: 1 LIT_WORD salute type: (addr)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_salute
	LDA STACKACCESS + 1
	STA V_salute + 1
	; 5:8 STRING "WORLD"
	LDA #0
	STA STACKACCESS+1
	LDA #5
	STA STACKACCESS
	JSR PUSH16
	LDA #>str1
	STA STACKACCESS+1
	LDA #<str1
	STA STACKACCESS
	JSR PUSH16
	; 5: 1 WORD salute type: ()=>void
	LDA V_salute
	STA CALL_FUN_19 + 1
	LDA V_salute + 1
	STA CALL_FUN_19 + 2
CALL_FUN_19:
	JSR $1111 ; will be overwritten
	; Prelude for:
	; 7: 10 REF_BLOCK :[69] type: ()=>number
	JMP AFTER_2
CALL_2:
	; no stack memory to reserve
	; 7:12 NUMBER 69
	LDA #0
	STA STACKACCESS+1
	LDA #69
	STA STACKACCESS
	JSR PUSH16
	; 7: 10 REF_BLOCK :[69] type: ()=>number
	; no stack memory to release
	RTS
AFTER_2:
	LDA #<CALL_2
	STA STACKACCESS
	LDA #>CALL_2
	STA STACKACCESS + 1
	JSR PUSH16
	; 7: 1 LIT_WORD get_num type: (addr)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_get_num
	LDA STACKACCESS + 1
	STA V_get_num + 1
	; Prelude for:
	; 9: 8 REF_BLOCK :[] type: ()=>void
	JMP AFTER_3
CALL_3:
	; no stack memory to reserve
	; 9: 8 REF_BLOCK :[] type: ()=>void
	; no stack memory to release
	RTS
AFTER_3:
	LDA #<CALL_3
	STA STACKACCESS
	LDA #>CALL_3
	STA STACKACCESS + 1
	JSR PUSH16
	; 9: 1 LIT_WORD empty type: (addr)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_empty
	LDA STACKACCESS + 1
	STA V_empty + 1
	; Prelude for:
	; 12: 13 REF_BLOCK :[x Number y Number x + y * y] type: ()=>number
	JMP AFTER_4
CALL_4:
	; reserve 4 on the stack for: x (number offset 0), y (number offset 2)
	TSX
	TXA
	SEC
	SBC #4
	TAX
	TXS
	; 12: 28 NUMBER Number type: ()=>number
	; DO NOTHING
	; 12: 25 LIT_WORD y type: (number)=>void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #3
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
	; 12: 18 NUMBER Number type: ()=>number
	; DO NOTHING
	; 12: 15 LIT_WORD x type: (number)=>void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
	; 12: 35 WORD x type: ()=>number
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	JSR PUSH16
	; 12: 39 WORD y type: ()=>number
	TSX
	TXA
	CLC
	ADC #3
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	JSR PUSH16
	; 12: 43 WORD y type: ()=>number
	TSX
	TXA
	CLC
	ADC #3
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	JSR PUSH16
	; 12: 41 MULT * type: (number,number)=>number
	JSR MUL16
	; 12: 37 PLUS + type: (number,number)=>number
	JSR ADD16
	; 12: 13 REF_BLOCK :[x Number y Number x + y * y] type: ()=>number
	; release 4 on the stack
	TSX
	TXA
	CLC
	ADC #4
	TAX
	TXS
	RTS
AFTER_4:
	LDA #<CALL_4
	STA STACKACCESS
	LDA #>CALL_4
	STA STACKACCESS + 1
	JSR PUSH16
	; 12: 1 LIT_WORD sumandmult type: (addr)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_sumandmult
	LDA STACKACCESS + 1
	STA V_sumandmult + 1
	; 13:18 NUMBER 3
	LDA #0
	STA STACKACCESS+1
	LDA #3
	STA STACKACCESS
	JSR PUSH16
	; 13:20 NUMBER 4
	LDA #0
	STA STACKACCESS+1
	LDA #4
	STA STACKACCESS
	JSR PUSH16
	; 13: 7 WORD sumandmult type: ()=>number
	LDA V_sumandmult
	STA CALL_FUN_38 + 1
	LDA V_sumandmult + 1
	STA CALL_FUN_38 + 2
CALL_FUN_38:
	JSR $1111 ; will be overwritten
	; 13: 1 PRINT print type: (number)=>void
	JSR POP16
	JSR PRINT_INT
	LDA #13
	JSR $FFD2
	; 1: 1 BLOCK [prog] type: ()=>void
	RTS
BCD DS 3 ; USED IN BIN TO BCD
HEAPSAVE DS 3 ; USED IN COPYSTRING
AUXMUL DS 2
HEAPTOP DS 2
TEST_UPPER_BIT: BYTE $80
SP16 = $7F
STACKACCESS = $0080
STACKBASE = $0000
COPYMEM:
	TYA
	BEQ ENDCOPY
FROMADD:
	LDA $1111
TOADD:
	STA $1111
	INC FROMADD + 1
	BNE COPY_NO_CARRY1
	INC FROMADD + 2
COPY_NO_CARRY1:
	INC TOADD + 1
	BNE COPY_NO_CARRY2
	INC TOADD + 2
COPY_NO_CARRY2:
	DEY
	BNE COPYMEM
ENDCOPY:
	RTS
PRINT_STRING:
	JSR POP16
	LDX SP16
	LDA STACKBASE + 1,X; LEN
	INX
	INX
	STX SP16
	TAX; NOW IN X WE HAVE THE LEN
	BEQ EXIT_PRINT_STR
	LDY #0
LOOP_PRINT_STRING:
	LDA (STACKACCESS),Y
	JSR $FFD2
	INY
	DEX
	BNE LOOP_PRINT_STRING
EXIT_PRINT_STR:
	RTS
	; stack.a65 from https://github.com/dourish/mitemon/blob/master/stack.a65
INITSTACK:
	LDX #$FF
	STX SP16
	RTS
PUSH16:
	LDX SP16
	LDA STACKACCESS + 1
	STA STACKBASE,X
	DEX
	LDA STACKACCESS
	STA STACKBASE,X
	DEX
	STX SP16
	RTS
POP16:
	LDX SP16
	LDA STACKBASE + 1,X
	STA STACKACCESS
	INX
	LDA STACKBASE + 1,X
	STA STACKACCESS + 1
	INX
	STX SP16
	RTS
DUP16:
	LDX SP16
	LDA STACKBASE + 2,X
	STA STACKBASE,X
	DEX
	LDA STACKBASE + 2,X
	STA STACKBASE,X
	DEX
	STX SP16
	RTS
SWAP16:
	LDX SP16
	LDA STACKBASE + 2,X
	STA STACKBASE,X
	DEX
	LDA STACKBASE + 2,X
	STA STACKBASE,X
	DEX
	LDA STACKBASE + 5,X
	STA STACKBASE + 3,X
	LDA STACKBASE + 6,X
	STA STACKBASE + 4,X
	LDA STACKBASE + 1,X
	STA STACKBASE + 5,X
	LDA STACKBASE + 2,X
	STA STACKBASE + 6,X
	INX
	INX
	STX SP16
	RTS
ADD16:
	LDX SP16
	CLC
	LDA STACKBASE + 1,X;
	ADC STACKBASE + 3,X
	STA STACKBASE + 3,X
	LDA STACKBASE + 2,X
	ADC STACKBASE + 4,X
	STA STACKBASE + 4,X
	INX
	INX
	STX SP16
	RTS
SUB16:
	LDX SP16
	SEC
	LDA STACKBASE + 3,X
	SBC STACKBASE + 1,X
	STA STACKBASE + 3,X
	LDA STACKBASE + 4,X
	SBC STACKBASE + 2,X
	STA STACKBASE + 4,X
	INX
	INX
	STX SP16
	RTS
BINBCD16: SED
	LDA #0
	STA BCD + 0
	STA BCD + 1
	STA BCD + 2
	LDX #16
CNVBIT: ASL STACKACCESS + 0
	ROL STACKACCESS + 1
	LDA BCD + 0
	ADC BCD + 0
	STA BCD + 0
	LDA BCD + 1
	ADC BCD + 1
	STA BCD + 1
	LDA BCD + 2
	ADC BCD + 2
	STA BCD + 2
	DEX
	BNE CNVBIT
	CLD
	RTS
PRINT_INT:
	JSR BINBCD16
	LDA BCD+2
	TAY
	BEQ DIGIT2
	AND #$0F
	CLC
	ADC #$30
	JSR $FFD2
DIGIT2:
	LDA BCD+1
	LSR
	LSR
	LSR
	LSR
	BNE PRINT_DIGIT_2
	CPY #00
	BEQ DIGIT_3
PRINT_DIGIT_2:
	TAY
	CLC
	ADC #$30
	JSR $FFD2
DIGIT_3:
	LDA BCD+1
	AND #$0F
	BNE PRINT_DIGIT_3
	CPY #00
	BEQ DIGIT_4
PRINT_DIGIT_3:
	TAY
	CLC
	ADC #$30
	JSR $FFD2
DIGIT_4:
	LDA BCD+0
	LSR
	LSR
	LSR
	LSR
	BNE PRINT_DIGIT_4
	CPY #00
	BEQ DIGIT_5
PRINT_DIGIT_4:
	TAY
	CLC
	ADC #$30
	JSR $FFD2
DIGIT_5:
	LDA BCD+0
	AND #$0F
	CLC
	ADC #$30
	JSR $FFD2
	RTS
MUL16:
	LDX SP16
	LDA STACKBASE + 3,X    ; Get the multiplicand and
	STA AUXMUL             ; put it in the scratchpad.
	LDA STACKBASE + 4,X
	STA AUXMUL + 1
	PHA
	LDA #0
	STA STACKBASE + 3       ; Zero - out the original multiplicand area
	STA STACKBASE + 4
	PLA
	LDY #$10                ; We'll loop 16 times.
shift_loop:
	ASL STACKBASE + 3,X     ; Shift the entire 32 bits over one bit position.
	ROL STACKBASE + 4,X
	ROL STACKBASE + 1,X
	ROL STACKBASE + 2,X
	BCC skip_add            ; Skip the adding -in to the result if the high bit shifted out was 0
	CLC                     ; Else, add multiplier to intermediate result.
	LDA AUXMUL
	ADC STACKBASE + 3,X
	STA STACKBASE + 3,X
	LDA AUXMUL + 1
	ADC STACKBASE + 4,X
	STA STACKBASE + 4,X
	LDA #0
	ADC STACKBASE + 1,X
	STA STACKBASE + 1,X
skip_add:
	DEY                      ; If we haven't done 16 iterations yet,
	BNE  shift_loop          ; then go around again.
	INX
	INX
	STX SP16
	RTS
	; https://www.ahl27.com/posts/2022/12/SIXTH-div/
DIV16WITHMOD:
;; MAX ITERATIONS IS 16 = 0X10, SINCE WE HAVE 16 BIT NUMBERS
	LDX SP16
	LDY #$10
	;; ADD TWO SPACES ON STACK
	DEX
	DEX
	DEX
	DEX
	LDA #0
	STA STACKBASE + 1,X; REMAINDER
	STA STACKBASE + 2,X
	STA STACKBASE + 3,X; QUOTIENT
	STA STACKBASE + 4,X
	; +5 - 6 IS DENOMINATOR
	; +7 - 8 IS NUMERATOR
	;; SET UP THE NUMERATOR
	LDA #0
	ORA STACKBASE + 8,X
	ORA STACKBASE + 7,X
	BEQ EARLYEXIT
	;; CHECKING IS DENOMINATOR IS ZERO(IF SO WE'LL JUST STORE ZEROS)
	LDA #0
	ORA STACKBASE + 6,X
	ORA STACKBASE + 5,X
	BNE DIVMODLOOP1
EARLYEXIT:
	;; NUMERATOR OR DENOMINATOR ARE ZERO, JUST RETURN
	LDA #0
	STA STACKBASE + 6,X
	STA STACKBASE + 5,X
	INX
	INX
	INX
	INX
	RTS
	;; TRIM DOWN TO LEADING BIT
DIVMODLOOP1:
	LDA STACKBASE + 8,X
	BIT TEST_UPPER_BIT
	BNE END
	CLC
	ASL STACKBASE + 7,X
	ROL STACKBASE + 8,X
	DEY
	JMP DIVMODLOOP1
END:
	;; MAIN DIVISION LOOP
DIVMODLOOP2:
	;; LEFT - SHIFT THE REMAINDER
	CLC
	ASL STACKBASE + 1,X         
	ROL STACKBASE + 2,X
	;; LEFT - SHIFT THE QUOTIENT
	CLC
	ASL STACKBASE + 3,X
	ROL STACKBASE + 4,X
	;; SET LEAST SIGNIFICANT BIT TO BIT I OF NUMERATOR
	CLC
	ASL STACKBASE + 7,X
	ROL STACKBASE + 8,X
	LDA STACKBASE + 1,X
	ADC #0
	STA STACKBASE + 1,X
	LDA STACKBASE + 2,X
	ADC #0
	STA STACKBASE + 2,X
	;; COMPARE REMAINDER TO DENOMINATOR
	; UPPER BYTE(STACKBASE + 2 IS ALREADY IN A)
	CMP STACKBASE + 6,X
	BMI SKIP; IF R < D, SKIP TO NEXT ITERATION 
	BNE SUBTRACT; IF R > D, WE CAN SKIP COMPARING LOWER BYTE
; IF R = D, WE HAVE TO CHECK THE LOWER BYTE
	; LOWER BYTE
	LDA STACKBASE + 1,X
	CMP STACKBASE + 5,X
	BMI SKIP
SUBTRACT:
	;; SUBTRACT DENOMINATOR FROM REMAINDER
	SEC
	; SUBTRACT LOWER BYTE
	LDA STACKBASE + 1,X
	SBC STACKBASE + 5,X
	STA STACKBASE + 1,X
	; SUBTRACT UPPER BYTE
	LDA STACKBASE + 2,X
	SBC STACKBASE + 6,X
	STA STACKBASE + 2,X
	;; ADD ONE TO QUOTIENT
	INC STACKBASE + 3,X
SKIP:
	DEY
	BEQ EXIT
	JMP DIVMODLOOP2
EXIT:  
	;; CLEANUP
	LDA STACKBASE + 1,X
	STA STACKBASE + 5,X
	LDA STACKBASE + 2,X
	STA STACKBASE + 6,X
	LDA STACKBASE + 3,X
	STA STACKBASE + 7,X
	LDA STACKBASE + 4,X
	STA STACKBASE + 8,X
	INX
	INX
	INX
	INX
	RTS
DIV16:
	JSR DIV16WITHMOD
	INX
	INX
	RTS
MOD16:
	JSR DIV16WITHMOD
	LDA STACKBASE + 1,X
	STA STACKBASE + 3,X
	LDA STACKBASE + 2,X
	STA STACKBASE + 4,X
	INX
	INX
	RTS
MALLOC:
	CLC
	ADC HEAPTOP
	STA HEAPTOP
	BCC NOCARRY
	INC HEAPTOP+1
NOCARRY:
	LDA HEAPTOP
	STA STACKACCESS
	LDA HEAPTOP + 1
	STA STACKACCESS + 1
	JSR PUSH16
	RTS
str0: BYTE 72,69,76,76,79,32
str1: BYTE 87,79,82,76,68
V_plusone DS 2
V_salute DS 2
V_get_num DS 2
V_empty DS 2
V_sumandmult DS 2
HEAPSTART: