//
//  file-utils.h
//  phin-ecdh
//
//  Created by Scott Eklund on 8/19/18.
//  Copyright © 2018 Scott Eklund. All rights reserved.
//

#ifndef file_utils_h
#define file_utils_h

#include <stdio.h>

int writeHexFile( unsigned char *data, size_t dataLength, const char *filename );
int readHexFile( unsigned char *data, size_t *dataLength, const char *filename );

int readPemFile( unsigned char *pem, const char *filename );
int writePemFile( unsigned char *pem, const char *filename );

#endif /* file_utils_h */
