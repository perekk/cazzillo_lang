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
	; 9: 7 REF_BLOCK :[[256 * peek 161] + peek 162] type: ()=>number
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
	JSR ADD16
	; 9: 7 REF_BLOCK :[[256 * peek 161] + peek 162] type: ()=>number
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
	STA V_time
	LDA STACKACCESS + 1
	STA V_time + 1
	; Prelude for:
	; 11: 7 REF_BLOCK :[value Byte j 10000 while j < 10000 + 10 * 10 [poke j value inc j]] type: ()=>void
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
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock22
	LDA STACKACCESS + 1
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
	; 11: 7 REF_BLOCK :[value Byte j 10000 while j < 10000 + 10 * 10 [poke j value inc j]] type: ()=>void
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
	STA V_fill
	LDA STACKACCESS + 1
	STA V_fill + 1
	; Prelude for:
	; 19: 7 REF_BLOCK :[fill 32 !< poke 10000 + 2 81 !< poke 10000 + 10 81 !< poke 10000 + 10 + 2 81 !< poke 10000 + 10 + 10 + 1 81 !< poke 10000 + 10 + 10 + 2 81 !<] type: ()=>void
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
	; 19: 7 REF_BLOCK :[fill 32 !< poke 10000 + 2 81 !< poke 10000 + 10 81 !< poke 10000 + 10 + 2 81 !< poke 10000 + 10 + 10 + 1 81 !< poke 10000 + 10 + 10 + 2 81 !<] type: ()=>void
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
	STA V_init
	LDA STACKACCESS + 1
	STA V_init + 1
	; Prelude for:
; 30: 7 REF_BLOCK :[buffer 10000 screen 1024 col 0 while buffer < 10000 + 10 * 10 [poke screen peek buffer inc buffer inc screen inc col if col = 10 [screen screen + 40 - 10 col 0]]] type: ()=>void
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
	; 31: 5 LIT_WORD buffer type: (number)=>void
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
	; 32: 5 LIT_WORD screen type: (number)=>void
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
	; 33:10 NUMBER 0
	LDA #0
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	; JSR PUSH16
	; 33: 5 LIT_WORD col type: (number)=>void
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
	; 34: 11 WORD buffer type: ()=>number
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
	; 34:33 NUMBER 10100
	LDA #39
	STA STACKACCESS+1
	LDA #116
	STA STACKACCESS
	JSR PUSH16
	; 34: 18 LT < type: (number,number)=>boolean
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
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock72
	LDA STACKACCESS + 1
	BNE trueblock72
	JMP endblock72 ; if all zero
trueblock72:
	; Prelude for:
; 34: 46 BLOCK [poke screen peek buffer inc buffer inc screen inc col if col = 10 [screen screen + 40 - 10 col 0]] type: ()=>void
	; no stack memory to reserve
	; 35: 14 WORD screen type: ()=>number
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
	; 35: 26 WORD buffer type: ()=>number
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
	; 35: 21 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	; JSR PUSH16
	; 35: 9 POKE poke type: (number,byte)=>void
	; JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; no child generation for 'inc'
	; 36: 9 INC inc type: (number)=>void
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
	; 37: 9 INC inc type: (number)=>void
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
	; 38: 9 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #5
	TAX
	INC $0100,X
	BNE not_carry_59
	INC $0101,X
not_carry_59:
	; 39: 12 WORD col type: ()=>number
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
; 39: 16 EQ = type: (number,number)=>boolean
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
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock70
	LDA STACKACCESS + 1
	BNE trueblock70
	JMP endblock70 ; if all zero
trueblock70:
	; Prelude for:
	; 39: 24 BLOCK [screen screen + 40 - 10 col 0] type: ()=>void
	; no stack memory to reserve
	; 39: 33 WORD screen type: ()=>number
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
	; 39:45 NUMBER 30
	LDA #0
	STA STACKACCESS+1
	LDA #30
	STA STACKACCESS
	JSR PUSH16
	; 39: 40 PLUS + type: (number,number)=>number
	JSR ADD16
	; 39: 25 SET_WORD screen type: (number)=>void
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
	; 39:58 NUMBER 0
	LDA #0
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	; JSR PUSH16
	; 39: 53 SET_WORD col type: (number)=>void
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
	; 39: 24 BLOCK [screen screen + 40 - 10 col 0] type: ()=>void
	; no stack memory to release
	; 39: 9 IF if type: (boolean,void)=>void
