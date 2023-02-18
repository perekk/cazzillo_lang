	processor 6502 ; TEH BEAST
	ORG $0801 ; BASIC STARTS HERE
	HEX 0C 08 0A 00 9E 20 32 30 36 34 00 00 00
	ORG $0810 ; MY PROGRAM STARTS HERE
	; value
	LDA #147
	PHA
	; 1:1 print
	PLA
	JSR $FFD2 ; C64 print char on the screen
	; value
	LDA #10
	PHA
	; value
	LDA #22
	PHA
	; 2:10 +
	PLA
	STA ADD_AUX
	PLA
	ADC ADD_AUX
	PHA
	; value
	LDA #35
	PHA
	; 2:15 +
	PLA
	STA ADD_AUX
	PLA
	ADC ADD_AUX
	PHA
	; 2:1 print
	PLA
	JSR $FFD2 ; C64 print char on the screen
	; value
	LDA #30
	PHA
	; value
	LDA #35
	PHA
	; 3:10 +
	PLA
	STA ADD_AUX
	PLA
	ADC ADD_AUX
	PHA
	; 3:1 print
	PLA
	JSR $FFD2 ; C64 print char on the screen
	; value
	LDA #30
	PHA
	; value
	LDA #34
	PHA
	; 4:10 +
	PLA
	STA ADD_AUX
	PLA
	ADC ADD_AUX
	PHA
	; value
	LDA #26
	PHA
	; 4:15 +
	PLA
	STA ADD_AUX
	PLA
	ADC ADD_AUX
	PHA
	; 4:1 print
	PLA
	JSR $FFD2 ; C64 print char on the screen
	; value
	LDA #90
	PHA
	; 5:1 print
	PLA
	JSR $FFD2 ; C64 print char on the screen
	RTS
ADD_AUX DS 1 ; USED IN ADD INSTRUCTION