#include <fcntl.h>
#include <stdint.h>
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>

#define GPIO_FILE "/sys/devices/virtual/gpio/gpio2/value"

void main() {
  int countdown = 10;
  uint8_t muhByte;
  int rc;
  int fd = open(GPIO_FILE, O_RDONLY, 0);

  while (1) {
    lseek(fd, 0, SEEK_SET);
    rc = read(fd, &muhByte, 1);
    if (muhByte == '1') {
      printf("%d\n", countdown);
      if (--countdown == 0) {
	system("/usr/bin/resetled.sh");
	system("/sbin/mtd -r erase /dev/mtd4");
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