endblock70:
; 34: 46 BLOCK [poke screen peek buffer inc buffer inc screen inc col if col = 10 [screen screen + 40 - 10 col 0]] type: ()=>void
	; no stack memory to release
	; 34: 5 WHILE while type: (boolean,void)=>void
	JMP startloop72
endblock72:
; 30: 7 REF_BLOCK :[buffer 10000 screen 1024 col 0 while buffer < 10000 + 10 * 10 [poke screen peek buffer inc buffer inc screen inc col if col = 10 [screen screen + 40 - 10 col 0]]] type: ()=>void
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
	; 30: 1 LIT_WORD show type: (addr)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_show
	LDA STACKACCESS + 1
	STA V_show + 1
	; Prelude for:
; 43: 20 REF_BLOCK :[index Number n 0 !< index index - 41 if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] index index + 38 if 81 !< = peek index [inc n] inc index inc index if 81 !< = peek index [inc n] index index + 38 if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] n] type: ()=>byte
	JMP AFTER_4
CALL_4:
	; reserve 3 on the stack for: index (number offset 0), n (byte offset 2)
	TSX
	TXA
	SEC
	SBC #3
	TAX
	TXS
	; 43: 29 NUMBER Number type: ()=>number
	; DO NOTHING
	; 43: 22 LIT_WORD index type: (number)=>void
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
	; 44:10 BYTE 0
	LDA #0
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	; JSR PUSH16
	; 44: 5 LIT_WORD n type: (byte)=>void
	; JSR POP16
	TSX
	TXA
	CLC
	ADC #3
	TAX
	LDA STACKACCESS
	STA $0100,X
	; 45: 12 WORD index type: ()=>number
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
	; 45:20 NUMBER 41
	LDA #0
	STA STACKACCESS+1
	LDA #41
	STA STACKACCESS
	JSR PUSH16
	; 45: 18 MINUS - type: (number,number)=>number
	JSR SUB16
	; 45: 5 SET_WORD index type: (number)=>void
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
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 46: 25 WORD index type: ()=>number
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
	; 46: 20 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 46: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal86
	LDA #01
	JMP store86
notequal86:
	LDA #00
store86:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock89
	LDA STACKACCESS + 1
	BNE trueblock89
	JMP endblock89 ; if all zero
trueblock89:
	; Prelude for:
	; 46: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 46: 32 INC inc type: (byte)=>void
	TSX
	TXA
	CLC
	ADC #3
	TAX
	INC $0100,X
	; 46: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 46: 5 IF if type: (boolean,void)=>void
endblock89:
	; no child generation for 'inc'
	; 47: 5 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_90
	INC $0101,X
not_carry_90:
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
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
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal94
	LDA #01
	JMP store94
notequal94:
	LDA #00
store94:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock97
	LDA STACKACCESS + 1
	BNE trueblock97
	JMP endblock97 ; if all zero
trueblock97:
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
endblock97:
	; no child generation for 'inc'
	; 49: 5 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_98
	INC $0101,X
not_carry_98:
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
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
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal102
	LDA #01
	JMP store102
notequal102:
	LDA #00
store102:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock105
	LDA STACKACCESS + 1
	BNE trueblock105
	JMP endblock105 ; if all zero
trueblock105:
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
endblock105:
	; 52: 12 WORD index type: ()=>number
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
	; 52:20 NUMBER 38
	LDA #0
	STA STACKACCESS+1
	LDA #38
	STA STACKACCESS
	JSR PUSH16
	; 52: 18 PLUS + type: (number,number)=>number
	JSR ADD16
	; 52: 5 SET_WORD index type: (number)=>void
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
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 53: 25 WORD index type: ()=>number
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
	; 53: 20 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 53: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal113
	LDA #01
	JMP store113
notequal113:
	LDA #00
store113:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock116
	LDA STACKACCESS + 1
	BNE trueblock116
	JMP endblock116 ; if all zero
trueblock116:
	; Prelude for:
	; 53: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 53: 32 INC inc type: (byte)=>void
	TSX
	TXA
	CLC
	ADC #3
	TAX
	INC $0100,X
	; 53: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 53: 5 IF if type: (boolean,void)=>void
