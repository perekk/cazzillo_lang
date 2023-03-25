; Prelude for:
; 1: 1 PROG [prog] type: ()=>void
BITS 64
section .text
global	_start
_start:
mov rax, ret_stack_end
mov [ret_stack_rsp], rax
; Prelude for:
; 1: 10 REF_BLOCK :[x Number [x + 1]] type: ()=>addr
jmp AFTER_0
CALL_0:
sub rsp, 8
mov [ret_stack_rsp], rsp
mov rsp, rax
; 1: 15 NUMBER Number type: ()=>number
; DO NOTHING
; 1: 12 LIT_WORD x type: (number)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 0
mov [rax], rbx
; Prelude for:
; 1: 22 BLOCK [x + 1] type: ()=>number
; no stack memory to reserve
; 1: 23 WORD x type: ()=>number
mov rax, [ret_stack_rsp]
add rax, 0
mov rbx, [rax]
push rbx
; 1:27 NUMBER 1
push 1
; 1: 25 PLUS + type: (number,number)=>number
pop rax
pop rbx
add rax, rbx
push rax
; 1: 22 BLOCK [x + 1] type: ()=>number
; no stack memory to release
; 1: 10 REF_BLOCK :[x Number [x + 1]] type: ()=>addr
mov rax, [ret_stack_rsp]
add rax, 8
mov [ret_stack_rsp], rax
mov rax, rsp
mov rsp, [ret_stack_rsp]
ret
AFTER_0:
push CALL_0
; 1: 1 LIT_WORD plusone type: (addr)=>void
pop rax
mov [V_plusone], rax
; 2:15 NUMBER 1
push 1
; 2: 7 WORD plusone type: ()=>number
mov rbx, [V_plusone]
mov rax, rsp
mov rsp, [ret_stack_rsp]
call rbx
mov [ret_stack_rsp], rsp
mov rsp, rax
; 2: 1 PRINT print type: (number)=>void
pop rax
call print_uint
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
dec rsp
mov[rsp], byte 0x0A;line feed
mov rsi, rsp;
mov rdx, 1
mov rax, 4
mov rdi, 1
syscall
inc rsp
ret
section .data
section .bss
V_plusone: resb 8
ret_stack_rsp: resb 8
ret_stack: resb 655360
ret_stack_end: