#include <fcntl.h>
#include <stdint.h>
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>

#define GPIO_FILE "/sys/devices/virtual/gpio/gpio2/value"
#define EXEC_COMMAND "mtd"
#define EXEC_ARGS {"mtd", "-r", "erase", "/dev/mtd4"}

void main() {
  int countdown = 10;
  uint8_t muhByte;
  int rc;
  int fd = open(GPIO_FILE, O_RDONLY, 0);
  char* args[] = EXEC_ARGS;
  while (1) {
    lseek(fd, 0, SEEK_SET);
    rc = read(fd, &muhByte, 1);
    if (muhByte == '1') {
      printf("%d\n", countdown);
      if (--countdown == 0) {
        execvp(EXEC_COMMAND, args);
      }
    } else {
      countdown = 10;
    }
    if (rc != 1) {
      break;
    }
    sleep(1);
  }
}
