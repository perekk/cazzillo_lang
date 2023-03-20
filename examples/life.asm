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
	; Prelude for:
	; 9: 7 REF_BLOCK :[[256 * peek 161] + peek 162] type: ()=>addr
	JMP AFTER_0
CALL_0:
	; no stack memory to reserve
	; Prelude for:
	; 9: 9 BLOCK [256 * peek 161] type: ()=>number
	; no stack memory to reserve
	; 9:11 NUMBER 256
	LDA #1
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	JSR PUSH16
	; 9:22 NUMBER 161
	LDA #0
	STA STACKACCESS+1
	LDA #161
	STA STACKACCESS
	; JSR PUSH16
	; 9: 17 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
	; 9: 15 MULT * type: (number,byte)=>number
	JSR MUL16
	; 9: 9 BLOCK [256 * peek 161] type: ()=>number
	; no stack memory to release
	; 9:34 NUMBER 162
	LDA #0
	STA STACKACCESS+1
	LDA #162
	STA STACKACCESS
	; JSR PUSH16
	; 9: 29 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
	; 9: 27 PLUS + type: (number,byte)=>number
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
	JSR PUSH16
	; 9: 7 REF_BLOCK :[[256 * peek 161] + peek 162] type: ()=>addr
	; no stack memory to release
	RTS
AFTER_0:
	LDA #<CALL_0
	STA STACKACCESS
	LDA #>CALL_0
	STA STACKACCESS + 1
	; JSR PUSH16
	; 9: 1 LIT_WORD time type: (addr)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_time + 0
	LDA STACKACCESS + 1
	STA V_time + 1
	; Prelude for:
	; 11: 7 REF_BLOCK :[value Byte j 10000 while j < 10000 + 10 * 10 [poke j value inc j]] type: ()=>addr
	JMP AFTER_1
