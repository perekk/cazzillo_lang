#include <stdio.h>
#include <termios.h>
#include <errno.h>

int main() {
    struct termios t;
    printf("size of termios: %lu\n", sizeof(t.c_cc));

    printf("EBADF: %lu\n", EBADF);
    printf("ENOTTY: %lu\n", ENOTTY);
    printf("ENOTTY: %lu\n", ENOTTY);
    printf("EINVAL: %lu\n", EINVAL);
    printf("EFAULT: %lu\n", EFAULT);
    return 0;
}