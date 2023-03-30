#!/bin/sh

rm *.o *.asm *.prg *.sym *.core
rm examples/*.o examples/*.asm examples/*.prg examples/*.sym examples/*.core
find . -type f -executable -exec rm '{}' \;