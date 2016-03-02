all: gjallarhorn

.c.o:
	$(CC) -std=c99 $(CFLAGS) -c -o $@ $<

gjallarhorn: gjallarhorn.o
	$(CC) $(LDFLAGS) -o $@ $<

clean:
	rm -f *.o gjallarhorn
