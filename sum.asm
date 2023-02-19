	processor 6502 ; TEH BEAST
	ORG $0801 ; BASIC STARTS HERE
	HEX 0C 08 0A 00 9E 20 32 30 36 34 00 00 00
	ORG $0810 ; MY PROGRAM STARTS HERE
	JSR INITSTACK
	; value
	LDA #0
	STA stackaccess+1
	LDA #147
	STA stackaccess
	JSR PUSH16
		; 1:1 print
	JSR POP16
	JSR PRINT_INT
	; value
	LDA #0
	STA stackaccess+1
	LDA #10
	STA stackaccess
	JSR PUSH16
	; value
	LDA #0
	STA stackaccess+1
	LDA #22
	STA stackaccess
	JSR PUSH16
		; 2:10 +
	JSR ADD16
	; value
	LDA #0
	STA stackaccess+1
	LDA #35
	STA stackaccess
	JSR PUSH16
		; 2:15 +
	JSR ADD16
		; 2:1 print
	JSR POP16
	JSR PRINT_INT
	; value
	LDA #0
	STA stackaccess+1
	LDA #30
	STA stackaccess
	JSR PUSH16
	; value
	LDA #0
	STA stackaccess+1
	LDA #35
	STA stackaccess
	JSR PUSH16
		; 3:10 +
	JSR ADD16
		; 3:1 print
	JSR POP16
	JSR PRINT_INT
	; value
	LDA #0
	STA stackaccess+1
	LDA #30
	STA stackaccess
	JSR PUSH16
	; value
	LDA #0
	STA stackaccess+1
	LDA #34
	STA stackaccess
	JSR PUSH16
		; 4:10 +
	JSR ADD16
	; value
	LDA #0
	STA stackaccess+1
	LDA #26
	STA stackaccess
	JSR PUSH16
		; 4:15 +
	JSR ADD16
		; 4:1 print
	JSR POP16
	JSR PRINT_INT
	; value
	LDA #0
	STA stackaccess+1
	LDA #90
	STA stackaccess
	JSR PUSH16
		; 5:1 print
	JSR POP16
	JSR PRINT_INT
	RTS
AUX_REG DS 1 ; USED IN ADD INSTRUCTION
BCD DS 3 ; USED IN BIN TO BCD
stackaccess = $0080
stackbase = $0000
INITSTACK:
	ldx #$FF
	rts
PUSH16:
	lda stackaccess + 1          ; first byte(big end)
	sta stackbase,X
	dex
	lda stackaccess            ; second byte(little end)
	sta stackbase,X
	dex
	rts
POP16:
	lda stackbase + 1,X          ; the little end
	sta stackaccess
	inx
	lda stackbase + 1,X          ; retrieve second byte
	sta stackaccess + 1
	inx
	rts
dup16:
	lda stackbase + 2,X          ; copy big end byte to next available slot
	sta stackbase,X
	dex
	lda stackbase + 2,X          ; do again for little end
	sta stackbase,X
	dex
	rts
swap16:
	; first, do a dup
	lda stackbase + 2,X; copy big end byte to next available slot
	sta stackbase,X
	dex
	lda stackbase + 2,X; do again for little end
	sta stackbase,X
	dex
	; stack has now grown by one
	; now copy item from slot 3 to slot 2
	; low end byte is already in accumulator
	lda stackbase + 5,X
	sta stackbase + 3,X
	lda stackbase + 6,X
	sta stackbase + 4,X
	; now copy top-of-stack item into slot 3
	lda stackbase + 1,X
	sta stackbase + 5,X
	lda stackbase + 2,X
	sta stackbase + 6,X
	; discard temporary value on the top of the stack
	inx
	inx
	rts
	;; Add the two 16 - byte words on the top of the stack, leaving
	;; the result on the stack in their place.
ADD16:
	clc; clear carry
	lda stackbase + 1,X; add the lower byte
	adc stackbase + 3,X
	sta stackbase + 3,X; put it back in the second slot
	lda stackbase + 2,X; then the upper byte
	adc stackbase + 4,X
	sta stackbase + 4,X; again, back in the second slot
	inx; shink the stack so that sum is now
	inx; in the top slot
	rts
	;; Subtract the two 16 - byte words on the top of the stack, leaving
	;; the result on the stack in their place.
SUB16:
	sec; set the carry
	lda stackbase + 3,X; substract the lower byte
	sbc stackbase + 1,X
	sta stackbase + 3,X; put it back in the second slot
	lda stackbase + 4,X; then the upper byte
	sbc stackbase + 2,X
	sta stackbase + 4,X; again, back in the second slot
	inx; shink the stack so that result is now
	inx; in the top slot
	rts
BINBCD16: SED ; Switch to decimal mode
	LDA #0 ; Ensure the result is clear
	STA BCD + 0
	STA BCD + 1
	STA BCD + 2
	LDX #16 ; The number of source bits
CNVBIT: ASL stackaccess + 0 ; Shift out one bit
	ROL stackaccess + 1
	LDA BCD + 0 ; And add into result
	ADC BCD + 0
	STA BCD + 0
	LDA BCD + 1 ; propagating any carry
	ADC BCD + 1
	STA BCD + 1
	LDA BCD + 2 ; ...thru whole result
	ADC BCD + 2
	STA BCD + 2
	DEX ; And repeat for next bit
	BNE CNVBIT
	CLD; Back to binary
	RTS
PRINT_INT:
	JSR BINBCD16
	LDA BCD+2
	AND #$0F
	CLC
	ADC #$30
	JSR $FFD2
	LDA BCD+1
	LSR
	LSR
	LSR
	LSR
	CLC
	ADC #$30
	JSR $FFD2
	LDA BCD+1
	AND #$0F
	CLC
	ADC #$30
	JSR $FFD2
	LDA BCD+0
	LSR
	LSR
	LSR
	LSR
	CLC
	ADC #$30
	JSR $FFD2
	LDA BCD+0
	AND #$0F
	CLC
	ADC #$30
	JSR $FFD2
	LDA #13
	JSR $FFD2
	RTS