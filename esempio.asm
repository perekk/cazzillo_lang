	processor 6502 ; TEH BEAST
	ORG $0801 ; BASIC STARTS HERE
	HEX 0C 08 0A 00 9E 20 32 30 36 34 00 00 00
	ORG $0810 ; MY PROGRAM STARTS HERE
; value
	LDA #147
	PHA
; PRINT
	PLA
	JSR $FFD2 ; C64 print char on the screen
; value
	LDA #10
	PHA
; value
	LDA #22
	PHA
; ADD
	PLA
	STA ADD_AUX
	PLA
	ADC ADD_AUX
	PHA
; value
	LDA #35
	PHA
; ADD
	PLA
	STA ADD_AUX
	PLA
	ADC ADD_AUX
	PHA
; PRINT
	PLA
	JSR $FFD2 ; C64 print char on the screen
; value
	LDA #30
	PHA
; value
	LDA #35
	PHA
; ADD
	PLA
	STA ADD_AUX
	PLA
	ADC ADD_AUX
	PHA
; PRINT
	PLA
	JSR $FFD2 ; C64 print char on the screen
; value
	LDA #30
	PHA
; value
	LDA #34
	PHA
; ADD
	PLA
	STA ADD_AUX
	PLA
	ADC ADD_AUX
	PHA
; value
	LDA #26
	PHA
; ADD
	PLA
	STA ADD_AUX
	PLA
	ADC ADD_AUX
	PHA
; PRINT
	PLA
	JSR $FFD2 ; C64 print char on the screen
; value
	LDA #90
	PHA
; PRINT
	PLA
	JSR $FFD2 ; C64 print char on the screen
	RTS
ADD_AUX DS 1 ; USED IN ADD INSTRUCTION