CALL_1:
	; reserve 3 on the stack for: value (byte offset 0), j (number offset 1)
	TSX
	TXA
	SEC
	SBC #3
	TAX
	TXS
	; 11: 16 BYTE Byte type: ()=>byte
	; DO NOTHING
	; 11: 9 LIT_WORD value type: (byte)=>void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA STACKACCESS
	STA $0100,X
	; 5:18 NUMBER 10000
	LDA #39
	STA STACKACCESS+1
	LDA #16
	STA STACKACCESS
	; JSR PUSH16
	; 12: 5 LIT_WORD j type: (number)=>void
	; JSR POP16
	TSX
	TXA
	CLC
	ADC #2
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
startloop22:
	; 13: 11 WORD j type: ()=>number
	TSX
	TXA
	CLC
	ADC #2
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	JSR PUSH16
	; 13:28 NUMBER 10100
	LDA #39
	STA STACKACCESS+1
	LDA #116
	STA STACKACCESS
	JSR PUSH16
	; 13: 13 LT < type: (number,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BCC less16
	BNE greaterorequal16
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BCC less16
greaterorequal16:
	LDA #00
	JMP store16
less16:
	LDA #01
store16:
	STA STACKACCESS
	LDA #00
	STA STACKACCESS + 1
	INX
	INX
	INX
	INX
	STX SP16
	; JSR PUSH16
	; JSR POP16
	LDA STACKACCESS
	BNE trueblock22
	JMP endblock22 ; if all zero
trueblock22:
	; Prelude for:
	; 13: 41 BLOCK [poke j value inc j] type: ()=>void
	; no stack memory to reserve
	; 14: 12 WORD j type: ()=>number
	TSX
	TXA
	CLC
	ADC #2
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	JSR PUSH16
	; 14: 14 WORD value type: ()=>byte
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
	; 14: 7 POKE poke type: (number,byte)=>void
	; JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; no child generation for 'inc'
	; 15: 7 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #2
	TAX
	INC $0100,X
	BNE not_carry_20
	INC $0101,X
not_carry_20:
	; 13: 41 BLOCK [poke j value inc j] type: ()=>void
	; no stack memory to release
	; 13: 5 WHILE while type: (boolean,void)=>void
	JMP startloop22
endblock22:
	; 11: 7 REF_BLOCK :[value Byte j 10000 while j < 10000 + 10 * 10 [poke j value inc j]] type: ()=>addr
	; release 3 on the stack
	TSX
	TXA
	CLC
	ADC #3
	TAX
	TXS
	RTS
AFTER_1:
	LDA #<CALL_1
	STA STACKACCESS
	LDA #>CALL_1
	STA STACKACCESS + 1
	; JSR PUSH16
	; 11: 1 LIT_WORD fill type: (addr)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_fill + 0
	LDA STACKACCESS + 1
	STA V_fill + 1
	; Prelude for:
	; 19: 7 REF_BLOCK :[fill 32 !< poke 10000 + 2 81 !< poke 10000 + 10 81 !< poke 10000 + 10 + 2 81 !< poke 10000 + 10 + 10 + 1 81 !< poke 10000 + 10 + 10 + 2 81 !<] type: ()=>addr
	JMP AFTER_2
CALL_2:
	; no stack memory to reserve
	; 7:19 BYTE 32
	LDA #32
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 20: 5 WORD fill type: ()=>void
	LDA V_fill
	STA CALL_FUN_26 + 1
	LDA V_fill + 1
	STA CALL_FUN_26 + 2
CALL_FUN_26:
	JSR $1111 ; will be overwritten
	; 22:23 NUMBER 10002
	LDA #39
	STA STACKACCESS+1
	LDA #18
	STA STACKACCESS
	JSR PUSH16
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	; JSR PUSH16
	; 22: 5 POKE poke type: (number,byte)=>void
	; JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 23:23 NUMBER 10010
	LDA #39
	STA STACKACCESS+1
	LDA #26
	STA STACKACCESS
	JSR PUSH16
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	; JSR PUSH16
	; 23: 5 POKE poke type: (number,byte)=>void
	; JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 24:23 NUMBER 10012
	LDA #39
	STA STACKACCESS+1
	LDA #28
	STA STACKACCESS
	JSR PUSH16
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	; JSR PUSH16
	; 24: 5 POKE poke type: (number,byte)=>void
	; JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 25:23 NUMBER 10021
	LDA #39
	STA STACKACCESS+1
	LDA #37
	STA STACKACCESS
	JSR PUSH16
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	; JSR PUSH16
	; 25: 5 POKE poke type: (number,byte)=>void
	; JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 26:23 NUMBER 10022
	LDA #39
	STA STACKACCESS+1
	LDA #38
	STA STACKACCESS
	JSR PUSH16
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	; JSR PUSH16
	; 26: 5 POKE poke type: (number,byte)=>void
	; JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 19: 7 REF_BLOCK :[fill 32 !< poke 10000 + 2 81 !< poke 10000 + 10 81 !< poke 10000 + 10 + 2 81 !< poke 10000 + 10 + 10 + 1 81 !< poke 10000 + 10 + 10 + 2 81 !<] type: ()=>addr
	; no stack memory to release
	RTS
AFTER_2:
	LDA #<CALL_2
	STA STACKACCESS
	LDA #>CALL_2
	STA STACKACCESS + 1
	; JSR PUSH16
	; 19: 1 LIT_WORD init type: (addr)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_init + 0
	LDA STACKACCESS + 1
	STA V_init + 1
	; Prelude for:
; 31: 7 REF_BLOCK :[buffer 10000 screen 1024 col 0 while buffer < 10000 + 10 * 10 [poke screen peek buffer inc buffer inc screen inc col if col = 10 [screen screen + 40 - 10 col 0]]] type: ()=>addr
	JMP AFTER_3
CALL_3:
	; reserve 6 on the stack for: buffer (number offset 0), screen (number offset 2), col (number offset 4)
	TSX
	TXA
	SEC
	SBC #6
	TAX
	TXS
	; 5:18 NUMBER 10000
	LDA #39
	STA STACKACCESS+1
	LDA #16
	STA STACKACCESS
	; JSR PUSH16
	; 32: 5 LIT_WORD buffer type: (number)=>void
	; JSR POP16
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
	; 4:18 NUMBER 1024
	LDA #4
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	; JSR PUSH16
	; 33: 5 LIT_WORD screen type: (number)=>void
	; JSR POP16
	TSX
	TXA
	CLC
	ADC #3
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
	; 34:10 NUMBER 0
	LDA #0
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	; JSR PUSH16
	; 34: 5 LIT_WORD col type: (number)=>void
	; JSR POP16
	TSX
	TXA
	CLC
	ADC #5
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
startloop72:
	; 36: 11 WORD buffer type: ()=>number
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
	; 36:33 NUMBER 10100
	LDA #39
	STA STACKACCESS+1
	LDA #116
	STA STACKACCESS
	JSR PUSH16
	; 36: 18 LT < type: (number,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BCC less52
	BNE greaterorequal52
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BCC less52
greaterorequal52:
	LDA #00
	JMP store52
less52:
	LDA #01
store52:
	STA STACKACCESS
	LDA #00
	STA STACKACCESS + 1
	INX
	INX
	INX
	INX
	STX SP16
	; JSR PUSH16
	; JSR POP16
	LDA STACKACCESS
	BNE trueblock72
	JMP endblock72 ; if all zero
trueblock72:
	; Prelude for:
; 36: 46 BLOCK [poke screen peek buffer inc buffer inc screen inc col if col = 10 [screen screen + 40 - 10 col 0]] type: ()=>void
	; no stack memory to reserve
	; 37: 14 WORD screen type: ()=>number
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
	; 37: 26 WORD buffer type: ()=>number
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	; JSR PUSH16
	; 37: 21 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	; JSR PUSH16
	; 37: 9 POKE poke type: (number,byte)=>void
	; JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; no child generation for 'inc'
	; 38: 9 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_57
	INC $0101,X
not_carry_57:
	; no child generation for 'inc'
	; 39: 9 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #3
	TAX
	INC $0100,X
	BNE not_carry_58
	INC $0101,X
not_carry_58:
	; no child generation for 'inc'
	; 40: 9 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #5
	TAX
	INC $0100,X
	BNE not_carry_59
	INC $0101,X
not_carry_59:
	; 41: 12 WORD col type: ()=>number
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
	; 2:11 NUMBER 10
	LDA #0
	STA STACKACCESS+1
	LDA #10
	STA STACKACCESS
	JSR PUSH16
; 41: 16 EQ = type: (number,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal62
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal62
	LDA #01
	JMP store62
notequal62:
	LDA #00
store62:
	STA STACKACCESS
	LDA #00
	STA STACKACCESS + 1
	INX
	INX
	INX
	INX
	STX SP16
	; JSR PUSH16
	; JSR POP16
	LDA STACKACCESS
	BNE trueblock70
	JMP endblock70 ; if all zero
trueblock70:
	; Prelude for:
	; 41: 24 BLOCK [screen screen + 40 - 10 col 0] type: ()=>void
	; no stack memory to reserve
	; 41: 33 WORD screen type: ()=>number
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
	; 41:45 NUMBER 30
	LDA #0
	STA STACKACCESS+1
	LDA #30
	STA STACKACCESS
	JSR PUSH16
	; 41: 40 PLUS + type: (number,number)=>number
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
	; 41: 25 SET_WORD screen type: (number)=>void
	; JSR POP16
	TSX
	TXA
	CLC
	ADC #3
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
	; 41:58 NUMBER 0
	LDA #0
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	; JSR PUSH16
	; 41: 53 SET_WORD col type: (number)=>void
	; JSR POP16
	TSX
	TXA
	CLC
	ADC #5
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
	; 41: 24 BLOCK [screen screen + 40 - 10 col 0] type: ()=>void
	; no stack memory to release
	; 41: 9 IF if type: (boolean,void)=>void
endblock70:
; 36: 46 BLOCK [poke screen peek buffer inc buffer inc screen inc col if col = 10 [screen screen + 40 - 10 col 0]] type: ()=>void
	; no stack memory to release
	; 36: 5 WHILE while type: (boolean,void)=>void
	JMP startloop72
endblock72:
; 31: 7 REF_BLOCK :[buffer 10000 screen 1024 col 0 while buffer < 10000 + 10 * 10 [poke screen peek buffer inc buffer inc screen inc col if col = 10 [screen screen + 40 - 10 col 0]]] type: ()=>addr
	; release 6 on the stack
	TSX
	TXA
	CLC
	ADC #6
	TAX
	TXS
	RTS
AFTER_3:
	LDA #<CALL_3
	STA STACKACCESS
	LDA #>CALL_3
	STA STACKACCESS + 1
	; JSR PUSH16
	; 31: 1 LIT_WORD show type: (addr)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_show + 0
	LDA STACKACCESS + 1
	STA V_show + 1
	; Prelude for:
; 45: 20 REF_BLOCK :[index Number n 0 !< index index - 41 if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] index index + 38 if 81 !< = peek index [inc n] inc index inc index if 81 !< = peek index [inc n] index index + 38 if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] n] type: ()=>addr
	JMP AFTER_4
CALL_4:
	; reserve 3 on the stack for: index (number offset 0), n (byte offset 2)
	TSX
	TXA
	SEC
	SBC #3
	TAX
	TXS
	; 45: 29 NUMBER Number type: ()=>number
	; DO NOTHING
	; 45: 22 LIT_WORD index type: (number)=>void
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
	; 46:10 BYTE 0
	LDA #0
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	; JSR PUSH16
	; 46: 5 LIT_WORD n type: (byte)=>void
	; JSR POP16
	TSX
	TXA
	CLC
	ADC #3
	TAX
	LDA STACKACCESS
	STA $0100,X
	; 47: 12 WORD index type: ()=>number
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
	; 47:20 NUMBER 41
	LDA #0
	STA STACKACCESS+1
	LDA #41
	STA STACKACCESS
	JSR PUSH16
	; 47: 18 MINUS - type: (number,number)=>number
	JSR SUB16
	; 47: 5 SET_WORD index type: (number)=>void
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
	; no child generation for '='
	; 48: 25 WORD index type: ()=>number
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	; JSR PUSH16
	; 48: 20 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 48: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 1,X
	CMP #<81
	BNE notequal85
	LDA #01
	JMP store85
notequal85:
	LDA #00
store85:
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	JSR POP16
	LDA STACKACCESS
	BNE trueblock88
	JMP endblock88 ; if all zero
trueblock88:
	; Prelude for:
	; 48: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 48: 32 INC inc type: (byte)=>void
	TSX
	TXA
	CLC
	ADC #3
	TAX
	INC $0100,X
	; 48: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 48: 5 IF if type: (boolean,void)=>void
endblock88:
	; no child generation for 'inc'
	; 49: 5 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_89
	INC $0101,X
not_carry_89:
	; no child generation for '='
	; 50: 25 WORD index type: ()=>number
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	; JSR PUSH16
	; 50: 20 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 50: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 1,X
	CMP #<81
	BNE notequal92
	LDA #01
	JMP store92
notequal92:
	LDA #00
store92:
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	JSR POP16
	LDA STACKACCESS
	BNE trueblock95
	JMP endblock95 ; if all zero
trueblock95:
	; Prelude for:
	; 50: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 50: 32 INC inc type: (byte)=>void
	TSX
	TXA
	CLC
	ADC #3
	TAX
	INC $0100,X
	; 50: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 50: 5 IF if type: (boolean,void)=>void
endblock95:
	; no child generation for 'inc'
	; 51: 5 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_96
	INC $0101,X
not_carry_96:
	; no child generation for '='
	; 52: 25 WORD index type: ()=>number
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	; JSR PUSH16
	; 52: 20 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 52: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 1,X
	CMP #<81
	BNE notequal99
	LDA #01
	JMP store99
notequal99:
	LDA #00
store99:
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	JSR POP16
	LDA STACKACCESS
	BNE trueblock102
	JMP endblock102 ; if all zero
trueblock102:
	; Prelude for:
	; 52: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 52: 32 INC inc type: (byte)=>void
	TSX
	TXA
	CLC
	ADC #3
	TAX
	INC $0100,X
	; 52: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 52: 5 IF if type: (boolean,void)=>void
endblock102:
	; 54: 12 WORD index type: ()=>number
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
	; 54:20 NUMBER 38
	LDA #0
	STA STACKACCESS+1
	LDA #38
	STA STACKACCESS
	JSR PUSH16
	; 54: 18 PLUS + type: (number,number)=>number
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
	; 54: 5 SET_WORD index type: (number)=>void
	; JSR POP16
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
	; no child generation for '='
	; 55: 25 WORD index type: ()=>number
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	; JSR PUSH16
	; 55: 20 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 55: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 1,X
	CMP #<81
	BNE notequal109
	LDA #01
	JMP store109
notequal109:
	LDA #00
store109:
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	JSR POP16
	LDA STACKACCESS
	BNE trueblock112
	JMP endblock112 ; if all zero
trueblock112:
	; Prelude for:
	; 55: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 55: 32 INC inc type: (byte)=>void
	TSX
	TXA
	CLC
	ADC #3
	TAX
	INC $0100,X
	; 55: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 55: 5 IF if type: (boolean,void)=>void
endblock112:
	; no child generation for 'inc'
	; 56: 5 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_113
	INC $0101,X
not_carry_113:
	; no child generation for 'inc'
	; 57: 5 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_114
	INC $0101,X
not_carry_114:
	; no child generation for '='
	; 58: 25 WORD index type: ()=>number
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	; JSR PUSH16
	; 58: 20 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 58: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 1,X
	CMP #<81
	BNE notequal117
	LDA #01
	JMP store117
notequal117:
	LDA #00
store117:
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	JSR POP16
	LDA STACKACCESS
	BNE trueblock120
	JMP endblock120 ; if all zero
trueblock120:
	; Prelude for:
	; 58: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 58: 32 INC inc type: (byte)=>void
	TSX
	TXA
	CLC
	ADC #3
	TAX
	INC $0100,X
	; 58: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 58: 5 IF if type: (boolean,void)=>void
endblock120:
	; 60: 12 WORD index type: ()=>number
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
	; 60:20 NUMBER 38
	LDA #0
	STA STACKACCESS+1
	LDA #38
	STA STACKACCESS
	JSR PUSH16
	; 60: 18 PLUS + type: (number,number)=>number
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
	; 60: 5 SET_WORD index type: (number)=>void
	; JSR POP16
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
	; no child generation for '='
	; 61: 25 WORD index type: ()=>number
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	; JSR PUSH16
	; 61: 20 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 61: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 1,X
	CMP #<81
	BNE notequal127
	LDA #01
	JMP store127
notequal127:
	LDA #00
store127:
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	JSR POP16
	LDA STACKACCESS
	BNE trueblock130
	JMP endblock130 ; if all zero
trueblock130:
	; Prelude for:
	; 61: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 61: 32 INC inc type: (byte)=>void
	TSX
	TXA
	CLC
	ADC #3
	TAX
	INC $0100,X
	; 61: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 61: 5 IF if type: (boolean,void)=>void
endblock130:
	; no child generation for 'inc'
	; 62: 5 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_131
	INC $0101,X
not_carry_131:
	; no child generation for '='
	; 63: 25 WORD index type: ()=>number
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	; JSR PUSH16
	; 63: 20 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 63: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 1,X
	CMP #<81
	BNE notequal134
	LDA #01
	JMP store134
notequal134:
	LDA #00
store134:
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	JSR POP16
	LDA STACKACCESS
	BNE trueblock137
	JMP endblock137 ; if all zero
trueblock137:
	; Prelude for:
	; 63: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 63: 32 INC inc type: (byte)=>void
	TSX
	TXA
	CLC
	ADC #3
	TAX
	INC $0100,X
	; 63: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 63: 5 IF if type: (boolean,void)=>void
endblock137:
	; no child generation for 'inc'
	; 64: 5 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_138
	INC $0101,X
not_carry_138:
	; no child generation for '='
	; 65: 25 WORD index type: ()=>number
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	; JSR PUSH16
	; 65: 20 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 65: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 1,X
	CMP #<81
	BNE notequal141
	LDA #01
	JMP store141
notequal141:
	LDA #00
store141:
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	JSR POP16
	LDA STACKACCESS
	BNE trueblock144
	JMP endblock144 ; if all zero
trueblock144:
	; Prelude for:
	; 65: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 65: 32 INC inc type: (byte)=>void
	TSX
	TXA
	CLC
	ADC #3
	TAX
	INC $0100,X
	; 65: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 65: 5 IF if type: (boolean,void)=>void
endblock144:
	; 66: 5 WORD n type: ()=>byte
	TSX
	TXA
	CLC
	ADC #3
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA #0
	STA STACKACCESS + 1
	JSR PUSH16
; 45: 20 REF_BLOCK :[index Number n 0 !< index index - 41 if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] index index + 38 if 81 !< = peek index [inc n] inc index inc index if 81 !< = peek index [inc n] index index + 38 if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] n] type: ()=>addr
	; release 3 on the stack
	TSX
	TXA
	CLC
	ADC #3
	TAX
	TXS
	RTS
AFTER_4:
	LDA #<CALL_4
	STA STACKACCESS
	LDA #>CALL_4
	STA STACKACCESS + 1
	; JSR PUSH16
	; 45: 1 LIT_WORD get_num_alive_old type: (addr)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_get_num_alive_old + 0
	LDA STACKACCESS + 1
	STA V_get_num_alive_old + 1
	; 72:6 BYTE 0
	LDA #0
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	; JSR PUSH16
	; 72: 1 LIT_WORD n type: (byte)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_n + 0
	; 73:8 NUMBER 0
	LDA #0
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	; JSR PUSH16
	; 73: 1 LIT_WORD index type: (number)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_index + 0
	LDA STACKACCESS + 1
	STA V_index + 1
	; Prelude for:
; 74: 16 REF_BLOCK :[index_to_check Number n 0 !< index index_to_check - 41 if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] index 38 + index if 81 !< = peek index [inc n] inc index inc index if 81 !< = peek index [inc n] index 38 + index if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] n] type: ()=>addr
	JMP AFTER_5
CALL_5:
	; reserve 2 on the stack for: index_to_check (number offset 0)
	TSX
	TXA
	SEC
	SBC #2
	TAX
	TXS
	; 74: 34 NUMBER Number type: ()=>number
	; DO NOTHING
	; 74: 18 LIT_WORD index_to_check type: (number)=>void
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
	; 75:10 BYTE 0
	LDA #0
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	; JSR PUSH16
	; 75: 5 SET_WORD n type: (byte)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_n + 0
	; 76: 12 WORD index_to_check type: ()=>number
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
	; 76:29 NUMBER 41
	LDA #0
	STA STACKACCESS+1
	LDA #41
	STA STACKACCESS
	JSR PUSH16
	; 76: 27 MINUS - type: (number,number)=>number
	JSR SUB16
	; 76: 5 SET_WORD index type: (number)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_index + 0
	LDA STACKACCESS + 1
	STA V_index + 1
	; no child generation for '='
	; 70: 40 WORD index type: ()=>number
	LDA V_index
	STA STACKACCESS
	LDA V_index + 1
	STA STACKACCESS + 1
	; JSR PUSH16
	; 70: 35 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 70: 33 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 1,X
	CMP #<81
	BNE notequal162
	LDA #01
	JMP store162
