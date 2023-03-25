; Prelude for:
; 1: 1 PROG [prog] type: ()=>void
BITS 64
section .text
global	_start
_start:
mov rax, ret_stack_end
mov [ret_stack_rsp], rax
; Prelude for:
; 1: 8 REF_BLOCK :[SHOULD RETURN: 7 INFACT IS] type: ()=>addr
jmp AFTER_0
CALL_0:
sub rsp, 0
mov [ret_stack_rsp], rsp
mov rsp, rax
; 1:10 STRING "SHOULD RETURN: 7 INFACT IS"
push 26
push str0
; 1: 8 REF_BLOCK :[SHOULD RETURN: 7 INFACT IS] type: ()=>addr
mov rax, [ret_stack_rsp]
add rax, 0
mov [ret_stack_rsp], rax
mov rax, rsp
mov rsp, [ret_stack_rsp]
ret
AFTER_0:
push CALL_0
; 1: 1 LIT_WORD const type: (addr)=>void
pop rax
mov [V_const], rax
; Prelude for:
; 2: 9 REF_BLOCK :[x Number y Number [x + y * y]] type: ()=>addr
jmp AFTER_1
CALL_1:
sub rsp, 16
mov [ret_stack_rsp], rsp
mov rsp, rax
; 2: 28 NUMBER Number type: ()=>number
; DO NOTHING
; 2: 23 LIT_WORD y type: (number)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 8
mov [rax], rbx
; 2: 14 NUMBER Number type: ()=>number
; DO NOTHING
; 2: 11 LIT_WORD x type: (number)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 0
mov [rax], rbx
; Prelude for:
; 2: 35 BLOCK [x + y * y] type: ()=>number
; no stack memory to reserve
; 2: 36 WORD x type: ()=>number
mov rax, [ret_stack_rsp]
add rax, 0
mov rbx, [rax]
push rbx
; 2: 40 WORD y type: ()=>number
mov rax, [ret_stack_rsp]
add rax, 8
mov rbx, [rax]
push rbx
; 2: 44 WORD y type: ()=>number
mov rax, [ret_stack_rsp]
add rax, 8
mov rbx, [rax]
push rbx
; 2: 42 MULT * type: (number,number)=>number
pop rbx
pop rax
mul rbx
push rax
; 2: 38 PLUS + type: (number,number)=>number
pop rax
pop rbx
add rax, rbx
push rax
; 2: 35 BLOCK [x + y * y] type: ()=>number
; no stack memory to release
; 2: 9 REF_BLOCK :[x Number y Number [x + y * y]] type: ()=>addr
mov rax, [ret_stack_rsp]
add rax, 16
mov [ret_stack_rsp], rax
mov rax, rsp
mov rsp, [ret_stack_rsp]
ret
AFTER_1:
push CALL_1
; 2: 1 LIT_WORD double type: (addr)=>void
pop rax
mov [V_double], rax
; Prelude for:
; 3: 9 REF_BLOCK :[msg String num Number [prin msg prin = print num]] type: ()=>addr
jmp AFTER_2
CALL_2:
sub rsp, 24
mov [ret_stack_rsp], rsp
mov rsp, rax
; 3: 28 NUMBER Number type: ()=>number
; DO NOTHING
; 3: 23 LIT_WORD num type: (number)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 16
mov [rax], rbx
; 3: 16 STRING String type: ()=>string
; 3: 11 LIT_WORD msg type: (string)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 0
mov [rax], rbx
pop rbx
add rax, 8
mov [rax], rbx
; Prelude for:
; 3: 35 BLOCK [prin msg prin = print num] type: ()=>void
; no stack memory to reserve
; 3: 41 WORD msg type: ()=>string
mov rax, [ret_stack_rsp]
add rax, 0
mov rcx, [rax]
add rax, 8
mov rbx, [rax]
push rbx
push rcx
; 3: 36 PRIN prin type: (string)=>void
pop rax
mov rsi, rax
pop rax
mov rdx, rax
mov rax, 4
mov rdi, 1
syscall
; 3:50 STRING "="
push 1
push str1
; 3: 45 PRIN prin type: (string)=>void
pop rax
mov rsi, rax
pop rax
mov rdx, rax
mov rax, 4
mov rdi, 1
syscall
; 3: 60 WORD num type: ()=>number
mov rax, [ret_stack_rsp]
add rax, 16
mov rbx, [rax]
push rbx
; 3: 54 PRINT print type: (number)=>void
pop rax
call print_uint
call print_lf
; 3: 35 BLOCK [prin msg prin = print num] type: ()=>void
; no stack memory to release
; 3: 9 REF_BLOCK :[msg String num Number [prin msg prin = print num]] type: ()=>addr
mov rax, [ret_stack_rsp]
add rax, 24
mov [ret_stack_rsp], rax
mov rax, rsp
mov rsp, [ret_stack_rsp]
ret
AFTER_2:
push CALL_2
; 3: 1 LIT_WORD log type: (addr)=>void
pop rax
mov [V_log], rax
; 4: 5 WORD const type: ()=>string
mov rbx, [V_const]
mov rax, rsp
mov rsp, [ret_stack_rsp]
call rbx
mov [ret_stack_rsp], rsp
mov rsp, rax
; 4:18 NUMBER 3
push 3
; 4:20 NUMBER 2
push 2
; 4: 11 WORD double type: ()=>number
mov rbx, [V_double]
mov rax, rsp
mov rsp, [ret_stack_rsp]
call rbx
mov [ret_stack_rsp], rsp
mov rsp, rax
; 4: 1 WORD log type: ()=>void
mov rbx, [V_log]
mov rax, rsp
mov rsp, [ret_stack_rsp]
call rbx
mov [ret_stack_rsp], rsp
mov rsp, rax
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
str0 db 83,72,79,85,76,68,32,82,69,84,85,82,78,58,32,55,32,73,78,70,65,67,84,32,73,83
str1 db 61
section .bss
V_const: resb 8
V_double: resb 8
V_log: resb 8
ret_stack_rsp: resb 8
ret_stack: resb 655360
ret_stack_end: