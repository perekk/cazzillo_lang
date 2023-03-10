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
	; 1:4 BYTE VAL 69
	LDA #69
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 1: 1 LIT_WORD a type: void
	JSR POP16
	LDA STACKACCESS
	STA V_a
	; 2:4 STRING VAL CAZZ
	LDA #0
	STA STACKACCESS+1
	LDA #4
	STA STACKACCESS
	JSR PUSH16
	LDA #>str0
	STA STACKACCESS+1
	LDA #<str0
	STA STACKACCESS
	JSR PUSH16
	; 2: 1 LIT_WORD b type: void
	JSR POP16
	LDA STACKACCESS
	STA V_b + 2
	LDA STACKACCESS + 1
	STA V_b + 3
	JSR POP16
	LDA STACKACCESS
	STA V_b
	LDA STACKACCESS + 1
	STA V_b + 1
	; 3:4 BOOL VAL true
	LDA #1
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 3: 1 LIT_WORD c type: void
	JSR POP16
	LDA STACKACCESS
	STA V_c
	; 4:4 NUMBER VAL 420
	LDA #1
	STA STACKACCESS+1
	LDA #164
	STA STACKACCESS
	JSR PUSH16
	; 4: 1 LIT_WORD d type: void
	JSR POP16
	LDA STACKACCESS
	STA V_d
	LDA STACKACCESS + 1
	STA V_d + 1
	TSX
	TXA
	SEC
	SBC #8
	TAX
	TXS
	; 6:8 STRING VAL ILLO
	LDA #0
	STA STACKACCESS+1
	LDA #4
	STA STACKACCESS
	JSR PUSH16
	LDA #>str1
	STA STACKACCESS+1
	LDA #<str1
	STA STACKACCESS
	JSR PUSH16
	; 6: 5 LIT_WORD a type: void
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
	; 7:8 NUMBER VAL 420
	LDA #1
	STA STACKACCESS+1
	LDA #164
	STA STACKACCESS
	JSR PUSH16
	; 7: 5 LIT_WORD b type: void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #5
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
	; 8:8 BYTE VAL 69
	LDA #69
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 8: 5 LIT_WORD c type: void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #7
	TAX
	LDA STACKACCESS
	STA $0100,X
	; 9:8 BOOL VAL false
	LDA #0
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 9: 5 LIT_WORD d type: void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #8
	TAX
	LDA STACKACCESS
	STA $0100,X
	; 10:10 STRING VAL A=
	LDA #0
	STA STACKACCESS+1
	LDA #2
	STA STACKACCESS
	JSR PUSH16
	LDA #>str2
	STA STACKACCESS+1
	LDA #<str2
	STA STACKACCESS
	JSR PUSH16
	; 10: 5 PRIN prin type: void
	JSR PRINT_STRING
	; 10: 18 WORD a type: string
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
	; 10: 12 PRINT print type: void
	JSR PRINT_STRING
	LDA #13
	JSR $FFD2
	; 11:10 STRING VAL B=
	LDA #0
	STA STACKACCESS+1
	LDA #2
	STA STACKACCESS
	JSR PUSH16
	LDA #>str3
	STA STACKACCESS+1
	LDA #<str3
	STA STACKACCESS
	JSR PUSH16
	; 11: 5 PRIN prin type: void
	JSR PRINT_STRING
	; 11: 18 WORD b type: number
	TSX
	TXA
	CLC
	ADC #5
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	JSR PUSH16
	; 11: 12 PRINT print type: void
	JSR POP16
	JSR PRINT_INT
	LDA #13
	JSR $FFD2
	; 12:10 STRING VAL C=
	LDA #0
	STA STACKACCESS+1
	LDA #2
	STA STACKACCESS
	JSR PUSH16
	LDA #>str4
	STA STACKACCESS+1
	LDA #<str4
	STA STACKACCESS
	JSR PUSH16
	; 12: 5 PRIN prin type: void
	JSR PRINT_STRING
	; 12: 18 WORD c type: byte
	TSX
	TXA
	CLC
	ADC #7
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA #0
	STA STACKACCESS + 1
	JSR PUSH16
	; 12: 12 PRINT print type: void
	JSR POP16
	LDA #0
	STA STACKACCESS + 1
	JSR PRINT_INT
	LDA #13
	JSR $FFD2
	; 13:10 STRING VAL D=
	LDA #0
	STA STACKACCESS+1
	LDA #2
	STA STACKACCESS
	JSR PUSH16
	LDA #>str5
	STA STACKACCESS+1
	LDA #<str5
	STA STACKACCESS
	JSR PUSH16
	; 13: 5 PRIN prin type: void
	JSR PRINT_STRING
	; 13: 18 WORD d type: boolean
	TSX
	TXA
	CLC
	ADC #8
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA #0
	STA STACKACCESS + 1
	JSR PUSH16
	; 13: 12 PRINT print type: void
	JSR POP16
	LDA STACKACCESS
	BNE print_true31
	LDA STACKACCESS + 1
	BNE print_true31
	LDA #78 ; 'N'
	JMP print_bool31