endblock116:
	; no child generation for 'inc'
	; 54: 5 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_117
	INC $0101,X
not_carry_117:
	; no child generation for 'inc'
	; 55: 5 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_118
	INC $0101,X
not_carry_118:
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 56: 25 WORD index type: ()=>number
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
	; 56: 20 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 56: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal122
	LDA #01
	JMP store122
notequal122:
	LDA #00
store122:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock125
	LDA STACKACCESS + 1
	BNE trueblock125
	JMP endblock125 ; if all zero
trueblock125:
	; Prelude for:
	; 56: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 56: 32 INC inc type: (byte)=>void
	TSX
	TXA
	CLC
	ADC #3
	TAX
	INC $0100,X
	; 56: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 56: 5 IF if type: (boolean,void)=>void
endblock125:
	; 58: 12 WORD index type: ()=>number
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
	; 58:20 NUMBER 38
	LDA #0
	STA STACKACCESS+1
	LDA #38
	STA STACKACCESS
	JSR PUSH16
	; 58: 18 PLUS + type: (number,number)=>number
	JSR ADD16
	; 58: 5 SET_WORD index type: (number)=>void
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
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 59: 25 WORD index type: ()=>number
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
	; 59: 20 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 59: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal133
	LDA #01
	JMP store133
notequal133:
	LDA #00
store133:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock136
	LDA STACKACCESS + 1
	BNE trueblock136
	JMP endblock136 ; if all zero
trueblock136:
	; Prelude for:
	; 59: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 59: 32 INC inc type: (byte)=>void
	TSX
	TXA
	CLC
	ADC #3
	TAX
	INC $0100,X
	; 59: 31 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 59: 5 IF if type: (boolean,void)=>void
endblock136:
	; no child generation for 'inc'
	; 60: 5 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_137
	INC $0101,X
not_carry_137:
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
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
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal141
	LDA #01
	JMP store141
notequal141:
	LDA #00
store141:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock144
	LDA STACKACCESS + 1
	BNE trueblock144
	JMP endblock144 ; if all zero
trueblock144:
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
endblock144:
	; no child generation for 'inc'
	; 62: 5 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_145
	INC $0101,X
not_carry_145:
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
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
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal149
	LDA #01
	JMP store149
notequal149:
	LDA #00
store149:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock152
	LDA STACKACCESS + 1
	BNE trueblock152
	JMP endblock152 ; if all zero
trueblock152:
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
endblock152:
	; 64: 5 WORD n type: ()=>byte
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
; 43: 20 REF_BLOCK :[index Number n 0 !< index index - 41 if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] index index + 38 if 81 !< = peek index [inc n] inc index inc index if 81 !< = peek index [inc n] index index + 38 if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] n] type: ()=>byte
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
	; 43: 1 LIT_WORD get_num_alive_old type: (addr)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_get_num_alive_old
	LDA STACKACCESS + 1
	STA V_get_num_alive_old + 1
	; 70:6 BYTE 0
	LDA #0
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	; JSR PUSH16
	; 70: 1 LIT_WORD n type: (byte)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_n
	; Prelude for:
; 72: 16 REF_BLOCK :[index Number n 0 !< index index - 41 if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] index index + 38 if 81 !< = peek index [inc n] inc index inc index if 81 !< = peek index [inc n] index index + 38 if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] n] type: ()=>byte
	JMP AFTER_5
CALL_5:
	; reserve 2 on the stack for: index (number offset 0)
	TSX
	TXA
	SEC
	SBC #2
	TAX
	TXS
	; 72: 25 NUMBER Number type: ()=>number
	; DO NOTHING
	; 72: 18 LIT_WORD index type: (number)=>void
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
	; 73:10 BYTE 0
	LDA #0
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	; JSR PUSH16
	; 73: 5 SET_WORD n type: (byte)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_n
	; 74: 12 WORD index type: ()=>number
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
	; 74:20 NUMBER 41
	LDA #0
	STA STACKACCESS+1
	LDA #41
	STA STACKACCESS
	JSR PUSH16
	; 74: 18 MINUS - type: (number,number)=>number
	JSR SUB16
	; 74: 5 SET_WORD index type: (number)=>void
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
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 68: 40 WORD index type: ()=>number
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
	; 68: 35 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 68: 33 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal169
	LDA #01
	JMP store169
