; Prelude for:
; 1: 1 PROG [prog] type: ()=>void
BITS 64
section .text
global	_start
_start:
mov rax, ret_stack_end
mov [ret_stack_rsp], rax
mov rax, mem
mov [mem_top], rax
; 1:15 STRING "YESS"
push 4
push str0
; 2:19 STRING " works !"
push 8
push str1
; 2: 17 STR_JOIN . type: (string,string)=>string
pop r8
pop r9
pop r10
pop r11
mov rax, r9
add rax, r11
call allocate
mov rsi, r10
mov rdi, rbx
mov rcx, r11
rep movsb
mov rsi, r8
mov rcx, r9
rep movsb
push rax
push rbx
; 2: 1 PRINT print type: (string)=>void
pop rax
mov rsi, rax
pop rax
mov rdx, rax
mov rax, 4
mov rdi, 1
syscall
call print_lf
; 1: 1 PROG [prog] type: ()=>void
mov rax, 1
mov rdi, 0
syscall
print_uint:
; division in 64bit save the quotient into rax and the reminder in rdx
xor rcx, rcx
mov r8, 10
.loop:
xor rdx, rdx; clearing the register that is going to be used as holder for the reminder
div r8
add dl, 0x30; make the reminder printable in ascii conversion 0x30 is '0'
dec rsp; reduce one byte from the address placed in rsp(freeing one byte of memory)
mov[rsp], dl; pour one byte into the address pointed
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
; the syscall is going to look at what is in memory at the address loaded in rsi(BE CAREFULL) and not at the content of rdi
pop rcx
add rsp, rcx; when printed we can free the stack
ret
print_lf:
mov rcx, 10
call emit
ret
emit:
push rdx
push rax
push rdi
push rsi
push rcx
mov rsi, rsp
mov rdx, 1
mov rax, 4
mov rdi, 1
syscall
pop rcx
pop rsi
pop rdi
pop rax
pop rdx
ret
allocate:
mov rbx, [mem_top]
add [mem_top], rax
ret
section .data
str0 db 89,69,83,83
str1 db 32,119,111,114,107,115,32,33
section .bss
mem_top: resb 8
ret_stack_rsp: resb 8
ret_stack: resb 655360
ret_stack_end:
mem: resb 655360