#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>

#define DEFAULT_BLOCK_DEVICE "/dev/mtdblock5"

#define ETH0_MAC_OFFSET 0x0000 /* not a typo */
#define WLAN0_MAC_OFFSET 0x1002
#define SERNO_OFFSET 0x1008
#define BT_MAC_OFFSET 0xf000
#define BT_TRIM_OFFSET 0xf006

void read_bytes(FILE* src, char* buf, int offset, int len) {
  fseek(src, offset, 0);
  fread(buf, 1, len, src);
}

void read_hex(FILE* src, char* buf, int offset, int len, char delim) {
  char raw[len];
  read_bytes(src, raw, offset, len);
  int width = (delim != '\0') ? 3 : 2;
  for (int i = 0; i < len; ++i) {
    snprintf(buf + i * width, 2, "%x", ((raw[i] >> 4) & 0xf));
    snprintf(buf + i * width + 1, 2, "%x", (raw[i] & 0xf));
    if ((delim != '\0') && (i < (len - 1))) {
      snprintf(buf + i * width + 2, 2, "%c", delim);
    }
  }
}

int read_mac(FILE* src, char* buf, int offset) {
  read_hex(src, buf, offset, 6, ':');
}

int main(int argc, char** argv) {
  char* path = {0};
  if (argc > 1) {
    path = argv[1];
  } else {
    path = DEFAULT_BLOCK_DEVICE;
  }

  FILE* src = fopen(path, "rb");
  if (src == NULL) {
    fprintf(stderr, "failed opening input file\n");
    return 1;
  }

  // serial is already an ASCII string, requires no conversion
  char serial[21];
  serial[20] = '\0';
  read_bytes(src, serial, SERNO_OFFSET, 20);

  // 6 bytes becomes fe:ed:fa:ce:be:ef - 17 chars
  char btmac[18];
  btmac[17] = '\0';
  read_mac(src, btmac, BT_MAC_OFFSET);

  char bttrim[3];
  bttrim[2] = '\0';
  read_hex(src, bttrim, BT_TRIM_OFFSET, 1, '\0');

  // 6 bytes becomes fe:ed:fa:ce:be:ef - 17 chars
  char eth0[18];
  btmac[17] = '\0';
  read_mac(src, eth0, ETH0_MAC_OFFSET);
  
  // 6 bytes becomes fe:ed:fa:ce:be:ef - 17 chars
  char wlan0[18];
  btmac[17] = '\0';
  read_mac(src, wlan0, WLAN0_MAC_OFFSET);

  // print it all in a simple JSON wrapper
  printf("{\"serial\":\"%s\",\"btmac\":\"%s\",\"bttrim\":\"%s\",\"eth0\":\"%s\",\"wlan0\":\"%s\"}\n",
         serial, btmac, bttrim, eth0, wlan0);
}