notequal162:
	LDA #00
store162:
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	JSR POP16
	LDA STACKACCESS
	BNE trueblock165
	JMP endblock165 ; if all zero
trueblock165:
	; Prelude for:
	; 70: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 70: 47 INC inc type: (byte)=>void
	INC V_n
	; 70: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 70: 20 IF if type: (boolean,void)=>void
endblock165:
	; no child generation for 'inc'
	; 78: 5 INC inc type: (number)=>void
	INC V_index
	BNE not_carry_166
	INC V_index + 1
not_carry_166:
	; no child generation for '='
	; 70: 40 WORD index type: ()=>number
	LDA V_index
	STA STACKACCESS
	LDA V_index + 1
	STA STACKACCESS + 1
	; JSR PUSH16
	; 70: 35 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 70: 33 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 1,X
	CMP #<81
	BNE notequal169
	LDA #01
	JMP store169
notequal169:
	LDA #00
store169:
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	JSR POP16
	LDA STACKACCESS
	BNE trueblock172
	JMP endblock172 ; if all zero
trueblock172:
	; Prelude for:
	; 70: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 70: 47 INC inc type: (byte)=>void
	INC V_n
	; 70: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 70: 20 IF if type: (boolean,void)=>void
endblock172:
	; no child generation for 'inc'
	; 80: 5 INC inc type: (number)=>void
	INC V_index
	BNE not_carry_173
	INC V_index + 1
not_carry_173:
	; no child generation for '='
	; 70: 40 WORD index type: ()=>number
	LDA V_index
	STA STACKACCESS
	LDA V_index + 1
	STA STACKACCESS + 1
	; JSR PUSH16
	; 70: 35 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 70: 33 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 1,X
	CMP #<81
	BNE notequal176
	LDA #01
	JMP store176
