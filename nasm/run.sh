#!/bin/sh

 nasm -f elf64 test.asm && ld -m elf_amd64_fbsd -o test -s test.o && ./test