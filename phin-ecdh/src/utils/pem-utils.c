//
//  pem-utils.c
//  phin-ecdh
//
//  Created by Scott Eklund on 8/21/18.
//  Copyright © 2018 Scott Eklund. All rights reserved.
//

#include "pem-utils.h"
#include <openssl/buffer.h>
#include <string.h>

EVP_PKEY *PEMtoPrivateKey( unsigned char *privateKeyPEM ){
    int privateKeyPEMLen = (int)strlen( (char*)privateKeyPEM );
    
    BIO *bio = BIO_new(BIO_s_mem());
    BIO_write(bio, privateKeyPEM, privateKeyPEMLen);
    EVP_PKEY *privateKeyPtr = PEM_read_bio_PrivateKey(bio, NULL, NULL, NULL);
    BIO_free_all(bio);
    
    return privateKeyPtr;
}

int privateKeytoPEM( EVP_PKEY *privateKey, unsigned char **pkPtr, size_t *keyLength ){
    
    // Write private key into our keypair struct
    BIO* bp_private = BIO_new(BIO_s_mem());
    if (1 != PEM_write_bio_PrivateKey(bp_private, privateKey, NULL, NULL, 0, NULL, NULL)){
        printf("Could not write private key to memory\n");
        return 1;
    }
    
    BUF_MEM *bptr;
    
    BIO_get_mem_ptr(bp_private, &bptr);
    *pkPtr = (unsigned char *) malloc(sizeof (unsigned char) * bptr->length);
    *keyLength = bptr->length;
    memcpy(*pkPtr, bptr->data, bptr->length);
    BIO_set_close(bp_private, BIO_NOCLOSE);

    BIO_free(bp_private);
    
    return 0;
}
