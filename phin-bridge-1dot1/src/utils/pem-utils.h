//
//  pem-utils.h
//  phin-ecdh
//
//  Created by Scott Eklund on 8/21/18.
//  Copyright © 2018 Scott Eklund. All rights reserved.
//

#ifndef pem_utils_h
#define pem_utils_h

#include <stdio.h>
#include <openssl/pem.h>

EVP_PKEY *PEMtoPrivateKey( unsigned char *privateKeyPEM );
int privateKeytoPEM( EVP_PKEY *privateKey, unsigned char **pkPtr, size_t *keyLength );


#endif /* pem_utils_h */
