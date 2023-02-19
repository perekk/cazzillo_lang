	processor 6502 ; TEH BEAST
	ORG $0801 ; BASIC STARTS HERE
	HEX 0C 08 0A 00 9E 20 32 30 36 34 00 00 00
	ORG $0810 ; MY PROGRAM STARTS HERE
	; value
	LDA #65
	PHA
	; value
	LDA #20
	PHA
	; value
	LDA #30
	PHA
	; 1:15 <
	PLA
	STA ADD_AUX ; second operand
	PLA ; first operand
	CMP ADD_AUX
	BCC I_1; salta se < 
	LDA #0
	JMP I_2
I_1: LDA #1
I_2: PHA
	; 1:10 +
	PLA
	STA ADD_AUX
	PLA
	CLC
	ADC ADD_AUX
	PHA
	; 1:1 print
	PLA
	JSR $FFD2 ; C64 print char on the screen
	RTS
ADD_AUX DS 1 ; USED IN ADD INSTRUCTION