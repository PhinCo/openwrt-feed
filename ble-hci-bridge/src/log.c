#include <log.h>
#include <stdio.h>
#include <stdarg.h>

static FILE *fd = NULL;

void Log_Init() {
//	if (fd != NULL) return;
//	fd = fopen("/root/playground.log", "w");
}

int Log_Log(char* format, ...)
{
//	if (fd == NULL) return 0;

    va_list argptr;
    va_start(argptr, format);
//	int res = vfprintf(fd, format, argptr);
	vprintf(format, argptr);
    va_end(argptr);

//	if (res < 0) {
//		return 0;
//	}
//	fflush(fd);
	return 1;
}

void Log_Finish() {
	if (fd != NULL) {
	   fclose(fd);
	}
}

