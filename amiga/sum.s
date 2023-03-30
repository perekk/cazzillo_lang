; Includi le definizioni delle chiamate di sistema Amiga
.lib "amiga.lib"

; Definisci le costanti per le chiamate di sistema
SYS_OPEN        equ -36
SYS_CLOSE       equ -38
SYS_WRITE       equ -54
SYS_EXIT        equ -36
STDOUT          equ 1

; Definisci le variabili e le costanti
SECTION data

    num1    dc.b    "2",0
    num2    dc.b    "3",0
    result  ds.b    10

SECTION bss

    buffer  ds.b    1024

; Inizia la sezione del codice
SECTION text

    global _start

_start:
    ; Salva il valore 2 nel registro d0
    moveq   #2, d0
    ; Aggiungi il valore 3 al registro d0
    addq    #3, d0

    ; Converte il risultato da decimale a ASCII
    move.l  d0, -(sp)
    pea     result
    jsr     L'uldiv
    addq.l  #4, sp

    ; Prepara la stringa da stampare
    move.l  #STDOUT, -(sp)
    move.l  #result, -(sp)
    jsr     _strlen
    addq.l  #8, sp

    ; Stampa il risultato
    move.l  #STDOUT, -(sp)
    move.l  #result, -(sp)
    move.l  d0, -(sp)
    jsr     _write
    addq.l  #12, sp

    ; Esci dal programma
    moveq   #0, d0
    moveq   #SYS_EXIT, d1
    trap    #0

; Definisci la funzione _strlen per calcolare la lunghezza della stringa
_strlen:
    moveq   #0, d0
.Lstrloop:
    cmp.b   #0, (a1)+
    bne     .Lstrloop
    subq    #1, d0
    rts

; Definisci la funzione _write per stampare una stringa sullo stdout
_write:
    move.l  #SYS_WRITE, d0
    trap    #0
    rts

; Definisci la funzione _exit per uscire dal programma
_exit:
    moveq   #SYS_EXIT, d0
    trap    #0
    rts
