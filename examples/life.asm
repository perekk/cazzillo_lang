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
	; no child generation for 'def'
	; 1:14 NUMBER 10
	LDA #0
	STA STACKACCESS+1
	LDA #10
	STA STACKACCESS
	JSR PUSH16
	; 1:19 NUMBER 40
	LDA #0
	STA STACKACCESS+1
	LDA #40
	STA STACKACCESS
	JSR PUSH16
	; 1: 17 MULT * type: (number,number)=>number
	JSR MUL16
	; 1: 1 DEFINE def type: (symbol,number)=>void
	; no child generation for 'def'
	; 2:13 NUMBER 10
	LDA #0
	STA STACKACCESS+1
	LDA #10
	STA STACKACCESS
	JSR PUSH16
	; 2: 1 DEFINE def type: (symbol,number)=>void
	; no child generation for 'def'
	; 3:14 NUMBER 1024
	LDA #4
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	JSR PUSH16
	; 3: 1 DEFINE def type: (symbol,number)=>void
	; no child generation for 'def'
	; 4:14 NUMBER 10000
	LDA #39
	STA STACKACCESS+1
	LDA #16
	STA STACKACCESS
	JSR PUSH16
	; 4: 1 DEFINE def type: (symbol,number)=>void
	; no child generation for 'def'
	; 5:17 NUMBER 81
	LDA #0
	STA STACKACCESS+1
	LDA #81
	STA STACKACCESS
	JSR PUSH16
	; 5: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
	; 5: 1 DEFINE def type: (symbol,byte)=>void
	; no child generation for 'def'
	; 6:17 NUMBER 32
	LDA #0
	STA STACKACCESS+1
	LDA #32
	STA STACKACCESS
	JSR PUSH16
	; 6: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
	; 6: 1 DEFINE def type: (symbol,byte)=>void
	; Prelude for:
	; 8: 7 REF_BLOCK :[[256 * peek 161] + peek 162] type: ()=>number
	JMP AFTER_0
CALL_0:
	; no stack memory to reserve
	; Prelude for:
	; 8: 9 BLOCK [256 * peek 161] type: ()=>number
	; no stack memory to reserve
	; 8:11 NUMBER 256
	LDA #1
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	JSR PUSH16
	; 8:22 NUMBER 161
	LDA #0
	STA STACKACCESS+1
	LDA #161
	STA STACKACCESS
	JSR PUSH16
	; 8: 17 PEEK peek type: (number)=>byte
	JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
	; 8: 15 MULT * type: (number,byte)=>number
	JSR MUL16
	; 8: 9 BLOCK [256 * peek 161] type: ()=>number
	; no stack memory to release
	; 8:34 NUMBER 162
	LDA #0
	STA STACKACCESS+1
	LDA #162
	STA STACKACCESS
	JSR PUSH16
	; 8: 29 PEEK peek type: (number)=>byte
	JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
	; 8: 27 PLUS + type: (number,byte)=>number
	JSR ADD16
	; 8: 7 REF_BLOCK :[[256 * peek 161] + peek 162] type: ()=>number
	; no stack memory to release
	RTS
AFTER_0:
	LDA #<CALL_0
	STA STACKACCESS
	LDA #>CALL_0
	STA STACKACCESS + 1
	JSR PUSH16
	; 8: 1 LIT_WORD time type: (addr)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_time
	LDA STACKACCESS + 1
	STA V_time + 1
	; Prelude for:
	; 10: 7 REF_BLOCK :[base Number value Byte j 0 while j < HEIGHT [i 0 while i < WIDTH [poke base + i + j value inc i] j j + 40]] type: ()=>void
	JMP AFTER_1
