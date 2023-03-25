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
; 1:13 NUMBER 10
push 10
; no child generation for 'array'
; 1: 7 ARRAY array type: (number,number)=>Array of number
pop rax
mov rbx, [mem_top]
imul rax, 8
add rax, rbx
mov [mem_top], rax
push rbx
; 1: 1 LIT_WORD arr1 type: (Array of number)=>void
pop rax
mov [V_arr1], rax
; 2:4 NUMBER 0
push 0
; 2: 1 LIT_WORD i type: (number)=>void
pop rax
mov [V_i], rax
startloop24:
; 3: 7 WORD i type: ()=>number
mov rax, [V_i]
push rax
; 3:11 NUMBER 10
push 10
; 3: 9 LT < type: (number,number)=>boolean
pop rbx
pop rax
cmp rax, rbx
jl .less7
push 0
jmp .end7
.less7:
push 1
.end7:
pop rax
cmp rax, 0
jne trueblock24
jmp endblock24
trueblock24:
; Prelude for:
; 3: 14 BLOCK [change arr1 i i * 2 prin i prin )  print arr1 at i inc i] type: ()=>void
; no stack memory to reserve
; 4: 10 WORD arr1 type: ()=>Array of number
mov rax, [V_arr1]
push rax
; 4: 15 WORD i type: ()=>number
mov rax, [V_i]
push rax
pop rbx
pop rax
imul rbx, 8
add rax, rbx
push rax
; 4: 17 WORD i type: ()=>number
mov rax, [V_i]
push rax
; 4:21 NUMBER 2
push 2
; 4: 19 MULT * type: (number,number)=>number
pop rbx
pop rax
mul rbx
push rax
; 4: 3 CHANGE change type: (Array of number,number,number)=>void
pop rbx
pop rax
mov [rax], rbx
; 5: 8 WORD i type: ()=>number
mov rax, [V_i]
push rax
; 5: 3 PRIN prin type: (number)=>void
pop rax
call print_uint
; 5:15 STRING ") "
push 2
push str0
; 5: 10 PRIN prin type: (string)=>void
pop rax
mov rsi, rax
pop rax
mov rdx, rax
mov rax, 4
mov rdi, 1
syscall
; 5: 26 WORD arr1 type: ()=>Array of number
mov rax, [V_arr1]
push rax
; 5: 34 WORD i type: ()=>number
mov rax, [V_i]
push rax
; 5: 31 AT at type: (Array of number,number)=>number
pop rbx
pop rax
imul rbx, 8
add rax, rbx
; now get the number pointed by the aux
mov rbx, [rax + 0]
push rbx
; 5: 20 PRINT print type: (number)=>void
pop rax
call print_uint
call print_lf
; no child generation for 'inc'
; 6: 3 INC inc type: (number)=>void
add qword [V_i], 1
; 3: 14 BLOCK [change arr1 i i * 2 prin i prin )  print arr1 at i inc i] type: ()=>void
; no stack memory to release
; 3: 1 WHILE while type: (boolean,void)=>void
jmp startloop24
endblock24:
; no child generation for 'struct'
; no child generation for 'struct'
; 9: 1 STRUCT struct type: (symbol,record)=>void
; Prelude for:
; 15: 14 REF_BLOCK :[n Number points array n Point i 0 while i < n [change points i new Point [label POINT x i * i y i * 2] inc i] points] type: ()=>addr
jmp AFTER_0
CALL_0:
sub rsp, 24
mov [ret_stack_rsp], rsp
mov rsp, rax
; 15: 19 NUMBER Number type: ()=>number
; 15: 16 LIT_WORD n type: (number)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 0
mov [rax], rbx
; 16: 17 WORD n type: ()=>number
mov rax, [ret_stack_rsp]
add rax, 0
mov rbx, [rax]
push rbx
; no child generation for 'array'
; 16: 11 ARRAY array type: (number,Point)=>Array of Point
pop rax
mov rbx, [mem_top]
imul rax, 32
add rax, rbx
mov [mem_top], rax
push rbx
; 16: 3 LIT_WORD points type: (Array of Point)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 8
mov [rax], rbx
; 17:6 NUMBER 0
push 0
; 17: 3 LIT_WORD i type: (number)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 16
mov [rax], rbx
startloop53:
; 18: 9 WORD i type: ()=>number
mov rax, [ret_stack_rsp]
add rax, 16
mov rbx, [rax]
push rbx
; 18: 13 WORD n type: ()=>number
mov rax, [ret_stack_rsp]
add rax, 0
mov rbx, [rax]
push rbx
; 18: 11 LT < type: (number,number)=>boolean
pop rbx
pop rax
cmp rax, rbx
jl .less35
push 0
jmp .end35
.less35:
push 1
.end35:
pop rax
cmp rax, 0
jne trueblock53
jmp endblock53
trueblock53:
; Prelude for:
; 18: 15 BLOCK [change points i new Point [label POINT x i * i y i * 2] inc i] type: ()=>void
; no stack memory to reserve
; 19: 12 WORD points type: ()=>Array of Point
mov rax, [ret_stack_rsp]
add rax, 8
mov rbx, [rax]
push rbx
; 19: 19 WORD i type: ()=>number
mov rax, [ret_stack_rsp]
add rax, 16
mov rbx, [rax]
push rbx
pop rbx
pop rax
imul rbx, 8
add rax, rbx
push rax
; no child generation for 'new'
; Prelude for:
; 19: 31 RECORD [label POINT x i * i y i * 2] type: ()=>void
mov rax, [ret_stack_rsp]
sub rax, 32
mov [ret_stack_rsp], rax
; 20:14 STRING "POINT"
push 5
push str1
; 20: 7 LIT_WORD label type: (string)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 0
mov [rax], rbx
pop rbx
add rax, 8
mov [rax], rbx
; 21: 10 WORD i type: ()=>number
mov rax, [ret_stack_rsp]
add rax, 48
mov rbx, [rax]
push rbx
; 21: 14 WORD i type: ()=>number
mov rax, [ret_stack_rsp]
add rax, 48
mov rbx, [rax]
push rbx
; 21: 12 MULT * type: (number,number)=>number
pop rbx
pop rax
mul rbx
push rax
; 21: 7 LIT_WORD x type: (number)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 16
mov [rax], rbx
; 22: 10 WORD i type: ()=>number
mov rax, [ret_stack_rsp]
add rax, 48
mov rbx, [rax]
push rbx
; 22:14 NUMBER 2
push 2
; 22: 12 MULT * type: (number,number)=>number
pop rbx
pop rax
mul rbx
push rax
; 22: 7 LIT_WORD y type: (number)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 24
mov [rax], rbx
; 19: 31 RECORD [label POINT x i * i y i * 2] type: ()=>void
mov rax, 32
call allocate
mov rdi, rbx
mov rsi, [ret_stack_rsp]
mov rcx, 32
rep movsb
; release 32 on the stack
mov rax, [ret_stack_rsp]
add rax, 32
mov [ret_stack_rsp], rax
push rbx
; 19: 21 NEW new type: (symbol,record)=>Point
; do heap malloc for size of structure and return back the address
; 19: 5 CHANGE change type: (Array of Point,number,Point)=>void
pop rbx
pop rax
mov [rax], rbx
; no child generation for 'inc'
; 24: 5 INC inc type: (number)=>void
mov rax, [ret_stack_rsp]
add rax, 16
add qword [rax], 1
; 18: 15 BLOCK [change points i new Point [label POINT x i * i y i * 2] inc i] type: ()=>void
; no stack memory to release
; 18: 3 WHILE while type: (boolean,void)=>void
jmp startloop53
endblock53:
; 26: 3 WORD points type: ()=>Array of Point
mov rax, [ret_stack_rsp]
add rax, 8
mov rbx, [rax]
push rbx
; 15: 14 REF_BLOCK :[n Number points array n Point i 0 while i < n [change points i new Point [label POINT x i * i y i * 2] inc i] points] type: ()=>addr
mov rax, [ret_stack_rsp]
add rax, 24
mov [ret_stack_rsp], rax
mov rax, rsp
mov rsp, [ret_stack_rsp]
ret
AFTER_0:
push CALL_0
; 15: 1 LIT_WORD init_points type: (addr)=>void
pop rax
mov [V_init_points], rax
; Prelude for:
; 29: 15 REF_BLOCK :[arr array Point n Number i 0 while i < n [prin arr at i print  ! inc i]] type: ()=>addr
jmp AFTER_1
CALL_1:
sub rsp, 24
mov [ret_stack_rsp], rsp
mov rsp, rax
; 29: 37 NUMBER Number type: ()=>number
; 29: 34 LIT_WORD n type: (number)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 8
mov [rax], rbx
; 29: 28 WORD Point type: ()=>Point
; no asm for constructor
; 29: 22 ARRAY_TYPE array type: (Point)=>Array of Point
; DO NOTHING
; 29: 17 LIT_WORD arr type: (Array of Point)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 0
mov [rax], rbx
; 30:6 NUMBER 0
push 0
; 30: 3 LIT_WORD i type: (number)=>void
pop rbx
mov rax, [ret_stack_rsp]
add rax, 16
mov [rax], rbx
startloop75:
; 31: 9 WORD i type: ()=>number
mov rax, [ret_stack_rsp]
add rax, 16
mov rbx, [rax]
push rbx
; 31: 13 WORD n type: ()=>number
mov rax, [ret_stack_rsp]
add rax, 8
mov rbx, [rax]
push rbx
; 31: 11 LT < type: (number,number)=>boolean
pop rbx
pop rax
cmp rax, rbx
jl .less66
push 0
jmp .end66
.less66:
push 1
.end66:
pop rax
cmp rax, 0
jne trueblock75
jmp endblock75
trueblock75:
; Prelude for:
; 31: 15 BLOCK [prin arr at i print  ! inc i] type: ()=>void
; no stack memory to reserve
; 32: 10 WORD arr type: ()=>Array of Point
mov rax, [ret_stack_rsp]
add rax, 0
mov rbx, [rax]
push rbx
; 32: 17 WORD i type: ()=>number
mov rax, [ret_stack_rsp]
add rax, 16
mov rbx, [rax]
push rbx
; 32: 14 AT at type: (Array of Point,number)=>Point
pop rbx
pop rax
imul rbx, 8
add rax, rbx
; now get the Point pointed by the aux
mov rbx, [rax + 0]
push rbx
; 32: 5 PRIN prin type: (Point)=>void
pop rax
push rax
mov rbx, [rax + 8]
push rbx
mov rbx, [rax]
push rbx
pop rax
mov rsi, rax
pop rax
mov rdx, rax
mov rax, 4
mov rdi, 1
syscall
pop rax
mov rcx, 32
call emit
add rax, 16
push rax
mov rbx, [rax]
push rbx
pop rax
call print_uint
pop rax
mov rcx, 32
call emit
add rax, 8
push rax
mov rbx, [rax]
push rbx
pop rax
call print_uint
pop rax
; 32:25 STRING " !"
push 2
push str2
; 32: 19 PRINT print type: (string)=>void
pop rax
mov rsi, rax
pop rax
mov rdx, rax
mov rax, 4
mov rdi, 1
syscall
call print_lf
; no child generation for 'inc'
; 33: 5 INC inc type: (number)=>void
mov rax, [ret_stack_rsp]
add rax, 16
add qword [rax], 1
; 31: 15 BLOCK [prin arr at i print  ! inc i] type: ()=>void
; no stack memory to release
; 31: 3 WHILE while type: (boolean,void)=>void
jmp startloop75
endblock75:
; 29: 15 REF_BLOCK :[arr array Point n Number i 0 while i < n [prin arr at i print  ! inc i]] type: ()=>addr
mov rax, [ret_stack_rsp]
add rax, 24
mov [ret_stack_rsp], rax
mov rax, rsp
mov rsp, [ret_stack_rsp]
ret
AFTER_1:
push CALL_1
; 29: 1 LIT_WORD print_points type: (addr)=>void
pop rax
mov [V_print_points], rax
; 37:19 NUMBER 10
push 10
; 37: 7 WORD init_points type: ()=>Array of Point
mov rbx, [V_init_points]
mov rax, rsp
mov rsp, [ret_stack_rsp]
call rbx
mov [ret_stack_rsp], rsp
mov rsp, rax
; 37: 1 LIT_WORD arr2 type: (Array of Point)=>void
pop rax
mov [V_arr2], rax
; 38: 14 WORD arr2 type: ()=>Array of Point
mov rax, [V_arr2]
push rax
; 38:19 NUMBER 10
push 10
; 38: 1 WORD print_points type: ()=>void
mov rbx, [V_print_points]
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
str0 db 41,32
str1 db 80,79,73,78,84
str2 db 32,33
section .bss
V_arr1: resb 8
V_i: resb 8
V_Point: resb 32
V_init_points: resb 8
V_print_points: resb 8
V_arr2: resb 8
mem_top: resb 8
ret_stack_rsp: resb 8
ret_stack: resb 655360
ret_stack_end:
mem: resb 655360