notequal169:
	LDA #00
store169:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock172
	LDA STACKACCESS + 1
	BNE trueblock172
	JMP endblock172 ; if all zero
trueblock172:
	; Prelude for:
	; 68: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 68: 47 INC inc type: (byte)=>void
	INC V_n
	; 68: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 68: 20 IF if type: (boolean,void)=>void
endblock172:
	; no child generation for 'inc'
	; 76: 5 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_173
	INC $0101,X
not_carry_173:
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 68: 40 WORD index type: ()=>number
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
	; 68: 35 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 68: 33 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal177
	LDA #01
	JMP store177
notequal177:
	LDA #00
store177:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock180
	LDA STACKACCESS + 1
	BNE trueblock180
	JMP endblock180 ; if all zero
trueblock180:
	; Prelude for:
	; 68: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 68: 47 INC inc type: (byte)=>void
	INC V_n
	; 68: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 68: 20 IF if type: (boolean,void)=>void
endblock180:
	; no child generation for 'inc'
	; 78: 5 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_181
	INC $0101,X
not_carry_181:
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 68: 40 WORD index type: ()=>number
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
	; 68: 35 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 68: 33 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal185
	LDA #01
	JMP store185
notequal185:
	LDA #00
store185:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock188
	LDA STACKACCESS + 1
	BNE trueblock188
	JMP endblock188 ; if all zero
trueblock188:
	; Prelude for:
	; 68: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 68: 47 INC inc type: (byte)=>void
	INC V_n
	; 68: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 68: 20 IF if type: (boolean,void)=>void
endblock188:
	; 81: 12 WORD index type: ()=>number
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
	; 81:20 NUMBER 38
	LDA #0
	STA STACKACCESS+1
	LDA #38
	STA STACKACCESS
	JSR PUSH16
	; 81: 18 PLUS + type: (number,number)=>number
	JSR ADD16
	; 81: 5 SET_WORD index type: (number)=>void
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
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 68: 40 WORD index type: ()=>number
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
	; 68: 35 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 68: 33 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal196
	LDA #01
	JMP store196
notequal196:
	LDA #00
store196:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock199
	LDA STACKACCESS + 1
	BNE trueblock199
	JMP endblock199 ; if all zero
trueblock199:
	; Prelude for:
	; 68: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 68: 47 INC inc type: (byte)=>void
	INC V_n
	; 68: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 68: 20 IF if type: (boolean,void)=>void
endblock199:
	; no child generation for 'inc'
	; 83: 5 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_200
	INC $0101,X
not_carry_200:
	; no child generation for 'inc'
	; 84: 5 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_201
	INC $0101,X
not_carry_201:
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 68: 40 WORD index type: ()=>number
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
	; 68: 35 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 68: 33 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal205
	LDA #01
	JMP store205
notequal205:
	LDA #00
store205:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock208
	LDA STACKACCESS + 1
	BNE trueblock208
	JMP endblock208 ; if all zero
trueblock208:
	; Prelude for:
	; 68: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 68: 47 INC inc type: (byte)=>void
	INC V_n
	; 68: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 68: 20 IF if type: (boolean,void)=>void
endblock208:
	; 87: 12 WORD index type: ()=>number
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
	; 87:20 NUMBER 38
	LDA #0
	STA STACKACCESS+1
	LDA #38
	STA STACKACCESS
	JSR PUSH16
	; 87: 18 PLUS + type: (number,number)=>number
	JSR ADD16
	; 87: 5 SET_WORD index type: (number)=>void
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
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 68: 40 WORD index type: ()=>number
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
	; 68: 35 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 68: 33 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal216
	LDA #01
	JMP store216
notequal216:
	LDA #00
store216:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock219
	LDA STACKACCESS + 1
	BNE trueblock219
	JMP endblock219 ; if all zero
trueblock219:
	; Prelude for:
	; 68: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 68: 47 INC inc type: (byte)=>void
	INC V_n
	; 68: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 68: 20 IF if type: (boolean,void)=>void
endblock219:
	; no child generation for 'inc'
	; 89: 5 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_220
	INC $0101,X