notequal176:
	LDA #00
store176:
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	JSR POP16
	LDA STACKACCESS
	BNE trueblock179
	JMP endblock179 ; if all zero
trueblock179:
	; Prelude for:
	; 70: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 70: 47 INC inc type: (byte)=>void
	INC V_n
	; 70: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 70: 20 IF if type: (boolean,void)=>void
endblock179:
	; no child generation for '+'
	; 83: 17 WORD index type: ()=>number
	LDA V_index
	STA STACKACCESS
	LDA V_index + 1
	STA STACKACCESS + 1
	JSR PUSH16
	; 83: 15 PLUS + type: (number,number)=>number
	; add number with 38
	LDX SP16
	CLC
	LDA STACKBASE + 1,X
	ADC #<38
	STA STACKBASE + 1,X
	LDA STACKBASE + 2,X
	ADC #>38
	STA STACKBASE + 2,X
	; 83: 5 SET_WORD index type: (number)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_index + 0
	LDA STACKACCESS + 1
	STA V_index + 1
	; no child generation for '='
	; 70: 40 WORD index type: ()=>number
	LDA V_index
	STA STACKACCESS
	LDA V_index + 1
	STA STACKACCESS + 1
	; JSR PUSH16
	; 70: 35 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 70: 33 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 1,X
	CMP #<81
	BNE notequal185
	LDA #01
	JMP store185
notequal185:
	LDA #00
store185:
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	JSR POP16
	LDA STACKACCESS
	BNE trueblock188
	JMP endblock188 ; if all zero
trueblock188:
	; Prelude for:
	; 70: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 70: 47 INC inc type: (byte)=>void
	INC V_n
	; 70: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 70: 20 IF if type: (boolean,void)=>void
endblock188:
	; no child generation for 'inc'
	; 85: 5 INC inc type: (number)=>void
	INC V_index
	BNE not_carry_189
	INC V_index + 1
not_carry_189:
	; no child generation for 'inc'
	; 86: 5 INC inc type: (number)=>void
	INC V_index
	BNE not_carry_190
	INC V_index + 1
not_carry_190:
	; no child generation for '='
	; 70: 40 WORD index type: ()=>number
	LDA V_index
	STA STACKACCESS
	LDA V_index + 1
	STA STACKACCESS + 1
	; JSR PUSH16
	; 70: 35 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 70: 33 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 1,X
	CMP #<81
	BNE notequal193
	LDA #01
	JMP store193
notequal193:
	LDA #00
store193:
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	JSR POP16
	LDA STACKACCESS
	BNE trueblock196
	JMP endblock196 ; if all zero
trueblock196:
	; Prelude for:
	; 70: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 70: 47 INC inc type: (byte)=>void
	INC V_n
	; 70: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 70: 20 IF if type: (boolean,void)=>void
endblock196:
	; no child generation for '+'
	; 89: 17 WORD index type: ()=>number
	LDA V_index
	STA STACKACCESS
	LDA V_index + 1
	STA STACKACCESS + 1
	JSR PUSH16
	; 89: 15 PLUS + type: (number,number)=>number
	; add number with 38
	LDX SP16
	CLC
	LDA STACKBASE + 1,X
	ADC #<38
	STA STACKBASE + 1,X
	LDA STACKBASE + 2,X
	ADC #>38
	STA STACKBASE + 2,X
	; 89: 5 SET_WORD index type: (number)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_index + 0
	LDA STACKACCESS + 1
	STA V_index + 1
	; no child generation for '='
	; 70: 40 WORD index type: ()=>number
	LDA V_index
	STA STACKACCESS
	LDA V_index + 1
	STA STACKACCESS + 1
	; JSR PUSH16
	; 70: 35 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 70: 33 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 1,X
	CMP #<81
	BNE notequal202
	LDA #01
	JMP store202
notequal202:
	LDA #00
store202:
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	JSR POP16
	LDA STACKACCESS
	BNE trueblock205
	JMP endblock205 ; if all zero
trueblock205:
	; Prelude for:
	; 70: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 70: 47 INC inc type: (byte)=>void
	INC V_n
	; 70: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 70: 20 IF if type: (boolean,void)=>void
endblock205:
	; no child generation for 'inc'
	; 91: 5 INC inc type: (number)=>void
	INC V_index
	BNE not_carry_206
	INC V_index + 1
not_carry_206:
	; no child generation for '='
	; 70: 40 WORD index type: ()=>number
	LDA V_index
	STA STACKACCESS
	LDA V_index + 1
	STA STACKACCESS + 1
	; JSR PUSH16
	; 70: 35 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 70: 33 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 1,X
	CMP #<81
	BNE notequal209
	LDA #01
	JMP store209
notequal209:
	LDA #00
store209:
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	JSR POP16
	LDA STACKACCESS
	BNE trueblock212
	JMP endblock212 ; if all zero
trueblock212:
	; Prelude for:
	; 70: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 70: 47 INC inc type: (byte)=>void
	INC V_n
	; 70: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 70: 20 IF if type: (boolean,void)=>void
endblock212:
	; no child generation for 'inc'
	; 93: 5 INC inc type: (number)=>void
	INC V_index
	BNE not_carry_213
	INC V_index + 1
not_carry_213:
	; no child generation for '='
	; 70: 40 WORD index type: ()=>number
	LDA V_index
	STA STACKACCESS
	LDA V_index + 1
	STA STACKACCESS + 1
	; JSR PUSH16
	; 70: 35 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 70: 33 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 1,X
	CMP #<81
	BNE notequal216
	LDA #01
	JMP store216
notequal216:
	LDA #00
store216:
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	JSR POP16
	LDA STACKACCESS
	BNE trueblock219
	JMP endblock219 ; if all zero
trueblock219:
	; Prelude for:
	; 70: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 70: 47 INC inc type: (byte)=>void
	INC V_n
	; 70: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 70: 20 IF if type: (boolean,void)=>void
endblock219:
	; 95: 5 WORD n type: ()=>byte
	LDA V_n
	STA STACKACCESS
	LDA #0
	STA STACKACCESS + 1
	JSR PUSH16
