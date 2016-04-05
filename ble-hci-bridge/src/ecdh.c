#include <ecdh.h>
#include <openssl/buffer.h>
#include <string.h>
#include <openssl/pem.h>
#include <openssl/sha.h>
#include <openssl/err.h>

#define SHA256_DIGEST_LENGTH 32

static void handleErrors(void) {
    unsigned long errCode;

    printf("An error occurred\n");
    while(errCode = ERR_get_error())
    {
        char *err = ERR_error_string(errCode, NULL);
        printf("%s\n", err);
    }
    abort();
}

EVP_PKEY *pemToKey(char *peerPublicKey, int peerPublicKeyLength) {
	EVP_PKEY *peerkey = NULL;
	BUF_MEM *bptr = BUF_MEM_new();
    BUF_MEM_grow(bptr, peerPublicKeyLength);
    //Create a new BIO method, again, memory
    BIO* bp = BIO_new(BIO_s_mem());
    
    memcpy(bptr->data, peerPublicKey, peerPublicKeyLength);
    
    BIO_set_mem_buf(bp, bptr, BIO_NOCLOSE);
    
    peerkey = PEM_read_bio_PUBKEY(bp, NULL, NULL, NULL);
    
    //Memory cleanup from read/copy operation
    BIO_free(bp);
    BUF_MEM_free(bptr);
	return peerkey;
}

// Returns 0 in case of success and 1 otherwise
int generateKeyPair(KeyPair *kp) {
	EVP_PKEY_CTX *pctx, *kctx;
	EVP_PKEY *params = NULL;
	kp->private = NULL;

	/* Create the context for parameter generation */
	if(NULL == (pctx = EVP_PKEY_CTX_new_id(EVP_PKEY_EC, NULL))) {
		return 1;
	}

	/* Initialise the parameter generation */
	if(1 != EVP_PKEY_paramgen_init(pctx)) {
		return 1;
	}

	/* We're going to use the ANSI X9.62 Prime 256v1 curve */
	if(1 != EVP_PKEY_CTX_set_ec_paramgen_curve_nid(pctx, NID_X9_62_prime256v1/*NID_secp160k1*/)) {
		return 1;
	}

	/* Create the parameter object params */
	if (!EVP_PKEY_paramgen(pctx, &params)) {
		return 1;
	}

	/* Create the context for the key generation */
	if(NULL == (kctx = EVP_PKEY_CTX_new(params, NULL))) {
		return 1;
	}

	/* Generate the key */
	if(1 != EVP_PKEY_keygen_init(kctx)) {
		return 1;
	}

	if (1 != EVP_PKEY_keygen(kctx, &(kp->private))) {
		return 1;
	}

	//Create our method of I/O, in this case, memory IO
    BIO* bp = BIO_new(BIO_s_mem());
    //Create the public key.
    if (1!=  PEM_write_bio_PUBKEY(bp, kp->private)){
        printf("Could not write public key to memory\n");
        return 1;
    }

    BUF_MEM *bptr;
    //Get public key and place it in BUF_MEM struct pointer
    BIO_get_mem_ptr(bp, &bptr);
    
    //BIO_set_close(bp, BIO_NOCLOSE); /* So BIO_free() leaves BUF_MEM alone */
    //We want to clear the memory since we're going to copy the data into our own public key pointer.
    
    kp->public = (unsigned char *) malloc(sizeof (unsigned char) * bptr->length);
	int len = bptr->length;
    memcpy(kp->public, bptr->data, bptr->length);

    //Free our memory writer and buffer
    BIO_free(bp);

	kp->publicLength = len;

	EVP_PKEY_CTX_free(kctx);
	EVP_PKEY_free(params);
	EVP_PKEY_CTX_free(pctx);
	return 0;
}

static int simpleSHA256(void* input, unsigned long length, unsigned char* md) {
    SHA256_CTX context;
    if(!SHA256_Init(&context))
        return -1;

    if(!SHA256_Update(&context, (unsigned char*)input, length))
        return -1;

    if(!SHA256_Final(md, &context))
        return -1;

    return 0;
}

unsigned char *deriveSecret(EVP_PKEY *private, unsigned char *public, int publicLength, size_t *secret_length) {
	EVP_PKEY_CTX *ctx;
	unsigned char *secret;

	/* Create the context for the shared secret derivation */
	if(NULL == (ctx = EVP_PKEY_CTX_new(private, NULL))) {
		return NULL;
	}

	/* Initialise */
	if(1 != EVP_PKEY_derive_init(ctx)) {
		return NULL;
	}

	/* Provide the peer public key */
	if(1 != EVP_PKEY_derive_set_peer(ctx, pemToKey(public, publicLength))) {
		return NULL;
	}

	/* Determine buffer length for shared secret */
	if(1 != EVP_PKEY_derive(ctx, NULL, secret_length)) {
		return NULL;
	}

	/* Create the buffer */
	if(NULL == (secret = OPENSSL_malloc(*secret_length))) {
		return NULL;
	}

	/* Derive the shared secret */
	if(1 != (EVP_PKEY_derive(ctx, secret, secret_length))) {
		return NULL;
	}

	EVP_PKEY_CTX_free(ctx);

	unsigned char *md = (unsigned char *) malloc(sizeof(unsigned char) * SHA256_DIGEST_LENGTH);
	if(simpleSHA256(secret, *secret_length, md)) {
		printf("Error calculating SHA256\n");
		return NULL;
	}

	*secret_length = SHA256_DIGEST_LENGTH;

	return md;
}
