//
//  file-utils.c
//  phin-ecdh
//
//  Created by Scott Eklund on 8/19/18.
//  Copyright © 2018 Scott Eklund. All rights reserved.
//

#include "file-utils.h"
#include <string.h>
#include <sys/stat.h>

int writeHexFile( unsigned char *data, size_t dataLength, char *filename ){
    FILE *fp = fopen( filename, "w" );
    if( fp == NULL ){
        printf("failed to open %s for writing\n", filename );
        return -1;
    }
    
    for( int i=0; i < dataLength; i++){
        fprintf( fp, "%02x", data[i] );
    }
    
    fclose(fp);
    return 0;
}

int readHexFile( unsigned char *data, size_t *dataLength, char *filename ){
    FILE *fp = fopen( filename, "r" );
    if( fp == NULL ){
        printf("failed to open %s for reading\n", filename );
        return -1;
    }
    
    unsigned char secretHex[4096];
    fscanf( fp, "%s", secretHex );
    size_t secretHexLength = strlen( (char*)secretHex );
    
    for( int i=0; i < secretHexLength; i+=2){
        unsigned char charHi = secretHex[i];
        unsigned char charLo = secretHex[i+1];
        int valueHi = charHi >= 'a' ? charHi - 'a' + 10 : charHi - '0';
        int valueLo = charLo >= 'a' ? charLo - 'a' + 10 : charLo - '0';
        int value = valueHi * 16 + valueLo;
        data[i/2] = (unsigned char) value;
    }
    
    *dataLength = secretHexLength / 2;
    return 0;
}


int readPemFile( unsigned char *pem, char *filename ){
    struct stat st;
    if( 0 != stat( filename, &st)){
        printf("failed to stat %s\n", filename );
        return -1;
    }
    
    off_t fileLen = st.st_size;
    FILE *fp = fopen( filename, "r" );
    if( fp == NULL ){
        printf("failed to open %s\n", filename );
        return -1;
    }
    
    size_t length = fread( pem, 1, fileLen, fp);
    if( length != fileLen ){
        printf("failed to read %lld bytes from %s", fileLen, filename );
        return -1;
    }
    
    fclose(fp);
    return 0;
}

int writePemFile( unsigned char *pem, char *filename ){
    unsigned long pemLength = strlen( (char *)pem );
    
    FILE *fp = fopen( filename, "w" );
    if( fp == NULL ){
        printf("failed to open %s for writing\n", filename );
        return -1;
    }
    
    if( pemLength != fwrite( pem, 1, pemLength, fp)){
        printf("failed to write %d bytes to %s\n", (int)pemLength, filename );
        return -1;
    }

    fclose( fp );
    return 0;
}


