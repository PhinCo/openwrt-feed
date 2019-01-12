//
//  main.c
//  phin-ecdh
//
//  Created by Scott Eklund on 8/15/18.
//  Copyright © 2018 Scott Eklund. All rights reserved.
//

#include <stdio.h>
#include <string.h>
#include "ecdh.h"
#include "encryption.h"
#include "file-utils.h"
#include "pem-utils.h"

void help(void){
    printf("phin-ecdh <command> <input>\n");
    printf("commands are:\n");
    printf("  gen       generate key pair in folder into files 'public.pem', 'private.pem'\n");
    printf("  derive    derive secret using 'public.pem', 'private.pem', 'peerPublic.pem' into 'secret.hex'\n");
    printf("  encrypt   encrypt the text using 'secret.hex', from 'plaintextin.hex' into 'ciphertext.hex'\n");
    printf("  decrypt   decrypt the data using 'secret.hex' from 'ciphertext.hex' to 'plaintextout.hex'\n");
    printf("\n");
    printf("phin-ecdh uses files in the current working directory\n");
}


void command_generate( void ){
    KeyPair keyPair;
    generateKeyPair(&keyPair);
    
    unsigned char *privateKeyString = NULL;
    size_t privateKeyStringLength = 0;
    
    if( 0 != privateKeytoPEM( keyPair.privateKey, &privateKeyString, &privateKeyStringLength )){
        printf("Could not write private key\n");
        return;
    }
    
    if( 0 != writePemFile( privateKeyString, "private.pem" )){
        printf("failed to write private key\n");
        return;
    }
    if( 0 != writePemFile( keyPair.publicKey, "public.pem" )){
        printf("failed to write public key\n");
        return;
    }
}

void command_derive( void ){
    
    unsigned char privateKeyString[4096];
    unsigned char publicKeyString[4096];
    unsigned char peerPublicKeyString[4096];

    readPemFile( privateKeyString, "private.pem" );
    readPemFile( publicKeyString, "public.pem" );
    readPemFile( peerPublicKeyString, "peerPublic.pem" );

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
    
    writeHexFile( secret, secretLength, "secret.hex" );
}

void command_encrypt(){
    unsigned char secret[4096];
    size_t secretLength = 0;
    if( 0 != readHexFile( secret, &secretLength, "secret.hex" )){
        printf("failed to read shared secret\n");
        return;
    }
    
    unsigned char plaintext[4096];
    size_t plaintextLength = 0;
    if( 0 != readHexFile( plaintext, &plaintextLength, "plaintextin.hex" )){
        printf("failed to read plaintext\n");
        return;
    }

    unsigned char ciphertext[4096];
    int ciphertextLength = encryption_encrypt( plaintext, (int)plaintextLength, secret, NULL, ciphertext );

    writeHexFile( ciphertext, ciphertextLength, "ciphertext.hex" );
}

void command_decrypt(){
    unsigned char secret[4096];
    size_t secretLength = 0;
    if( 0 != readHexFile( secret, &secretLength, "secret.hex" )){
        printf("failed to read shared secret\n");
        return;
    }
    
    unsigned char ciphertext[4096];
    int ciphertextLength = 0;
    if( 0 != readHexFile( ciphertext, (size_t*) &ciphertextLength, "ciphertext.hex" )){
        printf("failed to read ciphertext\n");
        return;
    }
    
    unsigned char plaintext[4096];
    int plaintextLength = encryption_decrypt( ciphertext, ciphertextLength, secret, NULL, plaintext );
    
    if( 0 != writeHexFile( plaintext, plaintextLength, "plaintextout.hex" )){
        printf("failed to write plaintext\n");
        return;
    }
    
    plaintext[plaintextLength] = '\0';
    printf("%s\n", plaintext );
}

void command_test( void ){
    unsigned char firstPEM[4096];
    readPemFile( firstPEM, "private.pem" );
  
    EVP_PKEY *key = PEMtoPrivateKey( firstPEM );
    
    unsigned char *secondPEM = NULL;
    size_t secondPEMLength = 0;
    privateKeytoPEM( key, &secondPEM, &secondPEMLength);
    
    writePemFile( secondPEM, "second.pem");
    
    unsigned char secret[4096];
    size_t secretLength = 0;
    
    readHexFile( secret, &secretLength, "secret.hex" );
    writeHexFile( secret, secretLength, "secret2.hex" );
}

int main(int argc, const char * argv[]) {
    
    if( argc < 2 ){
        help();
        return -1;
    }
    
    const char *command = argv[1];
    printf("Executing command: %s\n", command );
    
    if( strcmp( command, "gen" ) == 0){
        command_generate();
    }else if( strcmp( command, "derive" ) == 0 ){
        command_derive();
    }else if( strcmp( command, "test" ) == 0 ){
        command_test();
    }else if ( strcmp( command, "encrypt" ) == 0 ){
        command_encrypt( (unsigned char *) argv[2], (int) strlen( argv[2] ) );
    }else if ( strcmp( command, "decrypt" ) == 0 ){
        command_decrypt();
    }
    
    return 0;
}