; 74: 16 REF_BLOCK :[index_to_check Number n 0 !< index index_to_check - 41 if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] index 38 + index if 81 !< = peek index [inc n] inc index inc index if 81 !< = peek index [inc n] index 38 + index if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] n] type: ()=>addr
	; release 2 on the stack
	TSX
	TXA
	CLC
	ADC #2
	TAX
	TXS
	RTS
AFTER_5:
	LDA #<CALL_5
	STA STACKACCESS
	LDA #>CALL_5
	STA STACKACCESS + 1
	; JSR PUSH16
	; 74: 1 LIT_WORD get_num_alive type: (addr)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_get_num_alive + 0
	LDA STACKACCESS + 1
	STA V_get_num_alive + 1
	; Prelude for:
; 98: 7 REF_BLOCK :[from_loc 1024 to_loc 10000 col 0 while to_loc < 10000 + 10 * 10 [nalive get_num_alive from_loc cell_state peek from_loc either cell_state = 81 !< [either nalive = 2 [poke to_loc 81 !<] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]]] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]] inc from_loc inc to_loc inc col if col = 10 [from_loc 40 + from_loc - 10 col 0]]] type: ()=>addr
	JMP AFTER_6
CALL_6:
	; reserve 6 on the stack for: from_loc (number offset 0), to_loc (number offset 2), col (number offset 4)
	TSX
	TXA
	SEC
	SBC #6
	TAX
	TXS
	; 4:18 NUMBER 1024
	LDA #4
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	; JSR PUSH16
	; 99: 5 LIT_WORD from_loc type: (number)=>void
	; JSR POP16
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
	; 5:18 NUMBER 10000
	LDA #39
	STA STACKACCESS+1
	LDA #16
	STA STACKACCESS
	; JSR PUSH16
	; 100: 5 LIT_WORD to_loc type: (number)=>void
	; JSR POP16
	TSX
	TXA
	CLC
	ADC #3
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
	; 101:10 NUMBER 0
	LDA #0
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	; JSR PUSH16
	; 101: 5 LIT_WORD col type: (number)=>void
	; JSR POP16
	TSX
	TXA
	CLC
	ADC #5
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
startloop293:
	; 102: 11 WORD to_loc type: ()=>number
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
	; 102:33 NUMBER 10100
	LDA #39
	STA STACKACCESS+1
	LDA #116
	STA STACKACCESS
	JSR PUSH16
	; 102: 18 LT < type: (number,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BCC less231
	BNE greaterorequal231
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BCC less231
greaterorequal231:
	LDA #00
	JMP store231
less231:
	LDA #01
store231:
	STA STACKACCESS
	LDA #00
	STA STACKACCESS + 1
	INX
	INX
	INX
	INX
	STX SP16
	; JSR PUSH16
	; JSR POP16
	LDA STACKACCESS
	BNE trueblock293
	JMP endblock293 ; if all zero
trueblock293:
	; Prelude for:
; 102: 46 BLOCK [nalive get_num_alive from_loc cell_state peek from_loc either cell_state = 81 !< [either nalive = 2 [poke to_loc 81 !<] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]]] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]] inc from_loc inc to_loc inc col if col = 10 [from_loc 40 + from_loc - 10 col 0]] type: ()=>void
	; reserve 2 on the stack for: nalive (byte offset 0), cell_state (byte offset 1)
	TSX
	TXA
	SEC
	SBC #2
	TAX
	TXS
	; 103: 31 WORD from_loc type: ()=>number
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
	; 103: 17 WORD get_num_alive type: ()=>byte
	LDA V_get_num_alive
	STA CALL_FUN_233 + 1
	LDA V_get_num_alive + 1
	STA CALL_FUN_233 + 2
CALL_FUN_233:
	JSR $1111 ; will be overwritten
	; 103: 9 LIT_WORD nalive type: (byte)=>void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA STACKACCESS
	STA $0100,X
	; 104: 26 WORD from_loc type: ()=>number
	TSX
	TXA
	CLC
	ADC #3
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	; JSR PUSH16
	; 104: 21 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	; JSR PUSH16
	; 104: 9 LIT_WORD cell_state type: (byte)=>void
	; JSR POP16
	TSX
	TXA
	CLC
	ADC #2
	TAX
	LDA STACKACCESS
	STA $0100,X
	; 105: 16 WORD cell_state type: ()=>byte
	TSX
	TXA
	CLC
	ADC #2
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA #0
	STA STACKACCESS + 1
	JSR PUSH16
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
; 105: 27 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal240
	LDA #01
	JMP store240
notequal240:
	LDA #00
store240:
	STA STACKACCESS
	LDA #00
	STA STACKACCESS + 1
	INX
	INX
	INX
	INX
	STX SP16
	; JSR PUSH16
	; JSR POP16
	LDA STACKACCESS
	BNE trueblock276
	JMP elseblock276 ; if all zero
trueblock276:
	; Prelude for:
; 105: 39 BLOCK [either nalive = 2 [poke to_loc 81 !<] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]]] type: ()=>void
	; no stack memory to reserve
	; 106: 20 WORD nalive type: ()=>byte
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
	; 106:29 NUMBER 2
	LDA #0
	STA STACKACCESS+1
	LDA #2
	STA STACKACCESS
	JSR PUSH16
; 106: 27 EQ = type: (byte,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal243
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal243
	LDA #01
	JMP store243
notequal243:
	LDA #00
store243:
	STA STACKACCESS
	LDA #00
	STA STACKACCESS + 1
	INX
	INX
	INX
	INX
	STX SP16
	; JSR PUSH16
	; JSR POP16
	LDA STACKACCESS
	BNE trueblock261
	JMP elseblock261 ; if all zero
trueblock261:
	; Prelude for:
	; 106: 31 BLOCK [poke to_loc 81 !<] type: ()=>void
	; no stack memory to reserve
	; 107: 20 WORD to_loc type: ()=>number
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
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	; JSR PUSH16
	; 107: 15 POKE poke type: (number,byte)=>void
	; JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 106: 31 BLOCK [poke to_loc 81 !<] type: ()=>void
	; no stack memory to release
	JMP endblock261
elseblock261:
	; Prelude for:
; 108: 15 BLOCK [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]] type: ()=>void
	; no stack memory to reserve
	; 109: 22 WORD nalive type: ()=>byte
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
	; 109:31 NUMBER 3
	LDA #0
	STA STACKACCESS+1
	LDA #3
	STA STACKACCESS
	JSR PUSH16
