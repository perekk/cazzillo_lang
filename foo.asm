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
; Prelude for:
; 4: 12 REF_BLOCK :[msec Number drop syscall3 240 [array [0 1000000 * msec]] !addr 0] type: ()=>addr
jmp AFTER_0
CALL_0:
sub rsp, 8
mov [ret_stack_rsp], rsp
mov rsp, rax
; 4: 20 NUMBER Number type: ()=>number
; 4: 14 LIT_WORD msec type: (number)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 0
mov [rax], rbx
; 2:19 NUMBER 240
push 240
; Prelude for:
; 13: 31 BLOCK [array [0 1000000 * msec]] type: ()=>Array of number
; no stack memory to reserve
; Prelude for:
; 13: 38 DATA_BLOCK [0 1000000 * msec] type: ()=>addr
; 13:41 NUMBER 1000000
push 1000000
; 13: 51 WORD msec type: ()=>number
mov rax, [ret_stack_rsp]
add rax, 0
mov rbx, [rax]
push rbx
; 13: 49 MULT * type: (number,number)=>number
pop rbx
pop rax
mul rbx
push rax
; 13:39 NUMBER 0
push 0
; 13: 38 DATA_BLOCK [0 1000000 * msec] type: ()=>addr
mov rax, 16
call allocate
mov rsi, rsp
mov rdi, rbx
mov rcx, 16
rep movsb
add rsp, 16
push 2
push rbx
; 13: 32 ARRAY array type: (addr)=>Array of number
; 13: 31 BLOCK [array [0 1000000 * msec]] type: ()=>Array of number
; no stack memory to release
; 13: 58 ADDR !addr type: (Array of number)=>number
pop rax
pop rbx
push rax
; 13:64 NUMBER 0
push 0
; 13: 8 SYSCALL syscall3 type: (number,number,number)=>number
pop rsi
pop rdi
pop rax
syscall
push rax
; 13: 3 DROP drop type: (number)=>void
pop rax
; 4: 12 REF_BLOCK :[msec Number drop syscall3 240 [array [0 1000000 * msec]] !addr 0] type: ()=>addr
mov rax, [ret_stack_rsp]
add rax, 8
mov [ret_stack_rsp], rax
mov rax, rsp
mov rsp, [ret_stack_rsp]
ret
AFTER_0:
push CALL_0
; 4: 1 LIT_WORD nanosleep type: (addr)=>void
pop rax
mov [V_nanosleep], rax
; 3:11 NUMBER 800
push 800
; 3: 1 WORD nanosleep type: ()=>void
mov rbx, [V_nanosleep]
mov rax, rsp
mov rsp, [ret_stack_rsp]
call rbx
mov [ret_stack_rsp], rsp
mov rsp, rax
; 4:7 STRING "FINITO!"
push 7
push str0
; 4: 1 PRINT print type: (string)=>void
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
str0 db 70,73,78,73,84,79,33
section .bss
V_nanosleep: resb 8
mem_top: resb 8
ret_stack_rsp: resb 8
ret_stack: resb 655360
ret_stack_end:
mem: resb 655360