CALL_1:
	; reserve 5 on the stack for: base (number offset 0), value (byte offset 2), j (number offset 3)
	TSX
	TXA
	SEC
	SBC #5
	TAX
	TXS
	; 10: 29 BYTE Byte type: ()=>byte
	; DO NOTHING
	; 10: 22 LIT_WORD value type: (byte)=>void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #3
	TAX
	LDA STACKACCESS
	STA $0100,X
	; 10: 15 NUMBER Number type: ()=>number
	; DO NOTHING
	; 10: 9 LIT_WORD base type: (number)=>void
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
	; 11:8 NUMBER 0
	LDA #0
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	JSR PUSH16
	; 11: 5 LIT_WORD j type: (number)=>void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #4
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
startloop57:
	; 12: 11 WORD j type: ()=>number
	TSX
	TXA
	CLC
	ADC #4
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	JSR PUSH16
	; 1:14 NUMBER 10
	LDA #0
	STA STACKACCESS+1
	LDA #10
	STA STACKACCESS
	JSR PUSH16
	; 1:19 NUMBER 40
	LDA #0
	STA STACKACCESS+1
	LDA #40
	STA STACKACCESS
	JSR PUSH16
	; 1: 17 MULT * type: (number,number)=>number
	JSR MUL16
	; 12: 13 LT < type: (number,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BCC less36
	BNE greaterorequal36
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BCC less36
greaterorequal36:
	LDA #00
	JMP store36
less36:
	LDA #01
store36:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock57
	LDA STACKACCESS + 1
	BNE trueblock57
	JMP endblock57 ; if all zero
trueblock57:
	; Prelude for:
	; 12: 22 BLOCK [i 0 while i < WIDTH [poke base + i + j value inc i] j j + 40] type: ()=>void
	; reserve 2 on the stack for: i (number offset 0)
	TSX
	TXA
	SEC
	SBC #2
	TAX
	TXS
	; 13:12 NUMBER 0
	LDA #0
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	JSR PUSH16
	; 13: 9 LIT_WORD i type: (number)=>void
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
startloop51:
	; 14: 15 WORD i type: ()=>number
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
	; 2:13 NUMBER 10
	LDA #0
	STA STACKACCESS+1
	LDA #10
	STA STACKACCESS
	JSR PUSH16
	; 14: 17 LT < type: (number,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BCC less41
	BNE greaterorequal41
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BCC less41
greaterorequal41:
	LDA #00
	JMP store41
less41:
	LDA #01
store41:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock51
	LDA STACKACCESS + 1
	BNE trueblock51
	JMP endblock51 ; if all zero
trueblock51:
	; Prelude for:
	; 14: 25 BLOCK [poke base + i + j value inc i] type: ()=>void
	; no stack memory to reserve
	; 15: 18 WORD base type: ()=>number
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
	; 15: 25 WORD i type: ()=>number
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
	; 15: 29 WORD j type: ()=>number
	TSX
	TXA
	CLC
	ADC #6
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	JSR PUSH16
	; 15: 27 PLUS + type: (number,number)=>number
	JSR ADD16
	; 15: 23 PLUS + type: (number,number)=>number
	JSR ADD16
	; 15: 31 WORD value type: ()=>byte
	TSX
	TXA
	CLC
	ADC #5
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA #0
	STA STACKACCESS + 1
	JSR PUSH16
	; 15: 13 POKE poke type: (number,byte)=>void
	JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; no child generation for 'inc'
	; 16: 13 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #1
	TAX
	INC $0100,X
	BNE not_carry_49
	INC $0101,X
not_carry_49:
	; 14: 25 BLOCK [poke base + i + j value inc i] type: ()=>void
	; no stack memory to release
	; 14: 9 WHILE while type: (boolean,void)=>void
	JMP startloop51
endblock51:
	; 18: 12 WORD j type: ()=>number
	TSX
	TXA
	CLC
	ADC #6
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	JSR PUSH16
	; 18:16 NUMBER 40
	LDA #0
	STA STACKACCESS+1
	LDA #40
	STA STACKACCESS
	JSR PUSH16
	; 18: 14 PLUS + type: (number,number)=>number
	JSR ADD16
	; 18: 9 SET_WORD j type: (number)=>void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #6
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
	; 12: 22 BLOCK [i 0 while i < WIDTH [poke base + i + j value inc i] j j + 40] type: ()=>void
	; release 2 on the stack
	TSX
	TXA
	CLC
	ADC #2
	TAX
	TXS
	; 12: 5 WHILE while type: (boolean,void)=>void
	JMP startloop57
endblock57:
	; 10: 7 REF_BLOCK :[base Number value Byte j 0 while j < HEIGHT [i 0 while i < WIDTH [poke base + i + j value inc i] j j + 40]] type: ()=>void
	; release 5 on the stack
	TSX
	TXA
	CLC
	ADC #5
	TAX
	TXS
	RTS
AFTER_1:
	LDA #<CALL_1
	STA STACKACCESS
	LDA #>CALL_1
	STA STACKACCESS + 1
	JSR PUSH16
	; 10: 1 LIT_WORD fill type: (addr)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_fill
	LDA STACKACCESS + 1
	STA V_fill + 1
	; Prelude for:
	; 22: 7 REF_BLOCK :[fill BUFFER DEAD_CHAR poke BUFFER + 2 LIFE_CHAR poke BUFFER + 40 LIFE_CHAR poke BUFFER + 42 LIFE_CHAR poke BUFFER + 81 LIFE_CHAR poke BUFFER + 82 LIFE_CHAR] type: ()=>void
	JMP AFTER_2
CALL_2:
	; no stack memory to reserve
	; 4:14 NUMBER 10000
	LDA #39
	STA STACKACCESS+1
	LDA #16
	STA STACKACCESS
	JSR PUSH16
	; 6:17 NUMBER 32
	LDA #0
	STA STACKACCESS+1
	LDA #32
	STA STACKACCESS
	JSR PUSH16
	; 6: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
	; 23: 5 WORD fill type: ()=>void
	LDA V_fill
	STA CALL_FUN_63 + 1
	LDA V_fill + 1
	STA CALL_FUN_63 + 2
CALL_FUN_63:
	JSR $1111 ; will be overwritten
	; 25:17 NUMBER 10002
	LDA #39
	STA STACKACCESS+1
	LDA #18
	STA STACKACCESS
	JSR PUSH16
	; 5:17 NUMBER 81
	LDA #0
	STA STACKACCESS+1
	LDA #81
	STA STACKACCESS
	JSR PUSH16
	; 5: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
	; 25: 5 POKE poke type: (number,byte)=>void
	JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 26:17 NUMBER 10040
	LDA #39
	STA STACKACCESS+1
	LDA #56
	STA STACKACCESS
	JSR PUSH16
	; 5:17 NUMBER 81
	LDA #0
	STA STACKACCESS+1
	LDA #81
	STA STACKACCESS
	JSR PUSH16
	; 5: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
	; 26: 5 POKE poke type: (number,byte)=>void
	JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 27:17 NUMBER 10042
	LDA #39
	STA STACKACCESS+1
	LDA #58
	STA STACKACCESS
	JSR PUSH16
	; 5:17 NUMBER 81
	LDA #0
	STA STACKACCESS+1
	LDA #81
	STA STACKACCESS
	JSR PUSH16
	; 5: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
	; 27: 5 POKE poke type: (number,byte)=>void
	JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 28:17 NUMBER 10081
	LDA #39
	STA STACKACCESS+1
	LDA #97
	STA STACKACCESS
	JSR PUSH16
	; 5:17 NUMBER 81
	LDA #0
	STA STACKACCESS+1
	LDA #81
	STA STACKACCESS
	JSR PUSH16
	; 5: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
	; 28: 5 POKE poke type: (number,byte)=>void
	JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 29:17 NUMBER 10082
	LDA #39
	STA STACKACCESS+1
	LDA #98
	STA STACKACCESS
	JSR PUSH16
	; 5:17 NUMBER 81
	LDA #0
	STA STACKACCESS+1
	LDA #81
	STA STACKACCESS
	JSR PUSH16
	; 5: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
	; 29: 5 POKE poke type: (number,byte)=>void
	JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 22: 7 REF_BLOCK :[fill BUFFER DEAD_CHAR poke BUFFER + 2 LIFE_CHAR poke BUFFER + 40 LIFE_CHAR poke BUFFER + 42 LIFE_CHAR poke BUFFER + 81 LIFE_CHAR poke BUFFER + 82 LIFE_CHAR] type: ()=>void
	; no stack memory to release
	RTS
AFTER_2:
	LDA #<CALL_2
	STA STACKACCESS
	LDA #>CALL_2
	STA STACKACCESS + 1
	JSR PUSH16
	; 22: 1 LIT_WORD init type: (addr)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_init
	LDA STACKACCESS + 1
	STA V_init + 1
	; Prelude for:
	; 33: 7 REF_BLOCK :[i 0 while i < WIDTH [j 0 while j < HEIGHT [k i + j poke SCREEN + k peek BUFFER + k j j + 40] inc i]] type: ()=>void
	JMP AFTER_3
CALL_3:
	; reserve 2 on the stack for: i (number offset 0)
	TSX
	TXA
	SEC
	SBC #2
	TAX
	TXS
	; 34:8 NUMBER 0
	LDA #0
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	JSR PUSH16
	; 34: 5 LIT_WORD i type: (number)=>void
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
startloop118:
	; 35: 11 WORD i type: ()=>number
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
	; 2:13 NUMBER 10
	LDA #0
	STA STACKACCESS+1
	LDA #10
	STA STACKACCESS
	JSR PUSH16
	; 35: 13 LT < type: (number,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BCC less90
	BNE greaterorequal90
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BCC less90
greaterorequal90:
	LDA #00
	JMP store90
less90:
	LDA #01
store90:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock118
	LDA STACKACCESS + 1
	BNE trueblock118
	JMP endblock118 ; if all zero
trueblock118:
	; Prelude for:
	; 35: 21 BLOCK [j 0 while j < HEIGHT [k i + j poke SCREEN + k peek BUFFER + k j j + 40] inc i] type: ()=>void
	; reserve 2 on the stack for: j (number offset 0)
	TSX
	TXA
	SEC
	SBC #2
	TAX
	TXS
	; 36:12 NUMBER 0
	LDA #0
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	JSR PUSH16
	; 36: 9 LIT_WORD j type: (number)=>void
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
startloop115:
	; 37: 15 WORD j type: ()=>number
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
	; 1:14 NUMBER 10
	LDA #0
	STA STACKACCESS+1
	LDA #10
	STA STACKACCESS
	JSR PUSH16
	; 1:19 NUMBER 40
	LDA #0
	STA STACKACCESS+1
	LDA #40
	STA STACKACCESS
	JSR PUSH16
	; 1: 17 MULT * type: (number,number)=>number
	JSR MUL16
	; 37: 17 LT < type: (number,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BCC less97
	BNE greaterorequal97
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BCC less97
greaterorequal97:
	LDA #00
	JMP store97
less97:
	LDA #01
store97:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock115
	LDA STACKACCESS + 1
	BNE trueblock115
	JMP endblock115 ; if all zero
trueblock115:
	; Prelude for:
	; 37: 26 BLOCK [k i + j poke SCREEN + k peek BUFFER + k j j + 40] type: ()=>void
	; reserve 2 on the stack for: k (number offset 0)
	TSX
	TXA
	SEC
	SBC #2
	TAX
	TXS
	; 38: 16 WORD i type: ()=>number
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
	; 38: 20 WORD j type: ()=>number
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
	; 38: 18 PLUS + type: (number,number)=>number
	JSR ADD16
	; 38: 13 LIT_WORD k type: (number)=>void
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
	; 3:14 NUMBER 1024
	LDA #4
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	JSR PUSH16
	; 39: 27 WORD k type: ()=>number
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
	; 39: 25 PLUS + type: (number,number)=>number
	JSR ADD16
	; 4:14 NUMBER 10000
	LDA #39
	STA STACKACCESS+1
	LDA #16
	STA STACKACCESS
	JSR PUSH16
	; 39: 43 WORD k type: ()=>number
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
	; 39: 41 PLUS + type: (number,number)=>number
	JSR ADD16
	; 39: 29 PEEK peek type: (number)=>byte
	JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
	; 39: 13 POKE poke type: (number,byte)=>void
	JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 40: 16 WORD j type: ()=>number
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
	; 40:20 NUMBER 40
	LDA #0
	STA STACKACCESS+1
	LDA #40
	STA STACKACCESS
	JSR PUSH16
	; 40: 18 PLUS + type: (number,number)=>number
	JSR ADD16
	; 40: 13 SET_WORD j type: (number)=>void
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
	; 37: 26 BLOCK [k i + j poke SCREEN + k peek BUFFER + k j j + 40] type: ()=>void
	; release 2 on the stack
	TSX
	TXA
	CLC
	ADC #2
	TAX
	TXS
	; 37: 9 WHILE while type: (boolean,void)=>void
	JMP startloop115
endblock115:
	; no child generation for 'inc'
	; 42: 9 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #3
	TAX
	INC $0100,X
	BNE not_carry_116
	INC $0101,X
not_carry_116:
	; 35: 21 BLOCK [j 0 while j < HEIGHT [k i + j poke SCREEN + k peek BUFFER + k j j + 40] inc i] type: ()=>void
	; release 2 on the stack
	TSX
	TXA
	CLC
	ADC #2
	TAX
	TXS
	; 35: 5 WHILE while type: (boolean,void)=>void
	JMP startloop118
endblock118:
	; 33: 7 REF_BLOCK :[i 0 while i < WIDTH [j 0 while j < HEIGHT [k i + j poke SCREEN + k peek BUFFER + k j j + 40] inc i]] type: ()=>void
	; release 2 on the stack
	TSX
	TXA
	CLC
	ADC #2
	TAX
	TXS
	RTS
AFTER_3:
	LDA #<CALL_3
	STA STACKACCESS
	LDA #>CALL_3
	STA STACKACCESS + 1
	JSR PUSH16
	; 33: 1 LIT_WORD show type: (addr)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_show
	LDA STACKACCESS + 1
	STA V_show + 1
	; Prelude for:
; 46: 16 REF_BLOCK :[base Number x Number y Number index base + y + x n 0 if LIFE_CHAR = peek index - 41 [inc n] if LIFE_CHAR = peek index - 40 [inc n] if LIFE_CHAR = peek index - 39 [inc n] if LIFE_CHAR = peek index - 1 [inc n] if LIFE_CHAR = peek index + 1 [inc n] if LIFE_CHAR = peek index + 39 [inc n] if LIFE_CHAR = peek index + 40 [inc n] if LIFE_CHAR = peek index + 41 [inc n] n] type: ()=>number
	JMP AFTER_4
CALL_4:
	; reserve 10 on the stack for: base (number offset 0), x (number offset 2), y (number offset 4), index (number offset 6), n (number offset 8)
	TSX
	TXA
	SEC
	SBC #10
	TAX
	TXS
	; 46: 44 NUMBER Number type: ()=>number
	; DO NOTHING
	; 46: 41 LIT_WORD y type: (number)=>void
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
	; 46: 34 NUMBER Number type: ()=>number
	; DO NOTHING
	; 46: 31 LIT_WORD x type: (number)=>void
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
	; 46: 24 NUMBER Number type: ()=>number
	; DO NOTHING
	; 46: 18 LIT_WORD base type: (number)=>void
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
	; 47: 12 WORD base type: ()=>number
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
	; 47: 19 WORD y type: ()=>number
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
	; 47: 23 WORD x type: ()=>number
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
	; 47: 21 PLUS + type: (number,number)=>number
	JSR ADD16
	; 47: 17 PLUS + type: (number,number)=>number
	JSR ADD16
	; 47: 5 LIT_WORD index type: (number)=>void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #7
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
	; 48:8 NUMBER 0
	LDA #0
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	JSR PUSH16
	; 48: 5 LIT_WORD n type: (number)=>void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #9
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
	; 5:17 NUMBER 81
	LDA #0
	STA STACKACCESS+1
	LDA #81
	STA STACKACCESS
	JSR PUSH16
	; 5: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
	; 49: 25 WORD index type: ()=>number
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
	; 49:33 NUMBER 41
	LDA #0
	STA STACKACCESS+1
	LDA #41
	STA STACKACCESS
	JSR PUSH16
	; 49: 31 MINUS - type: (number,number)=>number
	JSR SUB16
	; 49: 20 PEEK peek type: (number)=>byte
	JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 49: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal141
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
	; 49: 36 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 49: 37 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #9
	TAX
	INC $0100,X
	BNE not_carry_142
	INC $0101,X
not_carry_142:
	; 49: 36 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 49: 5 IF if type: (boolean,void)=>void
endblock144:
	; 5:17 NUMBER 81
	LDA #0
	STA STACKACCESS+1
	LDA #81
	STA STACKACCESS
	JSR PUSH16
	; 5: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
	; 50: 25 WORD index type: ()=>number
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
	; 50:33 NUMBER 40
	LDA #0
	STA STACKACCESS+1
	LDA #40
	STA STACKACCESS
	JSR PUSH16
	; 50: 31 MINUS - type: (number,number)=>number
	JSR SUB16
	; 50: 20 PEEK peek type: (number)=>byte
	JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 50: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal151
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal151
	LDA #01
	JMP store151
notequal151:
	LDA #00
store151:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock154
	LDA STACKACCESS + 1
	BNE trueblock154
	JMP endblock154 ; if all zero
trueblock154:
	; Prelude for:
	; 50: 36 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 50: 37 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #9
	TAX
	INC $0100,X
	BNE not_carry_152
	INC $0101,X
not_carry_152:
	; 50: 36 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 50: 5 IF if type: (boolean,void)=>void
endblock154:
	; 5:17 NUMBER 81
	LDA #0
	STA STACKACCESS+1
	LDA #81
	STA STACKACCESS
	JSR PUSH16
	; 5: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
	; 51: 25 WORD index type: ()=>number
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
	; 51:33 NUMBER 39
	LDA #0
	STA STACKACCESS+1
	LDA #39
	STA STACKACCESS
	JSR PUSH16
	; 51: 31 MINUS - type: (number,number)=>number
	JSR SUB16
	; 51: 20 PEEK peek type: (number)=>byte
	JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 51: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal161
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal161
	LDA #01
	JMP store161
notequal161:
	LDA #00
store161:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock164
	LDA STACKACCESS + 1
	BNE trueblock164
	JMP endblock164 ; if all zero
trueblock164:
	; Prelude for:
	; 51: 36 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 51: 37 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #9
	TAX
	INC $0100,X
	BNE not_carry_162
	INC $0101,X
not_carry_162:
	; 51: 36 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 51: 5 IF if type: (boolean,void)=>void
endblock164:
	; 5:17 NUMBER 81
	LDA #0
	STA STACKACCESS+1
	LDA #81
	STA STACKACCESS
	JSR PUSH16
	; 5: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
	; 53: 25 WORD index type: ()=>number
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
	; 53:33 NUMBER 1
	LDA #0
	STA STACKACCESS+1
	LDA #1
	STA STACKACCESS
	JSR PUSH16
	; 53: 31 MINUS - type: (number,number)=>number
	JSR SUB16
	; 53: 20 PEEK peek type: (number)=>byte
	JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 53: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal171
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal171
	LDA #01
	JMP store171
notequal171:
	LDA #00
store171:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock174
	LDA STACKACCESS + 1
	BNE trueblock174
	JMP endblock174 ; if all zero
trueblock174:
	; Prelude for:
	; 53: 35 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 53: 36 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #9
	TAX
	INC $0100,X
	BNE not_carry_172
	INC $0101,X
not_carry_172:
	; 53: 35 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 53: 5 IF if type: (boolean,void)=>void
endblock174:
	; 5:17 NUMBER 81
	LDA #0
	STA STACKACCESS+1
	LDA #81
	STA STACKACCESS
	JSR PUSH16
	; 5: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
	; 54: 25 WORD index type: ()=>number
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
	; 54:33 NUMBER 1
	LDA #0
	STA STACKACCESS+1
	LDA #1
	STA STACKACCESS
	JSR PUSH16
	; 54: 31 PLUS + type: (number,number)=>number
	JSR ADD16
	; 54: 20 PEEK peek type: (number)=>byte
	JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 54: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal181
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal181
	LDA #01
	JMP store181
notequal181:
	LDA #00
store181:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock184
	LDA STACKACCESS + 1
	BNE trueblock184
	JMP endblock184 ; if all zero
trueblock184:
	; Prelude for:
	; 54: 35 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 54: 36 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #9
	TAX
	INC $0100,X
	BNE not_carry_182
	INC $0101,X
not_carry_182:
	; 54: 35 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 54: 5 IF if type: (boolean,void)=>void
endblock184:
	; 5:17 NUMBER 81
	LDA #0
	STA STACKACCESS+1
	LDA #81
	STA STACKACCESS
	JSR PUSH16
	; 5: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
	; 56: 25 WORD index type: ()=>number
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
	; 56:33 NUMBER 39
	LDA #0
	STA STACKACCESS+1
	LDA #39
	STA STACKACCESS
	JSR PUSH16
	; 56: 31 PLUS + type: (number,number)=>number
	JSR ADD16
	; 56: 20 PEEK peek type: (number)=>byte
	JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 56: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal191
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal191
	LDA #01
	JMP store191
notequal191:
	LDA #00
store191:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock194
	LDA STACKACCESS + 1
	BNE trueblock194
	JMP endblock194 ; if all zero
trueblock194:
	; Prelude for:
	; 56: 36 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 56: 37 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #9
	TAX
	INC $0100,X
	BNE not_carry_192
	INC $0101,X
not_carry_192:
	; 56: 36 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 56: 5 IF if type: (boolean,void)=>void
endblock194:
	; 5:17 NUMBER 81
	LDA #0
	STA STACKACCESS+1
	LDA #81
	STA STACKACCESS
	JSR PUSH16
	; 5: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
	; 57: 25 WORD index type: ()=>number
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
	; 57:33 NUMBER 40
	LDA #0
	STA STACKACCESS+1
	LDA #40
	STA STACKACCESS
	JSR PUSH16
	; 57: 31 PLUS + type: (number,number)=>number
	JSR ADD16
	; 57: 20 PEEK peek type: (number)=>byte
	JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 57: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal201
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal201
	LDA #01
	JMP store201
notequal201:
	LDA #00
store201:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock204
	LDA STACKACCESS + 1
	BNE trueblock204
	JMP endblock204 ; if all zero
trueblock204:
	; Prelude for:
	; 57: 36 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 57: 37 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #9
	TAX
	INC $0100,X
	BNE not_carry_202
	INC $0101,X
not_carry_202:
	; 57: 36 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 57: 5 IF if type: (boolean,void)=>void
endblock204:
	; 5:17 NUMBER 81
	LDA #0
	STA STACKACCESS+1
	LDA #81
	STA STACKACCESS
	JSR PUSH16
	; 5: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
	; 58: 25 WORD index type: ()=>number
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
	; 58:33 NUMBER 41
	LDA #0
	STA STACKACCESS+1
	LDA #41
	STA STACKACCESS
	JSR PUSH16
	; 58: 31 PLUS + type: (number,number)=>number
	JSR ADD16
	; 58: 20 PEEK peek type: (number)=>byte
	JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
; 58: 18 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal211
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal211
	LDA #01
	JMP store211
notequal211:
	LDA #00
store211:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock214
	LDA STACKACCESS + 1
	BNE trueblock214
	JMP endblock214 ; if all zero
trueblock214:
	; Prelude for:
	; 58: 36 BLOCK [inc n] type: ()=>void
	; no stack memory to reserve
	; no child generation for 'inc'
	; 58: 37 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #9
	TAX
	INC $0100,X
	BNE not_carry_212
	INC $0101,X
not_carry_212:
	; 58: 36 BLOCK [inc n] type: ()=>void
	; no stack memory to release
	; 58: 5 IF if type: (boolean,void)=>void
endblock214:
	; 59: 5 WORD n type: ()=>number
	TSX
	TXA
	CLC
	ADC #9
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	JSR PUSH16
; 46: 16 REF_BLOCK :[base Number x Number y Number index base + y + x n 0 if LIFE_CHAR = peek index - 41 [inc n] if LIFE_CHAR = peek index - 40 [inc n] if LIFE_CHAR = peek index - 39 [inc n] if LIFE_CHAR = peek index - 1 [inc n] if LIFE_CHAR = peek index + 1 [inc n] if LIFE_CHAR = peek index + 39 [inc n] if LIFE_CHAR = peek index + 40 [inc n] if LIFE_CHAR = peek index + 41 [inc n] n] type: ()=>number
	; release 10 on the stack
	TSX
	TXA
	CLC
	ADC #10
	TAX
	TXS
	RTS
AFTER_4:
	LDA #<CALL_4
	STA STACKACCESS
	LDA #>CALL_4
	STA STACKACCESS + 1
	JSR PUSH16
	; 46: 1 LIT_WORD get_num_neigh type: (addr)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_get_num_neigh
	LDA STACKACCESS + 1
	STA V_get_num_neigh + 1
	; Prelude for:
; 62: 7 REF_BLOCK :[i 0 while i < WIDTH [j 0 while j < HEIGHT [k i + j cell_state peek SCREEN + k n_neigborough get_num_neigh SCREEN j i new_state cell_state either cell_state = LIFE_CHAR [if n_neigborough < 2 [new_state DEAD_CHAR] if n_neigborough > 3 [new_state DEAD_CHAR]] [if n_neigborough = 3 [new_state LIFE_CHAR]] poke BUFFER + k new_state j j + 40] inc i]] type: ()=>void
	JMP AFTER_5
CALL_5:
	; reserve 2 on the stack for: i (number offset 0)
	TSX
	TXA
	SEC
	SBC #2
	TAX
	TXS
	; 63:8 NUMBER 0
	LDA #0
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	JSR PUSH16
	; 63: 5 LIT_WORD i type: (number)=>void
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
startloop290:
	; 64: 11 WORD i type: ()=>number
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
	; 2:13 NUMBER 10
	LDA #0
	STA STACKACCESS+1
	LDA #10
	STA STACKACCESS
	JSR PUSH16
	; 64: 13 LT < type: (number,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BCC less222
	BNE greaterorequal222
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BCC less222
greaterorequal222:
	LDA #00
	JMP store222
less222:
	LDA #01
store222:
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
	JMP endblock290 ; if all zero
trueblock290:
	; Prelude for:
; 64: 21 BLOCK [j 0 while j < HEIGHT [k i + j cell_state peek SCREEN + k n_neigborough get_num_neigh SCREEN j i new_state cell_state either cell_state = LIFE_CHAR [if n_neigborough < 2 [new_state DEAD_CHAR] if n_neigborough > 3 [new_state DEAD_CHAR]] [if n_neigborough = 3 [new_state LIFE_CHAR]] poke BUFFER + k new_state j j + 40] inc i] type: ()=>void
	; reserve 2 on the stack for: j (number offset 0)
	TSX
	TXA
	SEC
	SBC #2
	TAX
	TXS
	; 65:12 NUMBER 0
	LDA #0
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	JSR PUSH16
	; 65: 9 LIT_WORD j type: (number)=>void
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
startloop287:
	; 66: 15 WORD j type: ()=>number
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
	; 1:14 NUMBER 10
	LDA #0
	STA STACKACCESS+1
	LDA #10
	STA STACKACCESS
	JSR PUSH16
	; 1:19 NUMBER 40
	LDA #0
	STA STACKACCESS+1
	LDA #40
	STA STACKACCESS
	JSR PUSH16
	; 1: 17 MULT * type: (number,number)=>number
	JSR MUL16
	; 66: 17 LT < type: (number,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BCC less229
	BNE greaterorequal229
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BCC less229
greaterorequal229:
	LDA #00
	JMP store229
less229:
	LDA #01
store229:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock287
	LDA STACKACCESS + 1
	BNE trueblock287
	JMP endblock287 ; if all zero
trueblock287:
	; Prelude for:
; 66: 26 BLOCK [k i + j cell_state peek SCREEN + k n_neigborough get_num_neigh SCREEN j i new_state cell_state either cell_state = LIFE_CHAR [if n_neigborough < 2 [new_state DEAD_CHAR] if n_neigborough > 3 [new_state DEAD_CHAR]] [if n_neigborough = 3 [new_state LIFE_CHAR]] poke BUFFER + k new_state j j + 40] type: ()=>void
	; reserve 6 on the stack for: k (number offset 0), cell_state (byte offset 2), n_neigborough (number offset 3), new_state (byte offset 5)
	TSX
	TXA
	SEC
	SBC #6
	TAX
	TXS
	; 67: 16 WORD i type: ()=>number
	TSX
	TXA
	CLC
	ADC #9
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	JSR PUSH16
	; 67: 20 WORD j type: ()=>number
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
	; 67: 18 PLUS + type: (number,number)=>number
	JSR ADD16
	; 67: 13 LIT_WORD k type: (number)=>void
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
	; 3:14 NUMBER 1024
	LDA #4
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	JSR PUSH16
	; 68: 39 WORD k type: ()=>number
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
	; 68: 37 PLUS + type: (number,number)=>number
	JSR ADD16
	; 68: 25 PEEK peek type: (number)=>byte
	JSR POP16
	LDY #0
	LDA (STACKACCESS),Y
	STA STACKACCESS
	STY STACKACCESS+1
	JSR PUSH16
	; 68: 13 LIT_WORD cell_state type: (byte)=>void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #3
	TAX
	LDA STACKACCESS
	STA $0100,X
	; 3:14 NUMBER 1024
	LDA #4
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	JSR PUSH16
	; 69: 49 WORD j type: ()=>number
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
	; 69: 51 WORD i type: ()=>number
	TSX
	TXA
	CLC
	ADC #9
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	JSR PUSH16
	; 69: 28 WORD get_num_neigh type: ()=>number
	LDA V_get_num_neigh
	STA CALL_FUN_242 + 1
	LDA V_get_num_neigh + 1
	STA CALL_FUN_242 + 2
CALL_FUN_242:
	JSR $1111 ; will be overwritten
	; 69: 13 LIT_WORD n_neigborough type: (number)=>void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #4
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
	; 70: 24 WORD cell_state type: ()=>byte
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
	; 70: 13 LIT_WORD new_state type: (byte)=>void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #6
	TAX
	LDA STACKACCESS
	STA $0100,X
	; 71: 20 WORD cell_state type: ()=>byte
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
	; 5:17 NUMBER 81
	LDA #0
	STA STACKACCESS+1
	LDA #81
	STA STACKACCESS
	JSR PUSH16
	; 5: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
; 71: 31 EQ = type: (byte,byte)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal249
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal249
	LDA #01
	JMP store249
notequal249:
	LDA #00
store249:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock276
	LDA STACKACCESS + 1
	BNE trueblock276
	JMP elseblock276 ; if all zero
trueblock276:
	; Prelude for:
	; 71: 43 BLOCK [if n_neigborough < 2 [new_state DEAD_CHAR] if n_neigborough > 3 [new_state DEAD_CHAR]] type: ()=>void
	; no stack memory to reserve
	; 72: 20 WORD n_neigborough type: ()=>number
	TSX
	TXA
	CLC
	ADC #4
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	JSR PUSH16
	; 72:36 NUMBER 2
	LDA #0
	STA STACKACCESS+1
	LDA #2
	STA STACKACCESS
	JSR PUSH16
	; 72: 34 LT < type: (number,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BCC less252
	BNE greaterorequal252
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BCC less252
greaterorequal252:
	LDA #00
	JMP store252
less252:
	LDA #01
store252:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock257
	LDA STACKACCESS + 1
	BNE trueblock257
	JMP endblock257 ; if all zero
trueblock257:
	; Prelude for:
	; 72: 38 BLOCK [new_state DEAD_CHAR] type: ()=>void
	; no stack memory to reserve
	; 6:17 NUMBER 32
	LDA #0
	STA STACKACCESS+1
	LDA #32
	STA STACKACCESS
	JSR PUSH16
	; 6: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
	; 72: 39 SET_WORD new_state type: (byte)=>void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #6
	TAX
	LDA STACKACCESS
	STA $0100,X
	; 72: 38 BLOCK [new_state DEAD_CHAR] type: ()=>void
	; no stack memory to release
	; 72: 17 IF if type: (boolean,void)=>void
endblock257:
	; 73: 20 WORD n_neigborough type: ()=>number
	TSX
	TXA
	CLC
	ADC #4
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	JSR PUSH16
	; 73:36 NUMBER 3
	LDA #0
	STA STACKACCESS+1
	LDA #3
	STA STACKACCESS
	JSR PUSH16
	; 73: 34 GT > type: (number,number)=>boolean
	LDX SP16
	LDA STACKBASE + 2,X
	CMP STACKBASE + 4,X
	BCC greater260
	BNE lessorequal260
	LDA STACKBASE + 1,X
	CMP STACKBASE + 3,X
	BCC greater260
lessorequal260:
	LDA #00
	JMP result260
greater260:
	LDA #01
result260:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock265
	LDA STACKACCESS + 1
	BNE trueblock265
	JMP endblock265 ; if all zero
trueblock265:
	; Prelude for:
	; 73: 38 BLOCK [new_state DEAD_CHAR] type: ()=>void
	; no stack memory to reserve
	; 6:17 NUMBER 32
	LDA #0
	STA STACKACCESS+1
	LDA #32
	STA STACKACCESS
	JSR PUSH16
	; 6: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
	; 73: 39 SET_WORD new_state type: (byte)=>void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #6
	TAX
	LDA STACKACCESS
	STA $0100,X
	; 73: 38 BLOCK [new_state DEAD_CHAR] type: ()=>void
	; no stack memory to release
	; 73: 17 IF if type: (boolean,void)=>void
endblock265:
	; 71: 43 BLOCK [if n_neigborough < 2 [new_state DEAD_CHAR] if n_neigborough > 3 [new_state DEAD_CHAR]] type: ()=>void
	; no stack memory to release
	JMP endblock276
elseblock276:
	; Prelude for:
; 74: 15 BLOCK [if n_neigborough = 3 [new_state LIFE_CHAR]] type: ()=>void
	; no stack memory to reserve
	; 75: 20 WORD n_neigborough type: ()=>number
	TSX
	TXA
	CLC
	ADC #4
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA $0101,X
	STA STACKACCESS + 1
	JSR PUSH16
	; 75:36 NUMBER 3
	LDA #0
	STA STACKACCESS+1
	LDA #3
	STA STACKACCESS
	JSR PUSH16
; 75: 34 EQ = type: (number,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BNE notequal269
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BNE notequal269
	LDA #01
	JMP store269
notequal269:
	LDA #00
store269:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock274
	LDA STACKACCESS + 1
	BNE trueblock274
	JMP endblock274 ; if all zero
trueblock274:
	; Prelude for:
	; 75: 38 BLOCK [new_state LIFE_CHAR] type: ()=>void
	; no stack memory to reserve
	; 5:17 NUMBER 81
	LDA #0
	STA STACKACCESS+1
	LDA #81
	STA STACKACCESS
	JSR PUSH16
	; 5: 20 CAST_BYTE !< type: (number)=>byte
	LDX SP16
	LDA #0
	STA STACKBASE + 2,X
	; 75: 39 SET_WORD new_state type: (byte)=>void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #6
	TAX
	LDA STACKACCESS
	STA $0100,X
	; 75: 38 BLOCK [new_state LIFE_CHAR] type: ()=>void
	; no stack memory to release
	; 75: 17 IF if type: (boolean,void)=>void
endblock274:
; 74: 15 BLOCK [if n_neigborough = 3 [new_state LIFE_CHAR]] type: ()=>void
	; no stack memory to release
	; 71: 13 EITHER either type: (boolean,void,void)=>void
endblock276:
	; 4:14 NUMBER 10000
	LDA #39
	STA STACKACCESS+1
	LDA #16
	STA STACKACCESS
	JSR PUSH16
	; 77: 27 WORD k type: ()=>number
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
	; 77: 25 PLUS + type: (number,number)=>number
	JSR ADD16
	; 77: 29 WORD new_state type: ()=>byte
	TSX
	TXA
	CLC
	ADC #6
	TAX
	LDA $0100,X
	STA STACKACCESS
	LDA #0
	STA STACKACCESS + 1
	JSR PUSH16
	; 77: 13 POKE poke type: (number,byte)=>void
	JSR POP16
	LDY STACKACCESS
	JSR POP16
	TYA
	LDY #0
	STA (STACKACCESS),Y
	; 78: 16 WORD j type: ()=>number
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
	; 78:20 NUMBER 40
	LDA #0
	STA STACKACCESS+1
	LDA #40
	STA STACKACCESS
	JSR PUSH16
	; 78: 18 PLUS + type: (number,number)=>number
	JSR ADD16
	; 78: 13 SET_WORD j type: (number)=>void
	JSR POP16
	TSX
	TXA
	CLC
	ADC #7
	TAX
	LDA STACKACCESS
	STA $0100,X
	LDA STACKACCESS + 1
	STA $0101,X
; 66: 26 BLOCK [k i + j cell_state peek SCREEN + k n_neigborough get_num_neigh SCREEN j i new_state cell_state either cell_state = LIFE_CHAR [if n_neigborough < 2 [new_state DEAD_CHAR] if n_neigborough > 3 [new_state DEAD_CHAR]] [if n_neigborough = 3 [new_state LIFE_CHAR]] poke BUFFER + k new_state j j + 40] type: ()=>void
	; release 6 on the stack
	TSX
	TXA
	CLC
	ADC #6
	TAX
	TXS
	; 66: 9 WHILE while type: (boolean,void)=>void
	JMP startloop287
endblock287:
	; no child generation for 'inc'
	; 80: 9 INC inc type: (number)=>void
	TSX
	TXA
	CLC
	ADC #3
	TAX
	INC $0100,X
	BNE not_carry_288
	INC $0101,X
not_carry_288:
; 64: 21 BLOCK [j 0 while j < HEIGHT [k i + j cell_state peek SCREEN + k n_neigborough get_num_neigh SCREEN j i new_state cell_state either cell_state = LIFE_CHAR [if n_neigborough < 2 [new_state DEAD_CHAR] if n_neigborough > 3 [new_state DEAD_CHAR]] [if n_neigborough = 3 [new_state LIFE_CHAR]] poke BUFFER + k new_state j j + 40] inc i] type: ()=>void
	; release 2 on the stack
	TSX
	TXA
	CLC
	ADC #2
	TAX
	TXS
	; 64: 5 WHILE while type: (boolean,void)=>void
	JMP startloop290
endblock290:
; 62: 7 REF_BLOCK :[i 0 while i < WIDTH [j 0 while j < HEIGHT [k i + j cell_state peek SCREEN + k n_neigborough get_num_neigh SCREEN j i new_state cell_state either cell_state = LIFE_CHAR [if n_neigborough < 2 [new_state DEAD_CHAR] if n_neigborough > 3 [new_state DEAD_CHAR]] [if n_neigborough = 3 [new_state LIFE_CHAR]] poke BUFFER + k new_state j j + 40] inc i]] type: ()=>void
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
	JSR PUSH16
	; 62: 1 LIT_WORD step type: (addr)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_step
	LDA STACKACCESS + 1
	STA V_step + 1
	; 85: 8 WORD time type: ()=>number
	LDA V_time
	STA CALL_FUN_293 + 1
	LDA V_time + 1
	STA CALL_FUN_293 + 2
CALL_FUN_293:
	JSR $1111 ; will be overwritten
	; 85: 1 LIT_WORD start type: (number)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_start
	LDA STACKACCESS + 1
	STA V_start + 1
	; 86: 1 WORD init type: ()=>void
	LDA V_init
	STA CALL_FUN_295 + 1
	LDA V_init + 1
	STA CALL_FUN_295 + 2
CALL_FUN_295:
	JSR $1111 ; will be overwritten
	; 88:4 NUMBER 0
	LDA #0
	STA STACKACCESS+1
	LDA #0
	STA STACKACCESS
	JSR PUSH16
	; 88: 1 LIT_WORD i type: (number)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_i
	LDA STACKACCESS + 1
	STA V_i + 1
startloop305:
	; 89: 7 WORD i type: ()=>number
	LDA V_i
	STA STACKACCESS
	LDA V_i + 1
	STA STACKACCESS + 1
	JSR PUSH16
	; 89:11 NUMBER 10
	LDA #0
	STA STACKACCESS+1
	LDA #10
	STA STACKACCESS
	JSR PUSH16
	; 89: 9 LT < type: (number,number)=>boolean
	LDX SP16
	LDA STACKBASE + 4,X
	CMP STACKBASE + 2,X
	BCC less300
	BNE greaterorequal300
	LDA STACKBASE + 3,X
	CMP STACKBASE + 1,X
	BCC less300
greaterorequal300:
	LDA #00
	JMP store300
less300:
	LDA #01
store300:
	INX
	INX
	STA STACKBASE + 1,X
	LDA #00
	STA STACKBASE + 2,X
	STX SP16
	JSR POP16
	LDA STACKACCESS
	BNE trueblock305
	LDA STACKACCESS + 1
	BNE trueblock305
	JMP endblock305 ; if all zero
trueblock305:
	; Prelude for:
	; 89: 14 BLOCK [show step inc i] type: ()=>void
	; no stack memory to reserve
	; 90: 5 WORD show type: ()=>void
	LDA V_show
	STA CALL_FUN_301 + 1
	LDA V_show + 1
	STA CALL_FUN_301 + 2
CALL_FUN_301:
	JSR $1111 ; will be overwritten
	; 91: 5 WORD step type: ()=>void
	LDA V_step
	STA CALL_FUN_302 + 1
	LDA V_step + 1
	STA CALL_FUN_302 + 2
CALL_FUN_302:
	JSR $1111 ; will be overwritten
	; no child generation for 'inc'
	; 92: 5 INC inc type: (number)=>void
	INC V_i
	BNE not_carry_303
	INC V_i + 1
not_carry_303:
	; 89: 14 BLOCK [show step inc i] type: ()=>void
	; no stack memory to release
	; 89: 1 WHILE while type: (boolean,void)=>void
	JMP startloop305
endblock305:
	; 94: 6 WORD time type: ()=>number
	LDA V_time
	STA CALL_FUN_306 + 1
	LDA V_time + 1
	STA CALL_FUN_306 + 2
CALL_FUN_306:
	JSR $1111 ; will be overwritten
	; 94: 1 LIT_WORD end type: (number)=>void
	JSR POP16
	LDA STACKACCESS
	STA V_end
	LDA STACKACCESS + 1
	STA V_end + 1
	; 95: 7 WORD start type: ()=>number
	LDA V_start
	STA STACKACCESS
	LDA V_start + 1
	STA STACKACCESS + 1
	JSR PUSH16
	; 95: 1 PRINT print type: (number)=>void
	JSR POP16
	JSR PRINT_INT
	LDA #13
	JSR $FFD2
	; 96: 7 WORD end type: ()=>number
	LDA V_end
	STA STACKACCESS
	LDA V_end + 1
	STA STACKACCESS + 1
	JSR PUSH16
	; 96: 1 PRINT print type: (number)=>void
	JSR POP16
	JSR PRINT_INT
	LDA #13
	JSR $FFD2
	; 97:6 STRING "ELAPSED: "
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
	; 97: 1 PRIN prin type: (string)=>void
	JSR PRINT_STRING
	; 97: 24 WORD end type: ()=>number
	LDA V_end
	STA STACKACCESS
	LDA V_end + 1
	STA STACKACCESS + 1
	JSR PUSH16
	; 97: 30 WORD start type: ()=>number
	LDA V_start
	STA STACKACCESS
	LDA V_start + 1
	STA STACKACCESS + 1
	JSR PUSH16
	; 97: 28 MINUS - type: (number,number)=>number
	JSR SUB16
	; 97: 18 PRINT print type: (number)=>void
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
V_HEIGHT DS 2
V_WIDTH DS 2
V_SCREEN DS 2
V_BUFFER DS 2
V_LIFE_CHAR DS 1
V_DEAD_CHAR DS 1
V_time DS 2
V_fill DS 2
V_init DS 2
V_show DS 2
V_get_num_neigh DS 2
V_step DS 2
V_start DS 2
V_i DS 2
V_end DS 2
HEAPSTART: