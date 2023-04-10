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
; no child generation for 'struct'
; no child generation for 'struct'
; 10: 1 STRUCT struct type: (symbol,record)=>void
; Prelude for:
; 15: 7 REF_BLOCK :[s Stack n Number change s -> data s -> tos n s -> tos s -> tos + 1] type: ()=>addr
jmp AFTER_0
CALL_0:
sub rsp, 16
mov [ret_stack_rsp], rsp
mov rsp, rax
; 15: 21 NUMBER Number type: ()=>number
; 15: 18 LIT_WORD n type: (number)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 8
mov [rax], rbx
; 15: 12 WORD Stack type: ()=>Stack
; no asm for constructor
; 15: 9 LIT_WORD s type: (Stack)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 0
mov [rax], rbx
; 16: 10 WORD s type: ()=>Stack
mov rax, [ret_stack_rsp]
add rax, 0
mov rbx, [rax]
push rbx
; no child generation for '->'
; 16: 12 ARROW -> type: (Stack,symbol)=>Array of number
pop rax
add rax, 0
push rax
pop rax
mov rbx, [rax + 8]
push rbx
mov rbx, [rax + 0]
push rbx
; 16: 20 WORD s type: ()=>Stack
mov rax, [ret_stack_rsp]
add rax, 0
mov rbx, [rax]
push rbx
; no child generation for '->'
; 16: 22 ARROW -> type: (Stack,symbol)=>number
pop rax
add rax, 16
push rax
pop rax
mov rbx, [rax + 0]
push rbx
pop rcx
pop rax
pop rbx
imul rcx, 8
add rax, rcx
push rax
; 16: 29 WORD n type: ()=>number
mov rax, [ret_stack_rsp]
add rax, 8
mov rbx, [rax]
push rbx
; 16: 3 CHANGE change type: (Array of number,number,number)=>void
pop rbx
pop rax
mov [rax + 0], rbx
; 17: 3 WORD s type: ()=>Stack
mov rax, [ret_stack_rsp]
add rax, 0
mov rbx, [rax]
push rbx
; no child generation for '->'
; 17: 13 WORD s type: ()=>Stack
mov rax, [ret_stack_rsp]
add rax, 0
mov rbx, [rax]
push rbx
; no child generation for '->'
; 17: 15 ARROW -> type: (Stack,symbol)=>number
pop rax
add rax, 16
push rax
pop rax
mov rbx, [rax + 0]
push rbx
; 17:24 NUMBER 1
push 1
; 17: 22 PLUS + type: (number,number)=>number
pop rax
pop rbx
add rax, rbx
push rax
; 17: 5 SET_ARROW -> type: (Stack,symbol,number)=>void
pop rbx
pop rax
mov [rax + 16], rbx
; 15: 7 REF_BLOCK :[s Stack n Number change s -> data s -> tos n s -> tos s -> tos + 1] type: ()=>addr
mov rax, [ret_stack_rsp]
add rax, 16
mov [ret_stack_rsp], rax
mov rax, rsp
mov rsp, [ret_stack_rsp]
ret
AFTER_0:
push CALL_0
; 15: 1 LIT_WORD push type: (addr)=>void
pop rax
mov [V_push], rax
; Prelude for:
; 20: 6 REF_BLOCK :[s Stack s -> tos s -> tos - 1 s -> data at s -> tos] type: ()=>addr
jmp AFTER_1
CALL_1:
sub rsp, 8
mov [ret_stack_rsp], rsp
mov rsp, rax
; 20: 11 WORD Stack type: ()=>Stack
; no asm for constructor
; 20: 8 LIT_WORD s type: (Stack)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 0
mov [rax], rbx
; 21: 3 WORD s type: ()=>Stack
mov rax, [ret_stack_rsp]
add rax, 0
mov rbx, [rax]
push rbx
; no child generation for '->'
; 21: 13 WORD s type: ()=>Stack
mov rax, [ret_stack_rsp]
add rax, 0
mov rbx, [rax]
push rbx
; no child generation for '->'
; 21: 15 ARROW -> type: (Stack,symbol)=>number
pop rax
add rax, 16
push rax
pop rax
mov rbx, [rax + 0]
push rbx
; 21:24 NUMBER 1
push 1
; 21: 22 MINUS - type: (number,number)=>number
pop rbx
pop rax
sub rax, rbx
push rax
; 21: 5 SET_ARROW -> type: (Stack,symbol,number)=>void
pop rbx
pop rax
mov [rax + 16], rbx
; 22: 3 WORD s type: ()=>Stack
mov rax, [ret_stack_rsp]
add rax, 0
mov rbx, [rax]
push rbx
; no child generation for '->'
; 22: 5 ARROW -> type: (Stack,symbol)=>Array of number
pop rax
add rax, 0
push rax
pop rax
mov rbx, [rax + 8]
push rbx
mov rbx, [rax + 0]
push rbx
; 22: 16 WORD s type: ()=>Stack
mov rax, [ret_stack_rsp]
add rax, 0
mov rbx, [rax]
push rbx
; no child generation for '->'
; 22: 18 ARROW -> type: (Stack,symbol)=>number
pop rax
add rax, 16
push rax
pop rax
mov rbx, [rax + 0]
push rbx
; 22: 13 AT at type: (Array of number,number)=>number
pop rbx
pop rax
pop rcx
imul rbx, 8
add rax, rbx
push rax
; now get the number pointed by the tos
pop rax
mov rbx, [rax + 0]
push rbx
; 20: 6 REF_BLOCK :[s Stack s -> tos s -> tos - 1 s -> data at s -> tos] type: ()=>addr
mov rax, [ret_stack_rsp]
add rax, 8
mov [ret_stack_rsp], rax
mov rax, rsp
mov rsp, [ret_stack_rsp]
ret
AFTER_1:
push CALL_1
; 20: 1 LIT_WORD pop type: (addr)=>void
pop rax
mov [V_pop], rax
; Prelude for:
; 25: 11 REF_BLOCK :[s Stack s -> tos = 0] type: ()=>addr
jmp AFTER_2
CALL_2:
sub rsp, 8
mov [ret_stack_rsp], rsp
mov rsp, rax
; 25: 16 WORD Stack type: ()=>Stack
; no asm for constructor
; 25: 13 LIT_WORD s type: (Stack)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 0
mov [rax], rbx
; 26: 3 WORD s type: ()=>Stack
mov rax, [ret_stack_rsp]
add rax, 0
mov rbx, [rax]
push rbx
; no child generation for '->'
; 26: 5 ARROW -> type: (Stack,symbol)=>number
pop rax
add rax, 16
push rax
pop rax
mov rbx, [rax + 0]
push rbx
; 26:14 NUMBER 0
push 0
; 26: 12 EQ = type: (number,number)=>boolean
pop rax
pop rbx
cmp rax, rbx
jne .not_equal39
push 1
jmp .end39
.not_equal39:
push 0
.end39:
; 25: 11 REF_BLOCK :[s Stack s -> tos = 0] type: ()=>addr
mov rax, [ret_stack_rsp]
add rax, 8
mov [ret_stack_rsp], rax
mov rax, rsp
mov rsp, [ret_stack_rsp]
ret
AFTER_2:
push CALL_2
; 25: 1 LIT_WORD is_empty type: (addr)=>void
pop rax
mov [V_is_empty], rax
; no child generation for 'new'
; Prelude for:
; 3: 16 RECORD [data array 100 Number tos 0] type: ()=>void
mov rax, [ret_stack_rsp]
sub rax, 24
mov [ret_stack_rsp], rax
; 3:29 NUMBER 100
push 100
; no child generation for 'array'
; 3: 23 ARRAY array type: (number,number)=>Array of number
pop rax
push rax
imul rax, 8
call allocate
push rbx
; 3: 17 LIT_WORD data type: (Array of number)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 0
mov [rax], rbx
pop rbx
add rax, 8
mov [rax], rbx
; 3:45 NUMBER 0
push 0
; 3: 40 LIT_WORD tos type: (number)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 16
mov [rax], rbx
; 3: 16 RECORD [data array 100 Number tos 0] type: ()=>void
mov rax, 24
call allocate
mov rdi, rbx
mov rsi, [ret_stack_rsp]
mov rcx, 24
rep movsb
; release 24 on the stack
mov rax, [ret_stack_rsp]
add rax, 24
mov [ret_stack_rsp], rax
push rbx
; 3: 6 NEW new type: (symbol,record)=>Stack
; do heap malloc for size of structure and return back the address
; 3: 1 LIT_WORD stk type: (Stack)=>void
pop rax
mov [V_stk], rax
; 6:4 NUMBER 0
push 0
; 6: 1 LIT_WORD i type: (number)=>void
pop rax
mov [V_i], rax
startloop62:
; 7: 7 WORD i type: ()=>number
mov rax, [V_i]
push rax
; 7:11 NUMBER 100
push 100
; 7: 9 LT < type: (number,number)=>boolean
pop rbx
pop rax
cmp rax, rbx
jl .less54
push 0
jmp .end54
.less54:
push 1
.end54:
pop rax
cmp rax, 0
jne trueblock62
jmp endblock62
trueblock62:
; Prelude for:
; 7: 15 BLOCK [push stk i * i inc i] type: ()=>void
; no stack memory to reserve
; 8: 8 WORD stk type: ()=>Stack
mov rax, [V_stk]
push rax
; 8: 12 WORD i type: ()=>number
mov rax, [V_i]
push rax
; 8: 16 WORD i type: ()=>number
mov rax, [V_i]
push rax
; 8: 14 MULT * type: (number,number)=>number
pop rbx
pop rax
mul rbx
push rax
; 8: 3 WORD push type: ()=>void
mov rbx, [V_push]
mov rax, rsp
mov rsp, [ret_stack_rsp]
call rbx
mov [ret_stack_rsp], rsp
mov rsp, rax
; no child generation for 'inc'
; 9: 3 INC inc type: (number)=>void
add qword [V_i], 1
; 7: 15 BLOCK [push stk i * i inc i] type: ()=>void
; no stack memory to release
; 7: 1 WHILE while type: (boolean,void)=>void
jmp startloop62
endblock62:
; 12:4 NUMBER 0
push 0
; 12: 1 SET_WORD i type: (number)=>void
pop rax
mov [V_i], rax
startloop78:
; Prelude for:
; 13: 7 BLOCK [is_empty stk] type: ()=>boolean
; no stack memory to reserve
; 13: 17 WORD stk type: ()=>Stack
mov rax, [V_stk]
push rax
; 13: 8 WORD is_empty type: ()=>boolean
mov rbx, [V_is_empty]
mov rax, rsp
mov rsp, [ret_stack_rsp]
call rbx
mov [ret_stack_rsp], rsp
mov rsp, rax
; 13: 7 BLOCK [is_empty stk] type: ()=>boolean
; no stack memory to release
; 13: 22 NOT ! type: (boolean)=>boolean
pop rax
xor rax, 0xFFFFFFFFFFFFFFFF
inc rax
inc rax
push rax
pop rax
cmp rax, 0
jne trueblock78
jmp endblock78
trueblock78:
; Prelude for:
; 13: 24 BLOCK [prin i prin ):  print pop stk inc i] type: ()=>void
; no stack memory to reserve
; 14: 8 WORD i type: ()=>number
mov rax, [V_i]
push rax
; 14: 3 PRIN prin type: (number)=>void
pop rax
call print_uint
; 14:15 STRING "): "
push 3
push str0
; 14: 10 PRIN prin type: (string)=>void
pop rax
mov rsi, rax
pop rax
mov rdx, rax
mov rax, 4
mov rdi, 1
syscall
; 14: 31 WORD stk type: ()=>Stack
mov rax, [V_stk]
push rax
; 14: 27 WORD pop type: ()=>number
mov rbx, [V_pop]
mov rax, rsp
mov rsp, [ret_stack_rsp]
call rbx
mov [ret_stack_rsp], rsp
mov rsp, rax
; 14: 21 PRINT print type: (number)=>void
pop rax
call print_uint
call print_lf
; no child generation for 'inc'
; 15: 3 INC inc type: (number)=>void
add qword [V_i], 1
; 13: 24 BLOCK [prin i prin ):  print pop stk inc i] type: ()=>void
; no stack memory to release
; 13: 1 WHILE while type: (boolean,void)=>void
jmp startloop78
endblock78:
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
str0 db 41,58,32
section .bss
V_nanosleep: resb 8
V_Stack: resb 24
V_push: resb 8
V_pop: resb 8
V_is_empty: resb 8
V_stk: resb 24
V_i: resb 8
mem_top: resb 8
ret_stack_rsp: resb 8
ret_stack: resb 655360
ret_stack_end:
mem: resb 655360