not_carry_220:
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 68: 40 WORD index type: ()=>number
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
	; 68: 35 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 68: 33 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal224
	LDA #01
	JMP store224
notequal224:
	LDA #00
store224:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock227
	LDA STACKACCESS + 1
	BNE trueblock227
	JMP endblock227 ; if all zero
trueblock227:
	; Prelude for:
	; 68: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 68: 47 INC inc type: (byte)=>void
	INC V_n
	; 68: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 68: 20 IF if type: (boolean,void)=>void
endblock227:
	; no child generation for 'inc'
	; 91: 5 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_228
	INC $0101,X
not_carry_228:
	; 6:19 BYTE 81
	LDA #81
	STA STACKACCESS
	LDA #0
	STA STACKACCESS+1
	JSR PUSH16
	; 68: 40 WORD index type: ()=>number
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
	; 68: 35 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 68: 33 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal232
	LDA #01
	JMP store232
notequal232:
	LDA #00
store232:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock235
	LDA STACKACCESS + 1
	BNE trueblock235
	JMP endblock235 ; if all zero
trueblock235:
	; Prelude for:
	; 68: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 68: 47 INC inc type: (byte)=>void
	INC V_n
	; 68: 46 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 68: 20 IF if type: (boolean,void)=>void
endblock235:
	; 93: 5 WORD n type: ()=>byte
	LDA V_n
	STA STACKACCESS
	LDA #0
	STA STACKACCESS + 1
	JSR PUSH16
; 72: 16 REF_BLOCK :[index Number n 0 !< index index - 41 if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] index index + 38 if 81 !< = peek index [inc n] inc index inc index if 81 !< = peek index [inc n] index index + 38 if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] inc index if 81 !< = peek index [inc n] n] type: ()=>byte
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
	; 72: 1 LIT_WORD get_num_alive type: (addr)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_get_num_alive
	LDA STACKACCESS + 1
	STA V_get_num_alive + 1
	; Prelude for:
; 97: 7 REF_BLOCK :[from_loc 1024 to_loc 10000 col 0 while to_loc < 10000 + 10 * 10 [nalive get_num_alive from_loc cell_state peek from_loc either cell_state = 81 !< [either nalive = 2 [poke to_loc 81 !<] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]]] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]] inc from_loc inc to_loc inc col if col = 10 [from_loc from_loc + 40 - 10 col 0]]] type: ()=>void
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
	; 98: 5 LIT_WORD from_loc type: (number)=>void
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
	; 99: 5 LIT_WORD to_loc type: (number)=>void
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
	; 100:10 NUMBER 0
	LDA #0
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	; JSR PUSH16
	; 100: 5 LIT_WORD col type: (number)=>void
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
startloop308:
	; 101: 11 WORD to_loc type: ()=>number
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
	; 101:33 NUMBER 10100
	LDA #39
	STA STACKACCESS+1
	LDA #116
	STA STACKACCESS
	JSR PUSH16
	; 101: 18 LT < type: (number,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BCC less247
	BNE greaterorequal247
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BCC less247
greaterorequal247:
	LDA #00
	JMP store247
less247:
	LDA #01
store247:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock308
	LDA STACKACCESS + 1
	BNE trueblock308
	JMP endblock308 ; if all zero
trueblock308:
	; Prelude for:
; 101: 46 BLOCK [nalive get_num_alive from_loc cell_state peek from_loc either cell_state = 81 !< [either nalive = 2 [poke to_loc 81 !<] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]]] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]] inc from_loc inc to_loc inc col if col = 10 [from_loc from_loc + 40 - 10 col 0]] type: ()=>void
	; reserve 2 on the stack for: nalive (byte offset 0), cell_state (byte offset 1)
	TSX
	TXA
	SEC
	SBC #2
	TAX
	TXS
	; 102: 31 WORD from_loc type: ()=>number
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
	; 102: 17 WORD get_num_alive type: ()=>byte
	LDA V_get_num_alive
	STA CALL_FUN_249 + 1
	LDA V_get_num_alive + 1
	STA CALL_FUN_249 + 2
CALL_FUN_249:
	JSR $1111 ; will be overwritten
	; 102: 9 LIT_WORD nalive type: (byte)=>void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #1
	TAX
	LDA STACKACCESS
	STA $0100,X
	; 103: 26 WORD from_loc type: ()=>number
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
	; 103: 21 PEEK peek type: (number)=>byte
	; JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	; JSR PUSH16
	; 103: 9 LIT_WORD cell_state type: (byte)=>void
	; JSR POP16
	TSX
	TXA
	CLC
	ADC #2
	TAX
	LDA STACKACCESS
	STA $0100,X
	; 104: 16 WORD cell_state type: ()=>byte
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
; 104: 27 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal256
	LDA #01
	JMP store256
notequal256:
	LDA #00
store256:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock292
	LDA STACKACCESS + 1
	BNE trueblock292
	JMP elseblock292 ; if all zero
trueblock292:
	; Prelude for:
; 104: 39 BLOCK [either nalive = 2 [poke to_loc 81 !<] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]]] type: ()=>void
	; no stack memory to reserve
	; 105: 20 WORD nalive type: ()=>byte
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
	; 105:29 NUMBER 2
	LDA #0
	STA STACKACCESS+1
	LDA #2
	STA STACKACCESS
	JSR PUSH16
; 105: 27 EQ = type: (byte,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal259
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal259
	LDA #01
	JMP store259
notequal259:
	LDA #00
store259:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock277
	LDA STACKACCESS + 1
	BNE trueblock277
	JMP elseblock277 ; if all zero
trueblock277:
	; Prelude for:
	; 105: 31 BLOCK [poke to_loc 81 !<] type: ()=>void
	; no stack memory to reserve
	; 106: 20 WORD to_loc type: ()=>number
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
	; 106: 15 POKE poke type: (number,byte)=>void
	; JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 105: 31 BLOCK [poke to_loc 81 !<] type: ()=>void
	; no stack memory to release
	JMP endblock277
elseblock277:
	; Prelude for:
; 107: 15 BLOCK [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]] type: ()=>void
	; no stack memory to reserve
	; 108: 22 WORD nalive type: ()=>byte
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
	; 108:31 NUMBER 3
	LDA #0
	STA STACKACCESS+1
	LDA #3
	STA STACKACCESS
	JSR PUSH16
; 108: 29 EQ = type: (byte,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal266
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal266
	LDA #01
	JMP store266
notequal266:
	LDA #00
store266:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock275
	LDA STACKACCESS + 1
	BNE trueblock275
	JMP elseblock275 ; if all zero
trueblock275:
	; Prelude for:
	; 108: 33 BLOCK [poke to_loc 81 !<] type: ()=>void
	; no stack memory to reserve
	; 109: 22 WORD to_loc type: ()=>number
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
	; 109: 17 POKE poke type: (number,byte)=>void
	; JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 108: 33 BLOCK [poke to_loc 81 !<] type: ()=>void
	; no stack memory to release
	JMP endblock275
elseblock275:
	; Prelude for:
	; 110: 16 BLOCK [poke to_loc 32 !<] type: ()=>void
	; no stack memory to reserve
	; 111: 22 WORD to_loc type: ()=>number
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
	; 111: 17 POKE poke type: (number,byte)=>void
	; JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 110: 16 BLOCK [poke to_loc 32 !<] type: ()=>void
	; no stack memory to release
	; 108: 15 EITHER either type: (boolean,void,void)=>void
endblock275:
; 107: 15 BLOCK [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]] type: ()=>void
	; no stack memory to release
	; 105: 13 EITHER either type: (boolean,void,void)=>void
endblock277:
; 104: 39 BLOCK [either nalive = 2 [poke to_loc 81 !<] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]]] type: ()=>void
	; no stack memory to release
	JMP endblock292
elseblock292:
	; Prelude for:
; 114: 11 BLOCK [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]] type: ()=>void
	; no stack memory to reserve
	; 115: 20 WORD nalive type: ()=>byte
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
	; 115:29 NUMBER 3
	LDA #0
	STA STACKACCESS+1
	LDA #3
	STA STACKACCESS
	JSR PUSH16