; 109: 29 EQ = type: (byte,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal250
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal250
	LDA #01
	JMP store250
notequal250:
	LDA #00
store250:
	STA STACKACCESS
	LDA #00
	STA STACKACCESS + 1
	INX
	INX
	INX
	INX
	STX SP16
	; JSR PUSH16
	; JSR POP16
	LDA STACKACCESS
	BNE trueblock259
	JMP elseblock259 ; if all zero
trueblock259:
	; Prelude for:
	; 109: 33 BLOCK [poke to_loc 81 !<] type: ()=>void
	; no stack memory to reserve
	; 110: 22 WORD to_loc type: ()=>number
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
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	; JSR PUSH16
	; 110: 17 POKE poke type: (number,byte)=>void
	; JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 109: 33 BLOCK [poke to_loc 81 !<] type: ()=>void
	; no stack memory to release
	JMP endblock259
elseblock259:
	; Prelude for:
	; 111: 16 BLOCK [poke to_loc 32 !<] type: ()=>void
	; no stack memory to reserve
	; 112: 22 WORD to_loc type: ()=>number
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
	; 7:19 BYTE 32
	LDA #32
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	; JSR PUSH16
	; 112: 17 POKE poke type: (number,byte)=>void
	; JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 111: 16 BLOCK [poke to_loc 32 !<] type: ()=>void
	; no stack memory to release
	; 109: 15 EITHER either type: (boolean,void,void)=>void
endblock259:
; 108: 15 BLOCK [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]] type: ()=>void
	; no stack memory to release
	; 106: 13 EITHER either type: (boolean,void,void)=>void
endblock261:
; 105: 39 BLOCK [either nalive = 2 [poke to_loc 81 !<] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]]] type: ()=>void
	; no stack memory to release
	JMP endblock276
elseblock276:
	; Prelude for:
; 115: 11 BLOCK [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]] type: ()=>void
	; no stack memory to reserve
	; 116: 20 WORD nalive type: ()=>byte
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
	; 116:29 NUMBER 3
	LDA #0
	STA STACKACCESS+1
	LDA #3
	STA STACKACCESS
	JSR PUSH16
; 116: 27 EQ = type: (byte,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal265
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal265
	LDA #01
	JMP store265
notequal265:
	LDA #00
store265:
	STA STACKACCESS
	LDA #00
	STA STACKACCESS + 1
	INX
	INX
	INX
	INX
	STX SP16
	; JSR PUSH16
	; JSR POP16
	LDA STACKACCESS
	BNE trueblock274
	JMP elseblock274 ; if all zero
trueblock274:
	; Prelude for:
	; 116: 31 BLOCK [poke to_loc 81 !<] type: ()=>void
	; no stack memory to reserve
	; 117: 20 WORD to_loc type: ()=>number
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
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	; JSR PUSH16
	; 117: 15 POKE poke type: (number,byte)=>void
	; JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 116: 31 BLOCK [poke to_loc 81 !<] type: ()=>void
	; no stack memory to release
	JMP endblock274
elseblock274:
	; Prelude for:
	; 118: 15 BLOCK [poke to_loc 32 !<] type: ()=>void
	; no stack memory to reserve
	; 119: 20 WORD to_loc type: ()=>number
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
	; 7:19 BYTE 32
	LDA #32
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	; JSR PUSH16
	; 119: 15 POKE poke type: (number,byte)=>void
	; JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 118: 15 BLOCK [poke to_loc 32 !<] type: ()=>void
	; no stack memory to release
	; 116: 13 EITHER either type: (boolean,void,void)=>void
endblock274:
; 115: 11 BLOCK [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]] type: ()=>void
	; no stack memory to release
	; 105: 9 EITHER either type: (boolean,void,void)=>void
endblock276:
	; no child generation for 'inc'
	; 122: 9 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #3
	TAX
	INC $0100,X
	BNE not_carry_277
	INC $0101,X
not_carry_277:
	; no child generation for 'inc'
	; 123: 9 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #5
	TAX
	INC $0100,X
	BNE not_carry_278
	INC $0101,X
not_carry_278:
	; no child generation for 'inc'
	; 124: 9 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #7
	TAX
	INC $0100,X
	BNE not_carry_279
	INC $0101,X
not_carry_279:
	; 125: 12 WORD col type: ()=>number
	TSX
	TXA
	CLC
	ADC #7
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	JSR PUSH16
	; 2:11 NUMBER 10
	LDA #0
	STA STACKACCESS+1
	LDA #10
	STA STACKACCESS
	JSR PUSH16
; 125: 16 EQ = type: (number,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal282
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal282
	LDA #01
	JMP store282
notequal282:
	LDA #00
store282:
	STA STACKACCESS
	LDA #00
	STA STACKACCESS + 1
	INX
	INX
	INX
	INX
	STX SP16
	; JSR PUSH16
	; JSR POP16
	LDA STACKACCESS
	BNE trueblock291
	JMP endblock291 ; if all zero
trueblock291:
	; Prelude for:
	; 125: 24 BLOCK [from_loc 40 + from_loc - 10 col 0] type: ()=>void
	; no stack memory to reserve
	; no child generation for '+'
	; 125: 40 WORD from_loc type: ()=>number
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
	; 2:11 NUMBER 10
	LDA #0
	STA STACKACCESS+1
	LDA #10
	STA STACKACCESS
	JSR PUSH16
	; 125: 49 MINUS - type: (number,number)=>number
	JSR SUB16
	; 125: 38 PLUS + type: (number,number)=>number
	; add number with 40
	LDX SP16
	CLC
	LDA STACKBASE + 1,X
	ADC #<40
	STA STACKBASE + 1,X
	LDA STACKBASE + 2,X
	ADC #>40
	STA STACKBASE + 2,X
	; 125: 25 SET_WORD from_loc type: (number)=>void
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
	; 125:62 NUMBER 0
	LDA #0
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	; JSR PUSH16
	; 125: 57 SET_WORD col type: (number)=>void
	; JSR POP16
	TSX
	TXA
	CLC
	ADC #7
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
	; 125: 24 BLOCK [from_loc 40 + from_loc - 10 col 0] type: ()=>void
	; no stack memory to release
	; 125: 9 IF if type: (boolean,void)=>void
endblock291:
; 102: 46 BLOCK [nalive get_num_alive from_loc cell_state peek from_loc either cell_state = 81 !< [either nalive = 2 [poke to_loc 81 !<] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]]] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]] inc from_loc inc to_loc inc col if col = 10 [from_loc 40 + from_loc - 10 col 0]] type: ()=>void
	; release 2 on the stack
	TSX
	TXA
	CLC
	ADC #2
	TAX
	TXS
	; 102: 5 WHILE while type: (boolean,void)=>void
	JMP startloop293
