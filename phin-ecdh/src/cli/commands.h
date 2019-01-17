//
//  commands.h
//  phin-ecdh
//
//  Created by Scott Eklund on 1/16/19.
//  Copyright © 2019 Scott Eklund. All rights reserved.
//

#ifndef commands_h
#define commands_h

void command_generate( const char *publicKeyPath, const char *privateKeyPath );
void command_derive( const char *publicKeyPath, const char *privateKeyPath, const char *peerPublicKeyPath, const char *secretFilePath );
void command_encrypt( const char *secretFilePath, const char *hexInputFilePath, const char *hexOutputFilePath );
void command_decrypt( const char *secretFilePath, const char *hexInputFilePath, const char *hexOutputFilePath );

#endif /* commands_h */
