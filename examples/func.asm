; Prelude for:
; 1: 1 PROG [prog] type: ()=>void
BITS 64
section .text
global	_start
_start:
mov rax, ret_stack_end
mov [ret_stack_rsp], rax
; Prelude for:
; 1: 4 REF_BLOCK :[print 69] type: ()=>addr
jmp AFTER_0
CALL_0:
sub rsp, 0
mov [ret_stack_rsp], rsp
mov rsp, rax
; 1:12 NUMBER 69
push 69
; 1: 6 PRINT print type: (number)=>void
pop rax
call print_uint
call print_lf
; 1: 4 REF_BLOCK :[print 69] type: ()=>addr
mov rax, [ret_stack_rsp]
add rax, 0
mov [ret_stack_rsp], rax
mov rax, rsp
mov rsp, [ret_stack_rsp]
ret
AFTER_0:
push CALL_0
; 1: 1 LIT_WORD a type: (addr)=>void
pop rax
mov [V_a], rax
; Prelude for:
; 3: 8 REF_BLOCK :[69] type: ()=>addr
jmp AFTER_1
CALL_1:
sub rsp, 0
mov [ret_stack_rsp], rsp
mov rsp, rax
; 3:10 NUMBER 69
push 69
; 3: 8 REF_BLOCK :[69] type: ()=>addr
mov rax, [ret_stack_rsp]
add rax, 0
mov [ret_stack_rsp], rax
mov rax, rsp
mov rsp, [ret_stack_rsp]
ret
AFTER_1:
push CALL_1
; 3: 1 LIT_WORD const type: (addr)=>void
pop rax
mov [V_const], rax
; Prelude for:
; 4: 9 REF_BLOCK :[false] type: ()=>addr
jmp AFTER_2
CALL_2:
sub rsp, 0
mov [ret_stack_rsp], rsp
mov rsp, rax
; 4:11 BOOL false
push 0
; 4: 9 REF_BLOCK :[false] type: ()=>addr
mov rax, [ret_stack_rsp]
add rax, 0
mov [ret_stack_rsp], rax
mov rax, rsp
mov rsp, [ret_stack_rsp]
ret
AFTER_2:
push CALL_2
; 4: 1 LIT_WORD const2 type: (addr)=>void
pop rax
mov [V_const2], rax
; Prelude for:
; 5: 9 REF_BLOCK :[2 + 3 * 4] type: ()=>addr
jmp AFTER_3
CALL_3:
sub rsp, 0
mov [ret_stack_rsp], rsp
mov rsp, rax
; 5:13 NUMBER 14
push 14
; 5: 9 REF_BLOCK :[2 + 3 * 4] type: ()=>addr
mov rax, [ret_stack_rsp]
add rax, 0
mov [ret_stack_rsp], rax
mov rax, rsp
mov rsp, [ret_stack_rsp]
ret
AFTER_3:
push CALL_3
; 5: 1 LIT_WORD const3 type: (addr)=>void
pop rax
mov [V_const3], rax
; Prelude for:
; 6: 9 REF_BLOCK :[CAZZILLO] type: ()=>addr
jmp AFTER_4
CALL_4:
sub rsp, 0
mov [ret_stack_rsp], rsp
mov rsp, rax
; 6:11 STRING "CAZZILLO"
push 8
push str0
; 6: 9 REF_BLOCK :[CAZZILLO] type: ()=>addr
mov rax, [ret_stack_rsp]
add rax, 0
mov [ret_stack_rsp], rax
mov rax, rsp
mov rsp, [ret_stack_rsp]
ret
AFTER_4:
push CALL_4
; 6: 1 LIT_WORD const4 type: (addr)=>void
pop rax
mov [V_const4], rax
; Prelude for:
; 7: 6 REF_BLOCK :[print const print const2 print const3 print const4 prin LOG  prin SI  print FUNGE!] type: ()=>addr
jmp AFTER_5
CALL_5:
sub rsp, 0
mov [ret_stack_rsp], rsp
mov rsp, rax
; 8: 11 WORD const type: ()=>number
mov rbx, [V_const]
mov rax, rsp
mov rsp, [ret_stack_rsp]
call rbx
mov [ret_stack_rsp], rsp
mov rsp, rax
; 8: 5 PRINT print type: (number)=>void
pop rax
call print_uint
call print_lf
; 9: 11 WORD const2 type: ()=>boolean
mov rbx, [V_const2]
mov rax, rsp
mov rsp, [ret_stack_rsp]
call rbx
mov [ret_stack_rsp], rsp
mov rsp, rax
; 9: 5 PRINT print type: (boolean)=>void
pop rax
cmp rax, 0
jne .not_zero19
push 'N'
jmp .print19
.not_zero19:
push 'Y'
.print19:
mov rsi, rsp
mov rdx, 1
mov rax, 4
mov rdi, 1
syscall
call print_lf
; 10: 11 WORD const3 type: ()=>number
mov rbx, [V_const3]
mov rax, rsp
mov rsp, [ret_stack_rsp]
call rbx
mov [ret_stack_rsp], rsp
mov rsp, rax
; 10: 5 PRINT print type: (number)=>void
pop rax
call print_uint
call print_lf
; 11: 11 WORD const4 type: ()=>string
mov rbx, [V_const4]
mov rax, rsp
mov rsp, [ret_stack_rsp]
call rbx
mov [ret_stack_rsp], rsp
mov rsp, rax
; 11: 5 PRINT print type: (string)=>void
pop rax
mov rsi, rax
pop rax
mov rdx, rax
mov rax, 4
mov rdi, 1
syscall
call print_lf
; 12:10 STRING "LOG "
push 4
push str1
; 12: 5 PRIN prin type: (string)=>void
pop rax
mov rsi, rax
pop rax
mov rdx, rax
mov rax, 4
mov rdi, 1
syscall
; 13:10 STRING "SI "
push 3
push str2
; 13: 5 PRIN prin type: (string)=>void
pop rax
mov rsi, rax
pop rax
mov rdx, rax
mov rax, 4
mov rdi, 1
syscall
; 14:11 STRING "FUNGE!"
push 6
push str3
; 14: 5 PRINT print type: (string)=>void
pop rax
mov rsi, rax
pop rax
mov rdx, rax
mov rax, 4
mov rdi, 1
syscall
call print_lf
; 7: 6 REF_BLOCK :[print const print const2 print const3 print const4 prin LOG  prin SI  print FUNGE!] type: ()=>addr
mov rax, [ret_stack_rsp]
add rax, 0
mov [ret_stack_rsp], rax
mov rax, rsp
mov rsp, [ret_stack_rsp]
ret
AFTER_5:
push CALL_5
; 7: 1 LIT_WORD log type: (addr)=>void
pop rax
mov [V_log], rax
; Prelude for:
; 17: 7 REF_BLOCK :[drawline :[print -------] drawline log] type: ()=>addr
jmp AFTER_6
CALL_6:
sub rsp, 8
mov [ret_stack_rsp], rsp
mov rsp, rax
; Prelude for:
; 18: 15 REF_BLOCK :[print -------] type: ()=>addr
jmp AFTER_7
CALL_7:
sub rsp, 0
mov [ret_stack_rsp], rsp
mov rsp, rax
; 18:23 STRING "-------"
push 7
push str4
; 18: 17 PRINT print type: (string)=>void
pop rax
mov rsi, rax
pop rax
mov rdx, rax
mov rax, 4
mov rdi, 1
syscall
call print_lf
; 18: 15 REF_BLOCK :[print -------] type: ()=>addr
mov rax, [ret_stack_rsp]
add rax, 0
mov [ret_stack_rsp], rax
mov rax, rsp
mov rsp, [ret_stack_rsp]
ret
AFTER_7:
push CALL_7
; 18: 5 LIT_WORD drawline type: (addr)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 0
mov [rax], rbx
; 19: 5 WORD drawline type: ()=>void
mov rax, [ret_stack_rsp]
add rax, 0
mov rbx, [rax]
mov rax, rsp
mov rsp, [ret_stack_rsp]
call rbx
mov [ret_stack_rsp], rsp
mov rsp, rax
; 20: 5 WORD log type: ()=>void
mov rbx, [V_log]
mov rax, rsp
mov rsp, [ret_stack_rsp]
call rbx
mov [ret_stack_rsp], rsp
mov rsp, rax
; 17: 7 REF_BLOCK :[drawline :[print -------] drawline log] type: ()=>addr
mov rax, [ret_stack_rsp]
add rax, 8
mov [ret_stack_rsp], rax
mov rax, rsp
mov rsp, [ret_stack_rsp]
ret
AFTER_6:
push CALL_6
; 17: 1 LIT_WORD test type: (addr)=>void
pop rax
mov [V_test], rax
; 23: 1 WORD test type: ()=>void
mov rbx, [V_test]
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
str0 db 67,65,90,90,73,76,76,79
str1 db 76,79,71,32
str2 db 83,73,32
str3 db 70,85,78,71,69,33
str4 db 45,45,45,45,45,45,45
section .bss
V_a: resb 8
V_const: resb 8
V_const2: resb 8
V_const3: resb 8
V_const4: resb 8
V_log: resb 8
V_test: resb 8
ret_stack_rsp: resb 8
ret_stack: resb 655360
ret_stack_end: