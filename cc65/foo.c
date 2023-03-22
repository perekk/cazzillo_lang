#include <stdio.h>
#define PEEK(addr)         (*(unsigned char*) (addr))

int main() {
    int start_time = PEEK(161) * 256 + PEEK(162);
    int b = 100;
    int c = 1;    
    int i;
    int end_time;
    for(i = 0; i<10000; i++ ) {
        int d = b + c;
    }
    
    end_time = PEEK(161) * 256 + PEEK(162);    
    printf("DONE IN %d JIFFY\n", end_time - start_time);
    return 0;
}