//
//  commands.c
//  phin-ecdh
//
//  Created by Scott Eklund on 1/16/19.
//  Copyright © 2019 Scott Eklund. All rights reserved.
//

#include "commands.h"
#include "ecdh.h"
#include "encryption.h"
#include "file-utils.h"
#include "pem-utils.h"
#include <string.h>

void command_generate( const char *publicKeyPath, const char *privateKeyPath ){
    KeyPair keyPair;
    generateKeyPair(&keyPair);
    
    unsigned char *privateKeyString = NULL;
    size_t privateKeyStringLength = 0;
    
    if( 0 != privateKeytoPEM( keyPair.privateKey, &privateKeyString, &privateKeyStringLength )){
        printf("Could not write private key\n");
        return;
    }
    
    if( 0 != writePemFile( privateKeyString, privateKeyPath )){
        printf("failed to write private key\n");
        return;
    }
    if( 0 != writePemFile( keyPair.publicKey, publicKeyPath )){
        printf("failed to write public key\n");
        return;
    }
}

void command_derive( const char *publicKeyPath, const char *privateKeyPath, const char *peerPublicKeyPath, const char *secretFilePath ){
    
    unsigned char privateKeyString[4096];
    unsigned char publicKeyString[4096];
    unsigned char peerPublicKeyString[4096];
    
    readPemFile( privateKeyString, privateKeyPath );
    readPemFile( publicKeyString, publicKeyPath );
    readPemFile( peerPublicKeyString, peerPublicKeyPath );
    
    EVP_PKEY *privateKey = PEMtoPrivateKey( privateKeyString);
    unsigned long publicKeyStringLength = strlen( (char *) publicKeyString );
    
    KeyPair keyPair;
    keyPair.publicKey = publicKeyString;
    keyPair.publicLength = (int) publicKeyStringLength;
    keyPair.privateKey = privateKey;
    
    unsigned char *secret = NULL;
    size_t secretLength = 0;
    
    secret = deriveSecret( keyPair.privateKey, peerPublicKeyString, (int)strlen((char*)peerPublicKeyString), &secretLength );
    if( secret == NULL ){
        printf("failed to derive secret\n" );
        return;
    }
    
    writeHexFile( secret, secretLength, secretFilePath );
}

void command_encrypt( const char *secretFilePath, const char *hexInputFilePath, const char *hexOutputFilePath ){
    unsigned char secret[4096];
    size_t secretLength = 0;
    if( 0 != readHexFile( secret, &secretLength, secretFilePath )){
        printf("failed to read shared secret\n");
        return;
    }
    
    unsigned char plaintext[4096];
    size_t plaintextLength = 0;
    if( 0 != readHexFile( plaintext, &plaintextLength, hexInputFilePath )){
        printf("failed to read plaintext\n");
        return;
    }
    
    unsigned char ciphertext[4096];
    int ciphertextLength = encryption_encrypt( plaintext, (int)plaintextLength, secret, NULL, ciphertext );
    
    writeHexFile( ciphertext, ciphertextLength, hexOutputFilePath );
}

void command_decrypt( const char *secretFilePath, const char *hexInputFilePath, const char *hexOutputFilePath ){
    unsigned char secret[4096];
    size_t secretLength = 0;
    if( 0 != readHexFile( secret, &secretLength, secretFilePath )){
        printf("failed to read shared secret\n");
        return;
    }
    
    unsigned char ciphertext[4096];
    int ciphertextLength = 0;
    if( 0 != readHexFile( ciphertext, (size_t*) &ciphertextLength, hexInputFilePath )){
        printf("failed to read ciphertext\n");
        return;
    }
    
    unsigned char plaintext[4096];
    int plaintextLength = encryption_decrypt( ciphertext, ciphertextLength, secret, NULL, plaintext );
    
    if( 0 != writeHexFile( plaintext, plaintextLength, hexOutputFilePath )){
        printf("failed to write plaintext\n");
        return;
    }
    
    plaintext[plaintextLength] = '\0';
}