; 115: 27 EQ = type: (byte,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal281
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal281
	LDA #01
	JMP store281
notequal281:
	LDA #00
store281:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock290
	LDA STACKACCESS + 1
	BNE trueblock290
	JMP elseblock290 ; if all zero
trueblock290:
	; Prelude for:
	; 115: 31 BLOCK [poke to_loc 81 !<] type: ()=>void
	; no stack memory to reserve
	; 116: 20 WORD to_loc type: ()=>number
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
	; 116: 15 POKE poke type: (number,byte)=>void
	; JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 115: 31 BLOCK [poke to_loc 81 !<] type: ()=>void
	; no stack memory to release
	JMP endblock290
elseblock290:
	; Prelude for:
	; 117: 15 BLOCK [poke to_loc 32 !<] type: ()=>void
	; no stack memory to reserve
	; 118: 20 WORD to_loc type: ()=>number
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
	; 118: 15 POKE poke type: (number,byte)=>void
	; JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 117: 15 BLOCK [poke to_loc 32 !<] type: ()=>void
	; no stack memory to release
	; 115: 13 EITHER either type: (boolean,void,void)=>void
endblock290:
; 114: 11 BLOCK [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]] type: ()=>void
	; no stack memory to release
	; 104: 9 EITHER either type: (boolean,void,void)=>void
endblock292:
	; no child generation for 'inc'
	; 121: 9 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #3
	TAX
	INC $0100,X
	BNE not_carry_293
	INC $0101,X
not_carry_293:
	; no child generation for 'inc'
	; 122: 9 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #5
	TAX
	INC $0100,X
	BNE not_carry_294
	INC $0101,X
not_carry_294:
	; no child generation for 'inc'
	; 123: 9 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #7
	TAX
	INC $0100,X
	BNE not_carry_295
	INC $0101,X
not_carry_295:
	; 124: 12 WORD col type: ()=>number
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
; 124: 16 EQ = type: (number,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal298
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal298
	LDA #01
	JMP store298
notequal298:
	LDA #00
store298:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock306
	LDA STACKACCESS + 1
	BNE trueblock306
	JMP endblock306 ; if all zero
trueblock306:
	; Prelude for:
	; 124: 24 BLOCK [from_loc from_loc + 40 - 10 col 0] type: ()=>void
	; no stack memory to reserve
	; 124: 35 WORD from_loc type: ()=>number
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
	; 124:49 NUMBER 30
	LDA #0
	STA STACKACCESS+1
	LDA #30
	STA STACKACCESS
	JSR PUSH16
	; 124: 44 PLUS + type: (number,number)=>number
	JSR ADD16
	; 124: 25 SET_WORD from_loc type: (number)=>void
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
	; 124:62 NUMBER 0
	LDA #0
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	; JSR PUSH16
	; 124: 57 SET_WORD col type: (number)=>void
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
	; 124: 24 BLOCK [from_loc from_loc + 40 - 10 col 0] type: ()=>void
	; no stack memory to release
	; 124: 9 IF if type: (boolean,void)=>void
endblock306:
; 101: 46 BLOCK [nalive get_num_alive from_loc cell_state peek from_loc either cell_state = 81 !< [either nalive = 2 [poke to_loc 81 !<] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]]] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]] inc from_loc inc to_loc inc col if col = 10 [from_loc from_loc + 40 - 10 col 0]] type: ()=>void
	; release 2 on the stack
	TSX
	TXA
	CLC
	ADC #2
	TAX
	TXS
	; 101: 5 WHILE while type: (boolean,void)=>void
	JMP startloop308
endblock308:
; 97: 7 REF_BLOCK :[from_loc 1024 to_loc 10000 col 0 while to_loc < 10000 + 10 * 10 [nalive get_num_alive from_loc cell_state peek from_loc either cell_state = 81 !< [either nalive = 2 [poke to_loc 81 !<] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]]] [either nalive = 3 [poke to_loc 81 !<] [poke to_loc 32 !<]] inc from_loc inc to_loc inc col if col = 10 [from_loc from_loc + 40 - 10 col 0]]] type: ()=>void
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
	; 97: 1 LIT_WORD step type: (addr)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_step
	LDA STACKACCESS + 1
	STA V_step + 1
	; 128: 8 WORD time type: ()=>number
	LDA V_time
	STA CALL_FUN_311 + 1
	LDA V_time + 1
	STA CALL_FUN_311 + 2
CALL_FUN_311:
	JSR $1111 ; will be overwritten
	; 128: 1 LIT_WORD start type: (number)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_start
	LDA STACKACCESS + 1
	STA V_start + 1
	; 129: 1 WORD init type: ()=>void
	LDA V_init
	STA CALL_FUN_313 + 1
	LDA V_init + 1
	STA CALL_FUN_313 + 2
