	; Prelude for:
	; 1: 1 PROG [prog] type: ()=>void
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
	; 1:15 NUMBER 197
	LDA #0
	STA STACKACCESS+1
	LDA #197
	STA STACKACCESS
	; JSR PUSH16
	; 1: 1 LIT_WORD keyboard_loc type: (number)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_keyboard_loc + 0
	LDA STACKACCESS + 1
	STA V_keyboard_loc + 1
	; 2:7 BOOL false
	LDA #0
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	; JSR PUSH16
	; 2: 1 LIT_WORD quit type: (boolean)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_quit + 0
	; 3:7 STRING "PRESS KEY - Q TO QUIT"
	LDA #0
	STA STACKACCESS+1
	LDA #21
	STA STACKACCESS
	JSR PUSH16
	LDA #>str0
	STA STACKACCESS+1
	LDA #<str0
	STA STACKACCESS
	JSR PUSH16
	; 3: 1 PRINT print type: (string)=>void
	JSR PRINT_STRING
	LDA #13
	JSR $FFD2
startloop39:
	; 4: 7 WORD quit type: ()=>boolean
	LDA V_quit
	STA STACKACCESS
	LDA #0
	STA STACKACCESS + 1
	JSR PUSH16
	; 4: 12 NOT ! type: (boolean)=>boolean
	LDX SP16
	LDA STACKBASE + 1,X
	EOR #$FF
	STA STACKBASE + 1,X
	INC STACKBASE + 1,X
	INC STACKBASE + 1,X
	JSR POP16
	LDA STACKACCESS
	BNE trueblock39
	JMP endblock39 ; if all zero
trueblock39:
	; Prelude for:
; 4: 14 BLOCK [key peek keyboard_loc key [key + 64] !< quit key = 126 if [key = 128] ! [prin YOU PRESSED:  emit key prin  CODE:  prin key print  !]] type: ()=>void
	; reserve 1 on the stack for: key (byte offset 0)
	TSX
	TXA
	SEC
	SBC #1
	TAX
	TXS
	; 5: 15 WORD keyboard_loc type: ()=>number
	LDA V_keyboard_loc
	STA STACKACCESS
	LDA V_keyboard_loc + 1
	STA STACKACCESS + 1
	; JSR PUSH16
	; 5: 10 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	; JSR PUSH16
	; 5: 5 LIT_WORD key type: (byte)=>void
	; JSR POP16
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA STACKACCESS
	STA $0100,X
	; Prelude for:
	; 6: 10 BLOCK [key + 64] type: ()=>number
	; no stack memory to reserve
	; 6: 11 WORD key type: ()=>byte
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA #0
	STA STACKACCESS + 1
	JSR PUSH16
	; 6:17 NUMBER 64
	LDA #0
	STA STACKACCESS+1
	LDA #64
	STA STACKACCESS
	JSR PUSH16
	; 6: 15 PLUS + type: (byte,number)=>number
	LDX SP16
	CLC
	LDA STACKBASE + 1,X
	ADC STACKBASE + 3,X
	STA STACKACCESS
	LDA STACKBASE + 2,X
	ADC STACKBASE + 4,X
	STA STACKACCESS+1
	INX
	INX
	INX
	INX
	STX SP16
	; JSR PUSH16
	; 6: 10 BLOCK [key + 64] type: ()=>number
	; no stack memory to release
	; 6: 21 CAST_BYTE !< type: (number)=>byte
	; 6: 5 SET_WORD key type: (byte)=>void
	; JSR POP16
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA STACKACCESS
	STA $0100,X
	; 7: 11 WORD key type: ()=>byte
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA #0
	STA STACKACCESS + 1
	JSR PUSH16
	; 7:17 NUMBER 126
	LDA #0
	STA STACKACCESS+1
	LDA #126
	STA STACKACCESS
	JSR PUSH16
; 7: 15 EQ = type: (byte,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal19
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal19
	LDA #01
	JMP store19
notequal19:
	LDA #00
store19:
	STA STACKACCESS
	LDA #00
	STA STACKACCESS + 1
	INX
	INX
	INX
	INX
	STX SP16
	; JSR PUSH16
	; 7: 5 SET_WORD quit type: (boolean)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_quit + 0
	; Prelude for:
; 8: 8 BLOCK [key = 128] type: ()=>boolean
	; no stack memory to reserve
	; 8: 9 WORD key type: ()=>byte
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA #0
	STA STACKACCESS + 1
	JSR PUSH16
	; 8:15 NUMBER 128
	LDA #0
	STA STACKACCESS+1
	LDA #128
	STA STACKACCESS
	JSR PUSH16
; 8: 13 EQ = type: (byte,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal23
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal23
	LDA #01
	JMP store23
notequal23:
	LDA #00
store23:
	STA STACKACCESS
	LDA #00
	STA STACKACCESS + 1
	INX
	INX
	INX
	INX
	STX SP16
	JSR PUSH16
; 8: 8 BLOCK [key = 128] type: ()=>boolean
	; no stack memory to release
	; 8: 20 NOT ! type: (boolean)=>boolean
	LDX SP16
	LDA STACKBASE + 1,X
	EOR #$FF
	STA STACKBASE + 1,X
	INC STACKBASE + 1,X
	INC STACKBASE + 1,X
	JSR POP16
	LDA STACKACCESS
	BNE trueblock37
	JMP endblock37 ; if all zero
trueblock37:
	; Prelude for:
	; 8: 22 BLOCK [prin YOU PRESSED:  emit key prin  CODE:  prin key print  !] type: ()=>void
	; no stack memory to reserve
	; 9:14 STRING "YOU PRESSED: "
	LDA #0
	STA STACKACCESS+1
	LDA #13
	STA STACKACCESS
	JSR PUSH16
	LDA #>str1
	STA STACKACCESS+1
	LDA #<str1
	STA STACKACCESS
	JSR PUSH16
	; 9: 9 PRIN prin type: (string)=>void
	JSR PRINT_STRING
	; 10: 14 WORD key type: ()=>byte
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA #0
	STA STACKACCESS + 1
	; JSR PUSH16
	; 10: 9 EMIT emit type: (byte)=>void
	; JSR POP16
	LDA STACKACCESS
	JSR $FFD2
	; 11:14 STRING " CODE: "
	LDA #0
	STA STACKACCESS+1
	LDA #7
	STA STACKACCESS
	JSR PUSH16
	LDA #>str2
	STA STACKACCESS+1
	LDA #<str2
	STA STACKACCESS
	JSR PUSH16
	; 11: 9 PRIN prin type: (string)=>void
	JSR PRINT_STRING
	; 12: 14 WORD key type: ()=>byte
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA #0
	STA STACKACCESS + 1
	; JSR PUSH16
	; 12: 9 PRIN prin type: (byte)=>void
	; JSR POP16
	LDA #0
	STA STACKACCESS + 1
	JSR PRINT_INT
	; 13:15 STRING " !"
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
	; 13: 9 PRINT print type: (string)=>void
	JSR PRINT_STRING
	LDA #13
	JSR $FFD2
	; 8: 22 BLOCK [prin YOU PRESSED:  emit key prin  CODE:  prin key print  !] type: ()=>void
	; no stack memory to release
	; 8: 5 IF if type: (boolean,void)=>void
endblock37:
; 4: 14 BLOCK [key peek keyboard_loc key [key + 64] !< quit key = 126 if [key = 128] ! [prin YOU PRESSED:  emit key prin  CODE:  prin key print  !]] type: ()=>void
	; release 1 on the stack
	TSX
	TXA
	CLC
	ADC #1
	TAX
	TXS
	; 4: 1 WHILE while type: (boolean,void)=>void
	JMP startloop39
endblock39:
	; 1: 1 PROG [prog] type: ()=>void
	RTS
BCD DS 3 ; USED IN BIN TO BCD
HEAPSAVE DS 3 ; USED IN COPYSTRING
AUXMUL DS 2
HEAPTOP DS 2
TEST_UPPER_BIT: BYTE $80
AUX = $7D
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
	LDY #0
	JSR BINBCD16
	LDA BCD+2
	AND #$0F
	BEQ DIGIT2
	TAY
	CLC
	ADC #$30
	JSR $FFD2
DIGIT2:
	LDA BCD+1
	LSR
	LSR
	LSR
	LSR
	BNE DO_DIGIT_2
	CPY #00
	BEQ DIGIT_3
DO_DIGIT_2:
	LDY #1
	CLC
	ADC #$30
	JSR $FFD2
DIGIT_3:
	LDA BCD+1
	AND #$0F
	BNE DO_DIGIT_3
	CPY #00
	BEQ DIGIT_4
DO_DIGIT_3:
	LDY #1
	CLC
	ADC #$30
	JSR $FFD2
DIGIT_4:
	LDA BCD+0
	LSR
	LSR
	LSR
	LSR
	BNE DO_DIGIT_4
	CPY #00
	BEQ DIGIT_5
DO_DIGIT_4:
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
str0: BYTE 80,82,69,83,83,32,75,69,89,32,45,32,81,32,84,79,32,81,85,73,84
str1: BYTE 89,79,85,32,80,82,69,83,83,69,68,58,32
str2: BYTE 32,67,79,68,69,58,32
str3: BYTE 32,33
V_keyboard_loc DS 2
V_quit DS 1
HEAPSTART: