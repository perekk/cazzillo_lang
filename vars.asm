	processor 6502 ; TEH BEAST
	ORG $0801 ; BASIC STARTS HERE
	HEX 0C 08 0A 00 9E 20 32 30 36 34 00 00 00
	ORG $0810 ; MY PROGRAM STARTS HERE
	JSR INITSTACK
	; 1:4 STRING VAL CAZZ
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
	; 1:1 a
	JSR POP16
	LDA STACKACCESS
	STA V_a + 2
	LDA STACKACCESS + 1
	STA V_a + 3
	JSR POP16
	LDA STACKACCESS
	STA V_a
	LDA STACKACCESS + 1
	STA V_a + 1
	; 2:4 NUMBER VAL 4234
	LDA #16
	STA STACKACCESS+1
	LDA #138
	STA STACKACCESS
	JSR PUSH16
	; 2:1 b
	JSR POP16
	LDA STACKACCESS
	STA V_b
	LDA STACKACCESS + 1
	STA V_b + 1
	; 3:4 BYTE VAL 123
	LDA #123
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 3:10 b
	LDA V_b
	STA STACKACCESS
	LDA V_b + 1
	STA STACKACCESS + 1
	JSR PUSH16
	; 3:8 +
	JSR ADD16
	; 3:1 c
	JSR POP16
	LDA STACKACCESS
	STA V_c
	LDA STACKACCESS + 1
	STA V_c + 1
	; 4:4 BYTE VAL 2
	LDA #2
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 4:8 BYTE VAL 2
	LDA #2
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 4:6 =
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal10
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal10
	LDA #01
	JMP store10
notequal10:
	LDA #00
store10:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2
	STX SP16
	; 4:1 d
	JSR POP16
	LDA STACKACCESS
	STA V_d
	; 5:4 BYTE VAL 1
	LDA #1
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 5:6 !
	LDX SP16
	LDA STACKBASE + 1,X
	EOR #$FF
	STA STACKBASE + 1,X
	INC STACKBASE + 1,X
	INC STACKBASE + 1,X
	; 5:1 e
	JSR POP16
	LDA STACKACCESS
	STA V_e
	LDA STACKACCESS + 1
	STA V_e + 1
	; 7:8 a
	LDA V_a
	STA STACKACCESS
	LDA V_a + 1
	STA STACKACCESS + 1
	JSR PUSH16
	LDA V_a + 2
	STA STACKACCESS
	LDA V_a + 3
	STA STACKACCESS + 1
	JSR PUSH16
	; 7:2 print
	JSR PRINT_STRING
	LDA #13
	JSR $FFD2
	; 7:16 b
	LDA V_b
	STA STACKACCESS
	LDA V_b + 1
	STA STACKACCESS + 1
	JSR PUSH16
	; 7:10 print
	JSR POP16
	JSR PRINT_INT
	LDA #13
	JSR $FFD2
	; 7:24 c
	LDA V_c
	STA STACKACCESS
	LDA V_c + 1
	STA STACKACCESS + 1
	JSR PUSH16
	; 7:18 print
	JSR POP16
	JSR PRINT_INT
	LDA #13
	JSR $FFD2
	; 7:32 d
	LDA V_d
	STA STACKACCESS
	LDA #0
	STA STACKACCESS + 1
	JSR PUSH16
	; 7:26 print
	JSR POP16
	LDA STACKACCESS
	BNE print_true22
	LDA STACKACCESS + 1
	BNE print_true22
	LDA #78 ; 'N'
	JMP print_bool22
print_true22:
	LDA #89 ; 'Y'
print_bool22:
	JSR $FFD2
	LDA #13
	JSR $FFD2
	; 7:40 e
	LDA V_e
	STA STACKACCESS
	LDA V_e + 1
	STA STACKACCESS + 1
	JSR PUSH16
	; 7:34 print
	JSR POP16
	JSR PRINT_INT
	LDA #13
	JSR $FFD2
	; 7:2 [...]
	; 9:11 BYTE VAL 4
	LDA #4
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 9:15 BYTE VAL 1
	LDA #1
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 9:13 +
	JSR ADD16
	; 9:19 BYTE VAL 1
	LDA #1
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 9:17 =
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal30
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal30
	LDA #01
	JMP store30
notequal30:
	LDA #00
store30:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2
	STX SP16
	; 9:5 print
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
	; 9:21 STRING VAL ILLO
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
	; 9:5 [...]
	; 9:1 f
	JSR POP16
	LDA STACKACCESS
	STA V_f + 2
	LDA STACKACCESS + 1
	STA V_f + 3
	JSR POP16
	LDA STACKACCESS
	STA V_f
	LDA STACKACCESS + 1
	STA V_f + 1
	; 10:7 f
	LDA V_f
	STA STACKACCESS
	LDA V_f + 1
	STA STACKACCESS + 1
	JSR PUSH16
	LDA V_f + 2
	STA STACKACCESS
	LDA V_f + 3
	STA STACKACCESS + 1
	JSR PUSH16
	; 10:1 print
	JSR PRINT_STRING
	LDA #13
	JSR $FFD2
	RTS
BCD DS 3 ; USED IN BIN TO BCD
AUXMUL DS 2
TEST_UPPER_BIT: BYTE $80
SP16 = $7D
STACKACCESS = $0080
STACKBASE = $0000
PRINT_STRING:
	JSR POP16
	LDX SP16
	LDA STACKBASE + 1,X; LEN
	INX
	INX
	STX SP16
	TAX; IN X WE HAVE THE LEN
	LDY #0
LOOP_PRINT_STRING:
	LDA (STACKACCESS),Y
	JSR $FFD2
	INY
	DEX
	BNE LOOP_PRINT_STRING
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
str0: BYTE 67,65,90,90
str1: BYTE 73,76,76,79
V_a DS 4
V_b DS 2
V_c DS 2
V_d DS 1
V_e DS 2
V_f DS 4