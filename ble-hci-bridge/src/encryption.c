#include <encryption.h>
#include <openssl/buffer.h>
#include <openssl/evp.h>
#include <openssl/aes.h>
#include <openssl/err.h>
#include <openssl/pem.h>
#include <openssl/ssl.h>
#include <openssl/rsa.h>
#include <openssl/evp.h>
#include <openssl/bio.h>
#include <log.h>
#include <string.h>
#include <stdio.h>
#include <constants.h>
 
#define PADDING RSA_PKCS1_PADDING

static void handleErrors(void) {
    unsigned long errCode;
    Log_Log("An error occurred in the encryption library\n");
    while(errCode = ERR_get_error())
    {
        char *err = ERR_error_string(errCode, NULL);
        Log_Log("%s\n", err);
    }
}

int encryption_encrypt(unsigned char *plaintext, int plaintext_len, unsigned char *key,
  unsigned char *iv, unsigned char *ciphertext) {
  EVP_CIPHER_CTX *ctx;

  int len;

  int ciphertext_len;

  /* Create and initialise the context */
  if(!(ctx = EVP_CIPHER_CTX_new())) handleErrors();

  /* Initialise the encryption operation. IMPORTANT - ensure you use a key
   * and IV size appropriate for your cipher
   * In this example we are using 256 bit AES (i.e. a 256 bit key). The
   * IV size for *most* modes is the same as the block size. For AES this
   * is 128 bits */
  if(1 != EVP_EncryptInit_ex(ctx, EVP_aes_256_cbc(), NULL, key, iv))
    handleErrors();

  /* Provide the message to be encrypted, and obtain the encrypted output.
   * EVP_EncryptUpdate can be called multiple times if necessary
   */
  if(1 != EVP_EncryptUpdate(ctx, ciphertext, &len, plaintext, plaintext_len))
    handleErrors();
  ciphertext_len = len;

  /* Finalise the encryption. Further ciphertext bytes may be written at
   * this stage.
   */
  if(1 != EVP_EncryptFinal_ex(ctx, ciphertext + len, &len)) handleErrors();
  ciphertext_len += len;

  /* Clean up */
  EVP_CIPHER_CTX_free(ctx);

  return ciphertext_len;
}

int encryption_decrypt(unsigned char *ciphertext, int ciphertext_len, unsigned char *key,
  unsigned char *iv, unsigned char *plaintext) {
  EVP_CIPHER_CTX *ctx;

/*printf("=============== 1: KEY\n");
int i;
for (i=0; i < 32; i++) {
	printf("%02x", key[i]);
}
printf("\n");*/

  int len;

  int plaintext_len;

  /* Create and initialise the context */
  if(!(ctx = EVP_CIPHER_CTX_new())) handleErrors();

  /* Initialise the decryption operation. IMPORTANT - ensure you use a key
   * and IV size appropriate for your cipher
   * In this example we are using 256 bit AES (i.e. a 256 bit key). The
   * IV size for *most* modes is the same as the block size. For AES this
   * is 128 bits */
  if(1 != EVP_DecryptInit_ex(ctx, EVP_aes_256_cbc(), NULL, key, iv))
    handleErrors();

  /* Provide the message to be decrypted, and obtain the plaintext output.
   * EVP_DecryptUpdate can be called multiple times if necessary
   */
  if(1 != EVP_DecryptUpdate(ctx, plaintext, &len, ciphertext, ciphertext_len))
    handleErrors();
  plaintext_len = len;

  /* Finalise the decryption. Further plaintext bytes may be written at
   * this stage.
   */
  if(1 != EVP_DecryptFinal_ex(ctx, plaintext + len, &len)) handleErrors();
  plaintext_len += len;

  /* Clean up */
  EVP_CIPHER_CTX_free(ctx);

  return plaintext_len;
}

static RSA *createRSA(unsigned char * key,int isPublic) {
    RSA *rsa= NULL;
    BIO *keybio = BIO_new_mem_buf(key, -1);
    if (keybio==NULL) {
        printf( "Failed to create key BIO");
        return 0;
    }
    
	if(isPublic) {
        rsa = PEM_read_bio_RSA_PUBKEY(keybio, &rsa, NULL, NULL);
    } else {
        rsa = PEM_read_bio_RSAPrivateKey(keybio, &rsa,NULL, NULL);
    }

    if(rsa == NULL) {
        printf( "Failed to create RSA");
    }
 
    return rsa;
}

int encryption_decryptWithPublicKey(unsigned char *ciphertext, int ciphertext_len, unsigned char *pubKey, unsigned char *decrypted) {
    RSA * rsa = createRSA(pubKey,1);

	if (rsa == NULL) {
		return PG_ERROR;
	}

    int  result = RSA_public_decrypt(ciphertext_len, ciphertext, decrypted, rsa, PADDING);
    return result;
}

/*int public_encrypt(unsigned char * data,int data_len,unsigned char * key, unsigned char *encrypted)
{
    RSA * rsa = createRSA(key,1);
    int result = RSA_public_encrypt(data_len,data,encrypted,rsa,padding);
    return result;
}
int private_decrypt(unsigned char * enc_data,int data_len,unsigned char * key, unsigned char *decrypted)
{
    RSA * rsa = createRSA(key,0);
    int  result = RSA_private_decrypt(data_len,enc_data,decrypted,rsa,padding);
    return result;
}
 
 
int private_encrypt(unsigned char * data,int data_len,unsigned char * key, unsigned char *encrypted)
{
    RSA * rsa = createRSA(key,0);
    int result = RSA_private_encrypt(data_len,data,encrypted,rsa,padding);
    return result;
}
*/