CALL_FUN_313:
	JSR $1111 ; will be overwritten
	; 131:4 NUMBER 0
	LDA #0
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	; JSR PUSH16
	; 131: 1 LIT_WORD i type: (number)=>void
	; JSR POP16
	LDA STACKACCESS
	STA V_i
	LDA STACKACCESS + 1
	STA V_i + 1
startloop323:
	; 132: 7 WORD i type: ()=>number
	LDA V_i
	STA STACKACCESS
	LDA V_i + 1
	STA STACKACCESS + 1
	JSR PUSH16
	; 132:11 NUMBER 10
	LDA #0
	STA STACKACCESS+1
	LDA #10
	STA STACKACCESS
	JSR PUSH16
	; 132: 9 LT < type: (number,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BCC less318
	BNE greaterorequal318
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BCC less318
greaterorequal318:
	LDA #00
	JMP store318
less318:
	LDA #01
store318:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock323
	LDA STACKACCESS + 1
	BNE trueblock323
	JMP endblock323 ; if all zero
trueblock323:
	; Prelude for:
	; 132: 14 BLOCK [show step inc i] type: ()=>void
	; no stack memory to reserve
	; 133: 5 WORD show type: ()=>void
	LDA V_show
	STA CALL_FUN_319 + 1
	LDA V_show + 1
	STA CALL_FUN_319 + 2
CALL_FUN_319:
	JSR $1111 ; will be overwritten
	; 134: 5 WORD step type: ()=>void
	LDA V_step
	STA CALL_FUN_320 + 1
	LDA V_step + 1
	STA CALL_FUN_320 + 2
CALL_FUN_320:
	JSR $1111 ; will be overwritten
	; no child generation for 'inc'
	; 135: 5 INC inc type: (number)=>void
	INC V_i
	BNE not_carry_321
	INC V_i + 1
not_carry_321:
	; 132: 14 BLOCK [show step inc i] type: ()=>void
	; no stack memory to release
	; 132: 1 WHILE while type: (boolean,void)=>void
	JMP startloop323
endblock323:
	; 137: 6 WORD time type: ()=>number
	LDA V_time
	STA CALL_FUN_324 + 1
	LDA V_time + 1
	STA CALL_FUN_324 + 2
CALL_FUN_324:
	JSR $1111 ; will be overwritten
	; 137: 1 LIT_WORD end type: (number)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_end
	LDA STACKACCESS + 1
	STA V_end + 1
	; 138: 7 WORD start type: ()=>number
	LDA V_start
	STA STACKACCESS
	LDA V_start + 1
	STA STACKACCESS + 1
	; JSR PUSH16
	; 138: 1 PRINT print type: (number)=>void
	; JSR POP16
	JSR PRINT_INT
	LDA #13
	JSR $FFD2
	; 139: 7 WORD end type: ()=>number
	LDA V_end
	STA STACKACCESS
	LDA V_end + 1
	STA STACKACCESS + 1
	; JSR PUSH16
	; 139: 1 PRINT print type: (number)=>void
	; JSR POP16
	JSR PRINT_INT
	LDA #13
	JSR $FFD2
	; 140:6 STRING "ELAPSED: "
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
	; 140: 1 PRIN prin type: (string)=>void
	JSR PRINT_STRING
	; 140: 24 WORD end type: ()=>number
	LDA V_end
	STA STACKACCESS
	LDA V_end + 1
	STA STACKACCESS + 1
	JSR PUSH16
	; 140: 30 WORD start type: ()=>number
	LDA V_start
	STA STACKACCESS
	LDA V_start + 1
	STA STACKACCESS + 1
	JSR PUSH16
	; 140: 28 MINUS - type: (number,number)=>number
	JSR SUB16
	; 140: 18 PRINT print type: (number)=>void
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
str0: BYTE 69,76,65,80,83,69,68,58,32
V_time DS 2
V_fill DS 2
V_init DS 2
V_show DS 2
V_get_num_alive_old DS 2
V_n DS 1
V_get_num_alive DS 2
V_step DS 2
V_start DS 2
V_i DS 2
V_end DS 2
HEAPSTART: