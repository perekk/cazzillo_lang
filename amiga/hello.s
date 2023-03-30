SECTION code

    ; include the Amiga libraries
    include "amiga.lib"

    ; entry point for the program
    start:
        ; open the console device for writing
        move.l  #CON:, a0
        move.l  #1, d0
        jsr     _OpenLibrary

        ; write the message to the console
        lea     message, a1
        move.l  #14, d0
        jsr     _Write

        ; close the console device
        jsr     _CloseLibrary

        ; exit the program
        move.l  #0, d0
        rts

    ; message to display
    message:
        dc.b    "Hello, world!", 0

    ; end of the program
    end start
