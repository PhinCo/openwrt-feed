all: lsids

.c.o:
	$(CC) -std=c99 $(CFLAGS) -c -o $@ $<

lsids: lsids.o
	$(CC) $(LDFLAGS) -o $@ $<

clean:
	rm -f *.o lsids
