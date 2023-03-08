#include <stdio.h>

int main() {

    int b = 100;
    int c = 1;
    int i;
    for( i = 0; i < 10000; i++ ) {
        int d = b + c;
    }
    printf("DONE\n");
    return 0;
}