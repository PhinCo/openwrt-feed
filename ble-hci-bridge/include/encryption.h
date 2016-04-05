#ifndef __ENCRYPTION_H__
#define __ENCRYPTION_H__

/*
 * This module provides support for encryption / decryption using AES CBC 256
 */

int encryption_encrypt(unsigned char *plaintext, int plaintext_len, unsigned char *key, unsigned char *iv, unsigned char *ciphertext);
int encryption_decrypt(unsigned char *ciphertext, int ciphertext_len, unsigned char *key, unsigned char *iv, unsigned char *plaintext);
int encryption_decryptWithPublicKey(unsigned char *ciphertext, int ciphertext_len, unsigned char *pubKey, unsigned char *decrypted);

#endif