endblock293:
; 98: 7 REF_BLOCK :[from_loc 1024 to_loc 10000 col 0 while to_loc < 10000 + 10 * 10 [nalive get_num_alive from_loc cell_state peek from_loc either cell_state = 81 !< [either nalive = 2 [poke to_loc 81 !<] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]]] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]] inc from_loc inc to_loc inc col if col = 10 [from_loc 40 + from_loc - 10 col 0]]] type: ()=>addr
	; release 6 on the stack
	TSX
	TXA
	CLC
	ADC #6
	TAX
	TXS
	RTS
AFTER_6:
	LDA #<CALL_6
	STA STACKACCESS
	LDA #>CALL_6
	STA STACKACCESS + 1
	; JSR PUSH16
	; 98: 1 LIT_WORD step type: (addr)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_step + 0
	LDA STACKACCESS + 1
	STA V_step + 1
	; 129: 8 WORD time type: ()=>number
	LDA V_time
	STA CALL_FUN_296 + 1
	LDA V_time + 1
	STA CALL_FUN_296 + 2
CALL_FUN_296:
	JSR $1111 ; will be overwritten
	; 129: 1 LIT_WORD start type: (number)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_start + 0
	LDA STACKACCESS + 1
	STA V_start + 1
	; 130: 1 WORD init type: ()=>void
	LDA V_init
	STA CALL_FUN_298 + 1
	LDA V_init + 1
	STA CALL_FUN_298 + 2
CALL_FUN_298:
	JSR $1111 ; will be overwritten
	; 132:6 BYTE 0
	LDA #0
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	; JSR PUSH16
	; 132: 1 LIT_WORD i type: (byte)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_i + 0
startloop308:
	; 133: 7 WORD i type: ()=>byte
	LDA V_i
	STA STACKACCESS
	LDA #0
	STA STACKACCESS + 1
	JSR PUSH16
	; 133:11 NUMBER 10
	LDA #0
	STA STACKACCESS+1
	LDA #10
	STA STACKACCESS
	JSR PUSH16
	; 133: 9 LT < type: (byte,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BCC less303
	BNE greaterorequal303
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BCC less303
greaterorequal303:
	LDA #00
	JMP store303
less303:
	LDA #01
store303:
	STA STACKACCESS
	LDA #00
	STA STACKACCESS + 1
	INX
	INX
	INX
	INX
	STX SP16
	; JSR PUSH16
	; JSR POP16
	LDA STACKACCESS
	BNE trueblock308
	JMP endblock308 ; if all zero
trueblock308:
	; Prelude for:
	; 133: 14 BLOCK [show step inc i] type: ()=>void
	; no stack memory to reserve
	; 134: 5 WORD show type: ()=>void
	LDA V_show
	STA CALL_FUN_304 + 1
	LDA V_show + 1
	STA CALL_FUN_304 + 2
CALL_FUN_304:
	JSR $1111 ; will be overwritten
	; 135: 5 WORD step type: ()=>void
	LDA V_step
	STA CALL_FUN_305 + 1
	LDA V_step + 1
	STA CALL_FUN_305 + 2
CALL_FUN_305:
	JSR $1111 ; will be overwritten
	; no child generation for 'inc'
	; 136: 5 INC inc type: (byte)=>void
	INC V_i
	; 133: 14 BLOCK [show step inc i] type: ()=>void
	; no stack memory to release
	; 133: 1 WHILE while type: (boolean,void)=>void
	JMP startloop308
endblock308:
	; 138: 6 WORD time type: ()=>number
	LDA V_time
	STA CALL_FUN_309 + 1
	LDA V_time + 1
	STA CALL_FUN_309 + 2
CALL_FUN_309:
	JSR $1111 ; will be overwritten
	; 138: 1 LIT_WORD end type: (number)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_end + 0
	LDA STACKACCESS + 1
	STA V_end + 1
	; 139: 7 WORD start type: ()=>number
	LDA V_start
	STA STACKACCESS
	LDA V_start + 1
	STA STACKACCESS + 1
	; JSR PUSH16
	; 139: 1 PRINT print type: (number)=>void
	; JSR POP16
	JSR PRINT_INT
	LDA #13
	JSR $FFD2
	; 140: 7 WORD end type: ()=>number
	LDA V_end
	STA STACKACCESS
	LDA V_end + 1
	STA STACKACCESS + 1
	; JSR PUSH16
	; 140: 1 PRINT print type: (number)=>void
	; JSR POP16
	JSR PRINT_INT
	LDA #13
	JSR $FFD2
	; 141:6 STRING "ELAPSED: "
	LDA #0
	STA STACKACCESS+1
	LDA #9
	STA STACKACCESS
	JSR PUSH16
	LDA #>str0
	STA STACKACCESS+1
	LDA #<str0
	STA STACKACCESS
	JSR PUSH16
	; 141: 1 PRIN prin type: (string)=>void
	JSR PRINT_STRING
	; 141: 24 WORD end type: ()=>number
	LDA V_end
	STA STACKACCESS
	LDA V_end + 1
	STA STACKACCESS + 1
	JSR PUSH16
	; 141: 30 WORD start type: ()=>number
	LDA V_start
	STA STACKACCESS
	LDA V_start + 1
	STA STACKACCESS + 1
	JSR PUSH16
	; 141: 28 MINUS - type: (number,number)=>number
	JSR SUB16
	; 141: 18 PRINT print type: (number)=>void
	JSR POP16
	JSR PRINT_INT
	LDA #13
	JSR $FFD2
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
str0: BYTE 69,76,65,80,83,69,68,58,32
V_time DS 2
V_fill DS 2
V_init DS 2
V_show DS 2
V_get_num_alive_old DS 2
V_n DS 1
V_index DS 2
V_get_num_alive DS 2
V_step DS 2
V_start DS 2
V_i DS 1
V_end DS 2
HEAPSTART: