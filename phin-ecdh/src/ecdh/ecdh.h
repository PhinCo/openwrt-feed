#ifndef __ECDH_H__
#define __ECDH_H__

#include <openssl/evp.h>

struct KeyPair_t {
	EVP_PKEY *privateKey;
	unsigned char *publicKey;
	int publicLength;
};

typedef struct KeyPair_t KeyPair;

int generateKeyPair(KeyPair *kp);
unsigned char *deriveSecret(EVP_PKEY *privateKey, unsigned char *publicKey, int publicLength, size_t *secret_length);

#endif
