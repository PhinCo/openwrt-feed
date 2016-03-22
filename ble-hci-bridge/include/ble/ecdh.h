#ifndef __ECDH_H__
#define __ECDH_H__

#include <openssl/evp.h>

struct KeyPair_t {
	EVP_PKEY *private;
	unsigned char *public;
	int publicLength;
};

typedef struct KeyPair_t KeyPair;

int generateKeyPair(KeyPair *kp);
unsigned char *deriveSecret(EVP_PKEY *private, unsigned char *public, int publicLength, size_t *secret_length);

#endif
