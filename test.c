#include <sys/time.h>
#include <time.h>
#include <sys/types.h>
#include <errno.h>
#include <stdio.h>
#include <unistd.h>

int main() {
    struct timespec req;
    struct timespec rem;
    req.tv_sec = 0;
    req.tv_nsec = 500000000;    
    nanosleep(&req, NULL);
    return 0;
}
