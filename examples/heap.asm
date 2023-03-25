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
; 1:4 STRING "CAZZILLI"
push 8
push str0
; 1: 1 LIT_WORD a type: (string)=>void
pop rax
mov [V_a], rax
pop rax
mov [V_a+8], rax
; 2:4 STRING "BUS"
push 3
push str1
; 2: 1 LIT_WORD b type: (string)=>void
pop rax
mov [V_b], rax
pop rax
mov [V_b+8], rax
; 3: 4 WORD a type: ()=>string
mov rax, [V_a + 8]
push rax
mov rax, [V_a]
push rax
; 3: 8 WORD b type: ()=>string
mov rax, [V_b + 8]
push rax
mov rax, [V_b]
push rax
; 3: 6 STR_JOIN . type: (string,string)=>string
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
; 3: 1 LIT_WORD c type: (string)=>void
pop rax
mov [V_c], rax
pop rax
mov [V_c+8], rax
; 5:4 STRING "SALTA"
push 5
push str2
; 5: 1 SET_WORD a type: (string)=>void
pop rax
mov [V_a], rax
pop rax
mov [V_a+8], rax
; 6:4 STRING "FANCHIO"
push 7
push str3
; 6: 1 SET_WORD b type: (string)=>void
pop rax
mov [V_b], rax
pop rax
mov [V_b+8], rax
; 7: 4 WORD a type: ()=>string
mov rax, [V_a + 8]
push rax
mov rax, [V_a]
push rax
; 7: 8 WORD b type: ()=>string
mov rax, [V_b + 8]
push rax
mov rax, [V_b]
push rax
; 7: 6 STR_JOIN . type: (string,string)=>string
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
; 7: 1 LIT_WORD d type: (string)=>void
pop rax
mov [V_d], rax
pop rax
mov [V_d+8], rax
; 9:4 STRING "PISPOLO"
push 7
push str4
; 9: 1 SET_WORD a type: (string)=>void
pop rax
mov [V_a], rax
pop rax
mov [V_a+8], rax
; 10:4 STRING ""
push 0
push str5
; 10: 1 SET_WORD b type: (string)=>void
pop rax
mov [V_b], rax
pop rax
mov [V_b+8], rax
; 11: 4 WORD a type: ()=>string
mov rax, [V_a + 8]
push rax
mov rax, [V_a]
push rax
; 11: 8 WORD b type: ()=>string
mov rax, [V_b + 8]
push rax
mov rax, [V_b]
push rax
; 11: 6 STR_JOIN . type: (string,string)=>string
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
; 11: 1 LIT_WORD e type: (string)=>void
pop rax
mov [V_e], rax
pop rax
mov [V_e+8], rax
; 13:4 STRING ""
push 0
push str6
; 13: 1 SET_WORD a type: (string)=>void
pop rax
mov [V_a], rax
pop rax
mov [V_a+8], rax
; 14:4 STRING "BIELLE"
push 6
push str7
; 14: 1 SET_WORD b type: (string)=>void
pop rax
mov [V_b], rax
pop rax
mov [V_b+8], rax
; 15: 4 WORD a type: ()=>string
mov rax, [V_a + 8]
push rax
mov rax, [V_a]
push rax
; 15: 8 WORD b type: ()=>string
mov rax, [V_b + 8]
push rax
mov rax, [V_b]
push rax
; 15: 6 STR_JOIN . type: (string,string)=>string
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
; 15: 1 LIT_WORD f type: (string)=>void
pop rax
mov [V_f], rax
pop rax
mov [V_f+8], rax
; 17: 7 WORD c type: ()=>string
mov rax, [V_c + 8]
push rax
mov rax, [V_c]
push rax
; 17: 1 PRINT print type: (string)=>void
pop rax
mov rsi, rax
pop rax
mov rdx, rax
mov rax, 4
mov rdi, 1
syscall
call print_lf
; 18: 7 WORD d type: ()=>string
mov rax, [V_d + 8]
push rax
mov rax, [V_d]
push rax
; 18: 1 PRINT print type: (string)=>void
pop rax
mov rsi, rax
pop rax
mov rdx, rax
mov rax, 4
mov rdi, 1
syscall
call print_lf
; 19: 7 WORD e type: ()=>string
mov rax, [V_e + 8]
push rax
mov rax, [V_e]
push rax
; 19: 1 PRINT print type: (string)=>void
pop rax
mov rsi, rax
pop rax
mov rdx, rax
mov rax, 4
mov rdi, 1
syscall
call print_lf
; 20: 7 WORD f type: ()=>string
mov rax, [V_f + 8]
push rax
mov rax, [V_f]
push rax
; 20: 1 PRINT print type: (string)=>void
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
allocate:
mov rbx, [mem_top]
add [mem_top], rax
ret
section .data
str0 db 67,65,90,90,73,76,76,73
str1 db 66,85,83
str2 db 83,65,76,84,65
str3 db 70,65,78,67,72,73,79
str4 db 80,73,83,80,79,76,79
str5 db 
str6 db 
str7 db 66,73,69,76,76,69
section .bss
V_a: resb 16
V_b: resb 16
V_c: resb 16
V_d: resb 16
V_e: resb 16
V_f: resb 16
mem_top: resb 8
ret_stack_rsp: resb 8
ret_stack: resb 655360
ret_stack_end:
mem: resb 655360