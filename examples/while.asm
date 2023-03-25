; Prelude for:
; 1: 1 PROG [prog] type: ()=>void
BITS 64
section .text
global	_start
_start:
mov rax, ret_stack_end
mov [ret_stack_rsp], rax
; 1:4 NUMBER 0
push 0
; 1: 1 LIT_WORD a type: (number)=>void
pop rax
mov [V_a], rax
; 2:4 STRING "CAZZILLO"
push 8
push str0
; 2: 1 LIT_WORD b type: (string)=>void
pop rax
mov [V_b], rax
pop rax
mov [V_b+8], rax
startloop20:
; 4: 7 WORD a type: ()=>number
mov rax, [V_a]
push rax
; 4:11 NUMBER 100
push 100
; 4: 9 LT < type: (number,number)=>boolean
pop rbx
pop rax
cmp rax, rbx
jl .less6
push 0
jmp .end6
.less6:
push 1
.end6:
pop rax
cmp rax, 0
jne trueblock20
jmp endblock20
trueblock20:
; Prelude for:
; 4: 15 BLOCK [c 0 a a + 1 c a prin c prin , ] type: ()=>void
mov rax, [ret_stack_rsp]
sub rax, 8
mov [ret_stack_rsp], rax
; 5:8 NUMBER 0
push 0
; 5: 5 LIT_WORD c type: (number)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 0
mov [rax], rbx
; 6: 8 WORD a type: ()=>number
mov rax, [V_a]
push rax
; 6:12 NUMBER 1
push 1
; 6: 10 PLUS + type: (number,number)=>number
pop rax
pop rbx
add rax, rbx
push rax
; 6: 5 SET_WORD a type: (number)=>void
pop rax
mov [V_a], rax
; 7: 8 WORD a type: ()=>number
mov rax, [V_a]
push rax
; 7: 5 SET_WORD c type: (number)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 0
mov [rax], rbx
; 8: 10 WORD c type: ()=>number
mov rax, [ret_stack_rsp]
add rax, 0
mov rbx, [rax]
push rbx
; 8: 5 PRIN prin type: (number)=>void
pop rax
call print_uint
; 8:17 STRING ", "
push 2
push str1
; 8: 12 PRIN prin type: (string)=>void
pop rax
mov rsi, rax
pop rax
mov rdx, rax
mov rax, 4
mov rdi, 1
syscall
; 4: 15 BLOCK [c 0 a a + 1 c a prin c prin , ] type: ()=>void
; release 8 on the stack
mov rax, [ret_stack_rsp]
add rax, 8
mov [ret_stack_rsp], rax
; 4: 1 WHILE while type: (boolean,void)=>void
jmp startloop20
endblock20:
; 10: 7 WORD b type: ()=>string
mov rax, [V_b + 8]
push rax
mov rax, [V_b]
push rax
; 10: 1 PRINT print type: (string)=>void
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
str0 db 67,65,90,90,73,76,76,79
str1 db 44,32
section .bss
V_a: resb 8
V_b: resb 16
ret_stack_rsp: resb 8
ret_stack: resb 655360
ret_stack_end: