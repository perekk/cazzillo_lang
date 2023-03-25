BITS 64

section	.text

global	_start

print_uint:
; division in 64bit save the quotient into rax and the reminder in rdx
  xor rcx, rcx
  mov r8, 10
  dec rsp    
  mov [rsp], byte 0x0A ;line feed
  inc rcx
  .loop:
    xor rdx, rdx ; clearing the register that is going to be used as holder for the reminder
    div r8
    add dl, 0x30; make the reminder printable in ascii conversion 0x30 is '0'
    dec rsp ; reduce one byte from the address placed in rsp (freeing one byte of memory)
    mov [rsp], dl; pour one byte into the address pointed
    inc rcx
    test rax, rax
    jnz .loop    
  
  .print_chars_on_stack:
    xor rax, rax
    mov rsi, rsp;
    mov rdx, rcx
    push rcx
    mov rax, 4
    mov rdi, 1
    syscall; rsi e rdx are respectively buffer starting point and length in byte
          ; the syscall is going to look at what is in memory at the address loaded in rsi (BE CAREFULL) and not at the content of rdi
    pop rcx
    add rsp, rcx; when printed we can free the stack
  ret

_start:
mov rax, 4
mov rdi, 1
mov rsi, hello
mov rdx, hbytes
syscall

mov rax, 69
call print_uint

mov rax, 4
mov rdi, 1
mov rsi, hello
mov rdx, hbytes
syscall


mov rax, 1
mov rdi, 0
syscall

section	.data
hello	db	'Hello, World!', 0Ah
hbytes	equ	$-hello

section	.bss
var1: resb 8
var2: resb 8
var3: resb 8