print_true31:
	LDA #89 ; 'Y'
print_bool31:
	JSR $FFD2
	LDA #13
	JSR $FFD2
	; 5: 1 BLOCK [...] type: void
	TSX
	TXA
	CLC
	ADC #8
	TAX
	TXS
	; 15:6 STRING VAL A=
	LDA #0
	STA STACKACCESS+1
	LDA #2
	STA STACKACCESS
	JSR PUSH16
	LDA #>str6
	STA STACKACCESS+1
	LDA #<str6
	STA STACKACCESS
	JSR PUSH16
	; 15: 1 PRIN prin type: void
	JSR PRINT_STRING
	; 15: 14 WORD a type: byte
	LDA V_a
	STA STACKACCESS
	LDA #0
	STA STACKACCESS + 1
	JSR PUSH16
	; 15: 8 PRINT print type: void
	JSR POP16
	LDA #0
	STA STACKACCESS + 1
	JSR PRINT_INT
	LDA #13
	JSR $FFD2
	; 16:6 STRING VAL B=
	LDA #0
	STA STACKACCESS+1
	LDA #2
	STA STACKACCESS
	JSR PUSH16
	LDA #>str7
	STA STACKACCESS+1
	LDA #<str7
	STA STACKACCESS
	JSR PUSH16
	; 16: 1 PRIN prin type: void
	JSR PRINT_STRING
	; 16: 14 WORD b type: string
	LDA V_b
	STA STACKACCESS
	LDA V_b + 1
	STA STACKACCESS + 1
	JSR PUSH16
	LDA V_b + 2
	STA STACKACCESS
	LDA V_b + 3
	STA STACKACCESS + 1
	JSR PUSH16
	; 16: 8 PRINT print type: void
	JSR PRINT_STRING
	LDA #13
	JSR $FFD2
	; 17:6 STRING VAL C=
	LDA #0
	STA STACKACCESS+1
	LDA #2
	STA STACKACCESS
	JSR PUSH16
	LDA #>str8
	STA STACKACCESS+1
	LDA #<str8
	STA STACKACCESS
	JSR PUSH16
	; 17: 1 PRIN prin type: void
	JSR PRINT_STRING
	; 17: 14 WORD c type: boolean
	LDA V_c
	STA STACKACCESS
	LDA #0
	STA STACKACCESS + 1
	JSR PUSH16
	; 17: 8 PRINT print type: void
	JSR POP16
	LDA STACKACCESS
	BNE print_true44
	LDA STACKACCESS + 1
	BNE print_true44
	LDA #78 ; 'N'
	JMP print_bool44
print_true44:
	LDA #89 ; 'Y'
print_bool44:
	JSR $FFD2
	LDA #13
	JSR $FFD2
	; 18:6 STRING VAL D=
	LDA #0
	STA STACKACCESS+1
	LDA #2
	STA STACKACCESS
	JSR PUSH16
	LDA #>str9
	STA STACKACCESS+1
	LDA #<str9
	STA STACKACCESS
	JSR PUSH16
	; 18: 1 PRIN prin type: void
	JSR PRINT_STRING
	; 18: 14 WORD d type: number
	LDA V_d
	STA STACKACCESS
	LDA V_d + 1
	STA STACKACCESS + 1
	JSR PUSH16
	; 18: 8 PRINT print type: void
	JSR POP16
	JSR PRINT_INT
	LDA #13
	JSR $FFD2
	; 1: 1 BLOCK [prog] type: void
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
	BCC COPY_NO_CARRY1
	INC FROMADD + 2
COPY_NO_CARRY1:
	INC TOADD + 1
	BCC COPY_NO_CARRY2
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
str0: BYTE 67,65,90,90
str1: BYTE 73,76,76,79
str2: BYTE 65,61
str3: BYTE 66,61
str4: BYTE 67,61
str5: BYTE 68,61
str6: BYTE 65,61
str7: BYTE 66,61
str8: BYTE 67,61
str9: BYTE 68,61
V_a DS 1
V_b DS 4
V_c DS 1
V_d DS 2
HEAPSTART: